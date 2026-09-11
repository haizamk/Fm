import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  RefreshCw, 
  Eye, 
  Truck, 
  Store, 
  Scissors, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  ArrowRight,
  Clock,
  Layers,
  Save,
  X,
  RotateCcw
} from 'lucide-react';
import { RotationBannerItem } from '../types';
import { dataStorageService, DEFAULT_ROTATION_BANNERS } from '../services/dataStorage';
import { ImageUploadDropzone } from './ImageUploadDropzone';

interface BannerEditorTabProps {
  banners: RotationBannerItem[];
  onBannersUpdated: (banners: RotationBannerItem[]) => void;
  onShowNotification: (type: 'success' | 'error', text: string) => void;
}

const PRESET_IMAGES = [
  { label: 'Ayam Standard Segar', url: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=900' },
  { label: 'Potongan Whole-leg', url: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=80&w=900' },
  { label: 'Ayam Kampung Segar', url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&q=80&w=900' },
  { label: 'Gerai Pasar Semenyih', url: 'https://images.unsplash.com/photo-1548567117-0429762db801?auto=format&fit=crop&q=80&w=900' },
  { label: 'Dada Ayam Fillet', url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=900' },
  { label: 'Kepak Ayam Bersih', url: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&q=80&w=900' },
];

export const BannerEditorTab: React.FC<BannerEditorTabProps> = ({
  banners,
  onBannersUpdated,
  onShowNotification,
}) => {
  const [editingBanner, setEditingBanner] = useState<RotationBannerItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states
  const [formBadge, setFormBadge] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCtaText, setFormCtaText] = useState('Pesan Sekarang');
  const [formCtaAction, setFormCtaAction] = useState<RotationBannerItem['ctaAction']>('catalog');
  const [formAccentColor, setFormAccentColor] = useState('emerald');
  const [formIcon, setFormIcon] = useState<RotationBannerItem['icon']>('truck');
  const [formBgColor, setFormBgColor] = useState('from-emerald-950 via-emerald-900 to-teal-950');
  const [formImageUrl, setFormImageUrl] = useState(PRESET_IMAGES[0].url);
  const [formIsActive, setFormIsActive] = useState(true);

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setFormBadge('PROMOSI BARU');
    setFormTitle('Tawaran Istimewa Khairul FRESH Food');
    setFormDescription('Dapatkan ayam segar berkualiti dibekalkan awal pagi terus dari Pasar Semenyih.');
    setFormCtaText('Pesan Sekarang');
    setFormCtaAction('catalog');
    setFormAccentColor('emerald');
    setFormIcon('truck');
    setFormBgColor('from-emerald-950 via-emerald-900 to-teal-950');
    setFormImageUrl(PRESET_IMAGES[0].url);
    setFormIsActive(true);
    setIsAddingNew(true);
  };

  const handleOpenEdit = (banner: RotationBannerItem) => {
    setEditingBanner(banner);
    setFormBadge(banner.badge);
    setFormTitle(banner.title);
    setFormDescription(banner.description);
    setFormCtaText(banner.ctaText);
    setFormCtaAction(banner.ctaAction);
    setFormAccentColor(banner.accentColor || 'emerald');
    setFormIcon(banner.icon || 'truck');
    setFormBgColor(banner.bgColor || 'from-emerald-950 via-emerald-900 to-teal-950');
    setFormImageUrl(banner.imageUrl || PRESET_IMAGES[0].url);
    setFormIsActive(banner.isActive);
    setIsAddingNew(false);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      onShowNotification('error', 'Sila masukkan tajuk banner.');
      return;
    }

    if (editingBanner) {
      // Update existing
      const updated = dataStorageService.updateRotationBanner(editingBanner.id, {
        badge: formBadge.trim().toUpperCase() || 'PROMOSI',
        title: formTitle.trim(),
        description: formDescription.trim(),
        ctaText: formCtaText.trim() || 'Lihat Tawaran',
        ctaAction: formCtaAction,
        accentColor: formAccentColor,
        icon: formIcon,
        bgColor: formBgColor,
        imageUrl: formImageUrl,
        isActive: formIsActive,
      });

      if (updated) {
        const freshList = dataStorageService.getRotationBanners();
        onBannersUpdated(freshList);
        onShowNotification('success', `Banner "${formTitle}" berjaya dikemaskini.`);
      }
    } else {
      // Create new
      const created = dataStorageService.addRotationBanner({
        badge: formBadge.trim().toUpperCase() || 'PROMOSI',
        title: formTitle.trim(),
        description: formDescription.trim(),
        ctaText: formCtaText.trim() || 'Lihat Tawaran',
        ctaAction: formCtaAction,
        accentColor: formAccentColor,
        icon: formIcon,
        bgColor: formBgColor,
        imageUrl: formImageUrl,
        isActive: formIsActive,
        order: banners.length + 1,
      });

      const freshList = dataStorageService.getRotationBanners();
      onBannersUpdated(freshList);
      onShowNotification('success', `Banner baharu "${created.title}" berjaya ditambah.`);
    }

    setEditingBanner(null);
    setIsAddingNew(false);
  };

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    dataStorageService.updateRotationBanner(id, { isActive: !currentStatus });
    const freshList = dataStorageService.getRotationBanners();
    onBannersUpdated(freshList);
    onShowNotification('success', `Status banner berjaya diubah.`);
  };

  const handleDelete = (id: string, title: string) => {
    if (banners.length <= 1) {
      onShowNotification('error', 'Anda mesti mengekalkan sekurang-kurangnya 1 banner aktif.');
      return;
    }
    if (window.confirm(`Adakah anda pasti ingin memadamkan banner "${title}"?`)) {
      dataStorageService.deleteRotationBanner(id);
      const freshList = dataStorageService.getRotationBanners();
      onBannersUpdated(freshList);
      onShowNotification('success', `Banner "${title}" berjaya dipadam.`);
    }
  };

  const handleResetDefault = () => {
    if (window.confirm('Adakah anda ingin mengembalikan 3 banner lalai rasmi (Promosi RM150 Free Delivery, Pilihan Pickup, dan Percuma Potong)?')) {
      const reset = dataStorageService.resetRotationBannersToDefault();
      onBannersUpdated(reset);
      onShowNotification('success', '3 banner rasmi lalai berjaya dipulihkan.');
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'truck': return <Truck className="w-4 h-4" />;
      case 'store': return <Store className="w-4 h-4" />;
      case 'scissors': return <Scissors className="w-4 h-4" />;
      case 'sparkles': return <Sparkles className="w-4 h-4" />;
      case 'flame': return <Flame className="w-4 h-4" />;
      default: return <ShieldCheck className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions */}
      <div className="bg-white dark:bg-stone-800 p-5 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Pengurusan Rotation Banner (12 Saat Frontpage)</span>
          </div>
          <h2 className="text-xl font-black text-stone-900 dark:text-white mt-1 font-['Outfit']">
            Editor Banner Promosi & Hebahan Laman Utama
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Ubah tajuk, tawaran diskaun penghantaran, pilihan pickup, servis potong percuma, dan butang tindakan yang berputar automatik setiap 12 saat di laman hadapan.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleResetDefault}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Kembalikan 3 banner lalai rasmi"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Set Semula Lalai</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Banner Baharu</span>
          </button>
        </div>
      </div>

      {/* Banner List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {banners.map((banner, index) => (
          <div 
            key={banner.id}
            className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
              banner.isActive 
                ? 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 shadow-sm' 
                : 'bg-stone-100 dark:bg-stone-900 border-stone-300 dark:border-stone-800 opacity-60'
            }`}
          >
            {/* Visual Top Preview Strip */}
            <div className={`p-4 bg-gradient-to-r ${banner.bgColor || 'from-stone-900 to-stone-800'} text-white relative`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/40 border border-white/20">
                  #{index + 1} • {banner.badge}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  banner.isActive ? 'bg-emerald-500/80 text-white' : 'bg-stone-600 text-stone-300'
                }`}>
                  {banner.isActive ? 'Aktif (12s)' : 'Dinyahaktifkan'}
                </span>
              </div>

              <h4 className="text-sm font-black leading-tight line-clamp-2">
                {banner.title}
              </h4>
            </div>

            {/* Content Body */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-3 leading-relaxed">
                {banner.description}
              </p>

              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-700 text-xs text-stone-500">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Teks Butang (CTA):</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{banner.ctaText}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Tindakan:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
                    {banner.ctaAction === 'catalog' && 'Katalog Produk'}
                    {banner.ctaAction === 'pickup' && 'Info Self-Pickup'}
                    {banner.ctaAction === 'cutting' && 'Servis Potong'}
                    {banner.ctaAction === 'all-products' && 'Semua Produk'}
                    {banner.ctaAction === 'whatsapp' && 'Hubungi WhatsApp'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-700">
                <button
                  onClick={() => handleToggleActive(banner.id, banner.isActive)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                    banner.isActive 
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100' 
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  {banner.isActive ? 'Nyahaktifkan' : 'Aktifkan'}
                </button>

                <button
                  onClick={() => handleOpenEdit(banner)}
                  className="py-1.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-100 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDelete(banner.id, banner.title)}
                  className="py-1.5 px-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 hover:bg-rose-100 text-[11px] font-bold transition-colors cursor-pointer"
                  title="Padam banner"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Editor / Add Form */}
      {(isAddingNew || editingBanner) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xs z-10">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-extrabold text-base text-stone-900 dark:text-white font-['Outfit']">
                  {editingBanner ? `Edit Banner: ${editingBanner.title}` : 'Tambah Rotation Banner Baharu'}
                </h3>
              </div>
              <button
                onClick={() => { setIsAddingNew(false); setEditingBanner(null); }}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSaveForm} className="p-5 sm:p-6 space-y-4 text-xs">
              
              {/* Badge & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Teks Lencana (Badge)
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="Cth: PROMOSI SEMASA, PICKUP..."
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 font-bold uppercase focus:outline-hidden"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Tajuk Banner Utama
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Cth: Beli Lebih RM150 Free Delivery (Diskaun RM6)"
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 font-bold focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Penerangan / Subteks Hebahan
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder="Keterangan promosi, servis pemotongan, atau lokasi pickup pasar semenyih..."
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 leading-relaxed focus:outline-hidden"
                  required
                />
              </div>

              {/* CTA Text and Action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Teks Butang Tindakan (CTA)
                  </label>
                  <input
                    type="text"
                    value={formCtaText}
                    onChange={(e) => setFormCtaText(e.target.value)}
                    placeholder="Cth: Pesan Sekarang, Pilih Pickup..."
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 font-bold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Tindakan Apabila Diklik
                  </label>
                  <select
                    value={formCtaAction}
                    onChange={(e) => setFormCtaAction(e.target.value as RotationBannerItem['ctaAction'])}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 font-semibold focus:outline-hidden"
                  >
                    <option value="catalog">Buka / Skrol ke Katalog Produk</option>
                    <option value="pickup">Buka Pilihan Pickup di Kedai</option>
                    <option value="cutting">Buka Pilihan Potongan & Resepi</option>
                    <option value="all-products">Buka Halaman Semua Produk</option>
                    <option value="whatsapp">Hubungi WhatsApp Gerai GA 59</option>
                  </select>
                </div>
              </div>

              {/* Theme, Icon, and Background */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Aksen Warna Tema
                  </label>
                  <select
                    value={formAccentColor}
                    onChange={(e) => {
                      const color = e.target.value;
                      setFormAccentColor(color);
                      if (color === 'emerald') setFormBgColor('from-emerald-950 via-emerald-900 to-teal-950');
                      if (color === 'amber') setFormBgColor('from-amber-950 via-stone-900 to-amber-950');
                      if (color === 'blue') setFormBgColor('from-sky-950 via-slate-900 to-blue-950');
                      if (color === 'purple') setFormBgColor('from-purple-950 via-slate-900 to-indigo-950');
                    }}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 font-semibold focus:outline-hidden"
                  >
                    <option value="emerald">Hijau Segar (Emerald)</option>
                    <option value="amber">Oren Hangat (Amber)</option>
                    <option value="blue">Biru Bersih (Sky/Blue)</option>
                    <option value="purple">Ungu Eksklusif (Purple)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Ikon Banner
                  </label>
                  <select
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value as RotationBannerItem['icon'])}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 font-semibold focus:outline-hidden"
                  >
                    <option value="truck">Lori Penghantaran (Truck)</option>
                    <option value="store">Gerai Kedai (Store / Pickup)</option>
                    <option value="scissors">Gunting Potong (Scissors)</option>
                    <option value="sparkles">Kilauan Tawaran (Sparkles)</option>
                    <option value="flame">Api Masakan (Flame)</option>
                    <option value="shield">Perisai Halal & Jaminan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Status Tayangan
                  </label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="bannerIsActive"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 rounded-md accent-emerald-600 cursor-pointer"
                    />
                    <label htmlFor="bannerIsActive" className="text-xs font-bold text-stone-800 dark:text-stone-200 cursor-pointer">
                      Aktif dalam Putaran 12s
                    </label>
                  </div>
                </div>
              </div>

              {/* Image Upload & Preset Selection */}
              <div className="pt-1">
                <ImageUploadDropzone
                  value={formImageUrl}
                  onChange={(newUrl) => setFormImageUrl(newUrl)}
                  label="Foto / Gambar Banner Promosi"
                  helperText="Muat naik fail banner dari komputer / telefon (PNG, JPG, WebP) atau guna pautan URL."
                  presetImages={PRESET_IMAGES}
                />
              </div>

              {/* Live Preview Box */}
              <div className="pt-2">
                <span className="block font-bold text-stone-400 text-[10px] uppercase tracking-wider mb-1.5">
                  Pratonton Langsung Banner:
                </span>
                <div className={`p-4 rounded-2xl bg-gradient-to-r ${formBgColor} text-white border border-white/10 flex items-center justify-between gap-4`}>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/20 border border-white/20 inline-block">
                      {formBadge || 'LENCANA'}
                    </span>
                    <h4 className="text-base font-black leading-tight">
                      {formTitle || 'Tajuk Banner'}
                    </h4>
                    <p className="text-xs text-stone-300 max-w-md line-clamp-2">
                      {formDescription || 'Penerangan banner...'}
                    </p>
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold bg-white text-stone-900">
                        <span>{formCtaText || 'Tindakan'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {formImageUrl && (
                    <div className="w-24 h-20 rounded-xl overflow-hidden border border-white/20 shrink-0 hidden sm:block">
                      <img src={formImageUrl} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsAddingNew(false); setEditingBanner(null); }}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
