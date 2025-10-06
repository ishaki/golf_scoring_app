import { useState } from 'react';
import { validateVoor } from '../../utils/validation';
import { getStrokeHoles } from '../../utils/courseConfig';

export default function VoorConfiguration({ playerNames, courseConfig, onNext, onStart, onBack, initialVoor = {} }) {
  // Initialize voor matrix: { playerId: { receiverId: strokes } }
  const [voorMatrix, setVoorMatrix] = useState(initialVoor);
  const [errors, setErrors] = useState({});

  const handleVoorChange = (giverIndex, receiverIndex, value) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);

    // Validate
    const validation = validateVoor(numValue);
    if (!validation.valid && value !== '') {
      setErrors({
        ...errors,
        [`${giverIndex}-${receiverIndex}`]: validation.error,
      });
      return;
    }

    // Clear error
    const newErrors = { ...errors };
    delete newErrors[`${giverIndex}-${receiverIndex}`];
    setErrors(newErrors);

    // Update matrix
    const newMatrix = { ...voorMatrix };
    if (!newMatrix[giverIndex]) {
      newMatrix[giverIndex] = {};
    }
    newMatrix[giverIndex][receiverIndex] = numValue;

    setVoorMatrix(newMatrix);
  };

  const getVoorValue = (giverIndex, receiverIndex) => {
    return voorMatrix[giverIndex]?.[receiverIndex] || 0;
  };

  const handleContinue = () => {
    // Check for reciprocal voor
    const reciprocalErrors = {};
    let hasReciprocal = false;

    for (let i = 0; i < playerNames.length; i++) {
      for (let j = i + 1; j < playerNames.length; j++) {
        const iGivesJ = getVoorValue(i, j) > 0;
        const jGivesI = getVoorValue(j, i) > 0;

        if (iGivesJ && jGivesI) {
          reciprocalErrors[`${i}-${j}`] = `${playerNames[i]} and ${playerNames[j]} are giving strokes to each other`;
          hasReciprocal = true;
        }
      }
    }

    if (hasReciprocal) {
      setErrors(reciprocalErrors);
      return;
    }

    // Use onStart if provided (new flow), otherwise onNext (backward compatibility)
    if (onStart) {
      onStart(voorMatrix);
    } else if (onNext) {
      onNext(voorMatrix);
    }
  };

  const handleSkip = () => {
    if (onStart) {
      onStart({});
    } else if (onNext) {
      onNext({});
    }
  };

  // Calculate stroke holes for a player using UNION logic (same as calculateAllStrokeHoles)
  // Voor is applied hole-by-hole: if ANY giver gives a stroke on a hole, receiver gets it
  const getStrokeHolesForPlayer = (playerIndex) => {
    if (!courseConfig?.strokeIndexes) return [];

    const strokeHolesSet = new Set();

    // Check all givers
    playerNames.forEach((giverName, giverIndex) => {
      if (giverIndex === playerIndex) return; // Skip self

      const strokesGiven = getVoorValue(giverIndex, playerIndex);
      if (strokesGiven > 0) {
        // Get holes where this giver gives strokes
        const giverStrokeHoles = getStrokeHoles(strokesGiven, courseConfig.strokeIndexes);

        // Add to receiver's stroke holes (union of all givers)
        giverStrokeHoles.forEach(hole => strokeHolesSet.add(hole));
      }
    });

    // Convert set to sorted array
    return Array.from(strokeHolesSet).sort((a, b) => a - b);
  };

  const getTotalStrokesGiven = (playerIndex) => {
    let total = 0;
    if (voorMatrix[playerIndex]) {
      Object.values(voorMatrix[playerIndex]).forEach(strokes => {
        total += strokes;
      });
    }
    return total;
  };

  const getTotalStrokesReceived = (playerIndex) => {
    let total = 0;
    for (let giver = 0; giver < playerNames.length; giver++) {
      if (giver !== playerIndex) {
        total += getVoorValue(giver, playerIndex);
      }
    }
    return total;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Voor Configuration</h2>
        <p className="text-gray-600">
          Set handicap strokes (optional). Leave at 0 for no voor.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>How it works:</strong> If Player A gives 2 strokes to Player B,
          then Player B gets -1 stroke on the 2 hardest holes (lowest stroke index).
          On those holes, if they tie, Player B wins.
        </p>
      </div>

      {/* Mobile-friendly list view */}
      <div className="space-y-4 lg:hidden">
        {playerNames.map((giver, giverIndex) => (
          <div key={giverIndex} className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">{giver} gives:</h3>
            <div className="space-y-2">
              {playerNames.map((receiver, receiverIndex) => {
                if (giverIndex === receiverIndex) return null;
                const errorKey = `${giverIndex}-${receiverIndex}`;
                const hasError = errors[errorKey];

                return (
                  <div key={receiverIndex} className="flex items-center gap-2">
                    <label className="flex-1 text-sm text-gray-700">
                      {receiver}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="18"
                      value={getVoorValue(giverIndex, receiverIndex) || ''}
                      onChange={(e) => handleVoorChange(giverIndex, receiverIndex, e.target.value)}
                      placeholder="0"
                      className={`w-20 px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 ${
                        hasError
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-primary'
                      }`}
                    />
                    <span className="text-sm text-gray-500 w-16">strokes</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
              Total given: {getTotalStrokesGiven(giverIndex)} strokes
            </div>
          </div>
        ))}
      </div>

      {/* Desktop matrix view */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-100 p-2 text-sm font-semibold">
                From ↓ To →
              </th>
              {playerNames.map((name, index) => (
                <th key={index} className="border border-gray-300 bg-gray-100 p-2 text-sm font-semibold">
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {playerNames.map((giver, giverIndex) => (
              <tr key={giverIndex}>
                <td className="border border-gray-300 bg-gray-100 p-2 text-sm font-semibold">
                  {giver}
                </td>
                {playerNames.map((receiver, receiverIndex) => {
                  if (giverIndex === receiverIndex) {
                    return (
                      <td key={receiverIndex} className="border border-gray-300 bg-gray-200 p-2 text-center">
                        -
                      </td>
                    );
                  }

                  const errorKey = `${giverIndex}-${receiverIndex}`;
                  const hasError = errors[errorKey];

                  return (
                    <td key={receiverIndex} className="border border-gray-300 p-2">
                      <input
                        type="number"
                        min="0"
                        max="18"
                        value={getVoorValue(giverIndex, receiverIndex) || ''}
                        onChange={(e) => handleVoorChange(giverIndex, receiverIndex, e.target.value)}
                        placeholder="0"
                        className={`w-full px-2 py-1 border rounded text-center focus:outline-none focus:ring-2 ${
                          hasError
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-primary'
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary with Stroke Holes Preview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Summary</h3>
        <div className="space-y-3">
          {playerNames.map((name, index) => {
            const totalStrokes = getTotalStrokesReceived(index);
            const strokeHoles = getStrokeHolesForPlayer(index);

            return (
              <div key={index} className="border-b border-gray-200 pb-2 last:border-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-700">{name}:</span>
                  <span className="text-gray-600">
                    Receives {totalStrokes} stroke{totalStrokes !== 1 ? 's' : ''}
                  </span>
                </div>
                {strokeHoles.length > 0 && (
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Holes:</span>{' '}
                    <span className="inline-flex flex-wrap gap-1 mt-1">
                      {strokeHoles.map((hole) => (
                        <span
                          key={hole}
                          className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium"
                        >
                          {hole}
                        </span>
                      ))}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error messages */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm font-semibold mb-2">Errors:</p>
          <ul className="list-disc list-inside space-y-1">
            {Object.values(errors).map((error, index) => (
              <li key={index} className="text-red-600 text-sm">{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSkip}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Skip (No Voor)
        </button>
        <button
          onClick={handleContinue}
          className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors"
        >
          {onStart ? 'Start Game' : 'Next: Course Setup'}
        </button>
      </div>
    </div>
  );
}
