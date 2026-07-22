/**
 * File: backend/middleware/auth.js
 * Purpose: Provides middleware functions for request interception and validation.
 */
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const setNoCacheHeaders = (res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
};

export const protect = async (req, res, next) => {
  setNoCacheHeaders(res);
  
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (token) {
    try {

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      // Get user from token, exclude password
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      // Admin Session verification
      if (decoded.sessionId) {
        const session = req.user.sessions.find(s => s.sessionId === decoded.sessionId);
        if (!session) {
          return res.status(401).json({ success: false, message: 'Session expired or invalidated. Please log in again.' });
        }
        
        // Auto-expire after 30 mins of inactivity
        if (session.lastActive && Date.now() - new Date(session.lastActive).getTime() > 30 * 60 * 1000) {
          req.user.sessions = req.user.sessions.filter(s => s.sessionId !== decoded.sessionId);
          await req.user.save();
          return res.status(401).json({ success: false, message: 'Session expired due to inactivity. Please log in again.' });
        }
        
        // Update lastActive
        session.lastActive = Date.now();
        await req.user.save();
      }

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Session expired, please login again' });
      }
      return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

export const admin = (req, res, next) => {
  setNoCacheHeaders(res);
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
