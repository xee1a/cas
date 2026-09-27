// Single realtime backend for the whole site: powers cross-device 4-player chess
// AND the visitor comments on each portfolio.
//
// Leave this null and both features run in "local preview" mode (visible only in
// the current browser). To turn them on for real, across every visitor and device:
//
//   1. Go to https://console.firebase.google.com and create a free project.
//   2. In the project, open "Realtime Database" and create one (start in test mode).
//   3. Project settings > "Your apps" > add a Web app, and copy its config object.
//   4. Paste the fields below, then rebuild and push.
//
// The apiKey here is safe to commit: Firebase web keys are public identifiers, not
// secrets. Access is governed by the database's security rules.
//
// Example:
// export const FIREBASE_CONFIG = {
//   apiKey: 'AIza...',
//   authDomain: 'your-app.firebaseapp.com',
//   databaseURL: 'https://your-app-default-rtdb.europe-west1.firebasedatabase.app',
//   projectId: 'your-app',
//   appId: '1:...:web:...',
// };
export const FIREBASE_CONFIG: Record<string, string> | null = null;
