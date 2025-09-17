import React, { useEffect, useState } from 'react';
import { FaEye, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { getCatalogues, deleteCatalogue, getCatalogueById } from './catalogueApi';
import { updateCatalogue } from './catalogueApi';
import { Catalogue } from './types';
import AddCataloguePage from './AddCataloguePage';
import BarcodeDisplay from '../../../components/BarcodeDisplay';

const CatalogueModule: React.FC = () => {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewCatalogue, setViewCatalogue] = useState<Catalogue | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const handleView = async (cat: Catalogue) => {
    setViewLoading(true);
    setViewModalOpen(true);
    try {
      const res = await getCatalogueById(cat._id!);
      setViewCatalogue(res.data as Catalogue);
    } catch (error) {
      setViewCatalogue(null);
    } finally {
      setViewLoading(false);
    }
  };
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const handleToggleStatus = async (cat: Catalogue) => {
    setStatusLoading(cat._id!);
    try {
      await updateCatalogue(cat._id!, { status: cat.status === 'active' ? 'inactive' : 'active' });
      fetchCatalogues();
    } finally {
      setStatusLoading(null);
    }
  };
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Catalogue | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCatalogues = async () => {
    setLoading(true);
    try {
      let res;
      if (searchTerm.trim()) {
        setSearchLoading(true);
        res = await getCatalogues({ search: searchTerm });
        setSearchLoading(false);
      } else {
        res = await getCatalogues();
      }
      // Sort by createdAt descending (newest first)
      const sorted = (res.data as Catalogue[]).sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setCatalogues(sorted);
    } catch (error) {
      console.error('Error fetching catalogues:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogues();
  }, [searchTerm]);

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
      setShowAdd(false); 
      setTimeout(() => {
        fetchCatalogues();
      }, 200);
    }} />;
  }
  if (editId && editData) {
    return <AddCataloguePage onBack={() => { 
      setEditId(null); 
      setEditData(null); 
      setTimeout(() => {
        fetchCatalogues();
      }, 200);
    }} editId={editId} editData={editData} />;
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e6e6e6', padding: 24, width: 1100, margin: '40px auto', position: 'relative' }}>
      {viewModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 400, boxShadow: '0 2px 12px #e6e6e6', position: 'relative' }}>
            <button onClick={() => setViewModalOpen(false)} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>×</button>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18 }}>Catalogue Details</h3>
            {viewLoading ? (
            <div>Loading...</div>
          ) : viewCatalogue ? (
            <div
              style={{
                width: '700px',
                height: 'auto',
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            >
              <h2 style={{ marginBottom: 16 }}>Catalogue Details</h2>
              <div
                style={{
                  flex: 1,
                  width: '100%',
                  overflowY: 'auto',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '18px',
                  marginBottom: 16,
                }}
              >
                <div>
                  <div><strong>SKU ID:</strong> {viewCatalogue.sku}</div>
                  <div><strong>Item ID:</strong> {viewCatalogue.itemId}</div>
                  <div><strong>Item Name:</strong> {viewCatalogue.itemName}</div>
                  <div><strong>Volume:</strong> {viewCatalogue.volumeOfMeasurement}</div>
                  <div><strong>Source of Origin:</strong> {viewCatalogue.sourceOfOrigin}</div>
                  <div><strong>Certification:</strong> {viewCatalogue.certification}</div>
                  <div><strong>Price:</strong> ₹{viewCatalogue.price}</div>
                  <div><strong>Stock:</strong> {viewCatalogue.stock}</div>
                  <div>
                    <strong>Barcode:</strong> {viewCatalogue.barcode}
                    {viewCatalogue.barcode && (
                      <div style={{ marginTop: 8 }}>
                        <BarcodeDisplay barcodeNumber={viewCatalogue.barcode} />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div><strong>Status:</strong> {viewCatalogue.status.toUpperCase()}</div>
                  <div><strong>Category ID:</strong> {viewCatalogue.categoryId}</div>
                  <div><strong>Organization ID:</strong> {viewCatalogue.organizationId}</div>
                  <div><strong>Expiry:</strong> {viewCatalogue.expiry}</div>
                  <div><strong>Created At:</strong> {viewCatalogue.createdAt}</div>
                  <div><strong>Updated At:</strong> {viewCatalogue.updatedAt}</div>
                  <div style={{ margin: '16px 0' }}>
                    <strong>Nutrition Value:</strong>
                    {viewCatalogue.nutritionValue ? (
                      <ul style={{ marginLeft: 16 }}>
                        <li>Calories: {viewCatalogue.nutritionValue.calories}</li>
                        <li>Protein: {viewCatalogue.nutritionValue.protein}g</li>
                        <li>Fat: {viewCatalogue.nutritionValue.fat}g</li>
                        <li>Carbs: {viewCatalogue.nutritionValue.carbs}g</li>
                        <li>Fiber: {viewCatalogue.nutritionValue.fiber}g</li>
                        <li>Sugar: {viewCatalogue.nutritionValue.sugar}g</li>
                        <li>Sodium: {viewCatalogue.nutritionValue.sodium}mg</li>
                      </ul>
                    ) : <span>Not available</span>}
                  </div>
                  {/* Show all images and highlight thumbnail */}
                  {viewCatalogue.images && Array.isArray(viewCatalogue.images) && viewCatalogue.images.length > 0 && (
                    <div style={{ margin: '16px 0' }}>
                      <strong>Images:</strong><br />
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                        {viewCatalogue.images.map((img, idx) => (
                          <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                            <img src={img} alt={`Catalogue ${idx + 1}`} style={{ maxWidth: 80, maxHeight: 80, borderRadius: 8, border: img === viewCatalogue.thumbnail ? '2px solid #6c3fc5' : '1px solid #ccc' }} />
                            {img === viewCatalogue.thumbnail && (
                              <span style={{ position: 'absolute', top: 4, right: 4, background: '#6c3fc5', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 6, fontSize: 13, color: '#6c3fc5' }}>✓ indicates selected thumbnail</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            ) : (
              <div>Unable to load catalogue details.</div>
            )}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 28 }}>Catalogue</h2>
          <input
            type="text"
            placeholder="Search by SKU ID or Item Name"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #ccc',
              fontSize: 16,
              minWidth: 260
            }}
          />
        </div>
        <button style={{ padding: '10px 28px', background: '#7c4dff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 17, cursor: 'pointer', boxShadow: '0 2px 8px #e6e6e6' }} onClick={() => setShowAdd(true)}>
          + Add Catalogue
        </button>
      </div>
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
              <th style={{ padding: 16, textAlign: 'center', borderTopRightRadius: 8, minWidth: 120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {catalogues.map(cat => (
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
                    minWidth: 70,
                    display: 'inline-block',
                    textAlign: 'center',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    backgroundColor: cat.status === 'active' ? '#e8f5e8' : '#ffebee',
                    color: cat.status === 'active' ? '#2e7d32' : '#c62828'
                  }}>
                    {cat.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: 14, display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center', height: '60px' }}>
                  <button 
                    onClick={() => handleToggleStatus(cat)} 
                    title="Toggle Status" 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', height: '100%' }}
                    disabled={statusLoading === cat._id}
                  >
                    {statusLoading === cat._id ? (
                      <span style={{
                        display: 'inline-block',
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        border: '2px solid #bbb',
                        borderTop: '2px solid #7c4dff',
                        animation: 'spin 1s linear infinite'
                      }} />
                    ) : (
                      cat.status === 'active' ? <FaToggleOn size={26} color="#38a169" /> : <FaToggleOff size={26} color="#c62828" />
                    )}
                  </button>
                  <button 
                    onClick={() => handleView(cat)} 
                    title="View" 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#7c4dff', display: 'flex', alignItems: 'center', height: '100%' }}
                  >
                    <FaEye size={22} />
                  </button>
                  <button 
                    onClick={() => handleEdit(cat._id!)} 
                    title="Edit" 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#2980b9', display: 'flex', alignItems: 'center', height: '100%' }}
                  >
                    <FaEdit size={22} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CatalogueModule;
