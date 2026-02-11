import express from 'express';
import Review from '../models/Review.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Create review
router.post('/', auth, async (req, res) => {
  try {
    const review = new Review({ ...req.body, reviewer: req.userId });
    await review.save();
    
    // Update reviewee's average rating
    const reviews = await Review.find({ reviewee: req.body.reviewee });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await User.findByIdAndUpdate(req.body.reviewee, {
      'stats.avgRating': Math.round(avgRating * 10) / 10,
      'stats.totalReviews': reviews.length
    });
    
    // Add XP
    await User.findByIdAndUpdate(req.userId, { $inc: { 'gamification.xp': 15 } });
    
    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'name avatar')
      .populate('reviewee', 'name avatar');
    
    res.status(201).json({ success: true, data: populatedReview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get reviews for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { skill, sort = 'recent', page = 1, limit = 10 } = req.query;
    const query = { reviewee: req.params.userId };
    if (skill) query.skill = skill;
    
    let sortOption = { createdAt: -1 };
    if (sort === 'rating_high') sortOption = { rating: -1 };
    if (sort === 'rating_low') sortOption = { rating: 1 };
    if (sort === 'helpful') sortOption = { 'helpfulVotes.length': -1 };
    
    const reviews = await Review.find(query)
      .populate('reviewer', 'name avatar gamification.level')
      .sort(sortOption)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await Review.countDocuments(query);
    
    // Rating breakdown
    const breakdown = await Review.aggregate([
      { $match: { reviewee: req.params.userId } },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ]);
    
    res.json({ success: true, data: reviews, total, breakdown });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Respond to review
router.put('/:id/respond', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.reviewee.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    review.response = { content: req.body.content, createdAt: new Date() };
    await review.save();
    
    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Vote review as helpful
router.post('/:id/helpful', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    const idx = review.helpfulVotes.indexOf(req.userId);
    if (idx > -1) {
      review.helpfulVotes.splice(idx, 1);
    } else {
      review.helpfulVotes.push(req.userId);
    }
    await review.save();
    res.json({ success: true, data: { helpful: review.helpfulVotes.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
