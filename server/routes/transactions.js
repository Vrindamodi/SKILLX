import express from 'express';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get transaction history
router.get('/', auth, async (req, res) => {
  try {
    const { type, page = 1, limit = 20, startDate, endDate } = req.query;
    const query = { user: req.userId };
    
    if (type) query.type = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const transactions = await Transaction.find(query)
      .populate('otherUser', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await Transaction.countDocuments(query);
    
    res.json({ success: true, data: transactions, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get wallet summary
router.get('/wallet', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('wallet');
    
    // Get recent transactions
    const recentTransactions = await Transaction.find({ user: req.userId })
      .populate('otherUser', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Calculate monthly earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthlyEarnings = await Transaction.aggregate([
      {
        $match: {
          user: req.userId,
          type: { $in: ['escrow_release', 'referral_commission', 'bonus'] },
          createdAt: { $gte: startOfMonth },
          status: 'completed'
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    res.json({
      success: true,
      data: {
        wallet: user.wallet,
        recentTransactions,
        monthlyEarnings: monthlyEarnings[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add funds to wallet (simulated)
router.post('/add-funds', auth, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    
    const transaction = new Transaction({
      user: req.userId,
      type: 'payment',
      amount,
      status: 'completed',
      paymentMethod: paymentMethod || 'card',
      description: 'Added funds to wallet'
    });
    await transaction.save();
    
    await User.findByIdAndUpdate(req.userId, {
      $inc: { 'wallet.balance': amount }
    });
    
    const user = await User.findById(req.userId).select('wallet');
    
    res.json({ success: true, data: { wallet: user.wallet, transaction } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Withdraw funds (simulated)
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount, method, accountDetails } = req.body;
    const user = await User.findById(req.userId);
    
    if (amount < 100) {
      return res.status(400).json({ success: false, message: 'Minimum withdrawal is ₹100' });
    }
    if (user.wallet.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }
    
    const transaction = new Transaction({
      user: req.userId,
      type: 'withdrawal',
      amount: -amount,
      status: 'completed',
      paymentMethod: method || 'upi',
      withdrawal: {
        upiId: accountDetails?.upiId,
        bankAccount: accountDetails?.bankAccount,
        processedAt: new Date()
      },
      description: `Withdrawal to ${method || 'UPI'}`
    });
    await transaction.save();
    
    user.wallet.balance -= amount;
    await user.save();
    
    res.json({ success: true, data: { wallet: user.wallet, transaction } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
