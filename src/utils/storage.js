/**
 * DEPRECATED: LocalStorage utilities for golf scoring system
 *
 * ⚠️ This module is deprecated and kept only for migration purposes.
 * All new code should use supabaseStorage.js instead.
 *
 * This file will be removed in a future version.
 */

console.warn('storage.js is deprecated. Use supabaseStorage.js instead.');

const STORAGE_KEYS = {
  CURRENT_GAME: 'golf-scoring:current-game',
  HISTORY: 'golf-scoring:history',
  SETTINGS: 'golf-scoring:settings',
};

const MAX_HISTORY_ITEMS = 20;

/**
 * Save current game to localStorage
 * @param {import('../types').Game} game - Game object to save
 * @returns {boolean} Success status
 */
export function saveCurrentGame(game) {
  try {
    const gameData = JSON.stringify(game);
    localStorage.setItem(STORAGE_KEYS.CURRENT_GAME, gameData);
    return true;
  } catch (error) {
    console.error('Error saving current game:', error);
    return false;
  }
}

/**
 * Load current game from localStorage
 * @returns {import('../types').Game|null} Game object or null if not found
 */
export function loadCurrentGame() {
  try {
    const gameData = localStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
    if (!gameData) return null;

    const game = JSON.parse(gameData);
    return game;
  } catch (error) {
    console.error('Error loading current game:', error);
    return null;
  }
}

/**
 * Clear current game from localStorage
 * @returns {boolean} Success status
 */
export function clearCurrentGame() {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
    return true;
  } catch (error) {
    console.error('Error clearing current game:', error);
    return false;
  }
}

/**
 * Save completed game to history
 * @param {import('../types').Game} game - Completed game object
 * @returns {boolean} Success status
 */
export function saveGameToHistory(game) {
  try {
    const history = loadGameHistory();

    // Create history entry
    const historyEntry = {
      id: game.id,
      createdAt: game.createdAt,
      playerNames: game.players.map(p => p.name),
      totals: game.totals,
      winner: getWinnerName(game),
    };

    // Add to beginning of history
    history.unshift(historyEntry);

    // Limit history size
    const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmedHistory));

    // Also save full game data with separate key for detailed view
    const fullGameKey = `golf-scoring:game:${game.id}`;
    localStorage.setItem(fullGameKey, JSON.stringify(game));

    return true;
  } catch (error) {
    console.error('Error saving game to history:', error);
    return false;
  }
}

/**
 * Load game history from localStorage
 * @returns {import('../types').GameHistory[]} Array of game history entries
 */
export function loadGameHistory() {
  try {
    const historyData = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!historyData) return [];

    const history = JSON.parse(historyData);
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error('Error loading game history:', error);
    return [];
  }
}

/**
 * Load full game data by ID
 * @param {string} gameId - Game ID
 * @returns {import('../types').Game|null} Full game object or null
 */
export function loadGameById(gameId) {
  try {
    const fullGameKey = `golf-scoring:game:${gameId}`;
    const gameData = localStorage.getItem(fullGameKey);

    if (!gameData) return null;

    return JSON.parse(gameData);
  } catch (error) {
    console.error('Error loading game by ID:', error);
    return null;
  }
}

/**
 * Delete game from history
 * @param {string} gameId - Game ID to delete
 * @returns {boolean} Success status
 */
export function deleteGame(gameId) {
  try {
    // Remove from history list
    const history = loadGameHistory();
    const updatedHistory = history.filter(entry => entry.id !== gameId);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));

    // Remove full game data
    const fullGameKey = `golf-scoring:game:${gameId}`;
    localStorage.removeItem(fullGameKey);

    return true;
  } catch (error) {
    console.error('Error deleting game:', error);
    return false;
  }
}

/**
 * Clear all game history
 * @returns {boolean} Success status
 */
export function clearAllHistory() {
  try {
    const history = loadGameHistory();

    // Remove all full game data
    history.forEach(entry => {
      const fullGameKey = `golf-scoring:game:${entry.id}`;
      localStorage.removeItem(fullGameKey);
    });

    // Clear history list
    localStorage.removeItem(STORAGE_KEYS.HISTORY);

    return true;
  } catch (error) {
    console.error('Error clearing all history:', error);
    return false;
  }
}

/**
 * Save app settings to localStorage
 * @param {import('../types').GameSettings} settings - Settings object
 * @returns {boolean} Success status
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

/**
 * Load app settings from localStorage
 * @returns {import('../types').GameSettings|null} Settings object or null
 */
export function loadSettings() {
  try {
    const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!settingsData) return null;

    return JSON.parse(settingsData);
  } catch (error) {
    console.error('Error loading settings:', error);
    return null;
  }
}

/**
 * Get winner name from game
 * @param {import('../types').Game} game - Game object
 * @returns {string} Winner's name
 */
function getWinnerName(game) {
  const playerScores = Object.entries(game.totals).map(([playerId, points]) => ({
    playerId,
    points,
  }));

  playerScores.sort((a, b) => b.points - a.points);

  const winnerId = playerScores[0]?.playerId;
  const winner = game.players.find(p => p.id === winnerId);

  return winner?.name || 'Unknown';
}

/**
 * Check if localStorage is available
 * @returns {boolean} True if localStorage is available
 */
export function isStorageAvailable() {
  try {
    const testKey = 'golf-scoring:test';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get storage usage information
 * @returns {{used: number, available: number, percentage: number}}
 */
export function getStorageInfo() {
  try {
    let totalSize = 0;

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }

    // Approximate available size (5MB = 5,242,880 bytes)
    const maxSize = 5242880;
    const used = totalSize * 2; // Each character is 2 bytes in UTF-16
    const percentage = (used / maxSize) * 100;

    return {
      used,
      available: maxSize - used,
      percentage: Math.round(percentage * 100) / 100,
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return { used: 0, available: 0, percentage: 0 };
  }
}
