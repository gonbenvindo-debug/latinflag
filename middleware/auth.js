const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

const auth = {
  // Middleware for required authentication
  required: async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const customer = await Customer.findById(decoded.id).select('-password');
      
      if (!customer || !customer.isActive) {
        return res.status(401).json({ error: 'Token inválido.' });
      }
      
      req.user = {
        id: customer._id,
        email: customer.email,
        name: customer.name,
        isGuest: customer.isGuest
      };
      
      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(401).json({ error: 'Token inválido.' });
    }
  },
  
  // Middleware for optional authentication
  optional: async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const customer = await Customer.findById(decoded.id).select('-password');
        
        if (customer && customer.isActive) {
          req.user = {
            id: customer._id,
            email: customer.email,
            name: customer.name,
            isGuest: customer.isGuest
          };
        }
      }
      
      next();
    } catch (error) {
      // Continue without authentication for optional routes
      next();
    }
  },
  
  // Admin middleware
  admin: (req, res, next) => {
    // For now, check if user has admin email
    // In production, use proper role-based access control
    if (req.user && req.user.email === process.env.ADMIN_EMAIL) {
      next();
    } else {
      res.status(403).json({ error: 'Acesso negado. Privilegios de administrador necessários.' });
    }
  }
};

module.exports = auth;
