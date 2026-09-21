import React, { useState } from 'react';
import { 
  MessageCircle, 
  ArrowRight, 
  CheckCircle2, 
  PhoneCall, 
  Sparkles,
  QrCode,
  Copy,
  Check,
  Receipt,
  ShieldCheck
} from 'lucide-react';
import { getOfficialWhatsAppLink, openWhatsAppSafe } from '../utils/whatsappHelper';

interface WhatsAppPromoBannerProps {
  onOpenWhatsAppModal?: () => void;
}

export const WhatsAppPromoBanner: React.FC<WhatsAppPromoBannerProps> = ({
  onOpenWhatsAppModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedDuitNow, setCopiedDuitNow] = useState(false);

  const handleCopyAccount = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('7061163993');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyDuitNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('202503301954');
    setCopiedDuitNow(true);
    setTimeout(() => setCopiedDuitNow(false), 2000);
  };

  const handleChatNow = () => {
    if (onOpenWhatsAppModal) {
      onOpenWhatsAppModal();
    } else {
      const template = 
        `Salam Khairul Fresh Food! Saya nak buat pesanan melalui WhatsApp:\n\n` +
        `1. Nama:\n` +
        `2. Produk Ayam: Ayam Segar (1 ekor - potong 12)\n` +
        `3. Lokasi: Semenyih / Ambil di Pasar Semenyih\n` +
        `4. Bila nak hantar: Pagi esok (Selasa - Ahad)\n\n` +
        `*MAKLUMAT PEMBAYARAN SYARIKAT*:\n` +
        `• Kaedah: DuitNow QR / Pindahan Bank Sahaja\n` +
        `• Bank: OCBC Bank (Malaysia) Berhad\n` +
        `• No Akaun: 70 6116 3993\n` +
        `• Nama: KHAIRUL FRESH AND FROZEN FOOD\n` +
        `• DuitNow ID (No. Pendaftaran Perniagaan / SSM): 202503301954\n` +
        `*(Saya akan hantar resit bayaran di sini untuk pengesahan order)*`;
      const url = getOfficialWhatsAppLink(template);
      openWhatsAppSafe(url);
    }
  };

  return (
    <section id="whatsapp-order-section" className="py-12 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Mint / Sage Green Container */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#e6f4ea] via-[#dcfce7] to-[#d1fae5] dark:from-emerald-950/80 dark:via-stone-800 dark:to-emerald-950/70 p-6 sm:p-10 border border-emerald-300/80 dark:border-emerald-800/60 shadow-xl">
          
          {/* Subtle Decorative Accents */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-200/40 dark:bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Column: Phone Illustration & Headline */}
            <div className="lg:col-span-6 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              
              {/* Phone Graphic with WhatsApp Chat Mockup */}
              <div className="w-24 sm:w-28 h-36 sm:h-44 rounded-3xl bg-[#075e54] text-white p-2.5 shadow-xl border-4 border-white dark:border-stone-800 shrink-0 flex flex-col justify-between transform -rotate-3 hover:rotate-0 transition-transform mb-1 sm:mb-0">
                <div className="flex items-center justify-between border-b border-emerald-600/60 pb-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[9px] font-black tracking-wider text-emerald-200">WHATSAPP</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                </div>

                <div className="my-auto space-y-1.5 text-left py-1">
                  <div className="bg-[#128c7e] text-white text-[9px] p-1.5 rounded-lg max-w-[85%] font-medium leading-tight shadow-xs">
                    Salam! Ayam segar Semenyih ada stok?
                  </div>
                  <div className="bg-[#25d366] text-stone-950 text-[9px] p-1.5 rounded-lg max-w-[85%] ml-auto font-bold leading-tight shadow-xs">
                    Ada puan! Baru sampai segar pagi ni.
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1 pt-1 border-t border-emerald-600/60 text-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[8px] font-black uppercase tracking-wider">Online Sekarang</span>
                </div>
              </div>

              {/* Headlines */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black tracking-wide shadow-xs">
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  <span>RESPON PANTAS</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-['Outfit'] leading-tight">
                  Boleh Order Melalui <br />
                  <span className="text-emerald-700 dark:text-emerald-400">WhatsApp Kami</span>
                </h3>

                <p className="text-sm font-bold text-stone-600 dark:text-stone-300">
                  Mudah • Cepat • Respon Segera
                </p>
              </div>

            </div>

            {/* Right Column: White Card with 4 Steps & Button */}
            <div className="lg:col-span-6">
              <div className="relative bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 shadow-xl border border-emerald-200/90 dark:border-stone-700">
                
                {/* Red Stamp on top right edge */}
                <div className="absolute -top-3.5 -right-3 bg-rose-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md transform rotate-3">
                  Senang Cepat Mudah!
                </div>

                <h4 className="text-sm sm:text-base font-black text-stone-900 dark:text-white font-['Outfit'] mb-3">
                  Sila berikan maklumat berikut semasa order:
                </h4>

                {/* 4 Steps Ordered List */}
                <div className="space-y-2.5 mb-5 text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span><strong>Nama</strong></span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span><strong>Produk ayam apa?</strong> (ayam segar, ayam proses, peha, dada, dll)</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span><strong>Lokasi penghantaran</strong> atau ambik di pasar?</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      4
                    </span>
                    <span><strong>Bila nak hantar?</strong> (Selasa – Ahad, Isnin Cuti)</span>
                  </div>
                </div>

                {/* Kaedah Bayaran: DuitNow QR & Akaun Syarikat */}
                <div className="mb-5 p-3.5 rounded-2xl bg-amber-50/90 dark:bg-stone-800/90 border border-amber-300 dark:border-amber-700/70 text-xs space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-black text-[#ED0058] dark:text-rose-400">
                      <QrCode className="w-4 h-4" />
                      <span>Bayaran: DuitNow QR / Pindahan Bank</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Receipt className="w-2.5 h-2.5" />
                      <span>Wajib Resit</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-700 dark:text-stone-300 leading-relaxed">
                    Customer order WhatsApp <strong>hanya bayar melalui DuitNow QR atau transfer bank ke akaun syarikat kami</strong>:
                  </p>

                  <div className="p-2.5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-bold uppercase">
                        OCBC Bank • KHAIRUL FRESH AND FROZEN FOOD
                      </span>
                      <span className="text-xs sm:text-sm font-black text-stone-900 dark:text-white font-mono tracking-wider">
                        70 6116 3993
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Disalin' : 'Salin No.'}</span>
                    </button>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-pink-600 dark:text-pink-400 block font-bold uppercase">
                        DuitNow ID (No. Pendaftaran Perniagaan / SSM)
                      </span>
                      <span className="text-xs sm:text-sm font-black text-stone-900 dark:text-white font-mono tracking-wider">
                        202503301954
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyDuitNow}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-pink-50 dark:bg-pink-950/60 text-pink-800 dark:text-pink-300 border border-pink-200 dark:border-pink-800 hover:bg-pink-100 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      {copiedDuitNow ? <Check className="w-3 h-3 text-pink-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedDuitNow ? 'Disalin' : 'Salin ID'}</span>
                    </button>
                  </div>

                  <p className="text-[10.5px] text-rose-800 dark:text-rose-300 font-bold flex items-center gap-1.5 bg-rose-50/80 dark:bg-rose-950/40 p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
                    <span>Sila hantar resit pembayaran di WhatsApp sebelum pesanan disahkan & diproses.</span>
                  </p>
                </div>

                {/* Primary WhatsApp Button */}
                <button
                  onClick={handleChatNow}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#043e2f] hover:bg-[#064e3b] active:bg-[#022c22] text-white font-black text-sm sm:text-base shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-emerald-400 text-emerald-400" />
                  <span>Chat Sekarang di WhatsApp</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
