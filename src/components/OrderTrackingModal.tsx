import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Truck, 
  CheckCircle2, 
  Snowflake, 
  PhoneCall,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { dataStorageService } from '../services/dataStorage';
import { getWhatsAppOrderStatusLink } from '../utils/whatsappHelper';
import { OrderRecord } from '../types';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderId = '',
}) => {
  const [orderQuery, setOrderQuery] = useState(initialOrderId || '');
  const [hasSearched, setHasSearched] = useState(Boolean(initialOrderId));
  const [orders, setOrders] = useState<OrderRecord[]>(() => dataStorageService.getOrders());
  const [cloudOrder, setCloudOrder] = useState<OrderRecord | null>(null);
  const [isSearchingCloud, setIsSearchingCloud] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setOrders(dataStorageService.getOrders());
    const unsub = dataStorageService.subscribeOrders((liveOrders) => {
      setOrders(liveOrders);
    });
    return () => {
      unsub();
    };
  }, [isOpen]);

  useEffect(() => {
    if (initialOrderId) {
      setOrderQuery(initialOrderId);
      setHasSearched(true);
    }
  }, [initialOrderId]);

  if (!isOpen) return null;

  const cleanQuery = orderQuery.trim().toLowerCase();
  
  const localMatched = cleanQuery 
    ? orders.find(
        (o) => 
          o.orderId.toLowerCase() === cleanQuery || 
          o.orderId.toLowerCase().includes(cleanQuery) ||
          o.customer.phone.replace(/\D/g, '').includes(cleanQuery.replace(/\D/g, '')) ||
          (o.customer?.hitpayReference && o.customer.hitpayReference.toLowerCase() === cleanQuery)
      ) 
    : null;

  const matchedOrder = localMatched || cloudOrder;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;
    setHasSearched(true);
    if (!localMatched) {
      setIsSearchingCloud(true);
      try {
        const foundCloud = await dataStorageService.getOrderById(orderQuery.trim());
        if (foundCloud) {
          setCloudOrder(foundCloud);
        } else {
          const foundByRef = await dataStorageService.findOrderByHitpayReference(orderQuery.trim());
          if (foundByRef) {
            setCloudOrder(foundByRef);
          }
        }
      } catch {
        // ignore
      } finally {
        setIsSearchingCloud(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 flex flex-col max-h-[90vh]"
        role="dialog"
      >
        
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Jejak Status Pesanan Ayam Segar</h2>
              <p className="text-xs text-stone-400">
                Sistem Penjejakan Rantaian Sejuk Dari Ladang Ke Rumah
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-stone-800">
          
          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => {
                  setOrderQuery(e.target.value);
                  setHasSearched(false);
                }}
                placeholder="Masukkan No. Pesanan (cth: FA-12345) atau No Telefon"
                className="w-full bg-stone-100 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-stone-900 focus:bg-white focus:border-blue-500 focus:outline-hidden uppercase font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isSearchingCloud}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSearchingCloud && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Cari
            </button>
          </form>

          {/* Tracking Result */}
          {hasSearched && matchedOrder && (
            <div className="space-y-4">
              
              {/* Status Header Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-emerald-50 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500">No. Pesanan:</span>
                    <strong className="text-sm font-mono text-stone-900">
                      #{matchedOrder.orderId}
                    </strong>
                    <span className="text-xs text-stone-500">({matchedOrder.customer.fullName})</span>
                  </div>
                  <h3 className="text-base font-extrabold text-stone-900 mt-0.5">
                    {matchedOrder.status === 'disahkan' && 'Pesanan Diterima & Disahkan'}
                    {matchedOrder.status === 'sembelih-potong' && 'Ayam Sedang Dipotong & Dicuci Bersih'}
                    {matchedOrder.status === 'pembungkusan-sejuk' && 'Ayam Dibungkus Dalam Suhu Chilled 0-4°C'}
                    {matchedOrder.status === 'dalam-penghantaran' && 'Rider Sedang Menghantar Ke Lokasi Anda'}
                    {matchedOrder.status === 'selesai' && 'Pesanan Telah Selesai Dihantar'}
                    {matchedOrder.status === 'dibatalkan' && 'Pesanan Telah Dibatalkan'}
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Slot / Anggaran: <strong>{matchedOrder.estimatedDeliveryText || matchedOrder.customer.deliverySlot.toUpperCase()}</strong>
                  </p>
                </div>

                <div className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                  <span className="capitalize">{matchedOrder.status.replace('-', ' ')}</span>
                </div>
              </div>

              {/* Items Summary */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                <span className="font-bold text-stone-700 block">Item Tempahan:</span>
                {matchedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-stone-600">
                    <span>{item.quantity}x {item.product.name} ({item.selectedCut})</span>
                    <span className="font-bold">RM {item.itemTotalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Timeline Steps */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                
                {/* Step 1 */}
                <div className="flex items-start gap-3 relative">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 z-10">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-stone-900">
                        Pesanan Diterima & Disahkan
                      </h4>
                      <span className="text-[11px] text-stone-400">
                        {new Date(matchedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Sistem menerima pesanan dan memadankan dengan stok ayam segar harian.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className={`flex items-start gap-3 relative ${matchedOrder.status === 'disahkan' ? 'opacity-50' : ''}`}>
                  <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 z-10 ${
                    matchedOrder.status !== 'disahkan' ? 'bg-emerald-600' : 'bg-stone-300'
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-stone-900">
                      Potongan Custom & Pembersihan Selesai
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Tukang potong menyempurnakan potongan pilihan anda dan dicuci bersih rapi.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className={`flex items-start gap-3 relative ${['disahkan', 'sembelih-potong'].includes(matchedOrder.status) ? 'opacity-50' : ''}`}>
                  <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 z-10 ${
                    !['disahkan', 'sembelih-potong'].includes(matchedOrder.status) ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-stone-300'
                  }`}>
                    <Snowflake className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-blue-900">
                      Kawalan Suhu Rantaian Sejuk 0°C – 4°C & Pembungkusan
                    </h4>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Ayam dimuatkan ke dalam kotak bertebat suhu rendah untuk mengekalkan kesegaran.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className={`flex items-start gap-3 ${matchedOrder.status === 'selesai' ? '' : 'opacity-60'}`}>
                  <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 ${
                    matchedOrder.status === 'selesai' ? 'bg-emerald-600' : 'bg-stone-300'
                  }`}>
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-stone-800">
                      Penghantaran / Pengambilan Selesai
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {matchedOrder.fulfillmentType === 'pickup' ? 'Sedia diambil di kaunter Pasar Semenyih.' : 'Dihantar terus ke lokasi pelanggan.'}
                    </p>
                  </div>
                </div>

              </div>

              {/* Rider / Support Helpline */}
              <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-xl flex items-center justify-between text-xs">
                <span className="text-stone-700 dark:text-stone-300">Perlukan bantuan tentang pesanan ini?</span>
                <a
                  href={getWhatsAppOrderStatusLink(matchedOrder.orderId, matchedOrder.customer?.fullName)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>WhatsApp Khairul FRESH (011-11135503)</span>
                </a>
              </div>

            </div>
          )}

          {hasSearched && !matchedOrder && (
            <div className="p-6 text-center rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <h4 className="text-sm font-bold text-stone-800">Tiada Pesanan Dijumpai</h4>
              <p className="text-xs text-stone-500">
                Sila pastikan Nombor Pesanan (cth: FA-XXXXX) atau Nombor Telefon dimasukkan dengan betul.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 shrink-0 text-right">
          <button
            onClick={onClose}
            className="bg-stone-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

