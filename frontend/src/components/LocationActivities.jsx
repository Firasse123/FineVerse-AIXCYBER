import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMap } from '../context/MapContext';
import { useAvatar } from '../context/AvatarContext';
import { toast } from 'react-hot-toast';

const LocationActivities = () => {
  const { currentLocation, getLocationById } = useMap();
  const { avatar, addXP, addBadge } = useAvatar();
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isPerformingActivity, setIsPerformingActivity] = useState(false);
  const [activityResults, setActivityResults] = useState(null);

  const location = getLocationById(currentLocation);

  const activityTemplates = {
    'trade': {
      name: 'Trading',
      description: 'Execute trades and manage your portfolio',
      icon: '📈',
      duration: 3000,
      xpReward: 15,
      requirements: { level: 1 }
    },
    'read-news': {
      name: 'Read News',
      description: 'Stay updated with market news and analysis',
      icon: '📰',
      duration: 2000,
      xpReward: 10,
      requirements: { level: 1 }
    },
    'banking': {
      name: 'Banking',
      description: 'Manage your cash and financial accounts',
      icon: '🏦',
      duration: 1500,
      xpReward: 8,
      requirements: { level: 1 }
    },
    'ai-analysis': {
      name: 'AI Analysis',
      description: 'Use AI tools for market analysis',
      icon: '🤖',
      duration: 4000,
      xpReward: 25,
      requirements: { level: 2, skills: { technicalAnalysis: 10 } }
    },
    'crypto-trading': {
      name: 'Crypto Trading',
      description: 'Trade cryptocurrencies and digital assets',
      icon: '₿',
      duration: 3500,
      xpReward: 20,
      requirements: { level: 2, skills: { technicalAnalysis: 10 } }
    },
    'startup-investing': {
      name: 'Startup Investing',
      description: 'Invest in promising startup companies',
      icon: '🚀',
      duration: 5000,
      xpReward: 30,
      requirements: { level: 2, skills: { fundamentalAnalysis: 10 } }
    },
    'cyber-training': {
      name: 'Cyber Training',
      description: 'Improve your cybersecurity skills',
      icon: '🛡️',
      duration: 4000,
      xpReward: 25,
      requirements: { level: 3, skills: { cybersecurity: 15 } }
    },
    'threat-analysis': {
      name: 'Threat Analysis',
      description: 'Analyze and respond to cyber threats',
      icon: '🔍',
      duration: 4500,
      xpReward: 28,
      requirements: { level: 3, skills: { cybersecurity: 15 } }
    },
    'security-missions': {
      name: 'Security Missions',
      description: 'Complete cybersecurity missions',
      icon: '🎯',
      duration: 6000,
      xpReward: 35,
      requirements: { level: 3, skills: { cybersecurity: 15 } }
    },
    'stock-trading': {
      name: 'Stock Trading',
      description: 'Trade stocks and equity securities',
      icon: '📊',
      duration: 3000,
      xpReward: 18,
      requirements: { level: 2, skills: { fundamentalAnalysis: 10 } }
    },
    'forex-trading': {
      name: 'Forex Trading',
      description: 'Trade foreign exchange currencies',
      icon: '💱',
      duration: 3500,
      xpReward: 22,
      requirements: { level: 2, skills: { technicalAnalysis: 10 } }
    },
    'commodities-trading': {
      name: 'Commodities Trading',
      description: 'Trade commodities and raw materials',
      icon: '🌾',
      duration: 4000,
      xpReward: 25,
      requirements: { level: 2, skills: { fundamentalAnalysis: 10 } }
    },
    'research-projects': {
      name: 'Research Projects',
      description: 'Conduct advanced financial research',
      icon: '🔬',
      duration: 8000,
      xpReward: 40,
      requirements: { level: 4, skills: { technicalAnalysis: 20, fundamentalAnalysis: 20 } }
    },
    'data-analysis': {
      name: 'Data Analysis',
      description: 'Analyze large datasets for insights',
      icon: '📊',
      duration: 6000,
      xpReward: 30,
      requirements: { level: 4, skills: { technicalAnalysis: 20 } }
    },
    'quant-modeling': {
      name: 'Quantitative Modeling',
      description: 'Build mathematical trading models',
      icon: '🧮',
      duration: 10000,
      xpReward: 50,
      requirements: { level: 4, skills: { technicalAnalysis: 20, fundamentalAnalysis: 20 } }
    },
    'blockchain-exploration': {
      name: 'Blockchain Exploration',
      description: 'Explore blockchain technology and applications',
      icon: '⛓️',
      duration: 5000,
      xpReward: 30,
      requirements: { level: 3, skills: { technicalAnalysis: 15 } }
    },
    'defi-trading': {
      name: 'DeFi Trading',
      description: 'Trade decentralized finance protocols',
      icon: '🔄',
      duration: 4500,
      xpReward: 28,
      requirements: { level: 3, skills: { technicalAnalysis: 15 } }
    },
    'nft-collecting': {
      name: 'NFT Collecting',
      description: 'Collect and trade non-fungible tokens',
      icon: '🎨',
      duration: 3000,
      xpReward: 20,
      requirements: { level: 3, skills: { technicalAnalysis: 15 } }
    },
    'risk-assessment': {
      name: 'Risk Assessment',
      description: 'Assess and manage portfolio risks',
      icon: '⚖️',
      duration: 4000,
      xpReward: 25,
      requirements: { level: 3, skills: { riskManagement: 15 } }
    },
    'portfolio-optimization': {
      name: 'Portfolio Optimization',
      description: 'Optimize portfolio allocation and performance',
      icon: '📈',
      duration: 5000,
      xpReward: 30,
      requirements: { level: 3, skills: { riskManagement: 15 } }
    },
    'hedge-strategies': {
      name: 'Hedge Strategies',
      description: 'Develop and implement hedging strategies',
      icon: '🛡️',
      duration: 6000,
      xpReward: 35,
      requirements: { level: 3, skills: { riskManagement: 15 } }
    },
    'sentiment-analysis': {
      name: 'Sentiment Analysis',
      description: 'Analyze market sentiment and psychology',
      icon: '🧠',
      duration: 3000,
      xpReward: 20,
      requirements: { level: 2, skills: { marketSentiment: 10 } }
    },
    'social-trading': {
      name: 'Social Trading',
      description: 'Follow and copy successful traders',
      icon: '👥',
      duration: 2500,
      xpReward: 15,
      requirements: { level: 2, skills: { marketSentiment: 10 } }
    },
    'news-monitoring': {
      name: 'News Monitoring',
      description: 'Monitor news and social media for market signals',
      icon: '📡',
      duration: 2000,
      xpReward: 12,
      requirements: { level: 2, skills: { marketSentiment: 10 } }
    },
    'strategy-backtesting': {
      name: 'Strategy Backtesting',
      description: 'Backtest trading strategies on historical data',
      icon: '🔄',
      duration: 8000,
      xpReward: 45,
      requirements: { level: 4, skills: { portfolioOptimization: 20 } }
    },
    'strategy-building': {
      name: 'Strategy Building',
      description: 'Build and design new trading strategies',
      icon: '🏗️',
      duration: 10000,
      xpReward: 50,
      requirements: { level: 4, skills: { portfolioOptimization: 20 } }
    },
    'take-courses': {
      name: 'Take Courses',
      description: 'Learn new financial concepts and strategies',
      icon: '🎓',
      duration: 5000,
      xpReward: 25,
      requirements: { level: 1 }
    },
    'read-books': {
      name: 'Read Books',
      description: 'Read financial literature and research',
      icon: '📚',
      duration: 3000,
      xpReward: 15,
      requirements: { level: 1 }
    },
    'practice-simulations': {
      name: 'Practice Simulations',
      description: 'Practice trading in simulated environments',
      icon: '🎮',
      duration: 4000,
      xpReward: 20,
      requirements: { level: 1 }
    },
    'chat': {
      name: 'Chat',
      description: 'Connect with other traders and investors',
      icon: '💬',
      duration: 2000,
      xpReward: 10,
      requirements: { level: 1 }
    },
    'compete': {
      name: 'Compete',
      description: 'Compete in trading competitions',
      icon: '🏆',
      duration: 6000,
      xpReward: 30,
      requirements: { level: 1 }
    },
    'share-strategies': {
      name: 'Share Strategies',
      description: 'Share your trading strategies with the community',
      icon: '📤',
      duration: 3000,
      xpReward: 18,
      requirements: { level: 1 }
    },
    'explore-secrets': {
      name: 'Explore Secrets',
      description: 'Discover hidden knowledge and secrets',
      icon: '🔍',
      duration: 15000,
      xpReward: 100,
      requirements: { level: 5, badges: ['explorer', 'master-trader'] }
    },
    'discover-artifacts': {
      name: 'Discover Artifacts',
      description: 'Find ancient trading artifacts',
      icon: '🏺',
      duration: 12000,
      xpReward: 80,
      requirements: { level: 5, badges: ['explorer', 'master-trader'] }
    },
    'learn-ancient-wisdom': {
      name: 'Learn Ancient Wisdom',
      description: 'Learn from ancient trading masters',
      icon: '🧙',
      duration: 20000,
      xpReward: 150,
      requirements: { level: 5, badges: ['explorer', 'master-trader'] }
    }
  };

  const checkActivityRequirements = (activity) => {
    const requirements = activity.requirements;
    
    if (avatar.level < requirements.level) {
      return { canPerform: false, reason: `Requires level ${requirements.level}` };
    }
    
    if (requirements.skills) {
      for (const [skill, requiredLevel] of Object.entries(requirements.skills)) {
        if ((avatar.skills[skill]?.level || 0) < requiredLevel) {
          return { canPerform: false, reason: `Requires ${skill} level ${requiredLevel}` };
        }
      }
    }
    
    if (requirements.badges) {
      const userBadges = avatar.badges.map(badge => badge.id);
      const missingBadges = requirements.badges.filter(badge => !userBadges.includes(badge));
      if (missingBadges.length > 0) {
        return { canPerform: false, reason: `Requires badges: ${missingBadges.join(', ')}` };
      }
    }
    
    return { canPerform: true };
  };

  const performActivity = async (activityId) => {
    const activity = activityTemplates[activityId];
    if (!activity) return;

    const requirementsCheck = checkActivityRequirements(activity);
    if (!requirementsCheck.canPerform) {
      toast.error(requirementsCheck.reason);
      return;
    }

    setIsPerformingActivity(true);
    setActivityResults(null);

    try {
      // Simulate activity duration
      await new Promise(resolve => setTimeout(resolve, activity.duration));

      // Add XP
      await addXP(activity.xpReward, 'location-activity', `Completed ${activity.name} at ${location.name}`);

      // Random chance for badge
      if (Math.random() < 0.1) { // 10% chance
        const badgeId = `activity-${activityId}`;
        const badgeName = `${activity.name} Expert`;
        const badgeDescription = `Completed ${activity.name} activity`;
        await addBadge({
          id: badgeId,
          badgeName,
          description: badgeDescription,
          icon: activity.icon
        });
      }

      setActivityResults({
        activity: activity.name,
        xpGained: activity.xpReward,
        success: true
      });

      toast.success(`Completed ${activity.name}! +${activity.xpReward} XP`);

    } catch (error) {
      console.error('Activity failed:', error);
      setActivityResults({
        activity: activity.name,
        success: false,
        error: error.message
      });
    } finally {
      setIsPerformingActivity(false);
    }
  };

  if (!location) {
    return (
      <div className="card">
        <div className="text-center text-dark-text-muted">
          <p>No location selected</p>
        </div>
      </div>
    );
  }

  const availableActivities = location.activities.map(activityId => ({
    id: activityId,
    ...activityTemplates[activityId]
  }));

  return (
    <div className="space-y-6">
      {/* Location Header */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
            <span className="text-3xl">{location.features[0] === 'trading-floor' ? '📈' : '🏢'}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-dark-text">{location.name}</h2>
            <p className="text-dark-text-muted">{location.description}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-dark-text-muted">Level {location.level}</span>
              <span className="text-sm text-dark-text-muted capitalize">{location.type}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activities */}
      <div className="card">
        <h3 className="text-lg font-semibold text-dark-text mb-4">Available Activities</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableActivities.map((activity) => {
            const requirementsCheck = checkActivityRequirements(activity);
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border transition-all ${
                  requirementsCheck.canPerform
                    ? 'border-accent-500 bg-accent-500/10 hover:border-accent-400 hover:bg-accent-500/20'
                    : 'border-dark-border bg-dark-surface/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{activity.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-dark-text">{activity.name}</h4>
                    <p className="text-sm text-dark-text-muted mb-2">{activity.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-dark-text-muted">
                        Duration: {activity.duration / 1000}s • XP: +{activity.xpReward}
                      </div>
                      
                      <button
                        onClick={() => performActivity(activity.id)}
                        disabled={!requirementsCheck.canPerform || isPerformingActivity}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                          requirementsCheck.canPerform && !isPerformingActivity
                            ? 'bg-primary-500 hover:bg-primary-600 text-white'
                            : 'bg-dark-surface text-dark-text-muted cursor-not-allowed'
                        }`}
                      >
                        {isPerformingActivity ? 'Performing...' : 'Start'}
                      </button>
                    </div>
                    
                    {!requirementsCheck.canPerform && (
                      <div className="mt-2 text-xs text-error-500">
                        {requirementsCheck.reason}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Activity Results */}
      <AnimatePresence>
        {activityResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`card ${
              activityResults.success 
                ? 'border-success-500 bg-success-500/10' 
                : 'border-error-500 bg-error-500/10'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activityResults.success 
                  ? 'bg-success-500' 
                  : 'bg-error-500'
              }`}>
                <span className="text-white text-sm">
                  {activityResults.success ? '✓' : '✗'}
                </span>
              </div>
              <div>
                <h4 className="font-medium text-dark-text">
                  {activityResults.success ? 'Activity Completed!' : 'Activity Failed'}
                </h4>
                <p className="text-sm text-dark-text-muted">
                  {activityResults.success 
                    ? `+${activityResults.xpGained} XP gained from ${activityResults.activity}`
                    : activityResults.error
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Progress */}
      {isPerformingActivity && (
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="spinner w-6 h-6"></div>
            <div>
              <h4 className="font-medium text-dark-text">Performing Activity...</h4>
              <p className="text-sm text-dark-text-muted">Please wait while the activity completes</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationActivities;
