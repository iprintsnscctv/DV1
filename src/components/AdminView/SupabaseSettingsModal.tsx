import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Server,
  CloudUpload,
} from 'lucide-react';
import {
  getSupabaseSettings,
  testSupabaseConnection,
  syncLocalDataToSupabase,
  getSupabaseSchemaSql,
  SupabaseConfigStatus,
  SupabaseTestResult,
} from '../../services/supabase';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [status, setStatus] = useState<SupabaseConfigStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testResult, setTestResult] = useState<SupabaseTestResult | null>(null);
  const [schemaSql, setSchemaSql] = useState<string>('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'schema' | 'guide'>('status');

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      loadSchema();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await getSupabaseSettings();
      setStatus(data);
    } catch {
      setStatus({ configured: false, url: null, hasAnonKey: false, hasServiceKey: false });
    } finally {
      setLoading(false);
    }
  };

  const loadSchema = async () => {
    try {
      const sql = await getSupabaseSchemaSql();
      setSchemaSql(sql);
    } catch (e) {
      console.error('Failed to load SQL schema', e);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testSupabaseConnection();
      setTestResult(result);
      if (result.success) {
        onShowToast(result.message, 'success');
      } else {
        onShowToast(result.message, 'error');
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Connection test failed' });
      onShowToast('Connection failed', 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleSyncData = async () => {
    setSyncing(true);
    try {
      const res = await syncLocalDataToSupabase();
      if (res.success) {
        onShowToast(res.message, 'success');
      } else {
        onShowToast(res.message, 'error');
      }
    } catch (e: any) {
      onShowToast(e.message || 'Failed to sync data', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleCopySql = () => {
    if (!schemaSql) return;
    navigator.clipboard.writeText(schemaSql);
    setCopiedSql(true);
    onShowToast('SQL Schema copied to clipboard!', 'success');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Supabase Database Settings
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-medium">
                  PostgreSQL
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure cloud database sync, connection health, and database schemas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/30 dark:bg-slate-900/50 gap-2">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'status'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Connection Status
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'schema'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            SQL Table Schema
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'guide'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Docker & Env Guide
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'status' && (
            <div className="space-y-6">
              {/* Status Card */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {status?.configured ? (
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    )}
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {status?.configured
                        ? 'Supabase Configured & Active'
                        : 'Local Mode (Supabase keys not yet configured)'}
                    </span>
                  </div>

                  <button
                    onClick={loadStatus}
                    disabled={loading}
                    className="p-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block mb-1">Supabase Endpoint URL</span>
                    <span className="font-mono text-slate-700 dark:text-slate-200 truncate block">
                      {status?.url || 'Not set in environment'}
                    </span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block mb-1">API Authentication Keys</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                          status?.hasAnonKey
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {status?.hasAnonKey ? <Check className="w-3 h-3" /> : null}
                        Anon Key
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                          status?.hasServiceKey
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {status?.hasServiceKey ? <Shield className="w-3 h-3" /> : null}
                        Service Key
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleTestConnection}
                  disabled={testing || !status?.configured}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    status?.configured
                      ? 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  {testing ? 'Testing Connection...' : 'Test Supabase Connection'}
                </button>

                <button
                  onClick={handleSyncData}
                  disabled={syncing || !status?.configured}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    status?.configured
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <CloudUpload className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Push Local Rooms & Bookings to Supabase'}
                </button>
              </div>

              {/* Test Result Feedback */}
              {testResult && (
                <div
                  className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold block mb-0.5">
                      {testResult.success ? 'Supabase Status Check' : 'Connection Error'}
                    </span>
                    <p>{testResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    PostgreSQL Tables Schema
                  </h3>
                  <p className="text-xs text-slate-500">
                    Paste this into your Supabase Dashboard &rarr; SQL Editor &rarr; New Query &rarr; Run.
                  </p>
                </div>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'Copied!' : 'Copy SQL Schema'}
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-[300px] border border-slate-800 leading-relaxed select-all">
                  {schemaSql}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-amber-600" />
                  How to supply Supabase keys to your Docker Container:
                </h4>
                <p>
                  When launching via <strong>Docker Compose</strong>, <strong>Portainer</strong>, or <strong>Coolify</strong>, define these environment variables in your deployment settings:
                </p>
                <div className="p-3 bg-slate-900 text-slate-100 font-mono text-[11px] rounded-lg space-y-1">
                  <div>SUPABASE_URL=https://your-project.supabase.co</div>
                  <div>SUPABASE_ANON_KEY=your-supabase-anon-key</div>
                  <div>SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key</div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/50 space-y-1.5 text-amber-900 dark:text-amber-300">
                <h4 className="font-semibold">Dual Storage Architecture:</h4>
                <p>
                  Even if Supabase is offline or not configured, this application will continue to operate normally by writing to its local persistent JSON storage. Once configured, data can be synced to Supabase with one click.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            Open Supabase Dashboard
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
