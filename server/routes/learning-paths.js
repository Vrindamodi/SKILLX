import express from 'express';
import LearningPath from '../models/LearningPath.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all learning paths
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, featured } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (featured === 'true') query.featured = true;
    
    const paths = await LearningPath.find(query)
      .select('-enrolledUsers')
      .sort({ totalEnrolled: -1 });
    
    res.json({ success: true, data: paths });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get path details
router.get('/:id', async (req, res) => {
  try {
    const path = await LearningPath.findById(req.params.id);
    if (!path) return res.status(404).json({ success: false, message: 'Path not found' });
    res.json({ success: true, data: path });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Enroll in path
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const path = await LearningPath.findById(req.params.id);
    if (!path) return res.status(404).json({ success: false, message: 'Path not found' });
    
    const alreadyEnrolled = path.enrolledUsers.find(e => e.user.toString() === req.userId.toString());
    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, message: 'Already enrolled' });
    }
    
    path.enrolledUsers.push({
      user: req.userId,
      currentLevel: 1,
      completedLevels: [],
      progress: 0,
      startedAt: new Date(),
      lastActivityAt: new Date()
    });
    path.totalEnrolled += 1;
    await path.save();
    
    res.json({ success: true, data: path });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update progress
router.put('/:id/progress', auth, async (req, res) => {
  try {
    const path = await LearningPath.findById(req.params.id);
    if (!path) return res.status(404).json({ success: false, message: 'Path not found' });
    
    const enrollment = path.enrolledUsers.find(e => e.user.toString() === req.userId.toString());
    if (!enrollment) return res.status(400).json({ success: false, message: 'Not enrolled' });
    
    const { levelCompleted, capsulesEarned } = req.body;
    
    if (levelCompleted && !enrollment.completedLevels.includes(levelCompleted)) {
      enrollment.completedLevels.push(levelCompleted);
      enrollment.currentLevel = levelCompleted + 1;
    }
    if (capsulesEarned) enrollment.capsulesEarned += capsulesEarned;
    enrollment.progress = Math.round((enrollment.completedLevels.length / path.totalLevels) * 100);
    enrollment.lastActivityAt = new Date();
    
    await path.save();
    
    res.json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get my enrolled paths
router.get('/enrolled/me', auth, async (req, res) => {
  try {
    const paths = await LearningPath.find({ 'enrolledUsers.user': req.userId });
    
    const myPaths = paths.map(path => {
      const enrollment = path.enrolledUsers.find(e => e.user.toString() === req.userId.toString());
      return {
        ...path.toObject(),
        myProgress: enrollment
      };
    });
    
    res.json({ success: true, data: myPaths });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
