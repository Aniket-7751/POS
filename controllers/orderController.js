const Order = require('../models/Order');
const Store = require('../models/Store');
const Organization = require('../models/Organization');
const Invoice = require('../models/Invoice');
const StoreOrderInvoice = require('../models/StoreOrderInvoice');
const Catalogue = require('../models/Catalogue');

// Store creates a new order
exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    const storeId = req.user.storeId || req.body.storeId; // support both JWT and direct
    if (!storeId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Store and items are required' });
    }
    const order = new Order({ storeId, items });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: get all orders (optionally filter by status)
exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 }).populate('storeId', 'storeName');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: update order status (approve, reject, fulfill)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;
    let order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // If approving, generate store order invoice
    let invoice = null;
    if (status === 'approved' && !order.invoiceId) {
      // Fetch store and org
      const store = await Store.findById(order.storeId);
      if (!store) return res.status(404).json({ error: 'Store not found' });
      const organization = await Organization.findById(store.organizationId);
      if (!organization) return res.status(404).json({ error: 'Organization not found' });

      // Debug logs for troubleshooting
      const skus = order.items.map(i => i.sku);
      console.log('Order SKUs:', skus);
      console.log('Order organizationId:', store.organizationId);
      const catalogueItems = await Catalogue.find({ sku: { $in: skus }, organizationId: store.organizationId });
      console.log('Catalogue items found:', catalogueItems.map(c => ({ sku: c.sku, price: c.price, org: c.organizationId })));
      console.log('Order items:', order.items);
      // Build invoice items with price, and check for missing catalogue items
      let missingItems = [];
      const invoiceItems = order.items.map(item => {
        const cat = catalogueItems.find(c => c.sku === item.sku);
        if (!cat) {
          missingItems.push(item.sku);
        }
        return {
          sku: item.sku,
          itemName: item.itemName,
          quantity: item.quantity,
          pricePerUnit: cat ? cat.price : 0,
          gst: 0,
          discount: 0,
          totalAmount: (cat ? cat.price : 0) * item.quantity
        };
      });
      if (missingItems.length > 0) {
        console.warn('Catalogue price missing for SKUs:', missingItems);
        return res.status(400).json({ error: `Catalogue price missing for SKUs: ${missingItems.join(', ')}` });
      }
      const totalAmount = invoiceItems.reduce((sum, i) => sum + i.totalAmount, 0);
      const invoiceNo = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const invoiceData = {
        invoiceNo,
        storeId: store._id,
        organizationId: store.organizationId,
        items: invoiceItems,
        totalAmount,
        dateTime: new Date(),
        status: 'pending',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        storeName: store.storeName,
        storeAddress: store.storeAddress,
        organizationName: organization.organizationName,
        gstNumber: organization.gstNumber,
        phoneNumber: organization.contactNumber
      };
      invoice = new StoreOrderInvoice(invoiceData);
      await invoice.save();
      order.invoiceId = invoice._id;
    }

    // Update order status and note
    order.status = status;
    order.adminNote = adminNote;
    order.updatedAt = new Date();
    await order.save();

    // Populate invoice if exists
    let invoiceData = null;
    if (order.invoiceId) {
      invoiceData = await StoreOrderInvoice.findById(order.invoiceId);
    }

    res.json({ order, invoice: invoiceData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Store: get own orders
exports.getStoreOrders = async (req, res) => {
  try {
    const storeId = req.user.storeId || req.query.storeId;
    if (!storeId) return res.status(400).json({ error: 'Store ID required' });
    const orders = await Order.find({ storeId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
