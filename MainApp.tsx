import React, { useState } from 'react';
import { Language, Theme, LogEntry, Task } from './types';
import Header from './components/Header';
import TimeTracker from './components/TimeTracker';
import LogManager from './components/LogManager';
import ProfileModal from './components/ProfileModal';
import LogFormModal from './components/LogFormModal';
import ReportModal from './components/ReportModal';
import { useUserData } from './hooks/useUserData';
import LoadingSpinner from './components/LoadingSpinner';
import Reminders from './components/Reminders';
import Sidebar from './components/Sidebar';
// FIX: Import TourStep type from TourGuide component.
import TourGuide, { TourStep } from './components/TourGuide';
import useLocalStorage from './hooks/useLocalStorage';
import WorkHoursChart from './components/WorkHoursChart';
import InstructionsModal from './components/InstructionsModal';
import AboutModal from './components/AboutModal';


interface MainAppProps {
  user: any | null; // Firebase User or null for guest
  onLogout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: any) => string;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const MainApp: React.FC<MainAppProps> = ({ user, onLogout, language, setLanguage, theme, setTheme, t, showToast }) => {
  const { logs, profile, tasks, loadingData, addLog, saveLog, deleteLog, saveProfile, saveTask, deleteTask } = useUserData(user);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogFormModalOpen, setIsLogFormModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [logToEdit, setLogToEdit] = useState<LogEntry | null>(null);

  const [tourCompleted, setTourCompleted] = useLocalStorage('saati-tour-completed-v1', false);
  const [runTour, setRunTour] = useState(!tourCompleted);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage('saati-sidebar-collapsed', false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // FIX: Explicitly type tourSteps with TourStep[] to resolve type inference error on the 'position' property.
  const tourSteps: TourStep[] = [
    { target: '#dashboard-widget', content: t('tourStep1') },
    { target: '#logs-widget', content: t('tourStep3') },
    { target: '#reminders-widget', content: t('tourStep4') },
    { target: '#analytics-widget', content: t('tourStep2') },
    { target: '#tour-trigger', content: t('tourStep5'), position: 'right' },
  ];

  const handleOpenLogForm = (log: LogEntry | null) => {
    setLogToEdit(log);
    setIsLogFormModalOpen(true);
  }
  
  const handleSetRunTour = (isRunning: boolean) => {
    if (isRunning) {
        setIsSidebarCollapsed(false); // Ensure sidebar is expanded for tour
        setIsMobileMenuOpen(false); // Ensure mobile menu is closed
    }
    if (!isRunning) { // Tour is being stopped/finished
        setTourCompleted(true);
    }
    setRunTour(isRunning);
  }

  const handleLinkClick = (href: string) => {
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      // Use block: 'start' to align the top of the element with the top of the scrollable container
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex">
      <Sidebar 
        t={t} 
        onHelpClick={() => handleSetRunTour(true)} 
        onInstructionsClick={() => setIsInstructionsModalOpen(true)}
        onAboutClick={() => setIsAboutModalOpen(true)}
        isCollapsed={isSidebarCollapsed}
        language={language}
        onLinkClick={handleLinkClick}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      
      <div className={`smooth-scroll flex-1 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'sm:ms-0' : 'sm:ms-64'} ${isMobileMenuOpen ? 'overflow-hidden' : ''}`}>
        <Header 
          user={user}
          onLogout={onLogout}
          onProfileClick={() => setIsProfileModalOpen(true)}
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          setTheme={setTheme}
          t={t}
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        
        <main className="pb-8">
          {loadingData ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div id="dashboard" className="mt-8">
                <div id="dashboard-widget"><TimeTracker addLog={addLog} profile={profile} t={t} showToast={showToast} language={language} /></div>
              </div>
              <div id="logs-and-tasks" className="mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2" id="logs-widget">
                    <LogManager 
                        logs={logs}
                        profile={profile}
                        onAdd={() => handleOpenLogForm(null)}
                        onEdit={(log) => handleOpenLogForm(log)}
                        onDelete={deleteLog}
                        onGenerateReport={() => setIsReportModalOpen(true)}
                        t={t}
                        language={language}
                        showToast={showToast}
                    />
                  </div>
                  <div className="lg:col-span-1" id="reminders-widget">
                    <Reminders
                      tasks={tasks}
                      saveTask={saveTask}
                      deleteTask={deleteTask}
                      t={t}
                      showToast={showToast}
                    />
                  </div>
                </div>
              </div>
               <div id="analytics" className="mt-8">
                <div id="analytics-widget">
                    <WorkHoursChart logs={logs} profile={profile} t={t} language={language} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <TourGuide run={runTour} setRun={handleSetRunTour} steps={tourSteps} t={t} />

      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        settings={profile}
        onSave={saveProfile}
        t={t}
        showToast={showToast}
      />

      <InstructionsModal
        isOpen={isInstructionsModalOpen}
        onClose={() => setIsInstructionsModalOpen(false)}
        t={t}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        t={t}
      />

      <LogFormModal
        isOpen={isLogFormModalOpen}
        onClose={() => {
          setIsLogFormModalOpen(false);
          setLogToEdit(null); // Clear logToEdit on close
        }}
        onSave={saveLog}
        logToEdit={logToEdit}
        t={t}
        showToast={showToast}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        logs={logs}
        profile={profile}
        t={t}
        language={language}
        user={user}
      />

    </div>
  );
};

export default MainApp;
