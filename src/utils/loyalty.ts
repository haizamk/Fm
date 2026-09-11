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
}

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
    return {
      currentPoints: points,
      totalSpent,
      currentTier: 'Platinum',
      nextTier: null,
      pointsForNextTier: 0,
      pointsInCurrentTier: points - 2000,
      tierTargetPoints: 2000,
      progressPercentage: 100,
      perks: [
        'Kadar 2.0x Mata Ganjaran Setiap Pembelian',
        'Auto Diskaun Penghantaran RM6.00 untuk Pesanan Lebih RM150',
        'Keutamaan Khidmat Potongan Ekspres & Sembelihan Terpantas',
        'Penebusan Baucar Tunai (Setiap 100 Mata = RM1.00)',
      ],
      multiplier: '2.0x',
    };
  }

  // Emas: 1000 - 1999 points
  if (points >= 1000) {
    const tierStart = 1000;
    const tierEnd = 2000;
    const progress = Math.min(100, Math.round(((points - tierStart) / (tierEnd - tierStart)) * 100));
    return {
      currentPoints: points,
      totalSpent,
      currentTier: 'Emas',
      nextTier: 'Platinum',
      pointsForNextTier: tierEnd - points,
      pointsInCurrentTier: points - tierStart,
      tierTargetPoints: tierEnd - tierStart,
      progressPercentage: progress,
      perks: [
        'Kadar 1.5x Mata Ganjaran Setiap Pembelian',
        'Auto Diskaun Penghantaran RM6.00 untuk Pesanan Lebih RM150',
        'Akses Awal Slot Penghantaran Hari Raya & Kenduri',
        'Penebusan Baucar Tunai (Setiap 100 Mata = RM1.00)',
      ],
      multiplier: '1.5x',
    };
  }

  // Perak: 500 - 999 points
  if (points >= 500) {
    const tierStart = 500;
    const tierEnd = 1000;
    const progress = Math.min(100, Math.round(((points - tierStart) / (tierEnd - tierStart)) * 100));
    return {
      currentPoints: points,
      totalSpent,
      currentTier: 'Perak',
      nextTier: 'Emas',
      pointsForNextTier: tierEnd - points,
      pointsInCurrentTier: points - tierStart,
      tierTargetPoints: tierEnd - tierStart,
      progressPercentage: progress,
      perks: [
        'Kadar 1.2x Mata Ganjaran Setiap Pembelian',
        'Penebusan Baucar Tunai (Setiap 100 Mata = RM1.00)',
        'Baucar Diskaun Eksklusif Ahli Perak',
      ],
      multiplier: '1.2x',
    };
  }

  // Bronze / Gangsa: 0 - 499 points
  const tierStart = 0;
  const tierEnd = 500;
  const progress = Math.min(100, Math.round((points / tierEnd) * 100));
  return {
    currentPoints: points,
    totalSpent,
    currentTier: 'Gangsa',
    nextTier: 'Perak',
    pointsForNextTier: tierEnd - points,
    pointsInCurrentTier: points,
    tierTargetPoints: 500,
    progressPercentage: progress,
    perks: [
      '1x Mata Ganjaran Bagi Setiap RM 1 Dibelanjakan',
      'Bonus 50 Mata untuk Pesanan Pertama',
      'Penebusan Baucar Tunai (Setiap 100 Mata = RM 1.00)',
    ],
    multiplier: '1.0x',
  };
}
