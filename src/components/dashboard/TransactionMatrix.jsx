import { calculateTransactionMatrix } from '../../utils/scoring';
import { calculateAllStrokeHoles } from '../../utils/voor';

export default function TransactionMatrix({ game }) {
  const strokeIndexes = game.holes.map(h => h.strokeIndex);
  const strokeHolesMap = calculateAllStrokeHoles(game.players, strokeIndexes);
  const matrix = calculateTransactionMatrix(game, strokeHolesMap);

  const getCellColor = (points) => {
    if (points > 0) return 'bg-green-100 text-green-800';
    if (points < 0) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-600';
  };

  const getCellIntensity = (points) => {
    const abs = Math.abs(points);
    if (abs >= 20) return 'font-bold text-lg';
    if (abs >= 10) return 'font-semibold';
    return '';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-primary text-white px-6 py-4">
        <h2 className="text-2xl font-bold">Transaction Matrix</h2>
        <p className="text-blue-100 text-sm">Points won/lost between players</p>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-2 border-gray-300 bg-gray-100 p-3 text-left font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">↓</span>
                    <span>From</span>
                    <span className="text-gray-500">→ To</span>
                  </div>
                </th>
                {game.players.map((player) => (
                  <th key={player.id} className="border-2 border-gray-300 bg-gray-100 p-3 text-center font-semibold text-gray-700 min-w-[100px]">
                    {player.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {game.players.map((fromPlayer) => (
                <tr key={fromPlayer.id}>
                  <td className="border-2 border-gray-300 bg-gray-100 p-3 font-semibold text-gray-800">
                    {fromPlayer.name}
                  </td>
                  {game.players.map((toPlayer) => {
                    if (fromPlayer.id === toPlayer.id) {
                      return (
                        <td key={toPlayer.id} className="border-2 border-gray-300 bg-gray-200 p-3 text-center">
                          <span className="text-gray-400">-</span>
                        </td>
                      );
                    }

                    const points = matrix[fromPlayer.id]?.[toPlayer.id] || 0;
                    const colorClass = getCellColor(points);
                    const intensityClass = getCellIntensity(points);

                    return (
                      <td key={toPlayer.id} className="border-2 border-gray-300 p-3 text-center">
                        <div className={`inline-block px-3 py-2 rounded-lg ${colorClass} ${intensityClass}`}>
                          {points > 0 ? '+' : ''}{points}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 space-y-3">
          <div className="text-sm text-gray-600">
            <p className="font-semibold mb-2">How to read this matrix:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Each cell shows net points that <strong>row player</strong> won/lost from <strong>column player</strong></li>
              <li><span className="text-green-700 font-semibold">Positive numbers</span> mean you gained points from that player</li>
              <li><span className="text-red-700 font-semibold">Negative numbers</span> mean you lost points to that player</li>
              <li>Diagonal cells (player vs self) are not applicable</li>
            </ul>
          </div>

          {/* Top Winners/Losers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Biggest Winner (Head-to-Head)</h4>
              {(() => {
                let maxPoints = -Infinity;
                let winner = null;
                let loser = null;

                game.players.forEach((p1) => {
                  game.players.forEach((p2) => {
                    if (p1.id !== p2.id) {
                      const points = matrix[p1.id]?.[p2.id] || 0;
                      if (points > maxPoints) {
                        maxPoints = points;
                        winner = p1;
                        loser = p2;
                      }
                    }
                  });
                });

                return maxPoints > 0 ? (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{winner?.name}</span> won{' '}
                    <span className="text-green-600 font-bold">+{maxPoints}</span> points from{' '}
                    <span className="font-semibold">{loser?.name}</span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">No dominant matchup</p>
                );
              })()}
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Biggest Loser (Head-to-Head)</h4>
              {(() => {
                let minPoints = Infinity;
                let loser = null;
                let winner = null;

                game.players.forEach((p1) => {
                  game.players.forEach((p2) => {
                    if (p1.id !== p2.id) {
                      const points = matrix[p1.id]?.[p2.id] || 0;
                      if (points < minPoints) {
                        minPoints = points;
                        loser = p1;
                        winner = p2;
                      }
                    }
                  });
                });

                return minPoints < 0 ? (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{loser?.name}</span> lost{' '}
                    <span className="text-red-600 font-bold">{minPoints}</span> points to{' '}
                    <span className="font-semibold">{winner?.name}</span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">No dominant matchup</p>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
