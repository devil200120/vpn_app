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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Server', serverSchema);
