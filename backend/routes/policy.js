const express = require('express');
const router = express.Router();
const PolicyController = require('../controllers/policyController');
const { authenticateToken } = require('../middleware/auth');

// All policy routes require authentication
router.use(authenticateToken);

// Policy CRUD operations
router.post('/', PolicyController.createPolicy);
router.get('/', PolicyController.getUserPolicies);
router.get('/:policyId', PolicyController.getPolicyDetails);
router.put('/:policyId', PolicyController.recalculatePolicy);
router.delete('/:policyId', PolicyController.deletePolicy);

module.exports = router;
