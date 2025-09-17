
import React, { useEffect, useState } from 'react';
import { getOrganizations, updateOrganization, deleteOrganization } from './organizationApi';
import { Organization } from './types';
import AddOrganizationPage from './AddOrganizationPage';

const OrganizationModule: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Organization | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const res = await getOrganizations();
      setOrganizations(res.data);
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleEdit = (org: Organization) => {
    setEditData(org);
    setEditingId(org._id!);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteOrganization(id);
      // Optimistic update - remove from UI immediately
      setOrganizations(prev => prev.filter(org => org._id !== id));
    } catch (error) {
      console.error('Failed to delete organization:', error);
      // Refresh data if delete failed
      fetchOrganizations();
    } finally {
      setDeletingId(null);
    }
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
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
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
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#6c6c6c' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                      <div style={{ width: 20, height: 20, border: '2px solid #e5e7eb', borderTop: '2px solid #7c4dff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      Loading organizations...
                    </div>
                  </td>
                </tr>
              ) : organizations.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#6c6c6c' }}>
                    No organizations found
                  </td>
                </tr>
              ) : (
                organizations.map(org => (
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
                    <td style={{ padding: 14, textAlign: 'right' }}>
                      <button
                        onClick={() => handleEdit(org)}
                        title="Edit"
                        disabled={deletingId === org._id}
                        style={{ 
                          background: '#f3f4f6', 
                          border: '1px solid #e5e7eb', 
                          width: 32, 
                          height: 32, 
                          borderRadius: 6, 
                          cursor: deletingId === org._id ? 'not-allowed' : 'pointer', 
                          marginRight: 8,
                          opacity: deletingId === org._id ? 0.5 : 1
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(org._id!)}
                        title="Delete"
                        disabled={deletingId === org._id}
                        style={{ 
                          background: deletingId === org._id ? '#f9fafb' : '#fef2f2', 
                          border: deletingId === org._id ? '1px solid #e5e7eb' : '1px solid #fee2e2', 
                          width: 32, 
                          height: 32, 
                          borderRadius: 6, 
                          cursor: deletingId === org._id ? 'not-allowed' : 'pointer',
                          opacity: deletingId === org._id ? 0.5 : 1
                        }}
                      >
                        {deletingId === org._id ? (
                          <div style={{ width: 12, height: 12, border: '2px solid #e5e7eb', borderTop: '2px solid #ef4444', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        ) : (
                          '🗑️'
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrganizationModule;
