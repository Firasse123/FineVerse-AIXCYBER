const express = require('express');
const { body, validationResult } = require('express-validator');
const Avatar = require('../models/Avatar');
const User = require('../models/User');
const router = express.Router();

// Apply auth middleware to all routes
router.use((req, res, next) => {
  const authMiddleware = req.app.locals.authMiddleware;
  authMiddleware(req, res, next);
});

// Map locations configuration
const MAP_LOCATIONS = {
  'cyber-city-center': {
    id: 'cyber-city-center',
    name: 'Cyber City Center',
    description: 'The bustling heart of the financial district',
    type: 'commercial',
    coordinates: { x: 50, y: 50 },
    level: 1,
    features: ['trading-floor', 'news-center', 'bank'],
    npcs: ['market-analyst', 'news-reporter', 'banker'],
    activities: ['trade', 'read-news', 'banking'],
    unlockRequirements: { level: 1 },
    rewards: { xp: 10, reputation: 5 }
  },
  'tech-hub': {
    id: 'tech-hub',
    name: 'Tech Hub',
    description: 'Where innovation meets finance',
    type: 'technology',
    coordinates: { x: 30, y: 70 },
    level: 2,
    features: ['ai-lab', 'crypto-exchange', 'startup-incubator'],
    npcs: ['ai-specialist', 'crypto-trader', 'startup-founder'],
    activities: ['ai-analysis', 'crypto-trading', 'startup-investing'],
    unlockRequirements: { level: 2, skills: { technicalAnalysis: 10 } },
    rewards: { xp: 15, reputation: 8 }
  },
  'security-fortress': {
    id: 'security-fortress',
    name: 'Security Fortress',
    description: 'The ultimate cybersecurity training ground',
    type: 'security',
    coordinates: { x: 70, y: 30 },
    level: 3,
    features: ['cyber-range', 'threat-lab', 'security-hq'],
    npcs: ['cyber-expert', 'threat-hunter', 'security-chief'],
    activities: ['cyber-training', 'threat-analysis', 'security-missions'],
    unlockRequirements: { level: 3, skills: { cybersecurity: 15 } },
    rewards: { xp: 20, reputation: 12 }
  },
  'market-district': {
    id: 'market-district',
    name: 'Market District',
    description: 'Traditional and modern trading venues',
    type: 'trading',
    coordinates: { x: 20, y: 40 },
    level: 2,
    features: ['stock-exchange', 'forex-center', 'commodities-market'],
    npcs: ['stock-broker', 'forex-trader', 'commodities-expert'],
    activities: ['stock-trading', 'forex-trading', 'commodities-trading'],
    unlockRequirements: { level: 2, skills: { fundamentalAnalysis: 10 } },
    rewards: { xp: 18, reputation: 10 }
  },
  'research-institute': {
    id: 'research-institute',
    name: 'Research Institute',
    description: 'Advanced financial research and analysis',
    type: 'research',
    coordinates: { x: 80, y: 60 },
    level: 4,
    features: ['data-center', 'research-lab', 'analytics-hub'],
    npcs: ['research-director', 'data-scientist', 'quant-analyst'],
    activities: ['research-projects', 'data-analysis', 'quant-modeling'],
    unlockRequirements: { level: 4, skills: { technicalAnalysis: 20, fundamentalAnalysis: 20 } },
    rewards: { xp: 25, reputation: 15 }
  },
  'crypto-valley': {
    id: 'crypto-valley',
    name: 'Crypto Valley',
    description: 'The blockchain and cryptocurrency epicenter',
    type: 'crypto',
    coordinates: { x: 40, y: 20 },
    level: 3,
    features: ['blockchain-lab', 'defi-platform', 'nft-gallery'],
    npcs: ['blockchain-developer', 'defi-expert', 'nft-artist'],
    activities: ['blockchain-exploration', 'defi-trading', 'nft-collecting'],
    unlockRequirements: { level: 3, skills: { technicalAnalysis: 15 } },
    rewards: { xp: 22, reputation: 12 }
  },
  'risk-management-center': {
    id: 'risk-management-center',
    name: 'Risk Management Center',
    description: 'Master the art of portfolio protection',
    type: 'risk',
    coordinates: { x: 60, y: 80 },
    level: 3,
    features: ['risk-lab', 'portfolio-simulator', 'hedge-fund'],
    npcs: ['risk-manager', 'portfolio-analyst', 'hedge-fund-manager'],
    activities: ['risk-assessment', 'portfolio-optimization', 'hedge-strategies'],
    unlockRequirements: { level: 3, skills: { riskManagement: 15 } },
    rewards: { xp: 20, reputation: 12 }
  },
  'sentiment-square': {
    id: 'sentiment-square',
    name: 'Sentiment Square',
    description: 'Where market psychology meets reality',
    type: 'sentiment',
    coordinates: { x: 10, y: 80 },
    level: 2,
    features: ['sentiment-tracker', 'social-media-hub', 'news-aggregator'],
    npcs: ['sentiment-analyst', 'social-media-expert', 'news-curator'],
    activities: ['sentiment-analysis', 'social-trading', 'news-monitoring'],
    unlockRequirements: { level: 2, skills: { marketSentiment: 10 } },
    rewards: { xp: 15, reputation: 8 }
  },
  'portfolio-palace': {
    id: 'portfolio-palace',
    name: 'Portfolio Palace',
    description: 'The ultimate portfolio optimization destination',
    type: 'portfolio',
    coordinates: { x: 90, y: 40 },
    level: 4,
    features: ['optimization-lab', 'backtesting-center', 'strategy-builder'],
    npcs: ['portfolio-optimizer', 'backtesting-expert', 'strategy-designer'],
    activities: ['portfolio-optimization', 'strategy-backtesting', 'strategy-building'],
    unlockRequirements: { level: 4, skills: { portfolioOptimization: 20 } },
    rewards: { xp: 25, reputation: 15 }
  },
  'learning-academy': {
    id: 'learning-academy',
    name: 'Learning Academy',
    description: 'Master financial knowledge and skills',
    type: 'education',
    coordinates: { x: 50, y: 10 },
    level: 1,
    features: ['classroom', 'library', 'simulation-lab'],
    npcs: ['finance-professor', 'trading-instructor', 'simulation-master'],
    activities: ['take-courses', 'read-books', 'practice-simulations'],
    unlockRequirements: { level: 1 },
    rewards: { xp: 12, reputation: 6 }
  },
  'social-hub': {
    id: 'social-hub',
    name: 'Social Hub',
    description: 'Connect with other traders and investors',
    type: 'social',
    coordinates: { x: 10, y: 10 },
    level: 1,
    features: ['chat-lounge', 'leaderboard', 'community-forum'],
    npcs: ['community-manager', 'top-trader', 'forum-moderator'],
    activities: ['chat', 'compete', 'share-strategies'],
    unlockRequirements: { level: 1 },
    rewards: { xp: 8, reputation: 4 }
  },
  'mystery-location': {
    id: 'mystery-location',
    name: 'Mystery Location',
    description: 'A hidden location waiting to be discovered',
    type: 'mystery',
    coordinates: { x: 50, y: 90 },
    level: 5,
    features: ['secret-chamber', 'ancient-artifacts', 'hidden-knowledge'],
    npcs: ['mysterious-stranger', 'ancient-sage', 'knowledge-keeper'],
    activities: ['explore-secrets', 'discover-artifacts', 'learn-ancient-wisdom'],
    unlockRequirements: { level: 5, badges: ['explorer', 'master-trader'] },
    rewards: { xp: 50, reputation: 25 }
  }
};

// GET /api/map/locations
router.get('/locations', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const avatar = await Avatar.findOne({ userId });
    if (!avatar) {
      return res.status(404).json({
        error: 'Avatar not found',
        code: 'AVATAR_NOT_FOUND'
      });
    }

    // Filter locations based on unlock requirements
    const availableLocations = Object.values(MAP_LOCATIONS).filter(location => {
      const requirements = location.unlockRequirements;
      
      // Check level requirement
      if (avatar.level < requirements.level) {
        return false;
      }
      
      // Check skill requirements
      if (requirements.skills) {
        for (const [skill, requiredLevel] of Object.entries(requirements.skills)) {
          if ((avatar.skills[skill]?.level || 0) < requiredLevel) {
            return false;
          }
        }
      }
      
      // Check badge requirements
      if (requirements.badges) {
        const userBadges = avatar.badges.map(badge => badge.id);
        if (!requirements.badges.every(badge => userBadges.includes(badge))) {
          return false;
        }
      }
      
      return true;
    });

    // Add unlock status to each location
    const locationsWithStatus = availableLocations.map(location => ({
      ...location,
      isUnlocked: true,
      isVisited: avatar.visitedLocations?.includes(location.id) || false,
      lastVisited: avatar.locationHistory?.find(h => h.locationId === location.id)?.timestamp
    }));

    res.json({
      message: 'Map locations retrieved successfully',
      locations: locationsWithStatus,
      currentLocation: avatar.currentLocation,
      totalLocations: Object.keys(MAP_LOCATIONS).length,
      unlockedLocations: locationsWithStatus.length
    });

  } catch (error) {
    console.error('Map locations retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve map locations',
      code: 'MAP_LOCATIONS_ERROR'
    });
  }
});

// GET /api/map/location/:locationId
router.get('/location/:locationId', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { locationId } = req.params;

    const avatar = await Avatar.findOne({ userId });
    if (!avatar) {
      return res.status(404).json({
        error: 'Avatar not found',
        code: 'AVATAR_NOT_FOUND'
      });
    }

    const location = MAP_LOCATIONS[locationId];
    if (!location) {
      return res.status(404).json({
        error: 'Location not found',
        code: 'LOCATION_NOT_FOUND'
      });
    }

    // Check if location is unlocked
    const requirements = location.unlockRequirements;
    let isUnlocked = true;
    let unlockMessage = '';

    if (avatar.level < requirements.level) {
      isUnlocked = false;
      unlockMessage = `Requires level ${requirements.level}`;
    } else if (requirements.skills) {
      for (const [skill, requiredLevel] of Object.entries(requirements.skills)) {
        if ((avatar.skills[skill]?.level || 0) < requiredLevel) {
          isUnlocked = false;
          unlockMessage = `Requires ${skill} level ${requiredLevel}`;
          break;
        }
      }
    } else if (requirements.badges) {
      const userBadges = avatar.badges.map(badge => badge.id);
      const missingBadges = requirements.badges.filter(badge => !userBadges.includes(badge));
      if (missingBadges.length > 0) {
        isUnlocked = false;
        unlockMessage = `Requires badges: ${missingBadges.join(', ')}`;
      }
    }

    const locationData = {
      ...location,
      isUnlocked,
      unlockMessage,
      isVisited: avatar.visitedLocations?.includes(locationId) || false,
      lastVisited: avatar.locationHistory?.find(h => h.locationId === locationId)?.timestamp,
      isCurrentLocation: avatar.currentLocation === locationId
    };

    res.json({
      message: 'Location details retrieved successfully',
      location: locationData
    });

  } catch (error) {
    console.error('Location details retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve location details',
      code: 'LOCATION_DETAILS_ERROR'
    });
  }
});

// POST /api/map/travel
router.post('/travel', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { locationId } = req.body;

    if (!locationId) {
      return res.status(400).json({
        error: 'Location ID is required',
        code: 'LOCATION_ID_REQUIRED'
      });
    }

    const avatar = await Avatar.findOne({ userId });
    if (!avatar) {
      return res.status(404).json({
        error: 'Avatar not found',
        code: 'AVATAR_NOT_FOUND'
      });
    }

    const location = MAP_LOCATIONS[locationId];
    if (!location) {
      return res.status(404).json({
        error: 'Location not found',
        code: 'LOCATION_NOT_FOUND'
      });
    }

    // Check if location is unlocked
    const requirements = location.unlockRequirements;
    if (avatar.level < requirements.level) {
      return res.status(403).json({
        error: `Location requires level ${requirements.level}`,
        code: 'INSUFFICIENT_LEVEL'
      });
    }

    if (requirements.skills) {
      for (const [skill, requiredLevel] of Object.entries(requirements.skills)) {
        if ((avatar.skills[skill]?.level || 0) < requiredLevel) {
          return res.status(403).json({
            error: `Location requires ${skill} level ${requiredLevel}`,
            code: 'INSUFFICIENT_SKILLS'
          });
        }
      }
    }

    if (requirements.badges) {
      const userBadges = avatar.badges.map(badge => badge.id);
      const missingBadges = requirements.badges.filter(badge => !userBadges.includes(badge));
      if (missingBadges.length > 0) {
        return res.status(403).json({
          error: `Location requires badges: ${missingBadges.join(', ')}`,
          code: 'INSUFFICIENT_BADGES'
        });
      }
    }

    // Update avatar location
    const previousLocation = avatar.currentLocation;
    avatar.currentLocation = locationId;

    // Add to visited locations if not already visited
    if (!avatar.visitedLocations) {
      avatar.visitedLocations = [];
    }
    if (!avatar.visitedLocations.includes(locationId)) {
      avatar.visitedLocations.push(locationId);
    }

    // Add to location history
    if (!avatar.locationHistory) {
      avatar.locationHistory = [];
    }
    avatar.locationHistory.push({
      locationId,
      timestamp: new Date(),
      previousLocation
    });

    // Keep only last 50 location history entries
    if (avatar.locationHistory.length > 50) {
      avatar.locationHistory = avatar.locationHistory.slice(-50);
    }

    await avatar.save();

    res.json({
      message: 'Travel successful',
      currentLocation: locationId,
      previousLocation,
      location: location,
      isNewLocation: !avatar.visitedLocations.includes(locationId)
    });

  } catch (error) {
    console.error('Travel error:', error);
    res.status(500).json({
      error: 'Failed to travel to location',
      code: 'TRAVEL_ERROR'
    });
  }
});

// GET /api/map/current-location
router.get('/current-location', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const avatar = await Avatar.findOne({ userId });
    if (!avatar) {
      return res.status(404).json({
        error: 'Avatar not found',
        code: 'AVATAR_NOT_FOUND'
      });
    }

    const currentLocation = MAP_LOCATIONS[avatar.currentLocation];
    if (!currentLocation) {
      return res.status(404).json({
        error: 'Current location not found',
        code: 'CURRENT_LOCATION_NOT_FOUND'
      });
    }

    res.json({
      message: 'Current location retrieved successfully',
      location: currentLocation,
      isVisited: avatar.visitedLocations?.includes(avatar.currentLocation) || false,
      lastVisited: avatar.locationHistory?.find(h => h.locationId === avatar.currentLocation)?.timestamp
    });

  } catch (error) {
    console.error('Current location retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve current location',
      code: 'CURRENT_LOCATION_ERROR'
    });
  }
});

// GET /api/map/exploration-progress
router.get('/exploration-progress', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const avatar = await Avatar.findOne({ userId });
    if (!avatar) {
      return res.status(404).json({
        error: 'Avatar not found',
        code: 'AVATAR_NOT_FOUND'
      });
    }

    const totalLocations = Object.keys(MAP_LOCATIONS).length;
    const visitedLocations = avatar.visitedLocations?.length || 0;
    const explorationPercentage = (visitedLocations / totalLocations) * 100;

    const locationTypes = {};
    Object.values(MAP_LOCATIONS).forEach(location => {
      if (!locationTypes[location.type]) {
        locationTypes[location.type] = { total: 0, visited: 0 };
      }
      locationTypes[location.type].total++;
      if (avatar.visitedLocations?.includes(location.id)) {
        locationTypes[location.type].visited++;
      }
    });

    res.json({
      message: 'Exploration progress retrieved successfully',
      progress: {
        totalLocations,
        visitedLocations,
        explorationPercentage: Math.round(explorationPercentage),
        locationTypes,
        recentVisits: avatar.locationHistory?.slice(-10) || []
      }
    });

  } catch (error) {
    console.error('Exploration progress retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve exploration progress',
      code: 'EXPLORATION_PROGRESS_ERROR'
    });
  }
});

module.exports = router;