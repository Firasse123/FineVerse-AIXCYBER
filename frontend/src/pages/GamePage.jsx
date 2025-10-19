import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMap } from '../context/MapContext';
import { useAvatar } from '../context/AvatarContext';
import InteractiveMap from '../components/InteractiveMap';
import LocationActivities from '../components/LocationActivities';
import { toast } from 'react-hot-toast';

const GamePage = () => {
  const { currentLocation, fetchMapData } = useMap();
  const { avatar, fetchAvatarProfile } = useAvatar();
  const [activeTab, setActiveTab] = useState('map');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchMapData(),
        fetchAvatarProfile()
      ]);
    } catch (error) {
      console.error('Game initialization failed:', error);
      toast.error('Failed to initialize game');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'map', label: 'Map', icon: '🗺️' },
    { id: 'activities', label: 'Activities', icon: '⚡' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼' },
    { id: 'market', label: 'Market', icon: '📈' }
  ];

  const renderMapTab = () => {
    return <InteractiveMap />;
  };

  const renderActivitiesTab = () => {
    return <LocationActivities />;
  };

  const renderPortfolioTab = () => {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-dark-text mb-4">Portfolio Overview</h3>
        <div className="text-center text-dark-text-muted">
          <p>Portfolio management coming soon!</p>
          <p className="text-sm">This will include your holdings, performance, and trading history.</p>
        </div>
      </div>
    );
  };

  const renderMarketTab = () => {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-dark-text mb-4">Market Data</h3>
        <div className="text-center text-dark-text-muted">
          <p>Real-time market data coming soon!</p>
          <p className="text-sm">This will include live prices, charts, and market analysis.</p>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'map':
        return renderMapTab();
      case 'activities':
        return renderActivitiesTab();
      case 'portfolio':
        return renderPortfolioTab();
      case 'market':
        return renderMarketTab();
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-dark-text-muted">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎮</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AIxCyber Financial Simulator</h1>
                <p className="text-white/80">
                  {currentLocation ? `Currently at: ${currentLocation}` : 'Welcome to the game!'}
                </p>
              </div>
            </div>
            
            {/* Avatar Info */}
            {avatar && (
              <div className="text-right text-white">
                <div className="text-lg font-semibold">{avatar.name}</div>
                <div className="text-sm text-white/80">Level {avatar.level} • {avatar.xp} XP</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4">
        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-dark-surface rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'text-dark-text-muted hover:text-dark-text hover:bg-dark-border'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GamePage;
