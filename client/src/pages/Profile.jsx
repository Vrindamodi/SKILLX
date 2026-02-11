import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  MapPin,
  Calendar,
  Clock,
  MessageSquare,
  UserPlus,
  UserMinus,
  Flag,
  Shield,
  Award,
  BookOpen,
  IndianRupee,
  ChevronRight,
  ExternalLink,
  Share2,
  CheckCircle2,
  Globe,
  Languages,
  Zap,
  Users,
  Eye,
  EyeOff,
  Loader2,
  CalendarCheck,
  BadgeCheck,
  GraduationCap,
  Briefcase,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Copy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI, reviewAPI, capsuleAPI } from '../services/api';
import { mockUsers, mockReviews, mockCapsules, mockSessions } from '../data/mockData';
import { LEVELS, BADGES } from '../utils/constants';

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

function getLevelInfo(xpOrLevel) {
  if (typeof xpOrLevel === 'string') {
    const lvl = LEVELS[xpOrLevel];
    return lvl || LEVELS.bronze;
  }
  const entries = Object.entries(LEVELS);
  for (const [, lvl] of entries) {
    if (xpOrLevel >= lvl.minXP && xpOrLevel <= lvl.maxXP) return lvl;
  }
  return entries[entries.length - 1][1];
}

function StarRating({ rating, size = 'sm' }) {
  const sizes = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' };
  const iconSize = sizes[size] || sizes.sm;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${iconSize} ${s <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
        />
      ))}
    </div>
  );
}

// ── Tabs ────────────────────────────────────────────────────
const TABS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'capsules', label: 'Capsules' },
  { id: 'activity', label: 'Activity' },
];

// ── About Tab ───────────────────────────────────────────────
function AboutTab({ profile }) {
  const socials = profile.socialLinks || {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com',
  };

  const availability = profile.teachingProfile?.availability || [
    { day: 'Mon', slots: ['10:00-12:00', '14:00-17:00'] },
    { day: 'Tue', slots: ['10:00-12:00'] },
    { day: 'Wed', slots: ['14:00-18:00'] },
    { day: 'Thu', slots: ['10:00-12:00', '14:00-17:00'] },
    { day: 'Fri', slots: ['10:00-14:00'] },
    { day: 'Sat', slots: ['10:00-16:00'] },
    { day: 'Sun', slots: [] },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Bio */}
      <motion.div variants={item}>
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-3">About</h3>
          <p className="text-gray-300 leading-relaxed">{profile.bio || 'No bio provided.'}</p>
        </GlassCard>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Languages */}
        <motion.div variants={item}>
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Languages className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-white">Languages</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {(profile.languages || ['English', 'Hindi']).map((lang) => (
                <span key={lang} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-gray-300">
                  {lang}
                </span>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Social Links */}
        <motion.div variants={item}>
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-white">Social Links</h3>
            </div>
            <div className="space-y-2">
              {[
                { icon: Github, label: 'GitHub', link: socials.github },
                { icon: Linkedin, label: 'LinkedIn', link: socials.linkedin },
                { icon: Twitter, label: 'Twitter', link: socials.twitter },
              ].filter(s => s.link).map((s) => (
                <a
                  key={s.label}
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-white/5 transition-colors"
                >
                  <s.icon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{s.label}</span>
                  <ExternalLink className="ml-auto h-3.5 w-3.5 text-gray-600" />
                </a>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Availability */}
      <motion.div variants={item}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-emerald-400" />
            <h3 className="font-semibold text-white">Availability</h3>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {availability.map((day) => (
              <div key={day.day} className="text-center">
                <p className="text-xs font-medium text-gray-400 mb-2">{day.day}</p>
                {day.slots.length > 0 ? (
                  day.slots.map((slot) => (
                    <div key={slot} className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-1 py-1 mb-1">
                      <p className="text-xs text-emerald-400">{slot}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg bg-white/5 px-1 py-1">
                    <p className="text-xs text-gray-600">Off</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Teaching Profile */}
      {profile.role === 'teacher' || profile.skills?.teaching?.length > 0 ? (
        <motion.div variants={item}>
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-purple-400" />
              <h3 className="font-semibold text-white">Teaching Profile</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Hourly Rate</p>
                <p className="text-lg font-bold text-white">₹{profile.teachingProfile?.hourlyRate || 600}/hr</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Sessions Done</p>
                <p className="text-lg font-bold text-white">{profile.stats?.sessionsCompleted || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Hours Taught</p>
                <p className="text-lg font-bold text-white">{profile.stats?.hoursTaught || 0}h</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Teaching Style</p>
                <p className="text-sm font-medium text-white">{profile.teachingProfile?.style || 'Hands-on'}</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ) : null}
    </motion.div>
  );
}

// ── Skills Tab ──────────────────────────────────────────────
function SkillsTab({ profile }) {
  const teachingSkills = profile.skills?.teaching || [];
  const learningSkills = profile.skills?.learning || [];

  const skillConfidence = {
    JavaScript: 5, React: 4, Python: 4, 'Node.js': 4, Flutter: 3, DevOps: 3,
    'Graphic Design': 5, 'UI/UX Design': 4, 'Content Writing': 4,
    Mathematics: 5, Physics: 4, Statistics: 4, Economics: 3,
    Cooking: 5, Tailoring: 4, Cleaning: 3, Hindi: 5,
    Leadership: 4, 'Business Strategy': 4, 'Public Speaking': 4,
    Communication: 3,
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Skills Known (Teaching) */}
      {teachingSkills.length > 0 && (
        <motion.div variants={item}>
          <h3 className="text-lg font-semibold text-white mb-4">Skills Known</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {teachingSkills.map((skill) => (
              <GlassCard key={skill} className="p-4 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{skill}</span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">
                    Can Teach
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${
                        s <= (skillConfidence[skill] || 3) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-xs text-gray-500">Confidence</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      )}

      {/* Skills Learning */}
      {learningSkills.length > 0 && (
        <motion.div variants={item}>
          <h3 className="text-lg font-semibold text-white mb-4">Currently Learning</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {learningSkills.map((skill) => {
              const progress = Math.floor(Math.random() * 60) + 20;
              const targetLevel = Math.floor(Math.random() * 2) + 3;
              return (
                <GlassCard key={skill} className="p-4 hover:border-blue-500/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{skill}</span>
                    <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs text-blue-300">
                      Learning
                    </span>
                  </div>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-gray-400">Target: Level {targetLevel}</span>
                    <span className="text-gray-500">{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Reviews Tab ─────────────────────────────────────────────
function ReviewsTab({ reviews, profile }) {
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? reviews.reduce((a, r) => a + r.rating, 0) / totalReviews
    : 0;
  const maxCount = Math.max(...ratingBreakdown.map((r) => r.count), 1);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Rating Summary */}
      <motion.div variants={item}>
        <GlassCard className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="text-center sm:text-left">
              <p className="text-5xl font-bold text-white">{avgRating.toFixed(1)}</p>
              <StarRating rating={avgRating} size="md" />
              <p className="mt-1 text-sm text-gray-400">{totalReviews} reviews</p>
            </div>
            <div className="flex-1 space-y-2">
              {ratingBreakdown.map((r) => (
                <div key={r.star} className="flex items-center gap-2">
                  <span className="w-4 text-right text-xs text-gray-400">{r.star}</span>
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <div className="flex-1 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-yellow-400"
                      style={{ width: `${maxCount > 0 ? (r.count / maxCount) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs text-gray-500">{r.count}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Review List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <motion.div variants={item}>
            <GlassCard className="p-8 text-center">
              <Star className="h-10 w-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No reviews yet</p>
            </GlassCard>
          </motion.div>
        ) : (
          reviews.map((review) => (
            <motion.div key={review.id} variants={item}>
              <GlassCard className="p-5">
                <div className="flex items-start gap-3">
                  <img
                    src={mockUsers.find((u) => u.id === review.reviewerId)?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.reviewerName}`}
                    alt={review.reviewerName}
                    className="h-10 w-10 rounded-full border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white">{review.reviewerName}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating rating={review.rating} />
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">{review.skill}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-300">{review.comment}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

// ── Capsules Tab ────────────────────────────────────────────
function CapsulesTab({ capsules }) {
  const [copied, setCopied] = useState(null);

  function handleShare(capsuleId) {
    navigator.clipboard?.writeText(`https://skillx.app/capsule/${capsuleId}`);
    setCopied(capsuleId);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {capsules.length === 0 ? (
        <motion.div variants={item}>
          <GlassCard className="p-8 text-center">
            <Award className="h-10 w-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No skill capsules yet</p>
          </GlassCard>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capsules.map((capsule) => (
            <motion.div key={capsule.id} variants={item}>
              <GlassCard className="p-5 hover:border-purple-500/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="rounded-full bg-purple-500/15 px-2.5 py-0.5 text-xs text-purple-300 font-medium">
                      {capsule.skill}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BadgeCheck className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs text-emerald-400">Verified</span>
                  </div>
                </div>
                <h4 className="font-semibold text-white">{capsule.title}</h4>
                <p className="mt-1 text-xs text-gray-400 line-clamp-2">{capsule.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>By {capsule.authorName}</span>
                  <span>{new Date(capsule.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="text-xs font-medium">{capsule.rating}</span>
                  </div>
                  <button
                    onClick={() => handleShare(capsule.id)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-400 hover:bg-white/5 transition-colors"
                  >
                    {copied === capsule.id ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                      </>
                    )}
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Activity Tab ────────────────────────────────────────────
function ActivityTab({ profile }) {
  const sessions = mockSessions.filter(
    (s) => s.teacherId === profile.id || s.learnerId === profile.id
  ).slice(0, 5);

  const achievements = (profile.gamification?.badges || []).map((badgeId) => {
    const info = BADGES.find((b) => b.id === badgeId);
    return info || { id: badgeId, name: badgeId, icon: '🏅', description: '' };
  });

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Recent Sessions */}
      <motion.div variants={item}>
        <h3 className="text-lg font-semibold text-white mb-4">Recent Sessions</h3>
        {sessions.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <CalendarCheck className="h-10 w-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No sessions yet</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const statusStyles = {
                completed: 'bg-emerald-500/15 text-emerald-400',
                in_progress: 'bg-yellow-500/15 text-yellow-400',
                scheduled: 'bg-blue-500/15 text-blue-400',
                cancelled: 'bg-red-500/15 text-red-400',
              };
              return (
                <GlassCard key={session.id} className="p-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{session.skill}</p>
                    <p className="text-xs text-gray-400">
                      with {session.teacherId === profile.id ? session.learnerName : session.teacherName}
                      {' '}&middot;{' '}
                      {new Date(session.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[session.status] || statusStyles.scheduled}`}>
                      {session.status.replace('_', ' ')}
                    </span>
                    {session.rating && (
                      <div className="flex items-center gap-0.5 text-yellow-400">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-xs">{session.rating}</span>
                      </div>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <motion.div variants={item}>
          <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {achievements.map((badge) => (
              <GlassCard key={badge.id} className="p-4 text-center hover:border-yellow-500/30 transition-colors">
                <span className="text-3xl">{badge.icon}</span>
                <p className="mt-2 text-sm font-medium text-white">{badge.name}</p>
                <p className="mt-0.5 text-xs text-gray-500">{badge.description}</p>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── main Profile page ───────────────────────────────────────
export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const currentUser = user || mockUsers[0];

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [capsules, setCapsules] = useState([]);
  const [activeTab, setActiveTab] = useState('about');
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = !id || id === currentUser.id;

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const targetId = id || currentUser.id;
        const [profileRes, reviewsRes, capsulesRes] = await Promise.all([
          userAPI.getProfile(targetId).catch(() => null),
          reviewAPI.getForUser(targetId).catch(() => null),
          capsuleAPI.getForUser(targetId).catch(() => null),
        ]);
        if (!cancelled) {
          if (profileRes?.data?.user) setProfile(profileRes.data.user);
          if (reviewsRes?.data?.reviews) setReviews(reviewsRes.data.reviews);
          if (capsulesRes?.data?.capsules) setCapsules(capsulesRes.data.capsules);
        }
      } catch {
        // fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [id, currentUser.id]);

  // Fallback to mock
  const profileData = profile || (isOwnProfile
    ? currentUser
    : mockUsers.find((u) => u.id === id) || mockUsers[1]);
  const reviewData = reviews.length > 0
    ? reviews
    : mockReviews.filter((r) => r.revieweeId === profileData.id);
  const capsuleData = capsules.length > 0
    ? capsules
    : mockCapsules.filter((c) => c.authorId === profileData.id);

  const levelInfo = getLevelInfo(profileData.gamification?.level || 'silver');
  const trustScore = profileData.trustScore || Math.min(((profileData.rating || 4) / 5) * 100, 100);
  const followers = profileData.followers || 128;
  const following = profileData.following || 45;

  const levelBorderColor = {
    Bronze: 'border-amber-600',
    Silver: 'border-gray-400',
    Gold: 'border-yellow-400',
    Platinum: 'border-cyan-300',
    Legend: 'border-purple-400',
  }[levelInfo.label] || 'border-gray-400';

  async function handleFollow() {
    try {
      await userAPI.followUser(profileData.id);
    } catch {
      // simulated
    }
    setIsFollowing(!isFollowing);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Cover / Header ─────────────────────────── */}
      <div className="relative">
        <div className="h-48 sm:h-56 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end sm:gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={profileData.avatar}
                alt={profileData.name}
                className={`h-28 w-28 sm:h-36 sm:w-36 rounded-full border-4 ${levelBorderColor} bg-gray-900 shadow-xl`}
              />
              {profileData.isOnline && (
                <span className="absolute bottom-2 right-2 h-5 w-5 rounded-full border-3 border-gray-900 bg-emerald-400" />
              )}
              {profileData.isVerified && (
                <span className="absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 shadow-lg">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </span>
              )}
            </div>

            {/* Info */}
            <div className="mt-4 sm:mt-0 sm:pb-2 flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">{profileData.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-sm text-gray-400">
                      <MapPin className="h-3.5 w-3.5" />
                      {profileData.city}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${levelInfo.color} bg-white/10`}>
                      {levelInfo.icon} {levelInfo.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      Member since {new Date(profileData.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                {!isOwnProfile && (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/chat"
                      className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Link>
                    <button
                      onClick={handleFollow}
                      className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                        isFollowing
                          ? 'border border-white/10 bg-white/5 text-gray-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                          : 'bg-blue-600 text-white hover:bg-blue-500'
                      }`}
                    >
                      {isFollowing ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                    <Link
                      to="/discover"
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
                    >
                      <CalendarCheck className="h-4 w-4" />
                      Book Session
                    </Link>
                    <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-gray-400 hover:bg-white/10 transition-colors">
                      <Flag className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5"
          >
            <GlassCard className="p-4 text-center">
              <p className="text-xl font-bold text-white">{profileData.stats?.sessionsCompleted || 0}</p>
              <p className="text-xs text-gray-400">Sessions</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-yellow-400">
                <Star className="h-4 w-4 fill-current" />
                <p className="text-xl font-bold text-white">{profileData.rating || 0}</p>
              </div>
              <p className="text-xs text-gray-400">{profileData.reviewCount || 0} reviews</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <p className="text-xl font-bold text-white">{capsuleData.length}</p>
              <p className="text-xs text-gray-400">Capsules</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <p className="text-xl font-bold text-white">{followers}</p>
              <p className="text-xs text-gray-400">Followers</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <p className="text-xl font-bold text-white">{following}</p>
              <p className="text-xs text-gray-400">Following</p>
            </GlassCard>
          </motion.div>

          {/* Trust Score */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            <GlassCard className="p-4">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span className="text-gray-300 font-medium">Trust Score</span>
                </div>
                <span className="text-emerald-400 font-medium">{Math.round(trustScore)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${trustScore}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </GlassCard>
          </motion.div>

          {/* Tabs */}
          <div className="mt-6 flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'about' && <AboutTab profile={profileData} />}
        {activeTab === 'skills' && <SkillsTab profile={profileData} />}
        {activeTab === 'reviews' && <ReviewsTab reviews={reviewData} profile={profileData} />}
        {activeTab === 'capsules' && <CapsulesTab capsules={capsuleData} />}
        {activeTab === 'activity' && <ActivityTab profile={profileData} />}
      </div>
    </div>
  );
}
