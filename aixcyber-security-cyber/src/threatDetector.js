class ThreatDetector {
  constructor() {
    // Known scam patterns
    this.scamPatterns = [
      {
        name: 'Rug Pull Token',
        signatures: ['massive_liquidity_withdrawal', 'creator_dumps'],
        severity: 'CRITICAL',
      },
      {
        name: 'Flash Loan Attack',
        signatures: ['large_borrow', 'rapid_arbitrage', 'immediate_repay'],
        severity: 'HIGH',
      },
      {
        name: 'Front Running',
        signatures: ['tx_in_mempool', 'higher_gas', 'execution_before'],
        severity: 'MEDIUM',
      },
    ];

    // Suspicious IP addresses
    this.suspiciousIPs = [
      '192.168.1.100',
      '10.0.0.50',
      '172.16.0.1',
    ];

    // Known attacker wallets
    this.knownAttackers = [
      '0xATTACKERATTACKERATTACKERATTACKERATTACKER',
    ];
  }

  // Detect threats in a transaction
  detectThreats(transactionData) {
    console.log(`\n🚨 THREAT DETECTION`);
    console.log('='.repeat(60));

    const threats = [];
    let threatScore = 0;

    // Check for known attacker wallets
    if (this.knownAttackers.includes(transactionData.to)) {
      console.log('🚫 THREAT: Transaction to known attacker');
      threats.push({
        type: 'KNOWN_ATTACKER',
        severity: 'CRITICAL',
        message: 'Recipient is on attacker watchlist',
      });
      threatScore += 5;
    }

    // Check for suspicious IP
    if (this.suspiciousIPs.includes(transactionData.ipAddress)) {
      console.log('⚠️ THREAT: Suspicious IP detected');
      threats.push({
        type: 'SUSPICIOUS_IP',
        severity: 'MEDIUM',
        message: 'Transaction from suspicious IP address',
      });
      threatScore += 2;
    }

    // Check for unusual transaction patterns
    if (transactionData.amount > 1000000) {
      console.log('⚠️ THREAT: Extremely large transaction');
      threats.push({
        type: 'LARGE_AMOUNT',
        severity: 'MEDIUM',
        message: 'Transaction amount unusually large',
      });
      threatScore += 1.5;
    }

    // Check gas price (high gas = might be bot attack)
    if (transactionData.gasPrice > 500) {
      console.log('⚠️ THREAT: High gas price (possible bot)');
      threats.push({
        type: 'HIGH_GAS_PRICE',
        severity: 'LOW',
        message: 'Unusually high gas price',
      });
      threatScore += 0.5;
    }

    if (threats.length === 0) {
      console.log('✅ No threats detected');
    }

    console.log(`📊 Threat Score: ${threatScore.toFixed(1)}/10`);
    console.log('='.repeat(60) + '\n');

    return {
      transactionId: transactionData.id,
      threatsDetected: threats.length > 0,
      threats,
      threatScore: Math.min(threatScore, 10),
      shouldAlert: threatScore >= 3,
    };
  }

  // Generate security alert
  generateSecurityAlert(threatData) {
    if (!threatData.shouldAlert) return null;

    return {
      timestamp: new Date().toISOString(),
      severity: threatData.threats[0]?.severity || 'LOW',
      message: `⚠️ SECURITY ALERT: ${threatData.threats[0]?.message}`,
      actionRequired: threatData.threatScore > 7,
    };
  }
}

module.exports = ThreatDetector;