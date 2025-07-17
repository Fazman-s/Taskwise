const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = 'TASK_MANAGER_SECRET'; // hard-coded to match index.js

async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.id;
    req.isAdmin = decoded.role === 'admin';
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token', error: err.message });
  }
}

module.exports = authMiddleware;