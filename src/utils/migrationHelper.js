import { supabase } from '../lib/supabase';

/**
 * Migration Helper Utilities
 * Handles one-time migration from localStorage to Supabase
 */

/**
 * Detect if there's data in localStorage that needs migration
 * @returns {object} Status of local data
 */
export function detectLocalData() {
  const hasGames = !!localStorage.getItem('golf-scoring:history');
  const hasCourses = !!localStorage.getItem('golf-scoring:courses');
  const hasCurrentGame = !!localStorage.getItem('golf-scoring:current-game');

  let gameCount = 0;
  let courseCount = 0;

  if (hasGames) {
    try {
      const games = JSON.parse(localStorage.getItem('golf-scoring:history'));
      gameCount = Array.isArray(games) ? games.length : 0;
    } catch (e) {
      console.error('Error parsing games:', e);
    }
  }

  if (hasCourses) {
    try {
      const courses = JSON.parse(localStorage.getItem('golf-scoring:courses'));
      courseCount = Array.isArray(courses) ? courses.filter(c => !c.isDefault).length : 0;
    } catch (e) {
      console.error('Error parsing courses:', e);
    }
  }

  return {
    hasData: hasGames || hasCourses || hasCurrentGame,
    gameCount,
    courseCount,
    hasCurrentGame,
  };
}

/**
 * Migrate courses from localStorage to Supabase
 * @param {string} userId - Current user ID
 * @returns {Promise<{success: boolean, count: number, error: string | null}>}
 */
export async function migrateCourses(userId) {
  try {
    const coursesData = localStorage.getItem('golf-scoring:courses');
    if (!coursesData) {
      return { success: true, count: 0, error: null };
    }

    const courses = JSON.parse(coursesData);

    // Filter out default courses (they're already in Supabase)
    const customCourses = courses.filter(course => !course.isDefault);

    if (customCourses.length === 0) {
      return { success: true, count: 0, error: null };
    }

    // Transform courses for Supabase
    const coursesToInsert = customCourses.map(course => ({
      id: course.id,
      user_id: userId,
      name: course.name,
      type: course.type,
      holes: course.holes, // JSONB column
      is_default: false,
      is_public: false,
      created_at: course.createdAt || new Date().toISOString(),
    }));

    // Insert courses into Supabase
    const { error } = await supabase
      .from('courses')
      .insert(coursesToInsert);

    if (error) {
      console.error('Error migrating courses:', error);
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: customCourses.length, error: null };
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, count: 0, error: error.message };
  }
}

/**
 * Migrate game history from localStorage to Supabase
 * @param {string} userId - Current user ID
 * @returns {Promise<{success: boolean, count: number, error: string | null}>}
 */
export async function migrateGames(userId) {
  try {
    const gamesData = localStorage.getItem('golf-scoring:history');
    if (!gamesData) {
      return { success: true, count: 0, error: null };
    }

    const games = JSON.parse(gamesData);

    if (!Array.isArray(games) || games.length === 0) {
      return { success: true, count: 0, error: null };
    }

    // Transform games for Supabase
    const gamesToInsert = games.map(game => ({
      id: game.id,
      created_by: userId,
      course_id: null, // Legacy games don't have course_id
      course_name: 'Legacy Game',
      players: game.players || [],
      holes: game.holes || [],
      current_hole: game.currentHole || 18,
      is_complete: true, // History games are always complete
      is_public: false,
      public_token: null,
      totals: game.totals || {},
      created_at: game.createdAt || new Date().toISOString(),
      updated_at: game.createdAt || new Date().toISOString(),
    }));

    // Insert games into Supabase
    const { error } = await supabase
      .from('games')
      .insert(gamesToInsert);

    if (error) {
      console.error('Error migrating games:', error);
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: games.length, error: null };
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, count: 0, error: error.message };
  }
}

/**
 * Migrate current game from localStorage to Supabase
 * @param {string} userId - Current user ID
 * @returns {Promise<{success: boolean, error: string | null}>}
 */
export async function migrateCurrentGame(userId) {
  try {
    const currentGameData = localStorage.getItem('golf-scoring:current-game');
    if (!currentGameData) {
      return { success: true, error: null };
    }

    const game = JSON.parse(currentGameData);

    // Transform current game for Supabase
    const gameToInsert = {
      id: game.id,
      created_by: userId,
      course_id: null,
      course_name: game.courseName || 'Standard Par 72',
      players: game.players || [],
      holes: game.holes || [],
      current_hole: game.currentHole || 1,
      is_complete: game.isComplete || false,
      is_public: false,
      public_token: null,
      totals: game.totals || {},
      created_at: game.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert current game into Supabase
    const { error } = await supabase
      .from('games')
      .insert([gameToInsert]);

    if (error) {
      console.error('Error migrating current game:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Clear localStorage after successful migration
 */
export function clearLocalStorage() {
  try {
    localStorage.removeItem('golf-scoring:current-game');
    localStorage.removeItem('golf-scoring:history');
    localStorage.removeItem('golf-scoring:courses');
    // Keep settings (theme, etc.)
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Perform complete migration
 * @param {string} userId - Current user ID
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<{success: boolean, details: object, error: string | null}>}
 */
export async function performFullMigration(userId, onProgress = null) {
  const results = {
    courses: { success: false, count: 0 },
    games: { success: false, count: 0 },
    currentGame: { success: false },
  };

  try {
    // Step 1: Migrate courses
    if (onProgress) onProgress({ step: 'courses', status: 'in_progress' });
    const coursesResult = await migrateCourses(userId);
    results.courses = coursesResult;

    if (!coursesResult.success) {
      return {
        success: false,
        details: results,
        error: `Courses migration failed: ${coursesResult.error}`,
      };
    }

    // Step 2: Migrate game history
    if (onProgress) onProgress({ step: 'games', status: 'in_progress' });
    const gamesResult = await migrateGames(userId);
    results.games = gamesResult;

    if (!gamesResult.success) {
      return {
        success: false,
        details: results,
        error: `Games migration failed: ${gamesResult.error}`,
      };
    }

    // Step 3: Migrate current game
    if (onProgress) onProgress({ step: 'currentGame', status: 'in_progress' });
    const currentGameResult = await migrateCurrentGame(userId);
    results.currentGame = currentGameResult;

    if (!currentGameResult.success) {
      return {
        success: false,
        details: results,
        error: `Current game migration failed: ${currentGameResult.error}`,
      };
    }

    // Step 4: Clear localStorage
    if (onProgress) onProgress({ step: 'cleanup', status: 'in_progress' });
    clearLocalStorage();

    if (onProgress) onProgress({ step: 'complete', status: 'success' });

    return {
      success: true,
      details: results,
      error: null,
    };
  } catch (error) {
    console.error('Full migration error:', error);
    return {
      success: false,
      details: results,
      error: error.message,
    };
  }
}

/**
 * Mark migration as completed for this user
 */
export function markMigrationComplete() {
  localStorage.setItem('golf-scoring:migration-complete', 'true');
}

/**
 * Check if migration has been completed
 * @returns {boolean}
 */
export function isMigrationComplete() {
  return localStorage.getItem('golf-scoring:migration-complete') === 'true';
}
