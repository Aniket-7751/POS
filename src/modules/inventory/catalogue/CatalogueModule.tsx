
import React, { useEffect, useState } from 'react';
import { getCatalogues, deleteCatalogue, getCatalogueById } from './catalogueApi';
import { Catalogue } from './types';
import AddCataloguePage from './AddCataloguePage';


const CatalogueModule: React.FC = () => {
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Catalogue | null>(null);

  const fetchCatalogues = async () => {
    const res = await getCatalogues();
    setCatalogues(res.data as Catalogue[]);
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
    return <AddCataloguePage onBack={() => { setShowAdd(false); fetchCatalogues(); }} />;
  }
  if (editId && editData) {
    return <AddCataloguePage onBack={() => { setEditId(null); setEditData(null); fetchCatalogues(); }} editId={editId} editData={editData} />;
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
              <th style={{ padding: 16, textAlign: 'left', borderTopLeftRadius: 8 }}>SKU ID</th>
              <th style={{ padding: 16, textAlign: 'left' }}>Item Name</th>
              <th style={{ padding: 16, textAlign: 'left' }}>Volume</th>
              <th style={{ padding: 16, textAlign: 'left' }}>Barcode</th>
              <th style={{ padding: 16, textAlign: 'left', borderTopRightRadius: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {catalogues.map(cat => (
              <tr key={cat._id} style={{ borderBottom: '1px solid #f0f0f0', fontSize: 15 }}>
                <td style={{ padding: 14 }}>{cat.sku}</td>
                <td style={{ padding: 14 }}>{cat.itemName}</td>
                <td style={{ padding: 14 }}>{cat.volumeOfMeasurement}</td>
                <td style={{ padding: 14 }}>{cat.barcode || '-'}</td>
                <td style={{ padding: 14 }}>
                  <button onClick={() => handleEdit(cat._id!)} style={{ background: 'none', border: 'none', color: '#2980b9', fontWeight: 600, cursor: 'pointer', marginRight: 12 }}>Edit</button>
                  <button onClick={() => handleDelete(cat._id!)} style={{ background: 'none', border: 'none', color: '#e74c3c', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
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
