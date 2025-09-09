const User = require('../models/User');
const Organization = require('../models/Organization');
const Store = require('../models/Store');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/emailService');

// Unified Login API
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials"
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials"
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        status: "error",
        message: "Account is inactive"
      });
    }

    // Get additional details based on user type
    let additionalData = {};
    if (user.userType === 'organization') {
      const organization = await Organization.findById(user.organizationId);
      additionalData.organization = organization;
    } else if (user.userType === 'store') {
      const store = await Store.findById(user.storeId);
      const organization = await Organization.findById(store.organizationId);
      additionalData.store = store;
      additionalData.organization = organization;
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        userType: user.userType,
        role: user.role,
        organizationId: user.organizationId || (additionalData.store ? additionalData.store.organizationId : null),
        storeId: user.storeId
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      status: "success",
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          role: user.role,
          ...additionalData
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

// Organization Signup API
exports.organizationSignup = async (req, res) => {
  try {
    const { organizationId, email, password } = req.body;

    // Check if organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(400).json({
        status: "error",
        message: "Organization ID not found"
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create organization user
    const user = new User({
      name: organization.contactPersonName, // Use organization contact person name
      email,
      password: hashedPassword,
      userType: 'organization',
      role: 'admin',
      organizationId,
      permissions: [
        { module: 'organization', actions: ['read', 'write', 'delete', 'manage'] },
        { module: 'store', actions: ['read', 'write', 'delete', 'manage'] },
        { module: 'inventory', actions: ['read', 'write', 'delete', 'manage'] },
        { module: 'pos', actions: ['read', 'write'] },
        { module: 'reports', actions: ['read', 'write'] }
      ]
    });

    await user.save();

    res.status(201).json({
      status: "success",
      message: "Organization signup successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          role: user.role,
          organizationId: user.organizationId
        }
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message
    });
  }
};

// Store Signup API
exports.storeSignup = async (req, res) => {
  try {
    const { storeId, email, password } = req.body;

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(400).json({
        status: "error",
        message: "Store ID not found"
      });
    }

    // Check if organization exists
    const organization = await Organization.findById(store.organizationId);
    if (!organization) {
      return res.status(400).json({
        status: "error",
        message: "Organization ID not found"
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create store user
    const user = new User({
      name: store.contactPersonName, // Use store contact person name
      email,
      password: hashedPassword,
      userType: 'store',
      role: 'cashier',
      storeId,
      permissions: [
        { module: 'pos', actions: ['read', 'write'] }
      ]
    });

    await user.save();

    res.status(201).json({
      status: "success",
      message: "Store signup successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          role: user.role,
          storeId: user.storeId
        }
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message
    });
  }
};

// Organization Admin Login
exports.organizationLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find organization user by email
    const user = await User.findOne({ email, userType: 'organization' });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid organization credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Get organization details
    const organization = await Organization.findById(user.organizationId);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        userType: user.userType,
        role: user.role,
        organizationId: user.organizationId
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Organization login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        role: user.role,
        organization: organization
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Store Login
exports.storeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find store user by email
    const user = await User.findOne({ email, userType: 'store' });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid store credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Get store and organization details
    const store = await Store.findById(user.storeId);
    const organization = await Organization.findById(store.organizationId);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        userType: user.userType,
        role: user.role,
        storeId: user.storeId,
        organizationId: store.organizationId
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Store login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        role: user.role,
        store: store,
        organization: organization
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create Organization Admin User
exports.createOrganizationUser = async (req, res) => {
  try {
    const { name, email, password, organizationId, role = 'admin' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Verify organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(400).json({ error: 'Organization not found' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create organization user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      userType: 'organization',
      role,
      organizationId,
      permissions: [
        { module: 'organization', actions: ['read', 'write', 'delete', 'manage'] },
        { module: 'store', actions: ['read', 'write', 'delete', 'manage'] },
        { module: 'inventory', actions: ['read', 'write', 'delete', 'manage'] },
        { module: 'pos', actions: ['read', 'write'] },
        { module: 'reports', actions: ['read', 'write'] }
      ]
    });

    await user.save();

    res.status(201).json({
      message: 'Organization user created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        role: user.role,
        organizationId: user.organizationId
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Create Store User
exports.createStoreUser = async (req, res) => {
  try {
    const { name, email, password, storeId, role = 'cashier' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Verify store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(400).json({ error: 'Store not found' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Set permissions based on role
    let permissions = [];
    if (role === 'manager') {
      permissions = [
        { module: 'inventory', actions: ['read', 'write'] },
        { module: 'pos', actions: ['read', 'write'] },
        { module: 'reports', actions: ['read'] }
      ];
    } else {
      permissions = [
        { module: 'pos', actions: ['read', 'write'] }
      ];
    }

    // Create store user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      userType: 'store',
      role,
      storeId,
      permissions
    });

    await user.save();

    res.status(201).json({
      message: 'Store user created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        role: user.role,
        storeId: user.storeId
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Forgot Password API
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if email exists or not
      return res.json({
        status: "success",
        message: "If the email exists, a password reset link has been sent"
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Send email
    const emailResult = await sendPasswordResetEmail(email, user.name, resetLink);
    
    if (!emailResult.success) {
      // If email fails, remove the reset token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      return res.status(500).json({
        status: "error",
        message: "Failed to send reset email. Please try again later."
      });
    }

    res.json({
      status: "success",
      message: "If the email exists, a password reset link has been sent"
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

// Reset Password API
exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    // Find user by reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired reset token"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      status: "success",
      message: "Password has been reset successfully"
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found"
      });
    }
    
    res.json({
      status: "success",
      message: "Profile retrieved successfully",
      data: { user }
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};
