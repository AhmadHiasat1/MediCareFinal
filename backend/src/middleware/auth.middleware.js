import jwt from 'jsonwebtoken';
import { findById, query } from '../utils/db.js';

// Set a default JWT secret if not provided in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'medicare_super_secret_key_2024';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        error: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Decoded token:', decoded); // Debug log

      // Get user from token with role-specific profile
      const userQuery = `
        SELECT u.*, 
          CASE 
            WHEN u.role = 'doctor' THEN (
              SELECT json_build_object(
                'id', d.id,
                'specialization', d.specialization
              )
              FROM doctors d 
              WHERE d.user_id = u.id
            )
            WHEN u.role = 'patient' THEN (
              SELECT json_build_object(
                'id', p.id
              )
              FROM patients p 
              WHERE p.user_id = u.id
            )
          END as profile
        FROM users u
        WHERE u.id = $1
      `;
      
      const user = (await query(userQuery, [decoded.id]))[0];
      console.log('Found user:', user ? 'yes' : 'no'); // Debug log

      if (!user) {
        console.log('User not found with ID:', decoded.id); // Debug log
        return res.status(401).json({
          error: 'User no longer exists'
        });
      }

      if (!user.is_active) {
        return res.status(401).json({
          error: 'Your account has been deactivated'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        error: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Error authenticating user'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
}; 