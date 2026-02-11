import express from 'express';
import User from '../models/User.js';
import Session from '../models/Session.js';
import Post from '../models/Post.js';
import Dispute from '../models/Dispute.js';
import Transaction from '../models/Transaction.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (status === 'banned') query['trust.isBanned'] = true;
    if (status === 'active') query['trust.isBanned'] = false;
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({ success: true, data: users, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Ban/unban user
router.put('/users/:id/ban', adminAuth, async (req, res) => {
  try {
    const { ban, reason } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, {
      'trust.isBanned': ban,
      'trust.banReason': reason
    }, { new: true });
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get platform stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const [
      totalUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      totalSessions,
      sessionsThisMonth,
      completedSessions,
      disputes,
      openDisputes
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } }),
      Session.countDocuments(),
      Session.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Session.countDocuments({ status: 'completed' }),
      Dispute.countDocuments(),
      Dispute.countDocuments({ status: { $in: ['open', 'ai_review', 'manual_review'] } })
    ]);
    
    const revenue = await Transaction.aggregate([
      { $match: { type: 'platform_fee', status: 'completed', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          newThisMonth: newUsersThisMonth,
          growth: newUsersLastMonth > 0 ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100) : 100
        },
        sessions: {
          total: totalSessions,
          thisMonth: sessionsThisMonth,
          completed: completedSessions,
          successRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0
        },
        disputes: {
          total: disputes,
          open: openDisputes,
          resolutionRate: disputes > 0 ? Math.round(((disputes - openDisputes) / disputes) * 100) : 0
        },
        revenue: {
          thisMonth: revenue[0]?.total || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Manage posts
router.get('/posts', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    
    const posts = await Post.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await Post.countDocuments(query);
    
    res.json({ success: true, data: posts, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Manage disputes
router.get('/disputes', adminAuth, async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate('raisedBy', 'name email')
      .populate('againstUser', 'name email')
      .populate('session')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: disputes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Fraud alerts
router.get('/fraud-alerts', adminAuth, async (req, res) => {
  try {
    // Simulated fraud detection
    const alerts = [
      {
        type: 'multiple_refunds',
        severity: 'high',
        description: 'User requested 3 refunds in 24 hours',
        userId: null,
        confidence: 85,
        timestamp: new Date()
      }
    ];
    
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
