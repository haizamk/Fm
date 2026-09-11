import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export const CustomerReviews: React.FC = () => {
  const reviews = [
    {
      name: 'Puan Halimah Saad',
      role: 'Suri Rumah, Bandar Rinching, Semenyih',
      rating: 5,
      date: '3 hari lepas',
      comment:
        'Sangat berpuas hati! Dulu kena bangun seawal 6 pagi pergi pasar basah, sekarang pesan malam sebelum tidur, jam 9 pagi rider dah hantar depan pintu. Ayam sejuk berais, bersih siap buang lemak & potong 8 elok.',
      purchasedItem: 'Ayam Bulat Gred A (Potong 8)',
    },
    {
      name: 'Encik Hafizuddin',
      role: 'Pengusaha Kedai Makan, Kajang Utama',
      rating: 5,
      date: 'Semalam',
      comment:
        'Pek borong 5 ekor memang jimat untuk kedai makan saya di Kajang. Saiz berat 1.6kg sangat konsisten, isi ayam tak lembik dan bila dikukus dagingnya kekal berkilat. Khidmat pelanggan WhatsApp pun sangat cepat balas.',
      purchasedItem: 'Pakej Peniaga & Katering (5 Ekor)',
    },
    {
      name: 'Puan Siti Noraini',
      role: 'Ibu Bekerja, Taman Seri Beranang',
      rating: 5,
      date: 'Minggu lepas',
      comment:
        'Dada fillet tanpa tulang dengan pek vakum penyelamat meal-prep keluarga kami di Beranang. Ayam tahan segar dalam peti sejuk dan tak ada bau peti langsung. Yang paling penting 100% Halal Diiktiraf dan bersih.',
      purchasedItem: 'Dada Ayam Fillet (Pek Vakum 1kg)',
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
              4.9 daripada 5.0 Bintang
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-['Outfit']">
            Kata Pelanggan Khairul FRESH Food
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            Ayam segar berkualiti dihantar dengan pantas ke kediaman & restoran di kawasan Semenyih, Kajang dan Beranang.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-stone-50 dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-400 dark:text-stone-500">{rev.date}</span>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-stone-200 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-stone-900 dark:text-white">
                      {rev.name}
                    </h4>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
                      {rev.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Pembeli Sah</span>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-stone-500 dark:text-stone-400">
                  Membeli: <span className="font-semibold text-stone-700 dark:text-stone-300">{rev.purchasedItem}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
