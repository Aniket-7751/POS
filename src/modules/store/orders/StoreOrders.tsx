
import React, { useEffect, useState } from 'react';
import { orderAPI } from '../../../api/orderApi';
import { getCatalogues } from '../../inventory/catalogue/catalogueApi';
import { Catalogue } from '../../inventory/catalogue/types';


const StoreOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogue, setCatalogue] = useState<Catalogue[]>([]);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    fetchCatalogue();
    fetchOrders();
  }, []);

  const fetchCatalogue = async () => {
    try {
      const res = await getCatalogues();
      setCatalogue(res.data.filter((item: Catalogue) => item.status === 'active'));
    } catch (err) {
      setCatalogue([]);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getMyOrders();
      setOrders(res.data);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async (item: Catalogue) => {
    let quantityStr = window.prompt(`Enter quantity for ${item.itemName}:`, '1');
    if (!quantityStr) return;
    let quantity = parseInt(quantityStr, 10);
    if (isNaN(quantity) || quantity < 1) {
      alert('Invalid quantity');
      return;
    }
    setPlacingOrder(true);
    try {
      await orderAPI.createOrder({ items: [{ sku: item.sku, itemName: item.itemName, quantity }] });
      fetchOrders();
      alert('Order placed!');
    } catch (err) {
      alert('Failed to place order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Catalogue Items</h2>
      {catalogue.length === 0 ? (
        <div>No catalogue items available.</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', marginBottom: 32, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f5f6fa' }}>
              <tr>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #eee', textAlign: 'left', fontWeight: 600, color: '#333' }}>Item Name</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #eee', textAlign: 'left', fontWeight: 600, color: '#333' }}>SKU</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #eee', textAlign: 'left', fontWeight: 600, color: '#333' }}>Price</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #eee', textAlign: 'center', fontWeight: 600, color: '#333' }}>Order</th>
              </tr>
            </thead>
            <tbody>
              {catalogue.map((item, idx) => (
                <tr key={item.sku} style={{ background: idx % 2 === 0 ? '#fff' : '#fafbfc', transition: 'background 0.2s' }}>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>{item.itemName}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>{item.sku}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>{item.price}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                    <button
                      onClick={() => handleOrder(item)}
                      disabled={placingOrder}
                      style={{ padding: '6px 18px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500, fontSize: 14, boxShadow: '0 1px 2px #eee' }}
                    >
                      Order
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <h3 style={{ marginTop: 40 }}>My Orders</h3>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
          <thead>
            <tr>
              <th>Items</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx}>{item.itemName} x {item.quantity}</div>
                  ))}
                </td>
                <td>{order.status}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StoreOrders;
