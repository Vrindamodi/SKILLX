import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Users,
  Star,
  Award,
  BookOpen,
  Target,
  Zap,
  Leaf,
  Heart,
  TreePine,
  Globe,
  Download,
  Calendar,
  Clock,
  Repeat,
  GraduationCap,
  Sparkles,
  Loader2,
  ArrowUpRight,
  Lightbulb,
  Trophy,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI } from '../services/api';
import { mockUsers, mockSessions, mockReviews, mockCapsules } from '../data/mockData';

// ── animation variants ──────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
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

function StatCard({ icon: Icon, value, label, trend, color, subtitle }) {
  const positive = trend >= 0;
  return (
    <motion.div variants={item}>
      <GlassCard className="p-5 hover:border-white/20 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}22` }}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          {trend !== undefined && (
            <span className={`flex items-center gap-0.5 text-xs font-medium ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {positive ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <p className="mt-4 text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </GlassCard>
    </motion.div>
  );
}

function ProgressBar({ label, value, max, color = 'from-blue-500 to-cyan-400', showPercent = true }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-gray-300">{label}</span>
        {showPercent && <span className="text-xs text-gray-400">{Math.round(pct)}%</span>}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function BarChart({ data, color = 'from-blue-600 to-indigo-400' }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3 h-48">
        {data.map((d, i) => {
          const height = (d.value / maxVal) * 100;
          return (
            <div key={d.label} className="flex flex-1 flex-col items-center gap-2 h-full">
              <div className="flex-1 w-full flex flex-col justify-end">
                <div className="text-center mb-1">
                  <span className="text-xs text-gray-400 font-medium">₹{(d.value / 1000).toFixed(1)}k</span>
                </div>
                <motion.div
                  className={`w-full rounded-t-lg bg-gradient-to-t ${color}`}
                  initial={{ height: '0%' }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.1 }}
                  style={{ minHeight: '4px' }}
                />
              </div>
              <span className="text-xs text-gray-500 mt-1">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── mock analytics data ─────────────────────────────────────
const mockAnalytics = {
  totalEarned: 28500,
  totalSessions: 42,
  avgRating: 4.8,
  roi: 340,
  monthlyEarnings: [
    { label: 'Sep', value: 3200 },
    { label: 'Oct', value: 4800 },
    { label: 'Nov', value: 3900 },
    { label: 'Dec', value: 6100 },
    { label: 'Jan', value: 7500 },
    { label: 'Feb', value: 5400 },
  ],
  skillsMastery: [
    { skill: 'JavaScript', level: 85 },
    { skill: 'React', level: 72 },
    { skill: 'Python', level: 60 },
    { skill: 'UI/UX Design', level: 45 },
    { skill: 'Node.js', level: 55 },
  ],
  recentActivity: [
    { text: 'Completed Python session with Priya Menon', time: '2 hours ago', icon: BookOpen },
    { text: 'Earned ₹540 from teaching JavaScript', time: '5 hours ago', icon: IndianRupee },
    { text: 'Received 5-star review from Aarav Sharma', time: '1 day ago', icon: Star },
    { text: 'Achieved Gold level badge', time: '2 days ago', icon: Award },
    { text: 'Completed Learning Path: React Fundamentals', time: '3 days ago', icon: GraduationCap },
  ],
  earningsBreakdown: {
    teaching: 18500,
    microServices: 6800,
    referrals: 3200,
  },
  earningsBySkill: [
    { skill: 'JavaScript', earned: 8400 },
    { skill: 'React', earned: 6200 },
    { skill: 'Python', earned: 3900 },
    { skill: 'Node.js', earned: 2800 },
    { skill: 'UI/UX Design', earned: 1600 },
  ],
  projectedNext: 8200,
  teaching: {
    studentsTaught: 45,
    successRate: 94,
    avgRating: 4.85,
    repeatRate: 68,
    avgDuration: 72,
    topSkills: [
      { skill: 'JavaScript', rating: 4.9, reviews: 28 },
      { skill: 'React', rating: 4.8, reviews: 22 },
      { skill: 'Python', rating: 4.7, reviews: 15 },
    ],
    ratingTrend: [
      { label: 'Sep', value: 4.5 },
      { label: 'Oct', value: 4.6 },
      { label: 'Nov', value: 4.7 },
      { label: 'Dec', value: 4.8 },
      { label: 'Jan', value: 4.85 },
      { label: 'Feb', value: 4.9 },
    ],
  },
  learning: {
    skillsLearned: 5,
    capsulesEarned: 8,
    mastery: [
      { skill: 'React', level: 72, target: 90 },
      { skill: 'UI/UX Design', level: 45, target: 80 },
      { skill: 'Python', level: 60, target: 85 },
      { skill: 'Data Science', level: 25, target: 70 },
    ],
    velocity: 2.3,
    recommended: ['Machine Learning', 'TypeScript', 'Docker', 'GraphQL'],
  },
  impact: {
    co2Saved: 12.4,
    freeSessionsDonated: 8,
    studentsImpacted: 156,
    treesPlanted: 3,
    badges: [
      { name: 'Eco Warrior', desc: 'Saved 10kg+ CO2 through remote sessions', icon: Leaf },
      { name: 'Community Champion', desc: 'Donated 5+ free sessions', icon: Heart },
      { name: 'Green Planet', desc: 'Planted 3 trees via platform rewards', icon: TreePine },
    ],
  },
};

// ── tabs definition ─────────────────────────────────────────
const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'earnings', label: 'Earnings', icon: IndianRupee },
  { id: 'teaching', label: 'Teaching', icon: GraduationCap },
  { id: 'learning', label: 'Learning', icon: BookOpen },
  { id: 'impact', label: 'Impact', icon: Globe },
];

// ── Tab Contents ────────────────────────────────────────────
function OverviewTab({ data }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={IndianRupee} value={`₹${data.totalEarned.toLocaleString()}`} label="Total Earned" trend={18} color="#10b981" />
        <StatCard icon={Calendar} value={data.totalSessions} label="Sessions" trend={12} color="#6366f1" />
        <StatCard icon={Star} value={data.avgRating.toFixed(1)} label="Avg Rating" trend={3} color="#f59e0b" />
        <StatCard icon={Target} value={`${data.roi}%`} label="ROI" trend={24} color="#ec4899" />
      </div>

      {/* Earnings Trend */}
      <motion.div variants={item}>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Earnings Trend</h3>
            <span className="text-sm text-gray-500">Last 6 months</span>
          </div>
          <BarChart data={data.monthlyEarnings} />
        </GlassCard>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Skills Mastery */}
        <motion.div variants={item}>
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-5">Skills Mastery</h3>
            <div className="space-y-4">
              {data.skillsMastery.map((s) => (
                <ProgressBar key={s.skill} label={s.skill} value={s.level} max={100} />
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={item}>
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-5">Recent Activity</h3>
            <div className="space-y-4">
              {data.recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 flex-shrink-0 mt-0.5">
                    <a.icon className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white">{a.text}</p>
                    <p className="text-xs text-gray-500">{a.time}</p>
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

function EarningsTab({ data }) {
  const { earningsBreakdown, earningsBySkill, projectedNext, monthlyEarnings } = data;
  const totalBreakdown = earningsBreakdown.teaching + earningsBreakdown.microServices + earningsBreakdown.referrals;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Monthly Breakdown */}
      <motion.div variants={item}>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Monthly Earnings</h3>
            <button className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/10 transition-colors">
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </div>
          <BarChart data={monthlyEarnings} />
        </GlassCard>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Earnings by Source */}
        <motion.div variants={item}>
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-5">Earnings by Source</h3>
            <div className="space-y-4">
              {[
                { label: 'Teaching Sessions', value: earningsBreakdown.teaching, color: 'from-emerald-500 to-teal-400' },
                { label: 'Micro-Services', value: earningsBreakdown.microServices, color: 'from-blue-500 to-indigo-400' },
                { label: 'Referral Bonuses', value: earningsBreakdown.referrals, color: 'from-purple-500 to-pink-400' },
              ].map((src) => (
                <div key={src.label}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-gray-300">{src.label}</span>
                    <span className="text-white font-medium">₹{src.value.toLocaleString()}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${src.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${totalBreakdown > 0 ? (src.value / totalBreakdown) * 100 : 0}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Earnings by Skill */}
        <motion.div variants={item}>
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-5">Earnings by Skill</h3>
            <div className="space-y-3">
              {earningsBySkill.map((s, i) => (
                <div key={s.skill} className="flex items-center gap-3">
                  <span className="w-5 text-right text-xs text-gray-500 font-medium">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-300">{s.skill}</span>
                      <span className="text-sm font-medium text-white">₹{s.earned.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${earningsBySkill[0].earned > 0 ? (s.earned / earningsBySkill[0].earned) * 100 : 0}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.1 }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Projection */}
      <motion.div variants={item}>
        <GlassCard className="p-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
              <Sparkles className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Projected Next Month</p>
              <p className="text-2xl font-bold text-emerald-300">₹{projectedNext.toLocaleString()}</p>
            </div>
            <div className="ml-auto flex items-center gap-1 text-emerald-400">
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-sm font-medium">+8.3%</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

function TeachingTab({ data }) {
  const { teaching } = data;
  const maxRating = 5;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={Users} value={teaching.studentsTaught} label="Students Taught" trend={15} color="#6366f1" />
        <StatCard icon={Target} value={`${teaching.successRate}%`} label="Success Rate" trend={2} color="#10b981" />
        <StatCard icon={Star} value={teaching.avgRating.toFixed(2)} label="Avg Rating" trend={4} color="#f59e0b" />
        <StatCard icon={Repeat} value={`${teaching.repeatRate}%`} label="Repeat Students" trend={8} color="#8b5cf6" />
        <StatCard icon={Clock} value={`${teaching.avgDuration}m`} label="Avg Duration" color="#ec4899" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rating Trend */}
        <motion.div variants={item}>
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-5">Rating Trend</h3>
            <div className="flex items-end justify-between gap-4 h-48">
              {teaching.ratingTrend.map((d, i) => {
                const minRating = 4.0;
                const maxRating = 5.0;
                const height = ((d.value - minRating) / (maxRating - minRating)) * 100;
                return (
                  <div key={d.label} className="flex flex-1 flex-col items-center gap-2 h-full">
                    <div className="flex-1 w-full flex flex-col justify-end">
                      <div className="text-center mb-1">
                        <span className="text-xs text-yellow-400 font-semibold">{d.value}</span>
                      </div>
                      <motion.div
                        className="w-full rounded-t-lg bg-gradient-to-t from-yellow-600 to-amber-400"
                        initial={{ height: '0%' }}
                        animate={{ height: `${Math.max(height, 5)}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.1 }}
                        style={{ minHeight: '8px' }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        {/* Top Reviewed Skills */}
        <motion.div variants={item}>
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-5">Top Reviewed Skills</h3>
            <div className="space-y-4">
              {teaching.topSkills.map((s, i) => (
                <div key={s.skill} className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    i === 0 ? 'bg-yellow-500/15' : i === 1 ? 'bg-gray-500/15' : 'bg-amber-800/15'
                  }`}>
                    <Trophy className={`h-5 w-5 ${
                      i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : 'text-amber-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">{s.skill}</span>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span className="text-sm font-medium">{s.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{s.reviews} reviews</p>
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

function LearningTab({ data }) {
  const { learning } = data;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={BookOpen} value={learning.skillsLearned} label="Skills Learned" trend={20} color="#6366f1" />
        <StatCard icon={Award} value={learning.capsulesEarned} label="Capsules Earned" trend={10} color="#10b981" />
        <StatCard icon={Zap} value={`${learning.velocity}/wk`} label="Learning Velocity" trend={5} color="#f59e0b" />
        <StatCard icon={Target} value={`${Math.round(learning.mastery.reduce((a, m) => a + m.level, 0) / learning.mastery.length)}%`} label="Avg Mastery" trend={8} color="#ec4899" />
      </div>

      {/* Mastery Per Skill */}
      <motion.div variants={item}>
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-5">Skill Mastery Progress</h3>
          <div className="space-y-5">
            {learning.mastery.map((m) => (
              <div key={m.skill}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-gray-300">{m.skill}</span>
                  <span className="text-xs text-gray-500">
                    {m.level}% / {m.target}% target
                  </span>
                </div>
                <div className="relative h-3 overflow-hidden rounded-full bg-white/10">
                  {/* Target marker */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-white/30 z-10"
                    style={{ left: `${m.target}%` }}
                  />
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${
                      m.level >= m.target ? 'from-emerald-500 to-teal-400' : 'from-blue-500 to-indigo-400'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${m.level}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Recommended Next */}
      <motion.div variants={item}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Recommended Next Skills</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {learning.recommended.map((skill) => (
              <div
                key={skill}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-center hover:border-blue-500/30 hover:bg-blue-500/5 transition-all cursor-pointer"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 mx-auto mb-2">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                </div>
                <p className="text-sm font-medium text-white">{skill}</p>
                <p className="mt-0.5 text-xs text-gray-500">Trending</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

function ImpactTab({ data }) {
  const { impact } = data;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Impact Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <motion.div variants={item}>
          <GlassCard className="p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
            <Leaf className="h-8 w-8 text-emerald-400 mb-3" />
            <p className="text-2xl font-bold text-white">{impact.co2Saved}kg</p>
            <p className="text-sm text-gray-400">CO2 Saved</p>
          </GlassCard>
        </motion.div>
        <motion.div variants={item}>
          <GlassCard className="p-5 bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/20">
            <Heart className="h-8 w-8 text-pink-400 mb-3" />
            <p className="text-2xl font-bold text-white">{impact.freeSessionsDonated}</p>
            <p className="text-sm text-gray-400">Free Sessions Donated</p>
          </GlassCard>
        </motion.div>
        <motion.div variants={item}>
          <GlassCard className="p-5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
            <Users className="h-8 w-8 text-blue-400 mb-3" />
            <p className="text-2xl font-bold text-white">{impact.studentsImpacted}</p>
            <p className="text-sm text-gray-400">Students Impacted</p>
          </GlassCard>
        </motion.div>
        <motion.div variants={item}>
          <GlassCard className="p-5 bg-gradient-to-br from-green-500/10 to-lime-500/10 border-green-500/20">
            <TreePine className="h-8 w-8 text-green-400 mb-3" />
            <p className="text-2xl font-bold text-white">{impact.treesPlanted}</p>
            <p className="text-sm text-gray-400">Trees Planted</p>
          </GlassCard>
        </motion.div>
      </div>

      {/* Environmental Badges */}
      <motion.div variants={item}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Environmental Badges Earned</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {impact.badges.map((badge) => (
              <div
                key={badge.name}
                className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 mx-auto mb-3">
                  <badge.icon className="h-7 w-7 text-emerald-400" />
                </div>
                <p className="font-semibold text-white">{badge.name}</p>
                <p className="mt-1 text-xs text-gray-400">{badge.desc}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Impact Statement */}
      <motion.div variants={item}>
        <GlassCard className="p-6 bg-gradient-to-r from-emerald-500/5 to-blue-500/5">
          <div className="flex items-center gap-4">
            <Globe className="h-10 w-10 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-lg font-semibold text-white">Your Impact Matters</p>
              <p className="mt-1 text-sm text-gray-400">
                By choosing remote sessions and sharing knowledge freely, you have helped reduce carbon footprint and made education accessible to {impact.studentsImpacted} learners across India.
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

// ── main Analytics page ─────────────────────────────────────
export default function Analytics() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const res = await analyticsAPI.getUserAnalytics();
        if (!cancelled && res.data) {
          setAnalyticsData(res.data);
        }
      } catch {
        // fallback to mock
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  // Merge API data with mock data to ensure all fields exist
  const data = analyticsData ? { ...mockAnalytics, ...analyticsData } : mockAnalytics;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  function renderTabContent() {
    switch (activeTab) {
      case 'overview': return <OverviewTab data={data} />;
      case 'earnings': return <EarningsTab data={data} />;
      case 'teaching': return <TeachingTab data={data} />;
      case 'learning': return <LearningTab data={data} />;
      case 'impact': return <ImpactTab data={data} />;
      default: return <OverviewTab data={data} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold sm:text-3xl">Analytics</h1>
          <p className="mt-1 text-gray-400">Track your performance, earnings, and impact</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 flex-shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}
