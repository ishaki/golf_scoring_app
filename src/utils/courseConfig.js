/**
 * Course configuration utilities
 */

/**
 * Default stroke index (1-18, where 1 is hardest hole)
 * Standard difficulty ranking for golf holes
 */
export const DEFAULT_STROKE_INDEX = [
  1, 11, 5, 15, 3, 13, 7, 17, 9,  // Front 9
  2, 12, 6, 16, 4, 14, 8, 18, 10  // Back 9
];

/**
 * Default par values for 18 holes
 * Standard course layout: Four par 3s, four par 5s, ten par 4s
 */
export const DEFAULT_PARS = [
  4, 4, 3, 5, 4, 4, 3, 4, 5,  // Front 9 (Par 36)
  4, 4, 4, 3, 5, 4, 4, 3, 4   // Back 9 (Par 36)
  // Total: Par 72
];

/**
 * Generate default course configuration
 * @returns {{strokeIndexes: number[], pars: number[]}}
 */
export function generateDefaultCourseConfig() {
  return {
    strokeIndexes: [...DEFAULT_STROKE_INDEX],
    pars: [...DEFAULT_PARS],
  };
}

/**
 * Validate stroke index array
 * @param {number[]} strokeIndexes - Array of stroke indexes
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateStrokeIndexes(strokeIndexes) {
  if (!Array.isArray(strokeIndexes)) {
    return { valid: false, error: 'Stroke indexes must be an array' };
  }

  if (strokeIndexes.length !== 18) {
    return { valid: false, error: 'Must have exactly 18 stroke indexes' };
  }

  // Check if all numbers 1-18 are present
  const sortedIndexes = [...strokeIndexes].sort((a, b) => a - b);
  for (let i = 0; i < 18; i++) {
    if (sortedIndexes[i] !== i + 1) {
      return { valid: false, error: 'Stroke indexes must contain all numbers 1-18' };
    }
  }

  return { valid: true, error: null };
}

/**
 * Validate pars array
 * @param {number[]} pars - Array of par values
 * @returns {{valid: boolean, error: string|null}}
 */
export function validatePars(pars) {
  if (!Array.isArray(pars)) {
    return { valid: false, error: 'Pars must be an array' };
  }

  if (pars.length !== 18) {
    return { valid: false, error: 'Must have exactly 18 par values' };
  }

  // Check if all values are 3, 4, or 5
  const invalidPars = pars.filter(par => par < 3 || par > 5);
  if (invalidPars.length > 0) {
    return { valid: false, error: 'All par values must be 3, 4, or 5' };
  }

  return { valid: true, error: null };
}

/**
 * Calculate total par for course
 * @param {number[]} pars - Array of par values
 * @returns {number} Total par
 */
export function calculateTotalPar(pars) {
  return pars.reduce((sum, par) => sum + par, 0);
}

/**
 * Get holes where player receives strokes based on voor
 * @param {number} strokesReceived - Number of strokes player receives
 * @param {number[]} strokeIndexes - Stroke index array for the course
 * @returns {number[]} Array of hole numbers (1-18) where player gets strokes
 */
export function getStrokeHoles(strokesReceived, strokeIndexes = DEFAULT_STROKE_INDEX) {
  if (strokesReceived === 0) return [];

  // Find holes with the N lowest stroke indexes
  const holesWithIndexes = strokeIndexes.map((index, holeNumber) => ({
    holeNumber: holeNumber + 1, // Convert to 1-based
    strokeIndex: index,
  }));

  // Sort by stroke index (lowest first)
  holesWithIndexes.sort((a, b) => a.strokeIndex - b.strokeIndex);

  // Take the first N holes
  const strokeHoles = holesWithIndexes
    .slice(0, strokesReceived)
    .map(hole => hole.holeNumber);

  return strokeHoles;
}

/**
 * Create course preset configurations
 * @returns {Object.<string, {name: string, strokeIndexes: number[], pars: number[]}>}
 */
export function getCoursePresets() {
  return {
    standard: {
      name: 'Standard Par 72',
      strokeIndexes: [...DEFAULT_STROKE_INDEX],
      pars: [...DEFAULT_PARS],
    },
    executive: {
      name: 'Executive Course',
      strokeIndexes: [1, 7, 3, 9, 5, 11, 2, 8, 4, 10, 6, 12, 13, 15, 14, 16, 17, 18],
      pars: [3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4], // Par 63
    },
    championship: {
      name: 'Championship Course',
      strokeIndexes: [1, 13, 3, 15, 5, 11, 7, 17, 9, 2, 14, 4, 16, 6, 12, 8, 18, 10],
      pars: [4, 5, 4, 3, 4, 5, 4, 3, 4, 5, 4, 3, 4, 5, 4, 3, 4, 4], // Par 73
    },
  };
}

/**
 * Get hole name/label
 * @param {number} holeNumber - Hole number (1-18)
 * @returns {string} Hole label (e.g., "Hole 1", "Hole 18")
 */
export function getHoleLabel(holeNumber) {
  if (holeNumber < 1 || holeNumber > 18) {
    return 'Invalid Hole';
  }
  return `Hole ${holeNumber}`;
}

/**
 * Get nine label (front/back)
 * @param {number} holeNumber - Hole number (1-18)
 * @returns {string} Nine label ("Front 9" or "Back 9")
 */
export function getNineLabel(holeNumber) {
  if (holeNumber >= 1 && holeNumber <= 9) {
    return 'Front 9';
  } else if (holeNumber >= 10 && holeNumber <= 18) {
    return 'Back 9';
  }
  return 'Unknown';
}
