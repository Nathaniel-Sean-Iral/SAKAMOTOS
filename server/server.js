const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const db = require('./db');
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SESSION_SECRET || 'dev-secret'));

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const nowResult = await db.query('SELECT NOW() AS now');
    res.json({
      status: 'ok',
      environment: process.env.NODE_ENV || 'development',
      database: 'available',
      serverTime: nowResult.rows[0].now,
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      environment: process.env.NODE_ENV || 'development',
      database: 'unavailable',
      message: 'Database not connected. Configure DATABASE_URL to enable PostgreSQL queries.',
      error: error.message,
    });
  }
});

app.use(express.static(path.join(__dirname, '../client')));

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/register.html'));
});

app.get('/menu', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/menu.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/cart.html'));
});

app.get('/orders', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/orders.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/profile.html'));
});

app.get('*', (req, res) => {
  const file = path.join(__dirname, '../client/index.html');
  res.sendFile(file);
});

app.listen(PORT, () => {
  console.log(`Sakamoto server listening on http://localhost:${PORT}`);
});
