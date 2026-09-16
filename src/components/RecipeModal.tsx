import React, { useState } from 'react';
import { CHICKEN_RECIPES, STORAGE_TIPS, RecipeItem } from '../data/recipes';
import { 
  X, 
  BookOpen, 
  Clock, 
  Users, 
  ChefHat, 
  Scissors, 
  Sparkles, 
  ShieldCheck, 
  ThermometerSnowflake, 
  PackageCheck 
} from 'lucide-react';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCutRecipe: (cutType: string) => void;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  onSelectCutRecipe,
}) => {
  const [activeTab, setActiveTab] = useState<'recipes' | 'storage'>('recipes');
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeItem>(CHICKEN_RECIPES[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 flex flex-col max-h-[92vh]"
        role="dialog"
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-stone-900 text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-800/70 text-stone-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-amber-300 tracking-wider">
                Dapur & Panduan FreshAyam
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-['Outfit']">
                Koleksi Resepi & Tips Penyimpanan Segar
              </h2>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('recipes')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'recipes'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              Resepi Ayam Pilihan (3 Resipi Istimewa)
            </button>
            <button
              onClick={() => setActiveTab('storage')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'storage'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              Tips Simpan Tahan Segar & Higienik
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-stone-800">
          
          {activeTab === 'recipes' ? (
            <div className="space-y-6">
              
              {/* Recipe Selector Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {CHICKEN_RECIPES.map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() => setSelectedRecipe(rec)}
                    className={`p-3 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                      selectedRecipe.id === rec.id
                        ? 'border-amber-600 bg-amber-50/50 shadow-xs'
                        : 'border-stone-200 bg-stone-50/40 hover:border-stone-300'
                    }`}
                  >
                    <span className="text-xs font-bold text-stone-900 block truncate">
                      {rec.title}
                    </span>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      {rec.prepTime} • {rec.servings}
                    </span>
                  </button>
                ))}
              </div>

              {/* Selected Recipe Detail Card */}
              <div className="border border-stone-200 rounded-3xl overflow-hidden bg-white shadow-xs">
                <div className="relative h-48 sm:h-64 overflow-hidden bg-stone-100">
                  <img
                    src={selectedRecipe.image}
                    alt={`${selectedRecipe.title} - Resipi Masakan Ayam Segar Halal Pasar Semenyih | Khairul FRESH Food`}
                    title={`${selectedRecipe.title} - Resipi Masakan Ayam Segar Halal Pasar Semenyih | Khairul FRESH Food`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      Cadangan Potongan: {selectedRecipe.recommendedCut}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black font-['Outfit']">
                      {selectedRecipe.title}
                    </h3>
                    <p className="text-xs text-stone-300 mt-0.5 line-clamp-1">
                      {selectedRecipe.subtitle}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-5">
                  {/* Meta chips */}
                  <div className="flex flex-wrap items-center gap-3 text-xs pb-3 border-b border-stone-100">
                    <span className="flex items-center gap-1 text-stone-600">
                      <Clock className="w-4 h-4 text-amber-600" />
                      Masa: <strong>{selectedRecipe.prepTime}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-stone-600">
                      <Users className="w-4 h-4 text-emerald-600" />
                      Kuantiti: <strong>{selectedRecipe.servings}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-stone-600">
                      <ChefHat className="w-4 h-4 text-blue-600" />
                      Tahap: <strong>{selectedRecipe.difficulty}</strong>
                    </span>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <h4 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider mb-2">
                      Bahan-Bahan Diperlukan:
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-stone-700">
                      {selectedRecipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Steps */}
                  <div>
                    <h4 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider mb-2">
                      Langkah-Langkah Memasak:
                    </h4>
                    <ol className="space-y-2 text-xs text-stone-700">
                      {selectedRecipe.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 text-[11px]">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Chef Secret Tip */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-amber-950">Petua Rahsia Tukang Masak:</strong>
                      <span>{selectedRecipe.chefTip}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs text-stone-600 leading-relaxed">
                Ayam segar Khairul FRESH Food tidak pernah dibekukan berbulan-bulan. Ia dibekalkan segar setiap pagi dan disimpan pada rantaian suhu sejuk sejuk 0°C – 4°C. Berikut adalah panduan menjaga kualiti terbaik di rumah anda:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {STORAGE_TIPS.map((tip, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      {idx === 0 ? <ThermometerSnowflake className="w-5 h-5" /> :
                       idx === 1 ? <PackageCheck className="w-5 h-5" /> :
                       idx === 2 ? <Scissors className="w-5 h-5" /> :
                       <ShieldCheck className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-xs sm:text-sm">
                        {tip.title}
                      </h4>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {tip.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 shrink-0 flex items-center justify-between">
          <span className="text-xs text-stone-500 hidden sm:inline">
            Semua ayam dibekalkan segar dengan 100% Halal Diiktiraf
          </span>
          <button
            onClick={onClose}
            className="bg-stone-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
