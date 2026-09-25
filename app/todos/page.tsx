import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos, error } = await supabase.from('todos').select('*');

  return (
    <div className="p-8 max-w-lg mx-auto font-sans">
      <h1 className="text-xl font-bold mb-4 text-[#221912]">Supabase Connection Test</h1>
      {error && (
        <div className="p-3 mb-4 rounded bg-amber-50 border border-amber-200 text-xs text-amber-800">
          Query note: {error.message} (Note: table &apos;todos&apos; may need to be created in your Supabase dashboard)
        </div>
      )}
      <ul className="list-disc pl-5 space-y-1 text-sm text-[#443224]">
        {todos && todos.length > 0 ? (
          todos.map((todo: any) => (
            <li key={todo.id}>{todo.name || todo.title || JSON.stringify(todo)}</li>
          ))
        ) : (
          <li className="text-gray-500 italic">No todos found (table may be empty or awaiting schema setup).</li>
        )}
      </ul>
      <div className="mt-6 pt-4 border-t border-gray-200">
        <a
          href="/"
          className="text-xs font-semibold text-amber-600 hover:text-amber-700 underline"
        >
          ← Return to Diversion Vigan Booking Portal
        </a>
      </div>
    </div>
  );
}
