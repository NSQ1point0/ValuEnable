const express = require('express');
const router = express.Router();
const CalculationController = require('../controllers/calculationController');
const { authenticateToken } = require('../middleware/auth');

// Public routes (for calculation without saving)
router.post('/calculate', CalculationController.calculateIllustration);
router.post('/validate', CalculationController.validateInputs);
router.get('/rules', CalculationController.getCalculationRules);

// Protected routes
router.post('/bulk', authenticateToken, CalculationController.bulkCalculation);

module.exports = router;
