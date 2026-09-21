import React from 'react';
import { ArrowRight, Camera, Sparkles } from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { FRONTPAGE_6_CONFIG } from './FrontpageCardsEditor';

interface ProductCategoriesSectionProps {
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
  onSelectCategory?: (category: ProductCategory | string) => void;
  onViewAllProducts?: () => void;
  isAdmin?: boolean;
  onOpenAdminEditor?: () => void;
}

export const ProductCategoriesSection: React.FC<ProductCategoriesSectionProps> = ({
  products = [],
  onSelectProduct,
  onSelectCategory,
  onViewAllProducts,
  isAdmin = false,
  onOpenAdminEditor,
}) => {
  const handleProductClick = (productId: string, defaultCategory: ProductCategory | string) => {
    // Jika produk wujud dalam data store dan onSelectProduct tersedia, buka modal potongan terus
    const matchingProduct = products.find((p) => p.id === productId);
    if (matchingProduct && onSelectProduct) {
      onSelectProduct(matchingProduct);
      return;
    }

    // Jika tiada, tapis ke kategori produk berkaitan di halaman katalog
    if (onSelectCategory) {
      onSelectCategory(defaultCategory);
    } else if (onViewAllProducts) {
      onViewAllProducts();
    }
  };

  return (
    <section id="categories-section" className="py-8 sm:py-10 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header matching design reference */}
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-['Outfit'] tracking-tight">
                Kategori Produk
              </h2>
              {isAdmin && onOpenAdminEditor && (
                <button
                  onClick={onOpenAdminEditor}
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 transition-colors border border-emerald-300 dark:border-emerald-800 cursor-pointer shadow-2xs"
                  title="Tukar foto untuk 6 kad ini di Admin Portal"
                >
                  <Camera className="w-3 h-3" />
                  <span>Tukar Gambar (Admin)</span>
                </button>
              )}
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
              Pilihan ayam segar berkualiti mengikut citarasa dan masakan anda
            </p>
          </div>

          <button
            onClick={() => {
              if (onViewAllProducts) {
                onViewAllProducts();
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors cursor-pointer group shrink-0"
          >
            <span>Lihat Semua Produk</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 6 Products Grid - 2 Columns on Mobile, 3 on Tablet, 6 on Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
          {FRONTPAGE_6_CONFIG.map((card) => {
            const product = products.find((p) => p.id === card.productId);
            // Gambar dinamik: Jika admin telah muat naik foto produk di admin, gunakan foto tersebut serta-merta!
            const currentImage = (product?.image && product.image.trim()) 
              ? product.image 
              : card.fallbackImage;
            const displayName = card.defaultName;
            const displayPrice = card.defaultPrice;
            const displaySubtitle = card.defaultSubtitle;
            const categoryFilter = product?.category || 'ayam-bulat';

            return (
              <div
                key={card.productId}
                onClick={() => handleProductClick(card.productId, categoryFilter)}
                className="group bg-stone-50 dark:bg-stone-800/80 hover:bg-white dark:hover:bg-stone-800 rounded-3xl p-3.5 sm:p-4 border border-stone-200/80 dark:border-stone-700/80 hover:border-emerald-500/80 dark:hover:border-emerald-500/80 shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Product Photo - Focused pure raw product */}
                <div className="aspect-square rounded-2xl overflow-hidden bg-stone-200/60 dark:bg-stone-700 mb-3 relative flex items-center justify-center">
                  <img
                    src={currentImage}
                    alt={displayName}
                    className="w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback jika pautan gagal
                      (e.currentTarget as HTMLImageElement).src = card.fallbackImage;
                    }}
                  />
                  {/* Price pill badge */}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold tracking-tight">
                    {displayPrice}
                  </div>
                </div>

                {/* Title, Description & Action */}
                <div className="flex items-end justify-between gap-1.5 pt-0.5">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-black text-stone-900 dark:text-white font-['Outfit'] leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate">
                      {displayName}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                      {displaySubtitle}
                    </p>
                  </div>

                  {/* Circular Green Arrow Button */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:bg-emerald-700 group-hover:scale-110 shadow-xs transition-all">
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
