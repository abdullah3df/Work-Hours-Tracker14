import React, { useState, useRef, useEffect } from 'react';
import { Language, Theme } from '../types';
import { FlagARIcon, FlagDEIcon, FlagENIcon, MoonIcon, SunIcon, ProfileIcon, CheckIcon, Bars3Icon } from './Icons';

interface HeaderProps {
  user: any | null;
  onLogout: () => void;
  onProfileClick: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: any) => string;
  toggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onProfileClick,
  language,
  setLanguage,
  theme,
  setTheme,
  t,
  toggleSidebar,
  isSidebarCollapsed,
  setIsMobileMenuOpen,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  const userName = user ? user.displayName || user.email : t('guest');
  
  const languageOptions = [
    { code: 'en', name: 'English', flag: <FlagENIcon className="w-6 h-auto rounded-sm border border-gray-300/50 dark:border-gray-600/50" /> },
    { code: 'ar', name: 'العربية', flag: <FlagARIcon className="w-6 h-auto rounded-sm border border-gray-300/50 dark:border-gray-600/50" /> },
    { code: 'de', name: 'Deutsch', flag: <FlagDEIcon className="w-6 h-auto rounded-sm border border-gray-300/50 dark:border-gray-600/50" /> },
  ];
  const currentLanguage = languageOptions.find(opt => opt.code === language);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white dark:bg-slate-900 sticky top-0 z-20 border-b border-gray-200 dark:border-slate-800 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
             <button
                onClick={toggleSidebar}
                className="hidden sm:block p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                aria-label={isSidebarCollapsed ? t('expandSidebar') : t('collapseSidebar')}
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
             <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white sm:hidden"
                aria-label="Open menu"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
            <h1 className="sm:hidden text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-cairo">
                {t('saati')}
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <p className="hidden sm:block text-sm text-gray-600 dark:text-gray-300">
                {t('welcome')}, <span className="font-semibold text-gray-800 dark:text-white">{userName}</span>
            </p>
            
             <div className="relative" ref={languageMenuRef}>
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label={t('language')}
              >
                {currentLanguage?.flag}
                <span className="hidden sm:inline">{language.toUpperCase()}</span>
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

            <div className="relative" ref={profileMenuRef}>
                <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="p-1.5 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <ProfileIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
                </button>
                {isProfileMenuOpen && (
                    <div className="absolute end-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50">
                        <div className="px-4 py-2 border-b border-gray-900/10 dark:border-gray-50/10">
                            <p className="text-sm text-gray-700 dark:text-gray-300">{t('welcome')}</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userName}</p>
                        </div>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); onProfileClick(); setIsProfileMenuOpen(false); }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-black/5 dark:text-gray-200 dark:hover:bg-white/5"
                        >
                            {t('profileSettings')}
                        </a>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); onLogout(); setIsProfileMenuOpen(false); }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-black/5 dark:text-gray-200 dark:hover:bg-white/5"
                        >
                            {t('logout')}
                        </a>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;