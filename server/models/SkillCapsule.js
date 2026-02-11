import mongoose from 'mongoose';

const skillCapsuleSchema = new mongoose.Schema({
  learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  
  // Skill info
  skill: { type: String, required: true },
  subSkill: { type: String },
  category: { type: String },
  difficultyLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
  
  // Achievement details
  outcome: { type: String, required: true },
  duration: { type: Number }, // minutes
  dateCompleted: { type: Date, default: Date.now },
  verificationMethod: { type: String, enum: ['teacher', 'ai', 'peer', 'self'], default: 'teacher' },
  confidenceScore: { type: Number, min: 0, max: 100, default: 80 },
  
  // Proof
  completionCode: { type: String },
  digitalSignature: { type: String },
  
  // Sharing
  shareableLink: { type: String },
  viewCount: { type: Number, default: 0 },
  sharedOn: [{ platform: String, sharedAt: Date }],
  
  // Display
  isPublic: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  
  // Teacher testimonial
  teacherTestimonial: { type: String },
  
  // QR Code data
  qrData: { type: String },
  
  // Tags
  tags: [String]
}, {
  timestamps: true
});

// Generate completion code
skillCapsuleSchema.pre('save', function(next) {
  if (!this.completionCode) {
    this.completionCode = 'SX' + Date.now().toString(36).toUpperCase() + 
      Math.random().toString(36).substring(2, 6).toUpperCase();
  }
  if (!this.shareableLink) {
    this.shareableLink = `/capsules/${this._id}`;
  }
  next();
});

export default mongoose.model('SkillCapsule', skillCapsuleSchema);
