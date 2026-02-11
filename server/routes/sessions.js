import express from 'express';
import Session from '../models/Session.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import SkillCapsule from '../models/SkillCapsule.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Create session
router.post('/', auth, async (req, res) => {
  try {
    const { teacherId, skill, subSkill, sessionType, date, startTime, duration, amount, isOnline, postId } = req.body;
    
    const platformFee = Math.round(amount * 0.05);
    const teacherReceives = amount - platformFee;
    
    const session = new Session({
      learner: req.userId,
      teacher: teacherId,
      post: postId,
      skill,
      subSkill,
      sessionType: sessionType || 'learn_teach',
      scheduling: {
        date: new Date(date),
        startTime,
        duration: duration || 45,
        isOnline: isOnline !== false,
        meetingLink: isOnline !== false ? `https://meet.skillx.com/${Date.now().toString(36)}` : ''
      },
      payment: {
        amount,
        platformFee,
        teacherReceives
      }
    });
    
    await session.save();
    
    const populatedSession = await Session.findById(session._id)
      .populate('learner', 'name avatar')
      .populate('teacher', 'name avatar');
    
    res.status(201).json({ success: true, data: populatedSession });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get my sessions
router.get('/my-sessions', auth, async (req, res) => {
  try {
    const { role, status } = req.query;
    const query = {};
    
    if (role === 'teacher') {
      query.teacher = req.userId;
    } else if (role === 'learner') {
      query.learner = req.userId;
    } else {
      query.$or = [{ learner: req.userId }, { teacher: req.userId }];
    }
    
    if (status) query.status = status;
    
    const sessions = await Session.find(query)
      .populate('learner', 'name avatar stats gamification.level')
      .populate('teacher', 'name avatar stats gamification.level')
      .sort({ 'scheduling.date': -1 });
    
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get session by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('learner', 'name avatar bio skillDNA stats gamification')
      .populate('teacher', 'name avatar bio skillDNA stats gamification teachingProfile');
    
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Confirm session (teacher accepts)
router.put('/:id/confirm', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    
    session.status = 'confirmed';
    await session.save();
    
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Pay for session (escrow)
router.put('/:id/pay', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    
    // Create escrow transaction
    const transaction = new Transaction({
      user: req.userId,
      type: 'escrow_lock',
      amount: session.payment.amount,
      status: 'completed',
      session: session._id,
      otherUser: session.teacher,
      paymentMethod: req.body.paymentMethod || 'wallet',
      escrow: { lockedAt: new Date() },
      description: `Escrow for ${session.skill} session`,
      breakdown: {
        subtotal: session.payment.amount,
        platformFee: session.payment.platformFee,
        platformFeePercent: 5,
        netAmount: session.payment.teacherReceives
      }
    });
    await transaction.save();
    
    // Update user wallet
    await User.findByIdAndUpdate(req.userId, {
      $inc: { 
        'wallet.balance': -session.payment.amount,
        'wallet.pendingEscrow': session.payment.amount,
        'wallet.totalSpent': session.payment.amount
      }
    });
    
    session.status = 'escrow_paid';
    session.payment.escrowStatus = 'locked';
    session.payment.paidAt = new Date();
    await session.save();
    
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start session
router.put('/:id/start', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    
    session.status = 'in_progress';
    await session.save();
    
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Complete session & verify outcome
router.put('/:id/verify-outcome', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    
    const { confirmed, feedback } = req.body;
    const isLearner = session.learner.toString() === req.userId.toString();
    
    if (isLearner) {
      session.outcome.learnerConfirmed = confirmed;
      session.outcome.learnerFeedback = feedback;
    } else {
      session.outcome.teacherConfirmed = confirmed;
      session.outcome.teacherFeedback = feedback;
    }
    
    // If both confirmed, release payment
    if (session.outcome.learnerConfirmed && session.outcome.teacherConfirmed) {
      session.status = 'completed';
      session.outcome.completedAt = new Date();
      session.payment.escrowStatus = 'released';
      session.payment.releasedAt = new Date();
      
      // Release payment to teacher
      const releaseTransaction = new Transaction({
        user: session.teacher,
        type: 'escrow_release',
        amount: session.payment.teacherReceives,
        status: 'completed',
        session: session._id,
        otherUser: session.learner,
        description: `Payment for ${session.skill} session`,
        breakdown: {
          subtotal: session.payment.amount,
          platformFee: session.payment.platformFee,
          platformFeePercent: 5,
          netAmount: session.payment.teacherReceives
        }
      });
      await releaseTransaction.save();
      
      // Update teacher wallet
      await User.findByIdAndUpdate(session.teacher, {
        $inc: {
          'wallet.balance': session.payment.teacherReceives,
          'wallet.totalEarned': session.payment.teacherReceives,
          'stats.sessionsAsTeacher': 1,
          'stats.totalEarnings': session.payment.teacherReceives,
          'gamification.xp': 50
        }
      });
      
      // Update learner wallet and stats
      await User.findByIdAndUpdate(session.learner, {
        $inc: {
          'wallet.pendingEscrow': -session.payment.amount,
          'stats.sessionsAsLearner': 1,
          'gamification.xp': 30
        }
      });
      
      // Generate Skill Capsule
      const capsule = new SkillCapsule({
        learner: session.learner,
        teacher: session.teacher,
        session: session._id,
        skill: session.skill,
        subSkill: session.subSkill,
        outcome: session.outcome.learnerFeedback || 'Successfully completed',
        duration: session.scheduling.duration,
        confidenceScore: 85
      });
      await capsule.save();
    }
    
    session.status = session.outcome.learnerConfirmed && session.outcome.teacherConfirmed ? 'completed' : 'outcome_pending';
    await session.save();
    
    const populatedSession = await Session.findById(session._id)
      .populate('learner', 'name avatar')
      .populate('teacher', 'name avatar');
    
    res.json({ success: true, data: populatedSession });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload proof (for local services)
router.put('/:id/proof', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    
    session.proof = { ...session.proof, ...req.body };
    await session.save();
    
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel session
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    
    session.status = 'cancelled';
    session.cancellationReason = req.body.reason;
    session.cancelledBy = req.userId;
    
    // Refund if escrow was paid
    if (session.payment.escrowStatus === 'locked') {
      session.payment.escrowStatus = 'refunded';
      
      await User.findByIdAndUpdate(session.learner, {
        $inc: {
          'wallet.balance': session.payment.amount,
          'wallet.pendingEscrow': -session.payment.amount
        }
      });
      
      const refundTransaction = new Transaction({
        user: session.learner,
        type: 'refund',
        amount: session.payment.amount,
        status: 'completed',
        session: session._id,
        description: `Refund for cancelled ${session.skill} session`
      });
      await refundTransaction.save();
    }
    
    await session.save();
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Rate session
router.put('/:id/rate', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    
    const { rating, review } = req.body;
    const isLearner = session.learner.toString() === req.userId.toString();
    
    if (isLearner) {
      session.ratings.teacherRating = rating;
      session.ratings.learnerReview = review;
    } else {
      session.ratings.learnerRating = rating;
      session.ratings.teacherReview = review;
    }
    
    await session.save();
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
