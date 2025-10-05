export default function Leaderboard({ players, totals }) {
  // Sort players by points (descending)
  const sortedPlayers = [...players].sort((a, b) => {
    const aPoints = totals[a.id] || 0;
    const bPoints = totals[b.id] || 0;
    return bPoints - aPoints;
  });

  // Determine ranks (handle ties)
  const playersWithRanks = [];
  let currentRank = 1;

  sortedPlayers.forEach((player, index) => {
    const points = totals[player.id] || 0;
    let rank = currentRank;

    // Check if tied with previous player
    if (index > 0) {
      const prevPlayer = playersWithRanks[index - 1];
      const prevPoints = prevPlayer.points;

      if (points === prevPoints) {
        // Same rank as previous player (tie)
        rank = prevPlayer.rank;
      } else {
        // Different points, new rank
        rank = index + 1;
        currentRank = rank;
      }
    }

    playersWithRanks.push({ ...player, points, rank });
  });

  const getRankDisplay = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}${getRankSuffix(rank)}`;
  };

  const getRankSuffix = (rank) => {
    if (rank >= 11 && rank <= 13) return 'th';
    const lastDigit = rank % 10;
    if (lastDigit === 1) return 'st';
    if (lastDigit === 2) return 'nd';
    if (lastDigit === 3) return 'rd';
    return 'th';
  };

  const getPointsColor = (points) => {
    if (points > 0) return 'text-green-600';
    if (points < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const leader = playersWithRanks[0];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-primary text-white px-6 py-4">
        <h2 className="text-2xl font-bold">Leaderboard</h2>
        <p className="text-blue-100 text-sm">Current Standings</p>
      </div>

      <div className="divide-y divide-gray-200">
        {playersWithRanks.map((player, index) => {
          const isLeader = player.rank === 1;
          const pointsBehind = isLeader ? 0 : leader.points - player.points;

          return (
            <div
              key={player.id}
              className={`px-6 py-4 flex items-center justify-between transition-colors ${
                isLeader ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="w-16 text-center">
                  <div className={`text-2xl font-bold ${isLeader ? 'text-yellow-600' : 'text-gray-700'}`}>
                    {getRankDisplay(player.rank)}
                  </div>
                </div>

                {/* Player name */}
                <div>
                  <h3 className={`text-lg font-semibold ${isLeader ? 'text-yellow-900' : 'text-gray-800'}`}>
                    {player.name}
                    {isLeader && (
                      <span className="ml-2 text-sm font-normal text-yellow-600">Leader</span>
                    )}
                  </h3>
                  {!isLeader && pointsBehind > 0 && (
                    <p className="text-sm text-gray-500">
                      {pointsBehind} {pointsBehind === 1 ? 'point' : 'points'} behind
                    </p>
                  )}
                </div>
              </div>

              {/* Points */}
              <div className="text-right">
                <div className={`text-3xl font-bold ${getPointsColor(player.points)}`}>
                  {player.points > 0 ? '+' : ''}{player.points}
                </div>
                <p className="text-sm text-gray-500">points</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Leader:</p>
            <p className="font-semibold text-gray-800">{leader.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Winning Margin:</p>
            <p className="font-semibold text-gray-800">
              {playersWithRanks.length > 1
                ? `${leader.points - playersWithRanks[1].points} points`
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
