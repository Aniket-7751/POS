
import React, { useState, useEffect } from 'react';
import { createOrganization, updateOrganization } from './organizationApi';
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

  useEffect(() => {
    if (editData) {
      setForm(editData);
    }
  }, [editData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'contactNumber' ? value.slice(0, 10) : value });
  };

  const validate = () => {
    if (!/^\d{10}$/.test(form.contactNumber)) {
      setError('Phone must be 10 digits');
      return false;
    }
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNumber)) {
      setError('GST Number must be in valid format (e.g., 22AAAAA0000A1Z5)');
      return false;
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber)) {
      setError('PAN Number must be in valid format (e.g., AAAAA0000A)');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (editId) {
      await updateOrganization(editId, form);
    } else {
      await createOrganization(form);
    }
    setForm(initialState);
    onBack();
  };

  return (
    <div style={{ padding: '32px 0', background: '#f8f9fb', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontSize: 15, color: '#6c6c6c', marginBottom: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={onBack}>
          <span style={{ fontSize: 20, fontWeight: 600 }}>{'←'}</span> Back to Organization
        </div>
        <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 8 }}>{editId ? 'Edit Organization' : 'Add Organization'}</h1>
        <div style={{ color: '#6c6c6c', marginBottom: 32 }}>{editId ? 'Edit the organization details' : 'Add a new organization to your POS system'}</div>
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px #e6e6e6', padding: 40, maxWidth: 900, margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Company Information</div>
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Organization Name *</label>
                <input name="organizationName" placeholder="Enter organization name" value={form.organizationName} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Organization ID *</label>
                <input name="organizationId" placeholder="Enter organization ID" value={form.organizationId} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 500 }}>Address *</label>
              <input name="address" placeholder="Enter organization address" value={form.address} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Contact Information</div>
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Contact Person Name *</label>
                <input name="contactPersonName" placeholder="Enter contact person name" value={form.contactPersonName} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Contact Number *</label>
                <input name="contactNumber" placeholder="Phone (10 digits)" value={form.contactNumber} onChange={handleChange} required maxLength={10} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Email *</label>
                <input name="email" placeholder="Enter organization email" value={form.email} onChange={handleChange} required type="email" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Logo URL</label>
                <input name="logo" placeholder="Enter logo URL (optional)" value={form.logo} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Tax Information</div>
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>GST Number *</label>
                <input name="gstNumber" placeholder="e.g., 22AAAAA0000A1Z5" value={form.gstNumber} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>PAN Number *</label>
                <input name="panNumber" placeholder="e.g., AAAAA0000A" value={form.panNumber} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
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
