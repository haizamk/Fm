import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  User, 
  ShoppingBag, 
  MapPin, 
  Calendar, 
  Clock, 
  Truck, 
  Store,
  Scissors,
  Info,
  AlertCircle,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  Receipt,
  Edit3
} from 'lucide-react';
import { PRODUCTS, CHICKEN_CUT_OPTIONS } from '../data/products';
import { getOfficialWhatsAppLink, openWhatsAppSafe } from '../utils/whatsappHelper';
import { dataStorageService } from '../services/dataStorage';
import { DuitNowStandeeVisual } from './DuitNowOCBCQR';

interface WhatsAppQuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCustomerName?: string;
}

/**
 * Menjana pilihan masa penghantaran pintar yang menapis keluar hari cuti (Setiap ISNIN CUTI).
 */
function getOperatingDeliveryTimingOptions() {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Ahad, 1 = Isnin, 2 = Selasa, 3 = Rabu, 4 = Khamis, 5 = Jumaat, 6 = Sabtu
  const currentHour = now.getHours();

  const options: string[] = [];

  // KES 1: Hari Ini adalah ISNIN (Kedai & Pasar Cuti Hari Ini)
  if (currentDay === 1) {
    options.push('Pagi Esok / Selasa (8:00 AM - 11:00 AM)');
    options.push('Tengah Hari Esok / Selasa (11:00 AM - 1:00 PM)');
    options.push('Lusa / Rabu (8:00 AM - 12:00 PM)');
    return {
      options,
      defaultTiming: 'Pagi Esok / Selasa (8:00 AM - 11:00 AM)',
      isTodayMonday: true,
      notice: 'Hari ini (Isnin) cuti mingguan operasi pasar & ladang. Tempahan dibuka untuk esok (Selasa) dan seterusnya.'
    };
  }

  // KES 2: Hari Ini adalah AHAD (Esok adalah ISNIN CUTI)
  if (currentDay === 0) {
    if (currentHour < 12) {
      options.push('Hari Ini / Ahad (Sebelum 12:00 PM)');
    }
    // Langkau Isnin! Terus ke Selasa
    options.push('Pagi Selasa (8:00 AM - 11:00 AM)');
    options.push('Tengah Hari Selasa (11:00 AM - 1:00 PM)');
    options.push('Rabu (8:00 AM - 12:00 PM)');
    return {
      options,
      defaultTiming: currentHour < 12 ? 'Hari Ini / Ahad (Sebelum 12:00 PM)' : 'Pagi Selasa (8:00 AM - 11:00 AM)',
      isTodayMonday: false,
      notice: 'Esok (Isnin) adalah hari cuti mingguan. Penghantaran berikutnya bermula hari Selasa.'
    };
  }

  // KES 3: Hari SABTU (Esok adalah Ahad, kedai buka)
  if (currentDay === 6) {
    if (currentHour < 12) {
      options.push('Hari Ini / Sabtu (Sebelum 12:00 PM)');
    }
    options.push('Pagi Esok / Ahad (8:00 AM - 11:00 AM)');
    options.push('Tengah Hari Esok / Ahad (11:00 AM - 1:00 PM)');
    return {
      options,
      defaultTiming: currentHour < 12 ? 'Hari Ini / Sabtu (Sebelum 12:00 PM)' : 'Pagi Esok / Ahad (8:00 AM - 11:00 AM)',
      isTodayMonday: false,
      notice: ''
    };
  }

  // KES 4: Hari SELASA hingga JUMAAT
  if (currentHour < 12) {
    options.push('Hari Ini (Sebelum 12:00 PM)');
  }
  options.push('Pagi Esok (8:00 AM - 11:00 AM)');
  options.push('Petang Esok (11:00 AM - 1:00 PM)');
  if (options.length < 3) {
    options.push('Lusa Pagi (8:00 AM - 11:00 AM)');
  }

  return {
    options,
    defaultTiming: currentHour < 12 ? 'Hari Ini (Sebelum 12:00 PM)' : 'Pagi Esok (8:00 AM - 11:00 AM)',
    isTodayMonday: false,
    notice: ''
  };
}

export const WhatsAppQuickOrderModal: React.FC<WhatsAppQuickOrderModalProps> = ({
  isOpen,
  onClose,
  defaultCustomerName = '',
}) => {
  // 1. Nama Customer
  const [customerName, setCustomerName] = useState(defaultCustomerName);

  // 2. Produk Ayam & Potongan
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(['ayam-segar-standard']);
  const [selectedCut, setSelectedCut] = useState<string>('potong-12');
  const [customProductNotes, setCustomProductNotes] = useState<string>('Ayam Segar Standard (1 ekor) - Potong 12 Bahagian (Paling Popular)');
  const notesInputRef = useRef<HTMLInputElement>(null);

  // Helper untuk rumusan nama produk
  const getProductSummary = (prodIds: string[]) => {
    const selected = PRODUCTS.filter(p => prodIds.includes(p.id));
    if (selected.length === 0) return 'Ayam Segar Standard';
    return selected.map(p => p.name).join(', ');
  };

  // Logik bila customer tekan pilihan potong -> automatik masuk ke dalam kotak
  const handleCutChange = (cutId: string) => {
    setSelectedCut(cutId);
    if (cutId === 'lain-lain') {
      // Arahan customer tulis ikut pilihan sendiri
      setCustomProductNotes('');
      setTimeout(() => {
        notesInputRef.current?.focus();
      }, 80);
    } else {
      const cutObj = CHICKEN_CUT_OPTIONS.find(c => c.id === cutId);
      const cutLabel = cutObj ? cutObj.label : cutId;
      const prodsStr = getProductSummary(selectedProductIds);
      setCustomProductNotes(`${prodsStr} - ${cutLabel}`);
    }
  };

  // 3. Lokasi Penghantaran atau Ambik di Pasar
  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryLocation, setDeliveryLocation] = useState<string>('Semenyih / Eco Majestic');

  // 4. Bila Nak Hantar / Tarikh & Masa (Logik Pintar: Isnin Cuti Dikecualikan)
  const timingData = useMemo(() => getOperatingDeliveryTimingOptions(), []);
  const [deliveryTiming, setDeliveryTiming] = useState<string>(timingData.defaultTiming);
  const [mondayError, setMondayError] = useState<string>('');

  // 5. DuitNow & Maklumat Bank Syarikat
  const duitnow = useMemo(() => {
    return dataStorageService.getSiteSettings()?.duitnowConfig || {
      bankName: 'OCBC Bank (Malaysia) Berhad',
      accountName: 'KHAIRUL FRESH AND FROZEN FOOD',
      accountNumber: '70 6116 3993',
      duitnowId: '202503301954',
      qrImageUrl: '',
    };
  }, []);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedDuitNowId, setCopiedDuitNowId] = useState(false);

  const handleCopyAccount = (accNo: string) => {
    navigator.clipboard.writeText(accNo.replace(/\s+/g, ''));
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleCopyDuitNowId = (id: string) => {
    navigator.clipboard.writeText(id.replace(/\s+/g, ''));
    setCopiedDuitNowId(true);
    setTimeout(() => setCopiedDuitNowId(false), 2000);
  };

  const isMondaySelected = useMemo(() => {
    const lower = deliveryTiming.toLowerCase();
    return lower.includes('isnin') || lower.includes('monday');
  }, [deliveryTiming]);

  if (!isOpen) return null;

  const toggleProductSelection = (prodId: string) => {
    let updatedIds: string[];
    if (selectedProductIds.includes(prodId)) {
      if (selectedProductIds.length === 1) return; // Keep at least one
      updatedIds = selectedProductIds.filter(id => id !== prodId);
    } else {
      updatedIds = [...selectedProductIds, prodId];
    }
    setSelectedProductIds(updatedIds);

    // Sekiranya bukan pilihan 'lain-lain', automatik kemaskini teks dalam kotak
    if (selectedCut !== 'lain-lain') {
      const cutObj = CHICKEN_CUT_OPTIONS.find(c => c.id === selectedCut);
      const cutLabel = cutObj ? cutObj.label : 'Potong 12';
      const prodsStr = getProductSummary(updatedIds);
      setCustomProductNotes(`${prodsStr} - ${cutLabel}`);
    }
  };

  const handleSendWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (isMondaySelected) {
      setMondayError('Khairul Fresh Food tutup setiap hari Isnin untuk cuti operasi pasar & ladang. Sila pilih hari Selasa hingga Ahad.');
      return;
    }

    const cutLabel = selectedCut === 'lain-lain'
      ? `Lain-lain (Pilihan Sendiri: ${customProductNotes.trim() || 'Sila rujuk nota'})`
      : (CHICKEN_CUT_OPTIONS.find(c => c.id === selectedCut)?.label || selectedCut);

    const selectedProducts = PRODUCTS.filter(p => selectedProductIds.includes(p.id));
    const productNamesList = selectedProducts.map(p => `• ${p.name} (${p.unit}) - Pilihan Potong: ${cutLabel}`).join('\n   ');

    const locationText = fulfillmentType === 'pickup' 
      ? '🏪 Self-Pickup di Gerai GA 59 Pasar Awam Semenyih (Sebelum 12:00 PM)'
      : `🚚 Penghantaran ke Rumah (${deliveryLocation || 'Semenyih'})\n   *(Nota: Caj penghantaran minima mengikut kawasan akan dikenakan)*`;

    const formattedMessage = 
      `Salam Khairul Fresh Food! Saya nak buat tempahan ayam melalui WhatsApp:\n\n` +
      `*BORANG TEMPAHAN AYAM SEGAR*\n` +
      `--------------------------------------------------\n` +
      `1. *Nama Customer*:\n` +
      `   ${customerName.trim() || '[ Sila nyatakan nama ]'}\n\n` +
      `2. *Produk Ayam & Potongan*:\n` +
      `   ${productNamesList}\n` +
      `   *Catatan / Potongan Pilihan Sendiri*: ${customProductNotes.trim() || cutLabel}\n\n` +
      `3. *Lokasi Penghantaran atau Ambik di Pasar*:\n` +
      `   ${locationText}\n\n` +
      `4. *Bila Nak Hantar / Masa*:\n` +
      `   ${deliveryTiming || 'Hari ini / Segera'} (Waktu Operasi: Selasa - Ahad, Isnin Cuti)\n` +
      `--------------------------------------------------\n\n` +
      `*MAKLUMAT PEMBAYARAN SYARIKAT*:\n` +
      `• Kaedah: DuitNow QR / Pindahan Bank Sahaja\n` +
      `• Bank: ${duitnow.bankName || 'OCBC Bank (Malaysia) Berhad'}\n` +
      `• No Akaun: ${duitnow.accountNumber || '70 6116 3993'}\n` +
      `• Nama Akaun: ${duitnow.accountName || 'KHAIRUL FRESH AND FROZEN FOOD'}\n` +
      `• DuitNow ID (No. Pendaftaran Perniagaan / SSM): ${duitnow.duitnowId || '202503301954'}\n\n` +
      `*(PENTING: Pembayaran hanya melalui DuitNow QR atau transfer bank ke akaun syarikat kami. Saya akan hantar resit bayaran di sini untuk pengesahan order)*\n\n` +
      `Mohon pengesahan stok, total harga & caj penghantaran minima. Terima kasih!`;

    const waUrl = getOfficialWhatsAppLink(formattedMessage);
    openWhatsAppSafe(waUrl);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-emerald-500/30 overflow-hidden my-auto"
        >
          {/* Modal Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-800 via-emerald-700 to-stone-900 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/30 text-emerald-200 text-xs font-bold mb-2">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Borang Tempahan WhatsApp Pantas</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black font-['Outfit']">
              Tempah Ayam Segar Melalui WhatsApp
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
              Sila jawab 4 soalan ringkas ini untuk dihantar terus ke WhatsApp admin (011-11135503).
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSendWhatsAppOrder} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            
            {/* SOALAN 1: Nama Customer */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
              <label className="flex items-center gap-2 text-xs font-black text-stone-900 dark:text-white uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Nama Customer</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Puan Azlina / En. Rahim"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
              />
            </div>

            {/* SOALAN 2: Produk Ayam Apa? */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
              <label className="flex items-center justify-between text-xs font-black text-stone-900 dark:text-white uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                  <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Produk Ayam Apa?</span>
                </div>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-normal">Boleh pilih lebih dari 1</span>
              </label>

              {/* Product quick multi-selector with all products from database */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {PRODUCTS.map((p) => {
                  const isSelected = selectedProductIds.includes(p.id);
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => toggleProductSelection(p.id)}
                      className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-2xs'
                          : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{p.name}</span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-extrabold font-['Outfit']">
                          RM {p.price.toFixed(2)} /{p.unit}
                        </span>
                      </div>
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-300 dark:text-stone-600'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Cutting choice */}
              <div className="pt-2 space-y-2">
                <label className="flex items-center justify-between text-[11px] font-bold text-stone-700 dark:text-stone-300">
                  <div className="flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pilihan Pemotongan Percuma:</span>
                  </div>
                  {selectedCut === 'lain-lain' && (
                    <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                      Pilihan Sendiri Aktif
                    </span>
                  )}
                </label>
                <select
                  value={selectedCut}
                  onChange={(e) => handleCutChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {CHICKEN_CUT_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({c.description.slice(0, 45)}...)
                    </option>
                  ))}
                  <option value="lain-lain" className="font-bold text-amber-600 dark:text-amber-400">
                    ✍️ Lain-lain (Tulis Pilihan Sendiri)
                  </option>
                </select>

                {/* Arahan khas bila customer pilih 'Lain-lain' */}
                {selectedCut === 'lain-lain' ? (
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-200 text-xs space-y-1 animate-fade-in">
                    <div className="flex items-center gap-1.5 font-black text-amber-950 dark:text-amber-300">
                      <Edit3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>ARAHAN PILIHAN SENDIRI:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                      Sila tulis cara potongan atau permintaan khas anda di dalam kotak di bawah (Contoh: <em>Potong 10, buang kulit, belah dada, potong sup kecil, dll</em>).
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[10.5px] text-stone-500 dark:text-stone-400 px-0.5">
                    <span>Pilihan pemotongan dimasukkan terus ke dalam kotak di bawah:</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Boleh diedit</span>
                  </div>
                )}
              </div>

              {/* Notes Input Box */}
              <div>
                <input
                  ref={notesInputRef}
                  type="text"
                  value={customProductNotes}
                  onChange={(e) => setCustomProductNotes(e.target.value)}
                  placeholder={
                    selectedCut === 'lain-lain'
                      ? "✍️ Sila taip cara potongan pilihan anda sendiri di sini (Cth: Buang kulit, potong 10)..."
                      : "Kuantiti atau nota khas (Cth: 2 ekor potong 12, 1kg fillet)"
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-all outline-hidden ${
                    selectedCut === 'lain-lain'
                      ? 'bg-amber-50/50 dark:bg-amber-950/30 border-2 border-amber-500 dark:border-amber-500 text-stone-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-400'
                      : 'bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500'
                  }`}
                />
              </div>
            </div>

            {/* SOALAN 3: Lokasi Penghantaran atau Ambik di Pasar? */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
              <label className="flex items-center gap-2 text-xs font-black text-stone-900 dark:text-white uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Lokasi Penghantaran atau Ambik di Pasar?</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFulfillmentType('delivery')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    fulfillmentType === 'delivery'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Hantar Ke Rumah</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentType('pickup')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    fulfillmentType === 'pickup'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Ambik di Pasar (GA 59)</span>
                </button>
              </div>

              {fulfillmentType === 'delivery' ? (
                <div className="space-y-2.5">
                  <input
                    type="text"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    placeholder="Masukkan Alamat / Taman (Cth: Taman Pelangi Semenyih)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                  {/* Maklumat Caj Penghantaran Minima */}
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs">
                    <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-amber-900 dark:text-amber-300">
                        Maklumat Caj Penghantaran:
                      </p>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
                        Caj penghantaran minima mengikut kawasan akan dikenakan (seperti Semenyih, Eco Majestic, Beranang, Rinching). Jumlah caj sebenar akan disahkan oleh admin di WhatsApp mengikut jarak lokasi anda.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium bg-emerald-50 dark:bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  🏪 Ambik Sendiri di Gerai GA 59 Pasar Awam Semenyih (Sebelum 1:00 PM). Tiada caj penghantaran!
                </p>
              )}
            </div>

            {/* SOALAN 4: Bila Nak Hantar / Masa Pickup? */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="flex items-center gap-2 text-xs font-black text-stone-900 dark:text-white uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">4</span>
                  <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Bila Nak Hantar / Ambik?</span>
                </label>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Isnin Cuti Operasi
                </span>
              </div>

              {/* Dynamic notice if today or tomorrow is Monday */}
              {timingData.notice && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-300 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>{timingData.notice}</span>
                </div>
              )}

              {/* Dynamic Timing Options (Strictly Excludes Mondays) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {timingData.options.map((timing) => (
                  <button
                    type="button"
                    key={timing}
                    onClick={() => {
                      setDeliveryTiming(timing);
                      setMondayError('');
                    }}
                    className={`p-2.5 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                      deliveryTiming === timing
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-400'
                    }`}
                  >
                    {timing}
                  </button>
                ))}
              </div>

              <div>
                <input
                  type="text"
                  value={deliveryTiming}
                  onChange={(e) => {
                    setDeliveryTiming(e.target.value);
                    if (mondayError) setMondayError('');
                  }}
                  placeholder="Atau nyatakan tarikh/waktu (Cth: Pagi Selasa 9 pagi)..."
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border text-stone-900 dark:text-white text-xs outline-hidden focus:ring-2 ${
                    isMondaySelected 
                      ? 'border-rose-500 focus:ring-rose-500 bg-rose-50/20' 
                      : 'border-stone-300 dark:border-stone-700 focus:ring-emerald-500'
                  }`}
                />
              </div>

              {/* Warning if Monday is chosen or typed */}
              {isMondaySelected && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5 animate-pulse">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-rose-900 dark:text-rose-300">
                      Setiap Hari Isnin CUTI (Tiada Operasi):
                    </p>
                    <p className="text-[11px] text-rose-700 dark:text-rose-300/90 mt-0.5 leading-relaxed">
                      Khairul Fresh Food tutup setiap hari Isnin untuk rehat pasar & ladang. Sila pilih hari <strong>Selasa hingga Ahad</strong> (7:00 AM – 1:00 PM).
                    </p>
                  </div>
                </div>
              )}

              {mondayError && (
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  {mondayError}
                </p>
              )}
            </div>

            {/* 5. SEKSYEN PEMBAYARAN: DUITNOW QR & PINDAHAN BANK */}
            <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/70 dark:bg-stone-800/90 border-2 border-amber-300 dark:border-amber-700/80 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#ED0058] text-white flex items-center justify-center font-black text-xs shadow-xs">
                    <QrCode className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-stone-900 dark:text-white uppercase tracking-wider">
                      Kaedah Pembayaran Tempahan WhatsApp
                    </h4>
                    <span className="text-[11px] font-bold text-[#ED0058] dark:text-rose-400">
                      DuitNow QR & Pindahan Bank Sahaja
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                  <Receipt className="w-3 h-3" />
                  <span>Wajib Hantar Resit</span>
                </div>
              </div>

              {/* Arahan Pembayaran Penting */}
              <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-amber-200 dark:border-amber-800/80 text-xs space-y-2">
                <div className="flex items-start gap-2 text-stone-800 dark:text-stone-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[11.5px] leading-relaxed">
                    Pelanggan yang membuat tempahan melalui WhatsApp membuat pembayaran <strong>HANYA melalui DuitNow QR</strong> atau <strong>Pindahan Bank (Online Transfer)</strong> ke akaun syarikat kami.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 font-bold text-[11px] flex items-center gap-2">
                  <span className="text-sm">📸</span>
                  <span>Sila hantar bukti resit bayaran di chat WhatsApp sebelum order dapat disahkan & diproses.</span>
                </div>
              </div>

              {/* Grid: DuitNow QR Standee & Maklumat Bank */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700">
                {/* Visual DuitNow QR */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center py-1">
                  <DuitNowStandeeVisual
                    merchantName={duitnow.accountName || 'KHAIRUL FRESH AND FROZEN FOOD'}
                    customImage={duitnow.qrImageUrl}
                    compact={true}
                  />
                  <span className="text-[9.5px] text-stone-500 dark:text-stone-400 font-semibold mt-1 text-center">
                    Imbas dengan mana-mana Bank / E-Wallet
                  </span>
                </div>

                {/* Detail Akaun Bank */}
                <div className="sm:col-span-7 space-y-2">
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                    <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                      Nama Bank Rasmi Syarikat
                    </span>
                    <span className="text-xs font-black text-stone-900 dark:text-white block mt-0.5">
                      {duitnow.bankName || 'OCBC Bank (Malaysia) Berhad'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                    <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                      Nama Pemegang Akaun
                    </span>
                    <span className="text-xs font-black text-stone-900 dark:text-white block mt-0.5">
                      {duitnow.accountName || 'KHAIRUL FRESH AND FROZEN FOOD'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                        Nombor Akaun Bank
                      </span>
                      <span className="text-sm font-black text-emerald-950 dark:text-emerald-100 font-mono tracking-wider">
                        {duitnow.accountNumber || '70 6116 3993'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyAccount(duitnow.accountNumber || '7061163993')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      {copiedAccount ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAccount ? 'Disalin!' : 'Salin'}</span>
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-pink-700 dark:text-pink-300 uppercase tracking-wider block">
                        DuitNow ID (No. SSM / Perniagaan)
                      </span>
                      <span className="text-sm font-black text-stone-900 dark:text-white font-mono tracking-wider">
                        {duitnow.duitnowId || '202503301954'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyDuitNowId(duitnow.duitnowId || '202503301954')}
                      className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      {copiedDuitNowId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedDuitNowId ? 'Disalin!' : 'Salin'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Note Summary */}
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200 text-xs">
              <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="text-[11px] sm:text-xs font-medium">
                <strong className="text-emerald-800 dark:text-emerald-300">Peringatan Penghantaran:</strong> Caj penghantaran minima mengikut kawasan akan dikenakan untuk pesanan hantar ke rumah.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isMondaySelected}
              className={`w-full py-4 px-6 rounded-2xl font-black text-base shadow-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                isMondaySelected
                  ? 'bg-stone-400 text-stone-200 cursor-not-allowed shadow-none'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-600/30 hover:scale-[1.01]'
              }`}
            >
              <Send className="w-5 h-5" />
              <span>{isMondaySelected ? 'Pilih Hari Selain Isnin (Isnin Cuti)' : 'Hantar Tempahan ke WhatsApp (011-1113 5503)'}</span>
            </button>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
