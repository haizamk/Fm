import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  Scissors, 
  PhoneCall, 
  UtensilsCrossed, 
  RefreshCw 
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'freshness' | 'cutting' | 'delivery' | 'order';
  question: string;
  answer: string;
  badge?: string;
  highlights?: string[];
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'freshness',
    badge: 'Kesegaran & Halal',
    question: 'Bagaimanakah tahap kesegaran ayam sebelum sampai ke rumah saya?',
    answer: 'Ayam kami dibekalkan segar pada awal pagi setiap hari dengan jaminan 100% Halal Diiktiraf. Di gerai kami di Pasar Semenyih, ayam dicuci bersih, dipotong segar mengikut permintaan anda, dan disimpan dalam rantaian dingin (0°C - 4°C) sebelum dihantar pada hari yang sama. Ini bukan ayam beku lama (frozen) pasar raya.',
    highlights: ['Bekalan Segar Awal Pagi Setiap Hari', 'Rantaian Dingin 0°C – 4°C', '100% Halal Diiktiraf']
  },
  {
    id: 'faq-2',
    category: 'freshness',
    badge: 'Bebas Bahan Kimia',
    question: 'Adakah ayam Khairul FRESH Food mengandungi suntikan hormon atau klorin?',
    answer: 'Sama sekali TIDAK. Kami bekerjasama secara langsung dengan penternak kontrak tempatan yang mematuhi amalan penternakan baik (myGAP). Ayam diternak bebas daripada suntikan hormon tumbesaran, sisa antibiotik terlarang, dan dicuci tanpa sebarang bahan peluntur atau klorin berlebihan.',
    highlights: ['Bebas Hormon Tumbesaran', 'Penternakan myGAP', 'Tanpa Peluntur Klorin']
  },
  {
    id: 'faq-3',
    category: 'cutting',
    badge: 'Khidmat Potongan',
    question: 'Bolehkah saya minta potongan khas seperti potong kenduri atau buang kulit?',
    answer: 'Boleh! Kami menyediakan khidmat pemotongan percuma untuk setiap pesanan. Anda boleh memilih jenis potongan: Seekor Bulat, Potong 4, Potong 8, Potong 12, Potong 16 (khas kenduri), Potong Sup / Kecil, Potong Butterfly (BBQ), atau Dibuang Kulit & Lemak Lebih. Anda juga boleh menulis nota khas semasa checkout.',
    highlights: ['Pilihan Potong 4 hingga 16', 'Khidmat Buang Kulit Percuma', 'Sedia Dicuci Bersih']
  },
  {
    id: 'faq-4',
    category: 'cutting',
    badge: 'Pembersihan',
    question: 'Adakah ayam telah dibersihkan daripada sisa darah, hempedu dan bulu halus?',
    answer: 'Ya, tukang potong mahir kami akan mencuci rongga dalaman ayam, membuang hempedu (supaya tidak pahit), membersihkan sisa darah serta mencabut bulu-bulu halus sebelum dibungkus ke dalam pek makanan kebersihan tinggi.',
    highlights: ['Rongga Dalaman Dicuci', 'Hempedu & Lemak Lebihan Dibuang', 'Pek Makanan Kebersihan Rapi']
  },
  {
    id: 'faq-5',
    category: 'delivery',
    badge: 'Penghantaran',
    question: 'Bagaimanakah ayam dibungkus supaya kekal segar semasa proses penghantaran?',
    answer: 'Kami menggunakan pek makanan tertutup rapi yang dimasukkan ke dalam beg penebat sejuk khas bersama pek ais gel beku (ice gel pack). Suhu ayam sentiasa kekal di bawah 4°C sepanjang perjalanan dari pusat agihan hingga ke pintu pagar rumah anda.',
    highlights: ['Pek Makanan Food-Grade', 'Insulated Cool Bag & Ice Gel', 'Jaminan Dingin Sampai Pintu']
  },
  {
    id: 'faq-6',
    category: 'delivery',
    badge: 'Slot Masa',
    question: 'Apakah pilihan waktu penghantaran yang boleh saya pilih?',
    answer: 'Anda boleh memilih slot penghantaran mengikut keselesaan anda: Slot Pagi (8:30 AM – 12:30 PM) sesuai untuk masak tengah hari, Slot Petang (2:30 PM – 6:30 PM) untuk santapan malam, atau Slot Malam (6:30 PM – 9:00 PM) untuk anda yang pulang kerja lewat.',
    highlights: ['Slot Pagi: 8:30 AM – 12:30 PM', 'Slot Petang: 2:30 PM – 6:30 PM', 'Slot Malam: 6:30 PM – 9:00 PM']
  },
  {
    id: 'faq-7',
    category: 'delivery',
    badge: 'Jaminan 100%',
    question: 'Bagaimana jika ayam yang sampai tidak segar, berbau atau salah potong?',
    answer: 'Kami menawarkan "Jaminan 100% Kepuasan & Kesegaran". Jika anda mendapati ayam berbau tidak menyenangkan, rosak, atau salah potong, sila ambil foto dan WhatsApp kami dalam tempoh 12 jam. Kami akan gantikan ayam baharu secara percuma atau pulangkan wang anda serta-merta tanpa banyak soal.',
    highlights: ['Jaminan Gantian Segera', 'Pulangan Wang 100%', 'Bantuan Pantas WhatsApp']
  },
  {
    id: 'faq-8',
    category: 'order',
    badge: 'Kenduri & Katering',
    question: 'Adakah diskaun khas disediakan untuk tempahan kenduri, majlis kahwin atau kedai makan?',
    answer: 'Ya! Untuk tempahan pukal melebihi 30 ekor ayam (atau 50kg bahagian ayam), kami menawarkan harga borong istimewa, penghantaran percuma ke dewan majlis, serta khidmat pembungkusan berlabel mengikut menu katering anda. Gunakan Kalkulator Kenduri kami atau hubungi talian WhatsApp borong kami.',
    highlights: ['Harga Borong Jimat', 'Pek Khas Mengikut Menu', 'Penghantaran Tepat Masa Kenduri']
  }
];

export const FAQAccordion: React.FC = () => {
  const [isSectionOpen, setIsSectionOpen] = useState<boolean>(false);
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'freshness' | 'cutting' | 'delivery' | 'order'>('all');

  const toggleItem = (id: string) => {
    setOpenIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenAll = () => {
    setOpenIds(FAQ_DATA.map((item) => item.id));
  };

  const handleCloseAll = () => {
    setOpenIds([]);
  };

  const filteredFaqs = activeCategory === 'all'
    ? FAQ_DATA
    : FAQ_DATA.filter((item) => item.category === activeCategory);

  return (
    <section className="py-10 sm:py-16 bg-stone-50/80 dark:bg-stone-900/60 border-t border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Header with Expand / Collapse Button */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2.5 border border-emerald-200 dark:border-emerald-800">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Soalan Lazim & Panduan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 dark:text-white font-['Outfit'] tracking-tight">
            Soalan Lazim (FAQ) Pelanggan
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            Dapatkan jawapan telus mengenai kualiti ayam segar harian, khidmat potong percuma, jaminan rantaian sejuk dingin, dan polisi pesanan Khairul FRESH Food.
          </p>

          <div className="mt-4">
            <button
              onClick={() => setIsSectionOpen(!isSectionOpen)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-stone-800 border-2 border-emerald-600/30 hover:border-emerald-600 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <span>{isSectionOpen ? 'Sembunyikan Soalan Lazim (FAQ)' : 'Papar Soalan Lazim (FAQ)'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isSectionOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Expandable Content (Default Hidden) */}
        {isSectionOpen && (
          <div className="animate-fade-in space-y-6">
            {/* Filter Tabs & Toggle Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
              }`}
            >
              Semua Soalan ({FAQ_DATA.length})
            </button>
            <button
              onClick={() => setActiveCategory('freshness')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'freshness'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Kesegaran & Halal</span>
            </button>
            <button
              onClick={() => setActiveCategory('cutting')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'cutting'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
              }`}
            >
              <Scissors className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Kaedah Potongan</span>
            </button>
            <button
              onClick={() => setActiveCategory('delivery')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'delivery'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Penghantaran</span>
            </button>
            <button
              onClick={() => setActiveCategory('order')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'order'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Kenduri & Katering</span>
            </button>
          </div>

          {/* Quick Expand/Collapse Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleOpenAll}
              className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Buka Semua
            </button>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <button
              onClick={handleCloseAll}
              className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Tutup Semua
            </button>
          </div>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            return (
              <div
                key={faq.id}
                id={faq.id}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/70 dark:hover:bg-stone-800/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 text-xs font-bold">
                      ?
                    </span>
                    <div>
                      {faq.badge && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-md inline-block mb-1 border border-emerald-200/50 dark:border-emerald-800/50">
                          {faq.badge}
                        </span>
                      )}
                      <h3 className="font-extrabold text-stone-900 dark:text-white text-sm sm:text-base leading-snug">
                        {faq.question}
                      </h3>
                    </div>
                  </div>

                  <div className={`p-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Collapsible Content */}
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-stone-100 dark:border-stone-800/80 animate-fade-in text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                    <p className="mb-3">
                      {faq.answer}
                    </p>

                    {faq.highlights && faq.highlights.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-dashed border-stone-200 dark:border-stone-800 flex flex-wrap gap-2">
                        {faq.highlights.map((h, i) => (
                          <div
                            key={i}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-lg"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Help Card */}
        <div className="mt-8 p-5 sm:p-6 bg-emerald-800 text-white rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base">
                Ada sebarang soalan lain atau perlukan bantuan khusus?
              </h4>
              <p className="text-xs text-emerald-100 mt-0.5">
                Khidmat sokongan pelanggan kami sedia membantu anda setiap hari dari jam 7:00 pagi hingga 10:00 malam.
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/601128568920?text=Salam%20FreshAyam%20Direct,%20saya%20ada%20pertanyaan%20mengenai%20pesanan%20ayam%20segar..."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white hover:bg-stone-100 text-emerald-900 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl transition-colors shrink-0 flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <PhoneCall className="w-4 h-4 text-emerald-700" />
            <span>Tanya di WhatsApp (011-2856 8920)</span>
          </a>
        </div>
      </div>
    )}

      </div>
    </section>
  );
};
