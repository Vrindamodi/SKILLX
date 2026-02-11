import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Loader2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { label: 'Learner', email: 'learner@skillx.com', password: 'Demo@123', color: 'text-blue-400' },
  { label: 'Teacher', email: 'teacher@skillx.com', password: 'Demo@123', color: 'text-green-400' },
  { label: 'Admin', email: 'admin@skillx.com', password: 'Admin@123', color: 'text-red-400' },
  { label: 'User', email: 'user@skillx.com', password: 'Demo@123', color: 'text-purple-400' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: formData.email, password: formData.password });
      toast.success('Welcome back!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (account) => {
    setFormData({ email: account.email, password: account.password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-950 to-dark-900 flex items-center justify-center px-4 py-10">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="text-white">Skill</span>
              <span className="gradient-text">X</span>
            </h1>
          </Link>
          <p className="text-dark-400 mt-2">Welcome back! Sign in to continue</p>
        </div>

        {/* Login card */}
        <div className="glass-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="input-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              {isLoading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-dark-400 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Register
            </Link>
          </p>
        </div>

        {/* Demo accounts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="glass-card p-5 mt-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-dark-400" />
            <h3 className="text-sm font-medium text-dark-300">Demo Accounts</h3>
          </div>

          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => fillDemoAccount(account)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-dark-800/60 hover:bg-dark-800 border border-dark-700/50 hover:border-dark-600 transition-all duration-200 group"
              >
                <div className="text-left">
                  <span className={`text-sm font-medium ${account.color}`}>
                    {account.label}
                  </span>
                  <p className="text-xs text-dark-500 mt-0.5">{account.email}</p>
                </div>
                <span className="text-xs text-dark-500 group-hover:text-dark-300 transition-colors">
                  {account.password}
                </span>
              </button>
            ))}
          </div>

          <p className="text-xs text-dark-500 mt-3 text-center">
            Click any account to auto-fill credentials
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
