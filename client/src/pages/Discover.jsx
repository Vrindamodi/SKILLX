import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  X,
  Star,
  Eye,
  MessageSquare,
  MapPin,
  IndianRupee,
  ChevronDown,
  ChevronRight,
  Wifi,
  WifiOff,
  ArrowUpDown,
  Heart,
  Loader2,
  PackageOpen,
  TrendingUp,
  Filter,
} from 'lucide-react';
import { useMode, MODE_CONFIG } from '../context/ModeContext';
import { postAPI } from '../services/api';
import { mockPosts } from '../data/mockData';
import { SKILL_CATEGORIES, INDIAN_CITIES } from '../utils/constants';

// ── animation variants ──────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};
const slideIn = {
  hidden: { x: -280, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 28 } },
  exit: { x: -280, opacity: 0, transition: { duration: 0.2 } },
};

// ── helpers ─────────────────────────────────────────────────
const MODE_COLORS = {
  learn: { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30' },
  teach: { bg: 'bg-green-500/15', text: 'text-green-300', border: 'border-green-500/30' },
  rent: { bg: 'bg-orange-500/15', text: 'text-orange-300', border: 'border-orange-500/30' },
  service: { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30' },
  request: { bg: 'bg-red-500/15', text: 'text-red-300', border: 'border-red-500/30' },
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

// ── trending skill tag ──────────────────────────────────────
function SkillTag({ name, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
        active
          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
          : 'border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      {name}
    </button>
  );
}

// ── post card ───────────────────────────────────────────────
function PostCard({ post }) {
  const modeStyle = MODE_COLORS[post.mode] || MODE_COLORS.learn;
  const modeLabel = MODE_CONFIG[post.mode]?.label || post.mode;
  const [liked, setLiked] = useState(false);

  return (
    <motion.div variants={item}>
      <GlassCard
        className={`group relative overflow-hidden p-5 transition-all hover:border-white/20 hover:shadow-xl`}
      >
        {/* Mode accent stripe */}
        <div
          className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
          style={{ backgroundColor: MODE_CONFIG[post.mode]?.color || '#6366f1' }}
        />

        {/* Author row */}
        <div className="flex items-center gap-3">
          <img
            src={post.userAvatar}
            alt={post.userName}
            className="h-10 w-10 rounded-full border border-white/10"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{post.userName}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                {post.city}
              </span>
              {post.isRemote && (
                <span className="flex items-center gap-0.5 text-emerald-400">
                  <Wifi className="h-3 w-3" /> Online
                </span>
              )}
            </div>
          </div>
          <span className={`rounded-full ${modeStyle.bg} px-2.5 py-0.5 text-xs font-medium ${modeStyle.text}`}>
            {modeLabel}
          </span>
        </div>

        {/* Content */}
        <div className="mt-3">
          <div className="flex items-start gap-2">
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-gray-300">
              {post.skill}
            </span>
          </div>
          <h3 className="mt-2 font-semibold text-white line-clamp-1 group-hover:text-blue-300 transition-colors">
            {post.title}
          </h3>
          <p className="mt-1 text-sm text-gray-400 line-clamp-2">{post.description}</p>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1 font-semibold text-white text-sm">
              <IndianRupee className="h-3.5 w-3.5" />
              {post.budget}
              <span className="font-normal text-gray-500">
                /{post.budgetType === 'per_hour' ? 'hr' : post.budgetType === 'per_session' ? 'session' : 'fixed'}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {post.responses}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {post.views}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLiked(!liked)}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
            >
              <Heart
                className={`h-4 w-4 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
              />
            </button>
            <Link
              to={`/posts/${post.id}`}
              className="rounded-lg bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
            >
              Respond
            </Link>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ── filter panel ────────────────────────────────────────────
function FilterPanel({ filters, setFilters, onClose }) {
  const allSkills = SKILL_CATEGORIES.flatMap((c) => c.skills);

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setFilters({
      category: '',
      mode: '',
      priceMin: '',
      priceMax: '',
      isRemote: null,
      city: '',
      minRating: '',
      sort: 'relevance',
    });
  }

  const activeCount = Object.values(filters).filter(
    (v) => v !== '' && v !== null && v !== 'relevance'
  ).length;

  return (
    <motion.div
      variants={slideIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto border-r border-white/10 bg-gray-950/95 backdrop-blur-xl lg:sticky lg:top-0 lg:z-auto lg:h-[calc(100vh-2rem)] lg:rounded-2xl lg:border"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Filters</h2>
            {activeCount > 0 && (
              <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-medium text-white">
                {activeCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/10 lg:hidden">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Category */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition-colors"
            >
              <option value="">All Categories</option>
              {SKILL_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Filter */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(MODE_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => updateFilter('mode', filters.mode === key ? '' : key)}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                    filters.mode === key
                      ? `${MODE_COLORS[key].bg} ${MODE_COLORS[key].text} ${MODE_COLORS[key].border}`
                      : 'border-white/10 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Price Range (₹)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceMin}
                onChange={(e) => updateFilter('priceMin', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50"
              />
              <span className="text-gray-600">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceMax}
                onChange={(e) => updateFilter('priceMax', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50"
              />
            </div>
          </div>

          {/* Online / Offline */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Delivery
            </label>
            <div className="flex gap-2">
              {[
                { label: 'All', value: null },
                { label: 'Online', value: true, icon: Wifi },
                { label: 'Offline', value: false, icon: WifiOff },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => updateFilter('isRemote', opt.value)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                    filters.isRemote === opt.value
                      ? 'border-blue-500/30 bg-blue-500/15 text-blue-300'
                      : 'border-white/10 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  {opt.icon && <opt.icon className="h-3 w-3" />}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              City
            </label>
            <select
              value={filters.city}
              onChange={(e) => updateFilter('city', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition-colors"
            >
              <option value="">All Cities</option>
              {INDIAN_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Minimum Rating
            </label>
            <div className="flex gap-1.5">
              {[0, 3, 3.5, 4, 4.5].map((r) => (
                <button
                  key={r}
                  onClick={() => updateFilter('minRating', filters.minRating === r ? '' : r)}
                  className={`flex items-center gap-0.5 rounded-lg border px-2.5 py-1.5 text-xs transition-all ${
                    filters.minRating === r
                      ? 'border-yellow-500/30 bg-yellow-500/15 text-yellow-300'
                      : 'border-white/10 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  {r === 0 ? (
                    'Any'
                  ) : (
                    <>
                      <Star className="h-3 w-3 fill-current" />
                      {r}+
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Sort by
            </label>
            <select
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition-colors"
            >
              <option value="relevance">Relevance</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Rating</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={clearFilters}
              className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 lg:hidden"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── empty state ─────────────────────────────────────────────
function EmptyState({ query }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5">
        <PackageOpen className="h-10 w-10 text-gray-600" />
      </div>
      <h3 className="text-lg font-semibold text-white">No results found</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-400">
        {query
          ? `Nothing matched "${query}". Try different keywords or adjust your filters.`
          : 'Try adjusting your filters or search for something else.'}
      </p>
    </motion.div>
  );
}

// ── main discover page ──────────────────────────────────────
export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentMode } = useMode();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState(searchParams.get('skill') || '');
  const postsPerPage = 6;

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    mode: searchParams.get('mode') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    isRemote: searchParams.get('isRemote') === 'true' ? true : searchParams.get('isRemote') === 'false' ? false : null,
    city: searchParams.get('city') || '',
    minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : '',
    sort: searchParams.get('sort') || 'relevance',
  });

  // Trending skills for quick filter tags
  const trendingSkills = ['React', 'Python', 'UI/UX Design', 'Data Science', 'JavaScript', 'Cooking', 'Mathematics', 'Photography', 'Public Speaking'];

  // Sync filters to URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedSkill) params.set('skill', selectedSkill);
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== 'relevance') {
        params.set(k, String(v));
      }
    });
    setSearchParams(params, { replace: true });
  }, [filters, query, selectedSkill]);

  // Fetch posts
  useEffect(() => {
    let cancelled = false;
    async function fetchPosts() {
      setLoading(true);
      try {
        const params = { page: 1, limit: postsPerPage * page };
        if (query) params.search = query;
        if (filters.category) params.category = filters.category;
        if (filters.mode) params.mode = filters.mode;
        if (filters.priceMin) params.priceMin = filters.priceMin;
        if (filters.priceMax) params.priceMax = filters.priceMax;
        if (filters.isRemote !== null) params.isRemote = filters.isRemote;
        if (filters.city) params.city = filters.city;
        if (filters.sort !== 'relevance') params.sort = filters.sort;
        if (selectedSkill) params.skill = selectedSkill;

        const res = await postAPI.getAll(params);
        if (!cancelled && res.data?.posts) {
          setPosts(res.data.posts);
          setHasMore(res.data.posts.length >= postsPerPage * page);
        }
      } catch {
        // API failed — fallback to mock data with local filtering
        if (!cancelled) {
          let filtered = [...mockPosts];

          if (query) {
            const q = query.toLowerCase();
            filtered = filtered.filter(
              (p) =>
                p.title.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.skill.toLowerCase().includes(q) ||
                p.userName.toLowerCase().includes(q)
            );
          }

          if (selectedSkill) {
            filtered = filtered.filter((p) => p.skill === selectedSkill);
          }

          if (filters.category) {
            filtered = filtered.filter((p) => p.category === filters.category);
          }
          if (filters.mode) {
            filtered = filtered.filter((p) => p.mode === filters.mode);
          }
          if (filters.priceMin) {
            filtered = filtered.filter((p) => p.budget >= Number(filters.priceMin));
          }
          if (filters.priceMax) {
            filtered = filtered.filter((p) => p.budget <= Number(filters.priceMax));
          }
          if (filters.isRemote !== null) {
            filtered = filtered.filter((p) => p.isRemote === filters.isRemote);
          }
          if (filters.city) {
            filtered = filtered.filter((p) => p.city === filters.city);
          }

          // Sort
          switch (filters.sort) {
            case 'price_low':
              filtered.sort((a, b) => a.budget - b.budget);
              break;
            case 'price_high':
              filtered.sort((a, b) => b.budget - a.budget);
              break;
            case 'newest':
              filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
              break;
            case 'rating':
              filtered.sort((a, b) => b.views - a.views);
              break;
            default:
              break;
          }

          const sliced = filtered.slice(0, postsPerPage * page);
          setPosts(sliced);
          setHasMore(sliced.length < filtered.length);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPosts();
    return () => { cancelled = true; };
  }, [query, filters, selectedSkill, page]);

  // Search handler with debounce
  const searchTimeout = useRef(null);
  function handleSearch(value) {
    setQuery(value);
    setPage(1);
  }

  const resultCount = posts.length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Search Bar ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search skills, teachers, services..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-14 text-white outline-none backdrop-blur-xl placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 transition-colors ${
                showFilters ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:bg-white/10 hover:text-gray-300'
              }`}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        {/* ── Trending Skills ────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Trending</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {trendingSkills.map((skill) => (
              <SkillTag
                key={skill}
                name={skill}
                active={selectedSkill === skill}
                onClick={() => {
                  setSelectedSkill(selectedSkill === skill ? '' : skill);
                  setPage(1);
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* ── Main Layout ────────────────────────── */}
        <div className="mt-6 flex gap-6">
          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <>
                {/* Mobile overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                  onClick={() => setShowFilters(false)}
                />
                <FilterPanel
                  filters={filters}
                  setFilters={(fn) => {
                    setFilters(fn);
                    setPage(1);
                  }}
                  onClose={() => setShowFilters(false)}
                />
              </>
            )}
          </AnimatePresence>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Result count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {loading ? 'Searching...' : `${resultCount} result${resultCount !== 1 ? 's' : ''} found`}
              </p>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-3.5 w-3.5 text-gray-500" />
                <select
                  value={filters.sort}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, sort: e.target.value }));
                    setPage(1);
                  }}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-gray-300 outline-none"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_low">Price: Low-High</option>
                  <option value="price_high">Price: High-Low</option>
                  <option value="rating">Rating</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {/* Active filters chips */}
            {(filters.mode || filters.category || filters.city || filters.isRemote !== null || selectedSkill) && (
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedSkill && (
                  <span className="flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs text-blue-300">
                    {selectedSkill}
                    <button onClick={() => { setSelectedSkill(''); setPage(1); }}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.mode && (
                  <span className={`flex items-center gap-1.5 rounded-full ${MODE_COLORS[filters.mode]?.bg} px-3 py-1 text-xs ${MODE_COLORS[filters.mode]?.text}`}>
                    {MODE_CONFIG[filters.mode]?.label}
                    <button onClick={() => setFilters((p) => ({ ...p, mode: '' }))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.category && (
                  <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">
                    {SKILL_CATEGORIES.find((c) => c.id === filters.category)?.name || filters.category}
                    <button onClick={() => setFilters((p) => ({ ...p, category: '' }))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.city && (
                  <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">
                    <MapPin className="h-3 w-3" />{filters.city}
                    <button onClick={() => setFilters((p) => ({ ...p, city: '' }))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.isRemote !== null && (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">
                    {filters.isRemote ? 'Online' : 'Offline'}
                    <button onClick={() => setFilters((p) => ({ ...p, isRemote: null }))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Posts Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : posts.length === 0 ? (
              <EmptyState query={query} />
            ) : (
              <>
                <motion.div
                  className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                  variants={container}
                  initial="hidden"
                  animate="show"
                  key={`${query}-${filters.mode}-${filters.category}-${selectedSkill}-${filters.sort}-${page}`}
                >
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </motion.div>

                {/* Load More */}
                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-xl border border-white/10 bg-white/5 px-8 py-3 text-sm font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
