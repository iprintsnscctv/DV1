export type AdminRole = 'admin' | 'staff';

export interface AdminStaffPermissions {
  canManageRooms: boolean;          // Edit room rates, amenities, photos
  canManageHousekeeping: boolean;   // Change Clean / Dirty & status
  canManageReservations: boolean;   // Confirm, check-in, cancel reservations
  canCreateWalkIn: boolean;         // Create new walk-in reservations
  canManageStaff: boolean;          // Only Admin can create/edit staff accounts
  canAccessSupabase: boolean;       // Cloud database settings
}

export interface AdminAccount {
  id: string;
  username: string;
  name: string;
  role: AdminRole;
  passwordHash: string;
  permissions: AdminStaffPermissions;
  createdAt: string;
}

const DEFAULT_ADMIN: AdminAccount = {
  id: 'admin-root',
  username: 'admin',
  name: 'System Administrator',
  role: 'admin',
  passwordHash: 'apelin123',
  permissions: {
    canManageRooms: true,
    canManageHousekeeping: true,
    canManageReservations: true,
    canCreateWalkIn: true,
    canManageStaff: true,
    canAccessSupabase: true,
  },
  createdAt: '2026-09-24 00:00',
};

const DEFAULT_STAFF: AdminAccount[] = [
  DEFAULT_ADMIN,
  {
    id: 'staff-sample',
    username: 'staff1',
    name: 'Front Desk Associate',
    role: 'staff',
    passwordHash: 'staff123',
    permissions: {
      canManageRooms: false,
      canManageHousekeeping: true,
      canManageReservations: true,
      canCreateWalkIn: true,
      canManageStaff: false,
      canAccessSupabase: false,
    },
    createdAt: '2026-09-24 10:00',
  }
];

const ADMIN_ACCOUNTS_KEY = 'div_admin_staff_accounts';
const CURRENT_ADMIN_KEY = 'div_current_admin_session';

export const getStoredAdminAccounts = (): AdminAccount[] => {
  try {
    const raw = localStorage.getItem(ADMIN_ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(DEFAULT_STAFF));
      return DEFAULT_STAFF;
    }
    const parsed: AdminAccount[] = JSON.parse(raw);
    // Ensure root admin always has username: admin and password: apelin123
    const hasAdmin = parsed.some(a => a.username.toLowerCase() === 'admin');
    if (!hasAdmin) {
      parsed.unshift(DEFAULT_ADMIN);
      localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return DEFAULT_STAFF;
  }
};

export const getCurrentAdminSession = (): AdminAccount | null => {
  try {
    const raw = localStorage.getItem(CURRENT_ADMIN_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const loginAdmin = (username: string, password: string): { success: boolean; user?: AdminAccount; error?: string } => {
  const accounts = getStoredAdminAccounts();
  const cleanUsername = username.trim().toLowerCase();
  
  // Direct check for master credentials as safety net
  if (cleanUsername === 'admin' && password === 'apelin123') {
    const adminAcc = accounts.find(a => a.username.toLowerCase() === 'admin') || DEFAULT_ADMIN;
    localStorage.setItem(CURRENT_ADMIN_KEY, JSON.stringify(adminAcc));
    return { success: true, user: adminAcc };
  }

  const account = accounts.find(a => a.username.toLowerCase() === cleanUsername);
  if (!account) {
    return { success: false, error: 'User not found. Use admin credentials or an authorized staff account.' };
  }

  if (account.passwordHash !== password) {
    return { success: false, error: 'Incorrect password.' };
  }

  localStorage.setItem(CURRENT_ADMIN_KEY, JSON.stringify(account));
  return { success: true, user: account };
};

export const logoutAdmin = (): void => {
  try {
    localStorage.removeItem(CURRENT_ADMIN_KEY);
  } catch {}
};

export const createStaffAccount = (
  newStaff: {
    username: string;
    name: string;
    password: string;
    permissions: AdminStaffPermissions;
  }
): { success: boolean; account?: AdminAccount; error?: string } => {
  const accounts = getStoredAdminAccounts();
  const cleanUsername = newStaff.username.trim().toLowerCase();

  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters.' };
  }

  if (accounts.some(a => a.username.toLowerCase() === cleanUsername)) {
    return { success: false, error: 'Username already exists. Please choose a different username.' };
  }

  if (!newStaff.password || newStaff.password.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters.' };
  }

  const created: AdminAccount = {
    id: `staff-${Date.now()}`,
    username: newStaff.username.trim(),
    name: newStaff.name.trim() || newStaff.username.trim(),
    role: 'staff',
    passwordHash: newStaff.password,
    permissions: newStaff.permissions,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };

  const updated = [...accounts, created];
  try {
    localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(updated));
  } catch {}

  return { success: true, account: created };
};

export const updateStaffAccount = (
  id: string,
  updates: Partial<Pick<AdminAccount, 'name' | 'passwordHash' | 'permissions'>>
): { success: boolean; error?: string } => {
  const accounts = getStoredAdminAccounts();
  const index = accounts.findIndex(a => a.id === id);
  if (index === -1) return { success: false, error: 'Account not found.' };

  const current = accounts[index];
  if (current.username.toLowerCase() === 'admin' && updates.passwordHash && updates.passwordHash !== 'apelin123') {
    // protect root admin password if necessary
  }

  accounts[index] = {
    ...current,
    ...updates,
  };

  try {
    localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));
    // update current session if editing own profile
    const currentSession = getCurrentAdminSession();
    if (currentSession && currentSession.id === id) {
      localStorage.setItem(CURRENT_ADMIN_KEY, JSON.stringify(accounts[index]));
    }
  } catch {}

  return { success: true };
};

export const deleteStaffAccount = (id: string): { success: boolean; error?: string } => {
  const accounts = getStoredAdminAccounts();
  const account = accounts.find(a => a.id === id);
  if (!account) return { success: false, error: 'Account not found.' };
  if (account.username.toLowerCase() === 'admin' || account.role === 'admin') {
    return { success: false, error: 'Cannot delete primary Admin account.' };
  }

  const filtered = accounts.filter(a => a.id !== id);
  try {
    localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(filtered));
  } catch {}

  return { success: true };
};
