// Endpoint to generate itemId and sku
exports.generateIds = (req, res) => {
  const sku = `SKU${Math.floor(100000 + Math.random() * 900000)}`;
  const itemId = `ITEM${Math.floor(100000 + Math.random() * 900000)}`;
  res.json({ sku, itemId });
};
const Catalogue = require('../models/Catalogue');
const path = require('path');

exports.createCatalogue = async (req, res) => {
  try {
    const catalogueData = { ...req.body };
    // Autogenerate SKU and Item ID if not provided
    const skuArr = await Catalogue.find({}, 'sku').sort({ sku: -1 }).limit(1);
    const itemArr = await Catalogue.find({}, 'itemId').sort({ itemId: -1 }).limit(1);
    let nextSkuNum = 1;
    let nextItemNum = 1;
    if (skuArr.length > 0) {
      const lastSku = skuArr[0].sku;
      const match = lastSku.match(/SKU(\d+)/);
      if (match) nextSkuNum = parseInt(match[1], 10) + 1;
    }
    if (itemArr.length > 0) {
      const lastItem = itemArr[0].itemId;
      const match = lastItem.match(/ITEM(\d+)/);
      if (match) nextItemNum = parseInt(match[1], 10) + 1;
    }
    catalogueData.sku = `SKU${nextSkuNum.toString().padStart(3, '0')}`;
    catalogueData.itemId = `ITEM${nextItemNum.toString().padStart(3, '0')}`;
    catalogueData._id = catalogueData.itemId;
    
    // Parse nested fields sent as strings (e.g., from forms)
    if (typeof catalogueData.nutritionValue === 'string') {
      try { catalogueData.nutritionValue = JSON.parse(catalogueData.nutritionValue); } catch (_) {}
    }

    // Accept multiple base64 images directly via JSON
    if (Array.isArray(catalogueData.images)) {
      // keep as-is (array of base64 data URLs)
    } else if (catalogueData.image && typeof catalogueData.image === 'string' && catalogueData.image.startsWith('data:image')) {
      // convert single image to array
      catalogueData.images = [catalogueData.image];
    }
    // Remove old image/thumbnail fields
    delete catalogueData.image;
    // Thumbnail should be a string (base64 or path) and must be one of the images
    if (catalogueData.thumbnail && Array.isArray(catalogueData.images)) {
      if (!catalogueData.images.includes(catalogueData.thumbnail)) {
        // If not present, add thumbnail to images array
        catalogueData.images.push(catalogueData.thumbnail);
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
    
    // Accept multiple base64 images directly via JSON
    if (Array.isArray(catalogueData.images)) {
      // keep as-is (array of base64 data URLs)
    } else if (catalogueData.image && typeof catalogueData.image === 'string' && catalogueData.image.startsWith('data:image')) {
      // convert single image to array
      catalogueData.images = [catalogueData.image];
    }
    // Remove old image/thumbnail fields
    delete catalogueData.image;
    // Thumbnail should be a string (base64 or path) and must be one of the images
    if (catalogueData.thumbnail && Array.isArray(catalogueData.images)) {
      if (!catalogueData.images.includes(catalogueData.thumbnail)) {
        // If not present, add thumbnail to images array
        catalogueData.images.push(catalogueData.thumbnail);
      }
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
