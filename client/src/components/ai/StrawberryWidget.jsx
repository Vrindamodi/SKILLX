import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SendHorizontal,
  Minus,
  X,
  Sparkles,
  BookOpen,
  TrendingUp,
  Users,
  Target,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { aiAPI } from '../../services/api';

// ── constants ───────────────────────────────────────────────
const QUICK_ACTIONS = [
  { id: 'learning_path', label: 'Learning Path', icon: BookOpen, message: 'Suggest a learning path for me based on my skills and goals.' },
  { id: 'earning_strategy', label: 'Earning Strategy', icon: TrendingUp, message: 'What are the best strategies to maximize my earnings on Skill-X?' },
  { id: 'find_mentor', label: 'Find Mentor', icon: Users, message: 'Help me find the right mentor for my skill goals.' },
  { id: 'skill_gap', label: 'Skill Gap', icon: Target, message: 'Analyze my skill gap and suggest improvements.' },
  { id: 'faq', label: 'FAQ', icon: HelpCircle, message: 'What are the most common questions about Skill-X?' },
];

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: "Hey! I'm Strawberry, your Skill-X AI assistant. How can I help you today?\n\nI can help with **learning paths**, **earning strategies**, **finding mentors**, and more. Just ask!",
  timestamp: new Date().toISOString(),
};

const STORAGE_KEY = 'skillx_strawberry_open';

// ── message formatting ──────────────────────────────────────
function formatMessage(text) {
  if (!text) return '';

  // Process the text into segments
  const parts = [];
  let remaining = text;
  let key = 0;

  // Split by lines for list support
  const lines = remaining.split('\n');
  const elements = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Handle list items
    const listMatch = line.match(/^[-*]\s+(.*)/);
    if (listMatch) {
      elements.push(
        <div key={key++} className="flex gap-2 ml-1">
          <span className="text-emerald-400 mt-0.5">&#8226;</span>
          <span>{formatInline(listMatch[1])}</span>
        </div>
      );
      continue;
    }

    // Regular line
    if (line.trim() === '') {
      elements.push(<div key={key++} className="h-2" />);
    } else {
      elements.push(<div key={key++}>{formatInline(line)}</div>);
    }
  }

  return elements;
}

function formatInline(text) {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) {
      return (
        <span key={i} className="font-semibold text-white">
          {boldMatch[1]}
        </span>
      );
    }
    return part;
  });
}

// ── loading dots ────────────────────────────────────────────
function LoadingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-gray-400"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

// ── main component ──────────────────────────────────────────
export default function StrawberryWidget() {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [conversationHistory, setConversationHistory] = useState([]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Persist open/closed state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isOpen));
    } catch {
      /* silent */
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (content) => {
      if (!content.trim() || isLoading) return;

      const userMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      const newHistory = [
        ...conversationHistory,
        { role: 'user', content: content.trim() },
      ];

      try {
        const res = await aiAPI.chat({
          message: content.trim(),
          conversationHistory: newHistory,
        });

        const aiContent =
          res.data?.response ||
          res.data.data?.message ||
          "I'm sorry, I couldn't process that right now. Please try again.";

        const aiMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: aiContent,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aiMessage]);
        setConversationHistory([
          ...newHistory,
          { role: 'assistant', content: aiContent },
        ]);
      } catch {
        // Fallback responses
        const fallbacks = [
          "I'm having trouble connecting right now. Please try again in a moment!",
          "It looks like I'm offline. In the meantime, you can browse the **Discover** page to find skills and teachers.",
          "Connection issue! While I reconnect, try checking your **Dashboard** for personalized recommendations.",
          "Oops, something went wrong on my end. Here's a tip: Use the **Learning Paths** feature to find structured courses!",
        ];
        const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];

        const aiMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: fallback,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aiMessage]);
        setConversationHistory([
          ...newHistory,
          { role: 'assistant', content: fallback },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [conversationHistory, isLoading]
  );

  function handleQuickAction(action) {
    setInput(action.message);
    sendMessage(action.message);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <>
      {/* ── Floating Button ──────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 shadow-2xl shadow-pink-500/30 transition-shadow hover:shadow-pink-500/50"
          >
            {/* Pulse ring */}
            <motion.span
              className="absolute inset-0 rounded-full bg-pink-500/40"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="text-2xl relative z-10" role="img" aria-label="Strawberry AI">
              🍓
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Panel ───────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-[9999] flex w-[380px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-gray-900/95 backdrop-blur-xl shadow-2xl"
            style={{ height: '500px', maxHeight: 'calc(100vh - 48px)' }}
          >
            {/* ── Header ────────────────────────────── */}
            <div className="flex items-center justify-between border-b border-white/10 bg-rose-500/10 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <span className="text-xl" role="img" aria-label="Strawberry">
                    🍓
                  </span>
                  {/* Online indicator */}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-gray-900 bg-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Strawberry AI</h3>
                  <p className="text-[10px] text-emerald-400">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                  title="Minimize"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ── Quick Actions ─────────────────────── */}
            <div className="border-b border-white/5">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="flex w-full items-center justify-between px-4 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  Quick Actions
                </span>
                {showQuickActions ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
              <AnimatePresence>
                {showQuickActions && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                      {QUICK_ACTIONS.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleQuickAction(action)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-gray-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-40"
                        >
                          <action.icon className="h-3 w-3" />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Messages Area ─────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 mr-2 mt-1">
                      <span className="text-sm" role="img" aria-label="AI">
                        🍓
                      </span>
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-white/[0.07] text-gray-200 rounded-bl-md border border-white/5'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="space-y-1">{formatMessage(msg.content)}</div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex-shrink-0 mr-2 mt-1">
                    <span className="text-sm">🍓</span>
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-white/[0.07] border border-white/5">
                    <LoadingDots />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Area ────────────────────────── */}
            <div className="border-t border-white/10 p-3">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Strawberry anything..."
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-pink-500/50 transition-colors disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-white transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <SendHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
