import React from 'react';
import { 
  ShieldCheck, 
  Snowflake, 
  Scissors, 
  RefreshCw, 
  HeartHandshake, 
  CheckCircle2 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const QualityGuarantee: React.FC = () => {
  const { t, isEn } = useLanguage();

  const guarantees = [
    {
      icon: ShieldCheck,
      color: 'emerald',
      title: isEn ? '100% Certified Halal' : '100% Halal Diiktiraf',
      desc: isEn 
        ? 'Fresh poultry certified 100% Halal, thoroughly cleaned with purified running water and handled to top hygiene standards.'
        : 'Bekalan ayam segar disahkan 100% Halal, dibersihkan dengan air mengalir suci dan diproses mengikut piawaian kebersihan tertinggi.',
    },
    {
      icon: Snowflake,
      color: 'blue',
      title: isEn ? 'Chilled Cold Chain (0°C – 4°C)' : 'Suhu Sejuk Dingin (0°C – 4°C)',
      desc: isEn
        ? 'Never months-old frozen storage. We maintain strict cold chain integrity to preserve natural poultry juices and nutrients.'
        : 'Bukan ayam sejuk beku lama berbulan-bulan. Kami mengekalkan rantaian sejuk dingin asli agar jus manis dan khasiat semulajadi daging terpelihara.',
    },
    {
      icon: Scissors,
      color: 'amber',
      title: isEn ? 'Free Custom Cutting' : 'Pilihan Potong & Percuma',
      desc: isEn
        ? 'Save time in your kitchen. Choose 4, 8, 12, 16 cuts or minced—our master butchers prepare it cleanly at zero extra cost.'
        : 'Jimat masa di dapur. Anda pilih potong 4, 8, 12, 16— tukang potong mahir kami sediakan siap tanpa sebarang caj tersembunyi.',
    },
    {
      icon: RefreshCw,
      color: 'rose',
      title: isEn ? 'Instant 1-to-1 Replacement Guarantee' : 'Jaminan Ganti 1-ke-1 Segera',
      desc: isEn
        ? 'If your chicken is not fresh, has odor, or does not match your order, we will replace it immediately or refund 100% no questions asked.'
        : 'Jika ayam yang anda terima tidak segar, berbau atau tidak menepati pesanan, kami ganti baru serta merta atau wang dikembalikan 100% tanpa soal.',
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-stone-50 dark:bg-stone-900/60 border-y border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200 dark:border-emerald-800">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>{t('qualityPledge')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-['Outfit']">
            {t('whyChooseUsTitle')}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            {t('whyChooseUsSubtitle')}
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {guarantees.map((g, idx) => {
            const Icon = g.icon;
            return (
              <div 
                key={idx}
                className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    g.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400' :
                    g.color === 'blue' ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400' :
                    g.color === 'amber' ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400' :
                    'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-stone-900 dark:text-white text-base mb-2">
                    {g.title}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    {g.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Guaranteed Fresh' : 'Dijamin Segar & Bersih'}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
