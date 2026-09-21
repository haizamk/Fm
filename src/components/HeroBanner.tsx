import React from 'react';
import { ShoppingBag, MessageCircle, ShieldCheck, Sparkles, CheckCircle2, Tag, Truck, ArrowRight, Heart } from 'lucide-react';
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

  const handleWhatsApp = () => {
    if (onOpenWhatsApp) {
      onOpenWhatsApp();
    } else {
      const el = document.getElementById('whatsapp-order-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="hero" className="relative overflow-hidden bg-[#fafaf8] dark:bg-stone-900 pt-8 pb-14 sm:pt-12 sm:pb-20 border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      
      {/* Background Subtle Ambience */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[30rem] h-[30rem] bg-emerald-100/40 dark:bg-emerald-950/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-rose-100/30 dark:bg-rose-950/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Main 2-Column Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6">
            
            {/* Tag / Eyebrow */}
            <div className="inline-flex items-center gap-2 text-xs font-black tracking-widest uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/80 px-3.5 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>SEGAR • HALAL • BERMUTU</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-stone-900 dark:text-white font-['Outfit'] tracking-tight leading-[1.08]">
                Ayam Segar <br />
                <span className="text-emerald-700 dark:text-emerald-400">Terus Dari Semenyih</span>
              </h1>
            </div>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 font-medium max-w-xl leading-relaxed">
              Pilihan terbaik untuk keluarga anda. Ayam segar, halal, bersih dan berkualiti dengan harga berpatutan terus dari Pasar Awam Semenyih.
            </p>

            {/* Action Buttons: Red "Beli Sekarang" & Green "WhatsApp Kami" */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2 w-full sm:w-auto">
              {/* Red Button: Beli Sekarang */}
              <button
                onClick={onExploreProducts}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-[#dc2626] hover:bg-[#b91c1c] active:bg-[#991b1b] text-white font-black text-base shadow-lg shadow-red-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                aria-label="Beli Sekarang"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Beli Sekarang</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>

              {/* Green Button: Order Melalui WhatsApp */}
              <button
                onClick={handleWhatsApp}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] active:bg-[#166534] text-white font-black text-base shadow-lg shadow-green-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                aria-label="Order Melalui WhatsApp"
                title="Buka Borang Tempahan Melalui WhatsApp"
              >
                <MessageCircle className="w-5 h-5 fill-white/20" />
                <span>Order Melalui WhatsApp</span>
              </button>
            </div>

          </div>

          {/* Right Column: Realistic Fresh Chicken Photography Showcase */}
          <div className="lg:col-span-6 relative mt-4 lg:mt-0">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* Main Photo Frame */}
              <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-stone-800 border border-stone-200/90 dark:border-stone-700 shadow-2xl group">
                <img
                  src="https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=1200"
                  alt="Ayam Segar Berkualiti Khairul Fresh Food Semenyih"
                  className="w-full h-80 sm:h-[26rem] object-cover transform group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />

                {/* Top Overlay: Script text */}
                <div className="absolute top-5 left-5 bg-black/40 backdrop-blur-xs px-3.5 py-1 rounded-full text-white text-xs sm:text-sm font-semibold italic tracking-wide">
                  Segar Bersih Berkualiti
                </div>

                {/* Big Red Promo Badge with Yellow Price */}
                <div className="absolute top-4 right-4 bg-[#dc2626] text-white p-3.5 sm:p-4 rounded-2xl shadow-xl border-2 border-red-500/80 text-center transform rotate-1 group-hover:rotate-0 transition-transform">
                  <span className="text-[10px] uppercase font-black tracking-wider text-red-100 block">
                    PROMO MINGGU INI
                  </span>
                  <div className="my-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-amber-300 font-['Outfit'] tracking-tight">
                      RM 9.90
                    </span>
                    <span className="text-xs font-bold text-white ml-0.5">/kg</span>
                  </div>
                  <span className="text-[9px] font-bold text-red-100 block opacity-95">
                    Pembelian lebih 10 ekor
                  </span>
                </div>

                {/* Bottom Overlay Pill on Image: Ayam dijamin halal dan segar setiap hari */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md py-2.5 px-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-rose-500 text-sm">❤️</span>
                    <span className="text-xs sm:text-sm font-black text-stone-900 dark:text-white">
                      Ayam dijamin halal dan segar setiap hari
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Dicuci Bersih</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* Bottom 4-Column Feature Strip (Floating Card matching reference) */}
        <div className="mt-10 sm:mt-14 bg-white dark:bg-stone-900 rounded-3xl p-4 sm:p-6 shadow-xl border border-stone-200/90 dark:border-stone-800 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* 1. 100% Halal */}
          <div className="flex items-center gap-3.5 p-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-xs text-xl">
              ☪️
            </div>
            <div>
              <h4 className="text-sm font-black text-stone-900 dark:text-white font-['Outfit']">100% Halal</h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">Dijamin halal syarak</p>
            </div>
          </div>

          {/* 2. Ayam Segar */}
          <div className="flex items-center gap-3.5 p-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-xs text-xl">
              🍗
            </div>
            <div>
              <h4 className="text-sm font-black text-stone-900 dark:text-white font-['Outfit']">Ayam Segar</h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">Bekalan setiap hari</p>
            </div>
          </div>

          {/* 3. Harga Berpatutan */}
          <div className="flex items-center gap-3.5 p-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-xs text-xl">
              🏷️
            </div>
            <div>
              <h4 className="text-sm font-black text-stone-900 dark:text-white font-['Outfit']">Harga Berpatutan</h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">Terus dari pasar</p>
            </div>
          </div>

          {/* 4. Penghantaran */}
          <div className="flex items-center gap-3.5 p-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-xs text-xl">
              🚚
            </div>
            <div>
              <h4 className="text-sm font-black text-stone-900 dark:text-white font-['Outfit']">Penghantaran</h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">Semenyih & sekitar</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
