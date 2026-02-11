import axios from 'axios';

const API_URL = 'https://skillx-zf0k.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skillx_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('skillx_token');
      localStorage.removeItem('skillx_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Users
export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  completeProfile: (data) => api.put('/users/complete-profile', data),
  completeOnboarding: () => api.put('/users/complete-onboarding'),
  switchMode: (mode) => api.put('/users/switch-mode', { mode }),
  updatePrivacy: (data) => api.put('/users/privacy', data),
  updateNotificationSettings: (data) => api.put('/users/notification-settings', data),
  followUser: (id) => api.post(`/users/${id}/follow`),
  blockUser: (id) => api.post(`/users/${id}/block`),
  searchUsers: (params) => api.get('/users', { params }),
  updateTeachingProfile: (data) => api.put('/users/teaching-profile', data),
  updateAvatar: (avatar) => api.put('/users/avatar', { avatar }),
};

// Skills
export const skillAPI = {
  getAll: (params) => api.get('/skills', { params }),
  getCategories: () => api.get('/skills/categories'),
  getTrending: () => api.get('/skills/trending'),
  getById: (id) => api.get(`/skills/${id}`),
  getDemand: () => api.get('/skills/analytics/demand'),
};

// Posts
export const postAPI = {
  create: (data) => api.post('/posts', data),
  getAll: (params) => api.get('/posts', { params }),
  getMyPosts: () => api.get('/posts/my-posts'),
  getById: (id) => api.get(`/posts/${id}`),
  respond: (id, data) => api.post(`/posts/${id}/respond`, data),
  acceptResponse: (postId, responseId, data) => api.put(`/posts/${postId}/respond/${responseId}`, data),
  like: (id) => api.post(`/posts/${id}/like`),
  bookmark: (id) => api.post(`/posts/${id}/bookmark`),
  update: (id, data) => api.put(`/posts/${id}`, data),
  close: (id) => api.delete(`/posts/${id}`),
};

// Sessions
export const sessionAPI = {
  create: (data) => api.post('/sessions', data),
  getMySessions: (params) => api.get('/sessions/my-sessions', { params }),
  getById: (id) => api.get(`/sessions/${id}`),
  confirm: (id) => api.put(`/sessions/${id}/confirm`),
  pay: (id, data) => api.put(`/sessions/${id}/pay`, data),
  start: (id) => api.put(`/sessions/${id}/start`),
  verifyOutcome: (id, data) => api.put(`/sessions/${id}/verify-outcome`, data),
  uploadProof: (id, data) => api.put(`/sessions/${id}/proof`, data),
  cancel: (id, data) => api.put(`/sessions/${id}/cancel`, data),
  rate: (id, data) => api.put(`/sessions/${id}/rate`, data),
};

// Chat
export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  createConversation: (data) => api.post('/chat/conversations', data),
  getMessages: (conversationId, params) => api.get(`/chat/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, data) => api.post(`/chat/conversations/${conversationId}/messages`, data),
  reactToMessage: (messageId, emoji) => api.post(`/chat/messages/${messageId}/react`, { emoji }),
};

// Notifications
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Transactions
export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getWallet: () => api.get('/transactions/wallet'),
  addFunds: (data) => api.post('/transactions/add-funds', data),
  withdraw: (data) => api.post('/transactions/withdraw', data),
};

// Reviews
export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  getForUser: (userId, params) => api.get(`/reviews/user/${userId}`, { params }),
  respond: (id, data) => api.put(`/reviews/${id}/respond`, data),
  helpful: (id) => api.post(`/reviews/${id}/helpful`),
};

// Capsules
export const capsuleAPI = {
  getForUser: (userId, params) => api.get(`/capsules/user/${userId}`, { params }),
  getMyCapsules: () => api.get('/capsules/my-capsules'),
  getIssued: () => api.get('/capsules/issued'),
  verify: (id) => api.get(`/capsules/${id}/verify`),
  share: (id, platform) => api.post(`/capsules/${id}/share`, { platform }),
  getStats: () => api.get('/capsules/stats'),
};

// Disputes
export const disputeAPI = {
  create: (data) => api.post('/disputes', data),
  getMyDisputes: () => api.get('/disputes/my-disputes'),
  getById: (id) => api.get(`/disputes/${id}`),
  resolve: (id, data) => api.put(`/disputes/${id}/resolve`, data),
  appeal: (id, data) => api.post(`/disputes/${id}/appeal`, data),
};

// Referrals
export const referralAPI = {
  getMyReferrals: () => api.get('/referrals/my-referrals'),
  track: (data) => api.post('/referrals/track', data),
  getLeaderboard: () => api.get('/referrals/leaderboard'),
};

// Learning Paths
export const learningPathAPI = {
  getAll: (params) => api.get('/learning-paths', { params }),
  getById: (id) => api.get(`/learning-paths/${id}`),
  enroll: (id) => api.post(`/learning-paths/${id}/enroll`),
  updateProgress: (id, data) => api.put(`/learning-paths/${id}/progress`, data),
  getEnrolled: () => api.get('/learning-paths/enrolled/me'),
};

// Analytics
export const analyticsAPI = {
  getUserAnalytics: () => api.get('/analytics/user'),
  getAdminAnalytics: () => api.get('/analytics/admin'),
};

// AI
export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
  skillGap: (data) => api.post('/ai/skill-gap', data),
  getRecommendations: () => api.get('/ai/recommendations'),
};

// Admin
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  banUser: (id, data) => api.put(`/admin/users/${id}/ban`, data),
  getStats: () => api.get('/admin/stats'),
  getPosts: (params) => api.get('/admin/posts', { params }),
  getDisputes: () => api.get('/admin/disputes'),
  getFraudAlerts: () => api.get('/admin/fraud-alerts'),
};

export default api;
