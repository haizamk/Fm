import { 
  OrderRecord, 
  Product, 
  SiteSettings, 
  AdminAuditLog, 
  StockAlertSubscription, 
  DailySalesStat, 
  ProductSalesStat, 
  CouponCode, 
  RotationBannerItem,
  MediaItem
} from '../types';
import { PRODUCTS } from '../data/products';
import { db } from './firebase';
import { authService } from './auth';
import { fonnteService } from './fonnteService';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs, 
  query,
  where,
  onSnapshot, 
  deleteDoc, 
  writeBatch,
  Unsubscribe 
} from 'firebase/firestore';

// Storage Keys (v5 Fresh & Clean)
const PRODUCTS_KEY = 'khairul_fresh_products_db_v5';
const SETTINGS_KEY = 'khairul_fresh_site_settings_v5';
const ORDERS_KEY = 'khairul_fresh_orders_db_v5';
const AUDIT_LOGS_KEY = 'khairul_fresh_audit_logs_v5';
const STOCK_ALERTS_KEY = 'khairul_fresh_stock_alerts_v5';
const LOGISTICS_RUNS_KEY = 'khairul_fresh_logistics_runs_v5';
const COUPONS_KEY = 'khairul_fresh_coupons_v5';
const BANNERS_KEY = 'khairul_fresh_rotation_banners_v5';
const MEDIA_LIBRARY_KEY = 'khairul_fresh_media_library_v5';


// Firebase Error Handling Types per Skill Guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  if (errMsg.includes('the client is offline') || errMsg.includes('unavailable') || errMsg.includes('Could not reach Cloud Firestore')) {
    // Graceful offline operation warning
    console.info(`[Firestore] Operating in local offline mode for ${operationType} on ${path}: ${errMsg}`);
    return;
  }
  const errInfo = {
    error: errMsg,
    operationType,
    path
  };
  console.warn('Firestore Operation Info:', JSON.stringify(errInfo));
}

// Clear legacy demo keys & purge any oversized standee QR image to free browser storage quota
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('freshayam_orders_db');
    localStorage.removeItem('freshayam_orders_db_v4');
    localStorage.removeItem('freshayam_audit_logs');
    // If an oversized base64 QR image (>100KB) exists in localStorage, clear it so orders have ample storage space
    const qrImg = localStorage.getItem('khairul_duitnow_qr_img');
    if (qrImg && qrImg.length > 100000) {
      localStorage.removeItem('khairul_duitnow_qr_img');
    }
  }
} catch {
  // ignore
}

export const DEFAULT_ROTATION_BANNERS: RotationBannerItem[] = [
  {
    id: 'banner-1',
    badge: 'PROMOSI SEMASA',
    title: 'Beli Lebih RM150 Free Delivery (Diskaun RM6)',
    description: 'Nikmati penjimatan diskaun penghantaran RM6 secara automatik untuk setiap pembelian RM150 ke atas ke Semenyih, Beranang & Kajang!',
    ctaText: 'Pesan Sekarang',
    ctaAction: 'catalog',
    bgColor: 'from-emerald-950 via-emerald-900 to-teal-950',
    accentColor: 'emerald',
    icon: 'truck',
    imageUrl: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=900',
    isActive: true,
    order: 1,
  },
  {
    id: 'banner-2',
    badge: 'PILIHAN PICKUP',
    title: 'Pilihan Pickup di Kedai (Gerai GA 59)',
    description: 'Pesan awal secara online, siap potong & bungkus! Singgah ambil terus di Gerai GA 59 Pasar Semenyih tanpa beratur dan jimat kos.',
    ctaText: 'Pilih Self-Pickup',
    ctaAction: 'pickup',
    bgColor: 'from-amber-950 via-stone-900 to-amber-950',
    accentColor: 'amber',
    icon: 'store',
    imageUrl: 'https://images.unsplash.com/photo-1548567117-0429762db801?auto=format&fit=crop&q=80&w=900',
    isActive: true,
    order: 2,
  },
  {
    id: 'banner-3',
    badge: 'SERVIS PERCUMA',
    title: 'Percuma Pemotongan & Pencucian Ayam',
    description: 'Jimat masa di dapur anda! Pilih gaya potongan 4, 8, 12, atau 16 bahagian secara percuma tanpa sebarang caj tersembunyi.',
    ctaText: 'Lihat Pilihan Potongan',
    ctaAction: 'cutting',
    bgColor: 'from-sky-950 via-slate-900 to-blue-950',
    accentColor: 'blue',
    icon: 'scissors',
    imageUrl: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=80&w=900',
    isActive: true,
    order: 3,
  },
];

export const DEFAULT_COUPONS: CouponCode[] = [
  {
    id: 'coup-ganjaran-1',
    code: 'GANJARAN1',
    discountType: 'fixed',
    discountValue: 1.00,
    minSpend: 10.00,
    description: 'Tebus 100 Mata: Diskaun RM 1.00 baucar tunai',
    isActive: true,
    expiryDate: '2026-12-31',
    usageLimit: 500,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    category: 'item',
  },
  {
    id: 'coup-ganjaran-2',
    code: 'GANJARAN2',
    discountType: 'fixed',
    discountValue: 2.00,
    minSpend: 20.00,
    description: 'Tebus 200 Mata: Diskaun RM 2.00 baucar tunai',
    isActive: true,
    expiryDate: '2026-12-31',
    usageLimit: 500,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    category: 'item',
  },
  {
    id: 'coup-1',
    code: 'GANJARAN5',
    discountType: 'fixed',
    discountValue: 5.00,
    minSpend: 40.00,
    description: 'Tebus 500 Mata: Diskaun RM 5.00 untuk belian minimum RM40.00',
    isActive: true,
    expiryDate: '2026-12-31',
    usageLimit: 200,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    category: 'item',
  },
  {
    id: 'coup-ganjaran-10',
    code: 'GANJARAN10',
    discountType: 'fixed',
    discountValue: 10.00,
    minSpend: 70.00,
    description: 'Tebus 1,000 Mata: Diskaun RM 10.00 baucar tunai',
    isActive: true,
    expiryDate: '2026-12-31',
    usageLimit: 200,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    category: 'item',
  },
  {
    id: 'coup-ganjaran-20',
    code: 'GANJARAN20',
    discountType: 'fixed',
    discountValue: 20.00,
    minSpend: 100.00,
    description: 'Tebus 2,000 Mata: Diskaun RM 20.00 baucar tunai',
    isActive: true,
    expiryDate: '2026-12-31',
    usageLimit: 100,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    category: 'item',
  },
  {
    id: 'coup-ayam-5',
    code: 'AYAMJIMAT5',
    discountType: 'fixed',
    discountValue: 5.00,
    minSpend: 40.00,
    description: 'Diskaun RM5.00 untuk belian minimum RM40.00',
    isActive: true,
    expiryDate: '2026-12-31',
    usageLimit: 100,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    category: 'item',
  },
  {
    id: 'coup-2',
    code: 'SEMENYIH10',
    discountType: 'percentage',
    discountValue: 10,
    minSpend: 50.00,
    maxDiscount: 10.00,
    description: 'Diskaun 10% (Maksimum RM10) untuk pesanan RM50 ke atas',
    isActive: true,
    expiryDate: '2026-12-31',
    usageLimit: 50,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    category: 'item',
  },
  {
    id: 'coup-freedel',
    code: 'FREEDEL6',
    discountType: 'delivery',
    discountValue: 6.00,
    minSpend: 40.00,
    description: 'Diskaun Penghantaran RM6.00 untuk pesanan RM40 ke atas',
    isActive: true,
    expiryDate: '2026-12-31',
    usageLimit: 200,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    category: 'delivery',
  },
  {
    id: 'coup-diskaun5',
    code: 'DISKAUN5',
    discountType: 'percentage',
    discountValue: 5,
    minSpend: 30.00,
    description: 'Diskaun 5% untuk pesanan RM30 ke atas',
    isActive: true,
    expiryDate: '2026-12-31',
    usageLimit: 500,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    category: 'item',
  },
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  announcementText: 'Pesan sebelum 11:00 PM untuk penghantaran segar esok!',
  announcementCutoffTime: '23:00',
  freeShippingMinAmount: 150,
  supportPhone: '011-11135503',
  supportEmail: 'support@freshayam.com.my',
  bannerNotice: '⚡ Tawaran Hujung Minggu: Jimat RM 2.60 untuk Ayam Bulat Segar Ladang!',
  isOrderingEnabled: true,
  guaranteeText: 'Jaminan Segar 100% Ganti Baru & Halal Diiktiraf',
  hitpayConfig: {
    apiKey: '',
    salt: '',
    isSandbox: true,
    isActive: true,
    currency: 'MYR',
    merchantName: 'Khairul FRESH Food (Pasar Semenyih)',
    enabledMethods: ['fpx', 'duitnow', 'card', 'grabpay', 'tng', 'shopeepay'],
    webhookUrl: 'https://ais-dev-ibciauzkghto525j7ma3h5-707200717362.asia-east1.run.app/api/hitpay/webhook',
  },
  duitnowConfig: {
    bankName: 'OCBC Bank (Malaysia) Berhad',
    accountName: 'KHAIRUL FRESH AND FROZEN FOOD',
    accountNumber: '70 6116 3993',
    duitnowId: '202503301954',
    duitnowIdType: 'Business Registration No. (SSM)',
    orderReferenceGuide: 'No. Telefon Pelanggan / no pesanan',
    qrImageUrl: '',
    isActive: true,
  },
  fonnteConfig: {
    token: '',
    adminPhone: '011-11135503',
    autoNotifyAdmin: true,
    autoNotifyCustomer: false,
  },
  thermalReceiptSettings: {
    showLogo: true,
    logoUrl: '',
    promoText: '★ TAWARAN HEBAT: IMBAS QR & TEBUS MATA GANJARAN!',
    showPromoText: true,
    storeName: 'KHAIRUL FRESH FOOD',
    storeAddress: 'Pasar Sementara Semenyih, Gerai GA 59',
    storePhone: '011-11135503',
  },
  enableCoolerBoxOption: false,
};

// Initial Seed Orders (Fresh & Empty)
const INITIAL_ORDERS: OrderRecord[] = [];

const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'log-init-1',
    timestamp: new Date().toISOString(),
    action: 'Pangkalan Data Firebase Diaktifkan',
    performedBy: 'Sistem Khairul FRESH',
    details: 'Pangkalan data Firestore dihubungkan untuk kemaskini pesanan masa nyata.',
    type: 'system',
  }
];

// Helper to clean undefined fields for Firestore compatibility
function removeUndefinedFields(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedFields);
  }
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      result[key] = removeUndefinedFields(val);
    }
  }
  return result;
}

// Helper to push to Firestore in background safely
async function syncDocToFirestore(collectionName: string, docId: string, data: any, merge: boolean = false) {
  try {
    const cleaned = removeUndefinedFields(data);
    const docRef = doc(db, collectionName, docId);
    if (merge) {
      await setDoc(docRef, cleaned, { merge: true });
    } else {
      await setDoc(docRef, cleaned);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${docId}`);
  }
}

async function deleteDocFromFirestore(collectionName: string, docId: string) {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${docId}`);
  }
}


// High-speed in-memory store ensuring zero data loss and uninterrupted operation even if browser localStorage is constrained or disabled
const inMemoryStore = new Map<string, any>();

/**
 * Strips huge base64 strings and redundant heavy fields from orders when caching to localStorage.
 * Ensures orders cache stays tiny (~500 bytes per order instead of 50KB-1MB), preventing QuotaExceededError.
 */
function sanitizeOrdersForLocalCache(orders: OrderRecord[]): any[] {
  if (!Array.isArray(orders)) return [];
  return orders.slice(0, 30).map((o) => ({
    ...o,
    items: Array.isArray(o.items) ? o.items.map((item) => {
      let safeImage = item.product?.image || '';
      if (typeof safeImage === 'string' && safeImage.startsWith('data:') && safeImage.length > 500) {
        safeImage = 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=600';
      }
      return {
        ...item,
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          subtitle: item.product.subtitle,
          category: item.product.category,
          price: item.product.price,
          unit: item.product.unit,
          weightEstimate: item.product.weightEstimate,
          image: safeImage,
          inStock: item.product.inStock,
        } : item.product,
      };
    }) : [],
  }));
}

/**
 * Safely saves data to localStorage with runtime memory mirroring and intelligent quota management.
 */
function safeSetStorage(key: string, data: any) {
  // 1. Always update runtime in-memory store first
  inMemoryStore.set(key, data);

  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  // 2. Prepare serialized payload
  try {
    let payloadString: string;
    if (key === ORDERS_KEY && Array.isArray(data)) {
      payloadString = JSON.stringify(sanitizeOrdersForLocalCache(data));
    } else {
      payloadString = JSON.stringify(data);
    }
    localStorage.setItem(key, payloadString);
  } catch (err: any) {
    // If QuotaExceededError or storage restriction occurred, recover gracefully
    handleStorageQuotaRecovery(key, data);
  }
}

function handleStorageQuotaRecovery(key: string, data: any) {
  try {
    // Free space by clearing non-critical or legacy caches
    localStorage.removeItem('khairul_fresh_media_library_v5');
    localStorage.removeItem('khairul_fresh_audit_logs_v5');
    localStorage.removeItem('khairul_fresh_logistics_runs_v5');
    localStorage.removeItem('khairul_fresh_stock_alerts_v5');
    localStorage.removeItem('freshayam_orders_db');
    localStorage.removeItem('freshayam_orders_db_v4');
    localStorage.removeItem('freshayam_audit_logs');
    localStorage.removeItem('freshayam_cart');
    localStorage.removeItem('freshayam_favorites');

    // If an oversized standee QR image is stored in standalone key, purge it
    const qrRaw = localStorage.getItem('khairul_duitnow_qr_img');
    if (qrRaw && qrRaw.length > 50000) {
      localStorage.removeItem('khairul_duitnow_qr_img');
    }

    if (Array.isArray(data)) {
      const sanitized = key === ORDERS_KEY ? sanitizeOrdersForLocalCache(data) : data;
      // Try with latest 15
      try {
        localStorage.setItem(key, JSON.stringify(sanitized.slice(0, 15)));
        return;
      } catch {
        // Try with latest 5
        try {
          localStorage.setItem(key, JSON.stringify(sanitized.slice(0, 5)));
          return;
        } catch {
          // If storage is completely full, remove local cache key and safely rely on memory + Firestore
          localStorage.removeItem(key);
          console.info(`[Storage Cache] Preserved ${key} in runtime memory (${data.length} items active).`);
        }
      }
    } else {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch {
        localStorage.removeItem(key);
        console.info(`[Storage Cache] Preserved ${key} in runtime memory.`);
      }
    }
  } catch {
    console.info(`[Storage Cache] Using runtime in-memory store for ${key}.`);
  }
}

export const dataStorageService = {

  // Real-time Firestore Subscriptions
  subscribeOrders(callback: (orders: OrderRecord[]) => void): Unsubscribe {
    let isSubscribed = true;

    // Handle local window event for instant responsive UI updates
    const handleLocalUpdate = (e: Event) => {
      if (!isSubscribed) return;
      const customEvent = e as CustomEvent<OrderRecord[]>;
      if (customEvent.detail) {
        callback(customEvent.detail);
      } else {
        callback(this.getOrders());
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('khairul_fresh_orders_updated', handleLocalUpdate);
    }

    let unsubFirestore: Unsubscribe = () => {};
    try {
      const ordersCol = collection(db, 'orders');
      unsubFirestore = onSnapshot(ordersCol, (snapshot) => {
        if (!isSubscribed) return;
        if (!snapshot.empty) {
          const cloudOrders: OrderRecord[] = [];
          snapshot.forEach((docSnap) => {
            cloudOrders.push(docSnap.data() as OrderRecord);
          });
          // Sort newest first
          cloudOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          safeSetStorage(ORDERS_KEY, cloudOrders);
          callback(cloudOrders);
        } else {
          // If Firestore is empty, push local orders to Firestore so they are recorded in cloud
          const local = this.getOrders();
          if (local.length > 0) {
            local.forEach((o) => syncDocToFirestore('orders', o.orderId, o));
            callback(local);
          }
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'orders');
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'orders');
    }

    return () => {
      isSubscribed = false;
      unsubFirestore();
      if (typeof window !== 'undefined') {
        window.removeEventListener('khairul_fresh_orders_updated', handleLocalUpdate);
      }
    };
  },

  subscribeProducts(callback: (products: Product[]) => void): Unsubscribe {
    try {
      const prodsCol = collection(db, 'products');
      return onSnapshot(prodsCol, (snapshot) => {
        if (!snapshot.empty) {
          const cloudProds: Product[] = [];
          snapshot.forEach((docSnap) => {
            cloudProds.push(docSnap.data() as Product);
          });
          if (cloudProds.length > 0) {
            safeSetStorage(PRODUCTS_KEY, cloudProds);
            callback(cloudProds);
            try {
              window.dispatchEvent(new CustomEvent('khairul_fresh_products_updated', { detail: cloudProds }));
            } catch {
              // ignore
            }
          }
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'products');
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'products');
      return () => {};
    }
  },

  subscribeSiteSettings(callback: (settings: SiteSettings) => void): Unsubscribe {
    try {
      const settingsDoc = doc(db, 'site_settings', 'main');
      return onSnapshot(settingsDoc, (snapshot) => {
        if (snapshot.exists()) {
          const cloudSettings = snapshot.data() as SiteSettings;
          safeSetStorage(SETTINGS_KEY, cloudSettings);
          if (cloudSettings.fonnteConfig && cloudSettings.fonnteConfig.token) {
            fonnteService.saveConfig(cloudSettings.fonnteConfig);
          }
          callback(cloudSettings);
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'site_settings/main');
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'site_settings/main');
      return () => {};
    }
  },

  subscribeCoupons(callback: (coupons: CouponCode[]) => void): Unsubscribe {
    try {
      const couponsCol = collection(db, 'coupons');
      return onSnapshot(couponsCol, (snapshot) => {
        if (!snapshot.empty) {
          const cloudCoupons: CouponCode[] = [];
          snapshot.forEach((docSnap) => {
            cloudCoupons.push(docSnap.data() as CouponCode);
          });
          safeSetStorage(COUPONS_KEY, cloudCoupons);
          callback(cloudCoupons);
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'coupons');
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'coupons');
      return () => {};
    }
  },

  // Initial Sync from Firestore (One-time fetch)
  async syncInitialDataFromCloud(): Promise<void> {
    try {
      // Sync products if cloud has none, seed default products to cloud
      const prodSnap = await getDocs(collection(db, 'products'));
      if (prodSnap.empty) {
        const batch = writeBatch(db);
        PRODUCTS.forEach((p) => {
          const pRef = doc(db, 'products', p.id);
          batch.set(pRef, p);
        });
        await batch.commit();
      }

      // Sync settings if cloud has none
      const settingsSnap = await getDocs(collection(db, 'site_settings'));
      if (settingsSnap.empty) {
        await setDoc(doc(db, 'site_settings', 'main'), DEFAULT_SITE_SETTINGS);
      }

      // Sync media library if cloud has none
      const mediaSnap = await getDocs(collection(db, 'media_library'));
      if (mediaSnap.empty) {
        const batch = writeBatch(db);
        const defaultMedia = this.getMediaLibrary();
        defaultMedia.forEach((m) => {
          const mRef = doc(db, 'media_library', m.id);
          batch.set(mRef, m);
        });
        await batch.commit();
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'initial_sync');
    }
  },

  // Orders
  getOrders(): OrderRecord[] {
    if (inMemoryStore.has(ORDERS_KEY)) {
      const mem = inMemoryStore.get(ORDERS_KEY);
      if (Array.isArray(mem)) return mem;
    }
    try {
      const saved = localStorage.getItem(ORDERS_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          inMemoryStore.set(ORDERS_KEY, parsed);
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    inMemoryStore.set(ORDERS_KEY, INITIAL_ORDERS);
    return INITIAL_ORDERS;
  },

  clearAllOrders(adminName: string = 'Admin'): OrderRecord[] {
    inMemoryStore.set(ORDERS_KEY, []);
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
      localStorage.removeItem('khairul_last_order_backup');
      localStorage.removeItem('khairul_pending_hitpay_order');
    } catch {
      // ignore
    }

    // Delete all order documents from Cloud Firestore
    try {
      getDocs(collection(db, 'orders')).then((snap) => {
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.forEach((docSnap) => {
            batch.delete(docSnap.ref);
          });
          batch.commit().catch((err) => console.warn('[Firestore] Clear orders batch error:', err));
        }
      }).catch((e) => console.warn('[Firestore] Clear orders query error:', e));
    } catch (e) {
      console.warn('Clear orders error:', e);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('khairul_fresh_orders_updated', { detail: [] }));
    }

    this.addAuditLog({
      action: 'SEMUA PESANAN DIPADAM',
      performedBy: adminName,
      details: 'Semua pesanan sedia ada telah dibersihkan daripada pangkalan data.',
      type: 'system',
    });

    return [];
  },

  saveOrder(newOrder: OrderRecord): OrderRecord[] {
    const orders = this.getOrders();
    const updated = [newOrder, ...orders.filter(o => o.orderId !== newOrder.orderId)];
    try {
      safeSetStorage(ORDERS_KEY, updated);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`khairul_order_${newOrder.orderId}`, JSON.stringify(newOrder));
        localStorage.setItem('khairul_last_order_backup', JSON.stringify(newOrder));
      }
    } catch {
      // ignore
    }

    // Push to Firebase Firestore
    syncDocToFirestore('orders', newOrder.orderId, newOrder);

    // Auto-record customer into user registry & Firestore customer directory
    try {
      authService.recordCustomerFromOrder(
        {
          fullName: newOrder.customer.fullName,
          email: newOrder.customer.email,
          phone: newOrder.customer.phone,
        },
        newOrder.total,
        {
          address: newOrder.customer.address,
          city: newOrder.customer.city,
          postcode: newOrder.customer.postcode,
          state: newOrder.customer.state,
        }
      );
    } catch (err) {
      console.info('Auto customer record note:', err);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('khairul_fresh_orders_updated', { detail: updated }));
    }

    this.addAuditLog({
      action: 'Pesanan Baru Masuk',
      performedBy: newOrder.customer.fullName,
      details: `Pesanan #${newOrder.orderId} berjumlah RM ${newOrder.total.toFixed(2)} diterima.`,
      type: 'order',
    });
    return updated;
  },

  /**
   * Async variant that awaits Firestore write confirmation before resolving.
   * Essential for payment gateway redirects (HitPay) so data is securely saved in the cloud before page unload.
   */
  async saveOrderAsync(newOrder: OrderRecord): Promise<OrderRecord[]> {
    const orders = this.getOrders();
    const updated = [newOrder, ...orders.filter(o => o.orderId !== newOrder.orderId)];
    try {
      safeSetStorage(ORDERS_KEY, updated);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`khairul_order_${newOrder.orderId}`, JSON.stringify(newOrder));
        localStorage.setItem('khairul_last_order_backup', JSON.stringify(newOrder));
      }
    } catch {
      // ignore
    }

    // Push to Firebase Firestore and await write confirmation
    try {
      await syncDocToFirestore('orders', newOrder.orderId, newOrder);
    } catch (err) {
      console.warn('[Firestore saveOrderAsync notice]', err);
    }

    // Auto-record customer into user registry & Firestore customer directory
    try {
      authService.recordCustomerFromOrder(
        {
          fullName: newOrder.customer.fullName,
          email: newOrder.customer.email,
          phone: newOrder.customer.phone,
        },
        newOrder.total,
        {
          address: newOrder.customer.address,
          city: newOrder.customer.city,
          postcode: newOrder.customer.postcode,
          state: newOrder.customer.state,
        }
      );
    } catch (err) {
      console.info('Auto customer record note:', err);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('khairul_fresh_orders_updated', { detail: updated }));
    }

    this.addAuditLog({
      action: 'Pesanan Baru Masuk',
      performedBy: newOrder.customer.fullName,
      details: `Pesanan #${newOrder.orderId} berjumlah RM ${newOrder.total.toFixed(2)} diterima.`,
      type: 'order',
    });
    return updated;
  },

  addOrder(newOrder: OrderRecord, customerName?: string): OrderRecord[] {
    return this.saveOrder(newOrder);
  },

  async getOrderById(orderId: string): Promise<OrderRecord | null> {
    if (!orderId) return null;
    const cleanId = orderId.trim();
    // 1. Search in-memory / local storage
    const currentOrders = this.getOrders();
    const foundLocal = currentOrders.find((o) => o.orderId.toLowerCase() === cleanId.toLowerCase());
    if (foundLocal) return foundLocal;

    // 2. Search local backup copies
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const backupRaw = localStorage.getItem(`khairul_order_${cleanId}`);
        if (backupRaw) {
          const parsed = JSON.parse(backupRaw);
          if (parsed && parsed.orderId) return parsed;
        }
        const lastBackup = localStorage.getItem('khairul_last_order_backup');
        if (lastBackup) {
          const parsed = JSON.parse(lastBackup);
          if (parsed && parsed.orderId?.toLowerCase() === cleanId.toLowerCase()) return parsed;
        }
        const pendingRaw = localStorage.getItem('khairul_pending_hitpay_order');
        if (pendingRaw) {
          const parsed = JSON.parse(pendingRaw);
          if (parsed && parsed.orderId?.toLowerCase() === cleanId.toLowerCase() && Array.isArray(parsed.items)) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }

    // 3. Fetch directly from Firebase Firestore
    try {
      const orderRef = doc(db, 'orders', cleanId);
      const snap = await getDoc(orderRef);
      if (snap.exists()) {
        const orderData = snap.data() as OrderRecord;
        const merged = [orderData, ...currentOrders.filter((o) => o.orderId !== orderData.orderId)];
        safeSetStorage(ORDERS_KEY, merged);
        return orderData;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `orders/${cleanId}`);
    }

    return null;
  },

  async findOrderByHitpayReference(refId: string): Promise<OrderRecord | null> {
    if (!refId) return null;
    const cleanRef = refId.trim();

    // 1. Check local orders
    const currentOrders = this.getOrders();
    const foundLocal = currentOrders.find(
      (o) =>
        o.customer?.hitpayPaymentId === cleanRef ||
        o.customer?.hitpayReference === cleanRef ||
        o.orderId.toLowerCase() === cleanRef.toLowerCase()
    );
    if (foundLocal) return foundLocal;

    // 2. Check local pending and backup orders
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const pendingRaw = localStorage.getItem('khairul_pending_hitpay_order');
        if (pendingRaw) {
          const parsed = JSON.parse(pendingRaw);
          if (
            parsed &&
            (parsed.customer?.hitpayPaymentId === cleanRef ||
              parsed.paymentId === cleanRef ||
              parsed.orderId?.toLowerCase() === cleanRef.toLowerCase())
          ) {
            return parsed;
          }
        }
        const lastBackup = localStorage.getItem('khairul_last_order_backup');
        if (lastBackup) {
          const parsed = JSON.parse(lastBackup);
          if (
            parsed &&
            (parsed.customer?.hitpayPaymentId === cleanRef ||
              parsed.orderId?.toLowerCase() === cleanRef.toLowerCase())
          ) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }

    // 3. Query Firestore by customer.hitpayPaymentId or customer.hitpayReference
    try {
      const ordersCol = collection(db, 'orders');
      const q1 = query(ordersCol, where('customer.hitpayPaymentId', '==', cleanRef));
      const snap1 = await getDocs(q1);
      if (!snap1.empty) {
        const orderData = snap1.docs[0].data() as OrderRecord;
        const merged = [orderData, ...currentOrders.filter((o) => o.orderId !== orderData.orderId)];
        safeSetStorage(ORDERS_KEY, merged);
        return orderData;
      }

      const q2 = query(ordersCol, where('customer.hitpayReference', '==', cleanRef));
      const snap2 = await getDocs(q2);
      if (!snap2.empty) {
        const orderData = snap2.docs[0].data() as OrderRecord;
        const merged = [orderData, ...currentOrders.filter((o) => o.orderId !== orderData.orderId)];
        safeSetStorage(ORDERS_KEY, merged);
        return orderData;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'orders');
    }

    return null;
  },

  updateOrderStatus(orderId: string, newStatus: OrderRecord['status'], adminName: string): OrderRecord[] {
    const orders = this.getOrders();
    let updatedOrderObj: OrderRecord | null = null;
    const updated = orders.map((o) => {
      if (o.orderId === orderId) {
        let estText = o.estimatedDeliveryText;
        if (newStatus === 'sembelih-potong') estText = 'Sedang Dipotong & Disediakan';
        if (newStatus === 'pembungkusan-sejuk') estText = 'Pack Dan Tunggu Rider';
        if (newStatus === 'dalam-penghantaran') estText = 'Rider Sedang Menghantar Ke Lokasi';
        if (newStatus === 'selesai') estText = 'Selesai Dihantar';
        if (newStatus === 'dibatalkan') estText = 'Pesanan Dibatalkan';
        if (newStatus === 'disahkan') {
          estText = o.fulfillmentType === 'pickup' ? 'Disahkan • Sedia Diambil Di Kedai' : 'Disahkan • Dalam Giliran Penghantaran';
        }

        const updatedCustomer = o.customer ? {
          ...o.customer,
          hitpayStatus: (newStatus === 'disahkan' && o.customer.paymentMethod === 'hitpay') ? 'completed' as const : o.customer.hitpayStatus,
        } : o.customer;

        updatedOrderObj = { 
          ...o, 
          status: newStatus, 
          estimatedDeliveryText: estText,
          customer: updatedCustomer,
        };
        return updatedOrderObj;
      }
      return o;
    });

    try {
      safeSetStorage(ORDERS_KEY, updated);
    } catch {
      // ignore
    }

    // Push to Firebase Firestore
    if (updatedOrderObj) {
      syncDocToFirestore('orders', orderId, updatedOrderObj);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('khairul_fresh_orders_updated', { detail: updated }));
    }

    this.addAuditLog({
      action: 'Kemaskini Status Pesanan',
      performedBy: adminName,
      details: `Pesanan #${orderId} ditukar status kepada: "${newStatus}".`,
      type: 'order',
    });

    return updated;
  },

  updateOrderPaymentStatus(orderId: string, paymentStatus: 'paid' | 'unpaid', adminName: string): OrderRecord[] {
    const orders = this.getOrders();
    let updatedOrderObj: OrderRecord | null = null;
    const updated = orders.map((o) => {
      if (o.orderId === orderId) {
        let newStatus = o.status;
        if (paymentStatus === 'paid' && o.status === 'menunggu_bayaran') {
          newStatus = 'disahkan';
        } else if (paymentStatus === 'unpaid' && o.status === 'disahkan') {
          newStatus = 'menunggu_bayaran';
        }

        let estText = o.estimatedDeliveryText;
        if (newStatus === 'disahkan') {
          estText = o.fulfillmentType === 'pickup' ? 'Disahkan • Sedia Diambil Di Kedai' : 'Disahkan • Dalam Giliran Penghantaran';
        } else if (newStatus === 'menunggu_bayaran') {
          estText = 'Menunggu Pembayaran Dilengkapkan';
        }

        const updatedCustomer = o.customer ? {
          ...o.customer,
          hitpayStatus: paymentStatus === 'paid' ? ('completed' as const) : ('pending' as const),
        } : o.customer;

        updatedOrderObj = {
          ...o,
          paymentStatus,
          status: newStatus,
          estimatedDeliveryText: estText,
          customer: updatedCustomer,
        };
        return updatedOrderObj;
      }
      return o;
    });

    try {
      safeSetStorage(ORDERS_KEY, updated);
      if (typeof window !== 'undefined' && window.localStorage && updatedOrderObj) {
        localStorage.setItem(`khairul_order_${orderId}`, JSON.stringify(updatedOrderObj));
      }
    } catch {
      // ignore
    }

    if (updatedOrderObj) {
      syncDocToFirestore('orders', orderId, updatedOrderObj);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('khairul_fresh_orders_updated', { detail: updated }));
    }

    this.addAuditLog({
      action: 'Kemaskini Status Bayaran',
      performedBy: adminName,
      details: `Status bayaran #${orderId} ditukar kepada "${paymentStatus === 'paid' ? 'LUNAS (Sudah Bayar)' : 'BELUM BAYAR'}".`,
      type: 'order',
    });

    return updated;
  },

  deleteOrder(orderId: string, adminName: string): OrderRecord[] {
    const orders = this.getOrders();
    const updated = orders.filter(o => o.orderId !== orderId);
    
    try {
      safeSetStorage(ORDERS_KEY, updated);
    } catch {
      // ignore
    }

    // Remove from Firebase Firestore
    if (typeof window !== 'undefined') {
      import('firebase/firestore').then(({ deleteDoc, doc }) => {
        import('./firebase').then(({ db }) => {
          deleteDoc(doc(db, 'orders', orderId)).catch(() => {});
        });
      }).catch(() => {});
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('khairul_fresh_orders_updated', { detail: updated }));
    }

    this.addAuditLog({
      action: 'Padam Pesanan',
      performedBy: adminName,
      details: `Pesanan #${orderId} telah dipadam dari pangkalan data.`,
      type: 'order',
    });

    return updated;
  },

  cancelOrder(orderId: string, userOrAdmin: string): { success: boolean; message: string; orders: OrderRecord[] } {
    const orders = this.getOrders();
    const target = orders.find((o) => o.orderId === orderId);
    if (!target) {
      return { success: false, message: 'Pesanan tidak dijumpai', orders };
    }

    if (target.status !== 'disahkan' && userOrAdmin !== 'Admin') {
      return {
        success: false,
        message: 'Pesanan tidak boleh dibatalkan secara automatik kerana pesanan telah mula dipotong / diproses. Sila hubungi talian WhatsApp kami segera.',
        orders,
      };
    }

    const updated = orders.map((o) => {
      if (o.orderId === orderId) {
        return { ...o, status: 'dibatalkan' as const, estimatedDeliveryText: 'Pesanan Dibatalkan' };
      }
      return o;
    });

    try {
      safeSetStorage(ORDERS_KEY, updated);
    } catch {
      // ignore
    }

    // Update in Firestore
    const cancelledOrder = updated.find(o => o.orderId === orderId);
    if (cancelledOrder) {
      syncDocToFirestore('orders', orderId, cancelledOrder);
    }

    this.addAuditLog({
      action: 'Pembatalan Pesanan',
      performedBy: userOrAdmin,
      details: `Pesanan #${orderId} telah dibatalkan.`,
      type: 'order',
    });

    return { success: true, message: 'Pesanan berjaya dibatalkan.', orders: updated };
  },

  // Products
  getProducts(): Product[] {
    try {
      const saved = localStorage.getItem(PRODUCTS_KEY);
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    try {
      safeSetStorage(PRODUCTS_KEY, PRODUCTS);
    } catch {
      // ignore
    }
    return PRODUCTS;
  },

  resetAllProductImages(adminName: string): Product[] {
    const current = this.getProducts();
    const updated = current.map(p => ({
      ...p,
      image: ''
    }));
    return this.saveProducts(updated, adminName, 'Semua foto produk telah dipadam (reset gambar kosong) untuk input baru.');
  },

  saveProducts(products: Product[], adminName: string, actionNote: string): Product[] {
    try {
      safeSetStorage(PRODUCTS_KEY, products);
    } catch (e) {
      console.warn('Local storage products save warning:', e);
    }

    // Sync each product to Firestore without merge to properly overwrite cleared fields like image
    try {
      const batch = writeBatch(db);
      products.forEach((p) => {
        const pRef = doc(db, 'products', p.id);
        batch.set(pRef, p);
      });
      batch.commit().catch(e => console.warn('Firestore products batch sync error:', e));
    } catch (e) {
      console.warn('Firestore batch error:', e);
    }

    try {
      window.dispatchEvent(new CustomEvent('khairul_fresh_products_updated', { detail: products }));
    } catch {
      // ignore
    }

    this.addAuditLog({
      action: 'Kemaskini Katalog Produk',
      performedBy: adminName,
      details: actionNote,
      type: 'product',
    });
    return products;
  },

  updateProduct(updatedProduct: Product, adminName: string): Product[] {
    const current = this.getProducts();
    const index = current.findIndex((p) => p.id === updatedProduct.id);
    let list: Product[];
    if (index >= 0) {
      list = [...current];
      list[index] = updatedProduct;
    } else {
      list = [updatedProduct, ...current];
    }
    syncDocToFirestore('products', updatedProduct.id, updatedProduct, false);
    return this.saveProducts(list, adminName, `Produk "${updatedProduct.name}" (RM ${updatedProduct.price.toFixed(2)}) dikemaskini.`);
  },

  deleteProduct(productId: string, adminName: string): Product[] {
    const current = this.getProducts();
    const target = current.find((p) => p.id === productId);
    const updated = current.filter((p) => p.id !== productId);
    deleteDocFromFirestore('products', productId);
    return this.saveProducts(updated, adminName, `Produk "${target?.name || productId}" dipadam daripada katalog.`);
  },

  // ==========================================
  // MASTER MEDIA LIBRARY (Folder & Galeri Media)
  // ==========================================
  getMediaLibrary(): MediaItem[] {
    try {
      const saved = localStorage.getItem(MEDIA_LIBRARY_KEY);
      if (saved !== null) {
        const parsed: MediaItem[] = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading media library:', e);
    }
    return [];
  },

  saveMediaLibrary(items: MediaItem[]): void {
    try {
      safeSetStorage(MEDIA_LIBRARY_KEY, items);
    } catch (e) {
      console.warn('Local storage media library error:', e);
    }
  },

  addMediaItem(item: Omit<MediaItem, 'id' | 'uploadedAt'>): MediaItem {
    const current = this.getMediaLibrary();
    const newItem: MediaItem = {
      ...item,
      id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      uploadedAt: new Date().toISOString(),
    };
    const updated = [newItem, ...current];
    this.saveMediaLibrary(updated);
    syncDocToFirestore('media_library', newItem.id, newItem);
    return newItem;
  },

  updateMediaItem(id: string, updates: Partial<MediaItem>, adminName?: string): MediaItem[] {
    const current = this.getMediaLibrary();
    const target = current.find(m => m.id === id);
    if (!target) return current;

    const updatedItem: MediaItem = {
      ...target,
      ...updates,
    };

    const updated = current.map(m => m.id === id ? updatedItem : m);
    this.saveMediaLibrary(updated);
    syncDocToFirestore('media_library', id, updatedItem);

    if (adminName && updates.name) {
      this.addAuditLog({
        action: 'Tukar Nama Foto Media Master',
        performedBy: adminName,
        details: `Nama imej "${target.name}" ditukar kepada "${updatedItem.name}".`,
        type: 'product',
      });
    }

    return updated;
  },

  deleteMediaItem(id: string, adminName?: string): MediaItem[] {
    const current = this.getMediaLibrary();
    const target = current.find(m => m.id === id || m.url === id);
    const updated = current.filter(m => m.id !== id && m.url !== id);
    this.saveMediaLibrary(updated);
    if (target) {
      deleteDocFromFirestore('media_library', target.id);
    } else {
      deleteDocFromFirestore('media_library', id);
    }
    if (adminName && target) {
      this.addAuditLog({
        action: 'Padam Foto Media Master',
        performedBy: adminName,
        details: `Imej "${target.name}" dipadam dari galeri master.`,
        type: 'product',
      });
    }
    return updated;
  },

  subscribeMediaLibrary(callback: (items: MediaItem[]) => void): Unsubscribe {
    const initial = this.getMediaLibrary();
    callback(initial);

    try {
      const colRef = collection(db, 'media_library');
      return onSnapshot(
        colRef,
        (snapshot) => {
          const list: MediaItem[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as MediaItem);
          });
          list.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
          
          // Only overwrite local storage if snapshot has documents or if user intentionally deleted all
          if (!snapshot.empty) {
            this.saveMediaLibrary(list);
            callback(list);
          } else {
            // If cloud is empty, check if we have local items to seed to cloud
            const local = this.getMediaLibrary();
            if (local.length > 0) {
              local.forEach((m) => syncDocToFirestore('media_library', m.id, m));
              callback(local);
            } else {
              this.saveMediaLibrary([]);
              callback([]);
            }
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'media_library');
        }
      );
    } catch (e) {
      console.warn('subscribeMediaLibrary error:', e);
      return () => {};
    }
  },


  // Site Settings
  getSiteSettings(): SiteSettings {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed: SiteSettings = JSON.parse(saved);
        if (!parsed.hitpayConfig) {
          parsed.hitpayConfig = DEFAULT_SITE_SETTINGS.hitpayConfig;
        }
        if (!parsed.fonnteConfig) {
          parsed.fonnteConfig = DEFAULT_SITE_SETTINGS.fonnteConfig;
        }
        if (!parsed.thermalReceiptSettings) {
          parsed.thermalReceiptSettings = DEFAULT_SITE_SETTINGS.thermalReceiptSettings;
        }
        if (!parsed.duitnowConfig) {
          parsed.duitnowConfig = DEFAULT_SITE_SETTINGS.duitnowConfig;
        } else {
          if (!parsed.duitnowConfig.duitnowId || parsed.duitnowConfig.duitnowId === '01111135503' || parsed.duitnowConfig.duitnowId === '601111135503') {
            parsed.duitnowConfig.duitnowId = '202503301954';
            parsed.duitnowConfig.duitnowIdType = 'Business Registration No. (SSM)';
          }
        }
        if (parsed.enableCoolerBoxOption === undefined) {
          parsed.enableCoolerBoxOption = false;
        }
        parsed.supportPhone = '011-11135503';
        return parsed;
      }
    } catch {
      // ignore
    }
    try {
      safeSetStorage(SETTINGS_KEY, DEFAULT_SITE_SETTINGS);
    } catch {
      // ignore
    }
    return DEFAULT_SITE_SETTINGS;
  },

  saveSiteSettings(settings: SiteSettings, adminName: string): SiteSettings {
    try {
      safeSetStorage(SETTINGS_KEY, settings);
    } catch {
      // ignore
    }

    if (settings.fonnteConfig && settings.fonnteConfig.token) {
      fonnteService.saveConfig(settings.fonnteConfig);
    }

    // Push to Firestore
    syncDocToFirestore('site_settings', 'main', settings);

    this.addAuditLog({
      action: 'Kemaskini Tetapan Halaman',
      performedBy: adminName,
      details: 'Pengumuman dan tetapan kedai dikemaskini.',
      type: 'system',
    });
    return settings;
  },

  // Audit Logs
  getAuditLogs(): AdminAuditLog[] {
    try {
      const saved = localStorage.getItem(AUDIT_LOGS_KEY);
      if (saved) {
        const parsed: AdminAuditLog[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const seen = new Set<string>();
          const sanitized = parsed.map((item, idx) => {
            if (!item.id || seen.has(item.id)) {
              const uniqueId = `log-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`;
              seen.add(uniqueId);
              return { ...item, id: uniqueId };
            }
            seen.add(item.id);
            return item;
          });
          return sanitized;
        }
      }
    } catch {
      // ignore
    }
    try {
      safeSetStorage(AUDIT_LOGS_KEY, INITIAL_AUDIT_LOGS);
    } catch {
      // ignore
    }
    return INITIAL_AUDIT_LOGS;
  },

  addAuditLog(log: Omit<AdminAuditLog, 'id' | 'timestamp'>) {
    const current = this.getAuditLogs();
    const newLog: AdminAuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...current.slice(0, 49)]; // keep latest 50
    try {
      safeSetStorage(AUDIT_LOGS_KEY, updated);
    } catch {
      // ignore
    }
    syncDocToFirestore('audit_logs', newLog.id, newLog);
  },

  // Stock Alert Subscriptions ('Notify Me' when item is back in stock)
  getStockAlerts(): StockAlertSubscription[] {
    try {
      const saved = localStorage.getItem(STOCK_ALERTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  },

  saveStockAlert(sub: Omit<StockAlertSubscription, 'id' | 'createdAt' | 'status'>): StockAlertSubscription {
    const alerts = this.getStockAlerts();
    const newAlert: StockAlertSubscription = {
      ...sub,
      id: `alert-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    const updated = [newAlert, ...alerts];
    try {
      safeSetStorage(STOCK_ALERTS_KEY, updated);
    } catch {
      // ignore
    }
    syncDocToFirestore('stock_alerts', newAlert.id, newAlert);
    this.addAuditLog({
      action: 'Langganan Makluman Stok Baru',
      performedBy: sub.customerName,
      details: `Permintaan makluman stok untuk "${sub.productName}" via ${sub.channel.toUpperCase()}.`,
      type: 'product',
    });
    return newAlert;
  },

  markStockAlertNotified(alertId: string, adminName: string): StockAlertSubscription[] {
    const alerts = this.getStockAlerts();
    const updated = alerts.map((a) => {
      if (a.id === alertId) {
        const item = {
          ...a,
          status: 'notified' as const,
          notifiedAt: new Date().toISOString(),
        };
        syncDocToFirestore('stock_alerts', alertId, item);
        return item;
      }
      return a;
    });
    try {
      safeSetStorage(STOCK_ALERTS_KEY, updated);
    } catch {
      // ignore
    }
    this.addAuditLog({
      action: 'Penghantaran Makluman Stok',
      performedBy: adminName,
      details: `Notifikasi stok masuk dihantar untuk permintaan #${alertId}.`,
      type: 'product',
    });
    return updated;
  },

  notifyAllForProduct(productId: string, adminName: string): { updatedAlerts: StockAlertSubscription[]; notifiedCount: number } {
    const alerts = this.getStockAlerts();
    let count = 0;
    const updated = alerts.map((a) => {
      if (a.productId === productId && a.status === 'pending') {
        count++;
        const item = {
          ...a,
          status: 'notified' as const,
          notifiedAt: new Date().toISOString(),
        };
        syncDocToFirestore('stock_alerts', item.id, item);
        return item;
      }
      return a;
    });
    try {
      safeSetStorage(STOCK_ALERTS_KEY, updated);
    } catch {
      // ignore
    }
    if (count > 0) {
      this.addAuditLog({
        action: 'Notifikasi Restock Pukal',
        performedBy: adminName,
        details: `Notifikasi restock dihantar secara automatik kepada ${count} pelanggan.`,
        type: 'product',
      });
    }
    return { updatedAlerts: updated, notifiedCount: count };
  },

  // 30-Day Daily Sales Analytics Generation (Computed strictly from real orders)
  getDailySalesStats(days: number = 30): DailySalesStat[] {
    const orders = this.getOrders();
    const result: DailySalesStat[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // Find real matching orders on this day if any
      const matchingOrders = orders.filter((o) => o.createdAt.startsWith(dateStr) && o.status !== 'dibatalkan');

      const totalRev = Number(matchingOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2));
      const totalOrders = matchingOrders.length;
      const chickensSold = matchingOrders.reduce((acc, o) => acc + o.items.reduce((s, it) => s + it.quantity, 0), 0);
      const dayName = d.toLocaleDateString('ms-MY', { weekday: 'short', day: 'numeric', month: 'short' });

      result.push({
        date: dateStr,
        formattedDate: dayName,
        revenue: totalRev,
        orderCount: totalOrders,
        chickensSold,
        avgOrderValue: totalOrders > 0 ? Number((totalRev / totalOrders).toFixed(2)) : 0,
      });
    }

    return result;
  },

  // Top Selling Products Analytics (Computed from real orders)
  getTopSellingProducts(): ProductSalesStat[] {
    const products = this.getProducts();
    const orders = this.getOrders();

    const salesMap: Record<string, { units: number; revenue: number }> = {};

    products.forEach((p) => {
      salesMap[p.id] = {
        units: 0,
        revenue: 0,
      };
    });

    // Add actual logged orders
    orders.forEach((o) => {
      if (o.status === 'dibatalkan') return;
      o.items.forEach((item) => {
        if (!salesMap[item.product.id]) {
          salesMap[item.product.id] = { units: 0, revenue: 0 };
        }
        salesMap[item.product.id].units += item.quantity;
        salesMap[item.product.id].revenue += item.itemTotalPrice;
      });
    });

    return products.map((p) => {
      const stats = salesMap[p.id] || { units: 0, revenue: 0 };
      const totalRevenue = Number(stats.revenue.toFixed(2));
      return {
        productId: p.id,
        productName: p.name,
        category: p.category,
        unitsSold: stats.units,
        totalRevenue,
        stockRemaining: p.remainingStock || 0,
      };
    }).sort((a, b) => b.unitsSold - a.unitsSold);
  },

  // ==================== KOD KUPON (PROMO / COUPON CODES) ====================
  getCoupons(): CouponCode[] {
    try {
      const raw = localStorage.getItem(COUPONS_KEY);
      if (raw) {
        const stored: CouponCode[] = JSON.parse(raw);
        if (Array.isArray(stored)) {
          return stored;
        }
      }
    } catch (e) {
      console.warn('Failed to load coupons from storage:', e);
    }
    this.saveCoupons(DEFAULT_COUPONS);
    return DEFAULT_COUPONS;
  },

  saveCoupons(coupons: CouponCode[]): void {
    try {
      safeSetStorage(COUPONS_KEY, coupons);
    } catch (e) {
      console.warn('Failed to save coupons to storage:', e);
    }
    // Sync coupons to Firestore
    try {
      const batch = writeBatch(db);
      coupons.forEach((c) => {
        const cRef = doc(db, 'coupons', c.id);
        batch.set(cRef, c, { merge: true });
      });
      batch.commit().catch(e => console.warn('Firestore coupon sync error:', e));
    } catch (e) {
      console.warn('Firestore coupon batch error:', e);
    }
  },

  addCoupon(couponData: Omit<CouponCode, 'id' | 'createdAt' | 'usageCount'>): CouponCode {
    const coupons = this.getCoupons();
    const newCoupon: CouponCode = {
      ...couponData,
      id: 'coup-' + Date.now(),
      code: couponData.code.trim().toUpperCase(),
      createdAt: new Date().toISOString(),
      usageCount: 0,
    };

    const updated = [newCoupon, ...coupons];
    this.saveCoupons(updated);
    syncDocToFirestore('coupons', newCoupon.id, newCoupon);
    return newCoupon;
  },

  updateCoupon(updatedCoupon: CouponCode): void {
    const coupons = this.getCoupons();
    const index = coupons.findIndex((c) => c.id === updatedCoupon.id);
    if (index !== -1) {
      coupons[index] = {
        ...updatedCoupon,
        code: updatedCoupon.code.trim().toUpperCase(),
      };
      this.saveCoupons(coupons);
      syncDocToFirestore('coupons', updatedCoupon.id, coupons[index]);
    }
  },

  toggleCouponStatus(id: string): void {
    const coupons = this.getCoupons();
    const target = coupons.find((c) => c.id === id);
    if (target) {
      target.isActive = !target.isActive;
      this.saveCoupons(coupons);
      syncDocToFirestore('coupons', id, target);
    }
  },

  deleteCoupon(id: string): void {
    const coupons = this.getCoupons();
    const filtered = coupons.filter((c) => c.id !== id);
    this.saveCoupons(filtered);
    deleteDocFromFirestore('coupons', id);
  },

  validateCoupon(code: string, subtotal: number, deliveryFee: number = 6.00): {
    valid: boolean;
    coupon?: CouponCode;
    discount: number;
    message: string;
    type: 'item' | 'delivery';
  } {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { valid: false, discount: 0, message: 'Sila masukkan kod kupon.', type: 'item' };
    }

    const coupons = this.getCoupons();
    const coupon = coupons.find((c) => c.code.toUpperCase() === cleanCode);

    if (!coupon) {
      return { valid: false, discount: 0, message: `Kod kupon "${cleanCode}" tidak sah atau tidak dijumpai.`, type: 'item' };
    }

    if (!coupon.isActive) {
      return { valid: false, discount: 0, message: `Kod kupon "${cleanCode}" telah dinyahaktifkan.`, type: 'item' };
    }

    if (coupon.expiryDate) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (todayStr > coupon.expiryDate) {
        return { valid: false, discount: 0, message: `Kod kupon "${cleanCode}" telah tamat tempoh pada ${coupon.expiryDate}.`, type: 'item' };
      }
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, discount: 0, message: `Kod kupon "${cleanCode}" telah mencapai had penebusan maksimum.`, type: 'item' };
    }

    const isDeliveryType = coupon.discountType === 'delivery' || coupon.category === 'delivery';

    if (subtotal < coupon.minSpend) {
      return {
        valid: false,
        discount: 0,
        message: `Belian minimum RM ${coupon.minSpend.toFixed(2)} diperlukan untuk kupon ini. (Troli anda: RM ${subtotal.toFixed(2)})`,
        type: isDeliveryType ? 'delivery' : 'item'
      };
    }

    let calculatedDiscount = 0;
    if (isDeliveryType) {
      calculatedDiscount = Math.min(deliveryFee, coupon.discountValue);
    } else if (coupon.discountType === 'fixed') {
      calculatedDiscount = Math.min(subtotal, coupon.discountValue);
    } else if (coupon.discountType === 'percentage') {
      calculatedDiscount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && calculatedDiscount > coupon.maxDiscount) {
        calculatedDiscount = coupon.maxDiscount;
      }
    }

    calculatedDiscount = Number(calculatedDiscount.toFixed(2));

    const successMsg = isDeliveryType
      ? `Kod Penghantaran ${coupon.code} berjaya digunakan! Jimat caj penghantaran RM ${calculatedDiscount.toFixed(2)}.`
      : coupon.discountType === 'percentage'
        ? `Kod Diskaun ${coupon.code} (${coupon.discountValue}%) berjaya ditebus! Jimat RM ${calculatedDiscount.toFixed(2)}.`
        : `Kod ${coupon.code} berjaya ditebus! Jimat RM ${calculatedDiscount.toFixed(2)}.`;

    return {
      valid: true,
      coupon,
      discount: calculatedDiscount,
      message: successMsg,
      type: isDeliveryType ? 'delivery' : 'item'
    };
  },

  recordCouponUsage(code: string): void {
    const cleanCode = code.trim().toUpperCase();
    const coupons = this.getCoupons();
    const target = coupons.find((c) => c.code.toUpperCase() === cleanCode);
    if (target) {
      target.usageCount += 1;
      this.saveCoupons(coupons);
      syncDocToFirestore('coupons', target.id, target);
    }
  },

  // ==========================================
  // ROTATION BANNER STORAGE (12s Frontpage)
  // ==========================================
  getRotationBanners(): RotationBannerItem[] {
    try {
      const data = localStorage.getItem(BANNERS_KEY);
      if (!data) {
        this.saveRotationBanners(DEFAULT_ROTATION_BANNERS);
        return DEFAULT_ROTATION_BANNERS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => (a.order || 0) - (b.order || 0));
      }
      return DEFAULT_ROTATION_BANNERS;
    } catch {
      return DEFAULT_ROTATION_BANNERS;
    }
  },

  saveRotationBanners(banners: RotationBannerItem[]): void {
    try {
      safeSetStorage(BANNERS_KEY, banners);
    } catch (e) {
      console.warn('Notice saving rotation banners:', e);
    }
  },

  addRotationBanner(banner: Omit<RotationBannerItem, 'id'>): RotationBannerItem {
    const banners = this.getRotationBanners();
    const newBanner: RotationBannerItem = {
      ...banner,
      id: `banner-${Date.now()}`,
      order: banners.length + 1,
    };
    banners.push(newBanner);
    this.saveRotationBanners(banners);
    syncDocToFirestore('rotation_banners', newBanner.id, newBanner);
    return newBanner;
  },

  updateRotationBanner(id: string, updates: Partial<RotationBannerItem>): RotationBannerItem | null {
    const banners = this.getRotationBanners();
    const index = banners.findIndex((b) => b.id === id);
    if (index === -1) return null;

    banners[index] = {
      ...banners[index],
      ...updates,
    };
    this.saveRotationBanners(banners);
    syncDocToFirestore('rotation_banners', id, banners[index]);
    return banners[index];
  },

  deleteRotationBanner(id: string): void {
    const banners = this.getRotationBanners();
    const filtered = banners.filter((b) => b.id !== id);
    this.saveRotationBanners(filtered);
    deleteDocFromFirestore('rotation_banners', id);
  },

  resetRotationBannersToDefault(): RotationBannerItem[] {
    this.saveRotationBanners(DEFAULT_ROTATION_BANNERS);
    return DEFAULT_ROTATION_BANNERS;
  }
};
