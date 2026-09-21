import React, { useState, useRef } from 'react';
import { 
  ShoppingBag, 
  Search, 
  MapPin, 
  Calculator, 
  BookOpen, 
  Truck, 
  Menu, 
  X, 
  CheckCircle2,
  Phone,
  Heart,
  Crown,
  Sparkles,
  Award,
  ArrowRight,
  PackageOpen,
  ChevronRight,
  User,
  ShieldCheck,
  Lock,
  LogOut,
  SlidersHorizontal,
  Globe,
  Languages
} from 'lucide-react';
import { LoyaltyStatus } from '../utils/loyalty';
import { CartItem, UserAccount } from '../types';
import { getProductImageUrl } from '../utils/imageCompressor';
import { getProductImageAltText } from '../utils/productImage';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  cartCount: number;
  cartTotal: number;
  cartItems?: CartItem[];
  freeDeliveryThreshold?: number;
  onOpenCart: () => void;
  onOpenCoverage: () => void;
  onOpenCalculator: () => void;
  onOpenRecipes: () => void;
  onOpenTracking: () => void;
  onOpenWhatsApp: () => void;
  selectedPostcode: string;
  selectedCity: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isCartPulsing?: boolean;
  favoritesCount?: number;
  onToggleFavoritesOnly?: () => void;
  isFavoritesOnlyActive?: boolean;
  loyaltyStatus?: LoyaltyStatus;
  onOpenLoyalty?: () => void;
  currentUser?: UserAccount | null;
  onOpenAuth: () => void;
  onOpenCustomerPortal: () => void;
  onOpenAdminPortal: () => void;
  onLogout: () => void;
  activeView?: 'home' | 'all-products';
  onNavigateView?: (view: 'home' | 'all-products') => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  cartTotal,
  cartItems = [],
  freeDeliveryThreshold = 70,
  onOpenCart,
  onOpenCoverage,
  onOpenCalculator,
  onOpenRecipes,
  onOpenTracking,
  onOpenWhatsApp,
  selectedPostcode,
  selectedCity,
  searchQuery,
  onSearchChange,
  isCartPulsing = false,
  favoritesCount = 0,
  onToggleFavoritesOnly,
  isFavoritesOnlyActive = false,
  loyaltyStatus,
  onOpenLoyalty,
  currentUser = null,
  onOpenAuth,
  onOpenCustomerPortal,
  onOpenAdminPortal,
  onLogout,
  activeView = 'home',
  onNavigateView,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCartHovered, setIsCartHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterCart = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsCartHovered(true);
  };

  const handleMouseLeaveCart = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsCartHovered(false);
    }, 220);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          
          {/* Brand Logo & Name Only */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateView?.('home')}
              className="flex items-center gap-2.5 group cursor-pointer text-left"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white flex items-center justify-center shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform">
                <span className="text-xl sm:text-2xl" role="img" aria-label="ayam">🐔</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-stone-900 dark:text-white font-['Outfit'] leading-tight">
                  Khairul <span className="text-emerald-600 dark:text-emerald-400">Fresh Food</span>
                </span>
                <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 tracking-wider">
                  Ayam Halal Semenyih
                </span>
              </div>
            </button>
          </div>

          {/* Clean Navigation: Home, Produk, Promo, Tentang Kami, Resepi, Hubungi Kami */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => {
                onNavigateView?.('home');
                const el = document.getElementById('hero');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 text-sm font-extrabold transition-all cursor-pointer relative ${
                activeView === 'home'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-stone-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              <span>Home</span>
              {activeView === 'home' && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => {
                onNavigateView?.('all-products');
              }}
              className={`px-3 py-1.5 text-sm font-extrabold transition-all cursor-pointer relative ${
                activeView === 'all-products'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-stone-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              <span>Produk</span>
              {activeView === 'all-products' && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('promo-service-row') || document.getElementById('featured-products');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 text-sm font-extrabold text-rose-600 dark:text-rose-400 hover:text-rose-700 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Promo</span>
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('trust-badges') || document.getElementById('footer');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 text-sm font-extrabold text-stone-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer"
            >
              Tentang Kami
            </button>
            <button
              onClick={onOpenRecipes}
              className="px-3 py-1.5 text-sm font-extrabold text-stone-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer"
            >
              Resepi
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('footer');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else onOpenWhatsApp();
              }}
              className="px-3 py-1.5 text-sm font-extrabold text-stone-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer"
            >
              Hubungi Kami
            </button>
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-800 focus:bg-white dark:focus:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-full pl-9 pr-4 py-2 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 transition-all outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs cursor-pointer"
                >
                  {t('cancel')}
                </button>
              )}
            </div>
          </div>

          {/* Desktop Action Navigation & Tools */}
          <div className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={onOpenTracking}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{t('trackOrder')}</span>
            </button>
            <button
              onClick={onOpenWhatsApp}
              className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              title="Hubungi WhatsApp Bantuan: 011-11135503"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Bantuan: 011-11135503</span>
            </button>
          </div>

          {/* Right Header Actions: Language Switcher, User Auth, Loyalty Points, Favorites & Cart Button */}
          <div className="flex items-center gap-2">
            
            {/* Language Toggle Button (BM / BI) */}
            <div 
              className="flex items-center p-0.5 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-2xs"
              title={language === 'bm' ? 'Tukar ke Bahasa Inggeris (English)' : 'Switch to Bahasa Melayu'}
            >
              <button
                type="button"
                onClick={() => setLanguage('bm')}
                className={`px-2 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  language === 'bm'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
                aria-label="Tukar ke Bahasa Melayu"
              >
                <span>BM</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  language === 'en'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
                aria-label="Switch to English"
              >
                <span>BI</span>
              </button>
            </div>

            {/* User Account / Portal Selector Pill */}
            {currentUser ? (
              <div className="flex items-center gap-1">
                {currentUser.role === 'admin' ? (
                  <button
                    onClick={onOpenAdminPortal}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 transition-all cursor-pointer shadow-2xs group"
                    title="Buka Panel Pentadbir (Admin Portal)"
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left hidden sm:block">
                      <span className="text-xs font-black block leading-none">{t('adminPortal')}</span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400">{currentUser.name}</span>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={onOpenCustomerPortal}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 transition-all cursor-pointer shadow-2xs group"
                    title="Buka Portal Pelanggan (Pesanan & Alamat)"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left hidden sm:block">
                      <span className="text-xs font-black block leading-none">{t('myPortal')}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate max-w-[90px] block">{currentUser.name}</span>
                    </div>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="Log Masuk / Daftar Akaun Segar"
              >
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">{t('login')}</span>
              </button>
            )}

            {/* Loyalty Points Widget in Header */}
            {loyaltyStatus && onOpenLoyalty && (
              <button
                onClick={onOpenLoyalty}
                className="hidden md:flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100/80 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-800/80 text-stone-800 dark:text-stone-200 transition-all cursor-pointer shadow-2xs hover:shadow-sm group"
                title="Buka Status Mata Ganjaran & Tebus Baucar"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center font-bold shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <Crown className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-stone-900 dark:text-white font-['Outfit']">
                      {loyaltyStatus.currentPoints} <span className="text-[10px] text-stone-500 dark:text-stone-400 font-normal hidden sm:inline">{t('points')}</span>
                    </span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-amber-200/90 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                      {loyaltyStatus.currentTier}
                    </span>
                  </div>
                  {/* Mini Progress Bar */}
                  <div className="w-16 sm:w-20 bg-amber-200/80 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden mt-0.8 hidden xs:block">
                    <div
                      className="bg-amber-600 dark:bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${loyaltyStatus.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </button>
            )}

            {/* Quick Favorites Button */}
            {onToggleFavoritesOnly && (
              <button
                onClick={onToggleFavoritesOnly}
                className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isFavoritesOnlyActive
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 ring-2 ring-rose-200 dark:ring-rose-900'
                    : 'bg-stone-50 dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-stone-700 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-300 border-stone-200 dark:border-stone-700'
                }`}
                title="Lihat Produk Kegemaran Anda"
                aria-label="Produk Kegemaran"
              >
                <Heart className={`w-4 h-4 transition-transform ${favoritesCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-stone-500 dark:text-stone-400'}`} />
                <span className="hidden md:inline">{t('favorites')}</span>
                {favoritesCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                    {favoritesCount}
                  </span>
                )}
              </button>
            )}

            {/* Cart Button & Mini-Cart Hover Tooltip */}
            <div 
              className="relative"
              onMouseEnter={handleMouseEnterCart}
              onMouseLeave={handleMouseLeaveCart}
            >
              <button
                id="header-cart-btn"
                onClick={onOpenCart}
                className={`relative flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all duration-300 cursor-pointer ${
                  isCartPulsing
                    ? 'ring-4 ring-amber-400 shadow-xl shadow-amber-400/40 bg-emerald-500 animate-cart-shake'
                    : 'scale-100 shadow-emerald-700/20'
                }`}
                aria-label="Buka Troli Pesanan"
              >
                <div className={`relative transition-transform duration-300 ${isCartPulsing ? 'animate-cart-shake' : ''}`}>
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className={`absolute -top-2 -right-2 bg-red-600 text-white font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-stone-900 shadow-sm ${isCartPulsing ? 'scale-110 ring-2 ring-red-400 animate-bounce' : ''}`}>
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="flex flex-col text-left leading-tight hidden xs:block">
                  <span className="text-[10px] text-emerald-100 uppercase tracking-wider font-bold">
                    {t('cart')}
                  </span>
                  <span className="text-xs sm:text-sm font-bold">
                    RM {cartTotal.toFixed(2)}
                  </span>
                </div>
              </button>

              {/* Mini-Cart Summary Tooltip (Hover Preview) */}
              {isCartHovered && (
                <div 
                  className="absolute right-0 top-full mt-2.5 z-50 w-72 sm:w-80 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200/90 dark:border-stone-800 p-3.5 sm:p-4 text-stone-900 dark:text-stone-100 animate-fade-in-up"
                  role="tooltip"
                >
                  {/* Tooltip top triangle tip */}
                  <div className="absolute -top-1.5 right-6 w-3 h-3 bg-white dark:bg-stone-900 border-t border-l border-stone-200 dark:border-stone-800 rotate-45" />

                  {/* Header bar */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-1.5 text-xs font-black text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                      <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Ringkasan Troli</span>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      cartCount > 0 ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}>
                      {cartCount > 0 ? `${cartCount} item` : 'Kosong'}
                    </span>
                  </div>

                  {/* Body: Empty or Populated */}
                  {cartCount === 0 ? (
                    <div className="py-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 flex items-center justify-center mx-auto mb-2">
                        <PackageOpen className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-stone-700 dark:text-stone-300">Troli anda masih kosong</p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 max-w-[210px] mx-auto">
                        Pilih bahagian ayam segar atau ayam kampung untuk mula mengisi pesanan.
                      </p>
                    </div>
                  ) : (
                    <div className="py-2.5 space-y-2.5">
                      {/* Quick value summary banner */}
                      <div className="bg-stone-50 dark:bg-stone-800/80 p-2.5 rounded-xl border border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 block">Nilai Troli Semasa</span>
                          <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">{cartCount} unit pesanan</span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-black text-emerald-700 dark:text-emerald-400 font-['Outfit']">
                            RM {cartTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Quick item list preview (up to 3 items) */}
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {cartItems.slice(0, 3).map((item) => (
                          <div key={item.cartItemId} className="flex items-center justify-between gap-2 text-xs py-1 border-b border-stone-100/70 dark:border-stone-800 last:border-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={getProductImageUrl(item.product) || item.product.image}
                                alt={getProductImageAltText(item.product)}
                                title={getProductImageAltText(item.product)}
                                className="w-8 h-8 rounded-lg object-cover border border-stone-200 dark:border-stone-700 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate leading-tight">
                                  {item.product.name}
                                </p>
                                <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                                  {item.quantity} × RM {item.product.price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-stone-900 dark:text-white shrink-0">
                              RM {item.itemTotalPrice.toFixed(2)}
                            </span>
                          </div>
                        ))}
                        {cartItems.length > 3 && (
                          <p className="text-[10px] text-center text-stone-500 dark:text-stone-400 font-medium pt-1">
                            + {cartItems.length - 3} lagi jenis item dalam troli
                          </p>
                        )}
                      </div>

                      {/* Delivery Discount Indicator */}
                      {cartTotal >= (freeDeliveryThreshold || 150) ? (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Layak Diskaun Penghantaran RM6.00!</span>
                        </div>
                      ) : (
                        <div className="bg-amber-50/80 dark:bg-amber-950/50 p-2 rounded-lg border border-amber-200/80 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200">
                          <div className="flex items-center justify-between mb-1 text-[10px] font-bold">
                            <span>Diskaun Penghantaran RM6</span>
                            <span>RM {((freeDeliveryThreshold || 150) - cartTotal).toFixed(2)} lagi</span>
                          </div>
                          <div className="w-full bg-amber-200/70 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-amber-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, (cartTotal / (freeDeliveryThreshold || 150)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* View Full Cart Button */}
                      <button
                        onClick={() => {
                          setIsCartHovered(false);
                          onOpenCart();
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <span>Buka & Semak Troli Penuh</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="mt-2.5 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari ayam segar, bahagian potongan..."
              className="w-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg pl-9 pr-4 py-2 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-stone-200 dark:border-stone-800 flex flex-col gap-2 pb-2">
            
            {/* Mobile Language Switcher Bar */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{language === 'bm' ? 'Bahasa Paparan' : 'Display Language'}</span>
              </div>
              <div className="flex items-center p-0.5 bg-stone-200 dark:bg-stone-700 rounded-lg">
                <button
                  type="button"
                  onClick={() => setLanguage('bm')}
                  className={`px-3 py-1 rounded-md text-xs font-extrabold transition-all cursor-pointer ${
                    language === 'bm'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-stone-600 dark:text-stone-300'
                  }`}
                >
                  BM
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-md text-xs font-extrabold transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-stone-600 dark:text-stone-300'
                  }`}
                >
                  BI
                </button>
              </div>
            </div>

            {/* Page Navigation Tabs in Mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-1.5 bg-stone-100 dark:bg-stone-800 rounded-2xl mb-1">
              <button
                onClick={() => {
                  onNavigateView?.('home');
                  setMobileMenuOpen(false);
                  const el = document.getElementById('hero');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                  activeView === 'home'
                    ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                    : 'text-stone-700 dark:text-stone-300'
                }`}
              >
                🏠 Home
              </button>
              <button
                onClick={() => {
                  onNavigateView?.('all-products');
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                  activeView === 'all-products'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-stone-700 dark:text-stone-300'
                }`}
              >
                🍗 Produk
              </button>
              <button
                onClick={() => {
                  onNavigateView?.('all-products');
                  setMobileMenuOpen(false);
                  const el = document.getElementById('featured-products');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-2 px-3 rounded-xl text-xs font-bold text-center bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 cursor-pointer"
              >
                🔥 Promo
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  const el = document.getElementById('about-section') || document.getElementById('why-choose-us');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-2 px-3 rounded-xl text-xs font-bold text-center text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-900 cursor-pointer"
              >
                ℹ️ Tentang Kami
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenWhatsApp();
                }}
                className="py-2 px-3 rounded-xl text-xs font-bold text-center text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-900 cursor-pointer"
              >
                💬 Hubungi Kami
              </button>
            </div>

            {/* User Account Bar in Mobile */}
            {currentUser ? (
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                    currentUser.role === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600'
                  }`}>
                    {currentUser.role === 'admin' ? <Lock className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-stone-900 dark:text-white block">{currentUser.name}</span>
                    <span className="text-[10px] text-stone-500 uppercase">{currentUser.role === 'admin' ? 'Pentadbir (Admin)' : 'Pelanggan'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (currentUser.role === 'admin') onOpenAdminPortal();
                      else onOpenCustomerPortal();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    Buka Portal
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600"
                    title="Log Keluar"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-sm font-bold"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Log Masuk / Daftar Akaun</span>
                </div>
                <span className="text-xs bg-emerald-600 text-white px-2.5 py-1 rounded-lg">Masuk</span>
              </button>
            )}

            {loyaltyStatus && onOpenLoyalty && (
              <button
                onClick={() => {
                  onOpenLoyalty();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-stone-800 dark:text-stone-200 text-sm font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center font-bold">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-stone-900 dark:text-white block text-xs">Mata Ganjaran: {loyaltyStatus.currentPoints} Mata</span>
                    <span className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold">Ahli {loyaltyStatus.currentTier} ({loyaltyStatus.progressPercentage}% ke {loyaltyStatus.nextTier || 'Max'})</span>
                  </div>
                </div>
                <span className="text-xs bg-amber-600 text-white font-bold px-2.5 py-1 rounded-lg">Tebus</span>
              </button>
            )}

            <button
              onClick={() => {
                onOpenCoverage();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between p-2 rounded-lg bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Hantar ke: {selectedCity ? `${selectedCity} (${selectedPostcode})` : 'Pilih Kawasan'}
              </span>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Tukar</span>
            </button>

            {onToggleFavoritesOnly && (
              <button
                onClick={() => {
                  onToggleFavoritesOnly();
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between p-2 rounded-lg text-sm font-medium ${
                  isFavoritesOnlyActive ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' : 'text-stone-700 dark:text-stone-300 hover:bg-rose-50 dark:hover:bg-stone-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  Produk Kegemaran Saya
                </span>
                <span className="text-xs font-bold bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 px-2 py-0.5 rounded-full">
                  {favoritesCount} item
                </span>
              </button>
            )}

            <button
              onClick={() => {
                onOpenTracking();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-stone-800 text-sm font-medium"
            >
              <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Jejak Status Pesanan
            </button>

            <button
              onClick={() => {
                onOpenWhatsApp();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between p-2.5 rounded-xl text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold"
            >
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                Bantuan WhatsApp
              </span>
              <span className="font-mono bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[11px]">
                011-11135503
              </span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

