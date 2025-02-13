const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Assuming a User model file
const Product = require('./models/Product'); // Assuming a Product model file
const Order = require('./models/Order'); // Assuming an Order model file
const Cart = require('./models/Cart'); // Assuming a Cart model file

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Middleware for verifying JWT and roles
const authenticate = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access Denied' });
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access Forbidden' });
    next();
};

// Cart Management Routes
app.post('/cart', authenticate, async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        const cartItem = new Cart({ userId: req.user.id, productId, quantity });
        await cartItem.save();
        res.status(201).json({ message: 'Item added to cart', cartItem });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/cart', authenticate, async (req, res) => {
    try {
        const cartItems = await Cart.find({ userId: req.user.id }).populate('productId');
        res.json(cartItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/cart/:id', authenticate, async (req, res) => {
    try {
        await Cart.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin Order Management
app.get('/admin/orders', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const orders = await Order.find().populate('userId');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/admin/orders/:id', authenticate, authorizeAdmin, async (req, res) => {
    const { status } = req.body;
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json({ message: 'Order status updated', order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
