import { getSupabaseStatus } from '../../../../server/config/supabase';

export async function GET() {
  const status = getSupabaseStatus();
  return Response.json(status);
}
