import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { calculateAllStrokeHoles } from '../utils/voor';
import PlayerSetup from '../components/setup/PlayerSetup';
import VoorConfiguration from '../components/setup/VoorConfiguration';
import CourseSetup from '../components/setup/CourseSetup';
import ScoringConfiguration from '../components/setup/ScoringConfiguration';

export default function Setup() {
  const navigate = useNavigate();
  const game = useGameStore((state) => state.game);
  const createGame = useGameStore((state) => state.createGame);
  const clearGame = useGameStore((state) => state.clearGame);

  const [step, setStep] = useState(1);
  const [playerNames, setPlayerNames] = useState([]);
  const [courseConfig, setCourseConfig] = useState(null);
  const [voorMatrix, setVoorMatrix] = useState({});
  const [scoringConfig, setScoringConfig] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Check if there's an active game
    if (game && !game.isComplete) {
      setShowWarning(true);
    }
  }, [game]);

  const handlePlayerNamesNext = (names) => {
    setPlayerNames(names);
    setStep(2);
  };

  const handleCourseNext = (config) => {
    setCourseConfig(config);
    setStep(3);
  };

  const handleVoorNext = (matrix) => {
    setVoorMatrix(matrix);
    setStep(4);
  };

  const handleStartGame = (config) => {
    // Create player objects with IDs and voor configuration
    // Matrix uses indices, need to convert to player IDs
    const players = playerNames.map((name, index) => {
      const playerId = `player-${index + 1}`;

      // Convert matrix indices to player IDs
      const voorGiven = {};
      if (voorMatrix[index]) {
        Object.entries(voorMatrix[index]).forEach(([receiverIndex, strokes]) => {
          const receiverId = `player-${parseInt(receiverIndex) + 1}`;
          voorGiven[receiverId] = strokes;
        });
      }

      return {
        id: playerId,
        name,
        voorGiven,
        strokeHoles: [], // Will be populated below
      };
    });

    // Calculate stroke holes for each player using the union logic
    const strokeHolesMap = calculateAllStrokeHoles(players, courseConfig.strokeIndexes);

    // Update players with their calculated stroke holes
    const playersWithStrokeHoles = players.map(player => ({
      ...player,
      strokeHoles: strokeHolesMap[player.id] || [],
    }));

    // Create game with scoring configuration
    createGame(playersWithStrokeHoles, courseConfig, config);

    // Navigate to game screen
    navigate('/game');
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleAbandonGame = async () => {
    if (window.confirm('Are you sure you want to abandon the current game? All progress will be lost.')) {
      await clearGame();
      setShowWarning(false);
    }
  };

  const handleResumeGame = () => {
    navigate('/game');
  };

  const handleContinueAnyway = () => {
    setShowWarning(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Active Game Warning Modal */}
        {showWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-xl font-bold text-gray-900">Game In Progress</h2>
              </div>

              <p className="text-gray-700 mb-2">
                You have an active game on <strong>{game?.courseName || 'Unknown Course'}</strong>
              </p>
              <p className="text-gray-600 text-sm mb-6">
                Hole {game?.currentHole} of 18 • {game?.players?.length || 0} players
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleResumeGame}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Resume Game
                </button>
                <button
                  onClick={handleContinueAnyway}
                  className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                >
                  Start New Game Anyway
                </button>
                <button
                  onClick={handleAbandonGame}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Abandon Current Game
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step === num
                      ? 'bg-primary text-white'
                      : step > num
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step > num ? '✓' : num}
                </div>
                {num < 4 && (
                  <div
                    className={`w-12 h-1 mx-1 ${
                      step > num ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 text-sm text-gray-600">
            <span className={step === 1 ? 'font-semibold text-primary' : ''}>
              Players
            </span>
            <span className={step === 2 ? 'font-semibold text-primary' : ''}>
              Course
            </span>
            <span className={step === 3 ? 'font-semibold text-primary' : ''}>
              Voor
            </span>
            <span className={step === 4 ? 'font-semibold text-primary' : ''}>
              Scoring
            </span>
          </div>
        </div>

        {/* Setup form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {step === 1 && (
            <PlayerSetup
              onNext={handlePlayerNamesNext}
              initialPlayers={playerNames}
            />
          )}

          {step === 2 && (
            <CourseSetup
              onNext={handleCourseNext}
              onBack={handleBack}
            />
          )}

          {step === 3 && (
            <VoorConfiguration
              playerNames={playerNames}
              courseConfig={courseConfig}
              onNext={handleVoorNext}
              onBack={handleBack}
              initialVoor={voorMatrix}
            />
          )}

          {step === 4 && (
            <ScoringConfiguration
              onNext={handleStartGame}
              onBack={handleBack}
              initialConfig={scoringConfig}
            />
          )}
        </div>

        {/* Cancel button */}
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Cancel and return home
          </button>
        </div>
      </div>
    </div>
  );
}
