import { useState } from 'react';

export default function Navigation({
  currentHole,
  totalHoles = 18,
  onPrevious,
  onNext,
  onJumpToHole,
  canGoNext = true,
  onViewDashboard,
}) {
  const [showHoleSelector, setShowHoleSelector] = useState(false);

  const handleJumpToHole = (holeNumber) => {
    onJumpToHole(holeNumber);
    setShowHoleSelector(false);
  };

  const getProgress = () => {
    return Math.round((currentHole / totalHoles) * 100);
  };

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{currentHole} of {totalHoles} holes</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 rounded-full"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3">
        <button
          onClick={onPrevious}
          disabled={currentHole === 1}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            currentHole === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ← Previous
        </button>

        <button
          onClick={() => setShowHoleSelector(!showHoleSelector)}
          className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:border-primary hover:text-primary transition-colors"
        >
          Jump to Hole ▼
        </button>

        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            canGoNext
              ? 'bg-primary text-white hover:bg-primary-hover'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {currentHole === totalHoles ? 'Finish' : 'Next'} →
        </button>
      </div>

      {/* Hole selector dropdown */}
      {showHoleSelector && (
        <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-lg">
          <p className="text-sm font-semibold text-gray-700 mb-3">Select Hole:</p>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: totalHoles }, (_, i) => i + 1).map((holeNum) => (
              <button
                key={holeNum}
                onClick={() => handleJumpToHole(holeNum)}
                className={`h-12 rounded-lg font-semibold transition-colors ${
                  holeNum === currentHole
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {holeNum}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* View dashboard button */}
      {onViewDashboard && (
        <button
          onClick={onViewDashboard}
          className="w-full px-4 py-3 bg-white border-2 border-primary text-primary rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          View Dashboard
        </button>
      )}
    </div>
  );
}
