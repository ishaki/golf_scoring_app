/**
 * Shared Scoring Utilities
 * Common functions used across different scoring systems
 */

// Score difference constants
export const SCORE_DIFF = {
  EAGLE_OR_BETTER: -2,
  BIRDIE: -1,
  PAR: 0,
  BOGEY: 1,
  DOUBLE_BOGEY_OR_WORSE: 2,
};

/**
 * Calculate score difference from par
 * @param {number} score - Gross or net score
 * @param {number} par - Par for the hole
 * @returns {number} Difference from par (negative = under par, positive = over par)
 */
export function calculateScoreDiff(score, par) {
  return score - par;
}

/**
 * Get score category based on difference from par
 * @param {number} scoreDiff - Difference from par
 * @returns {string} Score category: 'eagle', 'birdie', 'par', 'bogey', or 'worse'
 */
export function getScoreCategory(scoreDiff) {
  if (scoreDiff <= SCORE_DIFF.EAGLE_OR_BETTER) return 'eagle';
  if (scoreDiff === SCORE_DIFF.BIRDIE) return 'birdie';
  if (scoreDiff === SCORE_DIFF.PAR) return 'par';
  if (scoreDiff === SCORE_DIFF.BOGEY) return 'bogey';
  return 'worse';
}

/**
 * Find player(s) with the lowest net score on a hole
 * @param {Object.<string, number>} netScores - Map of playerId to net score
 * @returns {{lowestScore: number, playerIds: string[]}} Lowest score and array of player IDs with that score
 */
export function findLowestScorePlayers(netScores) {
  let lowestScore = Infinity;
  const playerIds = [];

  Object.entries(netScores).forEach(([playerId, netScore]) => {
    if (netScore < lowestScore) {
      lowestScore = netScore;
      playerIds.length = 0; // Clear array
      playerIds.push(playerId);
    } else if (netScore === lowestScore) {
      playerIds.push(playerId);
    }
  });

  return { lowestScore, playerIds };
}

/**
 * Check if there is a tie (multiple players with the same score)
 * @param {string[]} playerIds - Array of player IDs with lowest score
 * @returns {boolean} True if there's a tie, false otherwise
 */
export function isTie(playerIds) {
  return playerIds.length > 1;
}

/**
 * Check if all players have entered their scores for a hole
 * @param {Object.<string, number>} scores - Map of playerId to score
 * @param {import('../../types').Player[]} players - Array of all players
 * @returns {boolean} True if all scores are entered, false otherwise
 */
export function areAllScoresEntered(scores, players) {
  const scoresEntered = Object.keys(scores).filter(
    playerId => scores[playerId] !== undefined && scores[playerId] !== null
  ).length;

  return scoresEntered === players.length;
}

/**
 * Initialize points map with 0 for all players
 * @param {import('../../types').Player[]} players - Array of players
 * @returns {Object.<string, number>} Map of playerId to 0 points
 */
export function initializePoints(players) {
  const points = {};
  players.forEach(player => {
    points[player.id] = 0;
  });
  return points;
}

/**
 * Validate that a score is a valid number
 * @param {*} score - Score to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidScore(score) {
  return typeof score === 'number' && !isNaN(score) && score > 0;
}

/**
 * Compare two players' net scores
 * @param {number} score1 - First player's net score
 * @param {number} score2 - Second player's net score
 * @returns {number} -1 if score1 wins, 1 if score2 wins, 0 if tie
 */
export function compareScores(score1, score2) {
  if (score1 < score2) return -1;
  if (score1 > score2) return 1;
  return 0;
}

/**
 * Calculate absolute value of score difference
 * @param {number} score1 - First score
 * @param {number} score2 - Second score
 * @returns {number} Absolute difference
 */
export function getScoreMargin(score1, score2) {
  return Math.abs(score1 - score2);
}

/**
 * Format points for display
 * @param {number} points - Points value
 * @returns {string} Formatted points string (e.g., "+4", "-2", "0")
 */
export function formatPoints(points) {
  if (points > 0) return `+${points}`;
  if (points < 0) return `${points}`;
  return '0';
}

/**
 * Calculate percentage of holes won
 * @param {number} holesWon - Number of holes won
 * @param {number} totalHoles - Total number of holes played
 * @returns {number} Percentage (0-100)
 */
export function calculateWinPercentage(holesWon, totalHoles) {
  if (totalHoles === 0) return 0;
  return Math.round((holesWon / totalHoles) * 100);
}

/**
 * Get descriptive text for a score difference
 * @param {number} scoreDiff - Difference from par
 * @returns {string} Description (e.g., "Eagle", "Birdie", "Par")
 */
export function getScoreDiffDescription(scoreDiff) {
  if (scoreDiff <= -3) return 'Albatross or better';
  if (scoreDiff === -2) return 'Eagle';
  if (scoreDiff === -1) return 'Birdie';
  if (scoreDiff === 0) return 'Par';
  if (scoreDiff === 1) return 'Bogey';
  if (scoreDiff === 2) return 'Double Bogey';
  if (scoreDiff === 3) return 'Triple Bogey';
  return `${scoreDiff > 0 ? '+' : ''}${scoreDiff}`;
}

/**
 * Sort players by net score (ascending)
 * @param {Object.<string, number>} netScores - Map of playerId to net score
 * @returns {Array<{playerId: string, netScore: number}>} Sorted array
 */
export function sortPlayersByNetScore(netScores) {
  return Object.entries(netScores)
    .map(([playerId, netScore]) => ({ playerId, netScore }))
    .sort((a, b) => a.netScore - b.netScore);
}
