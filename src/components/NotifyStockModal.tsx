import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Product, StockAlertSubscription } from '../types';
import { dataStorageService } from '../services/dataStorage';

interface NotifyStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  defaultCustomerName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
  onSubscribed?: (sub: StockAlertSubscription) => void;
}

export const NotifyStockModal: React.FC<NotifyStockModalProps> = ({
  isOpen,
  onClose,
  product,
  defaultCustomerName = '',
  defaultEmail = '',
  defaultPhone = '',
  onSubscribed,
}) => {
  const [customerName, setCustomerName] = useState(defaultCustomerName);
  const [channel, setChannel] = useState<'whatsapp' | 'email' | 'both'>('whatsapp');
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState(defaultPhone);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Sila masukkan nama anda.');
      return;
    }

    if ((channel === 'email' || channel === 'both') && !email.trim()) {
      setErrorMessage('Sila masukkan alamat emel yang sah.');
      return;
    }

    if ((channel === 'whatsapp' || channel === 'both') && !phone.trim()) {
      setErrorMessage('Sila masukkan nombor WhatsApp yang sah.');
      return;
    }

    const newSub = dataStorageService.saveStockAlert({
      productId: product.id,
      productName: product.name,
      customerName: customerName.trim(),
      channel,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
    });

    setIsSubmitted(true);
    if (onSubscribed) onSubscribed(newSub);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-6 flex flex-col"
        role="dialog"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-800 via-teal-900 to-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/90 flex items-center justify-center text-white shadow-md ring-2 ring-emerald-400/40">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Maklumkan Saya (Notify Me)
              </h2>
              <p className="text-xs text-stone-300">
                Pemberitahuan automatik bila stok segar tiba
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Preview Card */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 flex items-center gap-3.5">
          <img
            src={product.image}
            alt={product.name}
            className="w-16 h-16 rounded-xl object-cover border border-stone-200 dark:border-stone-700 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 w-fit block mb-1">
              {product.inStock && (product.remainingStock ?? 1) > 0 ? 'Slot Harian Terhad' : 'Habis Stok Buat Sementara'}
            </span>
            <h3 className="font-bold text-sm text-stone-900 dark:text-white truncate">
              {product.name}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              RM {product.price.toFixed(2)} /{product.unit} • {product.weightEstimate}
            </p>
          </div>
        </div>

        {/* Form Body or Success State */}
        {isSubmitted ? (
          <div className="p-6 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-stone-900 dark:text-white font-['Outfit']">
                Permintaan Berjaya Didaftarkan!
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed max-w-sm mx-auto">
                Terima kasih <strong>{customerName}</strong>. Pihak FreshAyam Direct akan menghantar makluman segera melalui{' '}
                <strong className="text-emerald-700 dark:text-emerald-300">
                  {channel === 'whatsapp' ? 'WhatsApp' : channel === 'email' ? 'Emel' : 'WhatsApp & Emel'}
                </strong>{' '}
                sebaik sahaja stok ayam segar seterusnya sedia untuk ditempah.
              </p>
            </div>

            <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-2xl text-[11px] text-stone-600 dark:text-stone-300 flex items-center gap-2 text-left">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Restock harian kami dibuka setiap hari jam 6:00 Petang untuk bekalan pagi esok.</span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Kembali Membeli-belah
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-stone-800 dark:text-stone-200">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Nama Anda
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder=""
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Notification Channel Picker */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Pilih Saluran Pemberitahuan
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel('whatsapp')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    channel === 'whatsapp'
                      ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-800 dark:text-emerald-200 shadow-2xs'
                      : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('email')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    channel === 'email'
                      ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-800 dark:text-emerald-200 shadow-2xs'
                      : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Emel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('both')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    channel === 'both'
                      ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-800 dark:text-emerald-200 shadow-2xs'
                      : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Kedua-dua</span>
                </button>
              </div>
            </div>

            {/* WhatsApp Phone Field */}
            {(channel === 'whatsapp' || channel === 'both') && (
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Nombor WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder=""
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            {(channel === 'email' || channel === 'both') && (
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Alamat Emel
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=""
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>Daftar Makluman Restock Percuma</span>
            </button>

            <div className="text-center text-[10px] text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kami tidak spam. Makluman hanya dihantar apabila stok segar tiba.</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
