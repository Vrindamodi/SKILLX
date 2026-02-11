import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Plus,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMode } from '../../context/ModeContext';
import { useNotifications } from '../../context/NotificationContext';
import Sidebar from './Sidebar';

// Map route paths to page titles
const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/discover': 'Discover',
  '/sessions': 'My Sessions',
  '/chat': 'Chat',
  '/wallet': 'Wallet',
  '/learning-paths': 'Learning Paths',
  '/community': 'Community',
  '/leaderboard': 'Leaderboard',
  '/analytics': 'Analytics',
  '/social-impact': 'Social Impact',
  '/create-post': 'Create Post',
  '/settings': 'Settings',
  '/profile': 'Profile',
  '/notifications': 'Notifications',
  '/referrals': 'Referrals',
  '/disputes': 'Disputes',
  '/admin': 'Admin',
};

function getPageTitle(pathname) {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Prefix match for nested routes like /chat/:id, /sessions/:id
  const base = '/' + pathname.split('/')[1];
  return PAGE_TITLES[base] || 'SkillX';
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { modeInfo } = useMode();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const pageTitle = getPageTitle(location.pathname);
  const displayName = user?.name || user?.username || 'User';
  const avatarUrl = user?.avatar;

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-dark-950 text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="shrink-0 h-16 glass border-b border-dark-700/50 flex items-center gap-4 px-4 lg:px-6 z-30">
          {/* Left: Hamburger + Page Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-white truncate">
                {pageTitle}
              </h1>
              <p className="text-xs text-dark-400 truncate hidden sm:block">
                {modeInfo?.description}
              </p>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-xl mx-auto hidden md:block">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search skills, people, posts..."
                className="w-full bg-dark-800/60 border border-dark-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/50 transition-all duration-200"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Create Post */}
            <NavLink
              to="/create-post"
              className="btn-primary hidden sm:inline-flex items-center gap-2 !px-4 !py-2 text-sm"
            >
              <Plus size={16} />
              <span className="hidden lg:inline">Create Post</span>
            </NavLink>
            <NavLink
              to="/create-post"
              className="sm:hidden p-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              aria-label="Create post"
            >
              <Plus size={18} />
            </NavLink>

            {/* Notifications */}
            <NavLink
              to="/notifications"
              className="relative p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>

            {/* User Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-dark-800 transition-colors"
                aria-label="User menu"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-dark-600"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-sm font-bold text-white ring-2 ring-dark-600">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <ChevronDown
                  size={14}
                  className={`text-dark-400 hidden sm:block transition-transform duration-200 ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 glass-card shadow-2xl shadow-black/40 overflow-hidden z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-dark-700/50">
                      <p className="text-sm font-medium text-white truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-dark-400 truncate">
                        {user?.email}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="p-1.5">
                      <NavLink
                        to={`/profile/${user?._id || ''}`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-300 hover:text-white hover:bg-dark-800 transition-colors"
                      >
                        <User size={16} />
                        My Profile
                      </NavLink>
                      <NavLink
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-300 hover:text-white hover:bg-dark-800 transition-colors"
                      >
                        <Settings size={16} />
                        Settings
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
