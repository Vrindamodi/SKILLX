import User from '../models/User.js';
import Post from '../models/Post.js';

export const findMatches = async (criteria) => {
  const { skill, budget, mode, city, isOnline, userId } = criteria;
  
  // Build query for matching users
  const query = {
    _id: { $ne: userId },
    'trust.isBanned': false,
    'privacy.searchPrivacy.appearInSearch': true
  };
  
  if (mode === 'learn') {
    // Looking for teachers
    query['skillDNA.skillsKnown.skill'] = { $regex: skill, $options: 'i' };
    query['skillDNA.skillsKnown.canTeach'] = true;
  } else if (mode === 'teach') {
    // Looking for learners
    query['skillDNA.skillsLearning.skill'] = { $regex: skill, $options: 'i' };
  }
  
  if (city && !isOnline) query.city = { $regex: city, $options: 'i' };
  
  const potentialMatches = await User.find(query)
    .select('name avatar city skillDNA stats gamification teachingProfile trust')
    .limit(50);
  
  // Score each match
  const scoredMatches = potentialMatches.map(user => {
    let score = 0;
    
    // Skill match (40%)
    const skillMatch = user.skillDNA.skillsKnown.find(s => 
      s.skill.toLowerCase().includes(skill.toLowerCase())
    );
    if (skillMatch) {
      score += (skillMatch.confidenceLevel / 5) * 40;
    }
    
    // Rating (25%)
    score += (user.stats.avgRating / 5) * 25;
    
    // Availability match (20%)
    if (user.teachingProfile?.isAvailable) score += 20;
    else score += 5;
    
    // Price alignment (15%)
    if (budget && user.teachingProfile?.hourlyRate) {
      const priceDiff = Math.abs(user.teachingProfile.hourlyRate - budget);
      const priceScore = Math.max(0, 1 - priceDiff / budget) * 15;
      score += priceScore;
    } else {
      score += 10;
    }
    
    // Bonus: Trust score
    score += (user.trust.score / 100) * 5;
    
    // Bonus: Success rate
    score += (user.skillDNA.successRate / 100) * 5;
    
    return {
      user: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        city: user.city,
        rating: user.stats.avgRating,
        totalReviews: user.stats.totalReviews,
        sessionsCompleted: user.stats.sessionsAsTeacher,
        successRate: user.skillDNA.successRate,
        level: user.gamification.level,
        badges: user.gamification.badges.slice(0, 3),
        hourlyRate: user.teachingProfile?.hourlyRate,
        isAvailable: user.teachingProfile?.isAvailable,
        skills: user.skillDNA.skillsKnown.filter(s => 
          s.skill.toLowerCase().includes(skill.toLowerCase())
        )
      },
      matchScore: Math.min(100, Math.round(score)),
      matchReasons: generateMatchReasons(user, skill, budget)
    };
  });
  
  // Sort by score
  scoredMatches.sort((a, b) => b.matchScore - a.matchScore);
  
  return scoredMatches.slice(0, 10);
};

const generateMatchReasons = (user, skill, budget) => {
  const reasons = [];
  
  if (user.stats.avgRating >= 4.8) reasons.push('Highly rated teacher');
  if (user.stats.sessionsAsTeacher >= 20) reasons.push('Experienced mentor');
  if (user.skillDNA.successRate >= 90) reasons.push('High success rate');
  if (budget && user.teachingProfile?.hourlyRate <= budget) reasons.push('Within your budget');
  if (user.gamification.level === 'gold' || user.gamification.level === 'platinum' || user.gamification.level === 'legend') {
    reasons.push('Top-tier teacher');
  }
  
  if (reasons.length === 0) reasons.push('Good skill match');
  
  return reasons;
};

export const findPostMatches = async (userId, mode) => {
  const user = await User.findById(userId);
  if (!user) return [];
  
  const query = { status: 'active', author: { $ne: userId } };
  
  if (mode === 'learn') {
    // Find teach posts matching user's learning interests
    query.mode = 'teach';
    if (user.skillDNA.skillsLearning.length > 0) {
      const learningSkills = user.skillDNA.skillsLearning.map(s => s.skill);
      query.skill = { $in: learningSkills.map(s => new RegExp(s, 'i')) };
    }
  } else if (mode === 'teach') {
    query.mode = 'learn';
    if (user.skillDNA.skillsKnown.length > 0) {
      const teachingSkills = user.skillDNA.skillsKnown.filter(s => s.canTeach).map(s => s.skill);
      query.skill = { $in: teachingSkills.map(s => new RegExp(s, 'i')) };
    }
  }
  
  const posts = await Post.find(query)
    .populate('author', 'name avatar city stats gamification.level')
    .sort({ createdAt: -1 })
    .limit(20);
  
  return posts;
};

export default { findMatches, findPostMatches };
