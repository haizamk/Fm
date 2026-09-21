import React from 'react';
import { ArrowRight, Star, Heart, Utensils } from 'lucide-react';

interface HomeStoryRowProps {
  onOpenRecipes?: () => void;
}

export const HomeStoryRow: React.FC<HomeStoryRowProps> = ({
  onOpenRecipes,
}) => {
  return (
    <section id="home-story-row" className="py-12 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Col 1: Resepi & Tips */}
          <div className="rounded-3xl overflow-hidden bg-stone-900 text-white relative flex flex-col justify-between shadow-xl min-h-[320px] group border border-stone-800">
            {/* Background Image of cooked chicken */}
            <img
              src="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=700"
              alt="Resepi Kari Ayam Semenyih"
              className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

            {/* Top Tag */}
            <div className="p-6 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/90 text-white text-xs font-bold tracking-wide">
                <Utensils className="w-3.5 h-3.5" />
                <span>Resepi & Tips</span>
              </span>
            </div>

            {/* Content Bottom */}
            <div className="p-6 relative z-10 space-y-3">
              <h3 className="text-xl sm:text-2xl font-black font-['Outfit'] leading-tight">
                Idea resipi ayam yang mudah & sedap
              </h3>
              <p className="text-xs text-stone-300">
                Koleksi resipi harian: Kari, Rendang, Ayam Goreng Berempah & Sup Ayam.
              </p>
              <button
                onClick={onOpenRecipes}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-stone-900 hover:bg-stone-100 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <span>Lihat Resepi</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
              </button>
            </div>
          </div>

          {/* Col 2: Apa Kata Pelanggan? */}
          <div className="rounded-3xl bg-[#fafaf8] dark:bg-stone-800/80 p-6 sm:p-7 border border-stone-200/80 dark:border-stone-700 flex flex-col justify-between shadow-lg">
            <div>
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200/60 dark:border-rose-900/60">
                  Maklum Balas
                </span>
                
                {/* 5 Stars */}
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
              </div>

              <h3 className="text-lg font-black text-stone-900 dark:text-white font-['Outfit'] mb-3">
                Apa Kata Pelanggan?
              </h3>

              <blockquote className="text-stone-700 dark:text-stone-300 text-sm italic leading-relaxed">
                “Ayam sangat segar, layanan mesra dan penghantaran cepat. Memang terbaik dan memudahkan urusan harian saya sekeluarga!”
              </blockquote>
            </div>

            <div className="pt-4 border-t border-stone-200/70 dark:border-stone-700 mt-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-stone-900 dark:text-white">Puan Siti</p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">Pelanggan Setia Semenyih</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                Verified Buyer
              </span>
            </div>
          </div>

          {/* Col 3: Family Banner */}
          <div className="rounded-3xl overflow-hidden bg-stone-900 text-white relative flex flex-col justify-between shadow-xl min-h-[320px] group border border-stone-800">
            {/* Background Image of happy dining */}
            <img
              src="https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&q=80&w=700"
              alt="Keluarga Bahagia Bersama Ayam Segar"
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

            <div className="p-6 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-bold tracking-wide">
                <Heart className="w-3.5 h-3.5 fill-white" />
                <span>Pilihan Keluarga</span>
              </span>
            </div>

            <div className="p-6 relative z-10 space-y-2">
              <h3 className="text-xl sm:text-2xl font-black font-['Outfit'] leading-tight">
                Ayam Segar Untuk Keluarga Tersayang ❤️
              </h3>
              <p className="text-xs text-stone-300">
                Makan bersama, lebih bermakna. Sajikan hidangan terbaik penuh khasiat dan keberkatan.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
