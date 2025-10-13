import { useMemo } from 'react';
import { calculateAllStrokeHoles } from '../../utils/voor';

// Default scoring configuration fallback
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

export default function VoorView({ players, holes, scoringConfig }) {
  // Use default config if scoringConfig is null/undefined
  const config = scoringConfig || DEFAULT_SCORING_CONFIG;
  // Calculate stroke holes map
  const strokeHolesMap = useMemo(() => {
    if (!holes || holes.length === 0) return {};
    const strokeIndexes = holes.map(h => h.strokeIndex);
    return calculateAllStrokeHoles(players, strokeIndexes);
  }, [players, holes]);

  // Calculate total strokes received per player
  const strokesReceivedSummary = useMemo(() => {
    const summary = [];

    players.forEach(receiver => {
      let totalStrokesReceived = 0;
      const givers = [];

      // Check each potential giver
      players.forEach(giver => {
        if (giver.id === receiver.id) return;
        const strokes = giver.voorGiven?.[receiver.id] || 0;
        if (strokes > 0) {
          totalStrokesReceived += strokes;
          givers.push({ name: giver.name, strokes });
        }
      });

      if (totalStrokesReceived > 0) {
        summary.push({
          playerId: receiver.id,
          playerName: receiver.name,
          totalStrokes: totalStrokesReceived,
          strokeHoles: strokeHolesMap[receiver.id] || [],
          givers,
        });
      }
    });

    // Sort by total strokes received (descending)
    return summary.sort((a, b) => b.totalStrokes - a.totalStrokes);
  }, [players, strokeHolesMap]);

  return (
    <div className="space-y-6">
      {/* Voor Matrix Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-primary text-white px-6 py-4">
          <h2 className="text-2xl font-bold">Voor Configuration</h2>
          <p className="text-blue-100 text-sm">Handicap strokes between players</p>
        </div>

        <div className="p-6">
          {/* Educational Info */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex items-start">
              <span className="text-2xl mr-3">💡</span>
              <div>
                <p className="font-semibold text-blue-900 mb-1">What is Voor?</p>
                <p className="text-sm text-blue-800 mb-2">
                  Voor = Handicap strokes given from stronger players to weaker players to level the playing field.
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Stroke Allocation:</strong> Strokes are applied to the hardest holes (lowest stroke index numbers).
                </p>
              </div>
            </div>
          </div>

          {/* Voor Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 border-r-2 border-gray-300">
                    Giver → Receiver
                  </th>
                  {players.map(receiver => (
                    <th
                      key={receiver.id}
                      className="px-3 py-3 text-center font-semibold text-gray-700 min-w-[80px]"
                    >
                      {receiver.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {players.map((giver, giverIndex) => (
                  <tr
                    key={giver.id}
                    className={`border-b border-gray-200 ${
                      giverIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-gray-800 border-r-2 border-gray-300">
                      {giver.name}
                    </td>
                    {players.map(receiver => {
                      const isSelf = giver.id === receiver.id;
                      const strokes = giver.voorGiven?.[receiver.id] || 0;

                      return (
                        <td
                          key={receiver.id}
                          className={`px-3 py-3 text-center ${
                            isSelf
                              ? 'bg-gray-200 text-gray-500'
                              : strokes > 0
                                ? 'bg-blue-100 text-blue-900 font-bold'
                                : 'text-gray-400'
                          }`}
                        >
                          {isSelf ? '—' : strokes > 0 ? strokes : '0'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stroke Holes Summary Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-green-600 text-white px-6 py-4">
          <h2 className="text-2xl font-bold">Stroke Holes Summary</h2>
          <p className="text-green-100 text-sm">Holes where each player receives strokes</p>
        </div>

        <div className="p-6">
          {strokesReceivedSummary.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">🏌️</span>
              <p className="text-gray-600 text-lg">No voor strokes configured for this game</p>
              <p className="text-gray-500 text-sm mt-2">All players are playing at scratch (no handicap)</p>
            </div>
          ) : (
            <div className="space-y-4">
              {strokesReceivedSummary.map(player => (
                <div
                  key={player.playerId}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {/* Player Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 text-green-800 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                        {player.totalStrokes}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{player.playerName}</h3>
                        <p className="text-sm text-gray-600">
                          Receives {player.totalStrokes} stroke{player.totalStrokes !== 1 ? 's' : ''} total
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Givers Info */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>From:</strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {player.givers.map((giver, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm"
                        >
                          {giver.name} ({giver.strokes} stroke{giver.strokes !== 1 ? 's' : ''})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stroke Holes */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Stroke Holes:</strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {player.strokeHoles.length === 0 ? (
                        <span className="text-gray-500 text-sm">No holes</span>
                      ) : (
                        player.strokeHoles.map(holeNumber => (
                          <span
                            key={holeNumber}
                            className="inline-flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded font-bold text-sm"
                          >
                            {holeNumber}
                          </span>
                        ))
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Player gets -1 stroke on these {player.strokeHoles.length} hole{player.strokeHoles.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Point Configuration Section */}
      {config && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-green-600 text-white px-6 py-4">
            <h2 className="text-2xl font-bold">Point Configuration</h2>
            <p className="text-green-100">Points awarded when scoring better than opponents</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Eagle or Better */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-emerald-600 text-lg">🦅</span>
                  <h3 className="font-semibold text-emerald-800">Eagle or Better</h3>
                </div>
                <p className="text-sm text-emerald-700 mb-2">≤ -2 vs par</p>
                <div className="text-2xl font-bold text-emerald-600">
                  +{config.eagleOrBetter?.againstLower || 0}
                </div>
                <p className="text-xs text-emerald-600">points vs lower scores</p>
              </div>

              {/* Birdie */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600 text-lg">🐦</span>
                  <h3 className="font-semibold text-green-800">Birdie</h3>
                </div>
                <p className="text-sm text-green-700 mb-2">-1 vs par</p>
                <div className="text-2xl font-bold text-green-600">
                  +{config.birdie?.againstLower || 0}
                </div>
                <p className="text-xs text-green-600">points vs lower scores</p>
              </div>

              {/* Par */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-600 text-lg">⛳</span>
                  <h3 className="font-semibold text-blue-800">Par</h3>
                </div>
                <p className="text-sm text-blue-700 mb-2">0 vs par</p>
                <div className="text-2xl font-bold text-blue-600">
                  +{config.par?.againstLower || 0}
                </div>
                <p className="text-xs text-blue-600">points vs lower scores</p>
              </div>

              {/* Bogey */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-orange-600 text-lg">🐽</span>
                  <h3 className="font-semibold text-orange-800">Bogey</h3>
                </div>
                <p className="text-sm text-orange-700 mb-2">+1 vs par</p>
                <div className="text-2xl font-bold text-orange-600">
                  +{config.bogey?.againstLower || 0}
                </div>
                <p className="text-xs text-orange-600">points vs lower scores</p>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">How Points Work:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Points are awarded when you score better than an opponent</li>
                <li>• The number of points depends on your gross score vs par</li>
                <li>• Example: If you make birdie and opponent makes par, you get {config.birdie?.againstLower || 0} points</li>
                <li>• Example: If you make eagle and opponent makes bogey, you get {config.eagleOrBetter?.againstLower || 0} points</li>
                <li>• Total points per hole sum to zero across all players</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">How to Read the Matrix:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>Rows</strong> = Players who give strokes</li>
          <li>• <strong>Columns</strong> = Players who receive strokes</li>
          <li>• <strong>Blue cells</strong> = Number of strokes given from row player to column player</li>
          <li>• <strong>Gray diagonal</strong> = A player cannot give strokes to themselves</li>
          <li>• <strong>Stroke holes</strong> are calculated using union logic (hole-by-hole basis)</li>
        </ul>
      </div>
    </div>
  );
}
