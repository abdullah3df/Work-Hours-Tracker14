import React, { useMemo, useRef, useState, useEffect } from 'react';
import { LogEntry, ProfileSettings } from '../types';
import { calculateDuration, calculateOvertime, formatDate, formatDuration, formatTime } from '../lib/utils';
import { PdfFileIcon, ImageIcon } from './Icons';

// Make jspdf and html2canvas available from the global scope
declare const jspdf: any;
declare const html2canvas: any;

type ReportPeriod = 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'custom';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  profile: ProfileSettings;
  t: (key: string) => string;
  language: string;
  user: any | null; // Can be Firebase user object or null for guest
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, logs, profile, t, language, user }) => {
  const reportContentRef = useRef<HTMLDivElement>(null);
  const [period, setPeriod] = useState<ReportPeriod>('thisMonth');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const toISODateString = (date: Date): string => date.toISOString().split('T')[0];

  useEffect(() => {
    if (period === 'custom' && !customStartDate && !customEndDate) {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      setCustomStartDate(toISODateString(thirtyDaysAgo));
      setCustomEndDate(toISODateString(today));
    }
  }, [period, customStartDate, customEndDate]);

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    switch (period) {
      case 'today': {
        const todayStr = toISODateString(now);
        return { startDate: todayStr, endDate: todayStr };
      }
      case 'thisWeek': {
        const currentDay = now.getDay(); // 0 is Sunday
        const firstDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - currentDay);
        const lastDay = new Date(firstDay);
        lastDay.setDate(firstDay.getDate() + 6);
        return { startDate: toISODateString(firstDay), endDate: toISODateString(lastDay) };
      }
      case 'thisMonth': {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { startDate: toISODateString(firstDay), endDate: toISODateString(lastDay) };
      }
      case 'thisYear': {
        const firstDay = new Date(now.getFullYear(), 0, 1);
        const lastDay = new Date(now.getFullYear(), 11, 31);
        return { startDate: toISODateString(firstDay), endDate: toISODateString(lastDay) };
      }
      case 'custom': {
        return { startDate: customStartDate, endDate: customEndDate };
      }
      default:
        return { startDate: '', endDate: '' };
    }
  }, [period, customStartDate, customEndDate]);

  const filteredLogs = useMemo(() => {
    if (!startDate || !endDate) {
      return [];
    }
    return [...logs]
      .filter(log => log.date >= startDate && log.date <= endDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [logs, startDate, endDate]);

  const reportData = useMemo(() => {
    let totalWorkMs = 0;
    let totalOvertimeMs = 0;
    let sickDays = 0;
    let vacationDays = 0;

    filteredLogs.forEach(log => {
      if (log.type === 'work') {
        const duration = calculateDuration(log);
        if (duration > 0) {
          totalWorkMs += duration;
          totalOvertimeMs += calculateOvertime(duration, profile);
        }
      } else if (log.type === 'sickLeave') {
        sickDays++;
      } else if (log.type === 'vacation') {
        vacationDays++;
      }
    });

    const formattedStart = startDate ? formatDate(new Date(startDate), language) : '';
    const formattedEnd = endDate ? formatDate(new Date(endDate), language) : '';

    return {
      totalWorkHours: formatDuration(totalWorkMs),
      totalOvertime: formatDuration(totalOvertimeMs),
      totalSickDays: sickDays,
      totalVacationDays: vacationDays,
      displayDateRange: formattedStart && formattedEnd ? (formattedStart === formattedEnd ? formattedStart : `${formattedStart} - ${formattedEnd}`) : 'N/A',
      userName: user ? (user.displayName || user.email) : t('guest'),
    };
  }, [filteredLogs, profile, language, user, t, startDate, endDate]);

  const captureReport = (type: 'pdf' | 'image') => {
    const input = reportContentRef.current;
    if (!input) return;

    const scale = 2;
    html2canvas(input, {
      scale: scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      height: input.scrollHeight,
      windowHeight: input.scrollHeight
    }).then((canvas) => {
      const fileNameBase = `Saati_Report_${reportData.userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
      const imgData = canvas.toDataURL('image/png');
      
      if (type === 'image') {
        const link = document.createElement('a');
        link.download = `${fileNameBase}.png`;
        link.href = imgData;
        link.click();
      } else {
        const { jsPDF } = jspdf;
        
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const margin = 10;
        const pdfWidth = pdf.internal.pageSize.getWidth() - margin * 2;
        const pdfHeight = pdf.internal.pageSize.getHeight() - margin * 2;
        const ratio = canvas.width / canvas.height;
        const imgWidth = pdfWidth;
        const imgHeight = imgWidth / ratio;
        
        let position = 0;
        pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
        let heightLeft = imgHeight - pdfHeight;

        while (heightLeft > 0) {
          position = position - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', margin, position + margin, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
        
        pdf.save(`${fileNameBase}.pdf`);
      }
    });
  };
  
  const periodOptions: { key: ReportPeriod, label: string }[] = [
      { key: 'today', label: 'today' },
      { key: 'thisWeek', label: 'thisWeek' },
      { key: 'thisMonth', label: 'thisMonth' },
      { key: 'thisYear', label: 'thisYear' },
      { key: 'custom', label: 'customRange' },
  ];

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex justify-center items-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-glass-bg-light dark:bg-glass-bg-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('workReport')}</h2>
           <button onClick={onClose} className="text-gray-400 text-3xl leading-none hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
        </div>
        
        <div className="p-4 sm:px-6 border-b border-black/10 dark:border-white/10">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('reportPeriod')}</label>
            <div className="flex flex-wrap items-center gap-2">
                {periodOptions.map(p => (
                    <button 
                        key={p.key} 
                        onClick={() => setPeriod(p.key)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${period === p.key ? 'bg-indigo-600 text-white shadow' : 'bg-white/50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-900/80'}`}
                    >
                        {t(p.label)}
                    </button>
                ))}
            </div>
            {period === 'custom' && (
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label htmlFor="report-start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('startDate')}</label>
                        <input
                            type="date"
                            id="report-start-date"
                            value={customStartDate}
                            onChange={e => setCustomStartDate(e.target.value)}
                            className="w-full bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 border border-gray-300/50 dark:border-gray-600/50"
                        />
                    </div>
                     <div>
                        <label htmlFor="report-end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('endDate')}</label>
                        <input
                            type="date"
                            id="report-end-date"
                            value={customEndDate}
                            onChange={e => setCustomEndDate(e.target.value)}
                            className="w-full bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 border border-gray-300/50 dark:border-gray-600/50"
                        />
                    </div>
                </div>
            )}
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto bg-black/5 dark:bg-black/10">
          <div ref={reportContentRef} className="bg-white text-black p-6 sm:p-8 shadow-lg rounded-sm">
            <header className="flex flex-col sm:flex-row justify-between items-start mb-8 border-b pb-4">
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 font-cairo">{t('saati')}</h1>
                <p className="text-gray-500">{t('workHoursTracker')}</p>
              </div>
              <div className="text-start sm:text-end text-sm text-gray-600 mt-4 sm:mt-0">
                <p><span className="font-bold">{t('reportFor')}:</span> {reportData.userName}</p>
                <p><span className="font-bold">{t('dateRange')}:</span> {reportData.displayDateRange}</p>
              </div>
            </header>

            <section className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">{t('summary')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-700">{t('totalWorkHours')}</h4>
                        <p className="text-2xl font-bold text-blue-900">{reportData.totalWorkHours}</p>
                    </div>
                     <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-green-700">{t('totalOvertime')}</h4>
                        <p className="text-2xl font-bold text-green-900">{reportData.totalOvertime}</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-yellow-700">{t('totalSickDays')}</h4>
                        <p className="text-2xl font-bold text-yellow-900">{reportData.totalSickDays}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-purple-700">{t('totalVacationDays')}</h4>
                        <p className="text-2xl font-bold text-purple-900">{reportData.totalVacationDays}</p>
                    </div>
                </div>
            </section>
            
            <section className="report-table">
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('date')}</th>
                            <th scope="col" className="px-4 py-3 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('type')}</th>
                            <th scope="col" className="px-4 py-3 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('startTime')}</th>
                            <th scope="col" className="px-4 py-3 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('endTime')}</th>
                            <th scope="col" className="px-4 py-3 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('break')}</th>
                            <th scope="col" className="px-4 py-3 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('duration')}</th>
                            <th scope="col" className="px-4 py-3 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('overtime')}</th>
                            <th scope="col" className="px-4 py-3 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('notes')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {filteredLogs.length > 0 ? (
                            filteredLogs.map(log => {
                                 const durationMs = calculateDuration(log);
                                 const overtimeMs = calculateOvertime(durationMs, profile);
                                 return (
                                    <tr key={log.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                                        <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-900">{formatDate(new Date(log.date), language)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500">{t(log.type)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">{log.startTime ? formatTime(new Date(log.startTime), language) : '—'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">{log.endTime ? formatTime(new Date(log.endTime), language) : '—'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500">{log.type === 'work' ? log.breakMinutes : '—'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">{log.type === 'work' ? formatDuration(durationMs) : '—'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-xs font-mono" style={{color: overtimeMs > 0 ? '#10B981' : '#6B7280'}}>{log.type === 'work' ? formatDuration(overtimeMs) : '—'}</td>
                                        <td className="px-4 py-4 whitespace-normal text-xs text-gray-500">{log.notes || '—'}</td>
                                    </tr>
                                 )
                            })
                        ) : (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                    {t('noLogsToReport')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
              </div>
            </section>
            <footer className="text-center text-xs text-gray-400 mt-8 pt-4 border-t">
                <p>{t('dateGenerated')}: {formatDate(new Date(), language)}</p>
            </footer>
          </div>
        </div>

        <div className="px-6 py-4 bg-black/5 dark:bg-black/10 rounded-b-xl flex flex-wrap justify-end gap-3 border-t border-black/10 dark:border-white/10">
            <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 border border-gray-300/80 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white/80 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700/80 dark:text-white dark:border-gray-600/80 dark:hover:bg-gray-700"
            >
                {t('close')}
            </button>
            <button
                type="button"
                onClick={() => captureReport('image')}
                className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
                <ImageIcon className="w-5 h-5 me-2"/>
                {t('downloadImage')}
            </button>
            <button
                type="button"
                onClick={() => captureReport('pdf')}
                className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-lg shadow-indigo-500/30 text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
                <PdfFileIcon className="w-5 h-5 me-2"/>
                {t('downloadPDF')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;