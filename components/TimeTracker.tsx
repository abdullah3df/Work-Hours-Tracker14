import React, { useState, useEffect, useRef } from 'react';
import { LogEntry, ProfileSettings } from '../types';
import { formatDuration, formatTime } from '../lib/utils';
import { LoginIcon, LogoutIcon, CoffeeIcon, PencilIcon, PlusIcon, MinusIcon } from './Icons';
import useLocalStorage from '../hooks/useLocalStorage';

interface TimeTrackerProps {
  addLog: (log: Omit<LogEntry, 'id'>) => Promise<void>;
  profile: ProfileSettings;
  t: (key: string) => string;
  showToast: (message: string, type?: 'success' | 'error') => void;
  language: string;
}

const TimeTracker: React.FC<TimeTrackerProps> = ({ addLog, profile, t, showToast, language }) => {
  const [startTimeISO, setStartTimeISO] = useLocalStorage<string | null>('saati-shift-startTime', null);
  const [notes, setNotes] = useLocalStorage<string>('saati-shift-notes', '');
  const [breakMinutes, setBreakMinutes] = useLocalStorage<number>('saati-shift-breakMinutes', profile.defaultBreakMinutes);
  
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const intervalRef = useRef<number | null>(null);

  const isRunning = !!startTimeISO;
  const startTime = startTimeISO ? new Date(startTimeISO) : null;

  // Sync default break minutes from profile when no shift is running
  useEffect(() => {
    if (!isRunning) {
      setBreakMinutes(profile.defaultBreakMinutes);
    }
  }, [profile.defaultBreakMinutes, isRunning, setBreakMinutes]);

  // Timer for elapsed time
  useEffect(() => {
    if (isRunning && startTimeISO) {
      const start = new Date(startTimeISO);
      // Set initial value immediately
      setElapsedTime(new Date().getTime() - start.getTime());
      
      intervalRef.current = window.setInterval(() => {
        // Recalculate based on the original start time to avoid drift
        setElapsedTime(new Date().getTime() - start.getTime());
      }, 1000);
    } else {
      setElapsedTime(0); // Reset when not running
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, startTimeISO]);

  // Timer for current real-time clock
  useEffect(() => {
    const clockInterval = window.setInterval(() => {
        setCurrentTime(new Date());
    }, 1000);
    return () => window.clearInterval(clockInterval);
  }, []);


  const handleStart = () => {
    setStartTimeISO(new Date().toISOString());
  };

  const handleStop = async () => {
    if (!startTime) return;
    
    const endTime = new Date();
    
    try {
      await addLog({
        date: startTime.toISOString().split('T')[0],
        type: 'work',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        breakMinutes: Number(breakMinutes) || 0,
        notes,
      });
      showToast(t('shiftSaved'), 'success');
       // Reset all persisted shift data on success
      setStartTimeISO(null);
      setNotes('');
      setBreakMinutes(profile.defaultBreakMinutes);
    } catch(error) {
      console.error("Failed to save shift:", error);
      showToast(t('saveError'), 'error');
    }
  };

  return (
    <div className="bg-glass-bg-light dark:bg-glass-bg-dark border border-glass-border-light dark:border-glass-border-dark p-6 sm:p-8 rounded-2xl shadow-2xl shadow-shadow-color-light dark:shadow-shadow-color-dark w-full max-w-4xl mx-auto transition-all duration-300">
      
      <div className="flex flex-col sm:flex-row justify-around items-center mb-8 text-center space-y-6 sm:space-y-0">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('currentTime')}</p>
          <p className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent font-mono" suppressHydrationWarning>{formatTime(currentTime)}</p>
        </div>
        <div className="w-px h-16 bg-gray-300/50 dark:bg-gray-600/50 hidden sm:block"></div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('shiftDuration')}</p>
          <p className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent font-mono">{formatDuration(elapsedTime)}</p>
        </div>
      </div>

      <div className="my-8">
        <div className="flex flex-col sm:flex-row justify-center items-stretch gap-4 sm:gap-8">
            <button
              onClick={handleStart}
              disabled={isRunning}
              className="group relative w-full sm:w-auto flex-1 inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/30 dark:shadow-emerald-800/30 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
              aria-label={t('clockIn')}
            >
              <LoginIcon className="w-8 h-8 me-3 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              <span>{t('clockIn')}</span>
            </button>
            <button
              onClick={handleStop}
              disabled={!isRunning}
              className="group relative w-full sm:w-auto flex-1 inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-xl shadow-lg shadow-red-500/30 dark:shadow-rose-800/30 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
              aria-label={t('clockOut')}
            >
              <LogoutIcon className="w-8 h-8 me-3 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              <span>{t('clockOut')}</span>
            </button>
        </div>
        <div className="text-center mt-6">
            <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white" suppressHydrationWarning>
                {currentTime.toLocaleDateString(language, { weekday: 'long' })}
            </p>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400" suppressHydrationWarning>
                {currentTime.toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Break Input */}
        <div>
          <label htmlFor="break" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('break')}</label>
          <div className="relative flex items-center bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all duration-200">
            <div className="ps-3 pointer-events-none absolute inset-y-0 start-0 flex items-center">
              <CoffeeIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="number"
              id="break"
              min="0"
              value={breakMinutes}
              onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 0;
                  setBreakMinutes(Math.max(0, val));
              }}
              className="block w-full border-0 bg-transparent py-2.5 ps-10 pe-20 text-gray-900 dark:text-white placeholder:text-gray-400 sm:text-sm focus:ring-0"
              placeholder={t('break')}
            />
            <div className="absolute inset-y-0 end-0 flex items-center pe-3">
              <button type="button" onClick={() => setBreakMinutes(p => Math.max(0, p - 5))} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full focus:outline-none focus:bg-black/10 dark:focus:bg-white/10">
                <MinusIcon className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setBreakMinutes(p => p + 5)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full focus:outline-none focus:bg-black/10 dark:focus:bg-white/10 ms-1">
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Notes Input */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('notes')}</label>
          <div className="relative flex items-center bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all duration-200">
            <div className="ps-3 pointer-events-none absolute inset-y-0 start-0 flex items-center">
              <PencilIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="block w-full border-0 bg-transparent py-2.5 ps-10 pe-3 text-gray-900 dark:text-white placeholder:text-gray-400 sm:text-sm focus:ring-0"
              placeholder={t('notes')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;