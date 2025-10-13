/**
 * Supabase Storage utilities for golf scoring system
 */

import { supabase } from '../lib/supabase';

/**
 * Save current game to Supabase
 * @param {import('../types').Game} game - Game object to save
 * @returns {Promise<boolean>} Success status
 */
export async function saveCurrentGame(game) {
  try {
    console.log('[supabaseStorage] saveCurrentGame called with game ID:', game.id);

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('[supabaseStorage] Auth error:', userError);
      return false;
    }

    if (!user) {
      console.error('[supabaseStorage] User not authenticated');
      return false;
    }

    console.log('[supabaseStorage] User authenticated:', user.id);

    // Check if game already exists
    console.log('[supabaseStorage] Checking if game exists with ID:', game.id);
    const { data: existing, error: checkError } = await supabase
      .from('games')
      .select('id')
      .eq('id', game.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[supabaseStorage] Error checking game:', checkError);

      // If it's a UUID format error, the game doesn't exist (insert it)
      if (checkError.code === '22P02') {
        console.warn('[supabaseStorage] Invalid UUID format detected, treating as new game');
        // Continue to insert
      } else {
        throw checkError;
      }
    }

    if (existing) {
      // Update existing game
      console.log('[supabaseStorage] Game exists, updating...');
      const updateData = {
        players: game.players,
        holes: game.holes,
        current_hole: game.currentHole,
        totals: game.totals,
        is_complete: game.isComplete,
        course_name: game.courseName,
        scoring_config: game.scoringConfig,
        scoring_system: game.scoringSystem,
        updated_at: new Date().toISOString()
      };

      console.log('[supabaseStorage] Update data:', {
        id: game.id,
        currentHole: game.currentHole,
        isComplete: game.isComplete,
        holesWithScores: game.holes.filter(h => Object.keys(h.scores || {}).length > 0).length
      });

      const { error: updateError } = await supabase
        .from('games')
        .update(updateData)
        .eq('id', game.id);

      if (updateError) {
        console.error('[supabaseStorage] Update error:', updateError);
        throw updateError;
      }

      console.log('[supabaseStorage] ✅ Game updated successfully');
    } else {
      // Insert new game
      console.log('[supabaseStorage] Game does not exist, inserting...');
      const insertData = {
        id: game.id,
        created_by: user.id,
        players: game.players,
        holes: game.holes,
        current_hole: game.currentHole,
        totals: game.totals,
        is_complete: game.isComplete,
        course_name: game.courseName,
        created_at: game.createdAt,
        scoring_config: game.scoringConfig,
        scoring_system: game.scoringSystem
      };

      console.log('[supabaseStorage] Insert data:', {
        id: game.id,
        created_by: user.id,
        currentHole: game.currentHole,
        isComplete: game.isComplete
      });

      const { data: insertedData, error: insertError } = await supabase
        .from('games')
        .insert(insertData)
        .select('public_token')
        .single();

      if (insertError) {
        console.error('[supabaseStorage] Insert error:', insertError);
        throw insertError;
      }

      console.log('[supabaseStorage] ✅ Game inserted successfully');
      
      // Update the game object with the generated public_token
      if (insertedData && insertedData.public_token) {
        game.public_token = insertedData.public_token;
        console.log('[supabaseStorage] ✅ Public token generated:', insertedData.public_token);
      }
    }

    return true;
  } catch (error) {
    console.error('[supabaseStorage] ❌ Error saving game to Supabase:', error);
    return false;
  }
}

/**
 * Load current game from Supabase (most recent incomplete game)
 * @returns {Promise<import('../types').Game | null>}
 */
export async function loadCurrentGame() {
  try {
    console.log('[supabaseStorage] loadCurrentGame: Checking for active game...');

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('[supabaseStorage] loadCurrentGame: User error:', userError);
      return null;
    }

    if (!user) {
      console.log('[supabaseStorage] loadCurrentGame: No user authenticated');
      return null;
    }

    console.log('[supabaseStorage] loadCurrentGame: User authenticated:', user.id);

    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('created_by', user.id)
      .eq('is_complete', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('[supabaseStorage] loadCurrentGame: Query error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('[supabaseStorage] loadCurrentGame: No incomplete games found');
      return null;
    }

    const gameData = data[0];

    console.log('[supabaseStorage] loadCurrentGame: ✅ Game found:', {
      id: gameData.id,
      courseName: gameData.course_name,
      currentHole: gameData.current_hole,
      isComplete: gameData.is_complete,
      createdAt: gameData.created_at
    });

    // Map Supabase data to Game object
    return {
      id: gameData.id,
      createdAt: gameData.created_at,
      players: gameData.players,
      holes: gameData.holes,
      currentHole: gameData.current_hole,
      isComplete: gameData.is_complete,
      totals: gameData.totals,
      courseName: gameData.course_name,
      isPublic: gameData.is_public,
      public_token: gameData.public_token,
      scoringConfig: gameData.scoring_config,
      scoringSystem: gameData.scoring_system
    };
  } catch (error) {
    console.error('[supabaseStorage] loadCurrentGame: ❌ Error:', error);
    return null;
  }
}

/**
 * Clear current game (mark as complete or delete)
 * @returns {Promise<boolean>} Success status
 */
export async function clearCurrentGame() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    // Mark incomplete games as complete
    const { error } = await supabase
      .from('games')
      .update({ is_complete: true })
      .eq('created_by', user.id)
      .eq('is_complete', false);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error clearing game from Supabase:', error);
    return false;
  }
}

/**
 * Save game to history (mark as complete)
 * @param {import('../types').Game} game - Game object to save
 * @returns {Promise<boolean>} Success status
 */
export async function saveGameToHistory(game) {
  try {
    const { error } = await supabase
      .from('games')
      .update({ is_complete: true })
      .eq('id', game.id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error saving game to history:', error);
    return false;
  }
}

/**
 * Load game history from Supabase
 * @returns {Promise<import('../types').Game[]>}
 */
export async function loadGameHistory() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('created_by', user.id)
      .eq('is_complete', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return (data || []).map(game => ({
      id: game.id,
      createdAt: game.created_at,
      players: game.players,
      holes: game.holes,
      currentHole: game.current_hole,
      isComplete: game.is_complete,
      totals: game.totals,
      courseName: game.course_name,
      isPublic: game.is_public,
      public_token: game.public_token,
      scoringConfig: game.scoring_config,
      scoringSystem: game.scoring_system
    }));
  } catch (error) {
    console.error('Error loading game history:', error);
    return [];
  }
}

/**
 * Load specific game by ID
 * @param {string} gameId - Game ID
 * @returns {Promise<import('../types').Game | null>}
 */
export async function loadGameById(gameId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .eq('created_by', user.id)
      .single();

    if (error) throw error;

    if (!data) return null;

    return {
      id: data.id,
      createdAt: data.created_at,
      players: data.players,
      holes: data.holes,
      currentHole: data.current_hole,
      isComplete: data.is_complete,
      totals: data.totals,
      courseName: data.course_name,
      isPublic: data.is_public,
      public_token: data.public_token,
      scoringConfig: data.scoring_config,
      scoringSystem: data.scoring_system
    };
  } catch (error) {
    console.error('Error loading game by ID:', error);
    return null;
  }
}

/**
 * Delete game from Supabase
 * @param {string} gameId - Game ID to delete
 * @returns {Promise<boolean>} Success status
 */
export async function deleteGame(gameId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', gameId)
      .eq('created_by', user.id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting game:', error);
    return false;
  }
}

/**
 * Clear all game history
 * @returns {Promise<boolean>} Success status
 */
export async function clearAllHistory() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { error } = await supabase
      .from('games')
      .delete()
      .eq('created_by', user.id)
      .eq('is_complete', true);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error clearing history:', error);
    return false;
  }
}

/**
 * Check if storage is available
 * @returns {Promise<boolean>}
 */
export async function isStorageAvailable() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch (error) {
    return false;
  }
}

/**
 * Get storage info
 * @returns {Promise<{gamesCount: number, historyCount: number}>}
 */
export async function getStorageInfo() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { gamesCount: 0, historyCount: 0 };
    }

    const { data: incomplete } = await supabase
      .from('games')
      .select('id', { count: 'exact' })
      .eq('created_by', user.id)
      .eq('is_complete', false);

    const { data: complete } = await supabase
      .from('games')
      .select('id', { count: 'exact' })
      .eq('created_by', user.id)
      .eq('is_complete', true);

    return {
      gamesCount: incomplete?.length || 0,
      historyCount: complete?.length || 0
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return { gamesCount: 0, historyCount: 0 };
  }
}
