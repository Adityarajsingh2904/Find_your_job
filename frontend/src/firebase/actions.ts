// app/actions/auth.ts
"use server";

import { cookies } from "next/headers";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/firebase/config";

export async function signUp(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const idToken = await userCredential.user.getIdToken();
    const cookieStore = await cookies();
    cookieStore.set("auth-token", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    return { success: true };
  } catch (error) {
    console.log(error);
    return { error: "Failed to sign up. Please check your credentials." };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const idToken = await userCredential.user.getIdToken();
    const cookieStore = await cookies();
    cookieStore.set("auth-token", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    return { success: true };
  } catch (error) {
    console.log(error);
    return { error: "Failed to sign in. Please check your credentials." };
  }
}

export async function handleGoogleCredential(credential: string) {
  try {
    const googleCredential = GoogleAuthProvider.credential(credential);
    const userCredential = await signInWithCredential(auth, googleCredential);
    const idToken = await userCredential.user.getIdToken();
    const cookieStore = await cookies();
    cookieStore.set("auth-token", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    return { success: true };
  } catch (error) {
    console.log(error);
    return { error: "Failed to authenticate with Google." };
  }
}
