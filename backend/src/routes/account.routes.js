const express = require('express');
const pool = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/me', authRequired, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка загрузки профиля' });
  }
});

router.get('/orders', authRequired, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY id DESC',
      [req.user.id]
    );

    res.json({ orders: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка загрузки заказов' });
  }
});

module.exports = router;