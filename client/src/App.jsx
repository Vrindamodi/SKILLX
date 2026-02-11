import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import MyPosts from './pages/MyPosts';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import SessionFlow from './pages/SessionFlow';
import Chat from './pages/Chat';
import Wallet from './pages/Wallet';
import Analytics from './pages/Analytics';
import Leaderboard from './pages/Leaderboard';
import LearningPaths from './pages/LearningPaths';
import Community from './pages/Community';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Referrals from './pages/Referrals';
import Disputes from './pages/Disputes';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import SocialImpact from './pages/SocialImpact';
import StrawberryWidget from './components/ai/StrawberryWidget';
import LandingPage from './pages/LandingPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin-slow text-4xl">✕</div></div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin-slow text-4xl">✕</div></div>;
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<PublicRoute><Onboarding /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        
        {/* Protected routes with Layout */}
        <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/my-posts" element={<MyPosts />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/sessions" element={<SessionFlow />} />
          <Route path="/sessions/:id" element={<SessionFlow />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:conversationId" element={<Chat />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/learning-paths" element={<LearningPaths />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile/:id?" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/disputes" element={<Disputes />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/social-impact" element={<SocialImpact />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} />} />
      </Routes>
      
      {/* Strawberry AI Assistant - visible on all protected pages */}
      {isAuthenticated && <StrawberryWidget />}
    </>
  );
}

export default App;
