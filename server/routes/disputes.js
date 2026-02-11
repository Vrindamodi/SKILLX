import express from 'express';
import Dispute from '../models/Dispute.js';
import Session from '../models/Session.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Create dispute
router.post('/', auth, async (req, res) => {
  try {
    const { sessionId, reason, description, evidence } = req.body;
    
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    
    const againstUser = session.learner.toString() === req.userId.toString() ? session.teacher : session.learner;
    
    const dispute = new Dispute({
      session: sessionId,
      raisedBy: req.userId,
      againstUser,
      reason,
      description,
      evidence,
      disputedAmount: session.payment.amount,
      timeline: [{ action: 'Dispute opened', actor: 'user', notes: description }]
    });
    
    // Auto AI analysis
    dispute.aiAnalysis = {
      recommendation: reason === 'no_show' ? 'Auto-refund recommended' : 'Manual review needed',
      confidence: reason === 'no_show' ? 95 : 60,
      factors: [reason]
    };
    
    if (reason === 'no_show') {
      dispute.status = 'ai_review';
      dispute.timeline.push({ action: 'AI review initiated', actor: 'system' });
    }
    
    await dispute.save();
    
    // Update session status
    session.status = 'disputed';
    await session.save();
    
    res.status(201).json({ success: true, data: dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get my disputes
router.get('/my-disputes', auth, async (req, res) => {
  try {
    const disputes = await Dispute.find({
      $or: [{ raisedBy: req.userId }, { againstUser: req.userId }]
    })
      .populate('raisedBy', 'name avatar')
      .populate('againstUser', 'name avatar')
      .populate('session')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: disputes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get dispute by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('raisedBy', 'name avatar')
      .populate('againstUser', 'name avatar')
      .populate('session');
    
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });
    
    res.json({ success: true, data: dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Resolve dispute (admin)
router.put('/:id/resolve', auth, async (req, res) => {
  try {
    const { resolutionType, amount, notes } = req.body;
    
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });
    
    dispute.resolution = {
      type: resolutionType,
      amount: amount || dispute.disputedAmount,
      resolvedBy: 'admin',
      notes,
      resolvedAt: new Date()
    };
    dispute.status = 'resolved';
    dispute.timeline.push({ action: `Resolved: ${resolutionType}`, actor: 'admin', notes });
    
    await dispute.save();
    
    res.json({ success: true, data: dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Appeal dispute
router.post('/:id/appeal', auth, async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });
    
    dispute.appeal = {
      filed: true,
      reason: req.body.reason,
      filedAt: new Date()
    };
    dispute.status = 'arbitration';
    dispute.timeline.push({ action: 'Appeal filed', actor: 'user', notes: req.body.reason });
    
    await dispute.save();
    
    res.json({ success: true, data: dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
