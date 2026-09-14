import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User,
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { UserAccount } from '../types';
import { authService, checkRateLimit } from '../services/auth';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const result = await authService.login(identifier, password);

      if (result.success && result.user) {
        if (result.user.role !== 'admin') {
          setErrorMessage('Akaun ini bukan akaun pentadbir (admin). Sila log masuk melalui Portal Pelanggan.');
          setIsLoading(false);
          return;
        }

        setSuccessMessage(`Selamat kembali, Pentadbir ${result.user.name}!`);
        setTimeout(() => {
          onLoginSuccess(result.user!);
          onClose();
        }, 450);
      } else {
        setErrorMessage(result.error || 'Username, emel, no. telefon atau kata laluan tidak sah.');
      }
    } catch {
      setErrorMessage('Ralat sambungan. Sila cuba sebentar lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const lockStatus = checkRateLimit(identifier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-indigo-900/40 dark:border-indigo-800/60 overflow-hidden my-6"
        role="dialog"
      >
        {/* Header with gradient accent */}
        <div className="p-5 sm:p-6 text-white flex items-center justify-between bg-gradient-to-r from-stone-900 via-indigo-950 to-stone-900 border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight font-['Outfit']">
                  Portal Pentadbir (Admin)
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 tracking-wider">
                  Admin Sahaja
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Akses Pengurusan Khairul Fresh Food
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-stone-800 dark:text-stone-200">
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

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Username, Emel atau No. Telefon Pentadbir
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Cth: krul411 / 011-11135503 / emel"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Boleh masukkan username (<strong>krul411</strong>), nombor telefon, atau emel.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Kata Laluan Pentadbir
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
          </div>

          <button
            type="submit"
            disabled={isLoading || lockStatus.isLocked}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-900/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span>Mengesahkan Akses Pentadbir...</span>
            ) : (
              <>
                <span>Log Masuk Pentadbir</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-2 text-center text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Kawasan kawalan keselamatan tinggi pentadbir sistem.</span>
          </div>
        </form>
      </div>
    </div>
  );
};
