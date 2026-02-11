import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IndianRupee,
  CalendarCheck,
  Zap,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Clock,
  Star,
  Users,
  Briefcase,
  MapPin,
  Plus,
  Search,
  Wallet,
  ChevronRight,
  Trophy,
  Target,
  Flame,
  ArrowUpRight,
  MessageSquare,
  Award,
  CheckCircle2,
  Bell,
  Sparkles,
  BarChart3,
  Eye,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import { postAPI, sessionAPI, skillAPI } from '../services/api';
import {
  mockPosts,
  mockNotifications,
  mockSessions,
  mockUsers,
  mockCapsules,
  mockLearningPaths,
  mockLeaderboard,
} from '../data/mockData';
import { LEVELS } from '../utils/constants';

// ── animation variants ──────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};
const fadeIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35 } },
};

// ── helpers ─────────────────────────────────────────────────
function getLevelInfo(xp) {
  const entries = Object.entries(LEVELS);
  for (const [key, lvl] of entries) {
    if (xp >= lvl.minXP && xp <= lvl.maxXP) {
      const progress = ((xp - lvl.minXP) / (lvl.maxXP - lvl.minXP)) * 100;
      const nextIdx = entries.findIndex(([k]) => k === key) + 1;
      const next = nextIdx < entries.length ? entries[nextIdx][1] : null;
      return { ...lvl, key, progress: Math.min(progress, 100), xpToNext: next ? next.minXP - xp : 0, next };
    }
  }
  const last = entries[entries.length - 1][1];
  return { ...last, key: 'legend', progress: 100, xpToNext: 0, next: null };
}

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

// ── stat card ───────────────────────────────────────────────
function StatCard({ icon: Icon, value, label, trend, color }) {
  const positive = trend >= 0;
  return (
    <motion.div variants={item}>  
      <GlassCard className="p-5 hover:border-white/20 transition-colors">
        <div className="flex items-start justify-between">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}22` }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          <span
            className={`flex items-center gap-0.5 text-xs font-medium ${
              positive ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {positive ? '+' : ''}
            {trend}%
          </span>
        </div>
        <p className="mt-4 text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </GlassCard>
    </motion.div>
  );
}

// ── mode-specific sections ──────────────────────────────────
function LearnModeContent({ posts, sessions, capsules, paths }) {
  const teachers = mockUsers.filter((u) => u.skills?.teaching?.length > 0).slice(0, 3);
  const continuePaths = paths.slice(0, 2);
  const newPosts = posts.filter((p) => p.mode === 'teach').slice(0, 3);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Recommended Teachers */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recommended Teachers</h2>
          <Link to="/discover?mode=teach" className="text-sm text-blue-400 hover:text-blue-300">
            View all <ChevronRight className="inline h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((t) => (
            <motion.div key={t.id} variants={item}>
              <GlassCard className="p-4 hover:border-blue-500/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="h-12 w-12 rounded-full border border-white/10" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.city}</p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="text-xs font-medium">{t.rating}</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.skills.teaching.slice(0, 3).map((s) => (
                    <span key={s} className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs text-blue-300">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">{t.stats.hoursTaught}h taught &middot; {t.reviewCount} reviews</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Continue Learning */}
      {continuePaths.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">Continue Learning</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {continuePaths.map((path) => (
              <motion.div key={path.id} variants={item}>
                <GlassCard className="p-5 hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{path.title}</h3>
                      <p className="mt-1 text-xs text-gray-400">{path.estimatedHours}h &middot; {path.totalLevels} levels</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">
                      {path.enrolledCount} enrolled
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Level 2 / {path.totalLevels}</span>
                      <span>40%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: '40%' }} />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* New in Your Interests */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">New in Your Interests</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {newPosts.map((p) => (
            <motion.div key={p.id} variants={item}>
              <GlassCard className="p-4 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <img src={p.userAvatar} alt={p.userName} className="h-8 w-8 rounded-full" />
                  <span className="text-sm font-medium text-white">{p.userName}</span>
                </div>
                <h4 className="font-medium text-white line-clamp-1">{p.title}</h4>
                <p className="mt-1 text-xs text-gray-400 line-clamp-2">{p.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />{p.budget}/{p.budgetType === 'per_hour' ? 'hr' : 'session'}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{p.views}</span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

function TeachModeContent({ posts, sessions }) {
  const pendingRequests = posts.filter((p) => p.mode === 'learn').slice(0, 3);
  const myListings = posts.filter((p) => p.mode === 'teach').slice(0, 3);
  const completedSessions = sessions.filter((s) => s.status === 'completed');

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Pending Requests */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Pending Requests from Students</h2>
          <Link to="/discover?mode=learn" className="text-sm text-green-400 hover:text-green-300">
            View all <ChevronRight className="inline h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pendingRequests.map((p) => (
            <motion.div key={p.id} variants={item}>
              <GlassCard className="p-4 hover:border-green-500/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <img src={p.userAvatar} alt={p.userName} className="h-8 w-8 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-white">{p.userName}</p>
                    <p className="text-xs text-gray-500">{p.city}</p>
                  </div>
                </div>
                <h4 className="font-medium text-white line-clamp-1">{p.title}</h4>
                <p className="mt-1 text-xs text-gray-400 line-clamp-2">{p.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs text-green-300">{p.skill}</span>
                  <span className="text-xs text-gray-500 ml-auto flex items-center gap-1">
                    <IndianRupee className="h-3 w-3" />{p.budget}/hr
                  </span>
                </div>
                <button className="mt-3 w-full rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500 transition-colors">
                  Respond
                </button>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* My Active Listings */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">My Active Listings</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myListings.map((p) => (
            <motion.div key={p.id} variants={item}>
              <GlassCard className="p-4 hover:border-blue-500/30 transition-colors">
                <h4 className="font-medium text-white line-clamp-1">{p.title}</h4>
                <p className="mt-1 text-xs text-gray-400 line-clamp-2">{p.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{p.responses} responses</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{p.views} views</span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Teaching Stats */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Teaching Stats</h2>
        <GlassCard className="p-5">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { label: 'Sessions Taught', value: completedSessions.length, icon: CalendarCheck },
              { label: 'Total Hours', value: `${completedSessions.reduce((a, s) => a + s.duration, 0) / 60}h`, icon: Clock },
              { label: 'Avg Rating', value: (completedSessions.reduce((a, s) => a + (s.rating || 0), 0) / (completedSessions.length || 1)).toFixed(1), icon: Star },
              { label: 'Total Earned', value: `₹${completedSessions.reduce((a, s) => a + s.price, 0).toLocaleString()}`, icon: IndianRupee },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="mx-auto h-5 w-5 text-green-400 mb-1.5" />
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </motion.div>
  );
}

function RentModeContent({ posts }) {
  const rentTasks = posts.filter((p) => p.mode === 'rent').slice(0, 4);
  const otherUsers = mockUsers.filter((u) => u.isOnline).slice(0, 3);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Available Micro-Tasks */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Available Micro-Tasks</h2>
          <Link to="/discover?mode=rent" className="text-sm text-orange-400 hover:text-orange-300">
            View all <ChevronRight className="inline h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {rentTasks.map((p) => (
            <motion.div key={p.id} variants={item}>
              <GlassCard className="p-4 hover:border-orange-500/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <img src={p.userAvatar} alt={p.userName} className="h-8 w-8 rounded-full" />
                  <span className="text-sm font-medium text-white">{p.userName}</span>
                  <span className="ml-auto rounded-full bg-orange-500/15 px-2 py-0.5 text-xs text-orange-300">{p.skill}</span>
                </div>
                <h4 className="font-medium text-white line-clamp-1">{p.title}</h4>
                <p className="mt-1 text-xs text-gray-400 line-clamp-2">{p.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-orange-300">₹{p.budget}/hr</span>
                  <button className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-500 transition-colors">
                    Book Now
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Match */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Quick Match &mdash; Online Now</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {otherUsers.map((u) => (
            <motion.div key={u.id} variants={item}>
              <GlassCard className="flex items-center gap-3 p-4 hover:border-orange-500/30 transition-colors cursor-pointer">
                <div className="relative">
                  <img src={u.avatar} alt={u.name} className="h-11 w-11 rounded-full border border-white/10" />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-900 bg-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.skills.teaching.slice(0, 2).join(', ')}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-500" />
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

function ServiceRequestModeContent({ posts, mode }) {
  const isService = mode === 'service';
  const relevantPosts = posts.filter((p) => p.mode === (isService ? 'request' : 'service')).slice(0, 4);
  const activeJobs = mockSessions.filter((s) => s.status === 'in_progress' || s.status === 'scheduled').slice(0, 3);
  const accent = isService ? 'purple' : 'red';

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Nearby Services / Requests */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {isService ? 'Nearby Requests' : 'Nearby Services'}
          </h2>
          <Link
            to={`/discover?mode=${isService ? 'request' : 'service'}`}
            className={`text-sm text-${accent}-400 hover:text-${accent}-300`}
          >
            View all <ChevronRight className="inline h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {relevantPosts.map((p) => (
            <motion.div key={p.id} variants={item}>
              <GlassCard className={`p-4 hover:border-${accent}-500/30 transition-colors`}>
                <div className="flex items-center gap-2 mb-2">
                  <img src={p.userAvatar} alt={p.userName} className="h-8 w-8 rounded-full" />
                  <span className="text-sm font-medium text-white">{p.userName}</span>
                  <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="h-3 w-3" />{p.city}
                  </span>
                </div>
                <h4 className="font-medium text-white line-clamp-1">{p.title}</h4>
                <p className="mt-1 text-xs text-gray-400 line-clamp-2">{p.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`rounded-full bg-${accent}-500/15 px-2 py-0.5 text-xs text-${accent}-300`}>{p.skill}</span>
                  <span className="text-sm font-semibold text-white">₹{p.budget}</span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Active Jobs */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Active Jobs</h2>
        {activeJobs.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-gray-600 mb-2" />
            <p className="text-gray-400">No active jobs right now</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <motion.div key={job.id} variants={item}>
                <GlassCard className="flex items-center gap-4 p-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${accent}-500/15`}>
                    <Briefcase className={`h-5 w-5 text-${accent}-400`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{job.skill} session</p>
                    <p className="text-xs text-gray-400">
                      with {job.teacherName} &middot; {new Date(job.scheduledAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      job.status === 'in_progress'
                        ? 'bg-yellow-500/15 text-yellow-300'
                        : 'bg-blue-500/15 text-blue-300'
                    }`}
                  >
                    {job.status === 'in_progress' ? 'In Progress' : 'Scheduled'}
                  </span>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}

// ── main dashboard ──────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const { currentMode, modeInfo } = useMode();
  const navigate = useNavigate();

  const [posts, setPosts] = useState(mockPosts);
  const [sessions, setSessions] = useState(mockSessions);
  const [loading, setLoading] = useState(true);

  // fallback user for demo
  const currentUser = user || mockUsers[0];
  const gamification = currentUser.gamification || { xp: 1250, level: 'silver', badges: [], rank: 47 };
  const stats = currentUser.stats || { sessionsCompleted: 24, hoursLearned: 48, hoursTaught: 6, skillsLearned: 5 };
  const walletBalance = currentUser.wallet?.balance || 0;
  const levelInfo = getLevelInfo(gamification.xp);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const [postsRes, sessionsRes] = await Promise.all([
          postAPI.getAll().catch(() => null),
          sessionAPI.getMySessions().catch(() => null),
        ]);
        if (!cancelled) {
          if (postsRes?.data?.posts) setPosts(postsRes.data.posts);
          if (sessionsRes?.data?.sessions) setSessions(sessionsRes.data.sessions);
        }
      } catch {
        // keep mock data
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  // activity feed from notifications
  const activityFeed = mockNotifications.slice(0, 5);

  // trending skills
  const trendingSkills = [
    { name: 'React', demand: 92 },
    { name: 'Python', demand: 88 },
    { name: 'UI/UX Design', demand: 76 },
    { name: 'Data Science', demand: 71 },
    { name: 'Public Speaking', demand: 64 },
  ];

  // daily quests
  const dailyQuests = [
    { label: 'Complete a session', done: true },
    { label: 'Send a message', done: true },
    { label: 'Browse 5 listings', done: false },
  ];

  function renderModeContent() {
    switch (currentMode) {
      case 'learn':
        return <LearnModeContent posts={posts} sessions={sessions} capsules={mockCapsules} paths={mockLearningPaths} />;
      case 'teach':
        return <TeachModeContent posts={posts} sessions={sessions} />;
      case 'rent':
        return <RentModeContent posts={posts} />;
      case 'service':
      case 'request':
        return <ServiceRequestModeContent posts={posts} mode={currentMode} />;
      default:
        return <LearnModeContent posts={posts} sessions={sessions} capsules={mockCapsules} paths={mockLearningPaths} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* ── Main column ───────────────────────── */}
          <div className="space-y-8">
            {/* Welcome */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Welcome back, <span className="text-blue-400">{currentUser.name?.split(' ')[0] || 'Learner'}</span>
              </h1>
              <p className="mt-1 text-gray-400">
                You&apos;re in <span className="font-semibold" style={{ color: modeInfo?.color }}>{modeInfo?.label}</span> mode &mdash; {modeInfo?.description}
              </p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              className="grid grid-cols-2 gap-4 lg:grid-cols-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <StatCard
                icon={IndianRupee}
                value={`₹${walletBalance.toLocaleString()}`}
                label="Earnings this month"
                trend={12}
                color="#10b981"
              />
              <StatCard
                icon={CalendarCheck}
                value={stats.sessionsCompleted}
                label="Sessions completed"
                trend={8}
                color="#6366f1"
              />
              <StatCard
                icon={Zap}
                value={`${gamification.xp.toLocaleString()} XP`}
                label={`Level: ${levelInfo.label}`}
                trend={15}
                color="#f59e0b"
              />
              <StatCard
                icon={BookOpen}
                value={mockCapsules.length}
                label="Skill capsules"
                trend={-3}
                color="#ec4899"
              />
            </motion.div>

            {/* Mode-Specific Content */}
            {renderModeContent()}

            {/* Activity Feed */}
            <motion.section variants={fadeIn} initial="hidden" animate="show">
              <h2 className="mb-4 text-lg font-semibold text-white">Recent Activity</h2>
              <GlassCard className="divide-y divide-white/5">
                {activityFeed.map((a, i) => {
                  const iconMap = {
                    session_completed: <CheckCircle2 className="h-4 w-4 text-green-400" />,
                    badge_earned: <Award className="h-4 w-4 text-purple-400" />,
                    review_received: <Star className="h-4 w-4 text-yellow-400" />,
                    session_request: <Bell className="h-4 w-4 text-blue-400" />,
                    payment_received: <IndianRupee className="h-4 w-4 text-emerald-400" />,
                    level_up: <Zap className="h-4 w-4 text-cyan-400" />,
                    session_reminder: <Clock className="h-4 w-4 text-orange-400" />,
                    message: <MessageSquare className="h-4 w-4 text-gray-400" />,
                    system: <Sparkles className="h-4 w-4 text-gray-500" />,
                  };
                  return (
                    <div key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                      <div className="mt-0.5">{iconMap[a.type] || <Bell className="h-4 w-4 text-gray-500" />}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white">{a.message}</p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      {!a.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />}
                    </div>
                  );
                })}
              </GlassCard>
            </motion.section>
          </div>

          {/* ── Sidebar ───────────────────────────── */}
          <aside className="space-y-6">
            {/* Gamification */}
            <motion.div variants={fadeIn} initial="hidden" animate="show">
              <GlassCard className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/15">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{levelInfo.icon} {levelInfo.label}</p>
                    <p className="text-xs text-gray-400">{gamification.xp.toLocaleString()} XP</p>
                  </div>
                </div>
                {/* XP Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Progress to {levelInfo.next?.label || 'Max'}</span>
                    <span>{Math.round(levelInfo.progress)}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-yellow-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${levelInfo.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  {levelInfo.xpToNext > 0 && (
                    <p className="mt-1.5 text-xs text-gray-500">{levelInfo.xpToNext.toLocaleString()} XP to next level</p>
                  )}
                </div>

                {/* Daily Quests */}
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Daily Quests</p>
                  <div className="space-y-2">
                    {dailyQuests.map((q, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {q.done ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-gray-600" />
                        )}
                        <span className={`text-sm ${q.done ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{q.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">{dailyQuests.filter((q) => q.done).length}/{dailyQuests.length} completed</p>
                </div>
              </GlassCard>
            </motion.div>

            {/* Trending Skills */}
            <motion.div variants={fadeIn} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
              <GlassCard className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  <h3 className="text-sm font-semibold text-white">Trending Skills</h3>
                </div>
                <div className="space-y-3">
                  {trendingSkills.map((skill, i) => (
                    <div key={skill.name}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-300">{i + 1}. {skill.name}</span>
                        <span className="text-xs text-emerald-400">{skill.demand}% demand</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${skill.demand}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={fadeIn} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
              <GlassCard className="p-5">
                <h3 className="mb-3 text-sm font-semibold text-white">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Post a Listing', icon: Plus, to: '/create-post', color: 'text-emerald-400' },
                    { label: 'Find a Teacher', icon: Search, to: '/discover?mode=teach', color: 'text-blue-400' },
                    { label: 'View Wallet', icon: Wallet, to: '/wallet', color: 'text-purple-400' },
                  ].map((action) => (
                    <Link
                      key={action.label}
                      to={action.to}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5"
                    >
                      <action.icon className={`h-4 w-4 ${action.color}`} />
                      <span className="text-sm text-gray-300">{action.label}</span>
                      <ChevronRight className="ml-auto h-4 w-4 text-gray-600" />
                    </Link>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </aside>
        </div>
      </div>
    </div>
  );
}
