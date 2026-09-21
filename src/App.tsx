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
import { getDailySpecial } from './utils/dailySpecial';
import { getProductImageUrl } from './utils/productImage';
import { getOfficialWhatsAppLink, getWhatsAppOrderLink, openAdminWhatsAppDirect, OFFICIAL_WHATSAPP_DIGITS } from './utils/whatsappHelper';
import { authService } from './services/auth';
import { dataStorageService } from './services/dataStorage';
import { fonnteService } from './services/fonnteService';
import { hitpayService } from './services/hitpayService';

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
import { DailySpecial } from './components/DailySpecial';
import { QualityGuarantee } from './components/QualityGuarantee';
import { FAQAccordion } from './components/FAQAccordion';
import { Footer } from './components/Footer';
import { ProductCategoriesSection } from './components/ProductCategoriesSection';
import { PromoServiceRow } from './components/PromoServiceRow';
import { WhatsAppPromoBanner } from './components/WhatsAppPromoBanner';
import { TrustBadgesRow } from './components/TrustBadgesRow';
import { HomeStoryRow } from './components/HomeStoryRow';
import { FloatingProductOverlay, FlyingProductItem } from './components/FloatingProductOverlay';
import { WhatsAppQuickOrderModal } from './components/WhatsAppQuickOrderModal';

// Portals & Secure Authentication Components (Code-Split / Lazy Loaded for Performance)
import { AuthModal } from './components/AuthModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { NotifyStockModal } from './components/NotifyStockModal';
import { NotificationToast } from './components/NotificationToast';
import { AllProductsPage } from './components/AllProductsPage';
import { BackToTop } from './components/BackToTop';
import { PortalLoadingFallback } from './components/PortalLoadingFallback';
import { 
  updateSeoTags, 
  injectStructuredData, 
  getShareableUrl, 
  copyShareableLink,
  findProductBySlugOrId,
  getProductCleanUrl,
  getProductSlug
} from './utils/seoHelper';

import { CustomerPortal } from './components/CustomerPortal';
import { AdminPortal } from './components/AdminPortal';

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
  Layers,
  Share2,
  Copy,
  Link as LinkIcon
} from 'lucide-react';

export default function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => authService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const [isCustomerPortalOpen, setIsCustomerPortalOpen] = useState<boolean>(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState<boolean>(false);
  const [isWhatsAppQuickOrderOpen, setIsWhatsAppQuickOrderOpen] = useState<boolean>(false);

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
    
    let unsubUser = () => {};
    if (currentUser && currentUser.id) {
      unsubUser = authService.subscribeCurrentUser(currentUser.id, (updatedUser) => {
        setCurrentUser(updatedUser);
      });
    }

    return () => {
      unsubProducts();
      unsubSettings();
      unsubCoupons();
      unsubUser();
    };
  }, [currentUser?.id]);

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

  // Share link feedback toast
  const [shareToast, setShareToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  const handleCopyLink = async (customUrl?: string, customMsg?: string) => {
    const url = customUrl || (typeof window !== 'undefined' ? window.location.href : '');
    const ok = await copyShareableLink(url);
    if (ok) {
      setShareToast({
        show: true,
        message: customMsg || 'Pautan halaman berjaya disalin! Sedia untuk dikongsi ke WhatsApp atau media sosial.'
      });
      setTimeout(() => {
        setShareToast({ show: false, message: '' });
      }, 3500);
    }
  };

  // 1. Synchronize URL on First Mount (Deep-linking, Clean Slug URLs & SEO)
  useEffect(() => {
    try {
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
      const params = new URLSearchParams(window.location.search);
      const urlKategori = params.get('kategori') as ProductCategory | null;
      const urlHalaman = params.get('halaman');
      const urlModal = params.get('modal');
      
      // Check for user-friendly short URLs (/p/ayam-segar-standard or /produk/...)
      let urlProductQuery: string | null = null;
      if (pathname.startsWith('/p/')) {
        urlProductQuery = decodeURIComponent(pathname.replace(/^\/p\//, '').replace(/\/$/, ''));
      } else if (pathname.startsWith('/produk/')) {
        urlProductQuery = decodeURIComponent(pathname.replace(/^\/produk\//, '').replace(/\/$/, ''));
      } else {
        urlProductQuery = params.get('p') || params.get('produk') || params.get('id');
      }

      if (urlKategori && urlKategori !== 'semua') {
        setSelectedCategory(urlKategori);
        setCurrentView('all-products');
      } else if (urlHalaman === 'semua-produk' || urlHalaman === 'katalog') {
        setCurrentView('all-products');
      }

      if (urlModal === 'portal') {
        if (authService.getCurrentUser()) {
          setIsCustomerPortalOpen(true);
        } else {
          setIsAuthModalOpen(true);
        }
      } else if (urlModal === 'admin') {
        const u = authService.getCurrentUser();
        if (u?.role === 'admin') {
          setIsAdminPortalOpen(true);
        } else {
          setIsAdminAuthModalOpen(true);
        }
      } else if (urlModal === 'semak-pesanan' || urlModal === 'tracking') {
        setIsTrackingOpen(true);
      } else if (urlModal === 'kalkulator') {
        setIsCalculatorOpen(true);
      } else if (urlModal === 'resepi' || urlModal === 'potongan') {
        setIsRecipeOpen(true);
      } else if (urlModal === 'liputan' || urlModal === 'kawasan') {
        setIsCoverageOpen(true);
      } else if (urlModal === 'loyalty' || urlModal === 'ganjaran') {
        setIsLoyaltyOpen(true);
      } else if (urlModal === 'login' || urlModal === 'daftar') {
        setIsAuthModalOpen(true);
      }

      // Handle HitPay Completed Checkout Return
      const rawHitpayStatus = (params.get('hitpay_status') || params.get('status') || '').toLowerCase().trim();
      const paramOrderId = (params.get('order_id') || '').trim();
      const paramReference = (params.get('reference') || params.get('payment_id') || params.get('payment_request_id') || '').trim();

      // Read pending checkout session from localStorage
      let pendingData: any = null;
      try {
        const rawPending = localStorage.getItem('khairul_pending_hitpay_order');
        if (rawPending) {
          pendingData = JSON.parse(rawPending);
        }
      } catch {
        // ignore
      }

      const isHitPayReturn = Boolean(
        params.get('hitpay_status') ||
        params.get('status') ||
        params.get('reference') ||
        (paramOrderId && pendingData?.orderId && paramOrderId.toLowerCase() === pendingData.orderId.toLowerCase()) ||
        (pendingData && pendingData.orderId && (Date.now() - (pendingData.timestamp || 0) < 7200000))
      );

      if (isHitPayReturn) {
        const resolveHitPayOrder = async () => {
          let isCompleted =
            rawHitpayStatus === 'completed' ||
            rawHitpayStatus === 'success' ||
            rawHitpayStatus === 'paid' ||
            rawHitpayStatus === 'succeeded' ||
            rawHitpayStatus === 'successful';

          const isExplicitFailed =
            rawHitpayStatus === 'failed' ||
            rawHitpayStatus === 'canceled' ||
            rawHitpayStatus === 'cancelled' ||
            rawHitpayStatus === 'expired';

          // If return has reference/paymentId but status is unconfirmed, check API status
          const refToCheck = paramReference || pendingData?.paymentId || pendingData?.customer?.hitpayPaymentId;
          if (!isCompleted && !isExplicitFailed && refToCheck && siteSettings.hitpayConfig?.apiKey) {
            try {
              const statusCheck = await hitpayService.checkPaymentStatus(
                refToCheck,
                siteSettings.hitpayConfig.apiKey,
                siteSettings.hitpayConfig.isSandbox ?? true
              );
              if (
                statusCheck.success &&
                (statusCheck.status === 'completed' || statusCheck.status === 'succeeded' || statusCheck.status === 'paid')
              ) {
                isCompleted = true;
              }
            } catch {
              // ignore
            }
          }

          // If rawHitpayStatus is 'completed' (from redirectUrl) or there was no explicit failure, treat as completed
          if (!isCompleted && !isExplicitFailed && (params.get('hitpay_status') === 'completed' || pendingData?.paymentId)) {
            isCompleted = true;
          }

          const allOrders = dataStorageService.getOrders();
          let found: OrderRecord | null = null;

          // Strategy 1: Match by paramOrderId in allOrders
          if (paramOrderId) {
            found = allOrders.find((o) => o.orderId.toLowerCase() === paramOrderId.toLowerCase()) || null;
          }

          // Strategy 2: Match by pendingData.orderId in allOrders
          if (!found && pendingData?.orderId) {
            found = allOrders.find((o) => o.orderId.toLowerCase() === pendingData.orderId.toLowerCase()) || null;
          }

          // Strategy 3: Match by HitPay payment reference in allOrders
          if (!found && paramReference) {
            found = allOrders.find(
              (o) =>
                o.customer?.hitpayPaymentId === paramReference ||
                o.customer?.hitpayReference === paramReference ||
                o.orderId.toLowerCase() === paramReference.toLowerCase()
            ) || null;
          }

          // Strategy 4: Local backup keys in localStorage
          if (!found && paramOrderId) {
            try {
              const raw = localStorage.getItem(`khairul_order_${paramOrderId}`);
              if (raw) found = JSON.parse(raw);
            } catch {}
          }
          if (!found && pendingData?.orderId) {
            try {
              const raw = localStorage.getItem(`khairul_order_${pendingData.orderId}`);
              if (raw) found = JSON.parse(raw);
            } catch {}
          }
          if (!found) {
            try {
              const raw = localStorage.getItem('khairul_last_order_backup');
              if (raw) {
                const parsed = JSON.parse(raw);
                if (
                  (paramOrderId && parsed?.orderId?.toLowerCase() === paramOrderId.toLowerCase()) ||
                  (pendingData?.orderId && parsed?.orderId?.toLowerCase() === pendingData.orderId.toLowerCase()) ||
                  (paramReference && (parsed?.customer?.hitpayPaymentId === paramReference || parsed?.orderId?.toLowerCase() === paramReference.toLowerCase()))
                ) {
                  found = parsed;
                }
              }
            } catch {}
          }

          // Strategy 5: Full order in pendingData
          if (!found && pendingData && pendingData.orderId && Array.isArray(pendingData.items) && pendingData.items.length > 0) {
            found = pendingData as OrderRecord;
          }

          // Strategy 6: Firebase Firestore
          if (!found && paramOrderId) {
            found = await dataStorageService.getOrderById(paramOrderId);
          }
          if (!found && pendingData?.orderId) {
            found = await dataStorageService.getOrderById(pendingData.orderId);
          }
          if (!found && paramReference) {
            found = await dataStorageService.findOrderByHitpayReference(paramReference);
          }

          // Strategy 7: Emergency reconstruction from pendingData if minimal object
          if (!found && pendingData && pendingData.orderId) {
            found = {
              orderId: pendingData.orderId,
              createdAt: new Date().toISOString(),
              items: Array.isArray(pendingData.items) ? pendingData.items : cartItems,
              subtotal: pendingData.total || cartTotal || 0,
              deliveryFee: 0,
              total: pendingData.total || cartTotal || 0,
              discount: 0,
              status: 'disahkan',
              fulfillmentType: pendingData.fulfillmentType || 'delivery',
              estimatedDeliveryText: 'Disahkan • Dalam Giliran Penghantaran',
              customer: {
                fullName: pendingData.customerName || 'Pelanggan HitPay',
                phone: pendingData.customerPhone || '',
                email: pendingData.customerEmail || 'pelanggan@khairulfreshfood.com',
                address: pendingData.address || 'Pasar Semenyih',
                city: 'Semenyih',
                postcode: '43500',
                state: 'Selangor',
                deliveryDate: new Date().toISOString().split('T')[0],
                deliverySlot: 'pagi',
                paymentMethod: 'hitpay',
                hitpayStatus: 'completed',
                hitpayPaymentId: paramReference || pendingData.paymentId,
                hitpayReference: paramReference || pendingData.paymentId,
              },
            };
          }

          if (found) {
            if (isCompleted) {
              // 1. Mark as confirmed & paid via HitPay
              found.status = 'disahkan';
              found.estimatedDeliveryText =
                found.fulfillmentType === 'pickup'
                  ? 'Disahkan • Sedia Diambil Di Kedai'
                  : 'Disahkan • Dalam Giliran Penghantaran';
              if (found.customer) {
                found.customer.hitpayStatus = 'completed';
                if (paramReference) {
                  found.customer.hitpayPaymentId = paramReference;
                  found.customer.hitpayReference = paramReference;
                }
              }

              // 2. Persist to storage and Firebase
              await dataStorageService.saveOrderAsync(found);
              dataStorageService.updateOrderStatus(found.orderId, 'disahkan', 'Gerbang Bayaran HitPay');

              // 3. Dispatch global event so Admin Portal (Pesanan tab) updates in real-time
              if (typeof window !== 'undefined') {
                window.dispatchEvent(
                  new CustomEvent('khairul_fresh_orders_updated', {
                    detail: dataStorageService.getOrders(),
                  })
                );
              }

              // 4. Update loyalty points & spending if logged in
              const pointsEarned = Math.round(found.total);
              if (currentUser) {
                const updatedUser = authService.updateUserProfile({
                  loyaltyPoints: (currentUser.loyaltyPoints || 0) + pointsEarned,
                  totalSpent: (currentUser.totalSpent || 0) + found.total,
                });
                if (updatedUser) {
                  setCurrentUser(updatedUser);
                }
              }

              // 5. Send automated WhatsApp confirmation to admin and customer
              const currentLocalConfig = fonnteService.getConfig();
              const fonnteConfigToUse =
                siteSettings.fonnteConfig && siteSettings.fonnteConfig.token
                  ? { ...currentLocalConfig, ...siteSettings.fonnteConfig }
                  : currentLocalConfig;
              fonnteService.triggerNewOrderNotification(found, fonnteConfigToUse).catch((err) => {
                console.warn('[HitPay WhatsApp Notification]', err);
              });

              // 6. Display the official Order Success & Receipt modal
              setActiveOrder(found);
              setIsOrderSuccessOpen(true);

              // 7. Clear cart & purge pending cache
              setCartItems([]);
              setAppliedItemCoupon(null);
              setItemCouponDiscount(0);
              setAppliedDeliveryCoupon(null);
              setDeliveryCouponDiscount(0);
              try {
                localStorage.removeItem('freshayam_cart');
                localStorage.removeItem('khairul_pending_hitpay_order');
              } catch {
                // ignore
              }
            } else if (isExplicitFailed) {
              console.warn('[HitPay Payment Cancelled/Failed]', found.orderId);
              setActiveOrder(found);
            }

            // Clean return URL query parameters without reloading the page
            try {
              window.history.replaceState({}, document.title, window.location.pathname);
            } catch {
              // ignore
            }
          }
        };

        resolveHitPayOrder();
      }

      // Auto-open product modal if clean slug or ID is provided
      if (urlProductQuery) {
        const allProds = dataStorageService.getProducts();
        const matched = findProductBySlugOrId(urlProductQuery, allProds);
        if (matched) {
          setSelectedProductForCut(matched);
          setIsCutModalOpen(true);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // 2. Dynamic SEO & Clean URL Synchronization
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);

      // Do not overwrite HitPay return parameters while verification is running
      if (
        params.has('hitpay_status') ||
        params.has('status') ||
        params.has('reference') ||
        params.has('order_id')
      ) {
        return;
      }

      // Category
      if (selectedCategory && selectedCategory !== 'semua') {
        params.set('kategori', selectedCategory);
      } else {
        params.delete('kategori');
      }

      // View
      if (currentView === 'all-products') {
        params.set('halaman', 'semua-produk');
      } else {
        params.delete('halaman');
      }

      // Modals
      if (isCustomerPortalOpen) {
        params.set('modal', 'portal');
      } else if (isAdminPortalOpen || isAdminAuthModalOpen) {
        params.set('modal', 'admin');
      } else if (isTrackingOpen) {
        params.set('modal', 'semak-pesanan');
      } else if (isCalculatorOpen) {
        params.set('modal', 'kalkulator');
      } else if (isRecipeOpen) {
        params.set('modal', 'resepi');
      } else if (isCoverageOpen) {
        params.set('modal', 'liputan');
      } else if (isLoyaltyOpen) {
        params.set('modal', 'ganjaran');
      } else if (isAuthModalOpen) {
        params.set('modal', 'login');
      } else {
        params.delete('modal');
      }

      // Clean Product URL path: /p/ayam-segar-standard
      let targetPath = '/';
      if (isCutModalOpen && selectedProductForCut) {
        const cleanSlug = getProductSlug(selectedProductForCut);
        targetPath = `/p/${cleanSlug}`;
        params.delete('p');
        params.delete('produk');
      } else {
        params.delete('p');
        params.delete('produk');
      }

      const newQuery = params.toString();
      const newUrl = newQuery ? `${targetPath}?${newQuery}` : targetPath;
      window.history.replaceState({}, '', newUrl);

      // Update document SEO tags and title
      if (isCutModalOpen && selectedProductForCut) {
        updateSeoTags({ product: selectedProductForCut, canonicalUrl: `${window.location.origin}/p/${getProductSlug(selectedProductForCut)}` });
      } else if (isCustomerPortalOpen) {
        updateSeoTags({ 
          title: 'Portal Pelanggan & Ganjaran Ahli', 
          description: 'Urus pesanan harian, semak baki mata ganjaran & jejak status penghantaran ayam segar anda.' 
        });
      } else if (isAdminPortalOpen) {
        updateSeoTags({ title: 'Portal Pentadbir Khairul Fresh Food' });
      } else if (isTrackingOpen) {
        updateSeoTags({ 
          title: 'Semak Status Pesanan & Live Tracking', 
          description: 'Jejak status penyediaan dan penghantaran pesanan ayam segar anda secara langsung di Pasar Semenyih.' 
        });
      } else if (isRecipeOpen) {
        updateSeoTags({
          title: 'Panduan Resepi & Pilihan Potongan Ayam',
          description: 'Panduan jenis potongan ayam berserta cadangan masakan kari, sup, goreng berempah, kurma dan bakar.'
        });
      } else if (isCalculatorOpen) {
        updateSeoTags({
          title: 'Kalkulator Tempahan Kenduri & Katering',
          description: 'Kira anggaran kuantiti ayam segar dan jenis potongan untuk jamuan kenduri atau restoran.'
        });
      } else if (currentView === 'all-products') {
        updateSeoTags({
          category: selectedCategory,
          title: selectedCategory !== 'semua' ? undefined : 'Katalog Keseluruhan Ayam & Daging Segar',
          description: 'Pilihan lengkap ayam segar harian, ayam kampung, daging lembu tempatan, kambing, tulang sup & ayam perap di Pasar Semenyih.'
        });
      } else {
        updateSeoTags();
      }
    } catch {
      // ignore
    }
  }, [
    selectedCategory,
    currentView,
    isCutModalOpen,
    selectedProductForCut,
    isCustomerPortalOpen,
    isAdminPortalOpen,
    isAdminAuthModalOpen,
    isTrackingOpen,
    isCalculatorOpen,
    isRecipeOpen,
    isCoverageOpen,
    isLoyaltyOpen,
    isAuthModalOpen
  ]);

  // 3. Inject Google Schema.org JSON-LD structured data when products list changes
  useEffect(() => {
    if (productsList && productsList.length > 0) {
      injectStructuredData(productsList);
    }
  }, [productsList]);

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
    const currentLocalConfig = fonnteService.getConfig();
    const fonnteConfigToUse = (siteSettings.fonnteConfig && siteSettings.fonnteConfig.token)
      ? { ...currentLocalConfig, ...siteSettings.fonnteConfig }
      : currentLocalConfig;

    fonnteService.triggerNewOrderNotification(order, fonnteConfigToUse).then((res) => {
      if (res.adminSent) {
        console.log(`[Fonnte WhatsApp] Pesanan #${order.orderId} berjaya dihantar terus ke WhatsApp Admin (${fonnteConfigToUse.adminPhone || '011-11135503'})!`);
      } else {
        console.warn(`[Fonnte WhatsApp] Notifikasi pesanan tidak dihantar:`, res.error || 'Semak token dan sambungan');
      }
    }).catch((err) => {
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

  // 1, 2, 3: Direct WhatsApp chat ke Admin Khairul Fresh Food (Bukan untuk order produk, terus ke WhatsApp admin)
  const handleOpenDirectAdminWhatsApp = () => {
    openAdminWhatsAppDirect(
      'Salam Admin Khairul Fresh Food! Saya ada pertanyaan lanjut.',
      siteSettings.whatsappNumber || OFFICIAL_WHATSAPP_DIGITS
    );
  };

  // KEKAL: Maklumat order produk melalui WhatsApp (Borang 4 soalan / Pesanan WhatsApp seperti di SS)
  const handleOpenWhatsAppOrderModal = () => {
    setIsWhatsAppQuickOrderOpen(true);
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
    setCurrentView('all-products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsCustomerPortalOpen(false);
    setIsAdminPortalOpen(false);
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-emerald-500 selection:text-white flex flex-col transition-colors duration-200">
      
      {/* Announcement Bar (1. Top website banner whatsapp -> direct terus ke WhatsApp admin) */}
      <AnnouncementBar
        onOpenCoverage={() => setIsCoverageOpen(true)}
        onOpenWhatsApp={handleOpenDirectAdminWhatsApp}
        siteSettings={siteSettings}
      />

      {/* Main Sticky Header (Direct terus ke WhatsApp admin) */}
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
        onOpenWhatsApp={handleOpenDirectAdminWhatsApp}
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
        products={productsList}
        onSelectProduct={handleOpenCutModal}
        onSearchSubmit={(q) => {
          setSearchQuery(q);
          setCurrentView('all-products');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
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

      {/* Active Search Notification Banner when on Home View */}
      {currentView === 'home' && searchQuery.trim() && (
        <div className="bg-emerald-800 text-white px-4 py-2.5 shadow-sm border-b border-emerald-700">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold">
              <Search className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>
                Carian aktif: &ldquo;<strong className="text-yellow-300">{searchQuery}</strong>&rdquo; ({filteredProducts.length} produk dijumpai)
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setCurrentView('all-products');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-white text-emerald-900 hover:bg-emerald-50 px-3 py-1 rounded-lg text-xs font-black transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <span>Lihat Hasil ({filteredProducts.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSearchQuery('')}
                className="text-emerald-200 hover:text-white text-xs font-bold px-1.5 py-1 cursor-pointer"
              >
                Padam
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
            setSelectedCategory('semua');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          initialCategory={selectedCategory}
          initialSearchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          onCategoryChange={(cat) => setSelectedCategory(cat)}
          onShare={(url, msg) => handleCopyLink(url, msg)}
        />
      ) : (
        <>
          {/* Hero Banner with value proposition & quick postcode entry (Order Melalui WhatsApp -> buka tab/modal tempahan WhatsApp) */}
          <HeroBanner
            onCheckPostcode={(code) => {
              setSelectedPostcode(code);
              setIsCoverageOpen(true);
            }}
            onExploreProducts={scrollToProducts}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
            onOpenWhatsApp={handleOpenWhatsAppOrderModal}
          />

          {/* Product Categories Section (6 Pilihan Produk Utama di Frontpage) */}
          <ProductCategoriesSection
            products={productsList}
            isAdmin={currentUser?.role === 'admin'}
            onOpenAdminEditor={() => {
              if (currentUser?.role === 'admin') {
                setIsAdminPortalOpen(true);
              } else {
                setIsAdminAuthModalOpen(true);
              }
            }}
            onSelectProduct={handleOpenCutModal}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat as any);
              setCurrentView('all-products');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewAllProducts={() => {
              setCurrentView('all-products');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* Delivery Area Van & Dynamic Operating Hours Row (Direct WhatsApp ke admin) */}
          <PromoServiceRow
            onOpenCoverage={() => setIsCoverageOpen(true)}
            onOpenWhatsApp={handleOpenDirectAdminWhatsApp}
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
                handleOpenDirectAdminWhatsApp();
              } else {
                scrollToProducts();
              }
            }}
          />

          {/* Prominent WhatsApp Ordering Guidance Banner (KEKAL: Maklumat order produk melalui WhatsApp seperti di gambar SS) */}
          <WhatsAppPromoBanner
            onOpenWhatsAppModal={handleOpenWhatsAppOrderModal}
          />

          {/* 4 Pillars Trust Badges Row (Alternating Red/Green Circles) */}
          <TrustBadgesRow />

          {/* 4 Pillars Quality Guarantee Section */}
          <QualityGuarantee />

          {/* Frequently Asked Questions (FAQ) Accordion */}
          <FAQAccordion />
        </>
      )}

      {/* Footer (Direct WhatsApp ke admin) */}
      <Footer
        onOpenCoverage={() => setIsCoverageOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenRecipes={() => setIsRecipeOpen(true)}
        onOpenTracking={() => setIsTrackingOpen(true)}
        onOpenWhatsApp={handleOpenDirectAdminWhatsApp}
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
        onNavigateHome={() => {
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateProducts={() => {
          setCurrentView('all-products');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Floating WhatsApp Action Button (3. Icon whatsapp di bawah sekali -> direct terus ke WhatsApp admin) */}
      <button
        onClick={handleOpenDirectAdminWhatsApp}
        className="fixed bottom-5 right-5 z-40 bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer group"
        title="Chat Terus WhatsApp Admin: 011-1113 5503"
        aria-label="Chat Terus WhatsApp Admin"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden group-hover:inline-block text-xs font-bold pr-1">
          WhatsApp Admin ({siteSettings.supportPhone})
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

      {/* 0.1 Customer Management Portal */}
      {currentUser && isCustomerPortalOpen && (
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
      )}

      {/* 0.2 Admin Management Portal */}
      {currentUser && currentUser.role === 'admin' && isAdminPortalOpen && (
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

      {/* 11. WhatsApp Quick Order 4-Questions Modal */}
      <WhatsAppQuickOrderModal
        isOpen={isWhatsAppQuickOrderOpen}
        onClose={() => setIsWhatsAppQuickOrderOpen(false)}
        defaultCustomerName={currentUser?.name}
      />

      {/* 11. Global Simulated OTP & Notification Toast System */}
      <NotificationToast />

      {/* 12. Floating Product Animation Overlay (Tracks to Cart Icon) */}
      <FloatingProductOverlay
        items={flyingItems}
        onAnimationComplete={handleFlyingAnimationComplete}
      />

      {/* 13. Floating Link Copied / SEO Share Feedback Toast */}
      {shareToast.show && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-stone-900/95 dark:bg-stone-100/95 text-white dark:text-stone-900 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 border border-emerald-500/40 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-300 max-w-sm w-full mx-4 sm:w-auto">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="flex-1">{shareToast.message}</span>
        </div>
      )}

    </div>
  );
}

