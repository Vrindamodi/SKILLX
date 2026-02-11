import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  
  rating: { type: Number, min: 1, max: 5, required: true },
  content: { type: String },
  
  // Specific ratings
  aspects: {
    knowledge: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    punctuality: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 }
  },
  
  // Testimonial
  isTestimonial: { type: Boolean, default: false },
  testimonialQuote: { type: String, maxlength: 150 },
  
  // Skill context
  skill: { type: String },
  sessionType: { type: String },
  
  // Status
  verified: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  
  // Response from reviewee
  response: {
    content: String,
    createdAt: Date
  },
  
  // Helpful votes
  helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

export default mongoose.model('Review', reviewSchema);
