import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  Star,
  Zap,
  IndianRupee,
  BookOpen,
  GraduationCap,
  Loader2,
  Gift,
  Sparkles,
  Filter,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockLeaderboard, mockUsers } from '../data/mockData';
import { INDIAN_CITIES, SKILL_CATEGORIES } from '../utils/constants';

// ── animations ──────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

// ── helpers ─────────────────────────────────────────────────
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

const TIME_TABS = ['Weekly', 'Monthly', 'All Time'];
const CATEGORIES = [
  { key: 'xp', label: 'XP Leaders', icon: Zap, color: 'text-yellow-400' },
  { key: 'earners', label: 'Top Earners', icon: IndianRupee, color: 'text-emerald-400' },
  { key: 'teachers', label: 'Top Teachers', icon: GraduationCap, color: 'text-blue-400' },
  { key: 'learners', label: 'Top Learners', icon: BookOpen, color: 'text-purple-400' },
  { key: 'rated', label: 'Best Rated', icon: Star, color: 'text-orange-400' },
];

// Generate extended leaderboard from mock data
function generateLeaderboardData(category) {
  const baseEntries = mockLeaderboard.map((e) => {
    const user = mockUsers.find((u) => u.userId === e.userId || u.id === e.userId);
    return { ...e, avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${e.name}` };
  });

  const extraNames = [
    { name: 'Ananya Desai', city: 'Pune' },
    { name: 'Rohan Mehta', city: 'Mumbai' },
    { name: 'Sanya Kapoor', city: 'Delhi' },
    { name: 'Karthik Nair', city: 'Kochi' },
    { name: 'Divya Rajput', city: 'Jaipur' },
    { name: 'Aditya Verma', city: 'Lucknow' },
    { name: 'Meera Iyer', city: 'Chennai' },
    { name: 'Sahil Khan', city: 'Hyderabad' },
    { name: 'Pooja Sharma', city: 'Chandigarh' },
    { name: 'Varun Pillai', city: 'Bangalore' },
  ];

  const extra = extraNames.map((e, i) => ({
    rank: baseEntries.length + i + 1,
    userId: `extra_${i}`,
    name: e.name,
    city: e.city,
    xp: Math.max(200, 1000 - i * 80),
    level: i < 3 ? 'silver' : 'bronze',
    badge: i < 3 ? '🥈' : '🥉',
    sessionsCount: Math.max(5, 18 - i * 2),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${e.name.replace(' ', '')}`,
  }));

  const all = [...baseEntries, ...extra];

  return all.map((entry) => {
    let value, suffix;
    switch (category) {
      case 'earners':
        value = Math.round(entry.xp * 2.2);
        suffix = '₹';
        break;
      case 'teachers':
        value = entry.sessionsCount || Math.round(entry.xp / 80);
        suffix = ' sessions';
        break;
      case 'learners':
        value = Math.round((entry.sessionsCount || 10) * 1.5);
        suffix = ' hours';
        break;
      case 'rated':
        value = Math.min(5, (4 + Math.random() * 0.9)).toFixed(1);
        suffix = ' ★';
        break;
      default:
        value = entry.xp;
        suffix = ' XP';
    }
    const trends = ['up', 'down', 'same'];
    const trend = trends[Math.floor(Math.random() * 3)];
    return { ...entry, value, suffix, trend };
  });
}

const LEVEL_COLORS = {
  bronze: 'bg-amber-600/15 text-amber-500',
  silver: 'bg-gray-400/15 text-gray-300',
  gold: 'bg-yellow-400/15 text-yellow-400',
  platinum: 'bg-cyan-400/15 text-cyan-300',
  legend: 'bg-purple-400/15 text-purple-400',
};

function RankBadge({ rank }) {
  if (rank === 1)
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 shadow-lg shadow-yellow-500/30">
        <Crown className="h-5 w-5 text-white" />
      </div>
    );
  if (rank === 2)
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 shadow-lg shadow-gray-400/20">
        <Medal className="h-5 w-5 text-white" />
      </div>
    );
  if (rank === 3)
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600 shadow-lg shadow-orange-500/20">
        <Medal className="h-5 w-5 text-white" />
      </div>
    );
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
      <span className="text-sm font-bold text-gray-400">#{rank}</span>
    </div>
  );
}

function TrendIcon({ trend }) {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-emerald-400" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-400" />;
  return <Minus className="h-4 w-4 text-gray-500" />;
}

// ── main component ──────────────────────────────────────────
export default function Leaderboard() {
  const { user } = useAuth();
  const currentUser = user || mockUsers[0];

  const [timeTab, setTimeTab] = useState('Weekly');
  const [category, setCategory] = useState('xp');
  const [cityFilter, setCityFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const allSkills = useMemo(
    () => SKILL_CATEGORIES.flatMap((c) => c.skills),
    []
  );

  const leaderboardData = useMemo(
    () => generateLeaderboardData(category),
    [category]
  );

  const filteredData = useMemo(() => {
    let data = [...leaderboardData];
    if (cityFilter) data = data.filter((e) => e.city === cityFilter);
    if (skillFilter) {
      // Simulate skill filter by randomizing
      data = data.filter((_, i) => i % 2 === 0);
    }
    // Recalculate ranks after filtering
    return data.map((e, i) => ({ ...e, rank: i + 1 }));
  }, [leaderboardData, cityFilter, skillFilter]);

  // Simulate loading
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [timeTab, category, cityFilter, skillFilter]);

  // Find current user's rank
  const userEntry = filteredData.find(
    (e) => e.userId === currentUser.id || e.name === currentUser.name
  );
  const userRank = userEntry || {
    rank: filteredData.length + 1,
    name: currentUser.name,
    city: currentUser.city,
    level: currentUser.gamification?.level || 'silver',
    value: currentUser.gamification?.xp || 1250,
    suffix: ' XP',
    trend: 'up',
    avatar: currentUser.avatar,
  };

  const catInfo = CATEGORIES.find((c) => c.key === category);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/15">
              <Trophy className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Leaderboard</h1>
              <p className="text-sm text-gray-400">See who's leading the Skill-X community</p>
            </div>
          </div>
        </motion.div>

        {/* Time Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
            {TIME_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setTimeTab(tab)}
                className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                  timeTab === tab
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Category Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-6 flex flex-wrap gap-2"
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                  category === cat.key
                    ? 'border-blue-500/30 bg-blue-500/15 text-blue-300'
                    : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-gray-300'
                }`}
              >
                <Icon className={`h-4 w-4 ${category === cat.key ? cat.color : ''}`} />
                {cat.label}
              </button>
            );
          })}
        </motion.div>

        {/* Filters Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-wrap gap-3"
        >
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="appearance-none rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-10 text-sm text-white outline-none focus:border-blue-500/50 transition-colors"
            >
              <option value="">All Cities</option>
              {INDIAN_CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
          <div className="relative">
            <Sparkles className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="appearance-none rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-10 text-sm text-white outline-none focus:border-blue-500/50 transition-colors"
            >
              <option value="">All Skills</option>
              {allSkills.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
        </motion.div>

        {/* Rewards Info */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <GlassCard className="flex flex-wrap items-center gap-6 p-5 border-yellow-500/20 bg-yellow-500/5">
            <Gift className="h-6 w-6 text-yellow-400 flex-shrink-0" />
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <span className="text-yellow-200">
                <strong className="text-yellow-400">Top 5 Weekly:</strong> ₹500 each
              </span>
              <span className="text-yellow-200">
                <strong className="text-yellow-400">Top 10 Monthly:</strong> ₹1,000 each
              </span>
              <span className="text-yellow-200">
                <strong className="text-yellow-400">All Time #1:</strong> ₹5,000 + Exclusive Badge
              </span>
            </div>
          </GlassCard>
        </motion.div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {filteredData.length >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8 grid grid-cols-3 gap-4"
              >
                {[filteredData[1], filteredData[0], filteredData[2]].map((entry, idx) => {
                  const isFirst = idx === 1;
                  const podiumOrder = [2, 1, 3];
                  const rank = podiumOrder[idx];
                  const borderColor = rank === 1 ? 'border-yellow-500/40' : rank === 2 ? 'border-gray-400/30' : 'border-amber-700/30';
                  const glowColor = rank === 1 ? 'shadow-yellow-500/10' : 'shadow-transparent';
                  return (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + idx * 0.1 }}
                    >
                      <GlassCard
                        className={`flex flex-col items-center p-5 text-center ${borderColor} shadow-xl ${glowColor} ${
                          isFirst ? 'sm:-mt-4' : 'sm:mt-4'
                        }`}
                      >
                        <RankBadge rank={rank} />
                        <img
                          src={entry.avatar}
                          alt={entry.name}
                          className="mt-3 h-16 w-16 rounded-full border-2 border-white/10"
                        />
                        <p className="mt-2 text-sm font-semibold text-white truncate max-w-full">{entry.name}</p>
                        <p className="text-xs text-gray-400">{entry.city}</p>
                        <span className={`mt-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${LEVEL_COLORS[entry.level] || LEVEL_COLORS.silver}`}>
                          {entry.level.charAt(0).toUpperCase() + entry.level.slice(1)}
                        </span>
                        <p className={`mt-2 text-lg font-bold ${catInfo.color}`}>
                          {typeof entry.value === 'number'
                            ? entry.suffix === '₹'
                              ? `₹${entry.value.toLocaleString()}`
                              : `${entry.value.toLocaleString()}${entry.suffix}`
                            : `${entry.value}${entry.suffix}`}
                        </p>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Leaderboard List */}
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
              {filteredData.slice(3).map((entry) => (
                <motion.div key={entry.userId} variants={item}>
                  <GlassCard
                    className={`flex items-center gap-4 p-4 transition-colors hover:border-white/20 ${
                      entry.name === currentUser.name ? 'border-blue-500/30 bg-blue-500/5' : ''
                    }`}
                  >
                    <RankBadge rank={entry.rank} />
                    <img
                      src={entry.avatar}
                      alt={entry.name}
                      className="h-10 w-10 rounded-full border border-white/10"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-white">{entry.name}</p>
                        {entry.name === currentUser.name && (
                          <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">YOU</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{entry.city}</span>
                        <span className={`rounded-full px-2 py-0.5 ${LEVEL_COLORS[entry.level] || LEVEL_COLORS.silver}`}>
                          {entry.level}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={`text-sm font-bold ${catInfo.color}`}>
                        {typeof entry.value === 'number'
                          ? entry.suffix === '₹'
                            ? `₹${entry.value.toLocaleString()}`
                            : `${entry.value.toLocaleString()}${entry.suffix}`
                          : `${entry.value}${entry.suffix}`}
                      </p>
                      <TrendIcon trend={entry.trend} />
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>

            {/* Your Rank Section */}
            {!filteredData.some((e) => e.name === currentUser.name) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8"
              >
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Your Position</h3>
                <GlassCard className="flex items-center gap-4 p-5 border-blue-500/30 bg-blue-500/5">
                  <RankBadge rank={userRank.rank} />
                  <img
                    src={userRank.avatar}
                    alt={userRank.name}
                    className="h-12 w-12 rounded-full border-2 border-blue-500/30"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-white">{userRank.name}</p>
                      <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">YOU</span>
                    </div>
                    <p className="text-xs text-gray-400">{userRank.city}</p>
                  </div>
                  <p className={`text-lg font-bold ${catInfo.color}`}>
                    {typeof userRank.value === 'number'
                      ? `${userRank.value.toLocaleString()}${userRank.suffix}`
                      : `${userRank.value}${userRank.suffix}`}
                  </p>
                  <TrendIcon trend={userRank.trend} />
                </GlassCard>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
