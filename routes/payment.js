const express = require('express');
const router = express.Router();
const { client } = require('../paypal');
const mongoose = require('mongoose');
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const Product = require('../models/Product');


const Order = mongoose.model('Order', new mongoose.Schema({
    name: String,
    address: String,
    productId: mongoose.Schema.Types.ObjectId,
    transactionId: String,
    amount: Number,
    currency: String,
    createdAt: { type: Date, default: Date.now },
}));


const isValidObjectId = mongoose.Types.ObjectId.isValid;

//create order
router.post('/create-order', async (req, res) => {
    const { name, address, paypalEmail, productId } = req.body;

    try {
        // Validate productId
        if (!isValidObjectId(productId)) {
            return res.status(400).json({ message: 'Invalid productId format' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const price = product.price;

        //paypal order
        const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
        request.requestBody({
            intent: 'CAPTURE',
            application_context: {
                return_url: 'http://localhost:5000/payment/success',
                cancel_url: 'http://localhost:5000/payment/cancel',
            },
            purchase_units: [
                {
                    amount: {
                        value: price.toFixed(2),
                        currency_code: 'USD',
                    },
                    description: `Order for ${product.name} by ${name}`,
                    payee: {
                        email_address: paypalEmail,
                    },
                },
            ],
        });

        const order = await client().execute(request);

        res.status(200).json({ id: order.result.id });
    } catch (err) {
        console.error('Error creating PayPal order:', err.message);
        res.status(500).json({ error: 'Error creating PayPal order', details: err.message });
    }
});

// Capture an order
router.post('/capture-order', async (req, res) => {
    const { orderID, name, address, productId } = req.body;

    try {
        //capture request to paypal
        const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
        request.requestBody({});

        const capture = await client().execute(request);
        const transactionDetails = capture.result.purchase_units[0].payments.captures[0];

        //successful transaction
        await Order.create({
            name,
            address,
            productId,
            transactionId: transactionDetails.id,
            amount: transactionDetails.amount.value,
            currency: transactionDetails.amount.currency_code,
            createdAt: new Date(),
        });

        res.status(200).json({
            status: capture.result.status,
            transactionId: transactionDetails.id,
            amount: transactionDetails.amount.value,
        });
    } catch (err) {
        console.error('Error capturing PayPal order:', err.message);
        res.status(500).send('Error capturing PayPal order');
    }
});

// Success route
router.get('/success', async (req, res) => {
    const { token, name, address } = req.query;

    if (!token) {
        return res.status(400).json({ error: 'Missing PayPal token' });
    }

    try {
        const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(token);
        request.requestBody({});

        const capture = await client().execute(request);
        const transactionDetails = capture.result.purchase_units[0].payments.captures[0];

        await Order.create({
            name,
            address,
            productId: req.query.productId,
            transactionId: transactionDetails.id,
            amount: transactionDetails.amount.value,
            currency: transactionDetails.amount.currency_code,
            createdAt: new Date(),
        });

        res.redirect('/frontend/checkout-success.html');
    } catch (err) {
        console.error('Error capturing PayPal order:', err.message);
        res.redirect('/frontend/checkout-failed.html');
    }
});

//get all orders
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find().populate('productId');
        res.status(200).json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err.message);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

//cancel route
router.get('/cancel', (req, res) => {
    res.redirect('/frontend/checkout-failed.html');
});

module.exports = router;