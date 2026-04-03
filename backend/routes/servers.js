const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getServers, getServer, seedServers } = require('../controllers/serverController');

router.get('/', protect, getServers);
router.get('/:id', protect, getServer);
router.post('/seed', seedServers);

module.exports = router;
