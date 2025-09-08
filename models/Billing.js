const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  billNo: { type: String, required: true, unique: true },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  items: [{
    sku: { type: String, required: true },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
    gst: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  paymentMode: { type: String, enum: ['cash', 'card', 'UPI'], required: true },
  qrCodeUrl: { type: String }, // URL for UPI QR code if payment method is UPI
  dateTime: { type: Date, default: Date.now },
  customerDetails: {
    name: String,
    phone: String,
    email: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Billing', billingSchema);

