import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, Shuffle, Star, Plus } from 'lucide-react';

export const FlashcardsView = () => {
  const { flashcards, subjects, toggleMasteredFlashcard } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = flashcards[currentIndex] || flashcards[0];
  const sub = currentCard ? subjects.find(s => s.id === currentCard.subjectId) : null;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const rand = Math.floor(Math.random() * flashcards.length);
    setCurrentIndex(rand);
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-in fade-in duration-300 pb-12">
      
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Flashcards
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Card {currentIndex + 1} of {flashcards.length} • {sub?.name || 'Subject'}
        </p>
      </div>

      {/* Center 3D Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="perspective-1000 w-full h-72 cursor-pointer"
      >
        <div className={`relative w-full h-full duration-300 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front */}
          <div className="absolute inset-0 w-full h-full card-minimal p-6 flex flex-col justify-between backface-hidden bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase text-blue-600">Question</span>
              <span>{currentCard?.difficulty}</span>
            </div>

            <div className="text-center px-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {currentCard?.question}
              </h3>
            </div>

            <span className="text-[11px] text-center text-slate-400">Click to flip answer</span>
          </div>

          {/* Back */}
          <div className="absolute inset-0 w-full h-full card-minimal p-6 flex flex-col justify-between backface-hidden rotate-y-180 bg-white dark:bg-slate-900 border-emerald-500/50">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase text-emerald-600">Answer</span>
              <span>Verified</span>
            </div>

            <div className="text-center px-4">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                {currentCard?.answer}
              </h3>
            </div>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleMasteredFlashcard(currentCard.id); }}
                className="text-slate-500 hover:text-emerald-600 cursor-pointer flex items-center gap-1 font-medium"
              >
                <Star className={`w-3.5 h-3.5 ${currentCard?.mastered ? 'text-amber-500 fill-amber-500' : ''}`} />
                <span>{currentCard?.mastered ? 'Favorite' : 'Mark Favorite'}</span>
              </button>

              <span className="text-[11px] text-slate-400">Click to flip front</span>
            </div>
          </div>

        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <button
          onClick={handleShuffle}
          className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer flex items-center gap-1"
        >
          <Shuffle className="w-3.5 h-3.5" /> Shuffle
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
