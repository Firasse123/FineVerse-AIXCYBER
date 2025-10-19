import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMap } from '../context/MapContext';
import { toast } from 'react-hot-toast';

const InteractiveMap = () => {
  const { 
    locations, 
    currentLocation, 
    isLoading, 
    travelToLocation, 
    getLocationById,
    isLocationAccessible 
  } = useMap();
  
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [mapView, setMapView] = useState('overview'); // overview, detailed, exploration

  useEffect(() => {
    if (currentLocation) {
      setSelectedLocation(getLocationById(currentLocation));
    }
  }, [currentLocation, locations]);

  const handleLocationClick = async (location) => {
    if (!isLocationAccessible(location.id)) {
      toast.error(location.unlockMessage || 'Location is locked');
      return;
    }

    if (location.id === currentLocation) {
      setSelectedLocation(location);
      return;
    }

    try {
      await travelToLocation(location.id);
      setSelectedLocation(location);
    } catch (error) {
      console.error('Travel failed:', error);
    }
  };

  const getLocationIcon = (location) => {
    const icons = {
      commercial: '🏢',
      technology: '💻',
      security: '🛡️',
      trading: '📈',
      research: '🔬',
      crypto: '₿',
      risk: '⚖️',
      sentiment: '🧠',
      portfolio: '💼',
      education: '🎓',
      social: '👥',
      mystery: '❓'
    };
    return icons[location.type] || '📍';
  };

  const getLocationColor = (location) => {
    if (location.id === currentLocation) return 'text-primary-500';
    if (location.isVisited) return 'text-success-500';
    if (location.isUnlocked) return 'text-accent-500';
    return 'text-dark-text-muted';
  };

  const getLocationSize = (location) => {
    if (location.id === currentLocation) return 'w-16 h-16';
    if (location.isVisited) return 'w-12 h-12';
    return 'w-10 h-10';
  };

  const renderMapOverview = () => {
    return (
      <div className="relative w-full h-96 bg-gradient-to-br from-dark-surface to-dark-bg rounded-lg overflow-hidden">
        {/* Map Grid */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Locations */}
        {locations.map((location) => (
          <motion.div
            key={location.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: locations.indexOf(location) * 0.1 }}
            className={`absolute cursor-pointer transition-all duration-300 ${getLocationSize(location)}`}
            style={{
              left: `${location.coordinates.x}%`,
              top: `${location.coordinates.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => handleLocationClick(location)}
            onMouseEnter={() => setHoveredLocation(location)}
            onMouseLeave={() => setHoveredLocation(null)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className={`w-full h-full rounded-full border-2 flex items-center justify-center transition-all ${
              location.id === currentLocation 
                ? 'border-primary-500 bg-primary-500/20 shadow-lg shadow-primary-500/30' 
                : location.isUnlocked 
                  ? 'border-accent-500 bg-accent-500/10 hover:border-accent-400 hover:bg-accent-500/20' 
                  : 'border-dark-border bg-dark-surface/50'
            }`}>
              <span className={`text-2xl ${getLocationColor(location)}`}>
                {getLocationIcon(location)}
              </span>
            </div>

            {/* Location Name */}
            <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 rounded text-xs font-medium transition-all ${
              hoveredLocation?.id === location.id || location.id === currentLocation
                ? 'bg-dark-surface border border-dark-border text-dark-text opacity-100'
                : 'opacity-0'
            }`}>
              {location.name}
            </div>
          </motion.div>
        ))}

        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {locations.map((location) => {
            const nearbyLocations = locations.filter(loc => 
              loc.id !== location.id && 
              Math.sqrt(
                Math.pow(loc.coordinates.x - location.coordinates.x, 2) + 
                Math.pow(loc.coordinates.y - location.coordinates.y, 2)
              ) < 30
            );
            
            return nearbyLocations.map((nearby) => (
              <line
                key={`${location.id}-${nearby.id}`}
                x1={`${location.coordinates.x}%`}
                y1={`${location.coordinates.y}%`}
                x2={`${nearby.coordinates.x}%`}
                y2={`${nearby.coordinates.y}%`}
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.2"
                className="text-dark-border"
              />
            ));
          })}
        </svg>
      </div>
    );
  };

  const renderLocationDetails = () => {
    if (!selectedLocation) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-start space-x-4">
          <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${
            selectedLocation.id === currentLocation 
              ? 'border-primary-500 bg-primary-500/20' 
              : 'border-accent-500 bg-accent-500/10'
          }`}>
            <span className="text-3xl">{getLocationIcon(selectedLocation)}</span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-xl font-bold text-dark-text">{selectedLocation.name}</h3>
              {selectedLocation.id === currentLocation && (
                <span className="px-2 py-1 bg-primary-500/20 text-primary-500 text-xs rounded-full">
                  Current Location
                </span>
              )}
            </div>
            
            <p className="text-dark-text-muted mb-4">{selectedLocation.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm text-dark-text-muted">Type:</span>
                <span className="ml-2 text-sm text-dark-text capitalize">{selectedLocation.type}</span>
              </div>
              <div>
                <span className="text-sm text-dark-text-muted">Level:</span>
                <span className="ml-2 text-sm text-dark-text">{selectedLocation.level}</span>
              </div>
            </div>

            {/* Features */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-dark-text mb-2">Features:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedLocation.features.map((feature) => (
                  <span
                    key={feature}
                    className="px-2 py-1 bg-dark-surface text-xs text-dark-text rounded"
                  >
                    {feature.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Activities */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-dark-text mb-2">Activities:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedLocation.activities.map((activity) => (
                  <span
                    key={activity}
                    className="px-2 py-1 bg-accent-500/20 text-xs text-accent-500 rounded"
                  >
                    {activity.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Travel Button */}
            {selectedLocation.id !== currentLocation && (
              <button
                onClick={() => handleLocationClick(selectedLocation)}
                disabled={!isLocationAccessible(selectedLocation.id)}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                  isLocationAccessible(selectedLocation.id)
                    ? 'bg-primary-500 hover:bg-primary-600 text-white'
                    : 'bg-dark-surface text-dark-text-muted cursor-not-allowed'
                }`}
              >
                {isLocationAccessible(selectedLocation.id) 
                  ? `Travel to ${selectedLocation.name}`
                  : selectedLocation.unlockMessage || 'Location Locked'
                }
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderExplorationProgress = () => {
    const visitedCount = locations.filter(l => l.isVisited).length;
    const unlockedCount = locations.filter(l => l.isUnlocked).length;
    const totalCount = locations.length;

    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-dark-text mb-4">Exploration Progress</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-dark-text-muted mb-2">
              <span>Locations Visited</span>
              <span>{visitedCount}/{totalCount}</span>
            </div>
            <div className="w-full bg-dark-surface rounded-full h-2">
              <motion.div
                className="bg-gradient-accent h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(visitedCount / totalCount) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm text-dark-text-muted mb-2">
              <span>Locations Unlocked</span>
              <span>{unlockedCount}/{totalCount}</span>
            </div>
            <div className="w-full bg-dark-surface rounded-full h-2">
              <motion.div
                className="bg-gradient-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Location Types */}
          <div>
            <h4 className="text-sm font-medium text-dark-text mb-2">By Type:</h4>
            <div className="grid grid-cols-2 gap-2">
              {['commercial', 'technology', 'security', 'trading', 'research', 'crypto'].map((type) => {
                const typeLocations = locations.filter(l => l.type === type);
                const visited = typeLocations.filter(l => l.isVisited).length;
                return (
                  <div key={type} className="text-xs">
                    <span className="text-dark-text-muted capitalize">{type}:</span>
                    <span className="ml-1 text-dark-text">{visited}/{typeLocations.length}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-dark-text-muted">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient-primary mb-2">
            Interactive Map
          </h1>
          <p className="text-dark-text-muted">
            Explore the financial world and discover new locations
          </p>
        </div>

        {/* Map View Toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-1 bg-dark-surface rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: '🗺️' },
              { id: 'detailed', label: 'Detailed', icon: '📍' },
              { id: 'exploration', label: 'Progress', icon: '📊' }
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setMapView(view.id)}
                className={`flex items-center space-x-2 py-2 px-4 rounded-md transition-all ${
                  mapView === view.id
                    ? 'bg-primary-500 text-white'
                    : 'text-dark-text-muted hover:text-dark-text hover:bg-dark-border'
                }`}
              >
                <span>{view.icon}</span>
                <span className="font-medium">{view.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Map Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Visualization */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={mapView}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {mapView === 'overview' && renderMapOverview()}
                {mapView === 'detailed' && renderMapOverview()}
                {mapView === 'exploration' && renderExplorationProgress()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Location */}
            {currentLocation && (
              <div className="card">
                <h3 className="text-lg font-semibold text-dark-text mb-4">Current Location</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-xl">{getLocationIcon(selectedLocation)}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-dark-text">{selectedLocation?.name}</h4>
                    <p className="text-sm text-dark-text-muted">{selectedLocation?.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="card">
              <h3 className="text-lg font-semibold text-dark-text mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-dark-text-muted">Total Locations:</span>
                  <span className="text-dark-text font-medium">{locations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-text-muted">Visited:</span>
                  <span className="text-success-500 font-medium">
                    {locations.filter(l => l.isVisited).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-text-muted">Unlocked:</span>
                  <span className="text-accent-500 font-medium">
                    {locations.filter(l => l.isUnlocked).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Location Details */}
            {mapView !== 'exploration' && renderLocationDetails()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
