import mongoose from 'mongoose';

const learningPathSchema = new mongoose.Schema({
  // Path definition
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  icon: { type: String },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  
  // Levels
  levels: [{
    level: Number,
    name: String,
    description: String,
    skills: [String],
    requiredCapsules: { type: Number, default: 1 },
    xpReward: { type: Number, default: 100 },
    badgeReward: String,
    estimatedDuration: String, // e.g., "2 weeks"
    estimatedCost: Number,
    isLocked: { type: Boolean, default: true },
    content: {
      overview: String,
      resources: [String],
      projects: [String]
    }
  }],
  
  // Track metadata
  totalLevels: { type: Number, default: 5 },
  estimatedTotalDuration: String,
  estimatedTotalCost: Number,
  earningPotentialAfter: String,
  
  // User progress (embedded per user)
  enrolledUsers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    currentLevel: { type: Number, default: 1 },
    completedLevels: [Number],
    progress: { type: Number, default: 0 },
    startedAt: Date,
    lastActivityAt: Date,
    capsulesEarned: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 }
  }],
  
  // Stats
  totalEnrolled: { type: Number, default: 0 },
  completionRate: { type: Number, default: 0 },
  avgCompletionTime: String,
  rating: { type: Number, default: 0 },
  
  // Featured
  featured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model('LearningPath', learningPathSchema);
