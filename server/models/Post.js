import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Mode determines the type of listing
  mode: { 
    type: String, 
    enum: ['learn', 'teach', 'rent', 'service', 'request'],
    required: true 
  },
  
  // Skill info
  skill: { type: String, required: true },
  subSkill: { type: String },
  category: { type: String },
  
  // Post details
  title: { type: String, required: true },
  description: { type: String, required: true },
  
  // Pricing
  pricing: {
    amount: { type: Number, required: true },
    per: { type: String, enum: ['hour', 'session', 'task', 'project'], default: 'hour' },
    negotiable: { type: Boolean, default: true },
    currency: { type: String, default: 'INR' }
  },
  
  // Session details
  duration: { type: Number, default: 45 }, // minutes
  batchSize: { type: String, enum: ['1-on-1', 'small_group', 'large_group'], default: '1-on-1' },
  
  // Availability
  availability: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  preferredDate: { type: Date },
  
  // Location (for local services)
  isOnline: { type: Boolean, default: true },
  location: {
    city: String,
    locality: String,
    radius: { type: Number, default: 5 },
    coordinates: {
      type: { type: String, default: 'Point' },
      coordinates: [Number]
    }
  },
  
  // Outcome expectations
  expectedOutcome: { type: String },
  learningGoal: { type: String },
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'closed', 'matched', 'completed', 'expired'],
    default: 'active' 
  },
  
  // Engagement
  responses: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  
  // Tags
  tags: [String],
  
  // Requirements (for service requests)
  requirements: { type: String },
  budget: { min: Number, max: Number },
  
  // Photos (for services)
  photos: [String]
}, {
  timestamps: true
});

postSchema.index({ skill: 'text', title: 'text', description: 'text' });
postSchema.index({ mode: 1, status: 1 });
postSchema.index({ 'location.coordinates': '2dsphere' });

export default mongoose.model('Post', postSchema);
