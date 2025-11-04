/**
 * Abstract Base Class for Golf Scoring Systems
 *
 * This class defines the interface that all scoring systems must implement.
 * Each scoring system should extend this class and implement its abstract methods.
 *
 * @abstract
 */
export class BaseScoringSystem {
  /**
   * Creates a new scoring system instance
   * @param {string} systemName - Name of the scoring system
   * @param {string} description - Description of how the system works
   */
  constructor(systemName, description) {
    if (new.target === BaseScoringSystem) {
      throw new Error('BaseScoringSystem is abstract and cannot be instantiated directly');
    }

    this.systemName = systemName;
    this.description = description;
  }

  /**
   * Calculate points for all players on a single hole
   * @abstract
   * @param {import('../../types').Hole} hole - Hole object with scores
   * @param {import('../../types').Player[]} players - Array of players
   * @param {Object.<string, number[]>} strokeHolesMap - Map of playerId to stroke holes
   * @param {number[]} strokeIndexes - Stroke indexes for the course
   * @param {Object} scoringConfig - Scoring configuration (format depends on system)
   * @returns {Object.<string, number>} Map of playerId to points earned
   */
  calculateHolePoints(hole, players, strokeHolesMap, strokeIndexes, scoringConfig) {
    throw new Error('calculateHolePoints() must be implemented by subclass');
  }

  /**
   * Calculate cumulative points for all players across all holes
   * @param {import('../../types').Hole[]} holes - Array of holes
   * @param {import('../../types').Player[]} players - Array of players
   * @returns {Object.<string, number>} Map of playerId to total points
   */
  calculateGameTotals(holes, players) {
    const totals = {};

    // Initialize all players with 0
    players.forEach(player => {
      totals[player.id] = 0;
    });

    // Sum points from all holes
    holes.forEach(hole => {
      Object.entries(hole.points || {}).forEach(([playerId, points]) => {
        totals[playerId] = (totals[playerId] || 0) + points;
      });
    });

    return totals;
  }

  /**
   * Calculate points for entire game (all holes)
   * @param {import('../../types').Game} game - Game object
   * @param {Object.<string, number[]>} strokeHolesMap - Map of playerId to stroke holes
   * @returns {import('../../types').Game} Updated game with calculated points
   */
  calculateAllPoints(game, strokeHolesMap) {
    const strokeIndexes = game.holes.map(h => h.strokeIndex);

    const updatedHoles = game.holes.map(hole => {
      const points = this.calculateHolePoints(
        hole,
        game.players,
        strokeHolesMap,
        strokeIndexes,
        game.scoringConfig
      );

      // Import calculateAllNetScores from voor utility
      const { calculateAllNetScores } = require('../voor');
      const netScores = calculateAllNetScores(hole, game.players, strokeHolesMap);

      return {
        ...hole,
        netScores,
        points,
      };
    });

    const totals = this.calculateGameTotals(updatedHoles, game.players);

    return {
      ...game,
      holes: updatedHoles,
      totals,
    };
  }

  /**
   * Get leaderboard sorted by points
   * @param {import('../../types').Game} game - Game object
   * @returns {Array<{playerId: string, name: string, points: number, rank: number}>} Sorted leaderboard
   */
  getLeaderboard(game) {
    const leaderboard = game.players.map(player => ({
      playerId: player.id,
      name: player.name,
      points: game.totals[player.id] || 0,
    }));

    // Sort by points (descending)
    leaderboard.sort((a, b) => b.points - a.points);

    // Assign ranks with tie handling
    let currentRank = 1;
    leaderboard.forEach((entry, index) => {
      if (index > 0 && entry.points < leaderboard[index - 1].points) {
        currentRank = index + 1;
      }
      entry.rank = currentRank;
    });

    return leaderboard;
  }

  /**
   * Calculate transaction matrix (points exchanged between players)
   * @abstract
   * @param {import('../../types').Game} game - Game object
   * @param {Object.<string, number[]>} strokeHolesMap - Map of playerId to stroke holes
   * @returns {Object.<string, Object.<string, number>>} Matrix of player1 -> player2 -> net points
   */
  calculateTransactionMatrix(game, strokeHolesMap) {
    throw new Error('calculateTransactionMatrix() must be implemented by subclass');
  }

  /**
   * Get player statistics
   * @param {import('../../types').Game} game - Game object
   * @param {string} playerId - Player ID
   * @param {Object.<string, number[]>} strokeHolesMap - Map of playerId to stroke holes
   * @returns {Object} Player statistics
   */
  getPlayerStats(game, playerId, strokeHolesMap) {
    let eagles = 0;
    let birdies = 0;
    let pars = 0;
    let bogeys = 0;
    let worse = 0;
    let bestHole = { number: 0, points: -Infinity };
    let worstHole = { number: 0, points: Infinity };
    let holesWon = 0;

    game.holes.forEach(hole => {
      const grossScore = hole.scores[playerId];
      const points = hole.points[playerId] || 0;

      if (grossScore !== undefined && grossScore !== null) {
        const diff = grossScore - hole.par;

        if (diff <= -2) eagles++;
        else if (diff === -1) birdies++;
        else if (diff === 0) pars++;
        else if (diff === 1) bogeys++;
        else worse++;

        if (points > bestHole.points) {
          bestHole = { number: hole.number, points };
        }
        if (points < worstHole.points) {
          worstHole = { number: hole.number, points };
        }

        // Count holes won (points > 0)
        if (points > 0) {
          holesWon++;
        }
      }
    });

    return {
      eagles,
      birdies,
      pars,
      bogeys,
      worse,
      bestHole,
      worstHole,
      totalPoints: game.totals[playerId] || 0,
      holesWon,
    };
  }

  /**
   * Get all player statistics
   * @param {import('../../types').Game} game - Game object
   * @param {Object.<string, number[]>} strokeHolesMap - Map of playerId to stroke holes
   * @returns {Object.<string, Object>} Map of playerId to stats
   */
  getAllPlayerStats(game, strokeHolesMap) {
    const allStats = {};

    game.players.forEach(player => {
      allStats[player.id] = this.getPlayerStats(game, player.id, strokeHolesMap);
    });

    return allStats;
  }

  /**
   * Validate scoring configuration for this system
   * @abstract
   * @param {Object} config - Scoring configuration to validate
   * @returns {{isValid: boolean, errors: string[]}} Validation result
   */
  validateConfig(config) {
    throw new Error('validateConfig() must be implemented by subclass');
  }

  /**
   * Get default configuration for this scoring system
   * @abstract
   * @returns {Object} Default scoring configuration
   */
  getDefaultConfig() {
    throw new Error('getDefaultConfig() must be implemented by subclass');
  }

  /**
   * Get the name of this scoring system
   * @returns {string} System name
   */
  getName() {
    return this.systemName;
  }

  /**
   * Get the description of this scoring system
   * @returns {string} System description
   */
  getDescription() {
    return this.description;
  }
}
