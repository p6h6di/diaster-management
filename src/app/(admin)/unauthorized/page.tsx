"use client";

import React from "react";
import { useRouter } from "next/navigation";

const UnauthorizedPage = () => {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-black selection:bg-sky-500/20 overflow-hidden">
      <div className="fixed inset-0 -z-10 min-h-screen">
        <div className="absolute inset-0 h-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03),transparent_50%)]" />
        <div className="absolute inset-0 h-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.04),transparent_70%)]" />
      </div>

      <main className="relative px-6 py-16">
        <div className="mx-auto max-w-xl text-center">
          <div className="inline-flex h-9 items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 text-sm text-red-400">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Access Denied
          </div>

          <h1 className="mt-8 bg-gradient-to-b from-white to-white/80 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
            Unauthorized Access
          </h1>

          <p className="mt-4 text-zinc-400">
            You don't have permission to access this area. Please contact an
            administrator if you believe this is a mistake.
          </p>

          <button
            onClick={() => router.push("/")}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 
              px-6 py-3 text-sm font-medium text-white shadow-lg
              transition-all duration-200 hover:from-sky-400 hover:to-blue-500"
          >
            <span>Return to Home</span>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
};

export default UnauthorizedPage;
