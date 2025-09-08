
import React, { useState, useEffect } from 'react';
import { createCategory, updateCategory } from './categoryApi';
import { getOrganizations } from '../../organization/organizationApi';
import { Category } from './types';
import { Organization } from '../../organization/types';

interface AddCategoryPageProps {
  onBack: () => void;
  editId?: string;
  editData?: Category;
}

const AddCategoryPage: React.FC<AddCategoryPageProps> = ({ onBack, editId, editData }) => {
  const [form, setForm] = useState<Category>({
    categoryId: '',
    categoryName: '',
    categoryDescription: '',
    status: 'active',
    organizationId: ''
  });
  const [error, setError] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    if (editData) {
      setForm(editData);
    }
  }, [editData]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const res = await getOrganizations();
        setOrganizations(res.data);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      }
    };
    fetchOrganizations();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId || !form.categoryName || !form.organizationId) {
      setError('Category ID, Name, and Organization are required');
      return;
    }
    if (editId) {
      await updateCategory(editId, form);
    } else {
      await createCategory(form);
    }
    setForm({ categoryId: '', categoryName: '', categoryDescription: '', status: 'active', organizationId: '' });
    onBack();
  };

  return (
    <div style={{ padding: '32px 0', background: '#f8f9fb', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontSize: 15, color: '#6c6c6c', marginBottom: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={onBack}>
          <span style={{ fontSize: 20, fontWeight: 600 }}>{'←'}</span> Back to Category
        </div>
        <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 8 }}>{editId ? 'Edit Category' : 'Add Category'}</h1>
        <div style={{ color: '#6c6c6c', marginBottom: 32 }}>{editId ? 'Edit the category details' : 'Add a new category to your inventory'}</div>
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px #e6e6e6', padding: 40, maxWidth: 900, margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Category Information</div>
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Category ID *</label>
                <input name="categoryId" placeholder="Enter category ID" value={form.categoryId} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Category Name *</label>
                <input name="categoryName" placeholder="Enter category name" value={form.categoryName} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500 }}>Description</label>
              <textarea name="categoryDescription" placeholder="Enter category description (optional)" value={form.categoryDescription} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4, minHeight: '80px' }} />
            </div>
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Status *</label>
                <select name="status" value={form.status} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Organization *</label>
                <select name="organizationId" value={form.organizationId} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }}>
                  <option value="">Select an organization</option>
                  {organizations.map(org => (
                    <option key={org._id} value={org._id}>
                      {org.organizationName} ({org.organizationId})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 32 }}>
              <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', color: '#6c3fc5', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ background: '#6c3fc5', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, padding: '10px 32px', cursor: 'pointer' }}>{editId ? 'Update Category' : 'Add Category'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryPage;
