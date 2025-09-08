const Billing = require('../models/Billing');
const Sale = require('../models/Sale');
const Store = require('../models/Store');
const Organization = require('../models/Organization');

// Generate bill from transaction
exports.generateBill = async (req, res) => {
  try {
    const { transactionId } = req.body;
    
    // Get transaction details
    const transaction = await Sale.findById(transactionId).populate('storeId');
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Get store and organization details
    const store = await Store.findById(transaction.storeId._id).populate('organizationId');
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Generate bill number
    const billNo = `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create billing record
    const billingData = {
      billNo,
      transactionId: transaction._id,
      storeId: transaction.storeId._id,
      organizationId: store.organizationId._id,
      items: transaction.items,
      totalAmount: transaction.grandTotal,
      paymentMode: transaction.paymentMethod,
      qrCodeUrl: transaction.paymentMethod === 'UPI' ? generateUPIQR(store.organizationId, transaction.grandTotal) : null,
      dateTime: transaction.dateTime,
      customerDetails: transaction.customerDetails
    };

    const bill = new Billing(billingData);
    await bill.save();

    res.status(201).json({
      message: 'Bill generated successfully',
      billNo,
      bill
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all bills
exports.getAllBills = async (req, res) => {
  try {
    const bills = await Billing.find()
      .populate('transactionId')
      .populate('storeId')
      .populate('organizationId');
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get bill by ID
exports.getBillById = async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id)
      .populate('transactionId')
      .populate('storeId')
      .populate('organizationId');
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get bills by store
exports.getBillsByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const bills = await Billing.find({ storeId })
      .populate('transactionId')
      .populate('storeId')
      .populate('organizationId');
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Generate UPI QR code URL (mock implementation)
function generateUPIQR(organization, amount) {
  // This would typically generate a UPI QR code
  // For now, returning a mock URL
  return `https://upiqr.in/pay?pa=${organization.gstNumber}@paytm&pn=${organization.organizationName}&am=${amount}&cu=INR`;
}

