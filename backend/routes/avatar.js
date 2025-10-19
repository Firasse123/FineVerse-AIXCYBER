const express = require('express');
const { body, validationResult } = require('express-validator');
const Avatar = require('../models/Avatar');
const User = require('../models/User');
const router = express.Router();

// Apply auth middleware to all routes
router.use((req, res, next) => {
  const authMiddleware = req.app.locals.authMiddleware;
  authMiddleware(req, res, next);
});

// Validation middleware
const validateAvatarUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Name must be between 2 and 20 characters'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Title must be less than 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters')
];

// GET /api/avatar/profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const avatar = await Avatar.findOne({ userId });
    if (!avatar) {
      return res.status(404).json({
        error: 'Avatar not found',
        code: 'AVATAR_NOT_FOUND'
      });
    }

    res.json({
      message: 'Avatar profile retrieved successfully',
      avatar
    });

  } catch (error) {
    console.error('Avatar profile retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve avatar profile',
      code: 'AVATAR_PROFILE_ERROR'
    });
  }
});

// PUT /api/avatar/profile
router.put('/profile', validateAvatarUpdate, async (req, res) => {
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
    const { name, title, bio, appearance, personality } = req.body;

    const avatar = await Avatar.findOne({ userId });
    if (!avatar) {
      return res.status(404).json({
        error: 'Avatar not found',
        code: 'AVATAR_NOT_FOUND'
      });
    }

    // Update avatar fields
    if (name !== undefined) avatar.name = name;
    if (title !== undefined) avatar.title = title;
    if (bio !== undefined) avatar.bio = bio;
    if (appearance !== undefined) {
      avatar.appearance = { ...avatar.appearance, ...appearance };
    }
    if (personality !== undefined) {
      avatar.personality = { ...avatar.personality, ...personality };
    }

    await avatar.save();

    res.json({
      message: 'Avatar profile updated successfully',
      avatar
    });

  } catch (error) {
    console.error('Avatar profile update error:', error);
    res.status(500).json({
      error: 'Failed to update avatar profile',
      code: 'AVATAR_UPDATE_ERROR'
    });
  }
});

// GET /api/avatar/customization
router.get('/customization', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const avatar = await Avatar.findOne({ userId });
    if (!avatar) {
      return res.status(404).json({
        error: 'Avatar not found',
        code: 'AVATAR_NOT_FOUND'
      });
    }

    // Return customization options and current appearance
    const customizationData = {
      currentAppearance: avatar.appearance,
      unlockedFeatures: avatar.unlockedFeatures,
      customizationHistory: avatar.customizationHistory,
      availableOptions: {
        skinTones: ['light', 'medium', 'tan', 'dark', 'deep'],
        hairColors: ['black', 'brown', 'blonde', 'red', 'gray', 'white'],
        hairStyles: ['short', 'medium', 'long', 'curly', 'wavy', 'straight'],
        eyeColors: ['brown', 'blue', 'green', 'hazel', 'gray'],
        outfits: ['casual', 'business', 'formal', 'sporty', 'cyberpunk'],
        accessories: ['glasses', 'hat', 'watch', 'necklace', 'earrings'],
        effects: ['glow', 'sparkles', 'neon', 'holographic', 'none']
      }
    };

    res.json({
      message: 'Customization data retrieved successfully',
      customization: customizationData
    });

  } catch (error) {
    console.error('Avatar customization retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve customization data',
      code: 'CUSTOMIZATION_ERROR'
    });
  }
});

// PUT /api/avatar/customization
router.put('/customization', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { appearance } = req.body;

    if (!appearance) {
      return res.status(400).json({
        error: 'Appearance data is required',
        code: 'APPEARANCE_REQUIRED'
      });
    }

    const avatar = await Avatar.findOne({ userId });
    if (!avatar) {
      return res.status(404).json({
        error: 'Avatar not found',
        code: 'AVATAR_NOT_FOUND'
      });
    }

    // Validate appearance options
    const validSkinTones = ['light', 'medium', 'tan', 'dark', 'deep'];
    const validHairColors = ['black', 'brown', 'blonde', 'red', 'gray', 'white'];
    const validHairStyles = ['short', 'medium', 'long', 'curly', 'wavy', 'straight'];
    const validEyeColors = ['brown', 'blue', 'green', 'hazel', 'gray'];
    const validOutfits = ['casual', 'business', 'formal', 'sporty', 'cyberpunk'];
    const validAccessories = ['glasses', 'hat', 'watch', 'necklace', 'earrings'];
    const validEffects = ['glow', 'sparkles', 'neon', 'holographic', 'none'];

    // Validate each appearance field
    if (appearance.skin && !validSkinTones.includes(appearance.skin)) {
      return res.status(400).json({
        error: 'Invalid skin tone',
        code: 'INVALID_SKIN_TONE'
      });
    }

    if (appearance.hair && appearance.hair.color && !validHairColors.includes(appearance.hair.color)) {
      return res.status(400).json({
        error: 'Invalid hair color',
        code: 'INVALID_HAIR_COLOR'
      });
    }

    if (appearance.hair && appearance.hair.style && !validHairStyles.includes(appearance.hair.style)) {
      return res.status(400).json({
        error: 'Invalid hair style',
        code: 'INVALID_HAIR_STYLE'
      });
    }

    if (appearance.eyes && !validEyeColors.includes(appearance.eyes)) {
      return res.status(400).json({
        error: 'Invalid eye color',
        code: 'INVALID_EYE_COLOR'
      });
    }

    if (appearance.outfit && !validOutfits.includes(appearance.outfit)) {
      return res.status(400).json({
        error: 'Invalid outfit',
        code: 'INVALID_OUTFIT'
      });
    }

    if (appearance.accessories) {
      for (const accessory of appearance.accessories) {
        if (!validAccessories.includes(accessory)) {
          return res.status(400).json({
            error: 'Invalid accessory',
            code: 'INVALID_ACCESSORY'
          });
        }
      }
    }

    if (appearance.effects && !validEffects.includes(appearance.effects)) {
      return res.status(400).json({
        error: 'Invalid effect',
        code: 'INVALID_EFFECT'
      });
    }

    // Update appearance
    avatar.appearance = { ...avatar.appearance, ...appearance };
    
    // Add to customization history
    avatar.customizationHistory.push({
      appearance: { ...appearance },
      timestamp: new Date()
    });

    // Keep only last 10 customizations
    if (avatar.customizationHistory.length > 10) {
      avatar.customizationHistory = avatar.customizationHistory.slice(-10);
    }

    await avatar.save();

    res.json({
      message: 'Avatar appearance updated successfully',
      appearance: avatar.appearance
    });

  } catch (error) {
    console.error('Avatar customization update error:', error);
    res.status(500).json({
      error: 'Failed to update avatar appearance',
      code: 'CUSTOMIZATION_UPDATE_ERROR'
    });
  }
});

// GET /api/avatar/skills
router.get('/skills', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const avatar = await Avatar.findOne({ userId });
    if (!avatar) {
      return res.status(404).json({
        error: 'Avatar not found',
        code: 'AVATAR_NOT_FOUND'
      });
    }

    res.json({
      message: 'Avatar skills retrieved successfully',
      skills: avatar.skills,
      totalSkillPoints: avatar.totalSkillPoints,
      skillLevel: avatar.skillLevel
    });

  } catch (error) {
    console.error('Avatar skills retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve avatar skills',
      code: 'SKILLS_ERROR'
    });
  }
});

// PUT /api/avatar/skills
router.put('/skills', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { skillType, points } = req.body;

    if (!skillType || !points || points <= 0) {
      return res.status(400).json({
        error: 'Skill type and positive points are required',
        code: 'INVALID_SKILL_DATA'
      });
    }

    const avatar = await Avatar.findOne({ userId });
    if (!avatar) {
      return res.status(404).json({
        error: 'Avatar not found',
        code: 'AVATAR_NOT_FOUND'
      });
    }

    // Check if user has enough skill points
    if (avatar.totalSkillPoints < points) {
      return res.status(400).json({
        error: 'Insufficient skill points',
        code: 'INSUFFICIENT_SKILL_POINTS'
      });
    }

    // Update skill
    const result = avatar.updateSkill(skillType, points);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.message,
        code: 'SKILL_UPDATE_FAILED'
      });
    }

    await avatar.save();

    res.json({
      message: 'Skill updated successfully',
      skills: avatar.skills,
      totalSkillPoints: avatar.totalSkillPoints,
      skillLevel: avatar.skillLevel
    });

  } catch (error) {
    console.error('Avatar skills update error:', error);
    res.status(500).json({
      error: 'Failed to update avatar skills',
      code: 'SKILLS_UPDATE_ERROR'
    });
  }
});

// GET /api/avatar/badges
router.get('/badges', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const avatar = await Avatar.findOne({ userId });
    if (!avatar) {
      return res.status(404).json({
        error: 'Avatar not found',
        code: 'AVATAR_NOT_FOUND'
      });
    }

    res.json({
      message: 'Avatar badges retrieved successfully',
      badges: avatar.badges,
      badgesCount: avatar.badges.length
    });

  } catch (error) {
    console.error('Avatar badges retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve avatar badges',
      code: 'BADGES_ERROR'
    });
  }
});

// POST /api/avatar/badges
router.post('/badges', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { badgeId, badgeName, description, icon } = req.body;

    if (!badgeId || !badgeName) {
      return res.status(400).json({
        error: 'Badge ID and name are required',
        code: 'BADGE_DATA_REQUIRED'
      });
    }

    const avatar = await Avatar.findOne({ userId });
    if (!avatar) {
      return res.status(404).json({
        error: 'Avatar not found',
        code: 'AVATAR_NOT_FOUND'
      });
    }

    // Check if badge already exists
    const existingBadge = avatar.badges.find(badge => badge.id === badgeId);
    if (existingBadge) {
      return res.status(400).json({
        error: 'Badge already exists',
        code: 'BADGE_EXISTS'
      });
    }

    // Add badge
    const result = avatar.addBadge(badgeId, badgeName, description, icon);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.message,
        code: 'BADGE_ADD_FAILED'
      });
    }

    await avatar.save();

    res.json({
      message: 'Badge added successfully',
      badges: avatar.badges,
      newBadge: result.badge
    });

  } catch (error) {
    console.error('Avatar badge addition error:', error);
    res.status(500).json({
      error: 'Failed to add badge',
      code: 'BADGE_ADD_ERROR'
    });
  }
});

// GET /api/avatar/progression
router.get('/progression', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const avatar = await Avatar.findOne({ userId });
    if (!avatar) {
      return res.status(404).json({
        error: 'Avatar not found',
        code: 'AVATAR_NOT_FOUND'
      });
    }

    const progressionData = {
      level: avatar.level,
      xp: avatar.xp,
      nextLevelXP: avatar.nextLevelXP,
      xpProgress: avatar.xpProgress,
      reputationScore: avatar.reputationScore,
      stats: avatar.stats,
      skills: avatar.skills,
      unlockedFeatures: avatar.unlockedFeatures,
      badges: avatar.badges,
      totalSkillPoints: avatar.totalSkillPoints,
      skillLevel: avatar.skillLevel
    };

    res.json({
      message: 'Avatar progression retrieved successfully',
      progression: progressionData
    });

  } catch (error) {
    console.error('Avatar progression retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve avatar progression',
      code: 'PROGRESSION_ERROR'
    });
  }
});

// POST /api/avatar/xp
router.post('/xp', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount, source, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Positive XP amount is required',
        code: 'INVALID_XP_AMOUNT'
      });
    }

    const avatar = await Avatar.findOne({ userId });
    if (!avatar) {
      return res.status(404).json({
        error: 'Avatar not found',
        code: 'AVATAR_NOT_FOUND'
      });
    }

    // Add XP
    const result = avatar.addXP(amount, source, description);
    
    await avatar.save();

    res.json({
      message: 'XP added successfully',
      xp: avatar.xp,
      level: avatar.level,
      nextLevelXP: avatar.nextLevelXP,
      xpProgress: avatar.xpProgress,
      leveledUp: result.leveledUp,
      skillPointsGained: result.skillPointsGained
    });

  } catch (error) {
    console.error('Avatar XP addition error:', error);
    res.status(500).json({
      error: 'Failed to add XP',
      code: 'XP_ADD_ERROR'
    });
  }
});

// GET /api/avatar/status
router.get('/status', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const avatar = await Avatar.findOne({ userId });
    if (!avatar) {
      return res.status(404).json({
        error: 'Avatar not found',
        code: 'AVATAR_NOT_FOUND'
      });
    }

    res.json({
      message: 'Avatar status retrieved successfully',
      status: avatar.status,
      statusMessage: avatar.statusMessage,
      isOnline: avatar.isOnline,
      lastSeen: avatar.lastSeen,
      currentLocation: avatar.currentLocation
    });

  } catch (error) {
    console.error('Avatar status retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve avatar status',
      code: 'STATUS_ERROR'
    });
  }
});

// PUT /api/avatar/status
router.put('/status', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, statusMessage, isOnline } = req.body;

    const avatar = await Avatar.findOne({ userId });
    if (!avatar) {
      return res.status(404).json({
        error: 'Avatar not found',
        code: 'AVATAR_NOT_FOUND'
      });
    }

    // Update status
    if (status !== undefined) avatar.status = status;
    if (statusMessage !== undefined) avatar.statusMessage = statusMessage;
    if (isOnline !== undefined) {
      avatar.isOnline = isOnline;
      if (isOnline) {
        avatar.lastSeen = new Date();
      }
    }

    await avatar.save();

    res.json({
      message: 'Avatar status updated successfully',
      status: avatar.status,
      statusMessage: avatar.statusMessage,
      isOnline: avatar.isOnline,
      lastSeen: avatar.lastSeen
    });

  } catch (error) {
    console.error('Avatar status update error:', error);
    res.status(500).json({
      error: 'Failed to update avatar status',
      code: 'STATUS_UPDATE_ERROR'
    });
  }
});

module.exports = router;
