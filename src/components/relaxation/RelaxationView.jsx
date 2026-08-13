import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles, Gamepad2, Wind, RefreshCw, Volume2, VolumeX, Heart, Award, CheckCircle2, Play, Pause
} from 'lucide-react';

// Web Audio Sound Generator for Relaxation Chimes & Pops
const playPopSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400 + Math.random() * 300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {
    console.error(e);
  }
};

const playMatchChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.4);
    });
  } catch (e) {
    console.error(e);
  }
};

// Memory Match Icons Set
const MEMORY_ICONS = ['🔬', '📚', '🧪', '🎨', '📐', '⚛️', '🧬', '🚀'];

export const RelaxationView = () => {
  const { addXP } = useApp();
  const [activeTab, setActiveTab] = useState('bubbles'); // 'bubbles' | 'breathing' | 'memory'

  // ================= 1. ZEN BUBBLE POPPER STATE =================
  const [bubbles, setBubbles] = useState([]);
  const [poppedCount, setPoppedCount] = useState(0);

  // Generate initial bubbles
  useEffect(() => {
    if (activeTab !== 'bubbles') return;
    const newBubbles = Array.from({ length: 12 }, (_, i) => ({
      id: i + Date.now(),
      x: Math.random() * 85 + 5,
      y: Math.random() * 70 + 15,
      size: Math.random() * 35 + 45,
      color: ['bg-pink-400/80', 'bg-purple-400/80', 'bg-blue-400/80', 'bg-teal-400/80', 'bg-amber-400/80'][i % 5]
    }));
    setBubbles(newBubbles);
  }, [activeTab]);

  const handlePopBubble = (id) => {
    playPopSound();
    setPoppedCount(prev => prev + 1);
    setBubbles(prev => prev.filter(b => b.id !== id));

    // Respawn a new bubble after a short delay
    setTimeout(() => {
      setBubbles(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x: Math.random() * 85 + 5,
          y: Math.random() * 70 + 15,
          size: Math.random() * 35 + 45,
          color: ['bg-pink-400/80', 'bg-purple-400/80', 'bg-blue-400/80', 'bg-teal-400/80', 'bg-amber-400/80'][Math.floor(Math.random() * 5)]
        }
      ]);
    }, 400);

    if ((poppedCount + 1) % 10 === 0 && addXP) {
      addXP(20, '10 Zen Bubbles Popped!');
    }
  };

  // ================= 2. GUIDED BREATHING STATE =================
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale'); // 'Inhale' | 'Hold' | 'Exhale'
  const [breathSeconds, setBreathSeconds] = useState(4);

  useEffect(() => {
    if (!isBreathingActive || activeTab !== 'breathing') return;

    const timer = setInterval(() => {
      setBreathSeconds(prev => {
        if (prev > 1) return prev - 1;

        // Transition phases
        if (breathPhase === 'Inhale') {
          setBreathPhase('Hold');
          return 7;
        } else if (breathPhase === 'Hold') {
          setBreathPhase('Exhale');
          return 8;
        } else {
          setBreathPhase('Inhale');
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBreathingActive, breathPhase, activeTab]);

  // ================= 3. MEMORY MATCH GAME STATE =================
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);

  const initMemoryGame = () => {
    const deck = [...MEMORY_ICONS, ...MEMORY_ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, idx) => ({ id: idx, icon, isFlipped: false }));
    setCards(deck);
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
  };

  useEffect(() => {
    if (activeTab === 'memory') {
      initMemoryGame();
    }
  }, [activeTab]);

  const handleCardClick = (idx) => {
    if (flippedCards.length === 2 || cards[idx].isFlipped || matchedPairs.includes(cards[idx].icon)) return;

    playPopSound();
    const newCards = [...cards];
    newCards[idx].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, idx];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [firstIdx, secondIdx] = newFlipped;

      if (cards[firstIdx].icon === cards[secondIdx].icon) {
        // Match found!
        playMatchChime();
        setMatchedPairs(prev => [...prev, cards[firstIdx].icon]);
        setFlippedCards([]);

        if (matchedPairs.length + 1 === MEMORY_ICONS.length && addXP) {
          addXP(50, 'Completed Mindful Memory Game!');
        }
      } else {
        // Flip back after 0.8s
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => i === firstIdx || i === secondIdx ? { ...c, isFlipped: false } : c));
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-5">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0F172A] rounded-xl p-5 border border-[#E5E7EB] dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-purple-500" />
              <span>Study Break & Relaxation Zone</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Take a 5-minute pause to refresh your mind, destress, and boost your concentration!
          </p>
        </div>

        {/* TAB NAVIGATION SWITCHER */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('bubbles')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bubbles'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zen Bubbles</span>
          </button>

          <button
            onClick={() => setActiveTab('breathing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'breathing'
                ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>4-7-8 Breathing</span>
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'memory'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Memory Match</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: ZEN BUBBLE POPPER ================= */}
      {activeTab === 'bubbles' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl p-5 border border-[#E5E7EB] dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                🫧 Zen Bubble Popper
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tap or click floating bubbles to relieve stress and tension.
              </p>
            </div>
            <div className="text-right shrink-0 min-w-[70px]">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block whitespace-nowrap">Popped</span>
              <span className="text-xl font-black text-purple-600 dark:text-purple-400">{poppedCount}</span>
            </div>
          </div>

          {/* BUBBLE CANVAS CONTAINER */}
          <div className="relative w-full h-[360px] sm:h-[420px] bg-[#F1F5F9] dark:bg-[#090D16] rounded-2xl overflow-hidden border border-purple-200 dark:border-purple-500/20 shadow-inner flex items-center justify-center transition-colors duration-300">
            {bubbles.map(bubble => (
              <button
                key={bubble.id}
                onClick={() => handlePopBubble(bubble.id)}
                style={{
                  left: `${bubble.x}%`,
                  top: `${bubble.y}%`,
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`
                }}
                className={`absolute rounded-full ${bubble.color} shadow-lg shadow-purple-500/30 border border-white/40 cursor-pointer transition-all duration-300 hover:scale-110 active:scale-90 flex items-center justify-center animate-bounce`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-white/60 absolute top-2 left-2" />
              </button>
            ))}

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-purple-200 dark:border-slate-800 text-[11px] text-purple-700 dark:text-purple-300 font-bold pointer-events-none shadow-xs transition-colors">
              ✨ Tap bubbles to pop & destress
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: GUIDED BREATHING CIRCLE ================= */}
      {activeTab === 'breathing' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl p-5 border border-[#E5E7EB] dark:border-slate-800 shadow-xs space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              🌬️ 4-7-8 Stress Relief Breathing
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Follow the expanding circle: Inhale deeply for 4s, Hold for 7s, and Exhale slowly for 8s.
            </p>
          </div>

          {/* PULSING BREATHING CIRCLE */}
          <div className="flex flex-col items-center justify-center py-6 space-y-6">
            <div
              className={`w-56 h-56 sm:w-64 sm:h-64 rounded-full flex flex-col items-center justify-center transition-all duration-1000 shadow-2xl ${
                breathPhase === 'Inhale'
                  ? 'bg-teal-500/20 border-4 border-teal-400 scale-110 shadow-teal-500/40'
                  : breathPhase === 'Hold'
                  ? 'bg-amber-500/20 border-4 border-amber-400 scale-110 shadow-amber-500/40'
                  : 'bg-purple-500/20 border-4 border-purple-400 scale-90 shadow-purple-500/40'
              }`}
            >
              <span className="text-sm font-bold tracking-widest uppercase text-slate-600 dark:text-slate-300">
                {breathPhase}
              </span>
              <span className="text-5xl font-black text-slate-900 dark:text-white mt-1">
                {breathSeconds}s
              </span>
            </div>

            <button
              onClick={() => setIsBreathingActive(!isBreathingActive)}
              className={`flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-md ${
                isBreathingActive
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {isBreathingActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{isBreathingActive ? 'Pause Exercise' : 'Start Breathing Exercise'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 3: MINDFUL MEMORY MATCH ================= */}
      {activeTab === 'memory' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl p-5 border border-[#E5E7EB] dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                🧠 Mindful Memory Match
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Flip cards to match icon pairs.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Moves: <span className="font-bold text-blue-600 dark:text-blue-400">{moves}</span>
              </span>
              <button
                onClick={initMemoryGame}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                title="Restart Game"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4x4 CARD GRID */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-md mx-auto pt-2">
            {cards.map((card, idx) => {
              const isMatched = matchedPairs.includes(card.icon);
              return (
                <button
                  key={idx}
                  onClick={() => handleCardClick(idx)}
                  className={`h-20 sm:h-24 rounded-2xl text-2xl sm:text-3xl font-extrabold flex items-center justify-center transition-all duration-300 cursor-pointer border shadow-xs ${
                    card.isFlipped || isMatched
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 scale-100'
                      : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {card.isFlipped || isMatched ? card.icon : '❓'}
                </button>
              );
            })}
          </div>

          {matchedPairs.length === MEMORY_ICONS.length && (
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 p-4 rounded-xl text-center space-y-1 mt-4">
              <h3 className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Great Job! Mind Refreshed!</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                You completed the puzzle in {moves} moves. Ready to return to study!
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
