
import React, { useEffect, useState } from 'react';
import { FaEye, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { getCategories, deleteCategory, getCategoryById, updateCategory } from './categoryApi';
import { Category } from './types';
import AddCategoryPage from './AddCategoryPage';


const CategoryModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const handleToggleStatus = async (cat: Category) => {
    const newStatus = cat.status === 'active' ? 'inactive' : 'active';
    await updateCategory(cat._id!, { status: newStatus });
    await fetchCategories();
  };
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Category | null>(null);

  const fetchCategories = async () => {
    let res;
    if (searchTerm.trim()) {
      setSearchLoading(true);
      res = await getCategories({ search: searchTerm });
      setSearchLoading(false);
    } else {
      res = await getCategories();
    }
    // Sort by createdAt descending (newest first)
    const sorted = (res.data as Category[]).sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setCategories(sorted);
  };


  // Modal state for viewing catalogue items
  const [modalCategoryId, setModalCategoryId] = useState<string | null>(null);
  const [modalCatalogues, setModalCatalogues] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const openCatalogueModal = async (categoryId: string) => {
    setModalLoading(true);
    setModalOpen(true);
    setModalCategoryId(categoryId);
    try {
      const { getCatalogues } = await import('../catalogue/catalogueApi');
      const res = await getCatalogues();
      setModalCatalogues(res.data.filter((item: any) => item.categoryId === categoryId));
    } catch {
      setModalCatalogues([]);
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [searchTerm]);

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, margin: 0 }}>Categories</h2>
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
        <button style={{ padding: '10px 28px', background: '#7c4dff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 17, cursor: 'pointer', boxShadow: '0 2px 8px #e6e6e6', whiteSpace: 'nowrap' }} onClick={() => setShowAdd(true)}>
          + Add Category
        </button>
      </div>
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
                    minWidth: 70,
                    display: 'inline-block',
                    textAlign: 'center',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    background: cat.status === 'active' ? '#e8f5e8' : '#ffebee',
                    color: cat.status === 'active' ? '#2e7d32' : '#c62828'
                  }}>
                    {cat.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: 14, display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button onClick={() => handleToggleStatus(cat)} title="Toggle Status" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {cat.status === 'active' ? <FaToggleOn size={26} color="#38a169" /> : <FaToggleOff size={26} color="#c62828" />}
                  </button>
                  <button onClick={() => openCatalogueModal(cat.categoryId)} title="View" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#7c4dff' }}>
                    <FaEye size={22} />
                  </button>
                  <button onClick={() => handleEdit(cat._id!)} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#2980b9' }}>
                    <FaEdit size={22} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal for catalogue items by category */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e6e6e6', padding: 32, minWidth: 700, maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
            <button style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#7c4dff', cursor: 'pointer' }} onClick={() => setModalOpen(false)}>&times;</button>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18 }}>Catalogue Items</h3>
            {modalLoading ? (
              <div>Loading...</div>
            ) : modalCatalogues.length === 0 ? (
              <div>No catalogue items found for this category.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ background: '#f5f6fa', color: '#222', fontWeight: 700, fontSize: 16 }}>
                    <th style={{ padding: 12, textAlign: 'left' }}>SKU</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Item Name</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Price</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {modalCatalogues.map(item => (
                    <tr key={item._id} style={{ borderBottom: '1px solid #f0f0f0', fontSize: 15 }}>
                      <td style={{ padding: 10 }}>{item.sku}</td>
                      <td style={{ padding: 10 }}>{item.itemName}</td>
                      <td style={{ padding: 10 }}>₹{item.price}</td>
                      <td style={{ padding: 10 }}>{item.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryModule;
