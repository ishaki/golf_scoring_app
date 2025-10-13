import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';

export default function AdminCourseManagement() {
  const { profile, isAdmin } = useAuthStore();
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    if (!isAdmin()) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }

    loadAllCourses();
  }, [isAdmin]);

  const loadAllCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles!courses_created_by_fkey(display_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAllCourses(data || []);
    } catch (err) {
      console.error('Error loading all courses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCoursePublic = async (courseId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_public: !currentStatus })
        .eq('id', courseId);

      if (error) throw error;

      // Refresh the list
      await loadAllCourses();
    } catch (err) {
      console.error('Error updating course:', err);
      setError(err.message);
    }
  };

  const deleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      // Refresh the list
      await loadAllCourses();
    } catch (err) {
      console.error('Error deleting course:', err);
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course management...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAllCourses}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Management</h1>
          <p className="text-gray-600">
            Manage all courses created by users. You can make courses public, edit them, or delete them.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Courses</h3>
            <p className="text-3xl font-bold text-primary">{allCourses.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Public Courses</h3>
            <p className="text-3xl font-bold text-green-600">
              {allCourses.filter(course => course.is_public).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Default Courses</h3>
            <p className="text-3xl font-bold text-blue-600">
              {allCourses.filter(course => course.is_default).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">User Courses</h3>
            <p className="text-3xl font-bold text-purple-600">
              {allCourses.filter(course => !course.is_default).length}
            </p>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Courses</h2>
          </div>
          
          {allCourses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No courses found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{course.name}</div>
                        <div className="text-sm text-gray-500 font-mono">{course.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.profiles?.display_name || 'System'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          {course.is_default && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-blue-600 bg-blue-100">
                              Default
                            </span>
                          )}
                          {course.is_public && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-green-600 bg-green-100">
                              Public
                            </span>
                          )}
                          {!course.is_public && !course.is_default && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-gray-600 bg-gray-100">
                              Private
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(course.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {!course.is_default && (
                            <>
                              <button
                                onClick={() => toggleCoursePublic(course.id, course.is_public)}
                                className={`px-3 py-1 text-xs rounded ${
                                  course.is_public
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              >
                                {course.is_public ? 'Make Private' : 'Make Public'}
                              </button>
                              <button
                                onClick={() => deleteCourse(course.id)}
                                className="px-3 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200"
                              >
                                Delete
                              </button>
                            </>
                          )}
                          {course.is_default && (
                            <span className="text-xs text-gray-500">System Course</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={loadAllCourses}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
