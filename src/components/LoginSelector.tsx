import React, { useState } from 'react';
import { authAPI } from '../api';

interface LoginSelectorProps {
  onLogin: (user: any, token: string) => void;
}

const LoginSelector: React.FC<LoginSelectorProps> = ({ onLogin }) => {
  const [loginType, setLoginType] = useState<'organization' | 'store'>('organization');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (loginType === 'organization') {
        response = await authAPI.organizationLogin({ email, password });
      } else {
        response = await authAPI.storeLogin({ email, password });
      }
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      onLogin(user, token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        background: '#fff', 
        padding: '40px', 
        borderRadius: '16px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)', 
        maxWidth: '450px', 
        width: '100%',
        margin: '20px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: '15px' 
          }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              background: 'linear-gradient(45deg, #e53e3e, #38a169)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginRight: '15px'
            }}>
              <span style={{ fontSize: '24px' }}>🐔</span>
            </div>
            <div>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#e53e3e', 
                margin: '0',
                lineHeight: '1.2'
              }}>
                SUGUNA CHICKEN
              </h1>
              <p style={{ 
                fontSize: '12px', 
                color: '#38a169', 
                margin: '0',
                fontWeight: '600'
              }}>
                Safer • Tender • Makes you stronger
              </p>
            </div>
          </div>
          <p style={{ color: '#666', fontSize: '16px' }}>
            Choose your login type
          </p>
        </div>

        {/* Login Type Selector */}
        <div style={{ 
          display: 'flex', 
          background: '#f8f9fa', 
          borderRadius: '8px', 
          padding: '4px', 
          marginBottom: '30px' 
        }}>
          <button
            type="button"
            onClick={() => setLoginType('organization')}
            style={{
              flex: 1,
              padding: '12px 20px',
              background: loginType === 'organization' ? '#6c3fc5' : 'transparent',
              color: loginType === 'organization' ? '#fff' : '#666',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Organization Admin
          </button>
          <button
            type="button"
            onClick={() => setLoginType('store')}
            style={{
              flex: 1,
              padding: '12px 20px',
              background: loginType === 'store' ? '#6c3fc5' : 'transparent',
              color: loginType === 'store' ? '#fff' : '#666',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Store Login
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              color: '#333',
              fontSize: '14px'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{ 
                width: '100%', 
                padding: '14px 16px', 
                border: '2px solid #e1e5e9', 
                borderRadius: '8px', 
                fontSize: '16px',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#6c3fc5'}
              onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              color: '#333',
              fontSize: '14px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{ 
                width: '100%', 
                padding: '14px 16px', 
                border: '2px solid #e1e5e9', 
                borderRadius: '8px', 
                fontSize: '16px',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#6c3fc5'}
              onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
            />
          </div>

          {error && (
            <div style={{ 
              background: '#fee', 
              color: '#c53030', 
              padding: '12px', 
              borderRadius: '6px', 
              marginBottom: '20px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading ? '#ccc' : '#6c3fc5',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '20px'
            }}
          >
            {loading ? 'Signing In...' : `Sign In as ${loginType === 'organization' ? 'Organization Admin' : 'Store User'}`}
          </button>
        </form>

        {/* Demo Credentials */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '16px', 
          borderRadius: '8px', 
          fontSize: '13px',
          color: '#666'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '8px', color: '#333' }}>
            Demo Credentials:
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Organization Admin:</strong> admin@pos.com / admin123
          </div>
          <div>
            <strong>Store User:</strong> store@pos.com / store123
          </div>
          <div style={{ 
            marginTop: '8px', 
            padding: '8px', 
            background: '#e6fffa', 
            borderRadius: '4px',
            fontSize: '12px',
            color: '#38a169'
          }}>
            <strong>Demo Barcodes:</strong><br/>
            123456789012 - Whole Chicken<br/>
            123456789013 - Chicken Breast<br/>
            123456789014 - Chicken Legs
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSelector;
