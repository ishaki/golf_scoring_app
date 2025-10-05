import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { loadGameById, deleteGame } from '../utils/supabaseStorage';

export default function History() {
  const navigate = useNavigate();
  const { history, loadHistory } = useGameStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      await loadHistory();
      setLoading(false);
    };
    fetchHistory();
  }, [loadHistory]);

  const handleViewGame = async (gameId) => {
    const game = await loadGameById(gameId);
    if (game) {
      // Load game into store and navigate to dashboard
      useGameStore.setState({ game });
      navigate('/dashboard');
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      await deleteGame(gameId);
      await loadHistory();
    }
  };

  const getWinnerName = (game) => {
    if (!game || !game.totals) return 'Unknown';

    const playerScores = Object.entries(game.totals).map(([playerId, points]) => ({
      playerId,
      points,
    }));

    playerScores.sort((a, b) => b.points - a.points);
    const winnerId = playerScores[0]?.playerId;
    const winner = game.players?.find(p => p.id === winnerId);

    return winner?.name || 'Unknown';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-gray-600">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Game History</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No completed games yet</p>
            <button
              onClick={() => navigate('/setup')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Start New Game
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((game) => (
              <div key={game.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold text-gray-800">
                        {game.courseName || 'Golf Game'}
                      </h2>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        Completed
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {formatDate(game.createdAt)}
                    </p>

                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Players:</p>
                      <div className="flex flex-wrap gap-2">
                        {game.players?.map((player) => (
                          <span
                            key={player.id}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {player.name} ({game.totals?.[player.id] || 0} pts)
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Winner:</span> {getWinnerName(game)}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleViewGame(game.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDeleteGame(game.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
