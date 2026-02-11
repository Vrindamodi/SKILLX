import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  
  // Last message preview
  lastMessage: {
    content: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: Date,
    type: String
  },
  
  // Context
  relatedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  relatedSession: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  
  // Status
  isActive: { type: Boolean, default: true },
  
  // Unread counts per participant
  unreadCounts: { type: Map, of: Number, default: {} },
  
  // Typing indicators
  typingUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Smart engagement
  hasActiveIntent: { type: Boolean, default: false },
  sessionPrompted: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model('Conversation', conversationSchema);
