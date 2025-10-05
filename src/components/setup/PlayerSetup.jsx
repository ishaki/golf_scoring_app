import { useState } from 'react';
import { validatePlayerName, validateAllPlayerNames } from '../../utils/validation';

export default function PlayerSetup({ onNext, initialPlayers = [] }) {
  // V2.1: Support 3-6 players
  const [playerCount, setPlayerCount] = useState(
    initialPlayers.length >= 3 && initialPlayers.length <= 6
      ? initialPlayers.length
      : 6
  );
  const [playerNames, setPlayerNames] = useState(() => {
    if (initialPlayers.length >= 3 && initialPlayers.length <= 6) {
      return initialPlayers;
    }
    return Array(playerCount).fill('');
  });
  const [errors, setErrors] = useState({});

  const handleNameChange = (index, value) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);

    // Clear error for this field
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const handleNext = () => {
    // Validate all player names
    const newErrors = {};
    let hasErrors = false;

    // Check individual names
    playerNames.forEach((name, index) => {
      const otherNames = playerNames.filter((_, i) => i !== index);
      const validation = validatePlayerName(name, otherNames);

      if (!validation.valid) {
        newErrors[index] = validation.error;
        hasErrors = true;
      }
    });

    // Check overall validation
    const overallValidation = validateAllPlayerNames(playerNames);
    if (!overallValidation.valid) {
      newErrors.overall = overallValidation.error;
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    // All valid, proceed
    onNext(playerNames.map(name => name.trim()));
  };

  const handlePlayerCountChange = (count) => {
    setPlayerCount(count);
    // Preserve existing names if possible, pad with empty strings or truncate
    const newNames = Array(count).fill('').map((_, i) => playerNames[i] || '');
    setPlayerNames(newNames);
    setErrors({});
  };

  const handleClear = () => {
    setPlayerNames(Array(playerCount).fill(''));
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Player Names</h2>
        <p className="text-gray-600">Select number of players and enter their names</p>
      </div>

      {/* Player count selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Players
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[3, 4, 5, 6].map((count) => (
            <button
              key={count}
              onClick={() => handlePlayerCountChange(count)}
              className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                playerCount === count
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {playerNames.map((name, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Player {index + 1}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(index, e.target.value)}
              placeholder={`Enter player ${index + 1} name`}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors[index]
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
              maxLength={50}
            />
            {errors[index] && (
              <p className="text-red-500 text-sm mt-1">{errors[index]}</p>
            )}
          </div>
        ))}
      </div>

      {errors.overall && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{errors.overall}</p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={handleClear}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={handleNext}
          className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors"
        >
          Next: Configure Voor
        </button>
      </div>
    </div>
  );
}
