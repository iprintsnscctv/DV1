import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function Page() {
  let todos: any[] | null = null;
  let errorMessage: string | null = null;

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase.from('todos').select();
    if (error) {
      errorMessage = error.message;
    } else {
      todos = data;
    }
  } catch (err: any) {
    errorMessage = err?.message || 'Failed to connect to Supabase';
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#140f0c] p-8 text-[#221912] dark:text-[#fcf9ee] font-sans">
      <div className="max-w-lg mx-auto bg-white dark:bg-[#1e1713] p-6 rounded-2xl shadow-sm border border-amber-200/60 dark:border-amber-900/40">
        <h1 className="text-xl font-bold mb-4 text-[#221912] dark:text-[#fcf9ee]">
          Supabase Connection Status
        </h1>
        {errorMessage ? (
          <div className="p-3 mb-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
            Query note: {errorMessage}
          </div>
        ) : (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200">
            ✓ Connected to Supabase
          </div>
        )}
        <ul className="list-disc pl-5 space-y-1 text-sm text-[#443224] dark:text-[#dfcebd]">
          {todos && todos.length > 0 ? (
            todos.map((todo: any) => (
              <li key={todo.id}>{todo.name || todo.title || JSON.stringify(todo)}</li>
            ))
          ) : (
            <li className="text-gray-500 italic">No records found in &apos;todos&apos; table.</li>
          )}
        </ul>
        <div className="mt-6 pt-4 border-t border-amber-200/60 dark:border-amber-900/40">
          <Link
            href="/"
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            ← Return to Diversion Vigan Booking Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
