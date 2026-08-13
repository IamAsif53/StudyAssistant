import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { HomeworkView } from './components/homework/HomeworkView';
import { PlannerView } from './components/planner/PlannerView';
import { ExamsView } from './components/exams/ExamsView';
import { NotesView } from './components/notes/NotesView';
import { AchievementsView } from './components/achievements/AchievementsView';
import { ResourcesView } from './components/resources/ResourcesView';
import { SyllabusView } from './components/syllabus/SyllabusView';
import { DictionaryView } from './components/dictionary/DictionaryView';
import { QuickAddModal } from './components/layout/QuickAddModal';

const AppContent = () => {
  const { activeTab } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'planner': return <PlannerView />;
      case 'syllabus': return <SyllabusView />;
      case 'dictionary': return <DictionaryView />;
      case 'homework': return <HomeworkView />;
      case 'exams': return <ExamsView />;
      case 'notes': return <NotesView />;
      case 'achievements': return <AchievementsView />;
      case 'resources': return <ResourcesView />;
      default: return <PlannerView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 w-full max-w-full overflow-x-hidden">
      <Navbar onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto overflow-x-hidden">
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
        
        <main className="flex-1 p-2.5 sm:p-6 lg:p-8 min-w-0 w-full max-w-full overflow-x-hidden pb-24 lg:pb-8">
          {renderActiveView()}
        </main>
      </div>

      <QuickAddModal />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
