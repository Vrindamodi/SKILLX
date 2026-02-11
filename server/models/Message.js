import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['text', 'system', 'session_prompt', 'quick_reply', 'file', 'image'],
    default: 'text' 
  },
  
  // Read status
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Reactions
  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emoji: String
  }],
  
  // Session prompt data
  sessionPrompt: {
    isSessionPrompt: { type: Boolean, default: false },
    sessionType: String,
    skill: String,
    price: Number,
    response: { type: String, enum: ['pending', 'accepted', 'declined'] }
  },
  
  // Intent detection
  detectedIntent: {
    hasIntent: { type: Boolean, default: false },
    intentType: { type: String, enum: ['booking', 'pricing', 'scheduling', 'general'] },
    confidence: Number
  },
  
  // Metadata
  edited: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model('Message', messageSchema);
