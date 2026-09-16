import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  RotateCcw, 
  Printer, 
  AlertCircle, 
  Plus, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  LogOut, 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight,
  PackageCheck,
  Scissors,
  Snowflake,
  ExternalLink,
  Edit2,
  Check,
  MessageSquare,
  Bell,
  FileDown,
  FileText,
  Filter,
  Download,
  Share2
} from 'lucide-react';
import { UserAccount, OrderRecord, CartItem, SavedAddress, Product } from '../types';
import { authService } from '../services/auth';
import { dataStorageService } from '../services/dataStorage';
import { getLoyaltyStatus } from '../utils/loyalty';
import { lookupByPostcode, lookupByCity } from '../utils/postcodeHelper';
import { downloadReceiptPDF, sendReceiptPDFToWhatsApp } from '../utils/pdfReceipt';
import { getProductImageUrl } from '../utils/imageCompressor';
import { useLanguage } from '../context/LanguageContext';

export type OrderCategory = 'all' | 'menunggu' | 'proses' | 'selesai';

export function getOrderCategory(status: OrderRecord['status']): 'menunggu' | 'proses' | 'selesai' {
  if (status === 'disahkan') {
    return 'menunggu';
  }
  if (status === 'selesai') {
    return 'selesai';
  }
  return 'proses'; // 'sembelih-potong' | 'pembungkusan-sejuk' | 'dalam-penghantaran'
}

interface CustomerPortalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onLogout: () => void;
  onUpdateUser: (updated: UserAccount) => void;
  onReorder: (items: CartItem[]) => void;
  onOpenCoverage: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onUpdateUser,
  onReorder,
  onOpenCoverage,
}) => {
  const { t, isEn } = useLanguage();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile' | 'loyalty'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<OrderCategory>('all');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<string | null>(null);
  
  // Orders from storage
  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    const all = dataStorageService.getOrders();
    // Filter orders matching customer's email or phone or name
    return all.filter(
      (o) => 
        o.customer.email.toLowerCase() === (user?.email || '').toLowerCase() ||
        (user?.phone && o.customer.phone.includes(user.phone.replace(/\D/g, ''))) ||
        o.customer.fullName.toLowerCase().includes((user?.name || '').toLowerCase())
    );
  });

  // Real-time listener for orders when Customer Portal is open
  React.useEffect(() => {
    if (!isOpen) return;
    const unsub = dataStorageService.subscribeOrders((allOrders) => {
      setOrders(
        allOrders.filter(
          (o) => 
            o.customer.email.toLowerCase() === (user?.email || '').toLowerCase() ||
            (user?.phone && o.customer.phone.includes(user.phone.replace(/\D/g, ''))) ||
            o.customer.fullName.toLowerCase().includes((user?.name || '').toLowerCase())
        )
      );
    });
    return () => unsub();
  }, [isOpen, user]);

  // Action status message
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Address modal/form state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('Rumah');
  const [newFullName, setNewFullName] = useState(user?.name || '');
  const [newPhone, setNewPhone] = useState(user?.phone || '');
  const [newAddress, setNewAddress] = useState('');
  const [newPostcode, setNewPostcode] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newIsDefault, setNewIsDefault] = useState(false);

  // Auto-fill city and state when postcode is entered
  const handlePostcodeChange = (val: string) => {
    setNewPostcode(val);
    const clean = val.trim();
    if (clean === '43500') {
      setNewCity('Semenyih');
      setNewState('Selangor');
    } else if (clean === '43700') {
      setNewCity('Beranang');
      setNewState('Selangor');
    } else if (clean === '43000') {
      setNewCity('Kajang');
      setNewState('Selangor');
    } else {
      const match = lookupByPostcode(clean);
      if (match) {
        setNewCity(match.city);
        setNewState(match.state);
      }
    }
  };

  // Auto-fill postcode and state when city is entered
  const handleCityChange = (val: string) => {
    setNewCity(val);
    const clean = val.trim().toLowerCase();
    if (clean.includes('semenyih')) {
      setNewPostcode('43500');
      setNewState('Selangor');
    } else if (clean.includes('beranang')) {
      setNewPostcode('43700');
      setNewState('Selangor');
    } else if (clean.includes('kajang')) {
      setNewPostcode('43000');
      setNewState('Selangor');
    } else {
      const match = lookupByCity(clean);
      if (match) {
        if (!newPostcode) {
          setNewPostcode(match.postcode);
        }
        setNewState(match.state);
      }
    }
  };

  // Helper to check if postcode/city is within the 3 delivery zones
  const isDeliveryZone = (pc: string, ct: string) => {
    const p = (pc || '').trim();
    const c = (ct || '').trim().toLowerCase();
    return (
      p === '43500' ||
      p === '43700' ||
      p === '43000' ||
      c.includes('semenyih') ||
      c.includes('beranang') ||
      c.includes('kajang')
    );
  };

  // Profile edit form state
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [whatsappUpdates, setWhatsappUpdates] = useState<boolean>(user?.whatsappUpdates ?? true);

  if (!isOpen) return null;

  const handleToggleWhatsappUpdates = (enabled: boolean) => {
    setWhatsappUpdates(enabled);
    const updated = authService.updateUserProfile({
      whatsappUpdates: enabled,
    });
    if (updated) {
      onUpdateUser(updated);
      showFeedback(
        'success',
        enabled
          ? 'Notifikasi WhatsApp diaktifkan: Anda akan menerima kemas kini status pesanan secara automatik.'
          : 'Notifikasi WhatsApp dinyahaktifkan: Anda memilih untuk opt-out daripada kemas kini pesanan automatik.'
      );
    }
  };

  // Loyalty calculations: Fresh customers start with registered points and RM 0.00 spent
  const loyaltyPoints = typeof user.loyaltyPoints === 'number' ? user.loyaltyPoints : 50;
  const totalSpent = typeof user.totalSpent === 'number' ? user.totalSpent : 0.0;
  const loyaltyStatus = getLoyaltyStatus(loyaltyPoints, totalSpent);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Cancel order handler
  const handleCancelOrder = (orderId: string) => {
    if (!window.confirm('Adakah anda pasti ingin membatalkan pesanan ini?')) return;
    
    const result = dataStorageService.cancelOrder(orderId, user.name);
    if (result.success) {
      setOrders(result.orders.filter(
        (o) => o.customer.email.toLowerCase() === user.email.toLowerCase()
      ));
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder(null);
      }
      showFeedback('success', 'Pesanan anda telah berjaya dibatalkan.');
    } else {
      showFeedback('error', result.message);
    }
  };

  // Re-order handler (puts items directly into cart)
  const handleRepeatOrder = (order: OrderRecord) => {
    onReorder(order.items);
    showFeedback('success', `Semua ${order.items.length} item dari pesanan #${order.orderId} telah dimasukkan ke dalam troli anda!`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Add Address Handler
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.trim()) {
      showFeedback('error', 'Sila masukkan alamat penuh penghantaran.');
      return;
    }

    const updatedAddresses = authService.addAddress({
      label: newLabel,
      fullName: newFullName,
      phone: newPhone,
      address: newAddress,
      postcode: newPostcode,
      city: newCity,
      state: newState,
      isDefault: newIsDefault,
    });

    const updatedUser = { ...user, savedAddresses: updatedAddresses };
    onUpdateUser(updatedUser);
    setIsAddingAddress(false);
    setNewAddress('');
    showFeedback('success', 'Alamat baru berjaya disimpan!');
  };

  // Delete Address Handler
  const handleDeleteAddress = (addressId: string) => {
    const updatedAddresses = authService.deleteAddress(addressId);
    const updatedUser = { ...user, savedAddresses: updatedAddresses };
    onUpdateUser(updatedUser);
    showFeedback('success', 'Alamat telah dipadam.');
  };

  // Update Profile
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = authService.updateUserProfile({
      name: editName,
      phone: editPhone,
    });
    if (updated) {
      onUpdateUser(updated);
      showFeedback('success', 'Profil anda berjaya dikemaskini.');
    }
  };

  // Print & PDF Receipt handlers
  const handleDownloadPDF = async (order: OrderRecord) => {
    setIsDownloadingPdf(order.orderId);
    try {
      downloadReceiptPDF(order);
      showFeedback('success', `Resit rasmi (PDF) pesanan #${order.orderId} berjaya dimuat turun.`);
    } catch (err) {
      console.error('PDF generation error:', err);
      showFeedback('error', 'Gagal menjana fail PDF. Sila cuba lagi atau guna butang Cetak.');
    } finally {
      setTimeout(() => setIsDownloadingPdf(null), 800);
    }
  };

  const handleSendWhatsAppPDF = (order: OrderRecord) => {
    sendReceiptPDFToWhatsApp(order);
  };

  // Print Receipt directly
  const handlePrintReceipt = (order: OrderRecord) => {
    window.print();
  };

  const getCategoryDetails = (status: OrderRecord['status']) => {
    const cat = getOrderCategory(status);
    switch (cat) {
      case 'menunggu':
        return {
          id: 'menunggu',
          label: isEn ? 'Pending' : 'Menunggu',
          fullLabel: isEn ? 'Pending (Confirmed)' : 'Menunggu Persediaan',
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800',
          icon: '⏳'
        };
      case 'proses':
        return {
          id: 'proses',
          label: isEn ? 'In Process' : 'Dalam Proses',
          fullLabel: isEn ? 'In Process (Prep/Delivery)' : 'Dalam Proses (Potongan & Hantar)',
          badgeClass: 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950/80 dark:text-cyan-200 dark:border-cyan-800',
          icon: '⚙️'
        };
      case 'selesai':
        return {
          id: 'selesai',
          label: isEn ? 'Completed' : 'Selesai',
          fullLabel: isEn ? 'Completed & Delivered' : 'Selesai Dihantar',
          badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800',
          icon: '✅'
        };
    }
  };

  const getStatusBadge = (status: OrderRecord['status']) => {
    switch (status) {
      case 'disahkan':
        return {
          label: isEn ? 'Order Confirmed' : 'Pesanan Disahkan',
          bg: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          step: 1,
        };
      case 'sembelih-potong':
        return {
          label: isEn ? 'Early Dawn Prep & Custom Cuts' : 'Persediaan & Potongan Pagi',
          bg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          step: 2,
        };
      case 'pembungkusan-sejuk':
        return {
          label: isEn ? 'Cold-Chain Chilled Packaging (0-4°C)' : 'Pembungkusan Sejuk 0-4°C',
          bg: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
          step: 3,
        };
      case 'dalam-penghantaran':
        return {
          label: isEn ? 'Out for Delivery' : 'Dalam Penghantaran',
          bg: 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          step: 4,
        };
      case 'selesai':
        return {
          label: isEn ? 'Delivered & Completed' : 'Pesanan Selesai Dihantar',
          bg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          step: 5,
        };
    }
  };

  // Filtered orders based on category
  const filteredOrders = orders.filter((o) => {
    if (categoryFilter === 'all') return true;
    return getOrderCategory(o.status) === categoryFilter;
  });

  const countMenunggu = orders.filter((o) => getOrderCategory(o.status) === 'menunggu').length;
  const countProses = orders.filter((o) => getOrderCategory(o.status) === 'proses').length;
  const countSelesai = orders.filter((o) => getOrderCategory(o.status) === 'selesai').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-5xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-4 flex flex-col max-h-[92vh]"
        role="dialog"
      >
        {/* Header Bar */}
        <div className="bg-stone-900 text-white p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 shrink-0 border-b border-stone-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white text-xl font-bold shadow-md">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white font-['Outfit']">
                  Portal Pelanggan
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {loyaltyStatus.currentTier}
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Selamat Datang, <strong>{user.name}</strong> {user.username ? `(@${user.username})` : ''} • {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-rose-950/80 hover:text-rose-300 text-stone-300 text-xs font-bold transition-colors cursor-pointer border border-stone-700"
              title="Log Keluar Selamat"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Keluar</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert Bar */}
        {feedbackMessage && (
          <div className={`px-6 py-2.5 text-xs font-bold flex items-center gap-2 ${
            feedbackMessage.type === 'success' 
              ? 'bg-emerald-100 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-200 border-b border-emerald-200 dark:border-emerald-800' 
              : 'bg-rose-100 dark:bg-rose-950/90 text-rose-900 dark:text-rose-200 border-b border-rose-200 dark:border-rose-800'
          }`}>
            {feedbackMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="bg-stone-100 dark:bg-stone-800/80 px-4 sm:px-6 flex gap-2 border-b border-stone-200 dark:border-stone-800 overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3 font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isEn ? 'Order History' : 'Sejarah Pesanan'} ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`py-3 px-3 font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'addresses'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Alamat Tersimpan ({(user.savedAddresses || []).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('loyalty')}
            className={`py-3 px-3 font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'loyalty'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-500" />
            <span>Mata Ganjaran ({loyaltyPoints} Mata)</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil & Keselamatan</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-stone-800 dark:text-stone-200">
          
          {/* TAB 1: SEJARAH PESANAN (ORDER HISTORY) & LIVE TRACKING */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              
              {/* Header & Status Category Filter Pills */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-stone-200 dark:border-stone-800">
                <div>
                  <h3 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>{isEn ? 'Order History' : 'Sejarah Pesanan'}</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    {isEn 
                      ? 'Track live preparation, cold-chain delivery status, and print PDF receipts.' 
                      : 'Jejak status pemotongan segar, penghantaran sejuk beku dan cetak resit PDF rasmi.'}
                  </p>
                </div>

                {/* Status Category Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      categoryFilter === 'all'
                        ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span>{isEn ? 'All' : 'Semua'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-stone-700/20 dark:bg-stone-300/20 rounded-md">
                      {orders.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategoryFilter('menunggu')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      categoryFilter === 'menunggu'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60'
                    }`}
                  >
                    <span>⏳ {isEn ? 'Pending' : 'Menunggu'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-amber-700/20 dark:bg-amber-300/20 rounded-md">
                      {countMenunggu}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategoryFilter('proses')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      categoryFilter === 'proses'
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-900 dark:bg-cyan-950/50 dark:hover:bg-cyan-900/60 dark:text-cyan-200 border border-cyan-200 dark:border-cyan-800/60'
                    }`}
                  >
                    <span>⚙️ {isEn ? 'In Process' : 'Dalam Proses'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-cyan-700/20 dark:bg-cyan-300/20 rounded-md">
                      {countProses}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategoryFilter('selesai')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      categoryFilter === 'selesai'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/60'
                    }`}
                  >
                    <span>✅ {isEn ? 'Completed' : 'Selesai'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-700/20 dark:bg-emerald-300/20 rounded-md">
                      {countSelesai}
                    </span>
                  </button>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 dark:bg-stone-800/40 rounded-3xl border border-dashed border-stone-300 dark:border-stone-700 p-8">
                  <ShoppingBag className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
                    {isEn ? 'No order history found' : 'Belum ada rekod pesanan'}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
                    {isEn 
                      ? 'Your fresh chicken orders will appear here automatically with live cold-chain status tracking and PDF receipts.'
                      : 'Ayam segar anda yang ditempah akan dipaparkan secara automatik di sini dengan penjejakan status rantaian sejuk secara langsung dan muat turun resit PDF.'}
                  </p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-10 bg-stone-50 dark:bg-stone-800/40 rounded-3xl border border-stone-200 dark:border-stone-700 p-6">
                  <p className="text-xs font-bold text-stone-600 dark:text-stone-300">
                    {isEn ? 'No orders in this status category.' : 'Tiada pesanan dalam kategori status ini.'}
                  </p>
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className="mt-2 text-xs font-black text-emerald-600 hover:underline cursor-pointer"
                  >
                    {isEn ? 'Show all orders' : 'Papar semua pesanan'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Orders List (Left) */}
                  <div className="lg:col-span-6 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-stone-500 dark:text-stone-400 tracking-wider">
                        {isEn ? `Orders (${filteredOrders.length})` : `Senarai Pesanan (${filteredOrders.length})`}
                      </h4>
                      <span className="text-[11px] text-stone-400">
                        {isEn ? 'Click to view details & receipt' : 'Klik untuk butiran & cetak resit'}
                      </span>
                    </div>

                    {filteredOrders.map((order) => {
                      const badge = getStatusBadge(order.status);
                      const catDetails = getCategoryDetails(order.status);
                      const isSelected = selectedOrder?.orderId === order.orderId;
                      const isDownloading = isDownloadingPdf === order.orderId;

                      return (
                        <div
                          key={order.orderId}
                          onClick={() => setSelectedOrder(order)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                              : 'bg-white dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                          }`}
                        >
                          {/* Order Card Top: Order ID, Date & Total */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-black text-stone-900 dark:text-white">
                                  #{order.orderId}
                                </span>
                                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                                  {new Date(order.createdAt).toLocaleDateString(isEn ? 'en-MY' : 'ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-stone-700 dark:text-stone-300 mt-1">
                                {order.items.length} {isEn ? 'items' : 'jenis item'} ({order.items.reduce((s, i) => s + i.quantity, 0)} {isEn ? 'units/packs' : 'ekor / pek'})
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-['Outfit'] block">
                                RM {order.total.toFixed(2)}
                              </span>
                              {/* Status Category Badge */}
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border inline-block mt-0.5 ${catDetails.badgeClass}`}>
                                {catDetails.icon} {catDetails.label}
                              </span>
                            </div>
                          </div>

                          {/* Workflow Step Badge */}
                          <div className="mt-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-1 ${badge.bg}`}>
                              <Truck className="w-3 h-3" />
                              {badge.label}
                            </span>
                          </div>

                          {/* Card Footer: Delivery info & Print Receipt Action Button */}
                          <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-700/60 flex items-center justify-between gap-2 text-xs flex-wrap">
                            <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1 text-[11px]">
                              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              Slot: {order.customer.deliverySlot.toUpperCase()} ({order.customer.deliveryDate})
                            </span>

                            <div className="flex items-center gap-1.5 ml-auto">
                              {/* Direct Cetak Resit (PDF) Button on Order Card */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadPDF(order);
                                }}
                                disabled={isDownloading}
                                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 dark:bg-stone-700/60 dark:hover:bg-emerald-950/80 dark:text-stone-300 dark:hover:text-emerald-300 border border-stone-200 dark:border-stone-600 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Cetak / Muat Turun Resit Rasmi (PDF)"
                              >
                                <FileDown className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                <span>{isDownloading ? (isEn ? 'Generating...' : 'Menjana...') : (isEn ? 'Receipt PDF' : 'Cetak Resit')}</span>
                              </button>

                              <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-0.5 text-xs">
                                {isEn ? 'Details' : 'Butiran'}
                                <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Order Detail Panel (Right) */}
                  <div className="lg:col-span-6">
                    {selectedOrder ? (
                      <div className="bg-stone-50 dark:bg-stone-800/60 p-5 rounded-3xl border border-stone-200 dark:border-stone-700 space-y-4">
                        
                        {/* Detail Header & Action Buttons */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-700">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                                {isEn ? 'Order Details' : 'Butiran Pesanan'}
                              </span>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${getCategoryDetails(selectedOrder.status).badgeClass}`}>
                                {getCategoryDetails(selectedOrder.status).icon} {getCategoryDetails(selectedOrder.status).label}
                              </span>
                            </div>
                            <h4 className="text-base font-black text-stone-900 dark:text-white font-mono mt-0.5">
                              #{selectedOrder.orderId}
                            </h4>
                          </div>

                          {/* Quick Actions (Cetak Resit, PDF, WhatsApp, Pesan Semula) */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Prominent Cetak Resit (PDF) Button */}
                            <button
                              type="button"
                              onClick={() => handleDownloadPDF(selectedOrder)}
                              disabled={isDownloadingPdf === selectedOrder.orderId}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                              title="Muat Turun Ringkasan Pesanan Rasmi dalam bentuk PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>
                                {isDownloadingPdf === selectedOrder.orderId 
                                  ? (isEn ? 'Preparing PDF...' : 'Menjana PDF...') 
                                  : (isEn ? 'Print Receipt (PDF)' : 'Cetak Resit (PDF)')}
                              </span>
                            </button>

                            {/* WhatsApp Share Button */}
                            <button
                              type="button"
                              onClick={() => handleSendWhatsAppPDF(selectedOrder)}
                              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Hantar Resit ke WhatsApp"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </button>

                            {/* Standard Window Print Button */}
                            <button
                              type="button"
                              onClick={() => handlePrintReceipt(selectedOrder)}
                              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-600 text-xs font-bold flex items-center gap-1 hover:bg-stone-100 dark:hover:bg-stone-600 transition-colors cursor-pointer"
                              title="Cetak Slip Pesanan Pelayar"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Cetak</span>
                            </button>

                            {/* Reorder Button */}
                            <button
                              type="button"
                              onClick={() => handleRepeatOrder(selectedOrder)}
                              className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                              title="Pesan Semula Item Yang Sama"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>{isEn ? 'Reorder' : 'Pesan Semula'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Live Status Progress Stepper */}
                        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-xs font-black text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                              <Truck className="w-4 h-4 text-emerald-600" />
                              <span>Status: <strong>{getCategoryDetails(selectedOrder.status).label}</strong> — {getStatusBadge(selectedOrder.status).label}</span>
                            </span>
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              {selectedOrder.estimatedDeliveryText}
                            </span>
                          </div>

                          {/* 5-Step Bar */}
                          <div className="grid grid-cols-5 gap-1 pt-1">
                            {[
                              { label: isEn ? 'Confirmed' : 'Disahkan', step: 1 },
                              { label: isEn ? 'Cuts' : 'Potongan', step: 2 },
                              { label: isEn ? 'Cold Pack' : 'Pek Sejuk', step: 3 },
                              { label: isEn ? 'Out for Delivery' : 'Hantar', step: 4 },
                              { label: isEn ? 'Completed' : 'Selesai', step: 5 },
                            ].map((s) => {
                              const currentStep = getStatusBadge(selectedOrder.status).step;
                              const isCompleted = currentStep >= s.step;
                              const isCurrent = currentStep === s.step;
                              return (
                                <div key={s.step} className="flex flex-col items-center text-center">
                                  <div className={`w-full h-2 rounded-full mb-1 transition-all ${
                                    isCompleted 
                                      ? isCurrent 
                                        ? 'bg-amber-500 animate-pulse' 
                                        : 'bg-emerald-600' 
                                      : 'bg-stone-200 dark:bg-stone-700'
                                  }`} />
                                  <span className={`text-[9px] font-bold truncate w-full ${
                                    isCurrent ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-500'
                                  }`}>
                                    {s.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Order Items List */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-stone-600 dark:text-stone-400 block">
                            {isEn ? 'Ordered Items & Custom Cutting Specifications:' : 'Item & Spesifikasi Potongan Segar:'}
                          </span>
                          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                            {selectedOrder.items.map((item, idx) => (
                              <div 
                                key={idx}
                                className="p-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-700 text-xs flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img
                                    src={getProductImageUrl(item.product) || item.product.image}
                                    alt={item.product.name}
                                    className="w-11 h-11 rounded-xl object-cover border border-stone-200 dark:border-stone-700 shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-bold text-stone-900 dark:text-white truncate">
                                      {item.product.name}
                                    </p>
                                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                                      {isEn ? 'Cut:' : 'Potongan:'} {item.selectedCut} • {item.packaging}
                                    </p>
                                    {item.selectedCleaning && item.selectedCleaning.length > 0 && (
                                      <p className="text-[10px] text-stone-500 truncate">
                                        {isEn ? 'Cleaning:' : 'Pembersihan:'} {item.selectedCleaning.join(', ')}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="font-bold text-stone-900 dark:text-white block">
                                    {item.quantity} × RM {item.product.price.toFixed(2)}
                                  </span>
                                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 font-['Outfit']">
                                    RM {item.itemTotalPrice.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Address & Delivery Summary */}
                        <div className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-700 text-xs space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-stone-900 dark:text-white">{isEn ? 'Delivery Address:' : 'Alamat Penghantaran:'}</p>
                              <p className="text-stone-600 dark:text-stone-300 text-[11px]">
                                {selectedOrder.customer.address}, {selectedOrder.customer.postcode} {selectedOrder.customer.city}, {selectedOrder.customer.state}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-100 dark:border-stone-800 text-stone-500 flex-wrap gap-1">
                            <span>{isEn ? 'Payment:' : 'Bayaran:'} <strong className="uppercase text-stone-800 dark:text-stone-200">{selectedOrder.customer.paymentMethod}</strong></span>
                            <span>{isEn ? 'Date:' : 'Tarikh:'} <strong>{selectedOrder.customer.deliveryDate} ({selectedOrder.customer.deliverySlot})</strong></span>
                          </div>
                        </div>

                        {/* Order Subtotals Breakdown */}
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/80 dark:border-emerald-800 text-xs space-y-1">
                          <div className="flex justify-between text-stone-600 dark:text-stone-300">
                            <span>{isEn ? 'Subtotal:' : 'Jumlah Kecil (Subtotal):'}</span>
                            <span>RM {selectedOrder.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-stone-600 dark:text-stone-300">
                            <span>{isEn ? 'Cold-Chain Delivery Fee:' : 'Caj Penghantaran Suhu Dingin:'}</span>
                            <span>{selectedOrder.deliveryFee === 0 ? (isEn ? 'FREE' : 'PERCUMA') : `RM ${selectedOrder.deliveryFee.toFixed(2)}`}</span>
                          </div>
                          {selectedOrder.discount > 0 && (
                            <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                              <span>{isEn ? 'Voucher Discount:' : 'Diskaun Baucar:'}</span>
                              <span>- RM {selectedOrder.discount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-black text-sm text-stone-900 dark:text-white pt-1.5 border-t border-emerald-200 dark:border-emerald-800">
                            <span>{isEn ? 'Total Paid:' : 'Jumlah Keseluruhan:'}</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-['Outfit']">RM {selectedOrder.total.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Order Cancel Option (Only allowed if still 'disahkan') */}
                        {selectedOrder.status === 'disahkan' && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(selectedOrder.orderId)}
                              className="w-full py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-bold transition-colors cursor-pointer"
                            >
                              {isEn ? 'Cancel This Order' : 'Batalkan Pesanan Ini'}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center p-8 bg-stone-50 dark:bg-stone-800/40 rounded-3xl border border-stone-200 dark:border-stone-700 text-center">
                        <div>
                          <PackageCheck className="w-10 h-10 text-stone-400 mx-auto mb-2" />
                          <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                            {isEn ? 'Select any order on the left' : 'Pilih mana-mana pesanan di sebelah kiri'}
                          </p>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                            {isEn 
                              ? 'To track live cold-chain status, print PDF receipts, and view delivery details.'
                              : 'Untuk melihat penjejakan status masa nyata, cetak resit PDF potongan, dan butiran penghantaran.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-stone-900 dark:text-white">Alamat Penghantaran Tersimpan</h3>
                  <p className="text-xs text-stone-500">Urus alamat rumah, pejabat atau majlis kenduri anda untuk pembayaran lebih pantas.</p>
                </div>
                {!isAddingAddress && (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Alamat Baru</span>
                  </button>
                )}
              </div>

              {/* Add Address Form */}
              {isAddingAddress && (
                <form onSubmit={handleSaveAddress} className="p-5 bg-stone-50 dark:bg-stone-800/80 rounded-3xl border border-stone-200 dark:border-stone-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-300">Daftar Alamat Baru</h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Label Alamat</label>
                      <input
                        type="text"
                        required
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        placeholder=""
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Nama Penerima</label>
                      <input
                        type="text"
                        required
                        value={newFullName}
                        onChange={(e) => setNewFullName(e.target.value)}
                        placeholder=""
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Nombor Telefon</label>
                      <input
                        type="tel"
                        required
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder=""
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-stone-700 dark:text-stone-300">Poskod</label>
                        {newCity && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">✓ Auto-Kesan</span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={newPostcode}
                        onChange={(e) => handlePostcodeChange(e.target.value)}
                        placeholder="Cth: 43500 atau poskod kediaman anda"
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Alamat Penuh (No Rumah, Jalan, Kawasan)</label>
                      <textarea
                        required
                        rows={2}
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="No rumah, nama jalan, taman perumahan..."
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Bandar</label>
                      <input
                        type="text"
                        required
                        value={newCity}
                        onChange={(e) => handleCityChange(e.target.value)}
                        placeholder="Semenyih / Beranang / Kajang"
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Negeri</label>
                      <input
                        type="text"
                        required
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        placeholder="Selangor"
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Coverage Status Indicator */}
                  {newPostcode || newCity ? (
                    isDeliveryZone(newPostcode, newCity) ? (
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Zon Liputan Penghantaran Rumah Sah: <strong>{newCity} ({newPostcode})</strong></span>
                        </span>
                        <span className="text-[11px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-md">
                          Penghantaran Disediakan
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block">Alamat Luar Liputan Penghantaran ke Rumah</strong>
                          <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                            Tiada penghantaran dibuat untuk kawasan ini (penghantaran terus hanya ke Semenyih, Beranang & Kajang). Namun, anda tetap boleh menyimpan alamat ini dan memilih <strong>Ambil Sendiri di Kedai (Pasar Semenyih)</strong> semasa checkout.
                          </p>
                        </div>
                      </div>
                    )
                  ) : null}

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newIsDefault}
                        onChange={(e) => setNewIsDefault(e.target.checked)}
                        className="rounded-sm text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Tetapkan sebagai alamat utama (default)</span>
                    </label>

                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Simpan Alamat
                    </button>
                  </div>
                </form>
              )}

              {/* Address List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(user.savedAddresses || []).map((addr) => {
                  const isCovered = isDeliveryZone(addr.postcode, addr.city);
                  return (
                    <div
                      key={addr.id}
                      className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 relative group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200">
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                                Utama
                              </span>
                            )}
                            {isCovered ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                ✓ Hantar ke Rumah
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                🏪 Ambil Sendiri Sahaja
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                            title="Padam Alamat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="font-bold text-xs text-stone-900 dark:text-white">{addr.fullName} ({addr.phone})</p>
                        <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                          {addr.address}<br />
                          {addr.postcode} {addr.city}, {addr.state}
                        </p>
                      </div>

                      <div className="mt-4 pt-2 border-t border-stone-100 dark:border-stone-700 flex items-center justify-between text-xs">
                        <span className="text-stone-400 text-[11px]">
                          {isCovered ? 'Zon Penghantaran Aktif' : 'Ambil di Pasar Semenyih'}
                        </span>
                        <button
                          onClick={onOpenCoverage}
                          className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold text-[11px] cursor-pointer"
                        >
                          Semak Liputan
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: LOYALTY & REWARDS */}
          {activeTab === 'loyalty' && (
            <div className="space-y-6">
              
              {/* Card Tier */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-4 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
                
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-100">Status Keahlian Segar</span>
                    <h3 className="text-2xl font-black mt-1 font-['Outfit']">Ahli {loyaltyStatus.currentTier}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl">
                    👑
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-amber-100 block">Baki Mata Terkumpul:</span>
                    <span className="text-2xl font-black font-['Outfit']">{loyaltyPoints} Mata</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-amber-100 block">Jumlah Belanja:</span>
                    <span className="text-lg font-bold">RM {totalSpent.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Tier Benefits */}
              <div className="bg-stone-50 dark:bg-stone-800/80 p-5 rounded-3xl border border-stone-200 dark:border-stone-700 space-y-3">
                <h4 className="text-xs font-black uppercase text-stone-700 dark:text-stone-300">Kelebihan Ahli {loyaltyStatus.currentTier}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700">
                    <span className="font-bold text-emerald-600 block">Kadar Penebusan Mata</span>
                    <span className="text-stone-500 text-[11px]">Setiap 100 mata = RM 1.00 baucar diskaun bagi pesanan anda.</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700">
                    <span className="font-bold text-emerald-600 block">Diskaun Penghantaran</span>
                    <span className="text-stone-500 text-[11px]">Diskaun penghantaran RM6 automatik untuk pesanan melebihi RM150.</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700">
                    <span className="font-bold text-emerald-600 block">Keutamaan Khidmat Potongan</span>
                    <span className="text-stone-500 text-[11px]">Slot potongan & penyediaan segar diproses pada giliran awal pagi.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE & SECURITY */}
          {activeTab === 'profile' && (
            <div className="max-w-xl space-y-6">
              <form onSubmit={handleUpdateProfile} className="p-5 bg-stone-50 dark:bg-stone-800/80 rounded-3xl border border-stone-200 dark:border-stone-700 space-y-4">
                <h3 className="text-xs font-black uppercase text-stone-700 dark:text-stone-300">Kemaskini Maklumat Profil</h3>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Username / ID Pengguna</label>
                    <input
                      type="text"
                      disabled
                      value={user.username || user.email.split('@')[0]}
                      className="w-full bg-stone-200/60 dark:bg-stone-800/60 border border-stone-300 dark:border-stone-700 rounded-xl p-2.5 text-stone-600 dark:text-stone-300 font-mono font-bold cursor-not-allowed"
                    />
                    <span className="text-[10px] text-stone-400">Username digunakan untuk log masuk pantas tanpa perlu taip emel.</span>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Nama Penuh</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Nombor Telefon (WhatsApp)</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Alamat Emel</label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full bg-stone-200/60 dark:bg-stone-800/60 border border-stone-300 dark:border-stone-700 rounded-xl p-2.5 text-stone-500 cursor-not-allowed"
                    />
                    <span className="text-[10px] text-stone-400">Emel kekal sebagai ID log masuk keselamatan.</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Simpan Perubahan Profil
                </button>
              </form>

              {/* WhatsApp Notification & Order Status Preferences (Opt-in / Opt-out) */}
              <div className="p-5 bg-stone-50 dark:bg-stone-800/80 rounded-3xl border border-stone-200 dark:border-stone-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase text-stone-900 dark:text-white">
                        Tetapan Kemas Kini WhatsApp
                      </h3>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        Kawalan notifikasi & status pesanan langsung
                      </p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    whatsappUpdates
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400 border-stone-300 dark:border-stone-600'
                  }`}>
                    {whatsappUpdates ? 'Opt-In (Aktif)' : 'Opt-Out (Nyahaktif)'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Kemas Kini Status Pesanan Automatik via WhatsApp
                    </span>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed max-w-md">
                      Terima notifikasi status pesanan (Disahkan, Dalam Penyediaan & Selesai Dihantar) terus ke nombor telefon WhatsApp ({editPhone || user.phone || 'Nombor Profil'}).
                    </p>
                  </div>

                  {/* Interactive Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={whatsappUpdates}
                      onChange={(e) => handleToggleWhatsappUpdates(e.target.checked)}
                      className="sr-only peer"
                      aria-label="Kemas Kini Status Pesanan Automatik via WhatsApp"
                    />
                    <div className="w-12 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-stone-600 peer-checked:bg-emerald-600 shadow-inner"></div>
                  </label>
                </div>
              </div>

              {/* Security info card */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-950 dark:text-emerald-200">Akaun Pelanggan Dilindungi SSL & Token</h4>
                  <p className="text-emerald-800/80 dark:text-emerald-300/80 text-[11px] mt-0.5">
                    Sesi log masuk anda disimpan dengan token unik disulitkan dan akan tamat secara automatik selepas tempoh tidak aktif.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CustomerPortal;
