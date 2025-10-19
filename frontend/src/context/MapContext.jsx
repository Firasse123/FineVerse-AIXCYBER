import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Initial state
const initialState = {
  locations: [],
  currentLocation: null,
  isLoading: true,
  error: null,
  explorationProgress: null
};

// Action types
const MapActionTypes = {
  FETCH_LOCATIONS_START: 'FETCH_LOCATIONS_START',
  FETCH_LOCATIONS_SUCCESS: 'FETCH_LOCATIONS_SUCCESS',
  FETCH_LOCATIONS_FAILURE: 'FETCH_LOCATIONS_FAILURE',
  FETCH_CURRENT_LOCATION_SUCCESS: 'FETCH_CURRENT_LOCATION_SUCCESS',
  TRAVEL_SUCCESS: 'TRAVEL_SUCCESS',
  FETCH_EXPLORATION_PROGRESS_SUCCESS: 'FETCH_EXPLORATION_PROGRESS_SUCCESS',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const mapReducer = (state, action) => {
  switch (action.type) {
    case MapActionTypes.FETCH_LOCATIONS_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case MapActionTypes.FETCH_LOCATIONS_SUCCESS:
      return {
        ...state,
        locations: action.payload.locations,
        currentLocation: action.payload.currentLocation,
        isLoading: false,
        error: null
      };
    case MapActionTypes.FETCH_LOCATIONS_FAILURE:
      return {
        ...state,
        locations: [],
        isLoading: false,
        error: action.payload
      };
    case MapActionTypes.FETCH_CURRENT_LOCATION_SUCCESS:
      return {
        ...state,
        currentLocation: action.payload
      };
    case MapActionTypes.TRAVEL_SUCCESS:
      return {
        ...state,
        currentLocation: action.payload.locationId,
        locations: state.locations.map(location => 
          location.id === action.payload.locationId 
            ? { ...location, isVisited: true, isCurrentLocation: true }
            : { ...location, isCurrentLocation: false }
        )
      };
    case MapActionTypes.FETCH_EXPLORATION_PROGRESS_SUCCESS:
      return {
        ...state,
        explorationProgress: action.payload
      };
    case MapActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    case MapActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Context
const MapContext = createContext();

// Provider component
export const MapProvider = ({ children }) => {
  const [state, dispatch] = useReducer(mapReducer, initialState);

  // Fetch map data on mount
  useEffect(() => {
    fetchMapData();
  }, []);

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch all map data
  const fetchMapData = async () => {
    dispatch({ type: MapActionTypes.FETCH_LOCATIONS_START });
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/map/locations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch map locations');
      }

      const data = await response.json();
      dispatch({ 
        type: MapActionTypes.FETCH_LOCATIONS_SUCCESS, 
        payload: {
          locations: data.locations,
          currentLocation: data.currentLocation
        }
      });
    } catch (error) {
      console.error('Map data fetch error:', error);
      dispatch({ type: MapActionTypes.FETCH_LOCATIONS_FAILURE, payload: error.message });
    }
  };

  // Fetch current location details
  const fetchCurrentLocation = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/map/current-location', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch current location');
      }

      const data = await response.json();
      dispatch({ type: MapActionTypes.FETCH_CURRENT_LOCATION_SUCCESS, payload: data.location });
      return data.location;
    } catch (error) {
      console.error('Current location fetch error:', error);
      throw error;
    }
  };

  // Travel to a location
  const travelToLocation = async (locationId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/map/travel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ locationId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to travel to location');
      }

      const data = await response.json();
      dispatch({ type: MapActionTypes.TRAVEL_SUCCESS, payload: { locationId } });
      
      if (data.isNewLocation) {
        toast.success(`Welcome to ${data.location.name}!`);
      } else {
        toast.success(`Traveled to ${data.location.name}`);
      }
      
      return data;
    } catch (error) {
      console.error('Travel error:', error);
      toast.error(error.message || 'Failed to travel to location');
      throw error;
    }
  };

  // Fetch exploration progress
  const fetchExplorationProgress = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/map/exploration-progress', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch exploration progress');
      }

      const data = await response.json();
      dispatch({ type: MapActionTypes.FETCH_EXPLORATION_PROGRESS_SUCCESS, payload: data.progress });
      return data.progress;
    } catch (error) {
      console.error('Exploration progress fetch error:', error);
      throw error;
    }
  };

  // Get location by ID
  const getLocationById = (locationId) => {
    return state.locations.find(location => location.id === locationId);
  };

  // Get locations by type
  const getLocationsByType = (type) => {
    return state.locations.filter(location => location.type === type);
  };

  // Get unlocked locations
  const getUnlockedLocations = () => {
    return state.locations.filter(location => location.isUnlocked);
  };

  // Get visited locations
  const getVisitedLocations = () => {
    return state.locations.filter(location => location.isVisited);
  };

  // Check if location is accessible
  const isLocationAccessible = (locationId) => {
    const location = getLocationById(locationId);
    return location && location.isUnlocked;
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: MapActionTypes.CLEAR_ERROR });
  };

  const value = {
    ...state,
    fetchMapData,
    fetchCurrentLocation,
    travelToLocation,
    fetchExplorationProgress,
    getLocationById,
    getLocationsByType,
    getUnlockedLocations,
    getVisitedLocations,
    isLocationAccessible,
    clearError
  };

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
};

// Hook to use map context
export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};
