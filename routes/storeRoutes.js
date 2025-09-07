const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

router.post('/', storeController.createStore);
router.get('/', storeController.getAllStores);
router.get('/:id', storeController.getStoreById);
router.put('/:id', storeController.updateStoreById);
router.delete('/:id', storeController.deleteStoreById);

module.exports = router;
