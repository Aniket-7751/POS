import React, { useState, useEffect, useRef } from 'react';
import { salesAPI, catalogueAPI, invoiceAPI, storeAPI } from '../api';
import PaymentModal from '../components/PaymentModal';

interface CartItem {
  sku: string;
  itemName: string;
  quantity: number;
  pricePerUnit: number;
  gst: number;
  discount: number;
  totalAmount: number;
}

interface CustomerDetails {
  name?: string;
  phone?: string;
  email?: string;
}

interface POSInterfaceProps {
  storeId?: string;
  storeName?: string;
}

const POSInterface: React.FC<POSInterfaceProps> = ({ storeId, storeName }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  // Focus barcode input on mount
  useEffect(() => {
    if (barcodeInputRef.current) barcodeInputRef.current.focus();
  }, []);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [quantityInput, setQuantityInput] = useState(1);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({});
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'UPI'>('cash');
  const [selectedStore, setSelectedStore] = useState<string>(storeId || '');
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRequiredError, setShowRequiredError] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  // Load stores on component mount
  useEffect(() => {
    if (storeId) {
      // If storeId is provided (store user), set selectedStore and skip loading all stores
      setSelectedStore(storeId);
      setStores(storeName ? [{ _id: storeId, storeName }] : []);
    } else {
      // Organization user: load all stores
      const loadStores = async () => {
        try {
          const response = await storeAPI.getAll();
          setStores(response.data);
        } catch (error) {
          console.error('Failed to load stores:', error);
        }
      };
      loadStores();
    }
  }, [storeId, storeName]);

  // Calculate totals
  const subTotal = cart.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);
  const totalGST = cart.reduce((sum, item) => sum + item.gst, 0);
  const totalDiscount = cart.reduce((sum, item) => sum + item.discount, 0);
  const grandTotal = subTotal - totalDiscount + totalGST;

  // Add item to cart by barcode
  const addItemByBarcode = async () => {
    if (!barcodeInput.trim()) {
      if (barcodeInputRef.current) barcodeInputRef.current.focus();
      return;
    }

    try {
      setLoading(true);
      const response = await catalogueAPI.getByBarcode(barcodeInput);
      const product = response.data;

      if (product) {
        const existingItemIndex = cart.findIndex(item => item.sku === product.sku);
        
        if (existingItemIndex >= 0) {
          // Update existing item quantity
          const updatedCart = [...cart];
          updatedCart[existingItemIndex].quantity += quantityInput;
          updatedCart[existingItemIndex].totalAmount = 
            updatedCart[existingItemIndex].quantity * updatedCart[existingItemIndex].pricePerUnit 
            - updatedCart[existingItemIndex].discount 
            + updatedCart[existingItemIndex].gst;
          setCart(updatedCart);
        } else {
          // Add new item
          const newItem: CartItem = {
            sku: product.sku,
            itemName: product.itemName,
            quantity: quantityInput,
            pricePerUnit: product.price,
            gst: 0, // Calculate GST based on product
            discount: 0,
            totalAmount: quantityInput * product.price
          };
          setCart([...cart, newItem]);
        }
        setBarcodeInput('');
        setQuantityInput(1);
        setMessage(`Added ${product.itemName} to cart`);
        if (barcodeInputRef.current) barcodeInputRef.current.focus();
      }
    } catch (error) {
      setMessage('Product not found');
    } finally {
      setLoading(false);
      if (barcodeInputRef.current) barcodeInputRef.current.focus();
    }
  };

  // Add item to cart by SKU
  const addItemBySKU = async (sku: string) => {
    try {
      const response = await catalogueAPI.getBySKU(sku);
      const product = response.data;

      if (product) {
        const existingItemIndex = cart.findIndex(item => item.sku === product.sku);
        
        if (existingItemIndex >= 0) {
          const updatedCart = [...cart];
          updatedCart[existingItemIndex].quantity += 1;
          updatedCart[existingItemIndex].totalAmount = 
            updatedCart[existingItemIndex].quantity * updatedCart[existingItemIndex].pricePerUnit 
            - updatedCart[existingItemIndex].discount 
            + updatedCart[existingItemIndex].gst;
          setCart(updatedCart);
        } else {
          const newItem: CartItem = {
            sku: product.sku,
            itemName: product.itemName,
            quantity: 1,
            pricePerUnit: product.price,
            gst: 0,
            discount: 0,
            totalAmount: product.price
          };
          setCart([...cart, newItem]);
        }
      }
    } catch (error) {
      setMessage('Product not found');
    }
  };

  // Remove item from cart
  const removeItem = (sku: string) => {
    setCart(cart.filter(item => item.sku !== sku));
  };

  // Update item quantity
  const updateQuantity = (sku: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(sku);
      return;
    }

    const updatedCart = cart.map(item => {
      if (item.sku === sku) {
        const updatedItem = { ...item, quantity: newQuantity };
        updatedItem.totalAmount = updatedItem.quantity * updatedItem.pricePerUnit 
          - updatedItem.discount + updatedItem.gst;
        return updatedItem;
      }
      return item;
    });
    setCart(updatedCart);
  };

  // Process payment
  const processPayment = async () => {
    if (cart.length === 0) {
      setMessage('Cart is empty');
      return;
    }

    if (!selectedStore) {
      setMessage('Please select a store');
      return;
    }

    if (!customerDetails.name || !customerDetails.phone) {
      setShowRequiredError(true);
      return;
    }

    setShowRequiredError(false);

    // Check stock for each cart item
    setLoading(true);
    try {
      for (const item of cart) {
        // Fetch latest product info by SKU
        const res = await catalogueAPI.getBySKU(item.sku);
        const product = res.data;
        if (!product || typeof product.stock !== 'number') {
          setMessage(`Unable to verify stock for ${item.itemName}`);
          setLoading(false);
          return;
        }
        if (item.quantity > product.stock) {
          setMessage(`Not enough stock for ${item.itemName}. Available: ${product.stock}`);
          setLoading(false);
          return;
        }
      }
      setShowPaymentModal(true);
    } catch (err) {
      setMessage('Error checking stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle payment completion from modal
  const handlePaymentComplete = async (paymentMethod: string, transactionId?: string) => {
    try {
      setLoading(true);
      // Create transaction
      const transactionData = {
        storeId: selectedStore,
        items: cart,
        paymentMethod,
        customerDetails: Object.keys(customerDetails).length > 0 ? customerDetails : undefined,
        cashier: localStorage.getItem('userId'), // Get from auth context
        transactionId: transactionId || `TXN${Date.now()}`
      };

      const transactionResponse = await salesAPI.createTransaction(transactionData);
      const transaction = transactionResponse.data.transaction;

      // Generate invoice
      const invoiceResponse = await invoiceAPI.generateInvoice({
        transactionId: transaction._id
      });

      // Set invoice data and show invoice in modal
      setInvoiceData(invoiceResponse.data.invoice);
      setShowInvoice(true);

      setMessage(`Transaction completed! Invoice No: ${invoiceResponse.data.invoiceNo}`);
      setCart([]);
      setCustomerDetails({});
      setBarcodeInput('');
      setQuantityInput(1);
      // Focus barcode input after payment
      setTimeout(() => {
        if (barcodeInputRef.current) barcodeInputRef.current.focus();
      }, 100);
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  // Refocus barcode input after closing or printing/downloading invoice
  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
    setShowInvoice(false);
    setInvoiceData(null);
    setTimeout(() => {
      if (barcodeInputRef.current) barcodeInputRef.current.focus();
    }, 100);
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: 'calc(100vh - 80px)', 
      background: '#f5f6fa',
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      boxSizing: 'border-box',
      gap: '20px',
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      {/* Left Panel - Product Scanning */}
      <div style={{ 
        width: '48%', 
        minWidth: '400px',
        padding: '20px', 
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>POS Interface</h2>
        
        {/* Barcode Scanner Input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
            Barcode Scanner
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch', width: '100%' }}>
            <input
              type="text"
              ref={barcodeInputRef}
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Scan or enter barcode"
              style={{
                flex: 2,
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px',
                minWidth: '0'
              }}
              onKeyPress={(e) => e.key === 'Enter' && addItemByBarcode()}
            />
            <input
              type="number"
              value={quantityInput}
              onChange={(e) => setQuantityInput(parseInt(e.target.value) || 1)}
              min="1"
              style={{
                width: '70px',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px',
                textAlign: 'center'
              }}
            />
            <button
              onClick={addItemByBarcode}
              disabled={loading}
              style={{
                padding: '12px 16px',
                background: '#6c3fc5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                minWidth: '70px',
                whiteSpace: 'nowrap'
              }}
            >
              Add
            </button>
          </div>
        </div>

        {/* Store Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
            Store
          </label>
          {storeId ? (
            <input
              type="text"
              value={storeName || 'Store'}
              disabled
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px',
                background: '#f5f5f5',
                color: '#888'
              }}
            />
          ) : (
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px',
                background: '#fff'
              }}
            >
              <option value="">Select a store</option>
              {stores.map(store => (
                <option key={store._id} value={store._id}>
                  {store.storeName} - {store.storeLocation}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Customer Details */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Customer Details</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500, fontSize: '14px', color: '#333', marginBottom: '4px', display: 'block' }}>
                Customer Name <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Customer Name"
                value={customerDetails.name || ''}
                onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500, fontSize: '14px', color: '#333', marginBottom: '4px', display: 'block' }}>
                Phone Number <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Phone Number"
                value={customerDetails.phone || ''}
                onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                required
                maxLength={10}
                pattern="[0-9]{10}"
                inputMode="numeric"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
          {/* Show error if required fields are missing, but only after trying to process payment */}
          {showRequiredError && (
            <div style={{ color: 'red', marginTop: '8px', fontSize: '13px', fontWeight: 500 }}>
              Customer Name and Phone Number are required
            </div>
          )}
        </div>


        {message && (
          <div style={{
            padding: '10px',
            background: message.includes('error') || message.includes('failed') ? '#ffebee' : '#e8f5e8',
            color: message.includes('error') || message.includes('failed') ? '#c62828' : '#2f8e55ff',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {message}
          </div>
        )}
      </div>

      {/* Right Panel - Cart and Checkout */}
      <div style={{ 
        width: '52%', 
        minWidth: '400px',
        padding: '20px',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Shopping Cart</h2>
        
        {/* Cart Items */}
        <div style={{ 
          flex: 1,
          minHeight: '300px',
          maxHeight: '400px', 
          overflowY: 'auto',
          marginBottom: '20px',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}>
          {cart.length === 0 ? (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              color: '#666' 
            }}>
              Cart is empty. Scan items to add them.
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.sku} style={{
                padding: '12px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '14px' }}>
                    {item.itemName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    SKU: {item.sku} | ₹{item.pricePerUnit} each
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                    style={{
                      width: '28px',
                      height: '28px',
                      background: '#f0f0f0',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '25px', textAlign: 'center', fontSize: '14px' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                    style={{
                      width: '28px',
                      height: '28px',
                      background: '#f0f0f0',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    +
                  </button>
                  <div style={{ 
                    minWidth: '80px', 
                    textAlign: 'right',
                    fontWeight: 'bold'
                  }}>
                    ₹{item.totalAmount.toFixed(2)}
                  </div>
                  <button
                    onClick={() => removeItem(item.sku)}
                    style={{
                      padding: '5px 10px',
                      background: '#ff5252',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div style={{ 
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
            <span>Subtotal:</span>
            <span>₹{subTotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
            <span>Discount:</span>
            <span>-₹{totalDiscount.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
            <span>GST:</span>
            <span>₹{totalGST.toFixed(2)}</span>
          </div>
          <hr style={{ margin: '8px 0' }} />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            <span>Total:</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={processPayment}
          disabled={loading || cart.length === 0}
          style={{
            width: '100%',
            padding: '12px',
            background: cart.length === 0 ? '#ccc' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Processing...' : 'Process Payment'}
        </button>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handlePaymentModalClose}
        totalAmount={grandTotal}
        onPaymentComplete={handlePaymentComplete}
        customerDetails={customerDetails}
        cartItems={cart}
        invoiceData={invoiceData}
        showInvoice={showInvoice}
      />
    </div>
  );
};

export default POSInterface;
