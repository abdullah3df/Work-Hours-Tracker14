import React from 'react';
import { BuildingOfficeIcon } from './Icons';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: any) => string;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) {
    return null;
  }

  const values = [
    { title: t('aboutUsValue1Title'), desc: t('aboutUsValue1Desc') },
    { title: t('aboutUsValue2Title'), desc: t('aboutUsValue2Desc') },
    { title: t('aboutUsValue3Title'), desc: t('aboutUsValue3Desc') },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <BuildingOfficeIcon className="w-7 h-7 me-3 text-indigo-500" />
            {t('aboutUs')}
          </h2>
        </div>
        <div className="p-6 overflow-y-auto">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">{t('aboutUsTitle')}</h3>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            {t('aboutUsIntro')}
          </p>
          
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('aboutUsCoreValuesTitle')}</h3>
          <div className="space-y-4">
            {values.map((value, index) => (
              <div key={index}>
                <h4 className="font-semibold text-gray-800 dark:text-white">{value.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{value.desc}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-gray-700 dark:text-gray-300 italic">
            {t('aboutUsClosing')}
          </p>
        </div>
        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 rounded-b-xl flex justify-end border-t border-gray-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-lg shadow-indigo-500/30 text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
