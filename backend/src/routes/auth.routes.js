const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const pool = require('../db');

dotenv.config();

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Заполните обязательные поля' });
    }

    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, role`,
      [name, email, phone || '', passwordHash, 'customer']
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка регистрации' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка входа' });
  }
});

module.exports = router;