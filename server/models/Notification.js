import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  type: { 
    type: String, 
    enum: [
      'new_message', 'skill_match', 'post_liked', 'post_response', 
      'session_reminder', 'payment_update', 'capsule_generated',
      'review_received', 'skill_progress', 'trending_alert',
      'badge_earned', 'level_up', 'streak_milestone', 'quest_completed',
      'referral_signup', 'referral_commission', 'dispute_update',
      'system_alert', 'follow', 'mention', 'leaderboard_rank'
    ],
    required: true 
  },
  
  title: { type: String, required: true },
  message: { type: String, required: true },
  
  // Priority
  priority: { 
    type: String, 
    enum: ['urgent', 'high', 'medium', 'low'],
    default: 'medium' 
  },
  
  // Action
  actionUrl: { type: String },
  actionLabel: { type: String },
  
  // Related entities
  relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  relatedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  relatedSession: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  
  // Status
  read: { type: Boolean, default: false },
  readAt: { type: Date },
  
  // Delivery
  channels: {
    inApp: { type: Boolean, default: true },
    push: { type: Boolean, default: false },
    email: { type: Boolean, default: false }
  },
  
  // Icon/Emoji
  icon: { type: String },
  
  // Metadata
  metadata: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
