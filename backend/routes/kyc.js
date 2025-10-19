const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

// Validation middleware for KYC questionnaire
const validateKYC = [
  body('investmentExperience')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Investment experience must be beginner, intermediate, or advanced'),
  body('investmentGoals')
    .isIn(['growth', 'income', 'preservation', 'speculation'])
    .withMessage('Investment goals must be growth, income, preservation, or speculation'),
  body('investmentHorizon')
    .isIn(['short', 'medium', 'long'])
    .withMessage('Investment horizon must be short, medium, or long'),
  body('riskTolerance')
    .isInt({ min: 1, max: 10 })
    .withMessage('Risk tolerance must be between 1 and 10'),
  body('lossTolerance')
    .isInt({ min: 1, max: 10 })
    .withMessage('Loss tolerance must be between 1 and 10'),
  body('age')
    .isInt({ min: 18, max: 100 })
    .withMessage('Age must be between 18 and 100'),
  body('annualIncome')
    .isIn(['under_25k', '25k_50k', '50k_100k', '100k_250k', 'over_250k'])
    .withMessage('Annual income must be one of the specified ranges'),
  body('netWorth')
    .isIn(['under_50k', '50k_100k', '100k_500k', '500k_1m', 'over_1m'])
    .withMessage('Net worth must be one of the specified ranges'),
  body('regulatoryCompliance')
    .isBoolean()
    .withMessage('Regulatory compliance must be true or false')
];

// POST /api/user/kyc/submit
router.post('/kyc/submit', validateKYC, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }

    const {
      investmentExperience,
      investmentGoals,
      investmentHorizon,
      riskTolerance,
      lossTolerance,
      age,
      annualIncome,
      netWorth,
      regulatoryCompliance,
      additionalQuestions = {}
    } = req.body;

    // Calculate risk profile based on answers
    let riskScore = 0;
    
    // Investment experience scoring
    const experienceScores = { beginner: 2, intermediate: 5, advanced: 8 };
    riskScore += experienceScores[investmentExperience];
    
    // Investment goals scoring
    const goalsScores = { preservation: 1, income: 3, growth: 6, speculation: 9 };
    riskScore += goalsScores[investmentGoals];
    
    // Investment horizon scoring
    const horizonScores = { short: 2, medium: 5, long: 8 };
    riskScore += horizonScores[investmentHorizon];
    
    // Risk tolerance scoring (1-10 scale)
    riskScore += riskTolerance;
    
    // Loss tolerance scoring (1-10 scale)
    riskScore += lossTolerance;
    
    // Age scoring (younger = higher risk tolerance)
    if (age < 30) riskScore += 3;
    else if (age < 50) riskScore += 2;
    else if (age < 65) riskScore += 1;
    else riskScore += 0;
    
    // Income scoring
    const incomeScores = {
      under_25k: 1,
      '25k_50k': 2,
      '50k_100k': 4,
      '100k_250k': 6,
      over_250k: 8
    };
    riskScore += incomeScores[annualIncome];
    
    // Net worth scoring
    const netWorthScores = {
      under_50k: 1,
      '50k_100k': 2,
      '100k_500k': 4,
      '500k_1m': 6,
      over_1m: 8
    };
    riskScore += netWorthScores[netWorth];

    // Determine risk profile
    let riskProfile;
    let riskScoreNormalized;
    
    if (riskScore <= 15) {
      riskProfile = 'conservative';
      riskScoreNormalized = Math.max(1, Math.min(3, riskScore / 5));
    } else if (riskScore <= 30) {
      riskProfile = 'balanced';
      riskScoreNormalized = Math.max(4, Math.min(6, (riskScore - 15) / 3));
    } else {
      riskProfile = 'aggressive';
      riskScoreNormalized = Math.max(7, Math.min(10, (riskScore - 30) / 2));
    }

    // Calculate recommended asset allocation based on risk profile
    let recommendedAllocation;
    
    switch (riskProfile) {
      case 'conservative':
        recommendedAllocation = {
          stocks: 20,
          bonds: 60,
          crypto: 5,
          commodities: 5,
          cash: 10
        };
        break;
      case 'balanced':
        recommendedAllocation = {
          stocks: 50,
          bonds: 30,
          crypto: 10,
          commodities: 5,
          cash: 5
        };
        break;
      case 'aggressive':
        recommendedAllocation = {
          stocks: 70,
          bonds: 10,
          crypto: 15,
          commodities: 3,
          cash: 2
        };
        break;
    }

    // Update user with KYC information
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Update user profile
    user.kycStatus = regulatoryCompliance ? 'approved' : 'pending';
    user.riskProfile = riskProfile;
    user.riskScore = Math.round(riskScoreNormalized);
    
    // Store KYC data
    user.kycData = {
      investmentExperience,
      investmentGoals,
      investmentHorizon,
      riskTolerance,
      lossTolerance,
      age,
      annualIncome,
      netWorth,
      regulatoryCompliance,
      additionalQuestions,
      completedAt: new Date(),
      riskScore: Math.round(riskScore),
      riskScoreNormalized: Math.round(riskScoreNormalized)
    };

    await user.save();

    // Award XP for completing KYC
    const xpAwarded = 50;
    user.xp += xpAwarded;
    await user.save();

    res.json({
      message: 'KYC questionnaire completed successfully',
      riskProfile,
      riskScore: Math.round(riskScoreNormalized),
      recommendedAllocation,
      xpAwarded,
      kycStatus: user.kycStatus
    });

  } catch (error) {
    console.error('KYC submission error:', error);
    res.status(500).json({
      error: 'KYC submission failed',
      code: 'KYC_SUBMISSION_ERROR'
    });
  }
});

// GET /api/user/kyc/questions
router.get('/kyc/questions', async (req, res) => {
  try {
    const questions = {
      basic: [
        {
          id: 'investmentExperience',
          question: 'What is your investment experience?',
          type: 'radio',
          options: [
            { value: 'beginner', label: 'Beginner (0-2 years)', description: 'New to investing' },
            { value: 'intermediate', label: 'Intermediate (2-5 years)', description: 'Some experience with basic investments' },
            { value: 'advanced', label: 'Advanced (5+ years)', description: 'Experienced with various investment types' }
          ],
          required: true
        },
        {
          id: 'investmentGoals',
          question: 'What are your primary investment goals?',
          type: 'radio',
          options: [
            { value: 'preservation', label: 'Capital Preservation', description: 'Protect your money from inflation' },
            { value: 'income', label: 'Regular Income', description: 'Generate steady income from investments' },
            { value: 'growth', label: 'Long-term Growth', description: 'Build wealth over time' },
            { value: 'speculation', label: 'Speculation', description: 'High-risk, high-reward opportunities' }
          ],
          required: true
        },
        {
          id: 'investmentHorizon',
          question: 'What is your investment time horizon?',
          type: 'radio',
          options: [
            { value: 'short', label: 'Short-term (1-3 years)', description: 'Planning to use money soon' },
            { value: 'medium', label: 'Medium-term (3-10 years)', description: 'Moderate time frame' },
            { value: 'long', label: 'Long-term (10+ years)', description: 'Planning for retirement or distant future' }
          ],
          required: true
        }
      ],
      riskAssessment: [
        {
          id: 'riskTolerance',
          question: 'How comfortable are you with investment risk?',
          type: 'scale',
          min: 1,
          max: 10,
          labels: {
            1: 'Very Conservative',
            5: 'Moderate',
            10: 'Very Aggressive'
          },
          description: 'Rate your comfort level with potential losses',
          required: true
        },
        {
          id: 'lossTolerance',
          question: 'What is the maximum percentage loss you could tolerate?',
          type: 'scale',
          min: 1,
          max: 10,
          labels: {
            1: '0-5%',
            3: '10-15%',
            5: '20-25%',
            7: '30-40%',
            10: '50%+'
          },
          description: 'How much loss could you handle without panic selling?',
          required: true
        }
      ],
      personal: [
        {
          id: 'age',
          question: 'What is your age?',
          type: 'number',
          min: 18,
          max: 100,
          required: true
        },
        {
          id: 'annualIncome',
          question: 'What is your annual income range?',
          type: 'radio',
          options: [
            { value: 'under_25k', label: 'Under $25,000' },
            { value: '25k_50k', label: '$25,000 - $50,000' },
            { value: '50k_100k', label: '$50,000 - $100,000' },
            { value: '100k_250k', label: '$100,000 - $250,000' },
            { value: 'over_250k', label: 'Over $250,000' }
          ],
          required: true
        },
        {
          id: 'netWorth',
          question: 'What is your approximate net worth?',
          type: 'radio',
          options: [
            { value: 'under_50k', label: 'Under $50,000' },
            { value: '50k_100k', label: '$50,000 - $100,000' },
            { value: '100k_500k', label: '$100,000 - $500,000' },
            { value: '500k_1m', label: '$500,000 - $1,000,000' },
            { value: 'over_1m', label: 'Over $1,000,000' }
          ],
          required: true
        }
      ],
      compliance: [
        {
          id: 'regulatoryCompliance',
          question: 'Do you agree to comply with all applicable financial regulations?',
          type: 'checkbox',
          description: 'This includes understanding that this is a simulation and not real money',
          required: true
        }
      ]
    };

    res.json({
      message: 'KYC questions retrieved successfully',
      questions,
      instructions: {
        title: 'Know Your Customer (KYC) Questionnaire',
        description: 'Please answer these questions honestly to help us provide you with appropriate investment recommendations and risk management.',
        estimatedTime: '5-10 minutes',
        sections: [
          'Basic investment information',
          'Risk assessment',
          'Personal financial information',
          'Regulatory compliance'
        ]
      }
    });

  } catch (error) {
    console.error('KYC questions error:', error);
    res.status(500).json({
      error: 'Failed to retrieve KYC questions',
      code: 'KYC_QUESTIONS_ERROR'
    });
  }
});

// GET /api/user/kyc/status
router.get('/kyc/status', async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('kycStatus kycData riskProfile riskScore');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      kycStatus: user.kycStatus,
      riskProfile: user.riskProfile,
      riskScore: user.riskScore,
      completedAt: user.kycData?.completedAt,
      hasCompletedKYC: !!user.kycData
    });

  } catch (error) {
    console.error('KYC status error:', error);
    res.status(500).json({
      error: 'Failed to retrieve KYC status',
      code: 'KYC_STATUS_ERROR'
    });
  }
});

module.exports = router;
