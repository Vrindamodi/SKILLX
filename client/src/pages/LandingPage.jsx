import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Zap,
  ShieldCheck,
  Globe,
  ArrowRight,
  Users,
  Sparkles,
  Layout,
  Layers,
  CheckCircle2
} from 'lucide-react';

// Animation Constants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// Reusable Components
function GlassCard({ children, className = "" }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl ${className}`}>
      {children}
    </div>
  );
}

function Feature({ icon: Icon, title, desc, color }) {
  return (
    <motion.div variants={itemVariants} className="group cursor-default">
      <GlassCard className="p-8 h-full hover:border-white/20 hover:bg-white/10 transition-all duration-300">
        <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-${color}-500/20 text-${color}-400 group-hover:scale-110 transition-transform`}>
          <Icon className="h-7 w-7" />
        </div>
        <h3 className="mb-3 text-xl font-bold text-white">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{desc}</p>
      </GlassCard>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-x-hidden">

      {/* ── Navbar ────────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter">Skill<span className="text-blue-500">X</span></span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Features</a>
            <Link to="/login">
              <button className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black hover:bg-gray-200 transition-all active:scale-95">
                Login
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-36 md:pb-32">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-8">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-100">The Future of Human Capital</span>
            </div>

            <h1 className="mx-auto max-w-4xl text-5xl font-black leading-[1.1] tracking-tight md:text-7xl lg:text-8xl">
              Monetize your <span className="text-blue-400">Talent</span> instantly
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg text-gray-400 md:text-xl">
              SkillX is the world's first hybrid ecosystem for learning, teaching, and micro-tasking. Connect, trade skills, and build your digital legacy.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/onboarding">
                <button className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-10 text-lg font-bold text-white shadow-xl shadow-blue-600/30 hover:bg-blue-500 hover:shadow-blue-600/40 transition-all active:scale-95">
                  Get Started for Free <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────── */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-left">
            <h2 className="text-3xl font-bold md:text-5xl">Everything you need to <br />scale your <span className="text-blue-500">influence.</span></h2>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-3"
          >
            <Feature
              icon={Layout}
              title="Multi-Mode Interface"
              desc="Seamlessly switch between Learn, Teach, Rent, and Service modes with one unified profile."
              color="blue"
            />
            <Feature
              icon={Zap}
              title="Proof of Skill (XP)"
              desc="Our gamified system tracks your progress through XP and levels, creating a trustable on-chain resume."
              color="yellow"
            />
            <Feature
              icon={Layers}
              title="Skill Capsules"
              desc="Bite-sized, high-impact learning modules designed for the modern attention span."
              color="purple"
            />
          </motion.div>
        </div>
      </section>

      {/* ── Social Validation ─────────────────────────────── */}
      <section className="py-24 bg-blue-900/10">
        <div className="mx-auto max-w-7xl px-6">
          <GlassCard className="flex flex-col items-center justify-between gap-12 p-12 md:flex-row">
            <div className="max-w-md">
              <h2 className="text-3xl font-bold mb-4">Ready to level up?</h2>
              <p className="text-gray-400 mb-8">Join the elite community of 50,000+ creators and learners who are redefining the gig economy.</p>
              <ul className="space-y-3">
                {['Direct Peer-to-Peer Payments', 'Verified Skill Badges', 'AI-Powered Matching'].map((text) => (
                  <li key={text} className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" /> {text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-blue-500/20 blur-2xl" />
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426"
                alt="Dashboard Preview"
                className="relative w-[500px] rounded-2xl border border-white/10 shadow-2xl"
              />
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            <span className="font-bold tracking-tighter">SkillX © 2026</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Discord</a>
            <a href="#" className="hover:text-white">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}