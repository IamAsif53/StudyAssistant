import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

const AppContext = createContext();

const safeJSONParse = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const INITIAL_SUBJECTS = [];

const INITIAL_HOMEWORK = [
  {
    id: 'hw-1',
    title: 'Solve Calculus Integration Set 4',
    subjectId: 'sub-1',
    priority: 'High',
    dueDate: '2026-08-09',
    estimatedMinutes: 90,
    status: 'Pending',
    description: 'Complete problems 1 to 25 from Chapter 7 Calculus manual.',
    notes: 'Remember substitution rule for question 12!'
  },
  {
    id: 'hw-2',
    title: 'Organic Chemistry Reactions Worksheet',
    subjectId: 'sub-6',
    priority: 'Low',
    dueDate: '2026-08-12',
    estimatedMinutes: 45,
    status: 'Pending',
    description: 'Draw mechanism diagrams for electrophilic addition.',
    notes: 'Check online portal for answer key hints.'
  },
  {
    id: 'hw-3',
    title: 'Physics Wave Motion Lab Report',
    subjectId: 'sub-2',
    priority: 'Medium',
    dueDate: '2026-08-11',
    estimatedMinutes: 60,
    status: 'Pending',
    description: 'Write up observation findings for double-slit experiment.',
    notes: 'Include diagram plot from lab data.'
  },
  {
    id: 'hw-4',
    title: 'React Component Library',
    subjectId: 'sub-3',
    priority: 'High',
    dueDate: '2026-08-11',
    estimatedMinutes: 120,
    status: 'Pending',
    description: 'Build responsive UI components.',
    notes: 'Use Tailwind CSS.'
  }
];

const INITIAL_EXAMS = [
  {
    id: 'exam-1',
    title: 'Midterm Mathematics Examination',
    subjectId: 'sub-1',
    date: '2026-08-15',
    time: '09:00 AM',
    importance: 'High',
    syllabus: [
      { id: 's1', text: 'Limits & Continuity', completed: true },
      { id: 's2', text: 'Derivatives & Chain Rule', completed: true },
      { id: 's3', text: 'Definite & Indefinite Integrals', completed: false },
      { id: 's4', text: 'Differential Equations Basics', completed: false },
    ]
  },
  {
    id: 'exam-2',
    title: 'Physics Midterm Examination',
    subjectId: 'sub-2',
    date: '2026-08-20',
    time: '11:00 AM',
    importance: 'High',
    syllabus: [
      { id: 's1', text: 'Newtonian Dynamics', completed: true },
      { id: 's2', text: 'Work, Energy & Power', completed: true },
      { id: 's3', text: 'Wave Interference & Optics', completed: false }
    ]
  }
];

const INITIAL_STUDY_SESSIONS = [];

const INITIAL_NOTES = [
  {
    id: 'note-1',
    subjectId: 'sub-1',
    title: 'Calculus Integration Techniques Cheat Sheet',
    content: `# Integration Rules Overview\n\n1. **Integration by Parts**: \\( \\int u \\, dv = uv - \\int v \\, du \\)\n2. **U-Substitution**: Choose \\( u \\) such that \\( du \\) appears elsewhere in the integrand.\n3. **Partial Fractions**: Decompose rational expressions before integration.`,
    pinned: true,
    favorite: true,
    updatedAt: '2026-08-06'
  },
  {
    id: 'note-2',
    subjectId: 'sub-3',
    title: 'React Custom Hooks Best Practices',
    content: `# React Hooks Summary\n\n- Custom hooks must start with \`use\` prefix.\n- Always wrap async logic inside \`useEffect\` cleanups.\n- Keep state localized to custom hooks when possible.`,
    pinned: false,
    favorite: false,
    updatedAt: '2026-08-05'
  }
];

const INITIAL_FLASHCARDS = [
  { id: 'fc-1', subjectId: 'sub-1', question: 'What is the derivative of sin(x)?', answer: 'cos(x)', mastered: true },
  { id: 'fc-2', subjectId: 'sub-1', question: 'What is the derivative of e^x?', answer: 'e^x', mastered: true },
  { id: 'fc-3', subjectId: 'sub-2', question: 'State Snell\'s Law of Refraction.', answer: 'n1 * sin(θ1) = n2 * sin(θ2)', mastered: false },
  { id: 'fc-4', subjectId: 'sub-3', question: 'What does JSX stand for?', answer: 'JavaScript XML', mastered: false },
];

const INITIAL_GOALS = [
  { id: 'g-1', title: 'Complete 10 Calculus Problem Sets', target: 10, current: 7, unit: 'sets', type: 'Weekly', completed: false },
  { id: 'g-2', title: 'Maintain 5-Day Study Streak', target: 5, current: 5, unit: 'days', type: 'Daily', completed: true },
  { id: 'g-3', title: 'Finish 20 Focus Pomodoro Sessions', target: 20, current: 14, unit: 'sessions', type: 'Monthly', completed: false }
];

const INITIAL_ACHIEVEMENTS = [
  { id: 'ach-1', title: 'Early Bird', desc: 'Completed a study session before 8:00 AM', icon: 'Sun', color: 'from-amber-400 to-orange-500', unlocked: true },
  { id: 'ach-2', title: 'Streak Master', desc: 'Maintained a 7-day study streak', icon: 'Flame', color: 'from-orange-500 to-red-600', unlocked: true },
  { id: 'ach-3', title: 'Task Ninja', desc: 'Completed 10 homework tasks in one day', icon: 'CheckCircle2', color: 'from-emerald-400 to-teal-600', unlocked: true },
  { id: 'ach-4', title: 'Focus Champion', desc: 'Accumulated 10 hours of Pomodoro focus time', icon: 'Timer', color: 'from-blue-500 to-indigo-600', unlocked: false },
  { id: 'ach-5', title: 'Subject Scholar', desc: 'Reached 100% of weekly target hours in all subjects', icon: 'Award', color: 'from-purple-500 to-indigo-600', unlocked: false },
  { id: 'ach-6', title: 'Night Owl', desc: 'Studied for 2+ hours after 10:00 PM', icon: 'Moon', color: 'from-violet-600 to-indigo-800', unlocked: false },
  { id: 'ach-7', title: '100 Focus Hours', desc: 'Logged over 100 total study hours', icon: 'Clock', color: 'from-pink-500 to-rose-500', unlocked: false }
];

const INITIAL_RESOURCES = [
  { id: 'res-1', subjectId: 'sub-1', title: 'Calculus Cheat Sheet PDF', type: 'PDF', size: '2.4 MB', url: '#', downloads: 142 },
  { id: 'res-2', subjectId: 'sub-3', title: 'React Hooks & State Architecture', type: 'Guide', size: '1.8 MB', url: '#', downloads: 215 },
  { id: 'res-3', subjectId: 'sub-2', title: 'Physics Formula Handbook', type: 'PDF', size: '3.1 MB', url: '#', downloads: 98 },
  { id: 'res-4', subjectId: 'sub-4', title: 'Interactive Cell Biology Models', type: 'Video', size: 'HD 1080p', url: '#', downloads: 175 }
];

export const AppProvider = ({ children }) => {
  // User & View Settings
  const [userRole, setUserRole] = useState(() => localStorage.getItem('ssp_role') || 'student');
  const [theme, setTheme] = useState(() => localStorage.getItem('ssp_theme') || 'light');
  const [userProfile, setUserProfile] = useState(() => safeJSONParse('ssp_profile', {
    name: 'Alex Vance',
    school: 'St. Jude Academy of Science',
    grade: 'Grade 11 - STEM Track',
    roll: '2026-1049',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    bio: 'Aspiring AI Engineer & Physics enthusiast. Striving for straight A*s!',
    xp: 2450,
    level: 5,
    streak: 9,
    longestStreak: 14,
    lastStudyDate: '2026-08-07'
  }));

  // Data Collections with Safe JSON Parsing
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('ssp_subjects_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    localStorage.removeItem('ssp_subjects');
    localStorage.setItem('ssp_subjects_v2', JSON.stringify([]));
    return [];
  });

  const [homework, setHomework] = useState(() => safeJSONParse('ssp_hw', INITIAL_HOMEWORK));
  const [exams, setExams] = useState(() => safeJSONParse('ssp_exams', INITIAL_EXAMS));
  const [studySessions, setStudySessions] = useState(() => safeJSONParse('ssp_sessions', INITIAL_STUDY_SESSIONS));
  const [notes, setNotes] = useState(() => safeJSONParse('ssp_notes', INITIAL_NOTES));
  const [flashcards, setFlashcards] = useState(() => safeJSONParse('ssp_flashcards', INITIAL_FLASHCARDS));
  const [goals, setGoals] = useState(() => safeJSONParse('ssp_goals', INITIAL_GOALS));
  const [achievements, setAchievements] = useState(() => safeJSONParse('ssp_achievements', INITIAL_ACHIEVEMENTS));
  const [resources, setResources] = useState(() => safeJSONParse('ssp_resources', INITIAL_RESOURCES));
  const [syllabusProgress, setSyllabusProgress] = useState(() => safeJSONParse('ssp_syllabus_progress', {}));

  // Active View Tab
  const [activeTab, setActiveTab] = useState('planner');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Modals
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  // Web Audio Synth for Ambient Pomodoro Sound Generator
  const audioCtxRef = useRef(null);
  const soundNodeRef = useRef(null);
  const [ambientSound, setAmbientSound] = useState('off');

  // Persist State to LocalStorage
  useEffect(() => {
    localStorage.setItem('ssp_role', userRole);
    localStorage.setItem('ssp_theme', theme);
    localStorage.setItem('ssp_profile', JSON.stringify(userProfile));
    localStorage.setItem('ssp_subjects_v2', JSON.stringify(subjects));
    localStorage.setItem('ssp_hw', JSON.stringify(homework));
    localStorage.setItem('ssp_exams', JSON.stringify(exams));
    localStorage.setItem('ssp_sessions_v2', JSON.stringify(studySessions));
    localStorage.setItem('ssp_notes', JSON.stringify(notes));
    localStorage.setItem('ssp_flashcards', JSON.stringify(flashcards));
    localStorage.setItem('ssp_goals', JSON.stringify(goals));
    localStorage.setItem('ssp_achievements', JSON.stringify(achievements));
    localStorage.setItem('ssp_resources', JSON.stringify(resources));
    localStorage.setItem('ssp_syllabus_progress', JSON.stringify(syllabusProgress));
  }, [userRole, theme, userProfile, subjects, homework, exams, studySessions, notes, flashcards, goals, achievements, resources, syllabusProgress]);

  // Apply Theme Class to Document Root & Body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark', 'theme-dark');
      document.body.classList.add('dark', 'theme-dark');
    } else {
      document.documentElement.classList.remove('dark', 'theme-dark');
      document.body.classList.remove('dark', 'theme-dark');
    }
  }, [theme]);

  // Audio Synth Logic for Ambient Noise
  useEffect(() => {
    if (ambientSound === 'off') {
      if (soundNodeRef.current) {
        soundNodeRef.current.disconnect();
        soundNodeRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (soundNodeRef.current) {
        soundNodeRef.current.disconnect();
      }

      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (ambientSound === 'rain') {
          lastOut = (lastOut * 0.95) + (white * 0.05);
          output[i] = lastOut * 0.4;
        } else if (ambientSound === 'waves') {
          lastOut = (lastOut * 0.98) + (white * 0.02);
          const modulate = Math.sin((i / bufferSize) * Math.PI * 2);
          output[i] = lastOut * (0.3 + 0.3 * modulate);
        } else if (ambientSound === 'cafe') {
          lastOut = (lastOut * 0.9) + (white * 0.1);
          output[i] = lastOut * 0.25;
        } else {
          output[i] = white * 0.15;
        }
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.15;

      whiteNoise.connect(gainNode);
      gainNode.connect(ctx.destination);
      whiteNoise.start();

      soundNodeRef.current = whiteNoise;
    } catch (e) {
      console.warn('Audio synth not supported in browser environment', e);
    }
  }, [ambientSound]);

  // Gamification: Trigger XP Gain & Level Check
  const addXP = (amount, reason = '') => {
    setUserProfile(prev => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 500) + 1;
      
      if (newLevel > prev.level) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }

      return {
        ...prev,
        xp: newXP,
        level: newLevel
      };
    });
  };

  // Helper CRUD Handlers
  const addHomework = (item) => {
    const newItem = { ...item, id: `hw-${Date.now()}`, status: 'Pending' };
    setHomework(prev => [newItem, ...prev]);
    addXP(50, 'Added Homework Task');
  };

  const toggleHomeworkStatus = (id) => {
    setHomework(prev => prev.map(hw => {
      if (hw.id === id) {
        const nextStatus = hw.status === 'Completed' ? 'Pending' : 'Completed';
        if (nextStatus === 'Completed') {
          addXP(100, 'Completed Homework Task');
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        }
        return { ...hw, status: nextStatus };
      }
      return hw;
    }));
  };

  const deleteHomework = (id) => {
    setHomework(prev => prev.filter(hw => hw.id !== id));
  };

  const addSubject = (sub) => {
    const newSub = { ...sub, id: `sub-${Date.now()}`, completedHours: 0 };
    setSubjects(prev => [...prev, newSub]);
    addXP(40, 'Created Subject');
  };

  const deleteSubject = (id) => {
    setSubjects(prev => prev.filter(sub => sub.id !== id));
  };

  const addStudySession = (session) => {
    const newSession = { ...session, id: `ss-${Date.now()}`, status: 'Pending' };
    setStudySessions(prev => [newSession, ...prev]);
    addXP(30, 'Scheduled Study Session');
  };

  const deleteStudySession = (id) => {
    setStudySessions(prev => prev.filter(s => s.id !== id));
  };

  const addExam = (exam) => {
    const newExam = { ...exam, id: `exam-${Date.now()}` };
    setExams(prev => [...prev, newExam]);
    addXP(50, 'Added Exam Schedule');
  };

  const deleteExam = (id) => {
    setExams(prev => prev.filter(exam => exam.id !== id));
  };

  const updateExam = (id, updatedData) => {
    setExams(prev => prev.map(exam => exam.id === id ? { ...exam, ...updatedData } : exam));
  };

  const toggleSyllabusItem = (examId, syllabusId) => {
    setExams(prev => prev.map(exam => {
      if (exam.id === examId) {
        const updatedSyllabus = exam.syllabus.map(item => 
          item.id === syllabusId ? { ...item, completed: !item.completed } : item
        );
        return { ...exam, syllabus: updatedSyllabus };
      }
      return exam;
    }));
  };

  const addNote = (note) => {
    const newNote = {
      ...note,
      id: `note-${Date.now()}`,
      pinned: false,
      favorite: false,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setNotes(prev => [newNote, ...prev]);
    addXP(25, 'Created Note');
  };

  const toggleFavoriteNote = (id) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, favorite: !n.favorite } : n));
  };

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const addFlashcard = (card) => {
    const newCard = { ...card, id: `fc-${Date.now()}`, mastered: false };
    setFlashcards(prev => [newCard, ...prev]);
    addXP(20, 'Created Flashcard');
  };

  const toggleMasteredFlashcard = (id) => {
    setFlashcards(prev => prev.map(fc => fc.id === id ? { ...fc, mastered: !fc.mastered } : fc));
  };

  const addGoal = (goal) => {
    const newGoal = { ...goal, id: `g-${Date.now()}`, current: 0, completed: false };
    setGoals(prev => [newGoal, ...prev]);
  };

  const toggleGoalCompleted = (id) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const nextState = !g.completed;
        if (nextState) {
          addXP(75, 'Achieved Goal');
          confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        }
        return { ...g, completed: nextState, current: nextState ? g.target : 0 };
      }
      return g;
    }));
  };

  // 24-Hour Expiry Notification History State
  const [notificationHistory, setNotificationHistory] = useState(() => {
    try {
      const saved = safeJSONParse('ssp_notification_history', []);
      const now = Date.now();
      return saved.filter(n => now - n.timestamp < 24 * 60 * 60 * 1000);
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ssp_notification_history', JSON.stringify(notificationHistory));
  }, [notificationHistory]);

  // Prune notifications older than 24 hours (86,400,000 ms) automatically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setNotificationHistory(prev => prev.filter(n => now - n.timestamp < 24 * 60 * 60 * 1000));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const addNotificationToHistory = (title, message, iconType = 'alarm') => {
    const newItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      title,
      message,
      iconType,
      timestamp: Date.now(),
      read: false
    };
    setNotificationHistory(prev => [newItem, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setNotificationHistory(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleSyllabusMilestone = (chapterId, milestoneKey) => {
    setSyllabusProgress(prev => {
      const currentChapter = prev[chapterId] || { read: false, cq: false, mcq: false, board: false };
      const updatedChapter = {
        ...currentChapter,
        [milestoneKey]: !currentChapter[milestoneKey]
      };
      return {
        ...prev,
        [chapterId]: updatedChapter
      };
    });
  };

  const toggleAllChapterMilestones = (chapterId, shouldCheckAll) => {
    setSyllabusProgress(prev => ({
      ...prev,
      [chapterId]: {
        read: shouldCheckAll,
        cq: shouldCheckAll,
        mcq: shouldCheckAll,
        board: shouldCheckAll
      }
    }));
  };

  const resetSubjectProgress = (chapterIds) => {
    setSyllabusProgress(prev => {
      const next = { ...prev };
      chapterIds.forEach(id => {
        delete next[id];
      });
      return next;
    });
  };

  const logStudyTime = (subjectId, minutes) => {
    const hours = minutes / 60;
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, completedHours: parseFloat((s.completedHours + hours).toFixed(1)) } : s));
    addXP(Math.round(minutes * 1.5), 'Completed Study Focus');
  };

  return (
    <AppContext.Provider
      value={{
        userRole, setUserRole,
        theme, setTheme,
        userProfile, setUserProfile,
        subjects, setSubjects, addSubject, deleteSubject,
        homework, setHomework, addHomework, toggleHomeworkStatus, deleteHomework,
        exams, setExams, addExam, deleteExam, updateExam, toggleSyllabusItem,
        studySessions, setStudySessions, addStudySession, deleteStudySession,
        notes, setNotes, addNote, toggleFavoriteNote, deleteNote,
        flashcards, setFlashcards, addFlashcard, toggleMasteredFlashcard,
        goals, setGoals, addGoal, toggleGoalCompleted,
        achievements, setAchievements,
        resources, setResources,
        syllabusProgress, toggleSyllabusMilestone, toggleAllChapterMilestones, resetSubjectProgress,
        notificationHistory, addNotificationToHistory, markAllNotificationsRead,
        activeTab, setActiveTab,
        searchQuery, setSearchQuery,
        isQuickAddOpen, setIsQuickAddOpen,
        activeModal, setActiveModal,
        ambientSound, setAmbientSound,
        addXP, logStudyTime
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
