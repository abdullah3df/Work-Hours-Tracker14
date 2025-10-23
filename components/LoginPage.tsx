import React, { useState, useRef, useEffect } from 'react';
import { Language, Theme } from '../types';
import { FlagARIcon, FlagDEIcon, FlagENIcon, MoonIcon, SunIcon, GoogleIcon, CheckIcon } from './Icons';

// Make firebase available from the global scope
declare const firebase: any;

interface LoginPageProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    t: (key: any) => string;
    firebaseInitialized: boolean;
    onGuestLogin: () => void;
    onConfigureRequest: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ language, setLanguage, theme, setTheme, t, firebaseInitialized, onGuestLogin, onConfigureRequest }) => {
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
    const languageMenuRef = useRef<HTMLDivElement>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const languageOptions = [
        { code: 'en', name: 'English', flag: <FlagENIcon className="w-6 h-auto rounded-sm border border-gray-300/50 dark:border-gray-600/50" /> },
        { code: 'ar', name: 'العربية', flag: <FlagARIcon className="w-6 h-auto rounded-sm border border-gray-300/50 dark:border-gray-600/50" /> },
        { code: 'de', name: 'Deutsch', flag: <FlagDEIcon className="w-6 h-auto rounded-sm border border-gray-300/50 dark:border-gray-600/50" /> },
    ];
    const currentLanguage = languageOptions.find(opt => opt.code === language);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
            setIsLanguageMenuOpen(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, []);

    const handleGoogleSignIn = () => {
        if (!firebaseInitialized) {
            setError('CONFIG_ERROR');
            return;
        }
        setError(null);
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).catch((error: any) => {
            console.error("Error during Google sign-in:", error);
            if (error.code === 'auth/operation-not-allowed') {
                setError(t('authOperationNotAllowed'));
            } else {
                setError(t('genericAuthError'));
            }
        });
    };

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firebaseInitialized) {
            setError('CONFIG_ERROR');
            return;
        }
        setError(null);
        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
        } catch (err: any) {
            console.error("Error signing in with email:", err);
            if (err.code === 'auth/operation-not-allowed') {
                setError(t('authOperationNotAllowed'));
            } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                 setError(t('loginErrorInvalidCredentials'));
            } else {
                 setError(t('genericAuthError'));
            }
        }
    };
    
    const handleEmailSignUp = async () => {
        if (!firebaseInitialized) {
            setError('CONFIG_ERROR');
            return;
        }
        setError(null);
        try {
            await firebase.auth().createUserWithEmailAndPassword(email, password);
        } catch (err: any) {
            console.error("Error signing up with email:", err);
            if (err.code === 'auth/operation-not-allowed') {
                setError(t('authOperationNotAllowed'));
            } else if (err.code === 'auth/weak-password') {
                setError(t('signUpErrorWeakPassword'));
            } else if (err.code === 'auth/email-already-in-use') {
                setError(t('signUpErrorEmailInUse'));
            } else {
                setError(t('genericAuthError'));
            }
        }
    };


    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <header className="absolute top-0 inset-x-0 p-4 z-10">
                <div className="container mx-auto flex justify-end items-center space-x-2 sm:space-x-4">
                    <div className="relative" ref={languageMenuRef}>
                        <button
                            onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                            className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label={t('language')}
                        >
                            {currentLanguage?.flag}
                            <span>{language.toUpperCase()}</span>
                        </button>
                        {isLanguageMenuOpen && (
                            <div className="absolute end-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50">
                            {languageOptions.map((lang) => (
                                <a
                                key={lang.code}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setLanguage(lang.code as Language);
                                    setIsLanguageMenuOpen(false);
                                }}
                                className="flex justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-black/5 dark:text-gray-200 dark:hover:bg-white/5"
                                >
                                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                    {lang.flag}
                                    <span>{lang.name}</span>
                                </div>
                                {language === lang.code && <CheckIcon className="w-5 h-5 text-indigo-500" />}
                                </a>
                            ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label={t('theme')}
                    >
                        {theme === 'light' ? <MoonIcon className="w-6 h-6 text-gray-700" /> : <SunIcon className="w-6 h-6 text-yellow-400" />}
                    </button>
                </div>
            </header>

            <main className="w-full max-w-sm bg-glass-bg-light dark:bg-glass-bg-dark border border-glass-border-light dark:border-glass-border-dark rounded-2xl shadow-2xl shadow-shadow-color-light dark:shadow-shadow-color-dark p-8 text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-cairo mb-2">
                    {t('saati')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">{t('workHoursTracker')}</p>
                
                <div className="space-y-4">
                    <button 
                        onClick={handleGoogleSignIn}
                        className="w-full inline-flex items-center justify-center text-gray-800 bg-white/80 hover:bg-white border border-gray-300/80 focus:ring-4 focus:outline-none focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800/80 dark:text-white dark:border-gray-600/80 dark:hover:bg-gray-800 dark:focus:ring-gray-700 disabled:opacity-50 transition-colors"
                    >
                        <GoogleIcon className="w-5 h-5 me-3"/>
                        Sign in with Google
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                        <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">{t('or')}</span>
                        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    
                    <form onSubmit={handleEmailSignIn} className="space-y-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('email')}
                            required
                            className="w-full bg-white/50 border border-gray-300/50 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 dark:bg-gray-900/50 dark:border-gray-600/50 dark:placeholder-gray-400 dark:text-white"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('password')}
                            required
                            className="w-full bg-white/50 border border-gray-300/50 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 dark:bg-gray-900/50 dark:border-gray-600/50 dark:placeholder-gray-400 dark:text-white"
                        />
                         {error && (
                            <div className="text-xs text-red-500 dark:text-red-400 text-center bg-red-500/10 dark:bg-red-500/10 border border-red-500/20 rounded-md p-2">
                                <p>{error === 'CONFIG_ERROR' ? t('firebaseConfigError') : error}</p>
                                {error === 'CONFIG_ERROR' && (
                                    <button 
                                        type="button"
                                        onClick={onConfigureRequest}
                                        className="mt-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        {t('configureNow')}
                                    </button>
                                )}
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                type="submit"
                                disabled={!email || !password}
                                className="w-full justify-center text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 dark:shadow-indigo-800/30 focus:ring-4 focus:outline-none focus:ring-indigo-300 dark:focus:ring-indigo-800 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50 transition-all"
                            >
                                {t('loginWithEmail')}
                            </button>
                             <button
                                type="button"
                                onClick={handleEmailSignUp}
                                disabled={!email || !password}
                                className="w-full justify-center text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-4 focus:outline-none focus:ring-indigo-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-700 dark:text-indigo-300 dark:hover:bg-gray-600 dark:focus:ring-gray-700 disabled:opacity-50 transition-colors"
                            >
                                {t('signUp')}
                            </button>
                        </div>
                    </form>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                    </div>

                    <button
                        onClick={onGuestLogin}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                    >
                        {t('continueAsGuest')}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;