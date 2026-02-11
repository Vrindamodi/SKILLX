// ============================================================
// Skill-X Constants
// ============================================================

// --------------- MODES ---------------
export const MODES = {
  learn: {
    label: 'Learn',
    icon: '📚',
    color: 'text-blue-400',
    description: 'Find skills to learn',
  },
  teach: {
    label: 'Teach',
    icon: '🧠',
    color: 'text-green-400',
    description: 'Share your knowledge',
  },
  rent: {
    label: 'Rent',
    icon: '⏱️',
    color: 'text-purple-400',
    description: 'Quick expert help',
  },
  service: {
    label: 'Service',
    icon: '🧹',
    color: 'text-orange-400',
    description: 'Offer local services',
  },
  request: {
    label: 'Request',
    icon: '🔍',
    color: 'text-pink-400',
    description: 'Find service providers',
  },
};

// --------------- SKILL CATEGORIES ---------------
export const SKILL_CATEGORIES = [
  {
    id: 'tech',
    name: 'Tech',
    icon: '💻',
    color: 'bg-blue-500',
    skills: [
      'JavaScript',
      'Python',
      'React',
      'Node.js',
      'Machine Learning',
      'Data Science',
      'Flutter',
      'DevOps',
    ],
  },
  {
    id: 'creative',
    name: 'Creative',
    icon: '🎨',
    color: 'bg-pink-500',
    skills: [
      'Graphic Design',
      'Video Editing',
      'Photography',
      'UI/UX Design',
      'Animation',
      'Content Writing',
    ],
  },
  {
    id: 'life_skills',
    name: 'Life Skills',
    icon: '🌱',
    color: 'bg-green-500',
    skills: [
      'Communication',
      'Leadership',
      'Public Speaking',
      'Time Management',
      'Emotional Intelligence',
      'Negotiation',
    ],
  },
  {
    id: 'languages',
    name: 'Languages',
    icon: '🗣️',
    color: 'bg-yellow-500',
    skills: [
      'English',
      'Hindi',
      'Tamil',
      'Spanish',
      'French',
      'German',
      'Japanese',
      'Mandarin',
    ],
  },
  {
    id: 'trades',
    name: 'Trades & Services',
    icon: '🔧',
    color: 'bg-orange-500',
    skills: [
      'Cleaning',
      'Cooking',
      'Plumbing',
      'Electrical Work',
      'Carpentry',
      'Tailoring',
      'Gardening',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    icon: '📊',
    color: 'bg-indigo-500',
    skills: [
      'Marketing',
      'Finance',
      'Accounting',
      'Sales',
      'Entrepreneurship',
      'Stock Trading',
      'Business Strategy',
    ],
  },
  {
    id: 'academics',
    name: 'Academics',
    icon: '📐',
    color: 'bg-red-500',
    skills: [
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'History',
      'Economics',
      'Statistics',
      'English Literature',
    ],
  },
];

// --------------- LEVELS ---------------
export const LEVELS = {
  bronze: {
    label: 'Bronze',
    color: 'text-amber-600',
    minXP: 0,
    maxXP: 500,
    feeDiscount: 0,
    icon: '🥉',
  },
  silver: {
    label: 'Silver',
    color: 'text-gray-400',
    minXP: 501,
    maxXP: 2000,
    feeDiscount: 5,
    icon: '🥈',
  },
  gold: {
    label: 'Gold',
    color: 'text-yellow-400',
    minXP: 2001,
    maxXP: 5000,
    feeDiscount: 10,
    icon: '🥇',
  },
  platinum: {
    label: 'Platinum',
    color: 'text-cyan-300',
    minXP: 5001,
    maxXP: 15000,
    feeDiscount: 15,
    icon: '💎',
  },
  legend: {
    label: 'Legend',
    color: 'text-purple-400',
    minXP: 15001,
    maxXP: Infinity,
    feeDiscount: 20,
    icon: '👑',
  },
};

// --------------- BADGES ---------------
export const BADGES = [
  { id: 'first_session', name: 'First Step', icon: '🎯', description: 'Completed your first session' },
  { id: 'five_sessions', name: 'Getting Started', icon: '🚀', description: 'Completed 5 sessions' },
  { id: 'ten_sessions', name: 'Dedicated Learner', icon: '📖', description: 'Completed 10 sessions' },
  { id: 'first_teach', name: 'Teacher\'s Pet', icon: '🍎', description: 'Taught your first session' },
  { id: 'five_star', name: 'Five Star', icon: '⭐', description: 'Received a 5-star review' },
  { id: 'streak_7', name: 'On Fire', icon: '🔥', description: '7-day learning streak' },
  { id: 'streak_30', name: 'Unstoppable', icon: '⚡', description: '30-day learning streak' },
  { id: 'multi_skill', name: 'Jack of All Trades', icon: '🃏', description: 'Learned 5 different skills' },
  { id: 'top_rated', name: 'Top Rated', icon: '🏆', description: 'Maintained 4.8+ rating over 20 reviews' },
  { id: 'community_hero', name: 'Community Hero', icon: '🦸', description: 'Helped 50+ learners' },
  { id: 'early_adopter', name: 'Early Adopter', icon: '🌅', description: 'Joined during beta' },
  { id: 'mentor', name: 'Mentor', icon: '🧙', description: 'Mentored 10+ students to completion' },
];

// --------------- INDIAN CITIES ---------------
export const INDIAN_CITIES = [
  'Siliguri',
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Surat',
  'Chandigarh',
  'Kochi',
  'Indore',
  'Bhopal',
  'Nagpur',
  'Coimbatore',
  'Thiruvananthapuram',
  'Guwahati',
  'Visakhapatnam',
];

// --------------- LANGUAGES ---------------
export const LANGUAGES = [
  'English',
  'Hindi',
  'Bengali',
  'Nepali',
  'Telugu',
  'Marathi',
  'Tamil',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Odia',
  'Punjabi',
  'Urdu',
];

// --------------- SESSION TYPES ---------------
export const SESSION_TYPES = {
  learn_teach: { label: 'Learn / Teach Session' },
  rent_skill: { label: 'Skill Rental' },
  local_service: { label: 'Local Service' },
};

// --------------- PAYMENT METHODS ---------------
export const PAYMENT_METHODS = {
  card: { label: 'Credit / Debit Card', icon: '💳' },
  upi: { label: 'UPI', icon: '📲' },
  wallet: { label: 'Skill-X Wallet', icon: '👛' },
  netbanking: { label: 'Net Banking', icon: '🏦' },
  phonepe: { label: 'PhonePe', icon: '📱' },
  gpay: { label: 'Google Pay', icon: '🅖' },
};

// --------------- NOTIFICATION TYPES ---------------
export const NOTIFICATION_TYPES = {
  session_request: { icon: '📩', color: 'text-blue-400' },
  session_accepted: { icon: '✅', color: 'text-green-400' },
  session_declined: { icon: '❌', color: 'text-red-400' },
  session_completed: { icon: '🎉', color: 'text-yellow-400' },
  session_reminder: { icon: '⏰', color: 'text-orange-400' },
  payment_received: { icon: '💰', color: 'text-green-400' },
  payment_sent: { icon: '💸', color: 'text-red-400' },
  review_received: { icon: '⭐', color: 'text-yellow-400' },
  badge_earned: { icon: '🏅', color: 'text-purple-400' },
  level_up: { icon: '🆙', color: 'text-cyan-400' },
  message: { icon: '💬', color: 'text-gray-400' },
  system: { icon: '🔔', color: 'text-gray-500' },
};

// --------------- PASSWORD RULES ---------------
export const PASSWORD_RULES = [
  {
    rule: 'minLength',
    regex: /^.{8,}$/,
    label: 'At least 8 characters',
  },
  {
    rule: 'uppercase',
    regex: /[A-Z]/,
    label: 'At least one uppercase letter',
  },
  {
    rule: 'lowercase',
    regex: /[a-z]/,
    label: 'At least one lowercase letter',
  },
  {
    rule: 'number',
    regex: /\d/,
    label: 'At least one number',
  },
  {
    rule: 'special',
    regex: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
    label: 'At least one special character',
  },
];
