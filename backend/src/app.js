const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const customerAuthRoutes = require('./routes/customerAuthRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const customerRoutes = require('./routes/customerRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');

const app = express();

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming JSON payloads
app.use(express.json());

// Map API Route Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerAuthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers-data', customerRoutes);
app.use('/api/testimonials', testimonialRoutes);

// General health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'EtherealHijab API is running' });
});

// Catch-all route error-handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

module.exports = app;
