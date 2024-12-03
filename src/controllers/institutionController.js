const { Institution } = require('../config/db');
const bcrypt = require('bcrypt');

// Fonction utilitaire pour exclure les mots de passe
function filterInstitutionData(institutions) {
    return institutions.map(institution => {
        // Si `institution` est un objet Sequelize, utiliser `toJSON()`
        const institutionData = institution.toJSON ? institution.toJSON() : institution;
        const { password, ...institutionWithoutPassword } = institutionData; // Exclure le mot de passe
        return institutionWithoutPassword;
    });
}

exports.createInstitution = async (req, res) => {
    try {
        // Définir le mot de passe par défaut
        const defaultPassword = 'Pass@123';

        // Hash du mot de passe par défaut
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

        // Ajout de la valeur par défaut pour passwordMustBeChange
        const institutionData = {
            ...req.body,
            password: hashedPassword, // Utiliser le mot de passe hashé
            passwordMustBeChange: 1 // Définit passwordMustBeChange à 1 par défaut
        };

        const institution = await Institution.create(institutionData);
        return res.status(200).json({ message: 'Institution créée avec succès.', institution: filterInstitutionData([institution])[0] });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

// READ ALL
exports.getAllInstitutions = async (req, res) => {
    try {
        const institutions = await Institution.findAll();
        const institution = institutions; // Exclure les mots de passe
        return res.status(200).json({ message: 'Liste des institutions récupérée avec succès.', institutions: institution });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// READ ONE
exports.getInstitutionById = async (req, res) => {
    try {
        const institution = await Institution.findByPk(req.params.id);
        if (!institution) {
            return res.status(404).json({ message: 'Institution non trouvé.' });
        }
        return res.status(200).json({ message: 'Institution récupéré avec succès.', institution: filterInstitutionData([institution])[0] });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


exports.updateInstitution = async (req, res) => {
    try {
        const institution = await Institution.findByPk(req.params.id);
        if (!institution) {
            return res.status(404).json({ message: 'Institution non trouvée.' });
        }

        if (req.body.password) {

            // Hash the new password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

            // Update the institution's password with the hashed password
            req.body.password = hashedPassword;
        }

        // Mettre à jour les autres champs, y compris le mot de passe s'il a été modifié
        const updatedInstitution = await institution.update(req.body);

        // Retourner la réponse en cachant le mot de passe
        return res.status(200).json({
            message: 'Institution mise à jour avec succès.',
            updatedInstitution: filterInstitutionData([updatedInstitution])[0]
        });
    } catch (error) {
        // Log the error to understand what went wrong
        console.error('Error updating institution:', error);
        return res.status(400).json({ error: error.message });
    }
};


// DELETE
exports.deleteInstitution = async (req, res) => {
    try {
        const institution = await Institution.findByPk(req.params.id);
        if (!institution) {
            return res.status(404).json({ message: 'Institution non trouvé.' });
        }
        await Institution.destroy({
            where: { institutionId: institution.institutionId }
        });
        return res.status(200).json({ message: 'Institution supprimée avec succès.' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// TOTAL NUMBER OF INSTITUTIONS
exports.getNumberOfInstitutions = async (req, res) => {
    try {
        // Compte les institutions où le statut est égal à 2
        const count = await Institution.count({
            where: {
                status: 2 // Filtre pour ne compter que les institutions avec un statut de 2
            }
        });
        return res.status(200).json({ message: `Il y a ${count} institutions au total.`, data: count });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


exports.resetPassword = async (req, res) => {
    const { institutionId } = req.params;

    try {
        // Définir le nouveau mot de passe par défaut sans le crypter
        const newPassword = 'Pass@123';

        // Mettre à jour l'institution avec le nouveau mot de passe et changer passwordMustBeChange à 1
        const [updatedRows] = await Institution.update(
            { password: newPassword, passwordMustBeChange: 1 },
            { where: { institutionId } }
        );

        // Vérifier si l'institution a été mise à jour
        if (updatedRows === 0) {
            return res.status(404).json({ error: 'Institution non trouvée' });
        }

        return res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
    } catch (error) {
        return res.status(500).json({ error: 'Une erreur est survenue lors de la réinitialisation du mot de passe' });
    }
};

