import React, { useState, useMemo } from 'react';
import { 
  CHICKEN_RECIPES, 
  STORAGE_TIPS, 
  RECIPE_CATEGORIES, 
  RecipeItem 
} from '../data/recipes';
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
  PackageCheck,
  Search,
  Flame,
  CheckCircle2,
  ArrowRight,
  Utensils
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
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeItem>(CHICKEN_RECIPES[0]);

  // Filter recipes based on category and search query
  const filteredRecipes = useMemo(() => {
    return CHICKEN_RECIPES.filter((rec) => {
      const matchCategory = activeCategory === 'all' || rec.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        rec.title.toLowerCase().includes(q) ||
        rec.subtitle.toLowerCase().includes(q) ||
        rec.recommendedCut.toLowerCase().includes(q) ||
        rec.categoryLabel.toLowerCase().includes(q) ||
        (rec.badge && rec.badge.toLowerCase().includes(q)) ||
        rec.ingredients.some(ing => ing.toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-4 sm:my-6 flex flex-col max-h-[94vh]"
        role="dialog"
      >
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-stone-900 text-white p-4 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg shrink-0">
              <BookOpen className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-amber-300 tracking-wider">
                  Dapur & Panduan FreshAyam
                </span>
                <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Flame className="w-3 h-3" /> 18 Resepi Viral & Tradisi
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] mt-0.5">
                Koleksi Resepi Ayam Segar & Panduan Dapur
              </h2>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setActiveTab('recipes')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'recipes'
                  ? 'bg-white text-stone-900 shadow-md'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Resepi Ayam Pilihan ({CHICKEN_RECIPES.length} Resipi)</span>
            </button>
            <button
              onClick={() => setActiveTab('storage')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'storage'
                  ? 'bg-white text-stone-900 shadow-md'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <ThermometerSnowflake className="w-3.5 h-3.5" />
              <span>Tips Simpan Tahan Segar & Higienik</span>
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-3 sm:p-6 overflow-y-auto space-y-5 flex-1 text-stone-800 dark:text-stone-200">
          
          {activeTab === 'recipes' ? (
            <div className="space-y-5">
              
              {/* Filter & Search Bar */}
              <div className="space-y-3 bg-stone-50 dark:bg-stone-800/60 p-3 sm:p-4 rounded-2xl border border-stone-200 dark:border-stone-700/80">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari resepi (Cth: Buttermilk, Gepuk, Sambal Hijau, Air Fryer, Rendang)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-white outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    >
                      Padam
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {RECIPE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                        activeCategory === cat.id
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-400'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipe Selector Horizontal / Grid Cards */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-stone-500 dark:text-stone-400 px-1">
                  <span>PILIH RESEPI ({filteredRecipes.length} DIJUMPAI):</span>
                  <span className="text-[11px] font-normal text-amber-700 dark:text-amber-400">Klik kad untuk lihat ramuan & langkah</span>
                </div>

                {filteredRecipes.length === 0 ? (
                  <div className="p-8 text-center bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-dashed border-stone-200 dark:border-stone-700">
                    <BookOpen className="w-8 h-8 mx-auto text-stone-400 mb-2" />
                    <p className="text-sm font-bold text-stone-700 dark:text-stone-300">Tiada resepi dijumpai untuk carian "{searchQuery}"</p>
                    <button
                      onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                      className="mt-2 text-xs font-bold text-amber-600 dark:text-amber-400 underline cursor-pointer"
                    >
                      Set semula tapisan
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 sm:max-h-64 overflow-y-auto p-1 border border-stone-200/80 dark:border-stone-800 rounded-2xl bg-stone-50/50 dark:bg-stone-900/50">
                    {filteredRecipes.map((rec) => {
                      const isSelected = selectedRecipe.id === rec.id;
                      return (
                        <button
                          key={rec.id}
                          onClick={() => setSelectedRecipe(rec)}
                          className={`p-2.5 rounded-xl text-left border-2 transition-all cursor-pointer flex items-center gap-3 relative ${
                            isSelected
                              ? 'border-amber-600 bg-amber-50/90 dark:bg-amber-950/40 shadow-xs'
                              : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-amber-300'
                          }`}
                        >
                          <img
                            src={rec.image}
                            alt={rec.title}
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 flex-1">
                            {rec.badge && (
                              <span className="text-[9px] font-black uppercase text-amber-700 dark:text-amber-400 block truncate">
                                {rec.badge}
                              </span>
                            )}
                            <span className="text-xs font-black text-stone-900 dark:text-white block truncate">
                              {rec.title}
                            </span>
                            <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate">
                              {rec.prepTime} • {rec.servings}
                            </span>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected Recipe Detail Card */}
              <div className="border border-stone-200 dark:border-stone-700 rounded-3xl overflow-hidden bg-white dark:bg-stone-900 shadow-sm">
                <div className="relative h-48 sm:h-64 overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <img
                    src={selectedRecipe.image}
                    alt={`${selectedRecipe.title} - Resipi Masakan Ayam Segar Halal Pasar Semenyih | Khairul FRESH Food`}
                    title={`${selectedRecipe.title} - Resipi Masakan Ayam Segar Halal Pasar Semenyih | Khairul FRESH Food`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    {selectedRecipe.badge && (
                      <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider">
                        {selectedRecipe.badge}
                      </span>
                    )}
                    <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
                      {selectedRecipe.categoryLabel}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block">
                      Cadangan Potongan: {selectedRecipe.recommendedCut}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black font-['Outfit']">
                      {selectedRecipe.title}
                    </h3>
                    <p className="text-xs text-stone-200 mt-0.5 line-clamp-2">
                      {selectedRecipe.subtitle}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-5">
                  {/* Meta chips & Quick Order CTA */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                        <Clock className="w-4 h-4 text-amber-600" />
                        Masa: <strong>{selectedRecipe.prepTime}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                        <Users className="w-4 h-4 text-emerald-600" />
                        Kuantiti: <strong>{selectedRecipe.servings}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                        <ChefHat className="w-4 h-4 text-blue-600" />
                        Tahap: <strong>{selectedRecipe.difficulty}</strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectCutRecipe(selectedRecipe.cutId || selectedRecipe.recommendedCut);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ml-auto"
                    >
                      <span>Order Ayam Sesuai Resepi Ini</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <h4 className="text-xs font-extrabold text-stone-900 dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Bahan-Bahan Diperlukan:
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-stone-700 dark:text-stone-300">
                      {selectedRecipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-1.5 bg-stone-50 dark:bg-stone-800/50 p-2 rounded-xl border border-stone-100 dark:border-stone-800">
                          <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                          <span>{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Steps */}
                  <div>
                    <h4 className="text-xs font-extrabold text-stone-900 dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Langkah-Langkah Memasak:
                    </h4>
                    <ol className="space-y-2 text-xs text-stone-700 dark:text-stone-300">
                      {selectedRecipe.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 bg-stone-50/70 dark:bg-stone-800/40 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800">
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center shrink-0 text-[11px]">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Chef Secret Tip */}
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-amber-950 dark:text-amber-300">Petua Rahsia Tukang Masak:</strong>
                      <span className="text-amber-900/90 dark:text-amber-300/90 mt-0.5 block leading-relaxed">{selectedRecipe.chefTip}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed bg-amber-50 dark:bg-amber-950/30 p-3 rounded-2xl border border-amber-200 dark:border-amber-800">
                Ayam segar Khairul FRESH Food tidak pernah dibekukan berbulan-bulan. Ia dibekalkan segar setiap pagi dari ladang dan dikekalkan pada suhu sejuk 0°C – 4°C. Berikut adalah panduan menjaga kualiti terbaik di rumah anda:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {STORAGE_TIPS.map((tip, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                      {idx === 0 ? <ThermometerSnowflake className="w-5 h-5" /> :
                       idx === 1 ? <PackageCheck className="w-5 h-5" /> :
                       idx === 2 ? <Scissors className="w-5 h-5" /> :
                       <ShieldCheck className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 dark:text-white text-xs sm:text-sm">
                        {tip.title}
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
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
        <div className="p-4 bg-stone-50 dark:bg-stone-800/80 border-t border-stone-200 dark:border-stone-700 shrink-0 flex items-center justify-between">
          <span className="text-xs text-stone-500 dark:text-stone-400 hidden sm:inline">
            Semua ayam diproses bersih & 100% Halal Diiktiraf di Pasar Awam Semenyih (GA 59)
          </span>
          <button
            onClick={onClose}
            className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer ml-auto"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
