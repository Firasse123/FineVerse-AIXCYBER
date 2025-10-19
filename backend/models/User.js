const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Basic Information
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  username: { 
    type: String, 
    required: true, 
    unique: true,
    minlength: 3,
    maxlength: 20,
    trim: true,
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  
  // Profile Information
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  avatar: { type: String }, // URL to avatar image
  
  // Game Statistics
  level: { type: Number, default: 1, min: 1, max: 100 },
  xp: { type: Number, default: 0, min: 0 },
  reputation: { type: Number, default: 0, min: 0, max: 100 },
  
  // Financial Information
  kycStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  riskProfile: { 
    type: String, 
    enum: ['conservative', 'balanced', 'aggressive'], 
    default: 'balanced' 
  },
  riskScore: { type: Number, default: 5, min: 1, max: 10 },
  
  // Security
  twoFAEnabled: { type: Boolean, default: false },
  twoFASecret: { type: String },
  securityScore: { type: Number, default: 50, min: 0, max: 100 },
  lastSecurityUpdate: { type: Date },
  
  // Trading Statistics
  totalGains: { type: Number, default: 0 },
  totalLosses: { type: Number, default: 0 },
  totalTrades: { type: Number, default: 0 },
  winRate: { type: Number, default: 0, min: 0, max: 100 },
  averageWin: { type: Number, default: 0 },
  averageLoss: { type: Number, default: 0 },
  
  // Game Progress
  achievements: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Achievement' 
  }],
  missions: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Mission' 
  }],
  completedMissions: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Mission' 
  }],
  
  // Settings
  preferences: {
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      trading: { type: Boolean, default: true },
      security: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true }
    },
    privacy: {
      showPortfolio: { type: Boolean, default: true },
      showStats: { type: Boolean, default: true },
      showAchievements: { type: Boolean, default: true }
    }
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  lastActive: { type: Date, default: Date.now },
  
  // Account Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  
  // Social Features
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Learning Progress
  tutorialCompleted: { type: Boolean, default: false },
  onboardingCompleted: { type: Boolean, default: false },
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.username;
});

// Virtual for net worth
UserSchema.virtual('netWorth').get(function() {
  return this.totalGains - this.totalLosses;
});

// Virtual for profit factor
UserSchema.virtual('profitFactor').get(function() {
  if (this.totalLosses === 0) return this.totalGains > 0 ? Infinity : 0;
  return this.totalGains / this.totalLosses;
});

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ level: -1, xp: -1 });
UserSchema.index({ reputation: -1 });
UserSchema.index({ totalGains: -1 });
UserSchema.index({ lastActive: -1 });

// Pre-save middleware
UserSchema.pre('save', function(next) {
  // Update lastActive on save
  this.lastActive = new Date();
  
  // Calculate win rate
  if (this.totalTrades > 0) {
    this.winRate = ((this.totalTrades - (this.totalTrades * (this.totalLosses / (this.totalGains + this.totalLosses)))) / this.totalTrades) * 100;
  }
  
  next();
});

// Methods
UserSchema.methods.updateSecurityScore = function(change, reason) {
  this.securityScore = Math.max(0, Math.min(100, this.securityScore + change));
  this.lastSecurityUpdate = new Date();
  return this.save();
};

UserSchema.methods.addXP = function(amount, reason) {
  this.xp += amount;
  const newLevel = Math.floor(this.xp / 1000) + 1;
  if (newLevel > this.level) {
    this.level = newLevel;
    return { leveledUp: true, newLevel };
  }
  return { leveledUp: false };
};

UserSchema.methods.addAchievement = function(achievementId) {
  if (!this.achievements.includes(achievementId)) {
    this.achievements.push(achievementId);
    return this.save();
  }
  return Promise.resolve(this);
};

module.exports = mongoose.model('User', UserSchema);
