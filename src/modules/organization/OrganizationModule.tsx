
import React, { useEffect, useState } from 'react';
import { getOrganizations, updateOrganization, deleteOrganization } from './organizationApi';
import { Organization } from './types';
import AddOrganizationPage from './AddOrganizationPage';

const OrganizationModule: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Organization | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const fetchOrganizations = async () => {
    const res = await getOrganizations();
    setOrganizations(res.data);
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleEdit = (org: Organization) => {
    setEditData(org);
    setEditingId(org._id!);
  };

  const handleDelete = async (id: string) => {
    await deleteOrganization(id);
    fetchOrganizations();
  };

  const handleEmailClick = (email: string, e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = `mailto:${email}`;
  };

  if (showAdd) {
    return <AddOrganizationPage onBack={() => { setShowAdd(false); fetchOrganizations(); }} />;
  }
  if (editingId && editData) {
    return <AddOrganizationPage onBack={() => { setEditingId(null); setEditData(null); fetchOrganizations(); }} editId={editingId} editData={editData} />;
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e6e6e6', padding: 24, width: 1100, margin: '40px auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
        <h2 style={{ fontWeight: 700, fontSize: 28, margin: 0 }}>Organizations</h2>
        <button style={{ padding: '10px 28px', background: '#7c4dff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 17, cursor: 'pointer', boxShadow: '0 2px 8px #e6e6e6', whiteSpace: 'nowrap' }} onClick={() => setShowAdd(true)}>
          + Add Organization
        </button>
      </div>
      <div style={{ width: '100%', height: 520, overflowY: 'auto', borderRadius: 10, border: '1px solid #f0f0f0', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: '#f5f6fa', color: '#222', fontWeight: 700, fontSize: 16 }}>
              <th style={{ padding: 16, textAlign: 'left', borderTopLeftRadius: 8 }}>Organization Name</th>
              <th style={{ padding: 16, textAlign: 'left' }}>Organization ID</th>
              <th style={{ padding: 16, textAlign: 'left' }}>Contact Person</th>
              <th style={{ padding: 16, textAlign: 'left' }}>Phone</th>
              <th style={{ padding: 16, textAlign: 'left' }}>Email</th>
              <th style={{ padding: 16, textAlign: 'left' }}>GST Number</th>
              <th style={{ padding: 16, textAlign: 'left', borderTopRightRadius: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map(org => (
              <tr key={org._id} style={{ borderBottom: '1px solid #f0f0f0', fontSize: 15 }}>
                <td style={{ padding: 14 }}>{org.organizationName}</td>
                <td style={{ padding: 14 }}>{org.organizationId}</td>
                <td style={{ padding: 14 }}>{org.contactPersonName}</td>
                <td style={{ padding: 14 }}>{org.contactNumber}</td>
                <td style={{ padding: 14 }}>
                  <a href={`mailto:${org.email}`} onClick={e => handleEmailClick(org.email, e)} style={{ color: '#7c4dff', textDecoration: 'underline' }}>{org.email}</a>
                </td>
                <td style={{ padding: 14 }}>{org.gstNumber}</td>
                <td style={{ padding: 14 }}>
                  <button onClick={() => handleEdit(org)} style={{ background: 'none', border: 'none', color: '#6c3fc5', fontWeight: 600, cursor: 'pointer', marginRight: 8 }}>Edit</button>
                  <button onClick={() => handleDelete(org._id!)} style={{ background: 'none', border: 'none', color: '#e74c3c', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrganizationModule;
