const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { downloadConfig, getProxyCredentials } = require('../controllers/vpnController');

router.get('/config/:serverId', protect, downloadConfig);
router.get('/proxy-credentials/:serverId', protect, getProxyCredentials);

module.exports = router;
