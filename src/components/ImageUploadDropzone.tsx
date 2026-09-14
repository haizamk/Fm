import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Check, 
  X, 
  Link2, 
  RefreshCw, 
  FolderOpen, 
  Loader2,
  Trash2
} from 'lucide-react';
import { compressImageFile } from '../utils/imageCompressor';
import { dataStorageService } from '../services/dataStorage';
import { MediaLibraryModal } from './MediaLibraryModal';

interface ImageUploadDropzoneProps {
  value: string;
  onChange: (dataUrlOrUrl: string) => void;
  label?: string;
  helperText?: string;
  presetImages?: Array<{ url: string; label: string }>;
  adminName?: string;
}

export const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  value,
  onChange,
  label = 'Muat Naik Foto Produk',
  helperText = 'Sokongan PNG, JPG, WebP. Foto akan dioptimumkan secara automatik (30-80KB) agar kekal tersimpan dan tidak hilang.',
  presetImages,
  adminName = 'Admin Pasar Semenyih',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Sila pilih fail imej yang sah (JPG, PNG, WebP).');
      return;
    }

    setIsCompressing(true);
    try {
      // High efficiency client compression to Web-optimized JPEG (< 80KB)
      const compressed = await compressImageFile(file, {
        maxWidth: 960,
        maxHeight: 960,
        quality: 0.82,
      });

      // Save into Master Media Library so it is organized in the master folder
      dataStorageService.addMediaItem({
        name: file.name.replace(/\.[^/.]+$/, ''),
        url: compressed.dataUrl,
        sizeBytes: compressed.sizeBytes,
        width: compressed.width,
        height: compressed.height,
        category: 'produk',
        uploadedBy: adminName,
      });

      // Pass the compressed data URL to the product form state
      onChange(compressed.dataUrl);
    } catch (err) {
      console.error('Compression error:', err);
      setUploadError('Gagal memproses gambar. Sila cuba format imej lain.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (urlDraft.trim()) {
      onChange(urlDraft.trim());
      setUrlDraft('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="block font-bold text-stone-700 dark:text-stone-300 text-xs">
          {label}
        </label>
        
        <div className="flex items-center gap-3">
          {/* Master Media Folder Picker Button */}
          <button
            type="button"
            onClick={() => setShowMediaModal(true)}
            className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 cursor-pointer shadow-2xs hover:bg-emerald-100 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Pilih dari Folder Media Master</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 flex items-center gap-1 cursor-pointer"
          >
            <Link2 className="w-3 h-3" />
            <span>{showUrlInput ? 'Tutup URL' : 'Pautan URL'}</span>
          </button>
        </div>
      </div>

      {/* URL Input Bar if toggled */}
      {showUrlInput && (
        <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex gap-2">
          <input
            type="url"
            value={urlDraft || (value.startsWith('http') ? value : '')}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="Tampal pautan URL imej (cth: https://...)"
            className="flex-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer transition-colors"
          >
            Guna URL
          </button>
        </div>
      )}

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isCompressing && fileInputRef.current?.click()}
        className={`relative group rounded-2xl border-2 border-dashed p-4 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 scale-[1.01]'
            : 'border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100/80 dark:hover:bg-stone-800 hover:border-emerald-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {isCompressing ? (
          <div className="py-4 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <span className="text-xs font-bold">Mengoptimumkan saiz fail imej...</span>
          </div>
        ) : value && value.trim().length > 0 ? (
          <div className="w-full flex items-center gap-4">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-900 border border-stone-200 dark:border-stone-700 shrink-0 shadow-sm">
              <img
                src={value}
                alt="Pratonton Gambar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm shadow-xs">
                TERPAUT
              </span>
            </div>

            <div className="flex-1 text-left">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-1">
                <Check className="w-4 h-4" />
                <span>Foto Produk Sedia Disimpan</span>
              </div>
              <p className="text-[11px] text-stone-500 line-clamp-1 mb-2">
                {value.startsWith('data:') ? 'Foto Imej Optimum Peranti' : value}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Tukar Fail</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMediaModal(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-800 dark:text-stone-200 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <FolderOpen className="w-3 h-3" />
                  <span>Galeri Master</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange('');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 hover:bg-rose-200 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Padam Foto</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-2 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-stone-800 dark:text-stone-200 mb-0.5">
              Klik untuk Pilih Foto dari Peranti atau Seret & Lepas Di Sini
            </p>
            <p className="text-[11px] text-stone-500 max-w-md">
              {helperText}
            </p>
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
          <X className="w-3.5 h-3.5" />
          <span>{uploadError}</span>
        </p>
      )}

      {/* Master Media Modal */}
      <MediaLibraryModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelectImage={(url) => onChange(url)}
        selectedUrl={value}
        adminName={adminName}
      />
    </div>
  );
};
