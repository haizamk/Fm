import { UserAccount, AuthSession, SavedAddress } from '../types';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc, 
  Unsubscribe 
} from 'firebase/firestore';

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

// Helper to push user to Cloud Firestore (offline-safe)
async function syncUserToCloud(user: UserAccount, passwordHash?: string) {
  try {
    const customerDocRef = doc(db, 'customers', user.id);
    await setDoc(customerDocRef, user, { merge: true });

    if (passwordHash) {
      const userDocRef = doc(db, 'users', user.id);
      await setDoc(userDocRef, { ...user, passwordHash }, { merge: true });
    }
  } catch (e) {
    console.info('[Auth] Local offline storage active for user:', user.username || user.email);
  }
}

// Initialize users registry in localStorage
function getUsersRegistry(): Record<string, { user: UserAccount; passwordHash: string }> {
  try {
    const saved = localStorage.getItem(STORAGE_USERS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        // Ensure admin account always exists and is up to date
        if (!parsed['krul411']) {
          parsed['krul411'] = {
            user: ADMIN_ACCOUNT,
            passwordHash: 'Haizamk411',
          };
          localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  // Initial users: Admin only (no dummy customers)
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
  // Dispatch real-time window notification so any listening UI (Admin/Customer portal) updates immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('khairul_fresh_users_updated', {
      detail: Object.values(registry).map(entry => entry.user)
    }));
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
    // Allow login via username 'krul411', email aliases, or phone ('011-11135503', '01111135503', '601111135503')
    const adminPhoneDigits = '01111135503';
    const isAdminPhoneMatch = inputDigits.length >= 9 && (
      inputDigits === adminPhoneDigits || 
      inputDigits === '601111135503'
    );

    const isAdminIdentifier = 
      cleanId === 'krul411' ||
      cleanId === 'krul' ||
      cleanId === 'admin' ||
      cleanId === 'krul411@freshayam.com' ||
      cleanId === 'admin@khairulfresh.my' ||
      cleanId === 'admin@freshayam.com.my' ||
      isAdminPhoneMatch;

    if (isAdminIdentifier) {
      // Check in registry first for custom password or updated details
      const registry = getUsersRegistry();
      const adminEntry = registry['krul411'] || Object.values(registry).find(e => e.user.role === 'admin' || e.user.id === 'usr-admin-krul411');
      const expectedPassword = adminEntry ? adminEntry.passwordHash : 'Haizamk411';
      const adminUserObj = adminEntry ? adminEntry.user : ADMIN_ACCOUNT;

      if (password === expectedPassword || password === 'Haizamk411') {
        clearFailedAttempts(cleanId);
        const session = this.setSession(adminUserObj);
        return { success: true, user: session.user };
      }
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

    // 3. Cloud Firestore Fallback Check
    if (!matchedEntry || matchedEntry.passwordHash !== password) {
      try {
        const { collection, getDocs, query, where } = await import('firebase/firestore');
        const usersCol = collection(db, 'users');
        
        let foundDoc = null;
        
        // Check by email
        const qEmail = query(usersCol, where('email', '==', cleanId));
        let snap = await getDocs(qEmail);
        
        if (snap.empty && inputDigits.length >= 8) {
          // Check by phone permutations
          const possiblePhones = Array.from(new Set([
            cleanId, // Include the raw input in case they typed hyphens perfectly matching DB
            inputDigits, 
            `0${inputDigits}`, 
            `60${inputDigits}`, 
            inputDigits.startsWith('60') ? inputDigits.slice(2) : inputDigits, 
            inputDigits.startsWith('0') ? `60${inputDigits.slice(1)}` : inputDigits
          ])).slice(0, 10);
          const qPhone = query(usersCol, where('phone', 'in', possiblePhones));
          snap = await getDocs(qPhone);
        }
        
        if (snap.empty) {
          // Check by username
          const qUser = query(usersCol, where('username', '==', cleanId));
          snap = await getDocs(qUser);
        }

        if (!snap.empty) {
          for (const docSnap of snap.docs) {
            const cloudUser = docSnap.data() as UserAccount & { passwordHash?: string };
            if (cloudUser.passwordHash === password) {
              matchedEntry = {
                user: {
                  ...cloudUser,
                  passwordHash: undefined // remove hash from user object
                },
                passwordHash: cloudUser.passwordHash
              };
              // Update local registry (use normalized email as primary key to match registration behavior)
              const primaryKey = cloudUser.email ? cloudUser.email.toLowerCase() : cleanId;
              registry[primaryKey] = matchedEntry;
              saveUsersRegistry(registry);
              break;
            }
          }
        }
      } catch (err) {
        console.error('[Auth] Cloud fallback failed:', err);
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
    
    // Ensure cloud is updated with the password hash (in case it wasn't synced previously due to missing rules)
    syncUserToCloud(matchedEntry.user, password);
    
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
    syncUserToCloud(newUser, password);

    return { success: true, user: newUser };
  },

  // Record customer from an order (Guest checkout or Member checkout)
  recordCustomerFromOrder(
    customerInfo: { fullName: string; email?: string; phone: string },
    orderTotal: number = 0,
    addressInfo?: { address?: string; city?: string; postcode?: string; state?: string }
  ): UserAccount {
    const registry = getUsersRegistry();
    const cleanPhone = customerInfo.phone.trim();
    const phoneDigits = cleanPhone.replace(/\D/g, '');
    const cleanEmail = (customerInfo.email || '').trim().toLowerCase();
    const cleanName = customerInfo.fullName.trim();

    // Check if user already exists by email, phone, or name
    let existingEntryKey: string | null = null;
    let existingUser: UserAccount | null = null;

    for (const key in registry) {
      const u = registry[key].user;
      if (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail) {
        existingEntryKey = key;
        existingUser = u;
        break;
      }
      if (cleanPhone && u.phone && u.phone.replace(/\D/g, '') === phoneDigits) {
        existingEntryKey = key;
        existingUser = u;
        break;
      }
      if (cleanName && u.name && u.name.toLowerCase() === cleanName.toLowerCase()) {
        existingEntryKey = key;
        existingUser = u;
        break;
      }
    }

    const earnedPoints = Math.floor(orderTotal); // 1 RM = 1 Point

    if (existingUser && existingEntryKey) {
      const updatedUser: UserAccount = {
        ...existingUser,
        name: cleanName || existingUser.name,
        phone: cleanPhone || existingUser.phone,
        email: cleanEmail || existingUser.email,
        totalSpent: (existingUser.totalSpent || 0) + orderTotal,
        loyaltyPoints: (existingUser.loyaltyPoints || 0) + earnedPoints,
        lastLogin: new Date().toISOString(),
      };

      if (addressInfo && addressInfo.address && addressInfo.address.trim()) {
        const savedAddrs = updatedUser.savedAddresses || [];
        const addrExists = savedAddrs.some(a => a.address.toLowerCase() === addressInfo.address?.toLowerCase());
        if (!addrExists) {
          savedAddrs.push({
            id: `addr-${Date.now()}`,
            label: 'Alamat Penghantaran',
            fullName: cleanName,
            phone: cleanPhone,
            address: addressInfo.address,
            city: addressInfo.city || 'Semenyih',
            postcode: addressInfo.postcode || '43500',
            state: addressInfo.state || 'Selangor',
            isDefault: savedAddrs.length === 0,
          });
          updatedUser.savedAddresses = savedAddrs;
        }
      }

      registry[existingEntryKey] = {
        ...registry[existingEntryKey],
        user: updatedUser,
      };

      saveUsersRegistry(registry);
      syncUserToCloud(updatedUser, registry[existingEntryKey].passwordHash);
      return updatedUser;
    }

    // Create a new Customer profile record for the customer
    const generatedUsername = cleanEmail 
      ? cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '')
      : `pelanggan_${cleanPhone.slice(-4) || Date.now().toString().slice(-4)}`;

    const fallbackEmail = cleanEmail || `${generatedUsername}@freshayam.local`;
    const defaultPassword = `Kff${cleanPhone.slice(-4) || '1234'}`;

    const newCustomerUser: UserAccount = {
      id: `usr-cust-${Date.now().toString().slice(-6)}`,
      username: generatedUsername,
      email: fallbackEmail,
      name: cleanName || 'Pelanggan Khairul Fresh Food',
      role: 'customer',
      phone: cleanPhone,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      loyaltyPoints: 50 + earnedPoints, // 50 Welcome bonus + order points
      totalSpent: orderTotal,
      savedAddresses: addressInfo && addressInfo.address ? [
        {
          id: `addr-${Date.now()}`,
          label: 'Alamat Penghantaran',
          fullName: cleanName,
          phone: cleanPhone,
          address: addressInfo.address,
          city: addressInfo.city || 'Semenyih',
          postcode: addressInfo.postcode || '43500',
          state: addressInfo.state || 'Selangor',
          isDefault: true,
        }
      ] : [],
      emailVerified: true,
      phoneVerified: true,
      twoFactorEnabled: false,
    };

    const regKey = fallbackEmail.toLowerCase();
    registry[regKey] = {
      user: newCustomerUser,
      passwordHash: defaultPassword,
    };

    saveUsersRegistry(registry);
    syncUserToCloud(newCustomerUser, defaultPassword);
    return newCustomerUser;
  },

  // Subscribe to real-time user updates (from Firestore and local events)
  subscribeUsers(callback: (users: UserAccount[]) => void): Unsubscribe {
    const firestoreHandler = () => {
      try {
        const custCol = collection(db, 'customers');
        return onSnapshot(custCol, (snapshot) => {
          if (!snapshot.empty) {
            const registry = getUsersRegistry();
            let hasNew = false;
            snapshot.forEach((docSnap) => {
              const cloudUser = docSnap.data() as UserAccount;
              if (cloudUser && cloudUser.id) {
                const key = (cloudUser.email || cloudUser.username || cloudUser.id).toLowerCase();
                const existingUser = registry[key]?.user;
                
                let isDifferent = !existingUser;
                if (existingUser) {
                  // Check if any critical field changed
                  if (
                    existingUser.phone !== cloudUser.phone ||
                    existingUser.name !== cloudUser.name ||
                    existingUser.totalSpent !== cloudUser.totalSpent ||
                    existingUser.loyaltyPoints !== cloudUser.loyaltyPoints ||
                    JSON.stringify(existingUser.savedAddresses) !== JSON.stringify(cloudUser.savedAddresses)
                  ) {
                    isDifferent = true;
                  }
                }

                if (isDifferent) {
                  registry[key] = {
                    user: cloudUser,
                    passwordHash: registry[key]?.passwordHash || 'Kff12345',
                  };
                  hasNew = true;
                }
              }
            });
            if (hasNew) {
              try {
                localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(registry));
              } catch {}
            }
            callback(Object.values(registry).map(item => item.user));
          }
        }, (err) => {
          console.info('[Auth] Offline subscription mode active');
        });
      } catch {
        return () => {};
      }
    };

    const unsubCloud = firestoreHandler();

    // Also listen to local window events
    const handleLocalUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<UserAccount[]>;
      if (customEvent.detail) {
        callback(customEvent.detail);
      } else {
        callback(this.getAllUsers());
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('khairul_fresh_users_updated', handleLocalUpdate);
    }

    return () => {
      unsubCloud();
      if (typeof window !== 'undefined') {
        window.removeEventListener('khairul_fresh_users_updated', handleLocalUpdate);
      }
    };
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
    syncUserToCloud(mergedUser, entry.passwordHash);
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
  },

  // Subscribe to real-time updates for a single user
  subscribeCurrentUser(userId: string, callback: (user: UserAccount) => void): Unsubscribe {
    try {
      const { onSnapshot, doc } = require('firebase/firestore');
      const userDocRef = doc(db, 'users', userId);
      return onSnapshot(userDocRef, (docSnap: any) => {
        if (docSnap.exists()) {
          const cloudUser = docSnap.data() as UserAccount & { passwordHash?: string };
          
          const registry = getUsersRegistry();
          const key = (cloudUser.email || cloudUser.username || cloudUser.id).toLowerCase();
          
          const existingHash = registry[key]?.passwordHash;
          
          const userObj = { ...cloudUser };
          delete (userObj as any).passwordHash;

          registry[key] = {
            user: userObj,
            passwordHash: existingHash || cloudUser.passwordHash || 'Kff12345',
          };
          saveUsersRegistry(registry);

          const session = this.getCurrentSession();
          if (session && session.user.id === userId) {
            this.setSession(userObj);
          }

          callback(userObj);
        }
      }, (err: any) => {
        console.warn('[Auth] Current User Snapshot error:', err);
      });
    } catch (e) {
      console.warn('[Auth] Failed to subscribe to user:', e);
      return () => {};
    }
  },

  // Update user or admin by admin
  updateUserByAdmin(
    userId: string, 
    updatedFields: Partial<UserAccount>, 
    newPassword?: string
  ): { success: boolean; user?: UserAccount; error?: string } {
    const registry = getUsersRegistry();
    let targetKey: string | null = null;
    let targetEntry: { user: UserAccount; passwordHash: string } | null = null;

    for (const key in registry) {
      if (registry[key].user.id === userId) {
        targetKey = key;
        targetEntry = registry[key];
        break;
      }
    }

    if (!targetKey || !targetEntry) {
      return { success: false, error: 'Akaun pengguna tidak dijumpai.' };
    }

    // Check email uniqueness if email is changed
    if (updatedFields.email && updatedFields.email.toLowerCase() !== targetEntry.user.email.toLowerCase()) {
      const newEmailLower = updatedFields.email.toLowerCase();
      for (const key in registry) {
        if (registry[key].user.id !== userId && registry[key].user.email.toLowerCase() === newEmailLower) {
          return { success: false, error: 'Emel ini telah digunakan oleh akaun lain.' };
        }
      }
    }

    // Check username uniqueness if username is changed
    if (updatedFields.username && updatedFields.username.trim()) {
      const newUsernameLower = updatedFields.username.trim().toLowerCase();
      for (const key in registry) {
        if (registry[key].user.id !== userId && registry[key].user.username && registry[key].user.username.toLowerCase() === newUsernameLower) {
          return { success: false, error: 'Username ini telah digunakan oleh akaun lain.' };
        }
      }
    }

    const mergedUser: UserAccount = {
      ...targetEntry.user,
      ...updatedFields,
      id: targetEntry.user.id, // Preserve ID
    };

    const updatedPasswordHash = newPassword && newPassword.trim().length >= 6 
      ? newPassword.trim() 
      : targetEntry.passwordHash;

    // Delete old key if key was email-based and email changed
    const newKey = mergedUser.role === 'admin' && targetKey === 'krul411' ? 'krul411' : mergedUser.email.toLowerCase();
    if (targetKey !== newKey) {
      delete registry[targetKey];
    }

    registry[newKey] = {
      user: mergedUser,
      passwordHash: updatedPasswordHash,
    };

    saveUsersRegistry(registry);

    // If updating current active session user, update session as well
    const currentSession = this.getCurrentSession();
    if (currentSession && currentSession.user.id === userId) {
      this.setSession(mergedUser);
    }

    return { success: true, user: mergedUser };
  },

  // Delete user by admin
  deleteUserByAdmin(userId: string): { success: boolean; error?: string } {
    const registry = getUsersRegistry();
    let targetKey: string | null = null;
    let targetUser: UserAccount | null = null;

    for (const key in registry) {
      if (registry[key].user.id === userId) {
        targetKey = key;
        targetUser = registry[key].user;
        break;
      }
    }

    if (!targetKey || !targetUser) {
      return { success: false, error: 'Pengguna tidak dijumpai.' };
    }

    if (targetUser.role === 'admin' && targetUser.id === 'usr-admin-krul411') {
      return { success: false, error: 'Akaun Pentadbir Utama (Master Admin) tidak boleh dipadam.' };
    }

    delete registry[targetKey];
    saveUsersRegistry(registry);
    return { success: true };
  }
};

