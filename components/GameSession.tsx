import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameMode, Difficulty, Country, GameResult } from '../types';
import { countries } from '../data';

interface GameSessionProps {
  mode: GameMode;
  difficulty: Difficulty;
  onFinish: (result: GameResult) => void;
  onExit: () => void;
}

type Phase = 'GUESSING' | 'FEEDBACK' | 'REVEALED';

export const GameSession: React.FC<GameSessionProps> = ({ mode, difficulty, onFinish, onExit }) => {
  // Game State
  const [deck, setDeck] = useState<Country[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [scoreP1, setScoreP1] = useState(0);
  const [scoreP2, setScoreP2] = useState(0);
  const [guess, setGuess] = useState('');
  const [phase, setPhase] = useState<Phase>('GUESSING');
  const [timeLeft, setTimeLeft] = useState(0); // For Time Trial
  const [startTime] = useState(Date.now());
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // New state for Training Mode history
  const [trainingHistory, setTrainingHistory] = useState<Country[]>([]);

  // Refs for timers
  const timerRef = useRef<number | null>(null);

  // Derived state
  const currentCountry = deck[roundIndex];
  const isHeadToHead = mode === GameMode.HEAD_TO_HEAD;
  const currentPlayer = isHeadToHead ? (roundIndex % 2 === 0 ? 1 : 2) : 1;
  const isTimeTrial = mode === GameMode.TIME_TRIAL;
  const isTraining = mode === GameMode.TRAINING;
  const maxRounds = isHeadToHead ? 20 : (isTraining ? countries.length : 10);

  // Initialize Game
  useEffect(() => {
    let filtered = difficulty === Difficulty.MIXED
      ? [...countries]
      : countries.filter(c => c.difficulty === difficulty);
    
    // Ensure we have enough cards for game modes (training just uses whatever is available)
    if (!isTraining && filtered.length < maxRounds) {
        filtered = [...countries];
    }

    const shuffled = filtered.sort(() => Math.random() - 0.5);

    let gameDeck: Country[] = [];
    if (isTraining) {
      gameDeck = shuffled; 
    } else {
      gameDeck = shuffled.slice(0, maxRounds);
    }

    setDeck(gameDeck);
    setRoundIndex(0);
    setIsLoading(false);
    
    if (isTimeTrial) {
      setTimeLeft(10);
    }
  }, [difficulty, mode, isTraining, maxRounds, isTimeTrial]);

  // Timer Logic (Only for Time Trial now)
  useEffect(() => {
    if (isLoading) return;
    if (isTraining) return; // No timer in new training mode
    if (phase !== 'GUESSING') return; 

    if (isTimeTrial && phase === 'GUESSING') {
      if (timeLeft > 0) {
        timerRef.current = window.setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      } else {
        handleSubmit(true); 
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, phase, isTimeTrial, isTraining, isLoading]);

  const handleSubmit = useCallback((timeRanOut = false) => {
    if (phase !== 'GUESSING') return;

    const correct = guess.toLowerCase().trim() === currentCountry.name.toLowerCase();
    const actuallyCorrect = correct && !timeRanOut;

    setIsCorrect(actuallyCorrect);
    
    if (actuallyCorrect) {
      if (currentPlayer === 1) setScoreP1(prev => prev + 1);
      else setScoreP2(prev => prev + 1);
    }

    setPhase('FEEDBACK');
  }, [guess, currentCountry, phase, currentPlayer]);

  // Specific handler for Training Mode "Next"
  const handleTrainingNext = () => {
    const nextIndex = roundIndex + 1;
    const current = deck[roundIndex];
    
    // Add current to history
    const newHistory = [...trainingHistory, current];
    setTrainingHistory(newHistory);

    // Check if we ran out of cards
    if (nextIndex >= deck.length) {
      finishTrainingSession(newHistory);
    } else {
      setRoundIndex(nextIndex);
    }
  };

  // Specific handler for Training Mode "Stop"
  const handleTrainingStop = () => {
    const current = deck[roundIndex];
    // Add the current one to history as well, since they saw it
    const newHistory = [...trainingHistory, current];
    finishTrainingSession(newHistory);
  };

  const finishTrainingSession = (history: Country[]) => {
     onFinish({
        mode,
        difficulty,
        score: 0,
        totalQuestions: history.length,
        trainingHistory: history
     });
  };

  const handleNextRound = useCallback(() => {
    const nextIndex = roundIndex + 1;

    if (nextIndex >= maxRounds) {
      const endTime = Date.now();
      let winner: 'Player 1' | 'Player 2' | 'Draw' | undefined;
      
      if (isHeadToHead) {
        if (scoreP1 > scoreP2) winner = 'Player 1';
        else if (scoreP2 > scoreP1) winner = 'Player 2';
        else winner = 'Draw';
      }

      onFinish({
        mode,
        difficulty,
        score: scoreP1,
        player2Score: scoreP2,
        totalQuestions: maxRounds,
        totalTime: Date.now() - startTime,
        winner
      });
      return;
    }

    setRoundIndex(nextIndex);
    setGuess('');
    setPhase('GUESSING');
    setIsCorrect(false);
    if (isTimeTrial) setTimeLeft(10);
    
  }, [roundIndex, maxRounds, deck, scoreP1, scoreP2, mode, difficulty, startTime, isHeadToHead, onFinish, isTimeTrial]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && guess.trim()) {
      handleSubmit();
    }
  };

  if (isLoading || !currentCountry) return <div className="text-sky-600 text-3xl font-black text-center mt-20">Loading World Data...</div>;

  return (
    <div className="w-full max-w-5xl px-2 md:px-4 flex flex-col items-center mx-auto min-h-screen justify-center py-4">
      {/* Top HUD */}
      <div className="flex justify-between items-center w-full mb-3 md:mb-6 shrink-0">
        <button onClick={onExit} className="bg-white/80 hover:bg-white text-gray-500 hover:text-red-500 rounded-full p-2 md:p-3 font-bold shadow-sm backdrop-blur transition-colors">
          <span className="sr-only">Exit</span>
          ✕
        </button>
        
        <div className="bg-white/80 backdrop-blur rounded-full px-4 py-1 md:px-6 md:py-2 shadow-sm font-black text-sky-600 flex items-center gap-2 text-xs md:text-base">
            <span>{mode === GameMode.TRAINING ? '🎓' : mode === GameMode.TIME_TRIAL ? '⚡' : mode === GameMode.HEAD_TO_HEAD ? '⚔️' : '👤'}</span>
            <span className="hidden sm:inline">{mode.replace(/_/g, ' ')}</span>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-full px-3 py-1 md:px-4 md:py-2 shadow-sm font-black text-gray-500 text-xs md:text-base">
           {isTraining ? `#${roundIndex + 1}` : `${roundIndex + 1}/${maxRounds}`}
        </div>
      </div>

      {/* Main Game Card */}
      <div className="bg-white p-3 md:p-6 rounded-[2rem] md:rounded-[3rem] shadow-2xl w-full border-4 border-white relative transition-all flex flex-col items-center overflow-hidden">
        
        {/* Head-to-Head Player Indicator */}
        {isHeadToHead && (
            <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 z-20 px-4 py-1 md:px-8 md:py-3 rounded-full font-black text-white shadow-lg border-2 border-white uppercase tracking-widest text-[10px] md:text-base w-max ${currentPlayer === 1 ? 'bg-blue-400' : 'bg-violet-400'}`}>
                {currentPlayer === 1 ? "Player 1's Turn" : "Player 2's Turn"}
            </div>
        )}

        {/* Image Container 
            - aspect-square: Keep it square
            - w-full: Fill width up to parent limit
            - max-h-[60vh]: Prevent it from being too tall on short screens
            - max-w-[min(100%,calc(100vh-400px))]: Clever way to ensure the square is never taller than the available height minus controls
        */}
        <div className="relative aspect-square rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-gray-100 shadow-inner border-4 border-gray-100 group w-full max-w-[calc(100vh-380px)] lg:max-w-4xl">
             <img 
                src={currentCountry.imageUrl} 
                alt="Guess the country" 
                className="w-full h-full object-cover"
            />
            
            {/* Feedback / Reveal Overlay - ONLY for Non-Training Modes */}
            {!isTraining && phase !== 'GUESSING' && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-10">
                    <div className={`bg-white rounded-3xl p-6 md:p-10 text-center shadow-2xl ${isCorrect ? 'border-b-8 border-green-200' : 'border-b-8 border-red-200'} animate-in fade-in zoom-in duration-300`}>
                        <div className="text-6xl md:text-8xl mb-4">{isCorrect ? '🎉' : '❌'}</div>
                        <h2 className={`text-3xl md:text-5xl font-black mb-2 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                            {isCorrect ? 'Awesome!' : 'Oops!'}
                        </h2>
                        <p className="text-gray-400 font-bold text-sm uppercase mb-3">It was...</p>
                        <p className="text-2xl md:text-4xl font-black text-gray-800 bg-yellow-100 inline-block px-6 py-2 rounded-xl border-2 border-yellow-200 transform -rotate-2">
                            {currentCountry.name}
                        </p>
                    </div>
                </div>
            )}

            {/* Timer Overlay for Time Trial */}
            {isTimeTrial && phase === 'GUESSING' && (
                <div className="absolute top-3 right-3 md:top-6 md:right-6">
                    <div className={`w-12 h-12 md:w-20 md:h-20 rounded-full flex items-center justify-center bg-white border-4 shadow-lg font-black text-xl md:text-3xl ${timeLeft <= 3 ? 'text-red-500 border-red-200 animate-pulse' : 'text-sky-500 border-sky-200'}`}>
                        {timeLeft}
                    </div>
                </div>
            )}
        </div>

        {/* Controls */}
        <div className="mt-4 md:mt-6 w-full px-1 md:px-4 shrink-0">
            
            {/* TRAINING MODE CONTROLS */}
            {isTraining ? (
                 <div className="flex gap-4 max-w-2xl mx-auto">
                    <button 
                        onClick={handleTrainingStop}
                        className="flex-1 bg-rose-400 hover:bg-rose-300 text-white border-b-[6px] md:border-b-[8px] border-rose-600 active:border-b-0 font-black py-4 rounded-2xl md:rounded-3xl shadow-lg text-lg md:text-2xl transition-all"
                    >
                        STOP
                    </button>
                    <button 
                        onClick={handleTrainingNext}
                        className="flex-1 bg-emerald-400 hover:bg-emerald-300 text-white border-b-[6px] md:border-b-[8px] border-emerald-600 active:border-b-0 font-black py-4 rounded-2xl md:rounded-3xl shadow-lg text-lg md:text-2xl flex items-center justify-center gap-2 transition-all"
                    >
                        NEXT <span className="text-2xl md:text-3xl">👉</span>
                    </button>
                 </div>
            ) : (
                /* GAME MODE CONTROLS (Single, Head-to-Head, Time Trial) */
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-end mb-4 md:mb-6 px-4">
                        <div className={`flex flex-col items-center ${currentPlayer === 1 && isHeadToHead ? 'scale-110 md:scale-125 opacity-100' : 'opacity-60 scale-90'} transition-transform duration-300`}>
                            <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase">P1 Score</span>
                            <span className="text-xl md:text-4xl font-black text-blue-500">{scoreP1}</span>
                        </div>
                        
                        {isHeadToHead && (
                            <div className="text-gray-300 font-black text-lg md:text-2xl pb-1">VS</div>
                        )}

                        {isHeadToHead && (
                            <div className={`flex flex-col items-center ${currentPlayer === 2 ? 'scale-110 md:scale-125 opacity-100' : 'opacity-60 scale-90'} transition-transform duration-300`}>
                                <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase">P2 Score</span>
                                <span className="text-xl md:text-4xl font-black text-violet-500">{scoreP2}</span>
                            </div>
                        )}
                    </div>

                    {phase === 'GUESSING' ? (
                        <div className="flex gap-3 md:gap-4">
                            <input
                                type="text"
                                value={guess}
                                onChange={(e) => setGuess(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Country..."
                                className="flex-1 bg-gray-100 border-b-4 border-gray-200 focus:border-sky-400 focus:bg-white text-gray-800 font-black text-lg md:text-2xl px-5 md:px-8 py-3 md:py-5 rounded-2xl md:rounded-3xl outline-none placeholder-gray-400 w-full transition-all"
                                autoFocus
                            />
                            <button 
                                onClick={() => handleSubmit()}
                                disabled={!guess.trim()}
                                className="bg-sky-400 hover:bg-sky-300 disabled:bg-gray-200 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed text-white border-b-[6px] md:border-b-[8px] border-sky-600 active:border-b-0 font-black px-6 md:px-10 rounded-2xl md:rounded-3xl shadow-lg text-lg md:text-2xl transition-all"
                            >
                                GO
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={handleNextRound}
                            className="w-full bg-sky-400 hover:bg-sky-300 text-white border-b-[6px] md:border-b-[8px] border-sky-600 active:border-b-0 font-black py-4 rounded-2xl md:rounded-3xl shadow-lg text-lg md:text-2xl flex items-center justify-center gap-4 group transition-all"
                        >
                            Next Round <span className="group-hover:translate-x-2 transition-transform">➡️</span>
                        </button>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};