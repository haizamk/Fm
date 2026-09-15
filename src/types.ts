export type ChickenCutId = 
  | 'seekor-bulat'
  | 'potong-4'
  | 'potong-8'
  | 'potong-12'
  | 'potong-16'
  | 'utuh-tak-potong'
  | 'cincang-kasar'
  | 'cincang-halus'
  | 'belah-dua'
  | 'buang-tulang'
  | 'kaki-tak-potong-kuku'
  | 'kaki-potong-dua-buang-kuku'
  | 'rangka-tak-potong'
  | 'rangka-potong-dua'
  | 'rangka-potong-kecil'
  | string;

export interface ChickenCutOption {
  id: ChickenCutId;
  label: string;
  description: string;
  recommendedFor?: string;
  popular?: boolean;
}

export type CleaningOptionId = 
  | 'buang-lemak-kulit'
  | 'buang-tongkeng-ekor'
  | 'buang-kaki'
  | 'buang-hati-pedal'
  | 'standard-bersih'
  | 'buang-lemak'
  | 'buang-kulit'
  | 'buang-ekor'
  | 'bersih-kuku-paruh'
  | 'buang-lemak-ekstra'
  | 'asingkan-pedal-hati'
  | 'buang-leher-tongkeng';

export interface CleaningOption {
  id: CleaningOptionId;
  label: string;
  description: string;
  price?: number;
}

export type PackagingOptionId = 
  | 'cooler-box'
  | 'bungkusan-biasa-ais'
  | 'standard-chilled' 
  | 'vacuum-pack' 
  | 'double-seal'
  | 'pek-kedap-udara'
  | 'asingkan-organ'
  | 'pek-standard';

export interface PackagingOption {
  id: PackagingOptionId;
  label: string;
  price: number;
  description: string;
  isDefault?: boolean;
  reminderNote?: string;
}

export type ProductCategory = 
  | 'semua'
  | 'ayam-seekor'
  | 'bahagian-ayam'
  | 'kombo-jimat'
  | 'ayam-bulat'
  | 'potongan'
  | 'bahagian-khas'
  | 'kampung-organik'
  | 'pek-jimat'
  | 'perapan-rempah';

export interface OrganVariationOption {
  id: string;
  label: string;
  price: number;
  unit: string;
}

export interface ProductWeightOption {
  id: string;
  weightLabel: string;
  price: number;
  originalPrice?: number;
  availableStock: number;
  isAvailable: boolean;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  unit: string;
  weightEstimate: string;
  image: string;
  badge?: string;
  badgeColor?: 'green' | 'amber' | 'red' | 'blue';
  rating: number;
  reviewsCount: number;
  description: string;
  inStock: boolean;
  supportsCutting: boolean;
  supportsCleaning?: boolean;
  defaultCut?: ChickenCutId;
  customCutOptions?: ChickenCutOption[];
  popular?: boolean;
  halalCertified: boolean;
  freshnessType: 'Segar Suhu Dingin (0-4°C)' | 'Segar Organik' | 'Perapan Segar' | 'Ayam Segar Harian' | 'Ayam Segar Awal Pagi' | string;
  tags: string[];
  dailyStockLimit?: number;
  remainingStock?: number;
  hasBakarOption?: boolean;
  bakarDefault?: 'tak-bakar' | 'bakar';
  hasOrganVariations?: boolean;
  organVariations?: OrganVariationOption[];
  hasWeightOptions?: boolean;
  weightOptions?: ProductWeightOption[];
}

export type LoyaltyTier = 'Gangsa' | 'Perak' | 'Emas' | 'Platinum';

export interface LoyaltyReward {
  id: string;
  title: string;
  pointsRequired: number;
  description: string;
  voucherCode: string;
  discountValue: number;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  selectedCut: ChickenCutId;
  selectedCleaning: CleaningOptionId[];
  packaging: PackagingOptionId;
  specialNotes?: string;
  itemTotalPrice: number;
  bakarOption?: 'bakar' | 'tak-bakar';
  organVariation?: string;
  organVariationLabel?: string;
  selectedWeightOption?: ProductWeightOption;
}

export type DeliverySlotId = 'pagi' | 'petang' | 'malam';

export interface DeliverySlot {
  id: DeliverySlotId;
  label: string;
  timeRange: string;
  description: string;
  badge?: string;
}

export interface CustomerDetails {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  postcode: string;
  city: string;
  state: string;
  fulfillmentType?: 'delivery' | 'pickup';
  pickupTime?: string;
  deliveryDate: string;
  deliverySlot: DeliverySlotId;
  paymentMethod: 'hitpay' | 'duitnow' | 'fpx' | 'cod' | 'whatsapp';
  hitpayReference?: string;
  hitpayPaymentId?: string;
  hitpayStatus?: 'completed' | 'pending' | 'failed';
  orderNotes?: string;
  deliveryInstructions?: string;
}

export interface OrderRecord {
  orderId: string;
  items: CartItem[];
  customer: CustomerDetails;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: 'menunggu_bayaran' | 'disahkan' | 'sembelih-potong' | 'pembungkusan-sejuk' | 'dalam-penghantaran' | 'selesai' | 'dibatalkan';
  createdAt: string;
  estimatedDeliveryText: string;
  fulfillmentType?: 'delivery' | 'pickup';
  pickupTime?: string;
  appliedCoupon?: string;
  packagingType?: 'bungkusan-biasa-ais' | 'cooler-box';
  coolerBoxFee?: number;
}

export type CouponDiscountType = 'fixed' | 'percentage' | 'delivery';

export interface CouponCode {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minSpend: number;
  maxDiscount?: number;
  description: string;
  isActive: boolean;
  expiryDate?: string;
  usageLimit?: number;
  usageCount: number;
  createdAt: string;
  category?: 'item' | 'delivery';
}

export interface CoverageArea {
  postcode: string;
  city: string;
  state: string;
  zone: string;
  deliveryFee: number;
  freeShippingMin: number;
  estimatedHours: string;
}

export type UserRole = 'customer' | 'admin';

export interface SavedAddress {
  id: string;
  label: string; // e.g. 'Rumah', 'Pejabat', 'Rumah Ibu'
  fullName: string;
  phone: string;
  address: string;
  postcode: string;
  city: string;
  state: string;
  isDefault?: boolean;
}

export interface UserAccount {
  id: string;
  username?: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  lastLogin?: string;
  loyaltyPoints?: number;
  totalSpent?: number;
  savedAddresses?: SavedAddress[];
  // Security & Verification fields
  twoFactorEnabled?: boolean;
  securityPin?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  // Notification & WhatsApp preferences
  whatsappUpdates?: boolean;
}

export interface StockAlertSubscription {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  channel: 'email' | 'whatsapp' | 'both';
  email?: string;
  phone?: string;
  createdAt: string;
  status: 'pending' | 'notified';
  notifiedAt?: string;
}

export interface DailySalesStat {
  date: string;
  formattedDate: string;
  revenue: number;
  orderCount: number;
  chickensSold: number;
  avgOrderValue: number;
}

export interface ProductSalesStat {
  productId: string;
  productName: string;
  category: ProductCategory;
  unitsSold: number;
  totalRevenue: number;
  stockRemaining: number;
}


export interface AuthSession {
  user: UserAccount;
  token: string;
  expiresAt: number;
}

export interface HitPayConfig {
  apiKey: string;
  salt: string;
  isSandbox: boolean;
  isActive: boolean;
  currency: 'MYR';
  merchantName: string;
  enabledMethods: ('fpx' | 'duitnow' | 'card' | 'grabpay' | 'tng' | 'shopeepay')[];
  webhookUrl?: string;
  redirectUrl?: string;
}

export interface ThermalReceiptSettings {
  showLogo: boolean;
  logoUrl?: string;
  promoText: string;
  showPromoText: boolean;
  storeName?: string;
  storeTagline?: string;
  storeAddress?: string;
  storePhone?: string;
  halalTag?: string;
  headerNotice?: string;
  footerNotes?: string;
  paperWidth?: '80mm' | '58mm';
  showCutDetails?: boolean;
  showPrices?: boolean;
}

export interface DuitNowBankConfig {
  bankName: string;
  accountName: string;
  accountNumber: string;
  orderReferenceGuide?: string;
  qrImageUrl?: string;
  isActive: boolean;
}

export interface SiteSettings {
  announcementText: string;
  announcementCutoffTime: string;
  freeShippingMinAmount: number;
  supportPhone: string;
  supportEmail: string;
  bannerNotice: string;
  isOrderingEnabled: boolean;
  guaranteeText: string;
  hitpayConfig?: HitPayConfig;
  duitnowConfig?: DuitNowBankConfig;
  fonnteConfig?: {
    token: string;
    adminPhone: string;
    autoNotifyAdmin: boolean;
    autoNotifyCustomer: boolean;
  };
  thermalReceiptSettings?: ThermalReceiptSettings;
  enableCoolerBoxOption?: boolean;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details: string;
  type: 'order' | 'product' | 'customer' | 'system' | 'security';
}

export interface RotationBannerItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  ctaText: string;
  ctaAction: 'catalog' | 'pickup' | 'cutting' | 'all-products' | 'whatsapp';
  bgColor: string;
  accentColor: string;
  icon: 'truck' | 'store' | 'scissors' | 'sparkles' | 'flame' | 'shield';
  imageUrl?: string;
  isActive: boolean;
  order: number;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  category?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  uploadedAt: string;
  uploadedBy?: string;
}

