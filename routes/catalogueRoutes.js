const express = require('express');
const router = express.Router();
const catalogueController = require('../controllers/catalogueController');

router.post('/', catalogueController.createCatalogue);
router.get('/', catalogueController.getAllCatalogues);
router.get('/:id', catalogueController.getCatalogueById);
router.put('/:id', catalogueController.updateCatalogueById);
router.delete('/:id', catalogueController.deleteCatalogueById);

module.exports = router;
