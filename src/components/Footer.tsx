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
  Lock,
  Search,
  ArrowRight
} from 'lucide-react';
import { GoogleMapsSection } from './GoogleMapsSection';
import { useLanguage } from '../context/LanguageContext';
import { getOperatingHoursStatus } from '../utils/operatingHours';

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
  onNavigateHome?: () => void;
  onNavigateProducts?: () => void;
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
  onNavigateHome,
  onNavigateProducts,
}) => {
  const { t, isEn } = useLanguage();
  const operatingStatus = getOperatingHoursStatus();

  return (
    <footer id="footer" className="bg-[#032b20] text-stone-300 pt-14 pb-8 border-t border-emerald-950 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Top 4-Column Grid matching reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-4 border-b border-emerald-900/30">
          
          {/* Column 1: Brand & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-black/30 shrink-0">
                🐔
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-extrabold text-white tracking-tight font-['Outfit'] leading-tight">
                  Khairul <span className="text-emerald-400">Fresh Food</span>
                </span>
                <span className="text-xs font-bold text-emerald-300 tracking-wider">
                  Ayam Halal Semenyih
                </span>
              </div>
            </div>

            <div className="inline-block px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700/60 text-emerald-200 text-[11px] font-black tracking-wide">
              Segar • Halal • Bermutu • Untuk Anda
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Membekalkan ayam segar terus dari Gerai GA 59, Pasar Awam Semenyih. Pilihan penghantaran ke rumah di Semenyih, Eco Majestic, Beranang dan Kajang atau ambil sendiri di pasar.
            </p>

            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Sembelihan Halal Syarak</span>
            </div>
          </div>

          {/* Column 2: Pautan Pantas */}
          <div className="space-y-3.5">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider font-['Outfit'] border-b border-emerald-800/80 pb-2">
              Pautan Pantas
            </h4>
            <ul className="space-y-2.5 text-stone-300 font-medium">
              <li>
                <button
                  onClick={() => {
                    if (onNavigateHome) onNavigateHome();
                    const el = document.getElementById('hero');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-300 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-emerald-500" />
                  <span>Home</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onNavigateProducts) onNavigateProducts();
                    const el = document.getElementById('featured-products');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-300 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-emerald-500" />
                  <span>Produk</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById('promo-service-row') || document.getElementById('featured-products');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-300 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-emerald-500" />
                  <span>Promo (RM9.90/kg)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenRecipes}
                  className="hover:text-emerald-300 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-emerald-500" />
                  <span>Resepi & Tips</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCoverage}
                  className="hover:text-emerald-300 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-emerald-500" />
                  <span>Semak Kawasan Penghantaran</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCalculator}
                  className="hover:text-emerald-300 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-emerald-500" />
                  <span>Kalkulator Kenduri & Jamuan</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTracking}
                  className="hover:text-emerald-300 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-emerald-500" />
                  <span>Jejak Pesanan</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Hubungi Kami & Operating Hours */}
          <div className="space-y-3.5">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider font-['Outfit'] border-b border-emerald-800/80 pb-2">
              Hubungi Kami
            </h4>
            
            <div className="space-y-3 text-stone-300">
              <button
                onClick={onOpenWhatsApp}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white p-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>011-1113 5503</span>
              </button>

              <div className="flex items-start gap-2.5 text-xs text-stone-300">
                <MapPin className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                <span>Gerai GA 59, Pasar Awam Semenyih, 43500 Semenyih, Selangor</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-stone-300">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>info@freshmarket.my</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-white uppercase">Status Hari Ini:</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    operatingStatus.isOpen ? 'bg-emerald-500 text-stone-950' : 'bg-rose-600 text-white'
                  }`}>
                    {operatingStatus.badgeTitle}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200">
                  {operatingStatus.hoursLabel}
                </p>
                {operatingStatus.isMonday && (
                  <p className="text-[10px] text-rose-300 font-bold">
                    * {operatingStatus.badgeSubtext}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Column 4: Ikuti Kami & Official Halal */}
          <div className="space-y-3.5">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider font-['Outfit'] border-b border-emerald-800/80 pb-2">
              Ikuti Kami
            </h4>

            {/* Social Icons Row */}
            <div className="flex items-center gap-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-xl bg-[#1877F2] text-white flex items-center justify-center font-bold text-sm shadow-md hover:scale-105 transition-transform"
              >
                f
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md hover:scale-105 transition-transform"
              >
                ig
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="w-9 h-9 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold text-sm shadow-md hover:scale-105 transition-transform border border-stone-700"
              >
                tt
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-xl bg-[#FF0000] text-white flex items-center justify-center font-bold text-sm shadow-md hover:scale-105 transition-transform"
              >
                yt
              </a>
            </div>

            {/* Search Pill: freshmarket.my */}
            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-800/80 rounded-full px-3.5 py-2 text-stone-300">
              <Search className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold">freshmarket.my</span>
            </div>

          </div>

        </div>

        {/* Interactive Google Maps Component */}
        <div className="mt-4 mb-6">
          <GoogleMapsSection onOpenWhatsApp={onOpenWhatsApp} />
        </div>

        {/* Bottom Bar: Copyright, Legal, Theme & Admin */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-400 text-xs">
          
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span>
              © {new Date().getFullYear()} Khairul Fresh Food. {isEn ? 'All Rights Reserved.' : 'Hak Cipta Terpelihara.'}
            </span>
            <div className="hidden sm:flex items-center gap-3 text-stone-500">
              <span>•</span>
              <span className="hover:text-stone-300 transition-colors cursor-pointer">Dasar Privasi</span>
              <span>•</span>
              <span className="hover:text-stone-300 transition-colors cursor-pointer">Terma & Syarat</span>
              <span>•</span>
              <span className="hover:text-stone-300 transition-colors cursor-pointer">Pasar Semenyih GA 59</span>
            </div>
          </div>

          {/* Theme Toggle & Admin Login */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center sm:justify-end">
            {onOpenAdminPortal && (
              <button
                onClick={onOpenAdminPortal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-950 hover:bg-indigo-900 text-indigo-200 hover:text-white border border-indigo-700/80 transition-all cursor-pointer font-bold text-xs shadow-xs"
                title="Buka Portal Pentadbir Admin"
              >
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Log Masuk Admin</span>
              </button>
            )}

            <button
              onClick={onToggleDarkMode}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/90 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 transition-all cursor-pointer shadow-xs"
              title={isDarkMode ? "Tukar ke Mod Cerah" : "Tukar ke Mod Gelap"}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300">Mod Cerah</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-xs font-bold text-emerald-200">Mod Gelap</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
};
