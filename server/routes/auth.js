import express from 'express';
import User from '../models/User.js';
import { generateToken, auth } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Password validation
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must include uppercase letter' });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must include lowercase letter' });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must include a number' });
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must include a special character' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          currentMode: user.currentMode,
          profileCompleted: user.profileCompleted,
          onboardingCompleted: user.onboardingCompleted
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Update last active
    user.stats.lastActive = new Date();
    
    // Update daily login streak
    const today = new Date().toDateString();
    const lastLogin = user.gamification.streaks.dailyLogin.lastDate;
    if (!lastLogin || new Date(lastLogin).toDateString() !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastLogin && new Date(lastLogin).toDateString() === yesterday) {
        user.gamification.streaks.dailyLogin.current += 1;
      } else {
        user.gamification.streaks.dailyLogin.current = 1;
      }
      if (user.gamification.streaks.dailyLogin.current > user.gamification.streaks.dailyLogin.best) {
        user.gamification.streaks.dailyLogin.best = user.gamification.streaks.dailyLogin.current;
      }
      user.gamification.streaks.dailyLogin.lastDate = new Date();
      user.gamification.xp += 5; // Daily login XP
    }
    
    await user.save();

    const token = generateToken(user._id);
    
    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          currentMode: user.currentMode,
          profileCompleted: user.profileCompleted,
          onboardingCompleted: user.onboardingCompleted,
          gamification: user.gamification,
          wallet: user.wallet,
          stats: user.stats,
          trust: user.trust
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
