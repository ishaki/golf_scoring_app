/**
 * Migration utility to move localStorage data to Supabase
 * Run once when user first logs in to migrate their existing data
 */

import { supabase } from '../lib/supabase';
import {
  loadCourses as loadCoursesFromLocalStorage,
  loadCurrentGame as loadCurrentGameFromLocalStorage,
  loadGameHistory as loadGameHistoryFromLocalStorage,
} from './storage';
import { loadCourses as loadCoursesFromCourseStorage } from './courseStorage';

/**
 * Migrate user's localStorage data to Supabase
 * @returns {Promise<{success: boolean, migrated: {courses: number, currentGame: boolean, history: number}, errors: string[]}>}
 */
export async function migrateLocalStorageToSupabase() {
  const result = {
    success: false,
    migrated: {
      courses: 0,
      currentGame: false,
      history: 0,
    },
    errors: [],
  };

  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      result.errors.push('User not authenticated');
      return result;
    }

    // Migrate courses
    try {
      const localCourses = loadCoursesFromCourseStorage();
      const customCourses = localCourses.filter(c => !c.isDefault);

      for (const course of customCourses) {
        try {
          await supabase.from('courses').insert({
            id: course.id,
            created_by: user.id,
            name: course.name,
            type: course.type,
            holes: course.holes,
            is_default: false,
            is_public: false,
            created_at: course.createdAt || new Date().toISOString(),
          });
          result.migrated.courses++;
        } catch (err) {
          // Course might already exist, skip
          console.warn(`Failed to migrate course ${course.id}:`, err.message);
        }
      }
    } catch (err) {
      result.errors.push(`Course migration error: ${err.message}`);
    }

    // Migrate current game
    try {
      const currentGame = loadCurrentGameFromLocalStorage();
      if (currentGame) {
        await supabase.from('games').insert({
          id: currentGame.id,
          created_by: user.id,
          players: currentGame.players,
          holes: currentGame.holes,
          current_hole: currentGame.currentHole,
          totals: currentGame.totals,
          is_complete: currentGame.isComplete,
          course_name: currentGame.courseName,
          created_at: currentGame.createdAt,
        });
        result.migrated.currentGame = true;
      }
    } catch (err) {
      result.errors.push(`Current game migration error: ${err.message}`);
    }

    // Migrate game history
    try {
      const history = loadGameHistoryFromLocalStorage();

      for (const game of history) {
        try {
          await supabase.from('games').insert({
            id: game.id,
            created_by: user.id,
            players: game.players,
            holes: game.holes,
            current_hole: game.currentHole,
            totals: game.totals,
            is_complete: true,
            course_name: game.courseName,
            created_at: game.createdAt,
          });
          result.migrated.history++;
        } catch (err) {
          // Game might already exist, skip
          console.warn(`Failed to migrate game ${game.id}:`, err.message);
        }
      }
    } catch (err) {
      result.errors.push(`History migration error: ${err.message}`);
    }

    result.success = result.errors.length === 0;
    return result;
  } catch (error) {
    result.errors.push(`Migration failed: ${error.message}`);
    return result;
  }
}

/**
 * Check if user needs migration (has localStorage data but not in Supabase)
 * @returns {Promise<boolean>}
 */
export async function needsMigration() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if user has any courses in localStorage
    const localCourses = loadCoursesFromCourseStorage();
    const customCourses = localCourses.filter(c => !c.isDefault);

    // Check if user has current game
    const currentGame = loadCurrentGameFromLocalStorage();

    // Check if user has history
    const history = loadGameHistoryFromLocalStorage();

    // If user has local data
    const hasLocalData = customCourses.length > 0 || currentGame || history.length > 0;

    if (!hasLocalData) return false;

    // Check if user has any data in Supabase
    const { data: supabaseCourses } = await supabase
      .from('courses')
      .select('id')
      .eq('created_by', user.id)
      .eq('is_default', false);

    const { data: supabaseGames } = await supabase
      .from('games')
      .select('id')
      .eq('created_by', user.id);

    const hasSupabaseData = (supabaseCourses && supabaseCourses.length > 0) ||
                            (supabaseGames && supabaseGames.length > 0);

    // Needs migration if has local data but no Supabase data
    return hasLocalData && !hasSupabaseData;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
}

/**
 * Clear localStorage after successful migration
 */
export function clearLocalStorageAfterMigration() {
  try {
    localStorage.removeItem('golf_current_game');
    localStorage.removeItem('golf_game_history');
    localStorage.removeItem('golf_courses');
    console.log('localStorage cleared after migration');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}
