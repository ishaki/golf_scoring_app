import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import useAuthStore from '../store/authStore';

export default function Home() {
  const navigate = useNavigate();
  const { game, loadGame } = useGameStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkForGame = async () => {
      console.log('[Home] Checking for active game, user:', user?.id);
      if (user) {
        console.log('[Home] User authenticated, loading game...');
        await loadGame();
        console.log('[Home] Load complete, current game:', game);
      } else {
        console.log('[Home] No user, skipping game load');
      }
      setLoading(false);
    };
    checkForGame();
  }, [user, loadGame]);

  const handleResumeGame = () => {
    navigate('/game');
  };

  const formatPlayerNames = (players) => {
    if (!players || players.length === 0) return '';
    if (players.length === 1) return players[0].name;
    if (players.length === 2) return `${players[0].name} & ${players[1].name}`;
    return `${players[0].name}, ${players[1].name} & ${players.length - 2} more`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">Fighter Golf Score</h1>
        <p className="text-gray-600 mb-8">F2F Golf Scoring System</p>

        <div className="space-y-4">
          {/* Resume Game Banner - Shows if there's an active game */}
          {!loading && game && !game.isComplete && (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-lg shadow-lg mb-6 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-bold text-lg">Game In Progress</span>
                </div>
              </div>
              <div className="text-left space-y-2 mb-4">
                <p className="text-sm opacity-90">
                  <strong>Course:</strong> {game.courseName || 'Unknown'}
                </p>
                <p className="text-sm opacity-90">
                  <strong>Players:</strong> {formatPlayerNames(game.players)}
                </p>
                <p className="text-sm opacity-90">
                  <strong>Current Hole:</strong> {game.currentHole} of 18
                </p>
              </div>
              <button
                onClick={handleResumeGame}
                className="w-full bg-white text-orange-600 py-3 px-6 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-md"
              >
                ▶ Resume Game
              </button>
            </div>
          )}

          <Link
            to="/setup"
            className="block w-full bg-primary text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-primary-hover transition-colors shadow-md"
          >
            {game && !game.isComplete ? '+ Start New Game' : 'New Game'}
          </Link>

          <Link
            to="/courses"
            className="block w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-md"
          >
            Manage Courses
          </Link>

          <Link
            to="/history"
            className="block w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors shadow-md"
          >
            Game History
          </Link>
        </div>

        <div className="mt-12">
          <details className="text-left bg-white rounded-lg shadow-sm p-4">
            <summary className="font-semibold cursor-pointer text-gray-700">
              How to Play
            </summary>
            <div className="mt-4 text-sm text-gray-600 space-y-2">
              <p><strong>Birdie or Better:</strong> +2 points from worse players</p>
              <p><strong>Par:</strong> +1 from worse, -2 from birdie</p>
              <p><strong>Bogey:</strong> +1 from worse, -1 from par, -2 from birdie</p>
              <p><strong>Voor:</strong> Handicap strokes on hardest holes</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
