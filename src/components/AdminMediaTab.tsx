import React, { useState, useEffect, useRef } from 'react';
import { MediaItem, Product } from '../types';
import { dataStorageService } from '../services/dataStorage';
import { compressImageFile } from '../utils/imageCompressor';
import { 
  FolderOpen, 
  UploadCloud, 
  Trash2, 
  Search, 
  Plus, 
  Loader2, 
  Image as ImageIcon, 
  Check, 
  Link as LinkIcon, 
  Layers, 
  Sparkles,
  ArrowRight,
  Pencil,
  X
} from 'lucide-react';

interface AdminMediaTabProps {
  products: Product[];
  onProductsUpdated: (products: Product[]) => void;
  onShowNotification: (type: 'success' | 'error', text: string) => void;
  adminName: string;
}

export const AdminMediaTab: React.FC<AdminMediaTabProps> = ({
  products,
  onProductsUpdated,
  onShowNotification,
  adminName,
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => dataStorageService.getMediaLibrary());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [assigningItemId, setAssigningItemId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deletingItem, setDeletingItem] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = dataStorageService.subscribeMediaLibrary((items) => {
      setMediaItems(items);
    });
    return () => unsub();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgressText('Mengoptimumkan saiz imej & memuat naik...');

    try {
      let count = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        // Auto compress
        const compressed = await compressImageFile(file, {
          maxWidth: 1000,
          maxHeight: 1000,
          quality: 0.82,
        });

        dataStorageService.addMediaItem({
          name: file.name.replace(/\.[^/.]+$/, ''),
          url: compressed.dataUrl,
          sizeBytes: compressed.sizeBytes,
          width: compressed.width,
          height: compressed.height,
          category: selectedCategory === 'semua' ? 'ayam-segar' : selectedCategory,
          uploadedBy: adminName,
        });
        count++;
      }
      setMediaItems(dataStorageService.getMediaLibrary());
      onShowNotification('success', `${count} fail imej berjaya dimuat naik ke Folder Media Master.`);
    } catch (err) {
      console.error('Upload media error:', err);
      onShowNotification('error', 'Gagal memuat naik fail imej. Sila cuba lagi.');
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteItem = (item: MediaItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeletingItem(item);
  };

  const confirmDeleteMediaItem = () => {
    if (!deletingItem) return;
    const itemToDelete = deletingItem;
    const updated = dataStorageService.deleteMediaItem(itemToDelete.id, adminName);
    setMediaItems(updated);
    setDeletingItem(null);
    onShowNotification('success', `Imej "${itemToDelete.name}" telah dipadam daripada Folder Media Master.`);
  };

  const handleSaveRename = (item: MediaItem) => {
    if (!editingName.trim()) {
      onShowNotification('error', 'Nama imej tidak boleh kosong.');
      return;
    }
    const updated = dataStorageService.updateMediaItem(item.id, { name: editingName.trim() }, adminName);
    setMediaItems(updated);
    setEditingItemId(null);
    onShowNotification('success', `Nama imej berjaya ditukar kepada "${editingName.trim()}".`);
  };

  const handleAssignToProduct = (item: MediaItem) => {
    if (!selectedProductId) {
      onShowNotification('error', 'Sila pilih produk ayam untuk dipautkan.');
      return;
    }

    const target = products.find((p) => p.id === selectedProductId);
    if (!target) return;

    const updatedProduct = {
      ...target,
      image: item.url,
    };

    const updatedList = dataStorageService.updateProduct(updatedProduct, adminName);
    onProductsUpdated(updatedList);
    setAssigningItemId(null);
    setSelectedProductId('');
    onShowNotification('success', `Foto berjaya dipautkan kepada produk "${target.name}".`);
  };

  const filteredItems = mediaItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'semua' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['semua', 'ayam-segar', 'ayam-kampung', 'bahagian-ayam', 'kombo', 'umum'];

  // Calculate stats
  const totalSizeBytes = mediaItems.reduce((acc, it) => acc + (it.sizeBytes || 0), 0);
  const totalSizeKB = Math.round(totalSizeBytes / 1024);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner / Stats */}
      <div className="bg-gradient-to-br from-stone-900 via-emerald-950 to-stone-900 text-white p-5 rounded-3xl border border-emerald-900/60 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <FolderOpen className="w-4 h-4" />
            </span>
            <h3 className="text-base font-black tracking-tight">
              Folder & Galeri Media Master
            </h3>
          </div>
          <p className="text-xs text-stone-300 max-w-xl">
            Simpanan pusat bagi semua foto produk ayam segar. Foto yang dimuat naik dioptimumkan secara automatik (30-80KB) agar tidak hilang dan kekal pantas dipaparkan kepada pelanggan.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-stone-950/60 px-4 py-2.5 rounded-2xl border border-emerald-800/40 shrink-0">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-stone-400">Jumlah Foto</p>
            <p className="text-sm font-black text-emerald-400">{mediaItems.length} Fail</p>
          </div>
          <div className="h-7 w-px bg-stone-700" />
          <div className="text-left">
            <p className="text-[10px] uppercase font-bold text-stone-400">Saiz Simpanan</p>
            <p className="text-sm font-black text-stone-200">{totalSizeKB > 1024 ? `${(totalSizeKB / 1024).toFixed(1)} MB` : `${totalSizeKB} KB`}</p>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari foto mengikut nama fail..."
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="hidden sm:flex items-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                }`}
              >
                {cat === 'semua' ? 'Semua' : cat.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{uploadProgressText || 'Memproses...'}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Muat Naik Foto Baru</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid of Media Items */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-3">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h4 className="text-sm font-bold text-stone-900 dark:text-white mb-1">
            Tiada Foto dalam Folder Media Master
          </h4>
          <p className="text-xs text-stone-500 mb-5 max-w-sm">
            Semua gambar telah dikosongkan mengikut arahan anda. Sila muat naik gambar foto ayam segar anda satu persatu sekarang.
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Pilih & Muat Naik Foto Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => {
            const isAssigning = assigningItemId === item.id;
            // Find products using this image
            const attachedProducts = products.filter((p) => p.image === item.url);

            return (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                <div className="aspect-square relative overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <img
                    src={item.url}
                    alt={`${item.name} - Galeri Media Khairul FRESH Food Pasar Semenyih`}
                    title={`${item.name} - Galeri Media Khairul FRESH Food Pasar Semenyih`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {attachedProducts.length > 0 ? (
                      <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                        {attachedProducts.length} Produk Guna
                      </span>
                    ) : (
                      <span className="bg-stone-800/80 text-stone-200 text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                        Belum Diguna
                      </span>
                    )}
                  </div>

                  {/* Delete Button - Always visible for quick access */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteItem(item, e)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-md cursor-pointer z-10"
                    title="Padam Foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    {editingItemId === item.id ? (
                      <div className="flex items-center gap-1 mb-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(item);
                            if (e.key === 'Escape') setEditingItemId(null);
                          }}
                          autoFocus
                          className="w-full bg-stone-50 dark:bg-stone-800 border border-emerald-500 rounded-lg px-2 py-1 text-xs font-bold text-stone-900 dark:text-white focus:outline-hidden"
                          placeholder="Nama foto..."
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(item)}
                          className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shrink-0 cursor-pointer"
                          title="Simpan"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingItemId(null)}
                          className="p-1 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-300 shrink-0 cursor-pointer"
                          title="Batal"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-1 group/name">
                        <p className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate flex-1" title={item.name}>
                          {item.name}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItemId(item.id);
                            setEditingName(item.name);
                          }}
                          className="p-1 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0 cursor-pointer"
                          title="Tukar Nama Imej"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-1 text-[10px] text-stone-400">
                      <span>{item.sizeBytes ? `${Math.round(item.sizeBytes / 1024)} KB` : 'Dioptimumkan'}</span>
                      <span>{new Date(item.uploadedAt).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}</span>
                    </div>

                    {attachedProducts.length > 0 && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate mt-1">
                        ↳ {attachedProducts.map((p) => p.name).join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Quick Assign Dropdown */}
                  <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800">
                    {isAssigning ? (
                      <div className="space-y-1.5">
                        <select
                          value={selectedProductId}
                          onChange={(e) => setSelectedProductId(e.target.value)}
                          className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg p-1 text-[11px] font-semibold"
                        >
                          <option value="">-- Pilih Produk --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAssignToProduct(item)}
                            className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold cursor-pointer"
                          >
                            Pautkan
                          </button>
                          <button
                            type="button"
                            onClick={() => setAssigningItemId(null)}
                            className="px-2 py-1 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-md text-[10px] cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAssigningItemId(item.id);
                          setSelectedProductId('');
                        }}
                        className="w-full py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 text-stone-600 dark:text-stone-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <ArrowRight className="w-3 h-3" />
                        <span>Pautkan ke Produk</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Delete Confirmation Modal (Iframe Safe - No window.confirm) */}
      {deletingItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setDeletingItem(null)}
        >
          <div 
            className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-sm w-full border border-stone-200 dark:border-stone-800 shadow-2xl text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-xs">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-black text-stone-900 dark:text-white">
                Padam Foto Master?
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Adakah anda pasti mahu memadam foto <strong className="text-stone-800 dark:text-stone-200">"{deletingItem.name}"</strong> daripada Galeri Media Master?
              </p>
            </div>

            {/* Thumbnail Preview */}
            <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 shadow-xs">
              <img src={deletingItem.url} alt={`${deletingItem.name} - Khairul FRESH Food Pasar Semenyih`} title={deletingItem.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteMediaItem}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                Ya, Padam Foto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
