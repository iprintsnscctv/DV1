import React, { useState } from 'react';
import { 
  Users, Shield, Plus, Key, Lock, Check, X, Trash2, 
  UserCheck, AlertCircle, ShieldAlert, CheckCircle2 
} from 'lucide-react';
import { 
  AdminAccount, 
  AdminStaffPermissions, 
  getStoredAdminAccounts, 
  createStaffAccount, 
  deleteStaffAccount, 
  updateStaffAccount 
} from '../../utils/adminAuth';

interface StaffManagementModalProps {
  currentAdmin: AdminAccount;
  onClose: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const StaffManagementModal: React.FC<StaffManagementModalProps> = ({
  currentAdmin,
  onClose,
  onShowToast,
}) => {
  const [accounts, setAccounts] = useState<AdminAccount[]>(() => getStoredAdminAccounts());
  const [showAddForm, setShowAddForm] = useState(false);

  // New staff form state
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [permissions, setPermissions] = useState<AdminStaffPermissions>({
    canManageRooms: false,
    canManageHousekeeping: true,
    canManageReservations: true,
    canCreateWalkIn: true,
    canManageStaff: false,
    canAccessSupabase: false,
  });

  const refreshAccounts = () => {
    setAccounts(getStoredAdminAccounts());
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      onShowToast('Please provide both username and password.', 'error');
      return;
    }

    const res = createStaffAccount({
      username: newUsername,
      name: newName || newUsername,
      password: newPassword,
      permissions,
    });

    if (!res.success) {
      onShowToast(res.error || 'Failed to create staff account', 'error');
      return;
    }

    onShowToast(`Staff account "${newUsername}" created with custom access restrictions!`, 'success');
    setNewUsername('');
    setNewName('');
    setNewPassword('');
    setPermissions({
      canManageRooms: false,
      canManageHousekeeping: true,
      canManageReservations: true,
      canCreateWalkIn: true,
      canManageStaff: false,
      canAccessSupabase: false,
    });
    setShowAddForm(false);
    refreshAccounts();
  };

  const handleDelete = (id: string, username: string) => {
    if (!confirm(`Are you sure you want to delete staff account "${username}"?`)) return;
    const res = deleteStaffAccount(id);
    if (!res.success) {
      onShowToast(res.error || 'Failed to delete account', 'error');
      return;
    }
    onShowToast(`Staff account "${username}" removed successfully.`, 'info');
    refreshAccounts();
  };

  const handleTogglePermission = (acc: AdminAccount, permKey: keyof AdminStaffPermissions) => {
    if (acc.role === 'admin') {
      onShowToast('Primary Admin permissions cannot be restricted.', 'error');
      return;
    }

    const updatedPermissions = {
      ...acc.permissions,
      [permKey]: !acc.permissions[permKey],
    };

    updateStaffAccount(acc.id, { permissions: updatedPermissions });
    onShowToast(`Updated permissions for ${acc.username}`, 'success');
    refreshAccounts();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Staff Accounts & Access Restriction
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                  Admin Feature
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create front-desk and housekeeping accounts with fine-grained access control permissions.
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Action Row */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Active Accounts: <span className="font-bold text-slate-900 dark:text-white">{accounts.length}</span>
            </div>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Staff Account</span>
              </button>
            )}
          </div>

          {/* Create Staff Form Card */}
          {showAddForm && (
            <form onSubmit={handleCreateStaff} className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200/50 dark:border-amber-900/40">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  New Staff Credentials & Role Setup
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., reception1"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Staff Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Juan Santos"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Temporary / Initial Password *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., staffPass2026"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Permissions checkboxes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Staff Access Permissions & Restrictions:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canManageHousekeeping}
                      onChange={(e) => setPermissions({ ...permissions, canManageHousekeeping: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-slate-900 dark:text-white">Housekeeping & Clean Status</div>
                      <div className="text-[10px] text-slate-400">Mark rooms Clean / Dirty</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canManageReservations}
                      onChange={(e) => setPermissions({ ...permissions, canManageReservations: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-slate-900 dark:text-white">Manage Bookings</div>
                      <div className="text-[10px] text-slate-400">Confirm / Check-in / Cancel</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canCreateWalkIn}
                      onChange={(e) => setPermissions({ ...permissions, canCreateWalkIn: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-slate-900 dark:text-white">Walk-in Bookings</div>
                      <div className="text-[10px] text-slate-400">Create new walk-in guest records</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canManageRooms}
                      onChange={(e) => setPermissions({ ...permissions, canManageRooms: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-slate-900 dark:text-white">Modify Room Rates & Catalog</div>
                      <div className="text-[10px] text-slate-400">Change prices, photos & details</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 cursor-pointer opacity-50">
                    <input
                      type="checkbox"
                      disabled
                      checked={false}
                      className="w-4 h-4 rounded text-amber-600"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-slate-900 dark:text-white">Staff Management (Restricted)</div>
                      <div className="text-[10px] text-slate-400">Reserved for Admin only</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canAccessSupabase}
                      onChange={(e) => setPermissions({ ...permissions, canAccessSupabase: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-slate-900 dark:text-white">Supabase Settings</div>
                      <div className="text-[10px] text-slate-400">Access database configurations</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 cursor-pointer transition-all"
                >
                  Confirm & Create Staff Account
                </button>
              </div>
            </form>
          )}

          {/* Accounts List Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Account Directory</span>
              <span className="text-[11px] text-slate-400 font-normal">Click permission badges to toggle access restriction</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {accounts.map((acc) => {
                const isAdmin = acc.role === 'admin';
                return (
                  <div key={acc.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isAdmin 
                          ? 'bg-amber-600 text-white shadow-xs' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {isAdmin ? 'AD' : 'ST'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {acc.username}
                          </span>
                          {isAdmin ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                              Master Admin
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold">
                              Staff
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {acc.name} • Created: {acc.createdAt}
                        </div>
                      </div>
                    </div>

                    {/* Permissions grid / toggles */}
                    <div className="flex flex-wrap items-center gap-1.5 flex-1">
                      <button
                        type="button"
                        disabled={isAdmin}
                        onClick={() => handleTogglePermission(acc, 'canManageHousekeeping')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                          acc.permissions.canManageHousekeeping
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50 opacity-60'
                        } ${!isAdmin ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                        title="Housekeeping Status toggle"
                      >
                        Housekeeping: {acc.permissions.canManageHousekeeping ? 'Allowed' : 'Restricted'}
                      </button>

                      <button
                        type="button"
                        disabled={isAdmin}
                        onClick={() => handleTogglePermission(acc, 'canManageReservations')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                          acc.permissions.canManageReservations
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50 opacity-60'
                        } ${!isAdmin ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                        title="Reservations Management toggle"
                      >
                        Bookings: {acc.permissions.canManageReservations ? 'Allowed' : 'Restricted'}
                      </button>

                      <button
                        type="button"
                        disabled={isAdmin}
                        onClick={() => handleTogglePermission(acc, 'canCreateWalkIn')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                          acc.permissions.canCreateWalkIn
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50 opacity-60'
                        } ${!isAdmin ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                        title="Walk-in Bookings toggle"
                      >
                        Walk-in: {acc.permissions.canCreateWalkIn ? 'Allowed' : 'Restricted'}
                      </button>

                      <button
                        type="button"
                        disabled={isAdmin}
                        onClick={() => handleTogglePermission(acc, 'canManageRooms')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                          acc.permissions.canManageRooms
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50 opacity-60'
                        } ${!isAdmin ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                        title="Room pricing/inventory edit toggle"
                      >
                        Room Pricing: {acc.permissions.canManageRooms ? 'Allowed' : 'Restricted'}
                      </button>

                      <button
                        type="button"
                        disabled={isAdmin}
                        onClick={() => handleTogglePermission(acc, 'canAccessSupabase')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                          acc.permissions.canAccessSupabase
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50 opacity-60'
                        } ${!isAdmin ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                        title="Supabase Settings toggle"
                      >
                        Supabase: {acc.permissions.canAccessSupabase ? 'Allowed' : 'Restricted'}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDelete(acc.id, acc.username)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Delete staff account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
