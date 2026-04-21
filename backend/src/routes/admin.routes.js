const express = require('express');
const pool = require('../db');
const { authRequired, adminRequired } = require('../middleware/auth');

const router = express.Router();

router.use(authRequired, adminRequired);

router.get('/users', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, created_at FROM users ORDER BY id DESC'
    );
    res.json({ users: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка загрузки клиентов' });
  }
});

router.get('/products', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json({ products: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка загрузки товаров' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const { name, description, category, price, sizes, image_url } = req.body;

    if (!name || !category || price == null) {
      return res.status(400).json({ message: 'Заполните обязательные поля товара' });
    }

    const result = await pool.query(
      `INSERT INTO products (name, description, category, price, sizes, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description || '', category, Number(price), sizes || '', image_url || '']
    );

    res.status(201).json({ product: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка добавления товара' });
  }
});

router.patch('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const current = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (!current.rows.length) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    const product = current.rows[0];
    const updated = {
      name: req.body.name ?? product.name,
      description: req.body.description ?? product.description,
      category: req.body.category ?? product.category,
      price: req.body.price ?? product.price,
      sizes: req.body.sizes ?? product.sizes,
      image_url: req.body.image_url ?? product.image_url
    };

    const result = await pool.query(
      `UPDATE products
       SET name = $1, description = $2, category = $3, price = $4, sizes = $5, image_url = $6
       WHERE id = $7
       RETURNING *`,
      [
        updated.name,
        updated.description,
        updated.category,
        Number(updated.price),
        updated.sizes,
        updated.image_url,
        id
      ]
    );

    res.json({ product: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка изменения товара' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка удаления товара' });
  }
});

router.get('/orders', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders ORDER BY id DESC'
    );
    res.json({ orders: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка загрузки заказов' });
  }
});

router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    res.json({ order: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка смены статуса' });
  }
});

module.exports = router;