import { Product } from '../types';

export interface DailySpecialSchedule {
  dayIndex: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayNameMs: string;
  dayNameEn: string;
  themeTitleMs: string;
  themeTitleEn: string;
  taglineMs: string;
  taglineEn: string;
  preferredProductIds: string[];
  discountAmount: number; // Discount off current price
  bonusPoints: number; // Extra loyalty points awarded
  bonusBadgeMs: string;
  bonusBadgeEn: string;
  promoPillMs: string;
  promoPillEn: string;
  bannerGradient: string;
}

export const DAILY_SPECIAL_SCHEDULES: Record<number, DailySpecialSchedule> = {
  // 0 = Ahad (Sunday)
  0: {
    dayIndex: 0,
    dayNameMs: 'Ahad',
    dayNameEn: 'Sunday',
    themeTitleMs: 'Tawaran Sup & Masakan Tradisi Ahad',
    themeTitleEn: 'Sunday Heritage & Soup Special',
    taglineMs: 'Pilihan terbaik untuk sup herba pekat, soto kenduri, dan stok tulang aroma tinggi sekeluarga.',
    taglineEn: 'The perfect choice for rich herbal soups, feasts, and savory family broths.',
    preferredProductIds: ['ayam-tua-pencen', 'kaki-ayam', 'rangka-ayam'],
    discountAmount: 1.50,
    bonusPoints: 50,
    bonusBadgeMs: 'Bonus +50 Mata Ganjaran & Cuci Percuma',
    bonusBadgeEn: 'Bonus +50 Loyalty Points & Free Clean',
    promoPillMs: 'Jimat RM1.50 / kg + Extra Points',
    promoPillEn: 'Save RM1.50 / kg + Extra Points',
    bannerGradient: 'from-amber-950 via-stone-900 to-amber-900',
  },
  // 1 = Isnin (Monday)
  1: {
    dayIndex: 1,
    dayNameMs: 'Isnin',
    dayNameEn: 'Monday',
    themeTitleMs: 'Segar Awal Minggu Organik',
    themeTitleEn: 'Monday Fresh Organic Kickoff',
    taglineMs: 'Mulakan minggu dengan sajian ayam kampung organik segar sihat tanpa suntikan hormon.',
    taglineEn: 'Kick off your week with hormone-free, wholesome organic farm-fresh village chicken.',
    preferredProductIds: ['ayam-kampung-organik', 'ayam-segar-standard'],
    discountAmount: 2.00,
    bonusPoints: 60,
    bonusBadgeMs: 'Diskaun Jimat RM2.00 & Potong Bebas',
    bonusBadgeEn: 'Save RM2.00 + Free Cutting',
    promoPillMs: 'Harga Istimewa Isnin (Jimat RM2.00)',
    promoPillEn: 'Special Monday Price (Save RM2.00)',
    bannerGradient: 'from-emerald-950 via-teal-950 to-stone-900',
  },
  // 2 = Selasa (Tuesday)
  2: {
    dayIndex: 2,
    dayNameMs: 'Selasa',
    dayNameEn: 'Tuesday',
    themeTitleMs: 'Pilihan Nasi Ayam & Juicy Whole Leg',
    themeTitleEn: 'Tuesday Nasi Ayam & Whole Leg Feast',
    taglineMs: 'Bahagian whole leg segar yang berjus, lembut dan penuh isi manis untuk makan tengah hari lazat.',
    taglineEn: 'Juicy, succulent fresh whole legs crafted for mouth-watering roasted chicken and chops.',
    preferredProductIds: ['whole-leg-segar', 'ayam-segar-standard'],
    discountAmount: 1.50,
    bonusPoints: 40,
    bonusBadgeMs: 'Diskaun RM1.50/kg + Potong Percuma',
    bonusBadgeEn: 'Discount RM1.50/kg + Free Cutting',
    promoPillMs: 'Paling Popular Hari Selasa',
    promoPillEn: 'Tuesday Bestseller',
    bannerGradient: 'from-amber-900 via-stone-900 to-emerald-950',
  },
  // 3 = Rabu (Wednesday)
  3: {
    dayIndex: 3,
    dayNameMs: 'Rabu',
    dayNameEn: 'Wednesday',
    themeTitleMs: 'Pek Sihat & Dada Fillet Tanpa Lemak',
    themeTitleEn: 'Wednesday Lean & Healthy Breast Fillet',
    taglineMs: 'Tinggi protein, rendah lemak. Dipotong dadu atau fillet nipis percuma untuk hidangan sihat.',
    taglineEn: 'High-protein, lean tender breast meat cleanly prepped and sliced for your active lifestyle.',
    preferredProductIds: ['dada-ayam-segar', 'ayam-kampung-organik'],
    discountAmount: 2.00,
    bonusPoints: 50,
    bonusBadgeMs: 'Diskaun RM2.00/kg & Potong Dadu Percuma',
    bonusBadgeEn: 'Discount RM2.00/kg + Free Dicing',
    promoPillMs: 'Pilihan Sihat & Diet (Jimat RM2.00)',
    promoPillEn: 'Healthy Diet Choice (Save RM2.00)',
    bannerGradient: 'from-cyan-950 via-stone-900 to-emerald-950',
  },
  // 4 = Khamis (Thursday)
  4: {
    dayIndex: 4,
    dayNameMs: 'Khamis',
    dayNameEn: 'Thursday',
    themeTitleMs: 'Pesta Kepak Madu & BBQ Crispy',
    themeTitleEn: 'Thursday BBQ Wings & Grill Special',
    taglineMs: 'Kepak ayam segar berkilat (drumette & wingette) pilihan nombor satu peminat goreng rangup dan BBQ.',
    taglineEn: 'Plump, glossy fresh wings ideal for crispy deep-fried honey wings and smoky skewers.',
    preferredProductIds: ['kepak-ayam-segar', 'whole-leg-segar'],
    discountAmount: 1.50,
    bonusPoints: 45,
    bonusBadgeMs: 'Bonus +45 Mata & Potong 2 Percuma',
    bonusBadgeEn: 'Bonus +45 Points & Free Split Cut',
    promoPillMs: 'Tawaran Kepak Madu Khamis',
    promoPillEn: 'Thursday Wing Fiesta',
    bannerGradient: 'from-rose-950 via-stone-900 to-amber-950',
  },
  // 5 = Jumaat (Friday)
  5: {
    dayIndex: 5,
    dayNameMs: 'Jumaat',
    dayNameEn: 'Friday',
    themeTitleMs: 'Lauk Barakah Daging & Ayam Segar',
    themeTitleEn: 'Friday Blessed Feast & Fresh Cuts',
    taglineMs: 'Sajian istimewa makan tengah hari Jumaat. Daging lembu segar tempatan dan ayam sembelihan subuh.',
    taglineEn: 'Special Friday lunch specials featuring tender local beef and dawn-slaughtered chicken.',
    preferredProductIds: ['daging-batang-pinang', 'dada-ayam-segar', 'ayam-segar-standard'],
    discountAmount: 3.00,
    bonusPoints: 70,
    bonusBadgeMs: 'Diskaun Hebat RM3.00/kg + 70 Mata VIP',
    bonusBadgeEn: 'Huge RM3.00/kg Off + 70 VIP Points',
    promoPillMs: 'Tawaran Jumaat Barakah',
    promoPillEn: 'Blessed Friday Special',
    bannerGradient: 'from-emerald-950 via-green-950 to-stone-900',
  },
  // 6 = Sabtu (Saturday)
  6: {
    dayIndex: 6,
    dayNameMs: 'Sabtu',
    dayNameEn: 'Saturday',
    themeTitleMs: 'Pek Hujung Minggu Ayam Seekor Keluarga',
    themeTitleEn: 'Saturday Family Whole Chicken Weekend',
    taglineMs: 'Ayam segar seekor gred A harian. Sesuai untuk lauk sekeluarga dengan pilihan potong 8, 12, atau 16.',
    taglineEn: 'Fresh daily Grade A whole chicken suited for weekend family curries, soups, and roasts.',
    preferredProductIds: ['ayam-segar-standard', 'ayam-kampung-organik'],
    discountAmount: 1.50,
    bonusPoints: 50,
    bonusBadgeMs: 'Potong 12/16 Percuma + Bonus Mata',
    bonusBadgeEn: 'Free 12/16 Cut + Bonus Points',
    promoPillMs: 'Paling Laris Hujung Minggu',
    promoPillEn: 'Weekend Top Seller',
    bannerGradient: 'from-amber-950 via-stone-900 to-emerald-950',
  },
};

export interface ResolvedDailySpecial {
  schedule: DailySpecialSchedule;
  product: Product;
  discountedPrice: number;
  originalPrice: number;
  savings: number;
  bonusPoints: number;
  formattedTimeRemaining: string;
}

/**
 * Gets the current daily special based on current day and available products.
 */
export function getDailySpecial(products: Product[]): ResolvedDailySpecial | null {
  if (!products || products.length === 0) return null;

  const now = new Date();
  const dayIndex = now.getDay(); // 0-6
  const schedule = DAILY_SPECIAL_SCHEDULES[dayIndex] || DAILY_SPECIAL_SCHEDULES[1];

  // Try to find the preferred product
  let matchedProduct: Product | undefined;
  for (const id of schedule.preferredProductIds) {
    matchedProduct = products.find(p => p.id === id || p.id.includes(id));
    if (matchedProduct && matchedProduct.inStock) break;
  }

  // Fallback to first available product or modulo selection if not found
  if (!matchedProduct) {
    const inStockProducts = products.filter(p => p.inStock);
    if (inStockProducts.length > 0) {
      matchedProduct = inStockProducts[dayIndex % inStockProducts.length];
    } else {
      matchedProduct = products[0];
    }
  }

  const originalPrice = matchedProduct.originalPrice && matchedProduct.originalPrice > matchedProduct.price 
    ? matchedProduct.originalPrice 
    : matchedProduct.price;

  const discountedPrice = Math.max(1, Number((matchedProduct.price - schedule.discountAmount).toFixed(2)));
  const savings = Number((originalPrice - discountedPrice).toFixed(2));

  // Calculate time remaining until midnight
  const midnight = new Date();
  midnight.setHours(23, 59, 59, 999);
  const diffMs = Math.max(0, midnight.getTime() - now.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  const formattedTimeRemaining = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    schedule,
    product: matchedProduct,
    discountedPrice,
    originalPrice,
    savings,
    bonusPoints: schedule.bonusPoints,
    formattedTimeRemaining,
  };
}
