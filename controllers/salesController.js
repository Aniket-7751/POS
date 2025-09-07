const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Catalogue = require('../models/Catalogue');
const Store = require('../models/Store');

// Get all sales/transactions
exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('storeId')
      .populate('cashier')
      .sort({ dateTime: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new POS transaction
exports.createTransaction = async (req, res) => {
  try {
    const { 
      storeId, 
      items, 
      paymentMethod, 
      customerDetails, 
      cashier 
    } = req.body;

    // Validate store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Calculate totals
    let subTotal = 0;
    let gstTotal = 0;
    let discountTotal = 0;

    const processedItems = await Promise.all(items.map(async (item) => {
      // Get product details from catalogue
      const product = await Catalogue.findOne({ sku: item.sku });
      if (!product) {
        throw new Error(`Product with SKU ${item.sku} not found`);
      }

      // Check stock availability
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.itemName}. Available: ${product.stock}`);
      }

      const itemSubTotal = item.quantity * item.pricePerUnit;
      const itemDiscount = item.discount || 0;
      const itemGst = item.gst || 0;
      const itemTotal = itemSubTotal - itemDiscount + itemGst;

      subTotal += itemSubTotal;
      discountTotal += itemDiscount;
      gstTotal += itemGst;

      return {
        sku: item.sku,
        itemName: product.itemName,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit,
        gst: itemGst,
        discount: itemDiscount,
        totalAmount: itemTotal
      };
    }));

    const grandTotal = subTotal - discountTotal + gstTotal;

    // Generate transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create transaction
    const transaction = new Sale({
      transactionId,
      storeId,
      items: processedItems,
      subTotal,
      gstTotal,
      discountTotal,
      grandTotal,
      paymentMethod,
      customerDetails,
      cashier
    });

    await transaction.save();

    // Update stock for all items
    await Promise.all(items.map(async (item) => {
      await Catalogue.findOneAndUpdate(
        { sku: item.sku },
        { $inc: { stock: -item.quantity } }
      );
    }));

    res.status(201).json({
      message: 'Transaction created successfully',
      transactionId,
      transaction
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Sale.findById(req.params.id)
      .populate('storeId')
      .populate('cashier');
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get transactions by store
exports.getTransactionsByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const transactions = await Sale.find({ storeId })
      .populate('storeId')
      .populate('cashier')
      .sort({ dateTime: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get product by SKU (for barcode scanning)
exports.getProductBySKU = async (req, res) => {
  try {
    const { sku } = req.params;
    const product = await Catalogue.findOne({ sku }).populate('categoryId');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get product by barcode
exports.getProductByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const product = await Catalogue.findOne({ barcode }).populate('categoryId');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
