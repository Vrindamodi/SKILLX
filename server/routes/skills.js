import express from 'express';
import Skill from '../models/Skill.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all skills (with categories)
router.get('/', async (req, res) => {
  try {
    const { category, search, trending } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (trending === 'true') query['metadata.trending'] = true;
    
    const skills = await Skill.find(query).sort({ 'metadata.demand': -1 });
    res.json({ success: true, data: skills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get skill categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Skill.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, skills: { $push: '$name' } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get trending skills
router.get('/trending', async (req, res) => {
  try {
    const trending = await Skill.find({ 'metadata.trending': true })
      .sort({ 'metadata.trendingScore': -1 })
      .limit(10);
    res.json({ success: true, data: trending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get skill by ID
router.get('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    
    // Increment search count
    skill.metadata.searchCount += 1;
    await skill.save();
    
    res.json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get skill demand data
router.get('/analytics/demand', auth, async (req, res) => {
  try {
    const skills = await Skill.find()
      .sort({ 'metadata.demand': -1 })
      .limit(20)
      .select('name category metadata');
    res.json({ success: true, data: skills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
