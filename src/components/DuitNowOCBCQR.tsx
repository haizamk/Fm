import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, Copy, Check, MessageCircle, Download, ExternalLink, ShieldCheck, ZoomIn, X, Upload, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { normalizeWhatsAppPhone, OFFICIAL_WHATSAPP_DIGITS, openWhatsAppSafe, getOfficialWhatsAppLink } from '../utils/whatsappHelper';
import { dataStorageService } from '../services/dataStorage';
import { compressImageFile } from '../utils/imageCompressor';

interface DuitNowOCBCQRProps {
  orderTotal?: number;
  orderId?: string;
  customerName?: string;
  customerPhone?: string;
  compact?: boolean;
}

/**
 * Calculates CRC16-CCITT (polynomial 0x1021, init 0xFFFF) required by EMVCo QR standard
 */
function crc16(str: string): string {
  let crc = 0xFFFF;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Builds standard PayNet Malaysia DuitNow EMVCo QR string for OCBC Bank
 */
export function buildDuitNowPayload(
  accountNumber: string = '7061163993',
  merchantName: string = 'KHAIRUL FRESH AND FROZEN FOOD',
  amount?: number,
  ref?: string
): string {
  const cleanAccount = accountNumber.replace(/\D/g, '') || '7061163993';
  const cleanName = (merchantName || 'KHAIRUL FRESH AND FROZEN FOOD').substring(0, 25).toUpperCase();
  const cleanCity = 'SEMENYIH';
  
  const tlv = (tag: string, value: string) => `${tag}${String(value.length).padStart(2, '0')}${value}`;
  
  // Tag 26: PayNet DuitNow Merchant Account Info
  const tag26_00 = tlv('00', 'MY.PAYNET.DUITNOW');
  const tag26_01 = tlv('01', cleanAccount);
  const tag26 = tlv('26', `${tag26_00}${tag26_01}`);
  
  const tag00 = tlv('00', '01'); // Format Indicator
  const tag01 = tlv('01', amount && amount > 0 ? '12' : '11'); // 11: Static, 12: Dynamic
  const tag52 = tlv('52', '5411'); // Grocery/Meat
  const tag53 = tlv('53', '458'); // MYR
  const tag54 = amount && amount > 0 ? tlv('54', amount.toFixed(2)) : '';
  const tag58 = tlv('58', 'MY');
  const tag59 = tlv('59', cleanName);
  const tag60 = tlv('60', cleanCity);
  
  let tag62 = '';
  if (ref) {
    const cleanRef = ref.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
    if (cleanRef) {
      const tag62_01 = tlv('01', cleanRef);
      tag62 = tlv('62', tag62_01);
    }
  }
  
  const rawDataWithoutCRC = `${tag00}${tag01}${tag26}${tag52}${tag53}${tag54}${tag58}${tag59}${tag60}${tag62}6304`;
  const checksum = crc16(rawDataWithoutCRC);
  return `${rawDataWithoutCRC}${checksum}`;
}

export const DuitNowOCBCQR: React.FC<DuitNowOCBCQRProps> = ({
  orderTotal,
  orderId,
  customerName,
  customerPhone,
  compact = false,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [customQrImage, setCustomQrImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bankName = 'OCBC Bank (Malaysia) Berhad';
  const accountName = 'KHAIRUL FRESH AND FROZEN FOOD';
  const accountNumber = '70 6116 3993';
  const accountNumberRaw = '7061163993';
  const orderRef = customerPhone 
    ? `${customerPhone} / ${orderId ? `#${orderId}` : 'Pesanan'}`
    : (orderId ? `#${orderId}` : 'No. Telefon Pelanggan / no pesanan');
  const whatsappNumber = OFFICIAL_WHATSAPP_DIGITS;

  // Load custom QR image from site settings or localStorage
  useEffect(() => {
    try {
      const siteSettings = dataStorageService.getSiteSettings();
      if (siteSettings.duitnowConfig?.qrImageUrl) {
        setCustomQrImage(siteSettings.duitnowConfig.qrImageUrl);
      } else {
        const cached = localStorage.getItem('khairul_duitnow_qr_img');
        if (cached) setCustomQrImage(cached);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, { maxWidth: 600, maxHeight: 600, quality: 0.82 });
        const base64 = compressed.dataUrl;
        setCustomQrImage(base64);
        try {
          localStorage.setItem('khairul_duitnow_qr_img', base64);
          const currentSettings = dataStorageService.getSiteSettings();
          dataStorageService.saveSiteSettings({
            ...currentSettings,
            duitnowConfig: {
              bankName,
              accountName,
              accountNumber,
              orderReferenceGuide: 'No. Telefon Pelanggan / no pesanan',
              qrImageUrl: base64,
              isActive: true,
            },
          }, 'Admin/Pelanggan');
        } catch (err) {
          console.warn('Notice saving QR image to local storage:', err);
        }
      } catch (uploadErr) {
        console.warn('Gagal memproses imej QR:', uploadErr);
      }
    }
  };

  const handleSendWhatsAppProof = () => {
    const totalText = orderTotal ? `RM ${orderTotal.toFixed(2)}` : '';
    const orderText = orderId ? `Pesanan #${orderId}` : 'Pesanan Baharu';
    const nameText = customerName ? `Nama: ${customerName}` : '';
    const phoneText = customerPhone ? `Tel: ${customerPhone}` : '';
    
    const message = 
      `Salam Khairul FRESH Food,\n\n` +
      `Saya telah membuat pembayaran melalui DuitNow QR / Pindahan Bank OCBC:\n` +
      `• *Rujukan Pesanan:* ${orderText} (${customerPhone || 'No Telefon'})\n` +
      (nameText ? `• *${nameText}*\n` : '') +
      (phoneText ? `• *${phoneText}*\n` : '') +
      (totalText ? `• *Jumlah Dibayar:* ${totalText}\n` : '') +
      `• *Bank:* ${bankName}\n` +
      `• *Nama Akaun:* ${accountName}\n` +
      `• *No. Akaun:* ${accountNumber}\n\n` +
      `Dilampirkan resit / bukti transaksi pindahan DuitNow saya. Mohon semakan & pengesahan. Terima kasih!`;

    const url = getOfficialWhatsAppLink(message, whatsappNumber || OFFICIAL_WHATSAPP_DIGITS);
    openWhatsAppSafe(url);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Zoom Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-60 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsZoomed(false)}
        >
          <div 
            className="relative bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 dark:border-stone-800 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h4 className="font-extrabold text-sm text-stone-900 dark:text-white mb-3">
              Imbas DuitNow QR (OCBC Bank)
            </h4>
            
            <div className="flex justify-center mb-3">
              <DuitNowStandeeVisual 
                merchantName={accountName} 
                customImage={customQrImage} 
                orderTotal={orderTotal}
                orderId={orderId}
              />
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400">
              Imbas menggunakan mana-mana aplikasi perbankan (OCBC, Maybank MAE, CIMB OCTO, Bank Islam) atau e-wallet (TNG eWallet, ShopeePay, GrabPay).
            </p>
          </div>
        </div>
      )}

      {/* Main Standee Card Layout */}
      <div className="flex flex-col md:flex-row items-center gap-5 p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border-2 border-emerald-500/40 dark:border-emerald-600/40 shadow-md">
        
        {/* Visual Standee Preview */}
        <div className="relative group shrink-0 flex flex-col items-center">
          <div className="cursor-pointer" onClick={() => setIsZoomed(true)} title="Klik untuk besarkan kod QR">
            <DuitNowStandeeVisual 
              merchantName={accountName} 
              customImage={customQrImage} 
              compact={compact} 
              orderTotal={orderTotal}
              orderId={orderId}
            />
            
            {/* Zoom Overlay badge on hover */}
            <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center pointer-events-none">
              <span className="px-3 py-1.5 rounded-full bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-white text-xs font-bold shadow-md flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-emerald-600" />
                <span>Klik Paparan Penuh</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={() => setIsZoomed(true)}
              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ZoomIn className="w-3 h-3" />
              <span>Besarkan Kod QR</span>
            </button>

            <span className="text-stone-300 dark:text-stone-700">•</span>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1 cursor-pointer"
              title="Guna gambar asal standee dari peranti anda"
            >
              <Upload className="w-3 h-3" />
              <span>{customQrImage ? 'Tukar Gambar' : 'Guna Gambar Asal'}</span>
            </button>
          </div>
        </div>

        {/* Bank Details & Information */}
        <div className="flex-1 space-y-3 w-full">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Kod QR Aktif & Sah</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-[10px] uppercase tracking-wider border border-stone-200 dark:border-stone-700">
                DuitNow PayNet Malaysia
              </span>
              <span className="px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-extrabold text-[10px] uppercase tracking-wider">
                OCBC Bank
              </span>
            </div>
            
            <h4 className="text-sm sm:text-base font-black text-stone-900 dark:text-white font-['Outfit']">
              DuitNow QR & Pindahan Bank OCBC
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
              Imbas QR standee rasmi di sebelah atau buat pindahan perbankan online ke akaun rasmi peniaga di bawah:
            </p>
          </div>

          {/* Bank Credentials Table */}
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 space-y-2.5 text-xs">
            {/* Bank Name */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-stone-500 dark:text-stone-400 font-bold shrink-0">Bank:</span>
              <span className="font-extrabold text-red-600 dark:text-red-400 flex items-center gap-1 text-right">
                <span className="w-2 h-2 rounded-full bg-red-600 inline-block shrink-0" />
                {bankName}
              </span>
            </div>

            {/* Account Name */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-stone-500 dark:text-stone-400 font-bold shrink-0">Nama Akaun:</span>
              <div className="flex items-center gap-1.5 text-right">
                <span className="font-black text-stone-900 dark:text-white">{accountName}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(accountName, 'accountName')}
                  className="p-1 rounded-md bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Salin Nama Akaun"
                >
                  {copiedField === 'accountName' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Account Number */}
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-800">
              <div>
                <span className="text-stone-500 dark:text-stone-400 font-bold block text-[11px]">No. Akaun:</span>
                <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm sm:text-base tracking-wider">
                  {accountNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(accountNumberRaw, 'accountNumber')}
                className="px-2.5 py-1.5 rounded-lg bg-pink-100 hover:bg-pink-200 dark:bg-pink-900/60 dark:hover:bg-pink-800 text-pink-800 dark:text-pink-200 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                title="Salin No. Akaun"
              >
                {copiedField === 'accountNumber' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin No. Akaun</span>
                  </>
                )}
              </button>
            </div>

            {/* Order Reference */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-stone-500 dark:text-stone-400 font-bold shrink-0">Rujukan Pesanan:</span>
              <div className="flex items-center gap-1.5 text-right">
                <span className="font-bold text-stone-900 dark:text-white bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-pink-200 dark:border-stone-700 text-[11px]">
                  {orderRef}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(orderRef, 'orderRef')}
                  className="p-1 rounded-md bg-white dark:bg-stone-800 border border-pink-200 dark:border-stone-700 text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Salin Rujukan Pesanan"
                >
                  {copiedField === 'orderRef' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {orderTotal && (
              <div className="flex items-center justify-between pt-1.5 border-t border-pink-200/80 dark:border-pink-900/80">
                <span className="text-stone-600 dark:text-stone-300 font-bold">Jumlah Perlu Dibayar:</span>
                <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm sm:text-base">
                  RM {orderTotal.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Verification & Action Notice */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSendWhatsAppProof}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hantar Resit ke WhatsApp Khairul (011-11135503)</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-stone-500 dark:text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>DuitNow QR Kebangsaan diiktiraf PayNet Malaysia dan Bank Negara Malaysia (BNM).</span>
          </div>
        </div>

      </div>
    </div>
  );
};

/**
 * Visual Representation of the Official Malaysian National DuitNow QR Standee (OCBC Bank)
 * Renders the genuine, scannable QR Code using the EMVCo standard payload, or the merchant's exact uploaded standee image.
 */
export const DuitNowStandeeVisual: React.FC<{
  merchantName: string;
  customImage?: string;
  compact?: boolean;
  orderTotal?: number;
  orderId?: string;
}> = ({
  merchantName,
  customImage,
  compact = false,
  orderTotal,
  orderId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const widthClass = compact ? 'w-48 sm:w-52' : 'w-56 sm:w-64';

  useEffect(() => {
    if (!customImage && canvasRef.current) {
      const payload = buildDuitNowPayload(
        '7061163993',
        merchantName || 'KHAIRUL FRESH AND FROZEN FOOD',
        orderTotal,
        orderId
      );

      QRCode.toCanvas(
        canvasRef.current,
        payload,
        {
          width: compact ? 180 : 220,
          margin: 1,
          color: {
            dark: '#ED0058', // Standard DuitNow Pink/Magenta
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'M',
        },
        (error) => {
          if (error) console.error('Failed to generate DuitNow QR canvas:', error);
        }
      );
    }
  }, [customImage, merchantName, orderTotal, orderId, compact]);

  if (customImage) {
    return (
      <div className={`${widthClass} bg-white rounded-2xl border-4 border-[#ED0058] shadow-lg overflow-hidden flex flex-col items-center select-none text-stone-900 font-sans`}>
        <img
          src={customImage}
          alt="DuitNow QR OCBC Standee"
          className="w-full h-auto object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={`${widthClass} bg-white rounded-2xl border-4 border-[#ED0058] shadow-lg overflow-hidden flex flex-col items-center select-none text-stone-900 font-sans`}>
      
      {/* Top Header: DuitNow Logo */}
      <div className="w-full pt-3 pb-1 px-4 flex flex-col items-center justify-center bg-white">
        {/* DuitNow Pink Emblem */}
        <div className="flex items-center justify-center mb-0.5">
          <svg className="w-9 h-9" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="24" fill="#ED0058" />
            <path
              d="M50 20C33.4315 20 20 33.4315 20 50C20 66.5685 33.4315 80 50 80C66.5685 80 80 66.5685 80 50C80 33.4315 66.5685 20 50 20ZM44 34H54C62.8366 34 70 41.1634 70 50C70 58.8366 62.8366 66 54 66H44V34Z"
              fill="white"
            />
            <path
              d="M44 42H52C56.4183 42 60 45.5817 60 50C60 54.4183 56.4183 58 52 58H44V42Z"
              fill="#ED0058"
            />
          </svg>
        </div>

        <div className="text-center">
          <span className="font-extrabold text-[15px] tracking-tight text-stone-900 block leading-tight">
            Duit<span className="text-[#ED0058]">Now</span>
          </span>
          <span className="text-[10px] font-bold tracking-widest text-stone-700 block uppercase -mt-0.5">
            QR
          </span>
        </div>
      </div>

      {/* Center QR Code Container (Real Scannable EMVCo QR Canvas) */}
      <div className="w-full px-3 py-1 flex flex-col items-center bg-white">
        <div className="w-full aspect-square max-w-[210px] p-1.5 bg-white rounded-lg border border-pink-200 flex items-center justify-center shadow-2xs">
          <canvas ref={canvasRef} className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Merchant Business Name */}
      <div className="w-full px-2 py-1.5 text-center bg-white">
        <h5 className="font-black text-[11px] sm:text-xs text-stone-900 leading-tight uppercase tracking-tight line-clamp-2">
          {merchantName}
        </h5>
      </div>

      {/* Pink Bar: MALAYSIA NATIONAL QR */}
      <div className="w-full py-1.5 px-2 bg-[#ED0058] text-white text-center">
        <span className="font-black text-[10px] sm:text-[11px] tracking-wider uppercase block">
          MALAYSIA NATIONAL QR
        </span>
      </div>

      {/* Footer: Merchant Partner OCBC */}
      <div className="w-full py-2.5 px-3 bg-white flex flex-col items-center justify-center border-t border-stone-100">
        <span className="text-[8px] text-stone-500 font-semibold tracking-tight text-center block mb-0.5">
          Accepted by participating Banks and e-wallets
        </span>
        <span className="text-[7.5px] italic text-stone-600 block mb-1">
          Merchant Partner
        </span>

        {/* Official OCBC Logo Vector */}
        <div className="flex items-center gap-1.5">
          {/* OCBC Red Sailing Junk Emblem */}
          <div className="w-5 h-5 rounded-full bg-[#E51B24] flex items-center justify-center text-white shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z"/>
              <path d="M4 12c0 4.41 3.59 8 8 8s8-3.59 8-8c0-.72-.1-1.41-.28-2.07L12 14.5l-7.72-4.57C4.1 10.59 4 11.28 4 12z" opacity="0.3"/>
            </svg>
          </div>
          {/* OCBC Bold Lettering */}
          <span className="font-black text-[#E51B24] text-xs tracking-wider">
            OCBC
          </span>
        </div>
      </div>

    </div>
  );
};
