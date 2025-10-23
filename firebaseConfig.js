// WARNING: DO NOT COMMIT THIS FILE TO GITHUB!
// This file is used to configure Firebase.
// The `apiKey` is read from a secure environment variable (`process.env.API_KEY`).
// You need to fill in the other details from your Firebase project console.
//
// To get your Firebase config:
// 1. Go to your Firebase project console.
// 2. Click the gear icon > Project settings.
// 3. In the "Your apps" card, select the app for which you need the config.
// 4. Under "Firebase SDK snippet", select "Config", copy the properties,
//    but keep the apiKey line as is.

export const firebaseConfig = {
  apiKey: process.env.API_KEY, // API Key is read from environment variables
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
