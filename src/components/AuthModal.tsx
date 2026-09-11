import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { UserRole, UserAccount } from '../types';
import { authService, checkRateLimit } from '../services/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'customer',
  onLoginSuccess,
}) => {
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = calculatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (authMode === 'login') {
        const result = await authService.login(email, password);

        if (result.success && result.user) {
          setSuccessMessage(`Selamat kembali, ${result.user.name}!`);
          setTimeout(() => {
            onLoginSuccess(result.user!);
            onClose();
          }, 450);
        } else {
          setErrorMessage(result.error || (role === 'admin' ? 'ID Pengguna atau kata laluan pentadbir tidak sah.' : 'Log masuk gagal. Sila semak emel dan kata laluan anda.'));
        }
      } else {
        // Registration mode (Customers)
        if (!name.trim()) {
          setErrorMessage('Sila masukkan nama penuh anda.');
          setIsLoading(false);
          return;
        }
        if (!phone.trim()) {
          setErrorMessage('Sila masukkan nombor WhatsApp yang sah.');
          setIsLoading(false);
          return;
        }
        if (!email.trim() || !email.includes('@')) {
          setErrorMessage('Sila masukkan alamat emel yang sah.');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMessage('Kata laluan sekurang-kurangnya 6 aksara.');
          setIsLoading(false);
          return;
        }

        const regResult = await authService.register(
          name.trim(),
          email.trim(),
          phone.trim(),
          password,
          { emailVerified: true, phoneVerified: true, twoFactorEnabled: false }
        );

        if (regResult.success && regResult.user) {
          setSuccessMessage(`Akaun berjaya didaftarkan! Selamat datang, ${regResult.user.name}.`);
          setTimeout(() => {
            onLoginSuccess(regResult.user!);
            onClose();
          }, 500);
        } else {
          setErrorMessage(regResult.error || 'Pendaftaran akaun gagal. Sila cuba lagi.');
        }
      }
    } catch {
      setErrorMessage('Ralat sambungan. Sila cuba sebentar lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const lockStatus = checkRateLimit(email);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-6"
        role="dialog"
      >
        {/* Header with gradient accent */}
        <div className={`p-5 sm:p-6 text-white flex items-center justify-between transition-colors ${
          role === 'admin' 
            ? 'bg-gradient-to-r from-stone-900 via-indigo-950 to-stone-900 border-b border-indigo-900/50' 
            : 'bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 border-b border-emerald-900/50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner ${
              role === 'admin' ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/40' : 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
            }`}>
              {role === 'admin' ? <Lock className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  {role === 'admin' ? 'Portal Pengurusan Admin' : 'Portal Pelanggan Segar'}
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 border border-white/30 tracking-wider">
                  SSL Selamat
                </span>
              </div>
              <p className="text-xs text-stone-300">
                {role === 'admin' ? 'Akses Pentadbir Khairul FRESH Food' : 'Log Masuk atau Daftar Akaun'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role & Auth Mode Switcher */}
        <div className="p-4 sm:p-6 pb-2 space-y-4">
          
          {/* Role Toggle */}
          <div className="bg-stone-100 dark:bg-stone-800/80 p-1 rounded-2xl flex border border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={() => {
                setRole('customer');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                role === 'customer'
                  ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-300 shadow-xs ring-1 ring-stone-200 dark:ring-stone-700'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Pelanggan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('admin');
                setAuthMode('login'); // Admin is login only
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                role === 'admin'
                  ? 'bg-white dark:bg-stone-900 text-indigo-700 dark:text-indigo-300 shadow-xs ring-1 ring-stone-200 dark:ring-stone-700'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Pentadbir (Admin)</span>
            </button>
          </div>

          {/* Login / Register tabs for Customer */}
          {role === 'customer' && (
            <div className="flex border-b border-stone-200 dark:border-stone-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage('');
                }}
                className={`flex-1 pb-2.5 font-bold border-b-2 text-center transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                Log Masuk Akaun
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage('');
                }}
                className={`flex-1 pb-2.5 font-bold border-b-2 text-center transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                Daftar Pelanggan Baru (+50 Mata)
              </button>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 pt-2 space-y-3.5 text-stone-800 dark:text-stone-200">
          
          {/* Rate limit lockout warning */}
          {lockStatus.isLocked && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Akaun disekat sementara demi keselamatan.</strong> Sila tunggu {lockStatus.waitSeconds} saat sebelum mencuba semula.
              </div>
            </div>
          )}

          {/* Alerts */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* REGISTRATION FORM FIELDS */}
          {authMode === 'register' && role === 'customer' && (
            <>
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Nama Penuh
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder=""
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Nombor Telefon (WhatsApp)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder=""
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </>
          )}

          {/* Identifier (Login/Email) input */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              {role === 'admin' ? 'ID Pengguna Admin' : 'Alamat Emel'}
            </label>
            <div className="relative">
              {role === 'admin' ? (
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              ) : (
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              )}
              <input
                type={role === 'admin' ? 'text' : 'email'}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Kata Laluan
              </label>
              {authMode === 'register' && (
                <span className="text-[10px] text-stone-500">Min. 6 aksara</span>
              )}
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                title={showPassword ? 'Sembunyi kata laluan' : 'Papar kata laluan'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength visual bar in register mode */}
            {authMode === 'register' && password && (
              <div className="mt-1.5 space-y-1">
                <div className="flex gap-1 h-1.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`flex-1 rounded-full transition-colors ${
                        strengthScore >= lvl
                          ? strengthScore <= 2
                            ? 'bg-rose-500'
                            : strengthScore <= 3
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                          : 'bg-stone-200 dark:bg-stone-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 text-right">
                  Kekuatan: {strengthScore <= 2 ? 'Lemah' : strengthScore <= 3 ? 'Sederhana' : 'Kukuh & Selamat'}
                </p>
              </div>
            )}
          </div>

          {/* Direct Submit Button */}
          <button
            type="submit"
            disabled={isLoading || lockStatus.isLocked}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
              role === 'admin'
                ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-900/20'
                : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-900/20'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <span>Mengesahkan Maklumat...</span>
            ) : authMode === 'login' ? (
              <>
                <span>Log Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Daftar Akaun Baharu</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Security Guarantee Microtext */}
          <div className="pt-2 text-center text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Semua data pengguna dienkripsi secara selamat mengikut PDPA Malaysia.</span>
          </div>
        </form>
      </div>
    </div>
  );
};

