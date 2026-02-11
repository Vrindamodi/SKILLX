import User from '../models/User.js';
import Notification from '../models/Notification.js';

// XP thresholds for levels
const LEVEL_THRESHOLDS = {
  bronze: 0,
  silver: 100,
  gold: 300,
  platinum: 750,
  legend: 1500
};

// Badge definitions
export const BADGES = {
  first_session: { id: 'first_session', name: 'First Session', icon: '🔥', description: 'Complete your first session' },
  quick_learner: { id: 'quick_learner', name: 'Quick Learner', icon: '🚀', description: 'Complete 5 sessions in 1 month' },
  super_mentor: { id: 'super_mentor', name: 'Super Mentor', icon: '💎', description: 'Teach 50+ students' },
  speed_demon: { id: 'speed_demon', name: 'Speed Demon', icon: '⚡', description: 'Complete 10 sessions in 2 weeks' },
  perfect_score: { id: 'perfect_score', name: '100% Success', icon: '🌟', description: 'Maintain 100% success for 10 sessions' },
  golden_teacher: { id: 'golden_teacher', name: 'Golden Teacher', icon: '🏆', description: '4.9+ rating with 20+ reviews' },
  bookworm: { id: 'bookworm', name: 'Bookworm', icon: '📚', description: 'Learn 5 different skills' },
  polymath: { id: 'polymath', name: 'Polymath', icon: '🧠', description: 'Master 10 different skills' },
  goal_achiever: { id: 'goal_achiever', name: 'Goal Achiever', icon: '🎯', description: 'Reach your earning goal' },
  rising_star: { id: 'rising_star', name: 'Rising Star', icon: '📈', description: 'Double earnings month over month' },
  certified_expert: { id: 'certified_expert', name: 'Certified Expert', icon: '🎓', description: 'Earn 5+ capsules in one skill' },
  trusted_user: { id: 'trusted_user', name: 'Trusted User', icon: '🔐', description: 'Verified identity' },
  early_adopter: { id: 'early_adopter', name: 'Early Adopter', icon: '🚀', description: 'Early platform user' },
  social_hero: { id: 'social_hero', name: 'Social Hero', icon: '💝', description: 'Volunteer for free sessions' },
  eco_warrior: { id: 'eco_warrior', name: 'Eco Warrior', icon: '🌍', description: '100+ online sessions' },
  streak_master: { id: 'streak_master', name: 'Streak Master', icon: '🔥', description: '30-day login streak' },
  community_star: { id: 'community_star', name: 'Community Star', icon: '⭐', description: 'Active community contributor' },
  ambassador: { id: 'ambassador', name: 'Ambassador', icon: '🏅', description: 'Featured on platform' }
};

// Quest definitions
export const DAILY_QUESTS = [
  { id: 'daily_session', name: 'Complete 1 session today', target: 1, xpReward: 50, type: 'session' },
  { id: 'daily_teach', name: 'Teach 1 student today', target: 1, xpReward: 75, type: 'teach' },
  { id: 'daily_rate', name: 'Rate a session', target: 1, xpReward: 25, type: 'rate' },
  { id: 'daily_profile', name: 'Update your profile', target: 1, xpReward: 10, type: 'profile' },
  { id: 'daily_chat', name: 'Chat with 3 new users', target: 3, xpReward: 30, type: 'chat' }
];

export const WEEKLY_QUESTS = [
  { id: 'weekly_sessions', name: 'Complete 3 sessions this week', target: 3, xpReward: 200, type: 'session' },
  { id: 'weekly_teach', name: 'Teach 5 students', target: 5, xpReward: 300, type: 'teach' },
  { id: 'weekly_earn', name: 'Earn ₹2,000', target: 2000, xpReward: 250, type: 'earn' },
  { id: 'weekly_reviews', name: 'Get 3 five-star reviews', target: 3, xpReward: 400, type: 'review' },
  { id: 'weekly_refer', name: 'Refer 2 friends', target: 2, xpReward: 500, type: 'refer' }
];

export const MONTHLY_QUESTS = [
  { id: 'monthly_sessions', name: 'Complete 12 sessions', target: 12, xpReward: 1000, type: 'session' },
  { id: 'monthly_earn', name: 'Earn ₹10,000', target: 10000, xpReward: 1500, type: 'earn' },
  { id: 'monthly_skills', name: 'Master 2 new skills', target: 2, xpReward: 2000, type: 'skill' },
  { id: 'monthly_rating', name: 'Maintain 4.8+ rating', target: 4.8, xpReward: 1000, type: 'rating' }
];

// Add XP and check for level up
export const addXP = async (userId, amount, reason) => {
  const user = await User.findById(userId);
  if (!user) return;
  
  const oldLevel = user.gamification.level;
  user.gamification.xp += amount;
  
  // Check level up
  const newLevel = calculateLevel(user.gamification.xp);
  if (newLevel !== oldLevel) {
    user.gamification.level = newLevel;
    
    // Create level up notification
    await Notification.create({
      recipient: userId,
      type: 'level_up',
      title: 'Level Up!',
      message: `Congratulations! You've reached ${newLevel.charAt(0).toUpperCase() + newLevel.slice(1)} level!`,
      priority: 'high',
      icon: '🎉'
    });
  }
  
  await user.save();
  return { xp: user.gamification.xp, level: newLevel, leveledUp: newLevel !== oldLevel };
};

const calculateLevel = (xp) => {
  if (xp >= LEVEL_THRESHOLDS.legend) return 'legend';
  if (xp >= LEVEL_THRESHOLDS.platinum) return 'platinum';
  if (xp >= LEVEL_THRESHOLDS.gold) return 'gold';
  if (xp >= LEVEL_THRESHOLDS.silver) return 'silver';
  return 'bronze';
};

// Check and award badges
export const checkBadges = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return [];
  
  const newBadges = [];
  const existingBadgeIds = user.gamification.badges.map(b => b.id);
  
  // Check each badge condition
  if (!existingBadgeIds.includes('first_session') && 
      (user.stats.sessionsAsTeacher + user.stats.sessionsAsLearner) >= 1) {
    newBadges.push(BADGES.first_session);
  }
  
  if (!existingBadgeIds.includes('super_mentor') && user.stats.sessionsAsTeacher >= 50) {
    newBadges.push(BADGES.super_mentor);
  }
  
  if (!existingBadgeIds.includes('golden_teacher') && 
      user.stats.avgRating >= 4.9 && user.stats.totalReviews >= 20) {
    newBadges.push(BADGES.golden_teacher);
  }
  
  if (!existingBadgeIds.includes('streak_master') && 
      user.gamification.streaks.dailyLogin.current >= 30) {
    newBadges.push(BADGES.streak_master);
  }
  
  if (!existingBadgeIds.includes('eco_warrior') && 
      user.stats.sessionsAsTeacher + user.stats.sessionsAsLearner >= 100) {
    newBadges.push(BADGES.eco_warrior);
  }
  
  // Award new badges
  for (const badge of newBadges) {
    user.gamification.badges.push({
      ...badge,
      earnedAt: new Date()
    });
    
    await Notification.create({
      recipient: userId,
      type: 'badge_earned',
      title: 'Badge Earned!',
      message: `You earned the ${badge.name} badge! ${badge.icon}`,
      priority: 'medium',
      icon: badge.icon
    });
  }
  
  if (newBadges.length > 0) {
    await user.save();
  }
  
  return newBadges;
};

// Get leaderboard
export const getLeaderboard = async (type = 'earnings', period = 'weekly', city = null) => {
  const periodStart = new Date();
  if (period === 'weekly') periodStart.setDate(periodStart.getDate() - 7);
  else if (period === 'monthly') periodStart.setMonth(periodStart.getMonth() - 1);
  else if (period === 'annual') periodStart.setFullYear(periodStart.getFullYear() - 1);
  
  const query = { 'trust.isBanned': false };
  if (city) query.city = city;
  
  let sortField;
  switch (type) {
    case 'earnings': sortField = 'wallet.totalEarned'; break;
    case 'teaching': sortField = 'stats.sessionsAsTeacher'; break;
    case 'learning': sortField = 'stats.sessionsAsLearner'; break;
    case 'xp': sortField = 'gamification.xp'; break;
    case 'rating': sortField = 'stats.avgRating'; break;
    default: sortField = 'wallet.totalEarned';
  }
  
  const leaders = await User.find(query)
    .sort({ [sortField]: -1 })
    .limit(50)
    .select('name avatar city wallet.totalEarned stats gamification.xp gamification.level gamification.badges');
  
  return leaders.map((user, index) => ({
    rank: index + 1,
    user: {
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      city: user.city,
      level: user.gamification.level,
      topBadge: user.gamification.badges[0]
    },
    value: type === 'earnings' ? user.wallet.totalEarned :
           type === 'teaching' ? user.stats.sessionsAsTeacher :
           type === 'learning' ? user.stats.sessionsAsLearner :
           type === 'xp' ? user.gamification.xp :
           user.stats.avgRating
  }));
};

export default { addXP, checkBadges, getLeaderboard, BADGES, DAILY_QUESTS, WEEKLY_QUESTS, MONTHLY_QUESTS };
