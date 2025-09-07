const mongoose = require('mongoose');


const storeSchema = new mongoose.Schema({
  storeId: { type: String, required: true, unique: true },
  storeName: { type: String, required: true },
  storeLocation: { type: String, required: true },
  storeAddress: { type: String, required: true },
  contactPersonName: { type: String, required: true },
  contactNumber: { type: String, required: true, match: /^\d{10}$/ },
  email: { type: String, required: true },
  storePicture: { type: String }, // URL or path to store picture
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);
