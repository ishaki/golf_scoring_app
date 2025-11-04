/**
 * Scoring System Factory - Exports the appropriate scoring system based on game configuration
 *
 * LEGACY FILE: This file maintains backward compatibility.
 * New code should import from './scoring/index.js' instead.
 */

import {
  getScoringSystem as getScoring,
  SCORING_SYSTEMS as NEW_SCORING_SYSTEMS,
} from './scoring/index.js';

/**
 * Available scoring systems
 * Note: Maintaining old constants for backward compatibility
 */
export const SCORING_SYSTEMS = {
  FIGHTER: 'fighter',
  SINGLE_WINNER: 'single_winner', // Legacy format
  SINGLE_WINNER_NEW: 'single-winner', // New format
};

/**
 * Get the appropriate scoring system based on game configuration
 * @param {import('../types').Game} game - Game object
 * @returns {Object} Scoring system instance
 */
export function getScoringSystem(game) {
  // Normalize legacy scoring system names to new format
  const legacySystem = game?.scoringSystem || SCORING_SYSTEMS.FIGHTER;

  let normalizedSystem = legacySystem;
  if (legacySystem === 'single_winner') {
    normalizedSystem = 'single-winner';
  }

  return getScoring({ ...game, scoringSystem: normalizedSystem });
}

/**
 * Calculate points for all players on a hole
 * @param {import('../types').Hole} hole - Hole object with scores
 * @param {import('../types').Player[]} players - Array of players
 * @param {Object.<string, number[]>} strokeHolesMap - Map of playerId to stroke holes
 * @param {number[]} strokeIndexes - Stroke indexes for the course
 * @param {import('../types').ScoringConfiguration} scoringConfig - Scoring configuration
 * @param {string} scoringSystem - Scoring system type
 * @returns {Object.<string, number>} Map of playerId to points earned
 */
export function calculateHolePoints(hole, players, strokeHolesMap, strokeIndexes, scoringConfig, scoringSystem) {
  const system = getScoringSystem({ scoringSystem });
  return system.calculateHolePoints(hole, players, strokeHolesMap, strokeIndexes, scoringConfig);
}

/**
 * Calculate points for entire game (all holes)
 * @param {import('../types').Game} game - Game object
 * @param {Object.<string, number[]>} strokeHolesMap - Map of playerId to stroke holes
 * @returns {import('../types').Game} Updated game with calculated points
 */
export function calculateAllPoints(game, strokeHolesMap) {
  const system = getScoringSystem(game);
  return system.calculateAllPoints(game, strokeHolesMap);
}

/**
 * Get leaderboard sorted by points
 * @param {import('../types').Game} game - Game object
 * @returns {Array<{playerId: string, name: string, points: number, rank: number}>} Sorted leaderboard
 */
export function getLeaderboard(game) {
  const system = getScoringSystem(game);
  return system.getLeaderboard(game);
}

/**
 * Calculate transaction matrix (points exchanged between players)
 * @param {import('../types').Game} game - Game object
 * @param {Object.<string, number[]>} strokeHolesMap - Map of playerId to stroke holes
 * @returns {Object.<string, Object.<string, number>>} Matrix of player1 -> player2 -> net points
 */
export function calculateTransactionMatrix(game, strokeHolesMap) {
  const system = getScoringSystem(game);
  return system.calculateTransactionMatrix(game, strokeHolesMap);
}

/**
 * Get player statistics
 * @param {import('../types').Game} game - Game object
 * @param {string} playerId - Player ID
 * @param {Object.<string, number[]>} strokeHolesMap - Map of playerId to stroke holes
 * @returns {Object} Player statistics
 */
export function getPlayerStats(game, playerId, strokeHolesMap) {
  const system = getScoringSystem(game);
  return system.getPlayerStats(game, playerId, strokeHolesMap);
}

/**
 * Get all player statistics
 * @param {import('../types').Game} game - Game object
 * @param {Object.<string, number[]>} strokeHolesMap - Map of playerId to stroke holes
 * @returns {Object.<string, Object>} Map of playerId to stats
 */
export function getAllPlayerStats(game, strokeHolesMap) {
  const system = getScoringSystem(game);
  return system.getAllPlayerStats(game, strokeHolesMap);
}

/**
 * Calculate cumulative points for all players across all holes
 * @param {import('../types').Hole[]} holes - Array of holes
 * @param {import('../types').Player[]} players - Array of players
 * @returns {Object.<string, number>} Map of playerId to total points
 */
export function calculateGameTotals(holes, players) {
  // This function is system-agnostic, use base implementation
  const { fighterScoring } = require('./scoring/systems/FighterScoring.js');
  return fighterScoring.calculateGameTotals(holes, players);
}

// Re-export new architecture constants and functions for convenience
export { getDefaultConfig, validateConfig, getPresets, getConfigFields, getAvailableSystems } from './scoring/index.js';