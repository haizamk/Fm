import React, { useEffect, useState } from 'react';
import { OrderRecord } from '../types';
import { getCutLabel } from '../data/products';
import { downloadReceiptPDF, sendReceiptPDFToWhatsApp } from '../utils/pdfReceipt';
import { getWhatsAppOrderConfirmationLink, openWhatsAppSafe } from '../utils/whatsappHelper';
import { fonnteService } from '../services/fonnteService';
import { DuitNowOCBCQR } from './DuitNowOCBCQR';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  X, 
  Printer, 
  MessageCircle, 
  QrCode, 
  Calendar, 
  Clock, 
  Truck, 
  ShieldCheck, 
  Scissors,
  Copy,
  Download,
  Sparkles,
  MapPin,
  FileText,
  Share2,
  FileDown,
  RefreshCw
} from 'lucide-react';

interface OrderSuccessModalProps {
  order: OrderRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenTracking: (orderId: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  isOpen,
  onClose,
  onOpenTracking,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSharingPdf, setIsSharingPdf] = useState(false);
  const [isAutoSending, setIsAutoSending] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [fonnteDispatchStatus, setFonnteDispatchStatus] = useState<{ adminSent: boolean; error?: string } | null>(null);

  useEffect(() => {
    const handleFonnteEvent = (e: any) => {
      if (e.detail && order && e.detail.orderId === order.orderId) {
        setFonnteDispatchStatus({
          adminSent: e.detail.adminSent,
          error: e.detail.error,
        });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('khairul_fresh_fonnte_dispatched', handleFonnteEvent);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('khairul_fresh_fonnte_dispatched', handleFonnteEvent);
      }
    };
  }, [order]);

  const handleAutoResend = async () => {
    if (!order) return;
    setIsAutoSending(true);
    try {
      const res = await fonnteService.triggerNewOrderNotification(order);
      if (res.adminSent) {
        setFonnteDispatchStatus({ adminSent: true });
        setActionNotice('WhatsApp automatik berjaya dihantar ke telefon Pengurusan/Admin!');
      } else {
        setFonnteDispatchStatus({ adminSent: false, error: res.error });
        setActionNotice(res.error || 'Gagal menghantar auto WhatsApp. Sila klik Buka WhatsApp Admin.');
      }
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err: any) {
      setActionNotice('Ralat: ' + (err.message || 'Sila cuba lagi'));
    } finally {
      setIsAutoSending(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#f59e0b', '#3b82f6'],
        });
      } catch {
        // Safe fallback if confetti isn't supported
      }
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.orderId);
    setActionNotice(`No. Pesanan ${order.orderId} telah disalin ke papan keratan!`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleDownloadPdf = () => {
    try {
      setIsGeneratingPdf(true);
      downloadReceiptPDF(order);
      setActionNotice('Resit rasmi (PDF) berjaya dimuat turun ke peranti anda!');
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Maaf, ralat semasa menjana fail PDF. Sila cuba lagi atau gunakan fungsi Cetak.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSendPdfToWhatsApp = async () => {
    try {
      setIsSharingPdf(true);
      const res = await sendReceiptPDFToWhatsApp(order);
      if (res.mode === 'downloaded_and_opened') {
        setActionNotice('Fail PDF telah dimuat turun & WhatsApp telah dibuka untuk dilampirkan!');
      } else {
        setActionNotice('Resit PDF telah dikongsi ke WhatsApp!');
      }
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err) {
      console.error('Failed to share PDF to WhatsApp:', err);
      // Fallback direct download
      downloadReceiptPDF(order);
    } finally {
      setIsSharingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const generateWhatsAppMessage = () => {
    if (!order) return;
    const url = getWhatsAppOrderConfirmationLink(order);
    openWhatsAppSafe(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto animate-fade-in print:bg-white print:p-0">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-6 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none transition-colors"
        role="dialog"
      >
        
        {/* Success Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-5 sm:p-6 text-center relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-emerald-900/80 text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors print:hidden cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-stone-950 flex items-center justify-center mx-auto mb-2.5 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            Pesanan Berjaya Didaftarkan!
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-0.5 font-['Outfit']">
            Terima Kasih, {order.customer.fullName}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200 mt-1 max-w-md mx-auto">
            Ayam segar anda akan diproses segar pada awal pagi dan dihantar mengikut slot pilihan anda:
          </p>
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-xs font-bold text-emerald-100">
            <Clock className="w-3.5 h-3.5 text-emerald-300" />
            <span>{order.estimatedDeliveryText}</span>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-stone-800 dark:text-stone-200">
          
          {/* Real-Time Action Feedback Alert */}
          {actionNotice && (
            <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between gap-2 animate-fade-in shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{actionNotice}</span>
              </div>
              <button
                onClick={() => setActionNotice(null)}
                className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white text-[11px] underline cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}

          {/* DEDICATED RECEIPT & PDF WHATSAPP ACTION CARD */}
          <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-emerald-50 via-teal-50 to-emerald-100/60 dark:from-emerald-950/60 dark:via-stone-900 dark:to-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
                  <FileDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Dokumen Resit Pesanan Rasmi (PDF)</span>
                </span>
                <h3 className="text-sm sm:text-base font-black text-stone-900 dark:text-white mt-0.5">
                  Simpan & Kongsi Resit Pembayaran
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold self-start sm:self-auto shrink-0 shadow-xs">
                Format PDF Bersih
              </span>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 mb-3.5 leading-relaxed">
              Resit PDF lengkap dengan nombor pesanan, butiran ayam segar, status bayaran HitPay, dan slot penghantaran dijana terus untuk simpanan peribadi atau rujukan bersama.
            </p>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Download PDF Button */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="p-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menjana Resit PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Muat Turun Resit (PDF)</span>
                  </>
                )}
              </button>

              {/* Send PDF to WhatsApp Button */}
              <button
                type="button"
                onClick={handleSendPdfToWhatsApp}
                disabled={isSharingPdf}
                className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/70 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-900 dark:text-emerald-100 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 border border-emerald-300 dark:border-emerald-700 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSharingPdf ? (
                  <>
                    <span className="w-4 h-4 border-2 border-emerald-700 dark:border-emerald-200 border-t-transparent rounded-full animate-spin" />
                    <span>Memproses Resit WhatsApp...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                    <span>Hantar Resit (PDF) ke WhatsApp</span>
                  </>
                )}
              </button>

            </div>
          </div>

          {/* Order ID & Status bar */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">No. Pesanan:</span>
              <span className="text-base font-black text-emerald-800 dark:text-emerald-400 font-mono">
                {order.orderId}
              </span>
              <button
                onClick={handleCopyOrderId}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 rounded-md transition-colors cursor-pointer"
                title="Salin No. Pesanan"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-bold text-xs border border-amber-200 dark:border-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Status: Disahkan & Menunggu Persediaan Pagi</span>
            </div>
          </div>

          {/* WhatsApp Auto-Notification & Quick Contact Banner */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-stone-900 dark:text-white">
                    WhatsApp Gateway Automatik
                  </span>
                  {fonnteDispatchStatus ? (
                    fonnteDispatchStatus.adminSent ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200 text-[10px] font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Tersambung & Dihantar ke Admin (011-11135503)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200 text-[10px] font-bold flex items-center gap-1">
                        <span>Menunggu Hantaran Auto</span>
                      </span>
                    )
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200 text-[10px] font-bold">
                      Admin: 011-11135503
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-300">
                  Pesanan anda telah direkod dan sistem menghantar butiran lengkap terus ke WhatsApp pengurusan Khairul Fresh.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleAutoResend}
                disabled={isAutoSending}
                className="px-3 py-2 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold rounded-xl border border-stone-200 dark:border-stone-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Hantar semula notifikasi automatik melalui Fonnte Gateway"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAutoSending ? 'animate-spin text-emerald-600' : ''}`} />
                <span>{isAutoSending ? 'Menghantar...' : 'Hantar Auto'}</span>
              </button>

              <button
                type="button"
                onClick={generateWhatsAppMessage}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Buka WhatsApp Admin</span>
              </button>
            </div>
          </div>

          {/* DEDICATED PREFERRED DELIVERY SLOT CARD */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800/80">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                    Slot Penghantaran Pilihan Anda
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-white">
                    {order.estimatedDeliveryText}
                  </h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
                Disahkan
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 text-stone-700 dark:text-stone-300">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Bekalan segar harian pada hari penghantaran</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Rantaian sejuk dingin terlindung (Ice-Packed)</span>
              </div>
            </div>

            {order.customer.deliveryInstructions && (
              <div className="mt-2.5 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 text-xs flex items-start gap-1.5 text-stone-700 dark:text-stone-300">
                <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong>Arahan Penghantaran:</strong> {order.customer.deliveryInstructions}
                </span>
              </div>
            )}
          </div>

          {/* Payment Details Card (HitPay vs DuitNow QR OCBC) */}
          {order.customer.paymentMethod === 'duitnow' ? (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-pink-50/70 dark:bg-pink-950/40 border-2 border-pink-400 dark:border-pink-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-pink-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-pink-700 dark:text-pink-300 tracking-wider block">
                        Kaedah Bayaran: DuitNow QR (OCBC Bank)
                      </span>
                      <h4 className="text-sm font-extrabold text-stone-900 dark:text-white">
                        Sila Lengkapkan Pindahan & Hantar Resit
                      </h4>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                    Menunggu Resit
                  </span>
                </div>

                <DuitNowOCBCQR
                  orderTotal={order.total}
                  orderId={order.orderId}
                  customerName={order.customer.fullName}
                  customerPhone={order.customer.phone}
                  compact
                />
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                  HP
                </div>
                <div className="text-xs space-y-0.5 text-stone-700 dark:text-stone-300">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 tracking-wider">
                      HitPay Malaysia Gateway
                    </span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-sm bg-emerald-600 text-white">
                      Bayaran Disahkan
                    </span>
                  </div>
                  <h4 className="font-extrabold text-stone-900 dark:text-white text-sm">
                    Jumlah Dibayar: RM {order.total.toFixed(2)}
                  </h4>
                  <p className="text-[11px] text-stone-600 dark:text-stone-300">
                    Rujukan HitPay: <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300">{order.customer.hitpayReference || order.orderId}</span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Transaksi Selesai</span>
                </span>
                <span className="block text-[9px] text-stone-500 mt-1">
                  FPX / DuitNow / E-Wallet / Kad
                </span>
              </div>
            </div>
          )}

          {/* Items Summary Table */}
          <div>
            <h4 className="text-xs font-extrabold text-stone-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Perincian Ayam & Pilihan Potongan</span>
            </h4>

            <div className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden divide-y divide-stone-100 dark:divide-stone-800">
              {order.items.map((it) => (
                <div key={it.cartItemId} className="p-3 flex items-center justify-between text-xs">
                  <div className="pr-2 space-y-0.5">
                    <div className="font-bold text-stone-900 dark:text-white">
                      {it.quantity}x {it.product.name}
                    </div>
                    {it.selectedWeightOption && (
                      <div className="text-stone-600 dark:text-stone-400 text-[11px]">
                        Berat: <span className="font-semibold">{it.selectedWeightOption.weightLabel}</span>
                      </div>
                    )}
                    {it.organVariationLabel && (
                      <div className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                        Pilihan: {it.organVariationLabel}
                      </div>
                    )}
                    {it.product.supportsCutting && (
                      <div className="text-emerald-800 dark:text-emerald-400 font-medium text-[11px]">
                        Potongan: {getCutLabel(it.selectedCut, it.product)}
                      </div>
                    )}
                    {it.specialNotes && (
                      <div className="text-stone-500 dark:text-stone-400 italic text-[11px]">
                        Nota: {it.specialNotes}
                      </div>
                    )}
                  </div>
                  <div className="font-extrabold text-stone-900 dark:text-white text-right shrink-0">
                    RM {it.itemTotalPrice.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
              <span className="font-bold text-stone-900 dark:text-white block mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Alamat Penghantaran:
              </span>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                {order.customer.fullName} ({order.customer.phone})<br />
                {order.customer.address}, {order.customer.postcode} {order.customer.city}, {order.customer.state}
              </p>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
              <span className="font-bold text-stone-900 dark:text-white block mb-1">
                Jadual & Bayaran:
              </span>
              <div className="space-y-1 text-stone-600 dark:text-stone-300">
                <div>Kaedah Bayaran: <strong className="text-emerald-700 dark:text-emerald-400">{order.customer.paymentMethod === 'duitnow' ? 'DUITNOW QR (OCBC BANK)' : 'HITPAY GATEWAY (DALAM TALIAN)'}</strong></div>
                <div>Kos Hantar: <strong>{order.deliveryFee === 0 ? 'Percuma' : `RM ${order.deliveryFee.toFixed(2)}`}</strong></div>
                <div>Jumlah Bayaran: <strong className="text-emerald-800 dark:text-emerald-400">RM {order.total.toFixed(2)}</strong></div>
              </div>
            </div>
          </div>

          {/* Order Tracking Progress bar preview */}
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>Rantaian Penghantaran Segar</span>
              </span>
              <button
                onClick={() => onOpenTracking(order.orderId)}
                className="text-xs text-emerald-700 dark:text-emerald-400 font-bold underline hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors cursor-pointer"
              >
                Lihat Penjejakan Penuh
              </button>
            </div>

            {/* Stepper Visual */}
            <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold mb-1">
                  ✓
                </div>
                <span className="font-bold text-emerald-900 dark:text-emerald-300">Disahkan</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold mb-1 animate-pulse">
                  2
                </div>
                <span className="font-bold text-amber-900 dark:text-amber-300">Potong & Bersih</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center justify-center font-bold mb-1">
                  3
                </div>
                <span className="text-stone-500 dark:text-stone-400">Pek Sejuk Dingin</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center justify-center font-bold mb-1">
                  4
                </div>
                <span className="text-stone-500 dark:text-stone-400">Rider Hantar</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-950/80 border-t border-stone-200 dark:border-stone-800 shrink-0 flex flex-wrap items-center justify-between gap-2.5 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              title="Muat turun fail resit PDF"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'Menjana...' : 'Muat Turun PDF'}</span>
            </button>

            <button
              onClick={handleSendPdfToWhatsApp}
              disabled={isSharingPdf}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/60 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-xl border border-emerald-300 dark:border-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
              title="Kongsi fail resit PDF terus ke WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Resit ke WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="bg-stone-900 dark:bg-emerald-600 hover:bg-stone-800 dark:hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Kembali ke Halaman Utama
          </button>
        </div>

      </div>
    </div>
  );
};

