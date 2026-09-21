import React, { useState, useMemo } from 'react';
import { 
  MessageCircle, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Printer, 
  FileText, 
  Send, 
  Trash2, 
  DollarSign, 
  Scissors, 
  Calendar, 
  MapPin, 
  Phone, 
  ShoppingBag, 
  Check, 
  X, 
  User,
  CreditCard,
  Building,
  Truck,
  Store,
  Share2
} from 'lucide-react';
import { OrderRecord, Product, CartItem, ProductWeightOption, CleaningOptionId, PackagingOptionId, ChickenCutId } from '../types';
import { CHICKEN_CUT_OPTIONS, getCutLabel } from '../data/products';
import { dataStorageService } from '../services/dataStorage';
import { openWhatsAppSafe } from '../utils/whatsappHelper';
import { generateReceiptPDF, sendReceiptPDFToWhatsApp } from '../utils/pdfReceipt';

interface AdminWhatsAppOrdersTabProps {
  orders: OrderRecord[];
  products: Product[];
  adminName: string;
  onOrdersUpdated: (updated: OrderRecord[]) => void;
  onShowNotification?: (type: 'success' | 'error', text: string) => void;
  onOpenThermalReceipt: (order: OrderRecord) => void;
}

interface NewItemFormState {
  productId: string;
  quantity: number;
  selectedCut: ChickenCutId;
  weightOptionId?: string;
  organVariation?: string;
  organVariationLabel?: string;
  selectedCleaning: CleaningOptionId[];
  packaging: PackagingOptionId;
  specialNotes?: string;
}

export const AdminWhatsAppOrdersTab: React.FC<AdminWhatsAppOrdersTabProps> = ({
  orders,
  products,
  adminName,
  onOrdersUpdated,
  onShowNotification,
  onOpenThermalReceipt,
}) => {
  // Filter for WhatsApp orders
  // An order is considered WhatsApp if orderSource === 'whatsapp' OR customer.paymentMethod === 'whatsapp' OR orderId starts with 'WA-'
  const whatsappOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.orderSource === 'whatsapp' ||
        o.customer?.paymentMethod === 'whatsapp' ||
        o.orderId.startsWith('WA-') ||
        (o.customer?.orderNotes && o.customer.orderNotes.toLowerCase().includes('whatsapp'))
    );
  }, [orders]);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderRecord['status']>('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<'all' | 'delivery' | 'pickup'>('all');

  // Modal State for New WhatsApp Order
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState<OrderRecord | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<OrderRecord | null>(null);

  // New Order Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('43500');
  const [city, setCity] = useState('Semenyih');
  const [deliveryDate, setDeliveryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [deliverySlot, setDeliverySlot] = useState<'pagi' | 'petang' | 'malam'>('pagi');
  const [pickupTime, setPickupTime] = useState('09:30 AM');
  const [paymentMethod, setPaymentMethod] = useState<'duitnow' | 'whatsapp' | 'cod' | 'fpx'>('duitnow');
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [customDeliveryFee, setCustomDeliveryFee] = useState<number>(5);
  const [customDiscount, setCustomDiscount] = useState<number>(0);

  // Items in the new order being created
  const [orderItems, setOrderItems] = useState<NewItemFormState[]>([
    {
      productId: products[0]?.id || 'ayam-segar-standard',
      quantity: 1,
      selectedCut: 'potong-8',
      selectedCleaning: ['buang-kulit', 'buang-lemak'],
      packaging: 'biasa-ais',
      specialNotes: '',
    },
  ]);

  // KPI Computations for WhatsApp Tab
  const totalCount = whatsappOrders.length;
  const totalRevenue = whatsappOrders.reduce((sum, o) => sum + (o.status !== 'dibatalkan' ? o.total : 0), 0);

  const paidOrders = whatsappOrders.filter((o) => {
    if (o.status === 'dibatalkan') return false;
    if (o.paymentStatus === 'paid') return true;
    if (o.paymentStatus === 'unpaid') return false;
    // Fallback for orders created earlier
    return o.status === 'disahkan' || o.status === 'sembelih-potong' || o.status === 'pembungkusan-sejuk' || o.status === 'dalam-penghantaran' || o.status === 'selesai';
  });

  const unpaidOrders = whatsappOrders.filter((o) => {
    if (o.status === 'dibatalkan') return false;
    if (o.paymentStatus === 'unpaid') return true;
    if (o.paymentStatus === 'paid') return false;
    // Fallback: waiting for payment
    return o.status === 'menunggu_bayaran';
  });

  const paidRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const unpaidRevenue = unpaidOrders.reduce((sum, o) => sum + o.total, 0);

  // Filtered orders list
  const filteredWhatsAppOrders = useMemo(() => {
    return whatsappOrders.filter((order) => {
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchId = order.orderId.toLowerCase().includes(q);
        const matchName = order.customer?.fullName?.toLowerCase().includes(q);
        const matchPhone = order.customer?.phone?.toLowerCase().includes(q);
        const matchAddress = order.customer?.address?.toLowerCase().includes(q) || order.customer?.city?.toLowerCase().includes(q);
        if (!matchId && !matchName && !matchPhone && !matchAddress) return false;
      }

      // Payment Filter
      const orderIsPaid = order.paymentStatus === 'paid' || (order.paymentStatus !== 'unpaid' && order.status !== 'menunggu_bayaran' && order.status !== 'dibatalkan');
      if (paymentFilter === 'paid' && !orderIsPaid) return false;
      if (paymentFilter === 'unpaid' && orderIsPaid) return false;

      // Status Filter
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;

      // Fulfillment Filter
      const currentFulfillment = order.fulfillmentType || order.customer?.fulfillmentType || 'delivery';
      if (fulfillmentFilter !== 'all' && currentFulfillment !== fulfillmentFilter) return false;

      return true;
    });
  }, [whatsappOrders, searchTerm, paymentFilter, statusFilter, fulfillmentFilter]);

  // Toggle Payment Status
  const handleTogglePaymentStatus = (order: OrderRecord) => {
    const isCurrentlyPaid = order.paymentStatus === 'paid' || (order.paymentStatus !== 'unpaid' && order.status !== 'menunggu_bayaran');
    const newPaymentStatus = isCurrentlyPaid ? 'unpaid' : 'paid';

    const updatedOrders = dataStorageService.updateOrderPaymentStatus(order.orderId, newPaymentStatus, adminName);
    onOrdersUpdated(updatedOrders);

    if (onShowNotification) {
      onShowNotification(
        'success',
        `Pesanan #${order.orderId} kini ditanda sebagai: ${newPaymentStatus === 'paid' ? 'LUNAS (Sudah Bayar)' : 'BELUM BAYAR'}.`
      );
    }
  };

  // Update Process Status
  const handleUpdateProcessStatus = (orderId: string, newStatus: OrderRecord['status']) => {
    const updated = dataStorageService.updateOrderStatus(orderId, newStatus, adminName);
    onOrdersUpdated(updated);
    if (onShowNotification) {
      onShowNotification('success', `Status pesanan #${orderId} dikemaskini kepada "${newStatus}".`);
    }
  };

  // Delete WhatsApp Order
  const handleDeleteOrder = (orderId: string) => {
    const updated = dataStorageService.deleteOrder(orderId, adminName);
    onOrdersUpdated(updated);
    setOrderToDelete(null);
    if (onShowNotification) {
      onShowNotification('success', `Pesanan #${orderId} telah dipadam.`);
    }
  };

  // WhatsApp Invoice Dispatcher
  const handleSendInvoiceViaWhatsApp = (order: OrderRecord) => {
    const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
    const isOrderPaid = order.paymentStatus === 'paid' || (order.paymentStatus !== 'unpaid' && order.status !== 'menunggu_bayaran');

    const itemsSummary = order.items
      .map((it, idx) => {
        const cut = getCutLabel(it.selectedCut, it.product);
        const weight = it.selectedWeightOption ? ` (${it.selectedWeightOption.weightLabel})` : '';
        return `${idx + 1}. *${it.product.name}* x${it.quantity}${weight}\n   ✂ Potong: ${cut}\n   💰 RM ${it.itemTotalPrice.toFixed(2)}`;
      })
      .join('\n\n');

    let msg = '';
    if (isOrderPaid) {
      // Receipt message
      msg = 
`*RESIT RASMI KHAIRUL FRESH FOOD*
--------------------------------
*No. Pesanan:* #${order.orderId}
*Tarikh:* ${new Date(order.createdAt).toLocaleDateString('ms-MY')}
*Nama Pelanggan:* ${order.customer.fullName}
*Status Bayaran:* ✅ *LUNAS (SUDAH BAYAR)*
*Kaedah Bayaran:* ${order.customer.paymentMethod.toUpperCase()}

*Perincian Item:*
${itemsSummary}

--------------------------------
*Subtotal:* RM ${order.subtotal.toFixed(2)}
${order.deliveryFee > 0 ? `*Caj Penghantaran:* RM ${order.deliveryFee.toFixed(2)}\n` : ''}${order.discount > 0 ? `*Diskaun:* -RM ${order.discount.toFixed(2)}\n` : ''}*JUMLAH BESAR:* *RM ${order.total.toFixed(2)}*
--------------------------------
*Jenis:* ${order.fulfillmentType === 'pickup' ? '🏪 Ambil Sendiri (Pasar Semenyih GA 59)' : `🚚 Penghantaran ke ${order.customer.address}, ${order.customer.postcode} ${order.customer.city}`}
*Tarikh Hantar/Ambil:* ${order.customer.deliveryDate} (${order.fulfillmentType === 'pickup' ? order.customer.pickupTime : order.customer.deliverySlot.toUpperCase()})

Terima kasih kerana menempah ayam segar sembelih pagi bersama Khairul Fresh Food!`;
    } else {
      // Invoice pending payment message
      msg = 
`*INVOIS PESANAN KHAIRUL FRESH FOOD*
--------------------------------
*No. Pesanan:* #${order.orderId}
*Tarikh:* ${new Date(order.createdAt).toLocaleDateString('ms-MY')}
*Nama Pelanggan:* ${order.customer.fullName}
*Status Bayaran:* ⏳ *BELUM DIBAYAR*

*Perincian Pesanan:*
${itemsSummary}

--------------------------------
*Subtotal:* RM ${order.subtotal.toFixed(2)}
${order.deliveryFee > 0 ? `*Caj Penghantaran:* RM ${order.deliveryFee.toFixed(2)}\n` : ''}${order.discount > 0 ? `*Diskaun:* -RM ${order.discount.toFixed(2)}\n` : ''}*JUMLAH PERLU DIBAYAR:* *RM ${order.total.toFixed(2)}*
--------------------------------
*MAKLUMAT PEMBAYARAN DUITNOW / BANK:*
*Bank:* OCBC Bank (Malaysia) Berhad
*Nama Akaun:* KHAIRUL FRESH AND FROZEN FOOD
*No. Akaun:* 70 6116 3993 (7061163993)
*DuitNow ID (No. Pendaftaran Perniagaan / SSM):* 202503301954

Sila buat pembayaran dan balas mesej ini dengan resit transaksi untuk pengesahan segera. Terima kasih!`;
    }

    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone.startsWith('60') ? cleanPhone : '60' + cleanPhone.replace(/^0/, '')}&text=${encodeURIComponent(msg)}`;
    openWhatsAppSafe(waUrl);

    if (onShowNotification) {
      onShowNotification('success', `Tetingkap WhatsApp telah dibuka untuk menghantar ${isOrderPaid ? 'resit' : 'invois'} ke ${order.customer.fullName}.`);
    }
  };

  // Helper to calculate totals for new order modal
  const calculatedSubtotal = useMemo(() => {
    return orderItems.reduce((sum, it) => {
      const prod = products.find((p) => p.id === it.productId);
      if (!prod) return sum;
      let price = prod.price;
      if (it.weightOptionId && prod.weightOptions) {
        const opt = prod.weightOptions.find((w) => w.id === it.weightOptionId);
        if (opt) price = opt.price;
      }
      return sum + price * (it.quantity || 1);
    }, 0);
  }, [orderItems, products]);

  const calculatedTotal = useMemo(() => {
    const fee = fulfillmentType === 'pickup' ? 0 : customDeliveryFee;
    const disc = customDiscount || 0;
    return Math.max(0, calculatedSubtotal + fee - disc);
  }, [calculatedSubtotal, fulfillmentType, customDeliveryFee, customDiscount]);

  // Handle Save New WhatsApp Order
  const handleSaveNewWhatsAppOrder = async (sendWhatsAppImmediately: boolean) => {
    if (!customerName.trim()) {
      alert('Sila masukkan nama pelanggan.');
      return;
    }
    if (!customerPhone.trim()) {
      alert('Sila masukkan nombor WhatsApp pelanggan.');
      return;
    }
    if (fulfillmentType === 'delivery' && !address.trim()) {
      alert('Sila masukkan alamat penghantaran.');
      return;
    }

    // Build CartItems
    const builtItems: CartItem[] = orderItems.map((it, idx) => {
      const prod = products.find((p) => p.id === it.productId) || products[0];
      let price = prod.price;
      let selectedWeightOpt: ProductWeightOption | undefined;
      if (it.weightOptionId && prod.weightOptions) {
        selectedWeightOpt = prod.weightOptions.find((w) => w.id === it.weightOptionId);
        if (selectedWeightOpt) price = selectedWeightOpt.price;
      }

      return {
        id: `wa-item-${Date.now()}-${idx}`,
        productId: prod.id,
        product: prod,
        quantity: it.quantity || 1,
        selectedCut: it.selectedCut,
        selectedWeightOption: selectedWeightOpt,
        selectedCleaning: it.selectedCleaning,
        packaging: it.packaging,
        specialNotes: it.specialNotes || '',
        itemTotalPrice: price * (it.quantity || 1),
      };
    });

    const newOrderId = `WA-${Date.now().toString().slice(-6)}`;
    const fee = fulfillmentType === 'pickup' ? 0 : customDeliveryFee;
    const estText = isPaid
      ? (fulfillmentType === 'pickup' ? 'Disahkan • Sedia Diambil Di Pasar Semenyih (GA 59)' : 'Disahkan • Dalam Giliran Penghantaran')
      : 'Menunggu Pembayaran Dilengkapkan';

    const newOrder: OrderRecord = {
      orderId: newOrderId,
      items: builtItems,
      subtotal: calculatedSubtotal,
      deliveryFee: fee,
      discount: customDiscount || 0,
      total: calculatedTotal,
      status: isPaid ? 'disahkan' : 'menunggu_bayaran',
      createdAt: new Date().toISOString(),
      estimatedDeliveryText: estText,
      fulfillmentType,
      pickupTime: fulfillmentType === 'pickup' ? pickupTime : undefined,
      orderSource: 'whatsapp',
      paymentStatus: isPaid ? 'paid' : 'unpaid',
      customer: {
        fullName: customerName.trim(),
        phone: customerPhone.trim(),
        email: 'whatsapp-order@khairulfresh.local',
        address: fulfillmentType === 'pickup' ? 'Gerai No GA 59, Pasar Semenyih' : address.trim(),
        postcode: fulfillmentType === 'pickup' ? '43500' : postcode.trim(),
        city: fulfillmentType === 'pickup' ? 'Semenyih' : city.trim(),
        state: 'Selangor',
        fulfillmentType,
        pickupTime: fulfillmentType === 'pickup' ? pickupTime : undefined,
        deliveryDate,
        deliverySlot,
        paymentMethod: paymentMethod === 'cod' ? 'cod' : paymentMethod === 'fpx' ? 'fpx' : paymentMethod === 'duitnow' ? 'duitnow' : 'whatsapp',
        hitpayStatus: isPaid ? 'completed' : 'pending',
        orderNotes: orderNotes.trim() ? `[WhatsApp Order] ${orderNotes.trim()}` : '[WhatsApp Order]',
      },
    };

    // Save into storage & Firestore
    const updated = await dataStorageService.saveOrderAsync(newOrder);
    onOrdersUpdated(updated);

    // Reset Form
    setIsNewOrderModalOpen(false);
    setCustomerName('');
    setCustomerPhone('');
    setAddress('');
    setOrderNotes('');
    setIsPaid(false);
    setOrderItems([
      {
        productId: products[0]?.id || 'ayam-segar-standard',
        quantity: 1,
        selectedCut: 'potong-8',
        selectedCleaning: ['buang-kulit', 'buang-lemak'],
        packaging: 'biasa-ais',
        specialNotes: '',
      },
    ]);

    if (onShowNotification) {
      onShowNotification('success', `Pesanan WhatsApp #${newOrderId} berjaya direkodkan.`);
    }

    // Open WhatsApp immediately if requested
    if (sendWhatsAppImmediately) {
      handleSendInvoiceViaWhatsApp(newOrder);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in text-stone-800 dark:text-stone-100">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 rounded-3xl shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/30 flex items-center justify-center border border-emerald-400/40">
              <MessageCircle className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight font-['Outfit'] flex items-center gap-2">
                <span>Pengurusan Pesanan WhatsApp</span>
                <span className="text-[10px] bg-emerald-400/30 text-emerald-200 border border-emerald-300/40 px-2 py-0.5 rounded-full font-extrabold uppercase">
                  Admin Khas
                </span>
              </h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Kemasukan pesanan manual dari WhatsApp, pemantauan status bayaran (Lunas vs Belum Bayar), dan penghantaran invois segera.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsNewOrderModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-white text-emerald-950 hover:bg-emerald-50 font-black text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-emerald-700" />
          <span>+ Masuk Pesanan WhatsApp Baru</span>
        </button>
      </div>

      {/* KPI Cards for WhatsApp Channel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total WhatsApp Orders */}
        <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider">Jumlah Pesanan WhatsApp</span>
            <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-black text-stone-900 dark:text-white font-['Outfit']">
            {totalCount} Pesanan
          </div>
          <div className="text-[11px] text-stone-500 mt-1 font-medium">
            Nilai Jualan: RM {totalRevenue.toFixed(2)}
          </div>
        </div>

        {/* Paid WhatsApp Orders */}
        <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider">Sudah Lunas / Bayar</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-900 dark:text-emerald-200 font-['Outfit']">
            {paidOrders.length} Pesanan
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-bold">
            RM {paidRevenue.toFixed(2)} (Lunas)
          </div>
        </div>

        {/* Unpaid WhatsApp Orders */}
        <div className="p-4 bg-amber-50/80 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider">Belum Bayar (Pending)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-900 dark:text-amber-200 font-['Outfit']">
            {unpaidOrders.length} Pesanan
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 font-bold">
            RM {unpaidRevenue.toFixed(2)} (Tertunggak)
          </div>
        </div>

        {/* Average Ticket */}
        <div className="p-4 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider">Purata Nilai Order</span>
            <DollarSign className="w-4 h-4 text-stone-600 dark:text-stone-300" />
          </div>
          <div className="text-xl font-black text-stone-900 dark:text-white font-['Outfit']">
            RM {totalCount > 0 ? (totalRevenue / totalCount).toFixed(2) : '0.00'}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Saluran: Chat WhatsApp
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-stone-50 dark:bg-stone-800/80 p-3 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari ID WhatsApp, nama pelanggan, telefon WhatsApp, bandar..."
            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 dark:text-white focus:outline-hidden"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-hidden"
          >
            <option value="all">Semua Bayaran ({totalCount})</option>
            <option value="paid">✓ Sudah Lunas ({paidOrders.length})</option>
            <option value="unpaid">⏳ Belum Bayar ({unpaidOrders.length})</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-hidden"
          >
            <option value="all">Semua Status</option>
            <option value="menunggu_bayaran">0. Menunggu Bayaran</option>
            <option value="disahkan">1. Disahkan</option>
            <option value="sembelih-potong">2. Potong & Sedia</option>
            <option value="pembungkusan-sejuk">3. Pack & Tunggu Rider</option>
            <option value="dalam-penghantaran">4. Rider / Sedia Ambil</option>
            <option value="selesai">5. Selesai</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>

          {/* Fulfillment Filter */}
          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value as any)}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-hidden"
          >
            <option value="all">Semua Jenis</option>
            <option value="delivery">🚚 Delivery</option>
            <option value="pickup">🏪 Self-Pickup</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-700">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 uppercase tracking-wider font-extrabold text-[10px]">
            <tr>
              <th className="p-3">ID & Jenis</th>
              <th className="p-3">Pelanggan WhatsApp</th>
              <th className="p-3">Item & Potongan</th>
              <th className="p-3">Slot / Tarikh</th>
              <th className="p-3">Jumlah (RM)</th>
              <th className="p-3">Status Bayaran</th>
              <th className="p-3">Status Operasi</th>
              <th className="p-3 text-right">Invois & Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-stone-700 bg-white dark:bg-stone-900">
            {filteredWhatsAppOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-stone-400">
                  <div className="max-w-xs mx-auto text-center space-y-2">
                    <MessageCircle className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto" />
                    <p className="font-bold text-stone-600 dark:text-stone-300 text-xs">
                      Tiada pesanan WhatsApp ditemui.
                    </p>
                    <p className="text-[11px] text-stone-400">
                      Klik butang di atas untuk memasukkan pesanan pelanggan yang order terus melalui chat WhatsApp.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredWhatsAppOrders.map((order) => {
                const isPickup = order.fulfillmentType === 'pickup' || order.customer?.fulfillmentType === 'pickup';
                const isOrderPaid = order.paymentStatus === 'paid' || (order.paymentStatus !== 'unpaid' && order.status !== 'menunggu_bayaran' && order.status !== 'dibatalkan');
                const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');

                return (
                  <tr key={order.orderId} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                    
                    {/* ID & Type */}
                    <td className="p-3 font-mono font-bold text-stone-900 dark:text-white whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-700 dark:text-emerald-400">#{order.orderId}</span>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                          WA
                        </span>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md mt-1 ${
                        isPickup 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/60' 
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/60'
                      }`}>
                        {isPickup ? '🏪 Pickup' : '🚚 Delivery'}
                      </span>
                      <span className="block text-[10px] text-stone-400 font-normal font-sans mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 dark:text-white">{order.customer.fullName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <a
                          href={`https://api.whatsapp.com/send?phone=${cleanPhone.startsWith('60') ? cleanPhone : '60' + cleanPhone.replace(/^0/, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                          title="Klik untuk buka chat WhatsApp dengan pelanggan"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>{order.customer.phone}</span>
                        </a>
                      </div>
                      <span className="text-[10px] text-stone-400 block truncate max-w-[150px]">
                        {isPickup ? 'Pasar Semenyih (GA 59)' : `${order.customer.city} (${order.customer.postcode})`}
                      </span>
                    </td>

                    {/* Items */}
                    <td className="p-3 max-w-[200px]">
                      <span className="font-medium truncate block">
                        {order.items.map((i) => `${i.quantity}x ${i.product.name} (${getCutLabel(i.selectedCut, i.product)})`).join(', ')}
                      </span>
                      {order.customer.orderNotes && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 italic block truncate">
                          Nota: {order.customer.orderNotes}
                        </span>
                      )}
                    </td>

                    {/* Slot & Date */}
                    <td className="p-3 whitespace-nowrap">
                      <span className="font-bold text-[11px] text-stone-800 dark:text-stone-200 block">
                        {isPickup ? (order.customer.pickupTime || '09:30 AM') : order.customer.deliverySlot.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-stone-500">{order.customer.deliveryDate}</span>
                    </td>

                    {/* Total Amount */}
                    <td className="p-3 whitespace-nowrap">
                      <span className="font-black text-emerald-700 dark:text-emerald-400 font-['Outfit'] block">
                        RM {order.total.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-stone-400">
                        {order.customer.paymentMethod.toUpperCase()}
                      </span>
                    </td>

                    {/* Payment Status (Toggleable) */}
                    <td className="p-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleTogglePaymentStatus(order)}
                        className={`px-2.5 py-1 rounded-xl font-black text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border ${
                          isOrderPaid
                            ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800'
                        }`}
                        title="Klik untuk menukar status bayaran (Lunas / Belum Bayar)"
                      >
                        {isOrderPaid ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>✓ Sudah Lunas</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span>⏳ Belum Bayar</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Operation Process Status */}
                    <td className="p-3 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateProcessStatus(order.orderId, e.target.value as OrderRecord['status'])}
                        className={`px-2 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                          order.status === 'menunggu_bayaran'
                            ? 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                            : order.status === 'disahkan'
                            ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                            : order.status === 'sembelih-potong'
                            ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                            : order.status === 'pembungkusan-sejuk'
                            ? 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300'
                            : order.status === 'dalam-penghantaran'
                            ? 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300'
                            : order.status === 'selesai'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        <option value="menunggu_bayaran">0. Menunggu Bayaran</option>
                        <option value="disahkan">1. Disahkan</option>
                        <option value="sembelih-potong">2. Potong & Sedia</option>
                        <option value="pembungkusan-sejuk">3. Pack & Tunggu Rider</option>
                        <option value="dalam-penghantaran">4. Rider / Sedia Ambil</option>
                        <option value="selesai">5. Selesai</option>
                        <option value="dibatalkan">Dibatalkan</option>
                      </select>
                    </td>

                    {/* Actions & WhatsApp Invoice */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Send Invoice / Receipt via WhatsApp */}
                        <button
                          type="button"
                          onClick={() => handleSendInvoiceViaWhatsApp(order)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                          title={isOrderPaid ? "Hantar Resit Lunas ke WhatsApp Pelanggan" : "Hantar Invois Peringatan Bayaran ke WhatsApp Pelanggan"}
                        >
                          <Send className="w-3 h-3" />
                          <span>Hantar Invois</span>
                        </button>

                        {/* PDF Receipt */}
                        <button
                          type="button"
                          onClick={() => {
                            const doc = generateReceiptPDF(order);
                            doc.save(`Invois-WhatsApp-${order.orderId}.pdf`);
                          }}
                          className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 cursor-pointer"
                          title="Muat Turun PDF Invois / Resit"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        {/* Thermal Print */}
                        <button
                          type="button"
                          onClick={() => onOpenThermalReceipt(order)}
                          className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-700 text-white cursor-pointer shadow-xs"
                          title="Cetak Resit Thermal 80mm"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Slip Potongan */}
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForSlip(order)}
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                          title="Slip Pemotongan Pasar"
                        >
                          <Scissors className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Order */}
                        <button
                          type="button"
                          onClick={() => setOrderToDelete(order)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                          title="Padam Pesanan WhatsApp"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Slip Pemotongan Drawer */}
      {selectedOrderForSlip && (
        <div className="p-5 bg-stone-50 dark:bg-stone-800/80 rounded-3xl border border-stone-300 dark:border-stone-700 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b pb-3 border-stone-200 dark:border-stone-700">
            <div className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-emerald-600" />
              <h4 className="text-sm font-black uppercase text-stone-900 dark:text-white">
                Slip Potongan WhatsApp: #{selectedOrderForSlip.orderId}
              </h4>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                {selectedOrderForSlip.customer.fullName}
              </span>
            </div>
            <button
              onClick={() => setSelectedOrderForSlip(null)}
              className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-stone-500 block mb-1">Maklumat Pelanggan & Alamat:</span>
              <p className="font-bold text-stone-900 dark:text-white">
                {selectedOrderForSlip.customer.fullName} ({selectedOrderForSlip.customer.phone})
              </p>
              <p className="text-stone-600 dark:text-stone-300 mt-0.5 leading-relaxed">
                {selectedOrderForSlip.customer.address}, {selectedOrderForSlip.customer.postcode} {selectedOrderForSlip.customer.city}
              </p>
              <p className="text-stone-500 text-[11px] mt-1">
                Tarikh: <strong>{selectedOrderForSlip.customer.deliveryDate}</strong> ({selectedOrderForSlip.customer.deliverySlot.toUpperCase()})
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-stone-500 block">Spesifikasi Pemotongan:</span>
              {selectedOrderForSlip.items.map((item, i) => (
                <div key={i} className="p-2.5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 text-xs">
                  <div className="flex justify-between font-bold">
                    <span>{item.quantity}x {item.product.name}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                      POTONG: {getCutLabel(item.selectedCut, item.product).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1 flex flex-wrap gap-2">
                    <span>Pek: <strong>{item.packaging}</strong></span>
                    {item.selectedCleaning && item.selectedCleaning.length > 0 && (
                      <span>Pembersihan: <strong>{item.selectedCleaning.join(', ')}</strong></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-700 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="text-base font-black">Padam Pesanan WhatsApp #{orderToDelete.orderId}?</h4>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              Tindakan ini akan memadam pesanan bagi pelanggan <strong>{orderToDelete.customer.fullName}</strong> secara kekal.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteOrder(orderToDelete.orderId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Ya, Padam Pesanan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Masuk Pesanan WhatsApp Baru */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-700 max-w-3xl w-full my-8 p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900 dark:text-white font-['Outfit']">
                    Masuk Pesanan WhatsApp Baharu
                  </h3>
                  <p className="text-xs text-stone-500">
                    Masukkan butiran pelanggan yang membuat tempahan melalui chat WhatsApp.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewOrderModalOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section 1: Customer Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>1. Maklumat Pelanggan WhatsApp</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">
                    Nama Penuh Pelanggan *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Pn. Siti Sarah / En. Azman"
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">
                    No. Telefon WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Contoh: 012-3456789 atau 60123456789"
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Fulfillment Type Toggle */}
              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1.5">
                  Jenis Pengambilan / Penghantaran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('delivery')}
                    className={`p-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      fulfillmentType === 'delivery'
                        ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span>🚚 Penghantaran Ke Rumah (Delivery)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillmentType('pickup')}
                    className={`p-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      fulfillmentType === 'pickup'
                        ? 'bg-amber-50 dark:bg-amber-950 border-amber-500 text-amber-900 dark:text-amber-200 shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <Store className="w-4 h-4 text-amber-600" />
                    <span>🏪 Ambil Sendiri di Pasar Semenyih (GA 59)</span>
                  </button>
                </div>
              </div>

              {/* Address Fields if Delivery */}
              {fulfillmentType === 'delivery' ? (
                <div className="space-y-2 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700">
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">
                      Alamat Lengkap *
                    </label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="No. Rumah, Jalan, Taman Perumahan..."
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 text-xs focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 block mb-1">Poskod</label>
                      <input
                        type="text"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 block mb-1">Bandar</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 block mb-1">Negeri</label>
                      <input
                        type="text"
                        disabled
                        value="Selangor"
                        className="w-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">Lokasi Ambil Sendiri:</p>
                  <p className="text-[11px] mt-0.5">
                    Gerai No. GA 59, Pasar Sementara Semenyih, 43500 Semenyih, Selangor (Waktu Operasi Pagi).
                  </p>
                </div>
              )}

              {/* Date & Slot / Pickup Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">
                    Tarikh Penghantaran / Ambil
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">
                    {fulfillmentType === 'pickup' ? 'Waktu Ambil (Pasar Semenyih)' : 'Slot Penghantaran'}
                  </label>
                  {fulfillmentType === 'pickup' ? (
                    <input
                      type="text"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      placeholder="Contoh: 09:30 AM"
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden"
                    />
                  ) : (
                    <select
                      value={deliverySlot}
                      onChange={(e) => setDeliverySlot(e.target.value as any)}
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden"
                    >
                      <option value="pagi">Pagi (8:00 AM - 12:00 PM)</option>
                      <option value="petang">Petang (12:00 PM - 5:00 PM)</option>
                      <option value="malam">Malam (5:00 PM - 8:00 PM)</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Items Selection */}
            <div className="space-y-3 pt-3 border-t border-stone-200 dark:border-stone-700">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>2. Pilihan Ayam & Item Pesanan</span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setOrderItems([
                      ...orderItems,
                      {
                        productId: products[0]?.id || 'ayam-segar-standard',
                        quantity: 1,
                        selectedCut: 'potong-8',
                        selectedCleaning: ['buang-kulit', 'buang-lemak'],
                        packaging: 'biasa-ais',
                        specialNotes: '',
                      },
                    ]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Tambah Item Ayam</span>
                </button>
              </div>

              {/* Order Items List */}
              <div className="space-y-3">
                {orderItems.map((item, idx) => {
                  const currentProduct = products.find((p) => p.id === item.productId) || products[0];

                  return (
                    <div key={idx} className="p-3.5 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-stone-700 dark:text-stone-300">
                          Item #{idx + 1}
                        </span>
                        {orderItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setOrderItems(orderItems.filter((_, i) => i !== idx));
                            }}
                            className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer"
                          >
                            Padam
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {/* Product Dropdown */}
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-stone-500 block mb-1">Pilih Produk Ayam</label>
                          <select
                            value={item.productId}
                            onChange={(e) => {
                              const newPid = e.target.value;
                              const pObj = products.find((p) => p.id === newPid);
                              const updated = [...orderItems];
                              updated[idx].productId = newPid;
                              updated[idx].weightOptionId = pObj?.weightOptions?.[0]?.id;
                              setOrderItems(updated);
                            }}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (RM {p.price.toFixed(2)} / {p.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="text-[10px] font-bold text-stone-500 block mb-1">Kuantiti</label>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={item.quantity}
                            onChange={(e) => {
                              const updated = [...orderItems];
                              updated[idx].quantity = Math.max(1, parseInt(e.target.value) || 1);
                              setOrderItems(updated);
                            }}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-black text-center"
                          />
                        </div>
                      </div>

                      {/* Weight Options if available */}
                      {currentProduct?.weightOptions && currentProduct.weightOptions.length > 0 && (
                        <div>
                          <label className="text-[10px] font-bold text-stone-500 block mb-1">Pilihan Saiz / Berat</label>
                          <select
                            value={item.weightOptionId || currentProduct.weightOptions[0].id}
                            onChange={(e) => {
                              const updated = [...orderItems];
                              updated[idx].weightOptionId = e.target.value;
                              setOrderItems(updated);
                            }}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs font-semibold"
                          >
                            {currentProduct.weightOptions.map((w) => (
                              <option key={w.id} value={w.id}>
                                {w.weightLabel} ({w.weightRange}) - RM {w.price.toFixed(2)}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Cutting Option */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-stone-500 block mb-1">Jenis Pemotongan</label>
                          <select
                            value={item.selectedCut}
                            onChange={(e) => {
                              const updated = [...orderItems];
                              updated[idx].selectedCut = e.target.value as ChickenCutId;
                              setOrderItems(updated);
                            }}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs font-semibold"
                          >
                            {CHICKEN_CUT_OPTIONS.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.label} ({c.description})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-stone-500 block mb-1">Pembungkusan</label>
                          <select
                            value={item.packaging}
                            onChange={(e) => {
                              const updated = [...orderItems];
                              updated[idx].packaging = e.target.value as PackagingOptionId;
                              setOrderItems(updated);
                            }}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs font-semibold"
                          >
                            <option value="biasa-ais">Pek Standard + Ais Segar</option>
                            <option value="asing-setiap-ekor">Setiap Ekor Pek Berasingan</option>
                            <option value="cooler-box">Kotak Penebat Cooler Box</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={item.specialNotes || ''}
                          onChange={(e) => {
                            const updated = [...orderItems];
                            updated[idx].specialNotes = e.target.value;
                            setOrderItems(updated);
                          }}
                          placeholder="Nota khas bagi item ini (cth: pedal asingkan, potong kecil sikit)..."
                          className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-1.5 text-[11px]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Payment & Pricing */}
            <div className="space-y-3 pt-3 border-t border-stone-200 dark:border-stone-700">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>3. Status Bayaran & Kewangan</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">
                    Caj Penghantaran (RM)
                  </label>
                  <input
                    type="number"
                    disabled={fulfillmentType === 'pickup'}
                    value={fulfillmentType === 'pickup' ? 0 : customDeliveryFee}
                    onChange={(e) => setCustomDeliveryFee(parseFloat(e.target.value) || 0)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                  {fulfillmentType === 'pickup' && (
                    <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Percuma (Ambil Sendiri)</span>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">
                    Diskaun (RM)
                  </label>
                  <input
                    type="number"
                    value={customDiscount}
                    onChange={(e) => setCustomDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">
                    Kaedah Bayaran
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="duitnow">DuitNow QR (OCBC Bank)</option>
                    <option value="whatsapp">Pindahan Bank Manual</option>
                    <option value="cod">Tunai (COD)</option>
                    <option value="fpx">FPX Online Banking</option>
                  </select>
                </div>
              </div>

              {/* Big Payment Status Checkbox/Toggle */}
              <div className="p-4 rounded-2xl border-2 transition-all cursor-pointer shadow-xs bg-stone-50 dark:bg-stone-800/80 border-stone-300 dark:border-stone-700">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-black uppercase text-stone-900 dark:text-white block">
                      Status Bayaran Pelanggan:
                    </span>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {isPaid 
                        ? '✅ Pelanggan SUDAH buat bayaran (Lunas). Status pesanan automatik disahkan.' 
                        : '⏳ Pelanggan BELUM buat bayaran. Invois dengan maklumat DuitNow QR akan dihantar.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPaid(false)}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer border ${
                        !isPaid
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 border-transparent'
                      }`}
                    >
                      Belum Bayar
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPaid(true)}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer border ${
                        isPaid
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                          : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 border-transparent'
                      }`}
                    >
                      ✓ Sudah Lunas
                    </button>
                  </div>
                </div>
              </div>

              {/* Total Calculation Display */}
              <div className="p-4 bg-emerald-950 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                    Jumlah Keseluruhan Perlu Dibayar:
                  </span>
                  <span className="text-xs text-emerald-200">
                    Subtotal: RM {calculatedSubtotal.toFixed(2)} | Hantar: RM {(fulfillmentType === 'pickup' ? 0 : customDeliveryFee).toFixed(2)}
                  </span>
                </div>
                <div className="text-2xl font-black font-['Outfit'] text-emerald-300">
                  RM {calculatedTotal.toFixed(2)}
                </div>
              </div>

              {/* Order Notes */}
              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">
                  Nota Tambahan Pesanan WhatsApp
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Contoh: Pelanggan minta hantar sebelum jam 11 pagi atau tinggalkan dekat sekuriti..."
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-stone-200 dark:border-stone-700">
              <button
                type="button"
                onClick={() => setIsNewOrderModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => handleSaveNewWhatsAppOrder(false)}
                className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Simpan Pesanan Sahaja
              </button>

              <button
                type="button"
                onClick={() => handleSaveNewWhatsAppOrder(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-transform active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Simpan & Hantar Invois ke WhatsApp</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
