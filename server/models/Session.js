import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  
  // Skill info
  skill: { type: String, required: true },
  subSkill: { type: String },
  sessionType: { 
    type: String, 
    enum: ['learn_teach', 'rent_skill', 'local_service'],
    required: true 
  },
  
  // Status flow
  status: { 
    type: String, 
    enum: [
      'pending', 'confirmed', 'escrow_paid', 'in_progress', 
      'completed', 'outcome_pending', 'disputed', 'cancelled', 'refunded'
    ],
    default: 'pending' 
  },
  
  // Scheduling
  scheduling: {
    date: { type: Date, required: true },
    startTime: { type: String },
    endTime: { type: String },
    duration: { type: Number, default: 45 }, // minutes
    isOnline: { type: Boolean, default: true },
    meetingLink: { type: String }
  },
  
  // Outcome verification
  outcome: {
    description: { type: String },
    learnerConfirmed: { type: Boolean, default: false },
    teacherConfirmed: { type: Boolean, default: false },
    learnerFeedback: { type: String },
    teacherFeedback: { type: String },
    aiVerified: { type: Boolean, default: false },
    completedAt: { type: Date }
  },
  
  // Proof (for local services)
  proof: {
    beforePhotos: [String],
    afterPhotos: [String],
    gpsTimestamp: {
      lat: Number,
      lng: Number,
      timestamp: Date
    },
    customerSignature: { type: Boolean, default: false },
    recording: { type: String }
  },
  
  // Payment
  payment: {
    amount: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },
    teacherReceives: { type: Number, default: 0 },
    escrowStatus: { type: String, enum: ['pending', 'locked', 'released', 'refunded'], default: 'pending' },
    paidAt: { type: Date },
    releasedAt: { type: Date }
  },
  
  // Session tools used
  tools: {
    screenShare: { type: Boolean, default: false },
    whiteboard: { type: Boolean, default: false },
    codeEditor: { type: Boolean, default: false },
    fileSharing: { type: Boolean, default: false }
  },
  
  // Location (for local services)
  location: {
    address: String,
    city: String,
    coordinates: { lat: Number, lng: Number }
  },
  
  // Ratings (post-session)
  ratings: {
    learnerRating: { type: Number, min: 1, max: 5 },
    teacherRating: { type: Number, min: 1, max: 5 },
    learnerReview: String,
    teacherReview: String
  },
  
  // Notes
  notes: { type: String },
  cancellationReason: { type: String },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

export default mongoose.model('Session', sessionSchema);
