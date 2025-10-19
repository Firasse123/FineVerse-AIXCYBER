const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Avatar = require('../models/Avatar');
const router = express.Router();

// Apply auth middleware to all routes
router.use((req, res, next) => {
  const authMiddleware = req.app.locals.authMiddleware;
  authMiddleware(req, res, next);
});

// Validation middleware
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  body('username')
    .optional()
    .isLength({ min: 3, max: 20 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-20 characters and contain only letters, numbers, and underscores')
];

// GET /api/user/profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId)
      .populate('achievements', 'name description icon')
      .populate('missions', 'name description reward')
      .select('-password -refreshToken -passwordResetToken -passwordResetExpires');

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Get portfolio summary
    const portfolio = await Portfolio.findOne({ userId });
    
    // Get avatar information
    const avatar = await Avatar.findOne({ userId });

    const profileData = {
      id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      level: user.level,
      xp: user.xp,
      reputation: user.reputation,
      securityScore: user.securityScore,
      kycStatus: user.kycStatus,
      riskProfile: user.riskProfile,
      riskScore: user.riskScore,
      twoFAEnabled: user.twoFAEnabled,
      preferences: user.preferences,
      achievements: user.achievements,
      missions: user.missions,
      totalGains: user.totalGains,
      totalLosses: user.totalLosses,
      totalTrades: user.totalTrades,
      winRate: user.winRate,
      onboardingCompleted: user.onboardingCompleted,
      tutorialCompleted: user.tutorialCompleted,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      lastActive: user.lastActive,
      portfolio: portfolio ? {
        totalValue: portfolio.totalValue,
        cash: portfolio.cash,
        totalGainLoss: portfolio.totalGainLoss,
        totalGainLossPercent: portfolio.totalGainLossPercent,
        holdingsCount: portfolio.holdings.length
      } : null,
      avatar: avatar ? {
        name: avatar.name,
        title: avatar.title,
        level: avatar.level,
        currentLocation: avatar.currentLocation,
        stats: avatar.stats,
        skills: avatar.skills
      } : null
    };

    res.json({
      message: 'Profile retrieved successfully',
      profile: profileData
    });

  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve profile',
      code: 'PROFILE_RETRIEVAL_ERROR'
    });
  }
});

// PUT /api/user/profile
router.put('/profile', validateProfileUpdate, async (req, res) => {
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

    const userId = req.user.userId;
    const { firstName, lastName, username, avatar, preferences } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if username is already taken (if changing)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          error: 'Username already taken',
          code: 'USERNAME_TAKEN'
        });
      }
    }

    // Update user fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (username !== undefined) user.username = username;
    if (avatar !== undefined) user.avatar = avatar;
    if (preferences !== undefined) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    // Update avatar name if username changed
    if (username && username !== user.username) {
      const avatar = await Avatar.findOne({ userId });
      if (avatar) {
        avatar.name = username;
        await avatar.save();
      }
    }

    res.json({
      message: 'Profile updated successfully',
      profile: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      code: 'PROFILE_UPDATE_ERROR'
    });
  }
});

// GET /api/user/stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const portfolio = await Portfolio.findOne({ userId });
    const avatar = await Avatar.findOne({ userId });

    const stats = {
      trading: {
        totalTrades: user.totalTrades,
        winningTrades: user.winningTrades || 0,
        losingTrades: user.losingTrades || 0,
        winRate: user.winRate,
        totalGains: user.totalGains,
        totalLosses: user.totalLosses,
        netWorth: user.totalGains - user.totalLosses,
        averageWin: user.averageWin,
        averageLoss: user.averageLoss,
        profitFactor: user.profitFactor
      },
      game: {
        level: user.level,
        xp: user.xp,
        reputation: user.reputation,
        securityScore: user.securityScore,
        achievementsUnlocked: user.achievements.length,
        missionsCompleted: user.completedMissions?.length || 0
      },
      portfolio: portfolio ? {
        totalValue: portfolio.totalValue,
        cash: portfolio.cash,
        holdingsCount: portfolio.holdings.length,
        totalGainLoss: portfolio.totalGainLoss,
        totalGainLossPercent: portfolio.totalGainLossPercent,
        diversificationScore: portfolio.diversificationScore
      } : null,
      avatar: avatar ? {
        level: avatar.level,
        xp: avatar.xp,
        reputationScore: avatar.reputationScore,
        stats: avatar.stats,
        skills: avatar.skills,
        badgesCount: avatar.badges.length
      } : null
    };

    res.json({
      message: 'Stats retrieved successfully',
      stats
    });

  } catch (error) {
    console.error('Stats retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve stats',
      code: 'STATS_RETRIEVAL_ERROR'
    });
  }
});

// GET /api/user/settings
router.get('/settings', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId).select('preferences twoFAEnabled');
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      message: 'Settings retrieved successfully',
      settings: {
        preferences: user.preferences,
        twoFAEnabled: user.twoFAEnabled,
        securityScore: user.securityScore
      }
    });

  } catch (error) {
    console.error('Settings retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve settings',
      code: 'SETTINGS_RETRIEVAL_ERROR'
    });
  }
});

// PUT /api/user/settings
router.put('/settings', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { preferences, notifications } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Update preferences
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    // Update notification preferences
    if (notifications) {
      user.preferences.notifications = { ...user.preferences.notifications, ...notifications };
    }

    await user.save();

    res.json({
      message: 'Settings updated successfully',
      settings: {
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({
      error: 'Failed to update settings',
      code: 'SETTINGS_UPDATE_ERROR'
    });
  }
});

// DELETE /api/user/account
router.delete('/account', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { password, confirmation } = req.body;

    if (!password || !confirmation) {
      return res.status(400).json({
        error: 'Password and confirmation are required',
        code: 'MISSING_FIELDS'
      });
    }

    if (confirmation !== 'DELETE') {
      return res.status(400).json({
        error: 'Confirmation must be "DELETE"',
        code: 'INVALID_CONFIRMATION'
      });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verify password
    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid password',
        code: 'INVALID_PASSWORD'
      });
    }

    // Soft delete - deactivate account instead of hard delete
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    user.username = `deleted_${Date.now()}_${user.username}`;
    user.refreshToken = undefined;
    await user.save();

    res.json({
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      error: 'Failed to delete account',
      code: 'ACCOUNT_DELETION_ERROR'
    });
  }
});

// GET /api/user/game-state
router.get('/game-state', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    const avatar = await Avatar.findOne({ userId });
    const portfolio = await Portfolio.findOne({ userId });

    if (!user || !avatar) {
      return res.status(404).json({
        error: 'User or avatar not found',
        code: 'USER_OR_AVATAR_NOT_FOUND'
      });
    }

    const gameState = {
      currentLocation: avatar.currentLocation,
      avatar: {
        name: avatar.name,
        title: avatar.title,
        level: avatar.level,
        xp: avatar.xp,
        reputationScore: avatar.reputationScore,
        stats: avatar.stats,
        skills: avatar.skills,
        unlockedFeatures: avatar.unlockedFeatures,
        badges: avatar.badges,
        status: avatar.status,
        statusMessage: avatar.statusMessage
      },
      user: {
        level: user.level,
        xp: user.xp,
        reputation: user.reputation,
        securityScore: user.securityScore,
        totalGains: user.totalGains,
        totalTrades: user.totalTrades
      },
      portfolio: portfolio ? {
        totalValue: portfolio.totalValue,
        cash: portfolio.cash,
        holdingsCount: portfolio.holdings.length
      } : null
    };

    res.json({
      message: 'Game state retrieved successfully',
      gameState
    });

  } catch (error) {
    console.error('Game state retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve game state',
      code: 'GAME_STATE_RETRIEVAL_ERROR'
    });
  }
});

module.exports = router;
