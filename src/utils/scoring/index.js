/**
 * Scoring System Factory and Main Export
 *
 * This file serves as the main entry point for the scoring system.
 * It provides a factory function to get the appropriate scoring system based on game configuration.
 */

import { singleWinnerScoring } from './systems/SingleWinnerScoring';
import { fighterScoring } from './systems/FighterScoring';
import {
  DEFAULT_SINGLE_WINNER_CONFIG,
  SINGLE_WINNER_PRESETS,
  validateSingleWinnerConfig,
  getSingleWinnerConfigFields,
} from './configs/SingleWinnerConfig';
import {
  DEFAULT_FIGHTER_CONFIG,
  FIGHTER_PRESETS,
  validateFighterConfig,
  getFighterConfigFields,
} from './configs/FighterConfig';

// Scoring system types
export const SCORING_SYSTEMS = {
  SINGLE_WINNER: 'single-winner',
  FIGHTER: 'fighter',
};

/**
 * Get the appropriate scoring system instance based on game configuration
 * @param {import('../../types').Game} game - Game object with scoringSystem property
 * @returns {BaseScoringSystem} Scoring system instance
 * @throws {Error} If scoring system is not recognized
 */
export function getScoringSystem(game) {
  const systemType = game?.scoringSystem || SCORING_SYSTEMS.FIGHTER; // Default to Fighter for backward compatibility

  switch (systemType) {
    case SCORING_SYSTEMS.SINGLE_WINNER:
      return singleWinnerScoring;

    case SCORING_SYSTEMS.FIGHTER:
      return fighterScoring;

    default:
      console.warn(`Unknown scoring system: ${systemType}, defaulting to Fighter`);
      return fighterScoring;
  }
}

/**
 * Get default configuration for a scoring system
 * @param {string} systemType - Scoring system type (from SCORING_SYSTEMS)
 * @returns {Object} Default configuration
 */
export function getDefaultConfig(systemType) {
  switch (systemType) {
    case SCORING_SYSTEMS.SINGLE_WINNER:
      return { ...DEFAULT_SINGLE_WINNER_CONFIG };

    case SCORING_SYSTEMS.FIGHTER:
      return JSON.parse(JSON.stringify(DEFAULT_FIGHTER_CONFIG));

    default:
      return JSON.parse(JSON.stringify(DEFAULT_FIGHTER_CONFIG));
  }
}

/**
 * Validate configuration for a scoring system
 * @param {string} systemType - Scoring system type
 * @param {Object} config - Configuration to validate
 * @returns {{isValid: boolean, errors: string[]}} Validation result
 */
export function validateConfig(systemType, config) {
  switch (systemType) {
    case SCORING_SYSTEMS.SINGLE_WINNER:
      return validateSingleWinnerConfig(config);

    case SCORING_SYSTEMS.FIGHTER:
      return validateFighterConfig(config);

    default:
      return {
        isValid: false,
        errors: [`Unknown scoring system: ${systemType}`],
      };
  }
}

/**
 * Get presets for a scoring system
 * @param {string} systemType - Scoring system type
 * @returns {Object} Presets object
 */
export function getPresets(systemType) {
  switch (systemType) {
    case SCORING_SYSTEMS.SINGLE_WINNER:
      return SINGLE_WINNER_PRESETS;

    case SCORING_SYSTEMS.FIGHTER:
      return FIGHTER_PRESETS;

    default:
      return {};
  }
}

/**
 * Get configuration fields metadata for UI rendering
 * @param {string} systemType - Scoring system type
 * @returns {Array} Configuration fields metadata
 */
export function getConfigFields(systemType) {
  switch (systemType) {
    case SCORING_SYSTEMS.SINGLE_WINNER:
      return getSingleWinnerConfigFields();

    case SCORING_SYSTEMS.FIGHTER:
      return getFighterConfigFields();

    default:
      return [];
  }
}

/**
 * Get list of available scoring systems
 * @returns {Array<{id: string, name: string, description: string}>} Available systems
 */
export function getAvailableSystems() {
  return [
    {
      id: SCORING_SYSTEMS.SINGLE_WINNER,
      name: singleWinnerScoring.getName(),
      description: singleWinnerScoring.getDescription(),
    },
    {
      id: SCORING_SYSTEMS.FIGHTER,
      name: fighterScoring.getName(),
      description: fighterScoring.getDescription(),
    },
  ];
}

// Re-export scoring system instances for direct access if needed
export { singleWinnerScoring, fighterScoring };

// Re-export configs and presets
export {
  DEFAULT_SINGLE_WINNER_CONFIG,
  SINGLE_WINNER_PRESETS,
  DEFAULT_FIGHTER_CONFIG,
  FIGHTER_PRESETS,
};

// Re-export utilities
export * from './ScoringUtils';
