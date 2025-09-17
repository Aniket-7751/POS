
import React, { useState, useEffect } from 'react';
import { createOrganization, updateOrganization } from './organizationApi';
import { compressImage } from '../../utils/imageCompression';
import { Organization } from './types';

const initialState: Organization = {
  organizationId: '',
  organizationName: '',
  address: '',
  contactPersonName: '',
  contactNumber: '',
  email: '',
  gstNumber: '',
  panNumber: '',
  logo: '',
};

interface AddOrganizationPageProps {
  onBack: () => void;
  editId?: string;
  editData?: Organization;
}

const AddOrganizationPage: React.FC<AddOrganizationPageProps> = ({ onBack, editId, editData }) => {
  const [form, setForm] = useState<Organization>(initialState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (editData) {
      setForm(editData);
    }
  }, [editData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    let errorMsg = '';

    if (name === 'organizationId') {
      // Only allow alphanumeric (no special characters)
      if (/[^a-zA-Z0-9]/.test(value)) {
        errorMsg = 'Special characters not allowed';
        newValue = value.replace(/[^a-zA-Z0-9]/g, '');
      }
    }
    if (name === 'contactNumber') {
      // Only allow digits, max 10
      if (/[^0-9]/.test(value)) {
        errorMsg = 'Only integers allowed';
        newValue = value.replace(/[^0-9]/g, '');
      }
      newValue = newValue.slice(0, 10);
    }
    if (name === 'contactPersonName') {
      // Only allow alphabets and spaces
      if (/[^a-zA-Z\s]/.test(value)) {
        errorMsg = 'Only alphabets allowed';
        newValue = value.replace(/[^a-zA-Z\s]/g, '');
      }
    }
    if (name === 'panNumber') {
      // Only allow uppercase letters and numbers
      if (/[^A-Z0-9]/.test(value) || /[a-z]/.test(value)) {
        errorMsg = 'Special character and lowercase letters are not allowed';
        newValue = value.replace(/[^A-Z0-9]/g, '').replace(/[a-z]/g, '');
      }
    }
    if (name === 'gstNumber') {
      // Only allow uppercase letters and numbers
      if (/[^A-Z0-9]/.test(value) || /[a-z]/.test(value)) {
        errorMsg = 'Special character and lowercase letters are not allowed';
        newValue = value.replace(/[^A-Z0-9]/g, '').replace(/[a-z]/g, '');
      }
    }
    if (name === 'email') {
      // Only allow lowercase, @ - _ + .
      if (/[^a-z0-9@\-_.+]/.test(value) || /[A-Z]/.test(value)) {
        errorMsg = 'Only lowercase letters, numbers, and @  -  _  +  . are allowed';
        newValue = value.replace(/[^a-z0-9@\-_.+]/g, '').replace(/[A-Z]/g, '');
      }
    }

  setForm({ ...form, [name]: newValue });
  setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('Logo file selected:', file.name, file.size, file.type);
      
      setLogoFile(file);
      
      try {
        console.log(`Compressing logo: ${file.name}, original size: ${(file.size / 1024).toFixed(2)}KB`);
        const compressedBase64 = await compressImage(file, 100);
        console.log(`Compressed logo size: ${(compressedBase64.length * 0.75 / 1024).toFixed(2)}KB`);
        setForm(prev => ({ ...prev, logo: compressedBase64 }));
      } catch (error) {
        console.error('Error compressing logo:', error);
        // Fallback to original method if compression fails
        const reader = new FileReader();
        reader.onloadend = () => {
          setForm(prev => ({ ...prev, logo: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const requiredMessages: Record<string, string> = {
    organizationName: 'Organization name is required',
    organizationId: 'Organization ID is required',
    address: 'Address is required',
    contactPersonName: 'Contact person name is required',
    contactNumber: 'Contact number is required',
    email: 'Email is required',
    gstNumber: 'GST number is required',
    panNumber: 'PAN number is required',
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let msg = '';
    if (!value || value.trim() === '') {
      msg = requiredMessages[name] || 'Required';
    } else {
      if (name === 'organizationId' && !/^[a-zA-Z0-9]+$/.test(value)) msg = 'Special characters not allowed';
      if (name === 'contactNumber' && !/^\d{10}$/.test(value)) msg = 'Phone must be 10 digits';
      if (name === 'contactPersonName' && !/^[a-zA-Z\s]+$/.test(value)) msg = 'Only alphabets allowed';
      if (name === 'panNumber' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) msg = 'PAN Number must be in valid format (e.g., AAAAA0000A)';
      if (name === 'gstNumber' && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) msg = 'GST Number must be in valid format (e.g., 22AAAAA0000A1Z5)';
      if (name === 'email' && !/^[a-z0-9@\-_.+]+$/.test(value)) msg = 'Only lowercase letters, numbers, and @ - _ + . allowed';
    }
    setFieldErrors(prev => ({ ...prev, [name]: msg }));
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    Object.keys(requiredMessages).forEach((field) => {
      const value = (form as any)[field];
      if (!value || String(value).trim() === '') {
        errors[field] = requiredMessages[field];
      }
    });
    if (form.organizationId && !/^[a-zA-Z0-9]+$/.test(form.organizationId)) errors.organizationId = 'Special characters not allowed';
    if (form.contactNumber && !/^\d{10}$/.test(form.contactNumber)) errors.contactNumber = 'Phone must be 10 digits';
    if (form.contactPersonName && !/^[a-zA-Z\s]+$/.test(form.contactPersonName)) errors.contactPersonName = 'Only alphabets allowed';
    if (form.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber)) errors.panNumber = 'PAN Number must be in valid format (e.g., AAAAA0000A)';
    if (form.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNumber)) errors.gstNumber = 'GST Number must be in valid format (e.g., 22AAAAA0000A1Z5)';
    if (form.email && !/^[a-z0-9@\-_.+]+$/.test(form.email)) errors.email = 'Only lowercase letters, numbers, and @ - _ + . allowed';

    setFieldErrors(errors);
    setError('');
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setError('');
    setSuccess('');
    
    console.log('Form submission started:', { editId, form });
    
    try {
      if (editId) {
        console.log('Calling updateOrganization API with:', { editId, form });
        await updateOrganization(editId, form);
        console.log('Update successful');
        setSuccess('Organization updated successfully!');
      } else {
        console.log('Calling createOrganization API with:', form);
        await createOrganization(form);
        console.log('Create successful');
        setSuccess('Organization added successfully!');
      }
      
      // Reset form after successful creation/update
      setTimeout(() => {
        setForm(initialState);
        setLogoFile(null);
        onBack();
      }, 2000);
    } catch (error) {
      console.error('API call failed:', error);
      setError('Failed to save organization. Please try again.');
    }
  };

  return (
    <div style={{ padding: '32px 0', background: '#f8f9fb', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontSize: 15, color: '#6c6c6c', marginBottom: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={onBack}>
          <span style={{ fontSize: 20, fontWeight: 600 }}>{'←'}</span> Back to Organization
        </div>
        <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 8 }}>{editId ? 'Edit Organization' : 'Add Organization'}</h1>
        <div style={{ color: '#6c6c6c', marginBottom: 32 }}>{editId ? 'Edit the organization details' : 'Add a new organization to your POS system'}</div>
        
        {success && (
          <div style={{ 
            background: '#f0f9f0', 
            border: '1px solid #4caf50', 
            borderRadius: 8, 
            padding: '12px 16px', 
            marginBottom: 24, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12,
            maxWidth: 900,
            margin: '0 auto 24px auto'
          }}>
            <div style={{ 
              width: 20, 
              height: 20, 
              background: '#4caf50', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
              </svg>
            </div>
            <span style={{ color: '#2e7d32', fontWeight: 500 }}>{success}</span>
          </div>
        )}
        
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px #e6e6e6', padding: 40, maxWidth: 900, margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Company Information</div>
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Organization Name <span style={{ color: 'red' }}>*</span></label>
                <input name="organizationName" placeholder="Enter organization name" value={form.organizationName} onChange={handleChange} onBlur={handleBlur} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                {fieldErrors.organizationName && <div style={{ color: 'red', fontSize: 13 }}>{fieldErrors.organizationName}</div>}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Organization ID <span style={{ color: 'red' }}>*</span></label>
                <input name="organizationId" placeholder="Enter organization ID" value={form.organizationId} onChange={handleChange} onBlur={handleBlur} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                {fieldErrors.organizationId && <div style={{ color: 'red', fontSize: 13 }}>{fieldErrors.organizationId}</div>}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 500 }}>Address <span style={{ color: 'red' }}>*</span></label>
              <input name="address" placeholder="Enter organization address" value={form.address} onChange={handleChange} onBlur={handleBlur} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              {fieldErrors.address && <div style={{ color: 'red', fontSize: 13 }}>{fieldErrors.address}</div>}
            </div>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Contact Information</div>
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Contact Person Name <span style={{ color: 'red' }}>*</span></label>
                <input name="contactPersonName" placeholder="Enter contact person name" value={form.contactPersonName} onChange={handleChange} onBlur={handleBlur} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                {fieldErrors.contactPersonName && <div style={{ color: 'red', fontSize: 13 }}>{fieldErrors.contactPersonName}</div>}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Contact Number <span style={{ color: 'red' }}>*</span></label>
                <input name="contactNumber" placeholder="Phone (10 digits)" value={form.contactNumber} onChange={handleChange} onBlur={handleBlur} required maxLength={10} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                {fieldErrors.contactNumber && <div style={{ color: 'red', fontSize: 13 }}>{fieldErrors.contactNumber}</div>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Email <span style={{ color: 'red' }}>*</span></label>
                <input name="email" placeholder="Enter organization email" value={form.email} onChange={handleChange} onBlur={handleBlur} required type="text" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                {fieldErrors.email && <div style={{ color: 'red', fontSize: 13 }}>{fieldErrors.email}</div>}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Logo</label>
                <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'block', marginTop: 4 }} />
                {form.logo && (
                  <img 
                    src={form.logo} 
                    alt="Logo Preview" 
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
            </div>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Tax Information</div>
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>GST Number <span style={{ color: 'red' }}>*</span></label>
                <input name="gstNumber" placeholder="e.g., 22AAAAA0000A1Z5" value={form.gstNumber} onChange={handleChange} onBlur={handleBlur} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                {fieldErrors.gstNumber && <div style={{ color: 'red', fontSize: 13 }}>{fieldErrors.gstNumber}</div>}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>PAN Number <span style={{ color: 'red' }}>*</span></label>
                <input name="panNumber" placeholder="e.g., AAAAA0000A" value={form.panNumber} onChange={handleChange} onBlur={handleBlur} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                {fieldErrors.panNumber && <div style={{ color: 'red', fontSize: 13 }}>{fieldErrors.panNumber}</div>}
              </div>
            </div>
            {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 32 }}>
              <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', color: '#6c3fc5', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ background: '#6c3fc5', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, padding: '10px 32px', cursor: 'pointer' }}>{editId ? 'Update Organization' : 'Add Organization'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddOrganizationPage;
