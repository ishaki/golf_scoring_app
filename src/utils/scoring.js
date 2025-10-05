/**
 * Points calculation utilities for golf scoring system
 */

import { calculateAllNetScores, playerGetsStrokeOnHole } from './voor';

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
 * Calculate points between two players based on their net scores
 * @param {number} playerScore - Player's net score
 * @param {number} opponentScore - Opponent's net score
 * @param {number} par - Par for the hole
 * @param {boolean} playerHasStroke - Whether player gets stroke on this hole
 * @param {boolean} opponentHasStroke - Whether opponent gets stroke on this hole
 * @returns {number} Points (positive = player wins, negative = player loses, 0 = tie)
 */
function calculatePointsBetweenPlayers(
  playerScore,
  opponentScore,
  par,
  playerHasStroke,
  opponentHasStroke
) {
  const playerDiff = getScoreDiff(playerScore, par);
  const opponentDiff = getScoreDiff(opponentScore, par);

  // Handle ties with voor (stroke receiver wins)
  if (playerScore === opponentScore) {
    if (playerHasStroke && !opponentHasStroke) {
      // Player gets stroke, treat as if player beat opponent
      return calculatePointsForWin(playerDiff);
    } else if (opponentHasStroke && !playerHasStroke) {
      // Opponent gets stroke, treat as if player lost
      return -calculatePointsForWin(opponentDiff);
    }
    // Both get stroke or neither gets stroke = true tie
    return 0;
  }

  // Player did better
  if (playerScore < opponentScore) {
    return calculatePointsForWin(playerDiff);
  }

  // Player did worse
  if (playerScore > opponentScore) {
    return -calculatePointsForWin(opponentDiff);
  }

  return 0;
}

/**
 * Calculate points for winning based on score vs par
 * V2.1: Updated to support eagle tier
 * @param {number} scoreDiff - Difference from par
 * @returns {number} Points won (4 for eagle+, 2 for birdie, 1 for par/bogey/worse)
 */
function calculatePointsForWin(scoreDiff) {
  if (scoreDiff <= -2) {
    // Eagle or better
    return 4;
  }
  if (scoreDiff === -1) {
    // Birdie
    return 2;
  }
  // Par, bogey, or worse
  return 1;
}

/**
 * Calculate points for all players on a hole
 * @param {import('../types').Hole} hole - Hole object with scores
 * @param {import('../types').Player[]} players - Array of players
 * @param {Object.<string, number[]>} strokeHolesMap - Map of playerId to stroke holes
 * @returns {Object.<string, number>} Map of playerId to points earned
 */
export function calculateHolePoints(hole, players, strokeHolesMap) {
  const points = {};
  const netScores = calculateAllNetScores(hole, players, strokeHolesMap);

  // Skip if not all scores are entered
  const scoresEntered = Object.keys(netScores).length;
  if (scoresEntered !== players.length) {
    // Return 0 points for all players
    players.forEach(player => {
      points[player.id] = 0;
    });
    return points;
  }

  // Calculate points for each player against all opponents
  players.forEach(player => {
    let playerTotalPoints = 0;
    const playerNetScore = netScores[player.id];
    const playerHasStroke = playerGetsStrokeOnHole(player.id, hole.number, strokeHolesMap);

    // Compare against each opponent
    players.forEach(opponent => {
      if (player.id === opponent.id) return; // Skip self

      const opponentNetScore = netScores[opponent.id];
      const opponentHasStroke = playerGetsStrokeOnHole(opponent.id, hole.number, strokeHolesMap);

      const pointsVsOpponent = calculatePointsBetweenPlayers(
        playerNetScore,
        opponentNetScore,
        hole.par,
        playerHasStroke,
        opponentHasStroke
      );

      playerTotalPoints += pointsVsOpponent;
    });

    points[player.id] = playerTotalPoints;
  });

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
  const updatedHoles = game.holes.map(hole => {
    const points = calculateHolePoints(hole, game.players, strokeHolesMap);
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

    game.players.forEach(player => {
      const playerNetScore = netScores[player.id];
      const playerHasStroke = playerGetsStrokeOnHole(player.id, hole.number, strokeHolesMap);

      game.players.forEach(opponent => {
        if (player.id === opponent.id) return;

        const opponentNetScore = netScores[opponent.id];
        const opponentHasStroke = playerGetsStrokeOnHole(
          opponent.id,
          hole.number,
          strokeHolesMap
        );

        const points = calculatePointsBetweenPlayers(
          playerNetScore,
          opponentNetScore,
          hole.par,
          playerHasStroke,
          opponentHasStroke
        );

        matrix[player.id][opponent.id] += points;
      });
    });
  });

  return matrix;
}

/**
 * Get player statistics
 * V2.1: Updated to track eagles separately
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
