
import React, { useEffect, useState } from 'react';
import { getCatalogues, deleteCatalogue, getCatalogueById } from './catalogueApi';
import { Catalogue } from './types';
import AddCataloguePage from './AddCataloguePage';
import BarcodeDisplay from '../../../components/BarcodeDisplay';


const CatalogueModule: React.FC = () => {
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Catalogue | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCatalogues = async () => {
    console.log('Fetching catalogues...');
    setLoading(true);
    try {
      const res = await getCatalogues();
      console.log('Catalogues fetched:', res.data);
      setCatalogues(res.data as Catalogue[]);
    } catch (error) {
      console.error('Error fetching catalogues:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogues();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteCatalogue(id);
    fetchCatalogues();
  };

  const handleEdit = async (id: string) => {
    const res = await getCatalogueById(id);
    setEditData(res.data as Catalogue);
    setEditId(id);
  };

  if (showAdd) {
    return <AddCataloguePage onBack={() => { 
      console.log('AddCataloguePage onBack called'); 
      setShowAdd(false); 
      // Add a small delay to ensure database is updated
      setTimeout(() => {
        fetchCatalogues();
      }, 200);
    }} />;
  }
  if (editId && editData) {
    return <AddCataloguePage onBack={() => { 
      console.log('EditCataloguePage onBack called'); 
      setEditId(null); 
      setEditData(null); 
      // Add a small delay to ensure database is updated
      setTimeout(() => {
        fetchCatalogues();
      }, 200);
    }} editId={editId} editData={editData} />;
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e6e6e6', padding: 24, width: 1100, margin: '40px auto' }}>
      <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 18 }}>Catalogue</h2>
      <button style={{ marginBottom: 18, padding: '10px 28px', background: '#7c4dff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 17, cursor: 'pointer', boxShadow: '0 2px 8px #e6e6e6' }} onClick={() => setShowAdd(true)}>
        + Add Catalogue
      </button>
      <div style={{ width: '100%', height: 520, overflowY: 'auto', borderRadius: 10, border: '1px solid #f0f0f0', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: '#f5f6fa', color: '#222', fontWeight: 700, fontSize: 16 }}>
              <th style={{ padding: 16, textAlign: 'left', borderTopLeftRadius: 8 }}>Thumbnail</th>
              <th style={{ padding: 16, textAlign: 'left' }}>SKU ID</th>
              <th style={{ padding: 16, textAlign: 'left' }}>Item Name</th>
              <th style={{ padding: 16, textAlign: 'left' }}>Volume</th>
              <th style={{ padding: 16, textAlign: 'left' }}>Price</th>
              <th style={{ padding: 16, textAlign: 'left' }}>Stock</th>
              <th style={{ padding: 16, textAlign: 'left' }}>Status</th>
              <th style={{ padding: 16, textAlign: 'left' }}>Barcode</th>
              <th style={{ padding: 16, textAlign: 'left', borderTopRightRadius: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {catalogues.map(cat => {
              console.log('Rendering catalogue item:', cat.itemName, 'thumbnail:', cat.thumbnail);
              return (
              <tr key={cat._id} style={{ borderBottom: '1px solid #f0f0f0', fontSize: 15 }}>
                <td style={{ padding: 14 }}>
                  {cat.thumbnail ? (
                    <img 
                      key={`${cat._id}-${cat.thumbnail}`}
                      src={cat.thumbnail.startsWith('data:image') ? cat.thumbnail : `http://localhost:5000${cat.thumbnail}`} 
                      alt={cat.itemName}
                      style={{ 
                        width: 50, 
                        height: 50, 
                        objectFit: 'cover', 
                        borderRadius: 6, 
                        border: '1px solid #ddd' 
                      }}
                      onError={(e) => {
                        console.log('Image failed to load:', cat.thumbnail);
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
                <td style={{ padding: 14 }}>{cat.sku}</td>
                <td style={{ padding: 14 }}>{cat.itemName}</td>
                <td style={{ padding: 14 }}>{cat.volumeOfMeasurement}</td>
                <td style={{ padding: 14 }}>₹{cat.price}</td>
                <td style={{ padding: 14 }}>{cat.stock}</td>
                <td style={{ padding: 14 }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: 4, 
                    fontSize: 12, 
                    fontWeight: 600,
                    backgroundColor: cat.status === 'active' ? '#d4edda' : '#f8d7da',
                    color: cat.status === 'active' ? '#155724' : '#721c24'
                  }}>
                    {cat.status}
                  </span>
                </td>
                <td style={{ padding: 14 }}>
                  {cat.barcode ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <BarcodeDisplay 
                        barcodeNumber={cat.barcode}
                        width={1.5}
                        height={40}
                        showText={false}
                        format="CODE128"
                      />
                      <div style={{ 
                        fontSize: '10px', 
                        color: '#666', 
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                        textAlign: 'center',
                        maxWidth: '120px'
                      }}>
                        {cat.barcode}
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: '#999', fontSize: '12px' }}>No barcode</span>
                  )}
                </td>
                <td style={{ padding: 14 }}>
                  <button onClick={() => handleEdit(cat._id!)} style={{ background: 'none', border: 'none', color: '#2980b9', fontWeight: 600, cursor: 'pointer', marginRight: 12 }}>Edit</button>
                  <button onClick={() => handleDelete(cat._id!)} style={{ background: 'none', border: 'none', color: '#e74c3c', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
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

export default CatalogueModule;
