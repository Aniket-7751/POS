import React, { useEffect, useState } from 'react';
import { FaEdit, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { getStores, updateStore } from './storeApi';
import { Store } from './types';
import AddStorePage from './AddStorePage';

const StoreModule: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Store | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const fetchStores = async () => {
    const res = await getStores();
  setStores(res.data as Store[]);
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleEdit = (store: Store) => {
    setEditData(store);
    setEditingId(store._id!);
  };


  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggleStatus = async (store: Store) => {
    if (!store._id) return;
    setTogglingId(store._id);
    try {
      const newStatus = store.status === 'active' ? 'inactive' : 'active';
      await updateStore(store._id, { status: newStatus } as any);
      setStores(prev => prev.map(s => s._id === store._id ? { ...s, status: newStatus } as Store : s));
    } finally {
      setTogglingId(null);
    }
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
    <div style={{ minHeight: '100vh', background: '#f8f9fb', padding: 32 }}>
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 8, color: '#1a1a1a' }}>Stores</h1>
            <div style={{ color: '#6c6c6c', fontSize: 16 }}>Manage your store locations and details</div>
          </div>
          <button style={{ padding: '10px 28px', background: '#7c4dff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 17, cursor: 'pointer', boxShadow: '0 2px 8px #e6e6e6' }} onClick={() => setShowAdd(true)}>+ Add Store</button>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e6e6e6', padding: 0 }}>
          <div style={{ width: '100%', height: 520, overflowY: 'auto', borderRadius: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#374151', fontWeight: 700, fontSize: 13, letterSpacing: 0.2 }}>
              <th style={{ padding: 14, textAlign: 'left', borderTopLeftRadius: 8, width: 110 }}>Store Image</th>
              <th style={{ padding: 14, textAlign: 'left', width: 260 }}>Store Name</th>
              <th style={{ padding: 14, textAlign: 'left', width: 120 }}>Store ID</th>
              <th style={{ padding: 14, textAlign: 'left', width: 160 }}>Location</th>
              <th style={{ padding: 14, textAlign: 'left', width: 260 }}>Contact Person</th>
              <th style={{ padding: 14, textAlign: 'left', width: 120 }}>Status</th>
              <th style={{ padding: 14, textAlign: 'right', borderTopRightRadius: 8, width: 120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stores.map(store => {
              const defaultImg = '/suguna.png';
              let imageSrc: string = defaultImg;
              if (store.storePicture) {
                if (
                  store.storePicture.startsWith('data:image') ||
                  store.storePicture.startsWith('http') ||
                  store.storePicture.startsWith('/')
                ) {
                  imageSrc = store.storePicture;
                } else {
                  imageSrc = `http://localhost:5000${store.storePicture}`;
                }
              }
              return (
                <tr key={store._id} style={{ borderBottom: '1px solid #f0f0f0', fontSize: 14 }}>
                  <td style={{ padding: 14 }}>
                    <img
                      key={`${store._id}-${store.storePicture || 'default'}`}
                      src={imageSrc}
                      alt={store.storeName}
                      style={{
                        width: 50,
                        height: 50,
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '1px solid #ddd'
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = defaultImg;
                      }}
                    />
                  </td>
                  <td style={{ padding: 14, color: '#111827', fontWeight: 500 }}>{store.storeName}</td>
                  <td style={{ padding: 14 }}>{store.storeId}</td>
                  <td style={{ padding: 14 }}>{store.storeLocation}</td>
                  <td style={{ padding: 14 }}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{store.contactPersonName}</div>
                    <a href={`mailto:${store.email}`} onClick={e => handleEmailClick(store.email, e)} style={{ color: '#2563eb', textDecoration: 'none' }}>{store.email}</a><br />
                    <span style={{ color: '#6b7280' }}>{store.contactNumber}</span>
                  </td>
                  <td style={{ padding: 14 }}>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: 999, 
                      fontSize: 12,
                      fontWeight: 700,
                      background: store.status === 'active' ? '#22c55e' : '#ef4444',
                      color: '#ffffff',
                      display: 'inline-block'
                    }}>
                      {store.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: 14, textAlign: 'right', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button onClick={() => handleToggleStatus(store)} title="Toggle Status" style={{ background: 'none', border: 'none', cursor: togglingId === store._id ? 'not-allowed' : 'pointer', padding: 0 }}>
                      {togglingId === store._id ? (
                        <div style={{ width: 16, height: 16, border: '2px solid #e5e7eb', borderTop: '2px solid #7c4dff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      ) : (
                        store.status === 'active' ? <FaToggleOn size={26} color="#38a169" /> : <FaToggleOff size={26} color="#c62828" />
                      )}
                    </button>
                    <button onClick={() => handleEdit(store)} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#2980b9' }}>
                      <FaEdit size={22} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreModule;
