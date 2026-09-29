const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM history_table WHERE order_username = $1 ORDER BY order_date DESC`,
      [req.user.account_username]
    );

    return res.json({ orders: result.rows });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load orders.', error: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { items, total, paymentMethod, orderType } = req.body;

  if (!items || !items.length || !total) {
    return res.status(400).json({ message: 'Order items and total are required.' });
  }

  try {
    const insertPromises = items.map((item, index) =>
      db.query(
        `INSERT INTO history_table (order_username, order_product_name, order_flavor, order_cup_size, order_add_on,
          order_quantity, order_total_price, order_status, is_cancelled, mode_payment, list_number, order_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'APPROVED', 'ORDER', $8, $9, $10)`,
        [
          req.user.account_username,
          item.productName || 'Product',
          item.flavor || '',
          item.cupSize || '',
          item.addOns || '',
          Number(item.quantity || 1),
          Number(item.total || total),
          paymentMethod || 'Cash',
          index + 1,
          orderType || 'Dine In',
        ]
      )
    );

    await Promise.all(insertPromises);

    return res.status(201).json({ message: 'Order placed successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to place order.', error: error.message });
  }
});

module.exports = router;
