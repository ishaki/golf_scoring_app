import { useState } from 'react';

const DEFAULT_SCORING_CONFIG = {
  eagleOrBetter: {
    againstLower: 4,
  },
  birdie: {
    againstLower: 2,
  },
  par: {
    againstLower: 1,
  },
  bogey: {
    againstLower: 1,
  },
};

export default function ScoringConfiguration({ onNext, onBack, initialConfig = DEFAULT_SCORING_CONFIG }) {
  const [scoringConfig, setScoringConfig] = useState(initialConfig || DEFAULT_SCORING_CONFIG);
  const [errors, setErrors] = useState({});

  const handleConfigChange = (category, value) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    
    // Validate value
    if (isNaN(numValue) || numValue < -10 || numValue > 10) {
      setErrors({
        ...errors,
        [category]: 'Value must be between -10 and 10',
      });
      return;
    }

    // Clear error
    const newErrors = { ...errors };
    delete newErrors[category];
    setErrors(newErrors);

    // Update config
    setScoringConfig(prev => ({
      ...prev,
      [category]: {
        againstLower: numValue,
      },
    }));
  };

  const getConfigValue = (category) => {
    return scoringConfig[category]?.againstLower || 0;
  };

  const handleContinue = () => {
    if (Object.keys(errors).length > 0) {
      return;
    }
    onNext(scoringConfig);
  };

  const handleReset = () => {
    setScoringConfig(DEFAULT_SCORING_CONFIG);
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Scoring Configuration</h2>
        <p className="text-gray-600">
          Configure point values for different score combinations. Points are awarded based on gross score vs par.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>How it works:</strong> Points are awarded when a player scores better than their opponent.
          For example, if Player A makes birdie and Player B makes par, Player A gets the configured points for birdie vs lower score.
        </p>
      </div>

      {/* Eagle or Better Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-green-600">🦅</span>
          Eagle or Better (≤ -2 vs par)
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <label className="flex-1 text-sm text-gray-700">
              Against lower scores:
            </label>
            <input
              type="number"
              min="-10"
              max="10"
              value={getConfigValue('eagleOrBetter')}
              onChange={(e) => handleConfigChange('eagleOrBetter', e.target.value)}
              className={`w-20 px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 ${
                errors['eagleOrBetter']
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-primary'
              }`}
            />
            <span className="text-sm text-gray-500 w-16">points</span>
          </div>
        </div>
      </div>

      {/* Birdie Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-blue-600">🐦</span>
          Birdie (-1 vs par)
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <label className="flex-1 text-sm text-gray-700">
              Against lower scores:
            </label>
            <input
              type="number"
              min="-10"
              max="10"
              value={getConfigValue('birdie')}
              onChange={(e) => handleConfigChange('birdie', e.target.value)}
              className={`w-20 px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 ${
                errors['birdie']
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-primary'
              }`}
            />
            <span className="text-sm text-gray-500 w-16">points</span>
          </div>
        </div>
      </div>

      {/* Par Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-gray-600">⛳</span>
          Par (0 vs par)
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <label className="flex-1 text-sm text-gray-700">
              Against lower scores:
            </label>
            <input
              type="number"
              min="-10"
              max="10"
              value={getConfigValue('par')}
              onChange={(e) => handleConfigChange('par', e.target.value)}
              className={`w-20 px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 ${
                errors['par']
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-primary'
              }`}
            />
            <span className="text-sm text-gray-500 w-16">points</span>
          </div>
        </div>
      </div>

      {/* Bogey Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-orange-600">🐽</span>
          Bogey (+1 vs par)
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <label className="flex-1 text-sm text-gray-700">
              Against lower scores:
            </label>
            <input
              type="number"
              min="-10"
              max="10"
              value={getConfigValue('bogey')}
              onChange={(e) => handleConfigChange('bogey', e.target.value)}
              className={`w-20 px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 ${
                errors['bogey']
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-primary'
              }`}
            />
            <span className="text-sm text-gray-500 w-16">points</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Configuration Summary</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Eagle or better:</strong> {getConfigValue('eagleOrBetter')} points against lower scores</p>
          <p><strong>Birdie:</strong> {getConfigValue('birdie')} points against lower scores</p>
          <p><strong>Par:</strong> {getConfigValue('par')} points against lower scores</p>
          <p><strong>Bogey:</strong> {getConfigValue('bogey')} points against lower scores</p>
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
          onClick={handleReset}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Reset to Defaults
        </button>
        <button
          onClick={handleContinue}
          className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
