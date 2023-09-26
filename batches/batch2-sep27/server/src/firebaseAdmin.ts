import admin from 'firebase-admin';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Parse the JSON string from the environment variable
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Optional: include your storage bucket if needed
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } else {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT environment variable is not set.'
    );
  }
}

//

export default admin;
