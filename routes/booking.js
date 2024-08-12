const express = require('express');
const authenticate = require('../middleware/auth');
// const { getCheckoutSession } = require('../controllers/bookingController');
const Product = require( "../models/Product");
const Profile = require( "../models/Profile");
const Cart = require( "../models/Cart");
const Stripe = require( 'stripe');
const User = require( "../models/User");
const Order = require('../models/Order')
const stripe = require('stripe')('sk_test_51PkLk22NEMxq5ucjMcqBZZ8em8euGGCUCbeR4vC96KEQRcgd82FXE3wKkTiMv7MMyacr1L5s74Gyxo2gUTPMllqO00MfafqNAP');

const router = express.Router();

// router.post('/checkout-session', authenticate, async (req, res) => {
//   console.log(req.body);
//     const { amount, currency, source, description } = req.body;

//     try {
 
//       const charge = await stripe.paymentIntents.create({
//         amount, // Amount in cents
//         currency,
//         payment_method: source, 
//         confirmation_method: 'manual',
//         confirm: true,
//         description,
//       });
//       console.log('Payment successful:', charge)
  
//       res.status(200).json({ success: true, charge });
//     } catch (error) {
//       console.error('Payment Error:', error);
//       res.status(500).json({ success: false, error: error.message });
//     }
// } );

router.post('/checkout-session', async (req, res) => {
  const { payment_method, amount, currency, description } = req.body;

  if (!payment_method || !amount || !currency) {
    return res.status(400).json({ success: false, error: 'Missing required parameters' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency,
      payment_method,
      automatic_payment_methods: {
        enabled: true, // Enable automatic payment methods
      },
      description,
      // confirmation_method: 'manual',
      // confirm: true,
    });

    res.status(200).json({ success: true, paymentIntent });
  } catch (error) {
    console.error('Payment Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
