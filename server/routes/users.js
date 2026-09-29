const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT account_id, account_username, account_email, account_image, is_logged
       FROM user_table WHERE account_username = $1`,
      [req.user.account_username]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({ user: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load profile.', error: error.message });
  }
});

module.exports = router;
