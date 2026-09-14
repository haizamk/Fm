import React, { useState, useEffect, useMemo } from 'react';
import { 
  Product, 
  CartItem, 
  OrderRecord, 
  ChickenCutId, 
  CleaningOptionId, 
  PackagingOptionId,
  ProductCategory,
  CoverageArea,
  UserAccount,
  SiteSettings,
  CouponCode,
  RotationBannerItem,
  ProductWeightOption
} from './types';
import { COVERAGE_AREAS } from './data/coverage';
import { getLoyaltyStatus } from './utils/loyalty';
import { getProductImageUrl } from './utils/productImage';
import { getOfficialWhatsAppLink, getWhatsAppOrderLink } from './utils/whatsappHelper';
import { authService } from './services/auth';
import { dataStorageService } from './services/dataStorage';
import { fonnteService } from './services/fonnteService';

// Components
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { RotationBanner } from './components/RotationBanner';
import { ProductCard } from './components/ProductCard';
import { ProductSkeleton, ProductGridSkeleton } from './components/ProductSkeleton';
import { ProductCutModal } from './components/ProductCutModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { PartyCalculatorModal } from './components/PartyCalculatorModal';
import { CoverageChecker } from './components/CoverageChecker';
import { RecipeModal } from './components/RecipeModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { LoyaltyModal } from './components/LoyaltyModal';
import { QualityGuarantee } from './components/QualityGuarantee';
import { CustomerReviews } from './components/CustomerReviews';
import { FAQAccordion } from './components/FAQAccordion';
import { Footer } from './components/Footer';
import { FloatingProductOverlay, FlyingProductItem } from './components/FloatingProductOverlay';

// Portals & Secure Authentication Components (Code-Split / Lazy Loaded for Performance)
import { AuthModal } from './components/AuthModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { NotifyStockModal } from './components/NotifyStockModal';
import { NotificationToast } from './components/NotificationToast';
import { AllProductsPage } from './components/AllProductsPage';
import { BackToTop } from './components/BackToTop';
import { PortalLoadingFallback } from './components/PortalLoadingFallback';

// Lazy-loaded portal components to reduce main bundle size
const CustomerPortal = React.lazy(() => import('./components/CustomerPortal'));
const AdminPortal = React.lazy(() => import('./components/AdminPortal'));

import { 
  Search, 
  Scissors, 
  Sparkles, 
  PhoneCall, 
  Truck, 
  MessageCircle, 
  Check, 
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Flame,
  Heart,
  User,
  Lock,
  ArrowRight,
  Grid,
  Layers
} from 'lucide-react';

export default function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => authService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const [isCustomerPortalOpen, setIsCustomerPortalOpen] = useState<boolean>(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState<boolean>(false);

  // Products & Site Settings from Data Storage Service
  const [productsList, setProductsList] = useState<Product[]>(() => dataStorageService.getProducts());
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => dataStorageService.getSiteSettings());
  const [banners, setBanners] = useState<RotationBannerItem[]>(() => dataStorageService.getRotationBanners());

  // Cart state with localStorage persistence
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('freshayam_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('freshayam_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // Favorites state with localStorage persistence
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('freshayam_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('freshayam_favorites', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  // Dark/Light Theme state with localStorage persistence & system preference fallback
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('freshayam_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('freshayam_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('freshayam_theme', 'light');
      }
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Loyalty Points & Total Spent State
  const loyaltyPoints = currentUser?.loyaltyPoints ?? 0;
  const loyaltyTotalSpent = currentUser?.totalSpent ?? 0.0;

  const loyaltyStatus = useMemo(() => {
    return getLoyaltyStatus(loyaltyPoints, loyaltyTotalSpent);
  }, [loyaltyPoints, loyaltyTotalSpent]);

  // Cart animation state (pulse / scale-up on add)
  const [isCartPulsing, setIsCartPulsing] = useState<boolean>(false);
  const [flyingItems, setFlyingItems] = useState<FlyingProductItem[]>([]);

  const triggerCartPulse = () => {
    setIsCartPulsing(true);
    setTimeout(() => {
      setIsCartPulsing(false);
    }, 700);
  };

  const handleFlyingAnimationComplete = (id: string) => {
    setFlyingItems((prev) => prev.filter((item) => item.id !== id));
    triggerCartPulse();
  };

  // Selected delivery location (Empty by default)
  const [selectedPostcode, setSelectedPostcode] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Search, category, loading, favorites and stock filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('semua');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
  const [showOnlyLowStock, setShowOnlyLowStock] = useState<boolean>(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);

  // Initial loading simulation for smooth initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingProducts(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Real-time Firestore Cloud Synchronization
  useEffect(() => {
    // Initial sync
    dataStorageService.syncInitialDataFromCloud();

    // Realtime listeners
    const unsubProducts = dataStorageService.subscribeProducts((prods) => {
      setProductsList(prods);
    });

    const unsubSettings = dataStorageService.subscribeSiteSettings((settings) => {
      setSiteSettings(settings);
    });

    const unsubCoupons = dataStorageService.subscribeCoupons(() => {
      // coupons updated
    });

    return () => {
      unsubProducts();
      unsubSettings();
      unsubCoupons();
    };
  }, []);

  // Category switch handler with brief skeleton shimmer
  const handleSelectCategory = (catId: ProductCategory) => {
    setShowOnlyFavorites(false);
    setShowOnlyLowStock(false);
    setSelectedCategory(catId);
    setIsLoadingProducts(true);
    setTimeout(() => {
      setIsLoadingProducts(false);
    }, 280);
  };

  // Favorites toggle with brief skeleton shimmer
  const handleToggleShowFavorites = () => {
    setShowOnlyFavorites((prev) => !prev);
    setShowOnlyLowStock(false);
    setIsLoadingProducts(true);
    setTimeout(() => {
      setIsLoadingProducts(false);
    }, 250);
  };

  // Low stock toggle with brief skeleton shimmer
  const handleToggleShowLowStock = () => {
    setShowOnlyLowStock((prev) => !prev);
    setShowOnlyFavorites(false);
    setIsLoadingProducts(true);
    setTimeout(() => {
      setIsLoadingProducts(false);
    }, 250);
  };

  // Navigation Views: 'home' (6 featured items, 2x3 grid) vs 'all-products' (full catalog, 3 per row)
  const [currentView, setCurrentView] = useState<'home' | 'all-products'>('home');

  // Modals state
  const [isCutModalOpen, setIsCutModalOpen] = useState<boolean>(false);
  const [selectedProductForCut, setSelectedProductForCut] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState<boolean>(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isCoverageOpen, setIsCoverageOpen] = useState<boolean>(false);
  const [isRecipeOpen, setIsRecipeOpen] = useState<boolean>(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState<boolean>(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState<boolean>(false);
  const [stockNotifyProduct, setStockNotifyProduct] = useState<Product | null>(null);
  const [activeOrder, setActiveOrder] = useState<OrderRecord | null>(null);

  // Coupon state in Cart (Supports 1 item discount coupon + 1 delivery discount coupon concurrently)
  const [appliedItemCoupon, setAppliedItemCoupon] = useState<CouponCode | null>(null);
  const [itemCouponDiscount, setItemCouponDiscount] = useState<number>(0);
  const [appliedDeliveryCoupon, setAppliedDeliveryCoupon] = useState<CouponCode | null>(null);
  const [deliveryCouponDiscount, setDeliveryCouponDiscount] = useState<number>(0);

  // Cart totals
  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.itemTotalPrice || 0), 0);
  }, [cartItems]);

  const handleApplyCouponCode = (code: string): { success: boolean; message: string } => {
    const res = dataStorageService.validateCoupon(code, cartTotal, 6.00);
    if (res.valid && res.coupon) {
      if (res.type === 'delivery' || res.coupon.discountType === 'delivery' || res.coupon.category === 'delivery') {
        setAppliedDeliveryCoupon(res.coupon);
        setDeliveryCouponDiscount(res.discount || 0);
        return { 
          success: true, 
          message: `${res.message}${appliedItemCoupon ? ` (Kupon produk ${appliedItemCoupon.code} masih kekal)` : ''}` 
        };
      } else {
        setAppliedItemCoupon(res.coupon);
        setItemCouponDiscount(res.discount || 0);
        return { 
          success: true, 
          message: `${res.message}${appliedDeliveryCoupon ? ` (Kupon penghantaran ${appliedDeliveryCoupon.code} masih kekal)` : ''}` 
        };
      }
    }
    return { success: false, message: res.message || 'Kod kupon tidak sah.' };
  };

  const handleRemoveCoupon = (type: 'item' | 'delivery' | 'all' = 'all') => {
    if (type === 'item') {
      setAppliedItemCoupon(null);
      setItemCouponDiscount(0);
    } else if (type === 'delivery') {
      setAppliedDeliveryCoupon(null);
      setDeliveryCouponDiscount(0);
    } else {
      setAppliedItemCoupon(null);
      setItemCouponDiscount(0);
      setAppliedDeliveryCoupon(null);
      setDeliveryCouponDiscount(0);
    }
  };

  // Keep coupon discount updated if cart total changes
  useEffect(() => {
    if (appliedItemCoupon) {
      const res = dataStorageService.validateCoupon(appliedItemCoupon.code, cartTotal, 6.00);
      if (res.valid) {
        setItemCouponDiscount(res.discount || 0);
      } else {
        setItemCouponDiscount(0);
      }
    } else {
      setItemCouponDiscount(0);
    }

    if (appliedDeliveryCoupon) {
      const res = dataStorageService.validateCoupon(appliedDeliveryCoupon.code, cartTotal, 6.00);
      if (res.valid) {
        setDeliveryCouponDiscount(res.discount || 0);
      } else {
        setDeliveryCouponDiscount(0);
      }
    } else {
      setDeliveryCouponDiscount(0);
    }
  }, [cartTotal, appliedItemCoupon, appliedDeliveryCoupon]);

  // Free delivery threshold for active postcode or site settings
  const currentArea = COVERAGE_AREAS.find((a) => a.postcode === selectedPostcode);
  const freeDeliveryThreshold = currentArea ? currentArea.freeShippingMin : siteSettings.freeShippingMinAmount;

  // Low stock products count
  const lowStockCount = useMemo(() => {
    return productsList.filter((p) => p.remainingStock !== undefined && p.remainingStock <= 5).length;
  }, [productsList]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return productsList.filter((product) => {
      // Low stock only filter
      if (showOnlyLowStock) {
        if (product.remainingStock === undefined || product.remainingStock > 5) {
          return false;
        }
      }
      // Favorites filter
      if (showOnlyFavorites && !favorites.includes(product.id)) {
        return false;
      }
      // Category match
      if (!showOnlyFavorites && !showOnlyLowStock && selectedCategory !== 'semua' && product.category !== selectedCategory) {
        return false;
      }
      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchSubtitle = product.subtitle.toLowerCase().includes(q);
        const matchTags = product.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchSubtitle && !matchTags) return false;
      }
      return true;
    });
  }, [productsList, selectedCategory, searchQuery, showOnlyFavorites, showOnlyLowStock, favorites]);

  // Top 6 Featured Products for Frontpage (2x3 Grid Layout)
  const featuredProducts = useMemo(() => {
    return productsList.slice(0, 6);
  }, [productsList]);

  // Cart operations
  const handleOpenCutModal = (product: Product) => {
    setSelectedProductForCut(product);
    setIsCutModalOpen(true);
  };

  const handleQuickAdd = (product: Product, sourceRect?: DOMRect | { left: number; top: number; width?: number; height?: number }) => {
    // 1. Calculate trajectory coordinates for floating animation moving into the cart icon
    try {
      const cartBtn = document.getElementById('header-cart-btn');
      let endX = window.innerWidth - 65;
      let endY = 32;

      if (cartBtn) {
        const rect = cartBtn.getBoundingClientRect();
        endX = rect.left + rect.width / 2;
        endY = rect.top + rect.height / 2;
      }

      let startX = window.innerWidth / 2;
      let startY = window.innerHeight / 2;

      if (sourceRect) {
        startX = sourceRect.left + (sourceRect.width ? sourceRect.width / 2 : 0);
        startY = sourceRect.top + (sourceRect.height ? sourceRect.height / 2 : 0);
      }

      const imageUrl = getProductImageUrl(product);
      const flyingId = `${product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      const newFlyingItem: FlyingProductItem = {
        id: flyingId,
        startX,
        startY,
        endX,
        endY,
        imageUrl,
        name: product.name,
      };

      setFlyingItems((prev) => [...prev, newFlyingItem]);
    } catch {
      // Graceful fallback if DOM measurement fails
    }

    // 2. For products without cut selection (like wings, drumstick, etc.)
    const existingIndex = cartItems.findIndex(
      (item) => item.product.id === product.id && item.selectedCut === 'utuh-tak-potong'
    );

    if (existingIndex > -1) {
      const updated = [...cartItems];
      const existing = updated[existingIndex];
      const newQty = existing.quantity + 1;
      updated[existingIndex] = {
        ...existing,
        quantity: newQty,
        itemTotalPrice: product.price * newQty,
      };
      setCartItems(updated);
    } else {
      const newItem: CartItem = {
        cartItemId: `${product.id}-${Date.now()}`,
        product,
        quantity: 1,
        selectedCut: 'utuh-tak-potong',
        selectedCleaning: ['standard-bersih'],
        packaging: 'standard-chilled',
        itemTotalPrice: product.price,
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const handleAddToCartWithCut = (
    product: Product,
    quantity: number,
    selectedCut: ChickenCutId,
    selectedCleaning: CleaningOptionId[],
    packaging: PackagingOptionId,
    specialNotes: string,
    totalItemPrice: number,
    bakarOption?: 'bakar' | 'tak-bakar',
    organVariation?: string,
    organVariationLabel?: string,
    selectedWeightOption?: ProductWeightOption
  ) => {
    const newItem: CartItem = {
      cartItemId: `${product.id}-${selectedCut}-${packaging}-${organVariation || 'std'}-${bakarOption || 'nb'}-${selectedWeightOption?.id || 'w0'}-${Date.now()}`,
      product,
      quantity,
      selectedCut,
      selectedCleaning,
      packaging,
      specialNotes,
      itemTotalPrice: totalItemPrice,
      bakarOption,
      organVariation,
      organVariationLabel,
      selectedWeightOption,
    };

    setCartItems((prev) => [...prev, newItem]);
    triggerCartPulse();
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const unitPrice = item.itemTotalPrice / item.quantity;
          return {
            ...item,
            quantity: newQty,
            itemTotalPrice: unitPrice * newQty,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleBulkAddFromCalculator = (
    product: Product,
    quantity: number,
    cut: ChickenCutId
  ) => {
    const newItem: CartItem = {
      cartItemId: `${product.id}-bulk-${Date.now()}`,
      product,
      quantity,
      selectedCut: cut,
      selectedCleaning: ['standard-bersih'],
      packaging: 'standard-chilled',
      specialNotes: 'Tempahan Katering / Jamuan Kenduri',
      itemTotalPrice: product.price * quantity,
    };
    setCartItems((prev) => [...prev, newItem]);
    triggerCartPulse();
    setIsCartOpen(true);
  };

  const handleCompleteOrder = (order: OrderRecord) => {
    setActiveOrder(order);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setCartItems([]);
    setAppliedItemCoupon(null);
    setItemCouponDiscount(0);
    setAppliedDeliveryCoupon(null);
    setDeliveryCouponDiscount(0);
    try {
      localStorage.removeItem('freshayam_cart');
    } catch {
      // ignore
    }

    // Central persistence in data storage
    dataStorageService.addOrder(order, currentUser?.name || order.customer.fullName);

    // Auto-dispatch WhatsApp notification to Admin & Customer via Fonnte Gateway
    fonnteService.triggerNewOrderNotification(order).catch((err) => {
      console.warn('Fonnte auto-dispatch background error:', err);
    });

    // Update user's loyalty points & total spent if logged in
    const pointsEarned = Math.round(order.total);
    if (currentUser) {
      const updatedUser = authService.updateUserProfile({
        loyaltyPoints: (currentUser.loyaltyPoints || 0) + pointsEarned,
        totalSpent: (currentUser.totalSpent || 0) + order.total,
      });
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
    }

    setIsOrderSuccessOpen(true);
  };

  const handleReorderFromPortal = (items: CartItem[]) => {
    setCartItems((prev) => [...prev, ...items]);
    triggerCartPulse();
    setIsCartOpen(true);
  };

  const handleOpenWhatsAppHotline = () => {
    const url = getOfficialWhatsAppLink(
      'Salam Khairul Fresh Food, saya ingin bertanya mengenai pesanan ayam segar.',
      siteSettings.supportPhone || '011-11135503'
    );
    window.open(url, '_blank');
  };

  const handleQuickWhatsAppOrder = () => {
    if (cartItems.length === 0) return;
    const url = getWhatsAppOrderLink(
      cartItems,
      cartTotal,
      selectedCity,
      selectedPostcode
    );
    window.open(url, '_blank');
  };

  const scrollToProducts = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsCustomerPortalOpen(false);
    setIsAdminPortalOpen(false);
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-emerald-500 selection:text-white flex flex-col transition-colors duration-200">
      
      {/* Announcement Bar */}
      <AnnouncementBar
        onOpenCoverage={() => setIsCoverageOpen(true)}
        onOpenWhatsApp={handleOpenWhatsAppHotline}
        siteSettings={siteSettings}
      />

      {/* Main Sticky Header */}
      <Header
        cartCount={cartCount}
        cartTotal={cartTotal}
        cartItems={cartItems}
        freeDeliveryThreshold={freeDeliveryThreshold}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCoverage={() => setIsCoverageOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenRecipes={() => setIsRecipeOpen(true)}
        onOpenTracking={() => setIsTrackingOpen(true)}
        onOpenWhatsApp={handleOpenWhatsAppHotline}
        selectedPostcode={selectedPostcode}
        selectedCity={selectedCity}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isCartPulsing={isCartPulsing}
        favoritesCount={favorites.length}
        onToggleFavoritesOnly={() => {
          handleToggleShowFavorites();
          scrollToProducts();
        }}
        isFavoritesOnlyActive={showOnlyFavorites}
        loyaltyStatus={loyaltyStatus}
        onOpenLoyalty={() => setIsLoyaltyOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenCustomerPortal={() => setIsCustomerPortalOpen(true)}
        onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
        onLogout={handleLogout}
        activeView={currentView}
        onNavigateView={(v) => setCurrentView(v)}
      />

      {/* Portal Shortcut Banner for Logged In Users */}
      {currentUser && (
        <div className={`py-2 px-4 text-xs font-bold transition-colors flex items-center justify-between border-b ${
          currentUser.role === 'admin' 
            ? 'bg-indigo-900 text-indigo-100 border-indigo-800' 
            : 'bg-emerald-950 text-emerald-100 border-emerald-900'
        }`}>
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>
                {currentUser.role === 'admin' ? '🛡️ Mod Pentadbir Aktif' : '👤 Akaun Pelanggan Aktif'}: <strong>{currentUser.name}</strong> ({currentUser.email})
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (currentUser.role === 'admin') setIsAdminPortalOpen(true);
                  else setIsCustomerPortalOpen(true);
                }}
                className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {currentUser.role === 'admin' ? 'Buka Admin Panel' : 'Urus Pesanan & Alamat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area: Frontpage (Home) vs All Products Catalog */}
      {currentView === 'all-products' ? (
        <AllProductsPage
          products={productsList}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onSelectProduct={handleOpenCutModal}
          onQuickAdd={handleQuickAdd}
          onNotifyStock={(p) => setStockNotifyProduct(p)}
          onBackToHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          initialSearchQuery={searchQuery}
        />
      ) : (
        <>
          {/* Hero Banner with value proposition & quick postcode entry */}
          <HeroBanner
            onCheckPostcode={(code) => {
              setSelectedPostcode(code);
              setIsCoverageOpen(true);
            }}
            onExploreProducts={scrollToProducts}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
          />

          {/* 12-Second Auto-Rotating Promotion & Announcement Banner */}
          <RotationBanner
            banners={banners}
            currentUser={currentUser}
            onOpenAdminPortal={() => {
              if (currentUser?.role === 'admin') {
                setIsAdminPortalOpen(true);
              } else {
                setIsAdminAuthModalOpen(true);
              }
            }}
            onCtaClick={(action) => {
              if (action === 'catalog') {
                scrollToProducts();
              } else if (action === 'pickup') {
                setIsCoverageOpen(true);
              } else if (action === 'cutting') {
                setIsRecipeOpen(true);
              } else if (action === 'all-products') {
                setCurrentView('all-products');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else if (action === 'whatsapp') {
                handleOpenWhatsAppHotline();
              } else {
                scrollToProducts();
              }
            }}
          />

          {/* Frontpage Main 6 Featured Products Section (2x3 Grid) */}
          <main id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 flex-1 w-full">
            
            {/* Daily Stock Limit Urgency Notification Banner */}
            {lowStockCount > 0 && (
              <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-amber-500/10 dark:from-amber-950/50 dark:via-rose-950/50 dark:to-amber-950/40 border border-amber-300 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start sm:items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs shrink-0">
                    <Flame className="w-5 h-5 fill-amber-200" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                      Makluman Had Stok Ayam Segar Hari Ini
                    </h3>
                    <p className="text-[11px] sm:text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                      Terdapat <strong className="text-rose-700 dark:text-rose-400 font-extrabold">{lowStockCount} produk ayam</strong> yang hampir kehabisan baki stok harian. Tempah awal untuk menjamin slot anda!
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCurrentView('all-products');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 bg-rose-600 text-white hover:bg-rose-700 shadow-2xs"
                >
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>Semak Semua Stok Terhad</span>
                </button>
              </div>
            )}

            {/* Frontpage Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>⭐ 6 PRODUK UTAMA PILIHAN RAMAI</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 dark:text-white font-['Outfit']">
                  Pilihan Utama Segar Setiap Hari
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-xl">
                  6 produk ayam segar yang paling kerap ditempah oleh suri rumah & peniaga. Dipotong percuma mengikut citarasa masakan anda.
                </p>
              </div>

              {/* View All Products Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCurrentView('all-products');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Lihat Semua Produk ({productsList.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 6 Featured Products Grid - 2 Rows x 3 Columns Layout on Desktop */}
            {isLoadingProducts ? (
              <ProductGridSkeleton count={6} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {featuredProducts.map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={idx}
                    onSelectProduct={handleOpenCutModal}
                    onQuickAdd={handleQuickAdd}
                    isFavorite={favorites.includes(product.id)}
                    onToggleFavorite={toggleFavorite}
                    onNotifyStock={(p) => setStockNotifyProduct(p)}
                  />
                ))}
              </div>
            )}

            {/* Dedicated CTA Block to explore All Products page */}
            <div className="mt-8 p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-stone-900 text-white flex flex-col md:flex-row items-center justify-between gap-5 shadow-lg border border-emerald-700/40">
              <div className="space-y-1 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1 border border-emerald-400/30">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Katalog Lengkap {productsList.length} Pilihan</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-['Outfit']">
                  Ingin Terokai Semua Pilihan Ayam & Potongan?
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/85 max-w-xl">
                  Buka halaman katalog penuh untuk melihat pelbagai variasi ayam kampung, dada fillet, kepak, tulang sup, pek jimat dan ayam perap sedia masak (3 item setiap baris).
                </p>
              </div>

              <button
                onClick={() => {
                  setCurrentView('all-products');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer hover:scale-102 active:scale-98"
              >
                <span>Buka Katalog Keseluruhan Produk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Special Bulk & Wholesale Promotion Banner */}
            <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 text-white relative overflow-hidden border border-emerald-900/50 shadow-xl">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-400/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Khas Untuk Majlis, Kenduri & Peniaga Kedai Makan</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black font-['Outfit'] leading-snug">
                  Perlukan Ayam Segar Dalam Kuantiti Banyak?
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
                  Dapatkan harga borong terus dari ladang dengan pilihan potongan kenduri seragam (Potong 12 / Potong 16) serta penghantaran percuma terus ke dewan kenduri atau dapur restoran anda.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => setIsCalculatorOpen(true)}
                    className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Gunakan Kalkulator Kenduri</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleOpenWhatsAppHotline}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-colors flex items-center gap-2 cursor-pointer border border-white/15"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Bincang Tempahan Katering WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>

          </main>

          {/* 4 Pillars Quality Guarantee Section */}
          <QualityGuarantee />

          {/* Customer Reviews & Social Proof */}
          <CustomerReviews />

          {/* Frequently Asked Questions (FAQ) Accordion */}
          <FAQAccordion />
        </>
      )}

      {/* Footer */}
      <Footer
        onOpenCoverage={() => setIsCoverageOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenRecipes={() => setIsRecipeOpen(true)}
        onOpenTracking={() => setIsTrackingOpen(true)}
        onOpenWhatsApp={handleOpenWhatsAppHotline}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenAdminPortal={() => {
          if (currentUser?.role === 'admin') {
            setIsAdminPortalOpen(true);
          } else {
            setIsAdminAuthModalOpen(true);
          }
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Floating WhatsApp Action Button */}
      <button
        onClick={handleOpenWhatsAppHotline}
        className="fixed bottom-5 right-5 z-40 bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer group"
        title="Hubungi Talian WhatsApp Khairul Fresh Food"
        aria-label="WhatsApp Kami"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden group-hover:inline-block text-xs font-bold pr-1">
          WhatsApp Kami ({siteSettings.supportPhone})
        </span>
      </button>

      {/* Floating Back to Top Button */}
      <BackToTop />

      {/* MODALS & PORTALS */}

      {/* 0. Customer Portal Auth Modal (Customer Login / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsCustomerPortalOpen(true);
        }}
      />

      {/* 0.0 Admin Portal Auth Modal (Dedicated Admin Login) */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAdminPortalOpen(true);
        }}
      />

      {/* 0.1 Customer Management Portal (Lazy Loaded) */}
      {currentUser && isCustomerPortalOpen && (
        <React.Suspense fallback={<PortalLoadingFallback title="Memuatkan Portal Pelanggan..." type="customer" />}>
          <CustomerPortal
            isOpen={isCustomerPortalOpen}
            onClose={() => setIsCustomerPortalOpen(false)}
            user={currentUser}
            onLogout={handleLogout}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            onReorder={handleReorderFromPortal}
            onOpenCoverage={() => {
              setIsCustomerPortalOpen(false);
              setIsCoverageOpen(true);
            }}
          />
        </React.Suspense>
      )}

      {/* 0.2 Admin Management Portal (Lazy Loaded) */}
      {currentUser && currentUser.role === 'admin' && isAdminPortalOpen && (
        <React.Suspense fallback={<PortalLoadingFallback title="Memuatkan Portal Pentadbir..." type="admin" />}>
          <AdminPortal
            isOpen={isAdminPortalOpen}
            onClose={() => setIsAdminPortalOpen(false)}
            adminUser={currentUser}
            onLogout={handleLogout}
            onProductsUpdated={(prods) => setProductsList(prods)}
            onSettingsUpdated={(settings) => setSiteSettings(settings)}
            banners={banners}
            onBannersUpdated={(updated) => setBanners(updated)}
          />
        </React.Suspense>
      )}
      
      {/* 1. Custom Chicken Cut & Cleaning Modal */}
      <ProductCutModal
        product={selectedProductForCut}
        isOpen={isCutModalOpen}
        onClose={() => {
          setIsCutModalOpen(false);
          setSelectedProductForCut(null);
        }}
        onAddToCart={handleAddToCartWithCut}
      />

      {/* 2. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onQuickWhatsAppOrder={handleQuickWhatsAppOrder}
        freeDeliveryThreshold={freeDeliveryThreshold}
        appliedItemCoupon={appliedItemCoupon}
        appliedDeliveryCoupon={appliedDeliveryCoupon}
        itemCouponDiscount={itemCouponDiscount}
        deliveryCouponDiscount={deliveryCouponDiscount}
        onApplyCoupon={handleApplyCouponCode}
        onRemoveCoupon={handleRemoveCoupon}
      />

      {/* 3. Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        defaultPostcode={selectedPostcode}
        defaultCity={selectedCity}
        onCompleteOrder={handleCompleteOrder}
        appliedItemCoupon={appliedItemCoupon}
        appliedDeliveryCoupon={appliedDeliveryCoupon}
        itemCouponDiscount={itemCouponDiscount}
        deliveryCouponDiscount={deliveryCouponDiscount}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
        onLogout={handleLogout}
      />

      {/* 4. Order Success & Receipt Modal */}
      <OrderSuccessModal
        order={activeOrder}
        isOpen={isOrderSuccessOpen}
        onClose={() => {
          setIsOrderSuccessOpen(false);
          setActiveOrder(null);
        }}
        onOpenTracking={(orderId) => {
          setIsOrderSuccessOpen(false);
          setIsTrackingOpen(true);
        }}
      />

      {/* 5. Party / Catering Portion Calculator Modal */}
      <PartyCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onAddBulkToCart={handleBulkAddFromCalculator}
      />

      {/* 6. Postcode Coverage Checker Modal */}
      <CoverageChecker
        isOpen={isCoverageOpen}
        onClose={() => setIsCoverageOpen(false)}
        currentPostcode={selectedPostcode}
        onSelectArea={(area: CoverageArea) => {
          setSelectedPostcode(area.postcode);
          setSelectedCity(area.city);
        }}
      />

      {/* 7. Recipe & Storage Guide Modal */}
      <RecipeModal
        isOpen={isRecipeOpen}
        onClose={() => setIsRecipeOpen(false)}
        onSelectCutRecipe={(cut) => {
          setIsRecipeOpen(false);
          scrollToProducts();
        }}
      />

      {/* 8. Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        initialOrderId={activeOrder ? activeOrder.orderId : undefined}
      />

      {/* 9. Loyalty Points & Rewards Modal */}
      <LoyaltyModal
        isOpen={isLoyaltyOpen}
        onClose={() => setIsLoyaltyOpen(false)}
        loyaltyStatus={loyaltyStatus}
        onApplyVoucher={(code) => {
          handleApplyCouponCode(code);
          setIsLoyaltyOpen(false);
          setIsCartOpen(true);
        }}
      />

      {/* 10. Out-of-Stock Notification Modal (Email & WhatsApp) */}
      <NotifyStockModal
        product={stockNotifyProduct}
        isOpen={!!stockNotifyProduct}
        onClose={() => setStockNotifyProduct(null)}
        defaultCustomerName={currentUser?.name}
        defaultEmail={currentUser?.email}
        defaultPhone={currentUser?.phone}
      />

      {/* 11. Global Simulated OTP & Notification Toast System */}
      <NotificationToast />

      {/* 12. Floating Product Animation Overlay (Tracks to Cart Icon) */}
      <FloatingProductOverlay
        items={flyingItems}
        onAnimationComplete={handleFlyingAnimationComplete}
      />

    </div>
  );
}

