import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Calendar,
  MessageCircle,
  Wallet,
  GraduationCap,
  Users,
  Trophy,
  BarChart3,
  Heart,
  Settings,
  BookOpen,
  Presentation,
  Wrench,
  Briefcase,
  ClipboardList,
  ChevronLeft,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMode } from '../../context/ModeContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/sessions', label: 'My Sessions', icon: Calendar },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
  { to: '/learning-paths', label: 'Learning Paths', icon: GraduationCap },
  { to: '/community', label: 'Community', icon: Users },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/social-impact', label: 'Social Impact', icon: Heart },
];

const MODE_ICONS = {
  learn: BookOpen,
  teach: Presentation,
  rent: Wrench,
  service: Briefcase,
  request: ClipboardList,
};

function getLevelBadge(level) {
  if (!level) return null;
  const tiers = {
    bronze: 'bg-amber-700/30 text-amber-400 border-amber-600/40',
    silver: 'bg-gray-400/20 text-gray-300 border-gray-500/40',
    gold: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    platinum: 'bg-slate-300/20 text-slate-200 border-slate-400/40',
    legend: 'bg-red-500/20 text-red-300 border-red-500/40',
  };
  const tier = typeof level === 'string' ? level.toLowerCase() : 'bronze';
  return tiers[tier] || tiers.bronze;
}

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const { currentMode, switchMode, modeConfig, switching } = useMode();
  const location = useLocation();

  const displayName = user?.name || user?.username || 'User';
  const avatarUrl = user?.avatar;
  const userLevel = user?.level || user?.gamification?.level || 'Bronze';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-[260px] flex flex-col
          bg-dark-950/95 backdrop-blur-2xl border-r border-dark-700/50
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo & Close */}
        <div className="flex items-center justify-between px-5 h-16 shrink-0">
          <NavLink to="/dashboard" className="flex items-center gap-1 group">
            <span className="text-2xl font-bold tracking-tight text-white">
              Skill
            </span>
            <span className="text-2xl font-black bg-gradient-to-br from-primary-400 to-accent-400 bg-clip-text text-transparent">
              X
            </span>
          </NavLink>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="px-3 mb-2">
          <div className="glass-card p-2">
            <p className="text-[10px] uppercase tracking-widest text-dark-500 font-semibold px-2 mb-1.5">
              Mode
            </p>
            <div className="grid grid-cols-5 gap-1">
              {Object.entries(modeConfig).map(([key, config]) => {
                const ModeIcon = MODE_ICONS[key];
                const isActive = currentMode === key;
                return (
                  <button
                    key={key}
                    onClick={() => switchMode(key)}
                    disabled={switching}
                    title={config.description}
                    className={isActive ? 'mode-btn-active' : 'mode-btn-inactive'}
                    style={isActive ? { borderColor: `${config.color}40`, backgroundColor: `${config.color}15` } : undefined}
                  >
                    <ModeIcon
                      size={16}
                      style={isActive ? { color: config.color } : undefined}
                    />
                    <span className="text-[10px] leading-none font-medium">
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? 'nav-link-active' : 'nav-link'
              }
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="shrink-0 border-t border-dark-700/50 p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-dark-800/60 transition-colors">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-dark-600"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-sm font-bold text-white ring-2 ring-dark-600">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {displayName}
              </p>
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getLevelBadge(userLevel)}`}
              >
                {typeof userLevel === 'string' ? userLevel : `Lvl ${userLevel}`}
              </span>
            </div>
            <NavLink
              to="/settings"
              onClick={onClose}
              className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
              aria-label="Settings"
            >
              <Settings size={16} />
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}
