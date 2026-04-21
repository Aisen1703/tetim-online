const express = require('express');
const pool = require('../db');
const { optionalUser } = require('../middleware/auth');
const { sendOrderToAmoCRM } = require('../services/amocrm');

const router = express.Router();

router.post('/', optionalUser, async (req, res) => {
  try {
    const { customerName, phone, email, comment, items } = req.body;

    if (!customerName || !phone || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: 'Некорректные данные заказа' });
    }

    const totalAmount = items.reduce((sum, item) => {
      return sum + Number(item.price || 0) * Number(item.quantity || 1);
    }, 0);

    const orderResult = await pool.query(
      `INSERT INTO orders (
        user_id, customer_name, phone, email, comment, total_amount, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        req.user?.id || null,
        customerName,
        phone,
        email || '',
        comment || '',
        totalAmount,
        'new'
      ]
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, name, quantity, price)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          order.id,
          item.productId || null,
          item.name,
          Number(item.quantity || 1),
          Number(item.price || 0)
        ]
      );
    }

    let amocrm = null;

    try {
      const amoResult = await sendOrderToAmoCRM({
        customerName,
        phone,
        email,
        comment,
        items,
        totalAmount
      });

      amocrm = {
        contactId: amoResult.contact.id,
        leadId: amoResult.lead.id
      };
    } catch (error) {
      console.error('amoCRM error:', error.response?.data || error.message);
    }

    res.status(201).json({
      success: true,
      order,
      amocrm
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка создания заказа' });
  }
});

module.exports = router;