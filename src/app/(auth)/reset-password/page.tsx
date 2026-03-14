"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import apiClient from "@/lib/api";
import toast from "react-hot-toast";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    let hasError = false;
    const newErrors: { password?: string; confirm?: string } = {};

    if (!password) {
      newErrors.password = "New password is required";
      hasError = true;
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      hasError = true;
    }

    if (password !== confirmPassword) {
      newErrors.confirm = "Passwords do not match";
      hasError = true;
    }

    if (!token) {
      toast.error("Missing reset token");
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/auth/reset-password", { token, newPassword: password });
      toast.success("Password reset successfully. You can now login.");
      router.push("/login");
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to reset password.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative">
      <div className="absolute top-8 left-8">
        <Link href="/login" className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </Link>
      </div>

      <div className="mt-12 mb-8 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Set New Password
        </h1>
        <p className="text-sm text-text-secondary">
          Your new password must be securely chosen.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          disabled={loading || !token}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirm}
          disabled={loading || !token}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          disabled={loading || !token}
          className="bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold py-3"
        >
          Reset Password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg font-sans p-4">
      <Suspense fallback={<div className="p-8 bg-white rounded-2xl shadow">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
