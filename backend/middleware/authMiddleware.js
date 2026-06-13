const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'skillsync-jwt-super-secret-key-123';

/**
 * Verify JWT from the request authorization header.
 * If invalid or missing, sends a 401 response and returns null.
 * Otherwise, returns the decoded user ID.
 */
function verifyToken(req, res) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ error: 'Invalid token format. Use "Bearer <token>".' });
    return null;
  }

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user_id = decoded.userId;
    return decoded.userId;
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
    return null;
  }
}

module.exports = { verifyToken, JWT_SECRET };
