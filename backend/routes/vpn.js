const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { downloadConfig } = require('../controllers/vpnController');

router.get('/config/:serverId', protect, downloadConfig);

module.exports = router;
