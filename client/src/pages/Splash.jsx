import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const SPLASH_DURATION = 3000;

const tagline = 'Skills, Skills Everywhere';

export default function Splash() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [progress, setProgress] = useState(0);
  const [displayedText, setDisplayedText] = useState('');

  // Typing animation for tagline
  useEffect(() => {
    let charIndex = 0;
    const interval = setInterval(() => {
      if (charIndex <= tagline.length) {
        setDisplayedText(tagline.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(interval);
      }
    }, 60);

    return () => clearInterval(interval);
  }, []);

  // Progress bar simulation
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / SPLASH_DURATION) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // Navigate after splash completes and auth state is resolved
  useEffect(() => {
    if (progress < 100 || loading) return;

    const timeout = setTimeout(() => {
      navigate(isAuthenticated ? '/dashboard' : '/onboarding', { replace: true });
    }, 200);

    return () => clearTimeout(timeout);
  }, [progress, loading, isAuthenticated, navigate]);

  return (
    <div className="fixed inset-0 bg-dark-950 flex flex-col items-center justify-center overflow-hidden">
      {/* Background decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 logo-float"
      >
        <h1 className="text-7xl sm:text-8xl font-bold tracking-tight select-none">
          <span className="text-white">Skill</span>
          <span className="bg-primary-400 bg-clip-text text-transparent">
            X
          </span>
        </h1>
      </motion.div>

      {/* Tagline with typing effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative z-10 mt-6 h-8"
      >
        <p className="text-lg sm:text-xl text-dark-300 font-light tracking-wide">
          {displayedText}
          <span className="inline-block w-0.5 h-5 bg-primary-400 ml-0.5 animate-pulse align-middle" />
        </p>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute bottom-16 left-0 right-0 z-10 flex flex-col items-center px-4"
      >
        <div className="w-64 h-1 bg-dark-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-xs text-dark-500 mt-3 tracking-wider uppercase">
          Loading...
        </p>
      </motion.div>
    </div>
  );
}
