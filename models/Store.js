const mongoose = require('mongoose');


const storeSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  storeId: { type: String, required: true, unique: true },
  storeName: { type: String, required: true },
  storeLocation: { type: String, required: true },
  storeAddress: { type: String, required: true },
  contactPersonName: { type: String, required: true },
  contactNumber: { type: String, required: true, match: /^\d{10}$/ },
  email: { type: String, required: true },
  storePicture: { type: String }, // URL or path to store picture
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  organizationId: { type: String, ref: 'Organization', required: true },
  gstRate: { type: Number, required: true, default: 18 }, // GST rate in percent
  discountRate: { type: Number, default: 0 }, // Optional store-wide discount (%)
  profitMarginPercent: { type: Number, default: 0 }, // Store-wide profit margin (%) added on base price
  theme: { type: String, enum: ['light', 'dark'], default: 'light' }, // Simple theme selection
}, { timestamps: true, _id: false });

module.exports = mongoose.model('Store', storeSchema);
