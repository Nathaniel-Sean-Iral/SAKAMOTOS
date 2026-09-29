const db = require('../db');

async function requireAuth(req, res, next) {
  const sessionId = req.cookies?.session_id;

  if (!sessionId) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const { rows } = await db.query(
      `SELECT s.account_username, u.account_id, u.is_logged
       FROM session_table s
       JOIN user_table u ON u.account_username = s.account_username
       WHERE s.session_id = $1 AND s.expires_at > NOW()`,
      [sessionId]
    );

    if (!rows.length) {
      return res.status(401).json({ message: 'Session expired or invalid.' });
    }

    req.user = rows[0];
    return next();
  } catch (error) {
    return res.status(500).json({ message: 'Authentication check failed.', error: error.message });
  }
}

module.exports = { requireAuth };
