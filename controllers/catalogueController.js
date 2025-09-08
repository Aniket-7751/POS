const Catalogue = require('../models/Catalogue');
const path = require('path');

exports.createCatalogue = async (req, res) => {
  try {
    const catalogueData = { ...req.body };
    
    // Handle image uploads if files are present
    if (req.files) {
      if (req.files.image) {
        catalogueData.image = `/uploads/${req.files.image[0].filename}`;
      }
      if (req.files.thumbnail) {
        catalogueData.thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
      }
    }
    
    // Use itemId as the _id
    catalogueData._id = catalogueData.itemId;
    
    const catalogue = new Catalogue(catalogueData);
    await catalogue.save();
    res.status(201).json(catalogue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllCatalogues = async (req, res) => {
  try {
    const catalogues = await Catalogue.find();
    res.json(catalogues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCatalogueById = async (req, res) => {
  try {
    const catalogue = await Catalogue.findById(req.params.id);
    if (!catalogue) return res.status(404).json({ error: 'Not found' });
    res.json(catalogue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCatalogueById = async (req, res) => {
  try {
    const catalogueData = { ...req.body };
    
    // Handle image uploads if files are present
    if (req.files) {
      if (req.files.image) {
        catalogueData.image = `/uploads/${req.files.image[0].filename}`;
      }
      if (req.files.thumbnail) {
        catalogueData.thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
      }
    }
    
    // Use itemId as the _id if provided
    if (catalogueData.itemId) {
      catalogueData._id = catalogueData.itemId;
    }
    
    const catalogue = await Catalogue.findByIdAndUpdate(req.params.id, catalogueData, { new: true });
    if (!catalogue) return res.status(404).json({ error: 'Not found' });
    res.json(catalogue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteCatalogueById = async (req, res) => {
  try {
    const catalogue = await Catalogue.findByIdAndDelete(req.params.id);
    if (!catalogue) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
