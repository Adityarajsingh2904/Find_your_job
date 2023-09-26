// controllers/authController.ts
import type { Context } from 'hono';
import admin from '../firebaseAdmin.js';

interface SignupRequestBody {
  email: string;
  password: string;
  role: string; // Expected values: 'admin', 'employer', or 'worker'
}

// Sign Up Controller: Creates a user in Firebase Auth and sets a custom claim for the role.
export const signup = async (c: Context): Promise<Response> => {
  try {
    const { email, password, role } = (await c.req.json()) as SignupRequestBody;
    if (!email || !password || !role) {
      return c.json({ error: 'Missing fields: email, password, and role are required.' }, 400);
    }

    // Create the user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // Set a custom claim to store the user's role (converted to lowercase)
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: role.toLowerCase(),
    });

    return c.json({ message: 'User created successfully', uid: userRecord.uid }, 201);
  } catch (error: any) {
    console.error('Error during signup:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
};

// Sign In Controller: Expects the client to pass a Firebase ID token in the Authorization header.
export const signin = async (c: Context): Promise<Response> => {
  try {
    const authHeader = c.req.header('Authorization');
    console.log(authHeader)
    if (!authHeader) {
      return c.json({ error: 'Authorization header missing' }, 401);
    }

    // Expect header format: "Bearer <idToken>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      return c.json({ error: 'Invalid authorization header format' }, 401);
    }

    const idToken = parts[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return c.json({ message: 'Sign in successful', user: decodedToken });
  } catch (error: any) {
    console.error('Error during signin:', error);
    return c.json({ error: error.message || 'Unauthorized' }, 401);
  }
};

// Sign Out Controller: Revokes the user's refresh tokens so that they must sign in again.
export const signout = async (c: Context): Promise<Response> => {
  try {
    // Extract the ID token from the Authorization header (format: "Bearer <idToken>")
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Authorization header missing' }, 401);
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      return c.json({ error: 'Invalid Authorization header format' }, 401);
    }
    const idToken = parts[1];

    // Verify the ID token to obtain the user's UID
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Revoke the user's refresh tokens to effectively sign them out
    await admin.auth().revokeRefreshTokens(uid);

    return c.json({ message: 'User signed out successfully' });
  } catch (error: any) {
    console.error('Error during sign out:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
};


