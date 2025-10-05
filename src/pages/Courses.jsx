import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useCourseStore from '../store/courseStore';
import CourseList from '../components/courses/CourseList';
import CourseForm from '../components/courses/CourseForm';

/**
 * Courses Page
 * Main course management interface
 */
export default function Courses() {
  const { loadCourses, initializeDefaults } = useCourseStore();
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Load courses on mount
  useEffect(() => {
    initializeDefaults();
    loadCourses();
  }, [initializeDefaults, loadCourses]);

  // Handle create new
  const handleCreateNew = () => {
    setSelectedCourse(null);
    setView('form');
  };

  // Handle edit
  const handleEdit = (course) => {
    setSelectedCourse(course);
    setView('form');
  };

  // Handle cancel
  const handleCancel = () => {
    setSelectedCourse(null);
    setView('list');
  };

  // Handle success
  const handleSuccess = () => {
    loadCourses();
    setSelectedCourse(null);
    setView('list');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-2">
            Create and manage your golf courses
          </p>
        </div>

        {/* Content */}
        {view === 'list' ? (
          <div className="space-y-6">
            {/* Action button */}
            <div className="flex justify-end">
              <button
                onClick={handleCreateNew}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
              >
                + Create New Course
              </button>
            </div>

            {/* Course list */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <CourseList onEdit={handleEdit} />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {selectedCourse ? 'Course Details' : 'Create New Course'}
            </h2>
            <CourseForm
              course={selectedCourse}
              onCancel={handleCancel}
              onSuccess={handleSuccess}
            />
          </div>
        )}
      </div>
    </div>
  );
}
