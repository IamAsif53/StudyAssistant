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

  // Main Comprehensive Fetch Routine (Online Dictionary)
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
      // Execute Concurrent Requests for Dictionary API & Translation
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
        const primaryMeaning = gtJson?.[0]?.[0]?.[0] || cleanWord;

        let phoneticHint = cleanWord;
        if (parsedDictData?.phonetics?.[0]?.text) {
          phoneticHint = parsedDictData.phonetics[0].text;
        }

        setBengaliTranslation({
          primary: primaryMeaning,
          phonetic: phoneticHint
        });
      }

      // 3. Build English Part of Speech Categories
      const posMap = new Map();

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

      // 4. Aggregate Synonyms
      const collectedSynonyms = new Set();
      if (parsedDictData?.meanings) {
        parsedDictData.meanings.forEach(m => {
          if (m.synonyms) m.synonyms.forEach(s => collectedSynonyms.add(s));
        });
      }
      if (synRes.status === 'fulfilled' && synRes.value.ok) {
        const synJson = await synRes.value.json();
        if (Array.isArray(synJson)) {
          synJson.forEach(item => {
            if (item.word) collectedSynonyms.add(item.word);
          });
        }
      }
      setSynonymsList(Array.from(collectedSynonyms).slice(0, 12));

      // 5. Aggregate Antonyms
      const collectedAntonyms = new Set();
      if (parsedDictData?.meanings) {
        parsedDictData.meanings.forEach(m => {
          if (m.antonyms) m.antonyms.forEach(a => collectedAntonyms.add(a));
        });
      }
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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
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
        bengali: bengaliTranslation?.primary || 'অধ্যবসায়',
        phonetic: bengaliTranslation?.phonetic || activeWord,
        partOfSpeech: wordData?.meanings?.[0]?.partOfSpeech || 'Noun',
        definition: wordData?.meanings?.[0]?.definitions?.[0]?.definition || `Definition of ${activeWord}`,
        example: getEnglishExampleSentence(),
        addedAt: new Date().toLocaleDateString()
      };
      setBookmarks(prev => [newBookmark, ...prev]);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-300 pb-16">
      
      {/* DICTIONARY HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0F172A] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              English & Bengali Dictionary
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Search vocabulary for instant English definitions, Bengali meanings (বাংলা অর্থ), synonyms & antonyms.
          </p>
        </div>

        {/* TAB CONTROLS */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl sm:rounded-2xl shrink-0 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Dictionary</span>
          </button>
          
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>My Vocabulary</span>
            {bookmarks.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                {bookmarks.length}
              </span>
            )}
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
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/20 p-4 sm:p-6 rounded-2xl border border-blue-100 dark:border-blue-900/60 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase text-blue-600 dark:text-blue-400">
                      বাংলা অর্থ (BENGALI TRANSLATION)
                    </span>
                    {bengaliTranslation?.phonetic && (
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        উচ্চারণ: <span className="font-bold text-slate-800 dark:text-slate-200">{bengaliTranslation.phonetic}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                    {bengaliTranslation?.primary || activeWord}
                  </h3>

                  {/* ENGLISH EXAMPLE SENTENCE */}
                  <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/40">
                    <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 italic flex items-start gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span><strong className="not-italic text-slate-900 dark:text-white font-bold">Example (English):</strong> "{getEnglishExampleSentence()}"</span>
                    </p>
                  </div>
                </div>

                {/* ENGLISH DEFINITIONS & USAGES */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-black tracking-wider uppercase text-slate-400 dark:text-slate-500">
                    ENGLISH DEFINITIONS & USAGES
                  </h4>

                  {wordData?.meanings ? (
                    <div className="space-y-4">
                      {wordData.meanings.map((meaning, mIdx) => (
                        <div key={mIdx} className="space-y-2">
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold capitalize">
                            {meaning.partOfSpeech}
                          </span>

                          <ul className="space-y-2 pl-2">
                            {meaning.definitions?.map((def, dIdx) => (
                              <li key={dIdx} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1">
                                <p className="font-medium flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                                  <span>{def.definition}</span>
                                </p>
                                {def.example && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 pl-3.5 italic">
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
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Searching complete dictionary entry...
                    </p>
                  )}
                </div>

              </div>
            </div>

            {/* RIGHT COLUMN: SYNONYMS, ANTONYMS & RECENT SEARCHES */}
            <div className="space-y-4 sm:space-y-6">
              
              {/* SYNONYMS & ANTONYMS CARD */}
              <div className="bg-white dark:bg-[#0F172A] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Synonyms & Antonyms</span>
                </h3>

                {/* SYNONYMS */}
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    SYNONYMS (সমার্থকবোধক শব্দ)
                  </span>
                  {synonymsList.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {synonymsList.map((syn, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSearchTerm(syn);
                            fetchWordDetails(syn);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold cursor-pointer transition-colors border border-emerald-200 dark:border-emerald-800"
                        >
                          {syn}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No direct synonyms listed</p>
                  )}
                </div>

                {/* ANTONYMS */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    ANTONYMS (বিপরীতার্থক শব্দ)
                  </span>
                  {antonymsList.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {antonymsList.map((ant, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSearchTerm(ant);
                            fetchWordDetails(ant);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 text-xs font-bold cursor-pointer transition-colors border border-rose-200 dark:border-rose-800"
                        >
                          {ant}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No direct antonyms listed</p>
                  )}
                </div>
              </div>

              {/* RECENT SEARCHES */}
              <div className="bg-white dark:bg-[#0F172A] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Recent Searches
                  </h3>
                  <button
                    onClick={() => setSearchHistory([])}
                    className="text-[10px] text-slate-400 hover:text-red-500 font-semibold cursor-pointer"
                  >
                    Clear History
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {searchHistory.map((word, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchTerm(word);
                        fetchWordDetails(word);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer transition-colors flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                    >
                      <span>{word}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </>
      ) : (
        /* SAVED VOCABULARY TAB */
        <div className="bg-white dark:bg-[#0F172A] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Saved Vocabulary List
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Your bookmarked words for quick revision and exam preparation.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800">
              {bookmarks.length} Words Saved
            </span>
          </div>

          {bookmarks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarks.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                        {item.partOfSpeech}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 capitalize">
                        {item.word}
                      </h3>
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                        বাংলা অর্থ: {item.bengali}
                      </p>
                    </div>

                    <button
                      onClick={() => setBookmarks(prev => prev.filter(b => b.word.toLowerCase() !== item.word.toLowerCase()))}
                      className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {item.definition}
                  </p>

                  {item.example && (
                    <p className="text-xs text-slate-500 italic bg-white dark:bg-slate-800/80 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      "{item.example}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No saved vocabulary words yet
              </p>
              <p className="text-xs text-slate-400">
                Tap the "Save Word" button when searching dictionary terms to save them here!
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
