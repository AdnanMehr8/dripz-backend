const express = require('express');
const authenticate = require('../middleware/auth');
// const { getCheckoutSession } = require('../controllers/bookingController');
const Product = require( "../models/Product");
const Profile = require( "../models/Profile");
const Cart = require( "../models/Cart");
const Stripe = require( 'stripe');
const User = require( "../models/User");
const Order = require('../models/Order')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.post('/checkout/payment', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Sample Product',
            },
            unit_amount: 100, // $20.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;

