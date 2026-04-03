const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  connect,
  disconnect,
  getStatus,
  getHistory,
  disconnectAll,
} = require('../controllers/connectionController');

router.post('/connect', protect, connect);
router.post('/disconnect', protect, disconnect);
router.get('/status', protect, getStatus);
router.get('/history', protect, getHistory);
router.post('/disconnect-all', protect, disconnectAll);

module.exports = router;
