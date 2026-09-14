import React from 'react';
import { Truck, Clock, ShieldCheck, PhoneCall, Sparkles } from 'lucide-react';
import { SiteSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';

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
  const { t, isEn } = useLanguage();
  const cutoffTime = siteSettings?.announcementCutoffTime || '11:00 PM';
  const announcementText = isEn
    ? `Order before ${cutoffTime} for fresh morning delivery tomorrow!`
    : (siteSettings?.announcementText || `Pesan sebelum ${cutoffTime} untuk penghantaran segar esok!`);
  const freeShippingMin = siteSettings?.freeShippingMinAmount || 70;
  const supportPhone = siteSettings?.supportPhone || '011-11135503';

  return (
    <div className="bg-emerald-900 text-emerald-100 text-xs sm:text-sm py-2 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center flex-wrap justify-center sm:justify-start gap-3">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-300 bg-emerald-800/80 px-2 py-0.5 rounded-full text-xs">
            <Sparkles className="w-3 h-3 text-amber-300" />
            {t('freshFromFarm')}
          </span>
          <p className="flex items-center gap-1.5 text-center sm:text-left">
            <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{announcementText}</span>
          </p>
          <span className="hidden md:inline-block text-emerald-500">•</span>
          <button
            onClick={onOpenCoverage}
            className="hidden md:flex items-center gap-1 text-emerald-200 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5 text-emerald-300" />
            <span>{isEn ? `Free Delivery RM${freeShippingMin}+ to Semenyih, Beranang & Kajang` : `Percuma Penghantaran RM${freeShippingMin}+ ke Semenyih, Beranang & Kajang`}</span>
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1 text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {t('freshGuarantee')}
          </span>
          <button
            onClick={onOpenWhatsApp}
            className="inline-flex items-center gap-1.5 text-emerald-100 hover:text-white font-bold transition-colors cursor-pointer bg-emerald-800/80 hover:bg-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-700/60 shadow-2xs"
            title="Bantuan: 011-11135503"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-300" />
            <span>Bantuan: 011-11135503</span>
          </button>
        </div>
      </div>
    </div>
  );
};
