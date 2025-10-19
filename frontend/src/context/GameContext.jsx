import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Initial state
const initialState = {
  gameState: {
    currentLocation: 'CryptoMarket',
    avatar: null,
    level: 1,
    xp: 0,
    securityScore: 50,
    missions: [],
    achievements: [],
    reputation: 0,
  },
  notifications: [],
  isLoading: false,
  error: null,
};

// Action types
const GameActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_GAME_STATE: 'SET_GAME_STATE',
  UPDATE_LOCATION: 'UPDATE_LOCATION',
  UPDATE_AVATAR: 'UPDATE_AVATAR',
  UPDATE_XP: 'UPDATE_XP',
  UPDATE_SECURITY_SCORE: 'UPDATE_SECURITY_SCORE',
  ADD_MISSION: 'ADD_MISSION',
  UPDATE_MISSION: 'UPDATE_MISSION',
  COMPLETE_MISSION: 'COMPLETE_MISSION',
  ADD_ACHIEVEMENT: 'ADD_ACHIEVEMENT',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case GameActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case GameActionTypes.SET_GAME_STATE:
      return {
        ...state,
        gameState: action.payload,
        isLoading: false,
        error: null,
      };
    case GameActionTypes.UPDATE_LOCATION:
      return {
        ...state,
        gameState: {
          ...state.gameState,
          currentLocation: action.payload,
        },
      };
    case GameActionTypes.UPDATE_AVATAR:
      return {
        ...state,
        gameState: {
          ...state.gameState,
          avatar: { ...state.gameState.avatar, ...action.payload },
        },
      };
    case GameActionTypes.UPDATE_XP:
      return {
        ...state,
        gameState: {
          ...state.gameState,
          xp: state.gameState.xp + action.payload,
          level: Math.floor((state.gameState.xp + action.payload) / 1000) + 1,
        },
      };
    case GameActionTypes.UPDATE_SECURITY_SCORE:
      return {
        ...state,
        gameState: {
          ...state.gameState,
          securityScore: Math.max(0, Math.min(100, state.gameState.securityScore + action.payload)),
        },
      };
    case GameActionTypes.ADD_MISSION:
      return {
        ...state,
        gameState: {
          ...state.gameState,
          missions: [...state.gameState.missions, action.payload],
        },
      };
    case GameActionTypes.UPDATE_MISSION:
      return {
        ...state,
        gameState: {
          ...state.gameState,
          missions: state.gameState.missions.map(mission =>
            mission.id === action.payload.id ? { ...mission, ...action.payload.updates } : mission
          ),
        },
      };
    case GameActionTypes.COMPLETE_MISSION:
      return {
        ...state,
        gameState: {
          ...state.gameState,
          missions: state.gameState.missions.filter(mission => mission.id !== action.payload),
        },
      };
    case GameActionTypes.ADD_ACHIEVEMENT:
      return {
        ...state,
        gameState: {
          ...state.gameState,
          achievements: [...state.gameState.achievements, action.payload],
        },
      };
    case GameActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    case GameActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload),
      };
    case GameActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case GameActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Context
const GameContext = createContext();

// Provider component
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Navigate to location
  const navigateToLocation = async (locationId) => {
    try {
      const response = await fetch(`/api/map/navigate/${locationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to navigate');
      }

      dispatch({ type: GameActionTypes.UPDATE_LOCATION, payload: locationId });
      toast.success(`Navigated to ${locationId}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Update avatar
  const updateAvatar = async (avatarData) => {
    try {
      const response = await fetch('/api/avatar/customize', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(avatarData),
      });

      if (!response.ok) {
        throw new Error('Failed to update avatar');
      }

      const data = await response.json();
      dispatch({ type: GameActionTypes.UPDATE_AVATAR, payload: data });
      toast.success('Avatar updated successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Award XP
  const awardXP = (amount, reason) => {
    dispatch({ type: GameActionTypes.UPDATE_XP, payload: amount });
    toast.success(`+${amount} XP for ${reason}`);
  };

  // Update security score
  const updateSecurityScore = (change, reason) => {
    dispatch({ type: GameActionTypes.UPDATE_SECURITY_SCORE, payload: change });
    if (change > 0) {
      toast.success(`+${change} Security Score for ${reason}`);
    } else {
      toast.error(`${change} Security Score for ${reason}`);
    }
  };

  // Add notification
  const addNotification = (notification) => {
    const id = Date.now().toString();
    dispatch({ type: GameActionTypes.ADD_NOTIFICATION, payload: { ...notification, id } });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      dispatch({ type: GameActionTypes.REMOVE_NOTIFICATION, payload: id });
    }, 5000);
  };

  // Remove notification
  const removeNotification = (id) => {
    dispatch({ type: GameActionTypes.REMOVE_NOTIFICATION, payload: id });
  };

  // Fetch game state
  const fetchGameState = async () => {
    dispatch({ type: GameActionTypes.SET_LOADING, payload: true });
    try {
      const response = await fetch('/api/user/game-state', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch game state');
      }

      const data = await response.json();
      dispatch({ type: GameActionTypes.SET_GAME_STATE, payload: data });
    } catch (error) {
      dispatch({ type: GameActionTypes.SET_ERROR, payload: error.message });
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: GameActionTypes.CLEAR_ERROR });
  };

  // Load game state on mount
  useEffect(() => {
    fetchGameState();
  }, []);

  const value = {
    ...state,
    navigateToLocation,
    updateAvatar,
    awardXP,
    updateSecurityScore,
    addNotification,
    removeNotification,
    fetchGameState,
    clearError,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Hook to use game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
