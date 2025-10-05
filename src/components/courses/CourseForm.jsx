import { useState, useEffect } from 'react';
import HoleEditor from './HoleEditor';
import useCourseStore from '../../store/courseStore';

/**
 * CourseForm Component
 * Form for creating/editing courses
 */
export default function CourseForm({ course, onCancel, onSuccess }) {
  const { createCourse, updateCourse } = useCourseStore();
  const isEditing = !!course;

  const [formData, setFormData] = useState({
    name: '',
    type: '18-hole',
    holes: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        type: course.type,
        holes: [...course.holes]
      });
    } else {
      // Initialize with default holes
      const holeCount = formData.type === '9-hole' ? 9 : 18;
      setFormData(prev => ({
        ...prev,
        holes: Array.from({ length: holeCount }, (_, i) => ({
          number: i + 1,
          strokeIndex: i + 1,
          par: 4
        }))
      }));
    }
  }, [course]);

  // Update holes when type changes
  useEffect(() => {
    if (!isEditing) {
      const holeCount = formData.type === '9-hole' ? 9 : 18;
      setFormData(prev => ({
        ...prev,
        holes: Array.from({ length: holeCount }, (_, i) => ({
          number: i + 1,
          strokeIndex: i + 1,
          par: 4
        }))
      }));
    }
  }, [formData.type, isEditing]);

  // Validate form
  const validate = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Course name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Course name must be 100 characters or less';
    }

    // Validate holes
    const strokeIndexes = new Set();
    formData.holes.forEach((hole, index) => {
      if (strokeIndexes.has(hole.strokeIndex)) {
        newErrors.holes = 'All stroke indexes must be unique';
      }
      strokeIndexes.add(hole.strokeIndex);

      if (![3, 4, 5].includes(hole.par)) {
        newErrors.holes = 'All pars must be 3, 4, or 5';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        await updateCourse(course.id, formData);
      } else {
        await createCourse(formData);
      }

      onSuccess();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Course Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isEditing && course?.isDefault}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
              errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="e.g., Pebble Beach"
          />
          {errors.name && (
            <div className="text-sm text-red-600 mt-1">{errors.name}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Type *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="9-hole"
                checked={formData.type === '9-hole'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                disabled={isEditing}
                className="mr-2"
              />
              <span className="text-gray-700">9-Hole</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="18-hole"
                checked={formData.type === '18-hole'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                disabled={isEditing}
                className="mr-2"
              />
              <span className="text-gray-700">18-Hole</span>
            </label>
          </div>
          {isEditing && (
            <div className="text-sm text-gray-500 mt-1">
              Course type cannot be changed after creation
            </div>
          )}
        </div>
      </div>

      {/* Hole Editor */}
      <HoleEditor
        holes={formData.holes}
        onChange={(holes) => setFormData({ ...formData, holes })}
        courseType={formData.type}
      />

      {/* Error message */}
      {errors.holes && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-800">{errors.holes}</div>
        </div>
      )}

      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-800">{errors.submit}</div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || (isEditing && course?.isDefault)}
          className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Course'}
        </button>
      </div>

      {isEditing && course?.isDefault && (
        <div className="text-sm text-gray-500 text-center">
          Default courses cannot be edited
        </div>
      )}
    </form>
  );
}
