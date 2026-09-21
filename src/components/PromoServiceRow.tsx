import React from 'react';
import { Truck, Calendar, ArrowRight, Check, Clock } from 'lucide-react';
import { getOperatingHoursStatus } from '../utils/operatingHours';

interface PromoServiceRowProps {
  onOpenCoverage?: () => void;
  onOpenWhatsApp?: () => void;
}

export const PromoServiceRow: React.FC<PromoServiceRowProps> = ({
  onOpenCoverage,
  onOpenWhatsApp,
}) => {
  const operatingStatus = getOperatingHoursStatus();

  return (
    <section id="promo-service-row" className="py-10 bg-[#fafaf8] dark:bg-stone-900/60 border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* Card 1: Dark Green Delivery Service Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064e3b] via-[#043e2f] to-[#022c22] text-white p-6 sm:p-8 flex flex-col justify-between shadow-xl border border-emerald-800/80 group">
            
            {/* Background Decorative Graphic / Van Silhouette */}
            <div className="absolute -right-6 -bottom-6 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              {/* Delivery Van Image / Icon Frame */}
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-md">
                <Truck className="w-9 h-9 text-emerald-300" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight leading-tight">
                  Penghantaran ke Semenyih <br />
                  <span className="text-emerald-300">dan sekitarnya</span>
                </h3>

                {/* Features Checkmarks */}
                <div className="flex items-center gap-4 text-xs sm:text-sm font-bold text-emerald-100 pt-1">
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    <span>Cepat</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    <span>Selamat</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    <span>Segar</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button: Semak Kawasan */}
            <div className="pt-6 relative z-10">
              <button
                onClick={onOpenCoverage}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-emerald-950 hover:bg-emerald-50 font-black text-sm shadow-md transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Semak Kawasan</span>
                <ArrowRight className="w-4 h-4 text-emerald-700" />
              </button>
            </div>

          </div>

          {/* Card 2: Soft Rose/Pink Card with Calendar & Dynamic Operating Hours */}
          <div className="relative overflow-hidden rounded-3xl bg-[#fdf2f2] dark:bg-stone-800/90 text-stone-900 dark:text-white p-6 sm:p-8 flex flex-col justify-between shadow-xl border border-rose-200/80 dark:border-stone-700">
            
            <div className="space-y-5">
              
              {/* Top Row: Calendar Icon + Dynamic Status Badge */}
              <div className="flex items-start justify-between gap-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30">
                  <Calendar className="w-9 h-9" />
                </div>

                {/* Dynamic Status Indicator */}
                <span
                  className={`px-3.5 py-1.5 rounded-full font-black text-xs tracking-wide shadow-xs border ${
                    operatingStatus.isMonday
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300'
                      : operatingStatus.isOpen
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
                  }`}
                >
                  {operatingStatus.badgeTitle}
                </span>
              </div>

              {/* Dynamic Headlines */}
              <div>
                <h3
                  className={`text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight ${
                    operatingStatus.isMonday ? 'text-rose-600 dark:text-rose-400' : 'text-stone-900 dark:text-white'
                  }`}
                >
                  {operatingStatus.badgeTitle}
                </h3>
                
                <p className="text-sm sm:text-base font-bold text-stone-600 dark:text-stone-300 mt-1">
                  {operatingStatus.badgeSubtext}
                </p>
              </div>

              {/* Operating Hours Info */}
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-rose-100 dark:border-stone-700/80 space-y-1">
                <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span>Waktu Operasi Pasar Semenyih:</span>
                </p>
                <p className="text-sm font-extrabold text-stone-900 dark:text-white">
                  Selasa – Ahad: 7.00 pagi – 6.00 petang
                </p>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                  (Isnin Cuti Operasi Pasar)
                </p>
              </div>

            </div>

            {/* Bottom Support Link */}
            <div className="pt-4 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium">
              <span>Gerai GA 59, Pasar Awam Semenyih</span>
              <button
                onClick={onOpenWhatsApp}
                className="text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
              >
                Pertanyaan? WhatsApp Kami ➔
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
