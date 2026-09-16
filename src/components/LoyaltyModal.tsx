import React, { useState } from 'react';
import { LoyaltyStatus, REWARD_VOUCHERS, ALL_TIERS, TierInfo } from '../utils/loyalty';
import { 
  X, 
  Award, 
  Crown, 
  Sparkles, 
  Gift, 
  Check, 
  Copy, 
  ArrowRight, 
  ShieldCheck, 
  Zap,
  TrendingUp,
  ChevronRight,
  Lock,
  Unlock,
  Star,
  CheckCircle2,
  Percent,
  Truck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LoyaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  loyaltyStatus: LoyaltyStatus;
  onApplyVoucher?: (code: string) => void;
}

export const LoyaltyModal: React.FC<LoyaltyModalProps> = ({
  isOpen,
  onClose,
  loyaltyStatus,
  onApplyVoucher,
}) => {
  const { isEn } = useLanguage();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedTierPreview, setSelectedTierPreview] = useState<string>(
    loyaltyStatus.nextTier || loyaltyStatus.currentTier
  );

  if (!isOpen) return null;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    onApplyVoucher?.(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const getTierBadgeStyle = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/25 border-cyan-400/40';
      case 'Emas':
        return 'bg-gradient-to-r from-amber-400 to-yellow-600 text-stone-950 font-black shadow-amber-500/30 border-amber-300/60';
      case 'Perak':
        return 'bg-gradient-to-r from-slate-300 to-stone-400 text-stone-900 shadow-stone-400/25 border-slate-200/60';
      default:
        return 'bg-gradient-to-r from-amber-700 to-amber-900 text-amber-100 shadow-amber-900/20 border-amber-600/40';
    }
  };

  const currentTierData = ALL_TIERS.find(t => t.tier === loyaltyStatus.currentTier) || ALL_TIERS[0];
  const nextTierData = loyaltyStatus.nextTier 
    ? ALL_TIERS.find(t => t.tier === loyaltyStatus.nextTier) 
    : null;

  const previewTierData = ALL_TIERS.find(t => t.tier === selectedTierPreview) || nextTierData || currentTierData;

  // Calculate overall milestone progress across the full 0 -> 2000 range for the macro bar
  const overallMacroPercent = Math.min(100, Math.max(0, Math.round((loyaltyStatus.currentPoints / 2000) * 100)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-6 flex flex-col max-h-[92vh]"
        role="dialog"
      >
        {/* Top Header with Membership Card */}
        <div className="bg-gradient-to-br from-stone-950 via-emerald-950 to-stone-900 text-white p-5 sm:p-6 relative shrink-0 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-stone-300 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Crown className="w-4 h-4" />
            <span>Program Ganjaran Pelanggan Setia FreshAyam</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-stone-300 block">Baki Mata Ganjaran Anda</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black text-amber-400 font-['Outfit'] tracking-tight">
                  {loyaltyStatus.currentPoints.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-stone-300">Mata (Points)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3.5 py-1.5 rounded-xl text-xs font-black shadow-md border flex items-center gap-1.5 ${getTierBadgeStyle(loyaltyStatus.currentTier)}`}>
                <Award className="w-4 h-4" />
                <span>Ahli {loyaltyStatus.currentTier}</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loyaltyStatus.multiplier} Mata</span>
              </span>
            </div>
          </div>

          {/* Visual Progress Bar & Milestones Section */}
          <div className="mt-5 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-stone-200 font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                {loyaltyStatus.nextTier ? (
                  <span>
                    Kemajuan ke Pangkat <strong className="text-amber-300 font-bold">{loyaltyStatus.nextTier}</strong>
                  </span>
                ) : (
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <Crown className="w-4 h-4 text-amber-400" /> Tahap Tertinggi Platinum Tercapai!
                  </span>
                )}
              </span>
              <span className="font-black text-amber-300 text-sm">
                {loyaltyStatus.progressPercentage}%
              </span>
            </div>

            {/* Micro Tier Progress Bar (Current Tier Step) */}
            <div className="w-full bg-stone-900/80 rounded-full h-3 overflow-hidden p-0.5 border border-white/10 shadow-inner">
              <div
                className="bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-300 h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.max(4, loyaltyStatus.progressPercentage)}%` }}
              />
            </div>

            {/* Roadmap Milestones (Gangsa 0 -> Perak 500 -> Emas 1000 -> Platinum 2000) */}
            <div className="grid grid-cols-4 gap-1 mt-3.5 pt-3 border-t border-white/10 text-center">
              {ALL_TIERS.map((tierItem) => {
                const isReached = loyaltyStatus.currentPoints >= tierItem.minPoints;
                const isCurrent = loyaltyStatus.currentTier === tierItem.tier;

                return (
                  <button
                    key={tierItem.tier}
                    type="button"
                    onClick={() => setSelectedTierPreview(tierItem.tier)}
                    className={`p-1.5 rounded-xl text-left sm:text-center transition-all cursor-pointer ${
                      selectedTierPreview === tierItem.tier
                        ? 'bg-white/20 ring-1 ring-amber-400/80'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {isReached ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Lock className="w-3 h-3 text-stone-400" />
                      )}
                      <span className={`text-[11px] font-bold ${isCurrent ? 'text-amber-300 underline underline-offset-2' : isReached ? 'text-white' : 'text-stone-400'}`}>
                        {tierItem.tier}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 block mt-0.5 font-medium">
                      {tierItem.minPoints === 0 ? '0 Mata' : `${tierItem.minPoints} Mata`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Point gap notice */}
            {loyaltyStatus.nextTier && (
              <div className="mt-3 p-2.5 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-between gap-2">
                <span className="text-xs text-stone-200">
                  Perlukan lagi <strong className="text-amber-300 font-bold">{loyaltyStatus.pointsForNextTier} mata</strong> (belanja RM {loyaltyStatus.pointsForNextTier.toFixed(2)})
                </span>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-lg bg-amber-400 text-stone-950 shrink-0">
                  +{((loyaltyStatus.nextTierMultiplier ? parseFloat(loyaltyStatus.nextTierMultiplier) : 1.2) - parseFloat(loyaltyStatus.multiplier)).toFixed(1)}x Bonus
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-stone-800 dark:text-stone-100">
          
          {/* Specific Benefits Unlocked at Next Tier */}
          {nextTierData && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-teal-500/10 border-2 border-dashed border-amber-400/50 dark:border-amber-500/40">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500 text-stone-950 font-black">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-stone-900 dark:text-white font-['Outfit']">
                      Ganjaran Yang Bakal Dibuka di Tahap {nextTierData.tier}
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Hanya {loyaltyStatus.pointsForNextTier} mata lagi untuk membuka keistimewaan eksklusif ini:
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-lg text-xs font-black shrink-0 ${getTierBadgeStyle(nextTierData.tier)}`}>
                  {nextTierData.multiplier} Mata
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {nextTierData.perks.map((perk, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-2 p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-amber-200/70 dark:border-amber-900/50 text-xs font-semibold text-stone-800 dark:text-stone-200 shadow-2xs"
                  >
                    <Unlock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Tier Perks */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Kelebihan Pangkat {loyaltyStatus.currentTier} Anda Sekarang</span>
              </h4>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                Aktif & Sedia Digunakan
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {loyaltyStatus.perks.map((perk, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50 text-xs text-stone-800 dark:text-stone-200 font-medium"
                >
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Redeemable Vouchers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-500" />
                <span>Tebus Baucar Diskaun Tunai</span>
              </h4>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">Penebusan segera di troli</span>
            </div>

            <div className="space-y-2.5">
              {REWARD_VOUCHERS.map((voucher) => {
                const canRedeem = loyaltyStatus.currentPoints >= voucher.pointsRequired;
                const isCopied = copiedCode === voucher.voucherCode;

                return (
                  <div
                    key={voucher.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      canRedeem
                        ? 'bg-white dark:bg-stone-800 border-amber-300 dark:border-amber-700/80 shadow-xs hover:border-emerald-500'
                        : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 ${canRedeem ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400' : 'bg-stone-200 dark:bg-stone-700 text-stone-500'}`}>
                        <Gift className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-stone-900 dark:text-white">{voucher.title}</h5>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${canRedeem ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400'}`}>
                            {voucher.pointsRequired} Mata
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{voucher.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {canRedeem ? (
                        <button
                          onClick={() => handleCopyCode(voucher.voucherCode)}
                          className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Kod Ditampal!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Guna Kod: {voucher.voucherCode}</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-stone-400 dark:text-stone-500 font-semibold bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700">
                          Perlukan {voucher.pointsRequired - loyaltyStatus.currentPoints} Mata Lagi
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* All Tiers Comparison & Perks Roadmap */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80">
            <h5 className="font-bold text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Panduan Kesemua Tahap Keahlian FreshAyam</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALL_TIERS.map((tierItem) => {
                const isCurrent = loyaltyStatus.currentTier === tierItem.tier;
                return (
                  <div
                    key={tierItem.tier}
                    className={`p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600/60 shadow-xs'
                        : 'bg-white dark:bg-stone-800/80 border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${getTierBadgeStyle(tierItem.tier)}`}>
                          {tierItem.tier}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                            Pangkat Anda
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {tierItem.multiplier} Mata
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 block mb-2 font-medium">
                      Syarat: {tierItem.minPoints === 0 ? 'Percuma Pendaftaran' : `Kumpul ${tierItem.minPoints} mata`}
                    </span>
                    <ul className="space-y-1">
                      {tierItem.perks.slice(0, 2).map((p, i) => (
                        <li key={i} className="text-[11px] text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* How to Earn Points Guide */}
          <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs space-y-2">
            <h5 className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Cara Mudah Mengumpul Mata Ganjaran:</span>
            </h5>
            <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-300 leading-relaxed">
              <li><strong>RM 1.00 Dibelanjakan = 1 Mata Asas</strong> (digandakan automatik sehingga 2.0x mengikut pangkat).</li>
              <li>Mata dimasukkan ke akaun sejurus pesanan anda disahkan oleh sistem.</li>
              <li>Mata tidak mempunyai tarikh luput dan boleh ditebus bila-bila masa.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 dark:bg-stone-800/90 border-t border-stone-200 dark:border-stone-800 shrink-0 flex items-center justify-between">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Jumlah Belanja Terkumpul: <strong className="text-stone-900 dark:text-white font-bold">RM {loyaltyStatus.totalSpent.toFixed(2)}</strong>
          </span>
          <button
            onClick={onClose}
            className="bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-100 dark:text-stone-950 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
