const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Create a new order
router.post('/order', async (req, res) => {
  const { userId, items, totalPrice } = req.body;

  try {
    const newOrder = new Order({
      userId,
      items,
      totalPrice
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get orders by user ID
router.get('/orders/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).populate('items.productId');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific order by order ID
router.get('/order/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('items.productId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders
router.get('/admin-orders', async (req, res) => {
  try {
    const { _limit = 9, _page = 1 } = req.query;
    const orders = await Order.find()
    .skip((parseInt(_page) - 1) * parseInt(_limit))
    .limit(parseInt(_limit))
    .populate('items.productId'); // Adjust if needed
    const totalOrders = await Order.countDocuments();

    res.status(200).json({
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / _limit),
      currentPage: parseInt(_page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an order status
router.patch('/order/:orderId', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(req.params.orderId, { status: req.body.status }, { new: true });
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an order
router.delete('/:orderId', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.orderId);
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(204).send(); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;