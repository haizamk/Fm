import React from 'react';
import { Users, ShieldCheck, Truck, Sparkles, Heart } from 'lucide-react';

export const TrustBadgesRow: React.FC = () => {
  const badges = [
    {
      id: 'pelanggan-setia',
      title: 'Ribuan Pelanggan Setia',
      subtitle: 'Terima kasih atas sokongan anda',
      circleBg: 'bg-rose-600',
      icon: <Users className="w-6 h-6 text-white" />,
    },
    {
      id: 'kualiti-dijamin',
      title: 'Kualiti Dijamin',
      subtitle: 'Produk segar dan halal',
      circleBg: 'bg-emerald-600',
      icon: <ShieldCheck className="w-6 h-6 text-white" />,
    },
    {
      id: 'penghantaran-pantas',
      title: 'Penghantaran Pantas',
      subtitle: 'Semenyih dan kawasan sekitar',
      circleBg: 'bg-rose-600',
      icon: <Truck className="w-6 h-6 text-white" />,
    },
    {
      id: 'pilihan-sihat',
      title: 'Pilihan Sihat',
      subtitle: 'Untuk keluarga anda',
      circleBg: 'bg-emerald-600',
      icon: <Heart className="w-6 h-6 text-white" />,
    },
  ];

  return (
    <section id="trust-badges" className="py-12 bg-[#fafaf8] dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {badges.map((b) => (
            <div
              key={b.id}
              className="flex flex-col items-center text-center p-4 rounded-3xl bg-white dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 shadow-xs hover:shadow-md transition-shadow"
            >
              {/* Circular Icon (alternating red and green like reference) */}
              <div className={`w-14 h-14 rounded-full ${b.circleBg} flex items-center justify-center mb-3 shadow-md`}>
                {b.icon}
              </div>

              <h4 className="text-base font-black text-stone-900 dark:text-white font-['Outfit']">
                {b.title}
              </h4>

              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">
                {b.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
