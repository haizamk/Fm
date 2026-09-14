import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface HeroBannerProps {
  onCheckPostcode?: (code: string) => void;
  onExploreProducts?: () => void;
  onOpenCalculator?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = () => {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-stone-900 to-stone-950 text-white pt-8 pb-6 sm:pt-10 sm:pb-8 border-b border-white/5">
      {/* Background ambient patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col items-start text-left max-w-4xl">
          
          {/* Top pill badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3 backdrop-blur-xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{t('heroBadge')}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-black tracking-tight leading-[1.18] font-['Outfit']">
            {t('heroTitle')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-amber-300">
              {t('heroTitleHighlight')}
            </span>{' '}
            {t('heroTitleSuffix')}
          </h1>

          {/* Subheading */}
          <p className="mt-3 text-sm sm:text-base text-stone-300 max-w-3xl font-normal leading-relaxed">
            {t('heroSubtitle')}
          </p>

        </div>
      </div>
    </div>
  );
};
