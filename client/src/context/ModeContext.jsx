import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from './AuthContext';

const ModeContext = createContext(null);

export const MODE_CONFIG = {
  learn: {
    label: 'Learn',
    icon: '📚',
    color: '#4CAF50',
    description: 'Find skills to learn from talented teachers',
  },
  teach: {
    label: 'Teach',
    icon: '🎓',
    color: '#2196F3',
    description: 'Share your expertise and teach others',
  },
  rent: {
    label: 'Rent',
    icon: '🔧',
    color: '#FF9800',
    description: 'Rent out tools, equipment, or spaces',
  },
  service: {
    label: 'Service',
    icon: '🛠️',
    color: '#9C27B0',
    description: 'Offer professional services to clients',
  },
  request: {
    label: 'Request',
    icon: '📋',
    color: '#F44336',
    description: 'Post requests for skills or services you need',
  },
};

export const MODES = Object.keys(MODE_CONFIG);

export function ModeProvider({ children }) {
  const { user, updateUser } = useAuth();
  const [currentMode, setCurrentMode] = useState(() => {
    return user?.currentMode || 'learn';
  });
  const [switching, setSwitching] = useState(false);

  // Sync with user's currentMode when user changes (e.g. after login)
  useEffect(() => {
    if (user?.currentMode && user.currentMode !== currentMode) {
      setCurrentMode(user.currentMode);
    }
  }, [user?.currentMode]);

  const switchMode = useCallback(async (mode) => {
    if (!MODES.includes(mode) || mode === currentMode) return;

    setSwitching(true);
    try {
      const res = await userAPI.switchMode(mode);
      setCurrentMode(mode);

      // Keep AuthContext user in sync
      if (res.data?.user) {
        updateUser(res.data.user);
      }
    } catch (err) {
      console.error('Failed to switch mode:', err);
      throw err;
    } finally {
      setSwitching(false);
    }
  }, [currentMode, updateUser]);

  const modeInfo = MODE_CONFIG[currentMode];

  const value = {
    currentMode,
    modeInfo,
    modeConfig: MODE_CONFIG,
    modes: MODES,
    switching,
    switchMode,
  };

  return (
    <ModeContext.Provider value={value}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}

export default ModeContext;
