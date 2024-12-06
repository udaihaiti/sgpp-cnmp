const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institutionController');

// create a institution
router.post('/', institutionController.createInstitution);

//get all institutions
router.get('/', institutionController.getAllInstitutions);

//update institution
router.put('/:id', institutionController.updateInstitution);

//delete institution
router.delete('/:id', institutionController.deleteInstitution);

//get number of institution
router.get('/get_number_of_institution',institutionController.getNumberOfInstitutions);

//reset
router.put('/reset-password/:id', institutionController.resetPassword);

//get institution by id
router.get('/:id', institutionController.getInstitutionById);

module.exports = router;
