import React, { useState, useEffect } from 'react';
import { 
  X, 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Package, 
  Settings, 
  ShieldCheck, 
  Truck, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Printer, 
  LogOut, 
  Phone, 
  Mail, 
  Save, 
  Flame, 
  Scissors, 
  Snowflake, 
  Lock, 
  Eye, 
  Fingerprint, 
  RefreshCw,
  Sparkles,
  DollarSign,
  BarChart3,
  Bell,
  MessageCircle,
  Store,
  ExternalLink,
  Send,
  Tag,
  Percent,
  Copy,
  Check,
  Gift,
  Layers,
  Scale,
  EyeOff,
  CreditCard,
  Key,
  Globe,
  Zap,
  HelpCircle,
  Radio,
  FolderOpen,
  QrCode,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { 
  UserAccount, 
  OrderRecord, 
  Product, 
  SiteSettings, 
  AdminAuditLog, 
  ProductCategory,
  ChickenCutId,
  CouponCode,
  CouponDiscountType,
  RotationBannerItem,
  ProductWeightOption,
  HitPayConfig,
  MediaItem
} from '../types';
import { dataStorageService } from '../services/dataStorage';
import { authService } from '../services/auth';
import { hitpayService, DEFAULT_HITPAY_CONFIG } from '../services/hitpayService';
import { fonnteService, DEFAULT_FONNTE_CONFIG, FonnteConfig } from '../services/fonnteService';
import { AdminDashboardTab } from './AdminDashboardTab';
import { BannerEditorTab } from './BannerEditorTab';
import { ImageUploadDropzone } from './ImageUploadDropzone';
import { ProductImage } from './ProductImage';
import { LogisticsZoneIndicator } from './LogisticsZoneIndicator';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import { MediaLibraryModal } from './MediaLibraryModal';
import { AdminMediaTab } from './AdminMediaTab';
import { AdminWhatsAppGatewayTab } from './AdminWhatsAppGatewayTab';
import { QRScannerModal } from './QRScannerModal';
import { DuitNowStandeeVisual } from './DuitNowOCBCQR';
import { getProductCleanUrl, slugify, copyShareableLink } from '../utils/seoHelper';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser: UserAccount;
  onLogout: () => void;
  onProductsUpdated: (products: Product[]) => void;
  onSettingsUpdated: (settings: SiteSettings) => void;
  banners?: RotationBannerItem[];
  onBannersUpdated?: (banners: RotationBannerItem[]) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  adminUser,
  onLogout,
  onProductsUpdated,
  onSettingsUpdated,
  banners: propBanners,
  onBannersUpdated: propOnBannersUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'customers' | 'products' | 'media' | 'banners' | 'coupons' | 'settings' | 'payment' | 'whatsapp_gateway' | 'security'>('dashboard');


  // Data states from dataStorageService
  const [orders, setOrders] = useState<OrderRecord[]>(() => dataStorageService.getOrders());
  const [products, setProducts] = useState<Product[]>(() => dataStorageService.getProducts());
  const [banners, setBanners] = useState<RotationBannerItem[]>(() => propBanners || dataStorageService.getRotationBanners());
  const [coupons, setCoupons] = useState<CouponCode[]>(() => dataStorageService.getCoupons());
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => dataStorageService.getSiteSettings());
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(() => dataStorageService.getAuditLogs());
  const [customers, setCustomers] = useState<UserAccount[]>(() => authService.getAllUsers());

  // HitPay Gateway State
  const initialHitpay = siteSettings.hitpayConfig || DEFAULT_HITPAY_CONFIG;
  const [hitpayApiKey, setHitpayApiKey] = useState(initialHitpay.apiKey || '');
  const [hitpaySalt, setHitpaySalt] = useState(initialHitpay.salt || '');
  const [hitpayIsSandbox, setHitpayIsSandbox] = useState(initialHitpay.isSandbox ?? true);
  const [hitpayIsActive, setHitpayIsActive] = useState(initialHitpay.isActive ?? true);
  const [hitpayMethods, setHitpayMethods] = useState<('fpx' | 'duitnow' | 'card' | 'grabpay' | 'tng' | 'shopeepay')[]>(
    initialHitpay.enabledMethods || ['fpx', 'duitnow', 'card', 'grabpay', 'tng', 'shopeepay']
  );
  const [hitpayMerchantName, setHitpayMerchantName] = useState(initialHitpay.merchantName || 'Khairul FRESH Food');
  const [hitpayTesting, setHitpayTesting] = useState(false);
  const [hitpayTestResult, setHitpayTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSalt, setShowSalt] = useState(false);
  const [copiedHitpayWebhook, setCopiedHitpayWebhook] = useState(false);
  const [copiedHitpayRedirect, setCopiedHitpayRedirect] = useState(false);

  // DuitNow QR & OCBC Bank State
  const initialDuitNow = siteSettings.duitnowConfig || {
    bankName: 'OCBC Bank (Malaysia) Berhad',
    accountName: 'KHAIRUL FRESH AND FROZEN FOOD',
    accountNumber: '70 6116 3993',
    orderReferenceGuide: 'No. Telefon Pelanggan / no pesanan',
    qrImageUrl: '',
    isActive: true,
  };
  const [duitnowBankName, setDuitnowBankName] = useState(initialDuitNow.bankName || 'OCBC Bank (Malaysia) Berhad');
  const [duitnowAccountName, setDuitnowAccountName] = useState(initialDuitNow.accountName || 'KHAIRUL FRESH AND FROZEN FOOD');
  const [duitnowAccountNumber, setDuitnowAccountNumber] = useState(initialDuitNow.accountNumber || '70 6116 3993');
  const [duitnowQrImage, setDuitnowQrImage] = useState(initialDuitNow.qrImageUrl || '');
  const [duitnowIsActive, setDuitnowIsActive] = useState(initialDuitNow.isActive ?? true);
  const [duitnowFileInputRef] = useState<React.RefObject<HTMLInputElement | null>>({ current: null });

  // Fonnte WhatsApp Gateway State
  const initialFonnte = fonnteService.getConfig();
  const [fonnteToken, setFonnteToken] = useState(initialFonnte.token || '');
  const [fonnteAdminPhone, setFonnteAdminPhone] = useState(initialFonnte.adminPhone || '011-11135503');
  const [fonnteAutoNotifyAdmin, setFonnteAutoNotifyAdmin] = useState(initialFonnte.autoNotifyAdmin ?? true);
  const [fonnteAutoNotifyCustomer, setFonnteAutoNotifyCustomer] = useState(initialFonnte.autoNotifyCustomer ?? false);
  const [fonnteTesting, setFonnteTesting] = useState(false);
  const [fonnteTestResult, setFonnteTestResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  const [showFonnteToken, setShowFonnteToken] = useState(false);
  const [testCustomPhone, setTestCustomPhone] = useState('011-11135503');
  const [testCustomMessage, setTestCustomMessage] = useState('Salam Khairul Fresh Food! Ini adalah ujian notifikasi WhatsApp dari Fonnte Gateway.');
  const [fonnteSendingTestMsg, setFonnteSendingTestMsg] = useState(false);

  // Search & Filters for Orders
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSlotFilter, setOrderSlotFilter] = useState<string>('all');
  const [orderZoneFilter, setOrderZoneFilter] = useState<'all' | 'semenyih' | 'beranang' | 'kajang' | 'pickup'>('all');
  const [orderDateFilter, setOrderDateFilter] = useState<string>('all');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<OrderRecord | null>(null);
  const [thermalReceiptOrder, setThermalReceiptOrder] = useState<OrderRecord | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

  // Coupon Form State
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponDiscountType, setCouponDiscountType] = useState<CouponDiscountType>('fixed');
  const [couponDiscountValue, setCouponDiscountValue] = useState<number>(5);
  const [couponMinSpend, setCouponMinSpend] = useState<number>(30);
  const [couponMaxDiscount, setCouponMaxDiscount] = useState<number | undefined>(undefined);
  const [couponDescription, setCouponDescription] = useState('');
  const [couponExpiryDate, setCouponExpiryDate] = useState('2026-12-31');
  const [couponUsageLimit, setCouponUsageLimit] = useState<number | undefined>(100);
  const [couponIsActive, setCouponIsActive] = useState(true);
  const [couponSearch, setCouponSearch] = useState('');
  const [copiedCouponId, setCopiedCouponId] = useState<string | null>(null);

  // WhatsApp Status Update Modal State & Auto-Dispatch
  const [statusModalOrder, setStatusModalOrder] = useState<OrderRecord | null>(null);
  const [targetStatus, setTargetStatus] = useState<OrderRecord['status']>('disahkan');
  const [riderName, setRiderName] = useState('Ali (Rider Semenyih)');
  const [riderPhone, setRiderPhone] = useState('019-3345890');
  const [riderEta, setRiderEta] = useState('11:30 AM');
  const [customMsgPreview, setCustomMsgPreview] = useState('');
  const [autoSendWhatsApp, setAutoSendWhatsApp] = useState<boolean>(true);

  // Product Edit / Add Modal Form State
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodSubtitle, setProdSubtitle] = useState('');
  const [prodCategory, setProdCategory] = useState<ProductCategory>('ayam-bulat');
  const [prodPrice, setProdPrice] = useState<number>(15.90);
  const [prodOriginalPrice, setProdOriginalPrice] = useState<number | undefined>(18.50);
  const [prodUnit, setProdUnit] = useState('ekor');
  const [prodWeight, setProdWeight] = useState('1.6kg - 1.8kg');
  const [prodImage, setProdImage] = useState('https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=800');
  const [prodInStock, setProdInStock] = useState(true);
  const [prodSupportsCutting, setProdSupportsCutting] = useState(true);
  const [prodRemainingStock, setProdRemainingStock] = useState<number>(20);
  const [prodDescription, setProdDescription] = useState('');
  const [prodHasWeightOptions, setProdHasWeightOptions] = useState<boolean>(false);
  const [prodWeightOptions, setProdWeightOptions] = useState<ProductWeightOption[]>([]);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(siteSettings);

  // Customer Management & Edit Modal State
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerRoleFilter, setCustomerRoleFilter] = useState<'all' | 'customer' | 'admin'>('all');
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserUsername, setEditUserUsername] = useState('');
  const [editUserRole, setEditUserRole] = useState<'customer' | 'admin'>('customer');
  const [editUserLoyaltyPoints, setEditUserLoyaltyPoints] = useState<number>(0);
  const [editUserTotalSpent, setEditUserTotalSpent] = useState<number>(0);
  const [editUserNewPassword, setEditUserNewPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Realtime Firestore Subscription for Admin Portal
  useEffect(() => {
    if (!isOpen) return;
    // Initial fetch of latest users
    setCustomers(authService.getAllUsers());

    const unsubOrders = dataStorageService.subscribeOrders((liveOrders) => {
      setOrders(liveOrders);
    });
    const unsubProducts = dataStorageService.subscribeProducts((liveProds) => {
      setProducts(liveProds);
    });
    const unsubSettings = dataStorageService.subscribeSiteSettings((liveSettings) => {
      setSiteSettings(liveSettings);
      if (liveSettings.fonnteConfig?.token) {
        setFonnteToken((prev) => prev || liveSettings.fonnteConfig?.token || '');
        if (liveSettings.fonnteConfig.adminPhone) {
          setFonnteAdminPhone((prev) => prev || liveSettings.fonnteConfig?.adminPhone || '011-11135503');
        }
      }
    });
    const unsubCoupons = dataStorageService.subscribeCoupons((liveCoupons) => {
      setCoupons(liveCoupons);
    });
    const unsubUsers = authService.subscribeUsers((liveUsers) => {
      setCustomers(liveUsers);
    });

    return () => {
      unsubOrders();
      unsubProducts();
      unsubSettings();
      unsubCoupons();
      unsubUsers();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const showNotification = (type: 'success' | 'error' | 'info', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Helper to construct official WhatsApp messages for 3 statuses
  const generateStatusMessage = (
    order: OrderRecord, 
    status: OrderRecord['status'], 
    rName: string = riderName, 
    rPhone: string = riderPhone, 
    rEta: string = riderEta
  ): string => {
    const isPickup = order.fulfillmentType === 'pickup';

    const storeHelpline = `\n\nSebarang pertanyaan, hubungi WhatsApp: 011-11135503 (Khairul Fresh Food Pasar Semenyih).`;

    if (status === 'disahkan') {
      return `✅ BAYARAN TELAH DISAHKAN: Pembayaran anda telah berjaya diterima & disahkan oleh Khairul Fresh Food. Pesanan anda (#${order.orderId}) sedang dijadualkan untuk pemotongan & pembungkusan.${storeHelpline}`;
    }

    if (status === 'dalam-penghantaran') {
      if (isPickup) {
        return `🏪 PESANAN SEDIA UNTUK DIAMBIL: Ayam segar anda (#${order.orderId}) kini sedia untuk diambil di GA 59, Pasar Semenyih. Waktu pengambilan sebelum jam 12:00 Tengah Hari. Sila tunjukkan pesanan ini kepada jurujual kami di kaunter.${storeHelpline}`;
      }
      return `🛵 RIDER DALAM PENGHANTARAN: Ayam segar anda kini dalam perjalanan dihantar oleh Rider ${rName} (${rPhone}). Anggaran Masa Tiba (ETA): ${rEta}.${storeHelpline}`;
    }

    if (status === 'selesai') {
      if (isPickup) {
        return `🎉 PESANAN SELESAI DIAMBIL: Pesanan ayam segar anda (#${order.orderId}) telah selamat diambil di GA 59, Pasar Semenyih. Terima kasih kerana memilih Khairul Fresh Food!${storeHelpline}`;
      }
      return `🎉 PENGHANTARAN SELESAI: Pesanan ayam segar anda (#${order.orderId}) telah selamat diserahkan. Terima kasih kerana memilih Khairul Fresh Food!${storeHelpline}`;
    }

    if (status === 'sembelih-potong') {
      return `🔪 SEDANG DIPOTONG & DISEDIAKAN: Pesanan ayam segar anda (#${order.orderId}) kini sedang diproses dan dipotong rapi mengikut arahan anda di Khairul Fresh Food Pasar Semenyih.${storeHelpline}`;
    }

    return `📦 PEK SEJUK DINGIN: Pesanan ayam segar anda (#${order.orderId}) telah siap dipotong dan kini disimpan dalam pek sejuk 0-4°C menunggu waktu pelepasan.${storeHelpline}`;
  };

  const openStatusUpdateModal = (order: OrderRecord, initialStatus?: OrderRecord['status']) => {
    const st = initialStatus || order.status;
    setStatusModalOrder(order);
    setTargetStatus(st);
    setCustomMsgPreview(generateStatusMessage(order, st));
  };

  const handleModalStatusChange = (newSt: OrderRecord['status']) => {
    if (!statusModalOrder) return;
    setTargetStatus(newSt);
    setCustomMsgPreview(generateStatusMessage(statusModalOrder, newSt));
  };

  // ORDER MANAGEMENT HANDLERS
  const handleUpdateStatus = (orderId: string, newStatus: OrderRecord['status'], forcePromptModal: boolean = false) => {
    const updated = dataStorageService.updateOrderStatus(orderId, newStatus, adminUser.name);
    setOrders(updated);
    setAuditLogs(dataStorageService.getAuditLogs());
    
    const targetOrder = updated.find((o) => o.orderId === orderId);

    if (selectedOrderForDetail?.orderId === orderId && targetOrder) {
      setSelectedOrderForDetail(targetOrder);
    }

    // If autoSendWhatsApp is active and it's not forced to modal, generate and trigger WhatsApp message
    if (autoSendWhatsApp && targetOrder && !forcePromptModal) {
      const autoMsg = generateStatusMessage(targetOrder, newStatus);
      
      // If Fonnte is configured, send via Fonnte API silently without popup
      const fonnteCfg = fonnteService.getConfig();
      if (fonnteCfg.token && fonnteCfg.token.trim() !== '') {
        fonnteService.sendMessage(targetOrder.customer.phone, autoMsg).then((res) => {
          if (res.success) {
            console.log(`[Fonnte] Status update sent to ${targetOrder.customer.phone}`);
          }
        }).catch((err) => {
          console.warn('[Fonnte] Status update send error:', err);
        });
        showNotification('success', `Status #${orderId} dikemaskini & WhatsApp dihantar melalui Fonnte ke ${targetOrder.customer.fullName}!`);
      } else {
        const rawPhone = targetOrder.customer.phone.replace(/\D/g, '');
        let cleanPhone = rawPhone;
        if (cleanPhone.startsWith('0')) {
          cleanPhone = '60' + cleanPhone.slice(1);
        } else if (!cleanPhone.startsWith('60')) {
          cleanPhone = '60' + cleanPhone;
        }
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(autoMsg)}`;
        window.open(waUrl, '_blank');
        showNotification('success', `Status #${orderId} dikemaskini & WhatsApp status dibuka ke ${targetOrder.customer.fullName}!`);
      }
    } else {
      showNotification('success', `Status pesanan #${orderId} dikemaskini kepada: "${newStatus}".`);
    }
  };

  const handleSaveAndSendWhatsApp = () => {
    if (!statusModalOrder) return;

    // 1. Update order in database
    const updated = dataStorageService.updateOrderStatus(statusModalOrder.orderId, targetStatus, adminUser.name);
    setOrders(updated);
    setAuditLogs(dataStorageService.getAuditLogs());

    if (selectedOrderForDetail?.orderId === statusModalOrder.orderId) {
      const match = updated.find((o) => o.orderId === statusModalOrder.orderId);
      if (match) setSelectedOrderForDetail(match);
    }

    const messageToSend = customMsgPreview || generateStatusMessage(statusModalOrder, targetStatus);

    // Check if Fonnte is configured
    const fonnteCfg = fonnteService.getConfig();
    if (fonnteCfg.token && fonnteCfg.token.trim() !== '') {
      fonnteService.sendMessage(statusModalOrder.customer.phone, messageToSend).then((res) => {
        if (res.success) {
          showNotification('success', `Status #${statusModalOrder.orderId} dikemaskini & WhatsApp dihantar melalui Fonnte ke ${statusModalOrder.customer.fullName}!`);
        } else {
          showNotification('error', `Gagal hantar WhatsApp Fonnte: ${res.message}`);
        }
      });
    } else {
      // 2. Format phone number for WhatsApp
      const rawPhone = statusModalOrder.customer.phone.replace(/\D/g, '');
      let cleanPhone = rawPhone;
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '60' + cleanPhone.slice(1);
      } else if (!cleanPhone.startsWith('60')) {
        cleanPhone = '60' + cleanPhone;
      }

      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageToSend)}`;
      window.open(waUrl, '_blank');
      showNotification('success', `Status #${statusModalOrder.orderId} dikemaskini & WhatsApp dibuka untuk dihantar ke ${statusModalOrder.customer.fullName}.`);
    }

    setStatusModalOrder(null);
  };

  // PRODUCT MANAGEMENT HANDLERS
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProdName('');
    setProdSubtitle('');
    setProdCategory('ayam-bulat');
    setProdPrice(15.90);
    setProdOriginalPrice(18.50);
    setProdUnit('ekor');
    setProdWeight('1.6kg - 1.8kg');
    setProdImage('https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=800');
    setProdInStock(true);
    setProdSupportsCutting(true);
    setProdRemainingStock(30);
    setProdDescription('Ayam segar Pasar Semenyih yang dipotong rapi dan bersih mengikut syarak Halal Diiktiraf.');
    setProdHasWeightOptions(false);
    setProdWeightOptions([]);
    setIsEditingProduct(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setProdName(p.name);
    setProdSubtitle(p.subtitle);
    setProdCategory(p.category);
    setProdPrice(p.price);
    setProdOriginalPrice(p.originalPrice);
    setProdUnit(p.unit);
    setProdWeight(p.weightEstimate);
    setProdImage(p.image);
    setProdInStock(p.inStock);
    setProdSupportsCutting(p.supportsCutting);
    setProdRemainingStock(p.remainingStock || 25);
    setProdDescription(p.description);
    setProdHasWeightOptions(Boolean(p.hasWeightOptions));
    setProdWeightOptions(p.weightOptions ? JSON.parse(JSON.stringify(p.weightOptions)) : []);
    setIsEditingProduct(true);
  };

  // Helper functions for Weight Variations in Admin
  const handleAddWeightOption = () => {
    const newOpt: ProductWeightOption = {
      id: `w-${Date.now()}`,
      weightLabel: '1.6kg - 1.8kg',
      price: prodPrice || 19.50,
      availableStock: 20,
      isAvailable: true,
    };
    setProdWeightOptions([...prodWeightOptions, newOpt]);
  };

  const handleUpdateWeightOption = (id: string, field: keyof ProductWeightOption, value: any) => {
    setProdWeightOptions(prev => prev.map(opt => {
      if (opt.id === id) {
        return { ...opt, [field]: value };
      }
      return opt;
    }));
  };

  const handleRemoveWeightOption = (id: string) => {
    setProdWeightOptions(prev => prev.filter(opt => opt.id !== id));
  };

  const handleToggleWeightOptionAvailable = (id: string) => {
    setProdWeightOptions(prev => prev.map(opt => {
      if (opt.id === id) {
        return { ...opt, isAvailable: !opt.isAvailable };
      }
      return opt;
    }));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      showNotification('error', 'Sila masukkan nama produk.');
      return;
    }

    const calculatedTotalStock = prodHasWeightOptions && prodWeightOptions.length > 0
      ? prodWeightOptions.reduce((sum, o) => sum + (o.isAvailable ? Number(o.availableStock) || 0 : 0), 0)
      : Number(prodRemainingStock);

    const lowestPrice = prodHasWeightOptions && prodWeightOptions.length > 0
      ? Math.min(...prodWeightOptions.map(o => o.price))
      : Number(prodPrice);

    const newOrUpdatedProduct: Product = {
      id: editingProductId || `prod-ayam-${Date.now()}`,
      name: prodName.trim(),
      subtitle: prodSubtitle.trim() || 'Segar Pasar Semenyih',
      category: prodCategory,
      price: lowestPrice,
      originalPrice: prodOriginalPrice ? Number(prodOriginalPrice) : undefined,
      unit: prodUnit,
      weightEstimate: prodWeight,
      image: prodImage,
      inStock: prodInStock,
      supportsCutting: prodSupportsCutting,
      remainingStock: calculatedTotalStock,
      dailyStockLimit: 50,
      rating: 4.9,
      reviewsCount: 38,
      halalCertified: true,
      freshnessType: 'Segar Suhu Dingin (0-4°C)',
      description: prodDescription,
      tags: ['segar', 'halal', prodCategory],
      hasWeightOptions: prodHasWeightOptions,
      weightOptions: prodHasWeightOptions && prodWeightOptions.length > 0 ? prodWeightOptions : undefined,
    };

    const updated = dataStorageService.updateProduct(newOrUpdatedProduct, adminUser.name);
    setProducts(updated);
    onProductsUpdated(updated);
    setAuditLogs(dataStorageService.getAuditLogs());
    setIsEditingProduct(false);
    showNotification('success', `Produk "${newOrUpdatedProduct.name}" berjaya disimpan ke katalog.`);
  };

  const handleDeleteProduct = (productId: string) => {
    if (!window.confirm('Adakah anda pasti ingin memadam produk ini daripada katalog?')) return;
    const updated = dataStorageService.deleteProduct(productId, adminUser.name);
    setProducts(updated);
    onProductsUpdated(updated);
    setAuditLogs(dataStorageService.getAuditLogs());
    showNotification('success', 'Produk telah dipadam.');
  };

  const handleResetAllProductImages = () => {
    if (window.confirm('Adakah anda pasti mahu memadam SEMUA gambar produk dalam katalog?\n\nTindakan ini akan mengosongkan gambar semua produk supaya anda boleh muat naik gambar foto sebenar satu persatu.')) {
      const updated = dataStorageService.resetAllProductImages(adminUser.name);
      setProducts(updated);
      onProductsUpdated(updated);
      setAuditLogs(dataStorageService.getAuditLogs());
      showNotification('success', 'Semua foto produk telah dikosongkan. Sedia untuk dimuat naik satu persatu.');
    }
  };

  const handleToggleProductStock = (productId: string, current: boolean) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    const updated = dataStorageService.updateProduct({ ...target, inStock: !current }, adminUser.name);
    setProducts(updated);
    onProductsUpdated(updated);
    setAuditLogs(dataStorageService.getAuditLogs());
    showNotification('success', `Status stok bagi "${target.name}" ditukar kepada: ${!current ? 'Ada Stok' : 'Habis Stok'}.`);
  };

  // SETTINGS HANDLER
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: SiteSettings = {
      ...settingsForm,
      hitpayConfig: {
        apiKey: hitpayApiKey.trim(),
        salt: hitpaySalt.trim(),
        isSandbox: hitpayIsSandbox,
        isActive: hitpayIsActive,
        currency: 'MYR',
        merchantName: hitpayMerchantName.trim() || 'Khairul FRESH Food',
        enabledMethods: hitpayMethods,
        webhookUrl: typeof window !== 'undefined' ? `${window.location.origin}/api/hitpay/webhook` : '',
        redirectUrl: typeof window !== 'undefined' ? window.location.origin : '',
      },
      duitnowConfig: {
        bankName: duitnowBankName.trim() || 'OCBC Bank (Malaysia) Berhad',
        accountName: duitnowAccountName.trim() || 'KHAIRUL FRESH AND FROZEN FOOD',
        accountNumber: duitnowAccountNumber.trim() || '70 6116 3993',
        orderReferenceGuide: 'No. Telefon Pelanggan / no pesanan',
        qrImageUrl: duitnowQrImage,
        isActive: duitnowIsActive,
      }
    };
    const saved = dataStorageService.saveSiteSettings(updatedSettings, adminUser.name);
    setSiteSettings(saved);
    setSettingsForm(saved);
    onSettingsUpdated(saved);
    setAuditLogs(dataStorageService.getAuditLogs());
    showNotification('success', 'Tetapan laman, DuitNow QR & Gateway berjaya dikemaskini.');
  };

  // DUITNOW SPECIFIC HANDLER
  const handleSaveDuitNowConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updatedDuitNow = {
      bankName: duitnowBankName.trim() || 'OCBC Bank (Malaysia) Berhad',
      accountName: duitnowAccountName.trim() || 'KHAIRUL FRESH AND FROZEN FOOD',
      accountNumber: duitnowAccountNumber.trim() || '70 6116 3993',
      orderReferenceGuide: 'No. Telefon Pelanggan / no pesanan',
      qrImageUrl: duitnowQrImage,
      isActive: duitnowIsActive,
    };

    const newSettings: SiteSettings = {
      ...siteSettings,
      duitnowConfig: updatedDuitNow,
    };

    const saved = dataStorageService.saveSiteSettings(newSettings, adminUser.name);
    setSiteSettings(saved);
    setSettingsForm(saved);
    onSettingsUpdated(saved);

    dataStorageService.addAuditLog({
      action: 'TETAPAN DUITNOW QR DIKEMASKINI',
      performedBy: adminUser.name,
      details: `Maklumat bank DuitNow dikemaskini. Akaun: [${duitnowAccountName}] (${duitnowAccountNumber}) - ${duitnowBankName}`,
      type: 'system',
    });
    setAuditLogs(dataStorageService.getAuditLogs());
    showNotification('success', 'Maklumat DuitNow QR & Akaun Bank OCBC berjaya disimpan!');
  };

  // HITPAY SPECIFIC HANDLERS
  const handleSaveHitpayConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updatedConfig: HitPayConfig = {
      apiKey: hitpayApiKey.trim(),
      salt: hitpaySalt.trim(),
      isSandbox: hitpayIsSandbox,
      isActive: hitpayIsActive,
      currency: 'MYR',
      merchantName: hitpayMerchantName.trim() || 'Khairul FRESH Food',
      enabledMethods: hitpayMethods,
      webhookUrl: typeof window !== 'undefined' ? `${window.location.origin}/api/hitpay/webhook` : '',
      redirectUrl: typeof window !== 'undefined' ? window.location.origin : '',
    };

    const newSettings: SiteSettings = {
      ...siteSettings,
      hitpayConfig: updatedConfig,
    };

    const saved = dataStorageService.saveSiteSettings(newSettings, adminUser.name);
    setSiteSettings(saved);
    setSettingsForm(saved);
    onSettingsUpdated(saved);

    // Also persist config directly to server PHP backend
    hitpayService.saveServerConfig(hitpayApiKey.trim(), hitpaySalt.trim(), hitpayIsSandbox).catch(() => {});

    dataStorageService.addAuditLog({
      action: 'GATEWAY HITPAY DIKEMASKINI',
      performedBy: adminUser.name,
      details: `Konfigurasi API HitPay dikemaskini. Mod: ${hitpayIsSandbox ? 'Sandbox (Ujian)' : 'Production (Live)'}, Status: ${hitpayIsActive ? 'Aktif' : 'Nyahaktif'}`,
      type: 'system',
    });
    setAuditLogs(dataStorageService.getAuditLogs());

    showNotification('success', 'Tetapan API HitPay berjaya disimpan ke pelayar dan pelayan!');
  };

  const handleTestHitpayConnection = async () => {
    setHitpayTesting(true);
    setHitpayTestResult(null);

    const result = await hitpayService.testConnection(hitpayApiKey, hitpayIsSandbox);
    setHitpayTesting(false);
    setHitpayTestResult(result);

    if (result.success) {
      showNotification('success', result.message);
    } else {
      showNotification('error', result.message);
    }
  };

  const handleToggleHitpayMethod = (method: 'fpx' | 'duitnow' | 'card' | 'grabpay' | 'tng' | 'shopeepay') => {
    if (hitpayMethods.includes(method)) {
      if (hitpayMethods.length === 1) {
        showNotification('error', 'Sekurang-kurangnya satu kaedah pembayaran HitPay perlu diaktifkan.');
        return;
      }
      setHitpayMethods(hitpayMethods.filter((m) => m !== method));
    } else {
      setHitpayMethods([...hitpayMethods, method]);
    }
  };

  const handleCopyText = (text: string, type: 'webhook' | 'redirect') => {
    navigator.clipboard.writeText(text);
    if (type === 'webhook') {
      setCopiedHitpayWebhook(true);
      setTimeout(() => setCopiedHitpayWebhook(false), 2500);
    } else {
      setCopiedHitpayRedirect(true);
      setTimeout(() => setCopiedHitpayRedirect(false), 2500);
    }
    showNotification('success', 'Pautan berjaya disalin ke papan keratan.');
  };

  // FONNTE WHATSAPP GATEWAY HANDLERS
  const handleSaveFonnteConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanAdminPhone = fonnteAdminPhone.trim() || '011-11135503';
    const cleanToken = fonnteToken.trim();

    const newConfig: FonnteConfig = {
      token: cleanToken,
      adminPhone: cleanAdminPhone,
      autoNotifyAdmin: fonnteAutoNotifyAdmin,
      autoNotifyCustomer: fonnteAutoNotifyCustomer,
    };

    fonnteService.saveConfig(newConfig);

    const newSettings: SiteSettings = {
      ...siteSettings,
      supportPhone: cleanAdminPhone,
      fonnteConfig: {
        token: cleanToken,
        adminPhone: cleanAdminPhone,
        autoNotifyAdmin: fonnteAutoNotifyAdmin,
        autoNotifyCustomer: fonnteAutoNotifyCustomer,
      },
    };

    const saved = dataStorageService.saveSiteSettings(newSettings, adminUser.name);
    setSiteSettings(saved);
    setSettingsForm(saved);
    onSettingsUpdated(saved);

    dataStorageService.addAuditLog({
      action: 'GATEWAY FONNTE WHATSAPP DIKEMASKINI',
      performedBy: adminUser.name,
      details: `Konfigurasi Fonnte WhatsApp Gateway dikemaskini. Admin Phone: ${cleanAdminPhone}, Auto Notify Admin: ${fonnteAutoNotifyAdmin ? 'Aktif' : 'Nyahaktif'}`,
      type: 'system',
    });
    setAuditLogs(dataStorageService.getAuditLogs());

    showNotification('success', 'Tetapan Fonnte WhatsApp Gateway berjaya disimpan!');
  };

  const handleTestFonnteConnection = async () => {
    setFonnteTesting(true);
    setFonnteTestResult(null);

    const result = await fonnteService.testConnection(fonnteToken);
    setFonnteTesting(false);
    setFonnteTestResult(result);

    if (result.success) {
      showNotification('success', `${result.message} — Tetapan telah disimpan secara automatik!`);
      handleSaveFonnteConfig();
    } else {
      showNotification('error', result.message);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testCustomPhone.trim()) {
      showNotification('error', 'Sila masukkan nombor telefon penerima ujian.');
      return;
    }
    if (!testCustomMessage.trim()) {
      showNotification('error', 'Sila masukkan mesej teks ujian.');
      return;
    }

    setFonnteSendingTestMsg(true);
    const res = await fonnteService.sendMessage(testCustomPhone, testCustomMessage, fonnteToken);
    setFonnteSendingTestMsg(false);

    if (res.success) {
      showNotification('success', `${res.message} — Tetapan telah disimpan secara automatik!`);
      handleSaveFonnteConfig();
    } else {
      showNotification('error', res.message);
    }
  };

  // COUPON MANAGEMENT HANDLERS
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      showNotification('error', 'Sila masukkan Kod Kupon.');
      return;
    }

    if (couponDiscountValue <= 0) {
      showNotification('error', 'Nilai diskaun mestilah lebih daripada 0.');
      return;
    }

    // Check duplicate code
    const existing = coupons.find((c) => c.code.toUpperCase() === cleanCode);
    if (existing) {
      showNotification('error', `Kod kupon "${cleanCode}" sudah wujud. Sila guna kod lain.`);
      return;
    }

    const newCoupon = dataStorageService.addCoupon({
      code: cleanCode,
      discountType: couponDiscountType,
      discountValue: Number(couponDiscountValue),
      minSpend: Number(couponMinSpend || 0),
      maxDiscount: couponDiscountType === 'percentage' && couponMaxDiscount ? Number(couponMaxDiscount) : undefined,
      description: couponDescription.trim() || `${couponDiscountType === 'fixed' ? `Potongan RM${couponDiscountValue}` : `Diskaun ${couponDiscountValue}%`} untuk belian minimum RM${couponMinSpend}`,
      isActive: couponIsActive,
      expiryDate: couponExpiryDate || undefined,
      usageLimit: couponUsageLimit ? Number(couponUsageLimit) : undefined,
    });

    const updated = dataStorageService.getCoupons();
    setCoupons(updated);

    // Audit log
    dataStorageService.addAuditLog({
      action: 'KOD KUPON DICIPTA',
      details: `Kupon baharu [${cleanCode}] bernilai ${couponDiscountType === 'fixed' ? `RM${couponDiscountValue}` : `${couponDiscountValue}%`} dicipta oleh ${adminUser.name}`,
      performedBy: adminUser.name,
      type: 'system',
    });
    setAuditLogs(dataStorageService.getAuditLogs());

    // Reset Form
    setCouponCodeInput('');
    setCouponDiscountValue(5);
    setCouponMinSpend(30);
    setCouponDescription('');
    setIsCreatingCoupon(false);
    showNotification('success', `Kod Kupon "${cleanCode}" berjaya dicipta & sedia digunakan pelanggan!`);
  };

  const handleToggleCoupon = (coupon: CouponCode) => {
    dataStorageService.toggleCouponStatus(coupon.id);
    const updated = dataStorageService.getCoupons();
    setCoupons(updated);
    dataStorageService.addAuditLog({
      action: 'STATUS KUPON DIUBAH',
      details: `Status kupon [${coupon.code}] ditukar kepada: ${!coupon.isActive ? 'Aktif' : 'Nyahaktif'}`,
      performedBy: adminUser.name,
      type: 'system',
    });
    setAuditLogs(dataStorageService.getAuditLogs());
    showNotification('success', `Kupon "${coupon.code}" kini ${!coupon.isActive ? 'diaktifkan' : 'dinyahaktifkan'}.`);
  };

  const handleDeleteCoupon = (coupon: CouponCode) => {
    if (!window.confirm(`Adakah anda pasti ingin memadam kod kupon "${coupon.code}"?`)) return;
    dataStorageService.deleteCoupon(coupon.id);
    const updated = dataStorageService.getCoupons();
    setCoupons(updated);
    dataStorageService.addAuditLog({
      action: 'KOD KUPON DIPADAM',
      details: `Kupon [${coupon.code}] telah dipadam daripada sistem`,
      performedBy: adminUser.name,
      type: 'system',
    });
    setAuditLogs(dataStorageService.getAuditLogs());
    showNotification('success', `Kod kupon "${coupon.code}" telah dipadam.`);
  };

  const handleCopyCouponCode = (coupon: CouponCode) => {
    try {
      navigator.clipboard.writeText(coupon.code);
      setCopiedCouponId(coupon.id);
      setTimeout(() => setCopiedCouponId(null), 2000);
      showNotification('success', `Kod "${coupon.code}" telah disalin ke papan keratan.`);
    } catch {
      showNotification('success', `Kod: ${coupon.code}`);
    }
  };

  const handleApplyPreset = (preset: { code: string; type: CouponDiscountType; value: number; min: number; desc: string; max?: number }) => {
    setCouponCodeInput(preset.code);
    setCouponDiscountType(preset.type);
    setCouponDiscountValue(preset.value);
    setCouponMinSpend(preset.min);
    setCouponDescription(preset.desc);
    if (preset.max) setCouponMaxDiscount(preset.max);
    setIsCreatingCoupon(true);
  };

  // CUSTOMER & ADMIN MANAGEMENT HANDLERS
  const handleOpenEditUser = (user: UserAccount) => {
    setEditingUser(user);
    setIsCreatingUser(false);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserPhone(user.phone || '');
    setEditUserUsername(user.username || '');
    setEditUserRole(user.role);
    setEditUserLoyaltyPoints(user.loyaltyPoints || 0);
    setEditUserTotalSpent(user.totalSpent || 0);
    setEditUserNewPassword('');
    setShowEditPassword(false);
  };

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setIsCreatingUser(true);
    setEditUserName('');
    setEditUserEmail('');
    setEditUserPhone('');
    setEditUserUsername('');
    setEditUserRole('customer');
    setEditUserLoyaltyPoints(50);
    setEditUserTotalSpent(0);
    setEditUserNewPassword('');
    setShowEditPassword(false);
  };

  const handleCloseUserModal = () => {
    setEditingUser(null);
    setIsCreatingUser(false);
    setEditUserName('');
    setEditUserEmail('');
    setEditUserPhone('');
    setEditUserUsername('');
    setEditUserNewPassword('');
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserName.trim()) {
      showNotification('error', 'Sila masukkan nama penuh.');
      return;
    }
    if (!editUserEmail.trim()) {
      showNotification('error', 'Sila masukkan alamat emel.');
      return;
    }

    if (isCreatingUser) {
      if (!editUserNewPassword.trim() || editUserNewPassword.trim().length < 6) {
        showNotification('error', 'Kata laluan untuk akaun baharu mestilah sekurang-kurangnya 6 aksara.');
        return;
      }
      const regRes = await authService.register(
        editUserName.trim(),
        editUserEmail.trim(),
        editUserPhone.trim(),
        editUserNewPassword.trim(),
        editUserUsername.trim() || undefined
      );
      if (!regRes.success) {
        showNotification('error', regRes.error || 'Gagal mendaftarkan pengguna baharu.');
        return;
      }
      if (editUserRole === 'admin' && regRes.user) {
        authService.updateUserByAdmin(regRes.user.id, { role: 'admin' });
      }
      const updatedCustomers = authService.getAllUsers();
      setCustomers(updatedCustomers);
      dataStorageService.addAuditLog({
        action: 'PENGGUNA BAHARU DIDAFTARKAN',
        performedBy: adminUser.name,
        details: `Akaun [${editUserName.trim()}] (${editUserRole}) berjaya didaftarkan oleh admin.`,
        type: 'customer',
      });
      setAuditLogs(dataStorageService.getAuditLogs());
      showNotification('success', `Akaun ${editUserRole === 'admin' ? 'Admin' : 'Pelanggan'} "${editUserName.trim()}" berjaya dicipta.`);
      handleCloseUserModal();
    } else if (editingUser) {
      const updatePayload: Partial<UserAccount> = {
        name: editUserName.trim(),
        email: editUserEmail.trim(),
        phone: editUserPhone.trim(),
        username: editUserUsername.trim() || undefined,
        role: editUserRole,
        loyaltyPoints: editUserLoyaltyPoints,
        totalSpent: editUserTotalSpent,
      };

      const result = authService.updateUserByAdmin(
        editingUser.id,
        updatePayload,
        editUserNewPassword.trim() ? editUserNewPassword.trim() : undefined
      );

      if (!result.success) {
        showNotification('error', result.error || 'Gagal mengemaskini maklumat pengguna.');
        return;
      }

      const updatedCustomers = authService.getAllUsers();
      setCustomers(updatedCustomers);

      dataStorageService.addAuditLog({
        action: editingUser.role === 'admin' ? 'MAKLUMAT ADMIN DIKEMASKINI' : 'MAKLUMAT PELANGGAN DIKEMASKINI',
        performedBy: adminUser.name,
        details: `Butiran akaun [${editUserName.trim()}] (${editingUser.email}) telah dikemaskini oleh admin.${editUserNewPassword.trim() ? ' Kata laluan telah ditukar.' : ''}`,
        type: 'customer',
      });
      setAuditLogs(dataStorageService.getAuditLogs());
      showNotification('success', `Butiran akaun "${editUserName.trim()}" berjaya dikemaskini.`);
      handleCloseUserModal();
    }
  };

  const handlePromptDeleteUser = (user: UserAccount) => {
    if (user.id === adminUser.id || user.id === 'usr-admin-krul411') {
      showNotification('error', 'Akaun Pentadbir Utama (Master Admin) tidak boleh dipadam.');
      return;
    }
    setUserToDelete(user);
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    const user = userToDelete;
    const res = authService.deleteUserByAdmin(user.id);
    if (!res.success) {
      showNotification('error', res.error || 'Gagal memadam pengguna.');
      setUserToDelete(null);
      return;
    }
    const updatedCustomers = authService.getAllUsers();
    setCustomers(updatedCustomers);
    dataStorageService.addAuditLog({
      action: 'AKAUN PENGGUNA DIPADAM',
      performedBy: adminUser.name,
      details: `Akaun [${user.name}] (${user.email}) telah dipadam oleh admin.`,
      type: 'customer',
    });
    setAuditLogs(dataStorageService.getAuditLogs());
    showNotification('success', `Akaun "${user.name}" berjaya dipadam.`);
    setUserToDelete(null);
  };

  // CUSTOMERS FILTERING
  const filteredCustomers = customers.filter((c) => {
    if (customerRoleFilter !== 'all' && c.role !== customerRoleFilter) return false;
    if (customerSearch.trim()) {
      const q = customerSearch.toLowerCase();
      const matchName = (c.name || '').toLowerCase().includes(q);
      const matchEmail = (c.email || '').toLowerCase().includes(q);
      const matchPhone = (c.phone || '').includes(q);
      const matchUsername = (c.username || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchUsername) return false;
    }
    return true;
  });

  // ORDERS FILTERING
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
    if (orderSlotFilter !== 'all' && o.customer.deliverySlot !== orderSlotFilter) return false;
    if (orderDateFilter !== 'all' && o.customer.deliveryDate !== orderDateFilter) return false;
    
    if (orderZoneFilter !== 'all') {
      const isPickup = o.fulfillmentType === 'pickup' || o.customer.fulfillmentType === 'pickup';
      if (orderZoneFilter === 'pickup') {
        if (!isPickup) return false;
      } else {
        if (isPickup) return false;
        const pc = (o.customer.postcode || '').trim();
        const city = (o.customer.city || '').toLowerCase();
        if (orderZoneFilter === 'semenyih' && pc !== '43500' && !city.includes('semenyih')) return false;
        if (orderZoneFilter === 'beranang' && pc !== '43700' && !city.includes('beranang')) return false;
        if (orderZoneFilter === 'kajang' && pc !== '43000' && !city.includes('kajang')) return false;
      }
    }

    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const matchId = o.orderId.toLowerCase().includes(q);
      const matchName = o.customer.fullName.toLowerCase().includes(q);
      const matchPhone = o.customer.phone.includes(q);
      const matchCity = o.customer.city.toLowerCase().includes(q);
      const matchAddress = (o.customer.address || '').toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPhone && !matchCity && !matchAddress) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-6xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-4 flex flex-col max-h-[94vh]"
        role="dialog"
      >
        {/* Top Bar with Admin Security Badging */}
        <div className="bg-gradient-to-r from-stone-950 via-emerald-950 to-stone-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shrink-0 border-b border-emerald-950">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg ring-2 ring-emerald-400/30">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight font-['Outfit']">
                  Khairul Fresh Food • BackOffice
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-500/50">
                  Pasar Semenyih (GA 59)
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Pengurus: <strong>{adminUser.name}</strong> • WhatsApp: 011-11135503
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQRScannerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer border border-emerald-500"
              title="Imbas Kod QR Resit"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imbas Kod QR</span>
            </button>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-rose-950/80 hover:text-rose-300 text-stone-300 text-xs font-bold transition-colors cursor-pointer border border-stone-700"
              title="Log Keluar Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Keluar</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`px-6 py-2 text-xs font-bold flex items-center gap-2 ${
            feedback.type === 'success' 
              ? 'bg-emerald-100 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-200 border-b border-emerald-200 dark:border-emerald-800' 
              : feedback.type === 'info'
              ? 'bg-blue-100 dark:bg-blue-950/90 text-blue-900 dark:text-blue-200 border-b border-blue-200 dark:border-blue-800'
              : 'bg-rose-100 dark:bg-rose-950/90 text-rose-900 dark:text-rose-200 border-b border-rose-200 dark:border-rose-800'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Minimalist Admin Navigation Tabs */}
        <div className="bg-stone-100/90 dark:bg-stone-950/80 px-4 sm:px-6 py-2.5 border-b border-stone-200 dark:border-stone-800 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0 no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-1.5 px-3 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-1.5 px-3 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Pesanan</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'orders' ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}>
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`py-1.5 px-3 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'customers'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Pelanggan</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'customers' ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}>
              {customers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-1.5 px-3 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Produk & Stok</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`py-1.5 px-3 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'media'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Folder Media Master</span>
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`py-1.5 px-3 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'banners'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Banner</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'banners' ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}>
              {banners.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`py-1.5 px-3 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'coupons'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Kupon</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'coupons' ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}>
              {coupons.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`py-1.5 px-3 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'payment'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>HitPay Gateway</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-800 text-emerald-100 border border-emerald-600/40">
              API
            </span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp_gateway')}
            className={`py-1.5 px-3 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'whatsapp_gateway'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp Gateway (Fonnte)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-800 text-emerald-100 border border-emerald-600/40">
              Auto
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-1.5 px-3 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Tetapan</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-1.5 px-3 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-stone-800 dark:text-stone-200">
          
          {/* TAB 0: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <AdminDashboardTab 
              orders={orders} 
              products={products} 
              adminName={adminUser.name}
              onProductsUpdated={onProductsUpdated}
              onShowNotification={showNotification}
              onNavigateToOrders={(zone) => {
                if (zone) setOrderZoneFilter(zone);
                setActiveTab('orders');
              }}
            />
          )}

          {/* TAB 1: ORDER MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              
              {/* LOGISTICS & DELIVERY ZONES INDICATOR */}
              <LogisticsZoneIndicator
                orders={orders}
                selectedZoneFilter={orderZoneFilter}
                onSelectZoneFilter={(z) => setOrderZoneFilter(z)}
                selectedDateFilter={orderDateFilter}
                onSelectDateFilter={(d) => setOrderDateFilter(d)}
              />

              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-50 dark:bg-stone-800/80 p-3 rounded-2xl border border-stone-200 dark:border-stone-700">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Cari ID pesanan, nama pelanggan, telefon WhatsApp, bandar..."
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-hidden"
                  >
                    <option value="all">Semua Status</option>
                    <option value="disahkan">1. Bayaran Disahkan</option>
                    <option value="sembelih-potong">2. Potong & Sedia</option>
                    <option value="pembungkusan-sejuk">3. Pek Sejuk</option>
                    <option value="dalam-penghantaran">4. Rider / Sedia Ambil</option>
                    <option value="selesai">5. Selesai</option>
                  </select>

                  {/* Auto WhatsApp Notification Toggle */}
                  <label 
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      autoSendWhatsApp
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                        : 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                    title="Hantar kemas kini status pesanan secara automatik ke WhatsApp pelanggan setiap kali status ditukar"
                  >
                    <input
                      type="checkbox"
                      checked={autoSendWhatsApp}
                      onChange={(e) => setAutoSendWhatsApp(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Auto WhatsApp Status</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsQRScannerOpen(true)}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    title="Imbas Kod QR pada resit pelanggan untuk semakan pantas"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Imbas QR</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 font-bold hover:bg-stone-100 flex items-center gap-1 cursor-pointer"
                    title="Cetak Senarai Pesanan"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cetak</span>
                  </button>
                </div>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-700">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 uppercase tracking-wider font-extrabold text-[10px]">
                    <tr>
                      <th className="p-3">ID & Jenis</th>
                      <th className="p-3">Pelanggan</th>
                      <th className="p-3">Bahagian Ayam / Item</th>
                      <th className="p-3">Slot / Waktu Ambil</th>
                      <th className="p-3">Jumlah (RM)</th>
                      <th className="p-3">Status & WhatsApp</th>
                      <th className="p-3 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 dark:divide-stone-700 bg-white dark:bg-stone-900">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-stone-400">
                          Tiada pesanan memenuhi tapisan carian.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const isPickup = order.fulfillmentType === 'pickup';
                        return (
                          <tr key={order.orderId} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                            <td className="p-3 font-mono font-bold text-stone-900 dark:text-white whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span>#{order.orderId}</span>
                              </div>
                              <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md mt-1 ${
                                isPickup 
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/60' 
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/60'
                              }`}>
                                {isPickup ? '🏪 Self-Pickup' : '🚚 Delivery'}
                              </span>
                              <span className="block text-[10px] text-stone-400 font-normal font-sans mt-0.5">
                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-stone-900 dark:text-white block">{order.customer.fullName}</span>
                              <span className="text-[11px] text-stone-500">{order.customer.phone}</span>
                              <span className="text-[10px] text-stone-400 block truncate max-w-[150px]">
                                {isPickup ? 'GA 59 Pasar Semenyih' : `${order.customer.city} (${order.customer.postcode})`}
                              </span>
                            </td>
                            <td className="p-3 max-w-[200px]">
                              <span className="font-medium truncate block">
                                {order.items.map((i) => `${i.quantity}x ${i.product.name} (${i.selectedCut})`).join(', ')}
                              </span>
                              {order.customer.orderNotes && (
                                <span className="text-[10px] text-amber-600 dark:text-amber-400 italic block truncate">
                                  Nota: {order.customer.orderNotes}
                                </span>
                              )}
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <span className="font-bold text-[11px] text-stone-800 dark:text-stone-200 block">
                                {isPickup ? (order.customer.pickupTime || '09:00 AM') : order.customer.deliverySlot.toUpperCase()}
                              </span>
                              <span className="text-[10px] text-stone-500">{order.customer.deliveryDate}</span>
                            </td>
                            <td className="p-3 font-black text-emerald-700 dark:text-emerald-400 font-['Outfit'] whitespace-nowrap">
                              RM {order.total.toFixed(2)}
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleUpdateStatus(order.orderId, e.target.value as OrderRecord['status'])}
                                  className={`px-2 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                                    order.status === 'disahkan'
                                      ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                                      : order.status === 'sembelih-potong'
                                      ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                                      : order.status === 'pembungkusan-sejuk'
                                      ? 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300'
                                      : order.status === 'dalam-penghantaran'
                                      ? 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300'
                                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                  }`}
                                >
                                  <option value="disahkan">1. Disahkan</option>
                                  <option value="sembelih-potong">2. Potong & Sedia</option>
                                  <option value="pembungkusan-sejuk">3. Pek Sejuk</option>
                                  <option value="dalam-penghantaran">4. Rider / Sedia Ambil</option>
                                  <option value="selesai">5. Selesai</option>
                                </select>

                                {/* WhatsApp Status Button */}
                                <button
                                  type="button"
                                  onClick={() => openStatusUpdateModal(order)}
                                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs"
                                  title="Kemas kini & Hantar WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                            <td className="p-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setThermalReceiptOrder(order)}
                                  className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-700 dark:hover:bg-stone-600 text-white font-bold text-xs cursor-pointer flex items-center gap-1 shadow-xs transition-colors"
                                  title="Cetak Resit Lebar 80mm untuk Tampal Bungkusan"
                                >
                                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Cetak Resit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderForDetail(order)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs cursor-pointer border border-emerald-200 dark:border-emerald-800"
                                >
                                  Slip Potongan
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Butcher / Packing Slip Drawer */}
              {selectedOrderForDetail && (
                <div className="p-5 bg-stone-50 dark:bg-stone-800/80 rounded-3xl border border-stone-300 dark:border-stone-700 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b pb-3 border-stone-200 dark:border-stone-700">
                    <div className="flex items-center gap-2">
                      <Scissors className="w-5 h-5 text-emerald-600" />
                      <h4 className="text-sm font-black uppercase text-stone-900 dark:text-white">
                        Slip Pemotongan & Pembungkusan: #{selectedOrderForDetail.orderId}
                      </h4>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        selectedOrderForDetail.fulfillmentType === 'pickup'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {selectedOrderForDetail.fulfillmentType === 'pickup' ? '🏪 Ambil di Pasar Semenyih' : '🚚 Penghantaran ke Rumah'}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedOrderForDetail(null)}
                      className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-stone-500 block mb-1">Maklumat Pelanggan & Alamat:</span>
                      <p className="font-bold text-stone-900 dark:text-white">{selectedOrderForDetail.customer.fullName} ({selectedOrderForDetail.customer.phone})</p>
                      <p className="text-stone-600 dark:text-stone-300 mt-0.5 leading-relaxed">
                        {selectedOrderForDetail.customer.address}, {selectedOrderForDetail.customer.postcode} {selectedOrderForDetail.customer.city}
                      </p>
                      <p className="text-stone-500 text-[11px] mt-1">
                        Slot: <strong>{selectedOrderForDetail.customer.deliverySlot.toUpperCase()}</strong> ({selectedOrderForDetail.customer.deliveryDate})
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="font-bold text-stone-500 block">Spesifikasi Tukang Potong (Khairul Fresh Food Pasar):</span>
                      {selectedOrderForDetail.items.map((item, i) => (
                        <div key={i} className="p-2.5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 text-xs">
                          <div className="flex justify-between font-bold">
                            <span>{item.quantity}x {item.product.name}</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-mono">POTONG: {item.selectedCut.toUpperCase()}</span>
                          </div>
                          <div className="text-[11px] text-stone-500 mt-1 flex flex-wrap gap-2">
                            <span>Pek: <strong>{item.packaging}</strong></span>
                            {item.selectedCleaning && item.selectedCleaning.length > 0 && (
                              <span>Pembersihan: <strong>{item.selectedCleaning.join(', ')}</strong></span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-700">
                    <button
                      onClick={() => openStatusUpdateModal(selectedOrderForDetail)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Kemaskini Status & Hantar WhatsApp</span>
                    </button>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setThermalReceiptOrder(selectedOrderForDetail)}
                        className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 dark:bg-stone-700 dark:hover:bg-stone-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        title="Cetak Resit Lebar 80mm untuk Tampal pada Bungkusan"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Cetak Resit (80mm)</span>
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="px-3 py-1.5 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 text-xs font-bold rounded-xl cursor-pointer hover:bg-stone-50"
                      >
                        Cetak Slip Penuh
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Adakah anda pasti mahu memadam pesanan ini sepenuhnya? Tindakan ini tidak boleh diubah.')) {
                            const updated = dataStorageService.deleteOrder(selectedOrderForDetail.orderId, adminUser?.name || 'Admin');
                            setOrders(updated);
                            setSelectedOrderForDetail(null);
                          }
                        }}
                        className="px-3 py-1.5 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50 text-xs font-bold rounded-xl cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/50 flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Padam
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL: Simpan & Hantar WhatsApp Status */}
              {statusModalOrder && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs">
                  <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-300 dark:border-stone-700 max-w-lg w-full p-5 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b pb-3 border-stone-200 dark:border-stone-700">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-stone-900 dark:text-white">
                            Kemas Kini Status & Hantar WhatsApp
                          </h4>
                          <p className="text-[11px] text-stone-500">
                            Pesanan #{statusModalOrder.orderId} • {statusModalOrder.customer.fullName}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setStatusModalOrder(null)}
                        className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                          Pilih Status Pesanan:
                        </label>
                        <select
                          value={targetStatus}
                          onChange={(e) => handleModalStatusChange(e.target.value as OrderRecord['status'])}
                          className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl p-2.5 font-bold text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                        >
                          <option value="disahkan">1. Bayaran Disahkan (payment_confirmed)</option>
                          <option value="sembelih-potong">2. Potong & Sedia</option>
                          <option value="pembungkusan-sejuk">3. Pek Sejuk (0-4°C)</option>
                          <option value="dalam-penghantaran">4. Rider Dihantar / Sedia Ambil (out_for_delivery)</option>
                          <option value="selesai">5. Penghantaran Selesai (delivered)</option>
                        </select>
                      </div>

                      {/* If out_for_delivery selected and it's delivery, allow rider customizations */}
                      {targetStatus === 'dalam-penghantaran' && statusModalOrder.fulfillmentType !== 'pickup' && (
                        <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-500 mb-0.5">Nama Rider</label>
                            <input
                              type="text"
                              value={riderName}
                              onChange={(e) => {
                                setRiderName(e.target.value);
                                setCustomMsgPreview(generateStatusMessage(statusModalOrder, targetStatus, e.target.value, riderPhone, riderEta));
                              }}
                              className="w-full bg-white dark:bg-stone-900 border rounded-lg p-1.5 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-stone-500 mb-0.5">Tel Rider</label>
                            <input
                              type="text"
                              value={riderPhone}
                              onChange={(e) => {
                                setRiderPhone(e.target.value);
                                setCustomMsgPreview(generateStatusMessage(statusModalOrder, targetStatus, riderName, e.target.value, riderEta));
                              }}
                              className="w-full bg-white dark:bg-stone-900 border rounded-lg p-1.5 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-stone-500 mb-0.5">Anggaran Tiba (ETA)</label>
                            <input
                              type="text"
                              value={riderEta}
                              onChange={(e) => {
                                setRiderEta(e.target.value);
                                setCustomMsgPreview(generateStatusMessage(statusModalOrder, targetStatus, riderName, riderPhone, e.target.value));
                              }}
                              className="w-full bg-white dark:bg-stone-900 border rounded-lg p-1.5 text-xs font-bold text-emerald-700"
                            />
                          </div>
                        </div>
                      )}

                      {/* Live WhatsApp Message Preview */}
                      <div>
                        <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center justify-between">
                          <span>Draf Templat Mesej WhatsApp Rasmi:</span>
                          <span className="text-[10px] text-emerald-600 font-bold">Khairul Fresh Food</span>
                        </label>
                        <textarea
                          rows={4}
                          value={customMsgPreview}
                          onChange={(e) => setCustomMsgPreview(e.target.value)}
                          className="w-full bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl p-3 text-xs text-stone-900 dark:text-emerald-100 font-sans leading-relaxed focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-700">
                      <button
                        type="button"
                        onClick={() => setStatusModalOrder(null)}
                        className="px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100"
                      >
                        Batal
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveAndSendWhatsApp}
                        className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs px-5 py-2 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Simpan & Hantar WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: CUSTOMER & ADMIN DIRECTORY */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-stone-900 dark:text-white">
                    Direktori Pelanggan & Pentadbir (Admin)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Urus akaun pelanggan & admin, kemaskini nama, emel, telefon, peranan, mata ganjaran, serta tukar kata laluan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddUser}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Daftar Pengguna / Admin Baharu</span>
                </button>
              </div>

              {/* Filters & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Cari mengikut nama, emel, telefon, atau username..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-hidden focus:border-emerald-500 text-stone-900 dark:text-white"
                  />
                  {customerSearch && (
                    <button
                      type="button"
                      onClick={() => setCustomerSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setCustomerRoleFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      customerRoleFilter === 'all'
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                    }`}
                  >
                    Semua ({customers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerRoleFilter('customer')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      customerRoleFilter === 'customer'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                    }`}
                  >
                    Pelanggan ({customers.filter((c) => c.role === 'customer').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerRoleFilter('admin')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      customerRoleFilter === 'admin'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                    }`}
                  >
                    Admin ({customers.filter((c) => c.role === 'admin').length})
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 uppercase tracking-wider font-extrabold text-[10px]">
                    <tr>
                      <th className="p-3">Nama Pengguna / Admin</th>
                      <th className="p-3">Emel & Telefon</th>
                      <th className="p-3">Peranan</th>
                      <th className="p-3">Mata Ganjaran</th>
                      <th className="p-3">Jumlah Belanja</th>
                      <th className="p-3">Tarikh Daftar</th>
                      <th className="p-3">Alamat</th>
                      <th className="p-3 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-stone-400">
                          <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          <p className="font-bold">Tiada akaun ditemui.</p>
                          <p className="text-[11px] mt-1">Cuba kata kunci carian atau penapis peranan yang lain.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((c) => (
                        <tr key={c.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                                c.role === 'admin' 
                                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                              }`}>
                                {c.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-stone-900 dark:text-white block">
                                  {c.name}
                                </span>
                                {c.username && (
                                  <span className="text-[10px] text-stone-400 block font-mono">
                                    @{c.username}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="block font-medium text-stone-800 dark:text-stone-200">{c.email}</span>
                            <span className="text-[11px] text-stone-400 font-mono">{c.phone || '-'}</span>
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                              c.role === 'admin' 
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' 
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            }`}>
                              {c.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                              <span>{c.role}</span>
                            </span>
                          </td>
                          <td className="p-3 font-bold text-amber-600 dark:text-amber-400">
                            {c.loyaltyPoints || 0} Mata
                          </td>
                          <td className="p-3 font-black text-emerald-700 dark:text-emerald-400 font-['Outfit']">
                            RM {(c.totalSpent || 0).toFixed(2)}
                          </td>
                          <td className="p-3 text-stone-500 whitespace-nowrap">
                            {new Date(c.createdAt).toLocaleDateString('ms-MY')}
                          </td>
                          <td className="p-3 text-stone-600 dark:text-stone-300">
                            {(c.savedAddresses || []).length} alamat
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditUser(c)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 dark:text-emerald-300 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                                title="Edit Maklumat"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Edit</span>
                              </button>

                              {c.id !== adminUser.id && c.id !== 'usr-admin-krul411' && (
                                <button
                                  type="button"
                                  onClick={() => handlePromptDeleteUser(c)}
                                  className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:hover:bg-rose-900 dark:text-rose-400 transition-colors cursor-pointer"
                                  title="Padam Akaun"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCT CATALOG & STOCK MANAGER */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-stone-900 dark:text-white">Pengurusan Katalog Produk & Stok Pasar Semenyih</h3>
                  <p className="text-xs text-stone-500">Tambah produk ayam baharu, muat naik foto segar mengikut produk, dan kawal stok harian.</p>
                </div>
                {!isEditingProduct && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleResetAllProductImages}
                      className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-colors border border-rose-200 dark:border-rose-800 cursor-pointer shadow-2xs"
                      title="Padam semua foto produk untuk muat naik semula dari awal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Padam Semua Gambar (Reset Foto)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('media')}
                      className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center gap-1.5 transition-colors border border-stone-200 dark:border-stone-700 cursor-pointer shadow-2xs"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Folder Media Master</span>
                    </button>

                    <button
                      onClick={handleOpenAddProduct}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Produk Ayam Baharu</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Edit / Add Product Form */}
              {isEditingProduct && (
                <form onSubmit={handleSaveProduct} className="p-5 bg-stone-50 dark:bg-stone-800/90 rounded-3xl border border-emerald-200 dark:border-emerald-900 space-y-4">
                  <div className="flex items-center justify-between border-b pb-2 border-stone-200 dark:border-stone-700">
                    <h4 className="text-xs font-black uppercase text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span>{editingProductId ? 'Kemaskini Maklumat Produk' : 'Daftar Produk Baharu'}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsEditingProduct(false)}
                      className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Nama Produk Ayam</label>
                      <input
                        type="text"
                        required
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        placeholder="cth: Ayam Bulat Segar Pasar Semenyih (Gred A)"
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 font-bold focus:outline-hidden focus:border-emerald-500"
                      />
                      {prodName && (
                        <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1">
                          <span className="font-sans font-bold">Pautan Mesra Pengguna:</span> /p/{slugify(prodName)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Kategori</label>
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value as ProductCategory)}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 font-semibold focus:outline-hidden"
                      >
                        <option value="ayam-bulat">Ayam Bulat</option>
                        <option value="potongan">Bahagian Potongan</option>
                        <option value="bahagian-khas">Bahagian Khas (Dada/Paha)</option>
                        <option value="kampung-organik">Ayam Kampung / Organik</option>
                        <option value="pek-jimat">Pek Jimat Keluarga</option>
                        <option value="perapan-rempah">Ayam Perapan Rempah</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Harga Jualan Semasa (RM)</label>
                      <input
                        type="number"
                        step="0.10"
                        required
                        value={prodPrice}
                        onChange={(e) => setProdPrice(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 font-black text-emerald-700 dark:text-emerald-400 focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Harga Asal Tanpa Diskaun (RM)</label>
                      <input
                        type="number"
                        step="0.10"
                        value={prodOriginalPrice || ''}
                        onChange={(e) => setProdOriginalPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="cth: 18.50 (Untuk Jimat RM X)"
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Baki Stok Segar Hari Ini</label>
                      <input
                        type="number"
                        required
                        value={prodRemainingStock}
                        onChange={(e) => setProdRemainingStock(parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Unit Jualan</label>
                      <input
                        type="text"
                        value={prodUnit}
                        onChange={(e) => setProdUnit(e.target.value)}
                        placeholder="ekor / pek / kg"
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Anggaran Berat</label>
                      <input
                        type="text"
                        value={prodWeight}
                        onChange={(e) => setProdWeight(e.target.value)}
                        placeholder="1.6kg - 1.8kg"
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-3 pt-1">
                      <ImageUploadDropzone
                        value={prodImage}
                        onChange={(newImg) => setProdImage(newImg)}
                        label="Foto / Gambar Produk Ayam Segar"
                        helperText="Muat naik fail foto dari komputer / telefon (PNG, JPG, WebP) atau pilih dari Folder Media Master."
                        adminName={adminUser.name}
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Penerangan Produk</label>
                      <textarea
                        rows={2}
                        value={prodDescription}
                        onChange={(e) => setProdDescription(e.target.value)}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden text-xs"
                      />
                    </div>

                    {/* SECTION: PILIHAN VARIASI BERAT & HARGA (REQUIREMENTS 2 & 3) */}
                    <div className="sm:col-span-3 bg-emerald-50/60 dark:bg-emerald-950/40 p-4 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800/80 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <label className="flex items-center gap-2 font-black text-stone-900 dark:text-white text-xs uppercase tracking-wide cursor-pointer">
                            <input
                              type="checkbox"
                              checked={prodHasWeightOptions}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setProdHasWeightOptions(checked);
                                if (checked && prodWeightOptions.length === 0) {
                                  setProdWeightOptions([
                                    { id: 'w-1', weightLabel: '1.6kg - 1.8kg', price: 19.50, availableStock: 25, isAvailable: true },
                                    { id: 'w-2', weightLabel: '1.9kg - 2.1kg', price: 22.00, availableStock: 20, isAvailable: true },
                                    { id: 'w-3', weightLabel: '2.2kg - 2.4kg', price: 25.00, availableStock: 15, isAvailable: true },
                                  ]);
                                }
                              }}
                              className="w-4 h-4 rounded-sm text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Aktifkan Pilihan Berat Ayam Pelanggan (Variasi Berat, Harga & Baki Stok)</span>
                          </label>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 ml-6 mt-0.5">
                            Benarkan pelanggan memilih berat spesifik (cth: 1.6kg-1.8kg, 1.9kg-2.1kg) dengan penetapan harga dan kawalan stok bagi setiap saiz.
                          </p>
                        </div>

                        {prodHasWeightOptions && (
                          <button
                            type="button"
                            onClick={handleAddWeightOption}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs w-fit"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah Pilihan Berat</span>
                          </button>
                        )}
                      </div>

                      {prodHasWeightOptions && (
                        <div className="space-y-2 mt-3">
                          <div className="grid grid-cols-12 gap-2 text-[10px] font-black uppercase text-stone-600 dark:text-stone-400 px-1">
                            <div className="col-span-4 sm:col-span-4">Pilihan Berat (Label)</div>
                            <div className="col-span-3 sm:col-span-3">Harga Jualan (RM)</div>
                            <div className="col-span-3 sm:col-span-3">Baki Stok (Ekor)</div>
                            <div className="col-span-2 sm:col-span-2 text-center">Tindakan / Status</div>
                          </div>

                          {prodWeightOptions.map((opt) => (
                            <div
                              key={opt.id}
                              className={`grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl border-2 transition-all ${
                                opt.isAvailable
                                  ? 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 shadow-2xs'
                                  : 'bg-stone-100 dark:bg-stone-800/60 border-rose-200 dark:border-rose-900/50 opacity-60'
                              }`}
                            >
                              <div className="col-span-4 sm:col-span-4">
                                <input
                                  type="text"
                                  value={opt.weightLabel}
                                  onChange={(e) => handleUpdateWeightOption(opt.id, 'weightLabel', e.target.value)}
                                  placeholder="cth: 1.6kg - 1.8kg"
                                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2 text-xs font-bold text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                                />
                              </div>

                              <div className="col-span-3 sm:col-span-3">
                                <div className="relative">
                                  <span className="absolute left-2.5 top-2 text-[10px] font-bold text-stone-400">RM</span>
                                  <input
                                    type="number"
                                    step="0.10"
                                    value={opt.price}
                                    onChange={(e) => handleUpdateWeightOption(opt.id, 'price', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg py-2 pl-8 pr-1 text-xs font-black text-emerald-700 dark:text-emerald-400 focus:outline-hidden focus:border-emerald-500"
                                  />
                                </div>
                              </div>

                              <div className="col-span-3 sm:col-span-3">
                                <input
                                  type="number"
                                  value={opt.availableStock}
                                  onChange={(e) => handleUpdateWeightOption(opt.id, 'availableStock', parseInt(e.target.value, 10) || 0)}
                                  placeholder="Stok"
                                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2 text-xs font-bold text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                                />
                              </div>

                              <div className="col-span-2 sm:col-span-2 flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleWeightOptionAvailable(opt.id)}
                                  className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                                    opt.isAvailable
                                      ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                      : 'text-rose-700 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300'
                                  }`}
                                  title={opt.isAvailable ? 'Sembunyikan Pilihan / Habis Stok' : 'Aktifkan Semula'}
                                >
                                  {opt.isAvailable ? <Check className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveWeightOption(opt.id)}
                                  className="p-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-400 transition-colors cursor-pointer"
                                  title="Padam Pilihan Ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}

                          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300 pt-2 px-1 border-t border-emerald-200 dark:border-emerald-800">
                            <span>Kuantiti Baki Sedia Ada Keseluruhan:</span>
                            <span className="font-extrabold text-sm">{prodWeightOptions.reduce((s, o) => s + (o.isAvailable ? Number(o.availableStock) || 0 : 0), 0)} unit</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prodInStock}
                          onChange={(e) => setProdInStock(e.target.checked)}
                          className="rounded-sm text-emerald-600"
                        />
                        <span>Sedia Ada (In Stock)</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prodSupportsCutting}
                          onChange={(e) => setProdSupportsCutting(e.target.checked)}
                          className="rounded-sm text-emerald-600"
                        />
                        <span>Sokong Pilihan Potongan Khas</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      Simpan Produk Ke Katalog
                    </button>
                  </div>
                </form>
              )}

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => {
                  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
                  const savings = hasDiscount && product.originalPrice ? product.originalPrice - product.price : 0;
                  const totalVariationStock = product.hasWeightOptions && product.weightOptions && product.weightOptions.length > 0
                    ? product.weightOptions.reduce((acc, opt) => acc + (opt.isAvailable ? opt.availableStock : 0), 0)
                    : product.remainingStock || 0;

                  return (
                    <div
                      key={product.id}
                      className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative mb-3 rounded-xl overflow-hidden aspect-video bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                          <ProductImage
                            product={product}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          {hasDiscount && savings > 0 && (
                            <span className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-600 text-white shadow-md">
                              Jimat RM {savings.toFixed(2)}
                            </span>
                          )}
                          <span className={`absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-md shadow-md ${
                            product.inStock && totalVariationStock > 0 ? 'bg-emerald-600 text-white' : 'bg-rose-700 text-white'
                          }`}>
                            {product.inStock && totalVariationStock > 0 ? 'Ada Stok' : 'Habis Stok'}
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-xs text-stone-900 dark:text-white leading-tight">
                              {product.name}
                            </h4>
                            <p className="text-[11px] text-stone-500 mt-0.5">{product.weightEstimate} • {product.category}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-['Outfit'] block">
                              {product.hasWeightOptions ? `Dari RM ${product.price.toFixed(2)}` : `RM ${product.price.toFixed(2)}`}
                            </span>
                            {product.originalPrice && (
                              <span className="text-[10px] text-stone-400 line-through">
                                RM {product.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* If Weight Options exist, display them in Admin Card */}
                        {product.hasWeightOptions && product.weightOptions && product.weightOptions.length > 0 && (
                          <div className="mt-2.5 p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
                            <div className="text-[10px] font-black uppercase text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Scale className="w-3 h-3 text-emerald-600" />
                                <span>Pilihan Berat & Harga:</span>
                              </span>
                              <span>{totalVariationStock} ekor baki</span>
                            </div>
                            <div className="space-y-1 pt-0.5">
                              {product.weightOptions.map((opt) => (
                                <div key={opt.id} className="text-[11px] flex items-center justify-between">
                                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                                    {opt.weightLabel}:
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                      RM {opt.price.toFixed(2)}
                                    </span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                                      opt.isAvailable && opt.availableStock > 0
                                        ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                    }`}>
                                      {opt.isAvailable ? `${opt.availableStock} unit` : 'Sembunyi'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-2 text-[11px] text-stone-500 flex items-center justify-between bg-stone-50 dark:bg-stone-900/60 p-2 rounded-xl">
                          <span>Baki Stok Sedia Ada: <strong>{totalVariationStock} unit</strong></span>
                          <span>Potongan: <strong>{product.supportsCutting ? 'Ya' : 'Utuh Sahaja'}</strong></span>
                        </div>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-stone-100 dark:border-stone-700 flex items-center justify-between text-xs">
                        <button
                          onClick={() => handleToggleProductStock(product.id, product.inStock)}
                          className="text-[11px] font-bold text-stone-600 dark:text-stone-300 hover:text-emerald-600 cursor-pointer"
                        >
                          {product.inStock ? 'Tukar ke Habis' : 'Aktifkan Stok'}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={async () => {
                              const cleanUrl = getProductCleanUrl(product, { format: 'path' });
                              const ok = await copyShareableLink(cleanUrl);
                              if (ok) {
                                showNotification('success', `Pautan mesra pengguna untuk ${product.name} berjaya disalin: ${cleanUrl}`);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 hover:text-emerald-800 cursor-pointer"
                            title="Salin Pautan Mesra Pengguna (/p/...)"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditProduct(product)}
                            className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                            title="Edit Produk"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                            title="Padam Produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: MASTER MEDIA FOLDER & GALLERY */}
          {activeTab === 'media' && (
            <AdminMediaTab
              products={products}
              onProductsUpdated={(updated) => {
                setProducts(updated);
                onProductsUpdated(updated);
              }}
              onShowNotification={showNotification}
              adminName={adminUser.name}
            />
          )}

          {/* TAB: ROTATION BANNERS */}
          {activeTab === 'banners' && (
            <BannerEditorTab
              banners={banners}
              onBannersUpdated={(updated) => {
                setBanners(updated);
                if (propOnBannersUpdated) propOnBannersUpdated(updated);
              }}
              onShowNotification={showNotification}
            />
          )}

          {/* TAB 3: KOD KUPON & PROMOSI */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              {/* Header & Quick Action */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-stone-50 dark:bg-stone-800/80 p-4 rounded-3xl border border-stone-200 dark:border-stone-700">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                    <Tag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>Pengurusan Kod Kupon & Baucar Promosi</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Cipta kod promo khas untuk kempen jualan, pelanggan baharu, atau promosi hujung minggu.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreatingCoupon(!isCreatingCoupon)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isCreatingCoupon ? 'Tutup Borang' : 'Cipta Kod Kupon Baharu'}</span>
                </button>
              </div>

              {/* Coupon Metrics Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs">
                  <span className="text-stone-500 text-[11px] block">Jumlah Kod Kupon</span>
                  <span className="text-xl font-black text-stone-900 dark:text-white font-['Outfit'] block mt-1">
                    {coupons.length} Kod
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {coupons.filter((c) => c.isActive).length} Aktif
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs">
                  <span className="text-stone-500 text-[11px] block">Jumlah Penebusan</span>
                  <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-['Outfit'] block mt-1">
                    {coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0)} Kali
                  </span>
                  <span className="text-[10px] text-stone-500">Telah digunakan pelanggan</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs">
                  <span className="text-stone-500 text-[11px] block">Kupon Diskaun Tetap</span>
                  <span className="text-xl font-black text-blue-700 dark:text-blue-400 font-['Outfit'] block mt-1">
                    {coupons.filter((c) => c.discountType === 'fixed').length} Kod
                  </span>
                  <span className="text-[10px] text-stone-500">Potongan RM tetap</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs">
                  <span className="text-stone-500 text-[11px] block">Kupon Peratusan</span>
                  <span className="text-xl font-black text-purple-700 dark:text-purple-400 font-['Outfit'] block mt-1">
                    {coupons.filter((c) => c.discountType === 'percentage').length} Kod
                  </span>
                  <span className="text-[10px] text-stone-500">Potongan diskaun %</span>
                </div>
              </div>

              {/* Create / Add Coupon Form */}
              {isCreatingCoupon && (
                <div className="p-5 bg-stone-50 dark:bg-stone-800/90 rounded-3xl border-2 border-emerald-500/50 shadow-lg space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b pb-3 border-stone-200 dark:border-stone-700">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-black">
                        <Gift className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-black uppercase text-stone-900 dark:text-white">
                        Borang Cipta Kod Kupon Baharu
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsCreatingCoupon(false)}
                      className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div>
                    <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block mb-1.5">
                      Pilihan Pantas (Template Cepat):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleApplyPreset({
                          code: 'AYAMJIMAT5',
                          type: 'fixed',
                          value: 5,
                          min: 40,
                          desc: 'Diskaun RM5.00 untuk belian minimum RM40.00'
                        })}
                        className="px-2.5 py-1 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg text-xs font-semibold hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                      >
                        ⚡ RM5 Off (Min RM40)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyPreset({
                          code: 'SEMENYIH10',
                          type: 'percentage',
                          value: 10,
                          min: 50,
                          max: 10,
                          desc: 'Diskaun 10% (Maksimum RM10) untuk pesanan RM50 ke atas'
                        })}
                        className="px-2.5 py-1 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg text-xs font-semibold hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                      >
                        ⚡ 10% Off (Min RM50)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyPreset({
                          code: 'WEEKENDJIMAT',
                          type: 'fixed',
                          value: 4,
                          min: 35,
                          desc: 'Tawaran istimewa pasar segar hujung minggu'
                        })}
                        className="px-2.5 py-1 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg text-xs font-semibold hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                      >
                        ⚡ RM4 Off Hujung Minggu
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyPreset({
                          code: 'PELANGGANBARU',
                          type: 'fixed',
                          value: 3,
                          min: 25,
                          desc: 'Selamat datang ke Khairul Fresh Food! Jimat RM3'
                        })}
                        className="px-2.5 py-1 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg text-xs font-semibold hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                      >
                        ⚡ RM3 Pelanggan Baru
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleCreateCoupon} className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Coupon Code Input */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                          Kod Kupon (Huruf Besar) *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={couponCodeInput}
                            onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase().replace(/\s/g, ''))}
                            placeholder="cth: AYAM5, RAYA2026"
                            className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase focus:border-emerald-500 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      {/* Discount Type */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                          Jenis Diskaun *
                        </label>
                        <select
                          value={couponDiscountType}
                          onChange={(e) => setCouponDiscountType(e.target.value as CouponDiscountType)}
                          className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-bold focus:border-emerald-500 focus:outline-hidden"
                        >
                          <option value="fixed">Jumlah Tetap (RM)</option>
                          <option value="percentage">Peratusan (%)</option>
                        </select>
                      </div>

                      {/* Discount Value */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                          Nilai Diskaun ({couponDiscountType === 'fixed' ? 'RM' : '%'}) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0.1"
                          step="0.5"
                          value={couponDiscountValue}
                          onChange={(e) => setCouponDiscountValue(parseFloat(e.target.value) || 0)}
                          placeholder="5.00"
                          className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 focus:border-emerald-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Min Spend */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                          Belian Minimum (RM)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={couponMinSpend}
                          onChange={(e) => setCouponMinSpend(parseFloat(e.target.value) || 0)}
                          placeholder="30.00"
                          className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-bold focus:border-emerald-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Max Discount (for %) */}
                      {couponDiscountType === 'percentage' && (
                        <div>
                          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                            Had Maksimum Diskaun (RM)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={couponMaxDiscount || ''}
                            onChange={(e) => setCouponMaxDiscount(e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder="cth: 15.00"
                            className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-bold focus:border-emerald-500 focus:outline-hidden"
                          />
                        </div>
                      )}

                      {/* Expiry Date */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                          Tarikh Tamat Tempoh
                        </label>
                        <input
                          type="date"
                          value={couponExpiryDate}
                          onChange={(e) => setCouponExpiryDate(e.target.value)}
                          className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-bold focus:border-emerald-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Usage Limit */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                          Had Penebusan (Usage Limit)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={couponUsageLimit || ''}
                          onChange={(e) => setCouponUsageLimit(e.target.value ? parseInt(e.target.value) : undefined)}
                          placeholder="cth: 100 kali"
                          className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-bold focus:border-emerald-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Penerangan / Syarat Kupon
                      </label>
                      <input
                        type="text"
                        value={couponDescription}
                        onChange={(e) => setCouponDescription(e.target.value)}
                        placeholder="cth: Diskaun RM5 untuk belian melebihi RM40 ayam bulat segar"
                        className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Active Switch & Submit */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800 dark:text-stone-200">
                        <input
                          type="checkbox"
                          checked={couponIsActive}
                          onChange={(e) => setCouponIsActive(e.target.checked)}
                          className="rounded-sm text-emerald-600 w-4 h-4"
                        />
                        <span>Aktifkan serta-merta untuk digunakan pelanggan</span>
                      </label>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsCreatingCoupon(false)}
                          className="px-4 py-2 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>Simpan & Terbitkan Kupon</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Coupons List & Filters */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-50 dark:bg-stone-800/80 p-3 rounded-2xl border border-stone-200 dark:border-stone-700">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={couponSearch}
                      onChange={(e) => setCouponSearch(e.target.value)}
                      placeholder="Cari kod kupon, penerangan promo..."
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 dark:text-white focus:outline-hidden"
                    />
                  </div>
                  <span className="text-xs text-stone-500 font-bold self-center px-2">
                    {coupons.filter(c => !couponSearch.trim() || c.code.toLowerCase().includes(couponSearch.toLowerCase()) || c.description.toLowerCase().includes(couponSearch.toLowerCase())).length} Kupon Dijumpai
                  </span>
                </div>

                {/* Coupon Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coupons
                    .filter((c) => {
                      if (!couponSearch.trim()) return true;
                      const q = couponSearch.toLowerCase();
                      return c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
                    })
                    .map((coupon) => {
                      const isExpired = coupon.expiryDate ? new Date().toISOString().split('T')[0] > coupon.expiryDate : false;
                      const isMaxedOut = coupon.usageLimit ? coupon.usageCount >= coupon.usageLimit : false;

                      return (
                        <div
                          key={coupon.id}
                          className={`p-4 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                            coupon.isActive && !isExpired && !isMaxedOut
                              ? 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 shadow-xs hover:border-emerald-500/60'
                              : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 opacity-80'
                          }`}
                        >
                          <div>
                            {/* Top Badge & Code */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-mono font-black text-sm tracking-wider flex items-center gap-1.5">
                                  <span>{coupon.code}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCopyCouponCode(coupon)}
                                  className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-stone-700 transition-colors"
                                  title="Salin Kod Kupon"
                                >
                                  {copiedCouponId === coupon.id ? (
                                    <Check className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {isExpired && (
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                    Tamat Tempoh
                                  </span>
                                )}
                                {isMaxedOut && (
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                    Had Penuh
                                  </span>
                                )}
                                <span
                                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                    coupon.isActive
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
                                  }`}
                                >
                                  {coupon.isActive ? 'Aktif' : 'Nyahaktif'}
                                </span>
                              </div>
                            </div>

                            {/* Discount Details */}
                            <div className="mt-3 flex items-baseline gap-2">
                              <span className="text-xl font-black text-stone-900 dark:text-white font-['Outfit']">
                                {coupon.discountType === 'fixed'
                                  ? `RM ${(coupon.discountValue ?? 0).toFixed(2)} OFF`
                                  : `${coupon.discountValue ?? 0}% OFF`}
                              </span>
                              {coupon.discountType === 'percentage' && coupon.maxDiscount && (
                                <span className="text-xs text-stone-500 font-semibold">
                                  (Maks RM{coupon.maxDiscount})
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-snug">
                              {coupon.description}
                            </p>

                            {/* Rules & Meta */}
                            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] bg-stone-50 dark:bg-stone-900/50 p-2.5 rounded-2xl">
                              <div>
                                <span className="text-stone-400 block">Belian Minima:</span>
                                <strong className="text-stone-800 dark:text-stone-200">
                                  {(coupon.minSpend ?? 0) > 0 ? `RM ${(coupon.minSpend ?? 0).toFixed(2)}` : 'Tiada Had'}
                                </strong>
                              </div>

                              <div>
                                <span className="text-stone-400 block">Tamat Tempoh:</span>
                                <strong className="text-stone-800 dark:text-stone-200">
                                  {coupon.expiryDate || 'Sepanjang Masa'}
                                </strong>
                              </div>

                              <div className="col-span-2 pt-1 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                                <span className="text-stone-400">Prestasi Penebusan:</span>
                                <strong className="text-emerald-700 dark:text-emerald-400">
                                  {coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ''} kali ditebus
                                </strong>
                              </div>
                            </div>
                          </div>

                          {/* Footer Actions */}
                          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-700 flex items-center justify-between text-xs">
                            <button
                              type="button"
                              onClick={() => handleToggleCoupon(coupon)}
                              className={`text-[11px] font-bold cursor-pointer transition-colors ${
                                coupon.isActive
                                  ? 'text-amber-700 dark:text-amber-400 hover:underline'
                                  : 'text-emerald-700 dark:text-emerald-400 hover:underline'
                              }`}
                            >
                              {coupon.isActive ? 'Nyahaktifkan Kupon' : 'Aktifkan Semula'}
                            </button>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCopyCouponCode(coupon)}
                                className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                                title="Salin Kod"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteCoupon(coupon)}
                                className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                                title="Padam Kupon"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PAGE CONTENT & ANNOUNCEMENT SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-6">
              
              {/* Quick Jump to HitPay Gateway Banner */}
              <div className="p-4 rounded-3xl bg-linear-to-r from-emerald-950 via-stone-900 to-stone-950 text-white border border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-base shadow-md shrink-0">
                    HP
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base text-white">
                        HitPay Malaysia Payment Gateway
                      </h4>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {hitpayIsActive ? (hitpayIsSandbox ? '🧪 Sandbox' : '🚀 Live') : 'Nyahaktif'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 mt-0.5">
                      Satu-satunya kaedah pembayaran utama (FPX, DuitNow QR, E-Wallets, Kad Bank).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('payment')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Urus Kunci API HitPay</span>
                </button>
              </div>

              {/* Kawalan Stok & Paparan Kotak Penebat Dingin (Cooler Box) */}
              <div className="p-5 bg-stone-50 dark:bg-stone-800/80 rounded-3xl border border-stone-200 dark:border-stone-700 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-stone-200 dark:border-stone-700">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg shadow-xs shrink-0 ${
                      settingsForm.enableCoolerBoxOption ? 'bg-blue-600 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400'
                    }`}>
                      🧊
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs sm:text-sm font-black uppercase text-stone-900 dark:text-white">
                          Pilihan Kotak Penebat Dingin (Cooler Box)
                        </h3>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          settingsForm.enableCoolerBoxOption 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' 
                            : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                        }`}>
                          {settingsForm.enableCoolerBoxOption ? '🟢 Papar / Ada Stok' : '🔴 Sembunyi / Stok Habis'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        Kawal paparan pilihan Cooler Box di checkout & pop-up pemotongan. Sembunyikan jika stok kotak habis.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !settingsForm.enableCoolerBoxOption;
                      const updated: SiteSettings = {
                        ...settingsForm,
                        enableCoolerBoxOption: nextState,
                      };
                      setSettingsForm(updated);
                      const saved = dataStorageService.saveSiteSettings(updated, adminUser.name);
                      setSiteSettings(saved);
                      onSettingsUpdated(saved);
                      setAuditLogs(dataStorageService.getAuditLogs());
                      showNotification(
                        nextState ? 'success' : 'info',
                        nextState 
                          ? 'Kotak Penebat Dingin (Cooler Box) kini DIPAPARKAN kepada pelanggan.' 
                          : 'Kotak Penebat Dingin (Cooler Box) kini DISEMBUNYIKAN (Stok Habis) daripada pelanggan.'
                      );
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-xs ${
                      settingsForm.enableCoolerBoxOption
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {settingsForm.enableCoolerBoxOption ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Sembunyi Pilihan Cooler Box (Habis Stok)</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Papar Pilihan Cooler Box (Ada Stok)</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-stone-200">
                    <Package className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Status Semasa Untuk Pelanggan:</span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                    {settingsForm.enableCoolerBoxOption ? (
                      <span>Pelanggan boleh memilih pilihan <strong>Kotak Cooler Box Penebat</strong> (+RM5.00 jika bawah 10 unit / +RM10.00 jika 10-30 unit) semasa membuat pesanan.</span>
                    ) : (
                      <span>Pilihan Cooler Box <strong>disembunyikan sepenuhnya</strong> di bahagian pemilihan pemotongan dan borang checkout. Pesanan pelanggan akan diproses menggunakan <strong>Bungkusan Biasa Bersama Ais (Percuma)</strong>.</span>
                    )}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="p-5 bg-stone-50 dark:bg-stone-800/80 rounded-3xl border border-stone-200 dark:border-stone-700 space-y-4">
                <div className="flex items-center justify-between border-b pb-2 border-stone-200 dark:border-stone-700">
                  <h3 className="text-xs font-black uppercase text-stone-900 dark:text-white">
                    Konfigurasi Khairul Fresh Food & Bar Pengumuman
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Teks Bar Pengumuman Atas (Announcement Bar)
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.announcementText}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Had Masa Pesanan Esok (Cutoff Time)
                      </label>
                      <input
                        type="text"
                        value={settingsForm.announcementCutoffTime}
                        onChange={(e) => setSettingsForm({ ...settingsForm, announcementCutoffTime: e.target.value })}
                        placeholder="23:00 (11:00 PM)"
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Had Minimum Penghantaran Percuma (RM)
                      </label>
                      <input
                        type="number"
                        value={settingsForm.freeShippingMinAmount}
                        onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingMinAmount: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 font-bold text-emerald-700 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Nombor WhatsApp Hotline Khidmat Pelanggan
                      </label>
                      <input
                        type="text"
                        value={settingsForm.supportPhone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Emel Rasmi Sokongan (support@freshmarket.my)
                      </label>
                      <input
                        type="email"
                        value={settingsForm.supportEmail}
                        onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Mesej Notis Promosi Hero / Jaminan
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.bannerNotice}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bannerNotice: e.target.value })}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden text-xs"
                    />
                  </div>

                  <div className="pt-2 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800 dark:text-stone-200">
                      <input
                        type="checkbox"
                        checked={settingsForm.isOrderingEnabled}
                        onChange={(e) => setSettingsForm({ ...settingsForm, isOrderingEnabled: e.target.checked })}
                        className="rounded-sm text-emerald-600"
                      />
                      <span>Buka Sistem Pesanan Dalam Talian (Online Ordering Active)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800 dark:text-stone-200">
                      <input
                        type="checkbox"
                        checked={settingsForm.enableCoolerBoxOption ?? false}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enableCoolerBoxOption: e.target.checked })}
                        className="rounded-sm text-blue-600"
                      />
                      <span>Aktifkan Pilihan Kotak Penebat Dingin (Cooler Box) untuk Pelanggan (Nyah-tanda jika stok habis)</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Semua Tetapan Laman</span>
                </button>
              </form>

              {/* Thermal Receipt 80mm Settings */}
              <div className="p-5 bg-stone-50 dark:bg-stone-800/80 rounded-3xl border border-stone-200 dark:border-stone-700 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-stone-200 dark:border-stone-700">
                  <div>
                    <div className="flex items-center gap-2">
                      <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="text-xs font-black uppercase text-stone-900 dark:text-white">
                        Tetapan Resit Thermal 80mm & Cetakan Butcher Slip
                      </h3>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      Urus Logo Kedai, Teks Promosi atas, maklumat cawangan gerai, dan nota kaki resit thermal.
                    </p>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 w-fit">
                    Format 80mm ESC/POS
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Logo Section */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                        <span>🖼️ Logo Kedai (URL / Pautan Gambar)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-stone-600 dark:text-stone-300">
                        <input
                          type="checkbox"
                          checked={settingsForm.thermalReceiptSettings?.showLogo ?? true}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            thermalReceiptSettings: {
                              ...settingsForm.thermalReceiptSettings,
                              showLogo: e.target.checked,
                              storeName: settingsForm.thermalReceiptSettings?.storeName || 'KHAIRUL FRESH FOOD',
                              promoText: settingsForm.thermalReceiptSettings?.promoText || '★ TAWARAN HEBAT: Dapatkan Diskaun RM6 untuk Belian RM150+ ★',
                              showPromoText: settingsForm.thermalReceiptSettings?.showPromoText ?? true,
                            }
                          })}
                          className="rounded-sm text-emerald-600"
                        />
                        <span>Papar Logo pada Resit</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={settingsForm.thermalReceiptSettings?.logoUrl || ''}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          thermalReceiptSettings: {
                            ...settingsForm.thermalReceiptSettings,
                            logoUrl: e.target.value,
                            storeName: settingsForm.thermalReceiptSettings?.storeName || 'KHAIRUL FRESH FOOD',
                            promoText: settingsForm.thermalReceiptSettings?.promoText || '★ TAWARAN HEBAT: Dapatkan Diskaun RM6 untuk Belian RM150+ ★',
                            showPromoText: settingsForm.thermalReceiptSettings?.showPromoText ?? true,
                          }
                        })}
                        className="flex-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden"
                      />
                    </div>
                    {settingsForm.thermalReceiptSettings?.logoUrl && (
                      <div className="flex items-center gap-3 p-2 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                        <span className="text-[10px] text-stone-500">Pratonton Logo:</span>
                        <img
                          src={settingsForm.thermalReceiptSettings.logoUrl}
                          alt="Logo Preview"
                          className="max-h-10 max-w-[120px] object-contain grayscale"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Promo Text Section */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                        <span>📢 Teks Promosi Bahagian Atas Resit</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-stone-600 dark:text-stone-300">
                        <input
                          type="checkbox"
                          checked={settingsForm.thermalReceiptSettings?.showPromoText ?? true}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            thermalReceiptSettings: {
                              ...settingsForm.thermalReceiptSettings,
                              showPromoText: e.target.checked,
                              storeName: settingsForm.thermalReceiptSettings?.storeName || 'KHAIRUL FRESH FOOD',
                              promoText: settingsForm.thermalReceiptSettings?.promoText || '★ TAWARAN HEBAT: Dapatkan Diskaun RM6 untuk Belian RM150+ ★',
                            }
                          })}
                          className="rounded-sm text-emerald-600"
                        />
                        <span>Papar Bar Promosi</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="contoh: ★ TAWARAN HEBAT: Diskaun RM6 untuk Belian RM150+ ★"
                      value={settingsForm.thermalReceiptSettings?.promoText || ''}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        thermalReceiptSettings: {
                          ...settingsForm.thermalReceiptSettings,
                          promoText: e.target.value,
                          storeName: settingsForm.thermalReceiptSettings?.storeName || 'KHAIRUL FRESH FOOD',
                          showPromoText: settingsForm.thermalReceiptSettings?.showPromoText ?? true,
                        }
                      })}
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden font-bold text-amber-800 dark:text-amber-300"
                    />
                  </div>

                  {/* Store Details Header on Receipt */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Nama Kedai Atas Resit
                      </label>
                      <input
                        type="text"
                        value={settingsForm.thermalReceiptSettings?.storeName || 'KHAIRUL FRESH FOOD'}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          thermalReceiptSettings: {
                            ...settingsForm.thermalReceiptSettings,
                            storeName: e.target.value,
                            promoText: settingsForm.thermalReceiptSettings?.promoText || '',
                            showPromoText: settingsForm.thermalReceiptSettings?.showPromoText ?? true,
                          }
                        })}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden font-black"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Tagline Lokasi / No Gerai
                      </label>
                      <input
                        type="text"
                        value={settingsForm.thermalReceiptSettings?.storeTagline || 'PASAR SEMENTARA SEMENYIH (GA 59)'}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          thermalReceiptSettings: {
                            ...settingsForm.thermalReceiptSettings,
                            storeTagline: e.target.value,
                            storeName: settingsForm.thermalReceiptSettings?.storeName || 'KHAIRUL FRESH FOOD',
                            promoText: settingsForm.thermalReceiptSettings?.promoText || '',
                            showPromoText: settingsForm.thermalReceiptSettings?.showPromoText ?? true,
                          }
                        })}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        No Telefon / WhatsApp Atas Resit
                      </label>
                      <input
                        type="text"
                        value={settingsForm.thermalReceiptSettings?.storePhone || '011-11135503'}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          thermalReceiptSettings: {
                            ...settingsForm.thermalReceiptSettings,
                            storePhone: e.target.value,
                            storeName: settingsForm.thermalReceiptSettings?.storeName || 'KHAIRUL FRESH FOOD',
                            promoText: settingsForm.thermalReceiptSettings?.promoText || '',
                            showPromoText: settingsForm.thermalReceiptSettings?.showPromoText ?? true,
                          }
                        })}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Tag Sembelihan & Halal
                      </label>
                      <input
                        type="text"
                        value={settingsForm.thermalReceiptSettings?.halalTag || '100% HALAL & SEMBELIH SEGAR PAGI'}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          thermalReceiptSettings: {
                            ...settingsForm.thermalReceiptSettings,
                            halalTag: e.target.value,
                            storeName: settingsForm.thermalReceiptSettings?.storeName || 'KHAIRUL FRESH FOOD',
                            promoText: settingsForm.thermalReceiptSettings?.promoText || '',
                            showPromoText: settingsForm.thermalReceiptSettings?.showPromoText ?? true,
                          }
                        })}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Nota Kaki Resit (Footer Notes)
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.thermalReceiptSettings?.footerNotes || 'Dibungkus Bersih & Mengikut Sunnah. Terima kasih atas sokongan anda!'}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        thermalReceiptSettings: {
                          ...settingsForm.thermalReceiptSettings,
                          footerNotes: e.target.value,
                          storeName: settingsForm.thermalReceiptSettings?.storeName || 'KHAIRUL FRESH FOOD',
                          promoText: settingsForm.thermalReceiptSettings?.promoText || '',
                          showPromoText: settingsForm.thermalReceiptSettings?.showPromoText ?? true,
                        }
                      })}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden text-xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleSaveSettings(e as any)}
                    className="w-full py-2.5 bg-stone-900 hover:bg-black dark:bg-stone-700 dark:hover:bg-stone-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4 text-emerald-400" />
                    <span>Simpan Tetapan Resit Thermal 80mm</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: HITPAY PAYMENT GATEWAY & API CONFIGURATION */}
          {activeTab === 'payment' && (
            <div className="max-w-4xl space-y-6">
              
              {/* Header Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-br from-emerald-950 via-stone-900 to-stone-950 text-white border border-emerald-800/60 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-900/50 shrink-0">
                      HP
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-xl font-black text-white font-['Outfit']">
                          HitPay Payment Gateway & API
                        </h3>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Gateway Utama Rasmi
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-stone-300 mt-1">
                        Satu-satunya kaedah pembayaran pelanggan. Memproses FPX Online Banking, DuitNow QR, E-Wallets & Kad Bank secara automatik.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border ${
                      hitpayIsActive 
                        ? (hitpayIsSandbox 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40')
                        : 'bg-stone-800 text-stone-400 border-stone-700'
                    }`}>
                      <Radio className="w-3 h-3 animate-pulse" />
                      <span>{hitpayIsActive ? (hitpayIsSandbox ? '🧪 Mod Sandbox' : '🚀 Mod Live') : 'Nyahaktif'}</span>
                    </span>
                  </div>
                </div>

                {/* Gateway Feature Badges */}
                <div className="pt-3 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white block text-[11px]">Auto-Sahkan</span>
                      <span className="text-[10px] text-stone-400">Tanpa semak manual resit</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white block text-[11px]">Semua Bank & QR</span>
                      <span className="text-[10px] text-stone-400">FPX, DuitNow, TNG, Grab</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white block text-[11px]">Enkripsi 256-Bit</span>
                      <span className="text-[10px] text-stone-400">Patuh Bank Negara Malaysia</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white block text-[11px]">Mata Wang MYR</span>
                      <span className="text-[10px] text-stone-400">Khas pasaran Malaysia</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Configuration Form */}
              <form onSubmit={handleSaveHitpayConfig} className="p-5 sm:p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
                
                {/* Section 1: Activation & Environment Toggle */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 border-stone-200 dark:border-stone-800">
                    <h4 className="text-xs font-black uppercase text-stone-900 dark:text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>1. Status & Persekitaran HitPay Gateway</span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Active Toggle */}
                    <div 
                      onClick={() => setHitpayIsActive(!hitpayIsActive)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        hitpayIsActive 
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-200' 
                          : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-xs block">
                          Status Pembayaran HitPay
                        </span>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400">
                          {hitpayIsActive ? 'Gateway Aktif (Pelanggan boleh bayar)' : 'Gateway Dinyahaktifkan'}
                        </span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={hitpayIsActive} 
                        onChange={() => {}} 
                        className="rounded-sm w-4 h-4 text-emerald-600 pointer-events-none" 
                      />
                    </div>

                    {/* Sandbox vs Production Toggle */}
                    <div 
                      onClick={() => setHitpayIsSandbox(!hitpayIsSandbox)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        hitpayIsSandbox 
                          ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-200' 
                          : 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-500 text-blue-950 dark:text-blue-200'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-xs block">
                          {hitpayIsSandbox ? 'Mod Sandbox (Ujian)' : 'Mod Pengeluaran (Live / Nyata)'}
                        </span>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400">
                          {hitpayIsSandbox ? 'Transaksi simulasi ujian (Sandbox)' : 'Duit sebenar masuk akaun bank peniaga'}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        hitpayIsSandbox ? 'bg-amber-200 text-amber-900' : 'bg-blue-600 text-white'
                      }`}>
                        {hitpayIsSandbox ? 'Sandbox' : 'Live'}
                      </span>
                    </div>

                  </div>
                </div>

                {/* Section 2: API Credentials */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2 border-stone-200 dark:border-stone-800">
                    <h4 className="text-xs font-black uppercase text-stone-900 dark:text-white flex items-center gap-2">
                      <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>2. Kunci API & Keselamatan HitPay (Credentials)</span>
                    </h4>
                    <span className="text-[10px] text-stone-500 font-semibold">
                      Diperolehi dari Portal HitPay
                    </span>
                  </div>

                  {/* API Key */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                        <span>HitPay API Key (X-BUSINESS-API-KEY)</span>
                        <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showApiKey ? 'Sembunyi' : 'Papar Kunci'}</span>
                      </button>
                    </div>

                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={hitpayApiKey}
                      onChange={(e) => setHitpayApiKey(e.target.value)}
                      placeholder="cth: hitpay_sec_xxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl p-3 text-xs font-mono text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500 focus:bg-white dark:focus:bg-stone-900"
                    />
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                      Digunakan untuk mendaftarkan URL pembayaran pesanan secara langsung dengan HitPay.
                    </p>
                  </div>

                  {/* API Salt */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                        <span>HitPay Salt / Webhook Secret Key</span>
                        <span className="text-stone-400 text-[10px]">(Pilihan untuk HMAC Signature)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowSalt(!showSalt)}
                        className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {showSalt ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showSalt ? 'Sembunyi' : 'Papar Salt'}</span>
                      </button>
                    </div>

                    <input
                      type={showSalt ? 'text' : 'password'}
                      value={hitpaySalt}
                      onChange={(e) => setHitpaySalt(e.target.value)}
                      placeholder="cth: hitpay_salt_xxxxxxxxxxxxxxxxxxxx"
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl p-3 text-xs font-mono text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500 focus:bg-white dark:focus:bg-stone-900"
                    />
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                      Digunakan untuk mengesahkan integriti data pemberitahuan webhook daripada pelayan HitPay.
                    </p>
                  </div>

                  {/* Merchant Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Nama Peniaga Pada Resit HitPay
                      </label>
                      <input
                        type="text"
                        value={hitpayMerchantName}
                        onChange={(e) => setHitpayMerchantName(e.target.value)}
                        placeholder="Khairul FRESH Food"
                        className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl p-2.5 text-xs text-stone-900 dark:text-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Mata Wang Transaksi
                      </label>
                      <input
                        type="text"
                        disabled
                        value="MYR (Ringgit Malaysia)"
                        className="w-full bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 text-xs font-bold text-stone-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                </div>

                {/* Section 3: Enabled Payment Channels */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 border-stone-200 dark:border-stone-800">
                    <h4 className="text-xs font-black uppercase text-stone-900 dark:text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>3. Saluran Pembayaran Yang Diterima Melalui HitPay</span>
                    </h4>
                  </div>

                  {/* Smart Guidance Notice */}
                  <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-[11px] text-blue-900 dark:text-blue-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                      <span>Sistem Auto-Pengesanan Kaedah HitPay Pintar:</span>
                    </div>
                    <p className="leading-relaxed">
                      Laman bayaran HitPay akan memaparkan semua kaedah yang sedia aktif di akaun HitPay anda (seperti <strong>Kad Debit/Kredit</strong> & <strong>FPX Online Banking</strong>).
                      Bagi <strong>DuitNow QR</strong>, pastikan ia telah diaktifkan di papan pemuka HitPay (<em>HitPay Dashboard &gt; Payment Gateway &gt; Payment Methods</em>). Jika DuitNow QR masih dalam proses semakan oleh HitPay, sistem secara pintar akan tetap membuka gerbang bayaran dengan kaedah aktif lain supaya pelanggan anda tidak tersekat.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    
                    {/* FPX */}
                    <div 
                      onClick={() => handleToggleHitpayMethod('fpx')}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        hitpayMethods.includes('fpx')
                          ? 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-500'
                          : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 opacity-60'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-stone-900 dark:text-white block">FPX Online Banking</span>
                        <span className="text-[10px] text-stone-500">Maybank, CIMB, Bank Islam...</span>
                      </div>
                      <input type="checkbox" checked={hitpayMethods.includes('fpx')} onChange={() => {}} className="rounded-sm pointer-events-none" />
                    </div>

                    {/* DuitNow QR */}
                    <div 
                      onClick={() => handleToggleHitpayMethod('duitnow')}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        hitpayMethods.includes('duitnow')
                          ? 'bg-pink-50/50 dark:bg-pink-950/40 border-pink-500'
                          : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 opacity-60'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-stone-900 dark:text-white block">DuitNow QR</span>
                        <span className="text-[10px] text-stone-500">Imbas Semua Aplikasi</span>
                      </div>
                      <input type="checkbox" checked={hitpayMethods.includes('duitnow')} onChange={() => {}} className="rounded-sm pointer-events-none" />
                    </div>

                    {/* Touch 'n Go */}
                    <div 
                      onClick={() => handleToggleHitpayMethod('tng')}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        hitpayMethods.includes('tng')
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-500'
                          : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 opacity-60'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-stone-900 dark:text-white block">Touch 'n Go eWallet</span>
                        <span className="text-[10px] text-stone-500">Bayaran Terus eWallet</span>
                      </div>
                      <input type="checkbox" checked={hitpayMethods.includes('tng')} onChange={() => {}} className="rounded-sm pointer-events-none" />
                    </div>

                    {/* GrabPay */}
                    <div 
                      onClick={() => handleToggleHitpayMethod('grabpay')}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        hitpayMethods.includes('grabpay')
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-500'
                          : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 opacity-60'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-stone-900 dark:text-white block">GrabPay</span>
                        <span className="text-[10px] text-stone-500">Dompet Digital Grab</span>
                      </div>
                      <input type="checkbox" checked={hitpayMethods.includes('grabpay')} onChange={() => {}} className="rounded-sm pointer-events-none" />
                    </div>

                    {/* ShopeePay */}
                    <div 
                      onClick={() => handleToggleHitpayMethod('shopeepay')}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        hitpayMethods.includes('shopeepay')
                          ? 'bg-orange-50/50 dark:bg-orange-950/40 border-orange-500'
                          : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 opacity-60'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-stone-900 dark:text-white block">ShopeePay</span>
                        <span className="text-[10px] text-stone-500">E-Wallet Shopee</span>
                      </div>
                      <input type="checkbox" checked={hitpayMethods.includes('shopeepay')} onChange={() => {}} className="rounded-sm pointer-events-none" />
                    </div>

                    {/* Cards */}
                    <div 
                      onClick={() => handleToggleHitpayMethod('card')}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        hitpayMethods.includes('card')
                          ? 'bg-purple-50/50 dark:bg-purple-950/40 border-purple-500'
                          : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 opacity-60'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-stone-900 dark:text-white block">Kad Debit & Kredit</span>
                        <span className="text-[10px] text-stone-500">Visa & Mastercard</span>
                      </div>
                      <input type="checkbox" checked={hitpayMethods.includes('card')} onChange={() => {}} className="rounded-sm pointer-events-none" />
                    </div>

                  </div>
                </div>

                {/* Section 4: Live Connection Test Suite */}
                <div className="space-y-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-black uppercase text-stone-900 dark:text-white flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>4. Alat Ujian Sambungan API HitPay (Diagnostics)</span>
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        Semak kesahihan Kunci API dan tindak balas pelayan HitPay sebelum menerima bayaran.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={hitpayTesting}
                      onClick={handleTestHitpayConnection}
                      className="px-4 py-2 bg-stone-900 dark:bg-stone-700 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {hitpayTesting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Menguji Sambungan...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Uji Sambungan API Sekarang</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Diagnostic Result Banner */}
                  {hitpayTestResult && (
                    <div className={`p-3 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${
                      hitpayTestResult.success 
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
                        : 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                    }`}>
                      {hitpayTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <strong className="block font-bold">
                          {hitpayTestResult.success ? 'Sambungan API Berjaya!' : 'Ralat Sambungan API'}
                        </strong>
                        <span className="text-[11px] mt-0.5 block">{hitpayTestResult.message}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 5: Webhook & Endpoints for HitPay Portal */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 border-stone-200 dark:border-stone-800">
                    <h4 className="text-xs font-black uppercase text-stone-900 dark:text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>5. Pautan Endpoint Webhook & Redirect (Untuk Dashboard HitPay)</span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    
                    {/* Webhook URL */}
                    <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-1">
                      <span className="font-bold text-stone-700 dark:text-stone-300 block text-[11px]">
                        Webhook Callback URL:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          readOnly
                          value={typeof window !== 'undefined' ? `${window.location.origin}/api/hitpay/webhook` : ''}
                          className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-stone-700 dark:text-stone-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleCopyText(typeof window !== 'undefined' ? `${window.location.origin}/api/hitpay/webhook` : '', 'webhook')}
                          className="px-2.5 py-1.5 bg-stone-200 dark:bg-stone-700 hover:bg-emerald-600 hover:text-white rounded-lg text-stone-800 dark:text-stone-200 transition-colors cursor-pointer shrink-0"
                          title="Salin Webhook URL"
                        >
                          {copiedHitpayWebhook ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Redirect URL */}
                    <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-1">
                      <span className="font-bold text-stone-700 dark:text-stone-300 block text-[11px]">
                        Return / Redirect URL:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          readOnly
                          value={typeof window !== 'undefined' ? window.location.origin : ''}
                          className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-stone-700 dark:text-stone-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleCopyText(typeof window !== 'undefined' ? window.location.origin : '', 'redirect')}
                          className="px-2.5 py-1.5 bg-stone-200 dark:bg-stone-700 hover:bg-emerald-600 hover:text-white rounded-lg text-stone-800 dark:text-stone-200 transition-colors cursor-pointer shrink-0"
                          title="Salin Redirect URL"
                        >
                          {copiedHitpayRedirect ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Konfigurasi HitPay API</span>
                  </button>
                </div>

              </form>

              {/* CARD 2: DUITNOW QR RASMI & AKAUN BANK OCBC */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border-2 border-pink-500/80 shadow-xl space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-pink-100 dark:border-pink-900/60">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#ED0058] text-white flex items-center justify-center shadow-md shrink-0">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white font-['Outfit']">
                          DuitNow QR & Pindahan Bank OCBC
                        </h3>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 border border-pink-300 dark:border-pink-800">
                          Malaysia National QR
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        Tetapan akaun bank peniaga dan gambar standee QR DuitNow asal untuk dipaparkan kepada pelanggan semasa checkout.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700">
                      <input
                        type="checkbox"
                        checked={duitnowIsActive}
                        onChange={(e) => setDuitnowIsActive(e.target.checked)}
                        className="rounded-sm w-4 h-4 text-pink-600"
                      />
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        {duitnowIsActive ? 'DuitNow Aktif' : 'DuitNow Ditutup'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Body Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Standee Preview & Image Upload */}
                  <div className="lg:col-span-5 flex flex-col items-center p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-800">
                    <span className="text-xs font-black uppercase text-stone-700 dark:text-stone-300 mb-3 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-pink-600" />
                      <span>Pratonton Standee QR Asal</span>
                    </span>

                    <div className="mb-4">
                      <DuitNowStandeeVisual 
                        merchantName={duitnowAccountName} 
                        customImage={duitnowQrImage} 
                        compact={true}
                      />
                    </div>

                    {/* Image Controls */}
                    <div className="w-full space-y-2">
                      <input
                        type="file"
                        id="duitnow-upload-input"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              const base64 = reader.result as string;
                              setDuitnowQrImage(base64);
                              localStorage.setItem('khairul_duitnow_qr_img', base64);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => document.getElementById('duitnow-upload-input')?.click()}
                        className="w-full py-2 px-3 rounded-xl bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{duitnowQrImage ? 'Tukar Gambar Standee Asal' : 'Muat Naik Gambar Standee Asal'}</span>
                      </button>

                      {duitnowQrImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setDuitnowQrImage('');
                            localStorage.removeItem('khairul_duitnow_qr_img');
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Guna Kod QR Dinamik EMVCo</span>
                        </button>
                      )}

                      <p className="text-[10px] text-stone-500 text-center leading-relaxed">
                        Tip: Muat naik gambar asal standee OCBC (PNG/JPG) untuk memastikan pelanggan sentiasa melihat gambar asli tanpa AI.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Bank Details Form */}
                  <div className="lg:col-span-7 space-y-4">
                    
                    {/* Bank Name */}
                    <div>
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                        Nama Bank
                      </label>
                      <input
                        type="text"
                        value={duitnowBankName}
                        onChange={(e) => setDuitnowBankName(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-white font-medium focus:outline-hidden focus:border-pink-500"
                        placeholder="cth: OCBC Bank (Malaysia) Berhad"
                      />
                    </div>

                    {/* Account Name */}
                    <div>
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                        Nama Akaun / Pedagang (Merchant)
                      </label>
                      <input
                        type="text"
                        value={duitnowAccountName}
                        onChange={(e) => setDuitnowAccountName(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-white font-bold focus:outline-hidden focus:border-pink-500 uppercase tracking-tight"
                        placeholder="cth: KHAIRUL FRESH AND FROZEN FOOD"
                      />
                    </div>

                    {/* Account Number */}
                    <div>
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                        Nombor Akaun Bank
                      </label>
                      <input
                        type="text"
                        value={duitnowAccountNumber}
                        onChange={(e) => setDuitnowAccountNumber(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-emerald-700 dark:text-emerald-400 font-mono font-black focus:outline-hidden focus:border-pink-500 tracking-wider"
                        placeholder="cth: 70 6116 3993"
                      />
                    </div>

                    {/* Reference Instructions */}
                    <div className="p-3 bg-pink-50/50 dark:bg-pink-950/20 rounded-xl border border-pink-200 dark:border-pink-900/40 text-xs space-y-1">
                      <strong className="text-pink-900 dark:text-pink-200 font-bold block">
                        Format Rujukan Pesanan Pelanggan:
                      </strong>
                      <p className="text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">
                        Sistem secara automatik memformatkan rujukan pesanan sebagai <code className="font-mono font-bold bg-white dark:bg-stone-800 px-1 py-0.5 rounded border border-pink-200 dark:border-stone-700">No. Telefon Pelanggan / #NoPesanan</code> dan menyediakan butang hantar resit ke WhatsApp rasmi <strong>011-11135503</strong>.
                      </p>
                    </div>

                    {/* Save Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSaveDuitNowConfig()}
                        className="w-full sm:w-auto px-6 py-2.5 bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Simpan Tetapan DuitNow QR OCBC</span>
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: WHATSAPP GATEWAY (FONNTE) CONFIGURATION */}
          {activeTab === 'whatsapp_gateway' && (
            <AdminWhatsAppGatewayTab
              fonnteToken={fonnteToken}
              setFonnteToken={setFonnteToken}
              fonnteAdminPhone={fonnteAdminPhone}
              setFonnteAdminPhone={setFonnteAdminPhone}
              fonnteAutoNotifyAdmin={fonnteAutoNotifyAdmin}
              setFonnteAutoNotifyAdmin={setFonnteAutoNotifyAdmin}
              fonnteAutoNotifyCustomer={fonnteAutoNotifyCustomer}
              setFonnteAutoNotifyCustomer={setFonnteAutoNotifyCustomer}
              showFonnteToken={showFonnteToken}
              setShowFonnteToken={setShowFonnteToken}
              fonnteTesting={fonnteTesting}
              fonnteTestResult={fonnteTestResult}
              handleTestFonnteConnection={handleTestFonnteConnection}
              testCustomPhone={testCustomPhone}
              setTestCustomPhone={setTestCustomPhone}
              testCustomMessage={testCustomMessage}
              setTestCustomMessage={setTestCustomMessage}
              fonnteSendingTestMsg={fonnteSendingTestMsg}
              handleSendTestMessage={handleSendTestMessage}
              handleSaveFonnteConfig={handleSaveFonnteConfig}
            />
          )}

          {/* TAB 5: SECURITY & AUDIT TRAIL */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              
              {/* Security Status Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 block">Status Pengesahan 2FA</span>
                  <p className="text-stone-500 text-[11px] mt-0.5">PIN Keselamatan 4-Digit: <strong>Aktif (8899)</strong></p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 block">Sesi Sijil SSL & Token</span>
                  <p className="text-stone-500 text-[11px] mt-0.5">Token Selamat Sesi Aktif 24 Jam</p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <span className="font-bold text-stone-900 dark:text-white block">Kawalan Brute-Force</span>
                  <p className="text-stone-500 text-[11px] mt-0.5">Sekatan automatik selepas 4 percubaan gagal</p>
                </div>
              </div>

              {/* Audit Log Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-stone-500 tracking-wider">
                  Log Audit Tindakan & Perubahan Sistem
                </h4>

                <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-700">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 uppercase tracking-wider font-extrabold text-[10px]">
                      <tr>
                        <th className="p-3">Masa & Tarikh</th>
                        <th className="p-3">Tindakan</th>
                        <th className="p-3">Pengguna / Admin</th>
                        <th className="p-3">Butiran Perubahan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 dark:divide-stone-700 bg-white dark:bg-stone-900">
                      {auditLogs.map((log, idx) => (
                        <tr key={log.id ? `${log.id}-${idx}` : `log-${idx}`} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                          <td className="p-3 text-stone-500 whitespace-nowrap font-mono text-[11px]">
                            {new Date(log.timestamp).toLocaleString('ms-MY')}
                          </td>
                          <td className="p-3 font-bold text-stone-900 dark:text-white">
                            {log.action}
                          </td>
                          <td className="p-3 text-emerald-700 dark:text-emerald-400 font-semibold">
                            {log.performedBy}
                          </td>
                          <td className="p-3 text-stone-600 dark:text-stone-300">
                            {log.details}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODAL: Cetak Resit Thermal 80mm untuk Tampal Bungkusan */}
      <ThermalReceiptModal
        order={thermalReceiptOrder}
        isOpen={Boolean(thermalReceiptOrder)}
        onClose={() => setThermalReceiptOrder(null)}
      />

      {/* MODAL: Edit / Tambah Akaun Pengguna & Admin */}
      {(editingUser || isCreatingUser) && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-800/80">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                  editUserRole === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600'
                }`}>
                  {isCreatingUser ? <Plus className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-stone-900 dark:text-white">
                    {isCreatingUser ? 'Daftar Akaun Baharu' : `Kemaskini Akaun: ${editingUser?.name}`}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {isCreatingUser ? 'Cipta akaun pelanggan atau pentadbir baharu' : `ID: ${editingUser?.id}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseUserModal}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveUser} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Role Selection */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Peranan Akaun (Role)
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditUserRole('customer')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      editUserRole === 'customer'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <Users className={`w-4 h-4 ${editUserRole === 'customer' ? 'text-emerald-600' : 'text-stone-400'}`} />
                    <div>
                      <span className="font-extrabold block text-xs">Pelanggan</span>
                      <span className="text-[10px] opacity-75">Beli barang & kutip poin</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditUserRole('admin')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      editUserRole === 'admin'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <ShieldCheck className={`w-4 h-4 ${editUserRole === 'admin' ? 'text-indigo-600' : 'text-stone-400'}`} />
                    <div>
                      <span className="font-extrabold block text-xs">Pentadbir (Admin)</span>
                      <span className="text-[10px] opacity-75">Akses penuh portal admin</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Nama Penuh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editUserName}
                    onChange={(e) => setEditUserName(e.target.value)}
                    placeholder="cth. Ahmad Faiz"
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500 text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Username (Pilihan)
                  </label>
                  <input
                    type="text"
                    value={editUserUsername}
                    onChange={(e) => setEditUserUsername(e.target.value)}
                    placeholder="cth. faiz99"
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500 font-mono text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Alamat Emel <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editUserEmail}
                    onChange={(e) => setEditUserEmail(e.target.value)}
                    placeholder="cth. user@example.com"
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500 text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Nombor Telefon / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={editUserPhone}
                    onChange={(e) => setEditUserPhone(e.target.value)}
                    placeholder="011-11135503"
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500 font-mono text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Points & Total Spent (For Customers/Admins) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700">
                <div>
                  <label className="block font-bold text-amber-700 dark:text-amber-400 mb-1">
                    Mata Ganjaran (Loyalty Points)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editUserLoyaltyPoints}
                    onChange={(e) => setEditUserLoyaltyPoints(parseInt(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2 font-bold text-amber-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                    Jumlah Belanja Terkumpul (RM)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editUserTotalSpent}
                    onChange={(e) => setEditUserTotalSpent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2 font-bold text-emerald-600 font-['Outfit'] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="p-3.5 bg-stone-100 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-stone-500" />
                    <span>{isCreatingUser ? 'Tetapkan Kata Laluan' : 'Tukar Kata Laluan (Pilihan)'}</span>
                  </label>
                  {!isCreatingUser && (
                    <span className="text-[10px] text-stone-400">Biarkan kosong jika tidak mahu tukar</span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editUserNewPassword}
                    onChange={(e) => setEditUserNewPassword(e.target.value)}
                    placeholder={isCreatingUser ? 'Minimum 6 aksara' : 'Masukkan kata laluan baharu jika ingin menukar'}
                    required={isCreatingUser}
                    minLength={6}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 pr-10 focus:outline-hidden focus:border-emerald-500 text-stone-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseUserModal}
                  className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isCreatingUser ? 'Cipta Pengguna' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center text-rose-600 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 dark:text-white text-base">
                  Sahkan Pemadaman Akaun
                </h3>
                <p className="text-xs text-stone-500">Tindakan ini adalah kekal dan tidak boleh diundur.</p>
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700/60 space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
              <p>
                Nama: <strong>{userToDelete.name}</strong>
              </p>
              <p>
                Emel: <strong>{userToDelete.email}</strong>
              </p>
              <p>
                Peranan: <span className="uppercase font-bold text-[10px] px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-700">{userToDelete.role}</span>
              </p>
            </div>

            <p className="text-xs text-stone-500">
              Adakah anda pasti mahu memadam akaun pengguna ini daripada pangkalan data?
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Padam Akaun</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        orders={orders}
        onSelectOrder={(order) => {
          setSelectedOrderForDetail(order);
          setActiveTab('orders');
        }}
      />
    </div>
  );
};

export default AdminPortal;
