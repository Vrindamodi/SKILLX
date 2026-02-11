import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  type: { 
    type: String, 
    enum: [
      'payment', 'escrow_lock', 'escrow_release', 'withdrawal', 
      'refund', 'referral_commission', 'platform_fee', 'bonus',
      'quest_reward', 'leaderboard_reward'
    ],
    required: true 
  },
  
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending' 
  },
  
  // Related entities
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  otherUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Payment details
  paymentMethod: { 
    type: String, 
    enum: ['card', 'upi', 'wallet', 'netbanking', 'phonepe', 'gpay'],
    default: 'wallet' 
  },
  
  // Escrow
  escrow: {
    lockedAt: Date,
    releasedAt: Date,
    releaseCondition: String
  },
  
  // Withdrawal
  withdrawal: {
    bankAccount: String,
    upiId: String,
    processedAt: Date
  },
  
  description: { type: String },
  
  // Fee breakdown
  breakdown: {
    subtotal: Number,
    platformFee: Number,
    platformFeePercent: { type: Number, default: 5 },
    netAmount: Number
  },
  
  metadata: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

transactionSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Transaction', transactionSchema);
