const Organization = require('../models/Organization');

exports.createOrganization = async (req, res) => {
  try {
    const org = new Organization(req.body);
    await org.save();
    res.status(201).json(org);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.find();
    res.json(orgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrganizationById = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ error: 'Not found' });
    res.json(org);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrganizationById = async (req, res) => {
  try {
    const org = await Organization.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!org) return res.status(404).json({ error: 'Not found' });
    res.json(org);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteOrganizationById = async (req, res) => {
  try {
    const org = await Organization.findByIdAndDelete(req.params.id);
    if (!org) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
