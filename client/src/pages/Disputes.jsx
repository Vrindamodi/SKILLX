import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  Bot,
  User,
  Gavel,
  ChevronRight,
  ArrowLeft,
  Plus,
  X,
  Upload,
  IndianRupee,
  Loader2,
  FileText,
  MessageSquare,
  Scale,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { disputeAPI } from '../services/api';
import { mockUsers, mockSessions } from '../data/mockData';

// ── animations ──────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
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
  return `${days}d ago`;
}

// Status config
const STATUS_CONFIG = {
  open: { label: 'Open', color: 'bg-blue-500/15 text-blue-300', icon: Clock },
  ai_review: { label: 'AI Review', color: 'bg-purple-500/15 text-purple-300', icon: Bot },
  manual_review: { label: 'Manual Review', color: 'bg-orange-500/15 text-orange-300', icon: User },
  arbitration: { label: 'Arbitration', color: 'bg-red-500/15 text-red-300', icon: Gavel },
  resolved: { label: 'Resolved', color: 'bg-emerald-500/15 text-emerald-300', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-gray-500/15 text-gray-400', icon: XCircle },
};

const RESOLUTION_TYPES = {
  full_refund: { label: 'Full Refund', color: 'text-emerald-400' },
  partial_refund: { label: 'Partial Refund', color: 'text-yellow-400' },
  released: { label: 'Funds Released to Teacher', color: 'text-blue-400' },
  no_action: { label: 'No Action Required', color: 'text-gray-400' },
};

const REASONS = [
  'Session did not happen',
  'Teacher was late or absent',
  'Quality of teaching was poor',
  'Session was shorter than agreed',
  'Skill mismatch — not what was advertised',
  'Inappropriate behavior',
  'Payment issue',
  'Other',
];

// Mock disputes
const mockDisputes = [
  {
    id: 'disp1',
    sessionId: 'session1',
    session: mockSessions[0],
    reason: 'Session was shorter than agreed',
    description: 'The session was supposed to be 60 minutes but the teacher ended it after 40 minutes without covering all the topics.',
    status: 'resolved',
    disputedAmount: 600,
    createdAt: '2026-02-03T10:00:00Z',
    resolution: {
      type: 'partial_refund',
      amount: 200,
      note: 'Partial refund issued for the uncovered time. Teacher has been notified.',
    },
    aiAnalysis: {
      confidence: 0.87,
      summary: 'Session logs indicate the session ended 20 minutes early. Chat messages confirm topics were not fully covered. Recommending partial refund.',
      recommendation: 'partial_refund',
    },
    timeline: [
      { event: 'Dispute opened', date: '2026-02-03T10:00:00Z', icon: 'open' },
      { event: 'AI review started', date: '2026-02-03T10:01:00Z', icon: 'ai' },
      { event: 'AI analysis complete — recommends partial refund', date: '2026-02-03T10:05:00Z', icon: 'ai' },
      { event: 'Admin review confirmed AI recommendation', date: '2026-02-03T14:00:00Z', icon: 'admin' },
      { event: 'Resolved — ₹200 refunded', date: '2026-02-03T14:05:00Z', icon: 'resolved' },
    ],
  },
  {
    id: 'disp2',
    sessionId: 'session2',
    session: mockSessions[1],
    reason: 'Quality of teaching was poor',
    description: 'The teacher seemed unprepared and just read from a textbook. No practical examples or exercises were provided despite the listing promising hands-on learning.',
    status: 'ai_review',
    disputedAmount: 1050,
    createdAt: '2026-02-08T16:00:00Z',
    resolution: null,
    aiAnalysis: null,
    timeline: [
      { event: 'Dispute opened', date: '2026-02-08T16:00:00Z', icon: 'open' },
      { event: 'AI review started', date: '2026-02-08T16:01:00Z', icon: 'ai' },
    ],
  },
  {
    id: 'disp3',
    sessionId: 'session5',
    session: mockSessions[4],
    reason: 'Session did not happen',
    description: 'The teacher cancelled last minute but the payment was already deducted from my wallet. Need a full refund.',
    status: 'manual_review',
    disputedAmount: 450,
    createdAt: '2026-01-29T09:00:00Z',
    resolution: null,
    aiAnalysis: {
      confidence: 0.65,
      summary: 'Session status is "cancelled". However, the cancellation was initiated by the learner 2 hours before. Need manual verification of cancellation policy.',
      recommendation: 'manual_review',
    },
    timeline: [
      { event: 'Dispute opened', date: '2026-01-29T09:00:00Z', icon: 'open' },
      { event: 'AI review started', date: '2026-01-29T09:01:00Z', icon: 'ai' },
      { event: 'AI analysis complete — confidence too low, escalating', date: '2026-01-29T09:05:00Z', icon: 'ai' },
      { event: 'Escalated to manual review', date: '2026-01-29T09:06:00Z', icon: 'admin' },
    ],
  },
];

// ── Timeline Item ───────────────────────────────────────────
function TimelineItem({ event, isLast }) {
  const iconMap = {
    open: <Clock className="h-4 w-4 text-blue-400" />,
    ai: <Bot className="h-4 w-4 text-purple-400" />,
    admin: <User className="h-4 w-4 text-orange-400" />,
    resolved: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  };

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5">
          {iconMap[event.icon] || <Clock className="h-4 w-4 text-gray-500" />}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-white/10 mt-1" />}
      </div>
      <div className="pb-6">
        <p className="text-sm text-white">{event.event}</p>
        <p className="text-xs text-gray-500">{new Date(event.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    </div>
  );
}

// ── Dispute Detail View ─────────────────────────────────────
function DisputeDetail({ dispute, onBack }) {
  const statusCfg = STATUS_CONFIG[dispute.status];
  const StatusIcon = statusCfg.icon;
  const resType = dispute.resolution ? RESOLUTION_TYPES[dispute.resolution.type] : null;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <button onClick={onBack} className="mb-4 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Disputes
      </button>

      <GlassCard className="p-6 mb-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-lg font-semibold text-white">Dispute #{dispute.id.replace('disp', '')}</h2>
              <span className={`flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-medium ${statusCfg.color}`}>
                <StatusIcon className="h-3.5 w-3.5" />{statusCfg.label}
              </span>
            </div>
            <p className="text-sm text-gray-400">{dispute.session.skill} session with {dispute.session.teacherName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Disputed Amount</p>
            <p className="text-xl font-bold text-red-400">₹{dispute.disputedAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Reason & Description */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Reason</p>
          <p className="text-sm text-white">{dispute.reason}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-3 mb-1">Description</p>
          <p className="text-sm text-gray-300">{dispute.description}</p>
        </div>

        {/* AI Analysis */}
        {dispute.aiAnalysis && (
          <GlassCard className="p-4 mb-6 border-purple-500/20 bg-purple-500/5">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="h-5 w-5 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">AI Analysis</h3>
              <span className="ml-auto text-xs text-gray-400">
                Confidence: <strong className={dispute.aiAnalysis.confidence >= 0.8 ? 'text-emerald-400' : 'text-yellow-400'}>{Math.round(dispute.aiAnalysis.confidence * 100)}%</strong>
              </span>
            </div>
            <p className="text-sm text-gray-300">{dispute.aiAnalysis.summary}</p>
          </GlassCard>
        )}

        {/* Resolution */}
        {dispute.resolution && resType && (
          <GlassCard className="p-4 mb-6 border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Resolution</h3>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-sm font-semibold ${resType.color}`}>{resType.label}</span>
              {dispute.resolution.amount > 0 && (
                <span className="text-sm text-white">— ₹{dispute.resolution.amount.toLocaleString()} refunded</span>
              )}
            </div>
            <p className="text-sm text-gray-400">{dispute.resolution.note}</p>
          </GlassCard>
        )}

        {/* Timeline */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Timeline</h3>
          <div>
            {dispute.timeline.map((event, i) => (
              <TimelineItem key={i} event={event} isLast={i === dispute.timeline.length - 1} />
            ))}
          </div>
        </div>

        {/* Appeal Button */}
        {dispute.status === 'resolved' && (
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/5 transition-colors">
              <RefreshCw className="h-4 w-4" />Appeal Decision
            </button>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}

// ── Create Dispute Form ─────────────────────────────────────
function CreateDisputeForm({ onClose, onSubmit }) {
  const [selectedSession, setSelectedSession] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const eligibleSessions = mockSessions.filter(
    (s) => s.status === 'completed' || s.status === 'cancelled'
  );

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
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-gray-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Create Dispute</h2>
            <button onClick={onClose} className="rounded-lg p-2 hover:bg-white/10">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Session Selection */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Select Session</label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
              >
                <option value="">Choose a session...</option>
                {eligibleSessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.skill} with {s.teacherName} — ₹{s.price} ({s.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
              >
                <option value="">Select a reason...</option>
                {REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened in detail..."
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50 resize-none"
              />
            </div>

            {/* Evidence Upload Placeholder */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Evidence (Optional)</label>
              <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] p-8 transition-colors hover:border-white/20 cursor-pointer">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-600 mb-2" />
                  <p className="text-sm text-gray-400">Click to upload screenshots or files</p>
                  <p className="text-xs text-gray-600 mt-1">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                onSubmit({ sessionId: selectedSession, reason, description });
                onClose();
              }}
              disabled={!selectedSession || !reason || !description}
              className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit Dispute
            </button>
            <button onClick={onClose} className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-gray-400 hover:bg-white/5 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── main component ──────────────────────────────────────────
export default function Disputes() {
  const { user } = useAuth();
  const currentUser = user || mockUsers[0];

  const [disputes, setDisputes] = useState(mockDisputes);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchDisputes() {
      setLoading(true);
      try {
        const res = await disputeAPI.getMyDisputes();
        if (!cancelled && res?.data?.disputes) setDisputes(res.data.disputes);
      } catch {
        // keep mock
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchDisputes();
    return () => { cancelled = true; };
  }, []);

  const handleCreateDispute = async (data) => {
    try {
      await disputeAPI.create(data);
    } catch {
      // Mock add
      const session = mockSessions.find((s) => s.id === data.sessionId);
      if (session) {
        const newDispute = {
          id: `disp${disputes.length + 1}`,
          sessionId: data.sessionId,
          session,
          reason: data.reason,
          description: data.description,
          status: 'open',
          disputedAmount: session.price,
          createdAt: new Date().toISOString(),
          resolution: null,
          aiAnalysis: null,
          timeline: [{ event: 'Dispute opened', date: new Date().toISOString(), icon: 'open' }],
        };
        setDisputes((prev) => [newDispute, ...prev]);
      }
    }
  };

  const selected = disputes.find((d) => d.id === selectedDispute);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/15">
                <Shield className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">Disputes</h1>
                <p className="text-sm text-gray-400">Manage and resolve session disputes</p>
              </div>
            </div>
            {!selected && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-500 transition-colors"
              >
                <Plus className="h-4 w-4" />New Dispute
              </button>
            )}
          </div>
        </motion.div>

        {/* Detail view or list */}
        {selected ? (
          <DisputeDetail dispute={selected} onBack={() => setSelectedDispute(null)} />
        ) : (
          <>
            {/* Summary cards */}
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
              {[
                { label: 'Total', value: disputes.length, color: '#6366f1' },
                { label: 'Open', value: disputes.filter((d) => d.status === 'open' || d.status === 'ai_review' || d.status === 'manual_review').length, color: '#f59e0b' },
                { label: 'Resolved', value: disputes.filter((d) => d.status === 'resolved').length, color: '#10b981' },
                { label: 'Disputed', value: `₹${disputes.reduce((a, d) => a + d.disputedAmount, 0).toLocaleString()}`, color: '#ef4444' },
              ].map((stat) => (
                <motion.div key={stat.label} variants={item}>
                  <GlassCard className="p-4 text-center">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-gray-400">{stat.label}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>

            {/* Dispute list */}
            {disputes.length === 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5">
                  <Shield className="h-10 w-10 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-white">No disputes</h3>
                <p className="mt-1 text-sm text-gray-400">That's great! You have no open disputes.</p>
              </motion.div>
            ) : (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                {disputes.map((dispute) => {
                  const statusCfg = STATUS_CONFIG[dispute.status];
                  const StatusIcon = statusCfg.icon;
                  return (
                    <motion.div key={dispute.id} variants={item}>
                      <GlassCard
                        className="p-5 cursor-pointer transition-all hover:border-white/20"
                        onClick={() => setSelectedDispute(dispute.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-500/15">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-semibold text-white truncate">
                                {dispute.session.skill} — {dispute.reason}
                              </h3>
                              <span className={`flex items-center gap-1 flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.color}`}>
                                <StatusIcon className="h-3 w-3" />{statusCfg.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mb-2 line-clamp-1">{dispute.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>with {dispute.session.teacherName}</span>
                              <span className="flex items-center gap-1">
                                <IndianRupee className="h-3 w-3" />₹{dispute.disputedAmount.toLocaleString()}
                              </span>
                              <span>{timeAgo(dispute.createdAt)}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-600 flex-shrink-0 mt-1" />
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </>
        )}

        {/* Create Dispute Modal */}
        <AnimatePresence>
          {showCreateForm && (
            <CreateDisputeForm
              onClose={() => setShowCreateForm(false)}
              onSubmit={handleCreateDispute}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
