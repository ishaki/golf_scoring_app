import { useState, useEffect } from 'react';
import { SCORING_SYSTEMS, getDefaultConfig, getPresets, validateConfig } from '../../utils/scoring';

export default function ScoringConfiguration({
  onNext,
  onBack,
  initialConfig = null,
  scoringSystem = SCORING_SYSTEMS.FIGHTER
}) {
  const [scoringConfig, setScoringConfig] = useState(
    initialConfig || getDefaultConfig(scoringSystem)
  );
  const [errors, setErrors] = useState({});
  const [selectedPreset, setSelectedPreset] = useState(null);

  // Get presets for the current scoring system
  const presets = getPresets(scoringSystem);

  // Reset config when scoring system changes
  useEffect(() => {
    if (!initialConfig) {
      setScoringConfig(getDefaultConfig(scoringSystem));
      setSelectedPreset(null);
    }
  }, [scoringSystem, initialConfig]);

  const isSingleWinner = scoringSystem === SCORING_SYSTEMS.SINGLE_WINNER ||
                         scoringSystem === SCORING_SYSTEMS.SINGLE_WINNER_NEW;

  const handleConfigChange = (category, field, value) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);

    // Validate value
    if (isNaN(numValue) || numValue < -10 || numValue > 10) {
      setErrors({
        ...errors,
        [`${category}_${field}`]: 'Value must be between -10 and 10',
      });
      return;
    }

    // Clear error
    const newErrors = { ...errors };
    delete newErrors[`${category}_${field}`];
    setErrors(newErrors);

    // Update config differently based on system type
    if (isSingleWinner) {
      // Single Winner: flat structure
      setScoringConfig(prev => ({
        ...prev,
        [category]: numValue,
      }));
    } else {
      // Fighter: nested structure
      setScoringConfig(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: numValue,
        },
      }));
    }

    setSelectedPreset(null); // Clear preset selection when manually editing
  };

  const handlePresetSelect = (presetKey) => {
    const preset = presets[presetKey];
    if (preset) {
      setScoringConfig(preset.config);
      setSelectedPreset(presetKey);
      setErrors({});
    }
  };

  const handleContinue = () => {
    // Validate configuration
    const validation = validateConfig(scoringSystem, scoringConfig);

    if (!validation.isValid) {
      setErrors({ general: validation.errors.join(', ') });
      return;
    }

    if (Object.keys(errors).length > 0) {
      return;
    }

    onNext(scoringConfig);
  };

  const handleReset = () => {
    setScoringConfig(getDefaultConfig(scoringSystem));
    setSelectedPreset(null);
    setErrors({});
  };

  // Render Single Winner Config (simple, flat structure)
  const renderSingleWinnerConfig = () => (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-green-600">🦅</span>
          Eagle or Better (≤ -2 vs par)
        </h3>
        <div className="flex items-center gap-4">
          <label className="flex-1 text-sm text-gray-700">Points for winning:</label>
          <input
            type="number"
            min="-10"
            max="10"
            value={scoringConfig.eagle || 0}
            onChange={(e) => handleConfigChange('eagle', null, e.target.value)}
            className="w-20 px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 border-gray-300 focus:ring-primary"
          />
          <span className="text-sm text-gray-500 w-16">points</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-blue-600">🐦</span>
          Birdie (-1 vs par)
        </h3>
        <div className="flex items-center gap-4">
          <label className="flex-1 text-sm text-gray-700">Points for winning:</label>
          <input
            type="number"
            min="-10"
            max="10"
            value={scoringConfig.birdie || 0}
            onChange={(e) => handleConfigChange('birdie', null, e.target.value)}
            className="w-20 px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 border-gray-300 focus:ring-primary"
          />
          <span className="text-sm text-gray-500 w-16">points</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-gray-600">⛳</span>
          Par (0 vs par)
        </h3>
        <div className="flex items-center gap-4">
          <label className="flex-1 text-sm text-gray-700">Points for winning:</label>
          <input
            type="number"
            min="-10"
            max="10"
            value={scoringConfig.par || 0}
            onChange={(e) => handleConfigChange('par', null, e.target.value)}
            className="w-20 px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 border-gray-300 focus:ring-primary"
          />
          <span className="text-sm text-gray-500 w-16">points</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-orange-600">🐽</span>
          Bogey (+1 vs par)
        </h3>
        <div className="flex items-center gap-4">
          <label className="flex-1 text-sm text-gray-700">Points for winning:</label>
          <input
            type="number"
            min="-10"
            max="10"
            value={scoringConfig.bogey || 0}
            onChange={(e) => handleConfigChange('bogey', null, e.target.value)}
            className="w-20 px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 border-gray-300 focus:ring-primary"
          />
          <span className="text-sm text-gray-500 w-16">points</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-red-600">⚠️</span>
          Double Bogey or Worse (≥ +2 vs par)
        </h3>
        <div className="flex items-center gap-4">
          <label className="flex-1 text-sm text-gray-700">Points for winning:</label>
          <input
            type="number"
            min="-10"
            max="10"
            value={scoringConfig.doubleBogeyOrWorse || 0}
            onChange={(e) => handleConfigChange('doubleBogeyOrWorse', null, e.target.value)}
            className="w-20 px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 border-gray-300 focus:ring-primary"
          />
          <span className="text-sm text-gray-500 w-16">points</span>
        </div>
      </div>
    </>
  );

  // Render Fighter Config (complex, nested structure)
  const renderFighterConfig = () => (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-green-600">🦅</span>
          Eagle or Better (≤ -2 vs par)
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <label className="flex-1 text-sm text-gray-700">Against lower scores:</label>
            <input
              type="number"
              min="-10"
              max="10"
              value={scoringConfig.eagleOrBetter?.againstLower || 0}
              onChange={(e) => handleConfigChange('eagleOrBetter', 'againstLower', e.target.value)}
              className="w-20 px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 border-gray-300 focus:ring-primary"
            />
            <span className="text-sm text-gray-500 w-16">points</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-blue-600">🐦</span>
          Birdie (-1 vs par)
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <label className="flex-1 text-sm text-gray-700">Against lower scores:</label>
            <input
              type="number"
              min="-10"
              max="10"
              value={scoringConfig.birdie?.againstLower || 0}
              onChange={(e) => handleConfigChange('birdie', 'againstLower', e.target.value)}
              className="w-20 px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 border-gray-300 focus:ring-primary"
            />
            <span className="text-sm text-gray-500 w-16">points</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-gray-600">⛳</span>
          Par (0 vs par)
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <label className="flex-1 text-sm text-gray-700">Against lower scores:</label>
            <input
              type="number"
              min="-10"
              max="10"
              value={scoringConfig.par?.againstLower || 0}
              onChange={(e) => handleConfigChange('par', 'againstLower', e.target.value)}
              className="w-20 px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 border-gray-300 focus:ring-primary"
            />
            <span className="text-sm text-gray-500 w-16">points</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-orange-600">🐽</span>
          Bogey (+1 vs par)
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <label className="flex-1 text-sm text-gray-700">Against lower scores:</label>
            <input
              type="number"
              min="-10"
              max="10"
              value={scoringConfig.bogey?.againstLower || 0}
              onChange={(e) => handleConfigChange('bogey', 'againstLower', e.target.value)}
              className="w-20 px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 border-gray-300 focus:ring-primary"
            />
            <span className="text-sm text-gray-500 w-16">points</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Scoring Configuration</h2>
        <p className="text-gray-600">
          {isSingleWinner
            ? "Configure points awarded when a player wins a hole. Only the player with the lowest score wins points."
            : "Configure point values for different score combinations. Points are awarded based on head-to-head comparisons."
          }
        </p>
      </div>

      {/* Presets Section */}
      {Object.keys(presets).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-3">Quick Presets</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(presets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => handlePresetSelect(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPreset === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-100'
                }`}
                title={preset.description}
              >
                {preset.name}
              </button>
            ))}
          </div>
          {selectedPreset && (
            <p className="text-sm text-blue-700 mt-2">
              {presets[selectedPreset].description}
            </p>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>How it works:</strong>{' '}
          {isSingleWinner
            ? "On each hole, only the player with the lowest net score wins points. Points are based on the winner's gross score vs par. If players tie for lowest score, no one gets points."
            : "Players compare scores head-to-head. Points are awarded when a player scores better than their opponent, based on the winner's gross score vs par."
          }
        </p>
      </div>

      {/* Configuration Inputs */}
      {isSingleWinner ? renderSingleWinnerConfig() : renderFighterConfig()}

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
