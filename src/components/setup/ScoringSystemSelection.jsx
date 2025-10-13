import React, { useState } from 'react';
import { SCORING_SYSTEMS } from '../../utils/scoring';

/**
 * Scoring System Selection Component
 * Allows users to choose between different scoring systems
 */
function ScoringSystemSelection({ initialSystem = SCORING_SYSTEMS.FIGHTER, onContinue, onBack }) {
  const [selectedSystem, setSelectedSystem] = useState(initialSystem);

  const handleContinue = () => {
    onContinue(selectedSystem);
  };

  const handleBack = () => {
    onBack();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Scoring System</h2>
        <p className="text-gray-600">
          Select how points will be calculated for this game.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {/* Fighter Scoring System */}
        <div
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
            selectedSystem === SCORING_SYSTEMS.FIGHTER
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedSystem(SCORING_SYSTEMS.FIGHTER)}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <input
                type="radio"
                name="scoringSystem"
                value={SCORING_SYSTEMS.FIGHTER}
                checked={selectedSystem === SCORING_SYSTEMS.FIGHTER}
                onChange={() => setSelectedSystem(SCORING_SYSTEMS.FIGHTER)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fighter Scoring</h3>
              <p className="text-gray-600 mb-3">
                Players compete head-to-head on each hole. Points are awarded based on net score comparisons 
                with special rules for handicap (voor) holes.
              </p>
              <div className="text-sm text-gray-500">
                <ul className="list-disc list-inside space-y-1">
                  <li>Compare net scores against all other players</li>
                  <li>Points based on gross score vs par</li>
                  <li>Special tie-breaking rules for handicap holes</li>
                  <li>Zero-sum scoring (total points = 0)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Single Winner Scoring System */}
        <div
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
            selectedSystem === SCORING_SYSTEMS.SINGLE_WINNER
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedSystem(SCORING_SYSTEMS.SINGLE_WINNER)}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <input
                type="radio"
                name="scoringSystem"
                value={SCORING_SYSTEMS.SINGLE_WINNER}
                checked={selectedSystem === SCORING_SYSTEMS.SINGLE_WINNER}
                onChange={() => setSelectedSystem(SCORING_SYSTEMS.SINGLE_WINNER)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Single Winner Scoring</h3>
              <p className="text-gray-600 mb-3">
                The player with the lowest score on each hole wins all the points for that hole.
              </p>
              <div className="text-sm text-gray-500">
                <ul className="list-disc list-inside space-y-1">
                  <li>Only the lowest scorer gets points</li>
                  <li>Points based on winner's gross score vs par</li>
                  <li>Simple and straightforward</li>
                  <li>Can result in large point swings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default ScoringSystemSelection;
