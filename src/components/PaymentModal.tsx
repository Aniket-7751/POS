import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onPaymentComplete: (paymentMethod: string, transactionId?: string) => void;
  customerDetails?: {
    name?: string;
    phone?: string;
  };
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  onPaymentComplete,
  customerDetails
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [paymentStep, setPaymentStep] = useState<'method' | 'processing' | 'complete'>('method');
  const [upiQRCode, setUpiQRCode] = useState<string>('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [transactionId, setTransactionId] = useState<string>('');

  // Generate transaction ID
  useEffect(() => {
    if (isOpen) {
      const id = 'TXN' + Date.now().toString().slice(-8);
      setTransactionId(id);
    }
  }, [isOpen]);

  // Generate UPI QR Code
  useEffect(() => {
    if (selectedMethod === 'upi' && totalAmount > 0) {
      generateUPIQRCode();
    }
  }, [selectedMethod, totalAmount]);

  const generateUPIQRCode = async () => {
    try {
      // UPI payment URL format
      const upiId = 'your-merchant@paytm'; // Replace with your actual UPI ID
      const merchantName = 'Suguna Chicken Store';
      const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(`Payment for Order ${transactionId}`)}`;
      
      const qrCodeDataURL = await QRCode.toDataURL(upiUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setUpiQRCode(qrCodeDataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handlePaymentMethodSelect = (method: 'cash' | 'card' | 'upi') => {
    setSelectedMethod(method);
    setPaymentStep('processing');
  };

  const handlePaymentComplete = () => {
    setPaymentCompleted(true);
    setPaymentStep('complete');
    
    // Simulate payment processing delay
    setTimeout(() => {
      onPaymentComplete(selectedMethod, transactionId);
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    if (paymentStep === 'complete') {
      onClose();
    } else {
      // Reset state when closing
      setPaymentStep('method');
      setPaymentCompleted(false);
      setUpiQRCode('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #eee',
          paddingBottom: '16px'
        }}>
          <h2 style={{ margin: 0, color: '#333', fontSize: '24px' }}>
            Payment Processing
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* Transaction Details */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: '600' }}>Transaction ID:</span>
            <span style={{ fontFamily: 'monospace' }}>{transactionId}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: '600' }}>Total Amount:</span>
            <span style={{ fontWeight: '700', fontSize: '18px', color: '#28a745' }}>
              ₹{totalAmount.toFixed(2)}
            </span>
          </div>
          {customerDetails?.name && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '600' }}>Customer:</span>
              <span>{customerDetails.name}</span>
            </div>
          )}
        </div>

        {/* Payment Steps */}
        {paymentStep === 'method' && (
          <div>
            <h3 style={{ marginBottom: '16px', color: '#333' }}>Select Payment Method</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => handlePaymentMethodSelect('cash')}
                style={{
                  padding: '16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#6c3fc5';
                  e.currentTarget.style.backgroundColor = '#f8f6ff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <span style={{ fontSize: '24px' }}>💵</span>
                <div style={{ textAlign: 'left' }}>
                  <div>Cash Payment</div>
                  <div style={{ fontSize: '14px', color: '#666', fontWeight: '400' }}>
                    Pay with cash at counter
                  </div>
                </div>
              </button>

              <button
                onClick={() => handlePaymentMethodSelect('card')}
                style={{
                  padding: '16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#6c3fc5';
                  e.currentTarget.style.backgroundColor = '#f8f6ff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <span style={{ fontSize: '24px' }}>💳</span>
                <div style={{ textAlign: 'left' }}>
                  <div>Card Payment</div>
                  <div style={{ fontSize: '14px', color: '#666', fontWeight: '400' }}>
                    Debit/Credit card payment
                  </div>
                </div>
              </button>

              <button
                onClick={() => handlePaymentMethodSelect('upi')}
                style={{
                  padding: '16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#6c3fc5';
                  e.currentTarget.style.backgroundColor = '#f8f6ff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <span style={{ fontSize: '24px' }}>📱</span>
                <div style={{ textAlign: 'left' }}>
                  <div>UPI Payment</div>
                  <div style={{ fontSize: '14px', color: '#666', fontWeight: '400' }}>
                    Scan QR code with UPI app
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Payment Processing */}
        {paymentStep === 'processing' && (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>
              {selectedMethod === 'cash' && 'Cash Payment'}
              {selectedMethod === 'card' && 'Card Payment'}
              {selectedMethod === 'upi' && 'UPI Payment'}
            </h3>

            {selectedMethod === 'upi' && upiQRCode && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
                  Scan QR Code with UPI App
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '16px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <img src={upiQRCode} alt="UPI QR Code" style={{ maxWidth: '200px' }} />
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                  Amount: ₹{totalAmount.toFixed(2)}
                </div>
              </div>
            )}

            {selectedMethod === 'cash' && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '16px', marginBottom: '12px' }}>
                  Please collect ₹{totalAmount.toFixed(2)} from customer
                </div>
              </div>
            )}

            {selectedMethod === 'card' && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '16px', marginBottom: '12px' }}>
                  Please process card payment for ₹{totalAmount.toFixed(2)}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Use your card terminal to process the payment
                </div>
              </div>
            )}

            <button
              onClick={handlePaymentComplete}
              style={{
                padding: '12px 24px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                minWidth: '200px'
              }}
            >
              Payment Completed
            </button>
          </div>
        )}

        {/* Payment Complete */}
        {paymentStep === 'complete' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h3 style={{ marginBottom: '16px', color: '#28a745' }}>
              Payment Successful!
            </h3>
            <div style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
              Transaction ID: {transactionId}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Generating bill...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;

