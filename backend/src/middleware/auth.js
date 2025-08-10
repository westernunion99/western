const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if(!header) return res.status(401).json({ error: 'Missing auth header' });
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if(req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}

module.exports = { requireAuth, requireAdmin };
