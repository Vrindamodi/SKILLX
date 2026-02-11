import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Users,
  BookHeart,
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Plus,
  X,
  Search,
  Star,
  Clock,
  CheckCircle2,
  Send,
  Loader2,
  ChevronRight,
  ArrowLeft,
  Tag,
  TrendingUp,
  Heart,
  Eye,
  Award,
  Sparkles,
  IndianRupee,
  Filter,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockUsers } from '../data/mockData';
import { SKILL_CATEGORIES } from '../utils/constants';

// ── animations ──────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
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

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

// ── Mock Data ───────────────────────────────────────────────
const mockDiscussions = [
  { id: 'd1', title: 'Best way to learn React hooks?', author: mockUsers[0], category: 'React', tags: ['hooks', 'beginner'], replies: 12, upvotes: 34, createdAt: '2026-02-09T14:00:00Z', resolved: false },
  { id: 'd2', title: 'Python vs JavaScript for beginners — what should I pick?', author: mockUsers[1], category: 'Python', tags: ['comparison', 'career'], replies: 28, upvotes: 67, createdAt: '2026-02-08T10:30:00Z', resolved: true },
  { id: 'd3', title: 'Tips for pricing your teaching sessions', author: mockUsers[3], category: 'General', tags: ['pricing', 'teaching'], replies: 9, upvotes: 22, createdAt: '2026-02-07T16:15:00Z', resolved: false },
  { id: 'd4', title: 'How to build a design portfolio from scratch', author: mockUsers[3], category: 'Graphic Design', tags: ['portfolio', 'career'], replies: 15, upvotes: 41, createdAt: '2026-02-06T09:00:00Z', resolved: false },
  { id: 'd5', title: 'Cooking session etiquette — offline meetup tips', author: mockUsers[5], category: 'Cooking', tags: ['offline', 'tips'], replies: 7, upvotes: 18, createdAt: '2026-02-05T12:45:00Z', resolved: true },
  { id: 'd6', title: 'Is Data Science still worth learning in 2026?', author: mockUsers[2], category: 'Data Science', tags: ['career', 'trends'], replies: 31, upvotes: 89, createdAt: '2026-02-04T08:00:00Z', resolved: false },
];

const mockReplies = [
  { id: 'r1', author: mockUsers[1], content: 'Start with useState and useEffect. Build small projects — a counter, a todo app, a weather app. That progression worked great for me.', upvotes: 12, downvotes: 0, createdAt: '2026-02-09T15:00:00Z' },
  { id: 'r2', author: mockUsers[4], content: 'I recommend the official React docs — they have an excellent interactive tutorial now. Also, Priya\'s sessions on this are fantastic!', upvotes: 8, downvotes: 1, createdAt: '2026-02-09T16:30:00Z' },
  { id: 'r3', author: mockUsers[3], content: 'Don\'t skip useContext and useReducer. They\'re less common in tutorials but super important for real apps.', upvotes: 5, downvotes: 0, createdAt: '2026-02-09T18:00:00Z' },
];

const mockGroups = [
  { id: 'g1', name: 'Python Developers', members: 342, activity: 'Very Active', skill: 'Python', description: 'Share Python tips, projects, and resources', avatar: '🐍' },
  { id: 'g2', name: 'Web Dev Community', members: 518, activity: 'Very Active', skill: 'React', description: 'Everything web — HTML, CSS, JS, React, Node.js', avatar: '🌐' },
  { id: 'g3', name: 'Design Hub', members: 224, activity: 'Active', skill: 'Graphic Design', description: 'UI/UX, graphic design, and creative tools', avatar: '🎨' },
  { id: 'g4', name: 'Data Science Club', members: 187, activity: 'Active', skill: 'Data Science', description: 'ML, AI, data analysis, and analytics', avatar: '📊' },
  { id: 'g5', name: 'Teachers Lounge', members: 156, activity: 'Moderate', skill: 'General', description: 'Tips and strategies for effective teaching', avatar: '📚' },
  { id: 'g6', name: 'Hyderabadi Foodies', members: 98, activity: 'Active', skill: 'Cooking', description: 'Recipe sharing, cooking tips, and food meetups', avatar: '🍛' },
];

const mockStories = [
  {
    id: 's1',
    title: 'From Zero to Web Dev in 6 Weeks',
    author: mockUsers[0],
    preview: 'I had no coding experience when I joined Skill-X. With Priya as my mentor and the Web Dev learning path, I built my first React app...',
    readTime: 5,
    likes: 124,
    createdAt: '2026-02-05T10:00:00Z',
    beforeStats: { skills: 0, sessions: 0, earnings: 0 },
    afterStats: { skills: 3, sessions: 24, earnings: 2400 },
    content: 'I had no coding experience when I joined Skill-X. I was working in retail and wanted a career change. A friend recommended Skill-X and I signed up thinking "what\'s the worst that can happen?"\n\nI enrolled in the Web Dev learning path and was matched with Priya Menon as my teacher. She was incredibly patient and structured. We had 3 sessions per week, each focused on a specific topic.\n\nWeek 1-2: HTML & CSS basics. I built a personal portfolio site.\nWeek 3: JavaScript fundamentals. Functions, arrays, and DOM manipulation.\nWeek 4-5: React components and hooks. This is where things clicked.\nWeek 6: My capstone project — a recipe sharing app.\n\nToday, I\'m freelancing part-time and have earned ₹15,000 through Skill-X itself. The investment in learning paid for itself 10x over.\n\nMy tips: Be consistent, don\'t skip sessions, and practice every day — even if just 30 minutes.',
    tips: ['Be consistent with daily practice', 'Don\'t skip sessions', 'Build projects, not just tutorials', 'Join the community groups'],
  },
  {
    id: 's2',
    title: 'How I Started Teaching and Earned ₹50,000 in 3 Months',
    author: mockUsers[1],
    preview: 'I\'ve been a developer for 6 years but never considered teaching. When I discovered Skill-X, I posted my first teaching listing as an experiment...',
    readTime: 7,
    likes: 89,
    createdAt: '2026-02-01T14:00:00Z',
    beforeStats: { skills: 6, sessions: 0, earnings: 0 },
    afterStats: { skills: 6, sessions: 112, earnings: 50000 },
    content: 'Teaching wasn\'t on my radar until I found Skill-X. I was a senior dev at a startup and a friend suggested I try teaching on the side. My first session was a nervous mess — but the student\'s feedback was overwhelmingly positive.\n\nThree months later, I\'ve conducted 112 sessions, earned ₹50,000+, and discovered a genuine passion for mentoring. The platform\'s structured approach — learning paths, capsules, and reviews — makes it easy to deliver value consistently.',
    tips: ['Start with what you know best', 'Be patient with beginners', 'Create structured lesson plans', 'Collect reviews actively'],
  },
  {
    id: 's3',
    title: 'Cooking Classes Changed My Life',
    author: mockUsers[5],
    preview: 'As a professional chef, I was skeptical about online cooking classes. But Skill-X\'s local service model let me offer in-person sessions...',
    readTime: 4,
    likes: 67,
    createdAt: '2026-01-28T09:00:00Z',
    beforeStats: { skills: 4, sessions: 0, earnings: 0 },
    afterStats: { skills: 4, sessions: 55, earnings: 9800 },
    content: 'I\'m a professional chef specializing in Hyderabadi cuisine. When I heard about Skill-X, I thought it was just for tech people. But the local services feature was perfect for me.\n\nI started offering private cooking classes and meal prep services. The demand was incredible — people love learning to cook authentic biryani! I\'m now learning JavaScript on the side because I want to build my own recipe website.',
    tips: ['Local services have huge demand', 'Photos of your work boost bookings', 'Offer different session durations', 'Personal touch matters'],
  },
];

const mockMentors = [
  { id: 'm1', ...mockUsers[1], expertise: ['JavaScript', 'React', 'Node.js'], experience: '6 years', hourlyRate: 800, mentees: 15 },
  { id: 'm2', ...mockUsers[4], expertise: ['Mathematics', 'Statistics', 'Economics'], experience: '5 years', hourlyRate: 700, mentees: 10 },
  { id: 'm3', ...mockUsers[3], expertise: ['Graphic Design', 'UI/UX Design'], experience: '4 years', hourlyRate: 600, mentees: 8 },
  { id: 'm4', ...mockUsers[2], expertise: ['Leadership', 'Public Speaking'], experience: '8 years', hourlyRate: 900, mentees: 5 },
];

// ── TABS ────────────────────────────────────────────────────
const TABS = [
  { key: 'discussions', label: 'Discussions', icon: MessageCircle },
  { key: 'groups', label: 'Groups', icon: Users },
  { key: 'stories', label: 'Success Stories', icon: BookHeart },
  { key: 'mentorship', label: 'Mentorship', icon: UserCheck },
];

// ── Discussions Tab ─────────────────────────────────────────
function DiscussionsTab() {
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [replyText, setReplyText] = useState('');

  const allCategories = ['General', ...SKILL_CATEGORIES.flatMap((c) => c.skills).slice(0, 10)];
  const filtered = categoryFilter
    ? mockDiscussions.filter((d) => d.category === categoryFilter)
    : mockDiscussions;

  if (selectedDiscussion) {
    const disc = mockDiscussions.find((d) => d.id === selectedDiscussion);
    if (!disc) return null;
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <button
          onClick={() => setSelectedDiscussion(null)}
          className="mb-4 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Discussions
        </button>
        <GlassCard className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <img src={disc.author.avatar} alt={disc.author.name} className="h-10 w-10 rounded-full border border-white/10" />
            <div>
              <h2 className="text-lg font-semibold text-white">{disc.title}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{disc.author.name}</span>
                <span>&middot;</span>
                <span>{timeAgo(disc.createdAt)}</span>
                {disc.resolved && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />Resolved
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mb-6">
            <span className="rounded-full bg-blue-500/15 px-3 py-0.5 text-xs text-blue-300">{disc.category}</span>
            {disc.tags.map((t) => (
              <span key={t} className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-gray-400">#{t}</span>
            ))}
          </div>
          {/* Replies */}
          <div className="space-y-4 mb-6">
            {mockReplies.map((reply) => (
              <GlassCard key={reply.id} className="p-4">
                <div className="flex items-start gap-3">
                  <img src={reply.author.avatar} alt={reply.author.name} className="h-8 w-8 rounded-full border border-white/10" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="font-medium text-white">{reply.author.name}</span>
                      <span>{timeAgo(reply.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-300">{reply.content}</p>
                    <div className="mt-2 flex items-center gap-4">
                      <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-400 transition-colors">
                        <ThumbsUp className="h-3.5 w-3.5" />{reply.upvotes}
                      </button>
                      <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors">
                        <ThumbsDown className="h-3.5 w-3.5" />{reply.downvotes}
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
          {/* Reply form */}
          <div className="flex gap-3">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50"
            />
            <button className="rounded-xl bg-blue-600 px-4 py-3 text-white hover:bg-blue-500 transition-colors">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Header with filter and new button */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white outline-none focus:border-blue-500/50"
          >
            <option value="">All Categories</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4" />New Discussion
        </button>
      </div>

      {/* New discussion form */}
      <AnimatePresence>
        {showNewForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">New Discussion</h3>
                <button onClick={() => setShowNewForm(false)} className="text-gray-500 hover:text-white"><X className="h-4 w-4" /></button>
              </div>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Discussion title..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50 mb-3"
              />
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="What do you want to discuss?"
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50 resize-none mb-3"
              />
              <div className="flex gap-3">
                <select className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none">
                  <option>Select category</option>
                  {allCategories.map((c) => <option key={c}>{c}</option>)}
                </select>
                <input placeholder="Tags (comma separated)" className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600" />
                <button className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500">Post</button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discussion list */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        {filtered.map((disc) => (
          <motion.div key={disc.id} variants={item}>
            <GlassCard
              className="p-4 cursor-pointer transition-all hover:border-white/20"
              onClick={() => setSelectedDiscussion(disc.id)}
            >
              <div className="flex items-start gap-3">
                <img src={disc.author.avatar} alt={disc.author.name} className="h-9 w-9 rounded-full border border-white/10 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white truncate">{disc.title}</h3>
                    {disc.resolved && <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>{disc.author.name}</span>
                    <span>&middot;</span>
                    <span>{timeAgo(disc.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs text-blue-300">{disc.category}</span>
                    {disc.tags.map((t) => (
                      <span key={t} className="text-xs text-gray-500">#{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{disc.upvotes}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{disc.replies}</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// ── Groups Tab ──────────────────────────────────────────────
function GroupsTab() {
  const [joinedGroups, setJoinedGroups] = useState(['g1', 'g2']);

  const activityColors = {
    'Very Active': 'text-emerald-400',
    Active: 'text-blue-400',
    Moderate: 'text-yellow-400',
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {mockGroups.map((group) => {
        const joined = joinedGroups.includes(group.id);
        return (
          <motion.div key={group.id} variants={item}>
            <GlassCard className="p-5 transition-all hover:border-white/20">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl">
                  {group.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{group.name}</h3>
                  <p className="text-xs text-gray-400">{group.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{group.members} members</span>
                <span className={activityColors[group.activity] || 'text-gray-400'}>{group.activity}</span>
              </div>
              <button
                onClick={() => setJoinedGroups((prev) => joined ? prev.filter((id) => id !== group.id) : [...prev, group.id])}
                className={`w-full rounded-xl py-2 text-sm font-medium transition-colors ${
                  joined
                    ? 'border border-white/10 text-gray-400 hover:bg-white/5'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                {joined ? 'Leave Group' : 'Join Group'}
              </button>
            </GlassCard>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ── Stories Tab ──────────────────────────────────────────────
function StoriesTab() {
  const [selectedStory, setSelectedStory] = useState(null);
  const [showShareForm, setShowShareForm] = useState(false);

  if (selectedStory) {
    const story = mockStories.find((s) => s.id === selectedStory);
    if (!story) return null;
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <button
          onClick={() => setSelectedStory(null)}
          className="mb-4 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Stories
        </button>
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <img src={story.author.avatar} alt={story.author.name} className="h-12 w-12 rounded-full border border-white/10" />
            <div>
              <p className="font-semibold text-white">{story.author.name}</p>
              <p className="text-xs text-gray-400">{story.author.city} &middot; {story.readTime} min read</p>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-4">{story.title}</h2>

          {/* Before/After Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <GlassCard className="p-4 border-red-500/20 bg-red-500/5">
              <p className="text-xs font-semibold uppercase text-gray-500 mb-2">Before Skill-X</p>
              <div className="space-y-1 text-sm text-gray-400">
                <p>Skills: {story.beforeStats.skills}</p>
                <p>Sessions: {story.beforeStats.sessions}</p>
                <p>Earnings: ₹{story.beforeStats.earnings}</p>
              </div>
            </GlassCard>
            <GlassCard className="p-4 border-emerald-500/20 bg-emerald-500/5">
              <p className="text-xs font-semibold uppercase text-gray-500 mb-2">After Skill-X</p>
              <div className="space-y-1 text-sm text-emerald-300">
                <p>Skills: {story.afterStats.skills}</p>
                <p>Sessions: {story.afterStats.sessions}</p>
                <p>Earnings: ₹{story.afterStats.earnings.toLocaleString()}</p>
              </div>
            </GlassCard>
          </div>

          <div className="prose prose-invert max-w-none text-sm text-gray-300 whitespace-pre-line mb-6">
            {story.content}
          </div>

          {/* Tips */}
          {story.tips && (
            <GlassCard className="p-4 border-yellow-500/20 bg-yellow-500/5 mb-6">
              <p className="text-xs font-semibold uppercase text-yellow-400 mb-2">Tips from {story.author.name.split(' ')[0]}</p>
              <ul className="space-y-1">
                {story.tips.map((tip, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <Sparkles className="h-3 w-3 text-yellow-400 flex-shrink-0" />{tip}
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors">
              <Heart className="h-4 w-4" />{story.likes} likes
            </button>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{mockStories.length} success stories</p>
        <button
          onClick={() => setShowShareForm(!showShareForm)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4" />Share Your Story
        </button>
      </div>

      <AnimatePresence>
        {showShareForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Share Your Story</h3>
                <button onClick={() => setShowShareForm(false)}><X className="h-4 w-4 text-gray-500" /></button>
              </div>
              <input placeholder="Story title..." className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50 mb-3" />
              <textarea placeholder="Tell us your journey..." rows={6} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50 resize-none mb-3" />
              <button className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500">Submit Story</button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockStories.map((story) => (
          <motion.div key={story.id} variants={item}>
            <GlassCard
              className="p-5 cursor-pointer transition-all hover:border-white/20"
              onClick={() => setSelectedStory(story.id)}
            >
              <div className="flex items-center gap-3 mb-3">
                <img src={story.author.avatar} alt={story.author.name} className="h-10 w-10 rounded-full border border-white/10" />
                <div>
                  <p className="text-sm font-medium text-white">{story.author.name}</p>
                  <p className="text-xs text-gray-500">{story.author.city}</p>
                </div>
              </div>
              <h3 className="font-semibold text-white mb-2">{story.title}</h3>
              <p className="text-sm text-gray-400 line-clamp-3">{story.preview}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{story.readTime} min read</span>
                <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{story.likes}</span>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// ── Mentorship Tab ──────────────────────────────────────────
function MentorshipTab() {
  const [skillFilter, setSkillFilter] = useState('');
  const allSkills = SKILL_CATEGORIES.flatMap((c) => c.skills);

  const filtered = skillFilter
    ? mockMentors.filter((m) => m.expertise.includes(skillFilter))
    : mockMentors;

  return (
    <div>
      {/* Find a Mentor */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Search className="h-4 w-4 text-gray-500" />
        <select
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50"
        >
          <option value="">All Skills</option>
          {allSkills.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2">
        {filtered.map((mentor) => (
          <motion.div key={mentor.id} variants={item}>
            <GlassCard className="p-5 transition-all hover:border-white/20">
              <div className="flex items-start gap-3 mb-3">
                <img src={mentor.avatar} alt={mentor.name} className="h-12 w-12 rounded-full border border-white/10" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{mentor.name}</p>
                  <p className="text-xs text-gray-400">{mentor.city} &middot; {mentor.experience} experience</p>
                </div>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium">{mentor.rating}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {mentor.expertise.map((s) => (
                  <span key={s} className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs text-blue-300">{s}</span>
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{mentor.mentees} mentees</span>
                <span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" />₹{mentor.hourlyRate}/hr</span>
                <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" />{mentor.reviewCount} reviews</span>
              </div>
              <button className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors">
                Request Mentorship
              </button>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* My Mentorships */}
      <div className="mt-10">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">My Mentorships</h3>
        <GlassCard className="flex items-center justify-center p-10 text-center">
          <div>
            <UserCheck className="mx-auto h-10 w-10 text-gray-600 mb-2" />
            <p className="text-gray-400">No active mentorships yet</p>
            <p className="text-xs text-gray-500 mt-1">Request a mentor above to get started</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ── main component ──────────────────────────────────────────
export default function Community() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('discussions');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Community</h1>
              <p className="text-sm text-gray-400">Connect, discuss, and grow with the Skill-X community</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {activeTab === 'discussions' && <DiscussionsTab />}
            {activeTab === 'groups' && <GroupsTab />}
            {activeTab === 'stories' && <StoriesTab />}
            {activeTab === 'mentorship' && <MentorshipTab />}
          </>
        )}
      </div>
    </div>
  );
}
