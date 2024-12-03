const express = require('express');
const router = express.Router();
const fiscalYearsController = require('../controllers/fiscalYearsController');

// create a fiscal years
router.post('/', fiscalYearsController.createFiscalYears);
router.get('/', fiscalYearsController.getAllFiscalYears);
router.get('/:id', fiscalYearsController.getFiscalYearsById);
router.put('/:id', fiscalYearsController.updateFiscalYears);
router.delete('/:id', fiscalYearsController.deleteFiscalYears);


module.exports = router;

