import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const CustomerReviews: React.FC = () => {
  const { t, isEn } = useLanguage();

  const reviews = [
    {
      name: 'Puan Halimah Saad',
      role: isEn ? 'Homemaker, Bandar Rinching, Semenyih' : 'Suri Rumah, Bandar Rinching, Semenyih',
      rating: 5,
      date: isEn ? '3 days ago' : '3 hari lepas',
      comment: isEn
        ? 'Extremely satisfied! I used to wake up at 6am to go to the wet market. Now I order before bed and the rider arrives at 9am. Chicken is icy fresh, fat trimmed, and neatly cut into 8 pieces.'
        : 'Sangat berpuas hati! Dulu kena bangun seawal 6 pagi pergi pasar basah, sekarang pesan malam sebelum tidur, jam 9 pagi rider dah hantar depan pintu. Ayam sejuk berais, bersih siap buang lemak & potong 8 elok.',
      purchasedItem: isEn ? 'Fresh Whole Chicken Grade A (8 Cuts)' : 'Ayam Bulat Gred A (Potong 8)',
    },
    {
      name: 'Encik Hafizuddin',
      role: isEn ? 'Restaurant Owner, Kajang Utama' : 'Pengusaha Kedai Makan, Kajang Utama',
      rating: 5,
      date: isEn ? 'Yesterday' : 'Semalam',
      comment: isEn
        ? 'The 5-bird wholesale package is great value for my eatery in Kajang. The 1.6kg weight is consistent, the meat stays tender and firm when cooked. WhatsApp customer support is also super responsive.'
        : 'Pek borong 5 ekor memang jimat untuk kedai makan saya di Kajang. Saiz berat 1.6kg sangat konsisten, isi ayam tak lembik dan bila dikukus dagingnya kekal berkilat. Khidmat pelanggan WhatsApp pun sangat cepat balas.',
      purchasedItem: isEn ? 'Catering & Commercial Pack (5 Birds)' : 'Pakej Peniaga & Katering (5 Ekor)',
    },
    {
      name: 'Puan Siti Noraini',
      role: isEn ? 'Working Mother, Taman Seri Beranang' : 'Ibu Bekerja, Taman Seri Beranang',
      rating: 5,
      date: isEn ? 'Last week' : 'Minggu lepas',
      comment: isEn
        ? 'The vacuum-sealed boneless breast fillet is a lifesaver for our weekly meal prep. The poultry stays fresh in the freezer without any odors. Most importantly 100% Certified Halal and pristine.'
        : 'Dada fillet tanpa tulang dengan pek vakum penyelamat meal-prep keluarga kami di Beranang. Ayam tahan segar dalam peti sejuk dan tak ada bau peti langsung. Yang paling penting 100% Halal Diiktiraf dan bersih.',
      purchasedItem: isEn ? 'Boneless Chicken Breast Fillet (Vacuum 1kg)' : 'Dada Ayam Fillet (Pek Vakum 1kg)',
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-stone-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-center gap-1 text-amber-400 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
            <span className="text-stone-900 dark:text-white font-extrabold text-sm ml-1.5">
              4.9 {isEn ? 'out of 5.0 Stars' : 'daripada 5.0 Bintang'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-['Outfit']">
            {t('customerReviewsTitle')}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            {t('customerReviewsSubtitle')}
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-stone-50 dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col justify-between hover:border-emerald-500/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-400">{rev.date}</span>
                </div>

                <div className="relative mb-4">
                  <Quote className="w-6 h-6 text-stone-300 dark:text-stone-700 absolute -top-2 -left-2 opacity-50" />
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed relative z-10 italic">
                    "{rev.comment}"
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    {rev.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-white text-xs">
                      {rev.name}
                    </h4>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
                      {rev.role}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/40 w-fit">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{isEn ? 'Verified Purchase' : 'Belian Disahkan'}: {rev.purchasedItem}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
