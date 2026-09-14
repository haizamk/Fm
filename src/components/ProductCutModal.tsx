import React, { useState, useEffect } from 'react';
import {
  Product,
  ChickenCutId,
  CleaningOptionId,
  PackagingOptionId,
  ProductWeightOption,
} from '../types';
import {
  CHICKEN_CUT_OPTIONS,
  CLEANING_OPTIONS,
  PACKAGING_OPTIONS,
} from '../data/products';
import {
  Scissors,
  Sparkles,
  Package,
  Check,
  X,
  Plus,
  Minus,
  ShoppingBag,
  ShieldCheck,
  Scale,
  Flame,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { ProductImage } from './ProductImage';
import { useLanguage } from '../context/LanguageContext';
import { dataStorageService } from '../services/dataStorage';

interface ProductCutModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    selectedCut: ChickenCutId,
    selectedCleaning: CleaningOptionId[],
    packaging: PackagingOptionId,
    specialNotes: string,
    totalItemPrice: number,
    bakarOption?: 'bakar' | 'tak-bakar',
    organVariation?: string,
    organVariationLabel?: string,
    selectedWeightOption?: ProductWeightOption
  ) => void;
}

export const ProductCutModal: React.FC<ProductCutModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const { t, isEn, tProduct, tCut, tCleaning, tPackaging } = useLanguage();

  const siteSettings = dataStorageService.getSiteSettings();
  const showCoolerBox = siteSettings.enableCoolerBoxOption ?? false;
  const activePackagingOptions = PACKAGING_OPTIONS.filter((pack) => {
    if (pack.id === 'cooler-box' && !showCoolerBox) {
      return false;
    }
    return true;
  });

  // Cut options list (Standard or custom product-specific cuts)
  const availableCutOptions = product?.customCutOptions && product.customCutOptions.length > 0
    ? product.customCutOptions
    : CHICKEN_CUT_OPTIONS;

  // Weight variations handling
  const defaultWeightOpt = product?.hasWeightOptions && product.weightOptions && product.weightOptions.length > 0
    ? product.weightOptions.find(o => o.isAvailable && o.availableStock > 0) || product.weightOptions[0]
    : null;
  const [selectedWeightOptId, setSelectedWeightOptId] = useState<string>(defaultWeightOpt?.id || '');

  // Organ variations handling - requires explicit selection by customer
  const [selectedOrganVarId, setSelectedOrganVarId] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  // Bakar option handling for Ayam Tua / Pencen
  const [bakarOption, setBakarOption] = useState<'tak-bakar' | 'bakar'>(product?.bakarDefault || 'tak-bakar');

  // Cut selection
  const [selectedCut, setSelectedCut] = useState<ChickenCutId>(
    product?.defaultCut || (availableCutOptions.length > 0 ? availableCutOptions[0].id : 'seekor-bulat')
  );
  const [selectedCleaning, setSelectedCleaning] = useState<CleaningOptionId[]>([]);
  const [packaging, setPackaging] = useState<PackagingOptionId>('bungkusan-biasa-ais');
  const [specialNotes, setSpecialNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Sync state when product changes
  useEffect(() => {
    if (product) {
      const cuts = product.customCutOptions && product.customCutOptions.length > 0
        ? product.customCutOptions
        : CHICKEN_CUT_OPTIONS;
      setSelectedCut(product.defaultCut || (cuts.length > 0 ? cuts[0].id : 'seekor-bulat'));
      setSelectedCleaning([]);
      setPackaging('bungkusan-biasa-ais');
      setSpecialNotes('');
      setQuantity(1);
      setValidationError('');
      setBakarOption(product.bakarDefault || 'tak-bakar');
      if (product.weightOptions && product.weightOptions.length > 0) {
        const firstOpt = product.weightOptions.find(o => o.isAvailable && o.availableStock > 0) || product.weightOptions[0];
        setSelectedWeightOptId(firstOpt?.id || '');
      }
      if (product.organVariations && product.organVariations.length > 0) {
        setSelectedOrganVarId('');
      }
    }
  }, [product?.id, isOpen]);

  if (!isOpen || !product) return null;

  const transProd = tProduct(product);

  // Calculate active selections and price
  const activeWeightOpt = product.weightOptions?.find(o => o.id === selectedWeightOptId) || defaultWeightOpt;
  const activeOrganVar = product.organVariations?.find((v) => v.id === selectedOrganVarId) || null;

  let baseUnitPrice = product.price;
  if (product.hasWeightOptions && activeWeightOpt) {
    baseUnitPrice = activeWeightOpt.price;
  } else if (product.hasOrganVariations && activeOrganVar) {
    baseUnitPrice = activeOrganVar.price;
  }

  const toggleCleaning = (id: CleaningOptionId) => {
    if (selectedCleaning.includes(id)) {
      setSelectedCleaning(selectedCleaning.filter((item) => item !== id));
    } else {
      setSelectedCleaning([...selectedCleaning, id]);
    }
  };

  // Cleaning fee (e.g. +RM1.00 for buang-lemak-kulit)
  const cleaningExtraFee = selectedCleaning.reduce((sum, cleanId) => {
    const opt = CLEANING_OPTIONS.find((c) => c.id === cleanId);
    return sum + (opt?.price || 0);
  }, 0);

  const packagingCost = 0; // Handled at checkout / order level
  const unitPriceTotal = baseUnitPrice + cleaningExtraFee + packagingCost;
  const totalItemPrice = unitPriceTotal * quantity;

  const handleConfirm = () => {
    if (quantity > 30) {
      setValidationError(isEn ? 'Maximum order is 30 units per delivery trip.' : 'Maksimum pesanan adalah 30 unit bagi satu trip penghantaran.');
      return;
    }
    if (product.hasOrganVariations && !selectedOrganVarId) {
      setValidationError(isEn ? 'Please choose an organ variation (Liver Only, Gizzard Only, or Mixed) before proceeding.' : 'Sila pilih jenis produk (Hati Sahaja, Pedal Sahaja, atau Campur Hati & Pedal) terlebih dahulu.');
      return;
    }

    onAddToCart(
      product,
      quantity,
      product.supportsCutting ? selectedCut : 'seekor-bulat',
      selectedCleaning,
      packaging,
      specialNotes,
      totalItemPrice,
      product.hasBakarOption ? bakarOption : undefined,
      activeOrganVar ? activeOrganVar.id : undefined,
      activeOrganVar ? activeOrganVar.label : undefined,
      product.hasWeightOptions && activeWeightOpt ? activeWeightOpt : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-6 flex flex-col max-h-[90vh]"
        role="dialog"
      >
        
        {/* Header with ProductImage */}
        <div className="bg-stone-900 dark:bg-stone-950 text-white p-4 sm:p-5 relative shrink-0 border-b border-stone-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors cursor-pointer"
            aria-label={t('cancel')}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 pr-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-stone-700 shrink-0">
              <ProductImage product={product} alt={transProd.name} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {transProd.freshnessType || product.freshnessType}
                </span>
                <span className="text-xs text-stone-300 font-medium flex items-center gap-1">
                  <Scale className="w-3 h-3 text-emerald-400" />
                  {activeWeightOpt ? activeWeightOpt.weightLabel : product.weightEstimate}
                </span>
                {product.originalPrice && product.originalPrice > baseUnitPrice && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    {t('savingBadge')} RM {(product.originalPrice - baseUnitPrice).toFixed(2)}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold leading-snug">
                {transProd.name}
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {activeWeightOpt
                  ? (isEn ? `Weight: ${activeWeightOpt.weightLabel} (RM ${activeWeightOpt.price.toFixed(2)}) • Available: ${activeWeightOpt.availableStock} units` : `Pilihan Berat: ${activeWeightOpt.weightLabel} (RM ${activeWeightOpt.price.toFixed(2)}) • Sedia ada: ${activeWeightOpt.availableStock} unit`)
                  : activeOrganVar 
                  ? `${isEn ? 'Option' : 'Variasi'}: ${activeOrganVar.label} • RM ${activeOrganVar.price.toFixed(2)} / ${activeOrganVar.unit}`
                  : transProd.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Configuration Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-stone-800 dark:text-stone-200">
          
          {/* STEP 1: PILIHAN BERAT AYAM & KUANTITI AVAILABLE */}
          {product.hasWeightOptions && product.weightOptions && product.weightOptions.length > 0 && (
            <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800/80 p-4 sm:p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-extrabold text-stone-900 dark:text-white uppercase tracking-wide">
                  <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>1. {t('chooseWeightStep')}</span>
                </label>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full">
                  {t('requiredChoice')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {product.weightOptions.map((opt) => {
                  const isSelected = selectedWeightOptId === opt.id;
                  const isOptAvailable = opt.isAvailable && opt.availableStock > 0;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        if (isOptAvailable) setSelectedWeightOptId(opt.id);
                      }}
                      className={`p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between relative ${
                        !isOptAvailable
                          ? 'opacity-60 bg-stone-100 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 cursor-not-allowed'
                          : isSelected
                          ? 'border-emerald-600 bg-white dark:bg-stone-800 shadow-md ring-2 ring-emerald-500/20 cursor-pointer'
                          : 'border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-800/50 hover:border-emerald-400 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <div>
                          <span className="font-extrabold text-sm text-stone-900 dark:text-white block">
                            {opt.weightLabel}
                          </span>
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            RM {opt.price.toFixed(2)}
                          </span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-stone-300 dark:border-stone-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Available Stock Badge */}
                      <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-700/60 flex items-center justify-between text-[11px]">
                        <span className="text-stone-500 dark:text-stone-400 font-medium">{isEn ? 'Stock:' : 'Baki Stok:'}</span>
                        <span className={`font-black px-2 py-0.5 rounded-md ${
                          isOptAvailable
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                        }`}>
                          {isOptAvailable ? `${opt.availableStock} ${isEn ? 'birds' : 'ekor'}` : (isEn ? 'Out' : 'Habis')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VARIASI ORGAN KHAS (UNTUK HATI / PEDAL AYAM) */}
          {product.hasOrganVariations && product.organVariations && (
            <div className={`p-4 rounded-2xl border-2 transition-all ${
              validationError && !selectedOrganVarId
                ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-400 dark:border-rose-700 ring-2 ring-rose-400/30'
                : 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-extrabold text-stone-900 dark:text-white uppercase tracking-wide">
                  <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isEn ? 'Select Liver / Gizzard Option (Required)' : 'Pilih Variasi Hati / Pedal (Wajib Pilih)'}</span>
                </label>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  !selectedOrganVarId
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-extrabold'
                    : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                }`}>
                  {selectedOrganVarId ? (isEn ? 'Selected' : 'Telah Dipilih') : t('requiredChoice')}
                </span>
              </div>

              {validationError && !selectedOrganVarId && (
                <div className="mb-3 p-3 rounded-xl bg-rose-100 dark:bg-rose-900/60 border border-rose-300 dark:border-rose-700 text-xs font-bold text-rose-800 dark:text-rose-200 flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {product.organVariations.map((v) => {
                  const isSelected = selectedOrganVarId === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => {
                        setSelectedOrganVarId(v.id);
                        setValidationError('');
                      }}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-white dark:bg-stone-800 shadow-md ring-2 ring-emerald-500/20'
                          : 'border-stone-200 dark:border-stone-700 bg-white/60 dark:bg-stone-800/40 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">
                          {isEn ? (v.id.includes('hati') && v.id.includes('pedal') ? 'Mixed Liver & Gizzard' : v.id.includes('hati') ? 'Liver Only' : 'Gizzard Only') : v.label}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-stone-300 dark:border-stone-600'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <div className="text-base font-black text-emerald-700 dark:text-emerald-400">
                        RM {v.price.toFixed(2)}{' '}
                        <span className="text-xs font-normal text-stone-500 dark:text-stone-400">/ {v.unit === 'pek' && isEn ? 'pack' : v.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PILIHAN BAKAR / TAK BAKAR (UNTUK AYAM TUA / PENCEN SEGAR) */}
          {product.hasBakarOption && (
            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-extrabold text-stone-900 dark:text-white uppercase tracking-wide">
                  <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>{isEn ? 'Feather Singeing Choice' : 'Pilihan Ayam Bakar'}</span>
                </label>
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                  {t('freeCutOption')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Opsyen Tak Bakar */}
                <div
                  onClick={() => setBakarOption('tak-bakar')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    bakarOption === 'tak-bakar'
                      ? 'border-amber-600 bg-white dark:bg-stone-800 shadow-sm'
                      : 'border-stone-200 dark:border-stone-700 bg-white/60 dark:bg-stone-800/40 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-stone-900 dark:text-white text-sm">
                      {isEn ? 'Standard (No Feather Singeing)' : 'Tak Bakar (Standard)'}
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        bakarOption === 'tak-bakar'
                          ? 'border-amber-600 bg-amber-600 text-white'
                          : 'border-stone-300 dark:border-stone-600'
                      }`}
                    >
                      {bakarOption === 'tak-bakar' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                    {isEn ? 'Feathers removed cleanly through standard hot-water machine without torch singeing.' : 'Bulu dibuang bersih secara standard mesin rendaman air panas tanpa pembakaran.'}
                  </p>
                </div>

                {/* Opsyen Bakar */}
                <div
                  onClick={() => setBakarOption('bakar')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    bakarOption === 'bakar'
                      ? 'border-amber-600 bg-white dark:bg-stone-800 shadow-sm'
                      : 'border-stone-200 dark:border-stone-700 bg-white/60 dark:bg-stone-800/40 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-900 dark:text-amber-300 text-sm flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      {isEn ? '🔥 Flame Torch Singed' : '🔥 Bakar Bulu Halus'}
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        bakarOption === 'bakar'
                          ? 'border-amber-600 bg-amber-600 text-white'
                          : 'border-stone-300 dark:border-stone-600'
                      }`}
                    >
                      {bakarOption === 'bakar' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                    {isEn ? 'Traditional open-flame torching to remove fine fuzz feathers and lock in aroma for rendang & stews.' : 'Dibakar tradisional dengan api bagi menanggalkan bulu halus & menambah aroma sedap rendang.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* JENIS POTONGAN (CHICKEN CUTS) */}
          {product.supportsCutting && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-extrabold text-stone-900 dark:text-white uppercase tracking-wide">
                  <Scissors className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>2. {t('chooseCutStep')}</span>
                </label>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {t('freeCutOption')}
                </span>
              </div>

              <div className="space-y-2.5">
                {availableCutOptions.map((cut) => {
                  const isSelected = selectedCut === cut.id;
                  const cutTrans = tCut(cut.id, cut.label, cut.description, cut.recommendedFor);

                  return (
                    <div
                      key={cut.id}
                      onClick={() => setSelectedCut(cut.id)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-xs'
                          : 'border-stone-200 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-stone-300 dark:border-stone-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 dark:text-white text-sm">
                              {cutTrans.label}
                            </span>
                            {cut.popular && (
                              <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                                {isEn ? 'Popular' : 'Popular'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                            {cutTrans.description}
                          </p>
                        </div>
                      </div>

                      {cutTrans.recommendedFor && (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                          {cutTrans.recommendedFor}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SERVIS PEMBERSIHAN KHAS */}
          {product.supportsCleaning !== false && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-extrabold text-stone-900 dark:text-white uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>3. {t('cleaningServicesStep')}</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CLEANING_OPTIONS.map((clean) => {
                  const isSelected = selectedCleaning.includes(clean.id);
                  const cleanTrans = tCleaning(clean.id, clean.label);

                  return (
                    <div
                      key={clean.id}
                      onClick={() => toggleCleaning(clean.id)}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'border-stone-200 dark:border-stone-800 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-stone-300 dark:border-stone-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-medium text-stone-800 dark:text-stone-200">
                          {cleanTrans.label}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {clean.price === 0 ? (isEn ? 'Free' : 'Percuma') : `+RM ${(clean.price || 0).toFixed(2)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* JENIS PEMBUNGKUSAN */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-sm font-extrabold text-stone-900 dark:text-white uppercase tracking-wide">
                <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>4. {t('packagingStep')}</span>
              </label>
            </div>

            <div className={`grid grid-cols-1 ${activePackagingOptions.length > 1 ? 'sm:grid-cols-2' : ''} gap-2.5`}>
              {activePackagingOptions.map((pack) => {
                const isSelected = packaging === pack.id;
                const packTrans = tPackaging(pack.id, pack.label, pack.description);

                return (
                  <div
                    key={pack.id}
                    onClick={() => setPackaging(pack.id)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-xs'
                        : 'border-stone-200 dark:border-stone-800 hover:border-emerald-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">
                          {packTrans.label}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-stone-300 dark:border-stone-600'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        {packTrans.description}
                      </p>
                    </div>
                    <div className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {pack.price === 0 ? (isEn ? 'Free' : 'Percuma') : `+RM ${pack.price.toFixed(2)}`}
                    </div>
                  </div>
                );
              })}
            </div>

            {packaging === 'vacuum-pack' && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 animate-fade-in">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="font-bold">{isEn ? 'Vacuum Pack Benefit:' : 'Kelebihan Pek Kedap Udara:'}</strong> {isEn ? 'Prevents freezer burn and locks in chicken juices up to 3x longer in the freezer.' : 'Menghalang pembentukan fros ais (freezer burn), mengunci kesegaran jus ayam sehingga 3x lebih lama di dalam peti sejuk beku.'}
                </p>
              </div>
            )}

            {packaging === 'cooler-box' && (
              <div className="mt-3 p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200 animate-fade-in">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed space-y-0.5">
                  <p><strong className="font-bold">{isEn ? 'Cooler Box Protection:' : 'Perlindungan Kotak Penebat Cooler Box:'}</strong> {isEn ? 'Fresh poultry packed inside ice-insulated heavy duty container maintaining 0°C chill.' : 'Ayam segar dimuatkan ke dalam kotak bertebat ais bertutup khas bagi mengekalkan suhu beku 0°C sepanjang perjalanan.'}</p>
                  <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">{isEn ? '★ Fee Rate: +RM5.00 (<10 units) | +RM10.00 (10 - 30 units) per delivery.' : '★ Kadar Caj: +RM5.00 (kurang 10 unit) | +RM10.00 (10 - 30 unit) setiap penghantaran.'}</p>
                </div>
              </div>
            )}
          </div>

          {/* NOTA KHAS TUKANG POTONG */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
              {t('customNotesLabel')}:
            </label>
            <input
              type="text"
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder={t('customNotesPlaceholder')}
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:bg-white dark:focus:bg-stone-800 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

        </div>

        {/* Footer with quantity & Add to cart button */}
        <div className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Quantity Stepper */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase">{t('quantityLabel')}:</span>
              <div className="flex items-center border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 rounded-xl overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 active:bg-stone-200 transition-colors cursor-pointer"
                  aria-label="Kurangkan kuantiti"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-1 text-sm font-extrabold text-stone-900 dark:text-white min-w-10 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (quantity < 30) {
                      setQuantity(quantity + 1);
                    }
                  }}
                  disabled={quantity >= 30}
                  className={`p-2 transition-colors cursor-pointer ${
                    quantity >= 30 
                      ? 'text-stone-300 dark:text-stone-600 cursor-not-allowed bg-stone-100 dark:bg-stone-800' 
                      : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 active:bg-stone-200'
                  }`}
                  aria-label="Tambah kuantiti"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            {quantity >= 30 && (
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                ({isEn ? 'Max limit 30 units' : 'Maksimum had 30 unit'})
              </span>
            )}
          </div>

          {/* Subtotal and Action */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block">{t('totalPriceLabel')}</span>
              <span className="text-xl font-black text-stone-900 dark:text-white">
                RM {totalItemPrice.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all flex items-center gap-2 shadow-md shadow-emerald-700/20 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('addToCart')}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
