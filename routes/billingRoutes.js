const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');

// Billing routes
router.post('/generate', billingController.generateBill);
router.get('/', billingController.getAllBills);
router.get('/:id', billingController.getBillById);
router.get('/store/:storeId', billingController.getBillsByStore);

module.exports = router;

