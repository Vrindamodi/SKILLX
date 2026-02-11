import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  MapPin,
  Wifi,
  WifiOff,
  IndianRupee,
  Heart,
  Bookmark,
  MessageSquare,
  Edit3,
  XCircle,
  Clock,
  Eye,
  Send,
  Loader2,
  Check,
  X,
  ChevronRight,
  User,
  Shield,
  AlertCircle,
  CheckCircle2,
  Award,
  Users,
  Calendar,
  Target,
  ThumbsUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MODE_CONFIG } from '../context/ModeContext';
import { postAPI } from '../services/api';
import { mockPosts, mockUsers, mockReviews } from '../data/mockData';
import { LEVELS } from '../utils/constants';

// ── helpers ─────────────────────────────────────────────────
const MODE_COLORS = {
  learn: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/40' },
  teach: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/40' },
  rent: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/40' },
  service: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/40' },
  request: { bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/40' },
};

function GlassCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg ${className}`}>
      {children}
    </div>
  );
}

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      className={`fixed right-4 top-4 z-[100] flex items-center gap-3 rounded-xl border px-5 py-3 shadow-xl backdrop-blur-xl ${
        type === 'success'
          ? 'border-green-500/30 bg-green-900/80 text-green-200'
          : 'border-red-500/30 bg-red-900/80 text-red-200'
      }`}
    >
      {type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 rounded p-0.5 hover:bg-white/10">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

// ── mock responses for author view ──────────────────────────
const mockResponses = [
  { id: 'r1', userId: 'user2', userName: 'Priya Menon', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', rating: 4.9, message: 'I would love to help! I have 6 years of experience and can tailor the sessions to your pace.', status: 'pending' },
  { id: 'r2', userId: 'user4', userName: 'Neha Gupta', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neha', rating: 4.8, message: 'Interested! I can start this weekend. Let me know your preferred timings.', status: 'pending' },
  { id: 'r3', userId: 'user5', userName: 'Rahul Iyer', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul', rating: 4.85, message: 'I can teach this effectively with real-world projects. Happy to do a trial session.', status: 'accepted' },
];

// ── response card ───────────────────────────────────────────
function ResponseCard({ response, isAuthor, onAccept, onReject }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
    >
      <img src={response.userAvatar} alt={response.userName} className="h-10 w-10 rounded-full border border-white/10" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white">{response.userName}</p>
          <span className="flex items-center gap-0.5 text-xs text-yellow-400">
            <Star className="h-3 w-3 fill-current" /> {response.rating}
          </span>
          {response.status === 'accepted' && (
            <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-400">Accepted</span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-400">{response.message}</p>
        {isAuthor && response.status === 'pending' && (
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => onAccept(response.id)}
              className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-500"
            >
              <Check className="h-3 w-3" /> Accept
            </button>
            <button
              onClick={() => onReject(response.id)}
              className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-white/5"
            >
              <X className="h-3 w-3" /> Decline
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── main component ──────────────────────────────────────────
export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showRespond, setShowRespond] = useState(false);
  const [respondMessage, setRespondMessage] = useState('');
  const [responding, setResponding] = useState(false);
  const [responses, setResponses] = useState(mockResponses);
  const [toast, setToast] = useState(null);
  const [similarPosts, setSimilarPosts] = useState([]);

  const isAuthor = user && post && (user.id === post.userId || user._id === post.userId);

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      try {
        const res = await postAPI.getById(id);
        console.log('Fetched post:', res.data.data);
        setPost(res.data.data);
        console.log(post);
      } catch {
        // Fallback to mock
        const found = mockPosts.find((p) => p.id === id);
        if (found) {
          setPost(found);
          const a = mockUsers.find((u) => u.id === found.userId);
          if (a) setAuthor(a);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  // Compute similar posts from mock
  useEffect(() => {
    if (!post) return;
    const similar = mockPosts
      .filter((p) => p.id !== post.id && (p.skill === post.skill || p.category === post.category))
      .slice(0, 3);
    setSimilarPosts(similar);
  }, [post]);

  // Derive author from mock if not set
  useEffect(() => {
    if (post && !author) {
      const a = mockUsers.find((u) => u.id === post.userId);
      if (a) setAuthor(a);
    }
  }, [post, author]);

  async function handleLike() {
    setLiked(!liked);
    try {
      await postAPI.like(id);
    } catch { /* silent */ }
  }

  async function handleBookmark() {
    setBookmarked(!bookmarked);
    try {
      await postAPI.bookmark(id);
    } catch { /* silent */ }
  }

  async function handleRespond(e) {
    e.preventDefault();
    if (!respondMessage.trim()) return;
    setResponding(true);
    try {
      await postAPI.respond(id, { message: respondMessage });
      setToast({ message: 'Response sent successfully!', type: 'success' });
      setShowRespond(false);
      setRespondMessage('');
    } catch {
      setToast({ message: 'Response sent! (Demo mode)', type: 'success' });
      setShowRespond(false);
      setRespondMessage('');
    } finally {
      setResponding(false);
    }
  }

  async function handleAcceptResponse(responseId) {
    try {
      await postAPI.acceptResponse(id, responseId, { action: 'accept' });
    } catch { /* silent */ }
    setResponses((prev) =>
      prev.map((r) => (r.id === responseId ? { ...r, status: 'accepted' } : r))
    );
    setToast({ message: 'Response accepted!', type: 'success' });
  }

  function handleRejectResponse(responseId) {
    setResponses((prev) => prev.filter((r) => r.id !== responseId));
    setToast({ message: 'Response declined.', type: 'success' });
  }

  async function handleClosePost() {
    try {
      await postAPI.close(id);
    } catch { /* silent */ }
    setToast({ message: 'Post closed.', type: 'success' });
    setTimeout(() => navigate('/discover'), 1500);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 text-white">
        <AlertCircle className="mb-4 h-12 w-12 text-gray-600" />
        <h2 className="text-xl font-semibold">Post not found</h2>
        <p className="mt-1 text-sm text-gray-400">This post may have been removed or doesn't exist.</p>
        <button
          onClick={() => navigate('/discover')}
          className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
        >
          Back to Discover
        </button>
      </div>
    );
  }

  const mc = MODE_COLORS[post.mode] || MODE_COLORS.learn;
  const levelInfo = author?.gamification?.level ? LEVELS[author.gamification.level] : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AnimatePresence>{toast && <Toast {...toast} onClose={() => setToast(null)} />}</AnimatePresence>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Back */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
          {/* ── Main content ───────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Post card */}
            <GlassCard className="relative overflow-hidden p-6">
              <div
                className="absolute left-0 top-0 h-full w-1.5 rounded-l-2xl"
                style={{ backgroundColor: MODE_CONFIG[post.mode]?.color || '#6366f1' }}
              />

              {/* Mode + Skill badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`rounded-full ${mc.bg} ${mc.text} px-3 py-1 text-xs font-semibold`}>
                  {MODE_CONFIG[post.mode]?.icon} {MODE_CONFIG[post.mode]?.label}
                </span>
                <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-gray-300">
                  {post.skill}
                </span>
                {post.isRemote ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs text-emerald-400">
                    <Wifi className="h-3 w-3" /> Online
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-gray-500/15 px-2.5 py-1 text-xs text-gray-400">
                    <WifiOff className="h-3 w-3" /> In-person
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-white">{post.title}</h1>
              <p className="mt-3 text-sm leading-relaxed text-gray-300">{post.description}</p>

              {/* Details grid */}
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-lg font-bold text-white">
                    <IndianRupee className="h-4 w-4" />
                    {post.pricing.amount}
                  </div>
                  <p className="text-xs text-gray-500">
                    {post.budgetType === 'per_hour' ? 'per hour' : post.budgetType === 'per_session' ? 'per session' : 'fixed'}
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-lg font-bold text-white">
                    <MessageSquare className="h-4 w-4 text-blue-400" />
                    {post.responses.length}
                  </div>
                  <p className="text-xs text-gray-500">responses</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-lg font-bold text-white">
                    <Eye className="h-4 w-4 text-purple-400" />
                    {post.views}
                  </div>
                  <p className="text-xs text-gray-500">views</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-lg font-bold text-white">
                    <MapPin className="h-4 w-4 text-orange-400" />
                  </div>
                  <p className="text-xs mt-2 text-gray-500">{post.author.city}</p>
                </div>
              </div>

              {/* Date */}
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="h-3.5 w-3.5" />
                Posted {new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </GlassCard>

            {/* ── Action buttons ─────────────────────── */}
            <GlassCard className="p-5">
              {isAuthor ? (
                <div className="flex flex-wrap gap-3">
                  <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500">
                    <Edit3 className="h-4 w-4" /> Edit Post
                  </button>
                  <button
                    onClick={handleClosePost}
                    className="flex items-center gap-2 rounded-xl border border-red-500/30 px-5 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <XCircle className="h-4 w-4" /> Close Post
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowRespond(!showRespond)}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                  >
                    <ThumbsUp className="h-4 w-4" /> I'm Interested
                  </button>
                  <Link
                    to="/chat"
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10"
                  >
                    <MessageSquare className="h-4 w-4" /> Message
                  </Link>
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                      liked
                        ? 'border-red-500/30 bg-red-500/10 text-red-400'
                        : 'border-white/10 text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                    {liked ? 'Liked' : 'Like'}
                  </button>
                  <button
                    onClick={handleBookmark}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                      bookmarked
                        ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                        : 'border-white/10 text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
                    {bookmarked ? 'Saved' : 'Save'}
                  </button>
                </div>
              )}
            </GlassCard>

            {/* ── Respond form ───────────────────────── */}
            <AnimatePresence>
              {showRespond && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <GlassCard className="p-5">
                    <h3 className="mb-3 text-sm font-semibold text-white">Send your interest</h3>
                    <form onSubmit={handleRespond}>
                      <textarea
                        value={respondMessage}
                        onChange={(e) => setRespondMessage(e.target.value)}
                        placeholder="Introduce yourself and explain why you're a good match..."
                        rows={3}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500/50 resize-none"
                      />
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowRespond(false)}
                          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-400 hover:bg-white/5"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!respondMessage.trim() || responding}
                          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-blue-500"
                        >
                          {responding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          Send
                        </button>
                      </div>
                    </form>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Responses (author only) ─────────────── */}
            {isAuthor && (
              <GlassCard className="p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                  <Users className="h-4 w-4 text-blue-400" /> Responses ({responses.length})
                </h3>
                <div className="space-y-3">
                  {responses.map((r) => (
                    <ResponseCard
                      key={r.id}
                      response={r}
                      isAuthor
                      onAccept={handleAcceptResponse}
                      onReject={handleRejectResponse}
                    />
                  ))}
                </div>
              </GlassCard>
            )}

            {/* ── Similar posts ──────────────────────── */}
            {similarPosts.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-white">Similar Posts</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {similarPosts.map((sp) => {
                    const smc = MODE_COLORS[sp.mode] || MODE_COLORS.learn;
                    return (
                      <Link key={sp.id} to={`/posts/${sp.id}`}>
                        <GlassCard className="group p-4 transition-all hover:border-white/20">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`rounded-full ${smc.bg} ${smc.text} px-2 py-0.5 text-xs font-medium`}>
                              {MODE_CONFIG[sp.mode]?.label}
                            </span>
                            <span className="text-xs text-gray-500">{sp.skill}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-blue-300 transition-colors">
                            {sp.title}
                          </h4>
                          <p className="mt-1 text-xs text-gray-400 line-clamp-2">{sp.description}</p>
                          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-1 font-semibold text-white">
                              <IndianRupee className="h-3 w-3" />{sp.budget}
                            </span>
                            <span className="flex items-center gap-1">
                              {sp.userName} <ChevronRight className="h-3 w-3" />
                            </span>
                          </div>
                        </GlassCard>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* ── Sidebar — Author card ─────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            <div className="sticky top-8 space-y-4">
              {/* Author profile */}
              <GlassCard className="p-5">
                <div className="flex flex-col items-center text-center">
                  <img
                    src={author?.avatar || post.userAvatar}
                    alt={author?.name || post.userName}
                    className="h-20 w-20 rounded-full border-2 border-white/10"
                  />
                  <h3 className="mt-3 text-base font-semibold text-white">{author?.name || post.userName}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                    <MapPin className="h-3 w-3" /> {author?.city || post.city}
                  </div>

                  {/* Rating */}
                  {author?.rating && (
                    <div className="mt-2 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-white">{author.rating}</span>
                      <span className="text-xs text-gray-500">({author.reviewCount} reviews)</span>
                    </div>
                  )}

                  {/* Level */}
                  {levelInfo && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-lg">{levelInfo.icon}</span>
                      <span className={`text-sm font-semibold ${levelInfo.color}`}>{levelInfo.label}</span>
                    </div>
                  )}

                  {/* Badges */}
                  {author?.gamification?.badges && (
                    <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                      {author.gamification.badges.slice(0, 6).map((badge) => (
                        <span key={badge} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">
                          {badge.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  {author?.stats && (
                    <div className="mt-4 grid w-full grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/[0.03] p-2 text-center">
                        <p className="text-sm font-bold text-white">{author.stats.sessionsCompleted}</p>
                        <p className="text-xs text-gray-500">Sessions</p>
                      </div>
                      <div className="rounded-lg bg-white/[0.03] p-2 text-center">
                        <p className="text-sm font-bold text-white">{author.stats.hoursTaught + author.stats.hoursLearned}h</p>
                        <p className="text-xs text-gray-500">Hours</p>
                      </div>
                    </div>
                  )}

                  {author?.isVerified && (
                    <div className="mt-3 flex items-center gap-1 text-xs text-emerald-400">
                      <Shield className="h-3.5 w-3.5" /> Verified Profile
                    </div>
                  )}

                  {!isAuthor && (
                    <Link
                      to={`/profile/${author?.id || post.userId}`}
                      className="mt-4 block w-full rounded-xl border border-white/10 py-2 text-center text-sm font-medium text-gray-300 transition-colors hover:bg-white/5"
                    >
                      View Full Profile
                    </Link>
                  )}
                </div>
              </GlassCard>

              {/* Quick stats */}
              <GlassCard className="p-4">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Post Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Status</span>
                    <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-400">
                      {post.status || 'Active'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Category</span>
                    <span className="text-white capitalize">{post.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Delivery</span>
                    <span className="text-white">{post.isRemote ? 'Online' : 'In-person'}</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
