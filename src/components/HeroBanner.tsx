import React from 'react';
import { ShoppingBag, MessageCircle, ShieldCheck, Sparkles, CheckCircle2, Tag, Truck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeroBannerProps {
  onCheckPostcode?: (code: string) => void;
  onExploreProducts?: () => void;
  onOpenCalculator?: () => void;
  onOpenWhatsApp?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreProducts,
  onOpenWhatsApp,
}) => {
  const { t } = useLanguage();

  // Dynamic check for Monday closure
  const todayDay = new Date().getDay();
  const isMonday = todayDay === 1; // 0 = Sunday, 1 = Monday

  const handleWhatsApp = () => {
    if (onOpenWhatsApp) {
      onOpenWhatsApp();
    } else {
      const msg = encodeURIComponent("Salam Khairul Fresh Food! Saya nak bertanyakan tentang Ayam Segar Promo RM9.90/kg & tempahan di Semenyih.");
      window.open(`https://wa.me/601111135503?text=${msg}`, '_blank');
    }
  };

  return (
    <section id="hero" className="relative overflow-hidden bg-white dark:bg-stone-900 pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-stone-100 dark:border-stone-800 transition-colors">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-100/50 dark:bg-emerald-950/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-rose-100/40 dark:bg-rose-950/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-5">
            
            {/* Promo Badge Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-extrabold tracking-wide shadow-2xs">
              <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
              <Tag className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>PROMO MINGGU INI – RM9.90/kg</span>
            </div>

            {/* Brand Name Eyebrow */}
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-black text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Khairul Fresh Food • Semenyih, Selangor</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 dark:text-white font-['Outfit'] tracking-tight leading-[1.12]">
              Ayam Halal Segar, <br className="hidden sm:inline" />
              <span className="text-emerald-600 dark:text-emerald-400">Terus Ke Rumah Anda</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 font-medium max-w-2xl leading-relaxed">
              Ayam segar berkualiti dari Semenyih. Disembelih harian mengikut syarak, dipotong & dicuci percuma, dibungkus rapi sejuk dingin dan dihantar terus ke pintu rumah anda.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2 w-full sm:w-auto">
              {/* Prominent Primary CTA */}
              <button
                onClick={onExploreProducts}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-base shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                aria-label="Beli Sekarang"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Beli Sekarang</span>
              </button>

              {/* Secondary CTA */}
              <button
                onClick={handleWhatsApp}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-stone-100 hover:bg-rose-50 text-stone-800 hover:text-rose-700 dark:bg-stone-800 dark:hover:bg-rose-950/60 dark:text-stone-200 dark:hover:text-rose-300 border border-stone-200 hover:border-rose-300 dark:border-stone-700 font-bold text-base transition-all cursor-pointer"
                aria-label="WhatsApp Kami"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>WhatsApp Kami</span>
              </button>
            </div>

            {/* Customer Trust Badges Strip */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800/80 w-full grid grid-cols-3 gap-2 sm:gap-4 text-center sm:text-left">
              <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold text-xs">
                  ☪️
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-stone-900 dark:text-white leading-tight">100% Halal</h4>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 hidden sm:block">Sembelihan Syarak</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold text-xs">
                  🍗
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-stone-900 dark:text-white leading-tight">Ayam Segar</h4>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 hidden sm:block">Bekalan Harian Pagi</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold text-xs">
                  🏷️
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-stone-900 dark:text-white leading-tight">Harga Berpatutan</h4>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 hidden sm:block">Terus dari Pasar</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Showcase Media Column */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Image Frame with Apple-inspired rounded corners & soft drop-shadow */}
              <div className="relative rounded-3xl overflow-hidden bg-slate-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 shadow-2xl group">
                <img
                  src="https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=900"
                  alt="Ayam Seekor Segar Diproses Khairul Fresh Food Semenyih"
                  className="w-full h-80 sm:h-96 object-cover transform group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating Price Tag Overlay */}
                <div className="absolute top-4 right-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-stone-200/80 dark:border-stone-700">
                  <span className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 block leading-none">Harga Promosi</span>
                  <span className="text-lg font-black text-rose-600 dark:text-rose-400 font-['Outfit']">RM 9.90 <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">/ kg</span></span>
                </div>

                {/* Floating Location Overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                      📍
                    </div>
                    <div>
                      <p className="text-xs font-black text-stone-900 dark:text-white leading-tight">Pasar Awam Semenyih</p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">Gerai GA 59 • Servis Potong & Cuci</p>
                    </div>
                  </div>
                  
                  {/* Dynamic Status Badge (Closed on Monday) */}
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full border shadow-2xs ${
                    isMonday 
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse' 
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  }`}>
                    {isMonday ? 'Cuti Hari Ini (Isnin)' : 'Buka Hari Ini'}
                  </span>
                </div>
              </div>

              {/* Floating Highlight Card */}
              <div className="absolute -bottom-5 -left-4 sm:-left-6 bg-emerald-700 text-white p-3.5 rounded-2xl shadow-xl border border-emerald-500/30 flex items-center gap-3 hidden xs:flex">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <p className="text-xs font-extrabold leading-tight">Penghantaran Segar</p>
                  <p className="text-[11px] text-emerald-100">Semenyih & Eco Majestic</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

