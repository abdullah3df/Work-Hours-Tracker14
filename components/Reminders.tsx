import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';
import { AddIcon, BellIcon, DeleteIcon } from './Icons';

interface RemindersProps {
  tasks: Task[];
  saveTask: (task: Omit<Task, 'id'> | Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  t: (key: string) => string;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const Reminders: React.FC<RemindersProps> = ({ tasks, saveTask, deleteTask, t, showToast }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const timeoutRefs = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);
  
  useEffect(() => {
    const timeouts = timeoutRefs.current;
    
    // Clear all existing timeouts to reschedule them based on the current tasks list
    timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    timeouts.clear();

    tasks.forEach(task => {
      if (!task.isCompleted) {
        const dueDateTime = new Date(task.dueDate).getTime();
        const reminderTime = dueDateTime - (task.reminderMinutes * 60 * 1000);
        const now = Date.now();
        
        if (reminderTime > now) {
          const timeoutId = window.setTimeout(() => {
            new Notification(t('taskReminder'), {
              body: task.title,
              icon: '/favicon.ico' 
            });
          }, reminderTime - now);
          timeouts.set(task.id, timeoutId);
        }
      }
    });

    return () => {
      timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    };

  }, [tasks, t]);

  const handleRequestNotificationPermission = () => {
    Notification.requestPermission().then(permission => {
      setNotificationPermission(permission);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate || !dueTime) return;

    const combinedDueDate = new Date(`${dueDate}T${dueTime}`);
    
    try {
        await saveTask({
            title,
            dueDate: combinedDueDate.toISOString(),
            reminderMinutes: Number(reminderMinutes),
            isCompleted: false,
        });
        showToast(t('taskAdded'), 'success');
        setTitle('');
        setDueDate('');
        setDueTime('');
        setReminderMinutes(15);
    } catch (error) {
        console.error("Failed to add task:", error);
        showToast(t('saveError'), 'error');
    }
  };
  
  const handleToggleComplete = async (task: Task) => {
    try {
        await saveTask({ ...task, isCompleted: !task.isCompleted });
        showToast(t('taskUpdated'), 'success');
    } catch(error) {
        console.error("Failed to update task:", error);
        showToast(t('saveError'), 'error');
    }
  }

  const handleDelete = (id: string) => {
    if(window.confirm(t('confirmDeleteTask'))) {
        try {
            deleteTask(id);
            showToast(t('taskDeleted'), 'success');
        } catch (error) {
            console.error("Failed to delete task:", error);
            showToast(t('deleteError'), 'error');
        }
    }
  }

  const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="bg-glass-bg-light dark:bg-glass-bg-dark border border-glass-border-light dark:border-glass-border-dark p-6 sm:p-8 rounded-2xl shadow-2xl shadow-shadow-color-light dark:shadow-shadow-color-dark w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('reminders')}</h2>
        <BellIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
      </div>

      {notificationPermission === 'denied' && (
        <div className="p-3 mb-4 text-xs text-yellow-800 bg-yellow-100 rounded-lg dark:bg-yellow-900/30 dark:text-yellow-300" role="alert">
          {t('notificationsDenied')}
        </div>
      )}

       {notificationPermission === 'default' && (
        <div className="p-3 mb-4 text-xs text-blue-800 bg-blue-100 rounded-lg dark:bg-blue-900/30 dark:text-blue-300 text-center" role="alert">
          <button onClick={handleRequestNotificationPermission} className="font-bold underline">
            {t('enableNotifications')}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <input
            type="text"
            placeholder={t('taskTitle')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 dark:placeholder-gray-400 dark:text-white"
        />
        <div className="grid grid-cols-2 gap-2">
            <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 dark:text-white"
            />
            <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                required
                className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 dark:text-white"
            />
        </div>
         <div>
            <label htmlFor="reminderMinutes" className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">{t('reminder')}</label>
            <input
                id="reminderMinutes"
                type="number"
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(parseInt(e.target.value))}
                required
                className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 dark:text-white"
            />
        </div>
        <button
            type="submit"
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-lg shadow-indigo-500/30 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
        >
            <AddIcon className="w-5 h-5 me-2" />
            {t('addTask')}
        </button>
      </form>
      
      <div className="flex-grow overflow-y-auto -mx-2 px-2">
        <ul className="space-y-2">
            {sortedTasks.length > 0 ? sortedTasks.map(task => (
                <li key={task.id} className="flex items-center justify-between p-2 rounded-md bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={task.isCompleted}
                            onChange={() => handleToggleComplete(task)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500"
                        />
                        <div className="ms-3 text-sm">
                            <label htmlFor={`task-${task.id}`} className={`font-medium text-gray-900 dark:text-gray-200 ${task.isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                                {task.title}
                            </label>
                            <p className={`text-xs text-gray-500 dark:text-gray-400 ${task.isCompleted ? 'line-through' : ''}`}>
                                {new Date(task.dueDate).toLocaleString(undefined, {dateStyle: 'short', timeStyle: 'short'})}
                            </p>
                        </div>
                    </div>
                     <button onClick={() => handleDelete(task.id)} className="p-1 rounded-md text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-200/50 dark:hover:bg-gray-600/50" title={t('delete')}>
                        <DeleteIcon className="w-4 h-4"/>
                    </button>
                </li>
            )) : (
                 <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">{t('noTasks')}</p>
            )}
        </ul>
      </div>
    </div>
  );
};

export default Reminders;