import { CustomerUser, Reservation } from '../types';

interface StoredCustomer extends CustomerUser {
  passwordHash: string;
}

const DEFAULT_CUSTOMERS: StoredCustomer[] = [
  {
    id: 'cust-1',
    name: 'Alexander Wright',
    email: 'alex.wright@example.com',
    phone: '+63 917 234 5678',
    passwordHash: 'password123',
    createdAt: '2026-09-01 10:00',
  },
  {
    id: 'cust-2',
    name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    phone: '+63 928 987 6543',
    passwordHash: 'password123',
    createdAt: '2026-09-05 14:20',
  },
  {
    id: 'cust-3',
    name: 'Marcus Chen',
    email: 'm.chen@example.com',
    phone: '+63 919 432 1098',
    passwordHash: 'password123',
    createdAt: '2026-09-10 16:45',
  }
];

const CUSTOMERS_STORAGE_KEY = 'div_registered_customers';
const CURRENT_USER_STORAGE_KEY = 'div_logged_in_customer';

export const getStoredCustomers = (): StoredCustomer[] => {
  try {
    const raw = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(DEFAULT_CUSTOMERS));
      return DEFAULT_CUSTOMERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CUSTOMERS;
  }
};

export const getCurrentCustomer = (): CustomerUser | null => {
  try {
    const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const registerCustomer = (
  name: string,
  email: string,
  password: string,
  phone: string
): { success: boolean; error?: string; user?: CustomerUser } => {
  const cleanEmail = email.trim().toLowerCase();
  if (!name.trim()) return { success: false, error: 'Full name is required.' };
  if (!cleanEmail || !cleanEmail.includes('@')) return { success: false, error: 'Valid email address is required.' };
  if (!password || password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };

  const customers = getStoredCustomers();
  const existing = customers.find((c) => c.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
  }

  const newCustomer: StoredCustomer = {
    id: `cust-${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    phone: phone.trim() || '+63 900 000 0000',
    passwordHash: password,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };

  const updatedCustomers = [...customers, newCustomer];
  try {
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updatedCustomers));
  } catch (e) {
    console.error('Failed to save customer', e);
  }

  const publicUser: CustomerUser = {
    id: newCustomer.id,
    name: newCustomer.name,
    email: newCustomer.email,
    phone: newCustomer.phone,
    createdAt: newCustomer.createdAt,
  };

  try {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(publicUser));
  } catch (e) {
    console.error('Failed to save current user', e);
  }

  return { success: true, user: publicUser };
};

export const loginCustomer = (
  email: string,
  password: string
): { success: boolean; error?: string; user?: CustomerUser } => {
  const cleanEmail = email.trim().toLowerCase();
  const customers = getStoredCustomers();
  const found = customers.find((c) => c.email.toLowerCase() === cleanEmail);

  if (!found) {
    return { success: false, error: 'No account found with this email. Please register first.' };
  }

  if (found.passwordHash !== password) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  const publicUser: CustomerUser = {
    id: found.id,
    name: found.name,
    email: found.email,
    phone: found.phone,
    createdAt: found.createdAt,
  };

  try {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(publicUser));
  } catch (e) {
    console.error('Failed to save current user', e);
  }

  return { success: true, user: publicUser };
};

export const logoutCustomer = (): void => {
  try {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to logout', e);
  }
};
