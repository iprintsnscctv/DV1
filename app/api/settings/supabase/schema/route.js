import { getSupabaseSchemaSql } from '../../../../../server/config/supabase';

export async function GET() {
  const sql = getSupabaseSchemaSql();
  return Response.json({ sql });
}
