import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Check, X, Link2, RefreshCw, Sparkles } from 'lucide-react';

interface ImageUploadDropzoneProps {
  value: string;
  onChange: (dataUrlOrUrl: string) => void;
  label?: string;
  helperText?: string;
  presetImages?: Array<{ url: string; label: string }>;
}

export const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  value,
  onChange,
  label = 'Muat Naik Gambar / Foto',
  helperText = 'Sokongan PNG, JPG, JPEG, WebP. Seret & lepas atau klik untuk pilih dari peranti.',
  presetImages,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Sila pilih fail imej yang sah (JPG, PNG, WebP).');
      return;
    }

    // Limit to 6MB
    if (file.size > 6 * 1024 * 1024) {
      setUploadError('Saiz fail terlalu besar (Maksimum 6MB). Sila pilih imej yang lebih padat.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        onChange(result);
      }
    };
    reader.onerror = () => {
      setUploadError('Gagal membaca fail imej. Sila cuba lagi.');
    };
    reader.readAsDataURL(file);
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
      <div className="flex items-center justify-between">
        <label className="block font-bold text-stone-700 dark:text-stone-300 text-xs">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Link2 className="w-3 h-3" />
          <span>{showUrlInput ? 'Sembunyi Pautan URL' : 'Guna Pautan URL Web'}</span>
        </button>
      </div>

      {/* Preset quick picks if provided */}
      {presetImages && presetImages.length > 0 && (
        <div className="mb-2">
          <span className="text-[10px] text-stone-500 font-medium block mb-1">
            Pilihan Foto Segar Segera:
          </span>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
            {presetImages.map((preset) => (
              <button
                type="button"
                key={preset.url}
                onClick={() => onChange(preset.url)}
                className={`relative rounded-lg overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                  value === preset.url ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-stone-200 dark:border-stone-700 opacity-60 hover:opacity-100'
                }`}
                title={preset.label}
              >
                <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                {value === preset.url && (
                  <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* URL Input Bar if toggled */}
      {showUrlInput && (
        <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex gap-2">
          <input
            type="url"
            value={urlDraft || (value.startsWith('http') ? value : '')}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="Tampal pautan URL imej (cth: https://images.unsplash.com/...)"
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
        onClick={() => fileInputRef.current?.click()}
        className={`relative group rounded-2xl border-2 border-dashed p-4 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 scale-[1.01]'
            : 'border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100/80 dark:hover:bg-stone-800 hover:border-emerald-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {value ? (
          <div className="w-full flex items-center gap-4">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-900 border border-stone-200 dark:border-stone-700 shrink-0 shadow-sm">
              <img
                src={value}
                alt="Pratonton Gambar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[9px] font-black px-1 rounded-sm">
                AKTIF
              </span>
            </div>

            <div className="flex-1 text-left">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-1">
                <Check className="w-4 h-4" />
                <span>Gambar Berjaya Dimuat Naik / Dipilih</span>
              </div>
              <p className="text-[11px] text-stone-500 line-clamp-1 mb-2">
                {value.startsWith('data:') ? 'Fail Imej Tempatan Peranti' : value}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Tukar Fail</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange('');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 hover:bg-rose-200 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Padam</span>
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
              Klik untuk Pilih Fail Gambar atau Seret & Lepas Di Sini
            </p>
            <p className="text-[11px] text-stone-500">
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
    </div>
  );
};
