/**
 * Points calculation utilities for golf scoring system
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
 * Check if giver gives a stroke to receiver on a specific hole
 * @param {import('../types').Player} giver - Player who potentially gives stroke
 * @param {import('../types').Player} receiver - Player who potentially receives stroke
 * @param {number} holeNumber - Hole number
 * @param {number[]} strokeIndexes - Stroke indexes for the course
 * @returns {boolean} True if giver gives stroke to receiver on this hole
 */
function playerGivesStrokeToOpponent(giver, receiver, holeNumber, strokeIndexes) {
  const strokesGiven = giver.voorGiven?.[receiver.id] || 0;
  if (strokesGiven === 0) return false;

  // Get holes where giver gives strokes to receiver
  const strokeHoles = getStrokeHoles(strokesGiven, strokeIndexes);
  return strokeHoles.includes(holeNumber);
}

/**
 * Calculate points between two players based on their net scores
 * Points are awarded based on GROSS score vs par, not net score vs par
 * @param {number} playerNetScore - Player's net score
 * @param {number} opponentNetScore - Opponent's net score
 * @param {number} playerGrossScore - Player's gross score
 * @param {number} opponentGrossScore - Opponent's gross score
 * @param {number} par - Par for the hole
 * @param {boolean} playerGivesStrokeToOpponent - Whether player gives stroke to opponent on this hole
 * @param {boolean} opponentGivesStrokeToPlayer - Whether opponent gives stroke to player on this hole
 * @param {import('../types').ScoringConfiguration} scoringConfig - Scoring configuration
 * @returns {number} Points (positive = player wins, negative = player loses, 0 = tie)
 */
function calculatePointsBetweenPlayers(
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
  const playerGrossDiff = getScoreDiff(playerGrossScore, par);
  const opponentGrossDiff = getScoreDiff(opponentGrossScore, par);

  // Handle ties with voor (stroke receiver wins)
  if (playerNetScore === opponentNetScore) {
    if (opponentGivesStrokeToPlayer && !playerGivesStrokeToOpponent) {
      // Player receives stroke from opponent, player wins tie
      // Points based on player's GROSS score vs par (special rule for voor ties)
      return calculatePointsForVoorTieWin(playerGrossDiff, opponentGrossDiff, scoringConfig);
    } else if (playerGivesStrokeToOpponent && !opponentGivesStrokeToPlayer) {
      // Opponent receives stroke from player, opponent wins tie
      // Points based on opponent's GROSS score vs par (special rule for voor ties)
      return -calculatePointsForVoorTieWin(opponentGrossDiff, playerGrossDiff, scoringConfig);
    }
    // Both give strokes to each other (shouldn't happen) or neither gives = true tie
    return 0;
  }

  // Player did better (lower net score wins)
  if (playerNetScore < opponentNetScore) {
    // Points based on player's GROSS score vs par
    return calculatePointsForWin(playerGrossDiff, opponentGrossDiff, scoringConfig);
  }

  // Player did worse
  if (playerNetScore > opponentNetScore) {
    // Points based on opponent's GROSS score vs par
    return -calculatePointsForWin(opponentGrossDiff, playerGrossDiff, scoringConfig);
  }

  return 0;
}

/**
 * Calculate points for winning based on score vs par using configurable scoring
 * @param {number} scoreDiff - Difference from par
 * @param {number} opponentScoreDiff - Opponent's difference from par
 * @param {import('../types').ScoringConfiguration} scoringConfig - Scoring configuration
 * @returns {number} Points won based on configuration
 */
function calculatePointsForWin(scoreDiff, opponentScoreDiff, scoringConfig) {
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
 * @param {number} scoreDiff - Difference from par
 * @param {number} opponentScoreDiff - Opponent's difference from par
 * @param {import('../types').ScoringConfiguration} scoringConfig - Scoring configuration
 * @returns {number} Points won (0 for double bogey or worse, otherwise normal points)
 */
function calculatePointsForVoorTieWin(scoreDiff, opponentScoreDiff, scoringConfig) {
  if (scoreDiff >= 2) {
    // Double bogey or worse - gets 0 points on voor hole ties
    return 0;
  }
  // Use normal point calculation for other scores
  return calculatePointsForWin(scoreDiff, opponentScoreDiff, scoringConfig);
}

/**
 * Calculate points for all players on a hole
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
    const playerGrossScore = hole.scores[player.id];

    // Compare against each opponent
    players.forEach(opponent => {
      if (player.id === opponent.id) return; // Skip self

      const opponentNetScore = netScores[opponent.id];
      const opponentGrossScore = hole.scores[opponent.id];

      // Check if players give strokes TO EACH OTHER on this hole
      const playerGivesStroke = playerGivesStrokeToOpponent(player, opponent, hole.number, strokeIndexes);
      const opponentGivesStroke = playerGivesStrokeToOpponent(opponent, player, hole.number, strokeIndexes);

      const pointsVsOpponent = calculatePointsBetweenPlayers(
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
