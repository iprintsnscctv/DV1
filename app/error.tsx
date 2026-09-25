'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#faf7f2] dark:bg-[#140f0c] text-[#221912] dark:text-[#fcf9ee]">
      <h2 className="text-xl font-bold">An unexpected error occurred</h2>
      <p className="text-xs text-slate-500 mt-2">{error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all"
      >
        Try again
      </button>
    </div>
  );
}
