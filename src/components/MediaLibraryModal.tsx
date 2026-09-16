import React, { useState, useEffect, useRef } from 'react';
import { MediaItem } from '../types';
import { dataStorageService } from '../services/dataStorage';
import { compressImageFile } from '../utils/imageCompressor';
import { 
  FolderOpen, 
  UploadCloud, 
  Check, 
  Trash2, 
  X, 
  Image as ImageIcon, 
  Sparkles, 
  Search,
  Plus,
  Loader2,
  Pencil
} from 'lucide-react';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string, item?: MediaItem) => void;
  selectedUrl?: string;
  adminName?: string;
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  selectedUrl,
  adminName = 'Admin Pasar Semenyih',
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deletingItem, setDeletingItem] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const unsub = dataStorageService.subscribeMediaLibrary((items) => {
      setMediaItems(items);
    });
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgressText('Mengoptimumkan saiz imej & memuat naik...');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        // Compress image to lightweight Web JPEG
        const compressed = await compressImageFile(file, {
          maxWidth: 1000,
          maxHeight: 1000,
          quality: 0.82,
        });

        // Add to master media folder
        const newItem = dataStorageService.addMediaItem({
          name: file.name.replace(/\.[^/.]+$/, ''),
          url: compressed.dataUrl,
          sizeBytes: compressed.sizeBytes,
          width: compressed.width,
          height: compressed.height,
          category: selectedCategory === 'semua' ? 'umum' : selectedCategory,
          uploadedBy: adminName,
        });

        // If only 1 file uploaded, auto-select it immediately
        if (files.length === 1) {
          onSelectImage(newItem.url, newItem);
          setIsUploading(false);
          onClose();
          return;
        }
      }
      setMediaItems(dataStorageService.getMediaLibrary());
    } catch (err) {
      console.error('Upload media error:', err);
      alert('Gagal memuat naik fail imej. Sila cuba lagi.');
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteItem = (item: MediaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingItem(item);
  };

  const confirmDeleteMediaItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!deletingItem) return;
    const updated = dataStorageService.deleteMediaItem(deletingItem.id, adminName);
    setMediaItems(updated);
    setDeletingItem(null);
  };

  const handleSaveRename = (item: MediaItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!editingName.trim()) {
      alert('Nama imej tidak boleh kosong.');
      return;
    }
    const updated = dataStorageService.updateMediaItem(item.id, { name: editingName.trim() }, adminName);
    setMediaItems(updated);
    setEditingItemId(null);
  };

  const filteredItems = mediaItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'semua' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['semua', 'ayam-seekor', 'bahagian-ayam', 'kombo-jimat', 'umum'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-stone-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                Folder & Galeri Media Master
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Pilih foto dari simpanan master atau muat naik foto produk segar baru
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari foto mengikut nama..."
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            {/* Category Filter Pills */}
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

          {/* Upload Button */}
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

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50/50 dark:bg-stone-950/40">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mb-3">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 mb-1">
                Folder Media Kosong
              </h3>
              <p className="text-xs text-stone-500 mb-4 text-center">
                Belum ada imej dimuat naik ke folder master. Muat naik foto ayam segar anda sekarang.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Pilih Foto dari Komputer / Telefon</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {filteredItems.map((item) => {
                const isSelected = selectedUrl === item.url;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectImage(item.url, item);
                      onClose();
                    }}
                    className={`group relative rounded-xl overflow-hidden bg-white dark:bg-stone-900 border-2 transition-all cursor-pointer shadow-xs hover:shadow-md ${
                      isSelected
                        ? 'border-emerald-600 ring-2 ring-emerald-500/40 scale-[1.02]'
                        : 'border-stone-200 dark:border-stone-800 hover:border-emerald-400'
                    }`}
                  >
                    <div className="aspect-square relative overflow-hidden bg-stone-100 dark:bg-stone-800">
                      <img
                        src={item.url}
                        alt={`${item.name} - Gambar Media Khairul FRESH Food Pasar Semenyih`}
                        title={`${item.name} - Gambar Media Khairul FRESH Food Pasar Semenyih`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />

                      {/* Selected Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}

                      {/* Delete Button - Always visible on top right or bottom right without overlapping indicator */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteItem(item, e)}
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-md cursor-pointer z-10"
                        title="Padam daripada Folder Master"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-2.5">
                      {editingItemId === item.id ? (
                        <div className="flex items-center gap-1 mb-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(item, e as any);
                              if (e.key === 'Escape') setEditingItemId(null);
                            }}
                            autoFocus
                            className="w-full bg-stone-50 dark:bg-stone-800 border border-emerald-500 rounded-lg px-2 py-1 text-xs font-bold text-stone-900 dark:text-white focus:outline-hidden"
                            placeholder="Nama foto..."
                          />
                          <button
                            type="button"
                            onClick={(e) => handleSaveRename(item, e)}
                            className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shrink-0 cursor-pointer"
                            title="Simpan"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingItemId(null);
                            }}
                            className="p-1 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-300 shrink-0 cursor-pointer"
                            title="Batal"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-1">
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
                        <span>
                          {item.sizeBytes ? `${Math.round(item.sizeBytes / 1024)} KB` : 'Foto Segar'}
                        </span>
                        <span>
                          {new Date(item.uploadedAt).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 flex items-center justify-between text-xs text-stone-500">
          <span>Jumlah Foto Master: <strong className="text-stone-800 dark:text-stone-200">{mediaItems.length}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal (Iframe Safe - No window.confirm) */}
      {deletingItem && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => { e.stopPropagation(); setDeletingItem(null); }}
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
                Adakah anda pasti mahu memadam foto <strong className="text-stone-800 dark:text-stone-200">"{deletingItem.name}"</strong>?
              </p>
            </div>

            <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 shadow-xs">
              <img src={deletingItem.url} alt={`${deletingItem.name} - Khairul FRESH Food Pasar Semenyih`} title={deletingItem.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setDeletingItem(null); }}
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
