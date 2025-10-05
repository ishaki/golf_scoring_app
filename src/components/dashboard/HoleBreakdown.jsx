import { useState } from 'react';

export default function HoleBreakdown({ players, holes }) {
  const [viewMode, setViewMode] = useState('points'); // 'points' or 'scores'

  const getPointsColor = (points) => {
    if (points > 0) return 'bg-green-100 text-green-800';
    if (points < 0) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-600';
  };

  const getScoreColor = (score, par) => {
    if (!score) return 'bg-gray-50 text-gray-400';
    const diff = score - par;
    if (diff <= -1) return 'bg-birdie-light text-birdie-dark';
    if (diff === 0) return 'bg-par-light text-par-dark';
    if (diff === 1) return 'bg-bogey-light text-bogey-dark';
    return 'bg-worse-light text-worse-dark';
  };

  const calculateRowTotal = (playerId) => {
    return holes.reduce((sum, hole) => {
      if (viewMode === 'points') {
        return sum + (hole.points?.[playerId] || 0);
      } else {
        return sum + (hole.scores?.[playerId] || 0);
      }
    }, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-primary text-white px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Hole-by-Hole Breakdown</h2>
            <p className="text-blue-100 text-sm">Performance per hole</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('points')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'points'
                  ? 'bg-white text-primary'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Points
            </button>
            <button
              onClick={() => setViewMode('scores')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'scores'
                  ? 'bg-white text-primary'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Scores
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="sticky left-0 bg-gray-100 px-4 py-3 text-left font-semibold text-gray-700 z-10">
                Player
              </th>
              {holes.map((hole) => (
                <th key={hole.number} className="px-3 py-3 text-center font-semibold text-gray-700 min-w-[50px]">
                  <div>{hole.number}</div>
                  <div className="text-xs font-normal text-gray-500">Par {hole.par}</div>
                </th>
              ))}
              <th className="sticky right-0 bg-gray-100 px-4 py-3 text-center font-semibold text-gray-700 z-10 border-l-2 border-gray-300">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, playerIndex) => (
              <tr
                key={player.id}
                className={`border-b border-gray-200 ${
                  playerIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="sticky left-0 bg-inherit px-4 py-3 font-semibold text-gray-800 z-10">
                  {player.name}
                </td>
                {holes.map((hole) => {
                  const value = viewMode === 'points'
                    ? (hole.points?.[player.id] || 0)
                    : (hole.scores?.[player.id] || '-');

                  const colorClass = viewMode === 'points'
                    ? getPointsColor(hole.points?.[player.id] || 0)
                    : getScoreColor(hole.scores?.[player.id], hole.par);

                  return (
                    <td key={hole.number} className="px-3 py-3 text-center">
                      <div className={`inline-block px-2 py-1 rounded font-semibold min-w-[40px] ${colorClass}`}>
                        {viewMode === 'points' && value > 0 ? '+' : ''}
                        {value}
                      </div>
                    </td>
                  );
                })}
                <td className="sticky right-0 bg-inherit px-4 py-3 text-center font-bold text-lg z-10 border-l-2 border-gray-300">
                  <span className={viewMode === 'points' ? (calculateRowTotal(player.id) > 0 ? 'text-green-600' : calculateRowTotal(player.id) < 0 ? 'text-red-600' : 'text-gray-600') : 'text-gray-800'}>
                    {viewMode === 'points' && calculateRowTotal(player.id) > 0 ? '+' : ''}
                    {calculateRowTotal(player.id)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-600">
        {viewMode === 'points' ? (
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span>Positive points</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
              <span>Negative points</span>
            </div>
          </div>
        ) : (
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-birdie-light border border-birdie rounded"></div>
              <span>Birdie or better</span>
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
              <span>Double+</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
