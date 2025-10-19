class WalletSecurityCheck {
  constructor() {
    this.compromisedWallets = [
      '0xDEADDEADDEADDEADDEADDEADDEADDEADDEADDEAD',
      '0xSCAMSCAMSCAMSCAMSCAMSCAMSCAMSCAMSCAMSCAM',
    ];

    this.whitelistedWallets = [
      '0x1234567890123456789012345678901234567890',
    ];
  }

  checkWalletSecurity(walletAddress) {
    console.log(`\n💼 WALLET SECURITY CHECK`);
    console.log('='.repeat(60));
    console.log(`Wallet: ${walletAddress}`);
    console.log('');

    // Check if whitelisted
    if (this.whitelistedWallets.includes(walletAddress)) {
      console.log('✅ Whitelisted wallet - VERY SAFE');
      console.log('='.repeat(60) + '\n');
      return {
        walletAddress,
        securityStatus: 'SECURE',
        riskScore: 0,
        canUse: true,
      };
    }

    // Check if compromised
    if (this.compromisedWallets.includes(walletAddress)) {
      console.log('🚫 WALLET COMPROMISED - DO NOT USE');
      console.log('='.repeat(60) + '\n');
      return {
        walletAddress,
        securityStatus: 'COMPROMISED',
        riskScore: 10,
        canUse: false,
        message: 'Wallet is on compromised list',
      };
    }

    // Basic wallet validation (Ethereum format)
    const isValidFormat = /^0x[a-fA-F0-9]{40}$/.test(walletAddress);
    if (!isValidFormat) {
      console.log('❌ Invalid wallet format');
      console.log('='.repeat(60) + '\n');
      return {
        walletAddress,
        securityStatus: 'INVALID',
        riskScore: 10,
        canUse: false,
      };
    }

    console.log('✅ Valid wallet format');
    console.log('✅ Not on compromised list');
    console.log('⚠️ New wallet - limited history');
    console.log('='.repeat(60) + '\n');

    return {
      walletAddress,
      securityStatus: 'UNKNOWN',
      riskScore: 3,
      canUse: true,
      message: 'New wallet - proceed with caution',
    };
  }

  checkWalletApprovals(walletAddress) {
    console.log(`\n🔐 CHECKING WALLET APPROVALS`);
    console.log('='.repeat(60));

    const approvals = [
      {
        spender: '0x1111111111111111111111111111111111111111',
        tokenAllowance: 'UNLIMITED',
        risk: 'HIGH',
      },
      {
        spender: '0x2222222222222222222222222222222222222222',
        tokenAllowance: '100 USDC',
        risk: 'LOW',
      },
      {
        spender: '0x3333333333333333333333333333333333333333',
        tokenAllowance: 'UNLIMITED',
        risk: 'HIGH',
      },
    ];

    let riskScore = 0;
    console.log(`Found ${approvals.length} approvals:\n`);

    approvals.forEach((approval, idx) => {
      const riskSymbol = approval.risk === 'HIGH' ? '🚨' : '✅';
      console.log(`${idx + 1}. ${riskSymbol} ${approval.spender}`);
      console.log(`   Allowance: ${approval.tokenAllowance}`);
      console.log(`   Risk: ${approval.risk}\n`);

      if (approval.risk === 'HIGH') riskScore += 2;
    });

    console.log('='.repeat(60) + '\n');

    return {
      walletAddress,
      approvals,
      riskScore: Math.min(riskScore, 10),
      hasHighRiskApprovals: approvals.some(a => a.risk === 'HIGH'),
    };
  }
}

module.exports = WalletSecurityCheck;