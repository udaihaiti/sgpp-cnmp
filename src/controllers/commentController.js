const {Document, Institution, Comment} = require('../config/db');
const sequelize = require('sequelize');

// CREATE
exports.createComment = async (req, res) => {
    try {
        // Vérifie si le document et l'institution existent
        const document = await Document.findByPk(req.body.documentId);
        const institution = await Institution.findByPk(req.body.institutionId);

        if (!document) {
            return res.status(404).json({ message: "Document non trouvé." });
        }
        if (!institution) {
            return res.status(404).json({ message: "Institution non trouvée." });
        }

        // Vérifie si le champ commentaire est vide
        if (!req.body.comment || req.body.comment.trim() === "") {
            return res.status(400).json({ message: "Le commentaire ne peut pas être vide." });
        }

        // Création du commentaire
        const comment = await Comment.create(req.body);
        return res.status(200).json({ message: 'Commentaire créé avec succès.', comment });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};



// READ ALL
exports.getAllComments = async (req, res) => {
    try {
        const comments = await Comment.findAll({
            include: [
                {
                    model: Institution,
                },
                {
                    model: Document,
                }
            ]
        });
        return res.status(200).json({ message: 'Liste des commentaires récupérée avec succès.', comments });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// UPDATE
exports.updateComment = async (req, res) => {
    try {
        const comment = await Comment.findByPk(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Commentaire non trouvé.' });
        }
        const updatedCommentaire = await comment.update(req.body);
        return res.status(200).json({ message: 'Commentaire mis à jour avec succès.', updatedCommentaire });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

// DELETE
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findByPk(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Commentaire non trouvé.' });
        }
        await Comment.destroy({
            where: { commentId: comment.commentId }
        });
        return res.status(200).json({ message: 'Commentaire supprimé avec succès.' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


exports.commentByDocumentsId = async (req, res) => {
    const { documentId } = req.params;
    try {
        const comments = await Comment.findAll({
            where: {
                documentId: documentId
            },
            order: [['created', 'DESC']]
        });
        res.json(comments);
    } catch (error) {
        console.error('Erreur lors de la récupération des commentaires:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// READ ONE
exports.getCommentById = async (req, res) => {
    try {
        const comment = await Comment.findByPk(req.params.id,{
                include: [
                    {
                        model: Document
                    },
                    {
                        model: Institution
                    },
                ]
        });
        if (!comment) {
            return res.status(404).json({ message: 'Comment non trouvé.' });
        }
        return res.status(200).json({ message: 'Comment récupéré avec succès.', comment });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.getCommentsCountByDocument = async (req, res) => {
    try {
        // Récupérer tous les documents avec le nombre de commentaires
        const documentsWithCommentsCount = await Document.findAll({
            attributes: {
                include: [
                    [sequelize.fn('COUNT', sequelize.col('Comments.commentId')), 'commentsCount'],
                ],
            },
            include: [
                {
                    model: Comment,
                    attributes: [],
                },
            ],
            group: ['Document.documentId'],
        });

        if (!documentsWithCommentsCount || documentsWithCommentsCount.length === 0) {
            return res.status(404).json({ message: 'Aucun document trouvé.' });
        }

        return res.status(200).json({ message: 'Documents récupérés avec succès.', documents: documentsWithCommentsCount });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};