import React, { useState, useEffect, useCallback } from 'react';
import { Language, Theme } from './types';
import { getTranslator } from './lib/i18n';
import useLocalStorage from './hooks/useLocalStorage';
import LoginPage from './components/LoginPage';
import MainApp from './MainApp';
import LoadingSpinner from './components/LoadingSpinner';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ExclamationTriangleIcon, Cog6ToothIcon } from './components/Icons';
import FirebaseSetupModal from './components/FirebaseSetupModal';

// Make firebase available from the global scope
declare const firebase: any;

// Add type declaration for the global variable set in index.html
declare global {
  interface Window {
    isFirebaseConfigured: boolean;
  }
}

const FirebaseConfigWarning: React.FC<{ t: (key: any) => string; onConfigure: () => void }> = ({ t, onConfigure }) => {
  return (
    <div className="bg-yellow-100 dark:bg-yellow-900/30 border-b-2 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 p-4 w-full z-[10001] sticky top-0">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="w-6 h-6 me-3 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-bold">{t('firebaseConfigWarningTitle')}:</span> {t('firebaseConfigWarningBody')}
          </div>
        </div>
        <button 
            onClick={onConfigure}
            className="inline-flex items-center flex-shrink-0 px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
        >
            <Cog6ToothIcon className="w-4 h-4 me-2" />
            {t('configureNow')}
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [language, setLanguage] = useLocalStorage<Language>('saati-language', 'de');
  const [theme, setTheme] = useLocalStorage<Theme>('saati-theme', 'light');
  const [user, setUser] = useState<any | null>(null);
  const [isGuest, setIsGuest] = useLocalStorage<boolean>('saati-is-guest', false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isFirebaseSetupModalOpen, setIsFirebaseSetupModalOpen] = useState(false);

  const t = useCallback(getTranslator(language), [language]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };


  useEffect(() => {
    const root = window.document.documentElement;
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [language, theme]);
  
  // Auto-open the setup modal if Firebase is not configured.
  useEffect(() => {
    if (window.isFirebaseConfigured === false) {
      setIsFirebaseSetupModalOpen(true);
    }
  }, []);
  
  useEffect(() => {
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
      setFirebaseInitialized(true);
      const unsubscribe = firebase.auth().onAuthStateChanged((user: any) => {
        setUser(user);
        if (user) {
          setIsGuest(false); // If user logs in, they are no longer a guest
        }
        setLoadingAuth(false);
      });
      return () => unsubscribe(); // Cleanup subscription on unmount
    } else {
        // Handle case where firebase is not initialized
        setLoadingAuth(false);
    }
  }, [setIsGuest]);


  const handleLogout = () => {
      if (user) {
         firebase.auth().signOut();
      }
      setIsGuest(false);
  }

  if (loadingAuth) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner />
        </div>
    );
  }
  
  const showMainApp = user || isGuest;

  return (
    <>
      {window.isFirebaseConfigured === false && <FirebaseConfigWarning t={t} onConfigure={() => setIsFirebaseSetupModalOpen(true)} />}
      <FirebaseSetupModal isOpen={isFirebaseSetupModalOpen} onClose={() => setIsFirebaseSetupModalOpen(false)} t={t} />
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      {!showMainApp ? (
          <div className="smooth-scroll">
            <LoginPage 
                language={language} 
                setLanguage={setLanguage}
                theme={theme}
                setTheme={setTheme}
                t={t}
                firebaseInitialized={firebaseInitialized}
                onGuestLogin={() => setIsGuest(true)}
                onConfigureRequest={() => setIsFirebaseSetupModalOpen(true)}
            />
          </div>
      ) : (
        <MainApp 
            user={user} 
            onLogout={handleLogout}
            language={language}
            setLanguage={setLanguage}
            theme={theme}
            setTheme={setTheme}
            t={t}
            showToast={showToast}
        />
      )}
    </>
  );
};

export default App;