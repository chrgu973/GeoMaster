import React from 'react';
import { AppScreen, Difficulty, GameMode, GameResult } from '../types';

interface MainMenuProps {
  onSelectMode: (mode: GameMode) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onSelectMode }) => {
  return (
    <div className="w-full max-w-4xl mx-auto text-center px-4">
      <div className="mb-8 md:mb-12">
        <h1 className="text-5xl md:text-7xl font-black text-sky-500 mb-2 tracking-tight drop-shadow-sm break-words" 
            style={{ 
              WebkitTextStroke: '3px white', 
              textShadow: '0px 4px 0px rgba(0,0,0,0.1)' 
            }}>
          GEOMASTER
        </h1>
        <div className="inline-block bg-white/80 backdrop-blur px-4 py-1 md:px-6 md:py-2 rounded-full font-black text-sky-400 tracking-widest uppercase text-xs md:text-sm shadow-sm border-2 border-white">
          World Quiz Adventure
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <MenuButton 
          icon="🎓" 
          title="Training" 
          desc="Learn without limits" 
          theme="green"
          onClick={() => onSelectMode(GameMode.TRAINING)}
        />
        <MenuButton 
          icon="👤" 
          title="Single Play" 
          desc="Beat your high score" 
          theme="blue"
          onClick={() => onSelectMode(GameMode.SINGLE_PLAYER)}
        />
        <MenuButton 
          icon="⚔️" 
          title="Head to Head" 
          desc="Challenge a friend" 
          theme="violet"
          onClick={() => onSelectMode(GameMode.HEAD_TO_HEAD)}
        />
        <MenuButton 
          icon="⚡" 
          title="Time Trial" 
          desc="Race against the clock" 
          theme="orange"
          onClick={() => onSelectMode(GameMode.TIME_TRIAL)}
        />
      </div>
    </div>
  );
};

const MenuButton = ({ icon, title, desc, theme, onClick }: any) => {
  const themes: any = {
    green: "bg-emerald-400 border-emerald-600 text-white hover:bg-emerald-300",
    blue: "bg-sky-400 border-sky-600 text-white hover:bg-sky-300",
    violet: "bg-violet-400 border-violet-600 text-white hover:bg-violet-300",
    orange: "bg-orange-400 border-orange-600 text-white hover:bg-orange-300",
  };

  return (
    <button
      onClick={onClick}
      className={`relative group h-full w-full py-5 px-6 md:py-6 md:px-8 rounded-3xl border-b-[6px] md:border-b-[8px] text-left overflow-hidden ${themes[theme]} shadow-xl`}
    >
      <div className="absolute -right-4 -bottom-4 opacity-20 text-7xl md:text-8xl select-none">
        {icon}
      </div>
      <div className="relative z-10 flex flex-row md:flex-col items-center md:items-start md:h-full md:justify-between gap-4 md:gap-0">
        <div className="text-4xl md:text-5xl md:mb-4 drop-shadow-md">{icon}</div>
        <div>
          <h3 className="text-2xl md:text-3xl font-black leading-tight drop-shadow-sm">{title}</h3>
          <p className="font-bold opacity-90 text-sm md:text-lg leading-tight mt-1">{desc}</p>
        </div>
      </div>
    </button>
  );
};

interface DifficultySelectProps {
  onSelectDifficulty: (diff: Difficulty) => void;
  onBack: () => void;
}

export const DifficultySelect: React.FC<DifficultySelectProps> = ({ onSelectDifficulty, onBack }) => {
  return (
    <div className="w-full max-w-sm md:max-w-lg bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl p-6 md:p-8 text-center border-4 border-white/50 relative mx-4">
      <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-5 py-2 rounded-full font-black text-base md:text-lg shadow-lg border-2 border-yellow-200 w-max">
        SELECT DIFFICULTY
      </div>
      
      <div className="mt-6 md:mt-8 space-y-3 md:space-y-4">
        <DifficultyButton label="Easy" stars="⭐" theme="green" onClick={() => onSelectDifficulty(Difficulty.EASY)} />
        <DifficultyButton label="Medium" stars="⭐⭐" theme="yellow" onClick={() => onSelectDifficulty(Difficulty.MEDIUM)} />
        <DifficultyButton label="Hard" stars="⭐⭐⭐" theme="red" onClick={() => onSelectDifficulty(Difficulty.HARD)} />
        <DifficultyButton label="Mixed" stars="🎲" theme="purple" onClick={() => onSelectDifficulty(Difficulty.MIXED)} />
      </div>
      
      <button 
        onClick={onBack} 
        className="mt-6 md:mt-8 text-gray-400 hover:text-gray-600 font-black text-sm uppercase tracking-widest py-2"
      >
        ← Back to Menu
      </button>
    </div>
  );
};

const DifficultyButton = ({ label, stars, theme, onClick }: any) => {
  const themes: any = {
    green: "bg-green-100 border-green-300 text-green-700 hover:bg-green-200",
    yellow: "bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200",
    red: "bg-rose-100 border-rose-300 text-rose-700 hover:bg-rose-200",
    purple: "bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full py-4 px-5 md:py-5 md:px-6 rounded-2xl border-b-4 font-black text-xl md:text-2xl flex justify-between items-center ${themes[theme]}`}
    >
      <span>{label}</span>
      <span className="text-lg md:text-xl drop-shadow-sm">{stars}</span>
    </button>
  );
};

interface ResultsProps {
  result: GameResult;
  onHome: () => void;
  onRestart: () => void;
}

export const ResultsScreen: React.FC<ResultsProps> = ({ result, onHome, onRestart }) => {
  const isWinner = result.score / result.totalQuestions > 0.7;
  const isTraining = result.mode === GameMode.TRAINING;

  return (
    <div className="w-full max-w-sm md:max-w-md bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl p-6 md:p-8 text-center border-4 border-white/50 mx-4 flex flex-col max-h-[90vh]">
      <div className="mb-4 md:mb-6 relative shrink-0">
        <div className="text-6xl md:text-8xl mb-2 md:mb-4 drop-shadow-md">
          {isTraining ? '📋' : (result.mode === GameMode.HEAD_TO_HEAD ? '🥊' : (isWinner ? '🏆' : '🎯'))}
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-2 leading-none">
          {isTraining ? 'Session Complete' : (result.mode === GameMode.HEAD_TO_HEAD ? (result.winner === 'Draw' ? "It's a Draw!" : `${result.winner} Wins!`) : 'Game Over!')}
        </h2>
        {!isTraining && (
          <div className="inline-block bg-gray-100 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-2 md:mb-4">
            {result.mode.replace(/_/g, ' ')} • {Difficulty[result.difficulty]}
          </div>
        )}
      </div>

      <div className="bg-sky-50 rounded-3xl p-4 md:p-6 mb-6 md:mb-8 border-2 border-sky-100 dashed overflow-auto">
        {isTraining ? (
            <div className="text-left">
                <h3 className="text-center text-gray-400 font-black uppercase text-xs tracking-wider mb-4">Countries Viewed ({result.trainingHistory?.length || 0})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {result.trainingHistory?.map((country, index) => (
                        <div key={index} className="flex items-center gap-3 bg-white p-2 rounded-xl border-b-2 border-gray-100">
                             <span className="font-black text-sky-300 w-6">{index + 1}.</span>
                             <span className="font-bold text-gray-700">{country.name}</span>
                        </div>
                    ))}
                    {(!result.trainingHistory || result.trainingHistory.length === 0) && (
                        <p className="text-center text-gray-400 italic">No countries viewed.</p>
                    )}
                </div>
            </div>
        ) : (
          result.mode === GameMode.HEAD_TO_HEAD ? (
             <div className="flex justify-around items-center">
               <div className="text-center">
                  <p className="text-xs font-black text-gray-400 uppercase mb-1">Player 1</p>
                  <div className="bg-white w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-sm border-b-4 border-gray-200">
                    <p className="text-3xl md:text-4xl font-black text-violet-500">{result.score}</p>
                  </div>
               </div>
               <div className="text-xl md:text-2xl text-gray-300 font-black">VS</div>
               <div className="text-center">
                  <p className="text-xs font-black text-gray-400 uppercase mb-1">Player 2</p>
                  <div className="bg-white w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-sm border-b-4 border-gray-200">
                     <p className="text-3xl md:text-4xl font-black text-violet-500">{result.player2Score}</p>
                  </div>
               </div>
             </div>
          ) : (
            <>
              <p className="text-gray-400 font-black uppercase text-xs tracking-wider mb-2">Final Score</p>
              <div className="text-5xl md:text-7xl font-black text-sky-500 mb-2 drop-shadow-sm" style={{ WebkitTextStroke: '2px white' }}>
                {result.score}<span className="text-2xl md:text-3xl text-gray-300">/{result.totalQuestions}</span>
              </div>
              {result.totalTime && (
                 <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                   <span className="text-lg">⏱️</span>
                   <span className="font-bold text-gray-600">{Math.floor(result.totalTime / 1000)}s</span>
                 </div>
              )}
            </>
          )
        )}
      </div>

      <div className="space-y-3 shrink-0">
        <button
          onClick={onRestart}
          className="w-full bg-sky-400 hover:bg-sky-300 text-white border-b-[5px] md:border-b-[6px] border-sky-600 active:border-b-0 font-black py-3 md:py-4 px-6 rounded-2xl shadow-lg text-lg md:text-xl"
        >
          🔄 Play Again
        </button>
        <button
          onClick={onHome}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 border-b-[5px] md:border-b-[6px] border-gray-300 active:border-b-0 font-black py-3 md:py-4 px-6 rounded-2xl text-lg md:text-xl"
        >
          🏠 Menu
        </button>
      </div>
    </div>
  );
};