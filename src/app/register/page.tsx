"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Eye, Loader2, ArrowLeft, Lock, Shield, Bell } from "lucide-react";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    { icon: Lock, text: "100% anonymous reporting" },
    { icon: Shield, text: "Identity never revealed" },
    { icon: Bell, text: "Community alerts" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Back navigation */}
      <div className="p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <Eye className="w-10 h-10 mb-3" />
            <span className="text-lg font-semibold tracking-tight">
              We See You
            </span>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight mb-2">
                Create account
              </h1>
              <p className="text-sm text-muted-foreground">
                Join the community protecting against online abuse
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-2">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card"
                >
                  <benefit.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{benefit.text}</span>
                </div>
              ))}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 h-12 px-4 rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="currentColor"
                      className="opacity-70"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="currentColor"
                      className="opacity-70"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="currentColor"
                      className="opacity-70"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="currentColor"
                      className="opacity-70"
                    />
                  </svg>
                  Sign up with Google
                </>
              )}
            </button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?{" "}
              </span>
              <Link
                href="/login"
                className="font-medium hover:underline underline-offset-4"
              >
                Sign in
              </Link>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-10">
            By signing up, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
