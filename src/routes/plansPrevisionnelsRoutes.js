const express = require('express');
const router = express.Router();
const plansController = require('../controllers/plansPrevisionnelsController');

router.get('/', plansController.getAll);

router.post('/', plansController.addOrUpdate);

module.exports = router;
