import React, { useState } from 'react';
import { authAPI } from '../api';
import SignupSelector from './SignupSelector';
import ForgotPassword from './ForgotPassword';

interface LoginSelectorProps {
  onLogin: (user: any, token: string) => void;
}

const LoginSelector: React.FC<LoginSelectorProps> = ({ onLogin }) => {
  const [loginType, setLoginType] = useState<'organization' | 'store'>('organization');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });

  // Test backend connection on component mount
  React.useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.status === 401) {
          // 401 is expected without token, means server is running
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('connected');
        }
      } catch (error) {
        console.error('Backend connection test failed:', error);
        setConnectionStatus('error');
      }
    };
    testConnection();
  }, []);

  // Function to validate form
  const validateForm = () => {
    setError('');
    setFieldErrors({
      email: '',
      password: ''
    });

    let isValid = true;
    const newFieldErrors = {
      email: '',
      password: ''
    };

    // Check email
    if (!email.trim()) {
      newFieldErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newFieldErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Check password
    if (!password.trim()) {
      newFieldErrors.password = 'Password is required';
      isValid = false;
    }

    setFieldErrors(newFieldErrors);
    
    if (!isValid) {
      setError('Please fix the errors below to continue');
    }
    
    return isValid;
  };

  // Function to handle input changes
  const handleInputChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') {
      setEmail(value);
    } else {
      setPassword(value);
    }

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Clear general error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Try unified login first, fallback to legacy endpoints
      let response;
      let token, user;
      
      try {
        console.log('Attempting unified login...');
        response = await authAPI.login({ email, password });
        console.log('Unified login response:', response.data);
        
        // Unified login response structure
        if (response.data.status === 'success' && response.data.data) {
          token = response.data.data.token;
          user = response.data.data.user;
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (unifiedError) {
        console.log('Unified login failed, trying legacy endpoints...', unifiedError);
        
        // Fallback to legacy login endpoints
        if (loginType === 'organization') {
          response = await authAPI.organizationLogin({ email, password });
          console.log('Organization login response:', response.data);
          // Legacy response structure
          token = response.data.token;
          user = response.data.user;
        } else {
          response = await authAPI.storeLogin({ email, password });
          console.log('Store login response:', response.data);
          // Legacy response structure
          token = response.data.token;
          user = response.data.user;
        }
      }
      
      if (!token || !user) {
        throw new Error('Invalid login response: missing token or user data');
      }
      
      localStorage.setItem('token', token);
      onLogin(user, token);
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = 'Login failed';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show signup component if signup is selected
  if (showSignup) {
    return <SignupSelector onBackToLogin={() => setShowSignup(false)} />;
  }

  // Show forgot password component if forgot password is selected
  if (showForgotPassword) {
    return <ForgotPassword 
      onBackToLogin={() => setShowForgotPassword(false)} 
      onRedirectToReset={() => {}} // Not used in proper email flow
    />;
  }

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
          marginBottom: '30px',
          gap: '4px'
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
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
              style={{ 
                width: '100%', 
                padding: '14px 16px', 
                border: fieldErrors.email ? '2px solid #dc2626' : '2px solid #e1e5e9', 
                borderRadius: '8px', 
                fontSize: '16px',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = fieldErrors.email ? '#dc2626' : '#6c3fc5'}
              onBlur={(e) => e.target.style.borderColor = fieldErrors.email ? '#dc2626' : '#e1e5e9'}
            />
            {fieldErrors.email && (
              <div style={{ 
                fontSize: '12px', 
                color: '#dc2626', 
                marginTop: '4px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                ⚠️ {fieldErrors.email}
              </div>
            )}
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
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter your password"
              style={{ 
                width: '100%', 
                padding: '14px 16px', 
                border: fieldErrors.password ? '2px solid #dc2626' : '2px solid #e1e5e9', 
                borderRadius: '8px', 
                fontSize: '16px',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = fieldErrors.password ? '#dc2626' : '#6c3fc5'}
              onBlur={(e) => e.target.style.borderColor = fieldErrors.password ? '#dc2626' : '#e1e5e9'}
            />
            {fieldErrors.password && (
              <div style={{ 
                fontSize: '12px', 
                color: '#dc2626', 
                marginTop: '4px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                ⚠️ {fieldErrors.password}
              </div>
            )}
          </div>

          {error && (
            <div style={{ 
              background: '#fef2f2', 
              border: '1px solid #fecaca',
              color: '#dc2626', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              fontSize: '14px',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              ⚠️ {error}
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
              marginBottom: '15px'
            }}
          >
            {loading ? 'Signing In...' : `Sign In as ${loginType === 'organization' ? 'Organization Admin' : 'Store User'}`}
          </button>
        </form>

        {/* Forgot Password Link */}
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            style={{
              background: 'transparent',
              color: '#6c3fc5',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: '500'
            }}
          >
            Forgot your password?
          </button>
        </div>

        {/* Signup Link */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ color: '#666', fontSize: '14px' }}>
            Don't have an account?{' '}
          </span>
          <button
            type="button"
            onClick={() => setShowSignup(true)}
            style={{
              background: 'transparent',
              color: '#6c3fc5',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: '600'
            }}
          >
            Sign up here
          </button>
        </div>

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
