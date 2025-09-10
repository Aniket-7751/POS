const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const {
  validateLogin,
  validateOrganizationSignup,
  validateStoreSignup,
  validateForgotPassword,
  validateResetPassword
} = require('../middleware/validation');

// Public routes with validation
router.post('/login', validateLogin, authController.login);
router.post('/organization/signup', validateOrganizationSignup, authController.organizationSignup);
router.post('/store/signup', validateStoreSignup, authController.storeSignup);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);

// Legacy routes (keeping for backward compatibility)
router.post('/organization/login', authController.organizationLogin);
router.post('/store/login', authController.storeLogin);
router.post('/organization/register', authController.createOrganizationUser);
router.post('/store/register', authController.createStoreUser);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
