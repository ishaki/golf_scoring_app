import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { calculateAllStrokeHoles } from '../utils/voor';
import { calculateHolePoints } from '../utils/scoring';
import HoleInput from '../components/scoring/HoleInput';
import ScoreCard from '../components/scoring/ScoreCard';
import Navigation from '../components/scoring/Navigation';

export default function Game() {
  const navigate = useNavigate();
  const game = useGameStore((state) => state.game);
  const loadGame = useGameStore((state) => state.loadGame);
  const updateScore = useGameStore((state) => state.updateScore);
  const updateHoleCalculations = useGameStore((state) => state.updateHoleCalculations);
  const nextHole = useGameStore((state) => state.nextHole);
  const previousHole = useGameStore((state) => state.previousHole);
  const goToHole = useGameStore((state) => state.goToHole);

  useEffect(() => {
    // Try to load game from Supabase if none in state
    const initGame = async () => {
      if (!game) {
        console.log('[Game] No game in state, attempting to load from Supabase...');
        await loadGame();
      }
    };
    initGame();
  }, []); // Run once on mount

  useEffect(() => {
    // Redirect to setup if still no game after attempting to load
    if (game === null) {
      console.log('[Game] No game found, redirecting to setup...');
      const timer = setTimeout(() => {
        navigate('/setup');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [game, navigate]);

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  const currentHoleIndex = game.currentHole - 1;
  const currentHole = game.holes[currentHoleIndex];

  // Calculate stroke holes map
  const strokeIndexes = game.holes.map(h => h.strokeIndex);
  const strokeHolesMap = calculateAllStrokeHoles(game.players, strokeIndexes);

  // Get current hole scores
  const currentScores = currentHole.scores || {};

  const handleScoreChange = (playerId, score) => {
    updateScore(game.currentHole, playerId, score);

    // Recalculate points for this hole
    const updatedHole = {
      ...currentHole,
      scores: {
        ...currentHole.scores,
        [playerId]: score,
      },
    };

    // Calculate points
    const points = calculateHolePoints(updatedHole, game.players, strokeHolesMap);

    // Calculate net scores
    const netScores = {};
    game.players.forEach(player => {
      const grossScore = updatedHole.scores[player.id];
      if (grossScore !== undefined && grossScore !== null) {
        const hasStroke = strokeHolesMap[player.id]?.includes(updatedHole.number);
        netScores[player.id] = hasStroke ? grossScore - 1 : grossScore;
      }
    });

    // Update hole calculations
    updateHoleCalculations(game.currentHole, netScores, points);
  };

  const handleNext = async () => {
    // Check if all scores are entered
    const allScoresEntered = game.players.every(
      player => currentHole.scores[player.id] !== undefined && currentHole.scores[player.id] !== null
    );

    if (!allScoresEntered) {
      alert('Please enter scores for all players before proceeding.');
      return;
    }

    if (game.currentHole === 18) {
      // Mark game as complete
      const completeGame = useGameStore.getState();
      await completeGame.updateGame({
        isComplete: true
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } else {
      nextHole();
    }
  };

  const handlePrevious = () => {
    previousHole();
  };

  const handleJumpToHole = (holeNumber) => {
    goToHole(holeNumber);
  };

  const handleViewDashboard = () => {
    navigate('/dashboard');
  };

  // Check if can go to next hole (all scores entered)
  const canGoNext = game.players.every(
    player => currentHole.scores[player.id] !== undefined && currentHole.scores[player.id] !== null
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Hole Input */}
        <HoleInput
          hole={currentHole}
          players={game.players}
          strokeHolesMap={strokeHolesMap}
          onScoreChange={handleScoreChange}
          scores={currentScores}
        />

        {/* Score Card */}
        <ScoreCard
          players={game.players}
          hole={currentHole}
          totals={game.totals}
        />

        {/* Navigation */}
        <Navigation
          currentHole={game.currentHole}
          totalHoles={18}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onJumpToHole={handleJumpToHole}
          canGoNext={canGoNext}
          onViewDashboard={handleViewDashboard}
        />
      </div>
    </div>
  );
}
