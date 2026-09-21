import React, { useState } from 'react';
import { 
  X, 
  Calculator, 
  Users, 
  Utensils, 
  Scissors, 
  Sparkles, 
  ShoppingBag, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { ChickenCutId, Product } from '../types';
import { dataStorageService } from '../services/dataStorage';

interface PartyCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBulkToCart: (product: Product, quantity: number, cut: ChickenCutId) => void;
  products?: Product[];
}

interface MenuType {
  id: string;
  name: string;
  recommendedCut: ChickenCutId;
  cutLabel: string;
  portionsPerChicken: number;
  description: string;
}

const MENU_TYPES: MenuType[] = [
  {
    id: 'ayam-masak-merah-kenduri',
    name: 'Ayam Masak Merah / Kenduri Kahwin',
    recommendedCut: 'potong-12',
    cutLabel: 'Potong 12',
    portionsPerChicken: 10, // 10 pax per chicken comfortably
    description: 'Saiz potongan standard kenduri Melayu, bersalut kuah merah pekat',
  },
  {
    id: 'nasi-ayam-hainan',
    name: 'Nasi Ayam Hainan / Ayam Percik',
    recommendedCut: 'potong-4',
    cutLabel: 'Potong 4 (Suku)',
    portionsPerChicken: 4, // 1/4 chicken per pax
    description: 'Bahagian besar montok suku ayam untuk hidangan lengkap set pinggan',
  },
  {
    id: 'rendang-ayam-raya',
    name: 'Rendang Ayam / Gulai Kawah Jamuan',
    recommendedCut: 'potong-12',
    cutLabel: 'Potong 12',
    portionsPerChicken: 10,
    description: 'Daging meresap santan dan rempah kerisik dengan sekata',
  },
  {
    id: 'sup-soto-kenduri',
    name: 'Sup Ayam Halia / Soto Ayam Jamuan',
    recommendedCut: 'potong-16',
    cutLabel: 'Potong 16 (Kecil)',
    portionsPerChicken: 14,
    description: 'Potongan kecil empuk sempurna untuk mangkuk soto atau bihun sup',
  },
  {
    id: 'bbq-bakar-arang',
    name: 'BBQ / Ayam Bakar Madu Majlis',
    recommendedCut: 'potong-4',
    cutLabel: 'Potong 4 atau Belah 2',
    portionsPerChicken: 4,
    description: 'Sangat mudah diperap dan dibakar atas arang tanpa isi kering',
  },
];

export const PartyCalculatorModal: React.FC<PartyCalculatorModalProps> = ({
  isOpen,
  onClose,
  onAddBulkToCart,
  products: propProducts,
}) => {
  const [pax, setPax] = useState<number>(50);
  const [selectedMenuId, setSelectedMenuId] = useState<string>('ayam-masak-merah-kenduri');
  const [bufferPercentage, setBufferPercentage] = useState<number>(10); // 10% safety buffer

  if (!isOpen) return null;

  const selectedMenu = MENU_TYPES.find((m) => m.id === selectedMenuId) || MENU_TYPES[0];

  // Calculations
  const baseChickens = Math.ceil(pax / selectedMenu.portionsPerChicken);
  const bufferChickens = Math.ceil(baseChickens * (bufferPercentage / 100));
  const totalChickensNeeded = baseChickens + bufferChickens;
  const estimatedKg = (totalChickensNeeded * 1.65).toFixed(1);

  // Price calculation based on standard chicken price or bulk tier (dynamically tracks live product prices)
  const liveProducts = (propProducts && propProducts.length > 0) ? propProducts : dataStorageService.getProducts();
  const standardChicken = liveProducts.find((p) => p.id === 'ayam-segar-standard') || liveProducts[0] || PRODUCTS[0];
  const komboJimat = liveProducts.find((p) => p.id === 'kombo-keluarga') || PRODUCTS.find((p) => p.id === 'kombo-keluarga');
  const wholesalePricePer3 = komboJimat ? komboJimat.price : 52.00; // Kombo Jimat 3 Ekor
  
  // If > 3 chickens, calculate with wholesale savings
  const wholesaleBundles = Math.floor(totalChickensNeeded / 3);
  const looseChickens = totalChickensNeeded % 3;
  const standardPrice = standardChicken.price;

  const estimatedCost = (wholesaleBundles * wholesalePricePer3) + (looseChickens * standardPrice);
  const normalCost = totalChickensNeeded * 21.00; // compared to market price
  const estimatedSavings = Math.max(0, normalCost - estimatedCost);

  const handleApplyToCart = () => {
    onAddBulkToCart(standardChicken, totalChickensNeeded, selectedMenu.recommendedCut);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 flex flex-col max-h-[92vh]"
        role="dialog"
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-stone-900 text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-800/70 text-stone-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg">
              <Calculator className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-amber-300 tracking-wider">
                Kalkulator Kenduri, Jamuan & Katering
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-['Outfit']">
                Kira Keperluan Ayam Majlis Anda
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 mt-2">
            Elakkan membazir atau kekurangan lauk. Masukkan bilangan tetamu dan kami kirakan jumlah ekor, cadangan potongan dan anggaran kos borong.
          </p>
        </div>

        {/* Scrollable Form */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-stone-800">
          
          {/* STEP 1: BILANGAN TETAMU */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs sm:text-sm font-extrabold text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>1. Bilangan Tetamu / Jemputan (Pax)</span>
              </label>
              <span className="text-base font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                {pax} Orang
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="500"
              step="5"
              value={pax}
              onChange={(e) => setPax(Number(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
            />

            {/* Quick quick preset buttons */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              {[20, 50, 80, 100, 150, 200, 300].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPax(preset)}
                  className={`px-3 py-1 text-xs rounded-lg font-bold transition-colors cursor-pointer ${
                    pax === preset
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {preset} pax
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: PILIH MENU MAJLIS */}
          <div>
            <label className="text-xs sm:text-sm font-extrabold text-stone-900 uppercase tracking-wide flex items-center gap-1.5 mb-2.5">
              <Utensils className="w-4 h-4 text-emerald-600" />
              <span>2. Jenis Hidangan & Menu</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {MENU_TYPES.map((menu) => {
                const isSelected = selectedMenuId === menu.id;
                return (
                  <div
                    key={menu.id}
                    onClick={() => setSelectedMenuId(menu.id)}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-stone-900 text-xs sm:text-sm">
                        {menu.name}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">{menu.description}</p>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Scissors className="w-3 h-3" />
                        Disyorkan: {menu.cutLabel}
                      </span>
                      <span className="text-stone-500">
                        ~{menu.portionsPerChicken} porsi / ekor
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3: BUFFER PERSATUAN */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
            <span className="text-stone-700 font-medium">
              Tambah Lebihan Keselamatan (Buffer Tambahan):
            </span>
            <div className="flex items-center gap-2">
              {[5, 10, 15].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setBufferPercentage(pct)}
                  className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                    bufferPercentage === pct
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-stone-600 border border-stone-300'
                  }`}
                >
                  +{pct}%
                </button>
              ))}
            </div>
          </div>

          {/* CALCULATION RESULT CARD */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-stone-950 text-white shadow-xl">
            <div className="flex items-center justify-between border-b border-emerald-800 pb-3 mb-4">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Cadangan Pembelian FreshAyam Direct
              </span>
              <span className="text-xs bg-emerald-700/60 px-2 py-0.5 rounded-full text-emerald-200 font-medium">
                Pakej Borong Jimat
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[11px] text-stone-400 block mb-1">
                  Jumlah Ekor Diperlukan:
                </span>
                <span className="text-2xl sm:text-3xl font-black text-amber-400">
                  {totalChickensNeeded}
                </span>
                <span className="text-[10px] text-emerald-300 block">
                  Ekor Ayam Gred A
                </span>
              </div>

              <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[11px] text-stone-400 block mb-1">
                  Anggaran Berat Bersih:
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white">
                  ~{estimatedKg}
                </span>
                <span className="text-[10px] text-stone-300 block">Kilogram (kg)</span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-2.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[11px] text-stone-400 block mb-1">
                  Potongan Disyorkan:
                </span>
                <span className="text-lg font-bold text-emerald-300 block">
                  {selectedMenu.cutLabel}
                </span>
                <span className="text-[10px] text-emerald-400">Potong Percuma</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-stone-400">Anggaran Jumlah Kos Borong: </span>
                <strong className="text-base text-white font-extrabold ml-1">
                  RM {estimatedCost.toFixed(2)}
                </strong>
                {estimatedSavings > 0 && (
                  <span className="text-emerald-400 font-bold ml-2">
                    (Jimat RM{estimatedSavings.toFixed(2)})
                  </span>
                )}
              </div>
              <span className="text-[11px] text-emerald-200">
                *Penghantaran Segar Percuma Termasuk
              </span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 shrink-0 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-800 text-xs font-bold px-3 py-2 cursor-pointer"
          >
            Tutup
          </button>

          <button
            onClick={handleApplyToCart}
            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-md shadow-emerald-700/20 flex items-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Masukkan {totalChickensNeeded} Ekor ke Troli ({selectedMenu.cutLabel})</span>
          </button>
        </div>

      </div>
    </div>
  );
};
