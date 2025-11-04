/**
 * Fighter Scoring System
 *
 * In this system, each player compares their score against all other players on each hole.
 * This is a zero-sum game where total points across all players equals 0.
 * Points are based on head-to-head comparisons with special voor (handicap) tie-breaking rules.
 */

import { BaseScoringSystem } from '../BaseScoringSystem';
import { calculateAllNetScores, playerGetsStrokeOnHole } from '../../voor';
import { getStrokeHoles } from '../../courseConfig';
import {
  calculateScoreDiff,
  areAllScoresEntered,
  initializePoints,
} from '../ScoringUtils';
import {
  DEFAULT_FIGHTER_CONFIG,
  validateFighterConfig,
} from '../configs/FighterConfig';

/**
 * Fighter (Head-to-Head) Scoring System Implementation
 * @extends BaseScoringSystem
 */
export class FighterScoring extends BaseScoringSystem {
  constructor() {
    super(
      'Fighter',
      'Head-to-head comparison where each player compares against all others. Zero-sum game with voor tie-breaking.'
    );
  }

  /**
   * Check if giver gives a stroke to receiver on a specific hole
   * @private
   * @param {import('../../../types').Player} giver - Player who potentially gives stroke
   * @param {import('../../../types').Player} receiver - Player who potentially receives stroke
   * @param {number} holeNumber - Hole number
   * @param {number[]} strokeIndexes - Stroke indexes for the course
   * @returns {boolean} True if giver gives stroke to receiver on this hole
   */
  _playerGivesStrokeToOpponent(giver, receiver, holeNumber, strokeIndexes) {
    const strokesGiven = giver.voorGiven?.[receiver.id] || 0;
    if (strokesGiven === 0) return false;

    // Get holes where giver gives strokes to receiver
    const strokeHoles = getStrokeHoles(strokesGiven, strokeIndexes);
    return strokeHoles.includes(holeNumber);
  }

  /**
   * Calculate points for winning based on score vs par
   * @private
   * @param {number} scoreDiff - Difference from par
   * @param {number} opponentScoreDiff - Opponent's difference from par
   * @param {Object} scoringConfig - Scoring configuration
   * @returns {number} Points won
   */
  _calculatePointsForWin(scoreDiff, opponentScoreDiff, scoringConfig) {
    // Eagle or better (≤ -2)
    if (scoreDiff <= -2) {
      return scoringConfig.eagleOrBetter.againstLower;
    }

    // Birdie (-1)
    if (scoreDiff === -1) {
      return scoringConfig.birdie.againstLower;
    }

    // Par (0)
    if (scoreDiff === 0) {
      return scoringConfig.par.againstLower;
    }

    // Bogey (+1)
    if (scoreDiff === 1) {
      return scoringConfig.bogey.againstLower;
    }

    // Double bogey or worse - no points
    return 0;
  }

  /**
   * Calculate points for winning on voor hole tie-break
   * Special rule: Double bogey or worse gets 0 points on voor hole ties
   * @private
   * @param {number} scoreDiff - Difference from par
   * @param {number} opponentScoreDiff - Opponent's difference from par
   * @param {Object} scoringConfig - Scoring configuration
   * @returns {number} Points won (0 for double bogey or worse, otherwise normal points)
   */
  _calculatePointsForVoorTieWin(scoreDiff, opponentScoreDiff, scoringConfig) {
    if (scoreDiff >= 2) {
      // Double bogey or worse - gets 0 points on voor hole ties
      return 0;
    }
    // Use normal point calculation for other scores
    return this._calculatePointsForWin(scoreDiff, opponentScoreDiff, scoringConfig);
  }

  /**
   * Calculate points between two players based on their net scores
   * Points are awarded based on GROSS score vs par, not net score vs par
   * @private
   * @param {number} playerNetScore - Player's net score
   * @param {number} opponentNetScore - Opponent's net score
   * @param {number} playerGrossScore - Player's gross score
   * @param {number} opponentGrossScore - Opponent's gross score
   * @param {number} par - Par for the hole
   * @param {boolean} playerGivesStrokeToOpponent - Whether player gives stroke to opponent on this hole
   * @param {boolean} opponentGivesStrokeToPlayer - Whether opponent gives stroke to player on this hole
   * @param {Object} scoringConfig - Scoring configuration
   * @returns {number} Points (positive = player wins, negative = player loses, 0 = tie)
   */
  _calculatePointsBetweenPlayers(
    playerNetScore,
    opponentNetScore,
    playerGrossScore,
    opponentGrossScore,
    par,
    playerGivesStrokeToOpponent,
    opponentGivesStrokeToPlayer,
    scoringConfig
  ) {
    // Calculate gross score differences from par (for point calculation)
    const playerGrossDiff = calculateScoreDiff(playerGrossScore, par);
    const opponentGrossDiff = calculateScoreDiff(opponentGrossScore, par);

    // Handle ties with voor (stroke receiver wins)
    if (playerNetScore === opponentNetScore) {
      if (opponentGivesStrokeToPlayer && !playerGivesStrokeToOpponent) {
        // Player receives stroke from opponent, player wins tie
        // Points based on player's GROSS score vs par (special rule for voor ties)
        return this._calculatePointsForVoorTieWin(playerGrossDiff, opponentGrossDiff, scoringConfig);
      } else if (playerGivesStrokeToOpponent && !opponentGivesStrokeToPlayer) {
        // Opponent receives stroke from player, opponent wins tie
        // Points based on opponent's GROSS score vs par (special rule for voor ties)
        return -this._calculatePointsForVoorTieWin(opponentGrossDiff, playerGrossDiff, scoringConfig);
      }
      // Both give strokes to each other (shouldn't happen) or neither gives = true tie
      return 0;
    }

    // Player did better (lower net score wins)
    if (playerNetScore < opponentNetScore) {
      // Points based on player's GROSS score vs par
      return this._calculatePointsForWin(playerGrossDiff, opponentGrossDiff, scoringConfig);
    }

    // Player did worse
    if (playerNetScore > opponentNetScore) {
      // Points based on opponent's GROSS score vs par
      return -this._calculatePointsForWin(opponentGrossDiff, playerGrossDiff, scoringConfig);
    }

    return 0;
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

    // Calculate points for each player against all opponents
    players.forEach(player => {
      let playerTotalPoints = 0;
      const playerNetScore = netScores[player.id];
      const playerGrossScore = hole.scores[player.id];

      // Compare against each opponent
      players.forEach(opponent => {
        if (player.id === opponent.id) return; // Skip self

        const opponentNetScore = netScores[opponent.id];
        const opponentGrossScore = hole.scores[opponent.id];

        // Check if players give strokes TO EACH OTHER on this hole
        const playerGivesStroke = this._playerGivesStrokeToOpponent(
          player,
          opponent,
          hole.number,
          strokeIndexes
        );
        const opponentGivesStroke = this._playerGivesStrokeToOpponent(
          opponent,
          player,
          hole.number,
          strokeIndexes
        );

        const pointsVsOpponent = this._calculatePointsBetweenPlayers(
          playerNetScore,
          opponentNetScore,
          playerGrossScore,
          opponentGrossScore,
          hole.par,
          playerGivesStroke,
          opponentGivesStroke,
          scoringConfig
        );

        playerTotalPoints += pointsVsOpponent;
      });

      points[player.id] = playerTotalPoints;
    });

    return points;
  }

  /**
   * Calculate transaction matrix (points exchanged between players)
   * @param {import('../../../types').Game} game - Game object
   * @param {Object.<string, number[]>} strokeHolesMap - Map of playerId to stroke holes
   * @returns {Object.<string, Object.<string, number>>} Matrix of player1 -> player2 -> net points
   */
  calculateTransactionMatrix(game, strokeHolesMap) {
    const matrix = {};
    const strokeIndexes = game.holes.map(h => h.strokeIndex);

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

      game.players.forEach(player => {
        const playerNetScore = netScores[player.id];
        const playerGrossScore = hole.scores[player.id];

        game.players.forEach(opponent => {
          if (player.id === opponent.id) return;

          const opponentNetScore = netScores[opponent.id];
          const opponentGrossScore = hole.scores[opponent.id];

          // Check if players give strokes TO EACH OTHER on this hole
          const playerGivesStroke = this._playerGivesStrokeToOpponent(
            player,
            opponent,
            hole.number,
            strokeIndexes
          );
          const opponentGivesStroke = this._playerGivesStrokeToOpponent(
            opponent,
            player,
            hole.number,
            strokeIndexes
          );

          const pointsVsOpponent = this._calculatePointsBetweenPlayers(
            playerNetScore,
            opponentNetScore,
            playerGrossScore,
            opponentGrossScore,
            hole.par,
            playerGivesStroke,
            opponentGivesStroke,
            game.scoringConfig
          );

          matrix[player.id][opponent.id] += pointsVsOpponent;
        });
      });
    });

    return matrix;
  }

  /**
   * Validate scoring configuration for Fighter system
   * @param {Object} config - Scoring configuration to validate
   * @returns {{isValid: boolean, errors: string[]}} Validation result
   */
  validateConfig(config) {
    return validateFighterConfig(config);
  }

  /**
   * Get default configuration for Fighter system
   * @returns {Object} Default scoring configuration
   */
  getDefaultConfig() {
    return JSON.parse(JSON.stringify(DEFAULT_FIGHTER_CONFIG));
  }
}

// Export singleton instance
export const fighterScoring = new FighterScoring();

// Legacy exports for backward compatibility
export const calculateHolePoints = (...args) => fighterScoring.calculateHolePoints(...args);
export const calculateGameTotals = (...args) => fighterScoring.calculateGameTotals(...args);
export const calculateAllPoints = (...args) => fighterScoring.calculateAllPoints(...args);
export const getLeaderboard = (...args) => fighterScoring.getLeaderboard(...args);
export const calculateTransactionMatrix = (...args) => fighterScoring.calculateTransactionMatrix(...args);
export const getPlayerStats = (...args) => fighterScoring.getPlayerStats(...args);
export const getAllPlayerStats = (...args) => fighterScoring.getAllPlayerStats(...args);
