import React, { useState } from 'react';
import { LoyaltyStatus, REWARD_VOUCHERS } from '../utils/loyalty';
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
  ShoppingBag
} from 'lucide-react';

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
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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
        return 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-cyan-500/20';
      case 'Emas':
        return 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-amber-500/25';
      case 'Perak':
        return 'bg-gradient-to-r from-stone-400 to-slate-500 text-white shadow-stone-400/20';
      default:
        return 'bg-gradient-to-r from-amber-700 to-yellow-900 text-white shadow-amber-800/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 flex flex-col max-h-[90vh]"
        role="dialog"
      >
        {/* Header with Loyalty Card Card */}
        <div className="bg-gradient-to-br from-stone-900 via-emerald-950 to-stone-900 text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 text-stone-300 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
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
                <span className="text-3xl sm:text-4xl font-black text-amber-400 font-['Outfit']">
                  {loyaltyStatus.currentPoints}
                </span>
                <span className="text-sm font-semibold text-stone-300">Mata (Points)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 ${getTierBadgeStyle(loyaltyStatus.currentTier)}`}>
                <Award className="w-4 h-4" />
                <span>Ahli {loyaltyStatus.currentTier}</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 text-emerald-300 text-xs font-bold">
                {loyaltyStatus.multiplier} Ganjaran
              </span>
            </div>
          </div>

          {/* Progress Bar towards next tier */}
          <div className="mt-5 p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-stone-300 font-medium">
                {loyaltyStatus.nextTier ? (
                  <>
                    Kemajuan ke <strong>Ahli {loyaltyStatus.nextTier}</strong>
                  </>
                ) : (
                  <strong>Tahap Tertinggi Platinum Tercapai!</strong>
                )}
              </span>
              <span className="font-extrabold text-amber-300">
                {loyaltyStatus.progressPercentage}%
              </span>
            </div>

            <div className="w-full bg-stone-800/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/5">
              <div
                className="bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-300 h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${loyaltyStatus.progressPercentage}%` }}
              />
            </div>

            {loyaltyStatus.nextTier && (
              <p className="text-[11px] text-stone-300 mt-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Kumpul lagi <strong className="text-white font-bold">{loyaltyStatus.pointsForNextTier} mata</strong> (belanja RM {loyaltyStatus.pointsForNextTier}) untuk naik ke tahap <strong>{loyaltyStatus.nextTier}</strong>!
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-stone-800">
          
          {/* Active Tier Perks */}
          <div>
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kelebihan Pangkat {loyaltyStatus.currentTier} Anda</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {loyaltyStatus.perks.map((perk, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-stone-800 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Redeemable Vouchers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-amber-500" />
                <span>Tebus Baucar Diskaun Tunai</span>
              </h4>
              <span className="text-[11px] text-stone-500">Mata ditolak secara automatik</span>
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
                        ? 'bg-white border-amber-300 shadow-xs hover:border-emerald-500'
                        : 'bg-stone-50 border-stone-200 opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 ${canRedeem ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-500'}`}>
                        <Gift className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-stone-900">{voucher.title}</h5>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${canRedeem ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                            {voucher.pointsRequired} Mata
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{voucher.description}</p>
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
                        <span className="text-xs text-stone-400 font-semibold bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200">
                          Perlukan {voucher.pointsRequired - loyaltyStatus.currentPoints} Mata Lagi
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* How to Earn Points Guide */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
            <h5 className="font-bold text-stone-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Cara Mengumpul Mata Ganjaran:</span>
            </h5>
            <ul className="list-disc list-inside space-y-1 text-stone-600 leading-relaxed">
              <li><strong>RM 1.00 Dibelanjakan = 1 Mata Ganjaran</strong> (dikuasakan sehingga 2x mengikut pangkat).</li>
              <li>Mata dikreditkan secara automatik setiap kali pesanan anda disahkan.</li>
              <li>Mata sah digunakan pada bila-bila masa tanpa tarikh luput.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 shrink-0 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Jumlah Belanja Terkumpul: <strong>RM {loyaltyStatus.totalSpent.toFixed(2)}</strong>
          </span>
          <button
            onClick={onClose}
            className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
