import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  BellOff,
  CheckCircle2,
  Star,
  IndianRupee,
  MessageSquare,
  Zap,
  Clock,
  Award,
  Sparkles,
  Settings,
  Loader2,
  Trash2,
  Check,
  CalendarCheck,
  XCircle,
  Users,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import { mockNotifications, mockUsers } from '../data/mockData';

// ── animations ──────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

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

// ── Notification icon/color map ─────────────────────────────
const NOTIF_CONFIG = {
  session_request: { icon: CalendarCheck, color: 'text-blue-400', bg: 'bg-blue-500/15', category: 'sessions' },
  session_accepted: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/15', category: 'sessions' },
  session_declined: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/15', category: 'sessions' },
  session_completed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/15', category: 'sessions' },
  session_reminder: { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/15', category: 'sessions' },
  payment_received: { icon: IndianRupee, color: 'text-green-400', bg: 'bg-green-500/15', category: 'payments' },
  payment_sent: { icon: IndianRupee, color: 'text-red-400', bg: 'bg-red-500/15', category: 'payments' },
  review_received: { icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/15', category: 'social' },
  badge_earned: { icon: Award, color: 'text-purple-400', bg: 'bg-purple-500/15', category: 'social' },
  level_up: { icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/15', category: 'social' },
  message: { icon: MessageSquare, color: 'text-gray-400', bg: 'bg-gray-500/15', category: 'messages' },
  system: { icon: ShieldCheck, color: 'text-gray-500', bg: 'bg-gray-500/15', category: 'system' },
  referral: { icon: Users, color: 'text-pink-400', bg: 'bg-pink-500/15', category: 'social' },
};

// Navigation targets for notification types
const NOTIF_ROUTES = {
  session_request: '/sessions',
  session_accepted: '/sessions',
  session_declined: '/sessions',
  session_completed: '/sessions',
  session_reminder: '/sessions',
  payment_received: '/wallet',
  payment_sent: '/wallet',
  review_received: '/profile',
  badge_earned: '/profile',
  level_up: '/profile',
  message: '/chat',
  system: '/dashboard',
  referral: '/referrals',
};

// Extended mock notifications for demo
const extendedNotifications = [
  ...mockNotifications,
  { id: 'notif11', userId: 'user1', type: 'referral', title: 'Referral bonus!', message: 'Ankit Mehta signed up with your referral link. You earned ₹500!', read: false, createdAt: '2026-02-10T08:00:00Z' },
  { id: 'notif12', userId: 'user1', type: 'payment_received', title: 'Payment received', message: 'You received ₹1,050 for your Mathematics session.', read: false, createdAt: '2026-02-10T07:00:00Z' },
  { id: 'notif13', userId: 'user1', type: 'session_accepted', title: 'Session confirmed', message: 'Neha Gupta confirmed your Graphic Design session for Feb 15.', read: true, createdAt: '2026-02-09T11:00:00Z' },
  { id: 'notif14', userId: 'user1', type: 'review_received', title: 'New review', message: 'Rahul Iyer left you a 4.5-star review for your Mathematics session.', read: true, createdAt: '2026-02-08T15:00:00Z' },
  { id: 'notif15', userId: 'user1', type: 'badge_earned', title: 'Badge unlocked!', message: 'You earned the "On Fire" badge for maintaining a 7-day streak!', read: false, createdAt: '2026-02-07T09:00:00Z' },
  { id: 'notif16', userId: 'user1', type: 'system', title: 'Scheduled maintenance', message: 'Skill-X will be briefly offline on Feb 12 from 2-4 AM IST for maintenance.', read: true, createdAt: '2026-02-06T12:00:00Z' },
  { id: 'notif17', userId: 'user1', type: 'session_declined', title: 'Session cancelled', message: 'Your Python session with Priya Menon for Feb 8 was cancelled by the teacher.', read: true, createdAt: '2026-02-05T20:00:00Z' },
  { id: 'notif18', userId: 'user1', type: 'message', title: 'New message', message: 'Fatima Khan: "Hey, looking forward to the cooking session!"', read: true, createdAt: '2026-02-04T16:00:00Z' },
  { id: 'notif19', userId: 'user1', type: 'payment_sent', title: 'Payment sent', message: 'You paid ₹2,400 for a React consultation with Priya Menon.', read: true, createdAt: '2026-02-03T11:00:00Z' },
  { id: 'notif20', userId: 'user1', type: 'level_up', title: 'Almost there!', message: 'You need just 250 more XP to reach Gold level. Keep going!', read: true, createdAt: '2026-02-01T08:00:00Z' },
];

// Filter tabs
const FILTER_TABS = [
  { key: 'all', label: 'All', icon: Bell },
  { key: 'unread', label: 'Unread', icon: Sparkles },
  { key: 'messages', label: 'Messages', icon: MessageSquare },
  { key: 'sessions', label: 'Sessions', icon: CalendarCheck },
  { key: 'payments', label: 'Payments', icon: IndianRupee },
  { key: 'social', label: 'Social', icon: Users },
  { key: 'system', label: 'System', icon: ShieldCheck },
];

// ── Date grouping helper ────────────────────────────────────
function getDateGroup(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return 'Earlier';
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ── main component ──────────────────────────────────────────
export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentUser = user || mockUsers[0];

  const [notifications, setNotifications] = useState(extendedNotifications);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    async function fetchNotifications() {
      setLoading(true);
      try {
        const res = await notificationAPI.getAll();
        if (!cancelled && res?.data?.notifications) {
          setNotifications(res.data.notifications);
        }
      } catch {
        // keep mock
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchNotifications();
    return () => { cancelled = true; };
  }, []);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];
    if (activeFilter === 'unread') {
      filtered = filtered.filter((n) => !n.read);
    } else if (activeFilter !== 'all') {
      filtered = filtered.filter((n) => {
        const cfg = NOTIF_CONFIG[n.type];
        return cfg?.category === activeFilter;
      });
    }
    // Sort by date descending
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return filtered;
  }, [notifications, activeFilter]);

  // Group by date
  const groupedNotifications = useMemo(() => {
    const groups = {};
    filteredNotifications.forEach((n) => {
      const group = getDateGroup(n.createdAt);
      if (!groups[group]) groups[group] = [];
      groups[group].push(n);
    });
    return groups;
  }, [filteredNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
    } catch {
      // mock
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
    } catch {
      // mock
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.delete(id);
    } catch {
      // mock
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClick = (notif) => {
    handleMarkRead(notif.id);
    const route = NOTIF_ROUTES[notif.type];
    if (route) navigate(route);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 relative">
                <Bell className="h-6 w-6 text-blue-400" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">Notifications</h1>
                <p className="text-sm text-gray-400">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Check className="h-4 w-4" />Mark all read
                </button>
              )}
              <button
                onClick={() => navigate('/settings')}
                className="rounded-xl border border-white/10 p-2.5 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                title="Notification Preferences"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {FILTER_TABS.map((tab) => {
              const Icon = tab.icon;
              const count = tab.key === 'unread'
                ? unreadCount
                : tab.key === 'all'
                ? notifications.length
                : notifications.filter((n) => NOTIF_CONFIG[n.type]?.category === tab.key).length;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                    activeFilter === tab.key
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                  {count > 0 && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      activeFilter === tab.key ? 'bg-white/20' : 'bg-white/10'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5">
              <BellOff className="h-10 w-10 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-white">No notifications</h3>
            <p className="mt-1 text-sm text-gray-400">
              {activeFilter === 'unread' ? "You're all caught up!" : 'No notifications in this category.'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(([group, notifs]) => (
              <div key={group}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{group}</p>
                <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
                  {notifs.map((notif) => {
                    const cfg = NOTIF_CONFIG[notif.type] || NOTIF_CONFIG.system;
                    const Icon = cfg.icon;

                    return (
                      <motion.div key={notif.id} variants={item}>
                        <GlassCard
                          className={`group flex items-start gap-3 p-4 cursor-pointer transition-all hover:border-white/20 ${
                            !notif.read ? 'border-l-2 border-l-blue-500 bg-blue-500/[0.03]' : ''
                          }`}
                          onClick={() => handleClick(notif)}
                        >
                          {/* Icon */}
                          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                            <Icon className={`h-5 w-5 ${cfg.color}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className={`text-sm font-semibold truncate ${notif.read ? 'text-gray-300' : 'text-white'}`}>
                                {notif.title}
                              </h3>
                              {!notif.read && (
                                <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className={`mt-0.5 text-sm line-clamp-2 ${notif.read ? 'text-gray-500' : 'text-gray-400'}`}>
                              {notif.message}
                            </p>
                            <p className="mt-1 text-xs text-gray-600">{formatTime(notif.createdAt)}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            {!notif.read && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleMarkRead(notif.id); }}
                                className="rounded-lg p-1.5 hover:bg-white/10 transition-colors"
                                title="Mark as read"
                              >
                                <Check className="h-3.5 w-3.5 text-gray-500" />
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                              className="rounded-lg p-1.5 hover:bg-white/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-gray-500" />
                            </button>
                          </div>

                          {/* Navigate arrow */}
                          <ChevronRight className="h-4 w-4 text-gray-600 flex-shrink-0 self-center" />
                        </GlassCard>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
