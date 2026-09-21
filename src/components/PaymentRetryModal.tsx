import React, { useState } from 'react';
import { OrderRecord } from '../types';
import { DuitNowOCBCQR } from './DuitNowOCBCQR';
import { dataStorageService } from '../services/dataStorage';
import { openAdminWhatsAppDirect, OFFICIAL_WHATSAPP_DISPLAY } from '../utils/whatsappHelper';
import { 
  AlertTriangle, 
  X, 
  RefreshCw, 
  QrCode, 
  CreditCard, 
  MessageCircle, 
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';

interface PaymentRetryModalProps {
  order: OrderRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onRetryHitpay: (order: OrderRecord) => Promise<void>;
  onOrderUpdated?: (order: OrderRecord) => void;
}

export const PaymentRetryModal: React.FC<PaymentRetryModalProps> = ({
  order,
  isOpen,
  onClose,
  onRetryHitpay,
  onOrderUpdated,
}) => {
  const [viewMode, setViewMode] = useState<'options' | 'duitnow'>('options');
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const handleRetryHitpay = async () => {
    setIsRetrying(true);
    setRetryError(null);
    try {
      await onRetryHitpay(order);
    } catch (err: any) {
      setRetryError(err?.message || 'Gagal membuka semula gerbang HitPay. Sila cuba lagi atau pilih DuitNow QR.');
      setIsRetrying(false);
    }
  };

  const handleSelectDuitNow = async () => {
    // Switch order payment method to duitnow
    const updatedOrder: OrderRecord = {
      ...order,
      customer: {
        ...order.customer,
        paymentMethod: 'duitnow',
        hitpayStatus: 'canceled',
      },
    };

    try {
      await dataStorageService.saveOrderAsync(updatedOrder);
      dataStorageService.updateOrderStatus(
        order.orderId,
        'menunggu_bayaran',
        'Pelanggan menukar kaedah pembayaran ke DuitNow QR'
      );
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('khairul_fresh_orders_updated', {
            detail: dataStorageService.getOrders(),
          })
        );
      }
      if (onOrderUpdated) {
        onOrderUpdated(updatedOrder);
      }
    } catch (err) {
      console.warn('[DuitNow Switch Error]', err);
    }

    setViewMode('duitnow');
  };

  const handleWhatsAppHelp = () => {
    const text = 
      `Salam Khairul Fresh Food, saya memerlukan bantuan pembayaran untuk pesanan saya:\n\n` +
      `• No. Pesanan: #${order.orderId}\n` +
      `• Nama: ${order.customer.fullName}\n` +
      `• Jumlah: RM ${order.total.toFixed(2)}\n` +
      `• Status: Bayaran HitPay dibatalkan / gagal\n\n` +
      `Boleh saya dapatkan bantuan atau no akaun untuk transaksi? Terima kasih.`;
    openAdminWhatsAppDirect(text);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div 
        id="payment-retry-modal-card"
        className="relative w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-6 flex flex-col transition-colors max-h-[92vh]"
      >
        {/* Header Alert Banner */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-700 dark:to-amber-800 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black font-['Outfit'] tracking-wide">
                Bayaran Belum Selesai / Dibatalkan
              </h2>
              <p className="text-xs text-amber-100">
                Pesanan anda selamat direkodkan dalam sistem
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-stone-800 dark:text-stone-200">
          
          {/* Order Summary & Status Badge */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 dark:text-stone-400">No. Pesanan:</span>
                <span className="font-mono font-black text-sm text-stone-900 dark:text-white bg-stone-200 dark:bg-stone-700 px-2 py-0.5 rounded-md">
                  #{order.orderId}
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 font-extrabold text-xs border border-amber-300 dark:border-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Menunggu Bayaran</span>
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1 border-t border-stone-200/80 dark:border-stone-700/80">
              <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">Jumlah Perlu Dibayar:</span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-['Outfit']">
                RM {order.total.toFixed(2)}
              </span>
            </div>

            {/* Quick item preview */}
            <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate pt-1">
              <strong>Item:</strong> {order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
            </div>
          </div>

          {retryError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold">
              {retryError}
            </div>
          )}

          {viewMode === 'options' ? (
            /* Mode 1: Selection between HitPay Retry & DuitNow QR */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
                Transaksi di gerbang HitPay sebelum ini tidak selesai atau telah dibatalkan. Sila pilih kaedah di bawah untuk menyempurnakan pembayaran pesanan anda:
              </div>

              {/* Action Option 1: Bayar Semula HitPay */}
              <div className="p-4 rounded-2xl border-2 border-stone-200 dark:border-stone-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all bg-white dark:bg-stone-800/40 group">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-white">
                        Pilihan 1: Bayar Semula dengan HitPay
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        Online Banking FPX • Kad Debit/Kredit • E-Wallet
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 mb-3 leading-relaxed">
                  Cuba semula pembayaran melalui perbankan internet rasmi FPX (Maybank2u, CIMB Clicks, Bank Islam, dll) atau kad bank.
                </p>

                <button
                  type="button"
                  id="btn-retry-hitpay"
                  disabled={isRetrying}
                  onClick={handleRetryHitpay}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sedang Membuka Gerbang HitPay...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Buka Semula Halaman HitPay (RM {order.total.toFixed(2)})</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </>
                  )}
                </button>
              </div>

              {/* Action Option 2: Bayar Guna DuitNow QR */}
              <div className="p-4 rounded-2xl border-2 border-stone-200 dark:border-stone-700 hover:border-pink-500 dark:hover:border-pink-500 transition-all bg-white dark:bg-stone-800/40 group">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-white">
                        Pilihan 2: Bayar Guna DuitNow QR (OCBC)
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        Imbas QR mana-mana App Bank / E-Wallet & Hantar Resit
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 text-[10px] font-extrabold uppercase">
                    Disyorkan
                  </span>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 mb-3 leading-relaxed">
                  Pantas dan mudah! Imbas Kod QR rasmi peniaga atau pindahkan wang ke akaun OCBC Bank, kemudian hantar resit di WhatsApp.
                </p>

                <button
                  type="button"
                  id="btn-switch-to-duitnow"
                  onClick={handleSelectDuitNow}
                  className="w-full py-3 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-pink-600/20 transition-all cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Tukar & Bayar Guna DuitNow QR Sekarang</span>
                </button>
              </div>

              {/* Extra Support & Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={handleWhatsAppHelp}
                  className="w-full sm:w-auto text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-bold flex items-center justify-center gap-1.5 py-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Bantuan WhatsApp Admin</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 py-1.5 cursor-pointer font-medium"
                >
                  Tutup & Bayar Kemudian
                </button>
              </div>
            </div>
          ) : (
            /* Mode 2: DuitNow QR Display */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setViewMode('options')}
                  className="text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Pilihan Bayaran</span>
                </button>

                <span className="text-xs font-bold text-pink-600 dark:text-pink-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Kaedah: DuitNow QR</span>
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-pink-50/70 dark:bg-pink-950/40 border-2 border-pink-400 dark:border-pink-800">
                <div className="mb-3 text-center">
                  <span className="text-[10px] font-black uppercase text-pink-700 dark:text-pink-300 tracking-wider block">
                    Kaedah Bayaran: DuitNow QR (OCBC Bank)
                  </span>
                  <h4 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-white mt-0.5">
                    Imbas Kod QR & Hantar Resit ke WhatsApp
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Pindahan terus ke akaun peniaga: KHAIRUL FRESH AND FROZEN FOOD
                  </p>
                </div>

                <DuitNowOCBCQR
                  orderTotal={order.total}
                  orderId={order.orderId}
                  customerName={order.customer.fullName}
                  customerPhone={order.customer.phone}
                  compact={false}
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={handleWhatsAppHelp}
                  className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Hantar Resit ke Admin di WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs cursor-pointer transition-colors"
                >
                  Selesai / Tutup
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
