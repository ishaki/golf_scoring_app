import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import useAuthStore from '../store/authStore';
import { supabase } from '../lib/supabase';
import Leaderboard from '../components/dashboard/Leaderboard';
import HoleBreakdown from '../components/dashboard/HoleBreakdown';
import TransactionMatrix from '../components/dashboard/TransactionMatrix';
import VoorView from '../components/dashboard/VoorView';
import GameSummary from '../components/dashboard/GameSummary';
import ShareButton from '../components/dashboard/ShareButton';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('game');
  const game = useGameStore((state) => state.game);
  const saveAndClearGame = useGameStore((state) => state.saveAndClearGame);
  const { isAdmin, profile, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [viewingGame, setViewingGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If gameId is provided, load that specific game (for admin viewing)
    if (gameId) {
      loadGameById(gameId);
    } else if (!game) {
      // Redirect to setup if no game exists and no gameId provided
      navigate('/setup');
    }
  }, [gameId, game, navigate]);

  const loadGameById = async (id) => {
    try {
      setLoading(true);
      setError(null);

      console.log('[Dashboard] Loading game by ID:', id);
      
      // Get current user and verify admin status
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      if (!currentUser) {
        setError('Access Denied: Please log in to access this page.');
        return;
      }

      // Fetch user profile to check admin status
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error('[Dashboard] Error fetching profile:', profileError);
        setError('Access Denied: Unable to verify user permissions.');
        return;
      }

      console.log('[Dashboard] User profile:', { user: currentUser.id, role: userProfile?.role });

      if (userProfile?.role !== 'admin') {
        console.log('[Dashboard] Access denied - not admin');
        setError('Access Denied: You need admin privileges to access this page.');
        return;
      }

      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('[Dashboard] Error loading game:', error);
        throw error;
      }

      if (!data) {
        setError('Game not found.');
        return;
      }

      console.log('[Dashboard] Game loaded:', {
        id: data.id,
        course_name: data.course_name,
        is_complete: data.is_complete,
        created_by: data.created_by
      });

      // Convert Supabase data to game format
      const gameData = {
        id: data.id,
        players: data.players || [],
        holes: data.holes || [],
        currentHole: data.current_hole || 1,
        totals: data.totals || {},
        isComplete: data.is_complete || false,
        courseName: data.course_name || 'Unknown Course',
        scoringConfig: data.scoring_config || {},
        scoringSystem: data.scoring_system || 'fighter',
        publicToken: data.public_token,
        isPublic: data.is_public || false,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        created_by: data.created_by
      };

      setViewingGame(gameData);
    } catch (err) {
      console.error('[Dashboard] Error loading game by ID:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Determine which game to display
  const displayGame = viewingGame || game;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!displayGame) {
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

  const canEditGame = displayGame.isComplete && isToday(displayGame.createdAt);

  const handleNewGame = () => {
    if (confirm('Start a new game? Current game will be saved to history.')) {
      saveAndClearGame();
      navigate('/setup');
    }
  };

  const handleBackToGame = () => {
    if (displayGame.isComplete && !canEditGame) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Game Dashboard
            {viewingGame && (
              <span className="ml-3 text-sm font-normal text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                Admin View
              </span>
            )}
          </h1>
          <p className="text-gray-600">
            {new Date(displayGame.createdAt).toLocaleDateString()} • {displayGame.players.length} Players
            {viewingGame && (
              <span className="ml-2 text-sm text-gray-500">
                • Created by: {viewingGame.created_by?.substring(0, 8)}...
              </span>
            )}
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
            <Leaderboard players={displayGame.players} totals={displayGame.totals} />
          )}

          {activeTab === 'breakdown' && (
            <HoleBreakdown players={displayGame.players} holes={displayGame.holes} />
          )}

          {activeTab === 'transactions' && (
            <TransactionMatrix game={displayGame} />
          )}

          {activeTab === 'voor' && (
            <VoorView players={displayGame.players} holes={displayGame.holes} scoringConfig={displayGame.scoringConfig} scoringSystem={displayGame.scoringSystem} />
          )}

          {activeTab === 'summary' && (
            <GameSummary game={displayGame} />
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {(!displayGame.isComplete || canEditGame) && !viewingGame && (
              <button
                onClick={handleBackToGame}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors"
              >
                {displayGame.isComplete && canEditGame ? '✏️ Edit Game (Today Only)' : '← Back to Game'}
              </button>
            )}

            <ShareButton game={displayGame} />

            <button
              onClick={handleNewGame}
              className={`${
                displayGame.isComplete && !canEditGame ? 'flex-1' : ''
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
