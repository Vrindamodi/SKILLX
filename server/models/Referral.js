import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referred: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  referralCode: { type: String, required: true },
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'signed_up', 'first_session', 'active', 'inactive'],
    default: 'pending' 
  },
  
  // Earnings
  earnings: {
    signupBonus: { type: Number, default: 500 },
    firstSessionBonus: { type: Number, default: 200 },
    lifetimeCommission: { type: Number, default: 0 },
    commissionRate: { type: Number, default: 5 }, // percentage
    totalEarned: { type: Number, default: 0 }
  },
  
  // Tracking
  source: { type: String, enum: ['link', 'qr', 'social', 'email', 'whatsapp', 'other'] },
  
  // Milestones
  milestones: {
    signedUp: { type: Boolean, default: false },
    firstSession: { type: Boolean, default: false },
    fiveSessions: { type: Boolean, default: false },
    teaching: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

export default mongoose.model('Referral', referralSchema);
