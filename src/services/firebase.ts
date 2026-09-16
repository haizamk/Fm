import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  getFirestore, 
  Firestore, 
  doc, 
  getDocFromServer,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific databaseId and resilient long-polling configuration for browser iframe
let dbInstance: Firestore;
const dbId = firebaseConfigData.firestoreDatabaseId || '(default)';

try {
  dbInstance = initializeFirestore(app, {
    ignoreUndefinedProperties: true,
    experimentalAutoDetectLongPolling: true,
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  }, dbId === '(default)' ? undefined : dbId);
} catch {
  try {
    dbInstance = dbId === '(default)' ? getFirestore(app) : getFirestore(app, dbId);
  } catch {
    dbInstance = getFirestore(app);
  }
}

export const db = dbInstance;
export const isFirestoreAvailable = true;

// Graceful connection health check according to Firebase skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'site_settings', 'main'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.info('Firestore client is currently operating in offline/cached mode.');
    } else {
      console.info('Firestore connection note:', error);
    }
    return false;
  }
}

