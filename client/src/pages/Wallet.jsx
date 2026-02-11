import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet as WalletIcon,
  IndianRupee,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Plus,
  Download,
  FileText,
  X,
  CreditCard,
  Smartphone,
  Building2,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Filter,
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Landmark,
  CircleDollarSign,
  ArrowLeftRight,
  Ban,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { transactionAPI } from '../services/api';
import { mockTransactions, mockUsers } from '../data/mockData';
import { PAYMENT_METHODS } from '../utils/constants';

// ── animation variants ──────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};
const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};
const modalContent = {
  hidden: { opacity: 0, scale: 0.92, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  exit: { opacity: 0, scale: 0.92, y: 24, transition: { duration: 0.15 } },
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

function StatusBadge({ status }) {
  const styles = {
    completed: 'bg-emerald-500/15 text-emerald-400',
    pending: 'bg-yellow-500/15 text-yellow-400',
    failed: 'bg-red-500/15 text-red-400',
    processing: 'bg-blue-500/15 text-blue-400',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

function TransactionIcon({ type }) {
  const iconMap = {
    payment: { Icon: ArrowUpRight, bg: 'bg-red-500/15', color: 'text-red-400' },
    earning: { Icon: ArrowDownLeft, bg: 'bg-emerald-500/15', color: 'text-emerald-400' },
    topup: { Icon: Plus, bg: 'bg-blue-500/15', color: 'text-blue-400' },
    withdrawal: { Icon: Download, bg: 'bg-orange-500/15', color: 'text-orange-400' },
    escrow: { Icon: ShieldCheck, bg: 'bg-purple-500/15', color: 'text-purple-400' },
    refund: { Icon: RefreshCw, bg: 'bg-cyan-500/15', color: 'text-cyan-400' },
  };
  const { Icon, bg, color } = iconMap[type] || iconMap.payment;
  return (
    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
      <Icon className={`h-5 w-5 ${color}`} />
    </div>
  );
}

const PAYMENT_OPTIONS = [
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
  { id: 'upi', label: 'UPI', icon: Smartphone },
  { id: 'wallet', label: 'Skill-X Wallet', icon: WalletIcon },
  { id: 'netbanking', label: 'Net Banking', icon: Building2 },
  { id: 'phonepe', label: 'PhonePe', icon: Smartphone },
  { id: 'gpay', label: 'Google Pay', icon: Smartphone },
];

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'payment', label: 'Payments' },
  { id: 'earning', label: 'Earnings' },
  { id: 'escrow', label: 'Escrow' },
  { id: 'withdrawal', label: 'Withdrawals' },
  { id: 'refund', label: 'Refunds' },
];

// ── monthly earnings data (mock) ────────────────────────────
const monthlyEarnings = [
  { month: 'Sep', amount: 3200 },
  { month: 'Oct', amount: 4800 },
  { month: 'Nov', amount: 3900 },
  { month: 'Dec', amount: 6100 },
  { month: 'Jan', amount: 7500 },
  { month: 'Feb', amount: 5400 },
];
const maxEarning = Math.max(...monthlyEarnings.map((m) => m.amount));

// ── saved payment methods (simulated) ───────────────────────
const savedMethods = [
  { id: 'pm1', type: 'card', label: 'HDFC Visa', last4: '4521', isDefault: true },
  { id: 'pm2', type: 'upi', label: 'UPI', value: 'user@oksbi', isDefault: false },
  { id: 'pm3', type: 'netbanking', label: 'SBI NetBanking', value: 'SBI', isDefault: false },
];

// ── Add Funds Modal ─────────────────────────────────────────
function AddFundsModal({ onClose }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const quickAmounts = [500, 1000, 2000, 5000];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!amount || Number(amount) < 1) return;
    setLoading(true);
    try {
      await transactionAPI.addFunds({ amount: Number(amount), method });
    } catch {
      // simulate success
    }
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(onClose, 1500);
    }, 1200);
  }

  return (
    <motion.div
      variants={modalOverlay}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        variants={modalContent}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Add Funds</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/10 transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center py-8">
            <CheckCircle2 className="h-16 w-16 text-emerald-400 mb-4" />
            <p className="text-lg font-semibold text-white">Funds Added Successfully!</p>
            <p className="mt-1 text-sm text-gray-400">₹{Number(amount).toLocaleString()} added to your wallet</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Amount */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">Amount</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-9 pr-4 text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50 transition-colors"
                />
              </div>
              <div className="mt-2 flex gap-2">
                {quickAmounts.map((qa) => (
                  <button
                    key={qa}
                    type="button"
                    onClick={() => setAmount(String(qa))}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-all ${
                      amount === String(qa)
                        ? 'border-blue-500/50 bg-blue-500/15 text-blue-300'
                        : 'border-white/10 text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    ₹{qa.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMethod(opt.id)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all ${
                      method === opt.id
                        ? 'border-blue-500/50 bg-blue-500/15 text-blue-300'
                        : 'border-white/10 text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <opt.icon className="h-4 w-4" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!amount || Number(amount) < 1 || loading}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-all hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {loading ? 'Processing...' : `Add ₹${amount ? Number(amount).toLocaleString() : '0'}`}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Withdraw Modal ──────────────────────────────────────────
function WithdrawModal({ onClose, balance }) {
  const [amount, setAmount] = useState('');
  const [withdrawTo, setWithdrawTo] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const amt = Number(amount);
    if (amt < 100) {
      setError('Minimum withdrawal amount is ₹100');
      return;
    }
    if (amt > balance) {
      setError('Insufficient balance');
      return;
    }
    if (withdrawTo === 'upi' && !upiId) {
      setError('Please enter your UPI ID');
      return;
    }
    if (withdrawTo === 'bank' && !bankAccount) {
      setError('Please enter your bank account number');
      return;
    }
    setLoading(true);
    try {
      await transactionAPI.withdraw({
        amount: amt,
        method: withdrawTo,
        destination: withdrawTo === 'upi' ? upiId : bankAccount,
      });
    } catch {
      // simulate success
    }
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(onClose, 1500);
    }, 1200);
  }

  return (
    <motion.div
      variants={modalOverlay}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        variants={modalContent}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Withdraw Funds</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/10 transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center py-8">
            <CheckCircle2 className="h-16 w-16 text-emerald-400 mb-4" />
            <p className="text-lg font-semibold text-white">Withdrawal Initiated!</p>
            <p className="mt-1 text-sm text-gray-400">₹{Number(amount).toLocaleString()} will be transferred within 24hrs</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Available Balance */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">Available Balance</span>
              <span className="text-lg font-bold text-white">₹{balance.toLocaleString()}</span>
            </div>

            {/* Amount */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Amount (min ₹100)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="number"
                  min="100"
                  max={balance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-9 pr-4 text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Withdraw To */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Withdraw To
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWithdrawTo('upi')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                    withdrawTo === 'upi'
                      ? 'border-blue-500/50 bg-blue-500/15 text-blue-300'
                      : 'border-white/10 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  UPI
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawTo('bank')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                    withdrawTo === 'bank'
                      ? 'border-blue-500/50 bg-blue-500/15 text-blue-300'
                      : 'border-white/10 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <Landmark className="h-4 w-4" />
                  Bank Account
                </button>
              </div>
            </div>

            {/* UPI / Bank Input */}
            {withdrawTo === 'upi' ? (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@oksbi"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50 transition-colors"
                />
              </div>
            ) : (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="e.g. 1234567890"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50 transition-colors"
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!amount || Number(amount) < 100 || loading}
              className="w-full rounded-xl bg-orange-600 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {loading ? 'Processing...' : `Withdraw ₹${amount ? Number(amount).toLocaleString() : '0'}`}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── main Wallet page ────────────────────────────────────────
export default function Wallet() {
  const { user } = useAuth();
  const currentUser = user || mockUsers[0];

  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const [walletRes, txnRes] = await Promise.all([
          transactionAPI.getWallet().catch(() => null),
          transactionAPI.getAll().catch(() => null),
        ]);
        if (!cancelled) {
          if (walletRes?.data) {
            setWalletData(walletRes.data);
          }
          if (txnRes?.data?.transactions) {
            setTransactions(txnRes.data.transactions);
          }
        }
      } catch {
        // fallback below
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  // Fallback to mock data
  const balance = walletData?.balance ?? currentUser.wallet?.balance ?? 2400;
  const pendingEscrow = walletData?.pendingEscrow ?? 2400;
  const totalEarned = walletData?.totalEarned ?? 28500;
  const totalSpent = walletData?.totalSpent ?? 14200;
  const txns = transactions.length > 0 ? transactions : mockTransactions;

  const filteredTransactions = activeFilter === 'all'
    ? txns
    : txns.filter((t) => t.type === activeFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
          {/* ── Header ──────────────────────────────── */}
          <motion.div variants={item} className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Wallet</h1>
              <p className="mt-1 text-gray-400">Manage your funds, payments, and earnings</p>
            </div>
          </motion.div>

          {/* ── Balance Card ────────────────────────── */}
          <motion.div variants={item}>
            <div className="relative overflow-hidden rounded-2xl bg-blue-600 p-6 sm:p-8 shadow-2xl">
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                    <WalletIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Available Balance</p>
                    <p className="text-3xl font-bold text-white sm:text-4xl">
                      ₹{balance.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3">
                    <div className="flex items-center gap-1.5 text-white/70 text-xs mb-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Pending Escrow
                    </div>
                    <p className="text-lg font-bold text-white">₹{pendingEscrow.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3">
                    <div className="flex items-center gap-1.5 text-white/70 text-xs mb-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Total Earned
                    </div>
                    <p className="text-lg font-bold text-emerald-300">₹{totalEarned.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3">
                    <div className="flex items-center gap-1.5 text-white/70 text-xs mb-1">
                      <TrendingDown className="h-3.5 w-3.5" />
                      Total Spent
                    </div>
                    <p className="text-lg font-bold text-red-300">₹{totalSpent.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Quick Actions ───────────────────────── */}
          <motion.div variants={item} className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setShowAddFunds(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-medium text-white transition-all hover:bg-emerald-500/15 hover:border-emerald-500/30 hover:text-emerald-300"
            >
              <Plus className="h-4 w-4" />
              Add Funds
            </button>
            <button
              onClick={() => setShowWithdraw(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-medium text-white transition-all hover:bg-orange-500/15 hover:border-orange-500/30 hover:text-orange-300"
            >
              <Download className="h-4 w-4" />
              Withdraw
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-medium text-white transition-all hover:bg-blue-500/15 hover:border-blue-500/30 hover:text-blue-300">
              <FileText className="h-4 w-4" />
              Statement
            </button>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            {/* ── Left Column ─────────────────────── */}
            <div className="space-y-8">
              {/* Transaction History */}
              <motion.div variants={item}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Transaction History</h2>
                  <span className="text-sm text-gray-500">{filteredTransactions.length} transactions</span>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-4">
                  {FILTER_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id)}
                      className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                        activeFilter === tab.id
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                          : 'border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Transaction List */}
                <GlassCard className="divide-y divide-white/5">
                  {filteredTransactions.length === 0 ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <ArrowLeftRight className="h-10 w-10 text-gray-600 mb-3" />
                      <p className="text-gray-400">No transactions found</p>
                    </div>
                  ) : (
                    filteredTransactions.map((txn) => {
                      const isPositive = txn.amount > 0;
                      return (
                        <div key={txn.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                          <TransactionIcon type={txn.type} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">{txn.description}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-500">
                                {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                              <span className="text-xs text-gray-600">via {PAYMENT_METHODS[txn.method]?.label || txn.method}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                              {isPositive ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString()}
                            </span>
                            <StatusBadge status={txn.status} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </GlassCard>
              </motion.div>
            </div>

            {/* ── Right Column ────────────────────── */}
            <div className="space-y-6">
              {/* Monthly Earnings Chart */}
              <motion.div variants={item}>
                <GlassCard className="p-5">
                  <div className="flex items-center gap-2 mb-5">
                    <CircleDollarSign className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white">Monthly Earnings</h3>
                  </div>
                  <div className="flex items-end gap-3 h-36">
                    {monthlyEarnings.map((m) => {
                      const height = maxEarning > 0 ? (m.amount / maxEarning) * 100 : 0;
                      return (
                        <div key={m.month} className="flex flex-1 flex-col items-center gap-1.5">
                          <span className="text-xs text-gray-400">₹{(m.amount / 1000).toFixed(1)}k</span>
                          <motion.div
                            className="w-full rounded-t-lg bg-blue-600"
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                          />
                          <span className="text-xs text-gray-500">{m.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              </motion.div>

              {/* Saved Payment Methods */}
              <motion.div variants={item}>
                <GlassCard className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white">Payment Methods</h3>
                    <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">+ Add New</button>
                  </div>
                  <div className="space-y-3">
                    {savedMethods.map((pm) => {
                      const iconMap = {
                        card: CreditCard,
                        upi: Smartphone,
                        netbanking: Building2,
                      };
                      const PmIcon = iconMap[pm.type] || CreditCard;
                      return (
                        <div
                          key={pm.id}
                          className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                            pm.isDefault ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/10 hover:bg-white/[0.02]'
                          }`}
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                            <PmIcon className="h-4 w-4 text-gray-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{pm.label}</p>
                            <p className="text-xs text-gray-500">
                              {pm.last4 ? `****${pm.last4}` : pm.value}
                            </p>
                          </div>
                          {pm.isDefault && (
                            <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs text-blue-300">Default</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              </motion.div>

              {/* Security Note */}
              <motion.div variants={item}>
                <GlassCard className="p-4 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Secure Transactions</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      All payments are encrypted and processed through secure gateways. Escrow protection on every session.
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Modals ───────────────────────────────── */}
      <AnimatePresence>
        {showAddFunds && <AddFundsModal onClose={() => setShowAddFunds(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showWithdraw && <WithdrawModal onClose={() => setShowWithdraw(false)} balance={balance} />}
      </AnimatePresence>
    </div>
  );
}
