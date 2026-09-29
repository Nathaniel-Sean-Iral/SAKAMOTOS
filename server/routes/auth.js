const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { sendPasswordResetEmail, sendVerificationEmail } = require('../services/emailService');

const router = express.Router();

function createSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required.' });
  }

  try {
    const existing = await db.query(
      'SELECT account_id FROM user_table WHERE account_username = $1 OR account_email = $2',
      [username, email]
    );

    if (existing.rows.length) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const inserted = await db.query(
      `INSERT INTO user_table (account_username, account_email, account_password, is_logged)
       VALUES ($1, $2, $3, 'YES')
       RETURNING account_id, account_username, account_email`,
      [username, email, passwordHash]
    );

    const user = inserted.rows[0];
    const sessionId = createSessionId();
    await db.query(
      `INSERT INTO session_table (session_id, account_username, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [sessionId, user.account_username]
    );

    res.cookie('session_id', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: 'Registration successful.',
      user: {
        id: user.account_id,
        username: user.account_username,
        email: user.account_email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const result = await db.query(
      `SELECT account_id, account_username, account_email, account_password, is_logged
       FROM user_table
       WHERE account_username = $1 OR account_email = $1`,
      [username]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid login credentials.' });
    }

    const isValid = await bcrypt.compare(password, user.account_password);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid login credentials.' });
    }

    const sessionId = createSessionId();
    await db.query(
      `INSERT INTO session_table (session_id, account_username, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')
       ON CONFLICT (session_id) DO UPDATE SET account_username = EXCLUDED.account_username, expires_at = EXCLUDED.expires_at`,
      [sessionId, user.account_username]
    );

    await db.query(
      `UPDATE user_table SET is_logged = 'YES' WHERE account_username = $1`,
      [user.account_username]
    );

    res.cookie('session_id', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: 'Login successful.',
      user: {
        id: user.account_id,
        username: user.account_username,
        email: user.account_email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed.', error: error.message });
  }
});

router.post('/logout', async (req, res) => {
  const sessionId = req.cookies?.session_id;

  if (sessionId) {
    await db.query('DELETE FROM session_table WHERE session_id = $1', [sessionId]);
  }

  res.clearCookie('session_id');
  return res.json({ message: 'Logged out.' });
});

router.get('/me', requireAuth, async (req, res) => {
  return res.json({ user: { username: req.user.account_username, id: req.user.account_id } });
});

router.post('/forgot', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const result = await db.query('SELECT account_username FROM user_table WHERE account_email = $1', [email]);

    if (!result.rows.length) {
      return res.status(404).json({ message: 'No account found for that email.' });
    }

    const resetLink = `${process.env.APP_BASE_URL || 'http://localhost:3000'}/reset?email=${encodeURIComponent(email)}`;
    await sendPasswordResetEmail({ to: email, resetLink });

    return res.json({ message: 'Password reset email sent.' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to send reset email.', error: error.message });
  }
});

router.post('/verify', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const verificationLink = `${process.env.APP_BASE_URL || 'http://localhost:3000'}/verify?email=${encodeURIComponent(email)}`;
    await sendVerificationEmail({ to: email, verificationLink });
    return res.json({ message: 'Verification email sent.' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to send verification email.', error: error.message });
  }
});

module.exports = router;
