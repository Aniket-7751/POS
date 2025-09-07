const mongoose = require('mongoose');

const catalogueSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  sku: { type: String, required: true },
  itemName: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  volumeOfMeasurement: { type: String, required: true }, // e.g., "1kg", "500ml"
  sourceOfOrigin: { type: String },
  nutritionValue: {
    calories: Number,
    protein: Number,
    fat: Number,
    carbs: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number
  },
  certification: { type: String }, // e.g., "FSSAI", "ISO"
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  barcode: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  image: { type: String }, // image URL or path
  thumbnail: { type: String }, // thumbnail URL or path
  instructions: { type: String },
  expiry: { type: Number }, // in hours
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true }
}, { timestamps: true });

// Compound indexes to ensure uniqueness within organization
catalogueSchema.index({ itemId: 1, organizationId: 1 }, { unique: true });
catalogueSchema.index({ sku: 1, organizationId: 1 }, { unique: true });
catalogueSchema.index({ barcode: 1, organizationId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Catalogue', catalogueSchema);
