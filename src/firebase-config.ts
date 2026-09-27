// Single realtime backend for the whole site: powers cross-device 4-player chess
// AND the visitor comments on each portfolio.
//
// These values are safe to commit: Firebase web keys are public identifiers, not
// secrets. Access is governed by the Realtime Database security rules.
//
// databaseURL is required for the Realtime Database and only appears once the
// database is created (Build > Realtime Database). It follows the pattern
// https://<projectId>-default-rtdb.<region>.firebasedatabase.app
export const FIREBASE_CONFIG: Record<string, string> | null = {
  apiKey: 'AIzaSyBbnMIJ_gtXxRaOMCYFb77CjIJd25hLJ94',
  authDomain: 'komentarzecas.firebaseapp.com',
  databaseURL: 'https://komentarzecas-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'komentarzecas',
  storageBucket: 'komentarzecas.firebasestorage.app',
  messagingSenderId: '390052272625',
  appId: '1:390052272625:web:846b294049161131740c50',
};
