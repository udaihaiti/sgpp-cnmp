const { Institution, Document, Comment } = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const privateKey = require('../config/private_key');

exports.login = async (req, res) => {
    const { acronym, password } = req.body;

    if (!acronym || !password) {
        return res.status(400).json({ error: "Sigle d'institution et mot de passe sont requis." });
    }

    try {
        const institution = await Institution.findOne({
            where: { acronym },
            include: [
                {
                    model: Document,
                },
                {
                    model: Comment,
                }
            ]
        });

        if (!institution) {
            return res.status(401).json({ error: "Identifiants invalides." });
        }

        // Vérifier le mot de passe hashé
        const isPasswordValid = await bcrypt.compare(password, institution.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Mot de passe incorrect." });
        }

        // Générer le token avec le statut
        const token = jwt.sign(
            {
                institutionId: institution.id,
                acronym: institution.acronym,
                status: institution.status,
                name: institution.nomext
            },
            privateKey,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            message: "Connexion réussie.",
            token,
            institutionName: institution.nomext,
            passwordMustBeChange: institution.passwordMustBeChange,
            institutionId: institution.institutionId
        });
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la connexion.", data: error.message });
    }
};
