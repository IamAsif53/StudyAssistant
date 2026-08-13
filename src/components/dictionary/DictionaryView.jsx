import React, { useState, useEffect } from 'react';
import {
  Search, Volume2, Bookmark, BookmarkCheck, Sparkles, BookOpen,
  ArrowRight, RefreshCw, Trash2, Tag, Lightbulb
} from 'lucide-react';

// Quick Popular Academic Words for Students
const SUGGESTED_WORDS = [
  'Book', 'Perseverance', 'Photosynthesis', 'Hypothesis', 'Velocity',
  'Catalyst', 'Equation', 'Osmosis', 'Momentum'
];

export const DictionaryView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeWord, setActiveWord] = useState('Book');
  const [loading, setLoading] = useState(false);
  const [wordData, setWordData] = useState(null);
  const [bengaliTranslation, setBengaliTranslation] = useState(null);
  const [englishCategories, setEnglishCategories] = useState([]);
  const [synonymsList, setSynonymsList] = useState([]);
  const [antonymsList, setAntonymsList] = useState([]);
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'saved'

  // Bookmarked vocabulary list stored in localStorage
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('ssp_vocab_bookmarks');
      return saved ? JSON.parse(saved) : [
        {
          word: 'Perseverance',
          bengali: 'অধ্যবসায় / সংকল্প',
          phonetic: 'পারসিভ্যারেন্স',
          partOfSpeech: 'noun',
          definition: 'Persistence in doing something despite difficulty or delay in achieving success.',
          example: 'Her perseverance helped her top the board examination.',
          addedAt: new Date().toLocaleDateString()
        }
      ];
    } catch (e) {
      return [];
    }
  });

  // Recent Search History stored in localStorage
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('ssp_vocab_history');
      return saved ? JSON.parse(saved) : ['Book', 'Perseverance', 'Photosynthesis', 'Velocity'];
    } catch (e) {
      return ['Book'];
    }
  });

  useEffect(() => {
    localStorage.setItem('ssp_vocab_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('ssp_vocab_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Main Comprehensive Fetch Routine
  const fetchWordDetails = async (queryWord) => {
    if (!queryWord || !queryWord.trim()) return;
    const cleanWord = queryWord.trim().toLowerCase();
    
    setLoading(true);
    setWordData(null);
    setBengaliTranslation(null);
    setEnglishCategories([]);
    setSynonymsList([]);
    setAntonymsList([]);
    setActiveWord(queryWord.trim());

    // Update Search History
    setSearchHistory(prev => {
      const filtered = prev.filter(w => w.toLowerCase() !== cleanWord);
      return [queryWord.trim(), ...filtered].slice(0, 10);
    });

    try {
      // Execute 5 Concurrent Requests for Fast & Accurate Performance
      const [dictRes, gtRes, synRes, antRes, posRes] = await Promise.allSettled([
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`),
        fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=bn&dt=t&dt=bd&q=${encodeURIComponent(cleanWord)}`),
        fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(cleanWord)}&max=10`),
        fetch(`https://api.datamuse.com/words?rel_ant=${encodeURIComponent(cleanWord)}&max=10`),
        fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(cleanWord)}&md=p&max=25`)
      ]);

      // 1. Parse Free Dictionary API Data
      let parsedDictData = null;
      if (dictRes.status === 'fulfilled' && dictRes.value.ok) {
        const dictJson = await dictRes.value.json();
        if (Array.isArray(dictJson) && dictJson.length > 0) {
          parsedDictData = dictJson[0];
          setWordData(parsedDictData);
        }
      }

      // 2. Parse Google Translate Bengali Data
      if (gtRes.status === 'fulfilled' && gtRes.value.ok) {
        const gtJson = await gtRes.value.json();
        
        // Extract Primary Bengali Translation
        const primaryMeaning = gtJson?.[0]?.[0]?.[0] || cleanWord;
        
        // Extract Categorized Bengali Meanings (Noun, Verb, Adjective...)
        const categories = [];
        if (Array.isArray(gtJson?.[1])) {
          gtJson[1].forEach(item => {
            if (item?.[0] && Array.isArray(item?.[1])) {
              categories.push({
                pos: item[0],
                words: item[1].slice(0, 5)
              });
            }
          });
        }

        // Generate Phonetic Bangla Transliteration Hint if available
        let phoneticHint = cleanWord;
        if (parsedDictData?.phonetics?.[0]?.text) {
          phoneticHint = parsedDictData.phonetics[0].text;
        }

        setBengaliTranslation({
          primary: primaryMeaning,
          categories,
          phonetic: phoneticHint
        });
      } else {
        // Fallback Bengali Meaning
        setBengaliTranslation({
          primary: cleanWord,
          categories: [],
          phonetic: cleanWord
        });
      }

      // 3. Build English Part of Speech Categories
      const posMap = new Map();

      // A. Extract from Free Dictionary API
      if (parsedDictData?.meanings) {
        parsedDictData.meanings.forEach(m => {
          if (!m.partOfSpeech) return;
          const rawPos = m.partOfSpeech.toLowerCase();
          let posLabel = rawPos.charAt(0).toUpperCase() + rawPos.slice(1);
          if (rawPos === 'n') posLabel = 'Noun';
          if (rawPos === 'v') posLabel = 'Verb';
          if (rawPos === 'adj') posLabel = 'Adjective';
          if (rawPos === 'adv') posLabel = 'Adverb';

          if (!posMap.has(posLabel)) posMap.set(posLabel, new Set());
          const targetSet = posMap.get(posLabel);

          if (Array.isArray(m.synonyms)) {
            m.synonyms.forEach(s => targetSet.add(s));
          }
          if (Array.isArray(m.definitions)) {
            m.definitions.forEach(d => {
              if (Array.isArray(d.synonyms)) d.synonyms.forEach(s => targetSet.add(s));
            });
          }
        });
      }

      // B. Extract from Datamuse Part of Speech API
      if (posRes.status === 'fulfilled' && posRes.value.ok) {
        const posJson = await posRes.value.json();
        if (Array.isArray(posJson)) {
          posJson.forEach(item => {
            if (!item.word || !Array.isArray(item.tags)) return;
            item.tags.forEach(tag => {
              let posLabel = null;
              if (tag === 'n') posLabel = 'Noun';
              else if (tag === 'v') posLabel = 'Verb';
              else if (tag === 'adj') posLabel = 'Adjective';
              else if (tag === 'adv') posLabel = 'Adverb';

              if (posLabel) {
                if (!posMap.has(posLabel)) posMap.set(posLabel, new Set());
                if (item.word.toLowerCase() !== cleanWord) {
                  posMap.get(posLabel).add(item.word);
                }
              }
            });
          });
        }
      }

      const formattedPosList = [];
      posMap.forEach((wordsSet, posLabel) => {
        const wordsList = Array.from(wordsSet).slice(0, 5);
        if (wordsList.length > 0) {
          formattedPosList.push({
            pos: posLabel,
            words: wordsList
          });
        }
      });

      setEnglishCategories(formattedPosList);

      // 4. Aggregate Synonyms from Dictionary API + Datamuse API
      const collectedSynonyms = new Set();
      
      // From Dictionary API
      if (parsedDictData?.meanings) {
        parsedDictData.meanings.forEach(m => {
          if (m.synonyms) m.synonyms.forEach(s => collectedSynonyms.add(s));
          if (m.definitions) {
            m.definitions.forEach(d => {
              if (d.synonyms) d.synonyms.forEach(s => collectedSynonyms.add(s));
            });
          }
        });
      }

      // From Datamuse API
      if (synRes.status === 'fulfilled' && synRes.value.ok) {
        const synJson = await synRes.value.json();
        if (Array.isArray(synJson)) {
          synJson.forEach(item => {
            if (item.word) collectedSynonyms.add(item.word);
          });
        }
      }

      setSynonymsList(Array.from(collectedSynonyms).slice(0, 12));

      // 4. Aggregate Antonyms from Dictionary API + Datamuse API
      const collectedAntonyms = new Set();
      
      // From Dictionary API
      if (parsedDictData?.meanings) {
        parsedDictData.meanings.forEach(m => {
          if (m.antonyms) m.antonyms.forEach(a => collectedAntonyms.add(a));
          if (m.definitions) {
            m.definitions.forEach(d => {
              if (d.antonyms) d.antonyms.forEach(a => collectedAntonyms.add(a));
            });
          }
        });
      }

      // From Datamuse API
      if (antRes.status === 'fulfilled' && antRes.value.ok) {
        const antJson = await antRes.value.json();
        if (Array.isArray(antJson)) {
          antJson.forEach(item => {
            if (item.word) collectedAntonyms.add(item.word);
          });
        }
      }

      setAntonymsList(Array.from(collectedAntonyms).slice(0, 10));

    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchWordDetails('Book');
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchWordDetails(searchTerm);
    }
  };

  // Play Audio Pronunciation
  const handlePlayAudio = () => {
    const audioObj = wordData?.phonetics?.find(p => p.audio && p.audio.trim().length > 0);
    if (audioObj?.audio) {
      const audio = new Audio(audioObj.audio);
      audio.play().catch(() => playSpeechSynthesis());
    } else {
      playSpeechSynthesis();
    }
  };

  const playSpeechSynthesis = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(activeWord);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Extract primary English example sentence
  const getEnglishExampleSentence = () => {
    if (wordData?.meanings) {
      for (const m of wordData.meanings) {
        if (m.definitions) {
          for (const d of m.definitions) {
            if (d.example && d.example.trim().length > 0) {
              return d.example;
            }
          }
        }
      }
    }
    // Fallback clean English example sentence
    return `She looked up the definition of "${activeWord}" to complete her homework assignment.`;
  };

  // Toggle Bookmark
  const isBookmarked = bookmarks.some(b => b.word.toLowerCase() === activeWord.toLowerCase());
  
  const toggleBookmark = () => {
    if (isBookmarked) {
      setBookmarks(prev => prev.filter(b => b.word.toLowerCase() !== activeWord.toLowerCase()));
    } else {
      const newBookmark = {
        word: activeWord,
        bengali: bengaliTranslation?.primary || 'বাংলা অর্থ',
        phonetic: wordData?.phonetic || bengaliTranslation?.phonetic || '',
        partOfSpeech: wordData?.meanings?.[0]?.partOfSpeech || 'word',
        definition: wordData?.meanings?.[0]?.definitions?.[0]?.definition || 'Definition saved.',
        example: getEnglishExampleSentence(),
        addedAt: new Date().toLocaleDateString()
      };
      setBookmarks(prev => [newBookmark, ...prev]);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-20 lg:pb-12 px-0 overflow-x-hidden">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white dark:bg-[#0F172A] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-lg sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 sm:gap-3">
            <span className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            <span>English & Bengali Dictionary</span>
          </h1>
          <p className="text-[11px] sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Search vocabulary for instant English definitions, Bengali meanings (বাংলা অর্থ), synonyms & antonyms.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl shrink-0 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer text-center ${
              activeTab === 'search'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🔍 Search Dictionary
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>⭐ My Vocabulary</span>
            <span className="text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300 px-1.5 py-0.5 rounded-full">
              {bookmarks.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'search' ? (
        <>
          {/* SEARCH INPUT */}
          <div className="bg-white dark:bg-[#0F172A] p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-3.5 sm:left-4 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search any English word (e.g. Book, Perseverance)..."
                className="w-full h-10 sm:h-12 pl-9 sm:pl-12 pr-20 sm:pr-28 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 shadow-inner"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-1.5 sm:right-2 px-3 sm:px-4 h-7 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Search</span>}
              </button>
            </form>
          </div>

          {/* MAIN DICTIONARY RESULT DISPLAY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* LEFT 2 COLUMNS: WORD DETAILS & BENGALI TRANSLATION */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* WORD HERO BANNER & BENGALI CARD */}
              <div className="bg-white dark:bg-[#0F172A] p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden space-y-4 sm:space-y-6">
                
                {/* Header Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight capitalize">
                      {activeWord}
                    </h2>
                    <button
                      onClick={handlePlayAudio}
                      className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/80 dark:hover:bg-blue-900/80 text-blue-600 dark:text-blue-400 transition-all cursor-pointer shadow-xs border border-blue-200 dark:border-blue-800"
                      title="Listen Audio Pronunciation"
                    >
                      <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    {wordData?.meanings?.[0]?.partOfSpeech && (
                      <span className="px-2 py-0.5 rounded-md sm:rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-[10px] sm:text-xs font-bold capitalize border border-indigo-200 dark:border-indigo-800">
                        {wordData.meanings[0].partOfSpeech}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={toggleBookmark}
                    className={`flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                      isBookmarked
                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-500" /> : <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    <span>{isBookmarked ? 'Saved' : 'Save Word'}</span>
                  </button>
                </div>

                {/* BENGALI MEANING HIGHLIGHT BOX (বাংলা অর্থ ও অনুবাদ) */}
                <div className="bengali-translation-box p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border space-y-2.5 sm:space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase text-blue-600 dark:text-blue-400">
                      বাংলা অর্থ (BENGALI TRANSLATION)
                    </span>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    {/* Primary Bengali Meaning */}
                    <div className="flex items-baseline gap-3">
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                        {bengaliTranslation?.primary || activeWord}
                      </h3>
                    </div>

                    {/* English Part of Speech Categories (Noun, Adjective, Adverb, Verb...) */}
                    {englishCategories && englishCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1.5">
                        {englishCategories.map((cat, cIdx) => (
                          <div key={cIdx} className="bengali-cat-pill text-[11px] sm:text-xs font-medium flex items-start sm:items-center gap-1.5 px-2.5 py-1 rounded-lg sm:rounded-xl border shadow-xs leading-tight">
                            <span className="font-bold text-blue-600 dark:text-blue-400 capitalize shrink-0">{cat.pos}:</span>
                            <span className="text-slate-800 dark:text-slate-200 break-words">{cat.words.join(', ')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* STRICT ENGLISH SENTENCE EXAMPLE */}
                  <div className="pt-2 sm:pt-3 border-t border-blue-200/60 dark:border-slate-700/80 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                    <span className="font-bold text-amber-600 dark:text-amber-400">💡 Example (English): </span>
                    <span className="italic text-slate-700 dark:text-slate-300 leading-normal">"{getEnglishExampleSentence()}"</span>
                  </div>
                </div>

                {/* DETAILED ENGLISH DEFINITIONS & PARTS OF SPEECH */}
                {wordData?.meanings ? (
                  <div className="space-y-6 pt-2">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      English Definitions & Usages
                    </h4>

                    {wordData.meanings.map((meaning, mIdx) => (
                      <div key={mIdx} className="space-y-3 pb-5 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-black capitalize">
                            {meaning.partOfSpeech}
                          </span>
                        </div>

                        <ul className="space-y-2.5 pl-2">
                          {meaning.definitions.slice(0, 3).map((def, dIdx) => (
                            <li key={dIdx} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1">
                              <div className="flex items-start gap-2">
                                <span className="text-blue-500 font-bold">•</span>
                                <span className="font-medium leading-relaxed">{def.definition}</span>
                              </div>
                              {def.example && (
                                <p className="pl-4 text-xs font-normal text-slate-500 dark:text-slate-400 italic">
                                  "{def.example}"
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  !loading && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400">
                      Standard English dictionary entry loaded. Check the Bengali meaning and definitions above.
                    </div>
                  )
                )}

              </div>
            </div>

            {/* RIGHT COLUMN: SYNONYMS, ANTONYMS & RECENT HISTORY */}
            <div className="space-y-4 sm:space-y-6">
              
              {/* SYNONYMS & ANTONYMS CARD */}
              <div className="bg-white dark:bg-[#0F172A] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 sm:space-y-5">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-500" />
                  <span>Synonyms & Antonyms</span>
                </h3>

                {/* English Synonyms */}
                <div className="space-y-1.5 sm:space-y-2">
                  <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    Synonyms (সমার্থবোধক শব্দ)
                  </span>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {synonymsList.length > 0 ? (
                      synonymsList.map((syn, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSearchTerm(syn);
                            fetchWordDetails(syn);
                          }}
                          className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer border border-emerald-200 dark:border-emerald-800 hover:scale-105 active:scale-95"
                        >
                          {syn}
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No synonyms available</span>
                    )}
                  </div>
                </div>

                {/* English Antonyms */}
                <div className="space-y-1.5 sm:space-y-2 pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    Antonyms (বিপরীতার্থক শব্দ)
                  </span>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {antonymsList.length > 0 ? (
                      antonymsList.map((ant, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSearchTerm(ant);
                            fetchWordDetails(ant);
                          }}
                          className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer border border-rose-200 dark:border-rose-800 hover:scale-105 active:scale-95"
                        >
                          {ant}
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No direct antonyms listed</span>
                    )}
                  </div>
                </div>
              </div>

              {/* RECENT SEARCH HISTORY CARD */}
              <div className="bg-white dark:bg-[#0F172A] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Recent Searches</span>
                  </h3>
                  {searchHistory.length > 0 && (
                    <button
                      onClick={() => setSearchHistory([])}
                      className="text-[10px] sm:text-[11px] font-semibold text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      Clear History
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {searchHistory.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchTerm(item);
                        fetchWordDetails(item);
                      }}
                      className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs font-medium transition-all cursor-pointer flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                    >
                      <span>{item}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </>
      ) : (
        /* SAVED VOCABULARY BOOKMARKS VIEW */
        <div className="bg-white dark:bg-[#0F172A] p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>⭐ My Saved Vocabulary Flashcards</span>
              </h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Review your saved exam words and test your memory.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
              {bookmarks.length} Words Saved
            </span>
          </div>

          {bookmarks.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Saved Vocabulary Yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Search words in the dictionary and click "Save Word" to add them to your personalized study list!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarks.map((bm, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3 flex flex-col justify-between hover:border-blue-400 transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white capitalize">
                        {bm.word}
                      </h3>
                      <button
                        onClick={() => setBookmarks(prev => prev.filter(b => b.word !== bm.word))}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all cursor-pointer"
                        title="Remove Bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-black">
                      🇧🇩 {bm.bengali}
                    </div>

                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300 line-clamp-3">
                      {bm.definition}
                    </p>

                    {bm.example && (
                      <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 italic">
                        "{bm.example}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Added {bm.addedAt}</span>
                    <button
                      onClick={() => {
                        setActiveTab('search');
                        setSearchTerm(bm.word);
                        fetchWordDetails(bm.word);
                      }}
                      className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <span>Study Word</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DictionaryView;
