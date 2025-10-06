import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Leaderboard from '../components/dashboard/Leaderboard';
import HoleBreakdown from '../components/dashboard/HoleBreakdown';
import TransactionMatrix from '../components/dashboard/TransactionMatrix';
import VoorView from '../components/dashboard/VoorView';
import GameSummary from '../components/dashboard/GameSummary';

export default function PublicDashboard() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('leaderboard');

  useEffect(() => {
    loadPublicGame();
  }, [token]);

  // Auto-refresh for live games (every 60 seconds)
  useEffect(() => {
    if (!game || game.is_complete) return;

    const interval = setInterval(() => {
      console.log('[PublicDashboard] Auto-refreshing live game...');
      loadPublicGame();
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, [game?.is_complete]);

  const loadPublicGame = async () => {
    console.log('[PublicDashboard] Loading public game with token:', token);
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('games')
        .select('*')
        .eq('public_token', token)
        .eq('is_public', true)
        .single();

      if (fetchError) {
        console.error('[PublicDashboard] Error fetching game:', fetchError);
        throw new Error('Game not found or not publicly shared');
      }

      if (!data) {
        throw new Error('Game not found');
      }

      console.log('[PublicDashboard] Game loaded:', data);
      setGame(data);
    } catch (err) {
      console.error('[PublicDashboard] Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'breakdown', label: 'Hole Breakdown', icon: '📊' },
    // { id: 'transactions', label: 'Transactions', icon: '💱' }, // Hidden temporarily
    { id: 'voor', label: 'Voor', icon: '⚙️' },
    { id: 'summary', label: 'Summary', icon: '📋' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Game Not Available</h1>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!game) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Public View Banner */}
        <div className={`${
          game.is_complete
            ? 'bg-yellow-50 border-yellow-400'
            : 'bg-orange-50 border-orange-500'
        } border-l-4 p-4 mb-6 rounded-r-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">{game.is_complete ? '👁️' : '🔴'}</span>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-semibold ${game.is_complete ? 'text-yellow-800' : 'text-orange-800'}`}>
                  {game.is_complete ? 'Public View - Read Only' : 'LIVE GAME 🔴'}
                </p>
                <p className={`text-sm ${game.is_complete ? 'text-yellow-700' : 'text-orange-700'}`}>
                  {game.is_complete
                    ? 'You are viewing a shared game dashboard'
                    : 'Updates automatically every 60 seconds'}
                </p>
              </div>
            </div>
            {!game.is_complete && (
              <div className="flex items-center gap-2">
                <div className="animate-pulse bg-red-500 rounded-full h-3 w-3"></div>
                <span className="text-sm font-semibold text-orange-800">Live</span>
              </div>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {game.course_name || 'Golf Game'} Dashboard
          </h1>
          <p className="text-gray-600">
            {new Date(game.created_at).toLocaleDateString()} • {game.players.length} Players
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
            <VoorView players={game.players} holes={game.holes} />
          )}

          {activeTab === 'summary' && (
            <GameSummary game={game} />
          )}
        </div>

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Like what you see?</h2>
          <p className="mb-6 text-blue-100">
            Create your own golf scoring games and track your performance
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-md"
          >
            Create Your Own Game
          </button>
        </div>
      </div>
    </div>
  );
}
