"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import bgImage from "@/assets/bg.png";
import dashboardPreview from "@/assets/image 1.png";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    let hasError = false;
    const newErrors: { email?: string; password?: string } = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
      hasError = true;
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      await login(formData.email, formData.password, formData.rememberMe);
      toast.success("Login successful");
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-[#FAF9F8]">
      {/* Left Panel - Form */}
      <div className="w-full md:w-[45%] flex flex-col relative px-6 py-10 lg:px-12">
        {/* Logo - Top Left */}
        <div className="flex items-center gap-2.5 mb-16 md:absolute md:top-10 md:left-12 md:mb-0 z-10">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="16" r="10" fill="#FF8A4C" fillOpacity="0.85" />
            <circle cx="20" cy="16" r="10" fill="#F97316" />
          </svg>
          <span className="font-bold text-[22px] tracking-tight text-[#111827]">
            ObliQ
          </span>
        </div>

        {/* Login Card */}
        <div className="flex-1 flex flex-col justify-center max-w-[440px] w-full mx-auto z-10">
          <div className="bg-white rounded-[24px] shadow-[0px_12px_48px_rgba(0,0,0,0.05)] p-8 sm:p-10 border border-black/[0.02]">
            <div className="mb-10 text-center">
              <h1 className="text-[28px] font-bold text-[#111827] mb-2">
                Login
              </h1>
              <p className="text-[14px] text-[#6B7280]">
                Enter your details to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 [&_label]:text-[#374151]">
              <div className="space-y-1">
                <Input
                  label="Email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  error={errors.email}
                  disabled={loading}
                  className="rounded-[12px] border-[#E5E7EB] placeholder:text-[#9CA3AF] py-2.5 px-4"
                />
              </div>

              <div className="space-y-1">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, password: e.target.value }))
                  }
                  error={errors.password}
                  disabled={loading}
                  className="rounded-[12px] border-[#E5E7EB] placeholder:text-[#9CA3AF] py-2.5 px-4"
                />
              </div>

              <div className="flex items-center justify-between pt-1 pb-2">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        rememberMe: e.target.checked,
                      }))
                    }
                    className="w-[18px] h-[18px] rounded-[5px] border-[#D1D5DB] text-[#F97316] focus:ring-[#F97316] transition-colors"
                    disabled={loading}
                  />
                  <span className="ml-2.5 text-[14px] text-[#4B5563] group-hover:text-[#374151] transition-colors">
                    Remember me
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[14px] text-[#F97316] hover:text-[#EA580C] font-semibold transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                disabled={loading}
                className="bg-[#F97316] hover:bg-[#EA580C] text-white rounded-[12px] font-semibold py-[14px] text-[15px] shadow-[0px_8px_20px_rgba(249,115,22,0.25)] transition-all active:scale-[0.98]"
              >
                Log in
              </Button>
            </form>

            <p className="mt-8 text-center text-[14px] text-[#6B7280]">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-[#111827] font-semibold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Gradient Background + Dashboard Preview */}
      <div className="hidden md:block md:w-[55%] relative overflow-hidden">
        {/* Wavy gradient background image */}
        <Image
          src={bgImage}
          alt="Abstract wavy gradient background"
          fill
          className="object-cover object-left"
          priority
          quality={100}
        />

        {/* Dashboard preview image overlaid */}
        <div className="absolute inset-0 flex items-center justify-center pl-12 pr-0 lg:pl-16">
          <div className="relative w-full max-w-[800px] transform transition-transform duration-700 hover:scale-[1.01]">
            <Image
              src={dashboardPreview}
              alt="Obliq Dashboard Interface Preview"
              className="rounded-l-2xl shadow-[0px_20px_60px_rgba(0,0,0,0.15)] ml-auto"
              priority
              quality={100}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
