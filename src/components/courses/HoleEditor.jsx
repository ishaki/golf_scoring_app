import { useState } from 'react';

/**
 * HoleEditor Component
 * Table-based editor for course holes
 */
export default function HoleEditor({ holes, onChange, courseType }) {
  const [errors, setErrors] = useState({});

  const holeCount = courseType === '9-hole' ? 9 : 18;

  // Ensure holes array has correct length
  const ensureHoles = () => {
    if (holes.length !== holeCount) {
      const newHoles = Array.from({ length: holeCount }, (_, i) => ({
        number: i + 1,
        strokeIndex: i + 1,
        par: 4
      }));
      onChange(newHoles);
    }
  };

  // Update hole property
  const updateHole = (index, field, value) => {
    const newHoles = [...holes];
    newHoles[index] = {
      ...newHoles[index],
      [field]: field === 'par' ? value : parseInt(value, 10) || 1
    };
    onChange(newHoles);
    validateHoles(newHoles);
  };

  // Validate holes
  const validateHoles = (holesToValidate) => {
    const newErrors = {};
    const strokeIndexes = new Set();

    holesToValidate.forEach((hole, index) => {
      // Check stroke index uniqueness
      if (strokeIndexes.has(hole.strokeIndex)) {
        newErrors[`strokeIndex-${index}`] = 'Duplicate';
      }
      strokeIndexes.add(hole.strokeIndex);

      // Check stroke index range
      if (hole.strokeIndex < 1 || hole.strokeIndex > holeCount) {
        newErrors[`strokeIndex-${index}`] = `Must be 1-${holeCount}`;
      }

      // Check par value
      if (![3, 4, 5].includes(hole.par)) {
        newErrors[`par-${index}`] = 'Invalid';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-assign stroke indexes
  const autoAssignIndexes = () => {
    const newHoles = holes.map((hole, i) => ({
      ...hole,
      strokeIndex: i + 1
    }));
    onChange(newHoles);
    validateHoles(newHoles);
  };

  // Calculate totals
  const totalPar = holes.reduce((sum, h) => sum + (h.par || 0), 0);

  // Ensure holes initialized
  if (holes.length !== holeCount) {
    ensureHoles();
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Hole Configuration
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Total Par: <span className="font-medium">{totalPar}</span>
          </p>
        </div>
        <button
          onClick={autoAssignIndexes}
          className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Auto-Assign Indexes
        </button>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                Hole
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                Stroke Index
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                Par
              </th>
            </tr>
          </thead>
          <tbody>
            {holes.map((hole, index) => (
              <tr key={hole.number} className="hover:bg-gray-50">
                <td className="px-4 py-3 border-b border-gray-200">
                  <span className="font-medium text-gray-900">{hole.number}</span>
                </td>
                <td className="px-4 py-3 border-b border-gray-200">
                  <input
                    type="number"
                    min="1"
                    max={holeCount}
                    value={hole.strokeIndex}
                    onChange={(e) => updateHole(index, 'strokeIndex', e.target.value)}
                    className={`w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                      errors[`strokeIndex-${index}`]
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                  />
                  {errors[`strokeIndex-${index}`] && (
                    <div className="text-xs text-red-600 mt-1">
                      {errors[`strokeIndex-${index}`]}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 border-b border-gray-200">
                  <select
                    value={hole.par}
                    onChange={(e) => updateHole(index, 'par', parseInt(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {holes.map((hole, index) => (
          <div key={hole.number} className="border border-gray-200 rounded-lg p-4">
            <div className="font-semibold text-gray-900 mb-3">Hole {hole.number}</div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Stroke Index
                </label>
                <input
                  type="number"
                  min="1"
                  max={holeCount}
                  value={hole.strokeIndex}
                  onChange={(e) => updateHole(index, 'strokeIndex', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors[`strokeIndex-${index}`]
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                />
                {errors[`strokeIndex-${index}`] && (
                  <div className="text-xs text-red-600 mt-1">
                    {errors[`strokeIndex-${index}`]}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Par</label>
                <select
                  value={hole.par}
                  onChange={(e) => updateHole(index, 'par', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Validation summary */}
      {Object.keys(errors).length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-800">
            Please fix {Object.keys(errors).length} error{Object.keys(errors).length !== 1 ? 's' : ''} before saving
          </div>
        </div>
      )}
    </div>
  );
}
