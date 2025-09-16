import React from 'react';

interface InvoiceViewProps {
  invoice: any;
  onClose: () => void;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ invoice, onClose }) => {
  if (!invoice) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 400, maxWidth: 600, boxShadow: '0 2px 16px #0002', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
        <h2 style={{ marginBottom: 16 }}>Invoice #{invoice.invoiceNo}</h2>
        <div style={{ marginBottom: 8 }}><b>Date:</b> {new Date(invoice.dateTime).toLocaleString()}</div>
        <div style={{ marginBottom: 8 }}><b>Store:</b> {invoice.storeName}</div>
        <div style={{ marginBottom: 8 }}><b>Organization:</b> {invoice.organizationName}</div>
        <div style={{ marginBottom: 8 }}><b>GST No:</b> {invoice.gstNumber}</div>
        <div style={{ marginBottom: 8 }}><b>Address:</b> {invoice.storeAddress}</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '16px 0' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Item</th>
              <th style={{ textAlign: 'right', borderBottom: '1px solid #eee', padding: 8 }}>Qty</th>
              <th style={{ textAlign: 'right', borderBottom: '1px solid #eee', padding: 8 }}>Rate</th>
              <th style={{ textAlign: 'right', borderBottom: '1px solid #eee', padding: 8 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item: any, idx: number) => (
              <tr key={idx}>
                <td style={{ padding: 8 }}>{item.itemName}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{item.quantity}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{item.pricePerUnit}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{item.totalAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ textAlign: 'right', fontWeight: 600, fontSize: 18 }}>
          Total: ₹{invoice.totalAmount}
        </div>
        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <button onClick={() => window.print()} style={{ padding: '8px 18px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500, fontSize: 14 }}>Print</button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
