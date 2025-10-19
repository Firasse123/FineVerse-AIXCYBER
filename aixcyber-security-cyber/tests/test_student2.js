const TransactionMonitor = require('../src/transactionMonitor');
const WalletSecurityCheck = require('../src/walletSecurityCheck');
const ThreatDetector = require('../src/threatDetector');

console.log('\n' + '='.repeat(70));
console.log('🛡️  STUDENT 2: TRANSACTION SECURITY & THREAT DETECTION TESTS');
console.log('='.repeat(70) + '\n');

// ============================================
// TEST 1: TRANSACTION MONITORING
// ============================================
console.log('📋 TEST 1: TRANSACTION MONITORING\n');

const txMonitor = new TransactionMonitor();

// Test 1.1: Normal transaction
console.log('TEST 1.1: Normal transaction\n');
const result1 = txMonitor.monitorTransaction('user_alice', {
  asset: 'BTC',
  amount: 100,
  timestamp: Date.now(),
});
console.log('Result:', JSON.stringify(result1, null, 2));

// Test 1.2: Unusual amount (2x average)
console.log('\nTEST 1.2: Add more transactions, then do unusual amount\n');
txMonitor.monitorTransaction('user_alice', { asset: 'ETH', amount: 150 });
txMonitor.monitorTransaction('user_alice', { asset: 'ADA', amount: 120 });

const result2 = txMonitor.monitorTransaction('user_alice', {
  asset: 'BTC',
  amount: 500, // 2x average - WILL FLAG!
});
console.log('Result:', JSON.stringify(result2, null, 2));

// Test 1.3: Rapid-fire transactions (3+ in 5 min)
console.log('\nTEST 1.3: Rapid-fire transactions\n');
const result3a = txMonitor.monitorTransaction('user_bob', {
  asset: 'BTC',
  amount: 50,
});
const result3b = txMonitor.monitorTransaction('user_bob', {
  asset: 'ETH',
  amount: 60,
});
const result3c = txMonitor.monitorTransaction('user_bob', {
  asset: 'ADA',
  amount: 70,
});
console.log('Third transaction result:', JSON.stringify(result3c, null, 2));

// Test 1.4: High volatility asset
console.log('\nTEST 1.4: High volatility asset\n');
const result4 = txMonitor.monitorTransaction('user_charlie', {
  asset: 'SHITCOIN',
  amount: 1000,
});
console.log('Result:', JSON.stringify(result4, null, 2));

// ============================================
// TEST 2: WALLET SECURITY CHECK
// ============================================
console.log('\n' + '='.repeat(70));
console.log('💼 TEST 2: WALLET SECURITY CHECK\n');

const walletCheck = new WalletSecurityCheck();

// Test 2.1: Whitelisted wallet
console.log('TEST 2.1: Whitelisted wallet\n');
const wallet1 = walletCheck.checkWalletSecurity('0x1234567890123456789012345678901234567890');
console.log('Result:', JSON.stringify(wallet1, null, 2));

// Test 2.2: Compromised wallet
console.log('\nTEST 2.2: Compromised wallet\n');
const wallet2 = walletCheck.checkWalletSecurity('0xDEADDEADDEADDEADDEADDEADDEADDEADDEADDEAD');
console.log('Result:', JSON.stringify(wallet2, null, 2));

// Test 2.3: Invalid format
console.log('\nTEST 2.3: Invalid wallet format\n');
const wallet3 = walletCheck.checkWalletSecurity('invalid-wallet-address');
console.log('Result:', JSON.stringify(wallet3, null, 2));

// Test 2.4: Unknown/new wallet
console.log('\nTEST 2.4: Unknown wallet (new)\n');
const wallet4 = walletCheck.checkWalletSecurity('0xABCDEF1234567890ABCDEF1234567890ABCDEF12');
console.log('Result:', JSON.stringify(wallet4, null, 2));

// Test 2.5: Wallet approvals
console.log('\nTEST 2.5: Wallet approvals check\n');
const approvals = walletCheck.checkWalletApprovals('0xABCDEF1234567890ABCDEF1234567890ABCDEF12');
console.log('Result:', JSON.stringify(approvals, null, 2));

// ============================================
// TEST 3: THREAT DETECTION
// ============================================
console.log('\n' + '='.repeat(70));
console.log('🚨 TEST 3: THREAT DETECTION\n');

const threatDetector = new ThreatDetector();

// Test 3.1: Clean transaction (no threats)
console.log('TEST 3.1: Clean transaction\n');
const threat1 = threatDetector.detectThreats({
  id: 'tx_001',
  to: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
  amount: 500,
  gasPrice: 100,
  ipAddress: '203.0.113.1',
});
console.log('Result:', JSON.stringify(threat1, null, 2));

// Test 3.2: Known attacker
console.log('\nTEST 3.2: Known attacker detected\n');
const threat2 = threatDetector.detectThreats({
  id: 'tx_002',
  to: '0xATTACKERATTACKERATTACKERATTACKERATTACKER',
  amount: 500,
  gasPrice: 100,
  ipAddress: '203.0.113.1',
});
console.log('Result:', JSON.stringify(threat2, null, 2));

// Test 3.3: Suspicious IP
console.log('\nTEST 3.3: Suspicious IP detected\n');
const threat3 = threatDetector.detectThreats({
  id: 'tx_003',
  to: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
  amount: 500,
  gasPrice: 100,
  ipAddress: '192.168.1.100', // SUSPICIOUS!
});
console.log('Result:', JSON.stringify(threat3, null, 2));

// Test 3.4: Extremely large amount
console.log('\nTEST 3.4: Extremely large amount\n');
const threat4 = threatDetector.detectThreats({
  id: 'tx_004',
  to: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
  amount: 5000000, // HUGE!
  gasPrice: 100,
  ipAddress: '203.0.113.1',
});
console.log('Result:', JSON.stringify(threat4, null, 2));

// Test 3.5: High gas price (bot?)
console.log('\nTEST 3.5: High gas price\n');
const threat5 = threatDetector.detectThreats({
  id: 'tx_005',
  to: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
  amount: 500,
  gasPrice: 600, // HIGH!
  ipAddress: '203.0.113.1',
});
console.log('Result:', JSON.stringify(threat5, null, 2));

// Test 3.6: Multiple threats
console.log('\nTEST 3.6: Multiple threats combined\n');
const threat6 = threatDetector.detectThreats({
  id: 'tx_006',
  to: '0xATTACKERATTACKERATTACKERATTACKERATTACKER',
  amount: 5000000,
  gasPrice: 800,
  ipAddress: '192.168.1.100',
});
console.log('Result:', JSON.stringify(threat6, null, 2));

// Test 3.7: Generate security alert
console.log('\nTEST 3.7: Generate security alert\n');
const alert = threatDetector.generateSecurityAlert(threat6);
console.log('Alert:', JSON.stringify(alert, null, 2));

// ============================================
// SUMMARY
// ============================================
console.log('\n' + '='.repeat(70));
console.log('✅ ALL TESTS COMPLETED');
console.log('='.repeat(70) + '\n');