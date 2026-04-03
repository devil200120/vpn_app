const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tier: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      required: true,
    },
    orderId: {
      type: String,
      default: null,
    },
    paymentId: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'pending'],
      default: 'pending',
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
