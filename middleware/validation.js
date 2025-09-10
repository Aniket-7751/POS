// Validation middleware for email and password
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const errors = [];
  
  // Minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Maximum length
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  // At least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // At least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // At least one number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // At least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // No spaces
  if (/\s/.test(password)) {
    errors.push('Password cannot contain spaces');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// Login validation middleware
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Email validation
  if (!email) {
    errors.push('Email is required');
  } else if (!validateEmail(email)) {
    errors.push('Please enter a valid email address');
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 1) {
    errors.push('Password cannot be empty');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Signup validation middleware
const validateSignup = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Email validation
  if (!email) {
    errors.push('Email is required');
  } else if (!validateEmail(email)) {
    errors.push('Please enter a valid email address');
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  } else {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Organization signup validation middleware
const validateOrganizationSignup = (req, res, next) => {
  const { organizationId, email, password } = req.body;
  const errors = [];

  // Organization ID validation
  if (!organizationId) {
    errors.push('Organization ID is required');
  } else if (typeof organizationId !== 'string' || organizationId.trim().length === 0) {
    errors.push('Organization ID must be a valid string');
  }

  // Email validation
  if (!email) {
    errors.push('Email is required');
  } else if (!validateEmail(email)) {
    errors.push('Please enter a valid email address');
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  } else {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Store signup validation middleware
const validateStoreSignup = (req, res, next) => {
  const { storeId, email, password } = req.body;
  const errors = [];

  // Store ID validation
  if (!storeId) {
    errors.push('Store ID is required');
  } else if (typeof storeId !== 'string' || storeId.trim().length === 0) {
    errors.push('Store ID must be a valid string');
  }

  // Email validation
  if (!email) {
    errors.push('Email is required');
  } else if (!validateEmail(email)) {
    errors.push('Please enter a valid email address');
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  } else {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Forgot password validation middleware
const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;
  const errors = [];

  // Email validation
  if (!email) {
    errors.push('Email is required');
  } else if (!validateEmail(email)) {
    errors.push('Please enter a valid email address');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Reset password validation middleware
const validateResetPassword = (req, res, next) => {
  const { token, password, confirmPassword } = req.body;
  const errors = [];

  // Token validation
  if (!token) {
    errors.push('Reset token is required');
  } else if (typeof token !== 'string' || token.trim().length === 0) {
    errors.push('Reset token must be a valid string');
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  } else {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }

  // Confirm password validation
  if (!confirmPassword) {
    errors.push('Confirm password is required');
  }

  // Password match validation
  if (password && confirmPassword && password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

module.exports = {
  validateEmail,
  validatePassword,
  validateLogin,
  validateSignup,
  validateOrganizationSignup,
  validateStoreSignup,
  validateForgotPassword,
  validateResetPassword
};
