import React from 'react';
import { Clock, MapPin, PhoneCall, Sparkles } from 'lucide-react';
import { SiteSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getOperatingHoursStatus } from '../utils/operatingHours';

interface AnnouncementBarProps {
  onOpenCoverage: () => void;
  onOpenWhatsApp: () => void;
  siteSettings?: SiteSettings;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  onOpenCoverage,
  onOpenWhatsApp,
  siteSettings,
}) => {
  const { isEn, language, setLanguage } = useLanguage();
  const operatingStatus = getOperatingHoursStatus();

  return (
    <div className="bg-[#032b20] text-emerald-100 text-xs py-2 px-3 sm:px-6 border-b border-emerald-900/60 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Left: Location & Dynamic Operating Hours */}
        <div className="flex items-center flex-wrap justify-center md:justify-start gap-3 text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5 text-white font-medium">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>Pasar Awam Semenyih, GA 59</span>
          </div>

          <span className="text-emerald-700 hidden sm:inline">•</span>

          <div className="flex items-center gap-1.5 text-emerald-200">
            <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Selasa – Ahad 7:00 pagi – 6:00 petang (Isnin Cuti)</span>
          </div>

          {/* Dynamic Status Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-black text-[10px] tracking-wide shadow-xs ${
              operatingStatus.isMonday
                ? 'bg-rose-600 text-white'
                : operatingStatus.isOpen
                ? 'bg-emerald-500 text-stone-950 font-extrabold'
                : 'bg-amber-500 text-stone-950 font-extrabold'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                operatingStatus.isOpen ? 'bg-stone-950 animate-ping' : 'bg-white'
              }`}
            />
            <span>{operatingStatus.badgeTitle}</span>
          </span>
        </div>

        {/* Right: Social Media, Language & Hotline */}
        <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-emerald-200">
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-emerald-300 font-medium">Ikuti kami:</span>
            <div className="flex items-center gap-1.5">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-6 h-6 rounded-full bg-emerald-800/80 hover:bg-[#1877F2] text-white flex items-center justify-center transition-all text-xs font-bold"
                title="Facebook"
              >
                f
              </a>
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-6 h-6 rounded-full bg-emerald-800/80 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 text-white flex items-center justify-center transition-all text-xs font-bold"
                title="Instagram"
              >
                ig
              </a>
              {/* TikTok */}
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="w-6 h-6 rounded-full bg-emerald-800/80 hover:bg-black text-white flex items-center justify-center transition-all text-xs font-bold"
                title="TikTok"
              >
                tt
              </a>
              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-6 h-6 rounded-full bg-emerald-800/80 hover:bg-[#FF0000] text-white flex items-center justify-center transition-all text-xs font-bold"
                title="YouTube"
              >
                yt
              </a>
            </div>
          </div>

          <span className="text-emerald-700 hidden lg:inline">•</span>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'bm' ? 'en' : 'bm')}
            className="px-2 py-0.5 rounded-md bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-[11px] font-bold border border-emerald-700/50 cursor-pointer transition-colors"
            title="Tukar Bahasa / Switch Language"
          >
            {language === 'bm' ? 'EN' : 'BM'}
          </button>

          {/* Quick WhatsApp Hotline */}
          <button
            onClick={onOpenWhatsApp}
            className="inline-flex items-center gap-1.5 text-white font-bold transition-all cursor-pointer bg-emerald-700 hover:bg-emerald-600 px-3 py-1 rounded-full border border-emerald-500/50 shadow-xs"
            title="Hubungi WhatsApp: 011-11135503"
          >
            <PhoneCall className="w-3 h-3 text-emerald-200" />
            <span>011-1113 5503</span>
          </button>
        </div>

      </div>
    </div>
  );
};

