import React, { useState } from 'react';
import { COVERAGE_AREAS, STORE_PICKUP_LOCATION, checkCoverageByPostcode } from '../data/coverage';
import { CoverageArea } from '../types';
import { 
  X, 
  MapPin, 
  Search, 
  Truck, 
  Clock, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Navigation,
  Compass,
  Store
} from 'lucide-react';

interface CoverageCheckerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArea: (area: CoverageArea) => void;
  currentPostcode: string;
}

export const CoverageChecker: React.FC<CoverageCheckerProps> = ({
  isOpen,
  onClose,
  onSelectArea,
  currentPostcode,
}) => {
  const [query, setQuery] = useState(currentPostcode || '43500');
  const [selectedResult, setSelectedResult] = useState<CoverageArea | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const res = checkCoverageByPostcode(query);
    setHasSearched(true);
    if (res.found && res.area) {
      setSelectedResult(res.area);
    } else {
      setSelectedResult(null);
    }
  };

  const handleSelect = (area: CoverageArea) => {
    onSelectArea(area);
    onClose();
  };

  const getGoogleMapsUrl = (area?: CoverageArea | null) => {
    if (area) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(area.city + ' ' + area.postcode + ' Selangor Malaysia')}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Pasar Semenyih Selangor Malaysia')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-6 flex flex-col max-h-[90vh] transition-colors"
        role="dialog"
      >
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Outfit']">Zon Penghantaran & Ambil Sendiri</h2>
              <p className="text-xs text-stone-400">
                Khairul Fresh Food • Pasar Semenyih, Beranang & Kajang
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Operating Hours Notice */}
        <div className="bg-emerald-50 dark:bg-emerald-950/50 px-5 py-2.5 border-b border-emerald-200 dark:border-emerald-800/80 text-xs flex items-center justify-between">
          <span className="text-emerald-900 dark:text-emerald-200 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span><strong>Waktu Operasi (Selasa - Ahad):</strong> 7:00 AM - 12:00 Tengah Hari (Isnin Tutup)</span>
          </span>
          <a
            href={getGoogleMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            <span>Peta Pasar</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-stone-800 dark:text-stone-200">
          
          {/* Self-Pickup Location Card */}
          <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-stone-900 dark:text-white">
                    🏪 Ambil Sendiri di Kedai (Self-Pickup)
                  </h4>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-extrabold text-[10px]">
                    RM0.00 PERCUMA
                  </span>
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 font-medium mt-1">
                  {STORE_PICKUP_LOCATION.address}
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  Ambil ayam segar anda 1 jam selepas pesanan dibayar (sebelum 12:00 PM).
                </p>
              </div>
            </div>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Pasar+Semenyih+43500+Selangor"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700 shrink-0 hover:bg-amber-100 transition-colors"
              title="Navigasi ke Pasar Semenyih"
            >
              <Navigation className="w-4 h-4" />
            </a>
          </div>

          {/* Search Postcode Form */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              Semak Caj Penghantaran Mengikut Poskod:
            </label>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setHasSearched(false);
                  }}
                  placeholder="Masukkan poskod (43500 Semenyih, 43700 Beranang, 43000 Kajang)"
                  className="w-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:bg-white dark:focus:bg-stone-800 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0"
              >
                Semak
              </button>
            </form>
          </div>

          {/* Search Result Banner */}
          {hasSearched && (
            <div>
              {selectedResult ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
                        Liputan Aktif
                      </span>
                      <h4 className="font-extrabold text-stone-900 dark:text-white text-sm sm:text-base">
                        {selectedResult.city}, {selectedResult.state} ({selectedResult.postcode})
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                        Caj Hantar: <strong>RM {selectedResult.deliveryFee.toFixed(2)}</strong> • {selectedResult.estimatedHours}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelect(selectedResult)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0 cursor-pointer shadow-xs"
                  >
                    Pilih Poskod Ini
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 flex items-center gap-3 animate-fade-in">
                  <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div className="text-xs">
                    <strong className="block text-sm text-stone-900 dark:text-white">
                      Poskod di Luar Zon Penghantaran Semasa
                    </strong>
                    <span className="text-stone-700 dark:text-stone-300">
                      Buat masa ini liputan penghantaran aktif meliputi <strong>Semenyih (43500)</strong>, <strong>Beranang (43700)</strong>, dan <strong>Kajang (43000)</strong>. Anda juga boleh memilih <strong>Self-Pickup</strong> di GA 59, Pasar Semenyih atau WhatsApp kami di <strong>011-11135503</strong>.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active 3 Coverage Zones Listing */}
          <div>
            <span className="text-xs font-extrabold text-stone-900 dark:text-white uppercase tracking-wider block mb-2.5">
              3 Zon Poskod Penghantaran Khairul Fresh Food:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {COVERAGE_AREAS.map((item) => (
                <div
                  key={item.postcode}
                  onClick={() => handleSelect(item)}
                  className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950 px-2 py-0.5 rounded-md text-xs">
                        {item.postcode}
                      </span>
                      <span className="font-extrabold text-xs text-stone-900 dark:text-white">
                        RM {item.deliveryFee.toFixed(2)}
                      </span>
                    </div>
                    <h5 className="font-bold text-sm text-stone-900 dark:text-white mt-1">
                      {item.city}
                    </h5>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {item.state}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-200/80 dark:border-stone-700/80 flex items-center justify-between text-[10px]">
                    <span className="text-stone-500">{item.estimatedHours}</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">Pilih ✓</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 shrink-0 flex items-center justify-between">
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            Khairul Fresh Food • WhatsApp: 011-11135503
          </span>
          <button
            onClick={onClose}
            className="bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 dark:hover:bg-stone-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
