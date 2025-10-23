import React, { useState, useMemo } from 'react';
import { LogEntry, ProfileSettings, LogType } from '../types';
import { calculateDuration, calculateOvertime, formatDate, formatDuration, formatTime } from '../lib/utils';
import { AddIcon, EditIcon, DeleteIcon, DocumentTextIcon } from './Icons';

interface LogManagerProps {
  logs: LogEntry[];
  profile: ProfileSettings;
  onAdd: () => void;
  onEdit: (log: LogEntry) => void;
  onDelete: (id: string) => Promise<void>;
  onGenerateReport: () => void;
  t: (key: string) => string;
  language: string;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const LogManager: React.FC<LogManagerProps> = ({
  logs,
  profile,
  onAdd,
  onEdit,
  onDelete,
  onGenerateReport,
  t,
  language,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<LogType>('work');
  const [logToDelete, setLogToDelete] = useState<LogEntry | null>(null);

  const filteredLogs = useMemo(() => {
    return [...logs]
      .filter(log => {
        const matchesType = log.type === filterType;
        const matchesSearch =
          searchQuery.trim() === '' ||
          log.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, searchQuery, filterType]);

  const handleDeleteClick = (log: LogEntry) => {
    setLogToDelete(log);
  };

  const handleConfirmDelete = async () => {
    if (logToDelete) {
      try {
        await onDelete(logToDelete.id);
        showToast(t('deleteSuccess'), 'success');
      } catch (error) {
        console.error("Failed to delete entry:", error);
        showToast(t('deleteError'), 'error');
      } finally {
        setLogToDelete(null);
      }
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterType('work');
  };

  const filterButtons: { value: LogType; label: string }[] = [
    { value: 'work', label: t('work') },
    { value: 'sickLeave', label: t('sickLeave') },
    { value: 'vacation', label: t('vacation') },
  ];

  return (
    <>
      <div className="bg-glass-bg-light dark:bg-glass-bg-dark border border-glass-border-light dark:border-glass-border-dark p-6 sm:p-8 rounded-2xl shadow-2xl shadow-shadow-color-light dark:shadow-shadow-color-dark w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('logHistory')}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onAdd}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <AddIcon className="w-5 h-5 me-2" />
              {t('addManualEntry')}
            </button>
            <button
              onClick={onGenerateReport}
              disabled={logs.length === 0}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300/80 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white/80 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700/80 dark:text-white dark:border-gray-600/80 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DocumentTextIcon className="w-5 h-5 me-2" />
              {t('generateReport')}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder={t('searchNotes')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 dark:placeholder-gray-400 dark:text-white"
          />
          <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 rounded-lg p-1 md:col-span-2">
            {filterButtons.map(btn => (
                <button
                    key={btn.value}
                    onClick={() => setFilterType(btn.value)}
                    className={`flex-1 text-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filterType === btn.value ? 'bg-indigo-600 text-white shadow' : 'text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                    {btn.label}
                </button>
            ))}
            <button
              onClick={handleResetFilters}
              className="text-sm text-gray-600 dark:text-gray-400 hover:underline px-2"
            >
              {t('resetFilters')}
            </button>
          </div>
        </div>

        {/* Log Table */}
        <div className="flex-grow overflow-auto border border-gray-200/50 dark:border-gray-700/50 rounded-lg">
          <div className="min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50">
              <thead className="bg-black/5 dark:bg-white/5 sticky top-0 backdrop-blur-sm">
                <tr>
                  <th scope="col" className="px-4 py-3 text-start text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('date')}</th>
                  <th scope="col" className="px-4 py-3 text-start text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('type')}</th>
                  <th scope="col" className="px-4 py-3 text-start text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">{t('startTime')}</th>
                  <th scope="col" className="px-4 py-3 text-start text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">{t('endTime')}</th>
                  <th scope="col" className="px-4 py-3 text-start text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('duration')}</th>
                  <th scope="col" className="px-4 py-3 text-start text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">{t('overtime')}</th>
                  <th scope="col" className="px-4 py-3 text-start text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map(log => {
                    const durationMs = calculateDuration(log);
                    const overtimeMs = calculateOvertime(durationMs, profile);
                    return (
                      <tr key={log.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{formatDate(new Date(log.date), language)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{t(log.type)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono hidden md:table-cell">{log.startTime ? formatTime(new Date(log.startTime), language) : '—'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono hidden md:table-cell">{log.endTime ? formatTime(new Date(log.endTime), language) : '—'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono">{log.type === 'work' ? formatDuration(durationMs) : '—'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-mono hidden lg:table-cell" style={{color: overtimeMs > 0 ? '#10B981' : 'inherit'}}>{log.type === 'work' ? formatDuration(overtimeMs) : '—'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <button onClick={() => onEdit(log)} className="p-1 rounded-md text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-200/50 dark:hover:bg-gray-600/50" title={t('edit')}>
                              <EditIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDeleteClick(log)} className="p-1 rounded-md text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-200/50 dark:hover:bg-gray-600/50" title={t('delete')}>
                              <DeleteIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      {logs.length === 0 ? t('noLogs') : t('noMatchingLogs')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {logToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-glass-bg-light dark:bg-glass-bg-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{t('deleteEntry')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{t('confirmDelete')}</p>
              <div className="flex justify-center space-x-4 rtl:space-x-reverse">
                <button
                  onClick={() => setLogToDelete(null)}
                  className="py-2 px-4 border border-gray-300/80 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white/80 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700/80 dark:text-white dark:border-gray-600/80 dark:hover:bg-gray-700"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LogManager;