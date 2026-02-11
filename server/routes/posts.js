import express from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Create post/listing
router.post('/', auth, async (req, res) => {
  try {
    const post = new Post({
      ...req.body,
      author: req.userId
    });
    await post.save();
    
    const populatedPost = await Post.findById(post._id).populate('author', 'name avatar city stats gamification.level');
    
    // Add XP for posting
    await User.findByIdAndUpdate(req.userId, { $inc: { 'gamification.xp': 10 } });
    
    res.status(201).json({ success: true, data: populatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get posts with filters
router.get('/', async (req, res) => {
  try {
    const { 
      mode, category, skill, city, priceMin, priceMax, 
      duration, rating, isOnline, sort, page = 1, limit = 20,
      status = 'active', search
    } = req.query;
    
    const query = { status };
    
    if (mode) query.mode = mode;
    if (category) query.category = category;
    if (skill) query.skill = { $regex: skill, $options: 'i' };
    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (priceMin || priceMax) {
      query['pricing.amount'] = {};
      if (priceMin) query['pricing.amount'].$gte = Number(priceMin);
      if (priceMax) query['pricing.amount'].$lte = Number(priceMax);
    }
    if (isOnline !== undefined) query.isOnline = isOnline === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skill: { $regex: search, $options: 'i' } }
      ];
    }
    
    let sortOption = { createdAt: -1 };
    if (sort === 'price_low') sortOption = { 'pricing.amount': 1 };
    if (sort === 'price_high') sortOption = { 'pricing.amount': -1 };
    if (sort === 'popular') sortOption = { views: -1 };
    
    const posts = await Post.find(query)
      .populate('author', 'name avatar city stats.avgRating gamification.level gamification.badges skillDNA.skillsKnown teachingProfile.hourlyRate')
      .sort(sortOption)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await Post.countDocuments(query);
    
    res.json({
      success: true,
      data: posts,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get my posts
router.get('/my-posts', auth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.userId })
      .populate('author', 'name avatar')
      .populate('responses.user', 'name avatar stats.avgRating')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name avatar city bio stats gamification skillDNA teachingProfile')
      .populate('responses.user', 'name avatar stats.avgRating gamification.level');
    
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    
    post.views += 1;
    await post.save();
    
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Respond to a post (express interest)
router.post('/:id/respond', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    
    const existingResponse = post.responses.find(r => r.user.toString() === req.userId.toString());
    if (existingResponse) {
      return res.status(400).json({ success: false, message: 'Already responded' });
    }
    
    post.responses.push({
      user: req.userId,
      message: req.body.message || 'Interested!'
    });
    await post.save();
    
    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name avatar')
      .populate('responses.user', 'name avatar stats.avgRating');
    
    res.json({ success: true, data: updatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Accept/reject response
router.put('/:id/respond/:responseId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const response = post.responses.id(req.params.responseId);
    if (!response) return res.status(404).json({ success: false, message: 'Response not found' });
    
    response.status = req.body.status;
    if (req.body.status === 'accepted') {
      post.status = 'matched';
    }
    await post.save();
    
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Like a post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    
    const likeIndex = post.likes.indexOf(req.userId);
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(req.userId);
    }
    await post.save();
    
    res.json({ success: true, data: { likes: post.likes.length, liked: post.likes.includes(req.userId) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bookmark a post
router.post('/:id/bookmark', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    
    const bmIndex = post.bookmarks.indexOf(req.userId);
    if (bmIndex > -1) {
      post.bookmarks.splice(bmIndex, 1);
    } else {
      post.bookmarks.push(req.userId);
    }
    await post.save();
    
    res.json({ success: true, data: { bookmarked: post.bookmarks.includes(req.userId) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update post
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, author: req.userId });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    
    Object.assign(post, req.body);
    await post.save();
    
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Close/delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, author: req.userId });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    
    post.status = 'closed';
    await post.save();
    
    res.json({ success: true, message: 'Post closed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
