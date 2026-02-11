import express from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all conversations for user
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId,
      isActive: true
    })
      .populate('participants', 'name avatar stats.lastActive')
      .populate('lastMessage.sender', 'name')
      .sort({ updatedAt: -1 });
    
    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get or create conversation with user
router.post('/conversations', auth, async (req, res) => {
  try {
    const { userId, postId } = req.body;
    
    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, userId] }
    }).populate('participants', 'name avatar');
    
    if (!conversation) {
      conversation = new Conversation({
        participants: [req.userId, userId],
        relatedPost: postId,
        unreadCounts: new Map([[req.userId.toString(), 0], [userId.toString(), 0]])
      });
      await conversation.save();
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name avatar');
    }
    
    res.json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    // Mark messages as read
    await Message.updateMany(
      { conversation: req.params.id, sender: { $ne: req.userId }, readBy: { $nin: [req.userId] } },
      { $push: { readBy: req.userId } }
    );
    
    // Reset unread count
    await Conversation.findByIdAndUpdate(req.params.id, {
      [`unreadCounts.${req.userId}`]: 0
    });
    
    res.json({ success: true, data: messages.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send message
router.post('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const { content, type = 'text', sessionPrompt } = req.body;
    
    const message = new Message({
      conversation: req.params.id,
      sender: req.userId,
      content,
      type,
      readBy: [req.userId],
      sessionPrompt
    });
    
    // Simple intent detection
    const lowerContent = content.toLowerCase();
    if (
      lowerContent.includes('teach') || 
      lowerContent.includes('learn') || 
      lowerContent.includes('session') ||
      lowerContent.includes('book') ||
      lowerContent.includes('₹') ||
      lowerContent.includes('price') ||
      lowerContent.includes('available')
    ) {
      message.detectedIntent = {
        hasIntent: true,
        intentType: lowerContent.includes('₹') || lowerContent.includes('price') ? 'pricing' : 
                    lowerContent.includes('available') || lowerContent.includes('time') ? 'scheduling' : 'booking',
        confidence: 0.7
      };
    }
    
    await message.save();
    
    // Update conversation
    const conversation = await Conversation.findById(req.params.id);
    conversation.lastMessage = {
      content,
      sender: req.userId,
      timestamp: new Date(),
      type
    };
    
    // Increment unread for other participants
    conversation.participants.forEach(p => {
      if (p.toString() !== req.userId.toString()) {
        const current = conversation.unreadCounts.get(p.toString()) || 0;
        conversation.unreadCounts.set(p.toString(), current + 1);
      }
    });
    
    // Check if session prompt should be triggered
    if (message.detectedIntent?.hasIntent) {
      conversation.hasActiveIntent = true;
    }
    
    await conversation.save();
    
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar');
    
    // Emit via socket
    const io = req.app.get('io');
    if (io) {
      conversation.participants.forEach(p => {
        if (p.toString() !== req.userId.toString()) {
          io.to(p.toString()).emit('new_message', {
            message: populatedMessage,
            conversationId: req.params.id
          });
        }
      });
    }
    
    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// React to message
router.post('/messages/:id/react', auth, async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.id);
    
    const existingReaction = message.reactions.find(
      r => r.user.toString() === req.userId.toString() && r.emoji === emoji
    );
    
    if (existingReaction) {
      message.reactions.pull(existingReaction._id);
    } else {
      message.reactions.push({ user: req.userId, emoji });
    }
    
    await message.save();
    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
