const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

router.post('/', storeController.createStore);
router.get('/', storeController.getAllStores);
router.get('/:id', storeController.getStoreById);
router.put('/:id', storeController.updateStoreById);
router.delete('/:id', storeController.deleteStoreById);

// Store pricing overrides
router.get('/:storeId/prices', storeController.listStorePrices);
router.get('/:storeId/prices/:sku/effective', storeController.getEffectivePrice);
router.put('/:storeId/prices/:sku', storeController.upsertStorePrice);

module.exports = router;
