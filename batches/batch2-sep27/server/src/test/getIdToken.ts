
import { config } from 'dotenv';

config();

const firebaseApiKey = process.env.FIREBASE_API_KEY;
const email = process.env.TEST_USER_EMAIL;
const password = process.env.TEST_USER_PASSWORD;

if (!firebaseApiKey || !email || !password) {
  console.error('Missing environment variables. Please set FIREBASE_API_KEY, TEST_USER_EMAIL, and TEST_USER_PASSWORD in your .env file.');
  process.exit(1);
}

const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`;

(async () => {
  try {
    const response = await fetch(signInUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error signing in:', data);
      process.exit(1);
    }

    console.log('Firebase ID Token:', data.idToken);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
