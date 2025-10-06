import { useState } from 'react';
import ShareModal from './ShareModal';

export default function ShareButton({ game }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Show share button for both in-progress and completed games
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
          game.isPublic
            ? 'bg-green-50 text-green-700 border-2 border-green-500 hover:bg-green-100'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {game.isPublic ? (
          <>
            <span className="mr-2">✓</span>
            {game.isComplete ? 'Dashboard Shared' : 'Live Game Shared'}
          </>
        ) : (
          <>
            <span className="mr-2">🔗</span>
            {game.isComplete ? 'Share Dashboard' : 'Share Live Game'}
          </>
        )}
      </button>

      {isModalOpen && (
        <ShareModal
          game={game}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
