const onlineUsers = new Map();

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    // User comes online
    socket.on('user_online', (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.join(userId);
      io.emit('user_status', { userId, online: true });
    });
    
    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conv_${conversationId}`);
    });
    
    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conv_${conversationId}`);
    });
    
    // Typing indicator
    socket.on('typing_start', ({ conversationId, userId, userName }) => {
      socket.to(`conv_${conversationId}`).emit('user_typing', { userId, userName, conversationId });
    });
    
    socket.on('typing_stop', ({ conversationId, userId }) => {
      socket.to(`conv_${conversationId}`).emit('user_stopped_typing', { userId, conversationId });
    });
    
    // Send message via socket
    socket.on('send_message', (data) => {
      const { conversationId, message } = data;
      socket.to(`conv_${conversationId}`).emit('new_message', { conversationId, message });
    });
    
    // Message read
    socket.on('message_read', ({ conversationId, userId }) => {
      socket.to(`conv_${conversationId}`).emit('messages_read', { conversationId, userId });
    });
    
    // Message reaction
    socket.on('message_reaction', ({ conversationId, messageId, emoji, userId }) => {
      socket.to(`conv_${conversationId}`).emit('reaction_update', { messageId, emoji, userId });
    });
    
    // Session events
    socket.on('session_started', ({ sessionId, participants }) => {
      participants.forEach(p => {
        io.to(p).emit('session_update', { sessionId, status: 'in_progress' });
      });
    });
    
    socket.on('session_ended', ({ sessionId, participants }) => {
      participants.forEach(p => {
        io.to(p).emit('session_update', { sessionId, status: 'outcome_pending' });
      });
    });
    
    // Notification
    socket.on('send_notification', ({ recipientId, notification }) => {
      io.to(recipientId).emit('new_notification', notification);
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          io.emit('user_status', { userId, online: false });
          break;
        }
      }
    });
  });
};

export const getOnlineUsers = () => onlineUsers;
