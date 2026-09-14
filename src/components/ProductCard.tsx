import React, { useRef } from 'react';
import { Product } from '../types';
import { Star, Scissors, Plus, ShieldCheck, Check, Heart, Scale, Flame, AlertCircle, Sparkles, Bell, Layers } from 'lucide-react';
import { calculatePricePerKg } from '../utils/pricing';
import { ProductImage } from './ProductImage';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, sourceRect?: DOMRect) => void;
  onNotifyStock?: (product: Product) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string) => void;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onQuickAdd,
  onNotifyStock,
  isFavorite = false,
  onToggleFavorite,
  index = 0,
}) => {
  const { t, isEn, tProduct } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const transProd = tProduct(product);

  // Weight variations calculations if present
  const hasWeightOptions = Boolean(product.hasWeightOptions && product.weightOptions && product.weightOptions.length > 0);
  const activeWeightOptions = hasWeightOptions ? product.weightOptions!.filter(opt => opt.isAvailable) : [];
  
  const minActivePrice = hasWeightOptions && activeWeightOptions.length > 0
    ? Math.min(...activeWeightOptions.map(o => o.price))
    : product.price;

  const totalWeightStock = hasWeightOptions && product.weightOptions
    ? product.weightOptions.filter(o => o.isAvailable).reduce((sum, opt) => sum + (opt.availableStock || 0), 0)
    : (product.remainingStock ?? 25);

  const displayStock = hasWeightOptions ? totalWeightStock : (product.remainingStock ?? 25);
  const isOutOfStock = !product.inStock || displayStock <= 0;
  const isLowStock = !isOutOfStock && displayStock <= 5;
  const isCriticalStock = !isOutOfStock && displayStock <= 2;
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > minActivePrice);
  const savingsAmount = hasDiscount && product.originalPrice ? product.originalPrice - minActivePrice : 0;
  const priceInfo = calculatePricePerKg({ ...product, price: minActivePrice });

  // Compute staggered entry animation delay capped at 300ms
  const staggerDelay = `${Math.min((index % 8) * 45, 320)}ms`;

  return (
    <div 
      ref={cardRef}
      className="animate-fade-in-up group bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:shadow-2xl hover:-translate-y-1.5 hover:scale-[1.018] dark:shadow-stone-950/50 transition-all duration-300 ease-out flex flex-col overflow-hidden relative cursor-pointer"
      style={{ animationDelay: staggerDelay }}
    >
      
      {/* Image Container */}
      <div className="relative aspect-16/10 overflow-hidden bg-stone-100 dark:bg-stone-800">
        <ProductImage
          product={product}
          alt={transProd.name}
          showHoverEffect={true}
          onClick={() => onSelectProduct(product)}
          containerClassName="w-full h-full cursor-pointer"
        />

        {/* Favorite Button (Heart Icon) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(product.id);
          }}
          aria-label={isFavorite ? (isEn ? `Remove ${transProd.name} from favorites` : `Buang ${transProd.name} dari kegemaran`) : (isEn ? `Save ${transProd.name} to favorites` : `Simpan ${transProd.name} ke kegemaran`)}
          title={isFavorite ? (isEn ? "Saved in Favorites (Click to remove)" : "Tersimpan dalam Kegemaran (Klik untuk buang)") : (isEn ? "Save to Favorites" : "Simpan ke Kegemaran")}
          className={`absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer ${
            isFavorite
              ? 'bg-white dark:bg-stone-800 text-rose-500 shadow-rose-500/25 scale-105 ring-2 ring-rose-300 dark:ring-rose-900'
              : 'bg-white/85 dark:bg-stone-900/80 hover:bg-white dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-rose-500 hover:scale-110'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-all duration-300 ${
              isFavorite 
                ? 'fill-rose-500 text-rose-500 animate-pulse' 
                : 'stroke-[2.2] text-stone-700 dark:text-stone-300 hover:text-rose-500'
            }`}
          />
        </button>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {isOutOfStock ? (
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md text-white bg-rose-700 flex items-center gap-1 w-fit ring-1 ring-white/40">
              <AlertCircle className="w-3 h-3 text-white shrink-0" />
              <span>{t('outOfStock')}</span>
            </span>
          ) : (
            product.badge && (
              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm text-white ${
                product.badgeColor === 'green' ? 'bg-emerald-600' :
                product.badgeColor === 'amber' ? 'bg-amber-600' :
                product.badgeColor === 'red' ? 'bg-rose-600' : 'bg-blue-600'
              }`}>
                {isEn && product.badge === 'Paling Laris' ? 'Best Seller' : isEn && product.badge === 'Pek Jimat' ? 'Value Pack' : product.badge}
              </span>
            )
          )}

          {/* Jimat RM X Promotional Savings Badge */}
          {hasDiscount && savingsAmount > 0 && !isOutOfStock && (
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md text-white bg-rose-600 flex items-center gap-1 w-fit ring-1 ring-white/30">
              <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300 shrink-0" />
              <span>{t('savingBadge')} RM {savingsAmount.toFixed(2)}</span>
            </span>
          )}

          {/* Daily Stock Limit Urgency Badge on Image */}
          {!isOutOfStock && isLowStock && (
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 text-white ${
              isCriticalStock ? 'bg-rose-600 animate-pulse' : 'bg-amber-600'
            }`}>
              <Flame className="w-3 h-3 fill-amber-300 text-amber-300 shrink-0" />
              <span>{t('remainingStock')} {displayStock} {t('leftUnit')}!</span>
            </span>
          )}

          {product.halalCertified && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-900/80 text-white backdrop-blur-xs flex items-center gap-1 shadow-sm w-fit border border-stone-700/50">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{t('halalCertifiedBadge')}</span>
            </span>
          )}
        </div>

        {/* Weight pill on bottom right */}
        <div className="absolute bottom-2.5 right-2.5 bg-stone-950/80 backdrop-blur-xs text-stone-100 text-[11px] font-semibold px-2.5 py-0.8 rounded-md shadow-xs flex items-center gap-1">
          <Scale className="w-3 h-3 text-emerald-400" />
          <span>{product.weightEstimate}</span>
        </div>
      </div>

      {/* Out of stock or Stock Warning Notification Banner */}
      {isOutOfStock ? (
        <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-bold border-b bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-900/60">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{isEn ? 'Currently out of stock. Register for restock alerts!' : 'Stok sedang habis. Daftar untuk terima notifikasi restock!'}</span>
          </div>
        </div>
      ) : isLowStock ? (
        <div className={`px-3 py-1.5 flex items-center justify-between text-[11px] font-bold border-b transition-colors ${
          isCriticalStock
            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-900/60'
            : 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-900/60'
        }`}>
          <div className="flex items-center gap-1.5">
            <AlertCircle className={`w-3.5 h-3.5 shrink-0 ${isCriticalStock ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`} />
            <span>
              {isEn ? 'Limited fresh stock:' : 'Stok segar terhad:'} <strong className="underline">{displayStock} {t('leftUnit')}</strong> {isEn ? 'today' : 'hari ini'}
            </span>
          </div>
          <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-sm ${
            isCriticalStock ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
          }`}>
            {isEn ? 'Order Fast' : 'Cepat Pesan'}
          </span>
        </div>
      ) : null}

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating and Reviews */}
          <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
            <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{product.rating}</span>
              <span className="text-stone-400 dark:text-stone-500 font-normal">({product.reviewsCount})</span>
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/50">
              {transProd.freshnessType || product.freshnessType}
            </span>
          </div>

          {/* Product Name */}
          <h3 
            onClick={() => onSelectProduct(product)}
            className="font-bold text-stone-900 dark:text-white text-base group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1 cursor-pointer"
            title={transProd.name}
          >
            {transProd.name}
          </h3>

          {/* Subtitle description */}
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
            {transProd.subtitle}
          </p>

          {/* Cut Feature Tag */}
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400">
            {product.supportsCutting ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/50 px-2 py-0.8 rounded-md font-medium text-[11px] border border-emerald-100 dark:border-emerald-900/40">
                <Scissors className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {isEn
                    ? (product.customCutOptions && product.customCutOptions.length > 0
                        ? 'Custom Cuts Available'
                        : 'Free Cuts: 4 / 8 / 12 / 16 / Minced')
                    : (product.customCutOptions && product.customCutOptions.length > 0
                        ? `Pilihan Potong: ${product.customCutOptions.map((c) => c.label).join(' / ')}`
                        : 'Percuma Potong: 4 / 8 / 12 / 16 / Cincang')}
                </span>
              </span>
            ) : product.hasOrganVariations || product.id === 'hati-pedal-ayam-segar' ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/50 px-2 py-0.8 rounded-md font-medium text-[11px] border border-emerald-100 dark:border-emerald-900/40">
                <Layers className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{isEn ? 'Options: Liver / Gizzard / Mixed' : 'Pilihan: Hati / Pedal / Campur'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.8 rounded-md text-[11px]">
                <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                <span>{isEn ? 'Cleaned & Ready to Cook' : 'Siap Bersih & Dikemas Rapi'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {/* Primary unit price */}
            <div className="flex items-baseline gap-1.5">
              {hasWeightOptions && (
                <span className="text-xs font-bold text-stone-500 dark:text-stone-400">{isEn ? 'From' : 'Dari'}</span>
              )}
              <span className="text-lg sm:text-xl font-black text-stone-950 dark:text-white tracking-tight">
                RM {minActivePrice.toFixed(2)}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                /{product.unit === 'ekor' && isEn ? 'bird' : product.unit === 'pakej' && isEn ? 'pkg' : product.unit}
              </span>
            </div>

            {/* Price Per KG Label and Strikethrough Discount */}
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span 
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-950 dark:bg-emerald-900 text-emerald-200 font-extrabold text-[11px] tracking-wide border border-emerald-800 dark:border-emerald-700 shadow-2xs"
                title={`Kadar nilai: ${priceInfo.formatted}`}
              >
                <span>{priceInfo.formatted}</span>
              </span>

              {product.originalPrice && (
                <span className="text-[11px] text-stone-400 dark:text-stone-500 line-through font-normal">
                  RM {product.originalPrice.toFixed(2)}
                </span>
              )}

              {hasDiscount && savingsAmount > 0 && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-extrabold text-[10px] border border-rose-200 dark:border-rose-900 shadow-2xs">
                  {t('savingBadge')} RM {savingsAmount.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {isOutOfStock ? (
            <button
              type="button"
              onClick={() => onNotifyStock ? onNotifyStock(product) : onSelectProduct(product)}
              className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
              title={t('notifyStock')}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{t('notifyStock')}</span>
            </button>
          ) : product.hasOrganVariations || product.id === 'hati-pedal-ayam-segar' ? (
            <button
              type="button"
              onClick={() => onSelectProduct(product)}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:shadow-emerald-600/20 cursor-pointer shrink-0"
              title={t('selectVariation')}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t('selectVariation')}</span>
            </button>
          ) : product.supportsCutting || hasWeightOptions ? (
            <button
              type="button"
              onClick={() => onSelectProduct(product)}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:shadow-emerald-600/20 cursor-pointer shrink-0"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>{hasWeightOptions ? t('chooseWeightAndCut') : t('chooseCut')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const imgEl = cardRef.current?.querySelector('img');
                const rect = imgEl ? imgEl.getBoundingClientRect() : e.currentTarget.getBoundingClientRect();
                onQuickAdd(product, rect);
              }}
              className="bg-stone-900 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('quickAdd')}</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
