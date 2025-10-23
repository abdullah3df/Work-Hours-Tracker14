import React, { useMemo, useState, useRef } from 'react';
import { LogEntry, ProfileSettings } from '../types';
import { calculateDuration } from '../lib/utils';

interface ChartData {
  date: string;
  hours: number;
  formattedDate: string;
}

interface WorkHoursChartProps {
  logs: LogEntry[];
  profile: ProfileSettings;
  t: (key: string) => string;
  language: string;
}

const WorkHoursChart: React.FC<WorkHoursChartProps> = ({ logs, profile, t, language }) => {
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const chartData: ChartData[] = useMemo(() => {
    const dailyHours: { [date: string]: number } = {};

    logs.forEach(log => {
      if (log.type === 'work' && log.startTime && log.endTime) {
        const durationMs = calculateDuration(log);
        if (durationMs > 0) {
          dailyHours[log.date] = (dailyHours[log.date] || 0) + durationMs;
        }
      }
    });

    return Object.entries(dailyHours)
      .map(([date, totalMs]) => {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset()); // Adjust for timezone
        return {
          date,
          hours: totalMs / (1000 * 60 * 60),
          formattedDate: d.toLocaleDateString(language, { weekday: 'short', day: 'numeric' }),
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Get the last 7 logged work days
  }, [logs, language]);
  
  const targetHours = profile.workHoursPerDay;
  const maxHours = Math.ceil(Math.max(targetHours, ...chartData.map(d => d.hours), 0) * 1.1);

  // SVG dimensions and layout constants
  const SVG_WIDTH = 800;
  const SVG_HEIGHT = 300;
  const PADDING = { top: 20, right: 20, bottom: 50, left: 40 };
  const CHART_WIDTH = SVG_WIDTH - PADDING.left - PADDING.right;
  const CHART_HEIGHT = SVG_HEIGHT - PADDING.top - PADDING.bottom;
  const BAR_SPACING = 10;
  const barWidth = (CHART_WIDTH / chartData.length) - BAR_SPACING;

  const yScale = (hours: number) => CHART_HEIGHT - (hours / maxHours) * CHART_HEIGHT;

  if (chartData.length < 2) {
    return (
      <div className="bg-glass-bg-light dark:bg-glass-bg-dark border border-glass-border-light dark:border-glass-border-dark p-6 sm:p-8 rounded-2xl shadow-2xl shadow-shadow-color-light dark:shadow-shadow-color-dark w-full h-full flex flex-col items-center justify-center min-h-[380px]">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('recentWorkHours')}</h2>
        <p className="text-gray-500 dark:text-gray-400">{t('noDataForChart')}</p>
      </div>
    );
  }

  const activeBarData = activeBarIndex !== null ? chartData[activeBarIndex] : null;

  return (
    <div ref={chartRef} className="relative bg-glass-bg-light dark:bg-glass-bg-dark border border-glass-border-light dark:border-glass-border-dark p-6 sm:p-8 rounded-2xl shadow-2xl shadow-shadow-color-light dark:shadow-shadow-color-dark w-full">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('recentWorkHours')}</h2>
      
        <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="min-w-[500px]" aria-labelledby="chart-title" role="img">
                <title id="chart-title">{t('recentWorkHours')}</title>
                <g transform={`translate(${PADDING.left}, ${PADDING.top})`}>
                    {/* Y-Axis Labels and Grid Lines */}
                    {[...Array(5)].map((_, i) => {
                        const y = (CHART_HEIGHT / 4) * i;
                        const hourValue = maxHours - (maxHours / 4) * i;
                        return (
                            <g key={i}>
                                <text x={-10} y={y + 5} textAnchor="end" className="text-xs fill-current text-gray-500 dark:text-gray-400">{hourValue.toFixed(0)}</text>
                                <line x1="0" y1={y} x2={CHART_WIDTH} y2={y} className="stroke-current text-gray-200/80 dark:text-gray-700/80" strokeWidth="1"/>
                            </g>
                        );
                    })}
                     <text x={-25} y={-10} textAnchor="middle" className="text-xs fill-current text-gray-500 dark:text-gray-400">{t('hours')}</text>

                    {/* Target Line */}
                    <g>
                        <line 
                            x1="0" y1={yScale(targetHours)} 
                            x2={CHART_WIDTH} y2={yScale(targetHours)} 
                            className="stroke-current text-green-500"
                            strokeWidth="2" strokeDasharray="4 4" 
                        />
                        <text x={CHART_WIDTH + 5} y={yScale(targetHours)} alignmentBaseline="middle" className="text-xs fill-current text-green-500">{t('target')}</text>
                    </g>
                    
                    {/* Bars and X-Axis Labels */}
                    {chartData.map((d, i) => {
                        const x = i * (barWidth + BAR_SPACING);
                        const y = yScale(d.hours);
                        const height = CHART_HEIGHT - y;
                        return (
                        <g key={d.date} transform={`translate(${x}, 0)`}>
                            <rect
                                x={BAR_SPACING / 2}
                                y={y}
                                width={barWidth}
                                height={height}
                                className={`fill-indigo-500 transition-opacity ${activeBarIndex !== null && activeBarIndex !== i ? 'opacity-50' : 'opacity-100'}`}
                                onMouseEnter={() => setActiveBarIndex(i)}
                                onMouseLeave={() => setActiveBarIndex(null)}
                                rx="4"
                                ry="4"
                            />
                            <text 
                                x={barWidth / 2 + BAR_SPACING / 2} 
                                y={CHART_HEIGHT + 20} 
                                textAnchor="middle" 
                                className="text-xs fill-current text-gray-600 dark:text-gray-300">
                                {d.formattedDate}
                            </text>
                        </g>
                        );
                    })}
                </g>
            </svg>
        </div>

      {activeBarData && chartRef.current && (
        <div 
          className="absolute p-2 text-xs text-center bg-gray-800/80 dark:bg-gray-900/80 backdrop-blur-sm text-white rounded-md shadow-lg pointer-events-none transition-opacity duration-200"
          style={{
            left: `${PADDING.left + (activeBarIndex ?? 0) * (barWidth + BAR_SPACING) + (barWidth + BAR_SPACING) / 2 - 30}px`,
            top: `${PADDING.top + yScale(activeBarData.hours) - 40}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <div>{new Date(activeBarData.date).toLocaleDateString(language, { month: 'short', day: 'numeric' })}</div>
          <div className="font-bold">{activeBarData.hours.toFixed(2)} {t('hours')}</div>
        </div>
      )}
    </div>
  );
};

export default WorkHoursChart;