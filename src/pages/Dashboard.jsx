import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import Leaderboard from '../components/dashboard/Leaderboard';
import HoleBreakdown from '../components/dashboard/HoleBreakdown';
import TransactionMatrix from '../components/dashboard/TransactionMatrix';
import VoorView from '../components/dashboard/VoorView';
import GameSummary from '../components/dashboard/GameSummary';
import ShareButton from '../components/dashboard/ShareButton';

export default function Dashboard() {
  const navigate = useNavigate();
  const game = useGameStore((state) => state.game);
  const saveAndClearGame = useGameStore((state) => state.saveAndClearGame);
  const [activeTab, setActiveTab] = useState('leaderboard');

  useEffect(() => {
    // Redirect to setup if no game exists
    if (!game) {
      navigate('/setup');
    }
  }, [game, navigate]);

  if (!game) {
    return null;
  }

  // Check if game was created today (same-day edit allowed)
  const isToday = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const canEditGame = game.isComplete && isToday(game.createdAt);

  const handleNewGame = () => {
    if (confirm('Start a new game? Current game will be saved to history.')) {
      saveAndClearGame();
      navigate('/setup');
    }
  };

  const handleBackToGame = () => {
    if (game.isComplete && !canEditGame) {
      alert('This game was completed on a previous day and can no longer be edited.');
      return;
    }
    navigate('/game');
  };

  const tabs = [
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'breakdown', label: 'Hole Breakdown', icon: '📊' },
    // { id: 'transactions', label: 'Transactions', icon: '💱' }, // Hidden temporarily
    { id: 'voor', label: 'Voor & Point', icon: '⚙️' },
    { id: 'summary', label: 'Summary', icon: '📋' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Game Dashboard</h1>
          <p className="text-gray-600">
            {new Date(game.createdAt).toLocaleDateString()} • {game.players.length} Players
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[120px] px-4 py-4 text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-6">
          {activeTab === 'leaderboard' && (
            <Leaderboard players={game.players} totals={game.totals} />
          )}

          {activeTab === 'breakdown' && (
            <HoleBreakdown players={game.players} holes={game.holes} />
          )}

          {activeTab === 'transactions' && (
            <TransactionMatrix game={game} />
          )}

          {activeTab === 'voor' && (
            <VoorView players={game.players} holes={game.holes} scoringConfig={game.scoringConfig} scoringSystem={game.scoringSystem} />
          )}

          {activeTab === 'summary' && (
            <GameSummary game={game} />
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {(!game.isComplete || canEditGame) && (
              <button
                onClick={handleBackToGame}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors"
              >
                {game.isComplete && canEditGame ? '✏️ Edit Game (Today Only)' : '← Back to Game'}
              </button>
            )}

            <ShareButton game={game} />

            <button
              onClick={handleNewGame}
              className={`${
                game.isComplete && !canEditGame ? 'flex-1' : ''
              } px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors`}
            >
              New Game
            </button>

            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
