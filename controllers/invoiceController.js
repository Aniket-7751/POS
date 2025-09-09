const Invoice = require('../models/Invoice');
const Sale = require('../models/Sale');
const Store = require('../models/Store');
const Organization = require('../models/Organization');

// Generate invoice from transaction
exports.generateInvoice = async (req, res) => {
  try {
    const { transactionId } = req.body;
    
    // Get transaction details
    const transaction = await Sale.findById(transactionId).populate('storeId');
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Get store and organization details
    const store = await Store.findById(transaction.storeId);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const organization = await Organization.findById(store.organizationId);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    console.log('Store data:', {
      storeName: store.storeName,
      storeAddress: store.storeAddress,
      organizationId: store.organizationId
    });

    console.log('Organization data:', {
      organizationName: organization.organizationName,
      gstNumber: organization.gstNumber,
      contactNumber: organization.contactNumber
    });

    // Generate invoice number
    const invoiceNo = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create invoice record
    const invoiceData = {
      invoiceNo,
      transactionId: transaction._id,
      storeId: transaction.storeId,
      organizationId: store.organizationId,
      items: transaction.items,
      totalAmount: transaction.grandTotal,
      paymentMode: transaction.paymentMethod,
      qrCodeUrl: transaction.paymentMethod === 'UPI' ? generateUPIQR(organization, transaction.grandTotal) : null,
      dateTime: transaction.dateTime,
      customerDetails: transaction.customerDetails,
      status: 'paid', // Since it's a POS transaction, it's immediately paid
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      // Add store and organization details for display
      storeName: store.storeName,
      storeAddress: store.storeAddress,
      organizationName: organization.organizationName,
      gstNumber: organization.gstNumber,
      phoneNumber: organization.contactNumber
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    console.log('Invoice data being sent:', {
      storeName: invoiceData.storeName,
      storeAddress: invoiceData.storeAddress,
      organizationName: invoiceData.organizationName
    });

    res.status(201).json({
      message: 'Invoice generated successfully',
      invoiceNo,
      invoice
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all invoices
exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('transactionId')
      .populate('storeId')
      .populate('organizationId');
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('transactionId')
      .populate('storeId')
      .populate('organizationId');
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get invoices by store
exports.getInvoicesByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const invoices = await Invoice.find({ storeId })
      .populate('transactionId')
      .populate('storeId')
      .populate('organizationId');
    res.json(invoices);
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

