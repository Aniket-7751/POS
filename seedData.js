const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const Organization = require('./models/Organization');
const Store = require('./models/Store');
const Category = require('./models/Category');
const Catalogue = require('./models/Catalogue');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://aniketkuanar2001:aniketkuanar2001@cluster0.kvpotek.mongodb.net/POS?retryWrites=true&w=majority';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Clear existing data and drop collections to remove old indexes
    await Organization.deleteMany({});
    await Store.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    
    // Drop collections to remove old indexes
    try {
      await mongoose.connection.db.collection('catalogues').drop();
      console.log('Dropped catalogues collection');
    } catch (error) {
      console.log('Catalogues collection does not exist or already dropped');
    }
    
    try {
      await mongoose.connection.db.collection('users').drop();
      console.log('Dropped users collection');
    } catch (error) {
      console.log('Users collection does not exist or already dropped');
    }
    
    try {
      await mongoose.connection.db.collection('categories').drop();
      console.log('Dropped categories collection');
    } catch (error) {
      console.log('Categories collection does not exist or already dropped');
    }

    // Create demo organization
    const organization = new Organization({
      organizationId: 'ORG001',
      organizationName: 'Suguna Chicken',
      address: '123 Main Street, City, State 12345',
      contactPersonName: 'John Doe',
      contactNumber: '9876543210',
      email: 'contact@sugunachicken.com',
      gstNumber: 'GST123456789',
      panNumber: 'PAN123456789',
      logo: 'https://via.placeholder.com/150'
    });
    await organization.save();
    console.log('Demo organization created');

    // Create demo stores
    const mainStore = new Store({
      storeId: 'STORE001',
      storeName: 'Suguna Chicken - Main Outlet',
      storeLocation: 'Downtown',
      storeAddress: '123 Main Street, Downtown',
      contactPersonName: 'Jane Smith',
      contactNumber: '9876543211',
      email: 'main@sugunachicken.com',
      storePicture: 'https://via.placeholder.com/300x200',
      status: 'active',
      organizationId: organization._id
    });
    await mainStore.save();

    const branchStore = new Store({
      storeId: 'STORE002',
      storeName: 'Suguna Chicken - Branch Outlet',
      storeLocation: 'Uptown',
      storeAddress: '456 Oak Avenue, Uptown',
      contactPersonName: 'Bob Johnson',
      contactNumber: '9876543212',
      email: 'branch@sugunachicken.com',
      storePicture: 'https://via.placeholder.com/300x200',
      status: 'active',
      organizationId: organization._id
    });
    await branchStore.save();
    console.log('Demo stores created');

    // Create organization admin user
    const orgHashedPassword = await bcrypt.hash('admin123', 10);
    const orgUser = new User({
      name: 'Organization Admin',
      email: 'admin@pos.com',
      password: orgHashedPassword,
      userType: 'organization',
      role: 'admin',
      organizationId: organization._id,
      permissions: [
        { module: 'organization', actions: ['read', 'write', 'delete', 'manage'] },
        { module: 'store', actions: ['read', 'write', 'delete', 'manage'] },
        { module: 'inventory', actions: ['read', 'write', 'delete', 'manage'] },
        { module: 'pos', actions: ['read', 'write'] },
        { module: 'reports', actions: ['read', 'write'] }
      ]
    });
    await orgUser.save();
    console.log('Organization admin user created');

    // Create store users
    const storeHashedPassword = await bcrypt.hash('store123', 10);
    const storeUser = new User({
      name: 'Store Manager',
      email: 'store@pos.com',
      password: storeHashedPassword,
      userType: 'store',
      role: 'manager',
      storeId: mainStore._id,
      permissions: [
        { module: 'inventory', actions: ['read', 'write'] },
        { module: 'pos', actions: ['read', 'write'] },
        { module: 'reports', actions: ['read'] }
      ]
    });
    await storeUser.save();
    console.log('Store user created');

    // Create demo categories
    const category1 = new Category({
      categoryId: 'CAT001',
      categoryName: 'Fresh Chicken',
      categoryDescription: 'Fresh whole chicken and chicken parts',
      status: 'active',
      organizationId: organization._id
    });
    await category1.save();

    const category2 = new Category({
      categoryId: 'CAT002',
      categoryName: 'Frozen Chicken',
      categoryDescription: 'Frozen chicken products',
      status: 'active',
      organizationId: organization._id
    });
    await category2.save();

    const category3 = new Category({
      categoryId: 'CAT003',
      categoryName: 'Chicken Products',
      categoryDescription: 'Processed chicken products and ready-to-cook items',
      status: 'active',
      organizationId: organization._id
    });
    await category3.save();
    console.log('Demo categories created');

    // Create demo catalogue items
    const items = [
      {
        itemId: 'ITEM001',
        sku: 'SKU001',
        itemName: 'Whole Chicken - Fresh',
        categoryId: category1._id,
        volumeOfMeasurement: '1 kg',
        sourceOfOrigin: 'India',
        nutritionValue: {
          calories: 165,
          protein: 31,
          fat: 3.6,
          carbs: 0,
          fiber: 0,
          sugar: 0,
          sodium: 74
        },
        certification: 'FSSAI, HACCP',
        price: 180,
        stock: 50,
        barcode: '123456789012',
        status: 'active',
        image: 'https://via.placeholder.com/200x200',
        thumbnail: 'https://via.placeholder.com/100x100',
        organizationId: organization._id
      },
      {
        itemId: 'ITEM002',
        sku: 'SKU002',
        itemName: 'Chicken Breast - Frozen',
        categoryId: category2._id,
        volumeOfMeasurement: '500g',
        sourceOfOrigin: 'India',
        nutritionValue: {
          calories: 165,
          protein: 31,
          fat: 3.6,
          carbs: 0,
          fiber: 0,
          sugar: 0,
          sodium: 74
        },
        certification: 'FSSAI, HACCP',
        price: 120,
        stock: 100,
        barcode: '123456789013',
        status: 'active',
        image: 'https://via.placeholder.com/200x200',
        thumbnail: 'https://via.placeholder.com/100x100',
        organizationId: organization._id
      },
      {
        itemId: 'ITEM003',
        sku: 'SKU003',
        itemName: 'Chicken Legs - Fresh',
        categoryId: category1._id,
        volumeOfMeasurement: '1 kg',
        sourceOfOrigin: 'India',
        nutritionValue: {
          calories: 180,
          protein: 28,
          fat: 8,
          carbs: 0,
          fiber: 0,
          sugar: 0,
          sodium: 80
        },
        certification: 'FSSAI, HACCP',
        price: 160,
        stock: 200,
        barcode: '123456789014',
        status: 'active',
        image: 'https://via.placeholder.com/200x200',
        thumbnail: 'https://via.placeholder.com/100x100',
        organizationId: organization._id
      },
      {
        itemId: 'ITEM004',
        sku: 'SKU004',
        itemName: 'Chicken Wings - Frozen',
        categoryId: category2._id,
        volumeOfMeasurement: '1 kg',
        sourceOfOrigin: 'India',
        nutritionValue: {
          calories: 203,
          protein: 18,
          fat: 14,
          carbs: 0,
          fiber: 0,
          sugar: 0,
          sodium: 85
        },
        certification: 'FSSAI, HACCP',
        price: 140,
        stock: 25,
        barcode: '123456789015',
        status: 'active',
        image: 'https://via.placeholder.com/200x200',
        thumbnail: 'https://via.placeholder.com/100x100',
        organizationId: organization._id
      },
      {
        itemId: 'ITEM005',
        sku: 'SKU005',
        itemName: 'Chicken Sausages - Ready to Cook',
        categoryId: category3._id,
        volumeOfMeasurement: '250g',
        sourceOfOrigin: 'India',
        nutritionValue: {
          calories: 250,
          protein: 15,
          fat: 20,
          carbs: 2,
          fiber: 0,
          sugar: 1,
          sodium: 600
        },
        certification: 'FSSAI, HACCP',
        price: 80,
        stock: 75,
        barcode: '123456789016',
        status: 'active',
        image: 'https://via.placeholder.com/200x200',
        thumbnail: 'https://via.placeholder.com/100x100',
        organizationId: organization._id
      }
    ];

    for (const item of items) {
      const catalogueItem = new Catalogue(item);
      await catalogueItem.save();
    }
    console.log('Demo catalogue items created');

    console.log('✅ Seed data created successfully!');
    console.log('\nDemo Login Credentials:');
    console.log('Email: admin@pos.com');
    console.log('Password: admin123');
    console.log('\nDemo Barcodes for testing:');
    console.log('123456789012 - Whole Chicken - Fresh');
    console.log('123456789013 - Chicken Breast - Frozen');
    console.log('123456789014 - Chicken Legs - Fresh');
    console.log('123456789015 - Chicken Wings - Frozen');
    console.log('123456789016 - Chicken Sausages - Ready to Cook');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedData();
