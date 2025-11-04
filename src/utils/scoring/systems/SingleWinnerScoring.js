/**
 * Single Winner Scoring System
 *
 * In this system, only the player with the lowest net score on each hole wins points.
 * If multiple players tie for the lowest score, no one receives points.
 * Points awarded are based on the winner's gross score vs par.
 */

import { BaseScoringSystem } from '../BaseScoringSystem';
import { calculateAllNetScores } from '../../voor';
import {
  calculateScoreDiff,
  findLowestScorePlayers,
  isTie,
  areAllScoresEntered,
  initializePoints,
} from '../ScoringUtils';
import {
  DEFAULT_SINGLE_WINNER_CONFIG,
  validateSingleWinnerConfig,
  convertOldConfigToSingleWinner,
} from '../configs/SingleWinnerConfig';

/**
 * Single Winner Scoring System Implementation
 * @extends BaseScoringSystem
 */
export class SingleWinnerScoring extends BaseScoringSystem {
  constructor() {
    super(
      'Single Winner',
      'Only the player with the lowest net score on each hole wins points. Ties result in no points awarded.'
    );
  }

  /**
   * Calculate points for winning based on score vs par
   * @private
   * @param {number} scoreDiff - Difference from par
   * @param {Object} scoringConfig - Scoring configuration
   * @returns {number} Points won
   */
  _calculatePointsForWin(scoreDiff, scoringConfig) {
    // Normalize config if it's in old format
    const config = this._normalizeConfig(scoringConfig);

    // Eagle or better (≤ -2)
    if (scoreDiff <= -2) {
      return config.eagle;
    }

    // Birdie (-1)
    if (scoreDiff === -1) {
      return config.birdie;
    }

    // Par (0)
    if (scoreDiff === 0) {
      return config.par;
    }

    // Bogey (+1)
    if (scoreDiff === 1) {
      return config.bogey;
    }

    // Double bogey or worse - use configured value (usually 0)
    return config.doubleBogeyOrWorse;
  }

  /**
   * Normalize configuration to new format
   * @private
   * @param {Object} config - Config in old or new format
   * @returns {Object} Config in new format
   */
  _normalizeConfig(config) {
    // If already in new format, ensure all fields exist with fallbacks
    if (config.eagle !== undefined) {
      return {
        eagle: config.eagle ?? DEFAULT_SINGLE_WINNER_CONFIG.eagle,
        birdie: config.birdie ?? DEFAULT_SINGLE_WINNER_CONFIG.birdie,
        par: config.par ?? DEFAULT_SINGLE_WINNER_CONFIG.par,
        bogey: config.bogey ?? DEFAULT_SINGLE_WINNER_CONFIG.bogey,
        doubleBogeyOrWorse: config.doubleBogeyOrWorse ?? DEFAULT_SINGLE_WINNER_CONFIG.doubleBogeyOrWorse,
      };
    }

    // Convert from old format
    return convertOldConfigToSingleWinner(config);
  }

  /**
   * Calculate points for all players on a hole
   * @param {import('../../../types').Hole} hole - Hole object with scores
   * @param {import('../../../types').Player[]} players - Array of players
   * @param {Object.<string, number[]>} strokeHolesMap - Map of playerId to stroke holes
   * @param {number[]} strokeIndexes - Stroke indexes for the course
   * @param {Object} scoringConfig - Scoring configuration
   * @returns {Object.<string, number>} Map of playerId to points earned
   */
  calculateHolePoints(hole, players, strokeHolesMap, strokeIndexes, scoringConfig) {
    const points = initializePoints(players);
    const netScores = calculateAllNetScores(hole, players, strokeHolesMap);

    // Skip if not all scores are entered
    if (!areAllScoresEntered(hole.scores, players)) {
      return points;
    }

    // Find the player(s) with the lowest net score
    const { playerIds: playersWithLowestScore } = findLowestScorePlayers(netScores);

    // Award points only if there's a single winner (no ties)
    // If multiple players tied for lowest score, no one gets points
    if (!isTie(playersWithLowestScore)) {
      const winnerId = playersWithLowestScore[0];
      const winnerGrossScore = hole.scores[winnerId];
      const scoreDiff = calculateScoreDiff(winnerGrossScore, hole.par);
      points[winnerId] = this._calculatePointsForWin(scoreDiff, scoringConfig);
    }
    // If tie, all players get 0 points (already initialized)

    return points;
  }

  /**
   * Calculate transaction matrix (points exchanged between players)
   * For Single Winner system, this shows how many holes each player won
   * @param {import('../../../types').Game} game - Game object
   * @param {Object.<string, number[]>} strokeHolesMap - Map of playerId to stroke holes
   * @returns {Object.<string, Object.<string, number>>} Matrix of player1 -> player2 -> net points
   */
  calculateTransactionMatrix(game, strokeHolesMap) {
    const matrix = {};

    // Initialize matrix
    game.players.forEach(player => {
      matrix[player.id] = {};
      game.players.forEach(opponent => {
        if (player.id !== opponent.id) {
          matrix[player.id][opponent.id] = 0;
        }
      });
    });

    // Calculate points exchanged on each hole
    game.holes.forEach(hole => {
      const netScores = calculateAllNetScores(hole, game.players, strokeHolesMap);

      // Skip if not all scores entered
      if (!areAllScoresEntered(hole.scores, game.players)) {
        return;
      }

      // Find winner(s)
      const { playerIds: playersWithLowestScore } = findLowestScorePlayers(netScores);

      // Award points only if there's a single winner (no ties)
      if (!isTie(playersWithLowestScore)) {
        const winnerId = playersWithLowestScore[0];
        const winnerGrossScore = hole.scores[winnerId];
        const scoreDiff = calculateScoreDiff(winnerGrossScore, hole.par);
        const pointsWon = this._calculatePointsForWin(scoreDiff, game.scoringConfig);

        game.players.forEach(player => {
          if (player.id !== winnerId) {
            matrix[winnerId][player.id] += pointsWon;
            matrix[player.id][winnerId] -= pointsWon;
          }
        });
      }
      // If tie, no points exchanged
    });

    return matrix;
  }

  /**
   * Validate scoring configuration for Single Winner system
   * @param {Object} config - Scoring configuration to validate
   * @returns {{isValid: boolean, errors: string[]}} Validation result
   */
  validateConfig(config) {
    // Normalize to new format if needed
    const normalizedConfig = this._normalizeConfig(config);
    return validateSingleWinnerConfig(normalizedConfig);
  }

  /**
   * Get default configuration for Single Winner system
   * @returns {Object} Default scoring configuration
   */
  getDefaultConfig() {
    return { ...DEFAULT_SINGLE_WINNER_CONFIG };
  }
}

// Export singleton instance
export const singleWinnerScoring = new SingleWinnerScoring();

// Legacy exports for backward compatibility
export const calculateHolePoints = (...args) => singleWinnerScoring.calculateHolePoints(...args);
export const calculateGameTotals = (...args) => singleWinnerScoring.calculateGameTotals(...args);
export const calculateAllPoints = (...args) => singleWinnerScoring.calculateAllPoints(...args);
export const getLeaderboard = (...args) => singleWinnerScoring.getLeaderboard(...args);
export const calculateTransactionMatrix = (...args) => singleWinnerScoring.calculateTransactionMatrix(...args);
export const getPlayerStats = (...args) => singleWinnerScoring.getPlayerStats(...args);
export const getAllPlayerStats = (...args) => singleWinnerScoring.getAllPlayerStats(...args);
