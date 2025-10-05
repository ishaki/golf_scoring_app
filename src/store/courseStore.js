import { create } from 'zustand';
import {
  loadCourses as loadCoursesFromStorage,
  saveCourse,
  loadCourseById,
  deleteCourse as deleteCourseFromStorage,
  initializeDefaultCourses,
  combineCourses
} from '../utils/supabaseCourseStorage';

/**
 * Course Store
 * Manages course state and operations
 */
const useCourseStore = create((set, get) => ({
  // State
  courses: [],
  selectedFront9: null,
  selectedBack9: null,
  selectedCourse: null,
  isLoading: false,
  error: null,

  // Actions

  /**
   * Load all courses from storage
   */
  loadCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const courses = await loadCoursesFromStorage();
      set({ courses, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  /**
   * Create new course
   * @param {import('../types').Course} course
   */
  createCourse: async (course) => {
    set({ isLoading: true, error: null });
    try {
      console.log('[CourseStore] Creating course:', course);

      const newCourse = {
        ...course,
        id: `course-${Date.now()}`,
        createdAt: new Date().toISOString(),
        isDefault: false
      };

      console.log('[CourseStore] Calling saveCourse with:', newCourse);
      const result = await saveCourse(newCourse);
      console.log('[CourseStore] Save result:', result);

      // Reload courses from Supabase
      const courses = await loadCoursesFromStorage();
      console.log('[CourseStore] Reloaded courses:', courses.length);

      set({ courses, error: null, isLoading: false });

      return newCourse;
    } catch (error) {
      console.error('[CourseStore] Error creating course:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Update existing course
   * @param {string} id
   * @param {Partial<import('../types').Course>} updates
   */
  updateCourse: async (id, updates) => {
    try {
      const course = await loadCourseById(id);
      if (!course) {
        throw new Error('Course not found');
      }

      if (course.isDefault) {
        throw new Error('Cannot edit default course');
      }

      const updatedCourse = { ...course, ...updates };
      await saveCourse(updatedCourse);

      const courses = await loadCoursesFromStorage();
      set({ courses, error: null });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Delete course
   * @param {string} id
   */
  deleteCourse: async (id) => {
    try {
      await deleteCourseFromStorage(id);
      const courses = await loadCoursesFromStorage();
      set({ courses, error: null });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Initialize default courses
   */
  initializeDefaults: async () => {
    try {
      const initialized = await initializeDefaultCourses();
      if (initialized) {
        const courses = await loadCoursesFromStorage();
        set({ courses });
      }
    } catch (error) {
      set({ error: error.message });
    }
  },

  /**
   * Select front 9 course
   * @param {string} courseId
   */
  selectFront9: (courseId) => {
    const course = get().courses.find(c => c.id === courseId);
    set({
      selectedFront9: course,
      selectedBack9: null, // Reset back 9 when front 9 changes
      selectedCourse: null
    });
  },

  /**
   * Select back 9 course
   * @param {string} courseId
   */
  selectBack9: (courseId) => {
    const course = get().courses.find(c => c.id === courseId);
    set({ selectedBack9: course, selectedCourse: null });
  },

  /**
   * Select 18-hole course
   * @param {string} courseId
   */
  select18Hole: (courseId) => {
    const course = get().courses.find(c => c.id === courseId);
    if (course?.type === '18-hole') {
      set({
        selectedCourse: course,
        selectedFront9: null,
        selectedBack9: null
      });
    }
  },

  /**
   * Get combined course configuration for game
   * @returns {{strokeIndexes: number[], pars: number[], courseName: string} | null}
   */
  getCombinedCourse: () => {
    const { selectedFront9, selectedBack9, selectedCourse } = get();

    // If 18-hole course selected
    if (selectedCourse) {
      return {
        strokeIndexes: selectedCourse.holes.map(h => h.strokeIndex),
        pars: selectedCourse.holes.map(h => h.par),
        courseName: selectedCourse.name
      };
    }

    // If both 9-hole courses selected
    if (selectedFront9 && selectedBack9) {
      return combineCourses(selectedFront9, selectedBack9);
    }

    return null;
  },

  /**
   * Clear course selection
   */
  clearSelection: () => {
    set({
      selectedFront9: null,
      selectedBack9: null,
      selectedCourse: null
    });
  },

  /**
   * Get courses by type
   * @param {'9-hole' | '18-hole'} type
   * @returns {import('../types').Course[]}
   */
  getCoursesByType: (type) => {
    return get().courses.filter(c => c.type === type);
  },

  /**
   * Clear error
   */
  clearError: () => {
    set({ error: null });
  }
}));

export default useCourseStore;
