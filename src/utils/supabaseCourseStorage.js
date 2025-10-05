/**
 * Supabase Course Storage Module
 * Handles Supabase operations for golf courses
 */

import { supabase } from '../lib/supabase';

/**
 * Load all courses from Supabase (user's + defaults + public)
 * @returns {Promise<import('../types').Course[]>}
 */
export async function loadCourses() {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(course => ({
      id: course.id,
      name: course.name,
      type: course.type,
      holes: course.holes,
      createdAt: course.created_at,
      isDefault: course.is_default
    }));
  } catch (error) {
    console.error('Error loading courses from Supabase:', error);
    return [];
  }
}

/**
 * Save course to Supabase
 * @param {import('../types').Course} course
 * @returns {Promise<boolean>} Success status
 */
export async function saveCourse(course) {
  try {
    console.log('[supabaseCourseStorage] saveCourse called with:', course);

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('[supabaseCourseStorage] User error:', userError);
      throw userError;
    }

    if (!user) {
      console.error('[supabaseCourseStorage] No user authenticated');
      throw new Error('User not authenticated');
    }

    console.log('[supabaseCourseStorage] User authenticated:', user.id);

    // Check for duplicate name
    const { data: existing, error: duplicateError } = await supabase
      .from('courses')
      .select('id, name')
      .ilike('name', course.name)
      .neq('id', course.id || '');

    if (duplicateError) {
      console.error('[supabaseCourseStorage] Error checking duplicates:', duplicateError);
    }

    if (existing && existing.length > 0) {
      console.warn('[supabaseCourseStorage] Duplicate course name found');
      throw new Error('Course name already exists');
    }

    // Validate course
    console.log('[supabaseCourseStorage] Validating course...');
    const validation = validateCourse(course);
    if (!validation.isValid) {
      console.error('[supabaseCourseStorage] Validation failed:', validation.errors);
      throw new Error(validation.errors.join(', '));
    }
    console.log('[supabaseCourseStorage] Validation passed');

    // Check if updating existing course
    if (course.id && course.id.startsWith('course-')) {
      console.log('[supabaseCourseStorage] Checking if course exists for update...');
      const { data: courseToUpdate, error: checkError } = await supabase
        .from('courses')
        .select('id, created_by, is_default')
        .eq('id', course.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('[supabaseCourseStorage] Error checking course:', checkError);
        throw checkError;
      }

      if (courseToUpdate) {
        console.log('[supabaseCourseStorage] Course exists, updating...');
        if (courseToUpdate.is_default) {
          throw new Error('Cannot edit default course');
        }

        const { error: updateError } = await supabase
          .from('courses')
          .update({
            name: course.name,
            type: course.type,
            holes: course.holes,
            updated_at: new Date().toISOString()
          })
          .eq('id', course.id)
          .eq('created_by', user.id);

        if (updateError) {
          console.error('[supabaseCourseStorage] Update error:', updateError);
          throw updateError;
        }
        console.log('[supabaseCourseStorage] Course updated successfully');
      } else {
        console.log('[supabaseCourseStorage] Course does not exist, inserting...');
        // Insert new course with the provided ID
        const courseData = {
          id: course.id,
          created_by: user.id,
          name: course.name,
          type: course.type,
          holes: course.holes,
          is_default: false,
          is_public: false
        };

        console.log('[supabaseCourseStorage] Inserting course data:', courseData);
        const { data: insertedData, error: insertError } = await supabase
          .from('courses')
          .insert(courseData)
          .select();

        if (insertError) {
          console.error('[supabaseCourseStorage] Insert error:', insertError);
          throw insertError;
        }
        console.log('[supabaseCourseStorage] Course inserted successfully:', insertedData);
      }
    } else {
      console.log('[supabaseCourseStorage] No ID provided, generating and inserting...');
      // Insert new course with generated ID
      const courseData = {
        id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_by: user.id,
        name: course.name,
        type: course.type,
        holes: course.holes,
        is_default: false,
        is_public: false
      };

      console.log('[supabaseCourseStorage] Inserting new course:', courseData);
      const { data: insertedData, error: insertError } = await supabase
        .from('courses')
        .insert(courseData)
        .select();

      if (insertError) {
        console.error('[supabaseCourseStorage] Insert error:', insertError);
        throw insertError;
      }
      console.log('[supabaseCourseStorage] Course inserted successfully:', insertedData);
    }

    return true;
  } catch (error) {
    console.error('Error saving course to Supabase:', error);
    throw error;
  }
}

/**
 * Load course by ID
 * @param {string} id
 * @returns {Promise<import('../types').Course | null>}
 */
export async function loadCourseById(id) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      type: data.type,
      holes: data.holes,
      createdAt: data.created_at,
      isDefault: data.is_default
    };
  } catch (error) {
    console.error('Error loading course by ID:', error);
    return null;
  }
}

/**
 * Delete course by ID
 * @param {string} id
 * @returns {Promise<boolean>} Success status
 */
export async function deleteCourse(id) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if it's a default course
    const { data: course } = await supabase
      .from('courses')
      .select('is_default')
      .eq('id', id)
      .single();

    if (course?.is_default) {
      throw new Error('Cannot delete default course');
    }

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)
      .eq('created_by', user.id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
}

/**
 * Validate course data
 * @param {import('../types').Course} course
 * @returns {{isValid: boolean, errors: string[]}}
 */
export function validateCourse(course) {
  const errors = [];

  // Validate name
  if (!course.name || course.name.trim().length === 0) {
    errors.push('Course name is required');
  }
  if (course.name && course.name.length > 100) {
    errors.push('Course name must be 100 characters or less');
  }

  // Validate type
  if (!['9-hole', '18-hole'].includes(course.type)) {
    errors.push('Course type must be "9-hole" or "18-hole"');
  }

  // Validate holes array
  const expectedHoles = course.type === '9-hole' ? 9 : 18;
  if (!Array.isArray(course.holes) || course.holes.length !== expectedHoles) {
    errors.push(`Course must have exactly ${expectedHoles} holes`);
  }

  // Validate each hole
  if (course.holes) {
    const strokeIndexes = new Set();

    course.holes.forEach((hole, index) => {
      // Validate hole number
      const expectedNumber = index + 1;
      if (hole.number !== expectedNumber) {
        errors.push(`Hole ${index + 1}: number must be ${expectedNumber}`);
      }

      // Validate stroke index (must be unique and in range)
      if (hole.strokeIndex < 1 || hole.strokeIndex > expectedHoles) {
        errors.push(`Hole ${hole.number}: stroke index must be between 1 and ${expectedHoles}`);
      }
      if (strokeIndexes.has(hole.strokeIndex)) {
        errors.push(`Hole ${hole.number}: duplicate stroke index ${hole.strokeIndex}`);
      }
      strokeIndexes.add(hole.strokeIndex);

      // Validate par
      if (![3, 4, 5].includes(hole.par)) {
        errors.push(`Hole ${hole.number}: par must be 3, 4, or 5`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Initialize default courses (runs on first app launch)
 * Note: Default courses are inserted via SQL schema
 * @returns {Promise<boolean>} Success status
 */
export async function initializeDefaultCourses() {
  // Default courses are created via SQL schema
  // This function just checks if they exist
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('id')
      .eq('is_default', true);

    if (error) throw error;

    return (data && data.length > 0);
  } catch (error) {
    console.error('Error checking default courses:', error);
    return false;
  }
}

/**
 * Combine two 9-hole courses into 18-hole configuration
 * @param {import('../types').Course} front9
 * @param {import('../types').Course} back9
 * @returns {{strokeIndexes: number[], pars: number[], courseName: string}}
 */
export function combineCourses(front9, back9) {
  if (front9.type !== '9-hole' || back9.type !== '9-hole') {
    throw new Error('Both courses must be 9-hole type');
  }

  if (front9.id === back9.id) {
    throw new Error('Cannot select the same course twice');
  }

  // Front 9 stroke indexes and pars (as-is)
  const frontIndexes = front9.holes.map(h => h.strokeIndex);
  const frontPars = front9.holes.map(h => h.par);

  // Back 9 stroke indexes (add 9 to each) and pars
  const backIndexes = back9.holes.map(h => h.strokeIndex + 9);
  const backPars = back9.holes.map(h => h.par);

  return {
    strokeIndexes: [...frontIndexes, ...backIndexes],
    pars: [...frontPars, ...backPars],
    courseName: `${front9.name} + ${back9.name}`
  };
}
