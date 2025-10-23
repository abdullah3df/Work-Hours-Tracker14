import React from 'react';
import { Cog6ToothIcon } from './Icons';

interface FirebaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: any) => string;
}

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <pre className="bg-slate-100 dark:bg-slate-900/70 p-4 rounded-lg text-xs overflow-x-auto">
    <code className="font-mono text-slate-800 dark:text-slate-200">
      {children}
    </code>
  </pre>
);

const FirebaseSetupModal: React.FC<FirebaseSetupModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) {
    return null;
  }
  
  const firebaseConfigSnippet = `
export const firebaseConfig = {
  apiKey: process.env.API_KEY, 
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
  `.trim();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[10002] p-4">
      <div className="bg-glass-bg-light dark:bg-glass-bg-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-black/10 dark:border-white/10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <Cog6ToothIcon className="w-7 h-7 me-3 text-indigo-500" />
            {t('firebaseSetupGuide')}
          </h2>
        </div>
        <div className="p-6 overflow-y-auto text-sm text-gray-700 dark:text-gray-300">
            <ol className="space-y-4 list-decimal list-inside">
                <li>{t('firebaseStep1')}</li>
                <li>{t('firebaseStep2')}</li>
                <li>{t('firebaseStep3')}</li>
                <li>{t('firebaseStep4')}</li>
                <li>{t('firebaseStep5')}</li>
            </ol>
            
            <h3 className="font-semibold text-gray-800 dark:text-white mt-6 mb-2">{t('firebaseExample')}</h3>
            <CodeBlock>{firebaseConfigSnippet}</CodeBlock>

        </div>
        <div className="px-6 py-4 bg-black/5 dark:bg-black/10 rounded-b-xl flex flex-col sm:flex-row justify-end gap-3 border-t border-black/10 dark:border-white/10">
          <a
            href="https://console.firebase.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex justify-center py-2 px-4 border border-gray-300/80 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white/80 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700/80 dark:text-white dark:border-gray-600/80 dark:hover:bg-gray-700"
          >
            {t('goToFirebase')}
          </a>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-lg shadow-indigo-500/30 text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
          >
            {t('gotIt')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirebaseSetupModal;
