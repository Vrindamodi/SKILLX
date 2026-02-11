import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserCheck,
  CalendarCheck,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Ban,
  UserCog,
  Star,
  BarChart3,
  FileText,
  Gavel,
  ShieldAlert,
  Activity,
  X,
  CheckCircle2,
  Clock,
  MapPin,
  Loader2,
  RefreshCw,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminAPI, analyticsAPI } from '../services/api';
import { mockUsers, mockPosts, mockSessions, mockTransactions } from '../data/mockData';

// ── animation variants ──────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};
const fadeIn = {
  hidden: { opacity: 0, scale: 0.97 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
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

// ── mock admin data ─────────────────────────────────────────
const mockAdminStats = {
  totalUsers: 12847,
  activeUsers: 3421,
  totalSessions: 28934,
  revenueThisMonth: 487500,
  successRate: 94.2,
  openDisputes: 23,
  trends: {
    users: 12.5,
    activeUsers: 8.3,
    sessions: 15.2,
    revenue: 22.1,
    successRate: 1.8,
    disputes: -14.5,
  },
};

const mockAdminUsers = mockUsers.map((u, i) => ({
  ...u,
  status: i === 2 ? 'active' : i === 4 ? 'banned' : 'active',
  lastActive: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
}));

const mockAdminPosts = mockPosts.map((p) => ({
  ...p,
  featured: Math.random() > 0.7,
  reports: Math.floor(Math.random() * 3),
}));

const mockDisputes = [
  {
    id: 'd1',
    sessionId: 'session1',
    reporterId: 'user1',
    reporterName: 'Aarav Sharma',
    respondentName: 'Priya Menon',
    reason: 'Session quality was below expectations. Teacher was unprepared.',
    priority: 'medium',
    status: 'open',
    amount: 600,
    createdAt: '2026-02-08T10:00:00Z',
  },
  {
    id: 'd2',
    sessionId: 'session2',
    reporterId: 'user3',
    reporterName: 'Vikram Patel',
    respondentName: 'Rahul Iyer',
    reason: 'No-show. Teacher did not attend the scheduled session.',
    priority: 'high',
    status: 'open',
    amount: 1050,
    createdAt: '2026-02-07T14:30:00Z',
  },
  {
    id: 'd3',
    sessionId: 'session5',
    reporterId: 'user6',
    reporterName: 'Fatima Khan',
    respondentName: 'Neha Gupta',
    reason: 'Cancellation without proper notice. Need refund.',
    priority: 'low',
    status: 'open',
    amount: 450,
    createdAt: '2026-02-06T09:00:00Z',
  },
  {
    id: 'd4',
    sessionId: 'session3',
    reporterId: 'user4',
    reporterName: 'Neha Gupta',
    respondentName: 'Priya Menon',
    reason: 'Overcharged for the session. Agreed rate was different.',
    priority: 'high',
    status: 'in_review',
    amount: 2400,
    createdAt: '2026-02-05T16:00:00Z',
  },
];

const mockFraudAlerts = [
  {
    id: 'fa1',
    type: 'suspicious_login',
    severity: 'high',
    userId: 'user99',
    userName: 'Unknown User',
    description: 'Multiple failed login attempts from different IPs in 5 minutes',
    confidence: 92,
    detectedAt: '2026-02-10T08:30:00Z',
    resolved: false,
  },
  {
    id: 'fa2',
    type: 'fake_review',
    severity: 'medium',
    userId: 'user45',
    userName: 'Suspicious Account',
    description: 'Pattern of identical 5-star reviews posted within minutes across different profiles',
    confidence: 78,
    detectedAt: '2026-02-09T15:20:00Z',
    resolved: false,
  },
  {
    id: 'fa3',
    type: 'payment_fraud',
    severity: 'high',
    userId: 'user67',
    userName: 'Test User',
    description: 'Repeated chargebacks after completed sessions. Potential payment fraud.',
    confidence: 88,
    detectedAt: '2026-02-09T11:00:00Z',
    resolved: false,
  },
  {
    id: 'fa4',
    type: 'spam_posts',
    severity: 'low',
    userId: 'user82',
    userName: 'Promo Account',
    description: 'Multiple identical promotional posts created in rapid succession',
    confidence: 65,
    detectedAt: '2026-02-08T20:45:00Z',
    resolved: true,
  },
];

const mockAnalytics = {
  monthlyRevenue: [
    { month: 'Sep', amount: 185000 },
    { month: 'Oct', amount: 220000 },
    { month: 'Nov', amount: 278000 },
    { month: 'Dec', amount: 312000 },
    { month: 'Jan', amount: 395000 },
    { month: 'Feb', amount: 487500 },
  ],
  userGrowth: [
    { month: 'Sep', users: 4200 },
    { month: 'Oct', users: 5800 },
    { month: 'Nov', users: 7400 },
    { month: 'Dec', users: 9100 },
    { month: 'Jan', users: 11200 },
    { month: 'Feb', users: 12847 },
  ],
  topSkills: [
    { skill: 'React', demand: 92, sessions: 3420 },
    { skill: 'Python', demand: 88, sessions: 3180 },
    { skill: 'UI/UX Design', demand: 76, sessions: 2140 },
    { skill: 'Data Science', demand: 71, sessions: 1890 },
    { skill: 'Mathematics', demand: 68, sessions: 1720 },
    { skill: 'Cooking', demand: 64, sessions: 1540 },
    { skill: 'Public Speaking', demand: 58, sessions: 1200 },
  ],
  topEarners: [
    { name: 'Priya Menon', city: 'Bangalore', earnings: 185000, sessions: 112, rating: 4.9 },
    { name: 'Rahul Iyer', city: 'Chennai', earnings: 134000, sessions: 67, rating: 4.85 },
    { name: 'Fatima Khan', city: 'Hyderabad', earnings: 98000, sessions: 55, rating: 4.75 },
    { name: 'Neha Gupta', city: 'Delhi', earnings: 82000, sessions: 42, rating: 4.8 },
    { name: 'Deepak Joshi', city: 'Pune', earnings: 67000, sessions: 38, rating: 4.7 },
  ],
  cityStats: [
    { city: 'Bangalore', users: 3240, sessions: 8200, revenue: 142000 },
    { city: 'Mumbai', users: 2890, sessions: 7100, revenue: 128000 },
    { city: 'Delhi', users: 2150, sessions: 5400, revenue: 96000 },
    { city: 'Hyderabad', users: 1680, sessions: 4200, revenue: 74000 },
    { city: 'Chennai', users: 1420, sessions: 3600, revenue: 62000 },
    { city: 'Pune', users: 980, sessions: 2400, revenue: 41000 },
    { city: 'Ahmedabad', users: 720, sessions: 1800, revenue: 32000 },
  ],
  disputeMetrics: {
    total: 156,
    resolved: 133,
    avgResolutionTime: '2.4 days',
    refundRate: 34,
    releaseRate: 48,
    partialRate: 18,
  },
};

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
          {trend !== undefined && (
            <span
              className={`flex items-center gap-0.5 text-xs font-medium ${
                positive ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {positive ? '+' : ''}
              {trend}%
            </span>
          )}
        </div>
        <p className="mt-4 text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </GlassCard>
    </motion.div>
  );
}

// ── ban modal ───────────────────────────────────────────────
function BanModal({ user, onClose, onConfirm }) {
  const [reason, setReason] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {user.status === 'banned' ? 'Unban' : 'Ban'} User
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/10">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          {user.status === 'banned'
            ? `Are you sure you want to unban ${user.name}?`
            : `Please provide a reason for banning ${user.name}.`}
        </p>
        {user.status !== 'banned' && (
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for ban..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-red-500/50 resize-none h-24 mb-4"
          />
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={user.status !== 'banned' && !reason.trim()}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              user.status === 'banned'
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-red-600 hover:bg-red-500'
            }`}
          >
            {user.status === 'banned' ? 'Unban User' : 'Ban User'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── overview tab ────────────────────────────────────────────
function OverviewTab({ stats }) {
  const recentSessions = mockSessions.slice(0, 5);
  const recentTransactions = mockTransactions.slice(0, 5);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Users}
          value={stats.totalUsers.toLocaleString()}
          label="Total Users"
          trend={stats.trends.users}
          color="#6366f1"
        />
        <StatCard
          icon={UserCheck}
          value={stats.activeUsers.toLocaleString()}
          label="Active Users"
          trend={stats.trends.activeUsers}
          color="#10b981"
        />
        <StatCard
          icon={CalendarCheck}
          value={stats.totalSessions.toLocaleString()}
          label="Total Sessions"
          trend={stats.trends.sessions}
          color="#8b5cf6"
        />
        <StatCard
          icon={IndianRupee}
          value={`₹${(stats.revenueThisMonth / 1000).toFixed(1)}K`}
          label="Revenue This Month"
          trend={stats.trends.revenue}
          color="#f59e0b"
        />
        <StatCard
          icon={CheckCircle2}
          value={`${stats.successRate}%`}
          label="Success Rate"
          trend={stats.trends.successRate}
          color="#22c55e"
        />
        <StatCard
          icon={AlertTriangle}
          value={stats.openDisputes}
          label="Open Disputes"
          trend={stats.trends.disputes}
          color="#ef4444"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Sessions */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-purple-400" />
            Recent Sessions
          </h3>
          <div className="space-y-3">
            {recentSessions.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl p-3 hover:bg-white/5 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{s.skill} session</p>
                  <p className="text-xs text-gray-400">
                    {s.teacherName} &rarr; {s.learnerName}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    s.status === 'completed'
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : s.status === 'in_progress'
                      ? 'bg-yellow-500/15 text-yellow-300'
                      : s.status === 'scheduled'
                      ? 'bg-blue-500/15 text-blue-300'
                      : 'bg-red-500/15 text-red-300'
                  }`}
                >
                  {s.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent Transactions */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-yellow-400" />
            Recent Transactions
          </h3>
          <div className="space-y-3">
            {recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-xl p-3 hover:bg-white/5 transition-colors">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    t.amount > 0 ? 'bg-emerald-500/15' : 'bg-red-500/15'
                  }`}
                >
                  {t.amount > 0 ? (
                    <ArrowDownRight className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-red-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white truncate">{t.description}</p>
                  <p className="text-xs text-gray-500">{t.type} &middot; {t.method}</p>
                </div>
                <span
                  className={`text-sm font-semibold ${t.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}
                >
                  {t.amount > 0 ? '+' : ''}₹{Math.abs(t.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}

// ── users tab ───────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState(mockAdminUsers);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [banTarget, setBanTarget] = useState(null);
  const perPage = 5;

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await adminAPI.getUsers({ search, page, limit: perPage });
        if (res.data?.users) setUsers(res.data.users);
      } catch {
        /* keep mock */
      }
    }
    fetchUsers();
  }, [search, page]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  function handleBan(reason) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === banTarget.id
          ? { ...u, status: u.status === 'banned' ? 'active' : 'banned' }
          : u
      )
    );
    setBanTarget(null);
    try {
      adminAPI.banUser(banTarget.id, { reason, action: banTarget.status === 'banned' ? 'unban' : 'ban' });
    } catch {
      /* silent */
    }
  }

  function handleMakeAdmin(userId) {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: 'admin' } : u)));
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show">
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500/50 transition-colors"
        />
      </div>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Level</th>
                <th className="px-5 py-4">Rating</th>
                <th className="px-5 py-4">Joined</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginated.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="h-9 w-9 rounded-full border border-white/10"
                      />
                      <div>
                        <p className="text-sm font-medium text-white">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400">{u.email}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.role === 'admin'
                          ? 'bg-purple-500/15 text-purple-300'
                          : u.role === 'teacher'
                          ? 'bg-green-500/15 text-green-300'
                          : 'bg-blue-500/15 text-blue-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`flex items-center gap-1.5 text-xs font-medium ${
                        u.status === 'active' ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          u.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'
                        }`}
                      />
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-300 capitalize">
                    {u.gamification?.level || 'bronze'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-300">{u.rating}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400">
                    {new Date(u.joinedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        title="View Profile"
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        title={u.status === 'banned' ? 'Unban User' : 'Ban User'}
                        onClick={() => setBanTarget(u)}
                        className={`rounded-lg p-1.5 transition-colors ${
                          u.status === 'banned'
                            ? 'text-emerald-500 hover:bg-emerald-500/10'
                            : 'text-red-500 hover:bg-red-500/10'
                        }`}
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                      {u.role !== 'admin' && (
                        <button
                          title="Make Admin"
                          onClick={() => handleMakeAdmin(u.id)}
                          className="rounded-lg p-1.5 text-purple-500 hover:bg-purple-500/10 transition-colors"
                        >
                          <UserCog className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
            <p className="text-xs text-gray-500">
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of{' '}
              {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                    p === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Ban Modal */}
      <AnimatePresence>
        {banTarget && (
          <BanModal user={banTarget} onClose={() => setBanTarget(null)} onConfirm={handleBan} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── posts tab ───────────────────────────────────────────────
function PostsTab() {
  const [posts, setPosts] = useState(mockAdminPosts);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await adminAPI.getPosts({ search });
        if (res.data?.posts) setPosts(res.data.posts);
      } catch {
        /* keep mock */
      }
    }
    fetchPosts();
  }, [search]);

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.userName.toLowerCase().includes(search.toLowerCase())
  );

  function handleClose(postId) {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: 'closed' } : p)));
  }

  function handleFeature(postId) {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, featured: !p.featured } : p))
    );
  }

  const modeColors = {
    learn: 'bg-blue-500/15 text-blue-300',
    teach: 'bg-green-500/15 text-green-300',
    rent: 'bg-orange-500/15 text-orange-300',
    service: 'bg-purple-500/15 text-purple-300',
    request: 'bg-red-500/15 text-red-300',
  };

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show">
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search posts by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500/50 transition-colors"
        />
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-4">Title</th>
                <th className="px-5 py-4">Author</th>
                <th className="px-5 py-4">Mode</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Views</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate max-w-[200px]">
                        {p.title}
                      </p>
                      {p.featured && (
                        <Sparkles className="h-3.5 w-3.5 text-yellow-400 flex-shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400">{p.userName}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${modeColors[p.mode] || ''}`}>
                      {p.mode}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-gray-500/15 text-gray-400'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400">{p.views}</td>
                  <td className="px-5 py-4 text-sm text-gray-400">
                    {new Date(p.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        title="View"
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button
                        title={p.status === 'active' ? 'Close Post' : 'Reopen'}
                        onClick={() => handleClose(p.id)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        title={p.featured ? 'Unfeature' : 'Feature'}
                        onClick={() => handleFeature(p.id)}
                        className={`rounded-lg p-1.5 transition-colors ${
                          p.featured
                            ? 'text-yellow-400 hover:bg-yellow-500/10'
                            : 'text-gray-500 hover:bg-white/10'
                        }`}
                      >
                        <Sparkles className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ── disputes tab ────────────────────────────────────────────
function DisputesTab() {
  const [disputes, setDisputes] = useState(mockDisputes);

  useEffect(() => {
    async function fetchDisputes() {
      try {
        const res = await adminAPI.getDisputes();
        if (res.data?.disputes) setDisputes(res.data.disputes);
      } catch {
        /* keep mock */
      }
    }
    fetchDisputes();
  }, []);

  const priorityStyles = {
    high: 'bg-red-500/15 text-red-300 border-red-500/30',
    medium: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    low: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  };

  function handleResolve(disputeId, action) {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId
          ? { ...d, status: 'resolved', resolution: action }
          : d
      )
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {disputes.map((d) => (
        <motion.div key={d.id} variants={item}>
          <GlassCard className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${priorityStyles[d.priority]}`}
                  >
                    {d.priority} priority
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      d.status === 'open'
                        ? 'bg-orange-500/15 text-orange-300'
                        : d.status === 'in_review'
                        ? 'bg-blue-500/15 text-blue-300'
                        : 'bg-emerald-500/15 text-emerald-300'
                    }`}
                  >
                    {d.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-white font-medium">
                  {d.reporterName} vs {d.respondentName}
                </p>
                <p className="mt-1 text-sm text-gray-400">{d.reason}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <IndianRupee className="h-3 w-3" />
                    {d.amount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(d.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              </div>

              {d.status !== 'resolved' && (
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleResolve(d.id, 'refund')}
                    className="rounded-lg bg-red-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 transition-colors"
                  >
                    Refund
                  </button>
                  <button
                    onClick={() => handleResolve(d.id, 'release')}
                    className="rounded-lg bg-emerald-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 transition-colors"
                  >
                    Release
                  </button>
                  <button
                    onClick={() => handleResolve(d.id, 'partial')}
                    className="rounded-lg bg-yellow-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-500 transition-colors"
                  >
                    Partial
                  </button>
                </div>
              )}

              {d.status === 'resolved' && (
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Resolved ({d.resolution})
                </span>
              )}
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ── fraud alerts tab ────────────────────────────────────────
function FraudAlertsTab() {
  const [alerts, setAlerts] = useState(mockFraudAlerts);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await adminAPI.getFraudAlerts();
        if (res.data?.alerts) setAlerts(res.data.alerts);
      } catch {
        /* keep mock */
      }
    }
    fetchAlerts();
  }, []);

  const severityStyles = {
    high: {
      border: 'border-red-500/30',
      bg: 'bg-red-500/5',
      badge: 'bg-red-500/15 text-red-300',
      icon: 'text-red-400',
    },
    medium: {
      border: 'border-yellow-500/30',
      bg: 'bg-yellow-500/5',
      badge: 'bg-yellow-500/15 text-yellow-300',
      icon: 'text-yellow-400',
    },
    low: {
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/5',
      badge: 'bg-blue-500/15 text-blue-300',
      icon: 'text-blue-400',
    },
  };

  function handleDismiss(alertId) {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a)));
  }

  function handleInvestigate(alertId) {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, investigating: true } : a))
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {alerts.map((a) => {
        const style = severityStyles[a.severity];
        return (
          <motion.div key={a.id} variants={item}>
            <GlassCard className={`p-5 ${style.border} ${style.bg} ${a.resolved ? 'opacity-50' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 flex-shrink-0">
                  <ShieldAlert className={`h-5 w-5 ${style.icon}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.badge}`}>
                      {a.severity}
                    </span>
                    <span className="text-xs text-gray-500">
                      {a.type.replace(/_/g, ' ')}
                    </span>
                    {a.resolved && (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">
                        resolved
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white">{a.description}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span>User: {a.userName}</span>
                    <span>Confidence: {a.confidence}%</span>
                    <span>
                      {new Date(a.detectedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {/* Confidence bar */}
                  <div className="mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${
                        a.confidence >= 80
                          ? 'bg-red-500'
                          : a.confidence >= 60
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${a.confidence}%` }}
                    />
                  </div>
                </div>

                {!a.resolved && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleInvestigate(a.id)}
                      className="rounded-lg bg-blue-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 transition-colors"
                    >
                      {a.investigating ? 'Investigating...' : 'Investigate'}
                    </button>
                    <button
                      onClick={() => handleDismiss(a.id)}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-white/5 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ── analytics tab ───────────────────────────────────────────
function AnalyticsTab() {
  const [analytics, setAnalytics] = useState(mockAnalytics);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await analyticsAPI.getAdminAnalytics();
        if (res.data) setAnalytics(res.data);
      } catch {
        /* keep mock */
      }
    }
    fetchAnalytics();
  }, []);

  const maxRevenue = Math.max(...analytics.monthlyRevenue.map((r) => r.amount));
  const maxUsers = Math.max(...analytics.userGrowth.map((u) => u.users));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Revenue & User Growth */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Revenue */}
        <motion.div variants={item}>
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-yellow-400" />
              Platform Revenue Trend
            </h3>
            <div className="flex items-end gap-3 h-40">
              {analytics.monthlyRevenue.map((r) => (
                <div key={r.month} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs text-gray-500">
                    ₹{(r.amount / 1000).toFixed(0)}K
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-yellow-600 to-yellow-400 transition-all duration-500"
                    style={{
                      height: `${(r.amount / maxRevenue) * 100}%`,
                      minHeight: '8px',
                    }}
                  />
                  <span className="text-xs text-gray-500">{r.month}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* User Growth */}
        <motion.div variants={item}>
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" />
              User Growth
            </h3>
            <div className="flex items-end gap-3 h-40">
              {analytics.userGrowth.map((u) => (
                <div key={u.month} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {(u.users / 1000).toFixed(1)}K
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-500"
                    style={{
                      height: `${(u.users / maxUsers) * 100}%`,
                      minHeight: '8px',
                    }}
                  />
                  <span className="text-xs text-gray-500">{u.month}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Top Skills by Demand */}
      <motion.div variants={item}>
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            Top Skills by Demand
          </h3>
          <div className="space-y-3">
            {analytics.topSkills.map((s, i) => (
              <div key={s.skill} className="flex items-center gap-4">
                <span className="w-5 text-xs text-gray-500 text-right">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{s.skill}</span>
                    <span className="text-xs text-gray-400">{s.sessions.toLocaleString()} sessions</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                      style={{ width: `${s.demand}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-medium text-emerald-400 w-10 text-right">
                  {s.demand}%
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Top Earners & City Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Earners */}
        <motion.div variants={item}>
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-yellow-400" />
              Top Earners
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-gray-500">
                    <th className="pb-3 pr-4">#</th>
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">City</th>
                    <th className="pb-3 pr-4">Earnings</th>
                    <th className="pb-3">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {analytics.topEarners.map((e, i) => (
                    <tr key={e.name}>
                      <td className="py-3 pr-4 text-xs text-gray-500">{i + 1}</td>
                      <td className="py-3 pr-4 text-sm text-white">{e.name}</td>
                      <td className="py-3 pr-4 text-xs text-gray-400">{e.city}</td>
                      <td className="py-3 pr-4 text-sm font-medium text-emerald-400">
                        ₹{(e.earnings / 1000).toFixed(0)}K
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-300">{e.rating}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>

        {/* Geographic Stats */}
        <motion.div variants={item}>
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-400" />
              Geographic Heatmap
            </h3>
            <div className="space-y-3">
              {analytics.cityStats.map((c) => {
                const maxCityUsers = analytics.cityStats[0].users;
                return (
                  <div key={c.city} className="flex items-center gap-3">
                    <span className="w-24 text-sm text-gray-300">{c.city}</span>
                    <div className="flex-1 h-6 rounded-lg bg-white/5 overflow-hidden relative">
                      <div
                        className="h-full rounded-lg bg-gradient-to-r from-purple-600/60 to-purple-400/60"
                        style={{ width: `${(c.users / maxCityUsers) * 100}%` }}
                      />
                      <span className="absolute inset-y-0 left-2 flex items-center text-xs text-white/80">
                        {c.users.toLocaleString()} users
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right">
                      ₹{(c.revenue / 1000).toFixed(0)}K
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Session Success Rate & Dispute Metrics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Session Success Rate */}
        <motion.div variants={item}>
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Session Success Rate
            </h3>
            <div className="flex items-center justify-center py-6">
              <div className="relative h-36 w-36">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="url(#successGradient)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${94.2 * 3.14} ${100 * 3.14}`}
                  />
                  <defs>
                    <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">94.2%</span>
                  <span className="text-xs text-gray-400">success</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center pt-2">
              <div>
                <p className="text-lg font-bold text-emerald-400">
                  {mockSessions.filter((s) => s.status === 'completed').length}
                </p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div>
                <p className="text-lg font-bold text-yellow-400">
                  {mockSessions.filter((s) => s.status === 'in_progress').length}
                </p>
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-400">
                  {mockSessions.filter((s) => s.status === 'cancelled').length}
                </p>
                <p className="text-xs text-gray-500">Cancelled</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Dispute Resolution Metrics */}
        <motion.div variants={item}>
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Gavel className="h-4 w-4 text-orange-400" />
              Dispute Resolution Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <p className="text-2xl font-bold text-white">{analytics.disputeMetrics.total}</p>
                <p className="text-xs text-gray-400">Total Disputes</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">
                  {analytics.disputeMetrics.resolved}
                </p>
                <p className="text-xs text-gray-400">Resolved</p>
              </div>
            </div>
            <div className="text-center mb-4">
              <p className="text-sm text-gray-400">
                Average Resolution Time:{' '}
                <span className="font-semibold text-white">
                  {analytics.disputeMetrics.avgResolutionTime}
                </span>
              </p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Refund', pct: analytics.disputeMetrics.refundRate, color: 'from-red-500 to-red-400' },
                { label: 'Release Payment', pct: analytics.disputeMetrics.releaseRate, color: 'from-emerald-500 to-emerald-400' },
                { label: 'Partial Resolution', pct: analytics.disputeMetrics.partialRate, color: 'from-yellow-500 to-yellow-400' },
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-300">{r.label}</span>
                    <span className="text-gray-400">{r.pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${r.color}`}
                      style={{ width: `${r.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── tabs ────────────────────────────────────────────────────
const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'posts', label: 'Posts', icon: FileText },
  { id: 'disputes', label: 'Disputes', icon: Gavel },
  { id: 'fraud', label: 'Fraud Alerts', icon: ShieldAlert },
  { id: 'analytics', label: 'Analytics', icon: Activity },
];

// ── main component ──────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(mockAdminStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await adminAPI.getStats();
        if (res.data) setStats(res.data);
      } catch {
        /* keep mock */
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Access check
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10">
            <Shield className="h-10 w-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 max-w-sm">
            You don&apos;t have permission to view this page. Only administrators can access the
            admin dashboard.
          </p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  function renderTab() {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab stats={stats} />;
      case 'users':
        return <UsersTab />;
      case 'posts':
        return <PostsTab />;
      case 'disputes':
        return <DisputesTab />;
      case 'fraud':
        return <FraudAlertsTab />;
      case 'analytics':
        return <AnalyticsTab />;
      default:
        return <OverviewTab stats={stats} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15">
              <Shield className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-gray-400">
                Platform management &middot; Last updated{' '}
                {new Date().toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.id === 'disputes' && stats.openDisputes > 0 && (
                  <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                    {stats.openDisputes}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
