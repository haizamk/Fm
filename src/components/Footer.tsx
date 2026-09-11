import React from 'react';
import { 
  ShieldCheck, 
  PhoneCall, 
  Mail, 
  MapPin, 
  Truck, 
  Clock, 
  Sparkles, 
  Heart, 
  Sun, 
  Moon, 
  Store,
  Lock
} from 'lucide-react';
import { GoogleMapsSection } from './GoogleMapsSection';

interface FooterProps {
  onOpenCoverage: () => void;
  onOpenCalculator: () => void;
  onOpenRecipes: () => void;
  onOpenTracking: () => void;
  onOpenWhatsApp: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAdminPortal?: () => void;
  onOpenAuth?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenCoverage,
  onOpenCalculator,
  onOpenRecipes,
  onOpenTracking,
  onOpenWhatsApp,
  isDarkMode,
  onToggleDarkMode,
  onOpenAdminPortal,
  onOpenAuth,
}) => {
  return (
    <footer className="bg-stone-950 text-stone-300 pt-12 pb-8 border-t border-stone-800 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-stone-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                🐔
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-white tracking-tight font-['Outfit']">
                  Khairul <span className="text-emerald-400">FRESH Food</span>
                </span>
                <span className="text-[11px] text-stone-400 font-medium">
                  Ayam Segar Terus Dari Pasar Semenyih • Halal Dijamin
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Khairul FRESH Food membekalkan ayam segar terus dari Gerai Ayam No 59, Pasar Sementara Semenyih. Pilihan penghantaran pantas ke rumah di Semenyih, Beranang dan Kajang atau ambil sendiri (Self-Pickup) tanpa sebarang caj.
            </p>

            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Halal Diiktiraf & Bersih</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Khidmat & Alat Kami
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button
                  onClick={onOpenCalculator}
                  className="hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  Kalkulator Kenduri & Jamuan
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCoverage}
                  className="hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  Semakan Liputan Poskod (43500, 43700, 43000)
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenRecipes}
                  className="hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  Koleksi Resepi & Petua Simpan
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTracking}
                  className="hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  Jejak Status Pesanan
                </button>
              </li>
              {onOpenAdminPortal && (
                <li className="pt-1 border-t border-stone-800/80">
                  <button
                    onClick={onOpenAdminPortal}
                    className="text-stone-400 hover:text-indigo-400 font-bold transition-colors text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <Lock className="w-3 h-3 text-indigo-400" />
                    <span>Portal Pentadbir (Admin)</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Delivery Hours & Coverage */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Waktu Operasi Pasar Semenyih
            </h4>
            <div className="space-y-2 text-stone-400 leading-relaxed">
              <div className="flex items-start gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Selasa – Ahad: 7:00 AM – 12:00 Tengah Hari</span>
              </div>
              <div className="flex items-start gap-1.5 text-amber-400 font-bold">
                <Store className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>Isnin: Tutup (Cuti Operasi Pasar)</span>
              </div>
              <div className="flex items-start gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Penghantaran Segar Setiap Pagi & Petang</span>
              </div>
              <div className="text-[11px] text-stone-500 pt-1">
                Zon Liputan: Semenyih (43500), Beranang (43700), Kajang (43000).
              </div>
            </div>
          </div>

          {/* Contact Hotline */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Hubungi & Lokasi
            </h4>
            <div className="space-y-2 text-stone-400">
              <button
                onClick={onOpenWhatsApp}
                className="w-full bg-emerald-700/50 hover:bg-emerald-700 text-emerald-200 hover:text-white p-2.5 rounded-xl border border-emerald-600/50 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>WhatsApp: 011-11135503</span>
              </button>
              <div className="flex items-center gap-2 text-stone-400">
                <Mail className="w-3.5 h-3.5 text-stone-500" />
                <span>support@freshmarket.my</span>
              </div>
              <div className="flex items-start gap-2 text-stone-400">
                <MapPin className="w-3.5 h-3.5 text-stone-500 mt-0.5 shrink-0" />
                <span>Gerai Ayam No 59, Pasar Sementara Semenyih, 43500 Semenyih, Selangor</span>
              </div>
            </div>
          </div>

        </div>

        {/* Interactive Google Maps Component for GA 59 Pasar Semenyih */}
        <GoogleMapsSection onOpenWhatsApp={onOpenWhatsApp} />

        {/* Bottom Bar: Legal & Dark/Light Mode Switcher */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500 text-[11px]">
          
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span>
              © {new Date().getFullYear()} Khairul FRESH Food. Hak Cipta Terpelihara.
            </span>
            <div className="hidden sm:flex items-center gap-3">
              <span>•</span>
              <span className="hover:text-stone-300 transition-colors cursor-pointer">Privasi & Keselamatan</span>
              <span>•</span>
              <span className="hover:text-stone-300 transition-colors cursor-pointer">Terma Jualan Pasar Semenyih</span>
              <span>•</span>
              <span className="hover:text-stone-300 transition-colors cursor-pointer">100% Halal Diiktiraf</span>
            </div>
          </div>

          {/* Theme Toggle Button in Footer */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-stone-400 font-medium text-xs">
              Pilihan Tema:
            </span>
            <button
              onClick={onToggleDarkMode}
              aria-label={isDarkMode ? "Tukar ke Tema Cerah (Light Mode)" : "Tukar ke Tema Gelap (Dark Mode)"}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 transition-all cursor-pointer shadow-xs group"
              title={isDarkMode ? "Aktifkan Mod Cerah" : "Aktifkan Mod Gelap"}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
                  <span className="text-xs font-bold text-amber-300">Mod Cerah</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400 group-hover:-rotate-12 transition-transform duration-300" />
                  <span className="text-xs font-bold text-stone-300">Mod Gelap</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
};
