const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/products', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json({ products: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка загрузки товаров' });
  }
});

module.exports = router;