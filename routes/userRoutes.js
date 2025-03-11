const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Açık rotalar
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);

// Korumalı rotalar
router.post('/logout', protect, logoutUser);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Adres rotaları
router.post('/address', protect, addAddress);
router.route('/address/:id')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

module.exports = router; 