import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Skill from '../models/Skill.js';
import Post from '../models/Post.js';
import Session from '../models/Session.js';
import Review from '../models/Review.js';
import SkillCapsule from '../models/SkillCapsule.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import LearningPath from '../models/LearningPath.js';

dotenv.config({ path: '../../.env' });

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.log('No MONGODB_URI found. Set it in .env file.');
      process.exit(1);
    }
    
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Skill.deleteMany({}),
      Post.deleteMany({}),
      Session.deleteMany({}),
      Review.deleteMany({}),
      SkillCapsule.deleteMany({}),
      Transaction.deleteMany({}),
      Notification.deleteMany({}),
      LearningPath.deleteMany({})
    ]);
    
    // Create Users
    console.log('Creating users...');
    const users = await User.create([
      {
        name: 'Priya Sharma',
        email: 'learner@skillx.com',
        password: 'Demo@123',
        age: 24,
        city: 'Bangalore',
        locality: 'Koramangala',
        languages: ['English', 'Hindi', 'Kannada'],
        gender: 'female',
        bio: 'Aspiring data scientist passionate about learning new technologies. Currently exploring Python and ML.',
        avatar: '',
        role: 'user',
        currentMode: 'learn',
        skillDNA: {
          skillsKnown: [
            { skill: 'HTML/CSS', subSkills: ['Flexbox', 'Grid'], confidenceLevel: 4, yearsExperience: 2, canTeach: true },
            { skill: 'JavaScript', subSkills: ['ES6', 'DOM'], confidenceLevel: 3, yearsExperience: 1, canTeach: false }
          ],
          skillsLearning: [
            { skill: 'Python', targetLevel: 'intermediate', priority: 'high' },
            { skill: 'Data Science', targetLevel: 'beginner', priority: 'medium' }
          ],
          successRate: 92,
          learningVelocity: 78,
          incomePotential: 15000,
          idealSessionDuration: 45
        },
        gamification: {
          xp: 450,
          level: 'gold',
          badges: [
            { id: 'first_session', name: 'First Session', icon: '🔥', description: 'Completed first session' },
            { id: 'quick_learner', name: 'Quick Learner', icon: '🚀', description: '5 sessions in 1 month' },
            { id: 'bookworm', name: 'Bookworm', icon: '📚', description: 'Learned 5 different skills' }
          ],
          streaks: { dailyLogin: { current: 12, best: 25 }, learning: { current: 5, best: 10 } }
        },
        wallet: { balance: 3500, totalEarned: 8500, totalSpent: 12000 },
        stats: { sessionsAsLearner: 32, sessionsAsTeacher: 8, totalEarnings: 8500, avgRating: 4.7, totalReviews: 15, memberSince: new Date('2024-06-01') },
        profileCompleted: true,
        onboardingCompleted: true,
        trust: { score: 85, verificationLevel: 'email' },
        impact: { co2Saved: 24, freeSessionsDonated: 3, studentsImpacted: 8, treesPlanted: 3 }
      },
      {
        name: 'Rahul Verma',
        email: 'teacher@skillx.com',
        password: 'Demo@123',
        age: 28,
        city: 'Mumbai',
        locality: 'Andheri',
        languages: ['English', 'Hindi', 'Marathi'],
        gender: 'male',
        bio: 'Senior Python developer with 5+ years experience. Love teaching and helping others grow. Specialized in web scraping, APIs, and data science.',
        avatar: '',
        role: 'user',
        currentMode: 'teach',
        skillDNA: {
          skillsKnown: [
            { skill: 'Python', subSkills: ['Web Scraping', 'APIs', 'Data Science', 'Django'], confidenceLevel: 5, yearsExperience: 5, canTeach: true },
            { skill: 'JavaScript', subSkills: ['React', 'Node.js'], confidenceLevel: 4, yearsExperience: 3, canTeach: true },
            { skill: 'SQL', subSkills: ['PostgreSQL', 'MySQL'], confidenceLevel: 4, yearsExperience: 4, canTeach: true },
            { skill: 'Data Science', subSkills: ['Pandas', 'NumPy', 'ML Basics'], confidenceLevel: 4, yearsExperience: 2, canTeach: true }
          ],
          skillsLearning: [
            { skill: 'AI/ML', targetLevel: 'advanced', priority: 'high' }
          ],
          successRate: 96,
          learningVelocity: 65,
          incomePotential: 45000,
          idealSessionDuration: 45
        },
        gamification: {
          xp: 1200,
          level: 'platinum',
          badges: [
            { id: 'first_session', name: 'First Session', icon: '🔥', description: 'Completed first session' },
            { id: 'super_mentor', name: 'Super Mentor', icon: '💎', description: 'Taught 50+ students' },
            { id: 'golden_teacher', name: 'Golden Teacher', icon: '🏆', description: '4.9+ rating' },
            { id: 'certified_expert', name: 'Certified Expert', icon: '🎓', description: '5+ capsules' },
            { id: 'streak_master', name: 'Streak Master', icon: '🔥', description: '30-day streak' }
          ],
          streaks: { dailyLogin: { current: 35, best: 60 }, teaching: { current: 15, best: 25 } }
        },
        wallet: { balance: 12500, totalEarned: 65000, totalSpent: 5000 },
        stats: { sessionsAsTeacher: 85, sessionsAsLearner: 12, totalEarnings: 65000, avgRating: 4.9, totalReviews: 62, responseTime: 30, repeatStudentPercent: 40, memberSince: new Date('2024-01-15') },
        teachingProfile: {
          headline: 'Senior Python Developer & Mentor',
          hourlyRate: 800,
          availability: [
            { day: 'mon', startTime: '18:00', endTime: '21:00' },
            { day: 'wed', startTime: '18:00', endTime: '21:00' },
            { day: 'fri', startTime: '18:00', endTime: '21:00' },
            { day: 'sat', startTime: '10:00', endTime: '16:00' }
          ],
          batchSize: '1-on-1',
          teachingStyle: 'practical',
          isAvailable: true
        },
        profileCompleted: true,
        onboardingCompleted: true,
        trust: { score: 95, verificationLevel: 'full' },
        impact: { co2Saved: 85, freeSessionsDonated: 10, studentsImpacted: 65, treesPlanted: 8 }
      },
      {
        name: 'Admin User',
        email: 'admin@skillx.com',
        password: 'Admin@123',
        age: 30,
        city: 'Delhi',
        locality: 'Connaught Place',
        languages: ['English', 'Hindi'],
        gender: 'male',
        bio: 'Platform administrator',
        role: 'admin',
        currentMode: 'learn',
        profileCompleted: true,
        onboardingCompleted: true,
        gamification: { xp: 2000, level: 'legend' },
        wallet: { balance: 0 },
        trust: { score: 100, verificationLevel: 'full' }
      },
      {
        name: 'Ananya Patel',
        email: 'user@skillx.com',
        password: 'Demo@123',
        age: 26,
        city: 'Hyderabad',
        locality: 'Madhapur',
        languages: ['English', 'Hindi', 'Telugu'],
        gender: 'female',
        bio: 'Full-stack developer and freelance designer. I teach web development and offer design services.',
        avatar: '',
        role: 'user',
        currentMode: 'teach',
        skillDNA: {
          skillsKnown: [
            { skill: 'React', subSkills: ['Hooks', 'Redux', 'Next.js'], confidenceLevel: 5, yearsExperience: 3, canTeach: true },
            { skill: 'UI/UX Design', subSkills: ['Figma', 'Prototyping'], confidenceLevel: 4, yearsExperience: 2, canTeach: true },
            { skill: 'Node.js', subSkills: ['Express', 'MongoDB'], confidenceLevel: 4, yearsExperience: 3, canTeach: true }
          ],
          skillsLearning: [
            { skill: 'AI/ML', targetLevel: 'intermediate', priority: 'medium' },
            { skill: 'Cloud Computing', targetLevel: 'beginner', priority: 'low' }
          ],
          successRate: 94,
          learningVelocity: 72,
          incomePotential: 35000
        },
        gamification: {
          xp: 650,
          level: 'gold',
          badges: [
            { id: 'first_session', name: 'First Session', icon: '🔥', description: 'Completed first session' },
            { id: 'quick_learner', name: 'Quick Learner', icon: '🚀', description: '5 sessions in 1 month' }
          ]
        },
        wallet: { balance: 8200, totalEarned: 32000, totalSpent: 7500 },
        stats: { sessionsAsTeacher: 42, sessionsAsLearner: 18, totalEarnings: 32000, avgRating: 4.8, totalReviews: 28, memberSince: new Date('2024-03-10') },
        teachingProfile: {
          headline: 'Full-Stack Developer & UI/UX Mentor',
          hourlyRate: 700,
          availability: [
            { day: 'tue', startTime: '17:00', endTime: '20:00' },
            { day: 'thu', startTime: '17:00', endTime: '20:00' },
            { day: 'sat', startTime: '09:00', endTime: '13:00' }
          ],
          batchSize: '1-on-1',
          teachingStyle: 'mixed',
          isAvailable: true
        },
        profileCompleted: true,
        onboardingCompleted: true,
        trust: { score: 88, verificationLevel: 'email' },
        impact: { co2Saved: 42, freeSessionsDonated: 5, studentsImpacted: 28, treesPlanted: 4 }
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@skillx.com',
        password: 'Demo@123',
        age: 32,
        city: 'Pune',
        locality: 'Kothrud',
        languages: ['English', 'Hindi', 'Marathi'],
        gender: 'male',
        bio: 'Professional home services provider. Offering cleaning, repairs, and maintenance services.',
        role: 'user',
        currentMode: 'service',
        skillDNA: {
          skillsKnown: [
            { skill: 'Home Cleaning', subSkills: ['Deep Clean', 'Eco-friendly'], confidenceLevel: 5, yearsExperience: 8, canTeach: false },
            { skill: 'Plumbing', subSkills: ['Repairs', 'Installation'], confidenceLevel: 4, yearsExperience: 5, canTeach: false },
            { skill: 'Electrical Repair', subSkills: ['Wiring', 'Fixtures'], confidenceLevel: 4, yearsExperience: 6, canTeach: false }
          ],
          successRate: 98,
          incomePotential: 25000
        },
        gamification: { xp: 380, level: 'gold', badges: [{ id: 'first_session', name: 'First Session', icon: '🔥' }] },
        wallet: { balance: 5800, totalEarned: 45000, totalSpent: 500 },
        stats: { sessionsAsTeacher: 120, avgRating: 4.85, totalReviews: 95, memberSince: new Date('2024-02-01') },
        serviceProfile: { services: ['Home Cleaning', 'Plumbing', 'Electrical Repair'], serviceRadius: 10 },
        profileCompleted: true,
        onboardingCompleted: true,
        trust: { score: 92, verificationLevel: 'id' }
      },
      {
        name: 'Meera Reddy',
        email: 'meera@skillx.com',
        password: 'Demo@123',
        age: 22,
        city: 'Chennai',
        locality: 'T. Nagar',
        languages: ['English', 'Tamil', 'Hindi'],
        gender: 'female',
        bio: 'Language enthusiast and IELTS trainer. Helping people ace their English exams and improve communication skills.',
        role: 'user',
        currentMode: 'teach',
        skillDNA: {
          skillsKnown: [
            { skill: 'English', subSkills: ['IELTS Prep', 'Grammar', 'Business English'], confidenceLevel: 5, yearsExperience: 3, canTeach: true },
            { skill: 'Public Speaking', subSkills: ['Presentation Skills', 'Interview Prep'], confidenceLevel: 4, yearsExperience: 2, canTeach: true },
            { skill: 'Content Writing', subSkills: ['Blog Writing', 'SEO'], confidenceLevel: 4, yearsExperience: 2, canTeach: true }
          ],
          skillsLearning: [
            { skill: 'Spanish', targetLevel: 'intermediate', priority: 'high' }
          ],
          successRate: 91,
          learningVelocity: 80,
          incomePotential: 20000
        },
        gamification: { xp: 280, level: 'silver', badges: [{ id: 'first_session', name: 'First Session', icon: '🔥' }] },
        wallet: { balance: 4200, totalEarned: 18000, totalSpent: 3000 },
        stats: { sessionsAsTeacher: 35, sessionsAsLearner: 10, totalEarnings: 18000, avgRating: 4.6, totalReviews: 22, memberSince: new Date('2024-05-20') },
        teachingProfile: {
          headline: 'IELTS Trainer & Communication Coach',
          hourlyRate: 500,
          isAvailable: true
        },
        profileCompleted: true,
        onboardingCompleted: true,
        trust: { score: 80, verificationLevel: 'email' }
      }
    ]);
    console.log(`Created ${users.length} users`);
    
    // Create Skills
    console.log('Creating skills...');
    const skills = await Skill.create([
      // Tech
      { name: 'Python', category: 'tech', subSkills: ['Web Scraping', 'APIs', 'Data Science', 'Django', 'Flask', 'Automation'], metadata: { demand: 300, supply: 150, avgPrice: 700, trending: true, trendingScore: 95, totalSessions: 450 } },
      { name: 'JavaScript', category: 'tech', subSkills: ['React', 'Node.js', 'Vue', 'Angular', 'TypeScript'], metadata: { demand: 280, supply: 120, avgPrice: 650, trending: true, trendingScore: 88, totalSessions: 380 } },
      { name: 'React', category: 'tech', subSkills: ['Hooks', 'Redux', 'Next.js', 'React Native'], metadata: { demand: 250, supply: 80, avgPrice: 800, trending: true, trendingScore: 90, totalSessions: 320 } },
      { name: 'Data Science', category: 'tech', subSkills: ['Pandas', 'NumPy', 'ML', 'Statistics', 'Visualization'], metadata: { demand: 200, supply: 60, avgPrice: 1000, trending: true, trendingScore: 92, totalSessions: 280 } },
      { name: 'SQL', category: 'tech', subSkills: ['PostgreSQL', 'MySQL', 'Joins', 'Query Optimization'], metadata: { demand: 180, supply: 100, avgPrice: 500, trending: false, totalSessions: 200 } },
      { name: 'Web Development', category: 'tech', subSkills: ['HTML', 'CSS', 'Frontend', 'Backend', 'Full-Stack'], metadata: { demand: 350, supply: 200, avgPrice: 600, trending: true, trendingScore: 85 } },
      { name: 'AI/ML', category: 'tech', subSkills: ['TensorFlow', 'PyTorch', 'NLP', 'Computer Vision'], metadata: { demand: 150, supply: 30, avgPrice: 1200, trending: true, trendingScore: 98 } },
      { name: 'Cloud Computing', category: 'tech', subSkills: ['AWS', 'Azure', 'GCP', 'Docker'], metadata: { demand: 120, supply: 40, avgPrice: 900, trending: true, trendingScore: 80 } },
      // Creative
      { name: 'UI/UX Design', category: 'creative', subSkills: ['Figma', 'Prototyping', 'User Research'], metadata: { demand: 180, supply: 70, avgPrice: 750, trending: true, trendingScore: 78 } },
      { name: 'Graphic Design', category: 'creative', subSkills: ['Photoshop', 'Illustrator', 'Logo Design'], metadata: { demand: 150, supply: 90, avgPrice: 500 } },
      { name: 'Video Editing', category: 'creative', subSkills: ['Premiere Pro', 'After Effects', 'DaVinci'], metadata: { demand: 120, supply: 60, avgPrice: 600 } },
      { name: 'Photography', category: 'creative', subSkills: ['Portrait', 'Product', 'Editing'], metadata: { demand: 80, supply: 50, avgPrice: 800 } },
      { name: 'Content Writing', category: 'creative', subSkills: ['Blog Writing', 'SEO', 'Copywriting'], metadata: { demand: 160, supply: 100, avgPrice: 400 } },
      // Life Skills
      { name: 'Public Speaking', category: 'life_skills', subSkills: ['Presentation', 'Stage Presence', 'Storytelling'], metadata: { demand: 100, supply: 40, avgPrice: 600 } },
      { name: 'Interview Prep', category: 'life_skills', subSkills: ['Technical Interview', 'HR Round', 'Resume Writing'], metadata: { demand: 200, supply: 80, avgPrice: 500, trending: true, trendingScore: 75 } },
      { name: 'Communication', category: 'life_skills', subSkills: ['Business Communication', 'Negotiation', 'Leadership'], metadata: { demand: 130, supply: 60, avgPrice: 550 } },
      // Languages
      { name: 'English', category: 'languages', subSkills: ['Grammar', 'Conversation', 'IELTS Prep', 'Business English'], metadata: { demand: 300, supply: 150, avgPrice: 400, trending: true, trendingScore: 82 } },
      { name: 'Hindi', category: 'languages', subSkills: ['Reading', 'Writing', 'Conversation'], metadata: { demand: 80, supply: 100, avgPrice: 300 } },
      { name: 'Spanish', category: 'languages', subSkills: ['Beginner', 'Intermediate', 'Conversation'], metadata: { demand: 60, supply: 20, avgPrice: 600 } },
      // Trades
      { name: 'Home Cleaning', category: 'trades_services', subSkills: ['Deep Clean', 'Eco-friendly', 'Office Cleaning'], metadata: { demand: 200, supply: 80, avgPrice: 1500 } },
      { name: 'Cooking', category: 'trades_services', subSkills: ['Indian', 'Baking', 'Italian'], metadata: { demand: 100, supply: 50, avgPrice: 800 } },
      { name: 'Plumbing', category: 'trades_services', subSkills: ['Repairs', 'Installation'], metadata: { demand: 150, supply: 40, avgPrice: 1000 } },
      // Business
      { name: 'Digital Marketing', category: 'business', subSkills: ['SEO', 'Social Media', 'PPC', 'Email Marketing'], metadata: { demand: 180, supply: 70, avgPrice: 700, trending: true, trendingScore: 76 } },
      { name: 'Financial Planning', category: 'business', subSkills: ['Investment', 'Tax Planning', 'Budgeting'], metadata: { demand: 90, supply: 30, avgPrice: 800 } }
    ]);
    console.log(`Created ${skills.length} skills`);
    
    // Create Posts
    console.log('Creating posts...');
    const posts = await Post.create([
      {
        author: users[0]._id, mode: 'learn', skill: 'Python', subSkill: 'Web Scraping',
        category: 'tech', title: 'Want to learn Python Web Scraping in 2 weeks',
        description: 'Looking for an experienced Python developer who can teach me web scraping with BeautifulSoup and Selenium. I have basic Python knowledge.',
        pricing: { amount: 500, per: 'session' }, duration: 45, isOnline: true,
        expectedOutcome: 'Build a functional web scraper', learningGoal: 'Write web scrapers independently',
        tags: ['python', 'web-scraping', 'beginner']
      },
      {
        author: users[1]._id, mode: 'teach', skill: 'Python', subSkill: 'Django Web Development',
        category: 'tech', title: 'Python & Django Masterclass - Build Real Projects',
        description: 'Learn Python programming and Django web framework through hands-on projects. From basics to deployment.',
        pricing: { amount: 800, per: 'hour' }, duration: 60, isOnline: true,
        tags: ['python', 'django', 'web-dev', 'projects']
      },
      {
        author: users[3]._id, mode: 'teach', skill: 'React', subSkill: 'Modern React with Hooks',
        category: 'tech', title: 'React.js Complete Course - Beginner to Advanced',
        description: 'Master React.js including Hooks, Context API, Redux, and Next.js. Build 5 real-world projects.',
        pricing: { amount: 700, per: 'hour' }, duration: 45, isOnline: true,
        tags: ['react', 'javascript', 'frontend']
      },
      {
        author: users[1]._id, mode: 'rent', skill: 'Python', subSkill: 'Debug Python Code',
        category: 'tech', title: 'Debug Your Python Code - Quick Fix in 15 mins',
        description: 'Having trouble with your Python code? I can help debug and fix issues in 15 minutes.',
        pricing: { amount: 200, per: 'task' }, duration: 15, isOnline: true,
        tags: ['python', 'debugging', 'quick-fix']
      },
      {
        author: users[3]._id, mode: 'rent', skill: 'UI/UX Design', subSkill: 'Fix CSS Layout',
        category: 'creative', title: 'Fix CSS Layout Issues - ₹200 for 15 mins',
        description: 'CSS acting up? Flexbox or Grid problems? I\'ll fix your layout issues quickly.',
        pricing: { amount: 200, per: 'task' }, duration: 15, isOnline: true,
        tags: ['css', 'layout', 'quick-fix']
      },
      {
        author: users[4]._id, mode: 'service', skill: 'Home Cleaning',
        category: 'trades_services', title: 'Professional Home Cleaning - Eco-Friendly Products',
        description: 'Complete home cleaning service using eco-friendly products. Available Mon-Sat, 8AM-6PM. 5km radius from Kothrud, Pune.',
        pricing: { amount: 1500, per: 'task', negotiable: true }, isOnline: false,
        location: { city: 'Pune', locality: 'Kothrud', radius: 5 },
        tags: ['cleaning', 'eco-friendly', 'home']
      },
      {
        author: users[4]._id, mode: 'service', skill: 'Plumbing',
        category: 'trades_services', title: 'Expert Plumbing Services - All Repairs & Installations',
        description: 'Professional plumbing services including pipe repairs, tap installations, and drainage fixing.',
        pricing: { amount: 800, per: 'task', negotiable: true }, isOnline: false,
        location: { city: 'Pune', locality: 'Kothrud', radius: 10 },
        tags: ['plumbing', 'repairs', 'installation']
      },
      {
        author: users[0]._id, mode: 'request', skill: 'Home Cleaning',
        category: 'trades_services', title: 'Need home cleaning for 2-BHK apartment',
        description: 'Looking for a professional cleaner for my 2-BHK apartment in Koramangala. Pet-friendly products preferred.',
        pricing: { amount: 1500, per: 'task' }, isOnline: false,
        location: { city: 'Bangalore', locality: 'Koramangala' },
        requirements: 'Pet-friendly products, available on weekends',
        tags: ['cleaning', 'pet-friendly', 'weekend']
      },
      {
        author: users[5]._id, mode: 'teach', skill: 'English', subSkill: 'IELTS Preparation',
        category: 'languages', title: 'IELTS Band 7+ Guaranteed Preparation Course',
        description: 'Comprehensive IELTS preparation covering all 4 modules. 90% of my students score 7+.',
        pricing: { amount: 500, per: 'hour' }, duration: 60, isOnline: true,
        tags: ['ielts', 'english', 'exam-prep']
      },
      {
        author: users[5]._id, mode: 'teach', skill: 'Public Speaking',
        category: 'life_skills', title: 'Master Public Speaking in 4 Weeks',
        description: 'Overcome stage fear and become a confident speaker. Practical sessions with real presentations.',
        pricing: { amount: 600, per: 'session' }, duration: 45, isOnline: true,
        tags: ['public-speaking', 'confidence', 'communication']
      },
      {
        author: users[3]._id, mode: 'learn', skill: 'AI/ML', subSkill: 'Machine Learning Basics',
        category: 'tech', title: 'Want to learn Machine Learning from scratch',
        description: 'Looking for an ML expert to teach me the fundamentals. I have strong Python skills.',
        pricing: { amount: 1000, per: 'session' }, duration: 60, isOnline: true,
        learningGoal: 'Build a basic ML model independently',
        tags: ['ml', 'ai', 'python', 'data-science']
      },
      {
        author: users[0]._id, mode: 'learn', skill: 'Data Science', subSkill: 'SQL Fundamentals',
        category: 'tech', title: 'Need help with SQL Joins and Queries',
        description: 'I need to learn SQL properly for my data science career. Focus on joins, subqueries, and optimization.',
        pricing: { amount: 400, per: 'session' }, duration: 30, isOnline: true,
        expectedOutcome: 'Write complex SQL queries without looking up',
        tags: ['sql', 'database', 'data-science']
      }
    ]);
    console.log(`Created ${posts.length} posts`);
    
    // Create Sessions
    console.log('Creating sessions...');
    const sessions = await Session.create([
      {
        learner: users[0]._id, teacher: users[1]._id, post: posts[0]._id,
        skill: 'Python', subSkill: 'Web Scraping', sessionType: 'learn_teach',
        status: 'completed',
        scheduling: { date: new Date(Date.now() - 7 * 86400000), startTime: '18:00', duration: 45, isOnline: true },
        outcome: { learnerConfirmed: true, teacherConfirmed: true, description: 'Successfully built a web scraper', completedAt: new Date(Date.now() - 7 * 86400000) },
        payment: { amount: 500, platformFee: 25, teacherReceives: 475, escrowStatus: 'released', paidAt: new Date(Date.now() - 8 * 86400000), releasedAt: new Date(Date.now() - 7 * 86400000) },
        ratings: { learnerRating: 5, teacherRating: 5, learnerReview: 'Amazing teacher! Very clear explanations.', teacherReview: 'Quick learner, great student!' }
      },
      {
        learner: users[0]._id, teacher: users[1]._id,
        skill: 'Python', subSkill: 'APIs', sessionType: 'learn_teach',
        status: 'escrow_paid',
        scheduling: { date: new Date(Date.now() + 1 * 86400000), startTime: '18:00', duration: 45, isOnline: true, meetingLink: 'https://meet.skillx.com/abc123' },
        payment: { amount: 500, platformFee: 25, teacherReceives: 475, escrowStatus: 'locked', paidAt: new Date() }
      },
      {
        learner: users[3]._id, teacher: users[5]._id,
        skill: 'English', subSkill: 'Business English', sessionType: 'learn_teach',
        status: 'completed',
        scheduling: { date: new Date(Date.now() - 3 * 86400000), startTime: '17:00', duration: 60, isOnline: true },
        outcome: { learnerConfirmed: true, teacherConfirmed: true, completedAt: new Date(Date.now() - 3 * 86400000) },
        payment: { amount: 500, platformFee: 25, teacherReceives: 475, escrowStatus: 'released' },
        ratings: { learnerRating: 4, teacherRating: 5 }
      },
      {
        learner: users[0]._id, teacher: users[4]._id,
        skill: 'Home Cleaning', sessionType: 'local_service',
        status: 'completed',
        scheduling: { date: new Date(Date.now() - 14 * 86400000), startTime: '10:00', duration: 120, isOnline: false },
        outcome: { learnerConfirmed: true, teacherConfirmed: true },
        proof: { gpsTimestamp: { lat: 12.9352, lng: 77.6245, timestamp: new Date(Date.now() - 14 * 86400000) }, customerSignature: true },
        payment: { amount: 1500, platformFee: 75, teacherReceives: 1425, escrowStatus: 'released' },
        location: { address: 'Koramangala, Bangalore', city: 'Bangalore' }
      },
      {
        learner: users[0]._id, teacher: users[3]._id,
        skill: 'React', subSkill: 'Hooks', sessionType: 'rent_skill',
        status: 'completed',
        scheduling: { date: new Date(Date.now() - 5 * 86400000), startTime: '19:00', duration: 15, isOnline: true },
        outcome: { learnerConfirmed: true, teacherConfirmed: true },
        payment: { amount: 200, platformFee: 10, teacherReceives: 190, escrowStatus: 'released' }
      }
    ]);
    console.log(`Created ${sessions.length} sessions`);
    
    // Create Reviews
    console.log('Creating reviews...');
    await Review.create([
      { reviewer: users[0]._id, reviewee: users[1]._id, session: sessions[0]._id, rating: 5, content: 'Rahul is an amazing Python teacher! He explained web scraping concepts clearly and helped me build a real project.', skill: 'Python', isTestimonial: true, testimonialQuote: 'Best Python teacher on the platform!', aspects: { knowledge: 5, communication: 5, punctuality: 5, value: 5 } },
      { reviewer: users[1]._id, reviewee: users[0]._id, session: sessions[0]._id, rating: 5, content: 'Priya is a dedicated learner. She picked up concepts quickly and asked great questions.', skill: 'Python', aspects: { knowledge: 4, communication: 5, punctuality: 5, value: 5 } },
      { reviewer: users[3]._id, reviewee: users[5]._id, session: sessions[2]._id, rating: 4, content: 'Good English session. Meera helped improve my business communication skills.', skill: 'English', aspects: { knowledge: 4, communication: 5, punctuality: 4, value: 4 } },
      { reviewer: users[0]._id, reviewee: users[4]._id, session: sessions[3]._id, rating: 5, content: 'Vikram did an excellent job cleaning my apartment. Very professional and used eco-friendly products!', skill: 'Home Cleaning', isTestimonial: true, testimonialQuote: 'Excellent and professional service!' },
      { reviewer: users[0]._id, reviewee: users[3]._id, session: sessions[4]._id, rating: 5, content: 'Quick CSS fix! Ananya solved my layout issue in under 10 minutes. Highly recommend for quick help.', skill: 'React' }
    ]);
    console.log('Created reviews');
    
    // Create Skill Capsules
    console.log('Creating skill capsules...');
    await SkillCapsule.create([
      { learner: users[0]._id, teacher: users[1]._id, session: sessions[0]._id, skill: 'Python', subSkill: 'Web Scraping', category: 'tech', difficultyLevel: 'intermediate', outcome: 'Successfully built a web scraper using BeautifulSoup', duration: 45, confidenceScore: 88, teacherTestimonial: 'Priya demonstrated excellent understanding of web scraping concepts' },
      { learner: users[3]._id, teacher: users[5]._id, session: sessions[2]._id, skill: 'English', subSkill: 'Business English', category: 'languages', difficultyLevel: 'intermediate', outcome: 'Improved business communication skills', duration: 60, confidenceScore: 82 },
      { learner: users[0]._id, teacher: users[3]._id, session: sessions[4]._id, skill: 'React', subSkill: 'Hooks', category: 'tech', difficultyLevel: 'beginner', outcome: 'Fixed CSS layout issue using React hooks', duration: 15, confidenceScore: 75 },
      { learner: users[0]._id, teacher: users[1]._id, skill: 'Python', subSkill: 'Variables & Data Types', category: 'tech', difficultyLevel: 'beginner', outcome: 'Mastered Python basics', duration: 45, confidenceScore: 95, session: sessions[0]._id },
      { learner: users[0]._id, teacher: users[1]._id, skill: 'Python', subSkill: 'Functions & Loops', category: 'tech', difficultyLevel: 'beginner', outcome: 'Built function-based programs', duration: 45, confidenceScore: 90, session: sessions[0]._id }
    ]);
    console.log('Created skill capsules');
    
    // Create Transactions
    console.log('Creating transactions...');
    await Transaction.create([
      { user: users[0]._id, type: 'payment', amount: 5000, status: 'completed', paymentMethod: 'upi', description: 'Added funds to wallet' },
      { user: users[0]._id, type: 'escrow_lock', amount: 500, status: 'completed', session: sessions[0]._id, otherUser: users[1]._id, description: 'Escrow for Python Web Scraping session', breakdown: { subtotal: 500, platformFee: 25, netAmount: 475 } },
      { user: users[1]._id, type: 'escrow_release', amount: 475, status: 'completed', session: sessions[0]._id, otherUser: users[0]._id, description: 'Payment for Python Web Scraping session', breakdown: { subtotal: 500, platformFee: 25, netAmount: 475 } },
      { user: users[0]._id, type: 'escrow_lock', amount: 1500, status: 'completed', session: sessions[3]._id, otherUser: users[4]._id, description: 'Escrow for Home Cleaning service' },
      { user: users[4]._id, type: 'escrow_release', amount: 1425, status: 'completed', session: sessions[3]._id, otherUser: users[0]._id, description: 'Payment for Home Cleaning service', breakdown: { subtotal: 1500, platformFee: 75, netAmount: 1425 } },
      { user: users[1]._id, type: 'withdrawal', amount: -5000, status: 'completed', paymentMethod: 'upi', description: 'Withdrawal to UPI', withdrawal: { upiId: 'rahul@upi', processedAt: new Date() } },
      { user: users[0]._id, type: 'escrow_lock', amount: 200, status: 'completed', session: sessions[4]._id, otherUser: users[3]._id, description: 'Escrow for React CSS Fix' },
      { user: users[3]._id, type: 'escrow_release', amount: 190, status: 'completed', session: sessions[4]._id, otherUser: users[0]._id, description: 'Payment for React CSS Fix' }
    ]);
    console.log('Created transactions');
    
    // Create Learning Paths
    console.log('Creating learning paths...');
    await LearningPath.create([
      {
        name: 'Python Mastery', description: 'Go from Python beginner to expert in 10 weeks',
        category: 'tech', icon: '🐍', difficulty: 'beginner',
        levels: [
          { level: 1, name: 'Python Basics', description: 'Variables, Data Types, Loops', skills: ['Python'], requiredCapsules: 1, xpReward: 100, estimatedDuration: '2 weeks', estimatedCost: 1000, isLocked: false },
          { level: 2, name: 'Functions & Modules', description: 'Functions, modules, file handling', skills: ['Python'], requiredCapsules: 1, xpReward: 150, estimatedDuration: '2 weeks', estimatedCost: 1200 },
          { level: 3, name: 'OOP Concepts', description: 'Classes, objects, inheritance', skills: ['Python'], requiredCapsules: 1, xpReward: 200, estimatedDuration: '2 weeks', estimatedCost: 1500 },
          { level: 4, name: 'Web Scraping & APIs', description: 'BeautifulSoup, Requests, REST APIs', skills: ['Python'], requiredCapsules: 1, xpReward: 250, estimatedDuration: '2 weeks', estimatedCost: 1800 },
          { level: 5, name: 'Data Science Libraries', description: 'Pandas, NumPy, Matplotlib', skills: ['Python', 'Data Science'], requiredCapsules: 2, xpReward: 300, badgeReward: 'Python Master', estimatedDuration: '2 weeks', estimatedCost: 2000 }
        ],
        totalLevels: 5, estimatedTotalDuration: '10 weeks', estimatedTotalCost: 7500,
        earningPotentialAfter: '₹20,000-30,000/month', featured: true, totalEnrolled: 234
      },
      {
        name: 'Web Development', description: 'Full-stack web development from scratch',
        category: 'tech', icon: '🌐', difficulty: 'beginner',
        levels: [
          { level: 1, name: 'HTML/CSS Fundamentals', description: 'Semantic HTML, CSS Grid/Flexbox', skills: ['HTML/CSS'], requiredCapsules: 1, xpReward: 100, estimatedDuration: '2 weeks', estimatedCost: 800, isLocked: false },
          { level: 2, name: 'JavaScript Basics', description: 'ES6+, DOM manipulation', skills: ['JavaScript'], requiredCapsules: 1, xpReward: 150, estimatedDuration: '3 weeks', estimatedCost: 1200 },
          { level: 3, name: 'React.js', description: 'Components, hooks, state management', skills: ['React'], requiredCapsules: 1, xpReward: 250, estimatedDuration: '3 weeks', estimatedCost: 1800 },
          { level: 4, name: 'Backend (Node.js)', description: 'Express, MongoDB, APIs', skills: ['Node.js'], requiredCapsules: 1, xpReward: 250, estimatedDuration: '3 weeks', estimatedCost: 1500 },
          { level: 5, name: 'Full-Stack Projects', description: 'Build 2 complete projects', skills: ['React', 'Node.js'], requiredCapsules: 2, xpReward: 400, badgeReward: 'Full-Stack Dev', estimatedDuration: '3 weeks', estimatedCost: 2000 }
        ],
        totalLevels: 5, estimatedTotalDuration: '14 weeks', estimatedTotalCost: 7300,
        earningPotentialAfter: '₹25,000-40,000/month', featured: true, totalEnrolled: 312
      },
      {
        name: 'Data Science', description: 'Become a data scientist in 16 weeks',
        category: 'tech', icon: '📊', difficulty: 'intermediate',
        levels: [
          { level: 1, name: 'Python for Data Science', description: 'Python fundamentals for data work', skills: ['Python'], requiredCapsules: 1, xpReward: 150, estimatedDuration: '3 weeks', estimatedCost: 1500, isLocked: false },
          { level: 2, name: 'SQL & Databases', description: 'SQL queries, joins, databases', skills: ['SQL'], requiredCapsules: 1, xpReward: 200, estimatedDuration: '3 weeks', estimatedCost: 1200 },
          { level: 3, name: 'Statistics & Probability', description: 'Statistical thinking for data', skills: ['Data Science'], requiredCapsules: 1, xpReward: 250, estimatedDuration: '3 weeks', estimatedCost: 1800 },
          { level: 4, name: 'Machine Learning', description: 'ML algorithms, scikit-learn', skills: ['AI/ML'], requiredCapsules: 2, xpReward: 350, estimatedDuration: '4 weeks', estimatedCost: 2500 },
          { level: 5, name: 'Real-World Projects', description: 'Kaggle competitions, portfolio', skills: ['Data Science', 'AI/ML'], requiredCapsules: 2, xpReward: 500, badgeReward: 'Data Scientist', estimatedDuration: '3 weeks', estimatedCost: 2000 }
        ],
        totalLevels: 5, estimatedTotalDuration: '16 weeks', estimatedTotalCost: 9000,
        earningPotentialAfter: '₹30,000-50,000/month', featured: true, totalEnrolled: 156
      }
    ]);
    console.log('Created learning paths');
    
    // Create Notifications for demo user
    console.log('Creating notifications...');
    await Notification.create([
      { recipient: users[0]._id, type: 'skill_match', title: 'Skill Match Found', message: 'Found 3 teachers for Python Web Scraping!', priority: 'medium', icon: '🤝' },
      { recipient: users[0]._id, type: 'session_reminder', title: 'Session Tomorrow', message: 'Your Python session with Rahul starts tomorrow at 6 PM', priority: 'urgent', icon: '⏳' },
      { recipient: users[0]._id, type: 'payment_update', title: 'Payment Received', message: '₹475 released from escrow for Python session', priority: 'high', icon: '💰' },
      { recipient: users[0]._id, type: 'capsule_generated', title: 'Skill Capsule Earned', message: 'You earned a Python Web Scraping capsule!', priority: 'medium', icon: '🏅' },
      { recipient: users[0]._id, type: 'badge_earned', title: 'Badge Earned!', message: 'You earned the Quick Learner badge! 🚀', priority: 'medium', icon: '🏆' },
      { recipient: users[0]._id, type: 'trending_alert', title: 'Trending Alert', message: '5 people want to learn what you teach!', priority: 'medium', icon: '🔥' },
      { recipient: users[1]._id, type: 'post_response', title: 'New Interest', message: 'Priya is interested in your Python teaching', priority: 'high', icon: '📢', relatedUser: users[0]._id },
      { recipient: users[1]._id, type: 'review_received', title: 'New Review', message: 'Priya gave you a 5-star review!', priority: 'medium', icon: '⭐', relatedUser: users[0]._id },
      { recipient: users[1]._id, type: 'payment_update', title: 'Payment Released', message: '₹475 credited to your wallet', priority: 'high', icon: '💰' },
      { recipient: users[0]._id, type: 'skill_progress', title: 'Skill Progress', message: "You're 80% towards Python mastery!", priority: 'low', icon: '📈' }
    ]);
    console.log('Created notifications');
    
    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('  Learner: learner@skillx.com / Demo@123');
    console.log('  Teacher: teacher@skillx.com / Demo@123');
    console.log('  Admin:   admin@skillx.com / Admin@123');
    console.log('  User:    user@skillx.com / Demo@123');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
