const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPlans,
  createOrder,
  verifyPayment,
  webhook,
  getCurrent,
} = require('../controllers/subscriptionController');

router.get('/plans', getPlans);
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/webhook', webhook);
router.get('/current', protect, getCurrent);

module.exports = router;
