import React, { useState } from 'react';
import { authAPI } from '../api';

interface SignupFormProps {
  signupType: 'organization' | 'store';
  onBackToLogin: () => void;
  onBackToSignupSelector?: () => void;
}


const SignupForm: React.FC<SignupFormProps> = ({ signupType, onBackToLogin, onBackToSignupSelector }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    organizationId: '',
    storeId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [fieldErrors, setFieldErrors] = useState({
    organizationId: '',
    storeId: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Password requirements state
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  // Show password requirements only when typing and not all satisfied
  const showPasswordRequirements = formData.password.length > 0 && 
    (!passwordRequirements.minLength || !passwordRequirements.hasUppercase || 
     !passwordRequirements.hasLowercase || !passwordRequirements.hasNumber || 
     !passwordRequirements.hasSpecialChar);

  // Function to check password requirements
  const checkPasswordRequirements = (password: string) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[@$!%*?&]/.test(password)
    };
    setPasswordRequirements(requirements);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Check password requirements in real-time
    if (name === 'password') {
      checkPasswordRequirements(value);
    }
    
    // Clear field error when user starts typing
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    console.log('Starting validation with formData:', formData);
    console.log('Signup type:', signupType);
    
    // Clear previous errors
    setError('');
    setFieldErrors({
      organizationId: '',
      storeId: '',
      email: '',
      password: '',
      confirmPassword: ''
    });

    let isValid = true;
    const newFieldErrors = {
      organizationId: '',
      storeId: '',
      email: '',
      password: '',
      confirmPassword: ''
    };

    // Check Organization ID for organization signup
    if (signupType === 'organization' && !formData.organizationId.trim()) {
      newFieldErrors.organizationId = 'Organization ID is required';
      isValid = false;
    }

    // Check Store ID for store signup
    if (signupType === 'store' && !formData.storeId.trim()) {
      newFieldErrors.storeId = 'Store ID is required';
      isValid = false;
    }

    // Check email
    if (!formData.email.trim()) {
      newFieldErrors.email = 'Email address is required';
      isValid = false;
    } else {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newFieldErrors.email = 'Please enter a valid email address';
        isValid = false;
      }
    }

    // Check password
    if (!formData.password) {
      newFieldErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newFieldErrors.password = 'Password must be at least 8 characters long';
      isValid = false;
    } else if (!passwordRequirements.minLength || !passwordRequirements.hasUppercase || 
               !passwordRequirements.hasLowercase || !passwordRequirements.hasNumber || 
               !passwordRequirements.hasSpecialChar) {
      newFieldErrors.password = 'Password must meet all requirements';
      isValid = false;
    }

    // Check confirm password
    if (!formData.confirmPassword) {
      newFieldErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newFieldErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    console.log('Validation errors found:', newFieldErrors);
    console.log('Is valid:', isValid);
    
    setFieldErrors(newFieldErrors);
    
    // Show general error message if there are validation errors
    if (!isValid) {
      setError('Please fix the errors below to continue');
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('Form submitted, validating...');
    const isValid = validateForm();
    console.log('Validation result:', isValid);
    console.log('Field errors after validation:', fieldErrors);
    
    if (!isValid) {
      console.log('Validation failed, stopping submission');
      return;
    }

    setLoading(true);

    try {
      let response;
      if (signupType === 'organization') {
        response = await authAPI.organizationSignup({
          organizationId: formData.organizationId,
          email: formData.email,
          password: formData.password
        });
      } else {
        response = await authAPI.storeSignup({
          storeId: formData.storeId,
          email: formData.email,
          password: formData.password
        });
      }

      console.log('Signup response:', response.data);
      
      setSuccess(`${signupType === 'organization' ? 'Organization' : 'Store'} signup successful! You can now login.`);
      
      // Clear form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        organizationId: '',
        storeId: ''
      });

      // Start countdown
      let timeLeft = 3;
      setCountdown(timeLeft);
      
      const countdownInterval = setInterval(() => {
        timeLeft--;
        setCountdown(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          onBackToLogin();
        }
      }, 1000);

    } catch (err: any) {
      setError(err.response?.data?.message || `${signupType === 'organization' ? 'Organization' : 'Store'} signup failed`);
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
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{ 
        background: '#fff', 
        padding: '40px', 
        borderRadius: '16px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)', 
        maxWidth: '600px', 
        width: '100%',
        margin: '0 auto'
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
        <h2 style={{ 
          color: '#333', 
          fontSize: '20px', 
          margin: '0 0 8px 0',
          fontWeight: '600'
        }}>
          {signupType === 'organization' ? 'Organization' : 'Store'} Signup
        </h2>
        <p style={{ color: '#666', fontSize: '14px', margin: '0' }}>
          Create your {signupType === 'organization' ? 'organization admin' : 'store user'} account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Organization/Store ID Input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600', 
            color: '#333',
            fontSize: '14px'
          }}>
            {signupType === 'organization' ? 'Organization ID *' : 'Store ID *'}
          </label>
          <input
            type="text"
            name={signupType === 'organization' ? 'organizationId' : 'storeId'}
            value={signupType === 'organization' ? formData.organizationId : formData.storeId}
            onChange={handleInputChange}
            placeholder={signupType === 'organization' ? 'Enter Organization ID' : 'Enter Store ID'}
            style={{ 
              width: '100%', 
              padding: '14px 16px', 
              border: `2px solid ${(signupType === 'organization' ? fieldErrors.organizationId : fieldErrors.storeId) ? '#dc2626' : '#e1e5e9'}`, 
              borderRadius: '8px', 
              fontSize: '16px',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#6c3fc5'}
            onBlur={(e) => e.target.style.borderColor = (signupType === 'organization' ? fieldErrors.organizationId : fieldErrors.storeId) ? '#dc2626' : '#e1e5e9'}
          />
          {(signupType === 'organization' ? fieldErrors.organizationId : fieldErrors.storeId) && (
            <div style={{ 
              fontSize: '12px', 
              color: '#dc2626', 
              marginTop: '4px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              ⚠️ {signupType === 'organization' ? fieldErrors.organizationId : fieldErrors.storeId}
            </div>
          )}
          <div style={{ 
            fontSize: '12px', 
            color: '#666', 
            marginTop: '4px',
            fontStyle: 'italic'
          }}>
            {signupType === 'organization' 
              ? 'Enter the Organization ID provided by your administrator'
              : 'Enter the Store ID provided by your organization admin'
            }
          </div>
        </div>

        {/* Email */}
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
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            style={{ 
              width: '100%', 
              padding: '14px 16px', 
              border: `2px solid ${fieldErrors.email ? '#dc2626' : '#e1e5e9'}`, 
              borderRadius: '8px', 
              fontSize: '16px',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#6c3fc5'}
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

        {/* Password */}
        <div style={{ marginBottom: '20px' }}>
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
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password (min 8 characters)"
            style={{ 
              width: '100%', 
              padding: '14px 16px', 
              border: `2px solid ${fieldErrors.password ? '#dc2626' : '#e1e5e9'}`, 
              borderRadius: '8px', 
              fontSize: '16px',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#6c3fc5'}
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

          {/* Password Requirements - Only show when typing and not all satisfied */}
          {showPasswordRequirements && (
            <div style={{ 
              background: '#f0f8ff', 
              border: '1px solid #b3d9ff',
              borderRadius: '8px', 
              padding: '12px 16px', 
              marginTop: '8px',
              fontSize: '13px'
            }}>
              <div style={{ 
                fontWeight: '600', 
                color: '#0066cc', 
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                Password Requirements:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  color: passwordRequirements.minLength ? '#16a34a' : '#dc2626'
                }}>
                  <span style={{ fontSize: '14px' }}>
                    {passwordRequirements.minLength ? '✓' : '✗'}
                  </span>
                  At least 8 characters
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  color: passwordRequirements.hasUppercase ? '#16a34a' : '#dc2626'
                }}>
                  <span style={{ fontSize: '14px' }}>
                    {passwordRequirements.hasUppercase ? '✓' : '✗'}
                  </span>
                  One uppercase letter (A-Z)
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  color: passwordRequirements.hasLowercase ? '#16a34a' : '#dc2626'
                }}>
                  <span style={{ fontSize: '14px' }}>
                    {passwordRequirements.hasLowercase ? '✓' : '✗'}
                  </span>
                  One lowercase letter (a-z)
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  color: passwordRequirements.hasNumber ? '#16a34a' : '#dc2626'
                }}>
                  <span style={{ fontSize: '14px' }}>
                    {passwordRequirements.hasNumber ? '✓' : '✗'}
                  </span>
                  One number (0-9)
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  color: passwordRequirements.hasSpecialChar ? '#16a34a' : '#dc2626'
                }}>
                  <span style={{ fontSize: '14px' }}>
                    {passwordRequirements.hasSpecialChar ? '✓' : '✗'}
                  </span>
                  One special character (@$!%*?&)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600', 
            color: '#333',
            fontSize: '14px'
          }}>
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            style={{ 
              width: '100%', 
              padding: '14px 16px', 
              border: `2px solid ${fieldErrors.confirmPassword ? '#dc2626' : '#e1e5e9'}`, 
              borderRadius: '8px', 
              fontSize: '16px',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#6c3fc5'}
            onBlur={(e) => e.target.style.borderColor = fieldErrors.confirmPassword ? '#dc2626' : '#e1e5e9'}
          />
          {fieldErrors.confirmPassword && (
            <div style={{ 
              fontSize: '12px', 
              color: '#dc2626', 
              marginTop: '4px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              ⚠️ {fieldErrors.confirmPassword}
            </div>
          )}
        </div>


        {/* Temporary Debug Display */}
        {/* <div style={{ 
          background: '#fff3cd', 
          border: '1px solid #ffeaa7',
          color: '#856404', 
          padding: '8px 12px', 
          borderRadius: '6px', 
          marginBottom: '10px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <strong>Debug:</strong> Field errors: {JSON.stringify(fieldErrors)}
        </div> */}

        {/* Error Message */}
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

        {/* Success Message */}
        {success && (
          <div style={{ 
            background: '#f0fff4', 
            color: '#38a169', 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>
              ✅ {success}
            </div>
            <div style={{ fontSize: '12px', color: '#2f855a', marginBottom: '10px' }}>
              🔄 Redirecting to login in {countdown} seconds...
            </div>
            <button
              type="button"
              onClick={onBackToLogin}
              style={{
                padding: '8px 16px',
                background: '#38a169',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Go to Login Now
            </button>
          </div>
        )}


        {/* Submit Button */}
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
          {loading ? 'Creating Account...' : `Create ${signupType === 'organization' ? 'Organization' : 'Store'} Account`}
        </button>
      </form>

      {/* Back Buttons */}
      <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '20px' }}>
        {onBackToSignupSelector && (
          <button
            type="button"
            onClick={onBackToSignupSelector}
            style={{
              background: 'transparent',
              color: '#666',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '8px'
            }}
          >
            ← Back to Signup Options
          </button>
        )}
        <button
          type="button"
          onClick={onBackToLogin}
          style={{
            background: 'transparent',
            color: '#6c3fc5',
            border: 'none',
            fontSize: '14px',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: '8px'
          }}
        >
          ← Back to Login
        </button>
      </div>
    </div>
    </div>
  );
};

export default SignupForm;
