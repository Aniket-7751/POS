const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Catalogue = require('../models/Catalogue');
const Store = require('../models/Store');
const { parseISO, startOfDay, endOfDay, endOfToday } = require("date-fns");
// const tz = require("date-fns-tz");

// const  zonedTimeToUtc  = tz.zonedTimeToUtc;
const { zonedTimeToUtc } = require('date-fns-tz');

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

    // Always use GST rate from the store
    const gstRate = store.gstRate || 0;
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
      // Calculate GST for each product using store gstRate
      const itemGst = ((itemSubTotal - itemDiscount) * gstRate) / 100;
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
// with optional filters and search
exports.getTransactionsByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { filter, search, date, startDate, endDate } = req.query; // filter & search from query params

    const query = { storeId };
    const timeZone = "Asia/Kolkata";

    // Apply filter
    if (filter === 'today') {
      const start = zonedTimeToUtc(startOfDay(new Date()), timeZone);
      const end = zonedTimeToUtc(endOfToday(), timeZone);
      query.dateTime = { $gte: start, $lt: end };
    }

    // Yesterday's filter
    if (filter === "yesterday") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const start = zonedTimeToUtc(startOfDay(yesterday), timeZone);
      const end = zonedTimeToUtc(endOfDay(yesterday), timeZone);
      query.dateTime = { $gte: start, $lt: end };
    }

    // Single date
    if (date) {
      const parsedDate = parseISO(date);
      const start = zonedTimeToUtc(startOfDay(parsedDate), timeZone);
      const end = zonedTimeToUtc(endOfDay(parsedDate), timeZone);
      query.dateTime = { $gte: start, $lt: end };
    }
    // Date range
    if (startDate && endDate) {
      const start = zonedTimeToUtc(startOfDay(parseISO(startDate)), timeZone);
      const end = zonedTimeToUtc(endOfDay(parseISO(endDate)), timeZone);
      query.dateTime = { $gte: start, $lt: end };
    }

    // Payment filter
    if (['cash', 'card', 'UPI'].includes(filter)) {
      query.paymentMethod = filter;
    }

    // Apply search
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { 'customerDetails.name': { $regex: search, $options: 'i' } },
        { 'customerDetails.phone': { $regex: search, $options: 'i' } },
        { 'customerDetails.email': { $regex: search, $options: 'i' } }
      ];
    }

    // const transactions = await Sale.find({ storeId })
    const transactions = await Sale.find(query)
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

// Get sales by date range
exports.getSalesByDateRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = new Date(start);
    const endDate = new Date(end);

    const sales = await Sale.find({
      dateTime: {
        $gte: startDate,
        $lte: endDate
      }
    })
      .populate('storeId')
      .populate('cashier')
      .sort({ dateTime: -1 });

    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get sales by transaction ID
exports.getSalesByTransactionId = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const sale = await Sale.findOne({ transactionId })
      .populate('storeId')
      .populate('cashier');

    if (!sale) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get sales statistics
exports.getSalesStats = async (req, res) => {
  try {
    const totalSales = await Sale.countDocuments();
    const totalRevenue = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySales = await Sale.countDocuments({
      dateTime: { $gte: today, $lt: tomorrow }
    });

    const todayRevenue = await Sale.aggregate([
      {
        $match: {
          dateTime: { $gte: today, $lt: tomorrow }
        }
      },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    ]);

    const paymentMethodStats = await Sale.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$grandTotal' }
        }
      }
    ]);

    res.json({
      totalSales,
      totalRevenue: totalRevenue[0]?.total || 0,
      todaySales,
      todayRevenue: todayRevenue[0]?.total || 0,
      paymentMethodStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get today's sales
// const moment = require("moment-timezone");

// exports.getTodaysSales = async (req, res) => {
//   try {
//     const now = new Date();
//     //today.setHours(0, 0, 0, 0);
//     //const tomorrow = new Date(today);
//     //tomorrow.setDate(tomorrow.getDate() + 1);

//     //const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0); // Indian Standard time

//     //const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);

//     // Force to IST
//     const startOfToday = moment().tz("Asia/Kolkata").startOf("day").toDate();
//     const endOfToday = moment().tz("Asia/Kolkata").endOf("day").toDate();
//     const sales = await Sale.find({
//       dateTime: { $gte: startOfToday, $lt: endOfToday }
//     })
//       .populate('storeId')
//       .populate('cashier')
//       .sort({ dateTime: -1 });

//     res.json(sales);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// Get sales by payment method
exports.getSalesByPaymentMethod = async (req, res) => {
  try {
    const { paymentMethod } = req.params;
    const sales = await Sale.find({ paymentMethod })
      .populate('storeId')
      .populate('cashier')
      .sort({ dateTime: -1 });

    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
