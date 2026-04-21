const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const publicRoutes = require('./routes/public.routes');
const authRoutes = require('./routes/auth.routes');
const ordersRoutes = require('./routes/orders.routes');
const accountRoutes = require('./routes/account.routes');
const adminRoutes = require('./routes/admin.routes');

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/admin', adminRoutes);

module.exports = app;