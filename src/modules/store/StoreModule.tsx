import React, { useEffect, useState } from 'react';
//import { getStores, updateStore, deleteStore } from './storeApi';
import storeAPI from './storeApi';   // ✅ import the object
import { Store } from './types';
import AddStorePage from './AddStorePage';

const StoreModule: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Store | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const fetchStores = async () => {
    //const res = await getStores();
    const res = await storeAPI.getAll(); // ✅ use methods from storeAPI
  setStores(res.data as Store[]);
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleEdit = (store: Store) => {
    setEditData(store);
    setEditingId(store._id!);
  };


  const handleDelete = async (id: string) => {
    //await deleteStore(id);
    await storeAPI.delete(id);
    fetchStores();
  };

  const handleEmailClick = (email: string, e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = `mailto:${email}`;
  };

  if (showAdd) {
    return <AddStorePage onBack={() => { setShowAdd(false); fetchStores(); }} />;
  }
  if (editingId && editData) {
    return <AddStorePage onBack={() => { setEditingId(null); setEditData(null); fetchStores(); }} editId={editingId} editData={editData} />;
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e6e6e6', padding: 24, width: 1100, margin: '40px auto' }}>
      <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 18 }}>Stores</h2>
      <button style={{ marginBottom: 18, padding: '10px 28px', background: '#7c4dff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 17, cursor: 'pointer', boxShadow: '0 2px 8px #e6e6e6' }} onClick={() => setShowAdd(true)}>
        + Add Store
      </button>
      <div style={{ width: '100%', height: 520, overflowY: 'auto', borderRadius: 10, border: '1px solid #f0f0f0', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: '#f5f6fa', color: '#222', fontWeight: 700, fontSize: 16 }}>
              <th style={{ padding: 16, textAlign: 'left', borderTopLeftRadius: 8 }}>Store Image</th>
              <th style={{ padding: 16, textAlign: 'left' }}>Store Name</th>
              <th style={{ padding: 16, textAlign: 'left' }}>Store ID</th>
              <th style={{ padding: 16, textAlign: 'left' }}>Location</th>
              <th style={{ padding: 16, textAlign: 'left' }}>Contact Person</th>
              <th style={{ padding: 16, textAlign: 'left' }}>Status</th>
              <th style={{ padding: 16, textAlign: 'left', borderTopRightRadius: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stores.map(store => {
              // console.log('Rendering store item:', store.storeName, 'image:', store.storePicture);
              const imageSource = store.storePicture && store.storePicture.startsWith('data:image') ? store.storePicture : `http://localhost:5000${store.storePicture}`;
              return (
                <tr key={store._id} style={{ borderBottom: '1px solid #f0f0f0', fontSize: 15 }}>
                  <td style={{ padding: 14 }}>
                    {store.storePicture ? (
                      <img
                        key={`${store._id}-${store.storePicture}`}
                        src={imageSource}
                        alt={store.storeName}
                        style={{
                          width: 50,
                          height: 50,
                          objectFit: 'cover',
                          borderRadius: 6,
                          border: '1px solid #ddd'
                        }}
                        onError={(e) => {
                          // console.log('Store image failed to load:', store.storePicture);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 50,
                        height: 50,
                        backgroundColor: '#f5f5f5',
                        borderRadius: 6,
                        border: '1px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        fontSize: 12
                      }}>
                        No Image
                      </div>
                    )}
                  </td>
                  <td style={{ padding: 14 }}>{store.storeName}</td>
                  <td style={{ padding: 14 }}>{store.storeId}</td>
                  <td style={{ padding: 14 }}>{store.storeLocation}</td>
                  <td style={{ padding: 14 }}>
                    {store.contactPersonName}<br />
                    <a href={`mailto:${store.email}`} onClick={e => handleEmailClick(store.email, e)} style={{ color: '#7c4dff', textDecoration: 'underline' }}>{store.email}</a><br />
                    {store.contactNumber}
                  </td>
                  <td style={{ padding: 14 }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      fontWeight: '600',
                      background: store.status === 'active' ? '#e8f5e8' : '#ffebee',
                      color: store.status === 'active' ? '#2e7d32' : '#c62828'
                    }}>
                      {store.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: 14 }}>
                    <button onClick={() => handleEdit(store)} style={{ background: 'none', border: 'none', color: '#6c3fc5', fontWeight: 600, cursor: 'pointer', marginRight: 8 }}>Edit</button>
                    <button onClick={() => handleDelete(store._id!)} style={{ background: 'none', border: 'none', color: '#e74c3c', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StoreModule;
