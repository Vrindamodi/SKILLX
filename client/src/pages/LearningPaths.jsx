import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Clock,
  Users,
  Star,
  ChevronRight,
  Lock,
  CheckCircle2,
  Zap,
  Award,
  Loader2,
  X,
  Play,
  Code2,
  BarChart3,
  Globe,
  Palette,
  Calculator,
  IndianRupee,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { learningPathAPI } from '../services/api';
import { mockLearningPaths, mockUsers } from '../data/mockData';

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

// Path icons by skill/category
const PATH_ICONS = {
  Python: Code2,
  React: Globe,
  'Data Science': BarChart3,
  'Graphic Design': Palette,
  Mathematics: Calculator,
};

const DIFFICULTY_BADGE = {
  beginner: 'bg-emerald-500/15 text-emerald-300',
  intermediate: 'bg-yellow-500/15 text-yellow-300',
  advanced: 'bg-red-500/15 text-red-300',
};

// Extended paths for Browse tab
const extendedPaths = [
  ...mockLearningPaths,
  {
    id: 'path4',
    title: 'Graphic Design Pro',
    description: 'Master visual design from logos to full brand identities. Figma, Canva, and Adobe tools.',
    skill: 'Graphic Design',
    category: 'creative',
    totalLevels: 4,
    estimatedHours: 35,
    enrolledCount: 178,
    rating: 4.7,
    difficulty: 'intermediate',
    estimatedCost: 3500,
    levels: [
      { level: 1, title: 'Design Fundamentals', description: 'Color theory, typography, and composition', xpReward: 100, capsuleCount: 4, badge: 'design_basics' },
      { level: 2, title: 'Logo & Branding', description: 'Create professional logos and brand kits', xpReward: 150, capsuleCount: 3, badge: null },
      { level: 3, title: 'UI Design', description: 'Design mobile and web interfaces', xpReward: 200, capsuleCount: 4, badge: 'ui_designer' },
      { level: 4, title: 'Portfolio Project', description: 'Build a complete brand identity project', xpReward: 280, capsuleCount: 3, badge: 'design_pro' },
    ],
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'path5',
    title: 'Mathematics Mastery',
    description: 'From algebra to calculus. Perfect for competitive exam preparation and academic excellence.',
    skill: 'Mathematics',
    category: 'academics',
    totalLevels: 5,
    estimatedHours: 55,
    enrolledCount: 245,
    rating: 4.8,
    difficulty: 'beginner',
    estimatedCost: 5000,
    levels: [
      { level: 1, title: 'Algebra Foundations', description: 'Equations, inequalities, and polynomials', xpReward: 100, capsuleCount: 5, badge: null },
      { level: 2, title: 'Trigonometry', description: 'Trig functions, identities, and applications', xpReward: 140, capsuleCount: 4, badge: 'trig_master' },
      { level: 3, title: 'Calculus I', description: 'Limits, derivatives, and applications', xpReward: 200, capsuleCount: 5, badge: null },
      { level: 4, title: 'Calculus II', description: 'Integration, series, and multivariable basics', xpReward: 250, capsuleCount: 4, badge: 'calc_pro' },
      { level: 5, title: 'Competitive Maths', description: 'JEE/Olympiad level problems and strategies', xpReward: 350, capsuleCount: 3, badge: 'math_legend' },
    ],
    createdAt: '2026-01-08T10:00:00Z',
  },
  {
    id: 'path6',
    title: 'Public Speaking',
    description: 'Conquer stage fright and become a compelling speaker. Presentations, debates, and storytelling.',
    skill: 'Public Speaking',
    category: 'life_skills',
    totalLevels: 3,
    estimatedHours: 20,
    enrolledCount: 132,
    rating: 4.5,
    difficulty: 'beginner',
    estimatedCost: 2000,
    levels: [
      { level: 1, title: 'Overcoming Fear', description: 'Body language, breathing, and confidence building', xpReward: 80, capsuleCount: 3, badge: null },
      { level: 2, title: 'Storytelling', description: 'Structure, hooks, and emotional connection', xpReward: 120, capsuleCount: 3, badge: 'storyteller' },
      { level: 3, title: 'Advanced Techniques', description: 'Debate, impromptu speaking, and persuasion', xpReward: 180, capsuleCount: 4, badge: 'orator' },
    ],
    createdAt: '2026-01-15T12:00:00Z',
  },
];

// Mock enrolled paths with progress
const mockEnrolledPaths = [
  {
    ...mockLearningPaths[0],
    enrolled: true,
    currentLevel: 2,
    progress: 35,
    completedLevels: [1],
    startedAt: '2026-01-20T10:00:00Z',
  },
  {
    ...mockLearningPaths[1],
    enrolled: true,
    currentLevel: 3,
    progress: 55,
    completedLevels: [1, 2],
    startedAt: '2026-01-10T08:00:00Z',
  },
];

// ── Path Card (Browse) ──────────────────────────────────────
function PathCard({ path, onEnroll, onViewDetail }) {
  const Icon = PATH_ICONS[path.skill] || BookOpen;
  const difficulty = path.difficulty || (path.estimatedHours > 50 ? 'advanced' : path.estimatedHours > 30 ? 'intermediate' : 'beginner');

  return (
    <motion.div variants={item}>
      <GlassCard className="group p-5 transition-all hover:border-white/20 hover:shadow-xl cursor-pointer" onClick={() => onViewDetail(path)}>
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15">
            <Icon className="h-6 w-6 text-blue-400" />
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${DIFFICULTY_BADGE[difficulty] || DIFFICULTY_BADGE.beginner}`}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">{path.title}</h3>
        <p className="mt-1 text-sm text-gray-400 line-clamp-2">{path.description}</p>

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{path.totalLevels} levels</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{path.estimatedHours}h</span>
          <span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" />~₹{(path.estimatedCost || path.estimatedHours * 100).toLocaleString()}</span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{path.enrolledCount}</span>
            <span className="flex items-center gap-1 text-yellow-400"><Star className="h-3.5 w-3.5 fill-current" />{path.rating}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onEnroll(path.id); }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-500"
          >
            Enroll
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ── Progress Map ────────────────────────────────────────────
function ProgressMap({ path }) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto py-4 px-2">
      {path.levels.map((level, i) => {
        const isCompleted = path.completedLevels?.includes(level.level);
        const isCurrent = path.currentLevel === level.level;
        const isLocked = !isCompleted && !isCurrent;

        return (
          <div key={level.level} className="flex items-center flex-shrink-0">
            {/* Level circle */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: 'spring' }}
                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                  isCompleted
                    ? 'border-emerald-500 bg-emerald-500/20 shadow-lg shadow-emerald-500/20'
                    : isCurrent
                    ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/30 animate-pulse'
                    : 'border-gray-600 bg-gray-800/50'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : isCurrent ? (
                  <Play className="h-5 w-5 text-blue-400" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-500" />
                )}
              </motion.div>
              <p className={`mt-2 text-xs font-medium text-center max-w-[80px] ${
                isCompleted ? 'text-emerald-300' : isCurrent ? 'text-blue-300' : 'text-gray-500'
              }`}>
                {level.title}
              </p>
              <p className="text-[10px] text-gray-500">{level.xpReward} XP</p>
            </div>
            {/* Connector line */}
            {i < path.levels.length - 1 && (
              <div
                className={`mx-1 h-0.5 w-10 flex-shrink-0 ${
                  isCompleted ? 'bg-emerald-500' : 'bg-gray-700'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Enrolled Path Card ──────────────────────────────────────
function EnrolledPathCard({ path }) {
  const currentLevelData = path.levels.find((l) => l.level === path.currentLevel);
  const Icon = PATH_ICONS[path.skill] || BookOpen;

  return (
    <motion.div variants={item}>
      <GlassCard className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15">
              <Icon className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{path.title}</h3>
              <p className="text-xs text-gray-400">Level {path.currentLevel} of {path.totalLevels}</p>
            </div>
          </div>
          <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-300">
            {path.progress}% complete
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${path.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Progress map */}
        <ProgressMap path={path} />

        {/* Current level details */}
        {currentLevelData && (
          <GlassCard className="mt-4 p-4 border-blue-500/20 bg-blue-500/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Current Level</p>
                <h4 className="mt-1 font-semibold text-white">{currentLevelData.title}</h4>
                <p className="mt-0.5 text-sm text-gray-400">{currentLevelData.description}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-yellow-400" />{currentLevelData.xpReward} XP</span>
                  <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{currentLevelData.capsuleCount} capsules</span>
                </div>
              </div>
              <button className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 flex items-center gap-2">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </GlassCard>
        )}
      </GlassCard>
    </motion.div>
  );
}

// ── Path Detail Modal ───────────────────────────────────────
function PathDetailModal({ path, onClose }) {
  if (!path) return null;
  const Icon = PATH_ICONS[path.skill] || BookOpen;
  const difficulty = path.difficulty || 'beginner';
  const totalXP = path.levels.reduce((acc, l) => acc + l.xpReward, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-gray-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15">
                <Icon className="h-7 w-7 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{path.title}</h2>
                <p className="text-sm text-gray-400">{path.description}</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-2 hover:bg-white/10 transition-colors">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
            {[
              { label: 'Levels', value: path.totalLevels, icon: BookOpen },
              { label: 'Duration', value: `${path.estimatedHours}h`, icon: Clock },
              { label: 'Total XP', value: totalXP, icon: Zap },
              { label: 'Enrolled', value: path.enrolledCount, icon: Users },
            ].map((stat) => (
              <GlassCard key={stat.label} className="p-3 text-center">
                <stat.icon className="mx-auto h-4 w-4 text-blue-400 mb-1" />
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </GlassCard>
            ))}
          </div>

          {/* Difficulty & Rating */}
          <div className="flex items-center gap-3 mb-6">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${DIFFICULTY_BADGE[difficulty]}`}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
            <span className="flex items-center gap-1 text-sm text-yellow-400">
              <Star className="h-4 w-4 fill-current" />{path.rating}
            </span>
            <span className="text-sm text-gray-400">
              Est. earnings after completion: <strong className="text-emerald-400">₹{(path.estimatedHours * 500).toLocaleString()}+</strong>
            </span>
          </div>

          {/* Levels List */}
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Path Levels</h3>
          <div className="space-y-3">
            {path.levels.map((level, i) => (
              <GlassCard key={level.level} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-sm font-bold text-gray-300">
                    {level.level}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white">{level.title}</h4>
                    <p className="mt-0.5 text-sm text-gray-400">{level.description}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-yellow-400" />{level.xpReward} XP</span>
                      <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{level.capsuleCount} capsules</span>
                      {level.badge && (
                        <span className="flex items-center gap-1 text-purple-300"><Award className="h-3 w-3" />{level.badge} badge</span>
                      )}
                    </div>
                    {i > 0 && (
                      <p className="mt-1 text-xs text-gray-500">
                        <Lock className="inline h-3 w-3 mr-1" />Requires Level {level.level - 1} completion
                      </p>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Enroll button */}
          <div className="mt-6 flex gap-3">
            <button className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500">
              Enroll in Path
            </button>
            <button onClick={onClose} className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-gray-400 hover:bg-white/5 transition-colors">
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── main component ──────────────────────────────────────────
export default function LearningPaths() {
  const { user } = useAuth();
  const currentUser = user || mockUsers[0];

  const [tab, setTab] = useState('browse');
  const [paths, setPaths] = useState(extendedPaths);
  const [enrolledPaths, setEnrolledPaths] = useState(mockEnrolledPaths);
  const [loading, setLoading] = useState(true);
  const [detailPath, setDetailPath] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchPaths() {
      setLoading(true);
      try {
        const [allRes, enrolledRes] = await Promise.all([
          learningPathAPI.getAll().catch(() => null),
          learningPathAPI.getEnrolled().catch(() => null),
        ]);
        if (!cancelled) {
          if (allRes?.data?.paths) setPaths(allRes.data.paths);
          if (enrolledRes?.data?.paths) setEnrolledPaths(enrolledRes.data.paths);
        }
      } catch {
        // keep mock data
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPaths();
    return () => { cancelled = true; };
  }, []);

  const handleEnroll = async (pathId) => {
    try {
      await learningPathAPI.enroll(pathId);
    } catch {
      // mock enrollment
      const path = paths.find((p) => p.id === pathId);
      if (path && !enrolledPaths.find((p) => p.id === pathId)) {
        setEnrolledPaths((prev) => [
          ...prev,
          { ...path, enrolled: true, currentLevel: 1, progress: 0, completedLevels: [], startedAt: new Date().toISOString() },
        ]);
        setTab('my');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15">
              <Sparkles className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Learning Paths</h1>
              <p className="text-sm text-gray-400">Structured skill journeys from beginner to pro</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
            {[
              { key: 'browse', label: 'Browse Paths', icon: BookOpen },
              { key: 'my', label: 'My Paths', icon: Play, count: enrolledPaths.length },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
                  tab === t.key
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
                {t.count > 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-xs ${tab === t.key ? 'bg-white/20' : 'bg-white/10'}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {/* Browse Paths */}
            {tab === 'browse' && (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {paths.map((path) => (
                  <PathCard
                    key={path.id}
                    path={path}
                    onEnroll={handleEnroll}
                    onViewDetail={setDetailPath}
                  />
                ))}
              </motion.div>
            )}

            {/* My Paths */}
            {tab === 'my' && (
              <div>
                {enrolledPaths.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5">
                      <BookOpen className="h-10 w-10 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">No paths enrolled yet</h3>
                    <p className="mt-1 text-sm text-gray-400">Browse paths and start your learning journey!</p>
                    <button
                      onClick={() => setTab('browse')}
                      className="mt-4 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
                    >
                      Browse Paths
                    </button>
                  </motion.div>
                ) : (
                  <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
                    {enrolledPaths.map((path) => (
                      <EnrolledPathCard key={path.id} path={path} />
                    ))}
                  </motion.div>
                )}
              </div>
            )}
          </>
        )}

        {/* Path Detail Modal */}
        <AnimatePresence>
          {detailPath && (
            <PathDetailModal path={detailPath} onClose={() => setDetailPath(null)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
