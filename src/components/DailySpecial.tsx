import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { getDailySpecial, ResolvedDailySpecial } from '../utils/dailySpecial';
import { ProductImage } from './ProductImage';
import { 
  Sparkles, 
  Flame, 
  Clock, 
  Tag, 
  ShoppingBag, 
  Plus, 
  Check, 
  Heart, 
  Award, 
  ShieldCheck, 
  ArrowRight, 
  Zap,
  Scissors,
  CheckCircle2,
  TrendingDown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface DailySpecialProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, sourceRect?: DOMRect) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export const DailySpecial: React.FC<DailySpecialProps> = ({
  products,
  onSelectProduct,
  onQuickAdd,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const { isEn } = useLanguage();
  const [specialData, setSpecialData] = useState<ResolvedDailySpecial | null>(null);
  const [countdown, setCountdown] = useState<string>('00:00:00');
  const [isQuickAdded, setIsQuickAdded] = useState<boolean>(false);

  // Initialize and update daily special
  useEffect(() => {
    const data = getDailySpecial(products);
    setSpecialData(data);
  }, [products]);

  // Live ticking countdown to midnight
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      const diffMs = Math.max(0, midnight.getTime() - now.getTime());
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      setCountdown(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!specialData || !specialData.product) {
    return null;
  }

  const { schedule, product, discountedPrice, originalPrice, savings, bonusPoints } = specialData;
  const isSpecialProductFavorite = isFavorite;

  const handleQuickAddClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    onQuickAdd(product, rect);
    setIsQuickAdded(true);
    setTimeout(() => setIsQuickAdded(false), 2000);
  };

  return (
    <div 
      id="daily-special-section" 
      className="mb-8 sm:mb-10 rounded-3xl overflow-hidden shadow-xl border border-amber-400/40 dark:border-amber-500/30 bg-gradient-to-br from-stone-950 via-emerald-950 to-stone-900 text-white relative transition-all duration-300"
    >
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Ribbon */}
      <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-stone-950 font-black text-xs sm:text-sm">
        <div className="flex items-center gap-2 tracking-wide uppercase">
          <div className="p-1 rounded-md bg-stone-950 text-amber-400 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5 fill-current" />
          </div>
          <span>
            {isEn ? `TODAY'S SPECIAL OFFER (${schedule.dayNameEn})` : `TAWARAN ISTIMEWA HARI INI (${schedule.dayNameMs.toUpperCase()})`}
          </span>
          <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-stone-950/15 text-[11px] font-bold">
            {isEn ? schedule.promoPillEn : schedule.promoPillMs}
          </span>
        </div>

        {/* Countdown to midnight */}
        <div className="flex items-center gap-2 bg-stone-950/90 text-amber-300 px-3 py-1 rounded-xl text-xs font-mono font-bold shadow-inner">
          <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="text-[11px] text-stone-300 font-sans">{isEn ? 'Ends in:' : 'Tamat dalam:'}</span>
          <span className="font-extrabold tracking-wider">{countdown}</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="p-5 sm:p-7 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
        
        {/* Left: Featured Image & Badges (5 cols on lg) */}
        <div className="lg:col-span-5 relative group">
          <div className="aspect-4/3 sm:aspect-16/10 lg:aspect-square w-full rounded-2xl overflow-hidden bg-stone-900 relative shadow-2xl border-2 border-white/10">
            <ProductImage 
              product={product} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Top Image Overlays */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              <span className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-black text-xs shadow-lg flex items-center gap-1 border border-rose-400/40">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>JIMAT RM {savings.toFixed(2)}</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-600/90 backdrop-blur-xs text-white font-bold text-[11px] shadow-sm flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Halal Diiktiraf</span>
              </span>
            </div>

            {/* Favorite button */}
            {onToggleFavorite && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(product.id);
                }}
                className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-md z-10 ${
                  isSpecialProductFavorite 
                    ? 'bg-rose-500 text-white hover:bg-rose-600 scale-105' 
                    : 'bg-stone-900/70 text-white/80 hover:text-white hover:bg-stone-900'
                }`}
                aria-label="Simpan Kegemaran"
              >
                <Heart className={`w-4 h-4 ${isSpecialProductFavorite ? 'fill-current' : ''}`} />
              </button>
            )}

            {/* Bottom Freshness Badge */}
            <div className="absolute bottom-3 inset-x-3 p-2.5 rounded-xl bg-stone-950/80 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs">
              <span className="text-stone-300 font-medium truncate">
                {product.freshnessType || 'Sembelihan Subuh Harian'}
              </span>
              <span className="text-amber-400 font-bold shrink-0">
                ★ {product.rating || '5.0'} ({product.reviewsCount || 48})
              </span>
            </div>
          </div>
        </div>

        {/* Right: Product Details, Special Benefits & Actions (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4 sm:space-y-5">
          
          {/* Header Title & Taglines */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider border border-amber-400/30">
                {isEn ? schedule.themeTitleEn : schedule.themeTitleMs}
              </span>
              <span className="text-xs text-stone-400">
                • {product.category.replace('-', ' ').toUpperCase()}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-['Outfit'] tracking-tight leading-tight">
              {product.name}
            </h3>

            <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
              {isEn ? schedule.taglineEn : schedule.taglineMs}
            </p>
          </div>

          {/* Pricing Highlight */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <span className="text-[11px] text-stone-400 block font-medium uppercase tracking-wider">
                {isEn ? 'Special Daily Price' : 'Harga Khas Hari Ini'}
              </span>
              <div className="flex items-baseline gap-2.5 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black text-amber-400 font-['Outfit']">
                  RM {discountedPrice.toFixed(2)}
                </span>
                <span className="text-sm font-semibold text-stone-300">
                  / {product.unit}
                </span>
                <span className="text-sm line-through text-stone-500 font-medium">
                  RM {originalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isEn ? schedule.bonusBadgeEn : schedule.bonusBadgeMs}</span>
              </span>
            </div>
          </div>

          {/* 3 Perks Checklist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-900/60 border border-white/5 text-xs text-stone-200">
              <Scissors className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-semibold">{isEn ? 'Free Custom Cut' : 'Potong Ikut Citarasa Percuma'}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-900/60 border border-white/5 text-xs text-stone-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{isEn ? 'Free Chilled Cleaning' : 'Cuci Bersih & Buang Lemak'}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-900/60 border border-white/5 text-xs text-stone-200">
              <Award className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="font-semibold">{isEn ? `+${bonusPoints} Loyalty Points` : `+${bonusPoints} Mata Ganjaran`}</span>
            </div>
          </div>

          {/* Interactive Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Primary Button: Open Cut Modal */}
            <button
              type="button"
              onClick={() => onSelectProduct(product)}
              className="flex-1 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-stone-950 font-black text-sm transition-all shadow-lg hover:shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <Scissors className="w-4 h-4" />
              <span>{isEn ? 'Choose Cut & Order Special' : 'Pilih Potongan & Tempah Tawaran Ini'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Add 1 Unit */}
            <button
              type="button"
              onClick={handleQuickAddClick}
              className={`px-5 py-3.5 rounded-2xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 border ${
                isQuickAdded
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/15 active:bg-white/25'
              }`}
            >
              {isQuickAdded ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>{isEn ? 'Added!' : 'Ditambah!'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>{isEn ? 'Quick Add' : 'Tambah Pantas'}</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
