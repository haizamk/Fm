import React from 'react';
import { Truck, Clock, ShieldCheck, PhoneCall, Sparkles } from 'lucide-react';
import { SiteSettings } from '../types';

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
  const cutoffTime = siteSettings?.announcementCutoffTime || '11:00 PM';
  const announcementText = siteSettings?.announcementText || `Pesan sebelum ${cutoffTime} untuk penghantaran segar esok!`;
  const freeShippingMin = siteSettings?.freeShippingMinAmount || 70;
  const supportPhone = siteSettings?.supportPhone || '011-2856 8920';

  return (
    <div className="bg-emerald-900 text-emerald-100 text-xs sm:text-sm py-2 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center flex-wrap justify-center sm:justify-start gap-3">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-300 bg-emerald-800/80 px-2 py-0.5 rounded-full text-xs">
            <Sparkles className="w-3 h-3 text-amber-300" />
            Terus Dari Ladang
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
            <span>Percuma Penghantaran RM{freeShippingMin}+ ke Semenyih, Beranang & Kajang</span>
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1 text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            100% Halal Diiktiraf
          </span>
          <button
            onClick={onOpenWhatsApp}
            className="inline-flex items-center gap-1 text-emerald-200 hover:text-white font-medium transition-colors cursor-pointer"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Bantuan: {supportPhone}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

