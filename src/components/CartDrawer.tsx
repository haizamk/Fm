import React, { useState } from 'react';
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
  Scale
} from 'lucide-react';
import { ProductImage } from './ProductImage';

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
  freeDeliveryThreshold = 150,
  appliedCoupon,
  couponDiscount = 0,
  appliedItemCoupon,
  appliedDeliveryCoupon,
  itemCouponDiscount = 0,
  deliveryCouponDiscount = 0,
  onApplyCoupon,
  onRemoveCoupon,
}) => {
  const [inputCouponCode, setInputCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const promoDeliveryMin = 150;
  const totalUnits = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const subtotal = items.reduce((sum, item) => sum + (item.itemTotalPrice || 0), 0);
  const remainingForPromo = Math.max(0, promoDeliveryMin - subtotal);
  const promoProgress = Math.min(100, (subtotal / promoDeliveryMin) * 100);
  const isOverMaxLimit = totalUnits > 30;

  // Active coupons
  const activeItemCoupon = appliedItemCoupon || (appliedCoupon?.discountType !== 'delivery' && appliedCoupon?.category !== 'delivery' ? appliedCoupon : null);
  const activeDeliveryCoupon = appliedDeliveryCoupon || (appliedCoupon?.discountType === 'delivery' || appliedCoupon?.category === 'delivery' ? appliedCoupon : null);
  const activeItemDiscount = itemCouponDiscount || (activeItemCoupon ? couponDiscount : 0);
  const activeDeliveryDiscount = deliveryCouponDiscount || (activeDeliveryCoupon ? couponDiscount : 0);

  // Auto delivery discount for orders >= RM150
  const isAutoDeliveryEligible = subtotal >= promoDeliveryMin;
  const autoDeliveryDiscount = isAutoDeliveryEligible ? 6.00 : 0;

  const totalDiscount = activeItemDiscount;
  const estimatedTotal = Math.max(0, subtotal - totalDiscount);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCouponCode.trim()) {
      setCouponFeedback({ type: 'error', text: 'Sila masukkan kod kupon.' });
      return;
    }

    try {
      const res = onApplyCoupon(inputCouponCode.trim());
      if (res && res.success) {
        setCouponFeedback({ type: 'success', text: res.message || 'Kod kupon berjaya digunakan.' });
        setInputCouponCode('');
      } else {
        setCouponFeedback({ type: 'error', text: (res && res.message) ? res.message : 'Kod kupon tidak sah.' });
      }
    } catch {
      setCouponFeedback({ type: 'error', text: 'Gagal mengesahkan kupon.' });
    }
  };

  const handleRemove = (type: 'item' | 'delivery' | 'all') => {
    onRemoveCoupon(type);
    setCouponFeedback(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-50 text-stone-900 border-l border-stone-200"
        role="dialog"
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-stone-900 text-base">
                Troli Pesanan Anda
              </h2>
              <span className="text-xs text-stone-500">
                {items.length} jenis item dipilih
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
            aria-label="Tutup Troli"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping / Delivery Discount Progress Indicator */}
        <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 shrink-0">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold flex items-center gap-1 text-emerald-900">
              <Truck className="w-3.5 h-3.5 text-emerald-700" />
              {remainingForPromo > 0
                ? `Tambah RM ${remainingForPromo.toFixed(2)} lagi untuk Diskaun Penghantaran RM6.00!`
                : '🎉 Tahniah! Anda Layak Diskaun Penghantaran RM6.00!'}
            </span>
            <span className="font-extrabold text-emerald-700">
              {Math.round(promoProgress)}%
            </span>
          </div>
          <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${promoProgress}%` }}
            />
          </div>
        </div>

        {/* 30 Unit Maximum Limit Notice */}
        {totalUnits >= 30 && (
          <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs shrink-0 flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-amber-950">
                Had Maksimum 30 Unit Dicapai ({totalUnits}/30 Unit)
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Maksimum 30 unit bagi setiap penghantaran untuk menjamin kualiti rantaian sejuk dingin dan muatan penghantaran. Jika anda ingin menempah lebih dari 30 unit (cth: katering / kenduri), sila selesaikan pesanan ini dahulu dan buat pesanan tambahan kedua, atau klik untuk WhatsApp kami.
              </p>
              <a
                href={`https://wa.me/601128568920?text=${encodeURIComponent(`Salam Khairul Fresh Food, saya ingin membuat tempahan pukal / katering melebihi 30 unit.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-[11px] text-emerald-700 hover:text-emerald-800 underline mt-0.5"
              >
                <span>WhatsApp Tempahan Pukal Kenduri</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-stone-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-300 mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-stone-700 text-base">Troli Anda Kosong</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                Pilih ayam segar kegemaran anda terus dari ladang dengan pilihan potongan percuma!
              </p>
              <button
                onClick={onClose}
                className="mt-4 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Mula Membeli
              </button>
            </div>
          ) : (
            items.map((item) => {
              const cutObj = CHICKEN_CUT_OPTIONS.find((c) => c.id === item.selectedCut);
              const packagingObj = PACKAGING_OPTIONS.find((p) => p.id === item.packaging);

              return (
                <div key={item.cartItemId} className="py-3.5 first:pt-0 last:pb-0 flex gap-3">
                  <div className="w-18 h-18 rounded-xl overflow-hidden border border-stone-200 shrink-0">
                    <ProductImage product={item.product} alt={item.product.name} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-stone-900 dark:text-white text-sm truncate">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.cartItemId)}
                        className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        title="Padam item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Weight option, cut, cleaning, and packaging tags */}
                    <div className="mt-1 space-y-0.5 text-xs text-stone-600 dark:text-stone-300">
                      {item.selectedWeightOption && (
                        <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-extrabold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-200/60 w-fit">
                          <Scale className="w-3 h-3 text-emerald-600" />
                          <span>Berat: {item.selectedWeightOption.weightLabel} (RM {item.selectedWeightOption.price.toFixed(2)})</span>
                        </div>
                      )}

                      {item.organVariationLabel && (
                        <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1">
                          <span>Variasi: {item.organVariationLabel}</span>
                        </div>
                      )}

                      {item.bakarOption && (
                        <div className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1">
                          <span>{item.bakarOption === 'bakar' ? '🔥 Bakar Bulu Halus' : 'Tak Bakar (Standard)'}</span>
                        </div>
                      )}

                      {item.product.supportsCutting && (
                        <div className="flex items-center gap-1 text-emerald-800 dark:text-emerald-300 font-medium">
                          <Scissors className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate">{getCutLabel(item.selectedCut, item.product)}</span>
                        </div>
                      )}

                      {item.selectedCleaning && item.selectedCleaning.length > 0 && (
                        <div className="text-[11px] text-stone-600 dark:text-stone-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">
                            Cuci: {item.selectedCleaning.map(cid => {
                              const c = CLEANING_OPTIONS.find(opt => opt.id === cid);
                              return c?.label.replace(' (+RM1.00 / ekor)', '') || cid;
                            }).join(', ')}
                          </span>
                        </div>
                      )}
                      
                      {packagingObj && (
                        <div className={`text-[11px] font-medium flex items-center gap-1 ${packagingObj.id === 'cooler-box' ? 'text-blue-700 dark:text-blue-300 font-bold' : 'text-stone-500 dark:text-stone-400'}`}>
                          <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{packagingObj.label}</span>
                        </div>
                      )}

                      {item.specialNotes && (
                        <p className="text-[11px] text-stone-500 italic truncate">
                          Nota: "{item.specialNotes}"
                        </p>
                      )}
                    </div>

                    {/* Stepper and price */}
                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center border border-stone-200 bg-stone-50 rounded-lg">
                        <button
                          onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                          className="p-1 hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
                          aria-label="Kurangkan"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-bold text-stone-900 min-w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            if (totalUnits < 30) {
                              onUpdateQuantity(item.cartItemId, item.quantity + 1);
                            }
                          }}
                          disabled={totalUnits >= 30}
                          className={`p-1 transition-colors cursor-pointer ${
                            totalUnits >= 30
                              ? 'text-stone-300 cursor-not-allowed bg-stone-100'
                              : 'hover:bg-stone-200 text-stone-600'
                          }`}
                          aria-label="Tambah"
                          title={totalUnits >= 30 ? 'Maksimum 30 unit setiap pesanan' : 'Tambah kuantiti'}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-extrabold text-sm text-stone-900">
                        RM {item.itemTotalPrice.toFixed(2)}
                      </span>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-3 shrink-0">
            
            {/* Coupon Code Section */}
            <div className="p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kod Kupon & Baucar Diskaun</span>
                </span>
                {(activeItemCoupon || activeDeliveryCoupon) && (
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {activeItemCoupon && activeDeliveryCoupon ? '2 Kupon Aktif' : '1 Kupon Aktif'}
                  </span>
                )}
              </div>

              {/* Active Item Coupon Badge */}
              {activeItemCoupon && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-mono">{activeItemCoupon.code}</span>
                      <span className="text-emerald-700">
                        ({activeItemCoupon.discountType === 'percentage' ? `Diskaun ${activeItemCoupon.discountValue}%` : `-RM ${activeItemDiscount.toFixed(2)}`})
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700 truncate mt-0.5">
                      {activeItemCoupon.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove('item')}
                    className="p-1 rounded-lg text-emerald-700 hover:text-rose-600 hover:bg-emerald-100 transition-colors shrink-0 cursor-pointer"
                    title="Buang Kupon Diskaun Item"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Active Delivery Coupon Badge */}
              {activeDeliveryCoupon && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 font-bold text-blue-900">
                      <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-mono">{activeDeliveryCoupon.code}</span>
                      <span className="text-blue-700">(-RM {activeDeliveryDiscount.toFixed(2)} Penghantaran)</span>
                    </div>
                    <p className="text-[11px] text-blue-700 truncate mt-0.5">
                      {activeDeliveryCoupon.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove('delivery')}
                    className="p-1 rounded-lg text-blue-700 hover:text-rose-600 hover:bg-blue-100 transition-colors shrink-0 cursor-pointer"
                    title="Buang Kupon Penghantaran"
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
                        ? 'Kod kupon (cth: GANJARAN1, DISKAUN5, FREEDEL6)'
                        : !activeItemCoupon
                          ? 'Masukkan kod kupon produk (cth: DISKAUN5)'
                          : !activeDeliveryCoupon
                            ? 'Masukkan kod diskaun penghantaran'
                            : 'Gantikan kupon sedia ada'
                    }
                    className="flex-1 uppercase font-mono text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-hidden transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-stone-900 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    Tebus
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
              <div className="flex justify-between text-stone-600">
                <span>Jumlah Kasar (Subtotal):</span>
                <span className="font-bold text-stone-900">RM {(subtotal || 0).toFixed(2)}</span>
              </div>

              {activeItemDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50/80 p-1.5 rounded-lg border border-emerald-200/60 text-xs">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-emerald-600" />
                    <span>Diskaun Kupon ({activeItemCoupon?.code || 'Diskaun'}):</span>
                  </span>
                  <span>- RM {activeItemDiscount.toFixed(2)}</span>
                </div>
              )}

              {isAutoDeliveryEligible ? (
                <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50/80 p-1.5 rounded-lg border border-emerald-200/60 text-xs">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Auto Diskaun Penghantaran (Belian RM150+):</span>
                  </span>
                  <span>- RM 6.00</span>
                </div>
              ) : activeDeliveryDiscount > 0 ? (
                <div className="flex justify-between text-blue-700 font-bold bg-blue-50/80 p-1.5 rounded-lg border border-blue-200/60 text-xs">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Diskaun Kod Penghantaran ({activeDeliveryCoupon?.code}):</span>
                  </span>
                  <span>- RM {activeDeliveryDiscount.toFixed(2)}</span>
                </div>
              ) : null}

              <div className="flex justify-between text-stone-600 text-xs">
                <span>Penghantaran Sejuk Dingin:</span>
                <span className="font-bold text-emerald-700">
                  {isAutoDeliveryEligible ? 'Diskaun RM6.00 Diaktifkan' : activeDeliveryDiscount > 0 ? `Diskaun RM${activeDeliveryDiscount.toFixed(2)} Aktif` : 'Dari RM 6.00'}
                </span>
              </div>

              <div className="flex justify-between text-stone-900 text-sm font-black pt-1.5 border-t border-stone-200">
                <span>Anggaran Jumlah:</span>
                <span className="text-lg text-emerald-800 font-['Outfit']">
                  RM {(estimatedTotal || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onProceedCheckout}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 cursor-pointer"
              >
                <span>Teruskan ke Pembayaran</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
