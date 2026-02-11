import Skill from '../models/Skill.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

// Dynamic pricing engine
export const suggestPrice = async (skill, sessionType, duration, city) => {
  // Get market data
  const posts = await Post.find({
    skill: { $regex: skill, $options: 'i' },
    status: 'active'
  }).select('pricing');
  
  const prices = posts.map(p => p.pricing.amount).filter(p => p > 0);
  
  let basePrice;
  if (prices.length > 0) {
    const sorted = prices.sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    basePrice = Math.round((median + avg) / 2);
  } else {
    // Default pricing by category
    const defaults = {
      learn_teach: 500,
      rent_skill: 200,
      local_service: 1000
    };
    basePrice = defaults[sessionType] || 500;
  }
  
  // Adjust for duration (base is 45 min)
  const durationFactor = (duration || 45) / 45;
  
  // City factor (metro cities cost more)
  const metroCities = ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune'];
  const cityFactor = city && metroCities.includes(city.toLowerCase()) ? 1.2 : 1.0;
  
  const suggestedPrice = Math.round(basePrice * durationFactor * cityFactor);
  
  return {
    suggested: suggestedPrice,
    low: Math.round(suggestedPrice * 0.7),
    high: Math.round(suggestedPrice * 1.5),
    marketAverage: basePrice,
    demand: prices.length > 10 ? 'high' : prices.length > 5 ? 'medium' : 'low',
    priceRange: {
      min: prices.length > 0 ? Math.min(...prices) : Math.round(suggestedPrice * 0.5),
      max: prices.length > 0 ? Math.max(...prices) : Math.round(suggestedPrice * 2)
    }
  };
};

export default { suggestPrice };
