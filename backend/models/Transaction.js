const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  
  // Asset Information
  assetId: { 
    type: String, 
    required: true,
    index: true
  },
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  assetType: { 
    type: String, 
    enum: ['stock', 'crypto', 'bond', 'commodity', 'index'],
    required: true
  },
  
  // Transaction Details
  type: { 
    type: String, 
    enum: ['buy', 'sell', 'dividend', 'split', 'merger'],
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 0
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  totalAmount: { 
    type: Number, 
    required: true
  },
  
  // Fees and Costs
  fees: { 
    type: Number, 
    default: 0,
    min: 0
  },
  feesPercentage: { 
    type: Number, 
    default: 0.001 // 0.1% default fee
  },
  netAmount: { 
    type: Number, 
    required: true
  },
  
  // Execution Details
  executionType: { 
    type: String, 
    enum: ['market', 'limit', 'stop', 'stop_limit'],
    default: 'market'
  },
  limitPrice: { type: Number },
  stopPrice: { type: Number },
  status: { 
    type: String, 
    enum: ['pending', 'filled', 'partial', 'cancelled', 'rejected'],
    default: 'filled'
  },
  
  // Portfolio Impact
  portfolioValueBefore: { type: Number },
  portfolioValueAfter: { type: Number },
  cashBefore: { type: Number },
  cashAfter: { type: Number },
  
  // Performance Tracking
  realizedGainLoss: { 
    type: Number, 
    default: 0
  },
  realizedGainLossPercent: { 
    type: Number, 
    default: 0
  },
  holdingPeriod: { 
    type: Number, 
    default: 0 // in days
  },
  
  // Blockchain and Verification
  blockchainHash: { 
    type: String,
    unique: true,
    sparse: true
  },
  verified: { 
    type: Boolean, 
    default: false 
  },
  verificationTimestamp: { type: Date },
  
  // AI and Analysis
  aiRecommendation: {
    action: { 
      type: String, 
      enum: ['buy', 'sell', 'hold'],
      default: 'hold'
    },
    confidence: { 
      type: Number, 
      min: 0, 
      max: 100,
      default: 50
    },
    reasoning: { type: String },
    technicalIndicators: {
      rsi: { type: Number },
      macd: { type: Number },
      sma50: { type: Number },
      sma200: { type: Number },
      bollingerUpper: { type: Number },
      bollingerLower: { type: Number }
    }
  },
  
  // Market Context
  marketConditions: {
    volatility: { type: Number },
    volume: { type: Number },
    sentiment: { 
      type: String, 
      enum: ['bullish', 'bearish', 'neutral'],
      default: 'neutral'
    },
    newsImpact: { type: Number, default: 0 }
  },
  
  // Notes and Tags
  notes: { type: String },
  tags: [{ type: String }],
  strategy: { 
    type: String, 
    enum: ['momentum', 'value', 'growth', 'dividend', 'swing', 'day_trading', 'dca'],
    default: 'momentum'
  },
  
  // Timestamps
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  executionTimestamp: { type: Date },
  
  // Audit Trail
  createdBy: { 
    type: String, 
    enum: ['user', 'system', 'ai', 'admin'],
    default: 'user'
  },
  lastModified: { type: Date, default: Date.now },
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for transaction value
TransactionSchema.virtual('transactionValue').get(function() {
  return this.quantity * this.price;
});

// Virtual for profit/loss per share
TransactionSchema.virtual('profitLossPerShare').get(function() {
  if (this.type === 'sell' && this.realizedGainLoss) {
    return this.realizedGainLoss / this.quantity;
  }
  return 0;
});

// Virtual for effective price (including fees)
TransactionSchema.virtual('effectivePrice').get(function() {
  if (this.type === 'buy') {
    return (this.totalAmount + this.fees) / this.quantity;
  } else {
    return (this.totalAmount - this.fees) / this.quantity;
  }
});

// Indexes for performance
TransactionSchema.index({ userId: 1, timestamp: -1 });
TransactionSchema.index({ assetId: 1, timestamp: -1 });
TransactionSchema.index({ type: 1, timestamp: -1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ blockchainHash: 1 });
TransactionSchema.index({ 'aiRecommendation.action': 1 });

// Pre-save middleware
TransactionSchema.pre('save', function(next) {
  // Calculate net amount
  if (this.type === 'buy') {
    this.netAmount = this.totalAmount + this.fees;
  } else {
    this.netAmount = this.totalAmount - this.fees;
  }
  
  // Calculate fees if not provided
  if (this.fees === 0 && this.feesPercentage > 0) {
    this.fees = this.totalAmount * this.feesPercentage;
  }
  
  // Update last modified
  this.lastModified = new Date();
  
  next();
});

// Static methods
TransactionSchema.statics.getUserTransactions = function(userId, options = {}) {
  const query = { userId };
  
  if (options.assetId) query.assetId = options.assetId;
  if (options.type) query.type = options.type;
  if (options.startDate) query.timestamp = { $gte: options.startDate };
  if (options.endDate) {
    query.timestamp = { ...query.timestamp, $lte: options.endDate };
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(options.limit || 100)
    .skip(options.skip || 0);
};

TransactionSchema.statics.getAssetTransactions = function(assetId, options = {}) {
  const query = { assetId };
  
  if (options.userId) query.userId = options.userId;
  if (options.type) query.type = options.type;
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(options.limit || 100);
};

TransactionSchema.statics.calculateRealizedGainLoss = function(userId, assetId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), assetId } },
    { $sort: { timestamp: 1 } },
    {
      $group: {
        _id: null,
        totalBought: {
          $sum: {
            $cond: [
              { $eq: ['$type', 'buy'] },
              { $multiply: ['$quantity', '$price'] },
              0
            ]
          }
        },
        totalSold: {
          $sum: {
            $cond: [
              { $eq: ['$type', 'sell'] },
              { $multiply: ['$quantity', '$price'] },
              0
            ]
          }
        },
        totalQuantityBought: {
          $sum: {
            $cond: [{ $eq: ['$type', 'buy'] }, '$quantity', 0]
          }
        },
        totalQuantitySold: {
          $sum: {
            $cond: [{ $eq: ['$type', 'sell'] }, '$quantity', 0]
          }
        }
      }
    }
  ]);
};

// Instance methods
TransactionSchema.methods.calculateHoldingPeriod = function() {
  if (this.type === 'sell') {
    // Find the corresponding buy transaction
    return this.constructor.findOne({
      userId: this.userId,
      assetId: this.assetId,
      type: 'buy',
      timestamp: { $lt: this.timestamp }
    }).sort({ timestamp: -1 }).then(buyTransaction => {
      if (buyTransaction) {
        this.holdingPeriod = Math.floor(
          (this.timestamp - buyTransaction.timestamp) / (1000 * 60 * 60 * 24)
        );
      }
      return this.save();
    });
  }
  return Promise.resolve(this);
};

TransactionSchema.methods.verifyTransaction = function() {
  this.verified = true;
  this.verificationTimestamp = new Date();
  return this.save();
};

module.exports = mongoose.model('Transaction', TransactionSchema);
