const Catalogue = require('../models/Catalogue');
const path = require('path');

exports.createCatalogue = async (req, res) => {
  try {
    const catalogueData = { ...req.body };
    
    // Parse nested fields sent as strings (e.g., from forms)
    if (typeof catalogueData.nutritionValue === 'string') {
      try { catalogueData.nutritionValue = JSON.parse(catalogueData.nutritionValue); } catch (_) {}
    }

    // Accept base64 images directly via JSON
    if (catalogueData.image && typeof catalogueData.image === 'string' && catalogueData.image.startsWith('data:image')) {
      // keep as-is (base64 data URL)
    }
    if (catalogueData.thumbnail && typeof catalogueData.thumbnail === 'string' && catalogueData.thumbnail.startsWith('data:image')) {
      // keep as-is (base64 data URL)
    }

    console.log('Creating catalogue with data (pre-files):', { ...catalogueData, image: !!catalogueData.image, thumbnail: !!catalogueData.thumbnail });
    console.log('Files received:', req.files);
    
    // Handle image uploads if files are present
    if (req.files) {
      if (req.files.image) {
        catalogueData.image = `/uploads/${req.files.image[0].filename}`;
        console.log('Image path set:', catalogueData.image);
      }
      if (req.files.thumbnail) {
        catalogueData.thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
        console.log('Thumbnail path set:', catalogueData.thumbnail);
      }
    }
    
    // Use itemId as the _id
    catalogueData._id = catalogueData.itemId;
    // If expiry is a number, convert to string with unit (default to hours)
    if (typeof catalogueData.expiry === 'number') {
      catalogueData.expiry = `${catalogueData.expiry} hours`;
    }
    console.log('Final catalogue data:', catalogueData);
    const catalogue = new Catalogue(catalogueData);
    await catalogue.save();
    console.log('Catalogue saved successfully:', catalogue);
    res.status(201).json(catalogue);
  } catch (err) {
    console.error('Error creating catalogue:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getAllCatalogues = async (req, res) => {
  try {
    const catalogues = await Catalogue.find();
    console.log('Retrieved catalogues:', catalogues.length, 'items');
    catalogues.forEach(cat => {
      console.log(`- ${cat.itemName}: image=${cat.image}, thumbnail=${cat.thumbnail}`);
    });
    res.json(catalogues);
  } catch (err) {
    console.error('Error fetching catalogues:', err);
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
    
    // Accept base64 images directly via JSON
    if (catalogueData.image && typeof catalogueData.image === 'string' && catalogueData.image.startsWith('data:image')) {
      // keep as-is
    }
    if (catalogueData.thumbnail && typeof catalogueData.thumbnail === 'string' && catalogueData.thumbnail.startsWith('data:image')) {
      // keep as-is
    }

    // Parse nested fields sent as strings
    if (typeof catalogueData.nutritionValue === 'string') {
      try { catalogueData.nutritionValue = JSON.parse(catalogueData.nutritionValue); } catch (_) {}
    }

    // Use itemId as the _id if provided
    if (catalogueData.itemId) {
      catalogueData._id = catalogueData.itemId;
    }
    // If expiry is a number, convert to string with unit (default to hours)
    if (typeof catalogueData.expiry === 'number') {
      catalogueData.expiry = `${catalogueData.expiry} hours`;
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
