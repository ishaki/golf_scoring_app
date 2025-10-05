import { getAllPlayerStats } from '../../utils/scoring';
import { calculateAllStrokeHoles } from '../../utils/voor';

export default function GameSummary({ game }) {
  const strokeIndexes = game.holes.map(h => h.strokeIndex);
  const strokeHolesMap = calculateAllStrokeHoles(game.players, strokeIndexes);
  const allStats = getAllPlayerStats(game, strokeHolesMap);

  // Find winner
  const winner = game.players.reduce((prev, current) => {
    return (game.totals[current.id] || 0) > (game.totals[prev.id] || 0) ? current : prev;
  });

  return (
    <div className="space-y-6">
      {/* Winner Banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Winner!</h2>
        <p className="text-4xl font-bold text-gray-900 mb-1">{winner.name}</p>
        <p className="text-2xl text-gray-800">
          {game.totals[winner.id] > 0 ? '+' : ''}
          {game.totals[winner.id]} points
        </p>
      </div>

      {/* Player Statistics */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-primary text-white px-6 py-4">
          <h2 className="text-2xl font-bold">Player Statistics</h2>
          <p className="text-blue-100 text-sm">Performance breakdown by player</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {game.players.map((player) => {
              const stats = allStats[player.id];

              return (
                <div key={player.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                    {player.name}
                  </h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Points:</span>
                      <span className={`font-bold ${stats.totalPoints > 0 ? 'text-green-600' : stats.totalPoints < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {stats.totalPoints > 0 ? '+' : ''}{stats.totalPoints}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Birdies or better:</span>
                      <span className="font-semibold text-birdie">{stats.birdies}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Pars:</span>
                      <span className="font-semibold text-par">{stats.pars}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Bogeys:</span>
                      <span className="font-semibold text-bogey">{stats.bogeys}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Double or worse:</span>
                      <span className="font-semibold text-worse">{stats.worse}</span>
                    </div>

                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Best hole:</span>
                        <span className="font-semibold text-green-600">
                          #{stats.bestHole.number} ({stats.bestHole.points > 0 ? '+' : ''}{stats.bestHole.points} pts)
                        </span>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-gray-600">Worst hole:</span>
                        <span className="font-semibold text-red-600">
                          #{stats.worstHole.number} ({stats.worstHole.points} pts)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Game Info */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Game Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-1">Date</p>
            <p className="font-semibold text-gray-800">
              {new Date(game.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Players</p>
            <p className="font-semibold text-gray-800">{game.players.length}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Holes Completed</p>
            <p className="font-semibold text-gray-800">
              {game.holes.filter(h => Object.keys(h.scores || {}).length === game.players.length).length} / 18
            </p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Total Par</p>
            <p className="font-semibold text-gray-800">
              {game.holes.reduce((sum, h) => sum + h.par, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
