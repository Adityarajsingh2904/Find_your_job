import { auth } from "../firebase/config";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
async function parseResponse(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.warn("Unable to parse JSON response, returning raw text:", text);
    return text;
  }
}

/**
 * Calls the backend API to create a new user.
 */
export async function signUp(email: string, password: string, role: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/sign-up`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Signup failed");
    }
    console.log(data);

    return data; // { message: "User created successfully", uid: "some-unique-uid" }
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
}

/**
 * Handles user login by ensuring the user is signed in via Firebase,
 * retrieving a valid ID token, and then calling the backend API.
 */
export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    if (!user) {
      throw new Error("User authentication failed.");
    }

    // Set a simple session cookie - this is just to let the middleware know
    // the user has signed in, not for actual authentication
    document.cookie = `firebaseSession=true; path=/; max-age=${
      60 * 60 * 24 * 14
    }; SameSite=Strict${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`;

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
      },
    };
  } catch (error: any) {
    console.error("Sign-in failed:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Registers a new user by signing them up and immediately signing them in.
 */
export async function register(email: string, password: string, role: string) {
  try {
    // Step 1: Sign up the user on the backend.
    const signUpResponse = await signUp(email, password, role);
    if (signUpResponse.error) {
      return signUpResponse;
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Step 2: Immediately log in the user.
    const loginResponse = await signIn(email, password);
    if (loginResponse.error) {
      return loginResponse;
    }
    return { message: "Registration and login successful", ...loginResponse };
  } catch (error: any) {
    console.error("Registration error:", error.message);
    return {
      error: error.message || "Unexpected error occurred during registration",
    };
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
    // Clear the session cookie
    document.cookie = "firebaseSession=; path=/; max-age=0";
    console.log("Signed out successfully");
  } catch (error) {
    console.error("Sign-out error:", error);
  }
}
