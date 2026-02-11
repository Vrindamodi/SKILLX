import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { setupSocketHandlers } from './socket/chatHandler.js';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import skillRoutes from './routes/skills.js';
import postRoutes from './routes/posts.js';
import sessionRoutes from './routes/sessions.js';
import chatRoutes from './routes/chat.js';
import notificationRoutes from './routes/notifications.js';
import transactionRoutes from './routes/transactions.js';
import reviewRoutes from './routes/reviews.js';
import capsuleRoutes from './routes/capsules.js';
import disputeRoutes from './routes/disputes.js';
import referralRoutes from './routes/referrals.js';
import learningPathRoutes from './routes/learning-paths.js';
import analyticsRoutes from './routes/analytics.js';
import aiRoutes from './routes/ai.js';
import adminRoutes from './routes/admin.js';

dotenv.config({ path: '../.env' });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/capsules', capsuleRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Socket.io
setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const dbConnected = await connectDB();
  
  if (!dbConnected) {
    console.log('Running in demo mode - some features may use mock data');
  }
  
  httpServer.listen(PORT, () => {
    console.log(`\n🚀 Skill-X Server running on port ${PORT}`);
    console.log(`📡 Socket.io ready for connections`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    if (dbConnected) {
      console.log(`💾 MongoDB connected`);
    }
  });
};

startServer();

export { io };
