import React, { useState } from 'react';
import {
  Building2,
  CalendarCheck,
  CheckCircle,
  Clock,
  Sparkles,
  Database,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  DollarSign,
  Users,
  ShieldCheck,
  Check,
  AlertTriangle,
  Copy,
  ChevronRight,
} from 'lucide-react';
import { Room, Reservation, CustomRates, SupabaseConfigStatus } from '../../types';

interface AdminDashboardProps {
  rooms: Room[];
  reservations: Reservation[];
  supabaseStatus: SupabaseConfigStatus | null;
  onUpdateRoomStatus: (roomId: string, status: string, isClean: boolean) => Promise<void>;
  onUpdateReservationStatus: (
    resId: string,
    status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  ) => Promise<void>;
  onDeleteReservation: (resId: string) => Promise<void>;
  onOpenRatesModal: (room: Room) => void;
  onTestSupabase: () => Promise<{ success: boolean; message?: string; error?: string }>;
  onSyncSupabase: () => Promise<{ success: boolean; message?: string; error?: string; synced?: any }>;
  onGetSchema: () => Promise<string>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  rooms,
  reservations,
  supabaseStatus,
  onUpdateRoomStatus,
  onUpdateReservationStatus,
  onDeleteReservation,
  onOpenRatesModal,
  onTestSupabase,
  onSyncSupabase,
  onGetSchema,
}) => {
  const [adminTab, setAdminTab] = useState<'rooms' | 'reservations' | 'supabase'>('rooms');
  const [resFilter, setResFilter] = useState<string>('all');
  const [syncLoading, setSyncLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [schemaSql, setSchemaSql] = useState<string>('');
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Metrics
  const totalRevenue = reservations
    .filter((r) => r.status !== 'cancelled')
    .reduce((acc, r) => acc + r.totalAmount, 0);
  const activeStays = reservations.filter((r) => r.status === 'active').length;
  const upcomingCount = reservations.filter((r) => r.status === 'upcoming').length;
  const availableRoomsCount = rooms.filter((r) => r.status === 'Available').length;

  const filteredReservations = reservations.filter((r) => {
    if (resFilter === 'all') return true;
    return r.status === resFilter;
  });

  const handleTestSupabase = async () => {
    setTestResult(null);
    const res = await onTestSupabase();
    setTestResult(res);
  };

  const handleSyncSupabase = async () => {
    setSyncLoading(true);
    setSyncResult(null);
    const res = await onSyncSupabase();
    setSyncResult(res);
    setSyncLoading(false);
  };

  const handleLoadSchema = async () => {
    const sql = await onGetSchema();
    setSchemaSql(sql);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2a1c14] text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Diversion Vigan Management</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2a1c14] dark:text-[#f8f4ec]">
            Property Operations Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-[#735745] dark:text-[#c5b2a3]">
            Manage unit availability, guest check-ins, custom pax tiers, and Supabase database synchronization.
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-[#231a14] rounded-xl border border-gray-200 dark:border-gray-800 self-start">
          <button
            onClick={() => setAdminTab('rooms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              adminTab === 'rooms'
                ? 'bg-white dark:bg-[#34241b] text-amber-700 dark:text-amber-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Rooms ({rooms.length})</span>
          </button>
          <button
            onClick={() => setAdminTab('reservations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              adminTab === 'reservations'
                ? 'bg-white dark:bg-[#34241b] text-amber-700 dark:text-amber-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Reservations ({reservations.length})</span>
          </button>
          <button
            onClick={() => setAdminTab('supabase')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              adminTab === 'supabase'
                ? 'bg-white dark:bg-[#34241b] text-amber-700 dark:text-amber-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Sync</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-[#1e1611] p-5 rounded-2xl border border-[#ebdcd0] dark:border-[#382b20] shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-[#2a1c14] dark:text-[#f8f4ec]">
            ₱{totalRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">From {reservations.length} total bookings</div>
        </div>

        <div className="bg-white dark:bg-[#1e1611] p-5 rounded-2xl border border-[#ebdcd0] dark:border-[#382b20] shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Active Stays</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-amber-600 dark:text-amber-400">
            {activeStays} In-House
          </div>
          <div className="text-[10px] text-gray-400 mt-1">{upcomingCount} upcoming bookings</div>
        </div>

        <div className="bg-white dark:bg-[#1e1611] p-5 rounded-2xl border border-[#ebdcd0] dark:border-[#382b20] shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Available Units</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-[#2a1c14] dark:text-[#f8f4ec]">
            {availableRoomsCount} / {rooms.length}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">Ready for instant guest check-in</div>
        </div>

        <div className="bg-white dark:bg-[#1e1611] p-5 rounded-2xl border border-[#ebdcd0] dark:border-[#382b20] shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Database Backend</span>
            <Database className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-sm font-bold text-[#2a1c14] dark:text-[#f8f4ec] truncate">
            {supabaseStatus?.isConfigured ? 'Supabase Cloud' : 'Local JSON DB'}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">Live Sync Capable</div>
        </div>
      </div>

      {/* TAB 1: ROOMS MANAGEMENT */}
      {adminTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-serif font-bold text-[#2a1c14] dark:text-[#f8f4ec]">
              Units & Status Controls
            </h3>
            <span className="text-xs text-gray-500">{rooms.length} Property Units</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => {
              return (
                <div
                  key={room.id}
                  className="bg-white dark:bg-[#1e1611] rounded-2xl border border-[#ebdcd0] dark:border-[#382b20] p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                          Unit #{room.roomNumber} • Floor {room.floor}
                        </span>
                        <h4 className="text-base font-serif font-bold text-[#2a1c14] dark:text-[#fcfaf7]">
                          {room.name}
                        </h4>
                      </div>
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-md font-medium">
                        {room.category}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                      Capacity: {room.capacity} Pax • Base: ₱{room.pricePerNight.toLocaleString()}/night
                    </div>

                    {/* Status Selectors */}
                    <div className="space-y-3 bg-[#faf4ee] dark:bg-[#251b15] p-3 rounded-xl mb-4 border border-[#ebdcd0] dark:border-[#382b20]">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                          Room Status
                        </label>
                        <select
                          value={room.status}
                          onChange={(e) =>
                            onUpdateRoomStatus(room.id, e.target.value, room.isClean)
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1c130d] text-xs font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                        >
                          <option value="Available">Available (Vacant Ready)</option>
                          <option value="Reserved">Reserved (Awaiting Check-in)</option>
                          <option value="Booked">Booked (Guest In-House)</option>
                          <option value="Maintenance">Maintenance / Blocked</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Housekeeping Clean:
                        </span>
                        <button
                          onClick={() =>
                            onUpdateRoomStatus(room.id, room.status, !room.isClean)
                          }
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            room.isClean
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {room.isClean ? 'Clean & Inspected' : 'Needs Housekeeping'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <button
                      onClick={() => onOpenRatesModal(room)}
                      className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Edit Pax Tier Rates</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: RESERVATIONS HUB */}
      {adminTab === 'reservations' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div>
              <h3 className="text-base font-serif font-bold text-[#2a1c14] dark:text-[#f8f4ec]">
                Reservations & Guest Stays
              </h3>
              <p className="text-xs text-gray-500">Track check-ins, guest vouchers, and checkout status.</p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {['all', 'upcoming', 'active', 'completed', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setResFilter(st)}
                  className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all ${
                    resFilter === st
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e1611] rounded-2xl border border-[#ebdcd0] dark:border-[#382b20] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#faf4ee] dark:bg-[#281e18] text-[#553e30] dark:text-[#d3c2b4] font-bold">
                  <tr>
                    <th className="p-3">Confirmation</th>
                    <th className="p-3">Guest & Contact</th>
                    <th className="p-3">Room / Unit</th>
                    <th className="p-3">Stay Dates</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-[#3a281d] dark:text-[#e4d4c7]">
                  {filteredReservations.length > 0 ? (
                    filteredReservations.map((res) => (
                      <tr key={res.id} className="hover:bg-amber-50/40 dark:hover:bg-[#251b15]">
                        <td className="p-3 font-mono font-bold text-amber-800 dark:text-amber-400">
                          {res.confirmationCode}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{res.guestName}</div>
                          <div className="text-[11px] text-gray-500">{res.guestPhone}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{res.roomName}</div>
                          <div className="text-[10px] text-gray-500">{res.numberOfGuests} Guests</div>
                        </td>
                        <td className="p-3">
                          <div>{res.checkInDate} → {res.checkOutDate}</div>
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-800 dark:text-amber-300">
                          ₱{res.totalAmount.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              res.status === 'upcoming'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : res.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : res.status === 'completed'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {res.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {res.status === 'upcoming' && (
                              <button
                                onClick={() => onUpdateReservationStatus(res.id, 'active')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold"
                              >
                                Check In
                              </button>
                            )}
                            {res.status === 'active' && (
                              <button
                                onClick={() => onUpdateReservationStatus(res.id, 'completed')}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold"
                              >
                                Check Out
                              </button>
                            )}
                            {res.status !== 'cancelled' && (
                              <button
                                onClick={() => onUpdateReservationStatus(res.id, 'cancelled')}
                                className="px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg text-[11px] font-semibold"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteReservation(res.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500 italic">
                        No reservations found matching filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SUPABASE SYNC HUB */}
      {adminTab === 'supabase' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1e1611] rounded-2xl border border-[#ebdcd0] dark:border-[#382b20] p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#2a1c14] dark:text-[#f8f4ec]">
                  Supabase Cloud Database Synchronization
                </h3>
                <p className="text-xs text-[#735745] dark:text-[#c5b2a3]">
                  Synchronize your property rooms, custom rates, and reservations to Supabase Cloud PostgreSQL.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleTestSupabase}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#2b211a] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Test Connection</span>
                </button>
                <button
                  disabled={syncLoading}
                  onClick={handleSyncSupabase}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{syncLoading ? 'Syncing...' : 'Sync Local Data to Supabase'}</span>
                </button>
              </div>
            </div>

            {testResult && (
              <div
                className={`p-4 rounded-xl mb-4 text-xs font-medium border ${
                  testResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 text-amber-800 dark:text-amber-300'
                }`}
              >
                <strong>Test Connection Result:</strong> {testResult.message || testResult.error}
              </div>
            )}

            {syncResult && (
              <div
                className={`p-4 rounded-xl mb-4 text-xs font-medium border ${
                  syncResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 text-amber-800 dark:text-amber-300'
                }`}
              >
                <strong>Sync Result:</strong> {syncResult.message || syncResult.error}
              </div>
            )}

            {/* SQL Schema Generator */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Supabase Table Creation SQL (Copy-Paste for Supabase SQL Editor)
                </span>
                <button
                  onClick={handleLoadSchema}
                  className="text-xs text-amber-700 dark:text-amber-400 font-bold hover:underline"
                >
                  Generate Schema SQL
                </button>
              </div>

              {schemaSql && (
                <div className="relative">
                  <pre className="bg-[#140f0c] text-amber-300 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-60">
                    {schemaSql}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(schemaSql);
                      setCopiedSchema(true);
                      setTimeout(() => setCopiedSchema(false), 2000);
                    }}
                    className="absolute top-3 right-3 px-2.5 py-1 bg-amber-600 text-white rounded-md text-[10px] font-bold shadow-xs hover:bg-amber-700 transition-all flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedSchema ? 'Copied!' : 'Copy SQL'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
