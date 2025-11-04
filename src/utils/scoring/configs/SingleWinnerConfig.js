/**
 * Single Winner Scoring Configuration
 *
 * Simple configuration for Single Winner scoring system.
 * Only the player with the lowest net score on each hole wins points.
 * Points awarded are based on the winner's gross score vs par.
 */

/**
 * @typedef {Object} SingleWinnerScoringConfig
 * @property {number} eagle - Points for eagle or better (≤ -2 vs par)
 * @property {number} birdie - Points for birdie (-1 vs par)
 * @property {number} par - Points for par (0 vs par)
 * @property {number} bogey - Points for bogey (+1 vs par)
 * @property {number} doubleBogeyOrWorse - Points for double bogey or worse (≥ +2 vs par)
 */

/**
 * Default configuration for Single Winner scoring
 * @type {SingleWinnerScoringConfig}
 */
export const DEFAULT_SINGLE_WINNER_CONFIG = {
  eagle: 4,
  birdie: 2,
  par: 1,
  bogey: 1,
  doubleBogeyOrWorse: 0,
};

/**
 * Preset configurations for Single Winner scoring
 */
export const SINGLE_WINNER_PRESETS = {
  standard: {
    name: 'Standard',
    description: 'Balanced scoring for typical games',
    config: {
      eagle: 4,
      birdie: 2,
      par: 1,
      bogey: 1,
      doubleBogeyOrWorse: 0,
    },
  },
  highStakes: {
    name: 'High Stakes',
    description: 'Higher points for better scores',
    config: {
      eagle: 6,
      birdie: 3,
      par: 1,
      bogey: 0,
      doubleBogeyOrWorse: 0,
    },
  },
  casual: {
    name: 'Casual',
    description: 'More forgiving, rewards all scores',
    config: {
      eagle: 5,
      birdie: 3,
      par: 2,
      bogey: 1,
      doubleBogeyOrWorse: 0,
    },
  },
  birdieOrBust: {
    name: 'Birdie or Bust',
    description: 'Only rewards under-par scores',
    config: {
      eagle: 5,
      birdie: 2,
      par: 0,
      bogey: 0,
      doubleBogeyOrWorse: 0,
    },
  },
};

/**
 * Validate Single Winner scoring configuration
 * @param {SingleWinnerScoringConfig} config - Configuration to validate
 * @returns {{isValid: boolean, errors: string[]}} Validation result
 */
export function validateSingleWinnerConfig(config) {
  const errors = [];

  // Check that all required fields are present
  const requiredFields = ['eagle', 'birdie', 'par', 'bogey', 'doubleBogeyOrWorse'];
  requiredFields.forEach(field => {
    if (config[field] === undefined || config[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Check that all values are valid numbers
  requiredFields.forEach(field => {
    if (config[field] !== undefined && config[field] !== null) {
      if (typeof config[field] !== 'number' || isNaN(config[field])) {
        errors.push(`${field} must be a valid number`);
      }
    }
  });

  // Check that values are non-negative
  requiredFields.forEach(field => {
    if (config[field] !== undefined && config[field] !== null && config[field] < 0) {
      errors.push(`${field} must be non-negative`);
    }
  });

  // Logical validation: eagle should be >= birdie >= par
  if (config.eagle < config.birdie) {
    errors.push('Eagle points should be greater than or equal to birdie points');
  }
  if (config.birdie < config.par) {
    errors.push('Birdie points should be greater than or equal to par points');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Convert old format config to new Single Winner format
 * @param {Object} oldConfig - Old config format with eagleOrBetter.againstLower structure
 * @returns {SingleWinnerScoringConfig} New config format
 */
export function convertOldConfigToSingleWinner(oldConfig) {
  return {
    eagle: oldConfig?.eagleOrBetter?.againstLower ?? DEFAULT_SINGLE_WINNER_CONFIG.eagle,
    birdie: oldConfig?.birdie?.againstLower ?? DEFAULT_SINGLE_WINNER_CONFIG.birdie,
    par: oldConfig?.par?.againstLower ?? DEFAULT_SINGLE_WINNER_CONFIG.par,
    bogey: oldConfig?.bogey?.againstLower ?? DEFAULT_SINGLE_WINNER_CONFIG.bogey,
    doubleBogeyOrWorse: oldConfig?.doubleBogeyOrWorse ?? DEFAULT_SINGLE_WINNER_CONFIG.doubleBogeyOrWorse,
  };
}

/**
 * Get configuration field labels for UI
 * @returns {Array<{key: string, label: string, description: string}>} Field metadata
 */
export function getSingleWinnerConfigFields() {
  return [
    {
      key: 'eagle',
      label: 'Eagle or Better',
      description: 'Points when winner scores 2 or more under par',
    },
    {
      key: 'birdie',
      label: 'Birdie',
      description: 'Points when winner scores 1 under par',
    },
    {
      key: 'par',
      label: 'Par',
      description: 'Points when winner scores par',
    },
    {
      key: 'bogey',
      label: 'Bogey',
      description: 'Points when winner scores 1 over par',
    },
    {
      key: 'doubleBogeyOrWorse',
      label: 'Double Bogey or Worse',
      description: 'Points when winner scores 2 or more over par',
    },
  ];
}
