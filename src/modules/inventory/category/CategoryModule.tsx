
import React, { useEffect, useState } from 'react';
import { getCategories, deleteCategory, getCategoryById } from './categoryApi';
import { Category } from './types';
import AddCategoryPage from './AddCategoryPage';


const CategoryModule: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Category | null>(null);

  const fetchCategories = async () => {
    const res = await getCategories();
    setCategories(res.data as Category[]);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
    fetchCategories();
  };

  const handleEdit = async (id: string) => {
    const res = await getCategoryById(id);
    setEditData(res.data as Category);
    setEditId(id);
  };

  if (showAdd) {
    return <AddCategoryPage onBack={() => { setShowAdd(false); fetchCategories(); }} />;
  }
  if (editId && editData) {
    return <AddCategoryPage onBack={() => { setEditId(null); setEditData(null); fetchCategories(); }} editId={editId} editData={editData} />;
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e6e6e6', padding: 24, width: 1100, margin: '40px auto' }}>
      <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 18 }}>Categories</h2>
      <button style={{ marginBottom: 18, padding: '10px 28px', background: '#7c4dff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 17, cursor: 'pointer', boxShadow: '0 2px 8px #e6e6e6' }} onClick={() => setShowAdd(true)}>
        + Add Category
      </button>
      <div style={{ width: '100%', height: 520, overflowY: 'auto', borderRadius: 10, border: '1px solid #f0f0f0', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: '#f5f6fa', color: '#222', fontWeight: 700, fontSize: 16 }}>
              <th style={{ padding: 16, textAlign: 'left', borderTopLeftRadius: 8 }}>Category Name</th>
              <th style={{ padding: 16, textAlign: 'left' }}>Category ID</th>
              <th style={{ padding: 16, textAlign: 'left' }}>Description</th>
              <th style={{ padding: 16, textAlign: 'left' }}>Status</th>
              <th style={{ padding: 16, textAlign: 'left', borderTopRightRadius: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat._id} style={{ borderBottom: '1px solid #f0f0f0', fontSize: 15 }}>
                <td style={{ padding: 14 }}>{cat.categoryName}</td>
                <td style={{ padding: 14 }}>{cat.categoryId}</td>
                <td style={{ padding: 14 }}>{cat.categoryDescription || '-'}</td>
                <td style={{ padding: 14 }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    fontWeight: '600',
                    background: cat.status === 'active' ? '#e8f5e8' : '#ffebee',
                    color: cat.status === 'active' ? '#2e7d32' : '#c62828'
                  }}>
                    {cat.status.toUpperCase()}
                  </span>
                </td>
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

export default CategoryModule;
