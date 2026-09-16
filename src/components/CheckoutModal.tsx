import React, { useState, useEffect } from 'react';
import { CartItem, CustomerDetails, OrderRecord, DeliverySlotId, CouponCode, UserAccount, SavedAddress } from '../types';
import { COVERAGE_AREAS, DELIVERY_SLOTS, STORE_PICKUP_LOCATION, checkCoverageByPostcode } from '../data/coverage';
import { CHICKEN_CUT_OPTIONS, getCutLabel } from '../data/products';
import { dataStorageService } from '../services/dataStorage';
import { hitpayService } from '../services/hitpayService';
import { authService } from '../services/auth';
import { lookupByPostcode, lookupByCity } from '../utils/postcodeHelper';
import { 
  getCutoffInfo, 
  formatDeliveryDateBM, 
  parseLocalDate, 
  formatLocalDateStr 
} from '../utils/dateHelper';
import { DeliveryDateSelector } from './InteractiveDeliveryCalendar';
import { DuitNowOCBCQR } from './DuitNowOCBCQR';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  CreditCard, 
  QrCode, 
  Banknote, 
  MessageCircle, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Info,
  Store,
  Navigation,
  Tag,
  Lock,
  Smartphone,
  ExternalLink,
  Box,
  User,
  KeyRound,
  Eye,
  EyeOff,
  LogIn,
  LogOut,
  Bookmark,
  PlusCircle,
  Check,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  defaultPostcode: string;
  defaultCity: string;
  onCompleteOrder: (order: OrderRecord) => void;
  appliedCoupon?: CouponCode | null;
  couponDiscount?: number;
  appliedItemCoupon?: CouponCode | null;
  appliedDeliveryCoupon?: CouponCode | null;
  itemCouponDiscount?: number;
  deliveryCouponDiscount?: number;
  currentUser?: UserAccount | null;
  onLoginSuccess?: (user: UserAccount) => void;
  onLogout?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  defaultPostcode,
  defaultCity,
  onCompleteOrder,
  appliedCoupon,
  couponDiscount,
  appliedItemCoupon,
  appliedDeliveryCoupon,
  itemCouponDiscount,
  deliveryCouponDiscount,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  // Authentication & Logged in state
  const [loggedInUser, setLoggedInUser] = useState<UserAccount | null>(() => currentUser || authService.getCurrentUser());
  const [authTab, setAuthTab] = useState<'register' | 'login'>('register');
  
  // Registration form states
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');

  // Inline Login form states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccessMsg, setLoginSuccessMsg] = useState('');

  // Saved Address selection
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string>('');
  const [saveAddressToAccount, setSaveAddressToAccount] = useState<boolean>(true);

  // Fulfillment option: 'delivery' (Penghantaran ke Rumah) | 'pickup' (Ambil Sendiri di Kedai)
  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'pickup'>('delivery');

  // Available operating dates based on 11:00 PM Cut-off (strictly skips current day; after 11pm starts Day After Tomorrow)
  const cutoffInfo = getCutoffInfo(6);
  const initialDateStr = cutoffInfo.availableDates[0]?.dateStr || cutoffInfo.minDateStr;

  // Customer form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Postcode <-> Bandar <-> Negeri (Vice-versa auto fill)
  const [postcode, setPostcode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');

  // Vice-versa: input poskod -> auto set bandar & negeri
  const handlePostcodeChange = (newCode: string) => {
    setPostcode(newCode);
    const clean = newCode.trim();
    if (clean === '43500') {
      setCity('Semenyih');
      setState('Selangor');
    } else if (clean === '43700') {
      setCity('Beranang');
      setState('Selangor');
    } else if (clean === '43000') {
      setCity('Kajang');
      setState('Selangor');
    } else {
      const match = lookupByPostcode(clean);
      if (match) {
        setCity(match.city);
        setState(match.state);
      }
    }
  };

  // Vice-versa: input bandar -> auto set poskod & negeri
  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const clean = newCity.trim().toLowerCase();
    if (clean.includes('semenyih')) {
      setPostcode('43500');
      setState('Selangor');
    } else if (clean.includes('beranang')) {
      setPostcode('43700');
      setState('Selangor');
    } else if (clean.includes('kajang')) {
      setPostcode('43000');
      setState('Selangor');
    } else {
      const match = lookupByCity(clean);
      if (match) {
        if (!postcode) setPostcode(match.postcode);
        setState(match.state);
      }
    }
  };

  // Sync logged in user & auto-populate on open or auth state change
  useEffect(() => {
    const user = currentUser || authService.getCurrentUser();
    setLoggedInUser(user);
    if (user) {
      if (!fullName) setFullName(user.name || '');
      if (!phone) setPhone(user.phone || '');
      if (!email) setEmail(user.email || '');

      // Check for saved addresses
      if (user.savedAddresses && user.savedAddresses.length > 0) {
        const defaultAddr = user.savedAddresses.find((a) => a.isDefault) || user.savedAddresses[0];
        if (defaultAddr && !address) {
          setSelectedSavedAddressId(defaultAddr.id);
          setAddress(defaultAddr.address);
          handlePostcodeChange(defaultAddr.postcode);
          if (defaultAddr.city) setCity(defaultAddr.city);
          if (defaultAddr.state) setState(defaultAddr.state);
        }
      }
    } else {
      if (defaultPostcode && !postcode) {
        handlePostcodeChange(defaultPostcode);
      }
      if (defaultCity && !city) {
        handleCityChange(defaultCity);
      }
    }
  }, [isOpen, currentUser]);

  // Date & Slot selection
  const [deliveryDate, setDeliveryDate] = useState(initialDateStr);
  const [mondayWarning, setMondayWarning] = useState<string | null>(null);
  const [deliverySlot, setDeliverySlot] = useState<DeliverySlotId>('pagi');
  const [pickupTime, setPickupTime] = useState<string>('09:00 AM');

  // Payment state: DuitNow QR (OCBC Bank) is the primary active payment method
  const [paymentMethod, setPaymentMethod] = useState<'hitpay' | 'duitnow'>('duitnow');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [hitpayScreenData, setHitpayScreenData] = useState<{
    isOpen: boolean;
    paymentUrl: string;
    paymentId: string;
    order: OrderRecord;
    isSimulated: boolean;
    message?: string;
  } | null>(null);
  const [checkingPaymentStatus, setCheckingPaymentStatus] = useState<boolean>(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hitpayStatusText, setHitpayStatusText] = useState<string>('');

  // Packaging selection (Bungkusan Biasa vs Cooler Box)
  const siteSettings = dataStorageService.getSiteSettings();
  const showCoolerBoxOption = siteSettings.enableCoolerBoxOption ?? false;
  const initialHasCoolerBox = showCoolerBoxOption && items.some((it) => it.packaging === 'cooler-box');
  const [packagingType, setPackagingType] = useState<'bungkusan-biasa-ais' | 'cooler-box'>(
    initialHasCoolerBox ? 'cooler-box' : 'bungkusan-biasa-ais'
  );

  // Sync if showCoolerBoxOption is disabled
  useEffect(() => {
    if (!showCoolerBoxOption && packagingType === 'cooler-box') {
      setPackagingType('bungkusan-biasa-ais');
    }
  }, [showCoolerBoxOption]);

  // Total quantity of units in cart & Max 30 limit check
  const totalUnits = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const isOverMaxLimit = totalUnits > 30;

  // Strict 3 Zones Only:
  // 1. Semenyih (43500) -> RM 6.00
  // 2. Beranang (43700) -> RM 9.00
  // 3. Kajang (43000) -> RM 15.00
  const getZoneMatch = (inputPostcode: string, inputCity: string) => {
    const pc = (inputPostcode || '').trim();
    const ct = (inputCity || '').trim().toLowerCase();

    if (pc === '43500' || ct.includes('semenyih')) {
      return { isSupported: true, zoneName: 'Semenyih', standardPostcode: '43500', fee: 6.00 };
    }
    if (pc === '43700' || ct.includes('beranang')) {
      return { isSupported: true, zoneName: 'Beranang', standardPostcode: '43700', fee: 9.00 };
    }
    if (pc === '43000' || ct.includes('kajang')) {
      return { isSupported: true, zoneName: 'Kajang', standardPostcode: '43000', fee: 15.00 };
    }
    return { isSupported: false, zoneName: '', standardPostcode: '', fee: 0 };
  };

  // Price calculations
  const subtotal = items.reduce((sum, item) => sum + item.itemTotalPrice, 0);

  // Active coupons resolution
  const activeItemCoupon = appliedItemCoupon || (appliedCoupon?.discountType !== 'delivery' && appliedCoupon?.category !== 'delivery' ? appliedCoupon : null);
  const activeDeliveryCoupon = appliedDeliveryCoupon || (appliedCoupon?.discountType === 'delivery' || appliedCoupon?.category === 'delivery' ? appliedCoupon : null);
  const activeItemDiscount = itemCouponDiscount || (activeItemCoupon ? couponDiscount || 0 : 0);

  const zoneMatch = getZoneMatch(postcode, city);
  let baseDeliveryFee = 0;
  if (fulfillmentType === 'delivery') {
    if (zoneMatch.isSupported) {
      baseDeliveryFee = zoneMatch.fee;
    } else {
      baseDeliveryFee = 0.00;
    }
  } else {
    baseDeliveryFee = 0.00; // Self-pickup is PERCUMA
  }

  // Automatic RM6 Delivery Discount for orders RM150 and above
  const isAutoDeliveryEligible = fulfillmentType === 'delivery' && zoneMatch.isSupported && subtotal >= 150;
  const autoDeliveryDiscount = isAutoDeliveryEligible ? Math.min(baseDeliveryFee, 6.00) : 0;

  // Coupon delivery discount (if delivery voucher is applied and not already 100% free)
  const couponDeliveryDiscount = activeDeliveryCoupon ? Math.min(baseDeliveryFee - autoDeliveryDiscount, deliveryCouponDiscount || 6.00) : 0;
  const totalDeliveryDiscount = Math.min(baseDeliveryFee, autoDeliveryDiscount + couponDeliveryDiscount);
  const deliveryFee = Math.max(0, baseDeliveryFee - totalDeliveryDiscount);

  // Cooler Box dynamic pricing:
  // 1. Order < 10 units: +RM5.00 / penghantaran
  // 2. Order >= 10 units (10 - 30 units): +RM10.00 / penghantaran
  const coolerBoxFee = packagingType === 'cooler-box'
    ? (totalUnits < 10 ? 5.00 : 10.00)
    : 0.00;

  const total = Math.max(0, subtotal + deliveryFee + coolerBoxFee - activeItemDiscount);
  const isCoveredZone = zoneMatch.isSupported;

  // Handler for custom date picker to guard Monday closures and past/today cut-offs
  const handleDateChange = (chosenDate: string) => {
    if (chosenDate < cutoffInfo.minDateStr) {
      setMondayWarning(`⚠️ Slot tarikh yang dipilih tidak sah. Penghantaran paling awal yang dibuka adalah ${formatDeliveryDateBM(cutoffInfo.minDateStr)} (Waktu cut-off: 11:00 Malam).`);
      setDeliveryDate(cutoffInfo.minDateStr);
      return;
    }

    const d = parseLocalDate(chosenDate);
    if (d.getDay() === 1) { // Monday
      setMondayWarning('⚠️ Khairul Fresh Food ditutup setiap hari Isnin untuk rehat pasar & ladang. Tarikh dianjakkan ke hari Selasa.');
      d.setDate(d.getDate() + 1);
      setDeliveryDate(formatLocalDateStr(d));
    } else {
      setMondayWarning(null);
      setDeliveryDate(chosenDate);
    }
  };

  const selectedSlotObj = DELIVERY_SLOTS.find((s) => s.id === deliverySlot) || DELIVERY_SLOTS[0];

  // Inline Login Handler
  const handleInlineLogin = async () => {
    if (!loginIdentifier.trim()) {
      setLoginError('Sila masukkan username, emel atau nombor telefon.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Sila masukkan kata laluan.');
      return;
    }

    setLoginLoading(true);
    setLoginError('');
    setLoginSuccessMsg('');

    try {
      const res = await authService.login(loginIdentifier, loginPassword);
      if (res.success && res.user) {
        setLoggedInUser(res.user);
        if (onLoginSuccess) onLoginSuccess(res.user);

        // Auto-fill customer details
        setFullName(res.user.name || '');
        if (res.user.phone) setPhone(res.user.phone);
        if (res.user.email) setEmail(res.user.email);

        // Auto-fill address if available
        if (res.user.savedAddresses && res.user.savedAddresses.length > 0) {
          const defaultAddr = res.user.savedAddresses.find((a) => a.isDefault) || res.user.savedAddresses[0];
          if (defaultAddr) {
            setSelectedSavedAddressId(defaultAddr.id);
            setAddress(defaultAddr.address);
            handlePostcodeChange(defaultAddr.postcode);
            if (defaultAddr.city) setCity(defaultAddr.city);
            if (defaultAddr.state) setState(defaultAddr.state);
          }
        }

        setLoginSuccessMsg(`Selamat kembali, ${res.user.name}! Maklumat anda telah diisi secara automatik.`);
        setLoginPassword('');
      } else {
        setLoginError(res.error || 'Log masuk gagal. Sila pastikan kata laluan tepat.');
      }
    } catch {
      setLoginError('Ralat berlaku ketika log masuk. Sila cuba lagi.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Inline Registration Handler
  const handleInlineRegister = async () => {
    if (!regUsername.trim()) {
      setRegError('Sila masukkan username / ID pengguna pilihan anda.');
      return;
    }
    if (regUsername.trim().length < 3) {
      setRegError('Username mestilah sekurang-kurangnya 3 aksara.');
      return;
    }
    if (!fullName.trim()) {
      setRegError('Sila masukkan nama penuh anda.');
      return;
    }
    if (!phone.trim()) {
      setRegError('Sila masukkan nombor telefon WhatsApp anda.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setRegError('Kata laluan mestilah sekurang-kurangnya 6 aksara.');
      return;
    }

    setRegLoading(true);
    setRegError('');
    setRegSuccessMsg('');

    try {
      const cleanUser = regUsername.trim().toLowerCase().replace(/^@/, '');
      const targetEmail = email.trim() || `${cleanUser}@freshayam.local`;
      const res = await authService.register(
        fullName.trim(),
        targetEmail,
        phone.trim(),
        regPassword,
        cleanUser
      );

      if (res.success && res.user) {
        setLoggedInUser(res.user);
        if (onLoginSuccess) onLoginSuccess(res.user);
        setRegSuccessMsg(`Tahniah ${res.user.name}! Akaun @${res.user.username} berjaya didaftarkan (+50 Mata Ganjaran Percuma).`);
        setRegPassword('');
      } else {
        setRegError(res.error || 'Pendaftaran akaun gagal. Sila cuba lagi.');
      }
    } catch {
      setRegError('Ralat berlaku semasa pendaftaran. Sila cuba lagi.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleInlineLogout = () => {
    authService.logout();
    setLoggedInUser(null);
    setSelectedSavedAddressId('');
    if (onLogout) onLogout();
  };

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedSavedAddressId(addr.id);
    setAddress(addr.address);
    handlePostcodeChange(addr.postcode);
    if (addr.city) setCity(addr.city);
    if (addr.state) setState(addr.state);
    if (addr.fullName && !fullName) setFullName(addr.fullName);
    if (addr.phone && !phone) setPhone(addr.phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      alert('Sila lengkapkan nama penuh dan nombor telefon WhatsApp anda.');
      return;
    }

    if (fulfillmentType === 'delivery') {
      if (!postcode || !city || !state || !address) {
        alert('Sila lengkapkan poskod, bandar, negeri dan alamat penuh penghantaran anda.');
        return;
      }

      if (!zoneMatch.isSupported) {
        alert('Maaf, penghantaran ke rumah hanya dibuka untuk 3 zon sahaja: Semenyih (43500), Beranang (43700), dan Kajang (43000). Sila semak poskod anda atau pilih "Ambil Sendiri di Kedai (Pasar Semenyih)".');
        return;
      }
    }

    // SEAMLESS REGISTRATION / LOGIN CHECK:
    // Ensures every order has an associated user account without blocking guest checkouts.
    let activeUser = loggedInUser;
    if (!activeUser) {
      if (authTab === 'login' && loginIdentifier.trim() && loginPassword) {
        setLoginLoading(true);
        try {
          const loginRes = await authService.login(loginIdentifier, loginPassword);
          if (loginRes.success && loginRes.user) {
            activeUser = loginRes.user;
            setLoggedInUser(loginRes.user);
            if (onLoginSuccess) onLoginSuccess(loginRes.user);
          }
        } catch {
          // Fallback to seamless registration if login fails
        } finally {
          setLoginLoading(false);
        }
      }

      // If still no activeUser, create account seamlessly using customer details
      if (!activeUser) {
        setRegLoading(true);
        try {
          const cleanPhoneDigits = phone.trim().replace(/\D/g, '');
          const fallbackUsername = regUsername.trim() 
            ? regUsername.trim().toLowerCase().replace(/^@/, '') 
            : `user_${cleanPhoneDigits || Math.floor(1000 + Math.random() * 9000)}`;
          
          const fallbackPassword = regPassword && regPassword.length >= 6 
            ? regPassword 
            : `Ayam${cleanPhoneDigits.slice(-4) || '123456'}`;

          const targetEmail = email.trim() || `${fallbackUsername}@freshmarket.my`;

          const regRes = await authService.register(
            fullName.trim(),
            targetEmail,
            phone.trim(),
            fallbackPassword,
            fallbackUsername
          );

          if (regRes.success && regRes.user) {
            activeUser = regRes.user;
            setLoggedInUser(regRes.user);
            if (onLoginSuccess) onLoginSuccess(regRes.user);
          }
        } catch (e) {
          console.warn('Seamless registration notice:', e);
        } finally {
          setRegLoading(false);
        }
      }
    }

    setIsSubmitting(true);
    setPaymentError(null);

    const randomId = 'KFF-' + Math.floor(10000 + Math.random() * 90000);
    const formattedDate = formatDeliveryDateBM(deliveryDate);
    const estimatedDeliveryText = fulfillmentType === 'pickup'
      ? `Ambil di Kedai: ${formattedDate} (${pickupTime})`
      : `${formattedDate} • ${selectedSlotObj.label} (${selectedSlotObj.timeRange})`;

    const siteSettings = dataStorageService.getSiteSettings();
    const hitpayConfig = siteSettings.hitpayConfig || {
      apiKey: '',
      salt: '',
      isSandbox: true,
      isActive: true,
      currency: 'MYR' as const,
      merchantName: 'Khairul FRESH Food',
      enabledMethods: ['fpx', 'duitnow', 'card', 'grabpay', 'tng', 'shopeepay'] as ('fpx' | 'duitnow' | 'card' | 'grabpay' | 'tng' | 'shopeepay')[],
    };

    const newOrder: OrderRecord = {
      orderId: randomId,
      items,
      customer: {
        fullName,
        phone,
        email: email || `${phone.replace(/\D/g, '')}@pelanggan.freshmarket.my`,
        address: fulfillmentType === 'delivery' ? address : STORE_PICKUP_LOCATION.address,
        postcode: fulfillmentType === 'delivery' ? postcode : STORE_PICKUP_LOCATION.postcode,
        city: fulfillmentType === 'delivery' ? city : STORE_PICKUP_LOCATION.city,
        state: fulfillmentType === 'delivery' ? state : STORE_PICKUP_LOCATION.state,
        fulfillmentType,
        pickupTime: fulfillmentType === 'pickup' ? pickupTime : undefined,
        deliveryDate,
        deliverySlot,
        paymentMethod,
        hitpayStatus: 'pending',
        hitpayReference: randomId,
        orderNotes,
        deliveryInstructions,
      },
      subtotal,
      deliveryFee,
      coolerBoxFee,
      packagingType,
      discount: activeItemDiscount,
      total,
      status: 'menunggu_bayaran',
      createdAt: new Date().toISOString(),
      estimatedDeliveryText,
      fulfillmentType,
      pickupTime: fulfillmentType === 'pickup' ? pickupTime : undefined,
      appliedCoupon: [activeItemCoupon?.code, activeDeliveryCoupon?.code].filter(Boolean).join(', ') || undefined,
    };

    if (activeUser && saveAddressToAccount && fulfillmentType === 'delivery') {
      try {
        const alreadySaved = activeUser.savedAddresses?.some(
          (a) => a.address.trim().toLowerCase() === address.trim().toLowerCase() && a.postcode.trim() === postcode.trim()
        );
        if (!alreadySaved) {
          const updatedAddresses = authService.addAddress({
            label: 'Alamat Rumah',
            fullName,
            phone,
            address,
            postcode,
            city,
            state,
            isDefault: (activeUser.savedAddresses?.length || 0) === 0,
          });
          setLoggedInUser({
            ...activeUser,
            savedAddresses: updatedAddresses,
          });
        }
      } catch (e) {
        console.error('Error saving address to account:', e);
      }
    }

    if (paymentMethod === 'hitpay') {
      try {
        const hitpayRes = await hitpayService.createPaymentRequest(newOrder, hitpayConfig);
        
        if (hitpayRes.success && hitpayRes.url) {
          // Temporarily save order as pending
          if (activeItemCoupon?.code) dataStorageService.recordCouponUsage(activeItemCoupon.code);
          if (activeDeliveryCoupon?.code) dataStorageService.recordCouponUsage(activeDeliveryCoupon.code);
          dataStorageService.saveOrder(newOrder);
          
          setHitpayScreenData({
            isOpen: true,
            paymentUrl: hitpayRes.url,
            paymentId: hitpayRes.id,
            order: newOrder,
            isSimulated: hitpayRes.isSimulated,
          });
          setIsSubmitting(false);
          return;
        } else {
          throw new Error(hitpayRes.message || 'Gagal mencipta pautan bayaran HitPay');
        }
      } catch (err: any) {
        setPaymentError(err.message || 'Ralat sistem HitPay');
        setIsSubmitting(false);
        return;
      }
    }

    // DuitNow QR & Bank Transfer Direct Checkout Flow
    newOrder.status = 'menunggu_bayaran';
    newOrder.customer.hitpayStatus = 'pending';
    if (activeItemCoupon?.code) dataStorageService.recordCouponUsage(activeItemCoupon.code);
    if (activeDeliveryCoupon?.code) dataStorageService.recordCouponUsage(activeDeliveryCoupon.code);

    dataStorageService.saveOrder(newOrder);
    setIsSubmitting(false);
    onCompleteOrder(newOrder);
  };

  if (!isOpen) return null;

  // Render HitPay Waiting / Action Screen if payment request is active
  if (hitpayScreenData?.isOpen && hitpayScreenData.order) {
    const pendingOrder = hitpayScreenData.order;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
        <div 
          className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-6 flex flex-col transition-colors"
          role="dialog"
        >
          {/* Header */}
          <div className="bg-stone-900 dark:bg-stone-950 text-white p-5 flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                HP
              </div>
              <div>
                <h3 className="text-base font-extrabold font-['Outfit']">
                  Gerbang Bayaran HitPay
                </h3>
                <p className="text-xs text-stone-400">
                  FPX • DuitNow QR • E-Wallet • Kad Bank
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

          <div className="p-6 space-y-5 text-stone-800 dark:text-stone-200">
            {/* Status Card */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-800/80 text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wide">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Menunggu Pembayaran Selesai</span>
              </div>
              
              <div className="py-1">
                <span className="text-xs text-stone-500 dark:text-stone-400 font-bold block">
                  Jumlah Perlu Dibayar:
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 font-['Outfit']">
                  RM {pendingOrder.total.toFixed(2)}
                </span>
              </div>

              <div className="text-xs text-stone-600 dark:text-stone-300 flex items-center justify-center gap-2">
                <span>No. Rujukan Tempahan:</span>
                <span className="font-mono font-black text-stone-900 dark:text-white bg-stone-200 dark:bg-stone-800 px-2 py-0.5 rounded-md">
                  #{pendingOrder.orderId}
                </span>
              </div>
            </div>

            {/* Instruction Notice */}
            <p className="text-xs text-stone-600 dark:text-stone-300 text-center leading-relaxed">
              Tetingkap bayaran HitPay telah dibuka. Jika tetingkap tidak terbuka secara automatik, sila klik butang di bawah untuk membuka halaman bayaran selamat HitPay.
            </p>

            {/* Primary Action: Open HitPay Payment Window */}
            <div className="space-y-2.5">
              <a
                href={hitpayScreenData.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka Halaman Bayaran HitPay Sekarang</span>
              </a>

              {/* Status Checker */}
              <button
                type="button"
                disabled={checkingPaymentStatus}
                onClick={async () => {
                  setCheckingPaymentStatus(true);
                  const siteSettings = dataStorageService.getSiteSettings();
                  const cfg = siteSettings.hitpayConfig || { apiKey: '', isSandbox: true };
                  const res = await hitpayService.checkPaymentStatus(
                    hitpayScreenData.paymentId,
                    cfg.apiKey,
                    cfg.isSandbox
                  );
                  setCheckingPaymentStatus(false);

                  if (res.status === 'completed') {
                    const completedOrder: OrderRecord = {
                      ...pendingOrder,
                      status: 'disahkan',
                      customer: {
                        ...pendingOrder.customer,
                        hitpayStatus: 'completed',
                      },
                    };
                    dataStorageService.saveOrder(completedOrder);
                    setHitpayScreenData(null);
                    onCompleteOrder(completedOrder);
                  } else {
                    alert(
                      `Status bayaran HitPay semasa: ${
                        res.status === 'pending' ? 'Belum Selesai (Pending)' : res.status
                      }\n\nSila lengkapkan transaksi FPX / DuitNow di laman HitPay sebelum menyemak semula.`
                    );
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl border-2 border-emerald-600 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {checkingPaymentStatus ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                ) : (
                  <RefreshCw className="w-4 h-4 text-emerald-600" />
                )}
                <span>Semak Status Pembayaran HitPay Terkini</span>
              </button>

              {/* Direct confirmation fallback */}
              <button
                type="button"
                onClick={() => {
                  const completedOrder: OrderRecord = {
                    ...pendingOrder,
                    status: 'disahkan',
                    customer: {
                      ...pendingOrder.customer,
                      hitpayStatus: 'completed',
                    },
                  };
                  dataStorageService.saveOrder(completedOrder);
                  setHitpayScreenData(null);
                  onCompleteOrder(completedOrder);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900 dark:bg-stone-800 hover:bg-stone-950 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Saya Telah Selesai Buat Bayaran</span>
              </button>
            </div>

            {/* Back button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setHitpayScreenData(null)}
                className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline font-medium cursor-pointer"
              >
                ⬅️ Kembali & Tukar Kaedah Pembayaran
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-6 flex flex-col max-h-[92vh] transition-colors"
        role="dialog"
      >
        {/* Header */}
        <div className="bg-stone-900 dark:bg-stone-950 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              {fulfillmentType === 'delivery' ? <Truck className="w-5 h-5" /> : <Store className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-['Outfit']">
                Daftar Pesanan • Khairul Fresh Food
              </h2>
              <p className="text-xs text-stone-400">
                Waktu Operasi (Selasa - Ahad): 7:00 AM - 12:00 Tengah Hari • Isnin Tutup
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-stone-800 dark:text-stone-200">
          
          {/* SECTION 0: PILIHAN KAEDAH PESANAN (Penghantaran vs Self-Pickup) */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800">
            <label className="block text-xs font-black uppercase text-emerald-900 dark:text-emerald-300 tracking-wider mb-2.5">
              Pilih Cara Penerimaan Pesanan:
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Delivery */}
              <button
                type="button"
                onClick={() => setFulfillmentType('delivery')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex items-start gap-3 ${
                  fulfillmentType === 'delivery'
                    ? 'border-emerald-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-md ring-2 ring-emerald-500/30'
                    : 'border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-100/40 dark:bg-emerald-950/20 text-stone-700 dark:text-stone-300 hover:bg-white/70'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black">🚚 Penghantaran ke Rumah</span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    Rider hantar terus ke alamat anda mengikut zon poskod.
                  </p>
                </div>
              </button>

              {/* Option 2: Self-Pickup */}
              <button
                type="button"
                onClick={() => setFulfillmentType('pickup')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex items-start gap-3 ${
                  fulfillmentType === 'pickup'
                    ? 'border-emerald-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-md ring-2 ring-emerald-500/30'
                    : 'border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-100/40 dark:bg-emerald-950/20 text-stone-700 dark:text-stone-300 hover:bg-white/70'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black">🏪 Ambil Sendiri di Kedai</span>
                    <span className="px-2 py-0.2 rounded-full bg-emerald-600 text-white font-extrabold text-[10px]">
                      RM0.00 (PERCUMA)
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    Ambil di GA 59, Pasar Semenyih (7:00 AM - 12:00 PM).
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* CUSTOMER AUTHENTICATION / LOGIN TAB BAR (BEFORE SECTION 1) */}
          {loggedInUser ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-emerald-100/50 to-emerald-50 dark:from-emerald-950/60 dark:via-emerald-900/40 dark:to-emerald-950/60 border border-emerald-300 dark:border-emerald-800 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                    {loggedInUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-emerald-950 dark:text-emerald-100">
                        Akaun Ahli: {loggedInUser.name}
                      </span>
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>{loggedInUser.loyaltyPoints || 0} Mata Ganjaran</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                      {loggedInUser.email} {loggedInUser.phone && `• ${loggedInUser.phone}`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleInlineLogout}
                  className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-stone-600 dark:text-stone-300 hover:text-rose-600 text-xs font-bold border border-emerald-200 dark:border-emerald-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Tukar / Log Keluar</span>
                </button>
              </div>

              {loginSuccessMsg && (
                <div className="mt-2.5 p-2 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>{loginSuccessMsg}</span>
                </div>
              )}

              {/* Saved Addresses Quick Selector */}
              {loggedInUser.savedAddresses && loggedInUser.savedAddresses.length > 0 && fulfillmentType === 'delivery' && (
                <div className="mt-3 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/80">
                  <label className="block text-[11px] font-bold text-emerald-950 dark:text-emerald-200 mb-1.5 flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pilih Alamat Penghantaran Tersimpan:</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {loggedInUser.savedAddresses.map((addr) => {
                      const isSelected = selectedSavedAddressId === addr.id;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`p-2.5 rounded-xl text-left text-xs transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-white dark:bg-stone-900 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                              : 'bg-white/70 dark:bg-stone-900/70 border-emerald-200/70 dark:border-emerald-800/70 hover:bg-white hover:border-emerald-400'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold text-stone-900 dark:text-white">
                            <span>{addr.label || 'Alamat Tersimpan'}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
                          <p className="text-[11px] text-stone-600 dark:text-stone-300 truncate mt-0.5">{addr.address}</p>
                          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">{addr.postcode} {addr.city}</p>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSavedAddressId('');
                        setAddress('');
                        setPostcode('');
                        setCity('');
                        setState('');
                      }}
                      className="p-2.5 rounded-xl text-left text-xs border border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-white text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>+ Guna Alamat Baharu</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 overflow-hidden shadow-2xs">
              {/* 2-Tab Selector Buttons: Registration Required */}
              <div className="grid grid-cols-2 border-b border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800/60 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('register');
                    setRegError('');
                  }}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                    authTab === 'register'
                      ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs border border-emerald-300 dark:border-emerald-700'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 dark:hover:bg-stone-700/60'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">Daftar Ahli (+50 Mata)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('login');
                    setLoginError('');
                  }}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                    authTab === 'login'
                      ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs border border-emerald-300 dark:border-emerald-700'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 dark:hover:bg-stone-700/60'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Log Masuk</span>
                </button>
              </div>

              {/* Tab 1 Content: Register Form */}
              {authTab === 'register' && (
                <div className="p-4 bg-white dark:bg-stone-900 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black text-stone-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Pendaftaran Akaun Ahli Diperlukan</span>
                        <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-extrabold rounded-md">
                          Percuma 50 Mata
                        </span>
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        Pembelian hanya dibuka untuk ahli berdaftar. Cipta username & kata laluan anda untuk pendaftaran automatik semasa membuat pesanan.
                      </p>
                    </div>
                  </div>

                  {regError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{regError}</span>
                    </div>
                  )}

                  {regSuccessMsg && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{regSuccessMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Username / ID Pengguna *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold pointer-events-none">@</span>
                        <input
                          type="text"
                          value={regUsername}
                          onChange={(e) => {
                            setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''));
                            if (regError) setRegError('');
                          }}
                          placeholder="cth: amir88 atau siti_fresh"
                          className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl pl-7 pr-3 py-2 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-emerald-500 focus:outline-hidden"
                        />
                      </div>
                      <span className="text-[10px] text-stone-400 mt-0.5 block">
                        Digunakan untuk log masuk ke Customer Portal
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Cipta Kata Laluan *
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          value={regPassword}
                          onChange={(e) => {
                            setRegPassword(e.target.value);
                            if (regError) setRegError('');
                          }}
                          placeholder="Minima 6 aksara"
                          className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 pr-9 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-emerald-500 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <span className="text-[10px] text-stone-400 mt-0.5 block">
                        Simpan kata laluan ini untuk semak pesanan nanti
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setAuthTab('login')}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer flex items-center gap-1"
                    >
                      <span>Sudah ada akaun? Log Masuk di sini →</span>
                    </button>

                    <button
                      type="button"
                      disabled={regLoading || !regUsername.trim() || !regPassword || !fullName.trim() || !phone.trim()}
                      onClick={handleInlineRegister}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-40 transition-all"
                    >
                      {regLoading ? (
                        <span>Mendaftarkan...</span>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Daftar Sekarang (+50 Mata)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2 Content: Login Form */}
              {authTab === 'login' && (
                <div className="p-4 bg-white dark:bg-stone-900 space-y-3">
                  <div>
                    <h4 className="text-xs font-black text-stone-900 dark:text-white flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Log Masuk Akaun Ahli</span>
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      Log masuk untuk auto-isi nama, nombor telefon WhatsApp, alamat tersimpan dan kumpul mata ganjaran.
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Username / Emel / No. Telefon
                      </label>
                      <input
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => {
                          setLoginIdentifier(e.target.value);
                          if (loginError) setLoginError('');
                        }}
                        placeholder="cth: amir88 atau 011-11135503"
                        className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Kata Laluan
                      </label>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => {
                            setLoginPassword(e.target.value);
                            if (loginError) setLoginError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleInlineLogin();
                            }
                          }}
                          placeholder="Masukkan kata laluan"
                          className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 pr-9 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-emerald-500 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
                        >
                          {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setAuthTab('register')}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
                    >
                      Belum ada akaun? Daftar Ahli Percuma (+50 Mata) →
                    </button>

                    <button
                      type="button"
                      disabled={loginLoading}
                      onClick={handleInlineLogin}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 transition-all"
                    >
                      {loginLoading ? (
                        <span>Menyemak...</span>
                      ) : (
                        <>
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Log Masuk & Auto-Isi</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 1: MAKLUMAT PELANGGAN & ALAMAT */}
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-white uppercase tracking-wide flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                1. Maklumat Pelanggan {fulfillmentType === 'delivery' ? '& Alamat Penghantaran' : '& Pengambilan'}
              </span>
            </h3>

            {/* Special Notice requested by user */}
            {fulfillmentType === 'delivery' && (
              <div className="mb-3.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-center gap-2 text-xs">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  <strong>Notis:</strong> Caj penghantaran mengikut poskod: Semenyih (RM6), Beranang (RM9), Kajang (RM15).
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Nama Penuh *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="cth: Ahmad Bin Abdullah"
                  className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:bg-white dark:focus:bg-stone-800 focus:border-emerald-500 focus:outline-hidden transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Nombor Telefon (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="cth: 011-11135503 atau 0123456789"
                  className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:bg-white dark:focus:bg-stone-800 focus:border-emerald-500 focus:outline-hidden transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Emel (Untuk Salinan Resit & Invois)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cth: ahmad@gmail.com (pilihan)"
                  className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:bg-white dark:focus:bg-stone-800 focus:border-emerald-500 focus:outline-hidden transition-colors"
                />
              </div>

              {/* Delivery Address Fields with requested sequence: Poskod → Bandar → Negeri */}
              {fulfillmentType === 'delivery' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Poskod *
                    </label>
                    <input
                      type="text"
                      required
                      value={postcode}
                      onChange={(e) => handlePostcodeChange(e.target.value)}
                      placeholder=""
                      className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-900 dark:text-white font-bold focus:bg-white dark:focus:bg-stone-800 focus:border-emerald-500 focus:outline-hidden transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Bandar *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => handleCityChange(e.target.value)}
                      placeholder=""
                      className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-900 dark:text-white focus:bg-white dark:focus:bg-stone-800 focus:border-emerald-500 focus:outline-hidden transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Negeri *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder=""
                      className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-900 dark:text-white focus:bg-white dark:focus:bg-stone-800 focus:border-emerald-500 focus:outline-hidden transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Alamat Rumah / Premis Lengkap *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder=""
                      className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-900 dark:text-white focus:bg-white dark:focus:bg-stone-800 focus:border-emerald-500 focus:outline-hidden resize-none transition-colors"
                    />
                  </div>

                  {/* Logged in User: Save Address to Account Checkbox */}
                  {loggedInUser && (
                    <label className="sm:col-span-2 flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-stone-700 dark:text-stone-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveAddressToAccount}
                        onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-medium text-emerald-950 dark:text-emerald-200">
                        Simpan alamat ini ke profil akaun saya untuk memudahkan pesanan akan datang
                      </span>
                    </label>
                  )}

                  {/* Rate & Zone Indicator Pill */}
                  {zoneMatch.isSupported ? (
                    <div className="sm:col-span-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-300 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>
                          Zon Sah: <strong>{zoneMatch.zoneName} ({postcode || zoneMatch.standardPostcode})</strong>
                        </span>
                      </span>
                      <span className="font-extrabold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-stone-800 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-700">
                        Caj Hantar: RM {deliveryFee.toFixed(2)}
                      </span>
                    </div>
                  ) : (postcode.trim() !== '' || city.trim() !== '') ? (
                    <div className="sm:col-span-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span>
                        Luar Zon Liputan. Penghantaran ke rumah hanya dibuka untuk 3 kawasan sahaja: <strong>Semenyih (43500)</strong>, <strong>Beranang (43700)</strong>, dan <strong>Kajang (43000)</strong>.
                      </span>
                    </div>
                  ) : (
                    <div className="sm:col-span-2 p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-400 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-stone-500 shrink-0" />
                      <span>
                        3 Zon Penghantaran Disediakan: <strong>Semenyih (43500)</strong>, <strong>Beranang (43700)</strong>, dan <strong>Kajang (43000)</strong>.
                      </span>
                    </div>
                  )}
                </>
              ) : (
                /* Self-Pickup Info Card */
                <div className="sm:col-span-2 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <Store className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-sm text-stone-900 dark:text-white font-extrabold">
                        Lokasi Ambil Sendiri (Self-Pickup):
                      </strong>
                      <p className="text-stone-700 dark:text-stone-300 font-medium mt-0.5">
                        {STORE_PICKUP_LOCATION.address}
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                        ⏱️ Waktu Pengambilan: Bermula 1 jam selepas pembayaran disahkan, selewat-lewatnya jam <strong>12:00 Tengah Hari</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: TARIKH & WAKTU OPERASI (SELASA - AHAD) */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
              <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>2. Pilih Tarikh {fulfillmentType === 'delivery' ? '& Slot Penghantaran' : '& Waktu Ambil'}</span>
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full inline-flex items-center gap-1 w-fit">
                <Sparkles className="w-3 h-3" />
                Ayam Segar Pagi
              </span>
            </div>

            {/* Daily Cut-Off Rule Notice Card */}
            <div className={`mb-3 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              cutoffInfo.isCutoffPassed
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            }`}>
              <Clock className={`w-4 h-4 mt-0.5 shrink-0 ${cutoffInfo.isCutoffPassed ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
              <div className="space-y-0.5">
                <div className="font-extrabold flex items-center gap-2">
                  <span>Waktu Cut-Off Pesanan: 11:00 Malam Setiap Hari</span>
                  <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                    cutoffInfo.isCutoffPassed
                      ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {cutoffInfo.isCutoffPassed ? 'Slot Esok Ditutup' : 'Slot Esok Dibuka'}
                  </span>
                </div>
                <p className="text-[11px] opacity-90">
                  {cutoffInfo.isCutoffPassed
                    ? 'Waktu cut-off 11:00 Malam telah tamat untuk penghantaran esok. Pilihan penghantaran paling awal bermula Lusa dan hari-hari seterusnya mengikut pilihan anda.'
                    : 'Order hari ini akan dihantar bermula Esok atau hari-hari seterusnya mengikut tarikh pilihan anda di bawah.'}
                </p>
              </div>
            </div>

            {/* Monday Closure Alert Notice */}
            {mondayWarning && (
              <div className="mb-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{mondayWarning}</span>
              </div>
            )}

            {/* Simple Clean Delivery Date Selector (No cluttered monthly calendar, strict cut-off enforcement) */}
            <div className="mb-4">
              <DeliveryDateSelector
                selectedDate={deliveryDate}
                minDateStr={cutoffInfo.minDateStr}
                isCutoffPassed={cutoffInfo.isCutoffPassed}
                availableDates={cutoffInfo.availableDates}
                fulfillmentType={fulfillmentType}
                onSelectDate={(newDate) => {
                  setMondayWarning(null);
                  handleDateChange(newDate);
                }}
              />
            </div>

            {/* Time Slot for Delivery vs Time Selection for Self Pickup */}
            {fulfillmentType === 'delivery' ? (
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Pilih Slot Waktu Penghantaran:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DELIVERY_SLOTS.map((slot) => {
                    const isSelected = deliverySlot === slot.id;
                    return (
                      <div
                        key={slot.id}
                        onClick={() => setDeliverySlot(slot.id)}
                        className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/50 shadow-xs ring-2 ring-emerald-500/20'
                            : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 hover:border-stone-300 dark:hover:border-stone-600'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-xs font-black text-stone-900 dark:text-white flex items-center gap-1.5">
                              <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400'}`} />
                              {slot.label}
                            </span>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'border-emerald-600 bg-emerald-600 text-white'
                                  : 'border-stone-300 dark:border-stone-600'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                          </div>

                          <div className="inline-block bg-white dark:bg-stone-900 px-2 py-0.5 rounded-md border border-stone-200/80 dark:border-stone-700 font-bold text-xs text-emerald-800 dark:text-emerald-300 mb-1.5">
                            {slot.timeRange}
                          </div>

                          <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
                            {slot.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Pilih Anggaran Waktu Pengambilan di Kedai (Sebelum 12:00 Tengah Hari):
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '11:45 AM'].map((time) => {
                    const isSelected = pickupTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setPickupTime(time)}
                        className={`p-2 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                            : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special notes */}
            <div className="mt-3">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Nota Tambahan untuk Pesanan (Pilihan)
              </label>
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder=""
                className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 focus:bg-white dark:focus:bg-stone-800 focus:border-emerald-500 focus:outline-hidden transition-colors"
              />
            </div>
          </div>

          {/* SECTION 3: PILIHAN PEMBUNGKUSAN KESEGARAN (COOLER BOX VS BIASA) */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                <Box className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>3. Pilihan Pembungkusan Kesegaran ({totalUnits} Unit Dipilih)</span>
              </h3>
              <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400">
                Maksimum 30 Unit / Pesanan
              </span>
            </div>

            {/* 30 units max warning banner */}
            {isOverMaxLimit && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-400 dark:border-rose-700 text-rose-900 dark:text-rose-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-black text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>HAD MAKSIMUM 30 UNIT DICAPAI ({totalUnits} UNIT DALAM BAKUL)</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Bagi menjamin kualiti rantaian sejuk dingin dan keselamatan muatan rider, setiap pesanan dihadkan kepada <strong>maksimum 30 unit</strong>. Sila kurangkan kuantiti atau buat pembelian tambahan secara berasingan untuk baki pesanan anda.
                </p>
              </div>
            )}

            <div className={`grid grid-cols-1 ${showCoolerBoxOption ? 'sm:grid-cols-2' : ''} gap-2.5`}>
              {/* Option 1: Bungkusan Biasa */}
              <button
                type="button"
                onClick={() => setPackagingType('bungkusan-biasa-ais')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                  packagingType === 'bungkusan-biasa-ais'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 bg-white dark:bg-stone-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-stone-900 dark:text-white flex items-center gap-1.5">
                      <span>🛍️ Bungkusan Biasa + Ais</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                      Percuma
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                    Dibungkus kemas dengan plastik tebal & pek ais batu standard segar.
                  </p>
                </div>
              </button>

              {/* Option 2: Cooler Box (Hanya dipaparkan jika diaktifkan oleh admin) */}
              {showCoolerBoxOption && (
                <button
                  type="button"
                  onClick={() => setPackagingType('cooler-box')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                    packagingType === 'cooler-box'
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 bg-white dark:bg-stone-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-xs text-stone-900 dark:text-white flex items-center gap-1.5">
                        <span>🧊 Kotak Cooler Box Penebat</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {totalUnits < 10 ? '+RM 5.00' : '+RM 10.00'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-snug">
                      Kotak polisterin penebat dingin + ais batu padat tahan suhu 0°C berjam-jam.
                    </p>
                    <div className="mt-1.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                      {totalUnits < 10 ? '• Caj RM5 (<10 unit)' : '• Caj RM10 (10-30 unit)'}
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* SECTION 4: KAEDAH PEMBAYARAN */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>4. Kaedah Pembayaran</span>
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <ShieldCheck className="w-3 h-3" />
                <span>Pembayaran Selamat</span>
              </span>
            </div>

            {/* Kaedah Bayaran: DuitNow QR (OCBC Bank) Sahaja */}
            <div className="space-y-3">
              <DuitNowOCBCQR
                orderTotal={total}
                customerName={fullName}
                customerPhone={phone}
              />
            </div>
          </div>

          {/* SECTION 4: RINGKASAN PESANAN & TOTAL */}
          <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
            <h4 className="text-xs font-black uppercase text-stone-900 dark:text-white flex items-center justify-between">
              <span>Item Tempahan ({items.reduce((s, i) => s + i.quantity, 0)} item)</span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">Khairul Fresh Food</span>
            </h4>

            {/* Itemized List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item, idx) => {
                const itemPrice = item.selectedWeightOption ? item.selectedWeightOption.price : item.product.price;
                const lineTotal = itemPrice * item.quantity;

                return (
                  <div key={`${item.product.id}-${idx}`} className="p-2.5 rounded-xl bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-700 flex items-start justify-between gap-2 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-stone-900 dark:text-white block">
                        {item.product.name} <span className="text-emerald-600 dark:text-emerald-400">× {item.quantity}</span>
                      </span>

                      {/* Weight option badge if selected */}
                      {item.selectedWeightOption ? (
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                          <span>⚖️ Saiz: {item.selectedWeightOption.weightLabel}</span>
                          <span>(RM {item.selectedWeightOption.price.toFixed(2)}/ekor)</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-stone-500 block">{item.product.weightEstimate}</span>
                      )}

                      {/* Cut detail */}
                      {item.selectedCut && (
                        <div className="text-[10px] text-stone-600 dark:text-stone-400 flex items-center gap-1">
                          <span className="font-semibold">
                            Potongan: {getCutLabel(item.selectedCut, item.product)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-stone-900 dark:text-white">
                        RM {lineTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-stone-200 dark:border-stone-700 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-300">
                <span>Nilai Item Ayam:</span>
                <span className="font-bold">RM {subtotal.toFixed(2)}</span>
              </div>

              {activeItemDiscount > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 font-bold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Diskaun Kupon Item ({activeItemCoupon?.code || 'Diskaun'}):</span>
                  </span>
                  <span>- RM {activeItemDiscount.toFixed(2)}</span>
                </div>
              )}

              {/* Cooler Box Fee Row if selected */}
              {packagingType === 'cooler-box' && (
                <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40 p-1.5 rounded-lg border border-blue-200 dark:border-blue-800 font-bold">
                  <span className="flex items-center gap-1">
                    <Box className="w-3.5 h-3.5" />
                    <span>Kotak Cooler Box Penebat ({totalUnits < 10 ? '<10 unit' : '10-30 unit'}):</span>
                  </span>
                  <span>+ RM {coolerBoxFee.toFixed(2)}</span>
                </div>
              )}

              {fulfillmentType === 'delivery' ? (
                <>
                  <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-300">
                    <span>
                      Caj Penghantaran Asal {zoneMatch.isSupported ? `(${zoneMatch.zoneName}${postcode ? ` - ${postcode}` : ''})` : ''}:
                    </span>
                    <span className="font-bold">
                      {zoneMatch.isSupported ? `RM ${baseDeliveryFee.toFixed(2)}` : 'Sila masukkan poskod zon'}
                    </span>
                  </div>

                  {isAutoDeliveryEligible && autoDeliveryDiscount > 0 && (
                    <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 font-bold">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Auto Diskaun Penghantaran (Belian RM150+):</span>
                      </span>
                      <span>- RM {autoDeliveryDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {activeDeliveryCoupon && couponDeliveryDiscount > 0 && (
                    <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 p-1.5 rounded-lg border border-blue-200 dark:border-blue-800 font-bold">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Diskaun Kupon Penghantaran ({activeDeliveryCoupon.code}):</span>
                      </span>
                      <span>- RM {couponDeliveryDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-stone-700 dark:text-stone-200 font-bold">
                    <span>Caj Penghantaran Perlu Dibayar:</span>
                    <span className="font-black text-emerald-700 dark:text-emerald-400">
                      {deliveryFee === 0 ? 'RM 0.00 (Percuma Selepas Diskaun)' : `RM ${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-300">
                  <span>Caj Pengambilan (Self-Pickup Pasar):</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-extrabold uppercase text-[11px]">
                    RM0.00 (Percuma)
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between text-sm sm:text-base font-black text-stone-900 dark:text-white">
              <span>Jumlah Perlu Dibayar:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-['Outfit'] text-lg sm:text-xl">
                RM {total.toFixed(2)}
              </span>
            </div>

            <div className="text-[11px] text-stone-500 dark:text-stone-400 pt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Jaminan Kualiti Khairul FRESH Food: Ayam segar berkualiti & Halal Dijamin.</span>
            </div>
          </div>

          {/* Payment Error Alert if any */}
          {paymentError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 space-y-2 animate-fade-in text-xs shadow-xs">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong className="font-bold text-sm block text-rose-950 dark:text-rose-100">
                    Makluman:
                  </strong>
                  <p className="mt-0.5 leading-relaxed text-rose-800 dark:text-rose-200">
                    {paymentError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isOverMaxLimit}
              className={`font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                isOverMaxLimit
                  ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses Pesanan...</span>
                </>
              ) : isOverMaxLimit ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>Had Maksimum 30 Unit ({totalUnits}/30)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sahkan Pesanan (RM {total.toFixed(2)})</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
