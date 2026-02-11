import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No auth token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'skillx-demo-secret-key-2024-super-secure');
    
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (user.trust.isBanned) {
      return res.status(403).json({ success: false, message: 'Account has been suspended' });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }
      next();
    });
  } catch (error) {
    res.status(403).json({ success: false, message: 'Access denied' });
  }
};

export const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET || 'skillx-demo-secret-key-2024-super-secure', 
    { expiresIn: '30d' }
  );
};
