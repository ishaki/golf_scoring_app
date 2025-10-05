import { useState, useEffect } from 'react';
import useCourseStore from '../../store/courseStore';

export default function CourseSetup({ onStart, onBack }) {
  const { courses, loadCourses, getCoursesByType, getCombinedCourse, select18Hole, selectFront9, selectBack9, selectedFront9, selectedBack9, selectedCourse } = useCourseStore();

  const [selected18HoleId, setSelected18HoleId] = useState(null);
  const [selectedFront9Id, setSelectedFront9Id] = useState(null);
  const [selectedBack9Id, setSelectedBack9Id] = useState(null);

  // Load courses on mount
  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Get filtered courses
  const courses18Hole = getCoursesByType('18-hole');
  const courses9Hole = getCoursesByType('9-hole');

  // Handle 18-hole selection
  const handleSelect18Hole = (courseId) => {
    setSelected18HoleId(courseId);
    setSelectedFront9Id(null);
    setSelectedBack9Id(null);
    select18Hole(courseId);
  };

  // Handle front 9 selection
  const handleSelectFront9 = (courseId) => {
    setSelectedFront9Id(courseId);
    setSelected18HoleId(null);
    selectFront9(courseId);
  };

  // Handle back 9 selection
  const handleSelectBack9 = (courseId) => {
    setSelectedBack9Id(courseId);
    setSelected18HoleId(null);
    selectBack9(courseId);
  };

  // Handle start
  const handleStart = () => {
    const combinedCourse = getCombinedCourse();

    if (!combinedCourse) {
      alert('Please select a course configuration');
      return;
    }

    const config = {
      pars: combinedCourse.pars,
      strokeIndexes: combinedCourse.strokeIndexes,
      courseName: combinedCourse.courseName
    };

    onStart(config);
  };

  // Check if can start
  const canStart = selectedCourse || (selectedFront9 && selectedBack9);

  // Get combined course preview
  const combinedCourse = getCombinedCourse();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Course Setup</h2>
        <p className="text-gray-600">Choose a course configuration</p>
      </div>

      {/* 18-Hole Courses */}
      {courses18Hole.length > 0 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            18-Hole Courses
          </label>

          {courses18Hole.map((course) => (
            <div
              key={course.id}
              onClick={() => handleSelect18Hole(course.id)}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                selected18HoleId === course.id
                  ? 'border-primary bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="course"
                  checked={selected18HoleId === course.id}
                  onChange={() => handleSelect18Hole(course.id)}
                  className="w-4 h-4 text-primary"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{course.name}</h3>
                  <p className="text-sm text-gray-600">
                    Total Par: {course.holes.reduce((sum, h) => sum + h.par, 0)}
                  </p>
                  <div className="text-xs text-gray-500 mt-1">
                    Par 3s: {course.holes.filter(h => h.par === 3).length} |
                    Par 4s: {course.holes.filter(h => h.par === 4).length} |
                    Par 5s: {course.holes.filter(h => h.par === 5).length}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 9-Hole Course Combination */}
      {courses9Hole.length > 0 && (
        <div className="space-y-4">
          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Or Combine Two 9-Hole Courses
            </label>

            {/* Front 9 */}
            <div className="space-y-2 mb-4">
              <label className="block text-xs font-medium text-gray-600">
                Front 9 (Holes 1-9)
              </label>
              <select
                value={selectedFront9Id || ''}
                onChange={(e) => handleSelectFront9(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Select front 9 course...</option>
                {courses9Hole.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} (Par {course.holes.reduce((sum, h) => sum + h.par, 0)})
                  </option>
                ))}
              </select>
            </div>

            {/* Back 9 */}
            {selectedFront9Id && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600">
                  Back 9 (Holes 10-18)
                </label>
                <select
                  value={selectedBack9Id || ''}
                  onChange={(e) => handleSelectBack9(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select back 9 course...</option>
                  {courses9Hole
                    .filter((c) => c.id !== selectedFront9Id)
                    .map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name} (Par {course.holes.reduce((sum, h) => sum + h.par, 0)})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Course Details Preview */}
      {combinedCourse && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">
            Selected: {combinedCourse.courseName}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700 mb-2">Front 9</p>
              <div className="space-y-1">
                {combinedCourse.pars.slice(0, 9).map((par, i) => (
                  <div key={i} className="flex justify-between text-gray-600">
                    <span>Hole {i + 1}:</span>
                    <span>Par {par}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold text-gray-800 pt-1 border-t">
                  <span>Total:</span>
                  <span>
                    Par {combinedCourse.pars.slice(0, 9).reduce((sum, p) => sum + p, 0)}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-2">Back 9</p>
              <div className="space-y-1">
                {combinedCourse.pars.slice(9, 18).map((par, i) => (
                  <div key={i} className="flex justify-between text-gray-600">
                    <span>Hole {i + 10}:</span>
                    <span>Par {par}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold text-gray-800 pt-1 border-t">
                  <span>Total:</span>
                  <span>
                    Par {combinedCourse.pars.slice(9, 18).reduce((sum, p) => sum + p, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Stroke Index:</strong> Determines which holes players receive voor strokes on.
          Lower index = harder hole. Players with handicap strokes get them on the hardest holes first.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleStart}
          disabled={!canStart}
          className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
