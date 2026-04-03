const nacl = require('tweetnacl');
const Server = require('../models/Server');

const TIER_ACCESS = {
  free: ['free'],
  basic: ['free', 'basic'],
  premium: ['free', 'basic', 'premium'],
};

// Generate a WireGuard-compatible Curve25519 key pair (base64 encoded)
const generateWireGuardKeys = () => {
  const keyPair = nacl.box.keyPair();
  const privateKey = Buffer.from(keyPair.secretKey).toString('base64');
  const publicKey = Buffer.from(keyPair.publicKey).toString('base64');
  return { privateKey, publicKey };
};

// @desc    Download WireGuard config for a server
// @route   GET /api/vpn/config/:serverId
const downloadConfig = async (req, res) => {
  try {
    const server = await Server.findById(req.params.serverId);
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    const userTier = req.user.subscription?.tier || 'free';
    const accessibleTiers = TIER_ACCESS[userTier] || ['free'];

    if (!accessibleTiers.includes(server.tier)) {
      return res.status(403).json({ message: 'Upgrade your plan to access this server' });
    }

    if (!server.wgPublicKey || !server.wgEndpoint) {
      return res.status(503).json({ message: 'WireGuard not configured for this server yet' });
    }

    const { privateKey, publicKey } = generateWireGuardKeys();

    const config = `[Interface]
# ShieldVPN - ${server.name} (${server.country})
PrivateKey = ${privateKey}
Address = 10.0.0.${Math.floor(Math.random() * 200) + 2}/32
DNS = ${server.wgDNS || '1.1.1.1, 1.0.0.1'}

[Peer]
PublicKey = ${server.wgPublicKey}
Endpoint = ${server.wgEndpoint}:${server.wgPort || 51820}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
`;

    const filename = `shieldvpn-${server.countryCode.toLowerCase()}-${server.city.toLowerCase().replace(/\s+/g, '-')}.conf`;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { downloadConfig };
