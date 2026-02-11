import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Personal Info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  age: { type: Number, min: 18 },
  city: { type: String },
  locality: { type: String },
  languages: [{ type: String }],
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  phone: { type: String },
  socialLinks: {
    linkedin: String,
    github: String,
    twitter: String,
    website: String
  },
  
  // Role & Mode
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  currentMode: { 
    type: String, 
    enum: ['learn', 'teach', 'rent', 'service', 'request'], 
    default: 'learn' 
  },
  
  // Skill DNA
  skillDNA: {
    skillsKnown: [{
      skill: { type: String },
      subSkills: [String],
      confidenceLevel: { type: Number, min: 1, max: 5, default: 3 },
      yearsExperience: { type: Number, default: 0 },
      canTeach: { type: Boolean, default: false }
    }],
    skillsLearning: [{
      skill: { type: String },
      targetLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
      priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' }
    }],
    successRate: { type: Number, default: 0 },
    learningVelocity: { type: Number, default: 50 },
    incomePotential: { type: Number, default: 0 },
    idealSessionDuration: { type: Number, default: 45 }
  },
  
  // Gamification
  gamification: {
    xp: { type: Number, default: 0 },
    level: { 
      type: String, 
      enum: ['bronze', 'silver', 'gold', 'platinum', 'legend'], 
      default: 'bronze' 
    },
    badges: [{
      id: String,
      name: String,
      icon: String,
      earnedAt: { type: Date, default: Date.now },
      description: String
    }],
    streaks: {
      dailyLogin: { current: { type: Number, default: 0 }, best: { type: Number, default: 0 }, lastDate: Date },
      teaching: { current: { type: Number, default: 0 }, best: { type: Number, default: 0 }, lastDate: Date },
      learning: { current: { type: Number, default: 0 }, best: { type: Number, default: 0 }, lastDate: Date },
      sessionCompletion: { current: { type: Number, default: 0 }, best: { type: Number, default: 0 } }
    },
    questProgress: {
      daily: [{ questId: String, progress: Number, target: Number, completed: Boolean }],
      weekly: [{ questId: String, progress: Number, target: Number, completed: Boolean }],
      monthly: [{ questId: String, progress: Number, target: Number, completed: Boolean }]
    }
  },
  
  // Wallet
  wallet: {
    balance: { type: Number, default: 0 },
    pendingEscrow: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }
  },
  
  // Privacy
  privacy: {
    profileVisibility: { 
      type: String, 
      enum: ['public', 'platform_users', 'connections', 'private'], 
      default: 'public' 
    },
    locationPrivacy: { 
      type: String, 
      enum: ['exact_city', 'state_only', 'hidden', 'custom'], 
      default: 'exact_city' 
    },
    customLocation: { type: String },
    activityPrivacy: {
      showEarnings: { type: Boolean, default: true },
      showSessionCount: { type: Boolean, default: true },
      showSkillCapsules: { type: Boolean, default: true },
      showReviews: { type: Boolean, default: true }
    },
    contactPrivacy: {
      whoCanMessage: { type: String, enum: ['everyone', 'verified', 'none'], default: 'everyone' },
      whoCanSeePhone: { type: String, enum: ['no_one', 'verified_only'], default: 'no_one' },
      whoCanSeeEmail: { type: String, enum: ['admins_only', 'verified_only', 'everyone'], default: 'admins_only' },
      blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    },
    searchPrivacy: {
      appearInSearch: { type: Boolean, default: true },
      anonymousBrowsing: { type: Boolean, default: false }
    },
    dataSharing: {
      analyticsPartners: { type: Boolean, default: false },
      marketingPartners: { type: Boolean, default: false }
    },
    cookiePreferences: {
      essential: { type: Boolean, default: true },
      analytics: { type: Boolean, default: false },
      marketing: { type: Boolean, default: false }
    }
  },
  
  // Stats
  stats: {
    sessionsAsTeacher: { type: Number, default: 0 },
    sessionsAsLearner: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 },
    repeatStudentPercent: { type: Number, default: 0 },
    memberSince: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now }
  },
  
  // Social
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Trust & Safety
  trust: {
    score: { type: Number, default: 50, min: 0, max: 100 },
    verificationLevel: { type: String, enum: ['unverified', 'email', 'phone', 'id', 'full'], default: 'email' },
    flags: [{ reason: String, date: Date, resolvedAt: Date }],
    isBanned: { type: Boolean, default: false },
    banReason: String
  },
  
  // Notification Settings
  notificationSettings: {
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: '22:00' },
      end: { type: String, default: '08:00' }
    },
    channels: {
      inApp: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    frequency: { type: String, enum: ['realtime', 'hourly', 'daily', 'weekly'], default: 'realtime' },
    categories: {
      messages: { type: Boolean, default: true },
      sessions: { type: Boolean, default: true },
      payments: { type: Boolean, default: true },
      matches: { type: Boolean, default: true },
      social: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false }
    }
  },
  
  // Teaching Profile
  teachingProfile: {
    headline: String,
    hourlyRate: { type: Number, default: 0 },
    availability: [{
      day: { type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] },
      startTime: String,
      endTime: String
    }],
    batchSize: { type: String, enum: ['1-on-1', 'small_group', 'large_group'], default: '1-on-1' },
    teachingStyle: { type: String, enum: ['theoretical', 'practical', 'mixed'], default: 'mixed' },
    isAvailable: { type: Boolean, default: true }
  },

  // Service Profile (for local services)
  serviceProfile: {
    services: [String],
    serviceRadius: { type: Number, default: 5 },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number]
    },
    tools: { type: String, enum: ['bring_own', 'customer_provides', 'both'], default: 'bring_own' }
  },

  // Profile completion
  profileCompleted: { type: Boolean, default: false },
  onboardingCompleted: { type: Boolean, default: false },

  // Impact & Sustainability
  impact: {
    co2Saved: { type: Number, default: 0 },
    freeSessionsDonated: { type: Number, default: 0 },
    studentsImpacted: { type: Number, default: 0 },
    treesPlanted: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate referral code
userSchema.pre('save', function(next) {
  if (!this.referralCode) {
    this.referralCode = this.name.replace(/\s/g, '').toLowerCase().substring(0, 6) + 
      Math.random().toString(36).substring(2, 6).toUpperCase();
  }
  next();
});

// Calculate level from XP
userSchema.methods.calculateLevel = function() {
  const xp = this.gamification.xp;
  if (xp >= 1500) return 'legend';
  if (xp >= 750) return 'platinum';
  if (xp >= 300) return 'gold';
  if (xp >= 100) return 'silver';
  return 'bronze';
};

export default mongoose.model('User', userSchema);
