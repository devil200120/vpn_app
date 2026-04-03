#!/usr/bin/env node
// ============================================================
// Updates a VPN server record in MongoDB with real VPS details
// Usage:
//   node scripts/update-server-db.js \
//     --serverId <MONGODB_SERVER_ID> \
//     --ip <VPS_PUBLIC_IP> \
//     --publicKey "<WG_PUBLIC_KEY>"
// ============================================================
require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

const args = process.argv.slice(2);
const get  = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i+1] : null; };

const serverId = get('--serverId');
const ip       = get('--ip');
const pubKey   = get('--publicKey');

if (!serverId || !ip || !pubKey) {
  console.error('Usage: node update-server-db.js --serverId <id> --ip <ip> --publicKey "<key>"');
  process.exit(1);
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const Server = require('./backend/models/Server');

  const updated = await Server.findByIdAndUpdate(serverId, {
    ipAddress:    ip,
    wgEndpoint:   ip,
    wgPublicKey:  pubKey,
    proxyHost:    ip,
    proxyPort:    1080,
    wgPort:       51820,
    status:       'online',
  }, { new: true });

  if (!updated) { console.error('Server not found:', serverId); process.exit(1); }

  console.log('✅ Updated server:', updated.name);
  console.log('   IP         :', updated.ipAddress);
  console.log('   WG PubKey  :', updated.wgPublicKey.substring(0, 20) + '...');
  console.log('   Proxy      :', `${updated.proxyHost}:${updated.proxyPort}`);
  await mongoose.disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
