import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    enum: ['tech', 'creative', 'life_skills', 'languages', 'trades_services', 'business', 'academics'],
    required: true 
  },
  parentSkill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', default: null },
  subSkills: [{ type: String }],
  icon: { type: String, default: '' },
  description: { type: String, default: '' },
  
  // Metadata
  metadata: {
    demand: { type: Number, default: 0 },
    supply: { type: Number, default: 0 },
    avgPrice: { type: Number, default: 0 },
    trending: { type: Boolean, default: false },
    trendingScore: { type: Number, default: 0 },
    searchCount: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    growthRate: { type: Number, default: 0 }
  },

  // Difficulty
  difficultyLevel: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  
  // For learning paths
  prerequisites: [{ type: String }],
  estimatedLearningTime: { type: String },
  earningPotential: { type: String }
}, {
  timestamps: true
});

skillSchema.index({ name: 'text', category: 1 });

export default mongoose.model('Skill', skillSchema);
