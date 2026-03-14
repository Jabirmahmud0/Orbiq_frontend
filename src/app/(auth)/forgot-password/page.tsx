"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import apiClient from "@/lib/api";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/auth/forgot-password", { email });
      setIsSuccess(true);
      toast.success("Reset link sent");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg font-sans p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative">
        <div className="absolute top-8 left-8">
          <Link href="/login" className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to login</span>
          </Link>
        </div>

        <div className="mt-12 mb-8 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-primary font-bold text-2xl">O</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Forgot Password
          </h1>
          <p className="text-sm text-text-secondary">
            {isSuccess 
              ? "Check your email for a password reset link." 
              : "No worries, we'll send you reset instructions."}
          </p>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              disabled={loading}
              autoComplete="email"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading}
              className="bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold py-3"
            >
              Send Instructions
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <Button
              variant="outline"
              size="lg"
              fullWidth
              className="mt-4"
              onClick={() => setIsSuccess(false)}
            >
              Try another email
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
