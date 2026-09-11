import React from 'react';
import { MapPin, Navigation, Clock, Store, ExternalLink, PhoneCall, CheckCircle2 } from 'lucide-react';

interface GoogleMapsSectionProps {
  onOpenWhatsApp?: () => void;
}

export const GoogleMapsSection: React.FC<GoogleMapsSectionProps> = ({ onOpenWhatsApp }) => {
  const googleMapsUrl = "https://maps.app.goo.gl/AaL8N9Fnr3SPy82h7";
  const wazeUrl = "https://waze.com/ul?q=Pasar+Sementara+Semenyih";

  return (
    <div className="w-full bg-stone-900/90 text-white rounded-3xl p-5 sm:p-7 border border-stone-800 shadow-xl overflow-hidden my-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            <span>Lokasi Fizikal & Pilihan Ambil Sendiri (Self-Pickup Percuma)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Outfit']">
            Gerai Ayam No 59, Pasar Sementara Semenyih
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Gerai Ayam No 59, Pasar Sementara Semenyih, Pekan Semenyih, 43500 Semenyih, Selangor</span>
          </p>
        </div>

        {/* Quick Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-md cursor-pointer group"
          >
            <Navigation className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
            <span>Panduan Google Maps</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>

          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-bold text-xs border border-stone-700 transition-all cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-sky-400" />
            <span>Panduan Waze</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>
      </div>

      {/* Main Content Grid: Interactive Map + Pickup Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        
        {/* Interactive Google Map Embed */}
        <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-stone-700/80 relative bg-stone-950 aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:h-full min-h-[280px]">
          <iframe
            title="Peta Lokasi Gerai Ayam No 59 Pasar Sementara Semenyih"
            src="https://maps.google.com/maps?q=Pasar%20Sementara%20Semenyih%2C%2043500%20Semenyih%2C%20Selangor&t=&z=17&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0 absolute inset-0"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 left-3 bg-stone-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-700 text-xs font-bold text-emerald-300 shadow-md flex items-center gap-1.5 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Gerai Ayam No 59 (Zon Khidmat Potongan & Bersih Ayam Segar)</span>
          </div>
        </div>

        {/* Pickup Info & Step-by-Step Card */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-stone-950/60 p-5 rounded-2xl border border-stone-800/80">
          
          <div className="space-y-3.5">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Waktu Operasi & Pengambilan (Self-Pickup)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-[11px] text-stone-400 block font-medium">Selasa – Ahad</span>
                <span className="font-bold text-emerald-400">7:00 AM – 12:00 PM</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-[11px] text-stone-400 block font-medium">Hari Isnin</span>
                <span className="font-bold text-amber-400">Cuti Pasar (Tutup)</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-stone-300 block">
                Kelebihan Ambil Sendiri (Self-Pickup):
              </span>
              <ul className="space-y-1.5 text-xs text-stone-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>Percuma 100%</strong> tiada sebarang kos caj penghantaran.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>Tanpa Perlu Beratur</strong> — pesanan telah siap dipotong, dicuci & dibungkus sejuk.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Hanya tunjukkan <strong>ID Pesanan (FAD-XXXXX)</strong> di kaunter gerai GA 59.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Hotline assistance */}
          {onOpenWhatsApp && (
            <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
              <span className="text-[11px] text-stone-400">Perlukan bantuan arah lokasi?</span>
              <button
                onClick={onOpenWhatsApp}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>WhatsApp Hotline</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
