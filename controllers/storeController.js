const Store = require('../models/Store');
const StorePrice = require('../models/StorePrice');
const Catalogue = require('../models/Catalogue');

exports.createStore = async (req, res) => {
  try {
    const storeData = { ...req.body };
    // Use storeId as the _id
    storeData._id = storeData.storeId;
    const store = new Store(storeData);
    await store.save();
    res.status(201).json(store);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllStores = async (req, res) => {
  try {
    const stores = await Store.find();
    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ error: 'Not found' });
    res.json(store);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStoreById = async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!store) return res.status(404).json({ error: 'Not found' });
    res.json(store);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteStoreById = async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get or compute effective price for a SKU for a store
exports.getEffectivePrice = async (req, res) => {
  try {
    const { storeId, sku } = req.params;
    const catalogue = await Catalogue.findOne({ sku });
    if (!catalogue) return res.status(404).json({ error: 'Product not found' });
    const override = await StorePrice.findOne({ storeId, sku, status: 'active' });
    const base = Number(catalogue.price) || 0;
    let effective = base;
    if (override) {
      if (typeof override.overridePrice === 'number') {
        effective = Number(override.overridePrice);
      } else {
        const margin = Number(override.marginValue) || 0;
        effective = override.marginType === 'absolute' ? base + margin : base + (base * margin / 100);
      }
    } else {
      // Fallback to store-wide profit margin if no per-SKU override
      const store = await Store.findById(storeId);
      const storeMargin = Number(store?.profitMarginPercent) || 0;
      effective = base + (base * storeMargin / 100);
    }
    return res.json({ sku, basePrice: base, effectivePrice: effective });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Upsert store price record
exports.upsertStorePrice = async (req, res) => {
  try {
    const { storeId, sku } = req.params;
    const payload = req.body || {};
    const catalogue = await Catalogue.findOne({ sku });
    const base = Number(catalogue?.price) || 0;
    const update = {
      basePrice: typeof payload.basePrice === 'number' ? payload.basePrice : base,
      marginType: payload.marginType || 'percent',
      marginValue: typeof payload.marginValue === 'number' ? payload.marginValue : 0,
      overridePrice: typeof payload.overridePrice === 'number' ? payload.overridePrice : undefined,
      status: payload.status || 'active'
    };
    const record = await StorePrice.findOneAndUpdate(
      { storeId, sku },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// List store prices
exports.listStorePrices = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { sku } = req.query;
    const query = { storeId };
    if (sku) query.sku = sku;
    const items = await StorePrice.find(query).sort({ updatedAt: -1 });
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
