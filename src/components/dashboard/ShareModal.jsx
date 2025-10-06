import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function ShareModal({ game, onClose }) {
  const [isPublic, setIsPublic] = useState(game.isPublic || false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const publicUrl = `${window.location.origin}/shared/${game.publicToken}`;

  const handleToggleShare = async () => {
    setIsLoading(true);
    const newIsPublic = !isPublic;

    try {
      const { error } = await supabase
        .from('games')
        .update({ is_public: newIsPublic })
        .eq('id', game.id);

      if (error) throw error;

      setIsPublic(newIsPublic);

      // Update the game object in store
      game.isPublic = newIsPublic;
    } catch (error) {
      console.error('[ShareModal] Error toggling share:', error);
      alert('Failed to update sharing settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('[ShareModal] Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = publicUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {game.isComplete ? 'Share Your Game Dashboard' : 'Share Live Game 🔴'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Share Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Share publicly</p>
              <p className="text-sm text-gray-500">Anyone with the link can view</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={handleToggleShare}
                disabled={isLoading}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Public Link (only shown if sharing is enabled) */}
          {isPublic && (
            <>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Public Link</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={publicUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600 font-mono"
                    onClick={(e) => e.target.select()}
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      isCopied
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {isCopied ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className={`${game.isComplete ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border rounded-lg p-4`}>
                <div className="flex items-start gap-3">
                  <span className={`${game.isComplete ? 'text-blue-500' : 'text-orange-500'} text-xl`}>
                    {game.isComplete ? 'ℹ️' : '🔴'}
                  </span>
                  <div className={`text-sm ${game.isComplete ? 'text-blue-800' : 'text-orange-800'}`}>
                    <p className="font-semibold mb-1">
                      {game.isComplete ? 'This link shows:' : 'Live game - viewers will see:'}
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {!game.isComplete && <li>Real-time score updates</li>}
                      <li>{game.isComplete ? 'Final scores' : 'Current scores'} and leaderboard</li>
                      <li>Hole-by-hole breakdown</li>
                      <li>Transaction matrix</li>
                      <li>Game summary</li>
                    </ul>
                    <p className={`mt-2 ${game.isComplete ? 'text-blue-600' : 'text-orange-600'}`}>
                      {game.isComplete
                        ? 'No login required for viewers.'
                        : '⚡ Updates automatically as you play. No login required.'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Not Shared Message */}
          {!isPublic && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-gray-600">
                Enable sharing to generate a public link
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
