import React, { useState, useEffect, useCallback } from 'react';
import { Language, Theme } from './types';
import { getTranslator } from './lib/i18n';
import useLocalStorage from './hooks/useLocalStorage';
import LoginPage from './components/LoginPage';
import MainApp from './MainApp';
import LoadingSpinner from './components/LoadingSpinner';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ExclamationTriangleIcon } from './components/Icons';

// Make firebase available from the global scope
declare const firebase: any;

// Add type declaration for the global variable set in index.html
declare global {
  interface Window {
    isFirebaseConfigured: boolean;
  }
}

const FirebaseConfigWarning: React.FC<{ t: (key: any) => string }> = ({ t }) => {
  return (
    <div className="bg-yellow-100 dark:bg-yellow-900/30 border-b-2 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 p-4 w-full z-[10001] sticky top-0">
      <div className="container mx-auto flex items-center">
        <ExclamationTriangleIcon className="w-6 h-6 me-3 flex-shrink-0" />
        <div className="text-sm">
          <span className="font-bold">{t('firebaseConfigWarningTitle')}:</span> {t('firebaseConfigWarningBody')}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [language, setLanguage] = useLocalStorage<Language>('saati-language', 'ar');
  const [theme, setTheme] = useLocalStorage<Theme>('saati-theme', 'light');
  const [user, setUser] = useState<any | null>(null);
  const [isGuest, setIsGuest] = useLocalStorage<boolean>('saati-is-guest', false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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
      {window.isFirebaseConfigured === false && <FirebaseConfigWarning t={t} />}
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