import React, { useEffect, useState } from 'react';
import { getCatalogues } from './catalogueApi';
import { Catalogue } from './types';

const BarcodeList: React.FC = () => {
  const [catalogue, setCatalogue] = useState<Catalogue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCatalogue();
  }, []);

  const fetchCatalogue = async () => {
    try {
      const res = await getCatalogues();
      setCatalogue(res.data.filter((item: Catalogue) => item.status === 'active'));
    } catch (err) {
      setCatalogue([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (barcode: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head><title>Print Barcode</title></head>
        <body style="display:flex;align-items:center;justify-content:center;height:100vh;">
          <div style="text-align:center;">
            <img src='https://barcode.tec-it.com/barcode.ashx?data=${barcode}&code=Code128&translate-esc=false' alt='Barcode' />
            <div style="margin-top:8px;font-size:18px;">${barcode}</div>
          </div>
          <script>window.onload = function() { window.print(); window.close(); };</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Catalogue Barcodes</h2>
      {loading ? (
        <div>Loading...</div>
      ) : catalogue.length === 0 ? (
        <div>No catalogue items available.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', marginTop: 12 }}>
          <thead style={{ background: '#f5f6fa' }}>
            <tr>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #eee', textAlign: 'left', fontWeight: 600 }}>Item Name</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #eee', textAlign: 'left', fontWeight: 600 }}>SKU</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #eee', textAlign: 'left', fontWeight: 600 }}>Barcode</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #eee', textAlign: 'center', fontWeight: 600 }}>Print</th>
            </tr>
          </thead>
          <tbody>
            {catalogue.map((item, idx) => (
              <tr key={item.sku} style={{ background: idx % 2 === 0 ? '#fff' : '#fafbfc' }}>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>{item.itemName}</td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>{item.sku}</td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>{item.barcode || <span style={{ color: '#aaa' }}>N/A</span>}</td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                  {item.barcode ? (
                    <button
                      onClick={() => handlePrint(item.barcode!)}
                      style={{ padding: '6px 14px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}
                    >Print Barcode</button>
                  ) : (
                    <span style={{ color: '#aaa', fontSize: 13 }}>No Barcode</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BarcodeList;
