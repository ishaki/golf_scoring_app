import { useState, useEffect } from 'react';
import { validateScore } from '../../utils/validation';

export default function HoleInput({ hole, players, strokeHolesMap, onScoreChange, scores = {} }) {
  const [localScores, setLocalScores] = useState(scores);
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});

  useEffect(() => {
    setLocalScores(scores);
  }, [scores, hole.number]);

  const handleScoreChange = (playerId, value) => {
    const numValue = value === '' ? null : parseInt(value, 10);

    // Update local state
    const newScores = { ...localScores, [playerId]: numValue };
    setLocalScores(newScores);

    // Validate
    if (numValue !== null) {
      const validation = validateScore(numValue, hole.par);

      const newErrors = { ...errors };
      const newWarnings = { ...warnings };

      if (!validation.valid) {
        newErrors[playerId] = validation.error;
        delete newWarnings[playerId];
      } else {
        delete newErrors[playerId];
        if (validation.warning) {
          newWarnings[playerId] = validation.warning;
        } else {
          delete newWarnings[playerId];
        }
      }

      setErrors(newErrors);
      setWarnings(newWarnings);
    }

    // Notify parent
    onScoreChange(playerId, numValue);
  };

  const getScoreDiff = (score) => {
    if (score === null || score === undefined) return null;
    return score - hole.par;
  };

  const getScoreColor = (playerId) => {
    const score = localScores[playerId];
    if (!score) return 'border-gray-300';

    const hasStroke = strokeHolesMap[playerId]?.includes(hole.number);
    const netScore = hasStroke ? score - 1 : score;
    const diff = netScore - hole.par;

    if (diff <= -2) return 'border-eagle bg-eagle-light'; // Eagle or better
    if (diff === -1) return 'border-birdie bg-birdie-light'; // Birdie
    if (diff === 0) return 'border-par bg-par-light'; // Par
    if (diff === 1) return 'border-bogey bg-bogey-light'; // Bogey
    return 'border-worse bg-worse-light'; // Double bogey+
  };

  const playerHasStroke = (playerId) => {
    return strokeHolesMap[playerId]?.includes(hole.number);
  };

  return (
    <div className="space-y-4">
      {/* Hole header */}
      <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-primary">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Hole {hole.number}</h2>
            <p className="text-gray-600">Par {hole.par}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Stroke Index</p>
            <p className="text-xl font-semibold text-gray-700">{hole.strokeIndex}</p>
          </div>
        </div>
      </div>

      {/* Voor indicators */}
      {Object.keys(strokeHolesMap).some(id => strokeHolesMap[id]?.includes(hole.number)) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Voor on this hole:</strong>{' '}
            {players
              .filter(p => playerHasStroke(p.id))
              .map(p => p.name)
              .join(', ')}
          </p>
        </div>
      )}

      {/* Score inputs */}
      <div className="space-y-3">
        {players.map((player) => {
          const hasStroke = playerHasStroke(player.id);
          const score = localScores[player.id];

          return (
            <div key={player.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3">
                {/* Player name with stroke indicator */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">
                      {player.name}
                    </span>
                    {hasStroke && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                        ★ Voor
                      </span>
                    )}
                  </div>
                  {hasStroke && score && (
                    <p className="text-xs text-gray-500 mt-1">
                      Net: {score - 1} ({score - 1 - hole.par > 0 ? '+' : ''}{score - 1 - hole.par})
                    </p>
                  )}
                </div>

                {/* Score input */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={score || ''}
                    onChange={(e) => handleScoreChange(player.id, e.target.value)}
                    placeholder={hole.par.toString()}
                    className={`w-20 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${getScoreColor(
                      player.id
                    )}`}
                  />
                  {score && (
                    <div className="text-sm text-gray-600 w-12">
                      {getScoreDiff(score) === 0 && 'Par'}
                      {getScoreDiff(score) < 0 && `${getScoreDiff(score)}`}
                      {getScoreDiff(score) > 0 && `+${getScoreDiff(score)}`}
                    </div>
                  )}
                </div>
              </div>

              {/* Error or warning */}
              {errors[player.id] && (
                <p className="text-red-500 text-sm mt-2">{errors[player.id]}</p>
              )}
              {warnings[player.id] && !errors[player.id] && (
                <p className="text-yellow-600 text-sm mt-2">{warnings[player.id]}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Score legend */}
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs text-gray-600 mb-2 font-semibold">Color Guide:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-eagle-light border border-eagle rounded"></div>
            <span>Eagle or better</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-birdie-light border border-birdie rounded"></div>
            <span>Birdie</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-par-light border border-par rounded"></div>
            <span>Par</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-bogey-light border border-bogey rounded"></div>
            <span>Bogey</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-worse-light border border-worse rounded"></div>
            <span>Double or worse</span>
          </div>
        </div>
      </div>
    </div>
  );
}
