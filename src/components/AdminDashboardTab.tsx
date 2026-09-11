import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Filter, 
  Download, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Layers, 
  Bell, 
  CheckCircle2, 
  Send,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  OrderRecord, 
  Product, 
  StockAlertSubscription, 
  DailySalesStat, 
  ProductSalesStat 
} from '../types';
import { dataStorageService } from '../services/dataStorage';
import { LogisticsZoneIndicator } from './LogisticsZoneIndicator';

interface AdminDashboardTabProps {
  orders: OrderRecord[];
  products: Product[];
  adminName: string;
  onProductsUpdated?: (products: Product[]) => void;
  onShowNotification?: (type: 'success' | 'error', text: string) => void;
  onNavigateToOrders?: (zone?: 'all' | 'semenyih' | 'beranang' | 'kajang' | 'pickup') => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'ayam-bulat': '#059669', // emerald
  'potongan': '#0284c7',   // sky
  'bahagian-khas': '#8b5cf6', // violet
  'kampung-organik': '#d97706', // amber
  'pek-jimat': '#e11d48',  // rose
  'perapan-rempah': '#ea580c', // orange
};

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  orders,
  products,
  adminName,
  onProductsUpdated,
  onShowNotification,
  onNavigateToOrders,
}) => {
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(30);
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders' | 'chickens'>('revenue');
  const [stockAlerts, setStockAlerts] = useState<StockAlertSubscription[]>(() => dataStorageService.getStockAlerts());
  const [selectedLogisticsZone, setSelectedLogisticsZone] = useState<'all' | 'semenyih' | 'beranang' | 'kajang' | 'pickup'>('all');
  const [selectedLogisticsDate, setSelectedLogisticsDate] = useState<string>('all');

  // Generate 30-day analytics data
  const rawDailyStats = useMemo(() => {
    return dataStorageService.getDailySalesStats(30);
  }, [orders]);

  const filteredDailyStats = useMemo(() => {
    return rawDailyStats.slice(rawDailyStats.length - timeRange);
  }, [rawDailyStats, timeRange]);

  const topSellingProducts = useMemo(() => {
    return dataStorageService.getTopSellingProducts();
  }, [products, orders]);

  // Aggregate summary metrics
  const totalRevenue = useMemo(() => {
    return filteredDailyStats.reduce((sum, d) => sum + d.revenue, 0);
  }, [filteredDailyStats]);

  const totalOrdersCount = useMemo(() => {
    return filteredDailyStats.reduce((sum, d) => sum + d.orderCount, 0);
  }, [filteredDailyStats]);

  const totalChickensSold = useMemo(() => {
    return filteredDailyStats.reduce((sum, d) => sum + d.chickensSold, 0);
  }, [filteredDailyStats]);

  const averageOrderValue = useMemo(() => {
    return totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  }, [totalRevenue, totalOrdersCount]);

  // Category sales distribution
  const categoryData = useMemo(() => {
    const map: Record<string, { id: string; name: string; value: number; revenue: number; color: string }> = {};
    topSellingProducts.forEach((p) => {
      const catKey = p.category;
      const catLabel = 
        catKey === 'ayam-bulat' || catKey === 'ayam-seekor' ? 'Ayam Bulat' :
        catKey === 'potongan' || catKey === 'bahagian-ayam' ? 'Potongan Segar' :
        catKey === 'kampung-organik' ? 'Kampung & Organik' :
        catKey === 'pek-jimat' || catKey === 'kombo-jimat' ? 'Pek Jimat' :
        catKey === 'perapan-rempah' ? 'Perapan Rempah' :
        catKey === 'bahagian-khas' ? 'Bahagian Khas' : 'Bahagian Khas';

      if (!map[catLabel]) {
        map[catLabel] = {
          id: catKey || catLabel,
          name: catLabel,
          value: 0,
          revenue: 0,
          color: CATEGORY_COLORS[catKey] || CATEGORY_COLORS['bahagian-khas'] || '#64748b',
        };
      }
      map[catLabel].value += p.unitsSold;
      map[catLabel].revenue += p.totalRevenue;
    });

    return Object.values(map);
  }, [topSellingProducts]);

  // Cumulative revenue trend calculation
  const cumulativeTrendData = useMemo(() => {
    let runningTotal = 0;
    return filteredDailyStats.map((item) => {
      runningTotal += item.revenue;
      return {
        ...item,
        cumulativeRevenue: Number(runningTotal.toFixed(2)),
      };
    });
  }, [filteredDailyStats]);

  // Stock alert restock trigger
  const handleNotifyCustomer = (alertId: string) => {
    const updated = dataStorageService.markStockAlertNotified(alertId, adminName);
    setStockAlerts(updated);
    if (onShowNotification) {
      onShowNotification('success', 'Notifikasi restock berjaya dihantar kepada pelanggan.');
    }
  };

  const handleNotifyBulk = (productId: string, productName: string) => {
    const { updatedAlerts, notifiedCount } = dataStorageService.notifyAllForProduct(productId, adminName);
    setStockAlerts(updatedAlerts);
    if (onShowNotification) {
      onShowNotification('success', `Berjaya menghantar notifikasi restock kepada ${notifiedCount} pelanggan bagi ${productName}.`);
    }
  };

  // Pending waitlist count
  const pendingAlerts = stockAlerts.filter((a) => a.status === 'pending');

  return (
    <div className="space-y-6 animate-fade-in text-stone-800 dark:text-stone-100">
      
      {/* Top Controls & Timeframe Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-50 dark:bg-stone-800/60 p-4 rounded-2xl border border-stone-200 dark:border-stone-700">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black tracking-tight text-stone-900 dark:text-white font-['Outfit']">
              Analisis Jualan & Prestasi Ladang
            </h3>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Data 30 Hari Terkini
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Pemantauan langsung aliran hasil, trend pesanan, dan produk paling laris
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe Buttons */}
          <div className="bg-white dark:bg-stone-900 p-1 rounded-xl flex border border-stone-200 dark:border-stone-700 text-xs font-bold">
            <button
              onClick={() => setTimeRange(7)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === 7 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setTimeRange(14)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === 14 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              14 Hari
            </button>
            <button
              onClick={() => setTimeRange(30)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === 30 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              30 Hari
            </button>
          </div>
        </div>
      </div>

      {/* 4 High-Impact KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* KPI 1: Total Revenue */}
        <div className="p-4 bg-gradient-to-br from-indigo-50/90 to-white dark:from-indigo-950/40 dark:to-stone-900 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Hasil Jualan ({timeRange} Hari)</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-950 dark:text-white font-['Outfit']">
            RM {totalRevenue.toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% berbanding bulan lalu</span>
          </div>
        </div>

        {/* KPI 2: Total Orders */}
        <div className="p-4 bg-gradient-to-br from-emerald-50/90 to-white dark:from-emerald-950/40 dark:to-stone-900 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Jumlah Pesanan Masuk</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-950 dark:text-white font-['Outfit']">
            {totalOrdersCount} Pesanan
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Kadar penghantaran 99.2%</span>
          </div>
        </div>

        {/* KPI 3: Chickens Sold */}
        <div className="p-4 bg-gradient-to-br from-amber-50/90 to-white dark:from-amber-950/40 dark:to-stone-900 rounded-2xl border border-amber-200/80 dark:border-amber-800/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Ayam Segar Terjual</span>
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-950 dark:text-white font-['Outfit']">
            {totalChickensSold} Ekor
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Purata {(totalChickensSold / timeRange).toFixed(1)} ekor/hari</span>
          </div>
        </div>

        {/* KPI 4: Average Order Value (AOV) */}
        <div className="p-4 bg-gradient-to-br from-purple-50/90 to-white dark:from-purple-950/40 dark:to-stone-900 rounded-2xl border border-purple-200/80 dark:border-purple-800/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-purple-700 dark:text-purple-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Purata Nilai Pesanan</span>
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-950 dark:text-white font-['Outfit']">
            RM {averageOrderValue.toFixed(2)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-purple-600 dark:text-purple-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>+RM 4.30 vs sasaran asas</span>
          </div>
        </div>

      </div>

      {/* LOGISTICS & DELIVERY ZONES INDICATOR */}
      <LogisticsZoneIndicator
        orders={orders}
        selectedZoneFilter={selectedLogisticsZone}
        onSelectZoneFilter={(zone) => {
          setSelectedLogisticsZone(zone);
          if (onNavigateToOrders && zone !== 'all') {
            onNavigateToOrders(zone);
          }
        }}
        selectedDateFilter={selectedLogisticsDate}
        onSelectDateFilter={setSelectedLogisticsDate}
      />

      {/* CHART SECTION 1: Daily Sales & Orders Chart */}
      <div className="bg-white dark:bg-stone-900 p-4 sm:p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h4 className="text-sm sm:text-base font-black text-stone-900 dark:text-white flex items-center gap-2 font-['Outfit']">
              <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Trend Jualan Harian (Daily Sales Breakdown)</span>
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Visualisasi jumlah jualan harian dan bilangan pesanan sepanjang tempoh {timeRange} hari
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setChartMetric('revenue')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                chartMetric === 'revenue' 
                  ? 'bg-indigo-600 text-white shadow-2xs' 
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Hasil (RM)
            </button>
            <button
              onClick={() => setChartMetric('orders')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                chartMetric === 'orders' 
                  ? 'bg-indigo-600 text-white shadow-2xs' 
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Bil. Pesanan
            </button>
            <button
              onClick={() => setChartMetric('chickens')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                chartMetric === 'chickens' 
                  ? 'bg-indigo-600 text-white shadow-2xs' 
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Ekor Ayam
            </button>
          </div>
        </div>

        {/* Recharts Area / Bar Chart */}
        <div className="h-72 sm:h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartMetric === 'revenue' ? (
              <AreaChart data={filteredDailyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis 
                  dataKey="formattedDate" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  interval={timeRange === 30 ? 3 : 1}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  tickFormatter={(val) => `RM${val}`}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DailySalesStat;
                      return (
                        <div className="bg-stone-950 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-stone-800">
                          <p className="font-bold text-stone-300">{label} ({data.date})</p>
                          <p className="text-indigo-400 font-black text-sm">
                            Hasil Jualan: RM {data.revenue.toFixed(2)}
                          </p>
                          <p className="text-emerald-400 text-[11px]">
                            {data.orderCount} Pesanan • {data.chickensSold} Ekor Ayam
                          </p>
                          <p className="text-stone-400 text-[10px]">
                            Purata Nilai: RM {data.avgOrderValue.toFixed(2)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4f46e5" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  name="Hasil (RM)"
                />
              </AreaChart>
            ) : chartMetric === 'orders' ? (
              <BarChart data={filteredDailyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis 
                  dataKey="formattedDate" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  interval={timeRange === 30 ? 3 : 1}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DailySalesStat;
                      return (
                        <div className="bg-stone-950 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-stone-800">
                          <p className="font-bold text-stone-300">{label}</p>
                          <p className="text-emerald-400 font-black text-sm">
                            {data.orderCount} Pesanan Masuk
                          </p>
                          <p className="text-stone-300 text-[11px]">
                            Hasil: RM {data.revenue.toFixed(2)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="orderCount" fill="#059669" radius={[6, 6, 0, 0]} name="Bilangan Pesanan" />
              </BarChart>
            ) : (
              <BarChart data={filteredDailyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis 
                  dataKey="formattedDate" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  interval={timeRange === 30 ? 3 : 1}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DailySalesStat;
                      return (
                        <div className="bg-stone-950 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-stone-800">
                          <p className="font-bold text-stone-300">{label}</p>
                          <p className="text-amber-400 font-black text-sm">
                            {data.chickensSold} Ekor Ayam Dijual
                          </p>
                          <p className="text-stone-300 text-[11px]">
                            {data.orderCount} Pesanan • RM {data.revenue.toFixed(2)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="chickensSold" fill="#d97706" radius={[6, 6, 0, 0]} name="Ekor Ayam" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

      </div>

      {/* 2-COLUMN GRID: Top Selling Products & Cumulative Revenue Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 2: Top Selling Products */}
        <div className="bg-white dark:bg-stone-900 p-4 sm:p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h4 className="text-sm sm:text-base font-black text-stone-900 dark:text-white flex items-center gap-2 font-['Outfit']">
                <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Produk Paling Laris (Top-Selling Products)</span>
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Peringkat jualan unit dan jumlah hasil terkumpul
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Top 6 Item
            </span>
          </div>

          {/* Horizontal Bar Chart for Top Selling Items */}
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topSellingProducts.slice(0, 6)}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis 
                  dataKey="productName" 
                  type="category" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  width={110}
                  tickFormatter={(val) => val.length > 16 ? `${val.substring(0, 14)}...` : val}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ProductSalesStat;
                      return (
                        <div className="bg-stone-950 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-stone-800">
                          <p className="font-bold text-stone-200">{data.productName}</p>
                          <p className="text-emerald-400 font-bold">
                            Unit Terjual: {data.unitsSold} unit
                          </p>
                          <p className="text-indigo-300 font-bold">
                            Jumlah Hasil: RM {data.totalRevenue.toFixed(2)}
                          </p>
                          <p className="text-stone-400 text-[10px]">
                            Baki Stok Semasa: {data.stockRemaining} unit
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="unitsSold" fill="#059669" radius={[0, 6, 6, 0]} name="Unit Terjual" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick ranking list pills */}
          <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
            {topSellingProducts.slice(0, 4).map((p, idx) => (
              <div key={p.productId} className="p-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                <div className="truncate pr-2">
                  <span className="font-black text-emerald-700 dark:text-emerald-400 mr-1.5">#{idx + 1}</span>
                  <span className="font-bold truncate">{p.productName}</span>
                </div>
                <span className="font-black text-stone-900 dark:text-white shrink-0">{p.unitsSold} unit</span>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 3: Cumulative Revenue Trends over Last 30 Days */}
        <div className="bg-white dark:bg-stone-900 p-4 sm:p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h4 className="text-sm sm:text-base font-black text-stone-900 dark:text-white flex items-center gap-2 font-['Outfit']">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Trend Hasil Terkumpul (Revenue Trends)</span>
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Aliran kumulatif pertumbuhan perniagaan sepanjang {timeRange} hari
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
              Kumulatif
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumulativeTrendData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis 
                  dataKey="formattedDate" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  interval={timeRange === 30 ? 4 : 1}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  tickFormatter={(val) => `RM${(val / 1000).toFixed(1)}k`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DailySalesStat & { cumulativeRevenue: number };
                      return (
                        <div className="bg-stone-950 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-stone-800">
                          <p className="font-bold text-stone-300">{label}</p>
                          <p className="text-indigo-400 font-black text-sm">
                            Terkumpul: RM {data.cumulativeRevenue.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-emerald-400 text-[11px]">
                            Jualan Hari Ini: RM {data.revenue.toFixed(2)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulativeRevenue" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  dot={{ r: 2, fill: '#4f46e5' }}
                  activeDot={{ r: 6, fill: '#818cf8' }}
                  name="Hasil Terkumpul (RM)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution Pills */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
            {categoryData.slice(0, 3).map((c, idx) => (
              <div key={c.id || `${c.name}-${idx}`} className="p-2 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-center">
                <span className="text-[10px] text-stone-500 block truncate">{c.name}</span>
                <span className="font-extrabold text-stone-900 dark:text-white">RM {c.revenue.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SECTION 3: 'Notify Me' Stock Waitlist Management */}
      <div className="bg-white dark:bg-stone-900 p-4 sm:p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-black text-stone-900 dark:text-white flex items-center gap-2 font-['Outfit']">
                <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>Senarai Menunggu Makluman Stok (Notify Me Waitlist)</span>
              </h4>
              {pendingAlerts.length > 0 && (
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                  {pendingAlerts.length} Menunggu
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Pelanggan yang mendaftar untuk dihubungi via WhatsApp atau Emel bila stok kembali ada
            </p>
          </div>

          <div className="text-xs text-stone-500 dark:text-stone-400">
            Jumlah Permintaan: <strong>{stockAlerts.length}</strong>
          </div>
        </div>

        {stockAlerts.length === 0 ? (
          <div className="p-8 text-center bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-500 text-xs">
            Tiada permintaan makluman stok pada masa ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 font-bold bg-stone-50 dark:bg-stone-800/50">
                  <th className="p-3">Produk Diminta</th>
                  <th className="p-3">Pelanggan</th>
                  <th className="p-3">Saluran Pilihan</th>
                  <th className="p-3">Hubungi (No./Emel)</th>
                  <th className="p-3">Tarikh Daftar</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {stockAlerts.map((sub) => (
                  <tr key={sub.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="p-3 font-bold text-stone-900 dark:text-white">
                      {sub.productName}
                    </td>
                    <td className="p-3 text-stone-700 dark:text-stone-300">
                      {sub.customerName}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-black text-[10px] uppercase ${
                        sub.channel === 'whatsapp' 
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : sub.channel === 'email'
                          ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      }`}>
                        {sub.channel}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-stone-600 dark:text-stone-300">
                      {sub.phone || sub.email || '-'}
                    </td>
                    <td className="p-3 text-stone-500 text-[11px]">
                      {new Date(sub.createdAt).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3">
                      {sub.status === 'notified' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Telah Diberitahu</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 animate-pulse">
                          <span>Menunggu Restock</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {sub.status === 'pending' ? (
                        <button
                          onClick={() => handleNotifyCustomer(sub.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] inline-flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                          title="Hantar notifikasi WhatsApp / Emel segera"
                        >
                          <Send className="w-3 h-3" />
                          <span>Hantar Makluman</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-stone-400">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
