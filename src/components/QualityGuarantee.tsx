import React from 'react';
import { 
  ShieldCheck, 
  Snowflake, 
  Scissors, 
  Tag, 
  HeartHandshake, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const QualityGuarantee: React.FC = () => {
  const { t, isEn } = useLanguage();

  const guarantees = [
    {
      icon: ShieldCheck,
      color: 'emerald',
      title: '100% Halal',
      subtitle: 'Disahkan & Sembelihan Syarak',
      desc: isEn 
        ? 'Fresh poultry certified 100% Halal, thoroughly cleaned with purified running water and handled with strict hygiene.'
        : 'Ayam segar disahkan 100% Halal Diiktiraf, disembelih harian mengikut hukum syarak dan dibersihkan rapi dengan air suci mengalir.',
    },
    {
      icon: Snowflake,
      color: 'blue',
      title: 'Ayam Segar',
      subtitle: 'Suhu Sejuk Dingin (0°C – 4°C)',
      desc: isEn
        ? 'Never months-old frozen stock. Early morning fresh supply from Pasar Semenyih maintained in a continuous cold chain.'
        : 'Bukan ayam sejuk beku lama. Bekalan segar harian awal pagi dari Pasar Semenyih yang dikekalkan dalam rantaian dingin sejuk.',
    },
    {
      icon: Tag,
      color: 'rose',
      title: 'Harga Berpatutan',
      subtitle: 'Harga Direct Pasar Semenyih',
      desc: isEn
        ? 'Direct market pricing with weekly promotions starting from RM9.90/kg. Honest weight without hidden fees.'
        : 'Harga terus dari pasar dengan tawaran promo harian dari RM9.90/kg. Timbangan jujur dan tiada caj tersembunyi.',
    },
    {
      icon: Scissors,
      color: 'amber',
      title: 'Potong & Cuci Percuma',
      subtitle: 'Gaya Potongan Mengikut Menu Anda',
      desc: isEn
        ? 'Choose 4, 8, 12, 16 cuts or minced. Our master butchers prepare your chicken cleanly at zero extra cost.'
        : 'Pilih potong 4, 8, 12, 16 atau cincang—tukang potong mahir kami sediakan siap potong & cuci secara 100% PERCUMA.',
    },
  ];

  return (
    <section id="why-choose-us" className="py-12 sm:py-16 bg-white dark:bg-stone-900 border-y border-stone-100 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider mb-2 border border-emerald-200/80 dark:border-emerald-800">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Jaminan Kepercayaan Pelanggan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 dark:text-white font-['Outfit'] tracking-tight">
            Kenapa Pilih <span className="text-emerald-600 dark:text-emerald-400">Khairul Fresh Food</span>?
          </h2>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 font-medium">
            Standard kualiti pasar harian yang dipercayai oleh ribuan keluarga dan pengusaha makanan di Semenyih.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {guarantees.map((g, idx) => {
            const Icon = g.icon;
            return (
              <div 
                key={idx}
                className="bg-stone-50/80 dark:bg-stone-800/60 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-700/80 shadow-xs hover:border-emerald-500/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${
                    g.color === 'emerald' ? 'bg-emerald-600 text-white' :
                    g.color === 'blue' ? 'bg-blue-600 text-white' :
                    g.color === 'amber' ? 'bg-amber-500 text-stone-950 font-bold' :
                    'bg-rose-600 text-white'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-stone-900 dark:text-white text-lg mb-0.5 font-['Outfit']">
                    {g.title}
                  </h3>
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                    {g.subtitle}
                  </p>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
                    {g.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-200/60 dark:border-stone-700 flex items-center gap-1.5 text-[11px] font-extrabold text-stone-800 dark:text-stone-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Dijamin Segar & Clean Standard</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

