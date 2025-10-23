export type Language = 'ar' | 'en' | 'de';

export type Theme = 'light' | 'dark';

export interface ProfileSettings {
  workDaysPerWeek: number;
  workHoursPerDay: number;
  defaultBreakMinutes: number;
}

export type LogType = 'work' | 'sickLeave' | 'vacation';

export interface LogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  type: LogType;
  startTime: string | null; // ISO string
  endTime: string | null; // ISO string
  breakMinutes: number;
  notes: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string; // ISO string
  reminderMinutes: number; // minutes before due date
  isCompleted: boolean;
}
