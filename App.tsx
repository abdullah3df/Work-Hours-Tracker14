import React, { useState, useEffect, useCallback } from 'react';
import { Language, Theme } from './types';
import { getTranslator } from './lib/i18n';
import useLocalStorage from './hooks/useLocalStorage';
import LoginPage from './components/LoginPage';
import MainApp from './MainApp';
import LoadingSpinner from './components/LoadingSpinner';
import { ToastContainer, ToastMessage } from './components/Toast';
import FirebaseSetupModal from './components/FirebaseSetupModal';

// Make firebase available from the global scope
declare const firebase: any;

// Add type declaration for the global variable set in index.html
declare global {
  interface Window {
    isFirebaseConfigured: boolean;
  }
}

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
