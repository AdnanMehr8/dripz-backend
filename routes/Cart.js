const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const authenticate = require('../middleware/auth');
const mongoose = require('mongoose');


// Middleware to check if user exists
const checkUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Add an item to the cart
router.post('/cart/add',authenticate, checkUser, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [{ productId, quantity }] });
    } else {
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
    }

    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// View cart
router.get('/cart',authenticate, checkUser, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update item quantity in the cart
// Update item quantity in the cart
router.put('/cart/update/:productId', authenticate, checkUser, async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  try {
    // Find the user's cart
    let cart = await Cart.findOne({ userId: req.user.id });
    console.log(cart)
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    // Find the item in the cart
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ msg: 'Item not found in cart' });
    }

    // Update the quantity
    if (quantity <= 0) {
      // Remove the item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      // Update the quantity if it's greater than 0
      cart.items[itemIndex].quantity = quantity;
    }

    // Update the cart's last updated time
    cart.updatedAt = Date.now();
    await cart.save();
    console.log('Cart before sending response:', JSON.stringify(cart, null, 2));

     // Populate the product details before sending the response
  await cart.populate('items.productId');
  
    // Send the updated cart as the response
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



// Remove item from the cart
router.delete('/cart/remove/:productId',authenticate, checkUser, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === req.params.productId);
    if (itemIndex === -1) {
      return res.status(404).json({ msg: 'Item not found in cart' });
    }

    cart.items.splice(itemIndex, 1);
    cart.updatedAt = Date.now();
    await cart.save();

    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
