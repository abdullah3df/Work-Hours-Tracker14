import React from 'react';
import { DashboardIcon, ListBulletIcon, QuestionMarkCircleIcon, ChartBarIcon, InformationCircleIcon, BuildingOfficeIcon } from './Icons';
import { Language } from '../types';

interface SidebarProps {
  t: (key: any) => string;
  onHelpClick: () => void;
  onInstructionsClick: () => void;
  onAboutClick: () => void;
  isCollapsed: boolean;
  language: Language;
  onLinkClick: (href: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  t, 
  onHelpClick, 
  onInstructionsClick,
  onAboutClick,
  isCollapsed, 
  language, 
  onLinkClick,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'dashboard', icon: DashboardIcon, href: '#dashboard' },
    { id: 'logs-and-tasks', label: 'logsAndTasks', icon: ListBulletIcon, href: '#logs-and-tasks' },
    { id: 'analytics', label: 'analytics', icon: ChartBarIcon, href: '#analytics' },
  ];

  const handleLinkClick = (href: string) => {
    onLinkClick(href);
    setIsMobileMenuOpen(false);
  }

  const sidebarContent = (
    <div className="h-full px-3 py-4 flex flex-col justify-between overflow-x-hidden">
      <div>
        <div className={`flex items-center mb-5 h-16 transition-all duration-300 ${isCollapsed ? 'justify-center' : 'ps-2.5'}`}>
            <h1 className={`text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-cairo whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
              {t('saati')}
            </h1>
        </div>
        <ul className="space-y-2 font-medium">
          {menuItems.map(item => (
            <li key={item.id}>
              <a 
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item.href);
                }}
                className="flex items-center p-2 text-gray-800 rounded-lg dark:text-white hover:bg-black/10 dark:hover:bg-white/10 group overflow-hidden cursor-pointer">
                <item.icon className="w-6 h-6 flex-shrink-0 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className={`ms-3 whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                  {t(item.label)}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="flex flex-col">
          <div>
              <button onClick={() => { onInstructionsClick(); setIsMobileMenuOpen(false); }} className="w-full flex items-center p-2 text-gray-800 rounded-lg dark:text-white hover:bg-black/10 dark:hover:bg-white/10 group overflow-hidden">
                  <InformationCircleIcon className="w-6 h-6 flex-shrink-0 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                  <span className={`ms-3 whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{t('siteInstructions')}</span>
              </button>
          </div>
          <div>
              <button onClick={() => { onAboutClick(); setIsMobileMenuOpen(false); }} className="w-full flex items-center p-2 text-gray-800 rounded-lg dark:text-white hover:bg-black/10 dark:hover:bg-white/10 group overflow-hidden">
                  <BuildingOfficeIcon className="w-6 h-6 flex-shrink-0 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                  <span className={`ms-3 whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{t('aboutUs')}</span>
              </button>
          </div>
          <div>
              <button onClick={() => { onHelpClick(); setIsMobileMenuOpen(false); }} id="tour-trigger" className="w-full flex items-center p-2 text-gray-800 rounded-lg dark:text-white hover:bg-black/10 dark:hover:bg-white/10 group overflow-hidden">
                  <QuestionMarkCircleIcon className="w-6 h-6 flex-shrink-0 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                  <span className={`ms-3 whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{t('help')}</span>
              </button>
          </div>
      </div>
    </div>
  );

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-30 sm:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
      <aside 
        id="app-sidebar" 
        className={`fixed top-0 start-0 z-40 h-screen transition-all duration-300 ease-in-out bg-white dark:bg-slate-900 shadow-lg border-e border-gray-200 dark:border-slate-800 w-64
        ${isCollapsed ? 'sm:w-0' : 'sm:w-64'} 
        ${isMobileMenuOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')} 
        sm:translate-x-0`} 
        aria-label="Sidebar"
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;