import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Loader2,
  Clock,
  IndianRupee,
  Star,
  Check,
  X,
  Play,
  Square,
  Video,
  Monitor,
  MessageSquare,
  ChevronRight,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Shield,
  Timer,
  Award,
  ExternalLink,
  Clipboard,
  Users,
  Zap,
  CalendarCheck,
  XCircle,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sessionAPI } from '../services/api';
import { mockSessions, mockUsers } from '../data/mockData';
import { SESSION_TYPES, PAYMENT_METHODS } from '../utils/constants';

// ── helpers ─────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/15', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-400', bg: 'bg-blue-500/15', icon: CalendarCheck },
  escrow_paid: { label: 'Escrow Paid', color: 'text-purple-400', bg: 'bg-purple-500/15', icon: Shield },
  in_progress: { label: 'In Progress', color: 'text-emerald-400', bg: 'bg-emerald-500/15', icon: Play },
  completed: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-500/15', icon: CheckCircle2 },
  outcome_pending: { label: 'Outcome Pending', color: 'text-orange-400', bg: 'bg-orange-500/15', icon: AlertCircle },
  disputed: { label: 'Disputed', color: 'text-red-400', bg: 'bg-red-500/15', icon: AlertCircle },
  cancelled: { label: 'Cancelled', color: 'text-gray-400', bg: 'bg-gray-500/15', icon: XCircle },
  scheduled: { label: 'Scheduled', color: 'text-blue-400', bg: 'bg-blue-500/15', icon: CalendarCheck },
};

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

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

// ── session timer ───────────────────────────────────────────
function SessionTimer({ startTime }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = startTime ? new Date(startTime).getTime() : Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const hrs = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;
  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-3">
      <Timer className="h-5 w-5 text-emerald-400 animate-pulse" />
      <span className="text-2xl font-mono font-bold text-emerald-400">
        {hrs > 0 ? `${pad(hrs)}:` : ''}{pad(mins)}:{pad(secs)}
      </span>
    </div>
  );
}

// ── star rating ─────────────────────────────────────────────
function StarRating({ rating, setRating }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`h-8 w-8 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}

// ── session card ────────────────────────────────────────────
function SessionCard({ session, onClick, active }) {
  const status = STATUS_CONFIG[session.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;
  const otherName = session.teacherName || session.learnerName;
  const typeLabel = SESSION_TYPES[session.type]?.label || session.type;

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 transition-all ${
        active
          ? 'border-blue-500/40 bg-blue-500/10'
          : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/5'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-white">{session.skill}</span>
        <span className={`flex items-center gap-1 rounded-full ${status.bg} px-2 py-0.5 text-xs font-medium ${status.color}`}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </span>
      </div>
      <p className="text-xs text-gray-400">with {otherName}</p>
      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(session.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
        <span className="flex items-center gap-1">
          <IndianRupee className="h-3 w-3" />
          {session.price}
        </span>
        <span className="text-xs text-gray-600">{typeLabel}</span>
      </div>
    </motion.button>
  );
}

// ── session detail ──────────────────────────────────────────
function SessionDetail({ session, onUpdate, onToast }) {
  const [status, setStatus] = useState(session.status);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [outcomeAchieved, setOutcomeAchieved] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [tools, setTools] = useState({ screenShare: false, whiteboard: false, chat: true });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setStatus(session.status);
    setRating(0);
    setReview('');
    setOutcomeAchieved(null);
    setFeedback('');
  }, [session.id, session.status]);

  const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const StatusIcon = statusInfo.icon;

  async function handleAction(action) {
    setSubmitting(true);
    try {
      switch (action) {
        case 'confirm':
          await sessionAPI.confirm(session.id);
          setStatus('confirmed');
          break;
        case 'pay':
          await sessionAPI.pay(session.id, { method: paymentMethod });
          setStatus('escrow_paid');
          break;
        case 'start':
          await sessionAPI.start(session.id);
          setStatus('in_progress');
          break;
        case 'end':
          setStatus('outcome_pending');
          break;
        case 'verify':
          await sessionAPI.verifyOutcome(session.id, { achieved: outcomeAchieved, feedback });
          setStatus('completed');
          break;
        case 'rate':
          await sessionAPI.rate(session.id, { rating, review });
          onToast({ message: 'Review submitted! Thank you.', type: 'success' });
          break;
        case 'cancel':
          await sessionAPI.cancel(session.id, { reason: 'User cancelled' });
          setStatus('cancelled');
          break;
        default:
          break;
      }
      onToast({ message: `Session ${action === 'pay' ? 'payment completed' : action + 'ed'} successfully!`, type: 'success' });
      onUpdate(session.id, action === 'cancel' ? 'cancelled' : status);
    } catch {
      // Demo fallback — still update the UI
      switch (action) {
        case 'confirm': setStatus('confirmed'); break;
        case 'pay': setStatus('escrow_paid'); break;
        case 'start': setStatus('in_progress'); break;
        case 'end': setStatus('outcome_pending'); break;
        case 'verify': setStatus('completed'); break;
        case 'cancel': setStatus('cancelled'); break;
        default: break;
      }
      onToast({ message: `Action completed (demo mode).`, type: 'success' });
    } finally {
      setSubmitting(false);
    }
  }

  // Step flow indicator
  const steps = ['pending', 'confirmed', 'escrow_paid', 'in_progress', 'outcome_pending', 'completed'];
  const currentStepIdx = steps.indexOf(status);

  return (
    <motion.div
      key={session.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-5"
    >
      {/* Header */}
      <GlassCard className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">{session.skill}</h2>
            <p className="mt-1 text-sm text-gray-400">
              with <span className="text-white">{session.teacherName || session.learnerName}</span>
            </p>
          </div>
          <span className={`flex items-center gap-1.5 rounded-full ${statusInfo.bg} px-3 py-1 text-sm font-semibold ${statusInfo.color}`}>
            <StatusIcon className="h-4 w-4" />
            {statusInfo.label}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
            <p className="text-xs text-gray-500">Scheduled</p>
            <p className="text-sm font-semibold text-white mt-0.5">
              {new Date(session.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
            <p className="text-xs text-gray-500">Duration</p>
            <p className="text-sm font-semibold text-white mt-0.5">{session.duration} min</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
            <p className="text-xs text-gray-500">Amount</p>
            <p className="text-sm font-semibold text-white mt-0.5 flex items-center justify-center gap-0.5">
              <IndianRupee className="h-3.5 w-3.5" />{session.price}
            </p>
          </div>
        </div>

        {/* Step progress */}
        {status !== 'cancelled' && status !== 'disputed' && (
          <div className="mt-5">
            <div className="flex items-center justify-between">
              {steps.map((step, i) => {
                const completed = i <= currentStepIdx;
                const isCurrent = i === currentStepIdx;
                return (
                  <div key={step} className="flex items-center">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white ring-2 ring-blue-500/40'
                          : completed
                          ? 'bg-green-600 text-white'
                          : 'bg-white/10 text-gray-600'
                      }`}
                    >
                      {completed && !isCurrent ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`mx-1 h-0.5 w-4 sm:w-8 ${i < currentStepIdx ? 'bg-green-600' : 'bg-white/10'}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-gray-600">
              {['Pending', 'Confirmed', 'Paid', 'Live', 'Review', 'Done'].map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      {/* ── Step-specific content ──────────────────── */}

      {/* Step 1: Pending */}
      {status === 'pending' && (
        <GlassCard className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">Confirm this session?</h3>
          <p className="text-sm text-gray-400 mb-4">Review the details above and confirm to proceed.</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleAction('confirm')}
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-40"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Confirm Session
            </button>
            <button
              onClick={() => handleAction('cancel')}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 text-sm text-gray-400 hover:bg-white/5"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          </div>
        </GlassCard>
      )}

      {/* Step 1b: Scheduled (same as confirmed) */}
      {status === 'scheduled' && (
        <GlassCard className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">Session Scheduled</h3>
          <p className="text-sm text-gray-400 mb-4">This session is scheduled. Proceed with payment to lock it in.</p>
          <button
            onClick={() => setStatus('confirmed')}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
          >
            <Check className="h-4 w-4" /> Confirm & Pay
          </button>
        </GlassCard>
      )}

      {/* Step 2: Confirmed → Pay */}
      {status === 'confirmed' && (
        <GlassCard className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-white flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-purple-400" /> Pay Escrow
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Pay <span className="font-semibold text-white">₹{session.price}</span> to secure this session. Amount held in escrow until completion.
          </p>
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.entries(PAYMENT_METHODS).map(([key, method]) => (
              <button
                key={key}
                onClick={() => setPaymentMethod(key)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all ${
                  paymentMethod === key
                    ? 'border-purple-500/40 bg-purple-500/10 text-purple-300'
                    : 'border-white/10 text-gray-400 hover:bg-white/5'
                }`}
              >
                <span className="text-lg">{method.icon}</span>
                <span className="text-xs">{method.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => handleAction('pay')}
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-40"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            Pay ₹{session.price}
          </button>
        </GlassCard>
      )}

      {/* Step 3: Escrow Paid → Start */}
      {status === 'escrow_paid' && (
        <GlassCard className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-white flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" /> Ready to Start
          </h3>
          <p className="text-sm text-gray-400 mb-4">Payment secured. Start the session when both parties are ready.</p>

          <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-gray-500 mb-2">Meeting Link</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value="https://meet.skillx.in/session-room-xyz123"
                className="flex-1 rounded-lg bg-white/5 px-3 py-2 text-sm text-blue-400 outline-none"
              />
              <button className="rounded-lg bg-white/10 p-2 hover:bg-white/15 transition-colors">
                <Clipboard className="h-4 w-4 text-gray-400" />
              </button>
              <a
                href="#"
                className="rounded-lg bg-white/10 p-2 hover:bg-white/15 transition-colors"
              >
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
            </div>
          </div>

          <button
            onClick={() => handleAction('start')}
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-40"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Start Session
          </button>
        </GlassCard>
      )}

      {/* Step 4: In Progress */}
      {status === 'in_progress' && (
        <GlassCard className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-emerald-400 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Session Live
          </h3>

          <SessionTimer startTime={session.scheduledAt} />

          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tools</p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'screenShare', label: 'Screen Share', icon: Monitor },
                { key: 'whiteboard', label: 'Whiteboard', icon: Clipboard },
                { key: 'chat', label: 'Chat', icon: MessageSquare },
              ].map((tool) => (
                <button
                  key={tool.key}
                  onClick={() => setTools((p) => ({ ...p, [tool.key]: !p[tool.key] }))}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-all ${
                    tools[tool.key]
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-white/10 text-gray-500 hover:bg-white/5'
                  }`}
                >
                  <tool.icon className="h-4 w-4" />
                  {tool.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleAction('end')}
            disabled={submitting}
            className="mt-5 flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-40"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
            End Session
          </button>
        </GlassCard>
      )}

      {/* Step 5: Outcome Pending */}
      {status === 'outcome_pending' && (
        <GlassCard className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-white flex items-center gap-2">
            <Target className="h-4 w-4 text-orange-400" /> Outcome Verification
          </h3>
          <p className="text-sm text-gray-400 mb-4">Did you achieve the expected outcome from this session?</p>

          <div className="mb-4 flex gap-3">
            <button
              onClick={() => setOutcomeAchieved(true)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-all ${
                outcomeAchieved === true
                  ? 'border-green-500/40 bg-green-500/15 text-green-400'
                  : 'border-white/10 text-gray-400 hover:bg-white/5'
              }`}
            >
              <ThumbsUp className="h-5 w-5" /> Yes
            </button>
            <button
              onClick={() => setOutcomeAchieved(false)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-all ${
                outcomeAchieved === false
                  ? 'border-red-500/40 bg-red-500/15 text-red-400'
                  : 'border-white/10 text-gray-400 hover:bg-white/5'
              }`}
            >
              <ThumbsDown className="h-5 w-5" /> No
            </button>
          </div>

          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your feedback about the session..."
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500/50 resize-none"
          />

          <button
            onClick={() => handleAction('verify')}
            disabled={outcomeAchieved === null || submitting}
            className="mt-4 flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-40"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Submit Verification
          </button>
        </GlassCard>
      )}

      {/* Step 6: Completed */}
      {status === 'completed' && (
        <div className="space-y-5">
          {/* Skill Capsule */}
          <GlassCard className="p-5 border-emerald-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-emerald-400">Skill Capsule Generated</h3>
                <p className="text-xs text-gray-400">Proof of learning for "{session.skill}"</p>
              </div>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{session.skill} Capsule</span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400">Verified</span>
              </div>
              <p className="text-xs text-gray-400">Duration: {session.duration} min | {new Date(session.scheduledAt).toLocaleDateString('en-IN')}</p>
            </div>
          </GlassCard>

          {/* Payment Released */}
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15">
                <IndianRupee className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Payment Released</p>
                <p className="text-xs text-gray-400">₹{session.price} has been released from escrow</p>
              </div>
              <CheckCircle2 className="ml-auto h-5 w-5 text-green-400" />
            </div>
          </GlassCard>

          {/* Rating form */}
          {!session.rating && (
            <GlassCard className="p-5">
              <h3 className="mb-4 text-sm font-semibold text-white flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" /> Rate this session
              </h3>
              <div className="mb-4">
                <StarRating rating={rating} setRating={setRating} />
              </div>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write a review..."
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500/50 resize-none"
              />
              <button
                onClick={() => handleAction('rate')}
                disabled={rating === 0 || submitting}
                className="mt-3 flex items-center gap-2 rounded-xl bg-yellow-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-yellow-500 disabled:opacity-40"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
                Submit Review
              </button>
            </GlassCard>
          )}

          {/* Existing rating */}
          {session.rating && (
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-bold text-white">{session.rating}</span>
                <span className="text-sm text-gray-400">/ 5</span>
              </div>
              {session.notes && <p className="text-sm text-gray-400">{session.notes}</p>}
            </GlassCard>
          )}
        </div>
      )}

      {/* Cancelled */}
      {status === 'cancelled' && (
        <GlassCard className="p-5 border-red-500/20">
          <div className="flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-400" />
            <div>
              <h3 className="text-sm font-semibold text-red-400">Session Cancelled</h3>
              <p className="text-xs text-gray-400 mt-0.5">{session.notes || 'This session has been cancelled.'}</p>
            </div>
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}

// ── main component ──────────────────────────────────────────
export default function SessionFlow() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSession, setSelectedSession] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function fetchSessions() {
      setLoading(true);
      try {
        const res = await sessionAPI.getMySessions();
        const data = res.data.data || res.data.sessions || [];
        const sessionsArray = Array.isArray(data) ? data : [];
        // Normalize session data structure
        const normalized = sessionsArray.map(s => ({
          ...s,
          id: s.id || s._id,
          teacherName: s.teacher?.name || s.teacherName,
          learnerName: s.learner?.name || s.learnerName,
          scheduledAt: s.scheduling?.date || s.scheduledAt,
          price: s.payment?.amount || s.price,
          duration: s.scheduling?.duration || s.duration,
          type: s.sessionType || s.type,
        }));
        setSessions(normalized);
      } catch {
        setSessions(mockSessions);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  // Auto-select session from URL param
  useEffect(() => {
    if (paramId && sessions.length > 0) {
      const found = sessions.find((s) => s.id === paramId);
      if (found) setSelectedSession(found);
    }
  }, [paramId, sessions]);

  const filteredSessions = useMemo(() => {
    if (!Array.isArray(sessions)) return [];
    if (activeTab === 'all') return sessions;
    if (activeTab === 'upcoming') return sessions.filter((s) => ['pending', 'confirmed', 'escrow_paid', 'scheduled'].includes(s.status));
    if (activeTab === 'in_progress') return sessions.filter((s) => s.status === 'in_progress');
    if (activeTab === 'completed') return sessions.filter((s) => ['completed', 'outcome_pending'].includes(s.status));
    if (activeTab === 'cancelled') return sessions.filter((s) => ['cancelled', 'disputed'].includes(s.status));
    return sessions;
  }, [sessions, activeTab]);

  function handleSessionUpdate(sessionId, newStatus) {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: newStatus } : s))
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AnimatePresence>{toast && <Toast {...toast} onClose={() => setToast(null)} />}</AnimatePresence>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold">Sessions</h1>
          <p className="mt-1 text-sm text-gray-400">Manage your learning and teaching sessions</p>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSelectedSession(null); }}
                className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-[340px,1fr]">
          {/* Session list */}
          <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CalendarCheck className="mb-3 h-12 w-12 text-gray-700" />
                <p className="text-sm text-gray-400">No sessions found</p>
              </div>
            ) : (
              filteredSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  active={selectedSession?.id === session.id}
                  onClick={() => setSelectedSession(session)}
                />
              ))
            )}
          </div>

          {/* Session detail */}
          <div>
            {selectedSession ? (
              <SessionDetail
                session={selectedSession}
                onUpdate={handleSessionUpdate}
                onToast={setToast}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5">
                  <Sparkles className="h-10 w-10 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-white">Select a session</h3>
                <p className="mt-1 max-w-xs text-sm text-gray-400">
                  Click on a session from the list to view details and manage the session flow.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
