
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
    <div style={{ minHeight: '100vh', background: '#f8f9fb', padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 8, color: '#1a1a1a' }}>Organizations</h1>
          <div style={{ color: '#6c6c6c', fontSize: 16 }}>Manage your organization data and settings</div>
        </div>
        <button style={{ padding: '10px 16px', background: '#7c4dff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} onClick={() => setShowAdd(true)}>
          + Add Organization
        </button>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e6e6e6', overflow: 'hidden' }}>
        <div style={{ width: '100%', height: 520, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: '#f8f9fa', color: '#374151', fontWeight: 700, fontSize: 13, letterSpacing: 0.2 }}>
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
                <tr key={org._id} style={{ borderBottom: '1px solid #f1f3f4', fontSize: 14 }}>
                  <td style={{ padding: 14 }}>{org.organizationName}</td>
                  <td style={{ padding: 14 }}>{org.organizationId}</td>
                  <td style={{ padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: '#6d4cff',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700
                      }}>
                        {(() => {
                          const name = (org.contactPersonName || '').trim();
                          const parts = name.split(/\s+/).filter(Boolean);
                          const initials = (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
                          return initials.toUpperCase();
                        })()}
                      </div>
                      <span>{org.contactPersonName}</span>
                    </div>
                  </td>
                  <td style={{ padding: 14 }}>{org.contactNumber}</td>
                  <td style={{ padding: 14 }}>
                    <a href={`mailto:${org.email}`} onClick={e => handleEmailClick(org.email, e)} style={{ color: '#2563eb', textDecoration: 'none' }}>{org.email}</a>
                  </td>
                  <td style={{ padding: 14 }}>{org.gstNumber}</td>
                  <td style={{ padding: 14, textAlign: 'center' }}>
                    <button
                      onClick={() => handleEdit(org)}
                      title="Edit"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: 14, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="#6b7280" strokeWidth="1.5" fill="none"/>
                        <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#6b7280"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(org._id!)}
                      title="Delete"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 7h12" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="#6b7280" strokeWidth="1.5"/>
                        <path d="M8 7h8l-1 12a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2L8 7z" stroke="#6b7280" strokeWidth="1.5" fill="none"/>
                        <path d="M10 11v6M14 11v6" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrganizationModule;
