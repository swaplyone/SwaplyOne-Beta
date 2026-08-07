import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

// Memory/File Fallback Store when Firebase Admin credentials are not initialized
class LocalFirestoreStore {
  constructor() {
    this.data = {
      users: [],
      settings: {
        id: 'global_settings',
        maxLimit: 150,
        currentCount: 0,
        enabled: true,
        updatedAt: new Date().toISOString()
      },
      otp_codes: {},
      email_logs: [],
      admin_logs: []
    };

    // Pre-seed mock users if empty for demonstration
    this.data.users = [
      {
        id: 'usr_1',
        betaId: 'SWAP-BETA-1001',
        name: 'Alex Rivera',
        email: 'alex.rivera@example.com',
        track: 'pioneer',
        skillsToTest: 'Web Dev & Coding Swaps',
        experience: 'Love building dynamic web apps and finding edge cases.',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: 'usr_2',
        betaId: 'SWAP-BETA-1002',
        name: 'Sarah Chen',
        email: 'sarah.chen@example.com',
        track: 'pioneer',
        skillsToTest: 'UI / Layout Edge Cases',
        experience: 'Full-stack developer focused on mobile UI testing.',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
      }
    ];
    this.data.settings.currentCount = this.data.users.length;
  }

  getCollection(name) {
    if (!this.data[name]) this.data[name] = [];
    return this.data[name];
  }
}

const localStore = new LocalFirestoreStore();

let db = null;
let auth = null;
let isFirebaseConnected = false;

// Attempt Firebase Admin SDK Connection
try {
  const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccount)
      });
    }
    db = getFirestore();
    auth = getAuth();
    isFirebaseConnected = true;
    console.log(`🔥 Firebase Admin SDK connected to project: ${serviceAccount.project_id}`);
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    }
    db = getFirestore();
    auth = getAuth();
    isFirebaseConnected = true;
    console.log(`🔥 Firebase Admin SDK connected to project: ${process.env.FIREBASE_PROJECT_ID}`);
  } else {
    console.log('ℹ️ Firebase credentials not set. Running with Local Store fallback.');
  }
} catch (error) {
  console.warn('⚠️ Firebase Admin initialization error (using fallback store):', error.message);
}

export { db, auth, isFirebaseConnected, localStore };
