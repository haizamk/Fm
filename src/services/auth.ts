import { UserAccount, AuthSession, SavedAddress } from '../types';

// Admin Account Configuration
export const ADMIN_ACCOUNT: UserAccount = {
  id: 'usr-admin-krul411',
  username: 'krul411',
  email: 'krul411@freshayam.com',
  name: 'Encik Khairul (Admin)',
  role: 'admin',
  phone: '011-11135503',
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

  // Login via Email, Username, or Phone Number
  async login(
    identifier: string,
    password: string
  ): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    const cleanInput = (identifier || '').trim();
    const cleanId = cleanInput.toLowerCase();
    const inputDigits = cleanInput.replace(/\D/g, '');
    
    if (!cleanId) {
      return {
        success: false,
        error: 'Sila masukkan username, emel atau nombor telefon anda.',
      };
    }

    // Check rate limit
    const lock = checkRateLimit(cleanId);
    if (lock.isLocked) {
      return {
        success: false,
        error: `Akaun disekat sementara demi keselamatan. Sila cuba lagi dalam ${lock.waitSeconds} saat.`,
      };
    }

    // 1. Admin Authentication Check:
    // Allow login via username 'krul411', email aliases, or phone ('011-11135503', '01111135503', '601111135503', '011-2856 8920')
    const adminPhoneDigits = '01111135503';
    const isAdminPhoneMatch = inputDigits.length >= 9 && (
      inputDigits === adminPhoneDigits || 
      inputDigits === '601111135503' || 
      inputDigits === '01128568920' || 
      inputDigits === '601128568920'
    );

    const isAdminIdentifier = 
      cleanId === 'krul411' ||
      cleanId === 'krul' ||
      cleanId === 'admin' ||
      cleanId === 'krul411@freshayam.com' ||
      cleanId === 'admin@khairulfresh.my' ||
      cleanId === 'admin@freshayam.com.my' ||
      isAdminPhoneMatch;

    if (isAdminIdentifier && password === 'Haizamk411') {
      clearFailedAttempts(cleanId);
      const session = this.setSession(ADMIN_ACCOUNT);
      return { success: true, user: session.user };
    }

    // 2. Customer User Registry Check (Search by Email, Username, or Phone)
    const registry = getUsersRegistry();
    let matchedEntry: { user: UserAccount; passwordHash: string } | undefined;

    // First direct lookup by registry key
    if (registry[cleanId]) {
      matchedEntry = registry[cleanId];
    } else {
      // Scan all entries
      for (const key in registry) {
        const entry = registry[key];
        const u = entry.user;
        
        // Match by Email
        if (u.email && u.email.toLowerCase() === cleanId) {
          matchedEntry = entry;
          break;
        }

        // Match by Username
        if (u.username && u.username.toLowerCase() === cleanId) {
          matchedEntry = entry;
          break;
        }

        // Match by Phone Number
        if (u.phone && inputDigits.length >= 8) {
          const userPhoneDigits = u.phone.replace(/\D/g, '');
          if (
            userPhoneDigits === inputDigits ||
            (userPhoneDigits.startsWith('0') && ('60' + userPhoneDigits.slice(1)) === inputDigits) ||
            (inputDigits.startsWith('0') && ('60' + inputDigits.slice(1)) === userPhoneDigits) ||
            userPhoneDigits.endsWith(inputDigits) ||
            inputDigits.endsWith(userPhoneDigits)
          ) {
            matchedEntry = entry;
            break;
          }
        }
      }
    }

    if (!matchedEntry || matchedEntry.passwordHash !== password) {
      recordFailedAttempt(cleanId);
      return {
        success: false,
        error: 'Username, emel, nombor telefon atau kata laluan tidak sah. Sila semak semula.',
      };
    }

    clearFailedAttempts(cleanId);
    const session = this.setSession(matchedEntry.user);
    return { success: true, user: session.user };
  },

  // Register Customer (With Username, Email, Phone, Name, Password)
  async register(
    name: string,
    email: string,
    phone: string,
    password: string,
    username?: string,
    options?: { emailVerified?: boolean; phoneVerified?: boolean; twoFactorEnabled?: boolean }
  ): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanUsername = (username || '').trim().toLowerCase().replace(/^@/, '');
    const cleanPhone = phone.trim();
    const phoneDigits = cleanPhone.replace(/\D/g, '');
    const registry = getUsersRegistry();

    // Check username validation
    if (cleanUsername) {
      if (cleanUsername.length < 3) {
        return {
          success: false,
          error: 'Username mestilah sekurang-kurangnya 3 aksara.',
        };
      }
      if (cleanUsername === 'krul411' || cleanUsername === 'admin' || cleanUsername === 'root') {
        return {
          success: false,
          error: 'Username ini adalah terpelihara untuk pentadbir sistem. Sila pilih username lain.',
        };
      }
    }

    // Check if email or username already exists in registry
    if (registry[normalizedEmail] || normalizedEmail === 'krul411' || normalizedEmail === 'krul411@freshayam.com') {
      return {
        success: false,
        error: 'Alamat emel ini telah pun didaftarkan. Sila log masuk atau gunakan emel lain.',
      };
    }

    for (const key in registry) {
      const entry = registry[key];
      const u = entry.user;
      
      if (cleanUsername && u.username && u.username.toLowerCase() === cleanUsername) {
        return {
          success: false,
          error: `Username "${cleanUsername}" telah digunakan. Sila pilih username lain.`,
        };
      }

      if (u.email && u.email.toLowerCase() === normalizedEmail) {
        return {
          success: false,
          error: 'Alamat emel ini telah pun didaftarkan. Sila log masuk.',
        };
      }

      if (u.phone && phoneDigits && u.phone.replace(/\D/g, '') === phoneDigits) {
        return {
          success: false,
          error: 'Nombor telefon ini telah pun didaftarkan dengan akaun lain.',
        };
      }
    }

    if (password.length < 6) {
      return {
        success: false,
        error: 'Kata laluan mestilah sekurang-kurangnya 6 aksara.',
      };
    }

    // Auto-generate a clean username fallback if omitted
    const finalUsername = cleanUsername || normalizedEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || `user${Date.now().toString().slice(-4)}`;

    const newUser: UserAccount = {
      id: `usr-cust-${Date.now().toString().slice(-6)}`,
      username: finalUsername,
      email: normalizedEmail,
      name: name.trim(),
      role: 'customer',
      phone: cleanPhone,
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

