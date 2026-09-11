import { UserAccount, AuthSession, SavedAddress } from '../types';

// Admin Account Configuration
export const ADMIN_ACCOUNT: UserAccount = {
  id: 'usr-admin-krul411',
  email: 'krul411',
  name: 'Encik Khairul (Admin)',
  role: 'admin',
  phone: '011-2856 8920',
  createdAt: '2026-01-01T00:00:00.000Z',
  lastLogin: new Date().toISOString(),
  twoFactorEnabled: false,
  whatsappUpdates: true,
};

const STORAGE_USERS_KEY = 'khairul_fresh_users_registry_v5';
const STORAGE_SESSION_KEY = 'khairul_fresh_secure_session_v5';
const STORAGE_ATTEMPTS_KEY = 'khairul_fresh_login_attempts_v5';

// Clean up any legacy demo keys from prior sessions
try {
  localStorage.removeItem('freshayam_users_registry_v4');
  localStorage.removeItem('freshayam_secure_session');
  localStorage.removeItem('freshayam_orders_db');
} catch {
  // ignore
}

// Initialize users registry in localStorage
function getUsersRegistry(): Record<string, { user: UserAccount; passwordHash: string }> {
  try {
    const saved = localStorage.getItem(STORAGE_USERS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }

  // Initial users: Admin only (no demo customers)
  const initial: Record<string, { user: UserAccount; passwordHash: string }> = {
    'krul411': {
      user: ADMIN_ACCOUNT,
      passwordHash: 'Haizamk411',
    },
  };

  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(initial));
  } catch {
    // ignore
  }

  return initial;
}

function saveUsersRegistry(registry: Record<string, { user: UserAccount; passwordHash: string }>) {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(registry));
  } catch {
    // ignore
  }
}

// Rate Limiting / Brute-force protection helper
export function checkRateLimit(email: string): { isLocked: boolean; waitSeconds: number } {
  try {
    const attempts = JSON.parse(localStorage.getItem(STORAGE_ATTEMPTS_KEY) || '{}');
    const record = attempts[email.toLowerCase()];
    if (!record) return { isLocked: false, waitSeconds: 0 };

    if (record.count >= 5) {
      const elapsed = (Date.now() - record.lastAttempt) / 1000;
      const lockoutDuration = 60; // 60 seconds lockout
      if (elapsed < lockoutDuration) {
        return { isLocked: true, waitSeconds: Math.ceil(lockoutDuration - elapsed) };
      } else {
        // Reset after duration passed
        delete attempts[email.toLowerCase()];
        localStorage.setItem(STORAGE_ATTEMPTS_KEY, JSON.stringify(attempts));
      }
    }
  } catch {
    // ignore
  }
  return { isLocked: false, waitSeconds: 0 };
}

function recordFailedAttempt(email: string) {
  try {
    const attempts = JSON.parse(localStorage.getItem(STORAGE_ATTEMPTS_KEY) || '{}');
    const key = email.toLowerCase();
    const current = attempts[key] || { count: 0, lastAttempt: 0 };
    attempts[key] = {
      count: current.count + 1,
      lastAttempt: Date.now(),
    };
    localStorage.setItem(STORAGE_ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch {
    // ignore
  }
}

function clearFailedAttempts(email: string) {
  try {
    const attempts = JSON.parse(localStorage.getItem(STORAGE_ATTEMPTS_KEY) || '{}');
    delete attempts[email.toLowerCase()];
    localStorage.setItem(STORAGE_ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch {
    // ignore
  }
}

// Session Token Generator
function generateSecureToken(userId: string): string {
  const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const timePart = Date.now().toString(36);
  return `fa_sec_${userId}_${timePart}_${randomPart}`;
}

export const authService = {
  // Get active session
  getCurrentSession(): AuthSession | null {
    try {
      const saved = localStorage.getItem(STORAGE_SESSION_KEY);
      if (!saved) return null;
      const session: AuthSession = JSON.parse(saved);
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  // Get current logged in user directly
  getCurrentUser(): UserAccount | null {
    const session = this.getCurrentSession();
    return session ? session.user : null;
  },

  // Save session
  setSession(user: UserAccount): AuthSession {
    const session: AuthSession = {
      user: { ...user, lastLogin: new Date().toISOString() },
      token: generateSecureToken(user.id),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours expiry
    };
    try {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    } catch {
      // ignore
    }
    return session;
  },

  // Login
  async login(
    identifier: string,
    password: string
  ): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    const cleanId = identifier.trim().toLowerCase();
    
    // Check rate limit
    const lock = checkRateLimit(cleanId);
    if (lock.isLocked) {
      return {
        success: false,
        error: `Akaun disekat sementara demi keselamatan. Sila cuba lagi dalam ${lock.waitSeconds} saat.`,
      };
    }

    // Admin authentication check: Login 'krul411' with Pass 'Haizamk411'
    if (
      (cleanId === 'krul411' || cleanId === 'krul411@freshayam.com' || cleanId === 'admin@freshayam.com.my') &&
      password === 'Haizamk411'
    ) {
      clearFailedAttempts(cleanId);
      const session = this.setSession(ADMIN_ACCOUNT);
      return { success: true, user: session.user };
    }

    const registry = getUsersRegistry();
    const entry = registry[cleanId];

    if (!entry || entry.passwordHash !== password) {
      recordFailedAttempt(cleanId);
      return {
        success: false,
        error: 'ID Pengguna / Emel atau kata laluan tidak sah. Sila semak semula.',
      };
    }

    clearFailedAttempts(cleanId);
    const session = this.setSession(entry.user);
    return { success: true, user: session.user };
  },

  // Register Customer
  async register(
    name: string,
    email: string,
    phone: string,
    password: string,
    options?: { emailVerified?: boolean; phoneVerified?: boolean; twoFactorEnabled?: boolean }
  ): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const registry = getUsersRegistry();

    if (registry[normalizedEmail] || normalizedEmail === 'krul411') {
      return {
        success: false,
        error: 'Emel atau ID ini telah pun didaftarkan. Sila log masuk atau gunakan emel lain.',
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: 'Kata laluan mestilah sekurang-kurangnya 6 aksara.',
      };
    }

    const newUser: UserAccount = {
      id: `usr-cust-${Date.now().toString().slice(-6)}`,
      email: normalizedEmail,
      name: name.trim(),
      role: 'customer',
      phone: phone.trim(),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      loyaltyPoints: 50, // Welcome bonus points!
      totalSpent: 0,
      savedAddresses: [],
      emailVerified: options?.emailVerified ?? true,
      phoneVerified: options?.phoneVerified ?? true,
      twoFactorEnabled: options?.twoFactorEnabled ?? false,
    };

    registry[normalizedEmail] = {
      user: newUser,
      passwordHash: password,
    };

    saveUsersRegistry(registry);
    this.setSession(newUser);
    return { success: true, user: newUser };
  },

  // Update Profile
  updateUserProfile(updatedUser: Partial<UserAccount>): UserAccount | null {
    const currentSession = this.getCurrentSession();
    if (!currentSession) return null;

    const registry = getUsersRegistry();
    const emailKey = currentSession.user.email.toLowerCase();
    const entry = registry[emailKey];

    if (!entry) return null;

    const mergedUser: UserAccount = {
      ...entry.user,
      ...updatedUser,
      id: entry.user.id, // Prevent altering ID
      role: entry.user.role, // Prevent privilege escalation
      email: entry.user.email,
    };

    registry[emailKey] = {
      ...entry,
      user: mergedUser,
    };

    saveUsersRegistry(registry);
    this.setSession(mergedUser);
    return mergedUser;
  },

  // Address management for customer
  addAddress(address: Omit<SavedAddress, 'id'>): SavedAddress[] {
    const current = this.getCurrentSession();
    if (!current) return [];

    const newAddr: SavedAddress = {
      ...address,
      id: `addr-${Date.now()}`,
    };

    const existing = current.user.savedAddresses || [];
    let updated = [...existing];
    if (newAddr.isDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: false }));
    }
    updated.push(newAddr);

    this.updateUserProfile({ savedAddresses: updated });
    return updated;
  },

  deleteAddress(addressId: string): SavedAddress[] {
    const current = this.getCurrentSession();
    if (!current) return [];

    const existing = current.user.savedAddresses || [];
    const updated = existing.filter((a) => a.id !== addressId);
    this.updateUserProfile({ savedAddresses: updated });
    return updated;
  },

  // Logout
  logout() {
    try {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } catch {
      // ignore
    }
  },

  // Get all registered users (for Admin Directory)
  getAllUsers(): UserAccount[] {
    const registry = getUsersRegistry();
    return Object.values(registry).map((item) => item.user);
  }
};

