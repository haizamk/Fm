import React, { useState } from 'react';
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
  Scissors
} from 'lucide-react';
import { PRODUCTS, CHICKEN_CUT_OPTIONS } from '../data/products';
import { getOfficialWhatsAppLink, openWhatsAppSafe } from '../utils/whatsappHelper';

interface WhatsAppQuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCustomerName?: string;
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
  const [customProductNotes, setCustomProductNotes] = useState<string>('Ayam Segar Standard (1 ekor) - Potong 12');
  const [selectedCut, setSelectedCut] = useState<string>('potong-12');

  // 3. Lokasi Penghantaran atau Ambik di Pasar
  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryLocation, setDeliveryLocation] = useState<string>('Semenyih / Eco Majestic');

  // 4. Bila Nak Hantar / Tarikh & Masa
  const [deliveryTiming, setDeliveryTiming] = useState<string>('Pagi Esok (8:00 AM - 11:00 AM)');

  if (!isOpen) return null;

  const toggleProductSelection = (prodId: string) => {
    if (selectedProductIds.includes(prodId)) {
      if (selectedProductIds.length === 1) return; // Keep at least one
      setSelectedProductIds(selectedProductIds.filter(id => id !== prodId));
    } else {
      setSelectedProductIds([...selectedProductIds, prodId]);
    }
  };

  const handleSendWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedProducts = PRODUCTS.filter(p => selectedProductIds.includes(p.id));
    const productNamesList = selectedProducts.map(p => `• ${p.name} (${p.unit}) - Cut: ${selectedCut}`).join('\n   ');

    const locationText = fulfillmentType === 'pickup' 
      ? '🏪 Self-Pickup di Gerai GA 59 Pasar Awam Semenyih (Sebelum 12:00 PM)'
      : `🚚 Penghantaran ke Rumah (${deliveryLocation || 'Semenyih'})`;

    const formattedMessage = 
      `Salam Khairul Fresh Food! Saya nak buat tempahan ayam melalui WhatsApp:\n\n` +
      `*BORANG TEMPAHAN AYAM SEGAR*\n` +
      `--------------------------------------------------\n` +
      `1. *Nama Customer*:\n` +
      `   ${customerName.trim() || '[ Sila nyatakan nama ]'}\n\n` +
      `2. *Produk Ayam & Potongan*:\n` +
      `   ${productNamesList}\n` +
      `   *Nota*: ${customProductNotes || 'Tiada'}\n\n` +
      `3. *Lokasi Penghantaran atau Ambik di Pasar*:\n` +
      `   ${locationText}\n\n` +
      `4. *Bila Nak Hantar / Masa*:\n` +
      `   ${deliveryTiming || 'Hari ini / Segera'}\n` +
      `--------------------------------------------------\n\n` +
      `Mohon pengesahan stok dan total harga. Terima kasih!`;

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

              {/* Product quick multi-selector */}
              <div className="grid grid-cols-2 gap-2">
                {PRODUCTS.slice(0, 6).map((p) => {
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
                      <span className="truncate">{p.name}</span>
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-300 dark:text-stone-600'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Cutting choice */}
              <div className="pt-2">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                  <Scissors className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pilihan Pemotongan Percuma:</span>
                </label>
                <select
                  value={selectedCut}
                  onChange={(e) => setSelectedCut(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {CHICKEN_CUT_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({c.description.slice(0, 45)}...)
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <input
                  type="text"
                  value={customProductNotes}
                  onChange={(e) => setCustomProductNotes(e.target.value)}
                  placeholder="Kuantiti atau nota khas (Cth: 2 ekor potong 12, 1kg fillet)"
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white text-xs"
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
                <div>
                  <input
                    type="text"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    placeholder="Masukkan Alamat / Taman (Cth: Taman Pelangi Semenyih)"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white text-xs"
                  />
                </div>
              ) : (
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium bg-emerald-50 dark:bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  🏪 Ambik Sendiri di Gerai GA 59 Pasar Awam Semenyih (Sebelum 1:00 PM). Tiada caj penghantaran!
                </p>
              )}
            </div>

            {/* SOALAN 4: Bila Nak Hantar / Masa Pickup? */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
              <label className="flex items-center gap-2 text-xs font-black text-stone-900 dark:text-white uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">4</span>
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Bila Nak Hantar / Ambik?</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Hari Ini (Sebelum 12 PM)',
                  'Pagi Esok (8 AM - 11 AM)',
                  'Petang Esok (11 AM - 1 PM)'
                ].map((timing) => (
                  <button
                    type="button"
                    key={timing}
                    onClick={() => setDeliveryTiming(timing)}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                      deliveryTiming === timing
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
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
                  onChange={(e) => setDeliveryTiming(e.target.value)}
                  placeholder="Atau nyatakan tarikh/waktu khusus anda..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white text-xs"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-base shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer hover:scale-[1.01]"
            >
              <Send className="w-5 h-5" />
              <span>Hantar Tempahan ke WhatsApp (011-11135503)</span>
            </button>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
