import React, { useState } from 'react';
import { AppScreen, GameMode, Difficulty, GameResult } from './types';
import { MainMenu, DifficultySelect, ResultsScreen } from './components/MenuScreens';
import { GameSession } from './components/GameSession';

const App = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.MENU);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.MIXED);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
    setScreen(AppScreen.DIFFICULTY_SELECT);
  };

  const handleDifficultySelect = (diff: Difficulty) => {
    setSelectedDifficulty(diff);
    setScreen(AppScreen.GAME);
  };

  const handleGameFinish = (result: GameResult) => {
    setGameResult(result);
    setScreen(AppScreen.RESULTS);
  };

  const handleBackToMenu = () => {
    setScreen(AppScreen.MENU);
    setSelectedMode(null);
    setGameResult(null);
  };

  const handleRestart = () => {
    // Briefly reset to trigger re-mount of GameSession
    setScreen(AppScreen.DIFFICULTY_SELECT); 
    setTimeout(() => setScreen(AppScreen.GAME), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-blue-100 to-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-yellow-200">
      
      {/* Background Decorations - Soft Clouds (Static) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-[10%] w-64 h-32 bg-white rounded-full opacity-60 blur-2xl"></div>
        <div className="absolute top-40 right-[15%] w-80 h-40 bg-white rounded-full opacity-50 blur-2xl"></div>
        <div className="absolute bottom-20 left-[20%] w-96 h-48 bg-white/40 rounded-full blur-3xl"></div>
        
        {/* Static Icons */}
        <div className="absolute top-[15%] left-[5%] text-8xl opacity-20 select-none">☁️</div>
        <div className="absolute top-[20%] right-[5%] text-8xl opacity-20 select-none">☀️</div>
        <div className="absolute bottom-[10%] right-[10%] text-8xl opacity-20 select-none">🗺️</div>
      </div>

      <div className="relative z-10 w-full flex justify-center py-8">
        {screen === AppScreen.MENU && (
          <MainMenu onSelectMode={handleModeSelect} />
        )}

        {screen === AppScreen.DIFFICULTY_SELECT && (
          <DifficultySelect 
            onSelectDifficulty={handleDifficultySelect} 
            onBack={handleBackToMenu}
          />
        )}

        {screen === AppScreen.GAME && selectedMode && (
          <GameSession 
            mode={selectedMode} 
            difficulty={selectedDifficulty} 
            onFinish={handleGameFinish}
            onExit={handleBackToMenu}
          />
        )}

        {screen === AppScreen.RESULTS && gameResult && (
          <ResultsScreen 
            result={gameResult} 
            onHome={handleBackToMenu} 
            onRestart={handleRestart}
          />
        )}
      </div>
      
      <footer className="fixed bottom-4 text-center w-full text-sky-800/40 text-sm font-black tracking-widest pointer-events-none uppercase">
        GeoMaster • Explore The World
      </footer>
    </div>
  );
};

export default App;