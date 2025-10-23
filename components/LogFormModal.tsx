import React, { useState, useEffect } from 'react';
import { LogEntry, LogType } from '../types';

interface LogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: Omit<LogEntry, 'id'> | LogEntry) => Promise<void>;
  logToEdit: LogEntry | null;
  t: (key: any) => string;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const LogFormModal: React.FC<LogFormModalProps> = ({ isOpen, onClose, onSave, logToEdit, t, showToast }) => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [breakMinutes, setBreakMinutes] = useState(0);
  const [notes, setNotes] = useState('');
  const [type, setType] = useState<LogType>('work');

  useEffect(() => {
    if (logToEdit) {
        setType(logToEdit.type);
        const logDate = new Date(logToEdit.date);
        // Adjust for timezone offset when parsing date string
        logDate.setMinutes(logDate.getMinutes() + logDate.getTimezoneOffset());
        setDate(logDate.toISOString().split('T')[0]);
        
        setStartTime(logToEdit.startTime ? new Date(logToEdit.startTime).toTimeString().split(' ')[0].substring(0, 5) : '');
        setEndTime(logToEdit.endTime ? new Date(logToEdit.endTime).toTimeString().split(' ')[0].substring(0, 5) : '');
        
        setBreakMinutes(logToEdit.breakMinutes);
        setNotes(logToEdit.notes);

    } else {
        // Reset form for new entry
        const now = new Date();
        setDate(now.toISOString().split('T')[0]);
        setStartTime('');
        setEndTime('');
        setBreakMinutes(30);
        setNotes('');
        setType('work');
    }
  }, [logToEdit, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isWorkEntry = type === 'work';

    if (!date || (isWorkEntry && !startTime)) {
        alert('Date and Start Time are required for work entries.');
        return;
    }

    const startISO = isWorkEntry && startTime ? new Date(`${date}T${startTime}`).toISOString() : null;
    const endISO = isWorkEntry && endTime ? new Date(`${date}T${endTime}`).toISOString() : null;
    
    if (isWorkEntry && endISO && new Date(endISO) <= new Date(startISO!)) {
        alert('End Time must be after Start Time.');
        return;
    }

    const logData = {
        date,
        type,
        startTime: startISO,
        endTime: endISO,
        breakMinutes: isWorkEntry ? (Number(breakMinutes) || 0) : 0,
        notes,
    };

    try {
      if (logToEdit) {
          await onSave({ ...logData, id: logToEdit.id });
      } else {
          await onSave(logData);
      }
      showToast(t('saveSuccess'), 'success');
      onClose();
    } catch(error) {
       console.error("Failed to save log entry:", error);
       showToast(t('saveError'), 'error');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className="bg-glass-bg-light dark:bg-glass-bg-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl shadow-2xl w-full max-w-md">
        <form onSubmit={handleSave}>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                {logToEdit ? t('editEntry') : t('addManualEntry')}
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="logType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('entryType')}</label>
                  <select
                    id="logType"
                    value={type}
                    onChange={(e) => setType(e.target.value as LogType)}
                    className="mt-1 block w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:text-white"
                  >
                    <option value="work">{t('work')}</option>
                    <option value="sickLeave">{t('sickLeave')}</option>
                    <option value="vacation">{t('vacation')}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="logDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('date')}</label>
                  <input
                    type="date"
                    id="logDate"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="mt-1 block w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:text-white"
                  />
                </div>

                {type === 'work' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('startTime')}</label>
                          <input
                            type="time"
                            id="startTime"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                            className="mt-1 block w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('endTime')}</label>
                          <input
                            type="time"
                            id="endTime"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="mt-1 block w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:text-white"
                          />
                        </div>
                    </div>
                     <div>
                      <label htmlFor="breakMinutes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('break')}</label>
                      <input
                        type="number"
                        id="breakMinutes"
                        value={breakMinutes}
                        onChange={(e) => setBreakMinutes(parseInt(e.target.value, 10))}
                        className="mt-1 block w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:text-white"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label htmlFor="logNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('notes')}</label>
                  <textarea
                    id="logNotes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 block w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-black/5 dark:bg-black/10 rounded-b-xl flex justify-end space-x-3 rtl:space-x-reverse">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 border border-gray-300/80 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white/80 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700/80 dark:text-white dark:border-gray-600/80 dark:hover:bg-gray-700"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-lg shadow-indigo-500/30 text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
              >
                {logToEdit ? t('saveChanges') : t('save')}
              </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default LogFormModal;