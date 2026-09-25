import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#faf7f2] dark:bg-[#140f0c] text-[#221912] dark:text-[#fcf9ee]">
      <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
      <p className="text-slate-500 dark:text-slate-400 mt-2">
        The requested page does not exist.
      </p>
      <Link
        href="/"
        className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all"
      >
        Return to Home
      </Link>
    </div>
  );
}

