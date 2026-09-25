import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import ClientApp from './ClientApp';

export default async function Page() {
  let todos: any[] | null = null;
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data } = await supabase.from('todos').select();
    todos = data;
  } catch (e) {
    // Graceful fallback if todos table is not yet created
  }

  return (
    <>
      {todos && todos.length > 0 && (
        <ul className="bg-amber-50 dark:bg-amber-950/40 px-4 py-2 border-b border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
          {todos.map((todo: any) => (
            <li key={todo.id}>{todo.name || todo.title || JSON.stringify(todo)}</li>
          ))}
        </ul>
      )}
      <ClientApp />
    </>
  );
}
