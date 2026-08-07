import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

console.log('\n========================================');
console.log('🔥 TESTING FIREBASE ADMIN SDK CONNECTION');
console.log('========================================\n');

let db = null;

try {
  const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');

  if (fs.existsSync(serviceAccountPath)) {
    console.log('Found serviceAccountKey.json file in root folder!');
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccount)
      });
    }
    db = getFirestore();
    console.log(`Connected to Firebase Project: ${serviceAccount.project_id}`);
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    console.log('Using Firebase environment variables from .env!');
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        })
      });
    }
    db = getFirestore();
    console.log(`Connected to Firebase Project: ${process.env.FIREBASE_PROJECT_ID}`);
  } else {
    console.error('❌ No Firebase credentials found!');
    process.exit(1);
  }

  // Write a test document to Firestore
  console.log('Attempting test document write to Firestore collection "settings"...');
  await db.collection('settings').doc('global_settings').set({
    id: 'global_settings',
    maxLimit: 150,
    enabled: true,
    lastTestedAt: new Date().toISOString()
  }, { merge: true });

  console.log('✅ SUCCESS! Firebase Firestore read/write test passed cleanly!\n');
} catch (err) {
  console.error('\n❌ FIREBASE CONNECTION FAILED:');
  console.error(err.message);
  if (err.message.includes('NOT_FOUND') || err.message.includes('permission') || err.message.includes('PERMISSION_DENIED')) {
    console.log('\n💡 FIX: Ensure Cloud Firestore Database is enabled in Firebase Console:');
    console.log('   https://console.firebase.google.com/project/swaplyone-beta/firestore');
    console.log('   Click "Create Database" -> Start in Production mode.\n');
  }
}
