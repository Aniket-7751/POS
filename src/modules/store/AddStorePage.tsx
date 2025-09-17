
import React, { useState, useEffect } from 'react';
import { createStore, updateStore } from './storeApi';
// import storeApi from './storeApi';
import { getOrganizations } from '../organization/organizationApi';
import { compressImage } from '../../utils/imageCompression';
import { Store, StoreCreationResponse } from './types';
import { Organization } from '../organization/types';

const initialState: Store = {
  storeName: '',
  storeLocation: '',
  storeAddress: '',
  contactPersonName: '',
  contactNumber: '',
  email: '',
  storePicture: '',
  status: 'active',
  organizationId: '',
  gstRate: 18,
};

interface AddStorePageProps {
  onBack: () => void;
  editId?: string;
  editData?: Store;
}

const AddStorePage: React.FC<AddStorePageProps> = ({ onBack, editId, editData }) => {
  const [form, setForm] = useState<Store>(initialState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    contactPersonName: '',
    contactNumber: '',
    email: '',
  });
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [storePicture, setStorePicture] = useState<File | null>(null);

  useEffect(() => {
    if (editData) {
      console.log('Setting form data from editData:', editData);
      setForm(editData);
    }
  }, [editData]);

  // Debug form state changes
  useEffect(() => {
    console.log('Form state changed:', form);
  }, [form]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        console.log('Fetching organizations...');
        setLoadingOrganizations(true);
        const res = await getOrganizations();
        console.log('Organizations response:', res);
        console.log('Organizations data:', res.data);
        setOrganizations(res.data as Organization[]);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        setError('Failed to load organizations. Please refresh the page.');
      } finally {
        setLoadingOrganizations(false);
      }
    };
    fetchOrganizations();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    let errorMsg = '';

    

    // if (name === 'storeId') {
    //   // Only allow alphanumeric
    //   if (/[^a-zA-Z0-9]/.test(value)) {
    //     errorMsg = 'Special characters not allowed';
    //     newValue = value.replace(/[^a-zA-Z0-9]/g, '');
    //   }
    // }


    if (name === 'contactPersonName') {
      if (/[^a-zA-Z\s]/.test(value)) {
        errorMsg = 'Only alphabets allowed';
        newValue = value.replace(/[^a-zA-Z\s]/g, '');
      }
    }
    if (name === 'contactNumber') {
      if (/[^0-9]/.test(value)) {
        errorMsg = 'Only integers allowed';
        newValue = value.replace(/[^0-9]/g, '');
      }
      newValue = newValue.slice(0, 10);
    }
    if (name === 'email') {
      if (/[^a-z0-9@\-_.+]/.test(value) || /[A-Z]/.test(value)) {
        errorMsg = 'Only lowercase letters, numbers, and @ - _ + . allowed';
        newValue = value.replace(/[^a-z0-9@\-_.+]/g, '').replace(/[A-Z]/g, '');
      }
    }
    if (name === 'gstRate') {
      console.log('Updating gstRate from', form.gstRate, 'to', Number(value));
      setForm({ ...form, gstRate: Number(value) });
      setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
      return;
    }

    setForm({ ...form, [name]: newValue });
    setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
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
    if (!/^[a-zA-Z\s]+$/.test(form.contactPersonName)) {
      setFieldErrors(prev => ({ ...prev, contactPersonName: 'Only alphabets allowed' }));
      return false;
    }
    if (!/^\d{10}$/.test(form.contactNumber)) {
      setFieldErrors(prev => ({ ...prev, contactNumber: 'Contact number must be 10 digits' }));
      return false;
    }
    if (!/^[a-z0-9@\-_.+]+$/.test(form.email)) {
      setFieldErrors(prev => ({ ...prev, email: 'Only lowercase letters, numbers, and @ - _ + . allowed' }));
      return false;
    }
    setError('');
    setFieldErrors({ contactPersonName: '', contactNumber: '', email: '' });
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setError('');
    setSuccess('');
    
    try {
      if (editId) {
        await updateStore(editId, form);
        setSuccess('Store updated successfully!');
      } else {
        const response = await createStore(form);
        const data: StoreCreationResponse = response.data;
        
        if (data.success) {
          setSuccess(`Store created successfully! Store ID: ${data.store.storeId}. ${data.emailSent ? 'Signup email sent to contact person.' : 'Email notification failed, but store was created.'}`);
        } else {
          setError(data.message || 'Failed to create store');
        }
      }
      
      // Reset form after successful creation/update
      setTimeout(() => {
        setForm(initialState);
        setStorePicture(null);
        onBack();
      }, 2000);
    } catch (err: any) {
      console.error('Store operation error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred');
    }
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
                <label style={{ fontWeight: 500 }}>Store Name <span style={{ color: 'red' }}>*</span></label>
                <input name="storeName" placeholder="Enter store name" value={form.storeName} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Store ID</label>
                <input disabled placeholder="Auto-generated (STORE0001, STORE0002...)" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e0e0e0', marginTop: 4, background: '#f5f5f5', color: '#666' }} />
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Store ID will be automatically generated</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Location <span style={{ color: 'red' }}>*</span></label>
                <input name="storeLocation" placeholder="Enter store location" value={form.storeLocation} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Address <span style={{ color: 'red' }}>*</span></label>
                <input name="storeAddress" placeholder="Enter store address" value={form.storeAddress} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Point of Contact</div>
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Contact Name <span style={{ color: 'red' }}>*</span></label>
                <input name="contactPersonName" placeholder="Enter contact name" value={form.contactPersonName} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                {fieldErrors.contactPersonName && <div style={{ color: 'red', fontSize: 13 }}>{fieldErrors.contactPersonName}</div>}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Contact Number <span style={{ color: 'red' }}>*</span></label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, background: '#f5f5f5', color: '#6c3fc5', fontWeight: 600 }}>+91</span>
                  <input name="contactNumber" placeholder="Enter contact number" value={form.contactNumber} onChange={handleChange} required maxLength={10} style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                </div>
                {fieldErrors.contactNumber && <div style={{ color: 'red', fontSize: 13 }}>{fieldErrors.contactNumber}</div>}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Email <span style={{ color: 'red' }}>*</span></label>
                <input name="email" placeholder="Enter email" value={form.email} onChange={handleChange} required type="text" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                {fieldErrors.email && <div style={{ color: 'red', fontSize: 13 }}>{fieldErrors.email}</div>}
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
                <select 
                  name="organizationId" 
                  value={form.organizationId} 
                  onChange={handleChange} 
                  required 
                  disabled={loadingOrganizations}
                  style={{ 
                    width: '100%', 
                    padding: 10, 
                    borderRadius: 6, 
                    border: '1px solid #ccc', 
                    marginTop: 4,
                    background: loadingOrganizations ? '#f5f5f5' : 'white',
                    color: loadingOrganizations ? '#666' : 'black'
                  }}
                >
                  <option value="">
                    {loadingOrganizations ? 'Loading organizations...' : 'Select an organization'}
                  </option>
                  {organizations.map(org => (
                    <option key={org._id} value={org._id}>
                      {org.organizationName} ({org.organizationId})
                    </option>
                  ))}
                </select>
                {loadingOrganizations && (
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    Loading organizations...
                  </div>
                )}
                {!loadingOrganizations && organizations.length === 0 && (
                  <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>
                    No organizations found. Please create an organization first.
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>GST Rate (%) <span style={{ color: 'red' }}>*</span></label>
                <input 
                  name="gstRate" 
                  type="number" 
                  min={0} 
                  max={100} 
                  step={0.01}
                  value={form.gstRate ?? 18} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. 18 or 12.5"
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} 
                />
                <div style={{ fontSize: 12, color: '#6c6c6c', marginTop: 6 }}>Enter GST percentage for this store; used for POS, sales and invoices.</div>
              </div>
            </div>
            {error && (
              <div style={{ 
                background: '#fef2f2', 
                border: '1px solid #fecaca',
                color: '#dc2626', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                marginBottom: '16px',
                fontSize: '14px',
                textAlign: 'center',
                fontWeight: '500'
              }}>
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div style={{ 
                background: '#f0fff4', 
                border: '1px solid #bbf7d0',
                color: '#16a34a', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                marginBottom: '16px',
                fontSize: '14px',
                textAlign: 'center',
                fontWeight: '500'
              }}>
                ✅ {success}
              </div>
            )}
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
