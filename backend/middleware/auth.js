import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      // Get user from token, exclude password
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && ['admin', 'manager', 'support'].includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};

export const adminRoleCheck = (requiredRole) => {
  return (req, res, next) => {
    if (req.user && ['admin', 'manager', 'support'].includes(req.user.role)) {
      // Super admin can access everything
      if (req.user.adminRole === 'super_admin') {
        return next();
      }

      // Role-based access
      if (requiredRole && req.user.adminRole !== requiredRole) {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied. Required role: ${requiredRole}` 
        });
      }

      next();
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized as an admin' });
    }
  };
};
