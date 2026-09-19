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
      className="mb-8 sm:mb-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-yellow-300 bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-500 text-stone-950 relative transition-all duration-300"
    >
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Ribbon */}
      <div className="bg-emerald-950 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-yellow-300 font-black text-xs sm:text-sm shadow-md border-b-2 border-emerald-900">
        <div className="flex items-center gap-2 tracking-wide uppercase">
          <div className="p-1 rounded-md bg-yellow-400 text-stone-950 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="font-black text-yellow-300">
            {isEn ? `PROMO: TODAY'S SPECIAL OFFER (${schedule.dayNameEn})` : `TAWARAN PROMO HARI INI (${schedule.dayNameMs.toUpperCase()})`}
          </span>
          <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full bg-yellow-400 text-stone-950 text-[11px] font-black uppercase tracking-wider">
            {isEn ? schedule.promoPillEn : schedule.promoPillMs}
          </span>
        </div>

        {/* Countdown to midnight */}
        <div className="flex items-center gap-2 bg-stone-950 text-yellow-300 px-3 py-1 rounded-xl text-xs font-mono font-bold border border-yellow-500/40 shadow-inner">
          <Clock className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
          <span className="text-[11px] text-yellow-200 font-sans">{isEn ? 'Ends in:' : 'Tamat dalam:'}</span>
          <span className="font-extrabold tracking-wider text-yellow-300">{countdown}</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="p-5 sm:p-7 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
        
        {/* Left: Featured Image & Badges (5 cols on lg) */}
        <div className="lg:col-span-5 relative group">
          <div className="aspect-4/3 sm:aspect-16/10 lg:aspect-square w-full rounded-2xl overflow-hidden bg-stone-950 relative shadow-2xl border-2 border-stone-900">
            <ProductImage 
              product={product} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Top Image Overlays */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              <span className="px-3 py-1.5 rounded-xl bg-yellow-400 text-stone-950 font-black text-xs shadow-xl flex items-center gap-1.5 border-2 border-yellow-300 ring-2 ring-yellow-400/50">
                <TrendingDown className="w-4 h-4 text-stone-950 stroke-[2.5]" />
                <span>PROMO: JIMAT RM {savings.toFixed(2)}</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-700/95 backdrop-blur-xs text-white font-bold text-[11px] shadow-sm flex items-center gap-1">
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
                    : 'bg-stone-900/80 text-white/90 hover:text-white hover:bg-stone-900'
                }`}
                aria-label="Simpan Kegemaran"
              >
                <Heart className={`w-4 h-4 ${isSpecialProductFavorite ? 'fill-current' : ''}`} />
              </button>
            )}

            {/* Bottom Freshness Badge */}
            <div className="absolute bottom-3 inset-x-3 p-2.5 rounded-xl bg-stone-950/90 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs text-white">
              <span className="text-stone-200 font-semibold truncate">
                {product.freshnessType || 'Sembelihan Subuh Harian'}
              </span>
              <span className="text-yellow-400 font-black shrink-0">
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
              <span className="px-3 py-1 rounded-lg bg-stone-950 text-yellow-300 text-xs font-black uppercase tracking-wider shadow-md border border-stone-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span>{isEn ? schedule.themeTitleEn : schedule.themeTitleMs}</span>
              </span>
              <span className="text-xs text-stone-900 font-black uppercase tracking-wider">
                • {product.category.replace('-', ' ')}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-950 font-['Outfit'] tracking-tight leading-tight">
              {product.name}
            </h3>

            <p className="text-xs sm:text-sm text-stone-900 font-bold mt-2 leading-relaxed">
              {isEn ? schedule.taglineEn : schedule.taglineMs}
            </p>
          </div>

          {/* Pricing Highlight Box */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-950 text-white shadow-xl border border-yellow-400/40 flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <span className="text-[11px] text-yellow-300 block font-bold uppercase tracking-wider">
                {isEn ? 'Special Daily Price' : 'Harga Khas Hari Ini'}
              </span>
              <div className="flex items-baseline gap-2.5 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black text-yellow-400 font-['Outfit']">
                  RM {discountedPrice.toFixed(2)}
                </span>
                <span className="text-sm font-semibold text-stone-200">
                  / {product.unit}
                </span>
                <span className="text-sm line-through text-stone-400 font-medium">
                  RM {originalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1 rounded-xl bg-yellow-400 text-stone-950 shadow-md">
                <Zap className="w-3.5 h-3.5 text-stone-950 fill-stone-950" />
                <span>{isEn ? schedule.bonusBadgeEn : schedule.bonusBadgeMs}</span>
              </span>
            </div>
          </div>

          {/* 3 Perks Checklist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white text-stone-900 shadow-md border border-amber-300 text-xs">
              <Scissors className="w-4 h-4 text-emerald-700 shrink-0 stroke-[2.5]" />
              <span className="font-extrabold">{isEn ? 'Free Custom Cut' : 'Potong Ikut Citarasa Percuma'}</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white text-stone-900 shadow-md border border-amber-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
              <span className="font-extrabold">{isEn ? 'Free Chilled Cleaning' : 'Cuci Bersih & Buang Lemak'}</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white text-stone-900 shadow-md border border-amber-300 text-xs">
              <Award className="w-4 h-4 text-amber-600 shrink-0 stroke-[2.5]" />
              <span className="font-extrabold">{isEn ? `+${bonusPoints} Loyalty Points` : `+${bonusPoints} Mata Ganjaran`}</span>
            </div>
          </div>

          {/* Interactive Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Primary Button: Open Cut Modal (Rich Emerald Green Button) */}
            <button
              type="button"
              onClick={() => onSelectProduct(product)}
              className="flex-1 px-6 py-3.5 rounded-2xl bg-emerald-900 hover:bg-emerald-950 active:bg-black text-white font-black text-sm transition-all shadow-xl hover:shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.01] active:scale-[0.99] border-2 border-emerald-700"
            >
              <Scissors className="w-4 h-4 text-emerald-300" />
              <span>{isEn ? 'Choose Cut & Order Special' : 'Pilih Potongan & Tempah Tawaran Ini'}</span>
              <ArrowRight className="w-4 h-4 text-emerald-300" />
            </button>

            {/* Quick Add 1 Unit (Deep Dark Stone / Black Button with Gold Accents) */}
            <button
              type="button"
              onClick={handleQuickAddClick}
              className={`px-5 py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-xl border-2 ${
                isQuickAdded
                  ? 'bg-emerald-700 text-white border-emerald-500'
                  : 'bg-stone-950 hover:bg-stone-900 active:bg-black text-yellow-300 border-stone-800'
              }`}
            >
              {isQuickAdded ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>{isEn ? 'Added!' : 'Ditambah!'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-yellow-400 stroke-[3]" />
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
