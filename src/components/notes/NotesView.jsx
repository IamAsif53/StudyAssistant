import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus, Search, Pin, Trash2, ArrowLeft, Check, Edit2, Edit3, Save,
  Bold, Italic, Underline, List, ListOrdered, CheckSquare, Link, Image, X, Eye
} from 'lucide-react';

const INITIAL_SIMPLE_NOTES = [
  {
    id: 'snote-1',
    title: 'Organic Chemistry Basics',
    subject: 'Chemistry',
    updatedAt: 'Updated 5 minutes ago',
    pinned: true,
    content: `Organic Chemistry

• Alkanes
• Alkenes
• Alkynes

Important
Remember the homologous series.

Exam Tip
Practice naming compounds every day.`
  },
  {
    id: 'snote-2',
    title: 'Integration by Parts',
    subject: 'Mathematics',
    updatedAt: 'Updated 2 hours ago',
    pinned: true,
    content: `Integration by Parts Formula

∫ u dv = uv - ∫ v du

Formula Steps:
1. Choose u using LIATE rule
2. Differentiate u to get du
3. Integrate dv to get v
4. Substitute into formula`
  },
  {
    id: 'snote-3',
    title: "Newton's Laws Summary",
    subject: 'Physics',
    updatedAt: 'Yesterday',
    pinned: false,
    content: `Newton's Laws of Motion

1. Law of Inertia: An object remains at rest unless acted on by net force.
2. F = ma: Force = mass × acceleration.
3. Action & Reaction: Equal and opposite forces.`
  },
  {
    id: 'snote-4',
    title: 'React useState Hook',
    subject: 'Computer Science',
    updatedAt: '3 days ago',
    pinned: false,
    content: `React useState Notes

• Syntax: const [state, setState] = useState(initialValue)
• Triggers component re-render on state mutation
• Always keep state updates immutable`
  }
];

export const NotesView = () => {
  // Local state for Simple Notes (persisted in localStorage)
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('ssp_simple_notes');
      return saved ? JSON.parse(saved) : INITIAL_SIMPLE_NOTES;
    } catch (e) {
      return INITIAL_SIMPLE_NOTES;
    }
  });

  useEffect(() => {
    localStorage.setItem('ssp_simple_notes', JSON.stringify(notes));
  }, [notes]);

  // Navigation & Search State
  const [activeNoteId, setActiveNoteId] = useState(notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All Subjects');
  const [showMobileEditor, setShowMobileEditor] = useState(false);

  // Reading Mode vs Edit Mode State (Default is Reading Mode!)
  const [isEditMode, setIsEditMode] = useState(false);

  // Modal State for New Note
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalSubject, setModalSubject] = useState('Chemistry');
  const [modalContent, setModalContent] = useState('');

  // Active Note Object
  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  // Editor Form State
  const [editorTitle, setEditorTitle] = useState(activeNote?.title || '');
  const [editorContent, setEditorContent] = useState(activeNote?.content || '');
  const textareaRef = useRef(null);

  // Sync Fields & Switch to Reading Mode when Active Note Changes
  useEffect(() => {
    if (activeNote) {
      setEditorTitle(activeNote.title);
      setEditorContent(activeNote.content);
      setIsEditMode(false); // Default to Reading Mode on note selection!
    }
  }, [activeNoteId]);

  // Selecting a note opens in Reading Mode
  const handleSelectNote = (id) => {
    setActiveNoteId(id);
    setIsEditMode(false);
    setShowMobileEditor(true);
  };

  // Save changes & return to Reading Mode
  const handleSaveAndReturnToReading = () => {
    if (!editorTitle.trim()) return;
    setNotes(prev => prev.map(n => n.id === activeNote.id ? {
      ...n,
      title: editorTitle.trim(),
      content: editorContent,
      updatedAt: 'Updated just now'
    } : n));
    setIsEditMode(false); // Switch back to Reading Mode!
  };

  // Toggle Pin
  const togglePin = (id) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  // Delete Note
  const handleDelete = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) {
      const remaining = notes.filter(n => n.id !== id);
      setActiveNoteId(remaining[0]?.id || null);
    }
    setIsEditMode(false);
  };

  // Create Note Form Handler
  const handleCreateNote = (e) => {
    e.preventDefault();
    if (!modalTitle.trim()) return;

    const newNote = {
      id: `snote-${Date.now()}`,
      title: modalTitle.trim(),
      subject: modalSubject.trim() || 'General',
      updatedAt: 'Updated just now',
      pinned: false,
      content: modalContent.trim() || `${modalTitle.trim()}\n\n• Point 1\n• Point 2`
    };

    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setModalTitle('');
    setModalContent('');
    setIsModalOpen(false);
    setIsEditMode(false); // Open new note in Reading Mode
    setShowMobileEditor(true);
  };

  // Formatting Toolbar Helper
  const insertFormatting = (prefix, suffix = '') => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = editorContent;
    const selected = text.substring(start, end) || 'text';
    const replacement = `${prefix}${selected}${suffix}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setEditorContent(newContent);
  };

  // Subject List for Dropdown
  const uniqueSubjects = ['All Subjects', ...new Set(notes.map(n => n.subject))];

  // Filtered Notes
  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === 'All Subjects' || n.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  // Calculate Word Count
  const wordCount = (isEditMode ? editorContent : activeNote?.content || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const getSubjectEmoji = (sub) => {
    if (sub === 'Chemistry') return '⚛';
    if (sub === 'Mathematics') return '📘';
    if (sub === 'Physics') return '⚡';
    if (sub === 'Computer Science') return '💻';
    return '📝';
  };

  return (
    <div className="w-full max-w-[1300px] mx-auto space-y-4 animate-in fade-in duration-300 pb-16 overflow-x-hidden">
      
      {/* 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT PANEL: NOTES LIST (280–320px / 4 Cols on Desktop) */}
        {/* ========================================================================= */}
        <div className={`lg:col-span-4 xl:col-span-4 space-y-4 ${showMobileEditor ? 'hidden lg:block' : 'block'}`}>
          
          {/* Header & New Note Button Card */}
          <div className="bg-white dark:bg-[#0F172A] rounded-xl p-4 border border-[#E5E7EB] dark:border-slate-800 shadow-xs space-y-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] dark:text-white tracking-tight">
                Notes
              </h1>
              <p className="text-xs text-[#6B7280] dark:text-slate-400 font-medium mt-0.5">
                Quickly save your study notes.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Note</span>
            </button>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-xs font-medium text-[#111827] dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>

            {/* Subject Filter Dropdown */}
            <div>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-xs font-semibold text-[#111827] dark:text-white cursor-pointer focus:outline-none"
              >
                {uniqueSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes List */}
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredNotes.length === 0 ? (
              <div className="bg-white dark:bg-[#0F172A] rounded-xl p-8 border border-[#E5E7EB] dark:border-slate-800 shadow-xs text-center space-y-3">
                <span className="text-3xl block">📒</span>
                <div>
                  <h4 className="text-sm font-bold text-[#111827] dark:text-white">No Notes Yet</h4>
                  <p className="text-xs text-[#6B7280] dark:text-slate-400">Start writing your first study note.</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Note</span>
                </button>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isActive = activeNoteId === note.id;
                const emoji = getSubjectEmoji(note.subject);

                return (
                  <div
                    key={note.id}
                    onClick={() => handleSelectNote(note.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-[#2563EB] dark:border-blue-500 text-[#111827] dark:text-white font-semibold shadow-2xs'
                        : 'bg-white dark:bg-[#0F172A] border-[#E5E7EB] dark:border-slate-800 hover:bg-[#F8FAFC] dark:hover:bg-slate-800/60 text-[#111827] dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs sm:text-sm font-bold truncate flex-1">
                        {emoji} {note.title}
                      </h3>
                      {note.pinned && <Pin className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400 shrink-0 fill-[#2563EB] dark:fill-blue-400" />}
                    </div>

                    <p className="text-xs text-[#6B7280] dark:text-slate-400 font-medium mt-1">
                      {note.subject}
                    </p>

                    <span className="text-[11px] text-[#6B7280] dark:text-slate-500 block mt-1">
                      {note.updatedAt}
                    </span>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: NOTE PANEL (READING MODE vs EDIT MODE) */}
        {/* ========================================================================= */}
        <div className={`lg:col-span-8 xl:col-span-8 space-y-4 ${!showMobileEditor ? 'hidden lg:block' : 'block'}`}>
          
          {/* Mobile Back Button */}
          <button
            onClick={() => setShowMobileEditor(false)}
            className="lg:hidden mb-2 flex items-center gap-1.5 text-xs font-bold text-[#2563EB] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Notes List
          </button>

          {!activeNote ? (
            <div className="bg-white dark:bg-[#0F172A] rounded-xl p-12 border border-[#E5E7EB] dark:border-slate-800 shadow-xs text-center space-y-3">
              <span className="text-4xl block">📒</span>
              <h3 className="text-lg font-bold text-[#111827] dark:text-white">No Note Selected</h3>
              <p className="text-xs text-[#6B7280] dark:text-slate-400">Select a note from the left panel or click "+ New Note" to get started.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#2563EB] text-white font-semibold text-xs shadow-xs"
              >
                + New Note
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-[#E5E7EB] dark:border-slate-800 shadow-xs flex flex-col min-h-[680px]">
              
              {/* NOTE HEADER */}
              <div className="p-4 sm:p-5 border-b border-[#E5E7EB] dark:border-slate-800 flex items-center justify-between gap-3">
                {isEditMode ? (
                  <div className="flex-1">
                    <input
                      type="text"
                      value={editorTitle}
                      onChange={(e) => setEditorTitle(e.target.value)}
                      className="text-lg sm:text-xl font-extrabold text-[#111827] dark:text-white bg-transparent focus:outline-none w-full border-b border-[#2563EB] pb-0.5"
                      placeholder="Note Title..."
                      autoFocus
                    />
                    <p className="text-xs text-[#2563EB] dark:text-blue-400 font-bold mt-1">
                      ✏️ Editing Mode • {activeNote.subject}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#2563EB] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                        {activeNote.subject}
                      </span>
                      {activeNote.pinned && (
                        <span className="text-[10px] font-extrabold text-[#2563EB] dark:text-blue-400 flex items-center gap-1">
                          <Pin className="w-3 h-3 fill-[#2563EB] dark:fill-blue-400" /> Pinned
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-[#111827] dark:text-white mt-1">
                      {activeNote.title}
                    </h2>
                    <p className="text-xs text-[#6B7280] dark:text-slate-400 font-medium mt-0.5">
                      {activeNote.updatedAt}
                    </p>
                  </div>
                )}

                {/* RIGHT TOP ACTIONS */}
                <div className="flex items-center gap-2">
                  {isEditMode ? (
                    <>
                      <button
                        onClick={handleSaveAndReturnToReading}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs shadow-xs cursor-pointer transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Note</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditorTitle(activeNote.title);
                          setEditorContent(activeNote.content);
                          setIsEditMode(false);
                        }}
                        className="px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-slate-700 text-[#6B7280] dark:text-slate-300 font-semibold text-xs hover:bg-[#F8FAFC] dark:hover:bg-slate-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditMode(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs shadow-xs cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit Note</span>
                      </button>

                      <button
                        onClick={() => togglePin(activeNote.id)}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          activeNote.pinned
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 border-blue-200 dark:border-blue-800'
                            : 'text-[#6B7280] dark:text-slate-400 border-[#E5E7EB] dark:border-slate-700 hover:bg-[#F8FAFC] dark:hover:bg-slate-800'
                        }`}
                        title={activeNote.pinned ? 'Unpin Note' : 'Pin Note'}
                      >
                        <Pin className={`w-4 h-4 ${activeNote.pinned ? 'fill-[#2563EB] dark:fill-blue-400' : ''}`} />
                      </button>

                      <button
                        onClick={() => handleDelete(activeNote.id)}
                        className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#EF4444] border border-red-200 dark:border-red-800/60 hover:bg-red-100 cursor-pointer transition-colors"
                        title="Delete Note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* EDITING MODE TOOLBAR ROW */}
              {isEditMode && (
                <div className="px-4 py-2 bg-[#F8FAFC] dark:bg-slate-800/60 border-b border-[#E5E7EB] dark:border-slate-800 flex items-center gap-1 overflow-x-auto">
                  <button
                    onClick={() => insertFormatting('**', '**')}
                    className="p-1.5 rounded-lg text-[#111827] dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 cursor-pointer font-bold"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => insertFormatting('*', '*')}
                    className="p-1.5 rounded-lg text-[#111827] dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 cursor-pointer italic"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => insertFormatting('<u>', '</u>')}
                    className="p-1.5 rounded-lg text-[#111827] dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 cursor-pointer underline"
                    title="Underline"
                  >
                    <Underline className="w-4 h-4" />
                  </button>

                  <div className="w-px h-5 bg-[#E5E7EB] dark:bg-slate-700 mx-1" />

                  <button
                    onClick={() => insertFormatting('• ')}
                    className="p-1.5 rounded-lg text-[#111827] dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 cursor-pointer"
                    title="Bullet List"
                  >
                    <List className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => insertFormatting('1. ')}
                    className="p-1.5 rounded-lg text-[#111827] dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 cursor-pointer"
                    title="Number List"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => insertFormatting('- [ ] ')}
                    className="p-1.5 rounded-lg text-[#111827] dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 cursor-pointer"
                    title="Checklist"
                  >
                    <CheckSquare className="w-4 h-4" />
                  </button>

                  <div className="w-px h-5 bg-[#E5E7EB] dark:bg-slate-700 mx-1" />

                  <button
                    onClick={() => insertFormatting('[Link Title](', ')')}
                    className="p-1.5 rounded-lg text-[#111827] dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 cursor-pointer"
                    title="Link"
                  >
                    <Link className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => insertFormatting('![Image](', ')')}
                    className="p-1.5 rounded-lg text-[#111827] dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 cursor-pointer"
                    title="Image"
                  >
                    <Image className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* BODY: READING MODE vs EDIT MODE */}
              <div className="p-5 flex-1 flex flex-col">
                {isEditMode ? (
                  /* EDITING CANVAS */
                  <textarea
                    ref={textareaRef}
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    placeholder="Type your study notes here..."
                    className="w-full flex-1 min-h-[420px] bg-transparent text-xs sm:text-sm font-sans text-[#111827] dark:text-slate-100 focus:outline-none resize-y leading-relaxed"
                  />
                ) : (
                  /* READING MODE CANVAS (Clean, formatted display) */
                  <div className="space-y-4 text-xs sm:text-sm text-[#111827] dark:text-slate-100 font-sans leading-relaxed whitespace-pre-wrap flex-1">
                    {activeNote.content}
                  </div>
                )}
              </div>

              {/* BOTTOM STATUS BAR */}
              <div className="px-5 py-3 border-t border-[#E5E7EB] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/60 rounded-b-xl flex items-center justify-between text-xs text-[#6B7280] dark:text-slate-400 font-medium">
                <div>
                  Words: <strong className="text-[#111827] dark:text-white">{wordCount}</strong>
                </div>

                {isEditMode ? (
                  <div className="flex items-center gap-1.5 text-[#2563EB] dark:text-blue-400 font-semibold">
                    <span>Editing Mode</span>
                    <Edit3 className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[#22C55E] dark:text-emerald-400 font-semibold">
                    <span>Saved ✓</span>
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* CREATE NOTE DIALOG (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0F172A] rounded-xl w-[92vw] sm:w-full max-w-md p-5 sm:p-6 border border-[#E5E7EB] dark:border-slate-800 shadow-xl space-y-4 relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#6B7280] hover:text-[#111827] dark:hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-[#111827] dark:text-white">
              Create Note
            </h3>

            <form onSubmit={handleCreateNote} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-[#111827] dark:text-slate-200 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Organic Chemistry Basics"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#111827] dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-semibold text-[#111827] dark:text-slate-200 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Chemistry, Mathematics..."
                  value={modalSubject}
                  onChange={(e) => setModalSubject(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#111827] dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#111827] dark:text-slate-200 mb-1">Content</label>
                <textarea
                  rows="5"
                  placeholder="Type note content..."
                  value={modalContent}
                  onChange={(e) => setModalContent(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#111827] dark:text-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-10 rounded-xl border border-[#E5E7EB] dark:border-slate-700 text-[#6B7280] dark:text-slate-300 font-semibold cursor-pointer text-xs sm:text-sm hover:bg-[#F8FAFC] dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-[#2563EB] text-white font-semibold cursor-pointer hover:bg-blue-700 text-xs sm:text-sm shadow-xs"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
