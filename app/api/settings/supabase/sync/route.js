import { syncLocalDataToSupabase } from '../../../../../server/config/supabase';
import { loadData } from '../../../../../server/db';

export async function POST() {
  const data = loadData();
  const result = await syncLocalDataToSupabase(data);
  return Response.json(result);
}
