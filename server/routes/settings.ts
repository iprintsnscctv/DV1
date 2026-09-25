import { Router, Request, Response } from 'express';
import {
  getSupabaseStatus,
  testSupabaseConnection,
  syncLocalDataToSupabase,
  getSupabaseSchemaSql,
} from '../config/supabase';
import { loadData } from '../db';

const router = Router();

// GET /api/settings/supabase - Check current Supabase status
router.get('/supabase', (_req: Request, res: Response) => {
  const status = getSupabaseStatus();
  res.json(status);
});

// POST /api/settings/supabase/test - Test connection to Supabase
router.post('/supabase/test', async (_req: Request, res: Response) => {
  const result = await testSupabaseConnection();
  res.json(result);
});

// POST /api/settings/supabase/sync - Push current local data to Supabase
router.post('/supabase/sync', async (_req: Request, res: Response) => {
  const data = loadData();
  const result = await syncLocalDataToSupabase(data);
  res.json(result);
});

// GET /api/settings/supabase/schema - Return the copy-paste SQL schema for Supabase
router.get('/supabase/schema', (_req: Request, res: Response) => {
  const sql = getSupabaseSchemaSql();
  res.json({ sql });
});

export default router;
