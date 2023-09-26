// testFirebase.ts
import admin from '../firebaseAdmin.js';

(async () => {
  try {
    const users = await admin.auth().listUsers(10);
    console.log('Retrieved users:', users.users);
  } catch (error) {
    console.error('Error listing users:', error);
  }
})();
