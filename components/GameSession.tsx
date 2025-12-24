
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameMode, Difficulty, Country, GameResult } from '../types';
import { countries } from '../data';

interface GameSessionProps {
  mode: GameMode;
  difficulty: Difficulty;
  onFinish: (result: GameResult) => void;
  onExit: () => void;
}

type Phase = 'GUESSING' | 'REVEALED' | 'FEEDBACK';

export const GameSession: React.FC<GameSessionProps> = ({ mode, difficulty, onFinish, onExit }) => {
  const [deck, setDeck] = useState<Country[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [scoreP1, setScoreP1] = useState(0);
  const [scoreP2, setScoreP2] = useState(0);
  const [guess, setGuess] = useState('');
  const [phase, setPhase] = useState<Phase>('GUESSING');
  const [timeLeft, setTimeLeft] = useState(0); 
  const [startTime] = useState(Date.now());
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewedCountries, setViewedCountries] = useState<Country[]>([]);
  
  const timerRef = useRef<number | null>(null);

  const isHeadToHead = mode === GameMode.HEAD_TO_HEAD;
  const isTimeTrial = mode === GameMode.TIME_TRIAL;
  const isTraining = mode === GameMode.TRAINING;
  const currentPlayer = isHeadToHead ? (roundIndex % 2 === 0 ? 1 : 2) : 1;

  const handleSubmit = useCallback((timeRanOut = false) => {
    if (phase !== 'GUESSING' || isTraining) return;
    const correct = guess.toLowerCase().trim() === deck[roundIndex].name.toLowerCase();
    const actuallyCorrect = correct && !timeRanOut;
    setIsCorrect(actuallyCorrect);
    if (actuallyCorrect) {
      if (currentPlayer === 1) setScoreP1(prev => prev + 1);
      else setScoreP2(prev => prev + 1);
    }
    setPhase('FEEDBACK');
  }, [guess, deck, roundIndex, phase, currentPlayer, isTraining]);

  // Initialize and Shuffle
  useEffect(() => {
    let filtered = difficulty === Difficulty.MIXED
      ? [...countries]
      : countries.filter(c => c.difficulty === difficulty);
    
    const shuffle = (array: Country[]) => {
      const newArr = [...array];
      for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
      }
      return newArr;
    };

    const shuffled = shuffle(filtered);
    const gameDeck = isTraining ? shuffled : shuffled.slice(0, Math.min(shuffled.length, isHeadToHead ? 20 : 10));

    setDeck(gameDeck);
    setIsLoading(false);
    if (isTimeTrial) setTimeLeft(10);
  }, [difficulty, mode, isTraining, isHeadToHead, isTimeTrial]);

  useEffect(() => {
    if (deck.length > 0 && deck[roundIndex]) {
      const current = deck[roundIndex];
      setViewedCountries(prev => {
        if (prev.some(c => c.id === current.id)) return prev;
        return [...prev, current];
      });
    }
  }, [deck, roundIndex]);

  useEffect(() => {
    if (isLoading || isTraining || phase !== 'GUESSING') return; 
    if (isTimeTrial) {
      if (timeLeft > 0) {
        timerRef.current = window.setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      } else {
        handleSubmit(true); 
      }
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timeLeft, phase, isTimeTrial, isTraining, isLoading, handleSubmit]);

  const handleNextRound = useCallback(() => {
    const nextIndex = roundIndex + 1;
    if (nextIndex >= deck.length) {
      let winner: 'Player 1' | 'Player 2' | 'Draw' | undefined;
      if (isHeadToHead) {
        winner = scoreP1 > scoreP2 ? 'Player 1' : scoreP2 > scoreP1 ? 'Player 2' : 'Draw';
      }
      onFinish({
        mode, difficulty, score: scoreP1, player2Score: scoreP2,
        totalQuestions: deck.length, totalTime: Date.now() - startTime, winner,
        trainingHistory: viewedCountries
      });
      return;
    }
    setRoundIndex(nextIndex);
    setGuess('');
    setPhase('GUESSING');
    setIsCorrect(false);
    if (isTimeTrial) setTimeLeft(10);
  }, [roundIndex, deck, scoreP1, scoreP2, mode, difficulty, startTime, isHeadToHead, onFinish, isTimeTrial, viewedCountries]);

  if (isLoading || deck.length === 0) return <div className="text-sky-600 text-3xl font-black text-center mt-20">Loading...</div>;

  const currentCountry = deck[roundIndex];
  const isLastRound = roundIndex === deck.length - 1;

  return (
    <div className="w-full max-w-4xl px-2 flex flex-col items-center mx-auto h-[100dvh] py-1 md:py-3 overflow-hidden">
      {/* HUD */}
      <div className="flex justify-between items-center w-full mb-1.5 shrink-0 px-2">
        <button onClick={onExit} className="bg-white/90 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-full h-10 w-10 flex items-center justify-center shadow-sm transition-all font-bold">✕</button>
        <div className="bg-white/90 px-4 py-1.5 rounded-full shadow-sm font-black text-sky-600 text-[10px] md:text-xs uppercase tracking-wider border-2 border-white">
          {isTraining ? '🎓 Training' : isTimeTrial ? '⚡ Time Trial' : isHeadToHead ? '⚔️ Head to Head' : '👤 Single Play'}
        </div>
        <div className="bg-white/90 px-3 py-1.5 rounded-full shadow-sm font-black text-gray-500 text-[10px] md:text-xs border-2 border-white">
          {roundIndex + 1}/{deck.length}
        </div>
      </div>

      {/* Main Game Card */}
      <div className="bg-white p-4 md:p-6 rounded-[2rem] md:rounded-[3rem] shadow-xl w-full border-2 border-white flex flex-col flex-1 min-h-0 overflow-hidden relative">
        
        {/* Player Indicator (H2H) */}
        {isHeadToHead && phase === 'GUESSING' && (
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-1 rounded-full font-black text-white text-[10px] uppercase border border-white shadow-md ${currentPlayer === 1 ? 'bg-blue-400' : 'bg-violet-400'}`}>
            Player {currentPlayer}
          </div>
        )}

        {/* Image Container - Added Padding (p-3 md:p-5) to ensure uniform gap around the image */}
        <div className="relative flex-1 min-h-0 w-full rounded-2xl md:rounded-[2rem] overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100 p-3 md:p-5">
          <img 
            src={currentCountry.imageUrl} 
            alt="Country" 
            className="max-w-full max-h-full object-contain select-none pointer-events-none rounded-lg"
          />
          
          {/* Result Overlays */}
          {(phase === 'REVEALED' || phase === 'FEEDBACK') && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-20 animate-in fade-in duration-200 rounded-2xl md:rounded-[2rem]">
              <div className="bg-white rounded-3xl p-6 md:p-8 text-center shadow-2xl scale-95 md:scale-100 border-b-8 border-amber-200">
                {!isTraining && <div className="text-4xl mb-2">{isCorrect ? '🎉' : '❌'}</div>}
                <p className="text-gray-400 font-black text-[10px] uppercase mb-1 tracking-widest">{isTraining ? 'Location Found' : 'The answer is'}</p>
                <div className="text-2xl md:text-4xl font-black text-gray-800 bg-amber-50 px-6 py-2 rounded-2xl border-2 border-amber-100 transform -rotate-1">
                  {currentCountry.name}
                </div>
              </div>
            </div>
          )}

          {/* Time Trial Timer */}
          {isTimeTrial && phase === 'GUESSING' && (
            <div className="absolute top-4 right-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white border-4 shadow-xl font-black text-xl ${timeLeft <= 3 ? 'text-rose-500 border-rose-200 animate-pulse' : 'text-sky-500 border-sky-100'}`}>
                {timeLeft}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="pt-4 md:pt-6 shrink-0">
          {isTraining ? (
            <div className="flex gap-3 max-w-xl mx-auto">
              <button 
                onClick={onExit} 
                className="flex-1 bg-rose-400 hover:bg-rose-300 text-white border-b-4 border-rose-600 active:border-b-0 font-black py-3 md:py-4 rounded-2xl shadow-md text-base md:text-xl transition-all uppercase tracking-wider"
              >
                STOP
              </button>
              {phase === 'GUESSING' ? (
                <button 
                  onClick={() => setPhase('REVEALED')} 
                  className="flex-1 bg-amber-400 hover:bg-amber-300 text-white border-b-4 border-amber-600 active:border-b-0 font-black py-3 md:py-4 rounded-2xl shadow-md text-base md:text-xl flex items-center justify-center gap-2 transition-all uppercase tracking-wider"
                >
                  Answer 💡
                </button>
              ) : (
                !isLastRound ? (
                  <button 
                    onClick={handleNextRound} 
                    className="flex-1 bg-emerald-400 hover:bg-emerald-300 text-white border-b-4 border-emerald-600 active:border-b-0 font-black py-3 md:py-4 rounded-2xl shadow-md text-base md:text-xl flex items-center justify-center gap-2 transition-all uppercase tracking-wider"
                  >
                    Next 👉
                  </button>
                ) : (
                  <button 
                    onClick={onExit} 
                    className="flex-1 bg-sky-400 hover:bg-sky-300 text-white border-b-4 border-sky-600 active:border-b-0 font-black py-3 md:py-4 rounded-2xl shadow-md text-base md:text-xl flex items-center justify-center gap-2 transition-all uppercase tracking-wider"
                  >
                    Menu 🏠
                  </button>
                )
              )}
            </div>
          ) : (
            <div className="max-w-xl mx-auto">
              <div className="flex justify-between items-center mb-2 px-2">
                <div className={`flex items-center gap-2 transition-opacity ${currentPlayer === 1 && isHeadToHead ? 'opacity-100' : 'opacity-30'}`}>
                  <span className="text-[10px] font-black text-gray-400 uppercase">P1 Score</span>
                  <span className="text-xl font-black text-blue-500">{scoreP1}</span>
                </div>
                {isHeadToHead && <div className="text-gray-200 font-black text-xs">VS</div>}
                <div className={`flex items-center gap-2 transition-opacity ${currentPlayer === 2 ? 'opacity-100' : 'opacity-30'}`}>
                  {isHeadToHead && <span className="text-xl font-black text-violet-500">{scoreP2}</span>}
                  {isHeadToHead && <span className="text-[10px] font-black text-gray-400 uppercase">P2 Score</span>}
                </div>
              </div>

              {phase === 'GUESSING' ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && guess.trim() && handleSubmit()}
                    placeholder="Enter country..."
                    className="flex-1 bg-gray-50 border-b-2 border-gray-100 focus:border-sky-400 focus:bg-white text-gray-800 font-black text-lg px-5 py-3 md:py-4 rounded-2xl outline-none transition-all"
                    autoFocus
                  />
                  <button 
                    onClick={() => handleSubmit()} 
                    disabled={!guess.trim()} 
                    className="bg-sky-400 hover:bg-sky-300 disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-300 text-white border-b-4 border-sky-600 active:border-b-0 font-black px-8 rounded-2xl shadow-md text-lg transition-all uppercase"
                  >
                    GO
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleNextRound} 
                  className="w-full bg-sky-400 hover:bg-sky-300 text-white border-b-4 border-sky-600 active:border-b-0 font-black py-3 md:py-4 rounded-2xl shadow-md text-lg md:text-xl flex items-center justify-center gap-2 transition-all uppercase"
                >
                  {isLastRound ? 'Finish Session' : 'Next Round'} ➡️
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
