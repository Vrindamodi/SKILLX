import express from 'express';
import Referral from '../models/Referral.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get my referral info
router.get('/my-referrals', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('referralCode');
    
    const referrals = await Referral.find({ referrer: req.userId })
      .populate('referred', 'name avatar stats.sessionsAsLearner')
      .sort({ createdAt: -1 });
    
    const totalEarnings = referrals.reduce((sum, r) => sum + r.earnings.totalEarned, 0);
    const activeReferrals = referrals.filter(r => r.status === 'active').length;
    
    res.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralLink: `${process.env.CLIENT_URL}/register?ref=${user.referralCode}`,
        referrals,
        stats: {
          totalReferrals: referrals.length,
          activeReferrals,
          totalEarnings,
          pendingEarnings: referrals.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.earnings.signupBonus, 0)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Track referral click
router.post('/track', async (req, res) => {
  try {
    const { referralCode, source } = req.body;
    
    const referrer = await User.findOne({ referralCode });
    if (!referrer) return res.status(404).json({ success: false, message: 'Invalid referral code' });
    
    res.json({ success: true, data: { referrerName: referrer.name, referralCode } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const topReferrers = await Referral.aggregate([
      { $group: { _id: '$referrer', totalReferrals: { $sum: 1 }, totalEarned: { $sum: '$earnings.totalEarned' } } },
      { $sort: { totalReferrals: -1 } },
      { $limit: 10 }
    ]);
    
    // Populate user details
    const populatedLeaderboard = await User.populate(topReferrers, {
      path: '_id',
      select: 'name avatar gamification.level'
    });
    
    res.json({ success: true, data: populatedLeaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
