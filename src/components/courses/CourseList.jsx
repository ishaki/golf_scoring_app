import { useState } from 'react';
import useCourseStore from '../../store/courseStore';

/**
 * CourseList Component
 * Displays list of courses with filtering and actions
 */
export default function CourseList({ onEdit }) {
  const { courses, deleteCourse } = useCourseStore();
  const [filter, setFilter] = useState('all'); // 'all', '9-hole', '18-hole'
  const [searchTerm, setSearchTerm] = useState('');

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesType = filter === 'all' || course.type === filter;
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Handle delete
  const handleDelete = (course) => {
    if (course.isDefault) {
      alert('Cannot delete default course');
      return;
    }

    if (window.confirm(`Delete course "${course.name}"?`)) {
      try {
        deleteCourse(course.id);
      } catch (error) {
        alert(error.message);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        />

        {/* Type filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('9-hole')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === '9-hole'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            9-Hole
          </button>
          <button
            onClick={() => setFilter('18-hole')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === '18-hole'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            18-Hole
          </button>
        </div>
      </div>

      {/* Course count */}
      <div className="text-sm text-gray-600">
        {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
      </div>

      {/* Course grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No courses found. Create your first course to get started.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {course.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                      course.type === '9-hole'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {course.type}
                    </span>
                    {course.isDefault && (
                      <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Holes:</span>
                  <span className="font-medium">{course.holes.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Par:</span>
                  <span className="font-medium">
                    {course.holes.reduce((sum, h) => sum + h.par, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => onEdit(course)}
                  className="flex-1 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                  View Details
                </button>
                {!course.isDefault && (
                  <button
                    onClick={() => handleDelete(course)}
                    className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
