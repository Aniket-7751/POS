const User = require('../models/User');
const Organization = require('../models/Organization');
const Store = require('../models/Store');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    const userId = `USER${Date.now().toString().slice(-6)}`;
    const user = new User({
      _id: userId,
      userId: userId,
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
    const userId = `USER${Date.now().toString().slice(-6)}`;
    const user = new User({
      _id: userId,
      userId: userId,
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

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
