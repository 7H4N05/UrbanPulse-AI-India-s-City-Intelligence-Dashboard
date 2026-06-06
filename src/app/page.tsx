'use client';

import React, { Suspense } from 'react';
import DashboardContent from '../components/DashboardContent';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Suspense fallback={
        <div className="flex-1 flex flex-col items-center justify-center min-h-screen text-slate-500 font-bold animate-pulse text-sm">
          🔄 Connecting to India City Intelligence Network...
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </main>
  );
}
