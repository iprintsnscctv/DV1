import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function Page() {
  let todos: any[] = [];
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data } = await supabase.from('todos').select();
    if (data) {
      todos = data;
    }
  } catch (e) {
    console.warn('[Todos Page] Error fetching todos:', e);
  }

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Todos</h1>
      {todos.length === 0 ? (
        <p className="text-sm text-slate-500">No todos found or Supabase not connected.</p>
      ) : (
        <ul className="list-disc pl-5 space-y-1">
          {todos.map((todo: any) => (
            <li key={todo.id}>{todo.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

