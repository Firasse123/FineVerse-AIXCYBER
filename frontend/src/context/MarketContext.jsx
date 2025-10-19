import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Initial state
const initialState = {
  marketData: {
    assets: [],
    prices: {},
    sentiment: 'neutral',
    topMovers: { gainers: [], losers: [] },
  },
  watchlist: [],
  isLoading: false,
  error: null,
  lastUpdate: null,
};

// Action types
const MarketActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_MARKET_DATA: 'SET_MARKET_DATA',
  UPDATE_PRICES: 'UPDATE_PRICES',
  SET_WATCHLIST: 'SET_WATCHLIST',
  ADD_TO_WATCHLIST: 'ADD_TO_WATCHLIST',
  REMOVE_FROM_WATCHLIST: 'REMOVE_FROM_WATCHLIST',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LAST_UPDATE: 'SET_LAST_UPDATE',
};

// Reducer
const marketReducer = (state, action) => {
  switch (action.type) {
    case MarketActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case MarketActionTypes.SET_MARKET_DATA:
      return {
        ...state,
        marketData: action.payload,
        isLoading: false,
        error: null,
        lastUpdate: new Date().toISOString(),
      };
    case MarketActionTypes.UPDATE_PRICES:
      return {
        ...state,
        marketData: {
          ...state.marketData,
          prices: { ...state.marketData.prices, ...action.payload },
        },
        lastUpdate: new Date().toISOString(),
      };
    case MarketActionTypes.SET_WATCHLIST:
      return {
        ...state,
        watchlist: action.payload,
      };
    case MarketActionTypes.ADD_TO_WATCHLIST:
      return {
        ...state,
        watchlist: [...state.watchlist, action.payload],
      };
    case MarketActionTypes.REMOVE_FROM_WATCHLIST:
      return {
        ...state,
        watchlist: state.watchlist.filter(item => item.id !== action.payload),
      };
    case MarketActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case MarketActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case MarketActionTypes.SET_LAST_UPDATE:
      return {
        ...state,
        lastUpdate: action.payload,
      };
    default:
      return state;
  }
};

// Context
const MarketContext = createContext();

// Provider component
export const MarketProvider = ({ children }) => {
  const [state, dispatch] = useReducer(marketReducer, initialState);

  // Fetch market data
  const fetchMarketData = async () => {
    dispatch({ type: MarketActionTypes.SET_LOADING, payload: true });
    try {
      const response = await fetch('/api/market/assets', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }

      const data = await response.json();
      dispatch({ type: MarketActionTypes.SET_MARKET_DATA, payload: data });
    } catch (error) {
      dispatch({ type: MarketActionTypes.SET_ERROR, payload: error.message });
      toast.error('Failed to load market data');
    }
  };

  // Fetch asset details
  const fetchAssetDetails = async (assetId) => {
    try {
      const response = await fetch(`/api/market/asset/${assetId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch asset details');
      }

      return await response.json();
    } catch (error) {
      toast.error('Failed to load asset details');
      throw error;
    }
  };

  // Fetch price history
  const fetchPriceHistory = async (assetId, timeframe = '1D') => {
    try {
      const response = await fetch(`/api/market/asset/${assetId}/price-history?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch price history');
      }

      return await response.json();
    } catch (error) {
      toast.error('Failed to load price history');
      throw error;
    }
  };

  // Fetch watchlist
  const fetchWatchlist = async () => {
    try {
      const response = await fetch('/api/market/watchlist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch watchlist');
      }

      const data = await response.json();
      dispatch({ type: MarketActionTypes.SET_WATCHLIST, payload: data });
    } catch (error) {
      dispatch({ type: MarketActionTypes.SET_ERROR, payload: error.message });
    }
  };

  // Add to watchlist
  const addToWatchlist = async (assetId) => {
    try {
      const response = await fetch('/api/market/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ assetId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to watchlist');
      }

      const data = await response.json();
      dispatch({ type: MarketActionTypes.ADD_TO_WATCHLIST, payload: data });
      toast.success('Added to watchlist');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Remove from watchlist
  const removeFromWatchlist = async (assetId) => {
    try {
      const response = await fetch(`/api/market/watchlist/${assetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove from watchlist');
      }

      dispatch({ type: MarketActionTypes.REMOVE_FROM_WATCHLIST, payload: assetId });
      toast.success('Removed from watchlist');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: MarketActionTypes.CLEAR_ERROR });
  };

  // Load market data on mount
  useEffect(() => {
    fetchMarketData();
    fetchWatchlist();
  }, []);

  const value = {
    ...state,
    fetchMarketData,
    fetchAssetDetails,
    fetchPriceHistory,
    fetchWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    clearError,
  };

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
};

// Hook to use market context
export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
