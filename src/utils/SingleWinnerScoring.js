/**
 * Single Winner Scoring System - Points calculation utilities for golf scoring system
 * This system awards points to the player with the lowest score on each hole
 * Points are based on the scoring configuration
 */

import { calculateAllNetScores, playerGetsStrokeOnHole } from './voor';
import { getStrokeHoles } from './courseConfig';

/**
 * Calculate score difference from par
 * @param {number} score - Net score
 * @param {number} par - Par for the hole
 * @returns {number} Difference from par (negative = under par, positive = over par)
 */
function getScoreDiff(score, par) {
  return score - par;
}

/**
 * Calculate points for winning based on score vs par using configurable scoring
 * @param {number} scoreDiff - Difference from par
 * @param {import('../types').ScoringConfiguration} scoringConfig - Scoring configuration
 * @returns {number} Points won based on configuration
 */
function calculatePointsForWin(scoreDiff, scoringConfig) {
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
 * Calculate points for all players on a hole
 * Single Winner System: Only the player with the lowest score gets points
 * @param {import('../types').Hole} hole - Hole object with scores
 * @param {import('../types').Player[]} players - Array of players
 * @param {Object.<string, number[]>} strokeHolesMap - Map of playerId to stroke holes
 * @param {number[]} strokeIndexes - Stroke indexes for the course
 * @param {import('../types').ScoringConfiguration} scoringConfig - Scoring configuration
 * @returns {Object.<string, number>} Map of playerId to points earned
 */
export function calculateHolePoints(hole, players, strokeHolesMap, strokeIndexes, scoringConfig) {
  const points = {};
  const netScores = calculateAllNetScores(hole, players, strokeHolesMap);

  // Initialize all players with 0 points
  players.forEach(player => {
    points[player.id] = 0;
  });

  // Skip if not all scores are entered
  const scoresEntered = Object.keys(netScores).length;
  if (scoresEntered !== players.length) {
    return points;
  }

  // Find the lowest net score
  let lowestScore = Infinity;
  let winnerId = null;

  players.forEach(player => {
    const netScore = netScores[player.id];
    if (netScore < lowestScore) {
      lowestScore = netScore;
      winnerId = player.id;
    }
  });

  // Award points to the winner based on their gross score vs par
  if (winnerId) {
    const winnerGrossScore = hole.scores[winnerId];
    const scoreDiff = getScoreDiff(winnerGrossScore, hole.par);
    points[winnerId] = calculatePointsForWin(scoreDiff, scoringConfig);
  }

  return points;
}

/**
 * Calculate cumulative points for all players across all holes
 * @param {import('../types').Hole[]} holes - Array of holes
 * @param {import('../types').Player[]} players - Array of players
 * @returns {Object.<string, number>} Map of playerId to total points
 */
export function calculateGameTotals(holes, players) {
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
 * @param {import('../types').Game} game - Game object
 * @param {Object.<string, number[]>} strokeHolesMap - Map of playerId to stroke holes
 * @returns {import('../types').Game} Updated game with calculated points
 */
export function calculateAllPoints(game, strokeHolesMap) {
  const strokeIndexes = game.holes.map(h => h.strokeIndex);

  const updatedHoles = game.holes.map(hole => {
    const points = calculateHolePoints(hole, game.players, strokeHolesMap, strokeIndexes, game.scoringConfig);
    const netScores = calculateAllNetScores(hole, game.players, strokeHolesMap);

    return {
      ...hole,
      netScores,
      points,
    };
  });

  const totals = calculateGameTotals(updatedHoles, game.players);

  return {
    ...game,
    holes: updatedHoles,
    totals,
  };
}

/**
 * Get leaderboard sorted by points
 * @param {import('../types').Game} game - Game object
 * @returns {Array<{playerId: string, name: string, points: number, rank: number}>} Sorted leaderboard
 */
export function getLeaderboard(game) {
  const leaderboard = game.players.map(player => ({
    playerId: player.id,
    name: player.name,
    points: game.totals[player.id] || 0,
  }));

  // Sort by points (descending)
  leaderboard.sort((a, b) => b.points - a.points);

  // Assign ranks
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
 * For Single Winner system, this shows how many holes each player won
 * @param {import('../types').Game} game - Game object
 * @param {Object.<string, number[]>} strokeHolesMap - Map of playerId to stroke holes
 * @returns {Object.<string, Object.<string, number>>} Matrix of player1 -> player2 -> net points
 */
export function calculateTransactionMatrix(game, strokeHolesMap) {
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
    if (Object.keys(netScores).length !== game.players.length) {
      return;
    }

    // Find winner
    let lowestScore = Infinity;
    let winnerId = null;

    game.players.forEach(player => {
      const netScore = netScores[player.id];
      if (netScore < lowestScore) {
        lowestScore = netScore;
        winnerId = player.id;
      }
    });

    // Award points to winner against all other players
    if (winnerId) {
      const winnerGrossScore = hole.scores[winnerId];
      const scoreDiff = getScoreDiff(winnerGrossScore, hole.par);
      const pointsWon = calculatePointsForWin(scoreDiff, game.scoringConfig);

      game.players.forEach(player => {
        if (player.id !== winnerId) {
          matrix[winnerId][player.id] += pointsWon;
          matrix[player.id][winnerId] -= pointsWon;
        }
      });
    }
  });

  return matrix;
}

/**
 * Get player statistics
 * @param {import('../types').Game} game - Game object
 * @param {string} playerId - Player ID
 * @param {Object.<string, number[]>} strokeHolesMap - Map of playerId to stroke holes
 * @returns {Object} Player statistics
 */
export function getPlayerStats(game, playerId, strokeHolesMap) {
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
 * @param {import('../types').Game} game - Game object
 * @param {Object.<string, number[]>} strokeHolesMap - Map of playerId to stroke holes
 * @returns {Object.<string, Object>} Map of playerId to stats
 */
export function getAllPlayerStats(game, strokeHolesMap) {
  const allStats = {};

  game.players.forEach(player => {
    allStats[player.id] = getPlayerStats(game, player.id, strokeHolesMap);
  });

  return allStats;
}
