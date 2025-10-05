export default function ScoreCard({ players, hole, totals = {} }) {
  const getPointsColor = (points) => {
    if (points > 0) return 'text-green-600';
    if (points < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Current Standings</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {players.map((player, index) => {
          const holePoints = hole?.points?.[player.id] || 0;
          const totalPoints = totals[player.id] || 0;

          return (
            <div key={player.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{player.name}</p>
                  {hole?.scores?.[player.id] && (
                    <p className="text-xs text-gray-500">
                      Hole {hole.number}: {hole.scores[player.id]}
                      {holePoints !== 0 && (
                        <span className={`ml-2 ${getPointsColor(holePoints)}`}>
                          ({holePoints > 0 ? '+' : ''}{holePoints} pts)
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className={`text-xl font-bold ${getPointsColor(totalPoints)}`}>
                  {totalPoints > 0 ? '+' : ''}{totalPoints}
                </p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
