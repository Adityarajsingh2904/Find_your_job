"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { signIn, register } from "@/actions/auth";
import { getAndSetUserInfo } from "@/userContextUtils";
import { useUser } from "@/context/userContext";

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("worker");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Current isSignUp state:", isSignUp);

      const result = isSignUp
        ? await register(email, password, userType)
        : await signIn(email, password);
      console.log(result);

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      try {
        await getAndSetUserInfo(setUser);
      } catch (error) {
        console.error(
          "Error in getting and setting userInfo after auth",
          error
        );
      }
      router.push("/");
    } catch (error) {
      setError("An unexpected error occurred during authentication.");
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="px-5 py-8 sm:px-8 w-full max-w-md mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-gray-600 text-sm">
          {isSignUp
            ? "Sign up to get started with Blue Collar Connect"
            : "Sign in to continue to your account"}
        </p>
      </div>

      {isSignUp && (
        <div className="space-y-2">
          <Label
            htmlFor="userType"
            className="text-sm font-medium text-gray-700"
          >
            I am a
          </Label>
          <div className="grid grid-cols-2 gap-3 mt-1">
            <button
              type="button"
              onClick={() => setUserType("worker")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border ${
                userType === "worker"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              } transition-all`}
            >
              <span className="font-medium">Skilled Worker</span>
              <span className="text-xs text-gray-500 mt-1">
                Looking for jobs
              </span>
            </button>
            <button
              type="button"
              onClick={() => setUserType("employer")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border ${
                userType === "employer"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              } transition-all`}
            >
              <span className="font-medium">Employer</span>
              <span className="text-xs text-gray-500 mt-1">Hiring workers</span>
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="py-6 px-4 rounded-xl border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="py-6 px-4 rounded-xl border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <Button
          type="submit"
          className="w-full py-6 rounded-xl text-base font-medium transition-all"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : isSignUp ? (
            "Create Account"
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-center text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            className="font-medium text-blue-600 hover:underline"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
