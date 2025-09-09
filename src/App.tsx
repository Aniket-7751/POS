import React from 'react';

import './App.css';

import POSInterface from './pages/POSInterface';
import LoginSelector from './components/LoginSelector';
import ResetPassword from './components/ResetPassword';

import OrganizationModule from './modules/organization/OrganizationModule';
import StoreModule from './modules/store/StoreModule';
import CategoryModule from './modules/inventory/category/CategoryModule';
import CatalogueModule from './modules/inventory/catalogue/CatalogueModule';

type Page = 'pos' | 'organization' | 'store' | 'inventory' | 'category' | 'catalogue';

interface User {
  id: string;
  name: string;
  email: string;
  userType: 'organization' | 'store';
  role: string;
  organization?: any;
  store?: any;
}

function App() {
  const [page, setPage] = React.useState<Page>('pos');
  const [user, setUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState<string | null>(localStorage.getItem('token'));
  const [resetToken, setResetToken] = React.useState<string | null>(null);

  // Set document title
  React.useEffect(() => {
    document.title = 'Suguna Chicken - POS System';
  }, []);

  // Check if user is logged in on app start
  React.useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    // Clear any corrupted data first
    if (storedUser === 'undefined' || storedUser === 'null') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userType');
      return;
    }
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userType');
      }
    }
  }, []);

  const handleLogin = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('userType', userData.userType);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userType');
  };

  // Check for reset password token in URL
  React.useEffect(() => {
    console.log('Current URL:', window.location.href);
    console.log('Current search params:', window.location.search);
    console.log('Current pathname:', window.location.pathname);
    
    let resetToken = null;
    
    // Try to get token from query parameters first
    const urlParams = new URLSearchParams(window.location.search);
    resetToken = urlParams.get('token');
    
    // If not found in query params, try to extract from pathname
    if (!resetToken && window.location.pathname.includes('/reset-password')) {
      const pathParams = new URLSearchParams(window.location.pathname.split('?')[1] || '');
      resetToken = pathParams.get('token');
    }
    
    console.log('Extracted token:', resetToken);
    
    if (resetToken) {
      console.log('Reset token found in URL:', resetToken);
      // Store the token for the reset password component
      localStorage.setItem('resetToken', resetToken);
      setResetToken(resetToken);
      // Clean up the URL - redirect to root
      window.history.replaceState({}, document.title, '/');
      console.log('Token stored in localStorage');
    } else {
      // Check if token exists in localStorage (for page refresh)
      const storedToken = localStorage.getItem('resetToken');
      if (storedToken && storedToken !== 'null' && storedToken !== 'undefined') {
        console.log('Reset token found in localStorage:', storedToken);
        setResetToken(storedToken);
      }
      console.log('No token found in URL');
    }
  }, []);

  // Show reset password if token is present
  if (resetToken && (!user || !token)) {
    return (
      <ResetPassword 
        token={resetToken} 
        onSuccess={() => {
          console.log('Reset password success callback called');
          localStorage.removeItem('resetToken');
          setResetToken(null);
          // Force re-render to show login page
        }} 
      />
    );
  }

  // Show login if not authenticated
  if (!user || !token) {
    return <LoginSelector onLogin={handleLogin} />;
  }
  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', display: 'flex' }}>
      <aside style={{ 
        width: 280, 
        background: '#1a1a1a', 
        color: '#fff',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        zIndex: 1000
      }}>
        {/* Header Section */}
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px' 
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(45deg, #e53e3e, #38a169)', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '20px' }}>🐔</span>
            </div>
            <div>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                color: '#e53e3e',
                lineHeight: '1.2'
              }}>
                SUGUNA CHICKEN
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#38a169',
                fontWeight: '500'
              }}>
                POS System
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Content */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          padding: '20px 0',
          overflowY: 'auto'
        }}>
          {/* Master Data Section */}
          <div style={{ 
            padding: '0 20px 10px 20px'
          }}>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              color: '#888', 
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '15px'
            }}>
              Master Data
            </div>

            <button style={{ 
              width: '100%', 
              margin: '0 0 8px 0', 
              padding: '12px 16px', 
              background: page==='organization' ? '#e53e3e' : 'transparent', 
              color: page==='organization' ? '#fff' : '#ccc', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '14px', 
              fontWeight: '500', 
              cursor: 'pointer', 
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'left'
            }} onClick={() => setPage('organization')}>
              <span style={{ fontSize: '16px' }}>🏢</span>
              Organization
            </button>
            <button style={{ 
              width: '100%', 
              margin: '0 0 8px 0', 
              padding: '12px 16px', 
              background: page==='store' ? '#e53e3e' : 'transparent', 
              color: page==='store' ? '#fff' : '#ccc', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '14px', 
              fontWeight: '500', 
              cursor: 'pointer', 
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'left'
            }} onClick={() => setPage('store')}>
              <span style={{ fontSize: '16px' }}>🏪</span>
              Store
            </button>
          </div>
          
          {/* Inventory Section */}
          <div style={{ 
            padding: '0 20px 10px 20px'
          }}>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              color: '#888', 
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '15px'
            }}>
              Inventory
            </div>
            <button style={{ 
              width: '100%', 
              margin: '0 0 8px 0', 
              padding: '12px 16px', 
              background: page==='category' ? '#e53e3e' : 'transparent', 
              color: page==='category' ? '#fff' : '#ccc', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '14px', 
              fontWeight: '500', 
              cursor: 'pointer', 
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'left'
            }} onClick={() => setPage('category')}>
              <span style={{ fontSize: '16px' }}>📂</span>
              Category
            </button>
            <button style={{ 
              width: '100%', 
              margin: '0 0 8px 0', 
              padding: '12px 16px', 
              background: page==='catalogue' ? '#e53e3e' : 'transparent', 
              color: page==='catalogue' ? '#fff' : '#ccc', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '14px', 
              fontWeight: '500', 
              cursor: 'pointer', 
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'left'
            }} onClick={() => setPage('catalogue')}>
              <span style={{ fontSize: '16px' }}>📦</span>
              Catalogue
            </button>
          </div>

          {/* POS Interface */}
          <div style={{ 
            padding: '0 20px 20px 20px'
          }}>
            <button style={{ 
              width: '100%', 
              margin: '0', 
              padding: '12px 16px', 
              background: page==='pos' ? '#e53e3e' : 'transparent', 
              color: page==='pos' ? '#fff' : '#ccc', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '14px', 
              fontWeight: '500', 
              cursor: 'pointer', 
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'left'
            }} onClick={() => setPage('pos')}>
              <span style={{ fontSize: '16px' }}>🛒</span>
              POS Interface
            </button>
          </div>
        </div>

        {/* User Info - Fixed at Bottom */}
        <div style={{ 
          padding: '20px',
          borderTop: '1px solid #333',
          background: '#1a1a1a'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(45deg, #e53e3e, #38a169)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '16px'
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#fff',
                marginBottom: '2px'
              }}>
                {user.name}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#888',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {user.userType === 'organization' ? 'Organization' : 'Store'} - {user.role}
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px',
                background: 'transparent',
                color: '#888',
                border: '1px solid #333',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background = '#e53e3e';
                target.style.color = '#fff';
                target.style.borderColor = '#e53e3e';
              }}
              onMouseOut={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background = 'transparent';
                target.style.color = '#888';
                target.style.borderColor = '#333';
              }}
            >
              Logout
            </button>
          </div>
          {(user.organization || user.store) && (
            <div style={{ 
              fontSize: '12px', 
              color: '#666',
              paddingLeft: '52px'
            }}>
              {user.organization ? user.organization.organizationName : user.store?.storeName}
            </div>
          )}
        </div>
      </aside>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '40px 20px', marginLeft: '280px', minHeight: '100vh', width: 'calc(100% - 280px)' }}>
        {page === 'pos' && <POSInterface />}
        {page === 'organization' && <OrganizationModule />}
        {page === 'store' && <StoreModule />}
  {page === 'category' && <CategoryModule />}
  {page === 'catalogue' && <CatalogueModule />}
      </main>
    </div>
  );
}

export default App;
