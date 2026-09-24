'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamic import with ssr: false ensures that browser-dependent features (localStorage, window, etc.)
// hydrate cleanly without mismatch in Next.js
const MainApp = dynamic(() => import('../src/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#faf7f2] dark:bg-[#140f0c] text-[#221912] dark:text-[#fcf9ee]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-[#443224] dark:text-[#dfcebd]">
          Diversion Vigan
        </p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400 font-semibold">
          Transient and Private Villa
        </p>
      </div>
    </div>
  ),
});

export default function Page() {
  return <MainApp />;
}
