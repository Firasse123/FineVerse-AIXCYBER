import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Initial state
const initialState = {
  avatar: null,
  isLoading: true,
  error: null,
  customization: null,
  skills: null,
  badges: [],
  progression: null
};

// Action types
const AvatarActionTypes = {
  FETCH_AVATAR_START: 'FETCH_AVATAR_START',
  FETCH_AVATAR_SUCCESS: 'FETCH_AVATAR_SUCCESS',
  FETCH_AVATAR_FAILURE: 'FETCH_AVATAR_FAILURE',
  UPDATE_AVATAR_SUCCESS: 'UPDATE_AVATAR_SUCCESS',
  UPDATE_CUSTOMIZATION_SUCCESS: 'UPDATE_CUSTOMIZATION_SUCCESS',
  UPDATE_SKILLS_SUCCESS: 'UPDATE_SKILLS_SUCCESS',
  ADD_BADGE_SUCCESS: 'ADD_BADGE_SUCCESS',
  ADD_XP_SUCCESS: 'ADD_XP_SUCCESS',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const avatarReducer = (state, action) => {
  switch (action.type) {
    case AvatarActionTypes.FETCH_AVATAR_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case AvatarActionTypes.FETCH_AVATAR_SUCCESS:
      return {
        ...state,
        avatar: action.payload,
        isLoading: false,
        error: null
      };
    case AvatarActionTypes.FETCH_AVATAR_FAILURE:
      return {
        ...state,
        avatar: null,
        isLoading: false,
        error: action.payload
      };
    case AvatarActionTypes.UPDATE_AVATAR_SUCCESS:
      return {
        ...state,
        avatar: { ...state.avatar, ...action.payload }
      };
    case AvatarActionTypes.UPDATE_CUSTOMIZATION_SUCCESS:
      return {
        ...state,
        avatar: {
          ...state.avatar,
          appearance: { ...state.avatar.appearance, ...action.payload }
        }
      };
    case AvatarActionTypes.UPDATE_SKILLS_SUCCESS:
      return {
        ...state,
        avatar: {
          ...state.avatar,
          skills: action.payload.skills,
          totalSkillPoints: action.payload.totalSkillPoints,
          skillLevel: action.payload.skillLevel
        }
      };
    case AvatarActionTypes.ADD_BADGE_SUCCESS:
      return {
        ...state,
        avatar: {
          ...state.avatar,
          badges: [...state.avatar.badges, action.payload]
        }
      };
    case AvatarActionTypes.ADD_XP_SUCCESS:
      return {
        ...state,
        avatar: {
          ...state.avatar,
          xp: action.payload.xp,
          level: action.payload.level,
          nextLevelXP: action.payload.nextLevelXP,
          xpProgress: action.payload.xpProgress
        }
      };
    case AvatarActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    case AvatarActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Context
const AvatarContext = createContext();

// Provider component
export const AvatarProvider = ({ children }) => {
  const [state, dispatch] = useReducer(avatarReducer, initialState);

  // Fetch avatar profile on mount
  useEffect(() => {
    fetchAvatarProfile();
  }, []);

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch avatar profile
  const fetchAvatarProfile = async () => {
    dispatch({ type: AvatarActionTypes.FETCH_AVATAR_START });
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/avatar/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch avatar profile');
      }

      const data = await response.json();
      dispatch({ type: AvatarActionTypes.FETCH_AVATAR_SUCCESS, payload: data.avatar });
      return data.avatar;
    } catch (error) {
      console.error('Avatar profile fetch error:', error);
      dispatch({ type: AvatarActionTypes.FETCH_AVATAR_FAILURE, payload: error.message });
      throw error;
    }
  };

  // Update avatar profile
  const updateAvatarProfile = async (profileData) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/avatar/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update avatar profile');
      }

      const data = await response.json();
      dispatch({ type: AvatarActionTypes.UPDATE_AVATAR_SUCCESS, payload: data.avatar });
      toast.success('Avatar profile updated successfully!');
      return data.avatar;
    } catch (error) {
      console.error('Avatar profile update error:', error);
      toast.error(error.message || 'Failed to update avatar profile');
      throw error;
    }
  };

  // Fetch customization data
  const fetchCustomization = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/avatar/customization', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customization data');
      }

      const data = await response.json();
      return data.customization;
    } catch (error) {
      console.error('Customization fetch error:', error);
      throw error;
    }
  };

  // Update avatar appearance
  const updateAppearance = async (appearance) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/avatar/customization', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ appearance })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update appearance');
      }

      const data = await response.json();
      dispatch({ type: AvatarActionTypes.UPDATE_CUSTOMIZATION_SUCCESS, payload: appearance });
      toast.success('Appearance updated successfully!');
      return data.appearance;
    } catch (error) {
      console.error('Appearance update error:', error);
      toast.error(error.message || 'Failed to update appearance');
      throw error;
    }
  };

  // Fetch skills
  const fetchSkills = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/avatar/skills', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch skills');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Skills fetch error:', error);
      throw error;
    }
  };

  // Update skill
  const updateSkill = async (skillType, points) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/avatar/skills', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ skillType, points })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update skill');
      }

      const data = await response.json();
      dispatch({ type: AvatarActionTypes.UPDATE_SKILLS_SUCCESS, payload: data });
      toast.success(`Skill updated! ${points} points added to ${skillType}`);
      return data;
    } catch (error) {
      console.error('Skill update error:', error);
      toast.error(error.message || 'Failed to update skill');
      throw error;
    }
  };

  // Fetch badges
  const fetchBadges = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/avatar/badges', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch badges');
      }

      const data = await response.json();
      return data.badges;
    } catch (error) {
      console.error('Badges fetch error:', error);
      throw error;
    }
  };

  // Add badge
  const addBadge = async (badgeData) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/avatar/badges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(badgeData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add badge');
      }

      const data = await response.json();
      dispatch({ type: AvatarActionTypes.ADD_BADGE_SUCCESS, payload: data.newBadge });
      toast.success(`Badge earned: ${badgeData.badgeName}!`);
      return data.newBadge;
    } catch (error) {
      console.error('Badge addition error:', error);
      toast.error(error.message || 'Failed to add badge');
      throw error;
    }
  };

  // Fetch progression
  const fetchProgression = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/avatar/progression', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch progression');
      }

      const data = await response.json();
      return data.progression;
    } catch (error) {
      console.error('Progression fetch error:', error);
      throw error;
    }
  };

  // Add XP
  const addXP = async (amount, source, description) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/avatar/xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount, source, description })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add XP');
      }

      const data = await response.json();
      dispatch({ type: AvatarActionTypes.ADD_XP_SUCCESS, payload: data });
      
      if (data.leveledUp) {
        toast.success(`Level up! You're now level ${data.level}!`);
      } else {
        toast.success(`+${amount} XP gained!`);
      }
      
      return data;
    } catch (error) {
      console.error('XP addition error:', error);
      toast.error(error.message || 'Failed to add XP');
      throw error;
    }
  };

  // Update status
  const updateStatus = async (status, statusMessage, isOnline) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/avatar/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, statusMessage, isOnline })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      const data = await response.json();
      dispatch({ type: AvatarActionTypes.UPDATE_AVATAR_SUCCESS, payload: data });
      return data;
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(error.message || 'Failed to update status');
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AvatarActionTypes.CLEAR_ERROR });
  };

  const value = {
    ...state,
    fetchAvatarProfile,
    updateAvatarProfile,
    fetchCustomization,
    updateAppearance,
    fetchSkills,
    updateSkill,
    fetchBadges,
    addBadge,
    fetchProgression,
    addXP,
    updateStatus,
    clearError
  };

  return (
    <AvatarContext.Provider value={value}>
      {children}
    </AvatarContext.Provider>
  );
};

// Hook to use avatar context
export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
};
