class TransactionMonitor {
  constructor() {
    // Transaction history per user
    this.transactionHistory = {};
    
    // Suspicious patterns threshold
    this.RAPID_FIRE_THRESHOLD = 3; // 3+ transactions in 5 min = suspicious
    this.UNUSUAL_AMOUNT_MULTIPLIER = 2; // 2x avg = suspicious
  }

  // Monitor a transaction
  monitorTransaction(userId, transaction) {
    console.log(`\n🔍 TRANSACTION MONITORING`);
    console.log('='.repeat(60));
    console.log(`User: ${userId}`);
    console.log(`Asset: ${transaction.asset}`);
    console.log(`Amount: $${transaction.amount}`);
    console.log('');

    const anomalies = [];
    let riskScore = 0;

    // ANOMALY 1: Unusual amount (compared to user's history)
    if (this.transactionHistory[userId]) {
      const userTxs = this.transactionHistory[userId];
      const avgAmount = userTxs.reduce((sum, tx) => sum + tx.amount, 0) / userTxs.length;

      if (transaction.amount > avgAmount * this.UNUSUAL_AMOUNT_MULTIPLIER) {
        console.log(`⚠️ ANOMALY 1: Amount ${transaction.amount} is 2x average (${avgAmount})`);
        anomalies.push({
          type: 'UNUSUAL_AMOUNT',
          severity: 'MEDIUM',
          message: `Transaction 2x larger than user average`,
        });
        riskScore += 2.0;
      }

      // ANOMALY 2: Rapid-fire transactions
      const fiveMinAgo = Date.now() - 5 * 60 * 1000;
      const recentTxs = userTxs.filter(tx => tx.timestamp > fiveMinAgo);

      if (recentTxs.length >= this.RAPID_FIRE_THRESHOLD) {
        console.log(`⚠️ ANOMALY 2: ${recentTxs.length} transactions in last 5 min`);
        anomalies.push({
          type: 'RAPID_FIRE',
          severity: 'HIGH',
          message: `Multiple transactions in short time`,
        });
        riskScore += 3.0;
      }

      // ANOMALY 3: Multiple assets in short time
      const recentAssets = new Set(recentTxs.map(tx => tx.asset));
      if (recentAssets.size > 3) {
        console.log(`⚠️ ANOMALY 3: Trading ${recentAssets.size} different assets in 5 min`);
        anomalies.push({
          type: 'MULTI_ASSET_TRADING',
          severity: 'MEDIUM',
          message: `Multiple assets traded simultaneously`,
        });
        riskScore += 1.5;
      }
    }

    // ANOMALY 4: Extreme volatility
    if (transaction.asset === 'SHITCOIN' || transaction.asset === 'MEME') {
      console.log(`⚠️ ANOMALY 4: Highly volatile asset`);
      anomalies.push({
        type: 'HIGH_VOLATILITY_ASSET',
        severity: 'MEDIUM',
        message: `Asset known for extreme volatility`,
      });
      riskScore += 1.5;
    }

    // Add to history
    if (!this.transactionHistory[userId]) {
      this.transactionHistory[userId] = [];
    }

    this.transactionHistory[userId].push({
      ...transaction,
      timestamp: Date.now(),
    });

    // Determine threat level
    let threatLevel = 'LOW';
    if (riskScore >= 5) threatLevel = 'HIGH';
    else if (riskScore >= 2) threatLevel = 'MEDIUM';

    console.log(`📊 Risk Score: ${riskScore.toFixed(1)}/10`);
    console.log(`🚨 Threat Level: ${threatLevel}`);
    console.log('='.repeat(60) + '\n');

    return {
      transactionId: this.generateTxId(),
      userId,
      riskScore: Math.min(riskScore, 10),
      threatLevel,
      anomalies,
      shouldBlock: threatLevel === 'HIGH',
    };
  }

  generateTxId() {
    return 'TX_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

module.exports = TransactionMonitor;