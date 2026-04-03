const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
  updateProfile,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/refresh', refreshAccessToken);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
