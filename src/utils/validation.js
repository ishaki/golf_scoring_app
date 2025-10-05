/**
 * Validation utilities for golf scoring system
 */

/**
 * Validate player name
 * @param {string} name - Player name to validate
 * @param {string[]} existingNames - Array of existing player names
 * @returns {{valid: boolean, error: string|null}}
 */
export function validatePlayerName(name, existingNames = []) {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Player name cannot be empty' };
  }

  if (name.trim().length > 50) {
    return { valid: false, error: 'Player name too long (max 50 characters)' };
  }

  const normalizedName = name.trim().toLowerCase();
  const duplicates = existingNames.map(n => n.toLowerCase()).includes(normalizedName);

  if (duplicates) {
    return { valid: false, error: 'Player name already exists' };
  }

  return { valid: true, error: null };
}

/**
 * Validate golf score
 * @param {number} score - Score to validate
 * @param {number} par - Par for the hole
 * @returns {{valid: boolean, error: string|null, warning: string|null}}
 */
export function validateScore(score, par = 4) {
  const numScore = Number(score);

  if (isNaN(numScore)) {
    return { valid: false, error: 'Score must be a number', warning: null };
  }

  if (!Number.isInteger(numScore)) {
    return { valid: false, error: 'Score must be a whole number', warning: null };
  }

  if (numScore < 1) {
    return { valid: false, error: 'Score must be at least 1', warning: null };
  }

  if (numScore > 15) {
    return { valid: false, error: 'Score too high (max 15)', warning: null };
  }

  // Warnings for unusual scores
  if (numScore === 1 && par > 3) {
    return {
      valid: true,
      error: null,
      warning: 'Hole-in-one on par 4/5? Please confirm.'
    };
  }

  if (numScore >= par + 5) {
    return {
      valid: true,
      error: null,
      warning: 'Very high score. Please confirm.'
    };
  }

  return { valid: true, error: null, warning: null };
}

/**
 * Validate voor (handicap strokes)
 * @param {number} strokes - Number of strokes
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateVoor(strokes) {
  const numStrokes = Number(strokes);

  if (isNaN(numStrokes)) {
    return { valid: false, error: 'Strokes must be a number' };
  }

  if (!Number.isInteger(numStrokes)) {
    return { valid: false, error: 'Strokes must be a whole number' };
  }

  if (numStrokes < 0) {
    return { valid: false, error: 'Strokes cannot be negative' };
  }

  if (numStrokes > 18) {
    return { valid: false, error: 'Strokes cannot exceed 18' };
  }

  return { valid: true, error: null };
}

/**
 * Check for reciprocal voor (both players giving strokes to each other)
 * @param {Object.<string, Object.<string, number>>} voorMatrix - Voor allocation matrix
 * @returns {{valid: boolean, conflicts: Array<{player1: string, player2: string}>}}
 */
export function validateReciprocal(voorMatrix) {
  const conflicts = [];
  const playerIds = Object.keys(voorMatrix);

  for (let i = 0; i < playerIds.length; i++) {
    for (let j = i + 1; j < playerIds.length; j++) {
      const player1 = playerIds[i];
      const player2 = playerIds[j];

      const player1GivesTo2 = voorMatrix[player1]?.[player2] > 0;
      const player2GivesTo1 = voorMatrix[player2]?.[player1] > 0;

      if (player1GivesTo2 && player2GivesTo1) {
        conflicts.push({ player1, player2 });
      }
    }
  }

  return {
    valid: conflicts.length === 0,
    conflicts
  };
}

/**
 * Validate all players have unique names
 * V2.1: Updated to support 3-6 players
 * @param {string[]} playerNames - Array of player names
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateAllPlayerNames(playerNames) {
  if (playerNames.length < 3) {
    return { valid: false, error: 'At least 3 players required' };
  }

  if (playerNames.length > 6) {
    return { valid: false, error: 'Maximum 6 players allowed' };
  }

  const emptyNames = playerNames.filter(name => !name || name.trim().length === 0);
  if (emptyNames.length > 0) {
    return { valid: false, error: 'All players must have names' };
  }

  const normalizedNames = playerNames.map(n => n.trim().toLowerCase());
  const uniqueNames = new Set(normalizedNames);

  if (uniqueNames.size !== playerNames.length) {
    return { valid: false, error: 'All player names must be unique' };
  }

  return { valid: true, error: null };
}

/**
 * Validate hole number
 * @param {number} holeNumber - Hole number to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateHoleNumber(holeNumber) {
  const num = Number(holeNumber);

  if (isNaN(num) || !Number.isInteger(num)) {
    return { valid: false, error: 'Hole number must be an integer' };
  }

  if (num < 1 || num > 18) {
    return { valid: false, error: 'Hole number must be between 1 and 18' };
  }

  return { valid: true, error: null };
}

/**
 * Validate par value
 * @param {number} par - Par value to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validatePar(par) {
  const num = Number(par);

  if (isNaN(num) || !Number.isInteger(num)) {
    return { valid: false, error: 'Par must be an integer' };
  }

  if (num < 3 || num > 5) {
    return { valid: false, error: 'Par must be 3, 4, or 5' };
  }

  return { valid: true, error: null };
}
