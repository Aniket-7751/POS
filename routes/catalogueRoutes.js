const express = require('express');
const router = express.Router();
const catalogueController = require('../controllers/catalogueController');
const upload = require('../middleware/upload');

// Accept legacy single image/thumbnail and new multiple images
router.post('/', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), catalogueController.createCatalogue);
router.get('/', catalogueController.getAllCatalogues);
router.get('/:id', catalogueController.getCatalogueById);
router.put('/:id', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), catalogueController.updateCatalogueById);
router.delete('/:id', catalogueController.deleteCatalogueById);

module.exports = router;
