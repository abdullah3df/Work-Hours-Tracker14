// WARNING: DO NOT COMMIT THIS FILE TO GITHUB!
// This file is used to configure Firebase.
// The `apiKey` is read from a secure environment variable (`process.env.API_KEY`).
// You need to fill in the other details from your Firebase project console.

export const firebaseConfig = {
  apiKey: process.env.API_KEY, // لا تغيّره، Google AI Studio يقرأه تلقائياً
  authDomain: "work-hours-tracker-a65e9.firebaseapp.com",
  projectId: "work-hours-tracker-a65e9",
  storageBucket: "work-hours-tracker-a65e9.firebasestorage.app",
  messagingSenderId: "35979107877",
  appId: "1:35979107877:web:69b132144a68de4ab129cc",
  measurementId: "G-BWETRRY9QJ" // اختياري، لا بأس بتركه
};
