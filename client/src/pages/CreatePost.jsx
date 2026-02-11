import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  Eye,
  Send,
  Loader2,
  ChevronDown,
  IndianRupee,
  Wifi,
  WifiOff,
  Clock,
  Users,
  MapPin,
  Target,
  Zap,
  AlertCircle,
  Camera,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Tag,
  FileText,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMode, MODE_CONFIG } from '../context/ModeContext';
import { postAPI } from '../services/api';
import { SKILL_CATEGORIES, INDIAN_CITIES } from '../utils/constants';

// ── helpers ─────────────────────────────────────────────────
const allSkills = SKILL_CATEGORIES.flatMap((c) => c.skills);

const MODE_COLORS = {
  learn: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/40', ring: 'ring-blue-500/30', solid: 'bg-blue-600' },
  teach: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/40', ring: 'ring-green-500/30', solid: 'bg-green-600' },
  rent: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/40', ring: 'ring-purple-500/30', solid: 'bg-purple-600' },
  service: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/40', ring: 'ring-orange-500/30', solid: 'bg-orange-600' },
  request: { bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/40', ring: 'ring-pink-500/30', solid: 'bg-pink-600' },
};

const PRICING_TYPES = [
  { value: 'per_hour', label: '/hr' },
  { value: 'per_session', label: '/session' },
  { value: 'per_task', label: '/task' },
];

function GlassCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg ${className}`}>
      {children}
    </div>
  );
}

function FormField({ label, required, children, hint }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      className={`fixed right-4 top-4 z-[100] flex items-center gap-3 rounded-xl border px-5 py-3 shadow-xl backdrop-blur-xl ${type === 'success'
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

// ── skill autocomplete ──────────────────────────────────────
function SkillAutocomplete({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value || '');
  const ref = useRef(null);

  const filtered = useMemo(() => {
    if (!search) return allSkills.slice(0, 12);
    const q = search.toLowerCase();
    return allSkills.filter((s) => s.toLowerCase().includes(q));
  }, [search]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search or type a skill..."
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500/50 transition-colors"
      />
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-xl shadow-xl"
          >
            {filtered.map((skill) => (
              <button
                key={skill}
                onClick={() => {
                  setSearch(skill);
                  onChange(skill);
                  setOpen(false);
                }}
                className={`block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-white/10 ${skill === value ? 'text-blue-400 bg-blue-500/10' : 'text-gray-300'
                  }`}
              >
                {skill}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── tag input ───────────────────────────────────────────────
function TagInput({ tags, setTags }) {
  const [input, setInput] = useState('');

  function addTag(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = input.trim().replace(',', '');
      if (val && !tags.includes(val) && tags.length < 8) {
        setTags([...tags, val]);
        setInput('');
      }
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus-within:border-blue-500/50 transition-colors">
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-medium text-blue-300"
        >
          {tag}
          <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-white">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={addTag}
        placeholder={tags.length === 0 ? 'Type and press Enter...' : ''}
        className="min-w-[100px] flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
      />
    </div>
  );
}

// ── preview card ────────────────────────────────────────────
function PreviewCard({ data, mode, user }) {
  const mc = MODE_COLORS[mode];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <GlassCard className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
          <Eye className="h-5 w-5 text-gray-400" /> Preview
        </h3>

        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl" style={{ backgroundColor: MODE_CONFIG[mode]?.color }} />

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold text-white">
              {user?.name?.[0] || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.name || 'You'}</p>
              <p className="text-xs text-gray-400">{user?.city || 'Your City'}</p>
            </div>
            <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium ${mc?.bg} ${mc?.text}`}>
              {MODE_CONFIG[mode]?.label}
            </span>
          </div>

          <div className="mt-3">
            {data.skill && (
              <span className="inline-block rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-gray-300">
                {data.skill}
              </span>
            )}
            <h4 className="mt-2 text-base font-semibold text-white">{data.title || 'Your post title'}</h4>
            <p className="mt-1 text-sm text-gray-400 line-clamp-3">
              {data.description || 'Your description will appear here...'}
            </p>
          </div>

          {data.pricing?.amount && (
            <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-white">
              <IndianRupee className="h-3.5 w-3.5" />
              {data.pricing.amount}
              <span className="font-normal text-gray-500">
                {PRICING_TYPES.find((p) => p.value === data.pricing.type)?.label}
              </span>
            </div>
          )}

          {data.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {data.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ── main component ──────────────────────────────────────────
export default function CreatePost() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentMode } = useMode();

  const [selectedMode, setSelectedMode] = useState(currentMode || 'learn');
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Common fields
  const [skill, setSkill] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pricing, setPricing] = useState({ amount: '', type: 'per_hour' });
  const [tags, setTags] = useState([]);
  const [isOnline, setIsOnline] = useState(true);

  // Learn fields
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [learningGoal, setLearningGoal] = useState('');
  const [budgetRange, setBudgetRange] = useState({ min: '', max: '' });
  const [teacherCriteria, setTeacherCriteria] = useState('');

  // Teach fields
  const [subSkill, setSubSkill] = useState('');
  const [duration, setDuration] = useState('');
  const [batchSize, setBatchSize] = useState('1-on-1');
  const [availability, setAvailability] = useState('');

  // Rent fields
  const [microServiceDesc, setMicroServiceDesc] = useState('');
  const [rentDuration, setRentDuration] = useState(15);
  const [instantMatch, setInstantMatch] = useState(false);

  // Service fields
  const [city, setCity] = useState('');
  const [locality, setLocality] = useState('');
  const [radius, setRadius] = useState('5');
  const [toolsProvision, setToolsProvision] = useState('bring_own');
  const [photos, setPhotos] = useState([]);

  // Request fields
  const [requirements, setRequirements] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [urgency, setUrgency] = useState('normal');

  // Force isOnline off for service/request modes
  useEffect(() => {
    if (selectedMode === 'service' || selectedMode === 'request') {
      setIsOnline(false);
    }
  }, [selectedMode]);

  const mc = MODE_COLORS[selectedMode];

  const formData = useMemo(() => {
    const base = { skill, title, description, pricing, tags, isOnline, mode: selectedMode };
    switch (selectedMode) {
      case 'learn':
        return { ...base, expectedOutcome, learningGoal, budgetRange, teacherCriteria };
      case 'teach':
        return { ...base, subSkill, duration, batchSize, availability };
      case 'rent':
        return { ...base, microServiceDesc, rentDuration, instantMatch };
      case 'service':
        return { ...base, city, locality, radius, toolsProvision, photos };
      case 'request':
        return { ...base, requirements, budgetMin, budgetMax, urgency };
      default:
        return base;
    }
  }, [
    selectedMode, skill, title, description, pricing, tags, isOnline,
    expectedOutcome, learningGoal, budgetRange, teacherCriteria,
    subSkill, duration, batchSize, availability,
    microServiceDesc, rentDuration, instantMatch,
    city, locality, radius, toolsProvision, photos,
    requirements, budgetMin, budgetMax, urgency,
  ]);

  const isValid = skill && title.length >= 0 && description.length >= 0 && pricing.amount;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    try {
      await postAPI.create(formData);
      setToast({ message: 'Post created successfully! Redirecting...', type: 'success' });
      console.log('Created post data:', formData);
      setTimeout(() => navigate('/discover'), 1500);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to create post. Please try again.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500/50 transition-colors';
  const selectClass =
    'w-48 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition-colors';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AnimatePresence>{toast && <Toast {...toast} onClose={() => setToast(null)} />}</AnimatePresence>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${mc.bg}`}>
              <Plus className={`h-6 w-6 ${mc.text}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Create Post</h1>
              <p className="text-sm text-gray-400">Share what you want to learn, teach, or offer</p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
          {/* ── Form ──────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mode selector */}
              <GlassCard className="p-5">
                <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Post Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(MODE_CONFIG).map(([key, cfg]) => {
                    const c = MODE_COLORS[key];
                    const active = selectedMode === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedMode(key)}
                        className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${active
                            ? `${c.bg} ${c.text} ${c.border} ring-1 ${c.ring}`
                            : 'border-white/10 text-gray-400 hover:bg-white/5'
                          }`}
                      >
                        <span className="text-lg">{cfg.icon}</span>
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Common fields */}
              <GlassCard className="space-y-5 p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <FileText className="h-4 w-4 text-gray-400" /> Basic Details
                </h3>

                <FormField label="Skill" required>
                  <SkillAutocomplete value={skill} onChange={setSkill} />
                </FormField>

                <FormField label="Title" required hint="At least 5 characters">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Want to learn React from scratch"
                    className={inputClass}
                    maxLength={120}
                  />
                  <div className="mt-1 text-right text-xs text-gray-600">{title.length}/120</div>
                </FormField>

                <FormField label="Description" required hint="At least 20 characters">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what you're looking for, your experience level, and any preferences..."
                    rows={4}
                    className={`${inputClass} resize-none`}
                    maxLength={1000}
                  />
                  <div className="mt-1 text-right text-xs text-gray-600">{description.length}/1000</div>
                </FormField>

                <FormField label="Pricing" required>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <input
                        type="number"
                        value={pricing.amount}
                        onChange={(e) => setPricing({ ...pricing, amount: e.target.value })}
                        placeholder="Amount"
                        className={`${inputClass} pl-8`}
                        min={0}
                      />
                    </div>
                    <select
                      value={pricing.type}
                      onChange={(e) => setPricing({ ...pricing, type: e.target.value })}
                      className={`w-8 ${selectClass}`}
                    >
                      {PRICING_TYPES.map((pt) => (
                        <option key={pt.value} value={pt.value}>
                          {pt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </FormField>

                <FormField label="Tags" hint="Press Enter to add (max 8)">
                  <TagInput tags={tags} setTags={setTags} />
                </FormField>

                {/* Online toggle */}
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <div className="flex items-center gap-3">
                    {isOnline ? (
                      <Wifi className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <WifiOff className="h-5 w-5 text-gray-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">Online Session</p>
                      <p className="text-xs text-gray-500">
                        {selectedMode === 'service' || selectedMode === 'request'
                          ? 'Offline only for this mode'
                          : 'Toggle for online/offline'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={selectedMode === 'service' || selectedMode === 'request'}
                    onClick={() => setIsOnline(!isOnline)}
                    className="disabled:opacity-40"
                  >
                    {isOnline ? (
                      <ToggleRight className="h-8 w-8 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-gray-500" />
                    )}
                  </button>
                </div>
              </GlassCard>

              {/* ── Mode-specific fields ─────────────── */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedMode}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <GlassCard className="space-y-5 p-5">
                    <h3 className={`flex items-center gap-2 text-sm font-semibold ${mc.text}`}>
                      <Sparkles className="h-4 w-4" /> {MODE_CONFIG[selectedMode]?.label} Details
                    </h3>

                    {/* LEARN */}
                    {selectedMode === 'learn' && (
                      <>
                        <FormField label="Expected Outcome">
                          <input
                            type="text"
                            value={expectedOutcome}
                            onChange={(e) => setExpectedOutcome(e.target.value)}
                            placeholder="e.g. Build a full-stack app"
                            className={inputClass}
                          />
                        </FormField>
                        <FormField label="Learning Goal">
                          <textarea
                            value={learningGoal}
                            onChange={(e) => setLearningGoal(e.target.value)}
                            placeholder="What do you want to achieve? Why is this important to you?"
                            rows={3}
                            className={`${inputClass} resize-none`}
                          />
                        </FormField>
                        <FormField label="Budget Range">
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                              <input
                                type="number"
                                value={budgetRange.min}
                                onChange={(e) => setBudgetRange({ ...budgetRange, min: e.target.value })}
                                placeholder="Min"
                                className={`${inputClass} pl-9`}
                              />
                            </div>
                            <span className="text-gray-600">to</span>
                            <div className="relative flex-1">
                              <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                              <input
                                type="number"
                                value={budgetRange.max}
                                onChange={(e) => setBudgetRange({ ...budgetRange, max: e.target.value })}
                                placeholder="Max"
                                className={`${inputClass} pl-9`}
                              />
                            </div>
                          </div>
                        </FormField>
                        <FormField label="Preferred Teacher Criteria">
                          <input
                            type="text"
                            value={teacherCriteria}
                            onChange={(e) => setTeacherCriteria(e.target.value)}
                            placeholder="e.g. 3+ years experience, patient, Hindi speaking"
                            className={inputClass}
                          />
                        </FormField>
                      </>
                    )}

                    {/* TEACH */}
                    {selectedMode === 'teach' && (
                      <>
                        <FormField label="Sub-skill / Topic">
                          <input
                            type="text"
                            value={subSkill}
                            onChange={(e) => setSubSkill(e.target.value)}
                            placeholder="e.g. React Hooks, OOP in Python"
                            className={inputClass}
                          />
                        </FormField>
                        <FormField label="Session Duration (minutes)">
                          <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="e.g. 60"
                            className={inputClass}
                            min={15}
                            max={480}
                          />
                        </FormField>
                        <FormField label="Batch Size">
                          <div className="flex gap-2">
                            {['1-on-1', 'small_group', 'large_group'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setBatchSize(opt)}
                                className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm transition-all ${batchSize === opt
                                    ? `${mc.bg} ${mc.text} ${mc.border}`
                                    : 'border-white/10 text-gray-400 hover:bg-white/5'
                                  }`}
                              >
                                <Users className="h-4 w-4" />
                                {opt === '1-on-1' ? '1-on-1' : opt === 'small_group' ? 'Small (2-5)' : 'Large (5+)'}
                              </button>
                            ))}
                          </div>
                        </FormField>
                        <FormField label="Availability Schedule">
                          <textarea
                            value={availability}
                            onChange={(e) => setAvailability(e.target.value)}
                            placeholder="e.g. Weekdays 6-9 PM, Weekends 10 AM - 1 PM"
                            rows={2}
                            className={`${inputClass} resize-none`}
                          />
                        </FormField>
                      </>
                    )}

                    {/* RENT */}
                    {selectedMode === 'rent' && (
                      <>
                        <FormField label="Micro-service Description">
                          <textarea
                            value={microServiceDesc}
                            onChange={(e) => setMicroServiceDesc(e.target.value)}
                            placeholder="What quick service do you offer? e.g. Code review, design feedback, quick debug"
                            rows={3}
                            className={`${inputClass} resize-none`}
                          />
                        </FormField>
                        <FormField label={`Duration: ${rentDuration} minutes`}>
                          <input
                            type="range"
                            min={10}
                            max={30}
                            step={5}
                            value={rentDuration}
                            onChange={(e) => setRentDuration(Number(e.target.value))}
                            className="w-full accent-purple-500"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>10 min</span>
                            <span>30 min</span>
                          </div>
                        </FormField>
                        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Zap className="h-5 w-5 text-yellow-400" />
                            <div>
                              <p className="text-sm font-medium text-white">Instant Matching</p>
                              <p className="text-xs text-gray-500">Get matched with requesters instantly</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => setInstantMatch(!instantMatch)}>
                            {instantMatch ? (
                              <ToggleRight className="h-8 w-8 text-yellow-400" />
                            ) : (
                              <ToggleLeft className="h-8 w-8 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </>
                    )}

                    {/* SERVICE */}
                    {selectedMode === 'service' && (
                      <>
                        <FormField label="City" required>
                          <select value={city} onChange={(e) => setCity(e.target.value)} className={selectClass}>
                            <option value="">Select city</option>
                            {INDIAN_CITIES.map((c) => (
                              <option key={c} value={c} className="bg-gray-900 text-gray-300">
                                {c}
                              </option>
                            ))}

                          </select>
                        </FormField>
                        <FormField label="Locality">
                          <input
                            type="text"
                            value={locality}
                            onChange={(e) => setLocality(e.target.value)}
                            placeholder="e.g. Bandra, Koramangala"
                            className={inputClass}
                          />
                        </FormField>
                        <FormField label={`Service Radius: ${radius} km`}>
                          <input
                            type="range"
                            min={1}
                            max={25}
                            value={radius}
                            onChange={(e) => setRadius(e.target.value)}
                            className="w-full accent-orange-500"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>1 km</span>
                            <span>25 km</span>
                          </div>
                        </FormField>
                        <FormField label="Tools / Equipment">
                          <div className="flex gap-2">
                            {[
                              { value: 'bring_own', label: 'I bring my own', icon: Wrench },
                              { value: 'customer_provides', label: 'Customer provides', icon: Users },
                            ].map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setToolsProvision(opt.value)}
                                className={`flex flex-1 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-all ${toolsProvision === opt.value
                                    ? `${mc.bg} ${mc.text} ${mc.border}`
                                    : 'border-white/10 text-gray-400 hover:bg-white/5'
                                  }`}
                              >
                                <opt.icon className="h-4 w-4" />
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </FormField>
                        <FormField label="Photos" hint="Upload photos of your work">
                          <div className="flex gap-3">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.03] cursor-pointer hover:bg-white/5 transition-colors"
                              >
                                <Camera className="h-6 w-6 text-gray-600" />
                              </div>
                            ))}
                          </div>
                        </FormField>
                      </>
                    )}

                    {/* REQUEST */}
                    {selectedMode === 'request' && (
                      <>
                        <FormField label="Requirements">
                          <textarea
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                            placeholder="Describe exactly what you need done..."
                            rows={3}
                            className={`${inputClass} resize-none`}
                          />
                        </FormField>
                        <FormField label="Budget Range">
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                              <input
                                type="number"
                                value={budgetMin}
                                onChange={(e) => setBudgetMin(e.target.value)}
                                placeholder="Min"
                                className={`${inputClass} pl-9`}
                              />
                            </div>
                            <span className="text-gray-600">to</span>
                            <div className="relative flex-1">
                              <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                              <input
                                type="number"
                                value={budgetMax}
                                onChange={(e) => setBudgetMax(e.target.value)}
                                placeholder="Max"
                                className={`${inputClass} pl-9`}
                              />
                            </div>
                          </div>
                        </FormField>
                        <FormField label="Urgency">
                          <div className="flex gap-2">
                            {[
                              { value: 'low', label: 'Low', color: 'text-gray-400' },
                              { value: 'normal', label: 'Normal', color: 'text-blue-400' },
                              { value: 'high', label: 'High', color: 'text-orange-400' },
                              { value: 'urgent', label: 'Urgent', color: 'text-red-400' },
                            ].map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setUrgency(opt.value)}
                                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${urgency === opt.value
                                    ? `bg-white/10 ${opt.color} border-white/20`
                                    : 'border-white/10 text-gray-500 hover:bg-white/5'
                                  }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </FormField>
                      </>
                    )}
                  </GlassCard>
                </motion.div>
              </AnimatePresence>

              {/* ── Actions ───────────────────────────── */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-gray-300 transition-all hover:bg-white/10 lg:hidden"
                >
                  <Eye className="h-4 w-4" />
                  {showPreview ? 'Hide Preview' : 'Preview'}
                </button>
                <button
                  type="submit"
                  disabled={!isValid || submitting}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed ${mc.solid} hover:brightness-110`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Create Post
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* ── Preview (desktop always, mobile toggle) ── */}
          <div className={`${showPreview ? 'block' : 'hidden'} lg:block`}>
            <div className="sticky top-8">
              <PreviewCard data={formData} mode={selectedMode} user={user} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
