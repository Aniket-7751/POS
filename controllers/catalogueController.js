const Catalogue = require('../models/Catalogue');

exports.createCatalogue = async (req, res) => {
  try {
    const catalogue = new Catalogue(req.body);
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
    const catalogue = await Catalogue.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
