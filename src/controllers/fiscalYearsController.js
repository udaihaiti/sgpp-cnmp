const {FiscalYear} = require('../config/db');

exports.createFiscalYears = async (req, res) => {
    const { fiscalYear } = req.body; // Assurez-vous que l'année fiscale est dans le corps de la requête

    try {
        // Vérifiez si l'année fiscale existe déjà
        const existingFiscalYear = await FiscalYear.findOne({ where: { fiscalYear } });
        if (existingFiscalYear) {
            return res.status(400).json({ error: 'L\'année fiscale existe déjà.' });
        }

        // Créez la nouvelle année fiscale
        const fiscalYears = await FiscalYear.create(req.body);
        return res.status(200).json({ message: 'Année fiscale créée avec succès.', fiscalYears });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};


// READ ALL
exports.getAllFiscalYears = async (req, res) => {
    try {
        const fiscalYears = await FiscalYear.findAll();
        return res.status(200).json({ message: 'Liste des années fiscales récupérée avec succès.', fiscalYears });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// READ ONE
exports.getFiscalYearsById = async (req, res) => {
    try {
        const fiscalYears = await FiscalYear.findByPk(req.params.id);
        if (!fiscalYears) {
            return res.status(404).json({ message: 'Année fiscal non trouvé.' });
        }
        return res.status(200).json({ message: 'Année fiscal récupéré avec succès.', fiscalYears });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// UPDATE
exports.updateFiscalYears = async (req, res) => {
    try {
        // Trouver l'année fiscale par ID
        const fiscalYear = await FiscalYear.findByPk(req.params.id);
        if (!fiscalYear) {
            return res.status(404).json({ message: 'Année fiscale non trouvée.' });
        }

        // Mettre à jour l'année fiscale
        const updatedFiscalYear = await FiscalYear.update(req.body, {
            where: { fiscalYearId: req.params.id }
        });

        // Vérifiez si la mise à jour a réussi
        if (updatedFiscalYear[0] === 0) {
            return res.status(400).json({ message: 'Aucune modification effectuée.' });
        }

        return res.status(200).json({ message: 'Année fiscale mise à jour avec succès.' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};


// DELETE
exports.deleteFiscalYears = async (req, res) => {
    try {
        const fiscalYear = await FiscalYear.findByPk(req.params.id);
        if (!fiscalYear) {
            return res.status(404).json({ message: 'Année fiscale non trouvée.' });
        }

        // Utiliser le bon champ pour la suppression
        await FiscalYear.destroy({
            where: { fiscalYearId: fiscalYear.fiscalYearId }
        });

        return res.status(200).json({ message: 'Année fiscale supprimée avec succès.' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


