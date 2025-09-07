const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// Transaction routes
router.get('/', salesController.getAllSales);
router.post('/transaction', salesController.createTransaction);
router.get('/transaction/:id', salesController.getTransactionById);
router.get('/store/:storeId', salesController.getTransactionsByStore);

// Product lookup routes (for POS interface)
router.get('/product/sku/:sku', salesController.getProductBySKU);
router.get('/product/barcode/:barcode', salesController.getProductByBarcode);

module.exports = router;
