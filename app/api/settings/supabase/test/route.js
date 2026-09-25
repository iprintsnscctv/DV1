import { testSupabaseConnection } from '../../../../../server/config/supabase';

export async function POST() {
  const result = await testSupabaseConnection();
  return Response.json(result);
}
