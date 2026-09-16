import React, { useState, useMemo, useEffect } from 'react';
import { Product, ProductCategory } from '../types';
import { PRODUCT_CATEGORIES } from '../data/products';
import { ProductCard } from './ProductCard';
import { DailySpecial } from './DailySpecial';
import { getShareableUrl, copyShareableLink } from '../utils/seoHelper';
import { 
  ArrowLeft, 
  ArrowUp,
  Search, 
  Sparkles, 
  Heart, 
  Flame, 
  ShoppingBag,
  RotateCcw,
  Percent,
  Layers,
  Share2,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AllProductsPageProps {
  products: Product[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, sourceRect?: DOMRect) => void;
  onNotifyStock?: (product: Product) => void;
  onBackToHome: () => void;
  initialCategory?: ProductCategory;
  initialSearchQuery?: string;
  onCategoryChange?: (cat: ProductCategory) => void;
  onShare?: (url: string, msg?: string) => void;
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'savings-desc' | 'rating-desc';

export const AllProductsPage: React.FC<AllProductsPageProps> = ({
  products,
  favorites,
  onToggleFavorite,
  onSelectProduct,
  onQuickAdd,
  onNotifyStock,
  onBackToHome,
  initialCategory = 'semua',
  initialSearchQuery = '',
  onCategoryChange,
  onShare,
}) => {
  const { t, isEn, tCategoryName } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(initialCategory);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
  const [showOnlyPromo, setShowOnlyPromo] = useState<boolean>(false);
  const [showOnlyLowStock, setShowOnlyLowStock] = useState<boolean>(false);
  const [copiedCategoryLink, setCopiedCategoryLink] = useState<boolean>(false);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  const handleSelectCat = (catId: ProductCategory) => {
    setSelectedCategory(catId);
    onCategoryChange?.(catId);
  };

  const handleShareCategory = async () => {
    const directUrl = getShareableUrl({
      kategori: selectedCategory,
    });
    if (onShare) {
      onShare(directUrl, `Pautan ${selectedCategory !== 'semua' ? selectedCategory.replace('-', ' ') : 'katalog'} disalin!`);
      return;
    }
    const success = await copyShareableLink(directUrl);
    if (success) {
      setCopiedCategoryLink(true);
      setTimeout(() => setCopiedCategoryLink(false), 2500);
    }
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      // Favorites filter
      if (showOnlyFavorites && !favorites.includes(product.id)) {
        return false;
      }
      // Promo only filter
      if (showOnlyPromo && (!product.originalPrice || product.originalPrice <= product.price)) {
        return false;
      }
      // Low stock filter
      if (showOnlyLowStock && (product.remainingStock === undefined || product.remainingStock > 5)) {
        return false;
      }
      // Category match
      if (selectedCategory !== 'semua' && product.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchSubtitle = product.subtitle.toLowerCase().includes(q);
        const matchTags = product.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchSubtitle && !matchTags) return false;
      }
      return true;
    });

    // Sorting
    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'savings-desc') {
      result = [...result].sort((a, b) => {
        const savingsA = a.originalPrice ? a.originalPrice - a.price : 0;
        const savingsB = b.originalPrice ? b.originalPrice - b.price : 0;
        return savingsB - savingsA;
      });
    } else if (sortBy === 'rating-desc') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, favorites, selectedCategory, searchQuery, sortBy, showOnlyFavorites, showOnlyPromo, showOnlyLowStock]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('semua');
    setSortBy('default');
    setShowOnlyFavorites(false);
    setShowOnlyPromo(false);
    setShowOnlyLowStock(false);
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'semua' || sortBy !== 'default' || showOnlyFavorites || showOnlyPromo || showOnlyLowStock;

  return (
    <div className="w-full min-h-screen bg-stone-50 dark:bg-stone-950 pb-16 transition-colors">
      
      {/* Top Banner / Breadcrumb Bar */}
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 py-4 px-4 sm:px-6 shadow-2xs transition-colors sticky top-16 z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold text-xs transition-colors cursor-pointer border border-stone-200 dark:border-stone-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('backToHomeBtn')}</span>
            </button>
            <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                {isEn ? 'Full Catalog' : 'Katalog Keseluruhan'}
              </span>
              <span className="text-xs text-stone-400 dark:text-stone-500">
                ({filteredProducts.length} {isEn ? `of ${products.length} products` : `daripada ${products.length} produk`})
              </span>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-400">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px]">
              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{t('freshFromFarm')}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-[11px]">
              <Layers className="w-3 h-3 text-stone-500" />
              <span>{isEn ? '3 Products Per Row Grid' : 'Susunan 3 Produk Setiap Baris'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 dark:text-white font-['Outfit'] tracking-tight">
            {t('allProductsTitle')}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-3xl leading-relaxed">
            {t('allProductsSubtitle')}
          </p>
        </div>

        {/* Highlighted Daily Special Component */}
        {selectedCategory === 'semua' && !searchQuery.trim() && !showOnlyFavorites && !showOnlyPromo && !showOnlyLowStock && (
          <DailySpecial
            products={products}
            onSelectProduct={onSelectProduct}
            onQuickAdd={onQuickAdd}
            isFavorite={favorites.includes(products[0]?.id || '')}
            onToggleFavorite={onToggleFavorite}
          />
        )}

        {/* Filter Controls & Search Strip */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-xs mb-8 transition-colors space-y-4">
          
          {/* Row 1: Search & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-9 pr-8 py-2.5 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 transition-all outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400 shrink-0">
                {t('sortByLabel')}:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:border-emerald-500 outline-hidden cursor-pointer"
              >
                <option value="default">{t('sortDefault')}</option>
                <option value="price-asc">{t('sortPriceAsc')}</option>
                <option value="price-desc">{t('sortPriceDesc')}</option>
                <option value="savings-desc">{t('sortSavings')}</option>
                <option value="rating-desc">{t('sortRating')}</option>
              </select>
            </div>
          </div>

          {/* Row 2: Category Tabs & Quick Filter Toggles */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
            
            {/* Category Chips (Horizontally Scrollable on Mobile) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 w-full lg:w-auto">
              {PRODUCT_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCat(cat.id as ProductCategory)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <span>{tCategoryName(cat.id)}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Toggle Badges & Category Link Share */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {/* Share Category Link Button */}
              <button
                type="button"
                onClick={handleShareCategory}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  copiedCategoryLink
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border-emerald-200 dark:border-emerald-800'
                }`}
                title={isEn ? "Share link for this category / view" : "Salin pautan untuk kategori atau paparan ini"}
              >
                {copiedCategoryLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>{isEn ? 'Link Copied!' : 'Pautan Disalin!'}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>{isEn ? 'Share View' : 'Kongsi Pautan'}</span>
                  </>
                )}
              </button>
              {/* Promo Only */}
              <button
                onClick={() => setShowOnlyPromo(!showOnlyPromo)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  showOnlyPromo
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>{t('filterPromoOnly')}</span>
              </button>

              {/* Low Stock Only */}
              <button
                onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  showOnlyLowStock
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>{t('filterLowStock')}</span>
              </button>

              {/* Favorites Only */}
              <button
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  showOnlyFavorites
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-white' : ''}`} />
                <span>{t('filterFavorites')} ({favorites.length})</span>
              </button>

              {/* Reset Filters */}
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                  title={t('filterReset')}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t('filterReset')}</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* 3-Column Listing Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-4 text-stone-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">
              {t('noProductsFound')}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto mt-1">
              {searchQuery
                ? (isEn ? `No results found for "${searchQuery}". Please try other keywords.` : `Tiada hasil untuk carian "${searchQuery}". Sila cuba kata kunci lain.`)
                : (isEn ? 'No products match your selected filters.' : 'Tiada produk yang sepadan dengan tapisan yang dipilih.')}
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('showAllProducts')}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                index={idx}
                onSelectProduct={onSelectProduct}
                onQuickAdd={onQuickAdd}
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={onToggleFavorite}
                onNotifyStock={onNotifyStock}
              />
            ))}
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
            <span>{isEn ? 'Back to Top' : 'Kembali ke Atas'}</span>
          </button>

          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 dark:hover:bg-stone-700 text-white font-extrabold text-sm transition-all shadow-md cursor-pointer border border-stone-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('backToHomeBtn')}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
