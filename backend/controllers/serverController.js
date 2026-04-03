const Server = require('../models/Server');

const TIER_ACCESS = {
  free: ['free'],
  basic: ['free', 'basic'],
  premium: ['free', 'basic', 'premium'],
};

// @desc    Get all servers
// @route   GET /api/servers
const getServers = async (req, res) => {
  try {
    const servers = await Server.find().sort({ country: 1 });
    const userTier = req.user.subscription.tier;
    const accessibleTiers = TIER_ACCESS[userTier] || ['free'];

    const serversWithAccess = servers.map((server) => ({
      ...server.toObject(),
      accessible: accessibleTiers.includes(server.tier),
    }));

    res.json(serversWithAccess);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single server
// @route   GET /api/servers/:id
const getServer = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }
    res.json(server);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed default servers
// @route   POST /api/servers/seed
const seedServers = async (req, res) => {
  try {
    const count = await Server.countDocuments();
    if (count > 0) {
      return res.json({ message: 'Servers already seeded', count });
    }

    const defaultServers = [
      {
        name: 'US East',
        country: 'United States',
        countryCode: 'US',
        city: 'New York',
        ipAddress: '198.51.100.1',
        status: 'online',
        load: Math.floor(Math.random() * 60) + 10,
        tier: 'free',
        latency: 25,
        flag: '🇺🇸',
      },
      {
        name: 'UK London',
        country: 'United Kingdom',
        countryCode: 'GB',
        city: 'London',
        ipAddress: '203.0.113.10',
        status: 'online',
        load: Math.floor(Math.random() * 60) + 10,
        tier: 'basic',
        latency: 85,
        flag: '🇬🇧',
      },
      {
        name: 'DE Frankfurt',
        country: 'Germany',
        countryCode: 'DE',
        city: 'Frankfurt',
        ipAddress: '203.0.113.20',
        status: 'online',
        load: Math.floor(Math.random() * 60) + 10,
        tier: 'basic',
        latency: 95,
        flag: '🇩🇪',
      },
      {
        name: 'JP Tokyo',
        country: 'Japan',
        countryCode: 'JP',
        city: 'Tokyo',
        ipAddress: '203.0.113.30',
        status: 'online',
        load: Math.floor(Math.random() * 60) + 10,
        tier: 'premium',
        latency: 150,
        flag: '🇯🇵',
      },
      {
        name: 'SG Singapore',
        country: 'Singapore',
        countryCode: 'SG',
        city: 'Singapore',
        ipAddress: '203.0.113.40',
        status: 'online',
        load: Math.floor(Math.random() * 60) + 10,
        tier: 'premium',
        latency: 170,
        flag: '🇸🇬',
      },
    ];

    await Server.insertMany(defaultServers);
    res.status(201).json({ message: 'Servers seeded successfully', count: defaultServers.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getServers, getServer, seedServers };
