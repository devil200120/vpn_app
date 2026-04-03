const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { cashfree, Cashfree } = require('../config/cashfree');
const crypto = require('crypto');

const PLANS = {
  basic: {
    name: 'Basic',
    tier: 'basic',
    price: 399,
    currency: 'INR',
    features: [
      'Access to US, UK, Germany servers',
      'Standard speed',
      'Up to 3 connections',
      '5GB/day data',
    ],
  },
  premium: {
    name: 'Premium',
    tier: 'premium',
    price: 799,
    currency: 'INR',
    features: [
      'Access to all 5 server regions',
      'Unlimited speed',
      'Up to 5 connections',
      'Unlimited data',
      'Priority support',
    ],
  },
};

// @desc    Get subscription plans
// @route   GET /api/subscriptions/plans
const getPlans = async (req, res) => {
  const freePlan = {
    name: 'Free',
    tier: 'free',
    price: 0,
    currency: 'INR',
    features: [
      'US server only',
      'Limited speed',
      '1 connection',
      '500MB/day data',
    ],
  };

  res.json([freePlan, PLANS.basic, PLANS.premium]);
};

// @desc    Create Cashfree order
// @route   POST /api/subscriptions/create-order
const createOrder = async (req, res) => {
  const { tier } = req.body;

  if (!PLANS[tier]) {
    return res.status(400).json({ message: 'Invalid subscription tier' });
  }

  const plan = PLANS[tier];
  const orderId = `VPN_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  try {
    const request = {
      order_amount: plan.price,
      order_currency: plan.currency,
      order_id: orderId,
      customer_details: {
        customer_id: req.user._id.toString(),
        customer_name: req.user.name,
        customer_email: req.user.email,
        customer_phone: '9999999999',
      },
      order_meta: {
        return_url: `${process.env.CLIENT_URL}/subscription?order_id={order_id}`,
      },
    };

    const response = await cashfree.PGCreateOrder(request);

    // Save subscription record
    await Subscription.create({
      userId: req.user._id,
      tier,
      orderId,
      amount: plan.price,
      currency: plan.currency,
      status: 'pending',
    });

    res.json({
      orderId,
      paymentSessionId: response.data.payment_session_id,
      orderAmount: plan.price,
    });
  } catch (error) {
    console.error('Cashfree order creation error:', error?.response?.data || error.message);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
};

// @desc    Verify payment
// @route   POST /api/subscriptions/verify
const verifyPayment = async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: 'Order ID is required' });
  }

  try {
    const response = await cashfree.PGFetchOrder(orderId);
    const orderData = response.data;

    const subscription = await Subscription.findOne({ orderId });
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (orderData.order_status === 'PAID') {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 1);

      subscription.status = 'active';
      subscription.paymentId = orderData.cf_order_id;
      subscription.startDate = now;
      subscription.endDate = endDate;
      await subscription.save();

      // Update user subscription
      await User.findByIdAndUpdate(subscription.userId, {
        subscription: {
          tier: subscription.tier,
          expiresAt: endDate,
          isActive: true,
        },
      });

      res.json({ status: 'success', subscription });
    } else {
      subscription.status = 'cancelled';
      await subscription.save();
      res.json({ status: 'failed', message: 'Payment was not successful' });
    }
  } catch (error) {
    console.error('Payment verification error:', error?.response?.data || error.message);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
};

// @desc    Cashfree webhook
// @route   POST /api/subscriptions/webhook
const webhook = async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];

    try {
      Cashfree.PGVerifyWebhookSignature(signature, req.rawBody, timestamp);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = req.body;
    if (event.type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const orderId = event.data?.order?.order_id;
      const subscription = await Subscription.findOne({ orderId });

      if (subscription && subscription.status === 'pending') {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 1);

        subscription.status = 'active';
        subscription.paymentId = event.data?.payment?.cf_payment_id;
        subscription.startDate = now;
        subscription.endDate = endDate;
        await subscription.save();

        await User.findByIdAndUpdate(subscription.userId, {
          subscription: {
            tier: subscription.tier,
            expiresAt: endDate,
            isActive: true,
          },
        });
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

// @desc    Get current subscription
// @route   GET /api/subscriptions/current
const getCurrent = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: 'active',
    }).sort({ createdAt: -1 });

    res.json({
      subscription,
      tier: req.user.subscription.tier,
      expiresAt: req.user.subscription.expiresAt,
      isActive: req.user.subscription.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPlans, createOrder, verifyPayment, webhook, getCurrent };
