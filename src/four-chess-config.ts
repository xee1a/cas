// Realtime backend for the 4-player chess easter egg.
//
// Leave this as null and the game runs in "same-device" mode: a real queue that
// works across browser tabs/windows on one machine (BroadcastChannel + localStorage).
//
// To enable true cross-device play, create a free Firebase project, enable the
// Realtime Database, and paste its web config object here. Then rebuild + push.
// The game detects a non-null config and upgrades automatically.
//
// Example:
// export const FIREBASE_CONFIG = {
//   apiKey: '...',
//   authDomain: 'your-app.firebaseapp.com',
//   databaseURL: 'https://your-app-default-rtdb.europe-west1.firebasedatabase.app',
//   projectId: 'your-app',
//   appId: '...',
// };
export const FIREBASE_CONFIG: Record<string, string> | null = null;
