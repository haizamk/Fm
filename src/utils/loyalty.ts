import { LoyaltyTier, LoyaltyReward } from '../types';

export interface LoyaltyStatus {
  currentPoints: number;
  totalSpent: number;
  currentTier: LoyaltyTier;
  nextTier: LoyaltyTier | null;
  pointsForNextTier: number;
  pointsInCurrentTier: number;
  tierTargetPoints: number;
  progressPercentage: number;
  perks: string[];
  multiplier: string;
  nextTierPerks?: string[];
  nextTierMultiplier?: string;
  nextTierMinPoints?: number;
}

export interface TierInfo {
  tier: LoyaltyTier;
  minPoints: number;
  multiplier: string;
  badgeColor: string;
  gradientBg: string;
  tagline: string;
  perks: string[];
}

export const ALL_TIERS: TierInfo[] = [
  {
    tier: 'Gangsa',
    minPoints: 0,
    multiplier: '1.0x',
    badgeColor: 'bg-amber-800 text-amber-100',
    gradientBg: 'from-amber-800 to-amber-950',
    tagline: 'Tahap Permulaan',
    perks: [
      '1x Mata Ganjaran Bagi Setiap RM 1 Dibelanjakan',
      'Bonus 50 Mata Pendaftaran Pesanan Pertama',
      'Penebusan Baucar Tunai RM1 - RM20',
    ],
  },
  {
    tier: 'Perak',
    minPoints: 500,
    multiplier: '1.2x',
    badgeColor: 'bg-slate-300 text-slate-900',
    gradientBg: 'from-slate-500 to-stone-700',
    tagline: 'Ganjaran Dipertingkat 1.2x',
    perks: [
      'Kadar 1.2x Mata Ganjaran (+20% bonus)',
      'Akses Penebusan Baucar Tunai Tanpa Had',
      'Baucar Diskaun & Hadiah Hari Lahir Eksklusif',
    ],
  },
  {
    tier: 'Emas',
    minPoints: 1000,
    multiplier: '1.5x',
    badgeColor: 'bg-amber-400 text-stone-950',
    gradientBg: 'from-amber-500 to-yellow-600',
    tagline: 'Ahli VIP Emas 1.5x',
    perks: [
      'Kadar 1.5x Mata Ganjaran (+50% bonus)',
      'Auto Potongan Penghantaran RM6.00 untuk Pesanan > RM150',
      'Akses Awal Slot Tempahan Hari Raya & Kenduri',
      'Khidmat Pelanggan VIP WhatsApp',
    ],
  },
  {
    tier: 'Platinum',
    minPoints: 2000,
    multiplier: '2.0x',
    badgeColor: 'bg-cyan-400 text-stone-950',
    gradientBg: 'from-cyan-600 to-indigo-600',
    tagline: 'Pangkat Tertinggi Platinum 2.0x',
    perks: [
      'Kadar Maksimum 2.0x Mata Ganjaran (Mata Berganda 100%)',
      'Auto Potongan Penghantaran RM6.00 untuk Pesanan > RM150',
      'Keutamaan Khidmat Potongan Ekspres & Sembelihan Subuh',
      'Jemputan Acara Khas & Hadiah Akhir Tahun',
    ],
  },
];

export const REWARD_VOUCHERS: LoyaltyReward[] = [
  {
    id: 'reward-rm1',
    title: 'Baucar Tunai RM 1.00',
    pointsRequired: 100,
    description: 'Setiap 100 mata = Diskaun RM 1.00 (Minima pesanan RM 10.00)',
    voucherCode: 'GANJARAN1',
    discountValue: 1,
  },
  {
    id: 'reward-rm2',
    title: 'Baucar Tunai RM 2.00',
    pointsRequired: 200,
    description: 'Tebus 200 mata = Diskaun RM 2.00 (Minima pesanan RM 20.00)',
    voucherCode: 'GANJARAN2',
    discountValue: 2,
  },
  {
    id: 'reward-rm5',
    title: 'Baucar Tunai RM 5.00',
    pointsRequired: 500,
    description: 'Tebus 500 mata = Diskaun RM 5.00 (Minima pesanan RM 40.00)',
    voucherCode: 'GANJARAN5',
    discountValue: 5,
  },
  {
    id: 'reward-rm10',
    title: 'Baucar Tunai RM 10.00',
    pointsRequired: 1000,
    description: 'Tebus 1,000 mata = Diskaun RM 10.00 (Minima pesanan RM 70.00)',
    voucherCode: 'GANJARAN10',
    discountValue: 10,
  },
  {
    id: 'reward-rm20',
    title: 'Baucar Tunai RM 20.00',
    pointsRequired: 2000,
    description: 'Tebus 2,000 mata = Diskaun RM 20.00 (Minima pesanan RM 100.00)',
    voucherCode: 'GANJARAN20',
    discountValue: 20,
  },
];

export function getLoyaltyStatus(points: number, totalSpent: number): LoyaltyStatus {
  // Platinum: 2000+ points
  if (points >= 2000) {
    const currentTierInfo = ALL_TIERS.find(t => t.tier === 'Platinum')!;
    return {
      currentPoints: points,
      totalSpent,
      currentTier: 'Platinum',
      nextTier: null,
      pointsForNextTier: 0,
      pointsInCurrentTier: points - 2000,
      tierTargetPoints: 2000,
      progressPercentage: 100,
      perks: currentTierInfo.perks,
      multiplier: '2.0x',
      nextTierPerks: undefined,
      nextTierMultiplier: undefined,
      nextTierMinPoints: 2000,
    };
  }

  // Emas: 1000 - 1999 points
  if (points >= 1000) {
    const tierStart = 1000;
    const tierEnd = 2000;
    const progress = Math.min(100, Math.round(((points - tierStart) / (tierEnd - tierStart)) * 100));
    const currentTierInfo = ALL_TIERS.find(t => t.tier === 'Emas')!;
    const nextTierInfo = ALL_TIERS.find(t => t.tier === 'Platinum')!;
    return {
      currentPoints: points,
      totalSpent,
      currentTier: 'Emas',
      nextTier: 'Platinum',
      pointsForNextTier: tierEnd - points,
      pointsInCurrentTier: points - tierStart,
      tierTargetPoints: tierEnd - tierStart,
      progressPercentage: progress,
      perks: currentTierInfo.perks,
      multiplier: '1.5x',
      nextTierPerks: nextTierInfo.perks,
      nextTierMultiplier: '2.0x',
      nextTierMinPoints: 2000,
    };
  }

  // Perak: 500 - 999 points
  if (points >= 500) {
    const tierStart = 500;
    const tierEnd = 1000;
    const progress = Math.min(100, Math.round(((points - tierStart) / (tierEnd - tierStart)) * 100));
    const currentTierInfo = ALL_TIERS.find(t => t.tier === 'Perak')!;
    const nextTierInfo = ALL_TIERS.find(t => t.tier === 'Emas')!;
    return {
      currentPoints: points,
      totalSpent,
      currentTier: 'Perak',
      nextTier: 'Emas',
      pointsForNextTier: tierEnd - points,
      pointsInCurrentTier: points - tierStart,
      tierTargetPoints: tierEnd - tierStart,
      progressPercentage: progress,
      perks: currentTierInfo.perks,
      multiplier: '1.2x',
      nextTierPerks: nextTierInfo.perks,
      nextTierMultiplier: '1.5x',
      nextTierMinPoints: 1000,
    };
  }

  // Bronze / Gangsa: 0 - 499 points
  const tierStart = 0;
  const tierEnd = 500;
  const progress = Math.min(100, Math.round((points / tierEnd) * 100));
  const currentTierInfo = ALL_TIERS.find(t => t.tier === 'Gangsa')!;
  const nextTierInfo = ALL_TIERS.find(t => t.tier === 'Perak')!;
  return {
    currentPoints: points,
    totalSpent,
    currentTier: 'Gangsa',
    nextTier: 'Perak',
    pointsForNextTier: tierEnd - points,
    pointsInCurrentTier: points,
    tierTargetPoints: 500,
    progressPercentage: progress,
    perks: currentTierInfo.perks,
    multiplier: '1.0x',
    nextTierPerks: nextTierInfo.perks,
    nextTierMultiplier: '1.2x',
    nextTierMinPoints: 500,
  };
}
