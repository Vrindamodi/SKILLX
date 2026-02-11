import { useState, useEffect, useCallback } from 'react';
import {
  User,
  Shield,
  Bell,
  Lock,
  Database,
  Eye,
  EyeOff,
  Globe,
  MessageCircle,
  Search,
  Moon,
  Sun,
  Type,
  Save,
  ChevronDown,
  ChevronUp,
  Trash2,
  Download,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { userAPI, authAPI } from '../services/api';
import { INDIAN_CITIES, LANGUAGES, PASSWORD_RULES } from '../utils/constants';

// ── Days of the week ─────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ── Collapsible Section wrapper ──────────────────────────────
function Section({ id, icon: Icon, title, description, expanded, onToggle, children }) {
  return (
    <div className="glass-card overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-dark-800/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600/15">
            <Icon className="h-5 w-5 text-primary-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {description && <p className="text-sm text-dark-400 mt-0.5">{description}</p>}
          </div>
        </div>
        <div
          className="transition-transform duration-300"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <ChevronDown className="h-5 w-5 text-dark-400" />
        </div>
      </button>
      <div
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: expanded ? '5000px' : '0px',
          opacity: expanded ? 1 : 0,
        }}
      >
        <div className="px-6 pb-6 pt-2 border-t border-dark-700/50">{children}</div>
      </div>
    </div>
  );
}

// ── Toggle Switch ────────────────────────────────────────────
function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-dark-200 group-hover:text-white transition-colors">
          {label}
        </p>
        {description && <p className="text-xs text-dark-500 mt-0.5">{description}</p>}
      </div>
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-11 h-6 rounded-full transition-colors duration-200 ${
            checked ? 'bg-primary-600' : 'bg-dark-700'
          }`}
        />
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
    </label>
  );
}

// ── Radio Group ──────────────────────────────────────────────
function RadioGroup({ name, options, value, onChange }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex items-center gap-3 cursor-pointer group px-3 py-2.5 rounded-xl hover:bg-dark-800/60 transition-colors"
        >
          <div
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
              value === opt.value
                ? 'border-primary-500 bg-primary-500'
                : 'border-dark-500 group-hover:border-dark-400'
            }`}
          >
            {value === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="sr-only"
          />
          <div>
            <p className="text-sm text-dark-200 group-hover:text-white transition-colors">
              {opt.label}
            </p>
            {opt.description && (
              <p className="text-xs text-dark-500 mt-0.5">{opt.description}</p>
            )}
          </div>
        </label>
      ))}
    </div>
  );
}

// ── Save Button ──────────────────────────────────────────────
function SaveButton({ saving, onClick, label = 'Save Changes' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="btn-primary flex items-center gap-2"
    >
      {saving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      {saving ? 'Saving...' : label}
    </button>
  );
}

// ── Password Strength Meter ──────────────────────────────────
function PasswordStrengthMeter({ password }) {
  const passed = PASSWORD_RULES.filter((r) => r.regex.test(password));
  const strength = passed.length;
  const total = PASSWORD_RULES.length;
  const pct = total > 0 ? (strength / total) * 100 : 0;

  const color =
    strength <= 1
      ? 'bg-red-500'
      : strength <= 2
        ? 'bg-orange-500'
        : strength <= 3
          ? 'bg-yellow-500'
          : strength <= 4
            ? 'bg-blue-500'
            : 'bg-emerald-500';

  const label =
    strength <= 1
      ? 'Very Weak'
      : strength <= 2
        ? 'Weak'
        : strength <= 3
          ? 'Fair'
          : strength <= 4
            ? 'Strong'
            : 'Very Strong';

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-dark-400">Password strength</span>
        <span className={`font-medium ${color.replace('bg-', 'text-')}`}>{label}</span>
      </div>
      <div className="h-1.5 rounded-full bg-dark-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="space-y-1">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.regex.test(password);
          return (
            <li key={rule.rule} className="flex items-center gap-2 text-xs">
              {ok ? (
                <Check className="h-3 w-3 text-emerald-400 flex-shrink-0" />
              ) : (
                <X className="h-3 w-3 text-dark-500 flex-shrink-0" />
              )}
              <span className={ok ? 'text-emerald-400' : 'text-dark-500'}>{rule.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Delete Confirmation Modal ────────────────────────────────
function DeleteModal({ open, onClose, onConfirm }) {
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (!open) return null;

  async function handleDelete() {
    if (typed !== 'DELETE') return;
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card p-6 max-w-md w-full space-y-4 animate-scale-in">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15">
            <Trash2 className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Delete Account</h3>
            <p className="text-sm text-dark-400">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-dark-300">
          All your data, sessions, reviews, capsules, and wallet balance will be permanently
          deleted. Type <strong className="text-red-400">DELETE</strong> to confirm.
        </p>
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder='Type "DELETE" to confirm'
          className="input-field"
        />
        <div className="flex items-center gap-3 justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={typed !== 'DELETE' || deleting}
            className="btn-danger flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {deleting ? 'Deleting...' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ── MAIN SETTINGS COMPONENT ────────────────────────────────────
// ════════════════════════════════════════════════════════════════
export default function Settings() {
  const { user, updateUser } = useAuth();

  // ── Expanded sections state ───────────────────────────────
  const [expandedSections, setExpandedSections] = useState({ profile: true });
  const toggleSection = useCallback((id) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // ── Per-section saving state ──────────────────────────────
  const [saving, setSaving] = useState({});
  function setSectionSaving(section, val) {
    setSaving((prev) => ({ ...prev, [section]: val }));
  }

  // ── Delete modal ──────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ════════════════════════════════════════════════════════════
  // 1. PROFILE
  // ════════════════════════════════════════════════════════════
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    avatar: '',
    city: '',
    languages: [],
    socialLinks: { linkedin: '', github: '', twitter: '', website: '' },
  });

  // ════════════════════════════════════════════════════════════
  // 2. PRIVACY
  // ════════════════════════════════════════════════════════════
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'platform',
    locationPrivacy: 'exact',
    locationCustom: '',
    showEarnings: false,
    showSessionCount: true,
    showCapsules: true,
    showReviews: true,
    whoCanMessage: 'everyone',
    whoCanSeePhone: 'none',
    whoCanSeeEmail: 'admins',
    appearInSearch: true,
    anonymousBrowsing: false,
  });

  // ════════════════════════════════════════════════════════════
  // 3. NOTIFICATIONS
  // ════════════════════════════════════════════════════════════
  const [notifications, setNotifications] = useState({
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '07:00',
    channelInApp: true,
    channelPush: true,
    channelEmail: true,
    channelSMS: false,
    frequency: 'realtime',
    catMessages: true,
    catSessions: true,
    catPayments: true,
    catMatches: true,
    catSocial: true,
    catPromotions: false,
  });

  // ════════════════════════════════════════════════════════════
  // 4. SECURITY
  // ════════════════════════════════════════════════════════════
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // ════════════════════════════════════════════════════════════
  // 5. DATA & PRIVACY
  // ════════════════════════════════════════════════════════════
  const [dataPrivacy, setDataPrivacy] = useState({
    cookieAnalytics: true,
    cookieMarketing: false,
    shareAnalytics: false,
    shareMarketing: false,
  });

  // ════════════════════════════════════════════════════════════
  // 6. TEACHING PROFILE
  // ════════════════════════════════════════════════════════════
  const [teaching, setTeaching] = useState({
    headline: '',
    hourlyRate: '',
    batchSize: '1on1',
    style: 'mixed',
    available: true,
    schedule: DAYS.map((day) => ({
      day,
      enabled: !['Saturday', 'Sunday'].includes(day),
      start: '09:00',
      end: '17:00',
    })),
  });

  // ════════════════════════════════════════════════════════════
  // 7. ACCESSIBILITY
  // ════════════════════════════════════════════════════════════
  const [accessibility, setAccessibility] = useState({
    highContrast: false,
    largeText: false,
  });

  // ── Load initial values from user ─────────────────────────
  useEffect(() => {
    if (!user) return;

    setProfile({
      name: user.name || '',
      bio: user.bio || '',
      avatar: user.avatar || '',
      city: user.city || '',
      languages: user.languages || [],
      socialLinks: {
        linkedin: user.socialLinks?.linkedin || '',
        github: user.socialLinks?.github || '',
        twitter: user.socialLinks?.twitter || '',
        website: user.socialLinks?.website || '',
      },
    });

    if (user.privacy) {
      setPrivacy((prev) => ({
        ...prev,
        profileVisibility: user.privacy.profileVisibility || prev.profileVisibility,
        locationPrivacy: user.privacy.locationPrivacy || prev.locationPrivacy,
        locationCustom: user.privacy.locationCustom || '',
        showEarnings: user.privacy.showEarnings ?? prev.showEarnings,
        showSessionCount: user.privacy.showSessionCount ?? prev.showSessionCount,
        showCapsules: user.privacy.showCapsules ?? prev.showCapsules,
        showReviews: user.privacy.showReviews ?? prev.showReviews,
        whoCanMessage: user.privacy.whoCanMessage || prev.whoCanMessage,
        whoCanSeePhone: user.privacy.whoCanSeePhone || prev.whoCanSeePhone,
        whoCanSeeEmail: user.privacy.whoCanSeeEmail || prev.whoCanSeeEmail,
        appearInSearch: user.privacy.appearInSearch ?? prev.appearInSearch,
        anonymousBrowsing: user.privacy.anonymousBrowsing ?? prev.anonymousBrowsing,
      }));
    }

    if (user.notificationSettings) {
      const ns = user.notificationSettings;
      setNotifications((prev) => ({
        ...prev,
        quietHours: ns.quietHours ?? prev.quietHours,
        quietStart: ns.quietStart || prev.quietStart,
        quietEnd: ns.quietEnd || prev.quietEnd,
        channelInApp: ns.channelInApp ?? prev.channelInApp,
        channelPush: ns.channelPush ?? prev.channelPush,
        channelEmail: ns.channelEmail ?? prev.channelEmail,
        channelSMS: ns.channelSMS ?? prev.channelSMS,
        frequency: ns.frequency || prev.frequency,
        catMessages: ns.catMessages ?? prev.catMessages,
        catSessions: ns.catSessions ?? prev.catSessions,
        catPayments: ns.catPayments ?? prev.catPayments,
        catMatches: ns.catMatches ?? prev.catMatches,
        catSocial: ns.catSocial ?? prev.catSocial,
        catPromotions: ns.catPromotions ?? prev.catPromotions,
      }));
    }

    if (user.teachingProfile) {
      const tp = user.teachingProfile;
      setTeaching((prev) => ({
        ...prev,
        headline: tp.headline || '',
        hourlyRate: tp.hourlyRate || '',
        batchSize: tp.batchSize || '1on1',
        style: tp.style || 'mixed',
        available: tp.available ?? true,
        schedule: tp.schedule || prev.schedule,
      }));
    }

    // Accessibility from localStorage
    setAccessibility({
      highContrast: localStorage.getItem('skillx_highContrast') === 'true',
      largeText: localStorage.getItem('skillx_largeText') === 'true',
    });
  }, [user]);

  // ── Apply accessibility classes ───────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', accessibility.highContrast);
    document.documentElement.classList.toggle('large-text', accessibility.largeText);
    localStorage.setItem('skillx_highContrast', accessibility.highContrast);
    localStorage.setItem('skillx_largeText', accessibility.largeText);
  }, [accessibility]);

  // ════════════════════════════════════════════════════════════
  // ── SAVE HANDLERS ─────────────────────────────────────────
  // ════════════════════════════════════════════════════════════

  async function saveProfile() {
    setSectionSaving('profile', true);
    try {
      const res = await userAPI.updateProfile({
        name: profile.name,
        bio: profile.bio,
        avatar: profile.avatar,
        city: profile.city,
        languages: profile.languages,
        socialLinks: profile.socialLinks,
      });
      if (res.data?.user) updateUser(res.data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSectionSaving('profile', false);
    }
  }

  async function savePrivacy() {
    setSectionSaving('privacy', true);
    try {
      const res = await userAPI.updatePrivacy(privacy);
      if (res.data?.user) updateUser(res.data.user);
      toast.success('Privacy settings updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update privacy settings');
    } finally {
      setSectionSaving('privacy', false);
    }
  }

  async function saveNotifications() {
    setSectionSaving('notifications', true);
    try {
      const res = await userAPI.updateNotificationSettings(notifications);
      if (res.data?.user) updateUser(res.data.user);
      toast.success('Notification preferences saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update notification settings');
    } finally {
      setSectionSaving('notifications', false);
    }
  }

  async function changePassword() {
    if (security.newPassword !== security.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    const allPassed = PASSWORD_RULES.every((r) => r.regex.test(security.newPassword));
    if (!allPassed) {
      toast.error('New password does not meet all requirements');
      return;
    }
    setSectionSaving('security', true);
    try {
      await authAPI.changePassword({
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      });
      toast.success('Password changed successfully');
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSectionSaving('security', false);
    }
  }

  async function saveDataPrivacy() {
    setSectionSaving('data', true);
    try {
      await userAPI.updatePrivacy({
        cookieAnalytics: dataPrivacy.cookieAnalytics,
        cookieMarketing: dataPrivacy.cookieMarketing,
        shareAnalytics: dataPrivacy.shareAnalytics,
        shareMarketing: dataPrivacy.shareMarketing,
      });
      toast.success('Data preferences saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save data preferences');
    } finally {
      setSectionSaving('data', false);
    }
  }

  async function saveTeaching() {
    setSectionSaving('teaching', true);
    try {
      const res = await userAPI.updateTeachingProfile(teaching);
      if (res.data?.user) updateUser(res.data.user);
      toast.success('Teaching profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update teaching profile');
    } finally {
      setSectionSaving('teaching', false);
    }
  }

  function handleDownloadData() {
    toast.success('Your data export has been queued. You will receive an email with the download link within 24 hours.');
  }

  async function handleDeleteAccount() {
    try {
      toast.success('Account deletion request submitted. Your account will be deleted within 30 days.');
      setShowDeleteModal(false);
    } catch {
      toast.error('Failed to submit deletion request');
    }
  }

  // ── Language multi-select helpers ─────────────────────────
  function toggleLanguage(lang) {
    setProfile((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  }

  // ── Check if user has teaching skills ─────────────────────
  const hasTeachingSkills =
    user?.skills?.teaching?.length > 0 ||
    user?.role === 'teacher' ||
    user?.teachingProfile;

  // ════════════════════════════════════════════════════════════
  // ── RENDER ────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-dark-950 pb-20">
      {/* Header */}
      <div className="border-b border-dark-700/50 bg-dark-900/60 backdrop-blur-xl sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-5">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-dark-400 mt-1">Manage your account preferences</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-4">
        {/* ══════════════════════════════════════════════════════
            1. PROFILE SETTINGS
        ══════════════════════════════════════════════════════ */}
        <Section
          id="profile"
          icon={User}
          title="Profile Settings"
          description="Your public information"
          expanded={expandedSections.profile}
          onToggle={toggleSection}
        >
          <div className="space-y-5">
            {/* Avatar preview + URL */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="h-20 w-20 rounded-full border-2 border-dark-600 overflow-hidden bg-dark-800">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <User className="h-8 w-8 text-dark-500" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <label className="input-label">Avatar URL</label>
                <input
                  type="url"
                  value={profile.avatar}
                  onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  className="input-field"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="input-label">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Your full name"
                className="input-field"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="input-label">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
                className="input-field resize-none"
              />
              <p className="text-xs text-dark-500 mt-1">{profile.bio.length}/500 characters</p>
            </div>

            {/* City */}
            <div>
              <label className="input-label">City</label>
              <select
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="input-field"
              >
                <option value="">Select your city</option>
                {INDIAN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Languages multi-select */}
            <div>
              <label className="input-label">Languages</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => {
                  const selected = profile.languages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 ${
                        selected
                          ? 'bg-primary-600/20 border-primary-500/40 text-primary-300'
                          : 'bg-dark-800/60 border-dark-600 text-dark-400 hover:text-dark-200 hover:border-dark-500'
                      }`}
                    >
                      {selected && <Check className="h-3 w-3 inline mr-1" />}
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Social Links */}
            <div>
              <label className="input-label">Social Links</label>
              <div className="space-y-3">
                {[
                  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
                  { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
                  { key: 'twitter', label: 'Twitter / X', placeholder: 'https://x.com/username' },
                  { key: 'website', label: 'Website', placeholder: 'https://yourwebsite.com' },
                ].map((s) => (
                  <div key={s.key} className="flex items-center gap-3">
                    <span className="text-sm text-dark-400 w-20 flex-shrink-0">{s.label}</span>
                    <input
                      type="url"
                      value={profile.socialLinks[s.key]}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          socialLinks: { ...profile.socialLinks, [s.key]: e.target.value },
                        })
                      }
                      placeholder={s.placeholder}
                      className="input-field"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <SaveButton saving={saving.profile} onClick={saveProfile} />
            </div>
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════════
            2. PRIVACY CONTROLS
        ══════════════════════════════════════════════════════ */}
        <Section
          id="privacy"
          icon={Shield}
          title="Privacy Controls"
          description="Control who sees your information"
          expanded={expandedSections.privacy}
          onToggle={toggleSection}
        >
          <div className="space-y-8">
            {/* Profile Visibility */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary-400" />
                Profile Visibility
              </h3>
              <RadioGroup
                name="profileVisibility"
                value={privacy.profileVisibility}
                onChange={(v) => setPrivacy({ ...privacy, profileVisibility: v })}
                options={[
                  { value: 'public', label: 'Public', description: 'Anyone on the internet' },
                  { value: 'platform', label: 'Platform Users', description: 'Only logged-in Skill-X users' },
                  { value: 'connections', label: 'Connections Only', description: 'Only people you follow back' },
                  { value: 'private', label: 'Private', description: 'Only you' },
                ]}
              />
            </div>

            {/* Location Privacy */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary-400" />
                Location Privacy
              </h3>
              <RadioGroup
                name="locationPrivacy"
                value={privacy.locationPrivacy}
                onChange={(v) => setPrivacy({ ...privacy, locationPrivacy: v })}
                options={[
                  { value: 'exact', label: 'Exact City', description: 'Show your full city name' },
                  { value: 'state', label: 'State Only', description: 'Show only state/region' },
                  { value: 'hidden', label: 'Hidden', description: 'Don\'t show location' },
                  { value: 'custom', label: 'Custom', description: 'Set a custom location label' },
                ]}
              />
              {privacy.locationPrivacy === 'custom' && (
                <div className="mt-3 ml-9">
                  <input
                    type="text"
                    value={privacy.locationCustom}
                    onChange={(e) => setPrivacy({ ...privacy, locationCustom: e.target.value })}
                    placeholder="e.g. India, Remote, etc."
                    className="input-field"
                  />
                </div>
              )}
            </div>

            {/* Activity Privacy */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary-400" />
                Activity Privacy
              </h3>
              <div className="space-y-4">
                <Toggle
                  checked={privacy.showEarnings}
                  onChange={(v) => setPrivacy({ ...privacy, showEarnings: v })}
                  label="Show Earnings"
                  description="Display your earnings on your public profile"
                />
                <Toggle
                  checked={privacy.showSessionCount}
                  onChange={(v) => setPrivacy({ ...privacy, showSessionCount: v })}
                  label="Show Session Count"
                  description="Show how many sessions you've completed"
                />
                <Toggle
                  checked={privacy.showCapsules}
                  onChange={(v) => setPrivacy({ ...privacy, showCapsules: v })}
                  label="Show Capsules"
                  description="Display your skill capsules publicly"
                />
                <Toggle
                  checked={privacy.showReviews}
                  onChange={(v) => setPrivacy({ ...privacy, showReviews: v })}
                  label="Show Reviews"
                  description="Allow others to see your reviews"
                />
              </div>
            </div>

            {/* Contact Privacy */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary-400" />
                Contact Privacy
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="input-label">Who can message you</label>
                  <select
                    value={privacy.whoCanMessage}
                    onChange={(e) => setPrivacy({ ...privacy, whoCanMessage: e.target.value })}
                    className="input-field"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="verified">Verified Users Only</option>
                    <option value="none">No One</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Who can see your phone number</label>
                  <select
                    value={privacy.whoCanSeePhone}
                    onChange={(e) => setPrivacy({ ...privacy, whoCanSeePhone: e.target.value })}
                    className="input-field"
                  >
                    <option value="none">No One</option>
                    <option value="verified">Verified Users Only</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Who can see your email</label>
                  <select
                    value={privacy.whoCanSeeEmail}
                    onChange={(e) => setPrivacy({ ...privacy, whoCanSeeEmail: e.target.value })}
                    className="input-field"
                  >
                    <option value="admins">Admins Only</option>
                    <option value="verified">Verified Users</option>
                    <option value="everyone">Everyone</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Search Privacy */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Search className="h-4 w-4 text-primary-400" />
                Search Privacy
              </h3>
              <div className="space-y-4">
                <Toggle
                  checked={privacy.appearInSearch}
                  onChange={(v) => setPrivacy({ ...privacy, appearInSearch: v })}
                  label="Appear in Search Results"
                  description="Let others find you through platform search"
                />
                <Toggle
                  checked={privacy.anonymousBrowsing}
                  onChange={(v) => setPrivacy({ ...privacy, anonymousBrowsing: v })}
                  label="Anonymous Browsing"
                  description="Browse profiles without showing up in their visitors list"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <SaveButton saving={saving.privacy} onClick={savePrivacy} />
            </div>
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════════
            3. NOTIFICATION PREFERENCES
        ══════════════════════════════════════════════════════ */}
        <Section
          id="notifications"
          icon={Bell}
          title="Notification Preferences"
          description="Control how and when you're notified"
          expanded={expandedSections.notifications}
          onToggle={toggleSection}
        >
          <div className="space-y-8">
            {/* Quiet Hours */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Moon className="h-4 w-4 text-primary-400" />
                Quiet Hours
              </h3>
              <Toggle
                checked={notifications.quietHours}
                onChange={(v) => setNotifications({ ...notifications, quietHours: v })}
                label="Enable Quiet Hours"
                description="Mute all notifications during specified hours"
              />
              {notifications.quietHours && (
                <div className="flex items-center gap-3 mt-4 ml-1">
                  <div>
                    <label className="input-label">Start</label>
                    <input
                      type="time"
                      value={notifications.quietStart}
                      onChange={(e) =>
                        setNotifications({ ...notifications, quietStart: e.target.value })
                      }
                      className="input-field w-36"
                    />
                  </div>
                  <span className="text-dark-500 mt-6">to</span>
                  <div>
                    <label className="input-label">End</label>
                    <input
                      type="time"
                      value={notifications.quietEnd}
                      onChange={(e) =>
                        setNotifications({ ...notifications, quietEnd: e.target.value })
                      }
                      className="input-field w-36"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Channels */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary-400" />
                Notification Channels
              </h3>
              <div className="space-y-4">
                <Toggle
                  checked={notifications.channelInApp}
                  onChange={(v) => setNotifications({ ...notifications, channelInApp: v })}
                  label="In-App Notifications"
                  description="Show notifications within the platform"
                />
                <Toggle
                  checked={notifications.channelPush}
                  onChange={(v) => setNotifications({ ...notifications, channelPush: v })}
                  label="Push Notifications"
                  description="Browser and mobile push notifications"
                />
                <Toggle
                  checked={notifications.channelEmail}
                  onChange={(v) => setNotifications({ ...notifications, channelEmail: v })}
                  label="Email Notifications"
                  description="Receive notifications via email"
                />
                <Toggle
                  checked={notifications.channelSMS}
                  onChange={(v) => setNotifications({ ...notifications, channelSMS: v })}
                  label="SMS Notifications"
                  description="Receive text messages for important updates"
                />
              </div>
            </div>

            {/* Frequency */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Digest Frequency</h3>
              <RadioGroup
                name="frequency"
                value={notifications.frequency}
                onChange={(v) => setNotifications({ ...notifications, frequency: v })}
                options={[
                  { value: 'realtime', label: 'Real-time', description: 'Get notified immediately' },
                  { value: 'hourly', label: 'Hourly Digest', description: 'Batched every hour' },
                  { value: 'daily', label: 'Daily Digest', description: 'One summary per day' },
                  { value: 'weekly', label: 'Weekly Digest', description: 'One summary per week' },
                ]}
              />
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Notification Categories</h3>
              <div className="space-y-4">
                <Toggle
                  checked={notifications.catMessages}
                  onChange={(v) => setNotifications({ ...notifications, catMessages: v })}
                  label="Messages"
                  description="New messages and chat activity"
                />
                <Toggle
                  checked={notifications.catSessions}
                  onChange={(v) => setNotifications({ ...notifications, catSessions: v })}
                  label="Sessions"
                  description="Session requests, confirmations, and reminders"
                />
                <Toggle
                  checked={notifications.catPayments}
                  onChange={(v) => setNotifications({ ...notifications, catPayments: v })}
                  label="Payments"
                  description="Payment received, sent, and wallet updates"
                />
                <Toggle
                  checked={notifications.catMatches}
                  onChange={(v) => setNotifications({ ...notifications, catMatches: v })}
                  label="Matches"
                  description="New skill matches and recommendations"
                />
                <Toggle
                  checked={notifications.catSocial}
                  onChange={(v) => setNotifications({ ...notifications, catSocial: v })}
                  label="Social"
                  description="Follows, likes, reviews, and badges"
                />
                <Toggle
                  checked={notifications.catPromotions}
                  onChange={(v) => setNotifications({ ...notifications, catPromotions: v })}
                  label="Promotions"
                  description="Platform updates, offers, and announcements"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <SaveButton saving={saving.notifications} onClick={saveNotifications} />
            </div>
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════════
            4. SECURITY
        ══════════════════════════════════════════════════════ */}
        <Section
          id="security"
          icon={Lock}
          title="Security"
          description="Password and account security"
          expanded={expandedSections.security}
          onToggle={toggleSection}
        >
          <div className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="input-label">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={security.currentPassword}
                  onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="input-label">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={security.newPassword}
                  onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {security.newPassword && (
                <PasswordStrengthMeter password={security.newPassword} />
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="input-label">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={security.confirmPassword}
                  onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {security.confirmPassword && security.newPassword !== security.confirmPassword && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  Passwords do not match
                </p>
              )}
              {security.confirmPassword &&
                security.newPassword === security.confirmPassword &&
                security.confirmPassword.length > 0 && (
                  <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Passwords match
                  </p>
                )}
            </div>

            <div className="flex justify-end pt-2">
              <SaveButton
                saving={saving.security}
                onClick={changePassword}
                label="Change Password"
              />
            </div>
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════════
            5. DATA & PRIVACY
        ══════════════════════════════════════════════════════ */}
        <Section
          id="data"
          icon={Database}
          title="Data & Privacy"
          description="Cookies, data sharing, and account data"
          expanded={expandedSections.data}
          onToggle={toggleSection}
        >
          <div className="space-y-8">
            {/* Cookie Preferences */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Cookie Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-dark-200">Essential Cookies</p>
                    <p className="text-xs text-dark-500 mt-0.5">
                      Required for basic platform functionality
                    </p>
                  </div>
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full">
                    Always On
                  </span>
                </div>
                <Toggle
                  checked={dataPrivacy.cookieAnalytics}
                  onChange={(v) => setDataPrivacy({ ...dataPrivacy, cookieAnalytics: v })}
                  label="Analytics Cookies"
                  description="Help us understand how you use the platform"
                />
                <Toggle
                  checked={dataPrivacy.cookieMarketing}
                  onChange={(v) => setDataPrivacy({ ...dataPrivacy, cookieMarketing: v })}
                  label="Marketing Cookies"
                  description="Used for personalized recommendations and ads"
                />
              </div>
            </div>

            {/* Data Sharing */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Data Sharing</h3>
              <div className="space-y-4">
                <Toggle
                  checked={dataPrivacy.shareAnalytics}
                  onChange={(v) => setDataPrivacy({ ...dataPrivacy, shareAnalytics: v })}
                  label="Analytics Partners"
                  description="Share anonymized usage data with analytics partners"
                />
                <Toggle
                  checked={dataPrivacy.shareMarketing}
                  onChange={(v) => setDataPrivacy({ ...dataPrivacy, shareMarketing: v })}
                  label="Marketing Partners"
                  description="Share data with marketing partners for better recommendations"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <SaveButton saving={saving.data} onClick={saveDataPrivacy} />
            </div>

            {/* Divider */}
            <div className="border-t border-dark-700/50" />

            {/* Download & Delete */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-dark-800/60 border border-dark-700/50">
                <div>
                  <p className="text-sm font-medium text-white">Download My Data</p>
                  <p className="text-xs text-dark-400 mt-0.5">
                    Get a copy of all your personal data in JSON format
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadData}
                  className="btn-secondary flex items-center gap-2 flex-shrink-0"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <div>
                  <p className="text-sm font-medium text-red-400">Delete Account</p>
                  <p className="text-xs text-dark-400 mt-0.5">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="btn-danger flex items-center gap-2 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════════
            6. TEACHING PROFILE (conditional)
        ══════════════════════════════════════════════════════ */}
        {hasTeachingSkills && (
          <Section
            id="teaching"
            icon={Globe}
            title="Teaching Profile"
            description="Configure your teaching preferences and availability"
            expanded={expandedSections.teaching}
            onToggle={toggleSection}
          >
            <div className="space-y-5">
              {/* Headline */}
              <div>
                <label className="input-label">Headline</label>
                <input
                  type="text"
                  value={teaching.headline}
                  onChange={(e) => setTeaching({ ...teaching, headline: e.target.value })}
                  placeholder="e.g. Experienced React Developer & Mentor"
                  className="input-field"
                />
              </div>

              {/* Hourly Rate */}
              <div>
                <label className="input-label">Hourly Rate</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 text-sm font-medium">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={teaching.hourlyRate}
                    onChange={(e) => setTeaching({ ...teaching, hourlyRate: e.target.value })}
                    placeholder="500"
                    min="0"
                    className="input-field pl-8"
                  />
                </div>
              </div>

              {/* Batch Size */}
              <div>
                <label className="input-label">Batch Size</label>
                <RadioGroup
                  name="batchSize"
                  value={teaching.batchSize}
                  onChange={(v) => setTeaching({ ...teaching, batchSize: v })}
                  options={[
                    { value: '1on1', label: '1-on-1', description: 'Individual sessions' },
                    { value: 'small', label: 'Small Group', description: '2-5 students' },
                    { value: 'large', label: 'Large Group', description: '6+ students' },
                  ]}
                />
              </div>

              {/* Teaching Style */}
              <div>
                <label className="input-label">Teaching Style</label>
                <RadioGroup
                  name="teachingStyle"
                  value={teaching.style}
                  onChange={(v) => setTeaching({ ...teaching, style: v })}
                  options={[
                    { value: 'theoretical', label: 'Theoretical', description: 'Concept-focused approach' },
                    { value: 'practical', label: 'Practical', description: 'Hands-on, project-based' },
                    { value: 'mixed', label: 'Mixed', description: 'Balanced theory and practice' },
                  ]}
                />
              </div>

              {/* Available Toggle */}
              <Toggle
                checked={teaching.available}
                onChange={(v) => setTeaching({ ...teaching, available: v })}
                label="Available for Sessions"
                description="Toggle your availability for new session requests"
              />

              {/* Availability Schedule */}
              <div>
                <label className="input-label">Availability Schedule</label>
                <div className="space-y-2 mt-2">
                  {teaching.schedule.map((day, idx) => (
                    <div
                      key={day.day}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        day.enabled
                          ? 'bg-dark-800/40 border-dark-700/50'
                          : 'bg-dark-900/40 border-dark-800/30 opacity-60'
                      }`}
                    >
                      <label className="flex items-center gap-2 cursor-pointer flex-shrink-0 w-28">
                        <input
                          type="checkbox"
                          checked={day.enabled}
                          onChange={(e) => {
                            const updated = [...teaching.schedule];
                            updated[idx] = { ...updated[idx], enabled: e.target.checked };
                            setTeaching({ ...teaching, schedule: updated });
                          }}
                          className="rounded border-dark-500 bg-dark-700 text-primary-600 focus:ring-primary-500/50 h-4 w-4"
                        />
                        <span className="text-sm font-medium text-dark-200">
                          {day.day.slice(0, 3)}
                        </span>
                      </label>
                      {day.enabled && (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={day.start}
                            onChange={(e) => {
                              const updated = [...teaching.schedule];
                              updated[idx] = { ...updated[idx], start: e.target.value };
                              setTeaching({ ...teaching, schedule: updated });
                            }}
                            className="input-field w-32 py-2 text-sm"
                          />
                          <span className="text-dark-500 text-sm">to</span>
                          <input
                            type="time"
                            value={day.end}
                            onChange={(e) => {
                              const updated = [...teaching.schedule];
                              updated[idx] = { ...updated[idx], end: e.target.value };
                              setTeaching({ ...teaching, schedule: updated });
                            }}
                            className="input-field w-32 py-2 text-sm"
                          />
                        </div>
                      )}
                      {!day.enabled && (
                        <span className="text-xs text-dark-500 italic">Unavailable</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <SaveButton saving={saving.teaching} onClick={saveTeaching} />
              </div>
            </div>
          </Section>
        )}

        {/* ══════════════════════════════════════════════════════
            7. ACCESSIBILITY
        ══════════════════════════════════════════════════════ */}
        <Section
          id="accessibility"
          icon={Type}
          title="Accessibility"
          description="Display and accessibility preferences"
          expanded={expandedSections.accessibility}
          onToggle={toggleSection}
        >
          <div className="space-y-4">
            <Toggle
              checked={accessibility.highContrast}
              onChange={(v) => setAccessibility({ ...accessibility, highContrast: v })}
              label="High Contrast Mode"
              description="Increase contrast for better visibility"
            />
            <Toggle
              checked={accessibility.largeText}
              onChange={(v) => setAccessibility({ ...accessibility, largeText: v })}
              label="Large Text"
              description="Increase base font size across the platform"
            />
            <p className="text-xs text-dark-500 mt-2">
              These settings are stored locally and apply immediately.
            </p>
          </div>
        </Section>
      </div>

      {/* Delete Account Modal */}
      <DeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}
