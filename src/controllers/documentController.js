const { Document, Institution, Comment } = require('../config/db');
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const privateKey = require('../config/private_key');
const transporter = require('../services/mailer');

function normalizeString(str) {
    return str.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_]/g, '_');
}

exports.createDocument = async (req, res) => {
    if (!req.file || !req.file.originalname.endsWith('.pdf')) {
        return res.status(400).json({ error: "Le fichier doit être un document PDF." });
    }

    try {
        const institution = await Institution.findByPk(req.body.id);

        console.log(institution);

        if (!institution) {
            return res.status(404).json({ error: "Institution non trouvée." });
        }

        const institutionName = normalizeString(institution.nomext);
        const fiscalYear = req.body.fiscal_year || 'unknown';
        const originalFileName = path.parse(req.file.originalname).nomext;
        const dateSubmission = new Date().toISOString().split('T')[0];

        const newFileName = `${institutionName}-${originalFileName}-${dateSubmission}.pdf`;

        const uploadsDir = path.join(__dirname, '../uploads');

        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const fiscalYearDir = path.join(uploadsDir, fiscalYear);
        const newPath = path.join(fiscalYearDir, newFileName);

        fs.mkdirSync(fiscalYearDir, { recursive: true });

        const existingDocument = await Document.findOne({
            where: {
                institutionId: req.body.institutionId,
                fiscal_year: fiscalYear,
                filename: newFileName
            }
        });

        if (existingDocument) {
            const existingFilePath = existingDocument.filepath;

            if (fs.existsSync(existingFilePath)) {
                fs.unlinkSync(existingFilePath);
            }

            await Document.destroy({ where: { documentId: existingDocument.documentId } });
        }

        fs.renameSync(req.file.path, newPath);

        const documentData = {
            institutionId: req.body.institutionId,
            filename: newFileName,
            filepath: newPath,
            fiscal_year: req.body.fiscal_year,
            status: req.body.status || 3
        };

        const document = await Document.create(documentData);

        const mailOptions = {
            from: 'udaihaiti@gmail.com',
            to: 'stp@cnmp.gouv.ht',
            subject: 'Nouveau plan soumis',
            text: `${institution.name} a soumis avec succès son plan pour l'année fiscale ${fiscalYear}.`,
            attachments: [
                {
                    filename: newFileName,
                    path: newPath
                }
            ]
        };

        // Envoyer l'email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Erreur lors de l\'envoi de l\'email:', error);
            } else {
                console.log('Email envoyé: ' + info.response);
            }
        });

        return res.status(200).json({ message: "Document créé avec succès.", document });
    } catch (error) {     
        return res.status(500).json({ error: "Erreur lors de la création du document.", data: error });
    }
};

exports.getAllDocuments = async (req, res) => {
    try {
        const documents = await Document.findAll({
            include: {
                model: Comment,
            },
            include: {
                model: Institution,
            },
        });
        res.status(200).json(documents);
    } catch (error) {
        console.error("Erreur lors de la récupération des documents :", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des documents" });
    }
};

exports.getDocumentsWithComments = async (req, res) => {
    try {
        const documents = await Document.findAll({
            include: {
                model: Comment,
            }
        });

        res.json(documents);
    } catch (error) {
        console.error('Erreur lors de la récupération des documents:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.getDocumentsByInstitutions = async (req, res) => {
    try {
        // Vérifier que l'autorisation existe
        if (!req.headers.authorization) {
            return res.status(401).json({ error: 'Authorization header is missing' });
        }

        // Récupérer et décoder le token
        const token = req.headers.authorization.split(' ')[1]; // assuming Bearer token
        const secretKey = process.env.JWT_SECRET || privateKey; // Utiliser la clé secrète JWT correcte

        const payload = jwt.verify(token, secretKey);
        const institutionId = payload.institutionId;

        const { fiscalYear, status, date } = req.query;

        const whereClause = { institutionId }; // Utiliser l'institutionId du token
        if (fiscalYear) {
            whereClause.fiscal_year = fiscalYear;
        }
        if (status) {
            whereClause.status = status;
        }
        if (date) {
            whereClause.created = {
                [Op.gte]: new Date(date),
                [Op.lt]: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
            };
        }

        // Requête pour récupérer les documents avec le nombre de commentaires
        const documents = await Document.findAll({
            where: whereClause,
            include: [
                {
                    model: Institution
                },
                {
                    model: Comment, // Inclure le modèle Comment pour le comptage
                    attributes: [] // On ne récupère pas d'autres attributs des commentaires
                }
            ],
            attributes: {
                include: [
                    [sequelize.fn('COUNT', sequelize.col('commentId')), 'commentsCount'] // Compter le nombre de commentaires
                ]
            },
            group: ['documentId'], // Groupement par document pour le comptage
        });

        // Vérifier si des documents ont été trouvés
        if (documents.length === 0) {
            return res.status(404).json({ error: "Aucun document trouvé." });
        }

        return res.status(200).json(documents);
    } catch (error) {
        console.error('Erreur lors de la récupération des documents:', error);
        return res.status(500).json({ error: "Erreur lors de la récupération des documents.", data: error.message });
    }
};

exports.getDocumentById = async (req, res) => {
    const { id } = req.params;
    try {
        const document = await Document.findByPk(id);
        if (!document) {
            return res.status(404).json({ error: "Document non trouvé." });
        }
        return res.status(200).json(document);
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la récupération du document.", data: error.message });
    }
};

exports.updateDocument = async (req, res) => {
    const documentId = req.params.id;

    try {
        const existingDocument = await Document.findByPk(documentId);
        if (!existingDocument) {
            return res.status(404).json({ error: "Document non trouvé." });
        }

        // Récupération de l'institution
        const institution = await Institution.findByPk(existingDocument.institutionId);
        const email = institution.email; // Récupérer l'email de l'institution

        // Stocker l'ancien statut et l'ancien fichier
        const oldStatus = existingDocument.status;
        const oldFilePath = existingDocument.filepath;

        // Mise à jour du statut si fourni
        if (req.body.status !== undefined) {
            const status = parseInt(req.body.status, 10);
            if (isNaN(status)) {
                return res.status(400).json({ error: "Le statut doit être un entier." });
            }
            existingDocument.status = status;
        }

        // Gestion du fichier si un nouveau fichier est uploadé
        let fileChanged = false;
        if (req.file) {
            if (!req.file.originalname.endsWith('.pdf')) {
                return res.status(400).json({ error: "Le fichier doit être un document PDF." });
            }

            // Suppression du fichier existant s'il y en a un
            if (oldFilePath && fs.existsSync(oldFilePath)) {
                await fs.promises.unlink(oldFilePath);
            }

            // Construction du nouveau nom et chemin du fichier
            const institutionName = normalizeString(institution.name);
            const fiscalYear = existingDocument.fiscal_year;
            const originalFileName = path.parse(req.file.originalname).name;
            const dateSubmission = new Date().toISOString().split('T')[0];
            const newFileName = `${institutionName}-${originalFileName}-${dateSubmission}.pdf`;

            const fiscalYearDir = path.join('./src/uploads/', fiscalYear);
            const newFilePath = path.join(fiscalYearDir, newFileName);

            // Création du dossier s'il n'existe pas
            await fs.promises.mkdir(fiscalYearDir, { recursive: true });

            // Déplacement du fichier téléchargé vers le nouvel emplacement
            await fs.promises.rename(req.file.path, newFilePath);

            // Mise à jour du document avec le nouveau fichier
            existingDocument.filename = newFileName;
            existingDocument.filepath = newFilePath;

            fileChanged = true; // Indiquer que le fichier a été changé
        }

        // Sauvegarde des modifications
        await existingDocument.save();

        // Vérification si un email doit être envoyé pour le statut
        if (oldStatus !== existingDocument.status) {
            // Envoi d'un email à l'institution pour le changement de statut
            const statusMessages = {
                3: "soumis",
                2: "en cours de traitement",
                1: "accepté",
                0: "rejeté"
            };

            const newStatusMessage = statusMessages[existingDocument.status] || "inconnu";

            const statusMailOptions = {
                from: 'udaihaiti@gmail.com',
                to: email,
                subject: 'Changement d\'état de votre document',
                text: `Bonjour,\n\nL\'état de votre document a été modifié. Il est désormais "${newStatusMessage}".\n\nCordialement,\nLe Sécrétariat Technique de la Commission Nationale des Marchés Publics`
            };

            // Envoi de l'email
            await transporter.sendMail(statusMailOptions);
        }

        // Vérification si un email doit être envoyé pour le changement de document
        if (fileChanged) {
            // Envoi d'un email à l'institution pour le changement de document
            const documentMailOptions = {
                from: 'udaihaiti@gmail.com',
                to: email,
                subject: 'Changement de votre document',
                text: `Bonjour,\n\nVotre document a subi une modification.\n` +
                    `\nCordialement,\nLe Sécrétariat Technique de la Commission Nationale des Marchés Publics`,
                attachments: [
                    {
                        filename: existingDocument.filename, 
                        path: existingDocument.filepath
                    }
                ]
            };

            // Envoi de l'email
            await transporter.sendMail(documentMailOptions);
        }

        return res.status(200).json({ message: "Document mis à jour avec succès.", document: existingDocument });
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la mise à jour du document.", data: error.message });
    }
};

exports.deleteDocument = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await Document.destroy({
            where: { documentId: id }
        });
        if (!deleted) {
            return res.status(404).json({ error: "Document non trouvé." });
        }
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la suppression du document.", data: error.message });
    }
};

exports.getDocumentCountByInstitution = async (req, res) => {
    try {
        const institutions = await Institution.findAll();

        const documentCounts = await Promise.all(institutions.map(async (institution) => {
            const count = await Document.count({
                where: { institutionId: institution.institutionId }
            });
            return {
                institutionId: institution.institutionId,
                institutionName: institution.name,
                documentCount: count
            };
        }));

        const totalInstitutions = institutions.length;
        const totalDocuments = documentCounts.reduce((acc, curr) => acc + curr.documentCount, 0);

        return res.status(200).json({
            totalInstitutions,
            totalDocuments,
            documentCounts
        });
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la récupération du nombre de documents par institution.", data: error.message });
    }
};

exports.filtreDocument = async (req, res) => {
    const { institutionId, fiscal_year, status, created } = req.query;

    try {
        const where = {};

        // Ajout des critères de filtrage
        if (institutionId) {
            where.institutionId = institutionId;
        }
        if (fiscal_year) {
            where.fiscal_year = fiscal_year;
        }
        if (status) {
            where.status = status;
        }
        if (created) {
            where.created = {
                [Op.gte]: new Date(created), // Récupérer les documents créés après cette date
            };
        }

        // Récupérer tous les documents si aucun filtre n'est appliqué
        const documents = await Document.findAll({
            where: Object.keys(where).length ? where : undefined, // Applique les filtres si présents
        });

        return res.json(documents);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

exports.downloadFile = async (req, res) => {
    const filename = req.params.filename;

    try {
        // Rechercher le document en fonction du nom du fichier (ou autre identifiant)
        const document = await Document.findOne({
            where: { filename }
        });

        if (!document) {
            return res.status(404).json({ message: 'Document non trouvé.' });
        }

        // Extraire l'année fiscale depuis le document
        const fiscalYear = document.fiscal_year;

        // Générer le chemin d'accès en fonction de l'année fiscale
        const filePath = path.join(__dirname, `../uploads/${fiscalYear}`, filename);

        // Télécharger le fichier
        res.download(filePath, (err) => {
            if (err) {
                console.error('Erreur lors du téléchargement du fichier:', err);
                res.status(404).json({ message: 'Fichier non trouvé.' });
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du fichier:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};