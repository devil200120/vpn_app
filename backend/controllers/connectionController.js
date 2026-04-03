const Connection = require('../models/Connection');
const Server = require('../models/Server');

const TIER_ACCESS = {
  free: ['free'],
  basic: ['free', 'basic'],
  premium: ['free', 'basic', 'premium'],
};

const MAX_CONNECTIONS = { free: 1, basic: 3, premium: 5 };

// Generate a simulated VPN IP
const generateVpnIp = () => {
  return `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`;
};

// @desc    Connect to a server
// @route   POST /api/connections/connect
const connect = async (req, res) => {
  const { serverId } = req.body;

  try {
    const server = await Server.findById(serverId);
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    if (server.status !== 'online') {
      return res.status(400).json({ message: 'Server is not available' });
    }

    const userTier = req.user.subscription.tier;
    const accessibleTiers = TIER_ACCESS[userTier] || ['free'];

    if (!accessibleTiers.includes(server.tier)) {
      return res.status(403).json({
        message: `This server requires a ${server.tier} subscription or higher`,
      });
    }

    // Check active connections limit
    const activeConnections = await Connection.countDocuments({
      userId: req.user._id,
      status: 'connected',
    });

    if (activeConnections >= MAX_CONNECTIONS[userTier]) {
      return res.status(400).json({
        message: `Maximum ${MAX_CONNECTIONS[userTier]} active connection(s) for ${userTier} tier`,
      });
    }

    const connection = await Connection.create({
      userId: req.user._id,
      serverId: server._id,
      status: 'connected',
      connectedAt: new Date(),
      assignedIp: generateVpnIp(),
    });

    const populated = await Connection.findById(connection._id).populate('serverId');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Disconnect from a server
// @route   POST /api/connections/disconnect
const disconnect = async (req, res) => {
  const { connectionId } = req.body;

  try {
    const connection = await Connection.findOne({
      _id: connectionId,
      userId: req.user._id,
      status: 'connected',
    });

    if (!connection) {
      return res.status(404).json({ message: 'Active connection not found' });
    }

    const now = new Date();
    const duration = Math.floor((now - connection.connectedAt) / 1000);
    const dataUsed = parseFloat((duration * (0.5 + Math.random() * 2)).toFixed(2)); // Simulated MB

    connection.status = 'disconnected';
    connection.disconnectedAt = now;
    connection.duration = duration;
    connection.dataUsed = dataUsed;
    await connection.save();

    const populated = await Connection.findById(connection._id).populate('serverId');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current active connection
// @route   GET /api/connections/status
const getStatus = async (req, res) => {
  try {
    const connection = await Connection.findOne({
      userId: req.user._id,
      status: 'connected',
    })
      .populate('serverId')
      .sort({ connectedAt: -1 });

    res.json(connection || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get connection history
// @route   GET /api/connections/history
const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const connections = await Connection.find({ userId: req.user._id })
      .populate('serverId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Connection.countDocuments({ userId: req.user._id });

    res.json({
      connections,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Disconnect all active connections (for logout)
// @route   POST /api/connections/disconnect-all
const disconnectAll = async (req, res) => {
  try {
    const now = new Date();
    const activeConnections = await Connection.find({
      userId: req.user._id,
      status: 'connected',
    });

    for (const conn of activeConnections) {
      const duration = Math.floor((now - conn.connectedAt) / 1000);
      conn.status = 'disconnected';
      conn.disconnectedAt = now;
      conn.duration = duration;
      conn.dataUsed = parseFloat((duration * (0.5 + Math.random() * 2)).toFixed(2));
      await conn.save();
    }

    res.json({ message: `Disconnected ${activeConnections.length} connection(s)` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { connect, disconnect, getStatus, getHistory, disconnectAll };
