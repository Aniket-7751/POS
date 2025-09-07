const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  itemId: { type: String, required: true, unique: true },
  sku: { type: String, required: true, unique: true },
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
  barcode: { type: String, unique: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
