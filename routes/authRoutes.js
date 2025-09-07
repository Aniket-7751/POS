const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/organization/login', authController.organizationLogin);
router.post('/store/login', authController.storeLogin);
router.post('/organization/register', authController.createOrganizationUser);
router.post('/store/register', authController.createStoreUser);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
