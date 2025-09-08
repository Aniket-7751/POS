const Store = require('../models/Store');

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
