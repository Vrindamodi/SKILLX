import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  againstUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Dispute details
  reason: { 
    type: String, 
    enum: [
      'outcome_not_met', 'no_show', 'poor_quality', 'harassment',
      'payment_issue', 'service_incomplete', 'misrepresentation', 'other'
    ],
    required: true 
  },
  description: { type: String, required: true },
  evidence: [{ type: String }], // URLs to screenshots, etc.
  
  // Amount in dispute
  disputedAmount: { type: Number },
  
  // Status
  status: { 
    type: String, 
    enum: ['open', 'ai_review', 'manual_review', 'arbitration', 'resolved', 'closed'],
    default: 'open' 
  },
  
  // Resolution
  resolution: {
    type: { type: String, enum: ['refund', 'release', 'partial_refund', 'no_action'] },
    amount: Number,
    resolvedBy: { type: String, enum: ['ai', 'admin', 'arbitration'] },
    notes: String,
    resolvedAt: Date
  },
  
  // AI Analysis
  aiAnalysis: {
    recommendation: String,
    confidence: Number,
    chatAnalysis: String,
    factors: [String]
  },
  
  // Timeline
  timeline: [{
    action: String,
    actor: String,
    timestamp: { type: Date, default: Date.now },
    notes: String
  }],
  
  // Appeal
  appeal: {
    filed: { type: Boolean, default: false },
    reason: String,
    filedAt: Date,
    resolvedAt: Date,
    outcome: String
  },
  
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' }
}, {
  timestamps: true
});

export default mongoose.model('Dispute', disputeSchema);
