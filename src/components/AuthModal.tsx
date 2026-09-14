import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Mail, 
  User, 
  Phone, 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  AtSign,
  Sparkles,
  Lightbulb,
  Shuffle
} from 'lucide-react';
import { UserAccount } from '../types';
import { authService, checkRateLimit } from '../services/auth';

const CUSTOMER_LOGIN_TIPS = [
  'Boleh log masuk menggunakan Username pilihan, alamat emel, atau nombor WhatsApp berdaftar.',
  'Log masuk untuk menyemak baki Mata Ganjaran terkini dan menebus baucar diskaun anda.',
  'Jejak status penyediaan ayam segar dan lokasi rider secara terus selepas log masuk.',
  'Simpan alamat penghantaran anda dalam profil untuk tempahan pantas 1-klik.',
  'Muat turun resit rasmi PDF dan semak sejarah belian anda pada bila-bila masa.',
  'Gunakan nombor WhatsApp berdaftar untuk kemas kini pesanan automatik.'
];

const CUSTOMER_REGISTER_TIPS = [
  'Daftar akaun percuma hari ini dan nikmati ganjaran +50 Mata Ganjaran serta-merta!',
  'Cipta Username ringkas (cth: amir99) untuk log masuk pantas tanpa perlu menaip emel panjang.',
  'Gunakan nombor WhatsApp aktif untuk menerima resit digital dan notifikasi rider.',
  'Kumpul mata bagi setiap kilogram ayam segar untuk potongan harga pesanan akan datang.',
  'Pilih dan simpan jenis potongan ayam kegemaran keluarga untuk pesanan ulangan.',
  'Ahli berdaftar menikmati tawaran promosi eksklusif dan diskaun mingguan.'
];

const RANDOM_USERNAMES = ['amir88', 'huda_segar', 'faizal_ayam', 'siti_fresh', 'zaki99', 'farid_kajang'];
const RANDOM_NAMES = ['Ahmad Faizal Bin Razak', 'Siti Nurul Huda', 'Mohd Amirul Syafiq', 'Noraini Binti Ismail', 'Muhammad Hafiz'];
const RANDOM_EMAILS = ['faizal@gmail.com', 'huda.siti@yahoo.com', 'amirul@outlook.com', 'noraini@gmail.com', 'hafiz.ayam@gmail.com'];

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Random Tips & Placeholders State
  const [randomLoginTip, setRandomLoginTip] = useState<string>('');
  const [randomRegisterTip, setRandomRegisterTip] = useState<string>('');
  const [placeholderUsername, setPlaceholderUsername] = useState('cth: amir88');
  const [placeholderName, setPlaceholderName] = useState('cth: Ahmad Bin Razak');
  const [placeholderEmail, setPlaceholderEmail] = useState('cth: nama@email.com');

  // Form fields
  const [identifier, setIdentifier] = useState(''); // for login (username / email / phone)
  const [username, setUsername] = useState(''); // for registration
  const [email, setEmail] = useState(''); // for registration
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Shuffle tips when opened or mode changed
  const randomizeTips = () => {
    const loginTip = CUSTOMER_LOGIN_TIPS[Math.floor(Math.random() * CUSTOMER_LOGIN_TIPS.length)];
    const regTip = CUSTOMER_REGISTER_TIPS[Math.floor(Math.random() * CUSTOMER_REGISTER_TIPS.length)];
    const rUser = RANDOM_USERNAMES[Math.floor(Math.random() * RANDOM_USERNAMES.length)];
    const rName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const rEmail = RANDOM_EMAILS[Math.floor(Math.random() * RANDOM_EMAILS.length)];

    setRandomLoginTip(loginTip);
    setRandomRegisterTip(regTip);
    setPlaceholderUsername(`cth: ${rUser}`);
    setPlaceholderName(`cth: ${rName}`);
    setPlaceholderEmail(`cth: ${rEmail}`);
  };

  useEffect(() => {
    if (isOpen) {
      randomizeTips();
    }
  }, [isOpen, authMode]);

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
        if (!identifier.trim()) {
          setErrorMessage('Sila masukkan username, emel atau nombor telefon anda.');
          setIsLoading(false);
          return;
        }

        const result = await authService.login(identifier, password);

        if (result.success && result.user) {
          setSuccessMessage(`Selamat kembali, ${result.user.name}!`);
          setTimeout(() => {
            onLoginSuccess(result.user!);
            onClose();
          }, 450);
        } else {
          setErrorMessage(result.error || 'Log masuk gagal. Sila semak username, emel atau kata laluan anda.');
        }
      } else {
        // Registration mode (Customers)
        if (!username.trim()) {
          setErrorMessage('Sila cipta username / ID pengguna pilihan anda.');
          setIsLoading(false);
          return;
        }
        if (username.trim().length < 3) {
          setErrorMessage('Username mestilah sekurang-kurangnya 3 aksara.');
          setIsLoading(false);
          return;
        }
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
          username.trim(),
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

  const lockStatus = checkRateLimit(authMode === 'login' ? identifier : email);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-6"
        role="dialog"
      >
        {/* Header with gradient accent */}
        <div className="p-5 sm:p-6 text-white flex items-center justify-between bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 border-b border-emerald-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner bg-emerald-600/30 text-emerald-400 border border-emerald-500/40">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight font-['Outfit']">
                  Portal Pelanggan
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 border border-white/30 tracking-wider">
                  SSL Selamat
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Log Masuk atau Daftar Akaun Pelanggan
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

        {/* Login / Register tabs for Customer */}
        <div className="p-4 sm:p-6 pb-2">
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

          {/* Randomized Tip Banner for Customer */}
          <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start justify-between gap-2.5 transition-all">
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="text-[11px] leading-relaxed text-emerald-900 dark:text-emerald-200">
                <span className="font-bold">Tip {authMode === 'login' ? 'Log Masuk' : 'Pendaftaran'}: </span>
                <span>{authMode === 'login' ? randomLoginTip : randomRegisterTip}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={randomizeTips}
              className="text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-1 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer shrink-0"
              title="Tukar tip rawak"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* LOGIN MODE IDENTIFIER */}
          {authMode === 'login' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Username, Emel atau No. Telefon
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={`${placeholderUsername.replace('cth: ', '')} / ${placeholderEmail.replace('cth: ', '')} / 012-3456789`}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>
          )}

          {/* REGISTRATION FORM FIELDS */}
          {authMode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Username / ID Pengguna
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={`${placeholderUsername} (pilihan anda)`}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

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
                    placeholder={placeholderName}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
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
                    placeholder="cth: 012-3456789 / 011-12345678"
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Alamat Emel
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={placeholderEmail}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {/* Password input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Kata Laluan
              </label>
              {authMode === 'login' && (
                <button
                  type="button"
                  onClick={() => alert('Sila hubungi khidmat pelanggan WhatsApp di 011-11135503 untuk bantuan penetapan semula kata laluan anda.')}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Lupa kata laluan?
                </button>
              )}
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
            className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-md shadow-emerald-900/20 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
