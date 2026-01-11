
import React, { useState, useCallback } from 'react';
import { GameState, GameStats } from './types';
import GameEngine from './components/GameEngine';
import StartScreen from './components/StartScreen';
import ResultView from './components/ResultView';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [finalStats, setFinalStats] = useState<GameStats | null>(null);

  const startGame = () => {
    setGameState(GameState.PLAYING);
  };

  const handleGameOver = useCallback((stats: GameStats) => {
    setFinalStats(stats);
    setGameState(GameState.GAMEOVER);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-950 p-2">
      <div 
        className="relative bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border-8 border-neutral-800"
        style={{ 
          width: '100%', 
          maxWidth: `${GAME_WIDTH}px`, 
          aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}` 
        }}
      >
        {gameState === GameState.START && (
          <StartScreen onStart={startGame} />
        )}

        {gameState === GameState.PLAYING && (
          <GameEngine onGameOver={handleGameOver} />
        )}

        {gameState === GameState.GAMEOVER && finalStats && (
          <ResultView stats={finalStats} onRestart={startGame} />
        )}
      </div>
    </div>
  );
};

export default App;
