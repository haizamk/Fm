import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, CouponCode } from '../types';
import { CHICKEN_CUT_OPTIONS, CLEANING_OPTIONS, PACKAGING_OPTIONS, getCutLabel } from '../data/products';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Truck, 
  ArrowRight, 
  MessageCircle,
  Scissors,
  Sparkles,
  ShieldCheck,
  Tag,
  CheckCircle2,
  AlertCircle,
  Scale,
  Hand
} from 'lucide-react';
import { ProductImage } from './ProductImage';
import { useLanguage } from '../context/LanguageContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedCheckout: () => void;
  onQuickWhatsAppOrder?: () => void;
  freeDeliveryThreshold?: number;
  appliedCoupon?: CouponCode | null;
  couponDiscount?: number;
  appliedItemCoupon?: CouponCode | null;
  appliedDeliveryCoupon?: CouponCode | null;
  itemCouponDiscount?: number;
  deliveryCouponDiscount?: number;
  onApplyCoupon: (code: string) => { success: boolean; message: string };
  onRemoveCoupon: (type?: 'item' | 'delivery' | 'all') => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout,
  appliedCoupon,
  couponDiscount = 0,
  appliedItemCoupon,
  appliedDeliveryCoupon,
  itemCouponDiscount = 0,
  deliveryCouponDiscount = 0,
  onApplyCoupon,
  onRemoveCoupon,
}) => {
  const { t, isEn, tProduct, tCut, tCleaning, tPackaging } = useLanguage();
  const [inputCouponCode, setInputCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const promoDeliveryMin = 150;
  const totalUnits = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const subtotal = items.reduce((sum, item) => sum + (item.itemTotalPrice || 0), 0);
  const remainingForPromo = Math.max(0, promoDeliveryMin - subtotal);
  const promoProgress = Math.min(100, (subtotal / promoDeliveryMin) * 100);

  // Active coupons
  const activeItemCoupon = appliedItemCoupon || (appliedCoupon?.discountType !== 'delivery' && appliedCoupon?.category !== 'delivery' ? appliedCoupon : null);
  const activeDeliveryCoupon = appliedDeliveryCoupon || (appliedCoupon?.discountType === 'delivery' || appliedCoupon?.category === 'delivery' ? appliedCoupon : null);
  const activeItemDiscount = itemCouponDiscount || (activeItemCoupon ? couponDiscount : 0);
  const activeDeliveryDiscount = deliveryCouponDiscount || (activeDeliveryCoupon ? couponDiscount : 0);

  // Auto delivery discount for orders >= RM150
  const isAutoDeliveryEligible = subtotal >= promoDeliveryMin;

  const totalDiscount = activeItemDiscount;
  const estimatedTotal = Math.max(0, subtotal - totalDiscount);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCouponCode.trim()) {
      setCouponFeedback({ 
        type: 'error', 
        text: isEn ? 'Please enter a coupon code.' : 'Sila masukkan kod kupon.' 
      });
      return;
    }

    try {
      const res = onApplyCoupon(inputCouponCode.trim());
      if (res && res.success) {
        setCouponFeedback({ 
          type: 'success', 
          text: res.message || (isEn ? 'Coupon applied successfully!' : 'Kod kupon berjaya digunakan.') 
        });
        setInputCouponCode('');
      } else {
        setCouponFeedback({ 
          type: 'error', 
          text: (res && res.message) ? res.message : (isEn ? 'Invalid coupon code.' : 'Kod kupon tidak sah.') 
        });
      }
    } catch {
      setCouponFeedback({ 
        type: 'error', 
        text: isEn ? 'Failed to validate coupon.' : 'Gagal mengesahkan kupon.' 
      });
    }
  };

  const handleRemove = (type: 'item' | 'delivery' | 'all') => {
    onRemoveCoupon(type);
    setCouponFeedback(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-stone-900 h-full shadow-2xl flex flex-col z-50 text-stone-900 dark:text-stone-100 border-l border-stone-200 dark:border-stone-800"
        role="dialog"
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-stone-900 dark:text-white text-base">
                {t('cartTitle')}
              </h2>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {items.length} {isEn ? (items.length === 1 ? 'item selected' : 'items selected') : 'jenis item dipilih'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label={t('cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping / Delivery Discount Progress Indicator */}
        <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/50 shrink-0">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold flex items-center gap-1 text-emerald-900 dark:text-emerald-200">
              <Truck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              {remainingForPromo > 0
                ? (isEn 
                    ? `Add RM ${remainingForPromo.toFixed(2)} more for RM6.00 Delivery Discount!` 
                    : `Tambah RM ${remainingForPromo.toFixed(2)} lagi untuk Diskaun Penghantaran RM6.00!`)
                : t('freeShippingUnlocked')}
            </span>
            <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
              {Math.round(promoProgress)}%
            </span>
          </div>
          <div className="w-full bg-emerald-200/60 dark:bg-emerald-900/50 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${promoProgress}%` }}
            />
          </div>
        </div>

        {/* 30 Unit Maximum Limit Notice */}
        {totalUnits >= 30 && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs shrink-0 flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-amber-950 dark:text-amber-100">
                {t('maxUnitLimitTitle')} ({totalUnits}/30)
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                {t('maxUnitLimitDesc')}
              </p>
              <a
                href={`https://wa.me/601111135503?text=${encodeURIComponent(`Salam Khairul Fresh Food, saya ingin membuat tempahan pukal / katering melebihi 30 unit.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline mt-0.5"
              >
                <span>{t('whatsappBulkOrder')}</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Swipe-to-Remove Instruction Tip for Mobile Users */}
        {items.length > 0 && (
          <div className="px-4 py-1.5 bg-stone-100/80 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1">
              <Hand className="w-3 h-3 text-emerald-600" />
              <span>{t('swipeToDeleteHint')}</span>
            </span>
            <span className="text-[10px] text-stone-400">←</span>
          </div>
        )}

        {/* Cart Item List with Swipe-To-Remove Gestures */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-300 dark:text-stone-600 mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-stone-700 dark:text-stone-200 text-base">{t('cartEmptyTitle')}</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs">
                {t('cartEmptyDesc')}
              </p>
              <button
                onClick={onClose}
                className="mt-4 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                {t('startShoppingBtn')}
              </button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const transProd = tProduct(item.product);
                const cutInfo = tCut(item.selectedCut, getCutLabel(item.selectedCut, item.product));
                const packagingObj = PACKAGING_OPTIONS.find((p) => p.id === item.packaging);
                const packagingInfo = packagingObj ? tPackaging(packagingObj.id, packagingObj.label) : null;

                return (
                  <motion.div
                    key={item.cartItemId}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25 }}
                    className="relative overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs"
                  >
                    {/* Underlying Red Background revealed on Left Swipe */}
                    <div 
                      onClick={() => onRemoveItem(item.cartItemId)}
                      className="absolute inset-y-0 right-0 w-28 bg-rose-600 hover:bg-rose-700 text-white flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors z-0"
                    >
                      <Trash2 className="w-5 h-5 animate-bounce" />
                      <span className="text-[10px] font-extrabold tracking-wider uppercase">
                        {t('swipeToDeleteAction')}
                      </span>
                    </div>

                    {/* Interactive Draggable Top Layer */}
                    <motion.div
                      drag="x"
                      dragConstraints={{ left: -100, right: 0 }}
                      dragElastic={{ left: 0.15, right: 0 }}
                      onDragEnd={(_, info) => {
                        // If swiped left beyond -65px or fast flick left
                        if (info.offset.x < -65 || info.velocity.x < -350) {
                          onRemoveItem(item.cartItemId);
                        }
                      }}
                      className="relative z-10 bg-white dark:bg-stone-900 p-3.5 flex gap-3 select-none touch-pan-y"
                    >
                      <div className="w-18 h-18 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 shrink-0 bg-stone-100 dark:bg-stone-800">
                        <ProductImage product={item.product} alt={transProd.name} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-stone-900 dark:text-white text-sm truncate">
                            {transProd.name}
                          </h4>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveItem(item.cartItemId);
                            }}
                            className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                            title={isEn ? "Remove item" : "Padam item"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Weight option, cut, cleaning, and packaging tags */}
                        <div className="mt-1 space-y-0.5 text-xs text-stone-600 dark:text-stone-300">
                          {item.selectedWeightOption && (
                            <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-extrabold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60 w-fit">
                              <Scale className="w-3 h-3 text-emerald-600" />
                              <span>{isEn ? 'Weight' : 'Berat'}: {item.selectedWeightOption.weightLabel} (RM {item.selectedWeightOption.price.toFixed(2)})</span>
                            </div>
                          )}

                          {item.organVariationLabel && (
                            <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1">
                              <span>{isEn ? 'Option' : 'Variasi'}: {item.organVariationLabel}</span>
                            </div>
                          )}

                          {item.bakarOption && (
                            <div className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1">
                              <span>{item.bakarOption === 'bakar' ? (isEn ? '🔥 Singed Fine Feathers' : '🔥 Bakar Bulu Halus') : (isEn ? 'Standard (No Feather Singe)' : 'Tak Bakar (Standard)')}</span>
                            </div>
                          )}

                          {item.product.supportsCutting && (
                            <div className="flex items-center gap-1 text-emerald-800 dark:text-emerald-300 font-medium">
                              <Scissors className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span className="truncate">{cutInfo.label}</span>
                            </div>
                          )}

                          {item.selectedCleaning && item.selectedCleaning.length > 0 && (
                            <div className="text-[11px] text-stone-600 dark:text-stone-300 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate">
                                {isEn ? 'Cleaned' : 'Cuci'}: {item.selectedCleaning.map(cid => {
                                  const c = CLEANING_OPTIONS.find(opt => opt.id === cid);
                                  const cTrans = tCleaning(cid, c?.label || cid);
                                  return cTrans.label.replace(' (+RM1.00 / ekor)', '').replace(' (+RM1.00 / bird)', '');
                                }).join(', ')}
                              </span>
                            </div>
                          )}
                          
                          {packagingInfo && (
                            <div className={`text-[11px] font-medium flex items-center gap-1 text-stone-500 dark:text-stone-400`}>
                              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{packagingInfo.label}</span>
                            </div>
                          )}

                          {item.specialNotes && (
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 italic truncate">
                              {t('customNotesLabel')}: "{item.specialNotes}"
                            </p>
                          )}
                        </div>

                        {/* Stepper and price */}
                        <div className="mt-2.5 flex items-center justify-between">
                          <div className="flex items-center border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 rounded-lg">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                              className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                              aria-label="Kurangkan"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 py-0.5 text-xs font-bold text-stone-900 dark:text-white min-w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (totalUnits < 30) {
                                  onUpdateQuantity(item.cartItemId, item.quantity + 1);
                                }
                              }}
                              disabled={totalUnits >= 30}
                              className={`p-1 transition-colors cursor-pointer ${
                                totalUnits >= 30
                                  ? 'text-stone-300 dark:text-stone-600 cursor-not-allowed bg-stone-100 dark:bg-stone-800'
                                  : 'hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300'
                              }`}
                              aria-label="Tambah"
                              title={totalUnits >= 30 ? (isEn ? 'Max 30 units per order' : 'Maksimum 30 unit setiap pesanan') : (isEn ? 'Add quantity' : 'Tambah kuantiti')}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-extrabold text-sm text-stone-900 dark:text-white">
                            RM {item.itemTotalPrice.toFixed(2)}
                          </span>
                        </div>

                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 space-y-3 shrink-0">
            
            {/* Coupon Code Section */}
            <div className="p-3 bg-white dark:bg-stone-800/90 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isEn ? 'Promo Code & Discount Vouchers' : 'Kod Kupon & Baucar Diskaun'}</span>
                </span>
                {(activeItemCoupon || activeDeliveryCoupon) && (
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    {activeItemCoupon && activeDeliveryCoupon ? (isEn ? '2 Active Coupons' : '2 Kupon Aktif') : (isEn ? '1 Active Coupon' : '1 Kupon Aktif')}
                  </span>
                )}
              </div>

              {/* Active Item Coupon Badge */}
              {activeItemCoupon && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-mono">{activeItemCoupon.code}</span>
                      <span className="text-emerald-700 dark:text-emerald-400">
                        ({activeItemCoupon.discountType === 'percentage' ? `${isEn ? 'Discount' : 'Diskaun'} ${activeItemCoupon.discountValue}%` : `-RM ${activeItemDiscount.toFixed(2)}`})
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 truncate mt-0.5">
                      {activeItemCoupon.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove('item')}
                    className="p-1 rounded-lg text-emerald-700 dark:text-emerald-400 hover:text-rose-600 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors shrink-0 cursor-pointer"
                    title={isEn ? "Remove Item Discount Coupon" : "Buang Kupon Diskaun Item"}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Active Delivery Coupon Badge */}
              {activeDeliveryCoupon && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-200">
                      <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-mono">{activeDeliveryCoupon.code}</span>
                      <span className="text-blue-700 dark:text-blue-400">(-RM {activeDeliveryDiscount.toFixed(2)} {isEn ? 'Delivery' : 'Penghantaran'})</span>
                    </div>
                    <p className="text-[11px] text-blue-700 dark:text-blue-400 truncate mt-0.5">
                      {activeDeliveryCoupon.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove('delivery')}
                    className="p-1 rounded-lg text-blue-700 dark:text-blue-400 hover:text-rose-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors shrink-0 cursor-pointer"
                    title={isEn ? "Remove Delivery Coupon" : "Buang Kupon Penghantaran"}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Input for coupon if not both or user wants to add/replace */}
              <form onSubmit={handleApply} className="space-y-1.5">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={inputCouponCode}
                    onChange={(e) => setInputCouponCode(e.target.value)}
                    placeholder={
                      !activeItemCoupon && !activeDeliveryCoupon
                        ? (isEn ? 'Coupon code (e.g. SEGAR5, FREEDEL6)' : 'Kod kupon (cth: SEGAR5, FREEDEL6)')
                        : !activeItemCoupon
                          ? (isEn ? 'Enter item discount code' : 'Masukkan kod kupon produk')
                          : !activeDeliveryCoupon
                            ? (isEn ? 'Enter delivery discount code' : 'Masukkan kod diskaun penghantaran')
                            : (isEn ? 'Replace active coupon' : 'Gantikan kupon sedia ada')
                    }
                    className="flex-1 uppercase font-mono text-xs px-3 py-2 bg-stone-50 dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-xl focus:bg-white dark:focus:bg-stone-700 focus:border-emerald-500 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-hidden transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-stone-900 dark:bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    {t('applyCouponBtn')}
                  </button>
                </div>

                {couponFeedback && (
                  <div
                    className={`text-[11px] p-2 rounded-xl flex items-center gap-1.5 animate-fade-in ${
                      couponFeedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {couponFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    )}
                    <span className="leading-tight">{couponFeedback.text}</span>
                  </div>
                )}
              </form>
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>{t('subtotalLabel')}:</span>
                <span className="font-bold text-stone-900 dark:text-white">RM {(subtotal || 0).toFixed(2)}</span>
              </div>

              {activeItemDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50/80 dark:bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800 text-xs">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-emerald-600" />
                    <span>{t('discountLabel')} ({activeItemCoupon?.code || 'Promo'}):</span>
                  </span>
                  <span>- RM {activeItemDiscount.toFixed(2)}</span>
                </div>
              )}

              {isAutoDeliveryEligible ? (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50/80 dark:bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800 text-xs">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isEn ? 'Auto Delivery Discount (Orders RM150+):' : 'Auto Diskaun Penghantaran (Belian RM150+):'}</span>
                  </span>
                  <span>- RM 6.00</span>
                </div>
              ) : activeDeliveryDiscount > 0 ? (
                <div className="flex justify-between text-blue-700 dark:text-blue-400 font-bold bg-blue-50/80 dark:bg-blue-950/40 p-1.5 rounded-lg border border-blue-200/60 dark:border-blue-800 text-xs">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isEn ? 'Delivery Discount Code' : 'Diskaun Kod Penghantaran'} ({activeDeliveryCoupon?.code}):</span>
                  </span>
                  <span>- RM {activeDeliveryDiscount.toFixed(2)}</span>
                </div>
              ) : null}

              <div className="flex justify-between text-stone-600 dark:text-stone-400 text-xs">
                <span>{isEn ? 'Chilled Cold Chain Delivery:' : 'Penghantaran Sejuk Dingin:'}</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {isAutoDeliveryEligible ? (isEn ? 'RM6.00 Discount Applied' : 'Diskaun RM6.00 Diaktifkan') : activeDeliveryDiscount > 0 ? (isEn ? `RM${activeDeliveryDiscount.toFixed(2)} Off Active` : `Diskaun RM${activeDeliveryDiscount.toFixed(2)} Aktif`) : (isEn ? 'From RM 6.00' : 'Dari RM 6.00')}
                </span>
              </div>

              <div className="flex justify-between text-stone-900 dark:text-white text-sm font-black pt-1.5 border-t border-stone-200 dark:border-stone-800">
                <span>{t('totalPayableLabel')}:</span>
                <span className="text-lg text-emerald-700 dark:text-emerald-400 font-['Outfit']">
                  RM {(estimatedTotal || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onProceedCheckout}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 cursor-pointer"
              >
                <span>{t('proceedToCheckoutBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
