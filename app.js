const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const Product = require('./models/Product');

//Express
const app = express();

app.use('/frontend', express.static(path.join(__dirname, 'frontend')));





app.use(express.json());
app.use(cors());


const paymentRoutes = require('./routes/payment');
app.use('/payment', paymentRoutes);

//MongoDB
mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));



//all products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

//new product
app.post('/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save(); // Save product to database
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error creating product' });
  }
});



app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'checkout.html'));
});


module.exports = app;