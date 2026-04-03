const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
    },
    countryCode: {
      type: String,
      required: true,
      uppercase: true,
    },
    city: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'maintenance'],
      default: 'online',
    },
    load: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    tier: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      default: 'free',
    },
    latency: {
      type: Number,
      default: 0,
    },
    flag: {
      type: String,
      default: '',
    },
    wgEndpoint: {
      type: String,
      default: '',
    },
    wgPort: {
      type: Number,
      default: 51820,
    },
    wgPublicKey: {
      type: String,
      default: '',
    },
    wgDNS: {
      type: String,
      default: '1.1.1.1, 1.0.0.1',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Server', serverSchema);
