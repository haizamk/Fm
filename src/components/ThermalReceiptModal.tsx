import React, { useState, useRef } from 'react';
import { 
  Printer, 
  X, 
  Copy, 
  Check, 
  Scissors, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  Package, 
  Sparkles,
  QrCode,
  FileText
} from 'lucide-react';
import { OrderRecord } from '../types';
import { getCutLabel } from '../data/products';
import { dataStorageService } from '../services/dataStorage';

interface ThermalReceiptModalProps {
  order: OrderRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [showPrice, setShowPrice] = useState(true);
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const isPickup = order.fulfillmentType === 'pickup' || order.customer.fulfillmentType === 'pickup';

  // Load thermal receipt settings from site settings
  const siteSettings = dataStorageService.getSiteSettings();
  const receiptSettings: import('../types').ThermalReceiptSettings = siteSettings?.thermalReceiptSettings || {
    showLogo: true,
    logoUrl: '',
    showPromoText: true,
    promoText: '★ TAWARAN HEBAT: Dapatkan Diskaun RM6 untuk Belian RM150+ ★',
    storeName: 'KHAIRUL FRESH FOOD',
    storeTagline: 'PASAR SEMENTARA SEMENYIH (GA 59)',
    storeAddress: 'Gerai No GA 59, Pasar Semenyih, Selangor',
    storePhone: '011-11135503',
    halalTag: '100% HALAL & SEMBELIH SEGAR PAGI',
    footerNotes: 'Terima kasih atas sokongan anda kepada produk segar tempatan!',
    paperWidth: '80mm',
    showCutDetails: true,
    showPrices: true,
  };

  // Format order date
  const orderTimeFormatted = new Date(order.createdAt).toLocaleString('ms-MY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Calculate totals
  const totalChickens = order.items.reduce((sum, it) => sum + it.quantity, 0);

  // Generate plain text for raw thermal printers or clipboard
  const generatePlainTextReceipt = () => {
    const divider = '================================';
    const subDivider = '--------------------------------';
    
    let text = '';
    text += `      ${(receiptSettings.storeName || 'KHAIRUL FRESH FOOD').toUpperCase()}       \n`;
    text += `   ${(receiptSettings.storeTagline || 'PASAR SEMENTARA SEMENYIH').toUpperCase()}    \n`;
    text += `       ${(receiptSettings.storeAddress || 'GERAI NO GA 59').toUpperCase()}          \n`;
    text += `   TEL: ${receiptSettings.storePhone || '011-11135503'}\n`;
    text += `  ${receiptSettings.halalTag || '100% HALAL & SEMBELIH PAGI'}   \n`;
    if (receiptSettings.promoText) {
      text += `${subDivider}\n`;
      text += `[PROMOSI]: ${receiptSettings.promoText}\n`;
    }
    text += `${divider}\n`;
    text += `RESIT BUNGKUSAN / BUTCHER SLIP\n`;
    text += `NO. PESANAN : #${order.orderId}\n`;
    text += `TARIKH ORDER: ${orderTimeFormatted}\n`;
    text += `STATUS BAYAR: LUNAS (HITPAY)\n`;
    text += `${divider}\n`;
    text += `[MAKLUMAT PENGHANTARAN / AMBIL]\n`;
    text += `JENIS  : ${isPickup ? 'AMBIL SENDIRI (SELF-PICKUP)' : 'PENGHANTARAN RIDER'}\n`;
    text += `TARIKH : ${order.customer.deliveryDate}\n`;
    text += `SLOT   : ${isPickup ? (order.customer.pickupTime || '09:00 AM') : order.customer.deliverySlot.toUpperCase()}\n`;
    text += `NAMA   : ${order.customer.fullName}\n`;
    text += `TEL    : ${order.customer.phone}\n`;
    if (isPickup) {
      text += `LOKASI : Gerai GA 59, Pasar Semenyih\n`;
    } else {
      text += `ALAMAT : ${order.customer.address},\n         ${order.customer.postcode} ${order.customer.city}\n`;
    }
    if (order.customer.orderNotes) {
      text += `NOTA   : ${order.customer.orderNotes}\n`;
    }
    if (order.packagingType === 'cooler-box' || (order.coolerBoxFee && order.coolerBoxFee > 0)) {
      text += `PEK    : KOTAK PENEBAT COOLER BOX (+RM ${(order.coolerBoxFee || 0).toFixed(2)})\n`;
    }
    text += `${divider}\n`;
    text += `[PERINCIAN ITEM & POTONGAN]\n`;
    
    order.items.forEach((item, idx) => {
      text += `${idx + 1}. ${item.product.name.toUpperCase()}\n`;
      text += `   QTY : ${item.quantity} ${item.product.unit || 'unit'}\n`;
      if (item.selectedWeightOption) {
        text += `   SAIZ: ${item.selectedWeightOption.weightLabel}\n`;
      }
      if (item.product.supportsCutting && item.selectedCut) {
        text += `   >> POTONG: ${getCutLabel(item.selectedCut, item.product).toUpperCase()}\n`;
      }
      if (item.organVariationLabel) {
        text += `   PILIHAN: ${item.organVariationLabel}\n`;
      }
      if (item.specialNotes) {
        text += `   NOTA: ${item.specialNotes}\n`;
      }
      if (showPrice) {
        text += `   HARGA: RM ${item.itemTotalPrice.toFixed(2)}\n`;
      }
      text += `${subDivider}\n`;
    });

    text += `JUMLAH AYAM: ${totalChickens} EKOR/PEK\n`;
    if (showPrice) {
      text += `SUBTOTAL   : RM ${(order.subtotal || order.total).toFixed(2)}\n`;
      if (order.deliveryFee && order.deliveryFee > 0) {
        text += `CAJ HANTAR : RM ${order.deliveryFee.toFixed(2)}\n`;
      }
      if (order.discount && order.discount > 0) {
        text += `DISKAUN    : -RM ${order.discount.toFixed(2)}\n`;
      }
      text += `${divider}\n`;
      text += `JUMLAH BESAR : RM ${order.total.toFixed(2)}\n`;
    }
    text += `${divider}\n`;
    text += ` Jaminan Segar Sembelih Pagi \n`;
    text += `  Terima Kasih Atas Sokongan! \n`;
    text += `\n\n\n`; // Spacing for thermal tear off
    return text;
  };

  const handleCopyText = () => {
    const text = generatePlainTextReceipt();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Dedicated Print Function for 80mm Thermal Receipt
  const handlePrintThermal = () => {
    const printWindow = window.open('', '_blank', 'width=380,height=600');
    if (!printWindow) {
      // Fallback to window.print if popup blocked
      window.print();
      return;
    }

    const itemsHtml = order.items.map((item, idx) => {
      const cutLabel = item.product.supportsCutting && item.selectedCut
        ? getCutLabel(item.selectedCut, item.product)
        : null;

      return `
        <div class="item-block">
          <div class="item-header">
            <span class="item-num">${idx + 1}.</span>
            <span class="item-name">${item.product.name}</span>
            <span class="item-qty">${item.quantity}x</span>
          </div>
          <div class="item-details">
            ${item.selectedWeightOption ? `<div>• Saiz: <strong>${item.selectedWeightOption.weightLabel}</strong></div>` : ''}
            ${cutLabel ? `<div class="cut-badge">✂ POTONG: <strong>${cutLabel.toUpperCase()}</strong></div>` : ''}
            ${item.organVariationLabel ? `<div>• Pilihan: ${item.organVariationLabel}</div>` : ''}
            ${item.packaging ? `<div>• Pembungkusan: ${item.packaging}</div>` : ''}
            ${item.specialNotes ? `<div class="item-note">★ Nota: ${item.specialNotes}</div>` : ''}
          </div>
          ${showPrice ? `<div class="item-price">RM ${item.itemTotalPrice.toFixed(2)}</div>` : ''}
        </div>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Resit Thermal 80mm - #${order.orderId}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 3mm 2mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace, sans-serif;
            font-size: 11px;
            line-height: 1.35;
            color: #000;
            background: #fff;
            width: 76mm;
            margin: 0 auto;
            padding: 4px 2px;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          .uppercase { text-transform: uppercase; }
          
          .store-header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 6px;
            margin-bottom: 6px;
          }
          .store-title {
            font-size: 15px;
            font-weight: 900;
            letter-spacing: 0.5px;
          }
          .store-sub {
            font-size: 10px;
            margin-top: 2px;
          }
          
          .order-badge-box {
            border: 2px solid #000;
            padding: 6px 4px;
            text-align: center;
            margin: 6px 0;
            background: #fff;
          }
          .order-id {
            font-size: 16px;
            font-weight: 900;
            letter-spacing: 1px;
          }
          .fulfillment-tag {
            display: inline-block;
            font-size: 11px;
            font-weight: 900;
            margin-top: 2px;
            padding: 1px 4px;
            border: 1px solid #000;
          }

          .section-divider {
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
          .double-divider {
            border-top: 2px solid #000;
            margin: 6px 0;
          }

          .meta-row {
            display: flex;
            justify-content: space-between;
            font-size: 10.5px;
            margin-bottom: 2px;
          }

          .address-box {
            border: 1px dashed #000;
            padding: 4px;
            margin: 6px 0;
            font-size: 10.5px;
          }
          .address-title {
            font-weight: bold;
            font-size: 10px;
            margin-bottom: 2px;
          }

          .item-block {
            padding: 4px 0;
            border-bottom: 1px dotted #888;
          }
          .item-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 11.5px;
          }
          .item-name {
            flex: 1;
            padding: 0 4px;
          }
          .item-qty {
            font-size: 12px;
            font-weight: 900;
          }
          .item-details {
            font-size: 10px;
            padding-left: 12px;
            margin-top: 2px;
          }
          .cut-badge {
            font-weight: 900;
            font-size: 10.5px;
            margin: 2px 0;
            padding: 1px 2px;
            background: #eee;
            display: inline-block;
          }
          .item-note {
            font-style: italic;
            font-weight: bold;
          }
          .item-price {
            text-align: right;
            font-size: 10.5px;
            font-weight: bold;
            margin-top: 2px;
          }

          .totals-table {
            width: 100%;
            margin-top: 6px;
            font-size: 11px;
          }
          .totals-table td {
            padding: 2px 0;
          }
          .grand-total {
            font-size: 14px;
            font-weight: 900;
            border-top: 1px dashed #000;
            border-bottom: 2px solid #000;
            padding: 4px 0 !important;
          }

          .footer-box {
            text-align: center;
            margin-top: 10px;
            font-size: 9.5px;
            line-height: 1.3;
          }
        </style>
      </head>
      <body>
        <div class="store-header">
          ${receiptSettings.logoUrl ? `<img src="${receiptSettings.logoUrl}" style="max-height: 48px; max-width: 140px; margin: 0 auto 4px auto; display: block;" alt="Logo" />` : ''}
          <div class="store-title">${receiptSettings.storeName || 'KHAIRUL FRESH FOOD'}</div>
          <div class="store-sub">${receiptSettings.storeTagline || 'Gerai No GA 59, Pasar Semenyih'}</div>
          <div class="store-sub">${receiptSettings.storeAddress || 'Pasar Semenyih, Selangor'}</div>
          <div class="store-sub">Tel: ${receiptSettings.storePhone || '011-11135503'}</div>
          <div class="store-sub bold">${receiptSettings.halalTag || '100% HALAL & SEMBELIH SEGAR PAGI'}</div>
          ${receiptSettings.promoText ? `
            <div style="margin-top: 4px; padding: 3px; border: 1px dashed #000; font-weight: bold; font-size: 10px;">
              ${receiptSettings.promoText}
            </div>
          ` : ''}
        </div>

        <div class="order-badge-box">
          <div style="font-size: 10px; font-weight: bold;">NO. PESANAN BUNGKUSAN</div>
          <div class="order-id">#${order.orderId}</div>
          <div class="fulfillment-tag">
            ${isPickup ? '🏪 AMBIL SENDIRI (PASAR)' : '🚚 PENGHANTARAN RIDER'}
          </div>
        </div>

        <div class="meta-row">
          <span>Tarikh Order:</span>
          <span class="bold">${orderTimeFormatted}</span>
        </div>
        <div class="meta-row">
          <span>Tarikh Slot:</span>
          <span class="bold" style="font-size: 11.5px;">${order.customer.deliveryDate}</span>
        </div>
        <div class="meta-row">
          <span>Slot Masa:</span>
          <span class="bold">${isPickup ? (order.customer.pickupTime || '09:00 AM') : order.customer.deliverySlot.toUpperCase()}</span>
        </div>
        <div class="meta-row">
          <span>Status Bayaran:</span>
          <span class="bold">LUNAS (HITPAY)</span>
        </div>

        <div class="section-divider"></div>

        <div class="address-box">
          <div class="address-title">PENERIMA / PELANGGAN:</div>
          <div class="bold" style="font-size: 12px;">${order.customer.fullName}</div>
          <div>Tel: <strong>${order.customer.phone}</strong></div>
          ${isPickup 
            ? '<div style="margin-top: 2px;">Ambil di: Gerai GA 59 Pasar Semenyih</div>' 
            : `<div style="margin-top: 2px;">Alamat: ${order.customer.address}, ${order.customer.postcode} ${order.customer.city}</div>`
          }
          ${order.packagingType === 'cooler-box' || (order.coolerBoxFee && order.coolerBoxFee > 0)
            ? `<div style="margin-top: 2px; font-weight: bold;">★ Pembungkusan: KOTAK PENEBAT COOLER BOX</div>`
            : ''
          }
          ${order.customer.orderNotes ? `<div style="margin-top: 3px; font-weight: bold; background: #eee; padding: 2px;">★ Nota: ${order.customer.orderNotes}</div>` : ''}
        </div>

        <div class="section-divider"></div>
        <div class="bold" style="font-size: 11px; margin-bottom: 4px;">SENARAI POTONGAN & ITEM (${totalChickens} EKOR/PEK):</div>

        ${itemsHtml}

        <div class="double-divider"></div>

        ${showPrice ? `
          <table class="totals-table">
            <tr>
              <td>Subtotal Produk:</td>
              <td class="text-right bold">RM ${(order.subtotal || order.total).toFixed(2)}</td>
            </tr>
            ${(order.packagingType === 'cooler-box' || (order.coolerBoxFee && order.coolerBoxFee > 0)) ? `
              <tr>
                <td>Kotak Cooler Box:</td>
                <td class="text-right bold">RM ${(order.coolerBoxFee || (totalChickens < 10 ? 5 : 10)).toFixed(2)}</td>
              </tr>
            ` : ''}
            ${order.deliveryFee && order.deliveryFee > 0 ? `
              <tr>
                <td>Caj Penghantaran:</td>
                <td class="text-right bold">RM ${order.deliveryFee.toFixed(2)}</td>
              </tr>
            ` : ''}
            ${order.discount && order.discount > 0 ? `
              <tr>
                <td>Diskaun:</td>
                <td class="text-right bold">-RM ${order.discount.toFixed(2)}</td>
              </tr>
            ` : ''}
            <tr class="grand-total">
              <td>JUMLAH BAYARAN:</td>
              <td class="text-right">RM ${order.total.toFixed(2)}</td>
            </tr>
          </table>
        ` : ''}

        <div class="footer-box">
          <div style="margin: 6px auto; text-align: center;">
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(order.orderId)}" 
              alt="QR Code Pesanan" 
              style="width: 80px; height: 80px; display: block; margin: 0 auto;" 
            />
            <div style="font-size: 8.5px; font-weight: bold; margin-top: 2px;">IMBAS UNTUK STATUS & PICKUP</div>
          </div>
          <div class="bold">*** AYAM SEGAR SEMBELIH PAGI ***</div>
          <div>${receiptSettings.footerNotes || 'Dibungkus Bersih & Mengikut Sunnah'}</div>
          <div>Terima kasih atas sokongan anda!</div>
          <div style="margin-top: 4px; font-family: monospace;">[ ${receiptSettings.storeName || 'KHAIRUL FRESH FOOD'} - 80MM ]</div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Trigger print once content is loaded
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-300 dark:border-stone-700 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-linear-to-r from-stone-900 via-stone-800 to-emerald-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Printer className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black tracking-tight">
                  Cetak Resit Thermal 80mm
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Label Bungkusan
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Format saiz standard 80mm untuk ditampal pada plastik / kotak pesanan.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-700/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="p-3 bg-stone-100 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 font-bold text-stone-700 dark:text-stone-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showPrice}
                onChange={(e) => setShowPrice(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
              />
              <span>Tunjuk Harga & Jumlah</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-stone-700 hover:bg-stone-50 dark:hover:bg-stone-600 text-stone-800 dark:text-white border-stone-300 dark:border-stone-600'
              }`}
              title="Salin teks format thermal untuk peranti Bluetooth / RawBT"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Teks Disalin!' : 'Salin Teks'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintThermal}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (80mm)</span>
            </button>
          </div>
        </div>

        {/* Realistic 80mm Thermal Paper Preview Box */}
        <div className="p-4 sm:p-6 bg-stone-200 dark:bg-stone-950 overflow-y-auto flex-1 flex justify-center">
          
          <div 
            ref={receiptRef}
            className="w-full max-w-[320px] bg-white text-black p-5 shadow-2xl rounded-sm font-mono text-xs border border-stone-300 transition-all select-all leading-snug"
            style={{ minHeight: '480px' }}
          >
            {/* Header */}
            <div className="text-center pb-3 border-b-2 border-dashed border-black">
              {receiptSettings.logoUrl && (
                <img
                  src={receiptSettings.logoUrl}
                  alt="Store Logo"
                  className="max-h-12 max-w-[140px] mx-auto mb-1 object-contain grayscale"
                />
              )}
              <div className="text-base font-black tracking-wide">{receiptSettings.storeName || 'KHAIRUL FRESH FOOD'}</div>
              <div className="text-[11px] text-stone-800 mt-0.5">{receiptSettings.storeTagline || 'Pasar Sementara Semenyih (GA 59)'}</div>
              <div className="text-[10px] text-stone-700">{receiptSettings.storeAddress || 'Pasar Semenyih, Selangor'}</div>
              <div className="text-[10px] text-stone-700">WhatsApp: {receiptSettings.storePhone || '011-11135503'}</div>
              <div className="text-[10px] font-bold mt-1 uppercase">★ {receiptSettings.halalTag || '100% Halal & Sembelih Segar Pagi'} ★</div>
              {receiptSettings.promoText && (
                <div className="mt-1.5 p-1 border border-dashed border-black text-[10px] font-bold bg-amber-50">
                  {receiptSettings.promoText}
                </div>
              )}
            </div>

            {/* Order Highlight Box */}
            <div className="border-2 border-black p-2.5 my-3 text-center bg-stone-50">
              <span className="text-[10px] font-bold block uppercase text-stone-600">ID Tempahan Bungkusan</span>
              <strong className="text-lg font-black block tracking-wider">#{order.orderId}</strong>
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-black border border-black uppercase bg-white">
                {isPickup ? '🏪 AMBIL SENDIRI (PASAR)' : '🚚 PENGHANTARAN RIDER'}
              </span>
            </div>

            {/* Timings */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-black pb-2.5">
              <div className="flex justify-between">
                <span className="text-stone-600">Tarikh Order:</span>
                <span className="font-bold">{orderTimeFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Tarikh Slot:</span>
                <span className="font-black text-xs">{order.customer.deliveryDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Slot Masa:</span>
                <span className="font-bold">{isPickup ? (order.customer.pickupTime || '09:00 AM') : order.customer.deliverySlot.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Status Bayaran:</span>
                <span className="font-bold text-emerald-800">LUNAS (HitPay)</span>
              </div>
            </div>

            {/* Customer Details Box */}
            <div className="border border-dashed border-black p-2.5 my-2.5 bg-stone-50 space-y-0.5 text-[11px]">
              <div className="font-bold text-[10px] uppercase text-stone-500">Penerima & Alamat:</div>
              <div className="font-black text-xs">{order.customer.fullName}</div>
              <div>Tel: <strong className="font-mono">{order.customer.phone}</strong></div>
              {isPickup ? (
                <div className="text-[10px] text-stone-700 mt-1">Ambil di Gerai GA 59, Pasar Semenyih</div>
              ) : (
                <div className="text-[10px] text-stone-700 mt-1 leading-tight">
                  {order.customer.address}, {order.customer.postcode} {order.customer.city}
                </div>
              )}
              {order.customer.orderNotes && (
                <div className="mt-1.5 p-1 bg-amber-100 border border-amber-300 text-[10px] font-bold text-amber-900">
                  ★ NOTA: {order.customer.orderNotes}
                </div>
              )}
            </div>

            {/* Item list */}
            <div className="pt-1">
              <div className="font-black text-[11px] uppercase mb-1.5 flex justify-between">
                <span>Spesifikasi Item & Potongan:</span>
                <span>({totalChickens} unit)</span>
              </div>

              <div className="divide-y divide-dotted divide-stone-400">
                {order.items.map((item, idx) => {
                  const cutLabel = item.product.supportsCutting && item.selectedCut
                    ? getCutLabel(item.selectedCut, item.product)
                    : null;

                  return (
                    <div key={idx} className="py-2 space-y-1">
                      <div className="flex justify-between items-start font-bold">
                        <div className="flex items-start gap-1">
                          <span>{idx + 1}.</span>
                          <span className="font-black">{item.product.name}</span>
                        </div>
                        <span className="font-black text-sm bg-stone-100 px-1 border border-stone-300">
                          {item.quantity}x
                        </span>
                      </div>

                      <div className="pl-3 text-[10px] space-y-0.5 text-stone-800">
                        {item.selectedWeightOption && (
                          <div>• Saiz: <strong>{item.selectedWeightOption.weightLabel}</strong></div>
                        )}
                        {cutLabel && (
                          <div className="font-black text-[11px] bg-stone-100 p-1 border border-black inline-block mt-0.5">
                            ✂ POTONG: {cutLabel.toUpperCase()}
                          </div>
                        )}
                        {item.organVariationLabel && (
                          <div>• Pilihan: <strong>{item.organVariationLabel}</strong></div>
                        )}
                        {item.packaging && (
                          <div>• Pek: {item.packaging}</div>
                        )}
                        {item.specialNotes && (
                          <div className="font-bold italic text-amber-800">★ Nota: {item.specialNotes}</div>
                        )}
                      </div>

                      {showPrice && (
                        <div className="text-right font-bold text-[11px]">
                          RM {item.itemTotalPrice.toFixed(2)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pricing Section */}
            {showPrice && (
              <div className="border-t-2 border-black pt-2 mt-2 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold">RM ${(order.subtotal || order.total).toFixed(2)}</span>
                </div>
                {(order.packagingType === 'cooler-box' || (order.coolerBoxFee && order.coolerBoxFee > 0)) ? (
                  <div className="flex justify-between">
                    <span>Kotak Cooler Box:</span>
                    <span className="font-bold">RM ${(order.coolerBoxFee || (totalChickens < 10 ? 5 : 10)).toFixed(2)}</span>
                  </div>
                ) : null}
                {order.deliveryFee && order.deliveryFee > 0 ? (
                  <div className="flex justify-between">
                    <span>Caj Penghantaran:</span>
                    <span className="font-bold">RM {order.deliveryFee.toFixed(2)}</span>
                  </div>
                ) : null}
                {order.discount && order.discount > 0 ? (
                  <div className="flex justify-between text-emerald-800">
                    <span>Diskaun:</span>
                    <span className="font-bold">-RM {order.discount.toFixed(2)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between border-t border-b border-black py-1 font-black text-sm">
                  <span>JUMLAH BESAR:</span>
                  <span>RM {order.total.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-3 mt-3 border-t border-dashed border-black text-[10px] space-y-1 text-stone-700">
              <div className="flex flex-col items-center justify-center py-1">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(order.orderId)}`}
                  alt="QR Code Resit"
                  className="w-16 h-16 object-contain"
                />
                <span className="text-[9px] font-bold text-stone-600 mt-1">
                  IMBAS KOD QR PESANAN
                </span>
              </div>
              <div className="font-black">*** AYAM SEGAR SEMBELIH PAGI ***</div>
              <div>{receiptSettings.footerNotes || 'Dibungkus Bersih & Rapi untuk Anda'}</div>
              <div className="text-[9px]">Simpan dalam suhu sejuk 0°C - 4°C</div>
              <div className="font-mono text-[9px] text-stone-400 mt-2">--- POTONG DI SINI ---</div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-100 dark:bg-stone-800/90 border-t border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-stone-500 dark:text-stone-400">
            Sesuai untuk semua pencetak thermal 80mm ESC/POS USB, Bluetooth, atau Network.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-600 text-xs font-bold transition-colors cursor-pointer"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={handlePrintThermal}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Resit Thermal (80mm)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
