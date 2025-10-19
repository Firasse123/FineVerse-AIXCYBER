import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Initial state
const initialState = {
  portfolio: {
    totalValue: 10000,
    cash: 10000,
    holdings: [],
    gainLoss: 0,
    gainLossPercent: 0,
  },
  positions: [],
  transactions: [],
  isLoading: false,
  error: null,
};

// Action types
const PortfolioActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_PORTFOLIO: 'SET_PORTFOLIO',
  UPDATE_PORTFOLIO: 'UPDATE_PORTFOLIO',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  SET_TRANSACTIONS: 'SET_TRANSACTIONS',
  SET_POSITIONS: 'SET_POSITIONS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const portfolioReducer = (state, action) => {
  switch (action.type) {
    case PortfolioActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case PortfolioActionTypes.SET_PORTFOLIO:
      return {
        ...state,
        portfolio: action.payload,
        isLoading: false,
        error: null,
      };
    case PortfolioActionTypes.UPDATE_PORTFOLIO:
      return {
        ...state,
        portfolio: { ...state.portfolio, ...action.payload },
      };
    case PortfolioActionTypes.ADD_TRANSACTION:
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
    case PortfolioActionTypes.SET_TRANSACTIONS:
      return {
        ...state,
        transactions: action.payload,
      };
    case PortfolioActionTypes.SET_POSITIONS:
      return {
        ...state,
        positions: action.payload,
      };
    case PortfolioActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case PortfolioActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Context
const PortfolioContext = createContext();

// Provider component
export const PortfolioProvider = ({ children }) => {
  const [state, dispatch] = useReducer(portfolioReducer, initialState);

  // Fetch portfolio data
  const fetchPortfolio = async () => {
    dispatch({ type: PortfolioActionTypes.SET_LOADING, payload: true });
    try {
      // TODO: Implement actual API call
      const response = await fetch('/api/portfolio', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio');
      }

      const data = await response.json();
      dispatch({ type: PortfolioActionTypes.SET_PORTFOLIO, payload: data });
    } catch (error) {
      dispatch({ type: PortfolioActionTypes.SET_ERROR, payload: error.message });
      toast.error('Failed to load portfolio');
    }
  };

  // Execute buy trade
  const buyAsset = async (assetId, quantity, price) => {
    dispatch({ type: PortfolioActionTypes.SET_LOADING, payload: true });
    try {
      const response = await fetch('/api/portfolio/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ assetId, quantity, price }),
      });

      if (!response.ok) {
        throw new Error('Buy order failed');
      }

      const data = await response.json();
      dispatch({ type: PortfolioActionTypes.ADD_TRANSACTION, payload: data.transaction });
      dispatch({ type: PortfolioActionTypes.UPDATE_PORTFOLIO, payload: data.portfolio });
      toast.success('Buy order executed successfully!');
    } catch (error) {
      dispatch({ type: PortfolioActionTypes.SET_ERROR, payload: error.message });
      toast.error(error.message);
    }
  };

  // Execute sell trade
  const sellAsset = async (assetId, quantity, price) => {
    dispatch({ type: PortfolioActionTypes.SET_LOADING, payload: true });
    try {
      const response = await fetch('/api/portfolio/sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ assetId, quantity, price }),
      });

      if (!response.ok) {
        throw new Error('Sell order failed');
      }

      const data = await response.json();
      dispatch({ type: PortfolioActionTypes.ADD_TRANSACTION, payload: data.transaction });
      dispatch({ type: PortfolioActionTypes.UPDATE_PORTFOLIO, payload: data.portfolio });
      toast.success('Sell order executed successfully!');
    } catch (error) {
      dispatch({ type: PortfolioActionTypes.SET_ERROR, payload: error.message });
      toast.error(error.message);
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/portfolio/transactions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      dispatch({ type: PortfolioActionTypes.SET_TRANSACTIONS, payload: data });
    } catch (error) {
      dispatch({ type: PortfolioActionTypes.SET_ERROR, payload: error.message });
    }
  };

  // Fetch positions
  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/portfolio/positions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch positions');
      }

      const data = await response.json();
      dispatch({ type: PortfolioActionTypes.SET_POSITIONS, payload: data });
    } catch (error) {
      dispatch({ type: PortfolioActionTypes.SET_ERROR, payload: error.message });
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: PortfolioActionTypes.CLEAR_ERROR });
  };

  // Load portfolio data on mount
  useEffect(() => {
    fetchPortfolio();
    fetchTransactions();
    fetchPositions();
  }, []);

  const value = {
    ...state,
    fetchPortfolio,
    buyAsset,
    sellAsset,
    fetchTransactions,
    fetchPositions,
    clearError,
  };

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
};

// Hook to use portfolio context
export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
