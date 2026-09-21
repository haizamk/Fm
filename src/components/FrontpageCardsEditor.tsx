import React, { useState, useRef } from 'react';
import { 
  Upload, 
  ImageIcon, 
  CheckCircle2, 
  RotateCcw, 
  ExternalLink, 
  Sparkles,
  Link as LinkIcon,
  X,
  AlertCircle
} from 'lucide-react';
import { Product } from '../types';
import { dataStorageService } from '../services/dataStorage';
import { compressImageFile } from '../utils/imageCompressor';

interface FrontpageCardsEditorProps {
  products: Product[];
  onProductsUpdated: (products: Product[]) => void;
  onShowNotification?: (type: 'success' | 'error' | 'info', message: string) => void;
  adminName?: string;
}

interface FrontpageCardConfig {
  productId: string;
  defaultName: string;
  defaultSubtitle: string;
  defaultPrice: string;
  fallbackImage: string;
}

export const FRONTPAGE_6_CONFIG: FrontpageCardConfig[] = [
  {
    productId: 'ayam-segar-standard',
    defaultName: 'Ayam Daging',
    defaultSubtitle: 'Segar setiap hari',
    defaultPrice: 'RM 19.50 / ekor',
    fallbackImage: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=600',
  },
  {
    productId: 'ayam-kampung-organik',
    defaultName: 'Ayam Kampung',
    defaultSubtitle: 'Organik bebas hormon',
    defaultPrice: 'RM 38.00 / ekor',
    fallbackImage: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&q=80&w=600',
  },
  {
    productId: 'whole-leg-segar',
    defaultName: 'Whole Leg',
    defaultSubtitle: 'Peha & drumstick bersambung',
    defaultPrice: 'RM 18.50 / kg',
    fallbackImage: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=80&w=600',
  },
  {
    productId: 'kepak-ayam-segar',
    defaultName: 'Kepak Ayam',
    defaultSubtitle: 'Wingette & drumette segar',
    defaultPrice: 'RM 19.50 / kg',
    fallbackImage: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&q=80&w=600',
  },
  {
    productId: 'dada-ayam-segar',
    defaultName: 'Isi Ayam',
    defaultSubtitle: 'Dada fillet tanpa tulang',
    defaultPrice: 'RM 20.00 / kg',
    fallbackImage: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=600',
  },
  {
    productId: 'ayam-tua-pencen-segar',
    defaultName: 'Ayam Tua',
    defaultSubtitle: 'Isi padu sedap rendang & sup',
    defaultPrice: 'RM 14.00 / ekor',
    fallbackImage: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&q=80&w=600',
  },
];

export const FrontpageCardsEditor: React.FC<FrontpageCardsEditorProps> = ({
  products,
  onProductsUpdated,
  onShowNotification,
  adminName = 'Admin',
}) => {
  const [editingUrlProductId, setEditingUrlProductId] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleFileUpload = async (productId: string, file: File) => {
    try {
      setIsProcessing(productId);
      const cardConfig = FRONTPAGE_6_CONFIG.find((c) => c.productId === productId);
      const productName = cardConfig?.defaultName || productId;

      // Compress image for fast loading & compact storage
      const compressed = await compressImageFile(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.85,
      });

      const updated = products.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            image: compressed.dataUrl,
          };
        }
        return p;
      });

      dataStorageService.saveProducts(updated, adminName, `Muat naik gambar baharu untuk ${productName} (Frontpage)`);
      onProductsUpdated(updated);

      if (onShowNotification) {
        onShowNotification('success', `Gambar baru untuk "${productName}" berjaya dimuat naik dan dikemaskini di Frontpage!`);
      }
    } catch (err) {
      console.error('Failed to process uploaded image:', err);
      if (onShowNotification) {
        onShowNotification('error', 'Ralat semasa memproses fail gambar. Sila cuba fail lain.');
      }
    } finally {
      setIsProcessing(null);
    }
  };

  const handleSaveUrl = (productId: string) => {
    if (!urlInput.trim()) {
      setEditingUrlProductId(null);
      return;
    }

    const cardConfig = FRONTPAGE_6_CONFIG.find((c) => c.productId === productId);
    const productName = cardConfig?.defaultName || productId;

    const updated = products.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          image: urlInput.trim(),
        };
      }
      return p;
    });

    dataStorageService.saveProducts(updated, adminName, `Kemaskini pautan gambar ${productName} (Frontpage)`);
    onProductsUpdated(updated);
    setEditingUrlProductId(null);
    setUrlInput('');

    if (onShowNotification) {
      onShowNotification('success', `Pautan gambar "${productName}" berjaya dikemaskini!`);
    }
  };

  const handleResetToDefault = (productId: string) => {
    const cardConfig = FRONTPAGE_6_CONFIG.find((c) => c.productId === productId);
    const productName = cardConfig?.defaultName || productId;
    const fallback = cardConfig?.fallbackImage || '';

    const updated = products.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          image: fallback,
        };
      }
      return p;
    });

    dataStorageService.saveProducts(updated, adminName, `Reset gambar asal untuk ${productName} (Frontpage)`);
    onProductsUpdated(updated);

    if (onShowNotification) {
      onShowNotification('info', `Gambar "${productName}" telah dikembalikan ke gambar asal.`);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-800 rounded-3xl p-5 sm:p-6 border-2 border-emerald-500/30 shadow-md space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-stone-200 dark:border-stone-700">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider mb-1 border border-emerald-300 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Khas Frontpage (Halaman Utama)</span>
          </div>
          <h3 className="text-lg font-black text-stone-900 dark:text-white font-['Outfit']">
            Pengurusan 6 Gambar Kad Produk Frontpage
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Muat naik foto produk segar anda sendiri dari telefon/komputer atau tukar pautan URL. Sebarang perubahan akan terus terpapar di frontpage pelanggan.
          </p>
        </div>
      </div>

      {/* 6 Cards Grid in Admin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {FRONTPAGE_6_CONFIG.map((card, idx) => {
          const product = products.find((p) => p.id === card.productId);
          const currentImage = (product?.image && product.image.trim()) 
            ? product.image 
            : card.fallbackImage;
          const hasCustomImage = product?.image && product.image.trim() && product.image !== card.fallbackImage;
          const isBusy = isProcessing === card.productId;

          return (
            <div
              key={card.productId}
              className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-700/80 flex flex-col justify-between space-y-3 relative group"
            >
              {/* Card Index & Title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-black text-stone-900 dark:text-white leading-tight">
                      {card.defaultName}
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {card.defaultPrice}
                    </p>
                  </div>
                </div>

                {hasCustomImage ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Foto Kustom</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                    <span>Foto Asal</span>
                  </span>
                )}
              </div>

              {/* Image Preview */}
              <div className="aspect-square rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-700 relative border border-stone-300 dark:border-stone-600">
                <img
                  src={currentImage}
                  alt={card.defaultName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = card.fallbackImage;
                  }}
                />

                {isBusy && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white font-bold text-xs">
                    <span>Memproses fail...</span>
                  </div>
                )}
              </div>

              {/* URL Input if Active */}
              {editingUrlProductId === card.productId ? (
                <div className="space-y-2 p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-emerald-500">
                  <label className="block text-[10px] font-bold text-stone-600 dark:text-stone-300">
                    Tampal URL Gambar:
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://images.example.com/..."
                    className="w-full text-xs p-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-white"
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingUrlProductId(null)}
                      className="px-2.5 py-1 text-[11px] font-bold text-stone-500 hover:text-stone-700 dark:text-stone-400"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveUrl(card.productId)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      Simpan Pautan
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {/* Hidden File Input */}
                <input
                  type="file"
                  accept="image/*"
                  ref={(el) => { fileInputRefs.current[card.productId] = el; }}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(card.productId, file);
                    }
                  }}
                />

                {/* Upload Button */}
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => fileInputRefs.current[card.productId]?.click()}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Foto</span>
                </button>

                {/* URL Button */}
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => {
                    setEditingUrlProductId(card.productId);
                    setUrlInput(currentImage);
                  }}
                  className="p-2 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
                  title="Tukar URL Pautan Gambar"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>

                {/* Reset Button (only if custom) */}
                {hasCustomImage && (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleResetToDefault(card.productId)}
                    className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 transition-colors cursor-pointer"
                    title="Kembalikan ke gambar asal"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
