
import React, { useState, useEffect } from 'react';
import { createStore, updateStore } from './storeApi';
import { getOrganizations } from '../organization/organizationApi';
import { compressImage } from '../../utils/imageCompression';
import { Store } from './types';
import { Organization } from '../organization/types';

const initialState: Store = {
  storeId: '',
  storeName: '',
  storeLocation: '',
  storeAddress: '',
  contactPersonName: '',
  contactNumber: '',
  email: '',
  storePicture: '',
  status: 'active',
  organizationId: '',
};

interface AddStorePageProps {
  onBack: () => void;
  editId?: string;
  editData?: Store;
}

const AddStorePage: React.FC<AddStorePageProps> = ({ onBack, editId, editData }) => {
  const [form, setForm] = useState<Store>(initialState);
  const [error, setError] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [storePicture, setStorePicture] = useState<File | null>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'contactNumber' ? value.slice(0, 10) : value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('Store picture file selected:', file.name, file.size, file.type);
      
      setStorePicture(file);
      
      try {
        console.log(`Compressing store image: ${file.name}, original size: ${(file.size / 1024).toFixed(2)}KB`);
        const compressedBase64 = await compressImage(file, 100);
        console.log(`Compressed store image size: ${(compressedBase64.length * 0.75 / 1024).toFixed(2)}KB`);
        setForm(prev => ({ ...prev, storePicture: compressedBase64 }));
      } catch (error) {
        console.error('Error compressing store image:', error);
        // Fallback to original method if compression fails
        const reader = new FileReader();
        reader.onloadend = () => {
          setForm(prev => ({ ...prev, storePicture: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const validate = () => {
    if (!/^\d{10}$/.test(form.contactNumber)) {
      setError('Contact number must be 10 digits');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (editId) {
      await updateStore(editId, form);
    } else {
      await createStore(form);
    }
    setForm(initialState);
    setStorePicture(null);
    onBack();
  };

  return (
    <div style={{ padding: '32px 0', background: '#f8f9fb', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontSize: 15, color: '#6c6c6c', marginBottom: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={onBack}>
          <span style={{ fontSize: 20, fontWeight: 600 }}>{'←'}</span> Back to Store
        </div>
        <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 8 }}>{editId ? 'Edit Store' : 'Add Store'}</h1>
        <div style={{ color: '#6c6c6c', marginBottom: 32 }}>{editId ? 'Edit the store details' : 'Add a new store to your POS system'}</div>
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px #e6e6e6', padding: 40, maxWidth: 900, margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Store Information</div>
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Store Name *</label>
                <input name="storeName" placeholder="Enter store name" value={form.storeName} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Store ID *</label>
                <input name="storeId" placeholder="Enter store ID" value={form.storeId} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Location *</label>
                <input name="storeLocation" placeholder="Enter store location" value={form.storeLocation} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Address *</label>
                <input name="storeAddress" placeholder="Enter store address" value={form.storeAddress} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Point of Contact</div>
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Contact Name *</label>
                <input name="contactPersonName" placeholder="Enter contact name" value={form.contactPersonName} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Contact Number *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, background: '#f5f5f5', color: '#6c3fc5', fontWeight: 600 }}>+91</span>
                  <input name="contactNumber" placeholder="Enter contact number" value={form.contactNumber} onChange={handleChange} required maxLength={10} style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Email *</label>
                <input name="email" placeholder="Enter email" value={form.email} onChange={handleChange} required type="email" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Store Picture</label>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'block', marginTop: 4 }} />
                {form.storePicture && (
                  <img 
                    src={form.storePicture} 
                    alt="Store Preview" 
                    style={{ 
                      width: 100, 
                      height: 100, 
                      objectFit: 'cover', 
                      marginTop: 8, 
                      borderRadius: 6,
                      border: '1px solid #ddd'
                    }} 
                  />
                )}
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
              <button type="submit" style={{ background: '#6c3fc5', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, padding: '10px 32px', cursor: 'pointer' }}>{editId ? 'Update Store' : 'Add Store'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStorePage;
