import React from 'react';
import { InformationCircleIcon } from './Icons';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: any) => string;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) {
    return null;
  }

  const features = [
    t('instructionsFeature1'),
    t('instructionsFeature2'),
    t('instructionsFeature3'),
    t('instructionsFeature4'),
    t('instructionsFeature5'),
    t('instructionsFeature6'),
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <InformationCircleIcon className="w-7 h-7 me-3 text-indigo-500" />
            {t('aboutSaati')}
          </h2>
        </div>
        <div className="p-6 overflow-y-auto">
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            {t('instructionsIntro')}
          </p>
          
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('instructionsFeaturesTitle')}</h3>
          <ul className="space-y-3 list-disc list-inside text-gray-700 dark:text-gray-300">
            {features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>

          <p className="mt-6 text-gray-700 dark:text-gray-300">
            {t('instructionsForWho')}
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

export default InstructionsModal;
