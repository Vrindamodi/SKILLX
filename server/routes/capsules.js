import express from 'express';
import SkillCapsule from '../models/SkillCapsule.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get capsules for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { skill, category } = req.query;
    const query = { learner: req.params.userId, isPublic: true };
    if (skill) query.skill = { $regex: skill, $options: 'i' };
    if (category) query.category = category;
    
    const capsules = await SkillCapsule.find(query)
      .populate('teacher', 'name avatar')
      .populate('learner', 'name avatar')
      .sort({ dateCompleted: -1 });
    
    res.json({ success: true, data: capsules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get my capsules
router.get('/my-capsules', auth, async (req, res) => {
  try {
    const capsules = await SkillCapsule.find({ learner: req.userId })
      .populate('teacher', 'name avatar')
      .sort({ dateCompleted: -1 });
    res.json({ success: true, data: capsules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get capsules I issued as teacher
router.get('/issued', auth, async (req, res) => {
  try {
    const capsules = await SkillCapsule.find({ teacher: req.userId })
      .populate('learner', 'name avatar')
      .sort({ dateCompleted: -1 });
    res.json({ success: true, data: capsules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify capsule
router.get('/:id/verify', async (req, res) => {
  try {
    const capsule = await SkillCapsule.findById(req.params.id)
      .populate('learner', 'name avatar')
      .populate('teacher', 'name avatar stats.avgRating');
    
    if (!capsule) return res.status(404).json({ success: false, message: 'Capsule not found' });
    
    capsule.viewCount += 1;
    await capsule.save();
    
    res.json({
      success: true,
      data: {
        verified: true,
        capsule,
        completionCode: capsule.completionCode,
        dateCompleted: capsule.dateCompleted,
        teacherVerified: capsule.verificationMethod === 'teacher'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Share capsule
router.post('/:id/share', auth, async (req, res) => {
  try {
    const capsule = await SkillCapsule.findById(req.params.id);
    if (!capsule) return res.status(404).json({ success: false, message: 'Capsule not found' });
    
    capsule.sharedOn.push({ platform: req.body.platform, sharedAt: new Date() });
    await capsule.save();
    
    res.json({ success: true, data: { shareableLink: capsule.shareableLink } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Capsule stats
router.get('/stats', auth, async (req, res) => {
  try {
    const capsules = await SkillCapsule.find({ learner: req.userId });
    
    const skillGroups = {};
    capsules.forEach(c => {
      if (!skillGroups[c.skill]) skillGroups[c.skill] = [];
      skillGroups[c.skill].push(c);
    });
    
    const mastered = Object.entries(skillGroups).filter(([_, caps]) => caps.length >= 5);
    
    res.json({
      success: true,
      data: {
        totalCapsules: capsules.length,
        skillsMastered: mastered.length,
        avgConfidence: capsules.length ? Math.round(capsules.reduce((s, c) => s + c.confidenceScore, 0) / capsules.length) : 0,
        skillBreakdown: Object.entries(skillGroups).map(([skill, caps]) => ({
          skill,
          count: caps.length,
          mastered: caps.length >= 5
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
