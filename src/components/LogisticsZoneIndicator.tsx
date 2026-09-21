import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  MapPin, 
  Package, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Scissors, 
  Snowflake, 
  Store, 
  Copy, 
  Printer, 
  Sparkles,
  ChevronRight,
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';
import { OrderRecord } from '../types';

interface LogisticsZoneIndicatorProps {
  orders: OrderRecord[];
  selectedZoneFilter: 'all' | 'semenyih' | 'beranang' | 'kajang' | 'pickup';
  onSelectZoneFilter: (zone: 'all' | 'semenyih' | 'beranang' | 'kajang' | 'pickup') => void;
  selectedDateFilter?: string;
  onSelectDateFilter?: (date: string) => void;
}

interface ZoneSummary {
  id: 'semenyih' | 'beranang' | 'kajang' | 'pickup';
  name: string;
  postcode: string;
  badgeColor: string;
  borderClass: string;
  bgClass: string;
  iconBg: string;
  totalOrders: number;
  totalItems: number;
  totalChickens: number;
  totalRevenue: number;
  orders: OrderRecord[];
  statusCounts: {
    disahkan: number;
    sembelihPotong: number;
    pekSejuk: number;
    penghantaran: number;
    selesai: number;
  };
}

export const LogisticsZoneIndicator: React.FC<LogisticsZoneIndicatorProps> = ({
  orders,
  selectedZoneFilter,
  onSelectZoneFilter,
  selectedDateFilter,
  onSelectDateFilter,
}) => {
  const [internalDateFilter, setInternalDateFilter] = useState<string>(selectedDateFilter || 'all');
  const [copiedZoneId, setCopiedZoneId] = useState<string | null>(null);

  const activeDate = selectedDateFilter !== undefined ? selectedDateFilter : internalDateFilter;

  const handleDateChange = (date: string) => {
    setInternalDateFilter(date);
    if (onSelectDateFilter) {
      onSelectDateFilter(date);
    }
  };

  // Helper to detect zone from order
  const getOrderZone = (order: OrderRecord): 'semenyih' | 'beranang' | 'kajang' | 'pickup' => {
    if (order.fulfillmentType === 'pickup' || order.customer.fulfillmentType === 'pickup') {
      return 'pickup';
    }
    const pc = (order.customer.postcode || '').trim();
    const city = (order.customer.city || '').toLowerCase();

    if (pc === '43500' || city.includes('semenyih')) return 'semenyih';
    if (pc === '43700' || city.includes('beranang')) return 'beranang';
    if (pc === '43000' || city.includes('kajang')) return 'kajang';
    
    // Default fallback based on postcode range or name
    return 'semenyih';
  };

  // Extract all unique delivery dates from active orders
  const uniqueDates = useMemo(() => {
    const dates = new Set<string>();
    orders.forEach((o) => {
      const d = o.customer.deliveryDate;
      if (d) dates.add(d);
    });
    return Array.from(dates).sort();
  }, [orders]);

  // Filter orders by chosen date
  const filteredOrdersByDate = useMemo(() => {
    if (activeDate === 'all') return orders;
    return orders.filter((o) => o.customer.deliveryDate === activeDate);
  }, [orders, activeDate]);

  // Calculate Zone metrics
  const zoneSummaries = useMemo<Record<'semenyih' | 'beranang' | 'kajang' | 'pickup', ZoneSummary>>(() => {
    const initialSummaries: Record<'semenyih' | 'beranang' | 'kajang' | 'pickup', ZoneSummary> = {
      semenyih: {
        id: 'semenyih',
        name: 'Semenyih',
        postcode: '43500',
        badgeColor: 'emerald',
        borderClass: 'border-emerald-300 dark:border-emerald-800',
        bgClass: 'bg-emerald-50/50 dark:bg-emerald-950/30',
        iconBg: 'bg-emerald-600 text-white',
        totalOrders: 0,
        totalItems: 0,
        totalChickens: 0,
        totalRevenue: 0,
        orders: [],
        statusCounts: { disahkan: 0, sembelihPotong: 0, pekSejuk: 0, penghantaran: 0, selesai: 0 },
      },
      beranang: {
        id: 'beranang',
        name: 'Beranang',
        postcode: '43700',
        badgeColor: 'sky',
        borderClass: 'border-sky-300 dark:border-sky-800',
        bgClass: 'bg-sky-50/50 dark:bg-sky-950/30',
        iconBg: 'bg-sky-600 text-white',
        totalOrders: 0,
        totalItems: 0,
        totalChickens: 0,
        totalRevenue: 0,
        orders: [],
        statusCounts: { disahkan: 0, sembelihPotong: 0, pekSejuk: 0, penghantaran: 0, selesai: 0 },
      },
      kajang: {
        id: 'kajang',
        name: 'Kajang',
        postcode: '43000',
        badgeColor: 'purple',
        borderClass: 'border-purple-300 dark:border-purple-800',
        bgClass: 'bg-purple-50/50 dark:bg-purple-950/30',
        iconBg: 'bg-purple-600 text-white',
        totalOrders: 0,
        totalItems: 0,
        totalChickens: 0,
        totalRevenue: 0,
        orders: [],
        statusCounts: { disahkan: 0, sembelihPotong: 0, pekSejuk: 0, penghantaran: 0, selesai: 0 },
      },
      pickup: {
        id: 'pickup',
        name: 'Ambil Sendiri (Pasar)',
        postcode: 'Gerai GA 59',
        badgeColor: 'amber',
        borderClass: 'border-amber-300 dark:border-amber-800',
        bgClass: 'bg-amber-50/50 dark:bg-amber-950/30',
        iconBg: 'bg-amber-600 text-white',
        totalOrders: 0,
        totalItems: 0,
        totalChickens: 0,
        totalRevenue: 0,
        orders: [],
        statusCounts: { disahkan: 0, sembelihPotong: 0, pekSejuk: 0, penghantaran: 0, selesai: 0 },
      },
    };

    filteredOrdersByDate.forEach((order) => {
      const zoneKey = getOrderZone(order);
      const summary = initialSummaries[zoneKey];
      summary.totalOrders += 1;
      summary.totalRevenue += order.total;
      summary.orders.push(order);

      // Count items and chickens
      order.items.forEach((it) => {
        summary.totalItems += it.quantity;
        summary.totalChickens += it.quantity;
      });

      // Status
      if (order.status === 'disahkan') summary.statusCounts.disahkan += 1;
      else if (order.status === 'sembelih-potong') summary.statusCounts.sembelihPotong += 1;
      else if (order.status === 'pembungkusan-sejuk') summary.statusCounts.pekSejuk += 1;
      else if (order.status === 'dalam-penghantaran') summary.statusCounts.penghantaran += 1;
      else if (order.status === 'selesai') summary.statusCounts.selesai += 1;
    });

    return initialSummaries;
  }, [filteredOrdersByDate]);

  // Overall totals
  const overallTotals = useMemo(() => {
    return {
      orders: filteredOrdersByDate.length,
      revenue: filteredOrdersByDate.reduce((s, o) => s + o.total, 0),
      chickens: filteredOrdersByDate.reduce((s, o) => s + o.items.reduce((sum, it) => sum + it.quantity, 0), 0),
      pendingPreparation: filteredOrdersByDate.filter((o) => o.status === 'disahkan' || o.status === 'sembelih-potong').length,
    };
  }, [filteredOrdersByDate]);

  // Helper to copy trip manifest for WhatsApp rider
  const handleCopyRiderManifest = (zoneKey: 'semenyih' | 'beranang' | 'kajang' | 'pickup') => {
    const summary = zoneSummaries[zoneKey];
    if (summary.orders.length === 0) {
      alert(`Tiada pesanan terkumpul bagi zon ${summary.name} pada tarikh ini.`);
      return;
    }

    const dateTitle = activeDate === 'all' ? 'Semua Tarikh' : activeDate;
    let text = `📋 *MANIFEST PENGHANTARAN RIDER - KHAIRUL FRESH FOOD*\n`;
    text += `📍 *Zon:* ${summary.name} (${summary.postcode})\n`;
    text += `📅 *Tarikh Slot:* ${dateTitle}\n`;
    text += `📦 *Jumlah Pesanan:* ${summary.totalOrders} pesanan (${summary.totalChickens} ekor/pek)\n`;
    text += `💰 *Jumlah Nilai:* RM ${summary.totalRevenue.toFixed(2)}\n`;
    text += `------------------------------------\n\n`;

    summary.orders.forEach((o, idx) => {
      text += `*${idx + 1}. #${o.orderId} - ${o.customer.fullName}*\n`;
      text += `📞 Tel: ${o.customer.phone}\n`;
      if (zoneKey === 'pickup') {
        text += `🏪 Ambil Sendiri di Pasar Semenyih (Masa: ${o.customer.pickupTime || '09:00 AM'})\n`;
      } else {
        text += `🏠 Alamat: ${o.customer.address}, ${o.customer.postcode} ${o.customer.city}\n`;
      }
      text += `🍗 Item: ${o.items.map((i) => `${i.quantity}x ${i.product.name} (${i.selectedCut || 'Standard'})`).join(', ')}\n`;
      if (o.customer.orderNotes) {
        text += `📝 Nota: ${o.customer.orderNotes}\n`;
      }
      text += `💵 Bayaran: LUNAS (RM ${o.total.toFixed(2)})\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedZoneId(zoneKey);
    setTimeout(() => setCopiedZoneId(null), 3000);
  };

  const zonesList: ('semenyih' | 'beranang' | 'kajang' | 'pickup')[] = ['semenyih', 'beranang', 'kajang', 'pickup'];

  return (
    <div className="rounded-3xl border border-stone-200 dark:border-stone-700/80 bg-white dark:bg-stone-900 overflow-hidden shadow-xs space-y-0">
      
      {/* Top Header & Date Filter Bar */}
      <div className="p-4 sm:p-5 bg-linear-to-r from-stone-900 via-stone-800 to-emerald-950 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Truck className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black tracking-tight">
                  Indikator Status Logistik & Zon Penghantaran
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Perancangan Laluan Rider
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Pemantauan jumlah pesanan, kuantiti ayam segar, dan status penyediaan bagi setiap zon penghantaran.
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 self-start lg:self-auto bg-stone-800/80 p-1.5 rounded-2xl border border-stone-700">
          <div className="flex items-center gap-1 text-[11px] font-bold text-stone-300 px-2 py-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tarikh Slot:</span>
          </div>

          <button
            type="button"
            onClick={() => handleDateChange('all')}
            className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeDate === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
            }`}
          >
            Semua Tarikh ({orders.length})
          </button>

          {uniqueDates.slice(0, 3).map((d) => {
            const countForDate = orders.filter((o) => o.customer.deliveryDate === d).length;
            const isSelected = activeDate === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => handleDateChange(d)}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
                }`}
              >
                <span>{d}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-emerald-800 text-white' : 'bg-stone-700 text-stone-300'
                }`}>
                  {countForDate}
                </span>
              </button>
            );
          })}

          {uniqueDates.length > 3 && (
            <select
              value={uniqueDates.includes(activeDate) && !uniqueDates.slice(0, 3).includes(activeDate) ? activeDate : ''}
              onChange={(e) => e.target.value && handleDateChange(e.target.value)}
              className="bg-stone-700 text-stone-200 rounded-xl px-2 py-1 text-xs font-bold border border-stone-600 focus:outline-hidden cursor-pointer"
            >
              <option value="">Tarikh Lain...</option>
              {uniqueDates.slice(3).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main 4-Zone Interactive Cards Grid */}
      <div className="p-4 sm:p-5 bg-stone-50/60 dark:bg-stone-900/60">
        
        {/* Quick Filter Bar by Zone */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 font-bold">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pilih Zon Untuk Paparan Pesanan Terperinci:</span>
          </div>

          {selectedZoneFilter !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectZoneFilter('all')}
              className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Set Semula (Tunjuk Semua)</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {zonesList.map((zoneKey) => {
            const summary = zoneSummaries[zoneKey];
            const isSelected = selectedZoneFilter === zoneKey;
            const isCopied = copiedZoneId === zoneKey;

            // Capacity meter estimate (e.g. max ~15 orders per rider trip)
            const capacityPercentage = Math.min(100, Math.round((summary.totalOrders / 15) * 100));

            return (
              <div
                key={zoneKey}
                onClick={() => onSelectZoneFilter(isSelected ? 'all' : zoneKey)}
                className={`rounded-2xl border-2 p-4 transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? `${summary.borderClass} ${summary.bgClass} shadow-md ring-2 ring-emerald-500/30 scale-[1.01]`
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/80 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-xs'
                }`}
              >
                {/* Top Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl ${summary.iconBg} flex items-center justify-center shrink-0 shadow-xs font-black`}>
                        {zoneKey === 'pickup' ? (
                          <Store className="w-4 h-4" />
                        ) : (
                          <MapPin className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-stone-900 dark:text-white leading-tight">
                          {summary.name}
                        </h4>
                        <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400">
                          {summary.postcode}
                        </span>
                      </div>
                    </div>

                    <span className={`text-xs font-black px-2.5 py-1 rounded-xl shadow-xs ${
                      summary.totalOrders > 0
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-100 dark:bg-stone-700 text-stone-400 dark:text-stone-500'
                    }`}>
                      {summary.totalOrders} Pesanan
                    </span>
                  </div>

                  {/* Metrics Big Stats */}
                  <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-stone-200/80 dark:border-stone-700/80 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 block uppercase">
                        Kuantiti Ayam:
                      </span>
                      <strong className="text-sm sm:text-base font-black text-stone-900 dark:text-white flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{summary.totalChickens} ekor/pek</span>
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 block uppercase">
                        Nilai Jualan:
                      </span>
                      <strong className="text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-400 font-['Outfit']">
                        RM {summary.totalRevenue.toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  {/* Status Progress Mini Indicators */}
                  <div className="mt-3.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-extrabold text-stone-600 dark:text-stone-300">
                      <span>Status Aliran Pesanan:</span>
                      <span>{summary.statusCounts.selesai}/{summary.totalOrders} Selesai</span>
                    </div>

                    <div className="grid grid-cols-5 gap-1 text-center text-[9px] font-bold">
                      <div className={`p-1 rounded-md ${summary.statusCounts.disahkan > 0 ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-black' : 'bg-stone-100 dark:bg-stone-800 text-stone-400'}`} title="Bayaran Disahkan">
                        {summary.statusCounts.disahkan} Disahkan
                      </div>
                      <div className={`p-1 rounded-md ${summary.statusCounts.sembelihPotong > 0 ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black' : 'bg-stone-100 dark:bg-stone-800 text-stone-400'}`} title="Sembelih & Potong">
                        {summary.statusCounts.sembelihPotong} Potong
                      </div>
                      <div className={`p-1 rounded-md ${summary.statusCounts.pekSejuk > 0 ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 font-black' : 'bg-stone-100 dark:bg-stone-800 text-stone-400'}`} title="Pack Dan Tunggu Rider">
                        {summary.statusCounts.pekSejuk} Pack
                      </div>
                      <div className={`p-1 rounded-md ${summary.statusCounts.penghantaran > 0 ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-black' : 'bg-stone-100 dark:bg-stone-800 text-stone-400'}`} title="Rider / Ambil">
                        {summary.statusCounts.penghantaran} Rider
                      </div>
                      <div className={`p-1 rounded-md ${summary.statusCounts.selesai > 0 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black' : 'bg-stone-100 dark:bg-stone-800 text-stone-400'}`} title="Selesai">
                        {summary.statusCounts.selesai} Selesai
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-4 pt-3 border-t border-stone-200/80 dark:border-stone-700/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] font-extrabold text-stone-500 dark:text-stone-400">
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-600 animate-pulse' : 'bg-stone-300 dark:bg-stone-600'}`} />
                    <span>{isSelected ? 'Sedang Dipaparkan' : 'Klik Untuk Tapis'}</span>
                  </div>

                  {/* Copy WhatsApp Rider Manifest Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyRiderManifest(zoneKey);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-stone-100 dark:bg-stone-700/80 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-600'
                    }`}
                    title={`Salin senarai pesanan ${summary.name} untuk dihantar ke WhatsApp Rider`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-white" />
                        <span>Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin Laluan</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Global Logistics Summary Bar below cards */}
        <div className="mt-3.5 p-3 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-stone-700 dark:text-stone-300">
            <div className="flex items-center gap-1.5 font-extrabold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Jumlah Pesanan Aktif: <strong>{overallTotals.orders}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 font-extrabold">
              <Package className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Jumlah Ayam Diperlukan: <strong>{overallTotals.chickens} ekor/pek</strong></span>
            </div>
            <div className="flex items-center gap-1.5 font-extrabold">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Jumlah Nilai Jualan: <strong>RM {overallTotals.revenue.toFixed(2)}</strong></span>
            </div>
            {overallTotals.pendingPreparation > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-bold text-[10px]">
                ⚡ {overallTotals.pendingPreparation} pesanan perlu disembelih & dipotong
              </span>
            )}
          </div>

          <div className="text-[11px] text-stone-500 dark:text-stone-400 italic">
            * Klik pada mana-mana kad zon untuk menapis senarai pesanan di bawah secara automatik.
          </div>
        </div>

      </div>

    </div>
  );
};
