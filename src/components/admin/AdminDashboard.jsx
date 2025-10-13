import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';

export default function AdminDashboard() {
  const { profile, isAdmin, user } = useAuthStore();
  const [allGames, setAllGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAdmin()) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }

    loadAllGames();
  }, [isAdmin]);

  const loadAllGames = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[AdminDashboard] Loading all games...');
      console.log('[AdminDashboard] Current user:', user?.id);
      console.log('[AdminDashboard] Is admin:', isAdmin());

      // First try simple query without join
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('[AdminDashboard] Query error:', error);
        throw error;
      }

      console.log('[AdminDashboard] Query result:', {
        dataCount: data?.length || 0,
        games: data?.map(g => ({
          id: g.id,
          course_name: g.course_name,
          is_complete: g.is_complete,
          created_by: g.created_by
        }))
      });

      setAllGames(data || []);
    } catch (err) {
      console.error('[AdminDashboard] Error loading all games:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGameStatus = (game) => {
    if (game.is_complete) return 'Completed';
    return `In Progress (Hole ${game.current_hole})`;
  };

  const getGameStatusColor = (game) => {
    if (game.is_complete) return 'text-green-600 bg-green-100';
    return 'text-blue-600 bg-blue-100';
  };

  const handleResumeGame = (gameId) => {
    // Navigate to home page where the resume functionality will work
    // The home page will automatically load the current game (admin's own games only)
    window.location.href = '/';
  };

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
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
            onClick={loadAllGames}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            View all games created by all users. You can see game details and resume only games you created yourself.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Games</h3>
            <p className="text-3xl font-bold text-primary">{allGames.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed Games</h3>
            <p className="text-3xl font-bold text-green-600">
              {allGames.filter(game => game.is_complete).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Games</h3>
            <p className="text-3xl font-bold text-blue-600">
              {allGames.filter(game => !game.is_complete).length}
            </p>
          </div>
        </div>

        {/* Games Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Games</h2>
          </div>
          
          {allGames.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No games found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Game ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Players
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allGames.map((game) => (
                    <tr key={game.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {game.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {game.created_by ? game.created_by.substring(0, 8) + '...' : 'Unknown User'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {game.course_name || 'Unknown Course'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {game.players?.length || 0} players
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGameStatusColor(game)}`}>
                          {getGameStatus(game)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(game.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(`/dashboard?game=${game.id}`, '_blank')}
                            className="text-primary hover:text-primary-hover"
                          >
                            View
                          </button>
                          {!game.is_complete && game.created_by === user?.id && (
                            <button
                              onClick={() => handleResumeGame(game.id)}
                              className="text-orange-600 hover:text-orange-700 font-semibold"
                            >
                              Resume
                            </button>
                          )}
                          {game.is_public && (
                            <button
                              onClick={() => window.open(`/shared/${game.public_token}`, '_blank')}
                              className="text-green-600 hover:text-green-700"
                            >
                              Public Link
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={loadAllGames}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
