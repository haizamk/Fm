import { 
  OrderRecord, 
  Product, 
  SiteSettings, 
  AdminAuditLog, 
  StockAlertSubscription, 
  DailySalesStat, 
  ProductSalesStat, 
  CouponCode, 
  RotationBannerItem 
} from '../types';
import { PRODUCTS } from '../data/products';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
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

// Clear legacy demo keys
try {
  localStorage.removeItem('freshayam_orders_db');
  localStorage.removeItem('freshayam_orders_db_v4');
  localStorage.removeItem('freshayam_audit_logs');
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
  supportPhone: '011-2856 8920',
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
  thermalReceiptSettings: {
    showLogo: true,
    logoUrl: '',
    promoText: '★ TAWARAN HEBAT: IMBAS QR & TEBUS MATA GANJARAN!',
    showPromoText: true,
    storeName: 'KHAIRUL FRESH FOOD',
    storeAddress: 'Pasar Sementara Semenyih, Gerai GA 59',
    storePhone: '011-2856 8920 / 011-1113 5503',
  },
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

// Helper to push to Firestore in background safely
async function syncDocToFirestore(collectionName: string, docId: string, data: any) {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.warn(`Firestore sync failed for ${collectionName}/${docId}:`, error);
  }
}

async function deleteDocFromFirestore(collectionName: string, docId: string) {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn(`Firestore delete failed for ${collectionName}/${docId}:`, error);
  }
}

export const dataStorageService = {
  // Real-time Firestore Subscriptions
  subscribeOrders(callback: (orders: OrderRecord[]) => void): Unsubscribe {
    try {
      const ordersCol = collection(db, 'orders');
      return onSnapshot(ordersCol, (snapshot) => {
        if (!snapshot.empty) {
          const cloudOrders: OrderRecord[] = [];
          snapshot.forEach((docSnap) => {
            cloudOrders.push(docSnap.data() as OrderRecord);
          });
          // Sort newest first
          cloudOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          localStorage.setItem(ORDERS_KEY, JSON.stringify(cloudOrders));
          callback(cloudOrders);
        }
      }, (err) => {
        console.warn('Firestore orders subscription error:', err);
      });
    } catch (e) {
      console.warn('Could not initialize orders subscription:', e);
      return () => {};
    }
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
            localStorage.setItem(PRODUCTS_KEY, JSON.stringify(cloudProds));
            callback(cloudProds);
          }
        }
      }, (err) => {
        console.warn('Firestore products subscription error:', err);
      });
    } catch (e) {
      console.warn('Could not initialize products subscription:', e);
      return () => {};
    }
  },

  subscribeSiteSettings(callback: (settings: SiteSettings) => void): Unsubscribe {
    try {
      const settingsDoc = doc(db, 'site_settings', 'main');
      return onSnapshot(settingsDoc, (snapshot) => {
        if (snapshot.exists()) {
          const cloudSettings = snapshot.data() as SiteSettings;
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(cloudSettings));
          callback(cloudSettings);
        }
      }, (err) => {
        console.warn('Firestore settings subscription error:', err);
      });
    } catch (e) {
      console.warn('Could not initialize settings subscription:', e);
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
          localStorage.setItem(COUPONS_KEY, JSON.stringify(cloudCoupons));
          callback(cloudCoupons);
        }
      }, (err) => {
        console.warn('Firestore coupons subscription error:', err);
      });
    } catch (e) {
      console.warn('Could not initialize coupons subscription:', e);
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
    } catch (e) {
      console.warn('Initial cloud sync error (operating in offline/cached mode):', e);
    }
  },

  // Orders
  getOrders(): OrderRecord[] {
    try {
      const saved = localStorage.getItem(ORDERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
    } catch {
      // ignore
    }
    return INITIAL_ORDERS;
  },

  saveOrder(newOrder: OrderRecord): OrderRecord[] {
    const orders = this.getOrders();
    const updated = [newOrder, ...orders.filter(o => o.orderId !== newOrder.orderId)];
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Push to Firebase Firestore
    syncDocToFirestore('orders', newOrder.orderId, newOrder);

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

  updateOrderStatus(orderId: string, newStatus: OrderRecord['status'], adminName: string): OrderRecord[] {
    const orders = this.getOrders();
    let updatedOrderObj: OrderRecord | null = null;
    const updated = orders.map((o) => {
      if (o.orderId === orderId) {
        let estText = o.estimatedDeliveryText;
        if (newStatus === 'sembelih-potong') estText = 'Sedang Dipotong & Disediakan';
        if (newStatus === 'pembungkusan-sejuk') estText = 'Pek Chilled Suhu 0-4°C Siap';
        if (newStatus === 'dalam-penghantaran') estText = 'Rider Sedang Menghantar Ke Lokasi';
        if (newStatus === 'selesai') estText = 'Selesai Dihantar';
        if (newStatus === 'dibatalkan') estText = 'Pesanan Dibatalkan';
        updatedOrderObj = { ...o, status: newStatus, estimatedDeliveryText: estText };
        return updatedOrderObj;
      }
      return o;
    });

    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Push to Firebase Firestore
    if (updatedOrderObj) {
      syncDocToFirestore('orders', orderId, updatedOrderObj);
    }

    this.addAuditLog({
      action: 'Kemaskini Status Pesanan',
      performedBy: adminName,
      details: `Pesanan #${orderId} ditukar status kepada: "${newStatus}".`,
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
      localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
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
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(PRODUCTS));
    } catch {
      // ignore
    }
    return PRODUCTS;
  },

  saveProducts(products: Product[], adminName: string, actionNote: string): Product[] {
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    } catch {
      // ignore
    }

    // Sync each product to Firestore
    try {
      const batch = writeBatch(db);
      products.forEach((p) => {
        const pRef = doc(db, 'products', p.id);
        batch.set(pRef, p, { merge: true });
      });
      batch.commit().catch(e => console.warn('Firestore products batch sync error:', e));
    } catch (e) {
      console.warn('Firestore batch error:', e);
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
    syncDocToFirestore('products', updatedProduct.id, updatedProduct);
    return this.saveProducts(list, adminName, `Produk "${updatedProduct.name}" (RM ${updatedProduct.price.toFixed(2)}) dikemaskini.`);
  },

  deleteProduct(productId: string, adminName: string): Product[] {
    const current = this.getProducts();
    const target = current.find((p) => p.id === productId);
    const updated = current.filter((p) => p.id !== productId);
    deleteDocFromFirestore('products', productId);
    return this.saveProducts(updated, adminName, `Produk "${target?.name || productId}" dipadam daripada katalog.`);
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
        if (!parsed.thermalReceiptSettings) {
          parsed.thermalReceiptSettings = DEFAULT_SITE_SETTINGS.thermalReceiptSettings;
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SITE_SETTINGS));
    } catch {
      // ignore
    }
    return DEFAULT_SITE_SETTINGS;
  },

  saveSiteSettings(settings: SiteSettings, adminName: string): SiteSettings {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignore
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
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
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
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(updated));
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
      localStorage.setItem(STOCK_ALERTS_KEY, JSON.stringify(updated));
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
      localStorage.setItem(STOCK_ALERTS_KEY, JSON.stringify(updated));
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
      localStorage.setItem(STOCK_ALERTS_KEY, JSON.stringify(updated));
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
        let changed = false;
        DEFAULT_COUPONS.forEach((def) => {
          if (!stored.some((c) => c.code.toUpperCase() === def.code.toUpperCase())) {
            stored.push(def);
            changed = true;
          }
        });
        if (changed) {
          this.saveCoupons(stored);
        }
        return stored;
      }
    } catch (e) {
      console.error('Failed to load coupons from storage:', e);
    }
    this.saveCoupons(DEFAULT_COUPONS);
    return DEFAULT_COUPONS;
  },

  saveCoupons(coupons: CouponCode[]): void {
    try {
      localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
    } catch (e) {
      console.error('Failed to save coupons to storage:', e);
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
      localStorage.setItem(BANNERS_KEY, JSON.stringify(banners));
    } catch (e) {
      console.error('Failed to save rotation banners', e);
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
