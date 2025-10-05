import { useState } from 'react';
import ShareModal from './ShareModal';

export default function ShareButton({ game }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Only show share button for completed games
  if (!game.isComplete) {
    return null;
  }

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
            Dashboard Shared
          </>
        ) : (
          <>
            <span className="mr-2">🔗</span>
            Share Dashboard
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
