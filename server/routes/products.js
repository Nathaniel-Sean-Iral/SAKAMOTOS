const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.product_id, p.product_name, p.product_code, p.category_code, p.product_price,
              p.product_image, p.product_status, p.minutes,
              c.category_name
       FROM product_table p
       LEFT JOIN category_table c ON c.category_code = p.category_code
       WHERE p.product_status = 'Available'
       ORDER BY c.category_name ASC, p.product_name ASC`
    );

    const categories = {};

    result.rows.forEach((product) => {
      const key = product.category_name || 'General';
      if (!categories[key]) categories[key] = [];
      categories[key].push(product);
    });

    return res.json({ categories });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch products.', error: error.message });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT product_name, product_price, product_image
       FROM product_table
       WHERE product_status = 'Available'
       ORDER BY product_name ASC
       LIMIT 6`
    );

    return res.json({ items: result.rows });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch featured products.', error: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { name, categoryCode, price, image, minutes } = req.body;

  if (!name || !categoryCode || !price) {
    return res.status(400).json({ message: 'Name, category, and price are required.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO product_table (product_name, category_code, product_price, product_image, minutes, product_status)
       VALUES ($1, $2, $3, $4, $5, 'Available')
       RETURNING *`,
      [name, categoryCode, Number(price), image || '', Number(minutes || 0)]
    );

    return res.status(201).json({ message: 'Product added.', product: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to save product.', error: error.message });
  }
});

module.exports = router;
