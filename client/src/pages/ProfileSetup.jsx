import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  MapPin,
  Languages,
  Brain,
  Star,
  Target,
  Settings,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  Pencil,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { INDIAN_CITIES, LANGUAGES, SKILL_CATEGORIES } from '../utils/constants';
import { MODE_CONFIG } from '../context/ModeContext';

// ── animation variants ──────────────────────────────────────
const pageTransition = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
};

// ── helpers ─────────────────────────────────────────────────
function GlassCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg ${className}`}>
      {children}
    </div>
  );
}

function StarRating({ value, onChange, max = 5 }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              i < value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── progress bar ────────────────────────────────────────────
function ProgressBar({ currentStep, totalSteps }) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-400">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-sm font-medium text-blue-400">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <div className="mt-3 flex justify-between">
        {['Basic Info', 'Skill DNA', 'Preferences', 'Review'].map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                i < currentStep
                  ? 'bg-blue-500 text-white'
                  : i === currentStep
                  ? 'bg-blue-500/20 text-blue-400 ring-2 ring-blue-500/50'
                  : 'bg-white/5 text-gray-600'
              }`}
            >
              {i < currentStep ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-xs ${i <= currentStep ? 'text-gray-300' : 'text-gray-600'} hidden sm:block`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Step 1: Basic Info ──────────────────────────────────────
function StepBasicInfo({ data, setData, errors }) {
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const filteredCities = INDIAN_CITIES.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  function toggleLanguage(lang) {
    const langs = data.languages || [];
    if (langs.includes(lang)) {
      setData({ ...data, languages: langs.filter((l) => l !== lang) });
    } else {
      setData({ ...data, languages: [...langs, lang] });
    }
  }

  return (
    <motion.div key="step-0" variants={pageTransition} initial="initial" animate="animate" exit="exit">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <User className="h-5 w-5 text-blue-400" /> Basic Information
        </h2>
        <p className="mt-1 text-sm text-gray-400">Tell us a bit about yourself</p>
      </div>

      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">Full Name</label>
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder="Enter your full name"
            className={`w-full rounded-xl border ${errors.name ? 'border-red-500/50' : 'border-white/10'} bg-white/5 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50 transition-colors`}
          />
          {errors.name && <p className="mt-1 flex items-center gap-1 text-xs text-red-400"><AlertCircle className="h-3 w-3" />{errors.name}</p>}
        </div>

        {/* Age */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">Age</label>
          <input
            type="number"
            min={18}
            max={100}
            value={data.age || ''}
            onChange={(e) => setData({ ...data, age: e.target.value })}
            placeholder="18+"
            className={`w-full rounded-xl border ${errors.age ? 'border-red-500/50' : 'border-white/10'} bg-white/5 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50 transition-colors`}
          />
          {errors.age && <p className="mt-1 flex items-center gap-1 text-xs text-red-400"><AlertCircle className="h-3 w-3" />{errors.age}</p>}
        </div>

        {/* City with autocomplete */}
        <div className="relative">
          <label className="mb-1.5 block text-sm font-medium text-gray-300">City</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={data.city || citySearch}
              onChange={(e) => {
                setCitySearch(e.target.value);
                setData({ ...data, city: '' });
                setShowCityDropdown(true);
              }}
              onFocus={() => setShowCityDropdown(true)}
              placeholder="Start typing your city..."
              className={`w-full rounded-xl border ${errors.city ? 'border-red-500/50' : 'border-white/10'} bg-white/5 py-3 pl-10 pr-4 text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50 transition-colors`}
            />
          </div>
          {showCityDropdown && filteredCities.length > 0 && !data.city && (
            <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-white/10 bg-gray-900 shadow-xl">
              {filteredCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setData({ ...data, city });
                    setCitySearch('');
                    setShowCityDropdown(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <MapPin className="h-3.5 w-3.5 text-gray-500" />
                  {city}
                </button>
              ))}
            </div>
          )}
          {errors.city && <p className="mt-1 flex items-center gap-1 text-xs text-red-400"><AlertCircle className="h-3 w-3" />{errors.city}</p>}
        </div>

        {/* Locality */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">Locality / Area</label>
          <input
            type="text"
            value={data.locality || ''}
            onChange={(e) => setData({ ...data, locality: e.target.value })}
            placeholder="e.g. Bandra West, Koramangala"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50 transition-colors"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">Gender</label>
          <div className="flex flex-wrap gap-2">
            {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setData({ ...data, gender: g })}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                  data.gender === g
                    ? 'border-blue-500/30 bg-blue-500/15 text-blue-300'
                    : 'border-white/10 text-gray-400 hover:bg-white/5'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">
            Languages <span className="text-gray-500">(select all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => {
              const selected = (data.languages || []).includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-all ${
                    selected
                      ? 'border-purple-500/30 bg-purple-500/15 text-purple-300'
                      : 'border-white/10 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  {selected && <CheckCircle2 className="mr-1 inline h-3 w-3" />}
                  {lang}
                </button>
              );
            })}
          </div>
          {errors.languages && <p className="mt-1 flex items-center gap-1 text-xs text-red-400"><AlertCircle className="h-3 w-3" />{errors.languages}</p>}
        </div>
      </div>
    </motion.div>
  );
}

// ── Step 2: Skill DNA ───────────────────────────────────────
function StepSkillDNA({ data, setData, errors }) {
  const [skillInput, setSkillInput] = useState('');
  const [learnInput, setLearnInput] = useState('');
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [showLearnSuggestions, setShowLearnSuggestions] = useState(false);

  const allSkills = useMemo(() => SKILL_CATEGORIES.flatMap((c) => c.skills), []);

  const filteredSkills = allSkills.filter(
    (s) =>
      s.toLowerCase().includes(skillInput.toLowerCase()) &&
      !(data.knownSkills || []).find((ks) => ks.name === s)
  );

  const filteredLearnSkills = allSkills.filter(
    (s) =>
      s.toLowerCase().includes(learnInput.toLowerCase()) &&
      !(data.wantToLearn || []).find((ls) => ls.name === s)
  );

  function addKnownSkill(name) {
    setData({
      ...data,
      knownSkills: [...(data.knownSkills || []), { name, confidence: 3 }],
    });
    setSkillInput('');
    setShowSkillSuggestions(false);
  }

  function updateConfidence(index, confidence) {
    const updated = [...(data.knownSkills || [])];
    updated[index] = { ...updated[index], confidence };
    setData({ ...data, knownSkills: updated });
  }

  function removeKnownSkill(index) {
    const updated = [...(data.knownSkills || [])];
    updated.splice(index, 1);
    setData({ ...data, knownSkills: updated });
  }

  function addLearnSkill(name) {
    setData({
      ...data,
      wantToLearn: [...(data.wantToLearn || []), { name, targetLevel: 3 }],
    });
    setLearnInput('');
    setShowLearnSuggestions(false);
  }

  function updateTargetLevel(index, targetLevel) {
    const updated = [...(data.wantToLearn || [])];
    updated[index] = { ...updated[index], targetLevel };
    setData({ ...data, wantToLearn: updated });
  }

  function removeLearnSkill(index) {
    const updated = [...(data.wantToLearn || [])];
    updated.splice(index, 1);
    setData({ ...data, wantToLearn: updated });
  }

  return (
    <motion.div key="step-1" variants={pageTransition} initial="initial" animate="animate" exit="exit">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" /> Skill DNA
        </h2>
        <p className="mt-1 text-sm text-gray-400">Define your skills and learning goals</p>
      </div>

      <div className="space-y-8">
        {/* Skills You Know */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-400" /> Skills You Know
          </h3>

          {/* Added skills */}
          <div className="space-y-2 mb-3">
            {(data.knownSkills || []).map((skill, i) => (
              <div
                key={skill.name}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <span className="text-sm font-medium text-white flex-1">{skill.name}</span>
                <StarRating value={skill.confidence} onChange={(v) => updateConfidence(i, v)} />
                <button
                  type="button"
                  onClick={() => removeKnownSkill(i)}
                  className="rounded-lg p-1 hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>

          {/* Add skill input */}
          <div className="relative">
            <Plus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={skillInput}
              onChange={(e) => {
                setSkillInput(e.target.value);
                setShowSkillSuggestions(true);
              }}
              onFocus={() => setShowSkillSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 200)}
              placeholder="Add a skill you know..."
              className="w-full rounded-xl border border-dashed border-white/20 bg-white/[0.02] py-3 pl-10 pr-4 text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50 transition-colors"
            />
            {showSkillSuggestions && skillInput && filteredSkills.length > 0 && (
              <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-white/10 bg-gray-900 shadow-xl">
                {filteredSkills.slice(0, 8).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => addKnownSkill(s)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Plus className="h-3 w-3 text-blue-400" />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick add from categories */}
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">Quick add from categories:</p>
            <div className="flex flex-wrap gap-1.5">
              {SKILL_CATEGORIES.slice(0, 4).map((cat) => (
                <div key={cat.id} className="group relative">
                  <span className="text-xs text-gray-600">{cat.icon} {cat.name}: </span>
                  {cat.skills.slice(0, 3).map((s) => {
                    const alreadyAdded = (data.knownSkills || []).some((ks) => ks.name === s);
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={alreadyAdded}
                        onClick={() => addKnownSkill(s)}
                        className={`mr-1 text-xs ${alreadyAdded ? 'text-gray-700' : 'text-blue-400 hover:text-blue-300 hover:underline'}`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {errors.knownSkills && <p className="mt-2 flex items-center gap-1 text-xs text-red-400"><AlertCircle className="h-3 w-3" />{errors.knownSkills}</p>}
        </div>

        {/* Skills You Want to Learn */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-300 flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-400" /> Skills You Want to Learn
          </h3>

          <div className="space-y-2 mb-3">
            {(data.wantToLearn || []).map((skill, i) => (
              <div
                key={skill.name}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <span className="text-sm font-medium text-white flex-1">{skill.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">Target:</span>
                  <StarRating value={skill.targetLevel} onChange={(v) => updateTargetLevel(i, v)} />
                </div>
                <button
                  type="button"
                  onClick={() => removeLearnSkill(i)}
                  className="rounded-lg p-1 hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>

          <div className="relative">
            <Plus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={learnInput}
              onChange={(e) => {
                setLearnInput(e.target.value);
                setShowLearnSuggestions(true);
              }}
              onFocus={() => setShowLearnSuggestions(true)}
              onBlur={() => setTimeout(() => setShowLearnSuggestions(false), 200)}
              placeholder="Add a skill you want to learn..."
              className="w-full rounded-xl border border-dashed border-white/20 bg-white/[0.02] py-3 pl-10 pr-4 text-white outline-none placeholder:text-gray-600 focus:border-emerald-500/50 transition-colors"
            />
            {showLearnSuggestions && learnInput && filteredLearnSkills.length > 0 && (
              <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-white/10 bg-gray-900 shadow-xl">
                {filteredLearnSkills.slice(0, 8).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => addLearnSkill(s)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Plus className="h-3 w-3 text-emerald-400" />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {errors.wantToLearn && <p className="mt-2 flex items-center gap-1 text-xs text-red-400"><AlertCircle className="h-3 w-3" />{errors.wantToLearn}</p>}
        </div>
      </div>
    </motion.div>
  );
}

// ── Step 3: Preferences ─────────────────────────────────────
function StepPreferences({ data, setData, errors }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = ['Morning', 'Afternoon', 'Evening'];

  function toggleAvailability(day, slot) {
    const avail = { ...(data.availability || {}) };
    const daySlots = avail[day] || [];
    if (daySlots.includes(slot)) {
      avail[day] = daySlots.filter((s) => s !== slot);
    } else {
      avail[day] = [...daySlots, slot];
    }
    setData({ ...data, availability: avail });
  }

  return (
    <motion.div key="step-2" variants={pageTransition} initial="initial" animate="animate" exit="exit">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-orange-400" /> Preferences
        </h2>
        <p className="mt-1 text-sm text-gray-400">Customize your Skill-X experience</p>
      </div>

      <div className="space-y-6">
        {/* Preferred Mode */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Preferred Mode</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.entries(MODE_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                type="button"
                onClick={() => setData({ ...data, preferredMode: key })}
                className={`rounded-xl border p-3 text-left transition-all ${
                  data.preferredMode === key
                    ? 'border-blue-500/30 bg-blue-500/10 ring-1 ring-blue-500/25'
                    : 'border-white/10 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cfg.icon}</span>
                  <span className={`text-sm font-medium ${data.preferredMode === key ? 'text-white' : 'text-gray-300'}`}>
                    {cfg.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{cfg.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">
            Bio <span className="text-gray-500">({(data.bio || '').length}/300)</span>
          </label>
          <textarea
            value={data.bio || ''}
            onChange={(e) => {
              if (e.target.value.length <= 300) {
                setData({ ...data, bio: e.target.value });
              }
            }}
            rows={4}
            placeholder="Tell people about yourself, your passions, what you're looking for..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50 resize-none transition-colors"
          />
        </div>

        {/* Availability Schedule */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Availability Schedule
          </label>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="pb-2 text-left text-xs font-medium text-gray-500" />
                  {timeSlots.map((slot) => (
                    <th key={slot} className="pb-2 text-center text-xs font-medium text-gray-500">
                      {slot}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day) => (
                  <tr key={day}>
                    <td className="py-1 pr-3 text-sm text-gray-400">{day}</td>
                    {timeSlots.map((slot) => {
                      const active = (data.availability?.[day] || []).includes(slot);
                      return (
                        <td key={slot} className="p-1 text-center">
                          <button
                            type="button"
                            onClick={() => toggleAvailability(day, slot)}
                            className={`h-8 w-full rounded-lg text-xs font-medium transition-all ${
                              active
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-white/[0.02] text-gray-600 border border-white/5 hover:bg-white/5'
                            }`}
                          >
                            {active ? 'Yes' : '-'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Step 4: Review ──────────────────────────────────────────
function StepReview({ data, goToStep }) {
  function Section({ title, step, children }) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <button
            type="button"
            onClick={() => goToStep(step)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-blue-400 hover:bg-white/5 transition-colors"
          >
            <Pencil className="h-3 w-3" /> Edit
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <motion.div key="step-3" variants={pageTransition} initial="initial" animate="animate" exit="exit">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Review & Complete
        </h2>
        <p className="mt-1 text-sm text-gray-400">Make sure everything looks good</p>
      </div>

      <div className="space-y-4">
        {/* Basic Info */}
        <Section title="Basic Info" step={0}>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>
              <span className="ml-2 text-white">{data.name || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500">Age:</span>
              <span className="ml-2 text-white">{data.age || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500">City:</span>
              <span className="ml-2 text-white">{data.city || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500">Locality:</span>
              <span className="ml-2 text-white">{data.locality || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500">Gender:</span>
              <span className="ml-2 text-white">{data.gender || '-'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Languages:</span>
              <span className="ml-2 text-white">{(data.languages || []).join(', ') || '-'}</span>
            </div>
          </div>
        </Section>

        {/* Skill DNA */}
        <Section title="Skill DNA" step={1}>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Skills You Know</p>
              {(data.knownSkills || []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {(data.knownSkills || []).map((s) => (
                    <span key={s.name} className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-300">
                      {s.name}
                      <span className="text-yellow-500">{'*'.repeat(s.confidence)}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-600">None added</p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Want to Learn</p>
              {(data.wantToLearn || []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {(data.wantToLearn || []).map((s) => (
                    <span key={s.name} className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                      {s.name}
                      <span className="text-emerald-500">target {'*'.repeat(s.targetLevel)}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-600">None added</p>
              )}
            </div>
          </div>
        </Section>

        {/* Preferences */}
        <Section title="Preferences" step={2}>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Preferred Mode:</span>
              <span className="ml-2 text-white">
                {data.preferredMode ? `${MODE_CONFIG[data.preferredMode]?.icon} ${MODE_CONFIG[data.preferredMode]?.label}` : '-'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Bio:</span>
              <p className="mt-1 text-gray-300 text-xs">{data.bio || '-'}</p>
            </div>
            <div>
              <span className="text-gray-500">Availability:</span>
              {Object.keys(data.availability || {}).length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {Object.entries(data.availability || {}).map(([day, slots]) =>
                    (slots || []).map((slot) => (
                      <span key={`${day}-${slot}`} className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs text-blue-300">
                        {day} {slot}
                      </span>
                    ))
                  )}
                </div>
              ) : (
                <span className="ml-2 text-xs text-gray-600">Not set</span>
              )}
            </div>
          </div>
        </Section>
      </div>
    </motion.div>
  );
}

// ── main component ──────────────────────────────────────────
export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const totalSteps = 4;

  const [data, setData] = useState({
    name: user?.name || '',
    age: '',
    city: user?.city || '',
    locality: '',
    gender: '',
    languages: user?.languages || [],
    knownSkills: [],
    wantToLearn: [],
    preferredMode: 'learn',
    bio: user?.bio || '',
    availability: {},
  });

  function validateStep(stepIndex) {
    const errs = {};

    if (stepIndex === 0) {
      if (!data.name?.trim()) errs.name = 'Name is required';
      if (!data.age) errs.age = 'Age is required';
      else if (Number(data.age) < 18) errs.age = 'You must be at least 18 years old';
      else if (Number(data.age) > 100) errs.age = 'Please enter a valid age';
      if (!data.city) errs.city = 'City is required';
      if (!data.languages?.length) errs.languages = 'Select at least one language';
    }

    if (stepIndex === 1) {
      if (!data.knownSkills?.length) errs.knownSkills = 'Add at least one skill you know';
      if (!data.wantToLearn?.length) errs.wantToLearn = 'Add at least one skill you want to learn';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function goToStep(target) {
    setErrors({});
    setStep(target);
  }

  function handleNext() {
    if (step < totalSteps - 1) {
      if (validateStep(step)) {
        setStep(step + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  function handleBack() {
    if (step > 0) {
      setErrors({});
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleSkip() {
    if (step < totalSteps - 1) {
      setErrors({});
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handleComplete() {
    setSubmitting(true);
    try {
      const payload = {
        name: data.name,
        age: Number(data.age),
        city: data.city,
        locality: data.locality,
        gender: data.gender,
        languages: data.languages,
        skills: {
          teaching: (data.knownSkills || []).map((s) => s.name),
          learning: (data.wantToLearn || []).map((s) => s.name),
        },
        skillConfidences: (data.knownSkills || []).reduce((acc, s) => {
          acc[s.name] = s.confidence;
          return acc;
        }, {}),
        targetLevels: (data.wantToLearn || []).reduce((acc, s) => {
          acc[s.name] = s.targetLevel;
          return acc;
        }, {}),
        currentMode: data.preferredMode,
        bio: data.bio,
        availability: data.availability,
      };

      const res = await userAPI.completeProfile(payload);
      if (res.data?.user) {
        updateUser(res.data.user);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Profile setup failed:', err);
      // Still navigate on failure in demo mode
      navigate('/dashboard');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-10">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Complete Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Profile
            </span>
          </h1>
          <p className="mt-1 text-sm text-gray-400">Set up your Skill-X identity in a few quick steps</p>
        </motion.div>

        {/* Progress */}
        <ProgressBar currentStep={step} totalSteps={totalSteps} />

        {/* Step Content */}
        <GlassCard className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {step === 0 && <StepBasicInfo data={data} setData={setData} errors={errors} />}
            {step === 1 && <StepSkillDNA data={data} setData={setData} errors={errors} />}
            {step === 2 && <StepPreferences data={data} setData={setData} errors={errors} />}
            {step === 3 && <StepReview data={data} goToStep={goToStep} />}
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <div>
              {step > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {step < totalSteps - 1 && step > 0 && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-300"
                >
                  Skip
                </button>
              )}

              {step < totalSteps - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:from-blue-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Complete Setup
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
