const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Server',
      required: true,
    },
    status: {
      type: String,
      enum: ['connected', 'disconnected', 'connecting'],
      default: 'connecting',
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
    disconnectedAt: {
      type: Date,
      default: null,
    },
    dataUsed: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    assignedIp: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Connection', connectionSchema);
