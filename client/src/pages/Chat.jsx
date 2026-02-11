import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Search,
  MessageCircle,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  ArrowLeft,
  Check,
  CheckCheck,
  Calendar,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { chatAPI } from '../services/api';
import { mockUsers } from '../data/mockData';

// ── animations ──────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};
const slideIn = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};
const msgAnim = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

// ── helpers ─────────────────────────────────────────────────
function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function truncate(str, len = 40) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}

const SESSION_KEYWORDS = ['teach', 'learn', 'session', 'book', 'class', 'tutor', 'mentor'];

function detectSessionIntent(messages) {
  if (!messages || messages.length === 0) return false;
  const recent = messages.slice(-5);
  return recent.some((m) =>
    SESSION_KEYWORDS.some((kw) => m.text?.toLowerCase().includes(kw)) ||
    m.text?.includes('\u20B9')
  );
}

// ── emoji grid ──────────────────────────────────────────────
const EMOJI_LIST = [
  '😀','😂','😍','🤩','😎','🤔','😊','🙌',
  '👍','👋','🎉','🔥','❤️','💯','✅','🙏',
  '📚','💡','🎯','🚀','⭐','💪','🤝','👏',
];

// ── mock conversation generator ─────────────────────────────
function generateMockConversations(currentUserId) {
  return mockUsers
    .filter((u) => u.id !== currentUserId)
    .map((u, i) => ({
      id: `conv_${u.id}`,
      participantId: u.id,
      participantName: u.name,
      participantAvatar: u.avatar,
      participantOnline: u.isOnline,
      lastMessage: [
        'Hey! Are you available for a session?',
        'Thanks for the class, it was really helpful!',
        'Can you teach me React this weekend?',
        'I sent you the payment for the session.',
        'Let me know when you are free to learn cooking.',
      ][i % 5],
      lastMessageTime: new Date(Date.now() - (i + 1) * 3600000 * (i + 1)).toISOString(),
      unreadCount: i < 2 ? i + 1 : 0,
    }));
}

function generateMockMessages(conversationId, currentUserId, otherUser) {
  const now = Date.now();
  return [
    {
      id: `msg_${conversationId}_1`,
      conversationId,
      senderId: otherUser?.id || 'other',
      text: `Hi! I saw your profile on Skill-X. I'd love to learn from you.`,
      type: 'text',
      createdAt: new Date(now - 7200000).toISOString(),
      read: true,
    },
    {
      id: `msg_${conversationId}_2`,
      conversationId,
      senderId: currentUserId,
      text: 'Hey! Sure, I would be happy to help. What skill are you interested in?',
      type: 'text',
      createdAt: new Date(now - 6800000).toISOString(),
      read: true,
    },
    {
      id: `msg_${conversationId}_3`,
      conversationId,
      senderId: otherUser?.id || 'other',
      text: 'I want to learn React. Can you teach me the basics? Maybe we can do a session this week.',
      type: 'text',
      createdAt: new Date(now - 6000000).toISOString(),
      read: true,
    },
    {
      id: `msg_${conversationId}_4`,
      conversationId,
      senderId: currentUserId,
      text: 'Absolutely! I charge \u20B9500 per hour. We can start with components and hooks.',
      type: 'text',
      createdAt: new Date(now - 5400000).toISOString(),
      read: true,
    },
    {
      id: `msg_${conversationId}_5`,
      conversationId,
      senderId: otherUser?.id || 'other',
      text: 'That sounds perfect! Can we book a session for Saturday 4 PM?',
      type: 'text',
      createdAt: new Date(now - 3600000).toISOString(),
      read: false,
    },
  ];
}

// ── typing indicator ────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2">
      <div className="flex items-center gap-1 bg-dark-800 rounded-2xl rounded-bl-sm px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-dark-400"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── session intent card ─────────────────────────────────────
function SessionIntentCard({ onAccept, onDecline }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex justify-center my-4"
    >
      <div className="glass-card p-4 max-w-sm w-full text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-primary-400">
          <Calendar className="w-5 h-5" />
          <span className="font-semibold text-sm">Session Detected</span>
        </div>
        <p className="text-dark-300 text-sm">
          It looks like you're ready to proceed with a session. Would you like to book one?
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={onAccept} className="btn-primary text-sm px-5 py-2">
            Yes, Book Session
          </button>
          <button onClick={onDecline} className="btn-secondary text-sm px-5 py-2">
            Not Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── date separator ──────────────────────────────────────────
function DateSeparator({ date }) {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="bg-dark-800/80 text-dark-400 text-xs px-3 py-1 rounded-full">
        {formatDate(date)}
      </div>
    </div>
  );
}

// ── main component ──────────────────────────────────────────
export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, connected } = useSocket();

  // state
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(conversationId || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(!!conversationId);
  const [sessionDismissed, setSessionDismissed] = useState({});

  // refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiRef = useRef(null);

  const currentUserId = user?.id || user?._id || 'user1';

  // ── active conversation info ──────────────────────────────
  const activeConv = conversations.find((c) => c.id === activeConvId);
  const activeUser = activeConv
    ? mockUsers.find((u) => u.id === activeConv.participantId) || null
    : null;

  // ── scroll to bottom ─────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers, scrollToBottom]);

  // ── close emoji picker on outside click ───────────────────
  useEffect(() => {
    function handleClickOutside(e) {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── fetch conversations ───────────────────────────────────
  useEffect(() => {
    async function fetchConversations() {
      setLoading(true);
      try {
        const res = await chatAPI.getConversations();
        const data = res.data?.conversations || res.data || [];
        if (data.length > 0) {
          setConversations(data);
        } else {
          setConversations(generateMockConversations(currentUserId));
        }
      } catch {
        setConversations(generateMockConversations(currentUserId));
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, [currentUserId]);

  // ── sync URL param ────────────────────────────────────────
  useEffect(() => {
    if (conversationId && conversationId !== activeConvId) {
      setActiveConvId(conversationId);
      setShowMobileChat(true);
    }
  }, [conversationId, activeConvId]);

  // ── fetch messages when active conv changes ───────────────
  useEffect(() => {
    if (!activeConvId) return;

    async function fetchMessages() {
      setMessagesLoading(true);
      try {
        const res = await chatAPI.getMessages(activeConvId);
        const data = res.data?.messages || res.data || [];
        if (data.length > 0) {
          setMessages(data);
        } else {
          setMessages(
            generateMockMessages(activeConvId, currentUserId, activeUser)
          );
        }
      } catch {
        setMessages(
          generateMockMessages(activeConvId, currentUserId, activeUser)
        );
      } finally {
        setMessagesLoading(false);
      }
    }

    fetchMessages();
  }, [activeConvId, currentUserId, activeUser]);

  // ── socket listeners ──────────────────────────────────────
  useEffect(() => {
    if (!socket || !connected) return;

    if (activeConvId) {
      socket.emit('join_conversation', { conversationId: activeConvId });
    }

    function handleNewMessage(msg) {
      if (msg.conversationId === activeConvId) {
        setMessages((prev) => [...prev, msg]);
      }
      // update conversation last message
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversationId
            ? {
                ...c,
                lastMessage: msg.text,
                lastMessageTime: msg.createdAt,
                unreadCount:
                  msg.conversationId === activeConvId
                    ? c.unreadCount
                    : c.unreadCount + 1,
              }
            : c
        )
      );
    }

    function handleTyping({ conversationId: cId, userId, userName }) {
      if (cId === activeConvId && userId !== currentUserId) {
        setTypingUsers((prev) => ({ ...prev, [userId]: userName }));
      }
    }

    function handleStopTyping({ conversationId: cId, userId }) {
      if (cId === activeConvId) {
        setTypingUsers((prev) => {
          const copy = { ...prev };
          delete copy[userId];
          return copy;
        });
      }
    }

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stopped_typing', handleStopTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleTyping);
      socket.off('user_stopped_typing', handleStopTyping);
    };
  }, [socket, connected, activeConvId, currentUserId]);

  // ── typing emission with debounce ─────────────────────────
  const emitTyping = useCallback(() => {
    if (!socket || !connected || !activeConvId) return;

    socket.emit('typing_start', {
      conversationId: activeConvId,
      userId: currentUserId,
      userName: user?.name || 'You',
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', {
        conversationId: activeConvId,
        userId: currentUserId,
      });
    }, 2000);
  }, [socket, connected, activeConvId, currentUserId, user?.name]);

  // ── send message ──────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = newMessage.trim();
    if (!text || !activeConvId) return;

    const tempMsg = {
      id: `temp_${Date.now()}`,
      conversationId: activeConvId,
      senderId: currentUserId,
      text,
      type: 'text',
      createdAt: new Date().toISOString(),
      read: false,
      sending: true,
    };

    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage('');
    setShowEmojiPicker(false);
    setSending(true);

    // Stop typing indicator
    if (socket && connected) {
      socket.emit('typing_stop', {
        conversationId: activeConvId,
        userId: currentUserId,
      });
    }

    try {
      const res = await chatAPI.sendMessage(activeConvId, { text });
      const saved = res.data?.message || res.data || { ...tempMsg, sending: false };
      setMessages((prev) =>
        prev.map((m) => (m.id === tempMsg.id ? { ...saved, sending: false } : m))
      );
    } catch {
      // Keep the optimistic message but mark as sent
      setMessages((prev) =>
        prev.map((m) => (m.id === tempMsg.id ? { ...m, sending: false } : m))
      );
    } finally {
      setSending(false);
    }

    // Also emit via socket
    if (socket && connected) {
      socket.emit('send_message', {
        conversationId: activeConvId,
        senderId: currentUserId,
        text,
      });
    }

    // Update conversation list
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? { ...c, lastMessage: text, lastMessageTime: new Date().toISOString() }
          : c
      )
    );
  }, [newMessage, activeConvId, currentUserId, socket, connected]);

  // ── select conversation ───────────────────────────────────
  const selectConversation = useCallback(
    (convId) => {
      setActiveConvId(convId);
      setShowMobileChat(true);
      setMessages([]);
      setTypingUsers({});
      setShowEmojiPicker(false);
      navigate(`/chat/${convId}`, { replace: true });

      // Clear unread
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
      );
    },
    [navigate]
  );

  const handleBack = useCallback(() => {
    setShowMobileChat(false);
    setActiveConvId(null);
    navigate('/chat', { replace: true });
  }, [navigate]);

  // ── handle input change ───────────────────────────────────
  const handleInputChange = useCallback(
    (e) => {
      setNewMessage(e.target.value);
      emitTyping();
    },
    [emitTyping]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const addEmoji = useCallback((emoji) => {
    setNewMessage((prev) => prev + emoji);
    inputRef.current?.focus();
  }, []);

  // ── filter conversations ──────────────────────────────────
  const filteredConversations = conversations.filter((c) =>
    c.participantName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── group messages by date ────────────────────────────────
  const groupedMessages = messages.reduce((acc, msg) => {
    const date = new Date(msg.createdAt).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  const showSessionIntent =
    activeConvId &&
    !sessionDismissed[activeConvId] &&
    detectSessionIntent(messages);

  const isTyping = Object.keys(typingUsers).length > 0;

  // ── render ────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-80px)] flex overflow-hidden"
    >
      {/* ─── LEFT PANEL: conversation list ──────────────────── */}
      <div
        className={`${
          showMobileChat ? 'hidden md:flex' : 'flex'
        } flex-col w-full md:w-[360px] lg:w-[380px] border-r border-dark-700/50 glass`}
      >
        {/* header */}
        <div className="p-4 border-b border-dark-700/50">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary-400" />
              Messages
            </h1>
            <span className="text-xs text-dark-400">
              {conversations.filter((c) => c.unreadCount > 0).length > 0 &&
                `${conversations.reduce((s, c) => s + c.unreadCount, 0)} unread`}
            </span>
          </div>

          {/* search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 py-2.5 text-sm"
            />
          </div>
        </div>

        {/* conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-center px-6">
              <MessageCircle className="w-12 h-12 text-dark-600 mb-3" />
              <p className="text-dark-400 font-medium">No conversations yet</p>
              <p className="text-dark-500 text-sm mt-1">
                Start chatting with skill partners from Discover
              </p>
            </div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show">
              {filteredConversations.map((conv) => (
                <motion.div
                  key={conv.id}
                  variants={item}
                  onClick={() => selectConversation(conv.id)}
                  className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all duration-200 border-l-2 ${
                    activeConvId === conv.id
                      ? 'bg-primary-600/10 border-l-primary-500'
                      : 'border-l-transparent hover:bg-dark-800/60'
                  }`}
                >
                  {/* avatar */}
                  <div className="relative flex-shrink-0">
                    {conv.participantAvatar ? (
                      <img
                        src={conv.participantAvatar}
                        alt={conv.participantName}
                        className="w-12 h-12 rounded-full bg-dark-700 object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-600/20 flex items-center justify-center text-primary-400 font-bold text-lg">
                        {conv.participantName?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    {conv.participantOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-dark-900 rounded-full" />
                    )}
                  </div>

                  {/* details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3
                        className={`font-semibold text-sm truncate ${
                          conv.unreadCount > 0 ? 'text-white' : 'text-dark-200'
                        }`}
                      >
                        {conv.participantName}
                      </h3>
                      <span className="text-[11px] text-dark-500 flex-shrink-0 ml-2">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p
                        className={`text-xs truncate ${
                          conv.unreadCount > 0
                            ? 'text-dark-300 font-medium'
                            : 'text-dark-500'
                        }`}
                      >
                        {truncate(conv.lastMessage, 35)}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="flex-shrink-0 ml-2 w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ─── RIGHT PANEL: active conversation ───────────────── */}
      <div
        className={`${
          showMobileChat ? 'flex' : 'hidden md:flex'
        } flex-col flex-1 min-w-0`}
      >
        {!activeConvId ? (
          /* empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-20 h-20 rounded-2xl bg-primary-600/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-primary-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Select a Conversation
              </h2>
              <p className="text-dark-400 text-sm max-w-xs">
                Choose a conversation from the list to start messaging, or find new
                skill partners in Discover.
              </p>
            </motion.div>
          </div>
        ) : (
          <>
            {/* ── chat header ──────────────────────────────── */}
            <motion.div
              variants={slideIn}
              initial="hidden"
              animate="show"
              className="flex items-center gap-3 px-4 py-3 border-b border-dark-700/50 glass"
            >
              {/* back button (mobile) */}
              <button
                onClick={handleBack}
                className="md:hidden p-1.5 rounded-lg hover:bg-dark-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-dark-300" />
              </button>

              {/* avatar */}
              <div className="relative flex-shrink-0">
                {activeConv?.participantAvatar ? (
                  <img
                    src={activeConv.participantAvatar}
                    alt={activeConv.participantName}
                    className="w-10 h-10 rounded-full bg-dark-700 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-600/20 flex items-center justify-center text-primary-400 font-bold">
                    {activeConv?.participantName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                {activeConv?.participantOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-dark-900 rounded-full" />
                )}
              </div>

              {/* name & status */}
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-white text-sm truncate">
                  {activeConv?.participantName}
                </h2>
                <p className="text-xs text-dark-400">
                  {isTyping ? (
                    <span className="text-green-400">typing...</span>
                  ) : activeConv?.participantOnline ? (
                    <span className="text-green-400">Online</span>
                  ) : (
                    'Offline'
                  )}
                </p>
              </div>

              {/* actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    navigate(
                      `/session/new?partner=${activeConv?.participantId}`
                    )
                  }
                  className="btn-primary text-xs px-3 py-1.5 hidden sm:flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Book Session
                </button>
                <button className="p-2 rounded-lg hover:bg-dark-800 transition-colors">
                  <Phone className="w-4 h-4 text-dark-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-dark-800 transition-colors">
                  <Video className="w-4 h-4 text-dark-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-dark-800 transition-colors">
                  <MoreVertical className="w-4 h-4 text-dark-400" />
                </button>
              </div>
            </motion.div>

            {/* ── messages area ─────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 bg-dark-950/30">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <p className="text-dark-500 text-sm">
                    No messages yet. Say hello!
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date}>
                      <DateSeparator date={msgs[0].createdAt} />
                      {msgs.map((msg) => {
                        const isSent = msg.senderId === currentUserId;
                        const isSystem = msg.type === 'system';

                        if (isSystem) {
                          return (
                            <motion.div
                              key={msg.id}
                              variants={msgAnim}
                              initial="hidden"
                              animate="show"
                              className="flex justify-center my-3"
                            >
                              <span className="text-xs text-dark-500 bg-dark-800/60 px-3 py-1 rounded-full">
                                {msg.text}
                              </span>
                            </motion.div>
                          );
                        }

                        return (
                          <motion.div
                            key={msg.id}
                            variants={msgAnim}
                            initial="hidden"
                            animate="show"
                            layout
                            className={`flex mb-1.5 ${
                              isSent ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[75%] sm:max-w-[65%] px-3.5 py-2.5 ${
                                isSent
                                  ? 'bg-primary-600 rounded-2xl rounded-br-sm text-white'
                                  : 'bg-dark-800 rounded-2xl rounded-bl-sm text-dark-100'
                              }`}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {msg.text}
                              </p>
                              <div
                                className={`flex items-center gap-1 mt-1 ${
                                  isSent ? 'justify-end' : 'justify-start'
                                }`}
                              >
                                <span
                                  className={`text-[10px] ${
                                    isSent
                                      ? 'text-primary-200/70'
                                      : 'text-dark-500'
                                  }`}
                                >
                                  {formatTime(msg.createdAt)}
                                </span>
                                {isSent && (
                                  <span className="text-primary-200/70">
                                    {msg.sending ? (
                                      <Check className="w-3 h-3" />
                                    ) : msg.read ? (
                                      <CheckCheck className="w-3 h-3 text-blue-300" />
                                    ) : (
                                      <CheckCheck className="w-3 h-3" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ))}
                </AnimatePresence>
              )}

              {/* session intent card */}
              {showSessionIntent && (
                <SessionIntentCard
                  onAccept={() =>
                    navigate(
                      `/session/new?partner=${activeConv?.participantId}`
                    )
                  }
                  onDecline={() =>
                    setSessionDismissed((prev) => ({
                      ...prev,
                      [activeConvId]: true,
                    }))
                  }
                />
              )}

              {/* typing indicator */}
              {isTyping && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>

            {/* ── message input bar ────────────────────────── */}
            <div className="border-t border-dark-700/50 glass px-3 py-3">
              <div className="flex items-end gap-2">
                {/* attachment */}
                <button className="p-2 rounded-lg hover:bg-dark-800 transition-colors flex-shrink-0 mb-0.5">
                  <Paperclip className="w-5 h-5 text-dark-400" />
                </button>

                {/* emoji */}
                <div className="relative flex-shrink-0" ref={emojiRef}>
                  <button
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className={`p-2 rounded-lg transition-colors mb-0.5 ${
                      showEmojiPicker
                        ? 'bg-primary-600/20 text-primary-400'
                        : 'hover:bg-dark-800 text-dark-400'
                    }`}
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  {/* emoji picker popup */}
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-12 left-0 glass-card p-3 w-64 z-50"
                      >
                        <div className="grid grid-cols-8 gap-1">
                          {EMOJI_LIST.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => addEmoji(emoji)}
                              className="w-7 h-7 flex items-center justify-center rounded hover:bg-dark-700 transition-colors text-base"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* text input */}
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="input-field resize-none py-2.5 text-sm min-h-[42px] max-h-[120px]"
                    style={{ height: 'auto' }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height =
                        Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                  />
                </div>

                {/* send */}
                <motion.button
                  whileScale={0.92}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className={`p-2.5 rounded-xl flex-shrink-0 mb-0.5 transition-all duration-200 ${
                    newMessage.trim()
                      ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20'
                      : 'bg-dark-800 text-dark-500 cursor-not-allowed'
                  }`}
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
