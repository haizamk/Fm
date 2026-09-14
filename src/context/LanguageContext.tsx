import React, { createContext, useContext, useState } from 'react';
import { Product } from '../types';

export type Language = 'bm' | 'en';

export interface Translations {
  // Navigation & Header
  home: string;
  allProducts: string;
  catalog: string;
  searchPlaceholder: string;
  trackOrder: string;
  myPortal: string;
  adminPortal: string;
  login: string;
  logout: string;
  favorites: string;
  cart: string;
  points: string;
  tier: string;
  cancel: string;

  // Announcement Bar
  announcementText: string;
  whatsappHotline: string;
  freshGuarantee: string;
  checkCoverage: string;
  supportHelp: string;
  freshFromFarm: string;
  freeDeliveryHeadline: string;

  // Hero & Banners
  heroTagline: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroTitleSuffix: string;
  heroSubtitle: string;
  heroBadge: string;
  heroCtaOrder: string;
  heroCtaCoverage: string;
  heroCtaCalculator: string;
  enterPostcodePlaceholder: string;
  postcodeCheckBtn: string;
  halalCertifiedBadge: string;
  sameDayDeliveryBadge: string;
  freeCustomCutBadge: string;

  // Stock Urgency & Featured Section
  stockAlertTitle: string;
  stockAlertMsg: string;
  checkLimitedStockBtn: string;
  featuredSectionTag: string;
  featuredSectionTitle: string;
  featuredSectionSubtitle: string;
  viewAllProductsBtn: string;
  exploreAllCatalogBannerTitle: string;
  exploreAllCatalogBannerSubtitle: string;
  openCatalogBtn: string;

  // Product Card & Actions
  chooseCut: string;
  chooseWeightAndCut: string;
  selectVariation: string;
  quickAdd: string;
  outOfStock: string;
  notifyStock: string;
  savingBadge: string;
  pricePerKgLabel: string;
  remainingStock: string;
  popularChoice: string;
  freshDailyBadge: string;
  leftUnit: string;
  estimatedWeight: string;

  // Categories
  catAll: string;
  catWhole: string;
  catParts: string;
  catSpecial: string;
  catOrganic: string;
  catCombo: string;
  catMarinated: string;

  // Filter & Search (All Products Page)
  allProductsTitle: string;
  allProductsSubtitle: string;
  backToHomeBtn: string;
  filterPromoOnly: string;
  filterLowStock: string;
  filterFavorites: string;
  filterReset: string;
  noProductsFound: string;
  showAllProducts: string;
  filterAllTitle: string;
  filterAllSubtitle: string;
  sortByLabel: string;
  sortDefault: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  sortSavings: string;
  sortRating: string;
  backToHome: string;
  backToTop: string;
  productsFound: string;
  resetFilterBtn: string;
  noProductsFoundTitle: string;
  noProductsFoundDesc: string;

  // Cart & Mini Cart & Drawer
  cartTitle: string;
  cartEmptyTitle: string;
  cartEmptyDesc: string;
  startShoppingBtn: string;
  freeShippingPromo: string;
  freeShippingUnlocked: string;
  deliveryOptionLabel: string;
  deliveryOptionDelivery: string;
  deliveryOptionPickup: string;
  couponApplied: string;
  enterCouponPlaceholder: string;
  applyCouponBtn: string;
  subtotalLabel: string;
  deliveryFeeLabel: string;
  freeDeliveryLabel: string;
  discountLabel: string;
  totalPayableLabel: string;
  proceedToCheckoutBtn: string;
  continueShoppingBtn: string;
  clearCartBtn: string;
  swipeToDeleteHint: string;
  swipeToDeleteAction: string;
  maxUnitLimitTitle: string;
  maxUnitLimitDesc: string;
  whatsappBulkOrder: string;
  customNotesLabel: string;

  // Cut Modal
  chooseWeightStep: string;
  chooseCutStep: string;
  cleaningServicesStep: string;
  packagingStep: string;
  requiredChoice: string;
  freeCutOption: string;
  customNotesPlaceholder: string;
  quantityLabel: string;
  totalPriceLabel: string;
  addToCart: string;
  cutModalTitle: string;
  cutTypeHeading: string;
  weightHeading: string;
  cleaningHeading: string;
  packagingHeading: string;
  specialNotesHeading: string;
  specialNotesPlaceholder: string;
  quantityHeading: string;
  addToCartBtn: string;
  totalEstPrice: string;
  freeCutService: string;

  // Quality & Guarantees
  qualityPledge: string;
  whyChooseUsTitle: string;
  whyChooseUsSubtitle: string;
  guaranteeTitle: string;
  guaranteeSubtitle: string;
  guaranteeHalal: string;
  guaranteeHalalDesc: string;
  guaranteeFresh: string;
  guaranteeFreshDesc: string;
  guaranteeHygienic: string;
  guaranteeHygienicDesc: string;
  guaranteeFast: string;
  guaranteeFastDesc: string;

  // Reviews
  customerReviewsTitle: string;
  customerReviewsSubtitle: string;
  reviewsTitle: string;
  reviewsSubtitle: string;
  verifiedBuyer: string;

  // FAQ
  faqSectionTitle: string;
  faqTitle: string;
  faqSubtitle: string;

  // Orders & Portal
  orderHistory: string;
  orderHistorySubtitle: string;
  printReceipt: string;
  downloadReceiptPdf: string;
  sendReceiptWhatsapp: string;
  statusPending: string;
  statusInProcess: string;
  statusCompleted: string;
  allOrders: string;
  reorderBtn: string;
  cancelOrderBtn: string;

  // Footer & Common
  footerAboutTitle: string;
  footerAboutText: string;
  footerQuickLinks: string;
  footerContact: string;
  footerOperatingHours: string;
  footerCopyright: string;
  privacyPolicy: string;
  termsConditions: string;
}

const translations: Record<Language, Translations> = {
  bm: {
    home: 'Laman Utama',
    allProducts: 'Semua Produk',
    catalog: 'Katalog',
    searchPlaceholder: 'Cari ayam bulat, dada fillet, kepak, drumstick...',
    trackOrder: 'Jejak',
    myPortal: 'Portal Saya',
    adminPortal: 'Portal Admin',
    login: 'Log Masuk',
    logout: 'Log Keluar',
    favorites: 'Kegemaran',
    cart: 'Troli',
    points: 'Mata',
    tier: 'Tahap',
    cancel: 'Batal',

    announcementText: 'Pesan sebelum 11:00 PM untuk penghantaran segar esok!',
    whatsappHotline: 'Talian WhatsApp',
    freshGuarantee: '100% Halal Diiktiraf',
    checkCoverage: 'Semak Kawasan',
    supportHelp: 'Bantuan',
    freshFromFarm: 'Terus Dari Ladang',
    freeDeliveryHeadline: 'Percuma Penghantaran RM70+ ke Semenyih, Beranang & Kajang',

    heroTagline: 'DIPOTONG & DIBERSIHKAN MENGIKUT CITARASA ANDA',
    heroBadge: 'GA 59, Pasar Semenyih • Stok Ayam Segar Hari Ini',
    heroTitle: 'Ayam Segar Pasar Semenyih,',
    heroTitleHighlight: 'Bekalan Segar Awal Pagi',
    heroTitleSuffix: 'Ke Dapur Anda.',
    heroSubtitle: 'Bukan ayam sejuk beku lama. Bekalan ayam segar harian awal pagi dari gerai GA 59 Pasar Semenyih, dicuci bersih, dipotong percuma mengikut citarasa anda, dihantar ke rumah atau ambil sendiri (Self-Pickup).',
    heroCtaOrder: 'Pesan Ayam Segar Sekarang',
    heroCtaCoverage: 'Semak Kawasan Poskod',
    heroCtaCalculator: 'Kalkulator Jamuan',
    enterPostcodePlaceholder: 'Masukkan 5-digit poskod anda (cth: 43000)',
    postcodeCheckBtn: 'Semak Poskod',
    halalCertifiedBadge: '100% Halal Diiktiraf',
    sameDayDeliveryBadge: 'Penghantaran Segar Pantas',
    freeCustomCutBadge: 'Potongan Percuma',

    stockAlertTitle: 'Makluman Had Stok Ayam Segar Hari Ini',
    stockAlertMsg: 'produk ayam hampir kehabisan baki stok harian. Tempah awal untuk menjamin slot anda!',
    checkLimitedStockBtn: 'Semak Semua Stok Terhad',
    featuredSectionTag: '⭐ 6 PRODUK UTAMA PILIHAN RAMAI',
    featuredSectionTitle: 'Pilihan Utama Segar Setiap Hari',
    featuredSectionSubtitle: '6 produk ayam segar yang paling kerap ditempah oleh suri rumah & peniaga. Dipotong percuma mengikut citarasa masakan anda.',
    viewAllProductsBtn: 'Lihat Semua Produk',
    exploreAllCatalogBannerTitle: 'Ingin Terokai Semua Pilihan Ayam & Potongan?',
    exploreAllCatalogBannerSubtitle: 'Buka halaman katalog penuh untuk melihat pelbagai variasi ayam kampung, dada fillet, kepak, tulang sup, pek jimat dan ayam perap sedia masak (3 item setiap baris).',
    openCatalogBtn: 'Buka Katalog Keseluruhan Produk',

    chooseCut: 'Pilih Potong',
    chooseWeightAndCut: 'Pilih Berat & Potong',
    selectVariation: 'Pilih Variasi',
    quickAdd: 'Tambah Pantas',
    outOfStock: 'Habis Stok',
    notifyStock: 'Maklumkan Saya',
    savingBadge: 'Jimat',
    pricePerKgLabel: 'kg',
    remainingStock: 'Baki',
    popularChoice: 'Pilihan Ramai',
    freshDailyBadge: 'Segar Harian',
    leftUnit: 'tinggal',
    estimatedWeight: 'Anggaran berat',

    catAll: 'Semua Produk',
    catWhole: 'Ayam Seekor',
    catParts: 'Bahagian Ayam',
    catSpecial: 'Bahagian Khas',
    catOrganic: 'Ayam Kampung & Tua',
    catCombo: 'Pek Borong & Kombo',
    catMarinated: 'Ayam Perap Segar',

    allProductsTitle: 'Semua Koleksi Ayam Segar & Potongan',
    allProductsSubtitle: 'Pilih daripada variasi ayam bulat gred A, ayam kampung, bahagian dada, kepak, organ segar serta pesanan borong katering.',
    backToHomeBtn: 'Kembali ke Utama',
    filterPromoOnly: 'Promosi / Jimat',
    filterLowStock: 'Stok Terhad',
    filterFavorites: 'Kegemaran',
    filterReset: 'Set Semula',
    noProductsFound: 'Tiada produk yang sepadan dengan carian atau penapis anda.',
    showAllProducts: 'Papar Semua Produk',
    filterAllTitle: 'Semua Produk Ayam Segar',
    filterAllSubtitle: 'Katalog lengkap pilihan ayam segar Pasar Semenyih dengan servis pemotongan percuma.',
    sortByLabel: 'Susun Mengikut:',
    sortDefault: 'Pilihan Standard',
    sortPriceAsc: 'Harga: Rendah ke Tinggi',
    sortPriceDesc: 'Harga: Tinggi ke Rendah',
    sortSavings: 'Penjimatan Tertinggi',
    sortRating: 'Penilaian Terbaik',
    backToHome: 'Kembali ke Laman Utama',
    backToTop: 'Kembali ke Atas',
    productsFound: 'produk dijumpai',
    resetFilterBtn: 'Set Semula Penapis',
    noProductsFoundTitle: 'Tiada Produk Dijumpai',
    noProductsFoundDesc: 'Cuba tukar carian atau kategori untuk melihat pilihan ayam segar yang lain.',

    cartTitle: 'Troli Pesanan Ayam Segar',
    cartEmptyTitle: 'Troli Anda Masih Kosong',
    cartEmptyDesc: 'Belum ada sebarang ayam segar dipilih. Layari katalog produk kami dan pilih gaya potongan kegemaran anda.',
    startShoppingBtn: 'Mula Memilih Ayam Segar',
    freeShippingPromo: 'Tambah lagi RM{amount} untuk menikmati Percuma Penghantaran!',
    freeShippingUnlocked: 'Tahniah! Anda telah layak menerima Percuma Penghantaran ke Semenyih & Beranang!',
    deliveryOptionLabel: 'Kaedah Penerimaan:',
    deliveryOptionDelivery: 'Penghantaran ke Rumah',
    deliveryOptionPickup: 'Ambil Sendiri (Pasar Semenyih)',
    couponApplied: 'Baucar Berjaya Digunakan:',
    enterCouponPlaceholder: 'Kod Baucar (cth: FREESHIP)',
    applyCouponBtn: 'Tebus',
    subtotalLabel: 'Jumlah Nilai Ayam:',
    deliveryFeeLabel: 'Caj Penghantaran:',
    freeDeliveryLabel: 'Percuma',
    discountLabel: 'Diskaun Baucar:',
    totalPayableLabel: 'Jumlah Perlu Dibayar:',
    proceedToCheckoutBtn: 'Teruskan ke Bayaran',
    continueShoppingBtn: 'Tambah Lagi Produk',
    clearCartBtn: 'Kosongkan Troli',
    swipeToDeleteHint: 'Leret item ke kiri untuk padam',
    swipeToDeleteAction: 'Padam',
    maxUnitLimitTitle: 'Had Kuantiti Maksimum (30 Unit)',
    maxUnitLimitDesc: 'Bagi memastikan kesegaran semasa penghantaran rider, pesanan runcit dihadkan sehingga 30 unit bagi satu trip penghantaran.',
    whatsappBulkOrder: 'Tempahan Kenduri / Katering WhatsApp',
    customNotesLabel: 'Nota Khas Untuk Tukang Potong (Pilihan)',

    chooseWeightStep: 'Pilihan Berat Ayam & Kuantiti',
    chooseCutStep: 'Pilih Gaya Potongan',
    cleaningServicesStep: 'Servis Pembersihan Khas (Boleh Pilih Lebih)',
    packagingStep: 'Pilihan Pembungkusan Kesegaran',
    requiredChoice: 'Wajib Pilih 1',
    freeCutOption: 'Potong Percuma (RM0)',
    customNotesPlaceholder: 'Contoh: Tolong asingkan kaki, potong buang lemak lebihan, atau bungkus berasingan...',
    quantityLabel: 'Kuantiti',
    totalPriceLabel: 'Jumlah Harga',
    addToCart: 'Masukkan ke Troli',
    cutModalTitle: 'Pilihan Potongan & Kebersihan',
    cutTypeHeading: 'Gaya Potongan (Percuma)',
    weightHeading: 'Pilihan Berat Ayam',
    cleaningHeading: 'Servis Pembersihan Khas',
    packagingHeading: 'Jenis Pembungkusan Kesegaran',
    specialNotesHeading: 'Nota Khas Untuk Tukang Potong',
    specialNotesPlaceholder: 'Contoh: Tolong asingkan kepala & kaki, buang lebihan lemak...',
    quantityHeading: 'Kuantiti Pesanan',
    addToCartBtn: 'Masukkan ke Troli',
    totalEstPrice: 'Anggaran Jumlah Harga:',
    freeCutService: 'Khidmat Potongan & Cuci Percuma',

    qualityPledge: 'Janji & Kualiti Kami',
    whyChooseUsTitle: 'Mengapa Memilih Khairul FRESH Food?',
    whyChooseUsSubtitle: 'Komitmen kami ialah membawa kualiti ayam segar gerai GA 59 Pasar Semenyih terus ke dapur rumah anda dengan tahap kebersihan dan kesucian tertinggi.',
    guaranteeTitle: 'Jaminan Kualiti Khairul FRESH Food',
    guaranteeSubtitle: 'Komitmen kami membekalkan ayam segar berkualiti terbaik terus dari Pasar Semenyih ke pintu rumah anda.',
    guaranteeHalal: '100% Halal Diiktiraf',
    guaranteeHalalDesc: 'Disahkan Halal, disembelih mengikut syarak dan dibersihkan dengan air mengalir suci.',
    guaranteeFresh: 'Suhu Sejuk Dingin (0°C – 4°C)',
    guaranteeFreshDesc: 'Bukan ayam beku lama. Rantaian dingin terpelihara dari pasar ke dapur anda.',
    guaranteeHygienic: 'Potongan & Pembersihan Percuma',
    guaranteeHygienicDesc: 'Tukang potong mahir membuang sisa kotoran, bulu halus dan lemak mengikut citarasa anda.',
    guaranteeFast: 'Jaminan Ganti 1-ke-1 Segera',
    guaranteeFastDesc: 'Jika tidak segar atau tidak menepati pesanan, kami ganti baru serta-merta tanpa soal.',

    customerReviewsTitle: 'Kata Pelanggan Khairul FRESH Food',
    customerReviewsSubtitle: 'Ayam segar berkualiti dihantar dengan pantas ke kediaman & restoran di kawasan Semenyih, Kajang dan Beranang.',
    reviewsTitle: 'Ulasan & Maklum Balas Pelanggan',
    reviewsSubtitle: 'Kepuasan pelanggan di Semenyih, Beranang dan Kajang adalah keutamaan kami.',
    verifiedBuyer: 'Pembeli Disahkan',

    faqSectionTitle: 'Soalan Lazim (FAQ)',
    faqTitle: 'Segala Jawapan Tentang Ayam Segar Kami',
    faqSubtitle: 'Ketahui lebih lanjut mengenai cara kami memproses, memotong, membungkus dan menghantar ayam segar terus ke pintu rumah anda.',

    orderHistory: 'Sejarah Pesanan',
    orderHistorySubtitle: 'Semua rekod pesanan ayam segar anda beserta status proses dan resit rasmi.',
    printReceipt: 'Cetak Resit',
    downloadReceiptPdf: 'Muat Turun Resit (PDF)',
    sendReceiptWhatsapp: 'Hantar Resit ke WhatsApp',
    statusPending: 'Menunggu',
    statusInProcess: 'Dalam Proses',
    statusCompleted: 'Selesai',
    allOrders: 'Semua Pesanan',
    reorderBtn: 'Pesan Semula',
    cancelOrderBtn: 'Batalkan Pesanan',

    footerAboutTitle: 'Tentang Khairul FRESH Food',
    footerAboutText: 'Membekalkan ayam segar berkualiti tinggi dari Gerai Ayam No 59, Pasar Sementara Semenyih terus ke kediaman anda.',
    footerQuickLinks: 'Pautan Pantas',
    footerContact: 'Hubungi Kami',
    footerOperatingHours: 'Waktu Operasi Pasar',
    footerCopyright: 'Hak Cipta Terpelihara',
    privacyPolicy: 'Dasar Privasi',
    termsConditions: 'Terma & Syarat',
  },
  en: {
    home: 'Home',
    allProducts: 'All Products',
    catalog: 'Catalog',
    searchPlaceholder: 'Search whole chicken, breast fillet, wings, drumsticks...',
    trackOrder: 'Track',
    myPortal: 'My Account',
    adminPortal: 'Admin Portal',
    login: 'Login',
    logout: 'Logout',
    favorites: 'Favorites',
    cart: 'Cart',
    points: 'Points',
    tier: 'Tier',
    cancel: 'Cancel',

    announcementText: 'Order before 11:00 PM for fresh morning delivery tomorrow!',
    whatsappHotline: 'WhatsApp Hotline',
    freshGuarantee: '100% Certified Halal',
    checkCoverage: 'Check Coverage',
    supportHelp: 'Help & FAQ',
    freshFromFarm: 'Direct from Farm',
    freeDeliveryHeadline: 'Free Delivery on Orders RM70+ to Semenyih, Beranang & Kajang',

    heroTagline: 'CUSTOM BUTCHERY & CLEANED TO YOUR PREFERENCE',
    heroBadge: 'GA 59, Pasar Semenyih • Fresh Daily Stock',
    heroTitle: 'Fresh Poultry from Pasar Semenyih,',
    heroTitleHighlight: 'Early Morning Daily Supply',
    heroTitleSuffix: 'Direct To Your Kitchen.',
    heroSubtitle: 'Never months-old frozen poultry. Fresh morning batches from Stall GA 59 Pasar Semenyih, thoroughly cleaned, custom cut free of charge, delivered to your door or available for store pickup.',
    heroCtaOrder: 'Order Fresh Chicken Now',
    heroCtaCoverage: 'Check Postcode Coverage',
    heroCtaCalculator: 'Feast & Catering Calculator',
    enterPostcodePlaceholder: 'Enter your 5-digit postcode (e.g. 43000)',
    postcodeCheckBtn: 'Check Postcode',
    halalCertifiedBadge: '100% Certified Halal',
    sameDayDeliveryBadge: 'Fast Chilled Delivery',
    freeCustomCutBadge: 'Free Custom Cuts',

    stockAlertTitle: 'Daily Fresh Stock Limit Alert',
    stockAlertMsg: 'chicken items are running low on daily stock. Order early to guarantee your slot!',
    checkLimitedStockBtn: 'View All Limited Stock',
    featuredSectionTag: '⭐ 6 POPULAR FRESH PICKS',
    featuredSectionTitle: 'Top Daily Fresh Selections',
    featuredSectionSubtitle: '6 most popular fresh poultry choices ordered by families and caterers. Prepared with complimentary cuts to your recipe.',
    viewAllProductsBtn: 'View All Products',
    exploreAllCatalogBannerTitle: 'Want to Explore All Poultry Cuts & Options?',
    exploreAllCatalogBannerSubtitle: 'Browse our full catalog for free-range chicken, breast fillets, wings, soup bones, value combos, and ready-to-cook marinated meats (3 items per row).',
    openCatalogBtn: 'Open Full Product Catalog',

    chooseCut: 'Choose Cut',
    chooseWeightAndCut: 'Choose Weight & Cut',
    selectVariation: 'Select Option',
    quickAdd: 'Quick Add',
    outOfStock: 'Out of Stock',
    notifyStock: 'Notify Me',
    savingBadge: 'Save',
    pricePerKgLabel: 'kg',
    remainingStock: 'Left',
    popularChoice: 'Popular Pick',
    freshDailyBadge: 'Daily Fresh',
    leftUnit: 'left',
    estimatedWeight: 'Est. weight',

    catAll: 'All Products',
    catWhole: 'Whole Chicken',
    catParts: 'Chicken Parts',
    catSpecial: 'Special Parts',
    catOrganic: 'Kampung & Mature',
    catCombo: 'Wholesale & Combos',
    catMarinated: 'Marinated Ready',

    allProductsTitle: 'All Fresh Poultry & Cuts Collection',
    allProductsSubtitle: 'Select from fresh whole Grade A chicken, free-range kampung, breast fillets, wings, fresh organs, and wholesale catering packs.',
    backToHomeBtn: 'Back to Home',
    filterPromoOnly: 'Promo / Savings',
    filterLowStock: 'Limited Stock',
    filterFavorites: 'Favorites',
    filterReset: 'Reset Filter',
    noProductsFound: 'No products matched your search or filters.',
    showAllProducts: 'Show All Products',
    filterAllTitle: 'All Fresh Poultry Products',
    filterAllSubtitle: 'Full catalog of Pasar Semenyih fresh poultry with complimentary butchery services.',
    sortByLabel: 'Sort By:',
    sortDefault: 'Featured Standard',
    sortPriceAsc: 'Price: Low to High',
    sortPriceDesc: 'Price: High to Low',
    sortSavings: 'Highest Savings',
    sortRating: 'Top Rated',
    backToHome: 'Back to Home',
    backToTop: 'Back to Top',
    productsFound: 'products found',
    resetFilterBtn: 'Reset Filters',
    noProductsFoundTitle: 'No Products Found',
    noProductsFoundDesc: 'Try adjusting your search keywords or category filters to explore more options.',

    cartTitle: 'Fresh Poultry Cart',
    cartEmptyTitle: 'Your Cart is Currently Empty',
    cartEmptyDesc: 'No fresh poultry items added yet. Browse our catalog and customize your favorite cuts.',
    startShoppingBtn: 'Start Shopping Fresh Chicken',
    freeShippingPromo: 'Add RM{amount} more to unlock Free Delivery!',
    freeShippingUnlocked: 'Congrats! You have unlocked Free Delivery to Semenyih & Beranang!',
    deliveryOptionLabel: 'Fulfillment Method:',
    deliveryOptionDelivery: 'Home Doorstep Delivery',
    deliveryOptionPickup: 'Store Self-Pickup (Pasar Semenyih)',
    couponApplied: 'Coupon Applied Successfully:',
    enterCouponPlaceholder: 'Promo code (e.g. FREESHIP)',
    applyCouponBtn: 'Apply',
    subtotalLabel: 'Poultry Subtotal:',
    deliveryFeeLabel: 'Delivery Fee:',
    freeDeliveryLabel: 'Free',
    discountLabel: 'Voucher Discount:',
    totalPayableLabel: 'Total Payable:',
    proceedToCheckoutBtn: 'Proceed to Checkout',
    continueShoppingBtn: 'Continue Shopping',
    clearCartBtn: 'Clear Cart',
    swipeToDeleteHint: 'Swipe item left to remove',
    swipeToDeleteAction: 'Delete',
    maxUnitLimitTitle: 'Maximum Order Limit (30 Units)',
    maxUnitLimitDesc: 'To ensure chilled freshness during delivery, retail orders are capped at 30 units per trip.',
    whatsappBulkOrder: 'Catering / Large Wholesale WhatsApp',
    customNotesLabel: 'Butcher Special Instructions (Optional)',

    chooseWeightStep: 'Chicken Weight & Stock Selection',
    chooseCutStep: 'Choose Custom Cut Style',
    cleaningServicesStep: 'Special Cleaning Services (Multi-select)',
    packagingStep: 'Freshness Packaging Option',
    requiredChoice: '1 Required',
    freeCutOption: 'Free Cut (RM0)',
    customNotesPlaceholder: 'E.g. Separate feet, remove excess fat, or pack separately...',
    quantityLabel: 'Quantity',
    totalPriceLabel: 'Total Price',
    addToCart: 'Add to Cart',
    cutModalTitle: 'Butchery & Cleaning Options',
    cutTypeHeading: 'Custom Cut Style (Free)',
    weightHeading: 'Poultry Weight Selection',
    cleaningHeading: 'Special Cleaning Services',
    packagingHeading: 'Freshness Packaging Type',
    specialNotesHeading: 'Special Instructions for Butcher',
    specialNotesPlaceholder: 'E.g. Please separate head & feet, trim excess skin...',
    quantityHeading: 'Order Quantity',
    addToCartBtn: 'Add to Cart',
    totalEstPrice: 'Estimated Total Price:',
    freeCutService: 'Free Butchery & Cleaning Included',

    qualityPledge: 'Our Quality Pledge',
    whyChooseUsTitle: 'Why Choose Khairul FRESH Food?',
    whyChooseUsSubtitle: 'Our commitment is bringing the freshness of Poultry Stall GA 59, Pasar Semenyih straight to your kitchen with top hygiene and purity standards.',
    guaranteeTitle: 'Khairul FRESH Food Quality Guarantees',
    guaranteeSubtitle: 'Our unwavering commitment to delivering pristine poultry from Pasar Semenyih to your door.',
    guaranteeHalal: '100% Certified Halal',
    guaranteeHalalDesc: 'Strictly Halal certified, processed according to Islamic rites with pure running water.',
    guaranteeFresh: 'Chilled Cold Chain (0°C – 4°C)',
    guaranteeFreshDesc: 'Never old frozen meat. Chilled temperature maintained from market to your kitchen.',
    guaranteeHygienic: 'Free Butchery & Cleaning',
    guaranteeHygienicDesc: 'Expert butchers remove debris, fine feathers and unwanted fat to your liking.',
    guaranteeFast: '1-to-1 Instant Replacement',
    guaranteeFastDesc: 'If not fresh or not up to standard, we replace it instantly with no questions asked.',

    customerReviewsTitle: 'What Our Customers Say',
    customerReviewsSubtitle: 'Fresh quality poultry delivered promptly to homes and eateries across Semenyih, Kajang, and Beranang.',
    reviewsTitle: 'Customer Reviews & Feedback',
    reviewsSubtitle: 'Serving happy households and eateries in Semenyih, Beranang, and Kajang.',
    verifiedBuyer: 'Verified Purchase',

    faqSectionTitle: 'Frequently Asked Questions (FAQ)',
    faqTitle: 'Everything You Need to Know About Our Fresh Poultry',
    faqSubtitle: 'Learn how we process, cut, package, and deliver fresh poultry straight to your home.',

    orderHistory: 'Order History',
    orderHistorySubtitle: 'All your fresh poultry order records with live process status and official receipts.',
    printReceipt: 'Print Receipt',
    downloadReceiptPdf: 'Download Receipt (PDF)',
    sendReceiptWhatsapp: 'Send Receipt to WhatsApp',
    statusPending: 'Pending',
    statusInProcess: 'In Process',
    statusCompleted: 'Completed',
    allOrders: 'All Orders',
    reorderBtn: 'Reorder',
    cancelOrderBtn: 'Cancel Order',

    footerAboutTitle: 'About Khairul FRESH Food',
    footerAboutText: 'Supplying premium daily fresh chicken from Poultry Stall No 59, Pasar Sementara Semenyih direct to your home.',
    footerQuickLinks: 'Quick Links',
    footerContact: 'Contact Us',
    footerOperatingHours: 'Market Operating Hours',
    footerCopyright: 'All Rights Reserved',
    privacyPolicy: 'Privacy Policy',
    termsConditions: 'Terms & Conditions',
  },
};

const PRODUCT_EN_MAP: Record<string, Partial<Product>> = {
  'ayam-bulat-segar-gred-a': {
    name: 'Fresh Whole Chicken Grade A (Standard)',
    subtitle: 'Daily Morning Supply • Free Cuts',
    description: 'Fresh Grade A broiler chicken supplied daily from vetted farms. Cleaned, gutted, and custom-cut free of charge.',
    freshnessType: 'Fresh Early Dawn Supply',
    tags: ['Whole Chicken', 'Grade A', 'Free Cuts', 'Daily Fresh'],
  },
  'ayam-kampung-asli': {
    name: 'Authentic Free-Range Village Chicken (Ayam Kampung)',
    subtitle: 'Firm Texture • Sweet Natural Broth',
    description: 'Authentic free-range kampung chicken raised naturally. Leaner, lower fat, firm meat texture, and flavorful sweet broth.',
    freshnessType: 'Fresh Early Dawn Chicken',
    tags: ['Whole Chicken', 'Ayam Kampung', 'Low Fat', 'Herbal Soup'],
  },
  'ayam-tua-segar': {
    name: 'Fresh Mature Stewing Hen (Ayam Tua / Pencen)',
    subtitle: 'Rich Savory Broth • Ideal for Rendang & Soto',
    description: 'Mature chicken with rich bone marrow essence and flavorful meat. Requires longer simmering for signature festive rendang, soto, and deep chicken broth.',
    freshnessType: 'Fresh Daily Supply',
    tags: ['Whole Chicken', 'Mature Chicken', 'Festive Rendang', 'Soup Broth'],
  },
  'dada-ayam-fillet': {
    name: 'Boneless Skinless Chicken Breast Fillet',
    subtitle: '100% Lean Protein • 1kg Pack',
    description: 'Premium skinless and boneless chicken breast fillet. High pure protein, trimmed cleanly, ideal for fitness meals, satay skewers, or stir-fries.',
    freshnessType: 'Chilled Fresh (0-4°C)',
    tags: ['Chicken Parts', 'Breast Fillet', 'High Protein', 'Fitness Diet'],
  },
  'peha-ayam-whole-leg': {
    name: 'Fresh Chicken Whole Leg (Thigh + Drumstick)',
    subtitle: 'Juicy & Tender • 1kg Pack',
    description: 'Fresh chicken whole legs combining juicy thigh and tender drumstick. Ideal for chicken chop, oven roasting, nasi kukus berempah, or smoky BBQ grilling.',
    freshnessType: 'Chilled Fresh (0-4°C)',
    tags: ['Chicken Parts', 'Whole Leg', 'Chicken Chop', 'BBQ Grill'],
  },
  'kepak-ayam-segar': {
    name: 'Fresh Chicken Wings (Full Wing)',
    subtitle: 'Crispy & Succulent • 1kg Pack',
    description: 'Whole chicken wings including drumette and mid-wing. Perfect for honey soy glaze, buffalo wings, crispy spiced fried chicken, or grilling.',
    freshnessType: 'Chilled Fresh (0-4°C)',
    tags: ['Chicken Parts', 'Wings', 'Honey BBQ', 'Fried Chicken'],
  },
  'drumstick-peha-bawah': {
    name: 'Fresh Chicken Drumsticks',
    subtitle: 'Family & Kids Favorite • 1kg Pack',
    description: 'Tender and juicy drumsticks, freshly cleaned and trimmed. Highly popular for fried chicken, aromatic curry, and kids lunch boxes.',
    freshnessType: 'Chilled Fresh (0-4°C)',
    tags: ['Chicken Parts', 'Drumstick', 'Kids Favorite', 'Crispy Fry'],
  },
  'hati-pedal-ayam-segar': {
    name: 'Fresh Chicken Gizzard & Liver (Hati & Pedal)',
    subtitle: 'Cleaned Daily • 500g Pack',
    description: 'Fresh chicken gizzards and livers, meticulously cleaned and prepared. Delicious when cooked sambal berlada, stir-fried with turmeric and long beans, or spiced rendang.',
    freshnessType: 'Chilled Fresh (0-4°C)',
    tags: ['Special Parts', 'Gizzard & Liver', 'Sambal Berlada', 'Fresh Organs'],
  },
  'kaki-ayam-segar': {
    name: 'Fresh Cleaned Chicken Feet (Kaki Ayam)',
    subtitle: 'Nails Trimmed • 500g Pack',
    description: 'Fresh chicken feet, thoroughly scalded, yellow skin removed and nails trimmed. Rich in natural collagen for clear herbal soups, dim sum, or spicy kerabu.',
    freshnessType: 'Chilled Fresh (0-4°C)',
    tags: ['Special Parts', 'Chicken Feet', 'Natural Collagen', 'Soup'],
  },
  'tulang-rangka-ayam': {
    name: 'Fresh Chicken Carcass / Soup Bones (Rangka)',
    subtitle: 'Natural Stock Essence • 500g Pack',
    description: 'Fresh chicken carcass from daily butchering. Packed with marrow and bone essence to produce rich, clear chicken broth, noodle soups, or curry bases.',
    freshnessType: 'Chilled Fresh (0-4°C)',
    tags: ['Chicken Parts', 'Soup Bones', '500g', 'Stock Base'],
  },
  'kombo-jimat-keluarga-sihat': {
    name: 'Healthy Family Value Combo (3 Whole Chickens)',
    subtitle: 'Family Saver Pack • 3 Fresh Broiler Chickens',
    description: 'Our most economical value combo for family weekly meal prep. Contains 3 fresh Standard Grade A chickens (~5kg total). Custom cuts and cleaning for each chicken.',
    freshnessType: 'Fresh Early Dawn Chicken',
    tags: ['Value Combo', 'Best Saver', '3 Chickens', 'Weekly Stock'],
  },
};

const CUT_EN_MAP: Record<string, { label: string; description: string; recommendedFor?: string }> = {
  'seekor-bulat': {
    label: 'Whole Chicken (Uncut)',
    description: 'Ideal for whole oven roasting, rotisserie, or cutting at home.',
    recommendedFor: 'Roast / BBQ',
  },
  'potong-4': {
    label: 'Cut into 4 Quarters',
    description: 'Ideal for Ayam Percik, Oven Roasting, Smoke BBQ, Nasi Ayam, and Ayam Gepuk.',
    recommendedFor: 'Ayam Percik / Roast',
  },
  'potong-8': {
    label: 'Cut into 8 Pieces',
    description: 'Standard family cut. Perfect for Spiced Fried Chicken (Ayam Berempah) & Festive Rendang.',
    recommendedFor: 'Fried / Rendang',
  },
  'potong-12': {
    label: 'Cut into 12 Pieces (Most Popular)',
    description: 'Medium versatile pieces for thick chicken curry, spicy sambal, or Masak Lemak Cili Padi.',
    recommendedFor: 'Curry / Sambal',
  },
  'potong-16': {
    label: 'Cut into 16 Small Pieces',
    description: 'Smaller bite-sized pieces, marinates quickly, perfect for soups, soto, and stir-fries.',
    recommendedFor: 'Soup / Soto / Kenduri',
  },
  'kaki-tak-potong-kuku': {
    label: 'Whole Feet (Nails Trimmed Only)',
    description: 'Thoroughly cleaned with nails trimmed off, kept whole.',
  },
  'kaki-potong-dua-buang-kuku': {
    label: 'Cut into 2 & Nails Trimmed',
    description: 'Nails trimmed and feet sliced into 2 pieces for easy soup cooking.',
  },
  'rangka-tak-potong': {
    label: 'Whole Carcass (Uncut)',
    description: 'Left intact for large soup stock pots.',
  },
  'rangka-potong-dua': {
    label: 'Cut into 2 Halves',
    description: 'Carcass cut into two equal halves.',
  },
  'rangka-potong-kecil': {
    label: 'Cut into Small Pieces',
    description: 'Carcass chopped into small soup bones for dense broths.',
  },
  'dada-tidak-dipotong': {
    label: 'Whole Breast Fillet (Uncut)',
    description: 'Kept whole for chicken schnitzel, steaks, or custom slicing.',
  },
  'dada-potong-kiub': {
    label: 'Cut into Cubes / Diced',
    description: 'Precision cubed breast meat, ready for satay, skewers, or meal-prep.',
  },
  'whole-leg-tidak-dipotong': {
    label: 'Whole Leg (Thigh & Drumstick intact)',
    description: 'Kept whole for classic chicken chops, roasting, or grilling.',
  },
  'whole-leg-potong-2': {
    label: 'Cut into 2 Pieces (Thigh & Drumstick separated)',
    description: 'Separated cleanly into one thigh and one drumstick piece.',
  },
  'whole-leg-potong-3': {
    label: 'Cut into 3 Smaller Pieces',
    description: 'Sectioned into 3 pieces for quick cooking and curries.',
  },
};

const CLEANING_EN_MAP: Record<string, { label: string; description: string }> = {
  'buang-lemak': {
    label: 'Trim Excess Fat',
    description: 'Remove visible yellow fat layers around thighs and skin.',
  },
  'buang-kulit': {
    label: 'Remove Skin (Skinless)',
    description: 'Skin peeled cleanly for healthy, low-cholesterol meals.',
  },
  'cuci-bersih': {
    label: 'Sanitary Deep Rinse',
    description: 'Thoroughly washed with filtered tap water, drained dry before packing.',
  },
  'asingkan-organ': {
    label: 'Pack Internal Organs Separately',
    description: 'Liver, gizzard and heart packed into a separate mini pouch.',
  },
  'asingkan-tongkeng': {
    label: "Remove Chicken Tail (Pope's Nose)",
    description: 'Oil gland and tail portion trimmed off completely.',
  },
  'buang-lemak-kulit': {
    label: 'Remove Skin & Excess Fat',
    description: 'Skin peeled and yellow fat layers trimmed thoroughly.',
  },
  'asingkan-kaki-kepala': {
    label: 'Separate Head & Feet Pack',
    description: 'Head and feet packed into a separate bag from meat.',
  },
  'potong-tongkeng': {
    label: 'Trim Oil Gland / Tail',
    description: 'Oil gland trimmed off completely.',
  },
};

const PACKAGING_EN_MAP: Record<string, { label: string; description: string }> = {
  'bungkusan-biasa-ais': {
    label: 'Standard Ice-Chilled Food Pack',
    description: 'Food-grade bag packed with fresh ice for same-day delivery.',
  },
  'vacuum-pack': {
    label: 'Vacuum-Sealed Airtight Pack (+RM1.00)',
    description: 'Locks in juices up to 3x longer and prevents freezer burn.',
  },
  'cooler-box': {
    label: 'Insulated Thermal Cooler Box (+RM5/10)',
    description: 'Heavy duty insulated foam box with ice blocks for long distance freshness.',
  },
  'standard-plastik': {
    label: 'Standard Eco Food Grade Plastic (Free)',
    description: 'Clean food-grade bag for same-day cooking.',
  },
  'ziplock-kedap-udara': {
    label: 'Zip-Lock Freezer Bag (+RM0.50)',
    description: 'Heavy duty seal bag to prevent freezer burn.',
  },
  'pek-vakum': {
    label: 'Vacuum-Sealed Pack (+RM1.00)',
    description: 'Airtight vacuum seal for long lasting freezer shelf life.',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof Translations, fallback?: string) => string;
  isEn: boolean;
  tProduct: (product: Product) => { name: string; subtitle?: string; description?: string; freshnessType?: string; tags?: string[] };
  tCut: (cutId: string, fallbackLabel?: string, fallbackDescription?: string, fallbackRecommended?: string) => { label: string; description: string; recommendedFor?: string };
  tCleaning: (cleaningId: string, fallbackLabel?: string) => { label: string; description?: string };
  tPackaging: (pkgId: string, fallbackLabel?: string, fallbackDescription?: string) => { label: string; description: string };
  tCategoryName: (catId: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'khairul_fresh_lang_v1';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'bm' || saved === 'en') {
        return saved;
      }
    } catch {
      // LocalStorage access fallback
    }
    return 'bm';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'bm' ? 'en' : 'bm');
  };

  const t = (key: keyof Translations, fallback?: string): string => {
    const currentDict = translations[language];
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }
    if (fallback) return fallback;
    return translations.bm[key] || String(key);
  };

  const tProduct = (product: Product) => {
    if (language === 'en' && PRODUCT_EN_MAP[product.id]) {
      const mapping = PRODUCT_EN_MAP[product.id];
      return {
        name: mapping.name || product.name,
        subtitle: mapping.subtitle || product.subtitle,
        description: mapping.description || product.description,
        freshnessType: mapping.freshnessType || product.freshnessType,
        tags: mapping.tags || product.tags,
      };
    }
    return {
      name: product.name,
      subtitle: product.subtitle,
      description: product.description,
      freshnessType: product.freshnessType,
      tags: product.tags,
    };
  };

  const tCut = (cutId: string, fallbackLabel?: string, fallbackDescription?: string, fallbackRecommended?: string) => {
    if (language === 'en' && CUT_EN_MAP[cutId]) {
      return {
        label: CUT_EN_MAP[cutId].label,
        description: CUT_EN_MAP[cutId].description,
        recommendedFor: CUT_EN_MAP[cutId].recommendedFor || fallbackRecommended,
      };
    }
    return {
      label: fallbackLabel || cutId,
      description: fallbackDescription || '',
      recommendedFor: fallbackRecommended,
    };
  };

  const tCleaning = (cleaningId: string, fallbackLabel?: string) => {
    if (language === 'en' && CLEANING_EN_MAP[cleaningId]) {
      return CLEANING_EN_MAP[cleaningId];
    }
    return {
      label: fallbackLabel || cleaningId,
      description: '',
    };
  };

  const tPackaging = (pkgId: string, fallbackLabel?: string, fallbackDescription?: string) => {
    if (language === 'en' && PACKAGING_EN_MAP[pkgId]) {
      return PACKAGING_EN_MAP[pkgId];
    }
    return {
      label: fallbackLabel || pkgId,
      description: fallbackDescription || '',
    };
  };

  const tCategoryName = (catId: string) => {
    if (catId === 'semua' || catId === 'all') return t('catAll');
    if (catId === 'ayam-seekor') return t('catWhole');
    if (catId === 'bahagian-ayam') return t('catParts');
    if (catId === 'bahagian-khas') return t('catSpecial');
    if (catId === 'ayam-kampung') return t('catOrganic');
    if (catId === 'kombo-jimat') return t('catCombo');
    if (catId === 'ayam-perap') return t('catMarinated');
    return catId;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isEn: language === 'en',
        tProduct,
        tCut,
        tCleaning,
        tPackaging,
        tCategoryName,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
