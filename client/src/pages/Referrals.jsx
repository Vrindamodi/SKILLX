import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Share2,
  Copy,
  Check,
  Users,
  IndianRupee,
  Clock,
  Gift,
  Trophy,
  Star,
  QrCode,
  ArrowRight,
  Loader2,
  TrendingUp,
  Sparkles,
  Target,
  Zap,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { referralAPI } from '../services/api';
import { mockUsers, mockLeaderboard } from '../data/mockData';

// ── animations ──────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
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

// Mock referral data
const mockReferralData = {
  referralCode: 'AARAV2026',
  referralLink: 'https://skillx.app/join/AARAV2026',
  stats: {
    totalReferrals: 12,
    activeReferrals: 8,
    totalEarned: 6800,
    pendingEarnings: 1200,
  },
  referrals: [
    { id: 'ref1', name: 'Ankit Mehta', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ankit', status: 'active', earned: 700, date: '2026-02-08T10:00:00Z' },
    { id: 'ref2', name: 'Riya Bansal', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Riya', status: 'active', earned: 700, date: '2026-02-05T14:00:00Z' },
    { id: 'ref3', name: 'Sahil Malhotra', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sahil2', status: 'active', earned: 500, date: '2026-02-01T09:00:00Z' },
    { id: 'ref4', name: 'Tanya Singh', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tanya', status: 'pending', earned: 0, date: '2026-02-09T16:00:00Z' },
    { id: 'ref5', name: 'Kunal Joshi', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kunal', status: 'active', earned: 700, date: '2026-01-28T11:00:00Z' },
    { id: 'ref6', name: 'Megha Rao', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Megha', status: 'active', earned: 700, date: '2026-01-25T08:00:00Z' },
    { id: 'ref7', name: 'Arjun Kapoor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunK', status: 'active', earned: 700, date: '2026-01-22T13:00:00Z' },
    { id: 'ref8', name: 'Prachi Gupta', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Prachi', status: 'pending', earned: 0, date: '2026-02-10T07:00:00Z' },
    { id: 'ref9', name: 'Vimal Shah', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vimal', status: 'active', earned: 500, date: '2026-01-18T15:00:00Z' },
    { id: 'ref10', name: 'Ishita Patel', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ishita', status: 'active', earned: 700, date: '2026-01-15T10:00:00Z' },
    { id: 'ref11', name: 'Dev Nair', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dev', status: 'pending', earned: 0, date: '2026-02-10T12:00:00Z' },
    { id: 'ref12', name: 'Sneha Verma', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha2', status: 'pending', earned: 0, date: '2026-02-09T20:00:00Z' },
  ],
};

const milestones = [
  { referrals: 10, reward: 1000, label: '10 Referrals', icon: '🎯' },
  { referrals: 50, reward: 10000, label: '50 Referrals', icon: '🚀' },
  { referrals: 100, reward: 50000, label: '100 Referrals', icon: '💎' },
  { referrals: 500, reward: 200000, label: '500 Referrals', icon: '👑' },
];

const topReferrers = [
  { rank: 1, name: 'Priya Menon', city: 'Bangalore', referrals: 87, earned: 62000, avatar: mockUsers[1].avatar },
  { rank: 2, name: 'Rahul Iyer', city: 'Chennai', referrals: 64, earned: 45000, avatar: mockUsers[4].avatar },
  { rank: 3, name: 'Neha Gupta', city: 'Delhi', referrals: 52, earned: 38000, avatar: mockUsers[3].avatar },
  { rank: 4, name: 'Fatima Khan', city: 'Hyderabad', referrals: 41, earned: 29000, avatar: mockUsers[5].avatar },
  { rank: 5, name: 'Vikram Patel', city: 'Ahmedabad', referrals: 38, earned: 26000, avatar: mockUsers[2].avatar },
  { rank: 6, name: 'Aarav Sharma', city: 'Mumbai', referrals: 12, earned: 6800, avatar: mockUsers[0].avatar },
  { rank: 7, name: 'Ananya Desai', city: 'Pune', referrals: 9, earned: 5400, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaD' },
  { rank: 8, name: 'Karthik Nair', city: 'Kochi', referrals: 7, earned: 4200, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KarthikN' },
  { rank: 9, name: 'Divya Rajput', city: 'Jaipur', referrals: 5, earned: 3000, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DivyaR' },
  { rank: 10, name: 'Sahil Khan', city: 'Hyderabad', referrals: 3, earned: 1500, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SahilK2' },
];

const howItWorks = [
  { step: 1, title: 'Friend Signs Up', description: 'They use your referral link to join Skill-X', reward: '₹500', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/15' },
  { step: 2, title: 'First Session', description: 'They complete their first session on the platform', reward: '₹200 more', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  { step: 3, title: 'Lifetime Commission', description: 'Earn 5% of their session fees — forever', reward: '5% forever', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/15' },
];

const STATUS_STYLES = {
  pending: 'bg-yellow-500/15 text-yellow-300',
  active: 'bg-emerald-500/15 text-emerald-300',
};

// ── main component ──────────────────────────────────────────
export default function Referrals() {
  const { user } = useAuth();
  const currentUser = user || mockUsers[0];

  const [data, setData] = useState(mockReferralData);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const res = await referralAPI.getMyReferrals();
        if (!cancelled && res?.data) setData(res.data);
      } catch {
        // keep mock
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(data.referralCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(data.referralLink).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareText = encodeURIComponent(`Join me on Skill-X! Learn, teach, and earn. Use my referral link: ${data.referralLink}`);

  const totalRefs = data.stats.totalReferrals;
  const nextMilestone = milestones.find((m) => m.referrals > totalRefs) || milestones[milestones.length - 1];
  const prevMilestone = milestones.filter((m) => m.referrals <= totalRefs).pop();
  const milestoneProgress = prevMilestone
    ? ((totalRefs - (prevMilestone?.referrals || 0)) / (nextMilestone.referrals - (prevMilestone?.referrals || 0))) * 100
    : (totalRefs / nextMilestone.referrals) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/15">
              <Share2 className="h-6 w-6 text-pink-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Referrals</h1>
              <p className="text-sm text-gray-400">Invite friends and earn rewards together</p>
            </div>
          </div>
        </motion.div>

        {/* Referral Link Card */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <GlassCard className="p-6 mb-6 border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-purple-500/5">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Your Referral Code</p>
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-mono text-lg font-bold tracking-widest text-white">
                    {data.referralCode}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors"
                  >
                    {copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Your Referral Link</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 overflow-hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-400 truncate">
                    {data.referralLink}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                {/* Share Buttons */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {[
                    { label: 'WhatsApp', color: 'bg-green-600 hover:bg-green-500', href: `https://wa.me/?text=${shareText}` },
                    { label: 'Twitter', color: 'bg-sky-600 hover:bg-sky-500', href: `https://twitter.com/intent/tweet?text=${shareText}` },
                    { label: 'LinkedIn', color: 'bg-blue-700 hover:bg-blue-600', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.referralLink)}` },
                    { label: 'Email', color: 'bg-gray-600 hover:bg-gray-500', href: `mailto:?subject=Join%20Skill-X&body=${shareText}` },
                  ].map((btn) => (
                    <a
                      key={btn.label}
                      href={btn.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium text-white transition-colors ${btn.color}`}
                    >
                      <ExternalLink className="h-3 w-3" />{btn.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* QR Code Placeholder */}
              <div className="flex flex-col items-center justify-center">
                <div className="flex h-36 w-36 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <QrCode className="h-16 w-16 text-gray-600" />
                </div>
                <p className="mt-2 text-xs text-gray-500">Scan to join</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8"
        >
          {[
            { label: 'Total Referrals', value: data.stats.totalReferrals, icon: Users, color: '#6366f1' },
            { label: 'Active Referrals', value: data.stats.activeReferrals, icon: Star, color: '#10b981' },
            { label: 'Total Earned', value: `₹${data.stats.totalEarned.toLocaleString()}`, icon: IndianRupee, color: '#f59e0b' },
            { label: 'Pending Earnings', value: `₹${data.stats.pendingEarnings.toLocaleString()}`, icon: Clock, color: '#ec4899' },
          ].map((stat) => (
            <motion.div key={stat.label} variants={item}>
              <GlassCard className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl mb-3" style={{ backgroundColor: `${stat.color}22` }}>
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* How It Works */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-white">How It Works</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {howItWorks.map((step, i) => (
              <GlassCard key={step.step} className="p-5 text-center">
                <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${step.bg} mb-3`}>
                  <step.icon className={`h-6 w-6 ${step.color}`} />
                </div>
                <h3 className="font-semibold text-white">{step.title}</h3>
                <p className="mt-1 text-sm text-gray-400">{step.description}</p>
                <p className={`mt-3 text-lg font-bold ${step.color}`}>{step.reward}</p>
                {i < howItWorks.length - 1 && (
                  <ArrowRight className="hidden sm:block absolute right-[-20px] top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
                )}
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Milestone Bonuses */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-white">Milestone Bonuses</h2>
          <GlassCard className="p-5">
            {/* Progress bar to next milestone */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">Progress to next: <strong className="text-white">{nextMilestone.label}</strong></span>
                <span className="text-gray-400">{totalRefs}/{nextMilestone.referrals}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(milestoneProgress, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {milestones.map((m) => {
                const reached = totalRefs >= m.referrals;
                return (
                  <div
                    key={m.referrals}
                    className={`rounded-xl border p-4 text-center transition-all ${
                      reached
                        ? 'border-emerald-500/30 bg-emerald-500/10'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <p className="mt-1 text-sm font-semibold text-white">{m.label}</p>
                    <p className={`text-lg font-bold ${reached ? 'text-emerald-400' : 'text-gray-400'}`}>
                      ₹{m.reward.toLocaleString()}
                    </p>
                    {reached && (
                      <span className="inline-block mt-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">CLAIMED</span>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        {/* Referral List */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-white">Your Referrals</h2>
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">User</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Earned</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.referrals.map((ref) => (
                    <tr key={ref.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={ref.avatar} alt={ref.name} className="h-8 w-8 rounded-full border border-white/10" />
                          <span className="text-sm font-medium text-white">{ref.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[ref.status]}`}>
                          {ref.status.charAt(0).toUpperCase() + ref.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-300">
                        {ref.earned > 0 ? `₹${ref.earned}` : '—'}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {new Date(ref.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>

        {/* Top Referrers Leaderboard */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          <h2 className="mb-4 text-lg font-semibold text-white">Top Referrers</h2>
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
            {topReferrers.map((entry) => {
              const isUser = entry.name === currentUser.name;
              return (
                <motion.div key={entry.rank} variants={item}>
                  <GlassCard
                    className={`flex items-center gap-4 p-4 transition-colors hover:border-white/20 ${
                      isUser ? 'border-blue-500/30 bg-blue-500/5' : ''
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 ${
                      entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-600' :
                      entry.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                      entry.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-orange-800' :
                      'border border-white/10 bg-white/5'
                    }`}>
                      <span className={`text-sm font-bold ${entry.rank <= 3 ? 'text-white' : 'text-gray-400'}`}>
                        #{entry.rank}
                      </span>
                    </div>
                    <img src={entry.avatar} alt={entry.name} className="h-9 w-9 rounded-full border border-white/10" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white truncate">{entry.name}</p>
                        {isUser && <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">YOU</span>}
                      </div>
                      <p className="text-xs text-gray-400">{entry.city}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-pink-400">{entry.referrals} referrals</p>
                      <p className="text-xs text-gray-500">₹{entry.earned.toLocaleString()} earned</p>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
