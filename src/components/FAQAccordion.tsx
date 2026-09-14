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
import { useLanguage } from '../context/LanguageContext';
import { getOfficialWhatsAppLink } from '../utils/whatsappHelper';

interface FAQItem {
  id: string;
  category: 'freshness' | 'cutting' | 'delivery' | 'order';
  badge: string;
  badgeEn: string;
  question: string;
  questionEn: string;
  answer: string;
  answerEn: string;
  highlights: string[];
  highlightsEn: string[];
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'freshness',
    badge: 'Kesegaran & Halal',
    badgeEn: 'Freshness & Halal',
    question: 'Bagaimanakah tahap kesegaran ayam sebelum sampai ke rumah saya?',
    questionEn: 'How fresh is the poultry before arriving at my home?',
    answer: 'Ayam kami dibekalkan segar pada awal pagi setiap hari dengan jaminan 100% Halal Diiktiraf. Di gerai kami di Pasar Semenyih, ayam dicuci bersih, dipotong segar mengikut permintaan anda, dan disimpan dalam rantaian dingin (0°C - 4°C) sebelum dihantar pada hari yang sama. Ini bukan ayam beku lama (frozen) pasar raya.',
    answerEn: 'Our poultry is supplied fresh early morning daily with 100% Certified Halal. At our stall in Pasar Semenyih, chicken is thoroughly cleaned, freshly cut to your request, and kept in strict cold chain (0°C - 4°C) before same-day delivery. This is never months-old supermarket frozen stock.',
    highlights: ['Bekalan Segar Awal Pagi Setiap Hari', 'Rantaian Dingin 0°C – 4°C', '100% Halal Diiktiraf'],
    highlightsEn: ['Early Morning Fresh Daily Supply', 'Cold Chain 0°C – 4°C', '100% Certified Halal']
  },
  {
    id: 'faq-2',
    category: 'freshness',
    badge: 'Bebas Bahan Kimia',
    badgeEn: 'Chemical Free',
    question: 'Adakah ayam Khairul FRESH Food mengandungi suntikan hormon atau klorin?',
    questionEn: 'Does Khairul FRESH Food poultry contain growth hormones or chlorine wash?',
    answer: 'Sama sekali TIDAK. Kami bekerjasama secara langsung dengan penternak kontrak tempatan yang mematuhi amalan penternakan baik (myGAP). Ayam diternak bebas daripada suntikan hormon tumbesaran, sisa antibiotik terlarang, dan dicuci tanpa sebarang bahan peluntur atau klorin berlebihan.',
    answerEn: 'Absolutely NOT. We partner directly with vetted local farmers following good agricultural practices (myGAP). Raised free of growth hormone injections, prohibited antibiotics, and washed clean without harsh bleaches or excessive chlorine.',
    highlights: ['Bebas Hormon Tumbesaran', 'Penternakan myGAP', 'Tanpa Peluntur Klorin'],
    highlightsEn: ['No Growth Hormones', 'myGAP Good Farming', 'No Bleach or Chlorine']
  },
  {
    id: 'faq-3',
    category: 'cutting',
    badge: 'Khidmat Potongan',
    badgeEn: 'Butchery Cuts',
    question: 'Bolehkah saya minta potongan khas seperti potong kenduri atau buang kulit?',
    questionEn: 'Can I request custom cuts such as catering pieces or skin removal?',
    answer: 'Boleh! Kami menyediakan khidmat pemotongan percuma untuk setiap pesanan. Anda boleh memilih jenis potongan: Seekor Bulat, Potong 4, Potong 8, Potong 12, Potong 16 (khas kenduri), Potong Sup / Kecil, Potong Butterfly (BBQ), atau Dibuang Kulit & Lemak Lebih. Anda juga boleh menulis nota khas semasa checkout.',
    answerEn: 'Yes! We provide complimentary custom butchery cuts for every order. Choose Whole Bird, 4, 8, 12, 16 cuts (for feasts), soup diced, butterfly BBQ, or skin & excess fat trimmed. You can also specify instructions in the notes.',
    highlights: ['Pilihan Potong 4 hingga 16', 'Khidmat Buang Kulit Percuma', 'Sedia Dicuci Bersih'],
    highlightsEn: ['Free Cuts from 4 to 16', 'Complimentary Skin Trimming', 'Ready Cleaned']
  },
  {
    id: 'faq-4',
    category: 'cutting',
    badge: 'Pembersihan',
    badgeEn: 'Cleaning',
    question: 'Adakah ayam telah dibersihkan daripada sisa darah, hempedu dan bulu halus?',
    questionEn: 'Is the chicken cleaned of blood residue, gallbladder, and fine feathers?',
    answer: 'Ya, tukang potong mahir kami akan mencuci rongga dalaman ayam, membuang hempedu (supaya tidak pahit), membersihkan sisa darah serta mencabut bulu-bulu halus sebelum dibungkus ke dalam pek makanan kebersihan tinggi.',
    answerEn: 'Yes, our master butchers thoroughly flush inner cavity channels, remove gallbladders (to prevent bitterness), clean away blood traces and pluck fine feathers before sanitary packing.',
    highlights: ['Rongga Dalaman Dicuci', 'Hempedu & Lemak Lebihan Dibuang', 'Pek Makanan Kebersihan Rapi'],
    highlightsEn: ['Inner Cavity Flushed', 'Gallbladder & Excess Fat Removed', 'Hygienic Food Packing']
  },
  {
    id: 'faq-5',
    category: 'delivery',
    badge: 'Penghantaran',
    badgeEn: 'Delivery',
    question: 'Kawasan manakah yang diliputi untuk penghantaran dari Pasar Semenyih?',
    questionEn: 'Which areas are covered for delivery from Pasar Semenyih?',
    answer: 'Kami membuat penghantaran meliputi seluruh Semenyih (Bandar Rinching, Setia EcoHill, Eco Majestic), Beranang, Kajang (Prima Saujana, Sungai Chua, Kajang Utama), Bangi, dan sebahagian Cheras Selatan / Putrajaya. Anda boleh menyemak poskod anda di alat semakan poskod di laman ini.',
    answerEn: 'We deliver throughout Semenyih (Bandar Rinching, Setia EcoHill, Eco Majestic), Beranang, Kajang (Prima Saujana, Sungai Chua, Kajang Utama), Bangi, and selected South Cheras / Putrajaya areas. Check your postcode using our coverage checker tool.',
    highlights: ['Semenyih (EcoHill, Eco Majestic, Rinching)', 'Kajang & Bangi', 'Beranang & Cheras Selatan'],
    highlightsEn: ['Semenyih (EcoHill, Eco Majestic, Rinching)', 'Kajang & Bangi', 'Beranang & South Cheras']
  },
  {
    id: 'faq-6',
    category: 'order',
    badge: 'Tempahan Kenduri',
    badgeEn: 'Catering & Bulk',
    question: 'Bagaimana untuk membuat tempahan pukal untuk kenduri, majlis kahwin atau katering?',
    questionEn: 'How do I place bulk orders for catering, weddings, or kenduri events?',
    answer: 'Untuk tempahan melebihi 30 ekor, anda boleh menggunakan alat "Kalkulator Kenduri" di laman ini untuk mengira jumlah berat & potongan, atau terus hubungi WhatsApp kami di 011-11135503 untuk mendapatkan sebut harga borong khas katering.',
    answerEn: 'For orders exceeding 30 birds, use our built-in "Feast Calculator" to estimate portions and cut styles, or contact us directly on WhatsApp at 011-11135503 for special wholesale rates.',
    highlights: ['Kalkulator Kenduri Automatik', 'Harga Borong Rendah', 'Potong 16 Khas Kenduri'],
    highlightsEn: ['Automatic Feast Calculator', 'Special Wholesale Rates', 'Cut 16 Catering Style']
  }
];

export const FAQAccordion: React.FC = () => {
  const { t, isEn } = useLanguage();
  const [activeTab, setActiveTab] = useState<'all' | 'freshness' | 'cutting' | 'delivery' | 'order'>('all');
  const [openIds, setOpenIds] = useState<string[]>(['faq-1', 'faq-3']);

  const toggleItem = (id: string) => {
    setOpenIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleOpenAll = () => {
    setOpenIds(FAQ_DATA.map(f => f.id));
  };

  const handleCloseAll = () => {
    setOpenIds([]);
  };

  const filteredFaqs = activeTab === 'all' 
    ? FAQ_DATA 
    : FAQ_DATA.filter(item => item.category === activeTab);

  return (
    <section className="py-12 sm:py-16 bg-stone-50 dark:bg-stone-900/40 border-t border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200 dark:border-emerald-800">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>{t('faqSectionTitle')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-['Outfit']">
            {t('faqTitle')}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            {t('faqSubtitle')}
          </p>
        </div>

        {/* Category Tabs & Quick Action Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
              }`}
            >
              {isEn ? 'All Questions' : 'Semua Soalan'}
            </button>
            <button
              onClick={() => setActiveTab('freshness')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                activeTab === 'freshness'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isEn ? 'Freshness & Halal' : 'Kesegaran & Halal'}</span>
            </button>
            <button
              onClick={() => setActiveTab('cutting')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                activeTab === 'cutting'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
              }`}
            >
              <Scissors className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{isEn ? 'Cuts & Cleaning' : 'Potongan & Cuci'}</span>
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                activeTab === 'delivery'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{isEn ? 'Delivery' : 'Penghantaran'}</span>
            </button>
            <button
              onClick={() => setActiveTab('order')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                activeTab === 'order'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>{isEn ? 'Catering' : 'Kenduri'}</span>
            </button>
          </div>

          {/* Quick Expand/Collapse Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleOpenAll}
              className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              {isEn ? 'Open All' : 'Buka Semua'}
            </button>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <button
              onClick={handleCloseAll}
              className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              {isEn ? 'Collapse All' : 'Tutup Semua'}
            </button>
          </div>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            const question = isEn ? faq.questionEn : faq.question;
            const answer = isEn ? faq.answerEn : faq.answer;
            const badge = isEn ? faq.badgeEn : faq.badge;
            const highlights = isEn ? faq.highlightsEn : faq.highlights;

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
                      {badge && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-md inline-block mb-1 border border-emerald-200/50 dark:border-emerald-800/50">
                          {badge}
                        </span>
                      )}
                      <h3 className="font-extrabold text-stone-900 dark:text-white text-sm sm:text-base leading-snug">
                        {question}
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
                      {answer}
                    </p>

                    {highlights && highlights.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-dashed border-stone-200 dark:border-stone-800 flex flex-wrap gap-2">
                        {highlights.map((h, i) => (
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
                {isEn ? 'Have other questions or need custom assistance?' : 'Ada sebarang soalan lain atau perlukan bantuan khusus?'}
              </h4>
              <p className="text-xs text-emerald-100 mt-0.5">
                {isEn ? 'Our customer care team is ready to assist daily from 7:00 AM to 10:00 PM.' : 'Khidmat sokongan pelanggan kami sedia membantu anda setiap hari dari jam 7:00 pagi hingga 10:00 malam.'}
              </p>
            </div>
          </div>

          <a
            href={getOfficialWhatsAppLink(isEn ? 'Hello Khairul Fresh Food, I have an inquiry regarding fresh chicken orders...' : 'Salam Khairul Fresh Food, saya ada pertanyaan mengenai pesanan ayam segar...')}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white hover:bg-stone-100 text-emerald-900 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl transition-colors shrink-0 flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <PhoneCall className="w-4 h-4 text-emerald-700" />
            <span>{isEn ? 'Ask on WhatsApp (011-11135503)' : 'Tanya di WhatsApp (011-11135503)'}</span>
          </a>
        </div>

      </div>
    </section>
  );
};
