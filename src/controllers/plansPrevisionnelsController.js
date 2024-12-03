const path = require('path');
const {PlansPrevisionnels} = require('../config/db'); 

module.exports = {
    // Récupérer tous les documents
    async getAll(req, res) {
        try {
            const plans = await PlansPrevisionnels.findAll();
            res.status(200).json(plans);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de la récupération des documents.' });
        }
    },

    async addOrUpdate(req, res) {
        const { numeroPlan, anneefiscale, datecreation, datepublication, idetat, idac, show, filePath } = req.body;


        if (!filePath) {
            return res.status(400).json({ message: 'Le chemin du fichier est requis.' });
        }
        
        try {
            const existingPlan = await PlansPrevisionnels.findOne({
                where: { numeroPlan, anneefiscale }
            });

            if (existingPlan) {
                await existingPlan.destroy();
            }

            const newPlan = await PlansPrevisionnels.create({
                numeroPlan,
                anneefiscale,
                datecreation,
                datepublication,
                idetat,
                idac,
                file_name: path.join('../uploads', filePath),
                show
            });

            res.status(201).json(newPlan);
        } catch (error) {

            console.error(error);
            res.status(500).json({ message: 'Erreur lors de l\'ajout ou de la mise à jour du document.' });
        }
    }
};
