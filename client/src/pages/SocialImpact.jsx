import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Leaf,
  TreePine,
  Heart,
  Users,
  Globe,
  Award,
  Share2,
  ArrowUpRight,
  Sparkles,
  HandHeart,
  GraduationCap,
  Building2,
  IndianRupee,
  ChevronRight,
  ExternalLink,
  Trophy,
  TrendingUp,
  Star,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockUsers, mockLeaderboard } from '../data/mockData';

// ── animation variants ──────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

// ── glass card ──────────────────────────────────────────────
function GlassCard({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// ── mock impact data ────────────────────────────────────────
const mockPersonalImpact = {
  co2Saved: 12.4,
  freeSessionsDonated: 3,
  studentsImpacted: 18,
  treesPlanted: 2,
  totalSessions: 24,
  carbonFootprintReduction: 67,
};

const mockPlatformImpact = {
  totalCO2Saved: 4820,
  totalSessionsDonated: 1240,
  totalLivesImpacted: 28400,
  ngoPartnerships: 12,
  scholarshipFund: 385000,
  totalTreesPlanted: 2890,
};

const mockBadges = [
  {
    id: 'eco_warrior',
    name: 'Eco Warrior',
    icon: '🌍',
    description: 'Saved over 10kg of CO2 through online sessions',
    earned: true,
    earnedAt: '2026-01-15',
  },
  {
    id: 'carbon_saver',
    name: 'Carbon Saver',
    icon: '🌿',
    description: 'Completed 20+ remote sessions instead of in-person',
    earned: true,
    earnedAt: '2026-01-28',
  },
  {
    id: 'green_teacher',
    name: 'Green Teacher',
    icon: '🍃',
    description: 'Donated 5 free teaching sessions to underprivileged students',
    earned: false,
    progress: 60,
  },
];

const mockPrograms = [
  {
    id: 'free_education',
    title: 'Free Education Program',
    description: 'Volunteer 1 hour/month to teach underprivileged students for free. Every hour counts.',
    icon: GraduationCap,
    color: '#10b981',
    cta: 'Volunteer Now',
    participants: 342,
    hoursContributed: 1840,
  },
  {
    id: 'scholarship',
    title: 'Scholarship Program',
    description: 'Help fund scholarships for deserving students. Apply if you need support, or donate to make a difference.',
    icon: Award,
    color: '#8b5cf6',
    cta: 'Apply / Donate',
    participants: 128,
    amountRaised: 385000,
  },
  {
    id: 'skills_for_good',
    title: 'Skills for Good',
    description: 'Use your skills to help communities. We match skilled volunteers with NGOs and social enterprises.',
    icon: HandHeart,
    color: '#f59e0b',
    cta: 'Join Program',
    participants: 89,
    projectsCompleted: 156,
  },
];

const mockImpactLeaderboard = [
  { rank: 1, name: 'Priya Menon', city: 'Bangalore', co2Saved: 48.2, sessionsDonated: 24, badge: '🌍' },
  { rank: 2, name: 'Rahul Iyer', city: 'Chennai', co2Saved: 38.6, sessionsDonated: 18, badge: '🌿' },
  { rank: 3, name: 'Fatima Khan', city: 'Hyderabad', co2Saved: 32.1, sessionsDonated: 15, badge: '🍃' },
  { rank: 4, name: 'Vikram Patel', city: 'Ahmedabad', co2Saved: 24.8, sessionsDonated: 12, badge: '🌱' },
  { rank: 5, name: 'Neha Gupta', city: 'Delhi', co2Saved: 21.4, sessionsDonated: 9, badge: '🌱' },
  { rank: 6, name: 'Aarav Sharma', city: 'Mumbai', co2Saved: 12.4, sessionsDonated: 3, badge: '🌱' },
];

// ── impact stat card ────────────────────────────────────────
function ImpactStat({ icon: Icon, value, label, suffix = '', color }) {
  return (
    <motion.div variants={item}>
      <GlassCard className="p-5 hover:border-emerald-500/20 transition-colors group">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl mb-3 transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${color}22` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <p className="text-2xl font-bold text-white">
          {value}
          {suffix && <span className="text-base font-normal text-gray-400 ml-1">{suffix}</span>}
        </p>
        <p className="text-sm text-gray-400 mt-0.5">{label}</p>
      </GlassCard>
    </motion.div>
  );
}

// ── share button ────────────────────────────────────────────
function ShareButton({ platform, color, children }) {
  function handleShare() {
    const text = `I've saved ${mockPersonalImpact.co2Saved}kg of CO2 and impacted ${mockPersonalImpact.studentsImpacted} students through Skill-X! Join me in making a difference.`;
    const url = 'https://skillx.app/impact';

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    };

    window.open(urls[platform], '_blank', 'noopener,noreferrer');
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
    >
      <Share2 className="h-4 w-4" style={{ color }} />
      {children}
    </button>
  );
}

// ── main component ──────────────────────────────────────────
export default function SocialImpact() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [personalImpact, setPersonalImpact] = useState(mockPersonalImpact);
  const [platformImpact, setPlatformImpact] = useState(mockPlatformImpact);

  const currentUser = user || mockUsers[0];

  useEffect(() => {
    // Simulate loading / attempt API call
    const timer = setTimeout(() => {
      // Use user.impact if available, otherwise mock
      if (user?.impact) {
        setPersonalImpact(user.impact);
      }
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Header ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15">
              <Leaf className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Social Impact{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  Dashboard
                </span>
              </h1>
              <p className="text-sm text-gray-400">
                Track your contribution to a better world
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Personal Impact ───────────────────────── */}
        <motion.section
          variants={container}
          initial="hidden"
          animate="show"
          className="mb-10"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            Your Personal Impact
          </h2>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
            <ImpactStat
              icon={Leaf}
              value={personalImpact.co2Saved}
              suffix="kg"
              label="CO2 Saved vs Offline"
              color="#10b981"
            />
            <ImpactStat
              icon={Heart}
              value={personalImpact.freeSessionsDonated}
              label="Free Sessions Donated"
              color="#ef4444"
            />
            <ImpactStat
              icon={Users}
              value={personalImpact.studentsImpacted}
              label="Students Impacted"
              color="#6366f1"
            />
            <ImpactStat
              icon={TreePine}
              value={personalImpact.treesPlanted}
              label="Trees Planted"
              color="#22c55e"
            />
            <motion.div variants={item} className="col-span-2 lg:col-span-1">
              <GlassCard className="p-5 hover:border-emerald-500/20 transition-colors h-full flex flex-col justify-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Carbon Footprint Reduction</p>
                <div className="relative h-3 overflow-hidden rounded-full bg-white/10 mb-2">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${personalImpact.carbonFootprintReduction}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-sm text-white font-semibold">
                  {personalImpact.carbonFootprintReduction}%{' '}
                  <span className="font-normal text-gray-400">reduction</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  1 tree planted per 10 sessions ({personalImpact.totalSessions} sessions total)
                </p>
              </GlassCard>
            </motion.div>
          </div>
        </motion.section>

        {/* ── Environmental Badges ──────────────────── */}
        <motion.section
          variants={container}
          initial="hidden"
          animate="show"
          className="mb-10"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-400" />
            Environmental Badges
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {mockBadges.map((badge) => (
              <motion.div key={badge.id} variants={item}>
                <GlassCard
                  className={`p-5 transition-colors ${
                    badge.earned
                      ? 'border-emerald-500/20 hover:border-emerald-500/40'
                      : 'opacity-70 hover:opacity-90'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{badge.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">{badge.name}</p>
                        {badge.earned && (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                            Earned
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{badge.description}</p>
                      {badge.earned && badge.earnedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Earned on{' '}
                          {new Date(badge.earnedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                      {!badge.earned && badge.progress !== undefined && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{badge.progress}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                              style={{ width: `${badge.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Share Your Impact ─────────────────────── */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <GlassCard className="p-6 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-emerald-400" />
                  Share Your Impact
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Inspire others by sharing your sustainability journey
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ShareButton platform="twitter" color="#1DA1F2">
                  Twitter
                </ShareButton>
                <ShareButton platform="linkedin" color="#0A66C2">
                  LinkedIn
                </ShareButton>
                <ShareButton platform="whatsapp" color="#25D366">
                  WhatsApp
                </ShareButton>
              </div>
            </div>
          </GlassCard>
        </motion.section>

        {/* ── Platform Impact ──────────────────────── */}
        <motion.section
          variants={container}
          initial="hidden"
          animate="show"
          className="mb-10"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-400" />
            Platform Impact
          </h2>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
            <ImpactStat
              icon={Leaf}
              value={(platformImpact.totalCO2Saved / 1000).toFixed(1)}
              suffix="tonnes"
              label="Total CO2 Saved"
              color="#10b981"
            />
            <ImpactStat
              icon={BookOpen}
              value={platformImpact.totalSessionsDonated.toLocaleString()}
              label="Sessions Donated"
              color="#3b82f6"
            />
            <ImpactStat
              icon={Users}
              value={(platformImpact.totalLivesImpacted / 1000).toFixed(1) + 'K'}
              label="Lives Impacted"
              color="#8b5cf6"
            />
            <ImpactStat
              icon={Building2}
              value={platformImpact.ngoPartnerships}
              label="NGO Partnerships"
              color="#f59e0b"
            />
            <ImpactStat
              icon={IndianRupee}
              value={`₹${(platformImpact.scholarshipFund / 1000).toFixed(0)}K`}
              label="Scholarship Fund"
              color="#ec4899"
            />
            <ImpactStat
              icon={TreePine}
              value={platformImpact.totalTreesPlanted.toLocaleString()}
              label="Trees Planted"
              color="#22c55e"
            />
          </div>
        </motion.section>

        {/* ── Programs ─────────────────────────────── */}
        <motion.section
          variants={container}
          initial="hidden"
          animate="show"
          className="mb-10"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HandHeart className="h-5 w-5 text-pink-400" />
            Programs
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {mockPrograms.map((program) => (
              <motion.div key={program.id} variants={item}>
                <GlassCard className="p-6 hover:border-white/20 transition-all group h-full flex flex-col">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${program.color}22` }}
                  >
                    <program.icon className="h-6 w-6" style={{ color: program.color }} />
                  </div>
                  <h3 className="font-semibold text-white text-lg">{program.title}</h3>
                  <p className="text-sm text-gray-400 mt-2 flex-1">{program.description}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {program.participants} participants
                    </span>
                    {program.hoursContributed && (
                      <span>{program.hoursContributed} hrs contributed</span>
                    )}
                    {program.amountRaised && (
                      <span>₹{(program.amountRaised / 1000).toFixed(0)}K raised</span>
                    )}
                    {program.projectsCompleted && (
                      <span>{program.projectsCompleted} projects</span>
                    )}
                  </div>
                  <button
                    className="mt-4 w-full rounded-xl py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: program.color }}
                  >
                    {program.cta}
                  </button>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Giveback Features ────────────────────── */}
        <motion.section
          variants={container}
          initial="hidden"
          animate="show"
          className="mb-10"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-400" />
            Giveback Features
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Donate Earnings */}
            <motion.div variants={item}>
              <GlassCard className="p-5 hover:border-red-500/20 transition-colors h-full flex flex-col">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 mb-3">
                  <IndianRupee className="h-5 w-5 text-red-400" />
                </div>
                <h3 className="font-semibold text-white">Donate Earnings</h3>
                <p className="text-sm text-gray-400 mt-2 flex-1">
                  Donate a portion of your session earnings directly to the Skill-X Scholarship Fund
                  or partner NGOs.
                </p>
                <button className="mt-4 w-full rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-500 transition-colors">
                  Donate Now
                </button>
              </GlassCard>
            </motion.div>

            {/* Round-Up Option */}
            <motion.div variants={item}>
              <GlassCard className="p-5 hover:border-yellow-500/20 transition-colors h-full flex flex-col">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/15 mb-3">
                  <TrendingUp className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-white">Round-Up Option</h3>
                <p className="text-sm text-gray-400 mt-2 flex-1">
                  Round up your session payments to the nearest ₹100. The extra goes to fund free
                  education for underprivileged learners. Small change, big impact.
                </p>
                <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-sm text-gray-300">Enable Round-Up</span>
                  <div className="relative h-6 w-11 rounded-full bg-white/10 cursor-pointer">
                    <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-gray-400 transition-transform" />
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Skills for Good Directory */}
            <motion.div variants={item}>
              <GlassCard className="p-5 hover:border-emerald-500/20 transition-colors h-full flex flex-col">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 mb-3">
                  <HandHeart className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-white">Skills for Good Directory</h3>
                <p className="text-sm text-gray-400 mt-2 flex-1">
                  Browse NGOs and community projects looking for skilled volunteers. Match your
                  expertise with organizations that need it most.
                </p>
                <button className="mt-4 w-full rounded-xl border border-emerald-500/30 py-2.5 text-sm font-medium text-emerald-300 hover:bg-emerald-500/10 transition-colors">
                  Browse Directory
                </button>
              </GlassCard>
            </motion.div>
          </div>
        </motion.section>

        {/* ── Impact Leaderboard ───────────────────── */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-10"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Impact Leaderboard
          </h2>
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-4">Rank</th>
                    <th className="px-5 py-4">Contributor</th>
                    <th className="px-5 py-4">City</th>
                    <th className="px-5 py-4">CO2 Saved</th>
                    <th className="px-5 py-4">Sessions Donated</th>
                    <th className="px-5 py-4">Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {mockImpactLeaderboard.map((entry) => {
                    const isCurrentUser =
                      entry.name === currentUser.name ||
                      entry.name === 'Aarav Sharma';
                    return (
                      <tr
                        key={entry.rank}
                        className={`transition-colors ${
                          isCurrentUser
                            ? 'bg-emerald-500/5 hover:bg-emerald-500/10'
                            : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        <td className="px-5 py-4">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                              entry.rank === 1
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : entry.rank === 2
                                ? 'bg-gray-400/20 text-gray-300'
                                : entry.rank === 3
                                ? 'bg-amber-600/20 text-amber-400'
                                : 'bg-white/5 text-gray-400'
                            }`}
                          >
                            {entry.rank}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-white">
                            {entry.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-emerald-400">(You)</span>
                            )}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-400">{entry.city}</td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-emerald-400">
                            {entry.co2Saved}kg
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-300">
                          {entry.sessionsDonated}
                        </td>
                        <td className="px-5 py-4 text-lg">{entry.badge}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.section>

        {/* ── Bottom CTA ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="p-8 text-center border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-green-500/5">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15">
                <Globe className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Every Session Counts</h3>
            <p className="text-gray-400 max-w-lg mx-auto mb-6">
              By choosing online sessions over in-person meetings, you save an average of 0.5kg of
              CO2 per session. Keep learning, keep teaching, keep making an impact.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-500 transition-colors">
                <Leaf className="h-4 w-4" />
                Start a Free Session
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors">
                <Heart className="h-4 w-4" />
                Donate to Scholarships
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
