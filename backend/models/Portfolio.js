const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true,
    unique: true
  },
  
  // Holdings
  holdings: [{
    assetId: { 
      type: String, 
      required: true,
      index: true
    },
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { 
      type: Number, 
      required: true,
      min: 0
    },
    averagePrice: { 
      type: Number, 
      required: true,
      min: 0
    },
    currentPrice: { 
      type: Number, 
      default: 0,
      min: 0
    },
    totalCost: { 
      type: Number, 
      required: true,
      min: 0
    },
    currentValue: { 
      type: Number, 
      default: 0,
      min: 0
    },
    unrealizedGainLoss: { 
      type: Number, 
      default: 0
    },
    unrealizedGainLossPercent: { 
      type: Number, 
      default: 0
    },
    firstPurchaseDate: { 
      type: Date, 
      default: Date.now 
    },
    lastPurchaseDate: { 
      type: Date, 
      default: Date.now 
    }
  }],
  
  // Cash Management
  cash: { 
    type: Number, 
    default: 10000,
    min: 0
  },
  cashInOrders: { 
    type: Number, 
    default: 0,
    min: 0
  },
  availableCash: { 
    type: Number, 
    default: 10000,
    min: 0
  },
  
  // Portfolio Values
  totalValue: { 
    type: Number, 
    default: 10000,
    min: 0
  },
  totalCost: { 
    type: Number, 
    default: 10000,
    min: 0
  },
  totalGainLoss: { 
    type: Number, 
    default: 0
  },
  totalGainLossPercent: { 
    type: Number, 
    default: 0
  },
  
  // Performance Metrics
  performance: {
    daily: { 
      value: { type: Number, default: 0 },
      percent: { type: Number, default: 0 }
    },
    weekly: { 
      value: { type: Number, default: 0 },
      percent: { type: Number, default: 0 }
    },
    monthly: { 
      value: { type: Number, default: 0 },
      percent: { type: Number, default: 0 }
    },
    quarterly: { 
      value: { type: Number, default: 0 },
      percent: { type: Number, default: 0 }
    },
    yearly: { 
      value: { type: Number, default: 0 },
      percent: { type: Number, default: 0 }
    },
    allTime: { 
      value: { type: Number, default: 0 },
      percent: { type: Number, default: 0 }
    }
  },
  
  // Risk Metrics
  riskMetrics: {
    sharpeRatio: { type: Number, default: 0 },
    sortinoRatio: { type: Number, default: 0 },
    maxDrawdown: { type: Number, default: 0 },
    volatility: { type: Number, default: 0 },
    beta: { type: Number, default: 1 },
    alpha: { type: Number, default: 0 },
    calmarRatio: { type: Number, default: 0 }
  },
  
  // Allocation
  allocation: {
    stocks: { type: Number, default: 0 },
    bonds: { type: Number, default: 0 },
    crypto: { type: Number, default: 0 },
    commodities: { type: Number, default: 0 },
    cash: { type: Number, default: 100 }
  },
  
  // Trading Statistics
  tradingStats: {
    totalTrades: { type: Number, default: 0 },
    winningTrades: { type: Number, default: 0 },
    losingTrades: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 },
    averageWin: { type: Number, default: 0 },
    averageLoss: { type: Number, default: 0 },
    largestWin: { type: Number, default: 0 },
    largestLoss: { type: Number, default: 0 },
    profitFactor: { type: Number, default: 0 },
    totalFees: { type: Number, default: 0 }
  },
  
  // Portfolio History
  valueHistory: [{
    date: { type: Date, required: true },
    totalValue: { type: Number, required: true },
    cash: { type: Number, required: true },
    holdingsValue: { type: Number, required: true }
  }],
  
  // Settings
  settings: {
    autoRebalance: { type: Boolean, default: false },
    rebalanceThreshold: { type: Number, default: 5 }, // 5% threshold
    riskTolerance: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    targetAllocation: {
      stocks: { type: Number, default: 60 },
      bonds: { type: Number, default: 30 },
      crypto: { type: Number, default: 5 },
      commodities: { type: Number, default: 5 }
    }
  },
  
  // Timestamps
  lastUpdated: { type: Date, default: Date.now },
  lastRebalance: { type: Date },
  createdAt: { type: Date, default: Date.now }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for holdings count
PortfolioSchema.virtual('holdingsCount').get(function() {
  return this.holdings.length;
});

// Virtual for diversification score
PortfolioSchema.virtual('diversificationScore').get(function() {
  const uniqueAssets = new Set(this.holdings.map(h => h.assetId)).size;
  const totalValue = this.totalValue;
  const maxConcentration = Math.max(...this.holdings.map(h => h.currentValue / totalValue));
  
  // Score based on number of assets and concentration
  const assetScore = Math.min(uniqueAssets * 10, 50);
  const concentrationScore = Math.max(0, 50 - (maxConcentration * 100));
  
  return assetScore + concentrationScore;
});

// Indexes
PortfolioSchema.index({ userId: 1 });
PortfolioSchema.index({ 'holdings.assetId': 1 });
PortfolioSchema.index({ totalValue: -1 });
PortfolioSchema.index({ lastUpdated: -1 });

// Pre-save middleware
PortfolioSchema.pre('save', function(next) {
  // Calculate total values
  this.totalValue = this.cash + this.holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
  this.totalCost = this.holdings.reduce((sum, holding) => sum + holding.totalCost, 0);
  this.totalGainLoss = this.totalValue - this.totalCost;
  this.totalGainLossPercent = this.totalCost > 0 ? (this.totalGainLoss / this.totalCost) * 100 : 0;
  
  // Calculate available cash
  this.availableCash = this.cash - this.cashInOrders;
  
  // Update allocation percentages
  if (this.totalValue > 0) {
    this.allocation.cash = (this.cash / this.totalValue) * 100;
    this.allocation.stocks = (this.holdings.filter(h => h.symbol.match(/^[A-Z]{1,5}$/)).reduce((sum, h) => sum + h.currentValue, 0) / this.totalValue) * 100;
    this.allocation.crypto = (this.holdings.filter(h => !h.symbol.match(/^[A-Z]{1,5}$/)).reduce((sum, h) => sum + h.currentValue, 0) / this.totalValue) * 100;
  }
  
  // Update last updated timestamp
  this.lastUpdated = new Date();
  
  next();
});

// Methods
PortfolioSchema.methods.addHolding = function(assetId, symbol, name, quantity, price) {
  const existingHolding = this.holdings.find(h => h.assetId === assetId);
  
  if (existingHolding) {
    // Update existing holding
    const totalCost = existingHolding.totalCost + (quantity * price);
    const totalQuantity = existingHolding.quantity + quantity;
    
    existingHolding.quantity = totalQuantity;
    existingHolding.averagePrice = totalCost / totalQuantity;
    existingHolding.totalCost = totalCost;
    existingHolding.lastPurchaseDate = new Date();
  } else {
    // Add new holding
    this.holdings.push({
      assetId,
      symbol,
      name,
      quantity,
      averagePrice: price,
      currentPrice: price,
      totalCost: quantity * price,
      currentValue: quantity * price,
      firstPurchaseDate: new Date(),
      lastPurchaseDate: new Date()
    });
  }
  
  return this.save();
};

PortfolioSchema.methods.removeHolding = function(assetId, quantity) {
  const holding = this.holdings.find(h => h.assetId === assetId);
  
  if (holding) {
    if (quantity >= holding.quantity) {
      // Remove entire holding
      this.holdings = this.holdings.filter(h => h.assetId !== assetId);
    } else {
      // Reduce quantity
      holding.quantity -= quantity;
      holding.totalCost -= quantity * holding.averagePrice;
    }
  }
  
  return this.save();
};

PortfolioSchema.methods.updatePrices = function(priceUpdates) {
  this.holdings.forEach(holding => {
    if (priceUpdates[holding.assetId]) {
      holding.currentPrice = priceUpdates[holding.assetId];
      holding.currentValue = holding.quantity * holding.currentPrice;
      holding.unrealizedGainLoss = holding.currentValue - holding.totalCost;
      holding.unrealizedGainLossPercent = holding.totalCost > 0 ? 
        (holding.unrealizedGainLoss / holding.totalCost) * 100 : 0;
    }
  });
  
  return this.save();
};

module.exports = mongoose.model('Portfolio', PortfolioSchema);
