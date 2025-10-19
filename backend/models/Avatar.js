const mongoose = require('mongoose');

const AvatarSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true,
    unique: true
  },
  
  // Basic Information
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 50
  },
  title: { 
    type: String, 
    default: 'Novice Trader',
    maxlength: 100
  },
  bio: { 
    type: String, 
    maxlength: 500,
    default: 'A new trader ready to explore the financial markets!'
  },
  
  // Appearance Customization
  appearance: {
    // Physical Features
    skin: { 
      type: String, 
      enum: ['light', 'medium', 'dark', 'tan', 'pale'],
      default: 'medium'
    },
    hair: {
      color: { 
        type: String, 
        enum: ['black', 'brown', 'blonde', 'red', 'gray', 'white', 'blue', 'green', 'purple'],
        default: 'brown'
      },
      style: { 
        type: String, 
        enum: ['short', 'medium', 'long', 'bald', 'ponytail', 'bun'],
        default: 'medium'
      }
    },
    eyes: {
      color: { 
        type: String, 
        enum: ['brown', 'blue', 'green', 'hazel', 'gray', 'amber'],
        default: 'brown'
      }
    },
    
    // Clothing
    outfit: { 
      type: String, 
      enum: ['casual', 'business', 'formal', 'streetwear', 'athletic', 'vintage'],
      default: 'casual'
    },
    outfitColor: { 
      type: String, 
      enum: ['black', 'white', 'blue', 'red', 'green', 'purple', 'gray', 'brown'],
      default: 'blue'
    },
    
    // Accessories
    accessories: {
      glasses: { 
        type: String, 
        enum: ['none', 'reading', 'sunglasses', 'aviator', 'round'],
        default: 'none'
      },
      hat: { 
        type: String, 
        enum: ['none', 'baseball', 'fedora', 'beanie', 'cap'],
        default: 'none'
      },
      jewelry: { 
        type: String, 
        enum: ['none', 'watch', 'bracelet', 'necklace', 'ring'],
        default: 'none'
      }
    },
    
    // Special Effects
    effects: {
      aura: { 
        type: String, 
        enum: ['none', 'golden', 'silver', 'blue', 'red', 'green'],
        default: 'none'
      },
      particles: { 
        type: String, 
        enum: ['none', 'stars', 'coins', 'charts', 'numbers'],
        default: 'none'
      }
    }
  },
  
  // Personality Traits
  personality: {
    riskTolerance: { 
      type: String, 
      enum: ['conservative', 'balanced', 'aggressive'],
      default: 'balanced'
    },
    tradingStyle: { 
      type: String, 
      enum: ['day_trader', 'swing_trader', 'long_term', 'scalper', 'position_trader'],
      default: 'swing_trader'
    },
    personalityType: { 
      type: String, 
      enum: ['analytical', 'intuitive', 'methodical', 'spontaneous', 'competitive'],
      default: 'analytical'
    }
  },
  
  // Game Statistics
  level: { 
    type: Number, 
    default: 1, 
    min: 1, 
    max: 100 
  },
  xp: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  reputationScore: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 1000 
  },
  
  // Detailed Stats
  stats: {
    // Trading Stats
    portfolioValue: { type: Number, default: 10000 },
    totalTrades: { type: Number, default: 0 },
    winningTrades: { type: Number, default: 0 },
    losingTrades: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 },
    
    // Security Stats
    threatsDefeated: { type: Number, default: 0 },
    threatsFailed: { type: Number, default: 0 },
    securityStreak: { type: Number, default: 0 },
    
    // Social Stats
    friendsCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    
    // Achievement Stats
    achievementsUnlocked: { type: Number, default: 0 },
    missionsCompleted: { type: Number, default: 0 },
    
    // Learning Stats
    articlesRead: { type: Number, default: 0 },
    podcastsGenerated: { type: Number, default: 0 },
    tutorialsCompleted: { type: Number, default: 0 }
  },
  
  // Skills and Abilities
  skills: {
    technicalAnalysis: { type: Number, default: 1, min: 1, max: 10 },
    fundamentalAnalysis: { type: Number, default: 1, min: 1, max: 10 },
    riskManagement: { type: Number, default: 1, min: 1, max: 10 },
    cybersecurity: { type: Number, default: 1, min: 1, max: 10 },
    marketSentiment: { type: Number, default: 1, min: 1, max: 10 },
    portfolioOptimization: { type: Number, default: 1, min: 1, max: 10 }
  },
  
  // Unlocked Features
  unlockedFeatures: {
    advancedCharts: { type: Boolean, default: false },
    aiRecommendations: { type: Boolean, default: true },
    socialTrading: { type: Boolean, default: false },
    marginTrading: { type: Boolean, default: false },
    optionsTrading: { type: Boolean, default: false },
    cryptoMining: { type: Boolean, default: false },
    customThemes: { type: Boolean, default: false },
    premiumAnalytics: { type: Boolean, default: false }
  },
  
  // Current Status
  currentLocation: { 
    type: String, 
    enum: [
      'CryptoMarket', 'StockExchange', 'BondMarket', 'CommodityHub', 
      'NewsCenter', 'PodcastStudio', 'SecurityHub', 'AIHub', 
      'TradingFloor', 'LeaderboardHall'
    ],
    default: 'CryptoMarket'
  },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  
  // Customization History
  customizationHistory: [{
    date: { type: Date, default: Date.now },
    changes: { type: String },
    cost: { type: Number, default: 0 }
  }],
  
  // Achievements and Badges
  badges: [{
    badgeId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    unlockedAt: { type: Date, default: Date.now },
    rarity: { 
      type: String, 
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      default: 'common'
    }
  }],
  
  // Social Features
  status: { 
    type: String, 
    enum: ['online', 'away', 'busy', 'invisible'],
    default: 'online'
  },
  statusMessage: { 
    type: String, 
    maxlength: 100,
    default: 'Ready to trade!'
  },
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total skill points
AvatarSchema.virtual('totalSkillPoints').get(function() {
  return Object.values(this.skills).reduce((sum, skill) => sum + skill, 0);
});

// Virtual for skill level
AvatarSchema.virtual('skillLevel').get(function() {
  const totalPoints = this.totalSkillPoints;
  if (totalPoints < 20) return 'Beginner';
  if (totalPoints < 40) return 'Intermediate';
  if (totalPoints < 60) return 'Advanced';
  return 'Expert';
});

// Virtual for next level XP requirement
AvatarSchema.virtual('nextLevelXP').get(function() {
  return this.level * 1000;
});

// Virtual for XP progress to next level
AvatarSchema.virtual('xpProgress').get(function() {
  const currentLevelXP = (this.level - 1) * 1000;
  const nextLevelXP = this.level * 1000;
  const progressXP = this.xp - currentLevelXP;
  const requiredXP = nextLevelXP - currentLevelXP;
  
  return {
    current: progressXP,
    required: requiredXP,
    percentage: (progressXP / requiredXP) * 100
  };
});

// Indexes
AvatarSchema.index({ userId: 1 });
AvatarSchema.index({ level: -1 });
AvatarSchema.index({ reputationScore: -1 });
AvatarSchema.index({ 'stats.portfolioValue': -1 });
AvatarSchema.index({ currentLocation: 1 });
AvatarSchema.index({ isOnline: 1 });

// Pre-save middleware
AvatarSchema.pre('save', function(next) {
  // Calculate win rate
  if (this.stats.totalTrades > 0) {
    this.stats.winRate = (this.stats.winningTrades / this.stats.totalTrades) * 100;
  }
  
  // Update last seen
  this.lastSeen = new Date();
  
  next();
});

// Methods
AvatarSchema.methods.addXP = function(amount, reason) {
  this.xp += amount;
  const oldLevel = this.level;
  this.level = Math.floor(this.xp / 1000) + 1;
  
  if (this.level > oldLevel) {
    return { leveledUp: true, newLevel: this.level, oldLevel };
  }
  
  return { leveledUp: false };
};

AvatarSchema.methods.updateReputation = function(change, reason) {
  this.reputationScore = Math.max(0, Math.min(1000, this.reputationScore + change));
  return this.save();
};

AvatarSchema.methods.unlockFeature = function(featureName) {
  if (this.unlockedFeatures[featureName] !== undefined) {
    this.unlockedFeatures[featureName] = true;
    return this.save();
  }
  throw new Error(`Feature ${featureName} does not exist`);
};

AvatarSchema.methods.addBadge = function(badgeData) {
  const existingBadge = this.badges.find(badge => badge.badgeId === badgeData.badgeId);
  if (!existingBadge) {
    this.badges.push({
      ...badgeData,
      unlockedAt: new Date()
    });
    this.stats.achievementsUnlocked += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

AvatarSchema.methods.updateSkill = function(skillName, points) {
  if (this.skills[skillName] !== undefined) {
    this.skills[skillName] = Math.max(1, Math.min(10, this.skills[skillName] + points));
    return this.save();
  }
  throw new Error(`Skill ${skillName} does not exist`);
};

AvatarSchema.methods.moveToLocation = function(locationId) {
  this.currentLocation = locationId;
  return this.save();
};

module.exports = mongoose.model('Avatar', AvatarSchema);
