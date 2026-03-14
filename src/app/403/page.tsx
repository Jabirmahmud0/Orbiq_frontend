"use client";

import React from "react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Access Denied
        </h1>
        <p className="text-text-secondary mb-6">
          You don&apos;t have permission to view this page.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-primary text-white rounded-button font-button hover:bg-primary-dark transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
