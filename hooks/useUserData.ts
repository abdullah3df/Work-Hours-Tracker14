import React, { useState, useEffect } from 'react';
import { LogEntry, ProfileSettings, Task } from '../types';
import useLocalStorage from './useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

declare const firebase: any;

const defaultProfile: ProfileSettings = {
  workDaysPerWeek: 5,
  workHoursPerDay: 8,
  defaultBreakMinutes: 30,
};

export function useUserData(user: any | null) {
  // Local state for guests
  const [localLogs, setLocalLogs] = useLocalStorage<LogEntry[]>('saati-guest-logs', []);
  const [localProfile, setLocalProfile] = useLocalStorage<ProfileSettings>('saati-guest-profile', defaultProfile);
  const [localTasks, setLocalTasks] = useLocalStorage<Task[]>('saati-guest-tasks', []);

  // Firestore state for logged-in users
  const [firestoreLogs, setFirestoreLogs] = useState<LogEntry[]>([]);
  const [firestoreProfile, setFirestoreProfile] = useState<ProfileSettings>(defaultProfile);
  const [firestoreTasks, setFirestoreTasks] = useState<Task[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user) {
      setLoadingData(true);
      const db = firebase.firestore();
      const userDocRef = db.collection('users').doc(user.uid);

      // Subscribe to profile changes
      const unsubscribeProfile = userDocRef.onSnapshot((doc: any) => {
        if (doc.exists) {
          setFirestoreProfile({ ...defaultProfile, ...doc.data() });
        } else {
          userDocRef.set(defaultProfile);
          setFirestoreProfile(defaultProfile);
        }
      }, (error: any) => console.error("Error fetching profile:", error));

      // Subscribe to log changes
      const logsCollectionRef = userDocRef.collection('logs');
      const unsubscribeLogs = logsCollectionRef.onSnapshot((snapshot: any) => {
        const logsData = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as LogEntry[];
        setFirestoreLogs(logsData);
      }, (error: any) => console.error("Error fetching logs:", error));

      // Subscribe to task changes
      const tasksCollectionRef = userDocRef.collection('tasks');
      const unsubscribeTasks = tasksCollectionRef.onSnapshot((snapshot: any) => {
        const tasksData = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Task[];
        setFirestoreTasks(tasksData);
      }, (error: any) => console.error("Error fetching tasks:", error));
      
      // Combine loading state logic
      Promise.all([
          userDocRef.get(),
          logsCollectionRef.get(),
          tasksCollectionRef.get()
      ]).then(() => setLoadingData(false)).catch(() => setLoadingData(false));


      return () => {
        unsubscribeProfile();
        unsubscribeLogs();
        unsubscribeTasks();
      };
    } else {
      setLoadingData(false);
    }
  }, [user]);

  const logs = user ? firestoreLogs : localLogs;
  const profile = user ? firestoreProfile : localProfile;
  const tasks = user ? firestoreTasks : localTasks;

  const getCollection = (collectionName: 'logs' | 'tasks') => {
      return firebase.firestore().collection('users').doc(user.uid).collection(collectionName);
  }

  const addLog = async (newLog: Omit<LogEntry, 'id'>): Promise<void> => {
    if (user) {
      await getCollection('logs').add(newLog);
    } else {
      setLocalLogs(prev => [...prev, { id: uuidv4(), ...newLog }]);
    }
  };

  const saveLog = async (logData: Omit<LogEntry, 'id'> | LogEntry): Promise<void> => {
    if (user) {
      const logsCollection = getCollection('logs');
      if ('id' in logData && logData.id) {
        const { id, ...dataToUpdate } = logData;
        await logsCollection.doc(id).update(dataToUpdate);
      } else {
        await logsCollection.add(logData);
      }
    } else {
      if ('id' in logData && logData.id) {
        setLocalLogs(prev => prev.map(l => l.id === logData.id ? logData : l));
      } else {
        setLocalLogs(prev => [...prev, { id: uuidv4(), ...logData as Omit<LogEntry, 'id'> }]);
      }
    }
  };

  const deleteLog = async (id: string): Promise<void> => {
    if (user) {
      await getCollection('logs').doc(id).delete();
    } else {
      setLocalLogs(prev => prev.filter(l => l.id !== id));
    }
  };

  const saveProfile = async (newSettings: ProfileSettings): Promise<void> => {
    if (user) {
      await firebase.firestore().collection('users').doc(user.uid).set(newSettings, { merge: true });
    } else {
      setLocalProfile(newSettings);
    }
  };

  const saveTask = async (taskData: Omit<Task, 'id'> | Task): Promise<void> => {
    if (user) {
        const tasksCollection = getCollection('tasks');
        if ('id' in taskData && taskData.id) {
            const { id, ...dataToUpdate } = taskData;
            await tasksCollection.doc(id).update(dataToUpdate);
        } else {
            await tasksCollection.add(taskData);
        }
    } else {
        if ('id' in taskData && taskData.id) {
            setLocalTasks(prev => prev.map(t => t.id === taskData.id ? taskData : t));
        } else {
            setLocalTasks(prev => [...prev, { id: uuidv4(), ...taskData as Omit<Task, 'id'> }]);
        }
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    if (user) {
        await getCollection('tasks').doc(id).delete();
    } else {
        setLocalTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  return { logs, profile, tasks, loadingData, addLog, saveLog, deleteLog, saveProfile, saveTask, deleteTask };
}
