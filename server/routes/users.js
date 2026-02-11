import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Complete profile setup
router.put('/complete-profile', auth, async (req, res) => {
  try {
    const { name, age, city, locality, languages, gender, bio, skillsKnown, skillsLearning } = req.body;
    
    const user = await User.findById(req.userId);
    if (name) user.name = name;
    if (age) user.age = age;
    if (city) user.city = city;
    if (locality) user.locality = locality;
    if (languages) user.languages = languages;
    if (gender) user.gender = gender;
    if (bio) user.bio = bio;
    if (skillsKnown) user.skillDNA.skillsKnown = skillsKnown;
    if (skillsLearning) user.skillDNA.skillsLearning = skillsLearning;
    
    user.profileCompleted = true;
    await user.save();
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Complete onboarding
router.put('/complete-onboarding', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId, 
      { onboardingCompleted: true }, 
      { new: true }
    );
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Switch mode
router.put('/switch-mode', auth, async (req, res) => {
  try {
    const { mode } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { currentMode: mode }, { new: true });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user profile (public)
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -privacy.contactPrivacy.blockedUsers');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Apply privacy settings
    const isOwner = req.userId.toString() === user._id.toString();
    if (!isOwner) {
      if (user.privacy.profileVisibility === 'private') {
        return res.status(403).json({ success: false, message: 'Profile is private' });
      }
      if (!user.privacy.activityPrivacy.showEarnings) {
        user.stats.totalEarnings = undefined;
        user.wallet = undefined;
      }
      if (!user.privacy.activityPrivacy.showSessionCount) {
        user.stats.sessionsAsTeacher = undefined;
        user.stats.sessionsAsLearner = undefined;
      }
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update privacy settings
router.put('/privacy', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { privacy: req.body },
      { new: true }
    );
    res.json({ success: true, data: user.privacy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update notification settings
router.put('/notification-settings', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { notificationSettings: req.body },
      { new: true }
    );
    res.json({ success: true, data: user.notificationSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Follow a user
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });
    
    const currentUser = await User.findById(req.userId);
    
    if (currentUser.following.includes(req.params.id)) {
      // Unfollow
      currentUser.following.pull(req.params.id);
      targetUser.followers.pull(req.userId);
    } else {
      // Follow
      currentUser.following.push(req.params.id);
      targetUser.followers.push(req.userId);
    }
    
    await currentUser.save();
    await targetUser.save();
    
    res.json({ success: true, data: { following: currentUser.following } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Block user
router.post('/:id/block', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.privacy.contactPrivacy.blockedUsers.includes(req.params.id)) {
      user.privacy.contactPrivacy.blockedUsers.push(req.params.id);
    }
    await user.save();
    res.json({ success: true, message: 'User blocked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Search users
router.get('/', auth, async (req, res) => {
  try {
    const { q, skill, city, mode, page = 1, limit = 20 } = req.query;
    const query = { 'privacy.searchPrivacy.appearInSearch': true };
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { 'skillDNA.skillsKnown.skill': { $regex: q, $options: 'i' } }
      ];
    }
    if (skill) query['skillDNA.skillsKnown.skill'] = { $regex: skill, $options: 'i' };
    if (city) query.city = { $regex: city, $options: 'i' };
    if (mode) query.currentMode = mode;
    
    const users = await User.find(query)
      .select('name avatar city skillDNA.skillsKnown stats gamification.level gamification.badges teachingProfile.hourlyRate')
      .limit(limit)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.json({ success: true, data: users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update teaching profile
router.put('/teaching-profile', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { teachingProfile: req.body },
      { new: true }
    );
    res.json({ success: true, data: user.teachingProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update avatar
router.put('/avatar', auth, async (req, res) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { avatar }, { new: true });
    res.json({ success: true, data: { avatar: user.avatar } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
