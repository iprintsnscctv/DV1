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
  try {
    if (res.headersSent) return;
    const status = getSupabaseStatus();
    return res.json(status);
  } catch (err: any) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message || 'Failed to retrieve Supabase status' });
  }
});

// POST /api/settings/supabase/test - Test connection to Supabase
router.post('/supabase/test', async (_req: Request, res: Response) => {
  try {
    if (res.headersSent) return;
    const result = await testSupabaseConnection();
    if (res.headersSent) return;
    return res.json(result);
  } catch (err: any) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message || 'Failed to test Supabase connection' });
  }
});

// POST /api/settings/supabase/sync - Push current local data to Supabase
router.post('/supabase/sync', async (_req: Request, res: Response) => {
  try {
    if (res.headersSent) return;
    const data = loadData();
    const result = await syncLocalDataToSupabase(data);
    if (res.headersSent) return;
    return res.json(result);
  } catch (err: any) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message || 'Failed to sync data to Supabase' });
  }
});

// GET /api/settings/supabase/schema - Return the copy-paste SQL schema for Supabase
router.get('/supabase/schema', (_req: Request, res: Response) => {
  try {
    if (res.headersSent) return;
    const sql = getSupabaseSchemaSql();
    return res.json({ sql });
  } catch (err: any) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message || 'Failed to generate schema' });
  }
});

export default router;
