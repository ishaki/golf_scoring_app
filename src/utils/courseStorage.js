/**
 * DEPRECATED: Course Storage Module
 *
 * ⚠️ This module is deprecated and kept only for migration purposes.
 * All new code should use supabaseCourseStorage.js instead.
 *
 * This file will be removed in a future version.
 */

console.warn('courseStorage.js is deprecated. Use supabaseCourseStorage.js instead.');

const COURSES_KEY = 'golf-scoring:courses';

/**
 * Load all courses from localStorage
 * @returns {import('../types').Course[]}
 */
export function loadCourses() {
  try {
    const data = localStorage.getItem(COURSES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading courses:', error);
    return [];
  }
}

/**
 * Save course to localStorage
 * @param {import('../types').Course} course
 * @returns {boolean} Success status
 */
export function saveCourse(course) {
  try {
    const courses = loadCourses();

    // Check for duplicate name (case-insensitive)
    const duplicate = courses.find(
      c => c.name.toLowerCase() === course.name.toLowerCase() && c.id !== course.id
    );

    if (duplicate) {
      throw new Error('Course name already exists');
    }

    // Validate course
    const validation = validateCourse(course);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Add or update course
    const existingIndex = courses.findIndex(c => c.id === course.id);
    if (existingIndex >= 0) {
      courses[existingIndex] = course;
    } else {
      courses.push(course);
    }

    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    return true;
  } catch (error) {
    console.error('Error saving course:', error);
    throw error;
  }
}

/**
 * Load course by ID
 * @param {string} id
 * @returns {import('../types').Course | null}
 */
export function loadCourseById(id) {
  const courses = loadCourses();
  return courses.find(c => c.id === id) || null;
}

/**
 * Delete course by ID
 * @param {string} id
 * @returns {boolean} Success status
 */
export function deleteCourse(id) {
  try {
    const courses = loadCourses();
    const course = courses.find(c => c.id === id);

    // Prevent deletion of default courses
    if (course?.isDefault) {
      throw new Error('Cannot delete default course');
    }

    const filtered = courses.filter(c => c.id !== id);
    localStorage.setItem(COURSES_KEY, JSON.stringify(filtered));
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
 * Initialize default courses on first launch
 * @returns {boolean} Success status
 */
export function initializeDefaultCourses() {
  try {
    const courses = loadCourses();

    // Check if defaults already exist
    if (courses.some(c => c.isDefault)) {
      return false;
    }

    const defaultCourses = [
      {
        id: 'default-standard',
        name: 'Standard Par 72',
        type: '18-hole',
        holes: [
          { number: 1, strokeIndex: 1, par: 4 },
          { number: 2, strokeIndex: 11, par: 4 },
          { number: 3, strokeIndex: 5, par: 3 },
          { number: 4, strokeIndex: 15, par: 5 },
          { number: 5, strokeIndex: 3, par: 4 },
          { number: 6, strokeIndex: 13, par: 4 },
          { number: 7, strokeIndex: 7, par: 3 },
          { number: 8, strokeIndex: 17, par: 4 },
          { number: 9, strokeIndex: 9, par: 5 },
          { number: 10, strokeIndex: 2, par: 4 },
          { number: 11, strokeIndex: 12, par: 4 },
          { number: 12, strokeIndex: 6, par: 4 },
          { number: 13, strokeIndex: 16, par: 3 },
          { number: 14, strokeIndex: 4, par: 5 },
          { number: 15, strokeIndex: 14, par: 4 },
          { number: 16, strokeIndex: 8, par: 4 },
          { number: 17, strokeIndex: 18, par: 3 },
          { number: 18, strokeIndex: 10, par: 4 }
        ],
        createdAt: new Date().toISOString(),
        isDefault: true
      },
      {
        id: 'default-executive',
        name: 'Executive Course',
        type: '18-hole',
        holes: [
          { number: 1, strokeIndex: 1, par: 4 },
          { number: 2, strokeIndex: 7, par: 3 },
          { number: 3, strokeIndex: 3, par: 4 },
          { number: 4, strokeIndex: 13, par: 3 },
          { number: 5, strokeIndex: 5, par: 4 },
          { number: 6, strokeIndex: 15, par: 3 },
          { number: 7, strokeIndex: 9, par: 5 },
          { number: 8, strokeIndex: 11, par: 4 },
          { number: 9, strokeIndex: 17, par: 3 },
          { number: 10, strokeIndex: 2, par: 4 },
          { number: 11, strokeIndex: 8, par: 3 },
          { number: 12, strokeIndex: 4, par: 4 },
          { number: 13, strokeIndex: 14, par: 3 },
          { number: 14, strokeIndex: 6, par: 5 },
          { number: 15, strokeIndex: 16, par: 3 },
          { number: 16, strokeIndex: 10, par: 4 },
          { number: 17, strokeIndex: 12, par: 4 },
          { number: 18, strokeIndex: 18, par: 3 }
        ],
        createdAt: new Date().toISOString(),
        isDefault: true
      },
      {
        id: 'default-championship',
        name: 'Championship Course',
        type: '18-hole',
        holes: [
          { number: 1, strokeIndex: 5, par: 4 },
          { number: 2, strokeIndex: 3, par: 5 },
          { number: 3, strokeIndex: 15, par: 3 },
          { number: 4, strokeIndex: 1, par: 4 },
          { number: 5, strokeIndex: 9, par: 4 },
          { number: 6, strokeIndex: 11, par: 4 },
          { number: 7, strokeIndex: 17, par: 3 },
          { number: 8, strokeIndex: 7, par: 5 },
          { number: 9, strokeIndex: 13, par: 4 },
          { number: 10, strokeIndex: 6, par: 4 },
          { number: 11, strokeIndex: 4, par: 5 },
          { number: 12, strokeIndex: 16, par: 3 },
          { number: 13, strokeIndex: 2, par: 4 },
          { number: 14, strokeIndex: 10, par: 4 },
          { number: 15, strokeIndex: 12, par: 4 },
          { number: 16, strokeIndex: 18, par: 3 },
          { number: 17, strokeIndex: 8, par: 5 },
          { number: 18, strokeIndex: 14, par: 4 }
        ],
        createdAt: new Date().toISOString(),
        isDefault: true
      }
    ];

    // Save all default courses
    const allCourses = [...courses, ...defaultCourses];
    localStorage.setItem(COURSES_KEY, JSON.stringify(allCourses));

    return true;
  } catch (error) {
    console.error('Error initializing default courses:', error);
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
