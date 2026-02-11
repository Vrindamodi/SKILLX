import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, Loader2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { PASSWORD_RULES } from '../utils/constants';

const strengthLevels = [
  { label: 'Weak', color: 'bg-red-500', width: '25%' },
  { label: 'Medium', color: 'bg-yellow-500', width: '50%' },
  { label: 'Strong', color: 'bg-blue-500', width: '75%' },
  { label: 'Very Strong', color: 'bg-green-500', width: '100%' },
];

function getPasswordStrength(password) {
  if (!password) return -1;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;
  return Math.max(0, score - 1); // 0-3 index
}

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Password rule validation
  const ruleResults = useMemo(
    () =>
      PASSWORD_RULES.map((rule) => ({
        ...rule,
        passed: rule.regex.test(formData.password),
      })),
    [formData.password]
  );

  // Password strength
  const strengthIndex = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password]
  );
  const strength = strengthIndex >= 0 ? strengthLevels[strengthIndex] : null;

  // Passwords match
  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  const passwordsMismatch =
    formData.confirmPassword.length > 0 &&
    formData.password !== formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    const allRulesPassed = ruleResults.every((r) => r.passed);
    if (!allRulesPassed) {
      toast.error('Password does not meet all requirements');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms & Conditions');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        ...(formData.referralCode && { referralCode: formData.referralCode.trim() }),
      });
      toast.success('Account created successfully!');
      navigate('/profile-setup', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 py-10">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
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
              <span className="text-blue-500">X</span>
            </h1>
          </Link>
          <p className="text-dark-400 mt-2">Create your account to get started</p>
        </div>

        {/* Register card */}
        <div className="glass-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="input-label">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
              />
            </div>

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
                  autoComplete="new-password"
                  placeholder="Create a strong password"
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

              {/* Strength meter */}
              {formData.password && (
                <div className="mt-2.5">
                  <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${strength?.color || ''}`}
                      initial={{ width: 0 }}
                      animate={{ width: strength?.width || '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-dark-400 mt-1">
                    Strength:{' '}
                    <span
                      className={
                        strengthIndex === 0
                          ? 'text-red-400'
                          : strengthIndex === 1
                          ? 'text-yellow-400'
                          : strengthIndex === 2
                          ? 'text-blue-400'
                          : 'text-green-400'
                      }
                    >
                      {strength?.label}
                    </span>
                  </p>
                </div>
              )}

              {/* Password rules checklist */}
              {formData.password && (
                <ul className="mt-3 space-y-1.5">
                  {ruleResults.map((rule) => (
                    <li key={rule.rule} className="flex items-center gap-2 text-xs">
                      {rule.passed ? (
                        <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-dark-500 flex-shrink-0" />
                      )}
                      <span className={rule.passed ? 'text-green-400' : 'text-dark-400'}>
                        {rule.label}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="input-label">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-field pr-12 ${
                    passwordsMatch
                      ? 'border-green-500/50 focus:ring-green-500/50 focus:border-green-500'
                      : passwordsMismatch
                      ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                      : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {passwordsMismatch && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-green-400 mt-1">Passwords match</p>
              )}
            </div>

            {/* Referral code */}
            <div>
              <label htmlFor="referralCode" className="input-label">
                Referral Code <span className="text-dark-500">(optional)</span>
              </label>
              <input
                id="referralCode"
                name="referralCode"
                type="text"
                placeholder="Enter referral code"
                value={formData.referralCode}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 rounded-md border-2 border-dark-600 bg-dark-800 peer-checked:bg-primary-600 peer-checked:border-primary-600 transition-all duration-200 flex items-center justify-center">
                  {agreedToTerms && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
              <span className="text-sm text-dark-400 group-hover:text-dark-300 transition-colors">
                I agree to the{' '}
                <span className="text-primary-400 hover:text-primary-300 cursor-pointer">
                  Terms of Service
                </span>{' '}
                and{' '}
                <span className="text-primary-400 hover:text-primary-300 cursor-pointer">
                  Privacy Policy
                </span>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
              {isLoading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-dark-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
