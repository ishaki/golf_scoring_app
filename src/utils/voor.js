/**
 * Voor (handicap stroke) calculation utilities
 */

import { getStrokeHoles } from './courseConfig';

/**
 * Calculate which holes each player receives strokes on
 * @param {import('../types').Player[]} players - Array of players
 * @param {number[]} strokeIndexes - Stroke index array for the course
 * @returns {Object.<string, number[]>} Map of playerId to array of hole numbers where they get strokes
 */
export function calculateAllStrokeHoles(players, strokeIndexes) {
  const strokeHolesMap = {};

  // First, calculate how many strokes each player receives
  const voorReceived = calculateVoorReceived(players);

  // Then calculate which holes they get strokes on
  players.forEach(player => {
    const strokes = voorReceived[player.id] || 0;
    strokeHolesMap[player.id] = getStrokeHoles(strokes, strokeIndexes);
  });

  return strokeHolesMap;
}

/**
 * Calculate how many strokes each player receives (from all other players)
 * @param {import('../types').Player[]} players - Array of players
 * @returns {Object.<string, number>} Map of playerId to total strokes received
 */
export function calculateVoorReceived(players) {
  const voorReceived = {};

  // Initialize all players with 0
  players.forEach(player => {
    voorReceived[player.id] = 0;
  });

  // Calculate strokes received
  players.forEach(giver => {
    Object.entries(giver.voorGiven || {}).forEach(([receiverId, strokes]) => {
      if (strokes > 0) {
        voorReceived[receiverId] = (voorReceived[receiverId] || 0) + strokes;
      }
    });
  });

  return voorReceived;
}

/**
 * Build voor matrix showing all giving relationships
 * @param {import('../types').Player[]} players - Array of players
 * @returns {Object.<string, Object.<string, number>>} Matrix of player1 -> player2 -> strokes
 */
export function buildVoorMatrix(players) {
  const matrix = {};

  players.forEach(player => {
    matrix[player.id] = player.voorGiven || {};
  });

  return matrix;
}

/**
 * Check if a player gets a stroke on a specific hole
 * @param {string} playerId - Player ID
 * @param {number} holeNumber - Hole number (1-18)
 * @param {Object.<string, number[]>} strokeHolesMap - Map of playerId to stroke holes
 * @returns {boolean} True if player gets stroke on this hole
 */
export function playerGetsStrokeOnHole(playerId, holeNumber, strokeHolesMap) {
  const playerStrokeHoles = strokeHolesMap[playerId] || [];
  return playerStrokeHoles.includes(holeNumber);
}

/**
 * Calculate net score for a player on a hole
 * @param {number} grossScore - Gross score
 * @param {boolean} hasStroke - Whether player gets stroke on this hole
 * @returns {number} Net score
 */
export function calculateNetScore(grossScore, hasStroke) {
  return hasStroke ? grossScore - 1 : grossScore;
}

/**
 * Calculate all net scores for a hole
 * @param {import('../types').Hole} hole - Hole object
 * @param {import('../types').Player[]} players - Array of players
 * @param {Object.<string, number[]>} strokeHolesMap - Map of playerId to stroke holes
 * @returns {Object.<string, number>} Map of playerId to net score
 */
export function calculateAllNetScores(hole, players, strokeHolesMap) {
  const netScores = {};

  players.forEach(player => {
    const grossScore = hole.scores[player.id];

    if (grossScore === undefined || grossScore === null) {
      return; // Skip if no score entered
    }

    const hasStroke = playerGetsStrokeOnHole(player.id, hole.number, strokeHolesMap);
    netScores[player.id] = calculateNetScore(grossScore, hasStroke);
  });

  return netScores;
}

/**
 * Update players with their stroke holes
 * @param {import('../types').Player[]} players - Array of players
 * @param {number[]} strokeIndexes - Stroke index array
 * @returns {import('../types').Player[]} Updated players with strokeHoles property
 */
export function assignStrokeHolesToPlayers(players, strokeIndexes) {
  const voorReceived = calculateVoorReceived(players);

  return players.map(player => ({
    ...player,
    strokeHoles: getStrokeHoles(voorReceived[player.id] || 0, strokeIndexes),
  }));
}

/**
 * Get summary of voor allocations
 * @param {import('../types').Player[]} players - Array of players
 * @returns {Array<{giver: string, receiver: string, strokes: number}>} Array of voor allocations
 */
export function getVoorSummary(players) {
  const allocations = [];

  players.forEach(giver => {
    Object.entries(giver.voorGiven || {}).forEach(([receiverId, strokes]) => {
      if (strokes > 0) {
        const receiver = players.find(p => p.id === receiverId);
        allocations.push({
          giver: giver.name,
          receiver: receiver?.name || 'Unknown',
          strokes,
        });
      }
    });
  });

  return allocations;
}

/**
 * Validate voor configuration
 * @param {import('../types').Player[]} players - Array of players
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateVoorConfiguration(players) {
  const errors = [];

  // Check for reciprocal giving
  players.forEach((player1, i) => {
    players.forEach((player2, j) => {
      if (i >= j) return; // Skip same player and already checked pairs

      const player1GivesTo2 = (player1.voorGiven?.[player2.id] || 0) > 0;
      const player2GivesTo1 = (player2.voorGiven?.[player1.id] || 0) > 0;

      if (player1GivesTo2 && player2GivesTo1) {
        errors.push(
          `Reciprocal voor: ${player1.name} and ${player2.name} are giving strokes to each other`
        );
      }
    });
  });

  // Check for valid stroke amounts
  players.forEach(player => {
    Object.entries(player.voorGiven || {}).forEach(([receiverId, strokes]) => {
      if (strokes < 0 || strokes > 18) {
        const receiver = players.find(p => p.id === receiverId);
        errors.push(
          `Invalid strokes: ${player.name} gives ${strokes} to ${receiver?.name} (must be 0-18)`
        );
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
