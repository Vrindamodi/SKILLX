import express from 'express';
import User from '../models/User.js';
import Session from '../models/Session.js';
import Transaction from '../models/Transaction.js';
import Post from '../models/Post.js';
import SkillCapsule from '../models/SkillCapsule.js';
import Review from '../models/Review.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// User analytics dashboard
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    // Earnings data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const earningsData = await Transaction.aggregate([
      {
        $match: {
          user: req.userId,
          type: { $in: ['escrow_release', 'referral_commission'] },
          status: 'completed',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Session stats
    const sessions = await Session.find({
      $or: [{ learner: req.userId }, { teacher: req.userId }],
      status: 'completed'
    });
    
    const teachingSessions = sessions.filter(s => s.teacher.toString() === req.userId.toString());
    const learningSessions = sessions.filter(s => s.learner.toString() === req.userId.toString());
    
    // Capsules
    const capsules = await SkillCapsule.find({ learner: req.userId });
    
    // Reviews received
    const reviews = await Review.find({ reviewee: req.userId });
    
    // ROI calculation
    const totalInvested = user.wallet.totalSpent;
    const totalEarned = user.wallet.totalEarned;
    const roi = totalInvested > 0 ? Math.round(((totalEarned - totalInvested) / totalInvested) * 100) : 0;
    
    // Skills breakdown
    const skillBreakdown = {};
    capsules.forEach(c => {
      if (!skillBreakdown[c.skill]) {
        skillBreakdown[c.skill] = { capsules: 0, confidence: 0 };
      }
      skillBreakdown[c.skill].capsules += 1;
      skillBreakdown[c.skill].confidence += c.confidenceScore;
    });
    
    Object.keys(skillBreakdown).forEach(skill => {
      skillBreakdown[skill].avgConfidence = Math.round(
        skillBreakdown[skill].confidence / skillBreakdown[skill].capsules
      );
    });
    
    res.json({
      success: true,
      data: {
        earnings: {
          thisMonth: earningsData[earningsData.length - 1]?.total || 0,
          lastMonth: earningsData[earningsData.length - 2]?.total || 0,
          trend: earningsData,
          totalEarned,
          totalSpent: totalInvested,
          breakdown: {
            teaching: teachingSessions.reduce((s, sess) => s + (sess.payment.teacherReceives || 0), 0),
            referrals: 0,
            bonuses: 0
          }
        },
        teaching: {
          totalStudents: teachingSessions.length,
          successRate: user.skillDNA.successRate || 96,
          avgRating: user.stats.avgRating,
          totalSessions: teachingSessions.length,
          repeatStudentPercent: user.stats.repeatStudentPercent || 35
        },
        learning: {
          totalSessions: learningSessions.length,
          capsules: capsules.length,
          skillBreakdown
        },
        roi: {
          totalInvested,
          totalEarned,
          roi,
          profitLoss: totalEarned - totalInvested
        },
        gamification: user.gamification,
        impact: user.impact
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin analytics
router.get('/admin', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 'stats.lastActive': { $gte: new Date(Date.now() - 30 * 86400000) } });
    const totalSessions = await Session.countDocuments();
    const completedSessions = await Session.countDocuments({ status: 'completed' });
    const totalRevenue = await Transaction.aggregate([
      { $match: { type: 'platform_fee', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // User growth (last 6 months)
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 6 }
    ]);
    
    // Top skills
    const topSkills = await Post.aggregate([
      { $group: { _id: '$skill', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Top earners
    const topEarners = await User.find()
      .sort({ 'wallet.totalEarned': -1 })
      .limit(10)
      .select('name avatar wallet.totalEarned stats.avgRating gamification.level');
    
    // Top teachers
    const topTeachers = await User.find({ 'stats.sessionsAsTeacher': { $gt: 0 } })
      .sort({ 'stats.avgRating': -1 })
      .limit(10)
      .select('name avatar stats gamification.level');
    
    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalSessions,
          completedSessions,
          successRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        userGrowth,
        topSkills,
        topEarners,
        topTeachers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
