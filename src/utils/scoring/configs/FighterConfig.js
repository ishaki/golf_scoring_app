/**
 * Fighter Scoring Configuration
 *
 * Configuration for Fighter (head-to-head) scoring system.
 * Each player compares against all other players on each hole.
 * Points are awarded based on whether the player's net score was higher or lower than opponent's.
 */

/**
 * @typedef {Object} FighterScoreConfig
 * @property {number} againstLower - Points when beating a player with lower net score
 * @property {number} againstHigher - Points when beating a player with higher net score
 */

/**
 * @typedef {Object} FighterScoringConfig
 * @property {FighterScoreConfig} eagleOrBetter - Points for eagle or better (≤ -2 vs par)
 * @property {FighterScoreConfig} birdie - Points for birdie (-1 vs par)
 * @property {FighterScoreConfig} par - Points for par (0 vs par)
 * @property {FighterScoreConfig} bogey - Points for bogey (+1 vs par)
 */

/**
 * Default configuration for Fighter scoring
 * @type {FighterScoringConfig}
 */
export const DEFAULT_FIGHTER_CONFIG = {
  eagleOrBetter: {
    againstLower: 4,
    againstHigher: 4,
  },
  birdie: {
    againstLower: 2,
    againstHigher: 2,
  },
  par: {
    againstLower: 1,
    againstHigher: 1,
  },
  bogey: {
    againstLower: 1,
    againstHigher: 0,
  },
};

/**
 * Preset configurations for Fighter scoring
 */
export const FIGHTER_PRESETS = {
  standard: {
    name: 'Standard',
    description: 'Balanced head-to-head scoring',
    config: {
      eagleOrBetter: {
        againstLower: 4,
        againstHigher: 4,
      },
      birdie: {
        againstLower: 2,
        againstHigher: 2,
      },
      par: {
        againstLower: 1,
        againstHigher: 1,
      },
      bogey: {
        againstLower: 1,
        againstHigher: 0,
      },
    },
  },
  aggressive: {
    name: 'Aggressive',
    description: 'Higher rewards for beating better players',
    config: {
      eagleOrBetter: {
        againstLower: 5,
        againstHigher: 3,
      },
      birdie: {
        againstLower: 3,
        againstHigher: 2,
      },
      par: {
        againstLower: 2,
        againstHigher: 1,
      },
      bogey: {
        againstLower: 1,
        againstHigher: 0,
      },
    },
  },
  casual: {
    name: 'Casual',
    description: 'Lower stakes, easier scoring',
    config: {
      eagleOrBetter: {
        againstLower: 3,
        againstHigher: 3,
      },
      birdie: {
        againstLower: 2,
        againstHigher: 2,
      },
      par: {
        againstLower: 1,
        againstHigher: 1,
      },
      bogey: {
        againstLower: 1,
        againstHigher: 1,
      },
    },
  },
};

/**
 * Validate Fighter scoring configuration
 * @param {FighterScoringConfig} config - Configuration to validate
 * @returns {{isValid: boolean, errors: string[]}} Validation result
 */
export function validateFighterConfig(config) {
  const errors = [];

  // Check that all required score types are present
  const requiredScoreTypes = ['eagleOrBetter', 'birdie', 'par', 'bogey'];
  requiredScoreTypes.forEach(scoreType => {
    if (!config[scoreType]) {
      errors.push(`Missing required score type: ${scoreType}`);
      return;
    }

    // Check that both againstLower and againstHigher are present
    if (config[scoreType].againstLower === undefined || config[scoreType].againstLower === null) {
      errors.push(`Missing againstLower for ${scoreType}`);
    }
    if (config[scoreType].againstHigher === undefined || config[scoreType].againstHigher === null) {
      errors.push(`Missing againstHigher for ${scoreType}`);
    }

    // Check that values are valid numbers
    if (typeof config[scoreType].againstLower !== 'number' || isNaN(config[scoreType].againstLower)) {
      errors.push(`${scoreType}.againstLower must be a valid number`);
    }
    if (typeof config[scoreType].againstHigher !== 'number' || isNaN(config[scoreType].againstHigher)) {
      errors.push(`${scoreType}.againstHigher must be a valid number`);
    }

    // Check that values are non-negative
    if (config[scoreType].againstLower < 0) {
      errors.push(`${scoreType}.againstLower must be non-negative`);
    }
    if (config[scoreType].againstHigher < 0) {
      errors.push(`${scoreType}.againstHigher must be non-negative`);
    }
  });

  // Logical validation: eagleOrBetter should have highest points
  if (config.eagleOrBetter && config.birdie) {
    if (config.eagleOrBetter.againstLower < config.birdie.againstLower) {
      errors.push('Eagle againstLower should be >= birdie againstLower');
    }
    if (config.eagleOrBetter.againstHigher < config.birdie.againstHigher) {
      errors.push('Eagle againstHigher should be >= birdie againstHigher');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get configuration field labels for UI
 * @returns {Array<{key: string, label: string, fields: Array}>} Field metadata
 */
export function getFighterConfigFields() {
  return [
    {
      key: 'eagleOrBetter',
      label: 'Eagle or Better',
      description: 'Points when scoring 2 or more under par',
      fields: [
        { key: 'againstLower', label: 'vs Lower Handicap', description: 'Points when beating player with lower handicap' },
        { key: 'againstHigher', label: 'vs Higher Handicap', description: 'Points when beating player with higher handicap' },
      ],
    },
    {
      key: 'birdie',
      label: 'Birdie',
      description: 'Points when scoring 1 under par',
      fields: [
        { key: 'againstLower', label: 'vs Lower Handicap', description: 'Points when beating player with lower handicap' },
        { key: 'againstHigher', label: 'vs Higher Handicap', description: 'Points when beating player with higher handicap' },
      ],
    },
    {
      key: 'par',
      label: 'Par',
      description: 'Points when scoring par',
      fields: [
        { key: 'againstLower', label: 'vs Lower Handicap', description: 'Points when beating player with lower handicap' },
        { key: 'againstHigher', label: 'vs Higher Handicap', description: 'Points when beating player with higher handicap' },
      ],
    },
    {
      key: 'bogey',
      label: 'Bogey',
      description: 'Points when scoring 1 over par',
      fields: [
        { key: 'againstLower', label: 'vs Lower Handicap', description: 'Points when beating player with lower handicap' },
        { key: 'againstHigher', label: 'vs Higher Handicap', description: 'Points when beating player with higher handicap' },
      ],
    },
  ];
}
