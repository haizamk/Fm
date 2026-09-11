import { Product, ChickenCutOption, CleaningOption, PackagingOption } from '../types';

export const CHICKEN_CUT_OPTIONS: ChickenCutOption[] = [
  {
    id: 'seekor-bulat',
    label: 'Seekor Bulat',
    description: 'Sesuai untuk dipanggang dan jika nak potong sendiri',
  },
  {
    id: 'potong-4',
    label: 'Potong 4 Bahagian',
    description: 'Sesuai untuk hidangan Ayam Percik, Ayam Panggang Oven atau Smoke BBQ. Juga Nasi Ayam, ayam gepuk dan ayam penyet',
  },
  {
    id: 'potong-8',
    label: 'Potong 8 Bahagian',
    description: 'Potongan standard hidangan keluarga. Sesuai untuk Ayam Goreng Berempah & Rendang.',
  },
  {
    id: 'potong-12',
    label: 'Potong 12 Bahagian (Paling Popular)',
    description: 'Potongan saiz sederhana untuk Kari Ayam pekat, Sambal atau Masak Lemak Cili Padi. Juga Ayam Goreng Kunyit',
    popular: true,
  },
  {
    id: 'potong-16',
    label: 'Potong 16 Bahagian',
    description: 'Potongan kecil-kecil, mudah meresap rempah dan sedap untuk sup & soto. juga Ayam Berempah',
  },
];

export const KAKI_AYAM_CUT_OPTIONS: ChickenCutOption[] = [
  {
    id: 'kaki-tak-potong-kuku',
    label: 'tidak potong - hanya potong kuku',
    description: 'Kaki ayam dibersihkan rapi dan kuku dibuang, dibiarkan utuh panjang.',
    popular: true,
  },
  {
    id: 'kaki-potong-dua-buang-kuku',
    label: 'potong dua dan buang kuku',
    description: 'Kuku dibuang dan kaki dipotong dua bahagian supaya mudah dimasak sup atau kerabu.',
  },
];

export const RANGKA_AYAM_CUT_OPTIONS: ChickenCutOption[] = [
  {
    id: 'rangka-tak-potong',
    label: 'tidak potong',
    description: 'Rangka ayam dibersihkan dan dibiarkan utuh untuk rebusan stok kawah atau periuk besar.',
    popular: true,
  },
  {
    id: 'rangka-potong-dua',
    label: 'potong 2 sahaja',
    description: 'Rangka dipotong dua bahagian sama saiz.',
    popular: true,
  },
  {
    id: 'rangka-potong-kecil',
    label: 'potong kecil',
    description: 'Rangka dipotong kecil-kecil untuk sup, soto, atau kuah kari pekat.',
  },
];

export const DADA_AYAM_CUT_OPTIONS: ChickenCutOption[] = [
  {
    id: 'dada-tidak-dipotong',
    label: 'tidak dipotong',
    description: 'Dada ayam segar dibiarkan utuh segar tanpa dipotong.',
    popular: true,
  },
  {
    id: 'dada-potong-kiub',
    label: 'Potong kiub',
    description: 'Dada ayam dipotong kiub / dadu rapi, sesuai untuk sate, sup sihat, atau masakan tumis.',
    popular: true,
  },
];

export const WHOLE_LEG_CUT_OPTIONS: ChickenCutOption[] = [
  {
    id: 'whole-leg-tidak-dipotong',
    label: 'Tidak dipotong',
    description: 'Whole-leg dibiarkan utuh segar bercantum antara peha dan drumstick.',
    popular: true,
  },
  {
    id: 'whole-leg-potong-2',
    label: 'Potong 2 bahagian',
    description: 'Dipotong dan diasingkan kepada 2 bahagian (peha / thigh dan drumstick).',
    popular: true,
  },
  {
    id: 'whole-leg-potong-3',
    label: 'Potong 3 bahagian',
    description: 'Dipotong kepada 3 bahagian lebih kecil untuk memudahkan masakan harian atau sup.',
  },
];

export const KEPAK_AYAM_CUT_OPTIONS: ChickenCutOption[] = [
  {
    id: 'kepak-tidak-dipotong',
    label: 'Tidak dipotong',
    description: 'Kepak ayam dibiarkan utuh segar bersambung penuh (drumette, wingette & tip).',
    popular: true,
  },
  {
    id: 'kepak-potong-2',
    label: 'Potong 2 bahagian',
    description: 'Dipotong dan diasingkan kepada 2 bahagian utama (drumette dan wingette).',
    popular: true,
  },
];

export const ALL_CUT_OPTIONS: ChickenCutOption[] = [
  ...CHICKEN_CUT_OPTIONS,
  ...KAKI_AYAM_CUT_OPTIONS,
  ...RANGKA_AYAM_CUT_OPTIONS,
  ...DADA_AYAM_CUT_OPTIONS,
  ...WHOLE_LEG_CUT_OPTIONS,
  ...KEPAK_AYAM_CUT_OPTIONS,
];

export function getCutLabel(cutId?: string, product?: Product): string {
  if (!cutId) return 'Potongan Standard';
  if (product?.customCutOptions) {
    const found = product.customCutOptions.find((c) => c.id === cutId);
    if (found) return found.label;
  }
  const foundInAll = ALL_CUT_OPTIONS.find((c) => c.id === cutId);
  if (foundInAll) return foundInAll.label;
  return cutId;
}

export const CLEANING_OPTIONS: CleaningOption[] = [
  {
    id: 'buang-lemak-kulit',
    label: 'Buang lemak dan kulit (+RM1.00 / ekor)',
    description: 'Mengasingkan kulit dan lapisan lemak sepenuhnya untuk masakan sihat.',
    price: 1.00,
  },
  {
    id: 'buang-tongkeng-ekor',
    label: 'Buang tongkeng / ekor',
    description: 'Memotong dan membuang bahagian tongkeng minyak di belakang ayam.',
    price: 0,
  },
  {
    id: 'buang-kaki',
    label: 'Buang kaki',
    description: 'Memotong dan mengasingkan bahagian kaki ayam.',
    price: 0,
  },
  {
    id: 'buang-hati-pedal',
    label: 'Buang hati / pedal',
    description: 'Mengeluarkan dan mengasingkan organ dalaman hati dan pedal.',
    price: 0,
  },
];

export const PACKAGING_OPTIONS: PackagingOption[] = [
  {
    id: 'bungkusan-biasa-ais',
    label: 'Bungkusan Biasa Bersama Ais (Percuma)',
    price: 0,
    description: 'Bungkusan plastik tebal bersama ais batu.',
    isDefault: true,
    reminderNote: 'Peringatan: Jika tidak memilih Cooler Box, pesanan anda akan dibungkus menggunakan bungkusan biasa hanya bersama ais.',
  },
  {
    id: 'cooler-box',
    label: 'Kotak Penebat Dingin (Cooler Box)',
    price: 5.00,
    description: 'Kotak penebat dingin Cooler Box berais (+RM5.00 jika <10 unit / +RM10.00 jika 10-30 unit).',
  },
];

// SENARAI LENGKAP 9 PRODUK UTAMA MENGIKUT 3 KATEGORI RASMI
export const PRODUCTS: Product[] = [
  // -------------------------------------------------------------
  // 1. KATEGORI: AYAM SEEKOR
  // -------------------------------------------------------------
  {
    id: 'ayam-segar-standard',
    name: 'Ayam Segar Standard',
    subtitle: 'Ayam Segar Awal Pagi • Pilihan 1.6kg hingga 2.4kg',
    category: 'ayam-seekor',
    price: 19.50,
    originalPrice: 21.00,
    unit: 'ekor',
    weightEstimate: '1.6kg - 2.4kg / ekor',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=85&w=1200',
    inStock: true,
    rating: 4.9,
    reviewsCount: 148,
    supportsCutting: true,
    defaultCut: 'potong-12',
    popular: true,
    halalCertified: true,
    freshnessType: 'Ayam Segar Awal Pagi',
    tags: ['Ayam Seekor', 'Paling Laris', 'Segar Awal Pagi', 'Pasar Semenyih'],
    dailyStockLimit: 120,
    remainingStock: 38,
    hasWeightOptions: true,
    weightOptions: [
      {
        id: 'std-w1',
        weightLabel: '1.6kg - 1.8kg',
        price: 19.50,
        originalPrice: 21.00,
        availableStock: 18,
        isAvailable: true,
      },
      {
        id: 'std-w2',
        weightLabel: '1.9kg - 2.1kg',
        price: 22.00,
        originalPrice: 24.00,
        availableStock: 12,
        isAvailable: true,
      },
      {
        id: 'std-w3',
        weightLabel: '2.2kg - 2.4kg',
        price: 25.00,
        originalPrice: 27.00,
        availableStock: 8,
        isAvailable: true,
      },
    ],
    description: 'Ayam pedaging segar gred A harian di Pasar Semenyih dengan jaminan Halal Diiktiraf. Isi pejal, manis semulajadi, dicuci bersih dan dipotong percuma mengikut pilihan anda. Pilihan berat: 1.6kg-1.8kg (RM19.50), 1.9kg-2.1kg (RM22.00), atau 2.2kg-2.4kg (RM25.00).',
  },
  {
    id: 'ayam-kampung-organik',
    name: 'Ayam Kampung Organik',
    subtitle: 'Bebas Hormon & Antibiotik • Pilihan 1.2kg hingga 1.7kg',
    category: 'ayam-seekor',
    price: 38.00,
    originalPrice: 42.00,
    unit: 'ekor',
    weightEstimate: '1.2kg - 1.7kg / ekor',
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&q=85&w=1200',
    inStock: true,
    rating: 5.0,
    reviewsCount: 92,
    supportsCutting: true,
    defaultCut: 'potong-8',
    popular: true,
    halalCertified: true,
    freshnessType: 'Segar Organik',
    tags: ['Ayam Seekor', 'Ayam Kampung', 'Organik', 'Kesihatan'],
    dailyStockLimit: 40,
    remainingStock: 15,
    hasWeightOptions: true,
    weightOptions: [
      {
        id: 'kpg-w1',
        weightLabel: '1.2kg - 1.4kg',
        price: 38.00,
        originalPrice: 42.00,
        availableStock: 9,
        isAvailable: true,
      },
      {
        id: 'kpg-w2',
        weightLabel: '1.5kg - 1.7kg',
        price: 42.00,
        originalPrice: 45.00,
        availableStock: 6,
        isAvailable: true,
      },
    ],
    description: 'Ayam kampung ternakan bebas berkualiti tinggi yang diberi makanan organik tanpa suntikan hormon. Struktur daging yang pejal, rendah lemak dan kaya dengan rasa asli, sangat sesuai untuk sup herba, rendang tradisi atau ayam goreng kampung. Pilihan berat: 1.2kg-1.4kg (RM38.00) atau 1.5kg-1.7kg (RM42.00).',
  },
  {
    id: 'ayam-tua-pencen-segar',
    name: 'Ayam Tua / Pencen Segar',
    subtitle: 'Isi Kenyal Padu • Lengkap Pilihan Bakar / Tak Bakar',
    category: 'ayam-seekor',
    price: 14.00,
    originalPrice: 16.50,
    unit: 'ekor',
    weightEstimate: '1.5kg - 1.7kg / ekor',
    image: 'https://images.unsplash.com/photo-1548567117-0429762db801?auto=format&fit=crop&q=85&w=1200',
    inStock: true,
    rating: 4.8,
    reviewsCount: 64,
    supportsCutting: true,
    defaultCut: 'potong-12',
    hasBakarOption: true,
    bakarDefault: 'tak-bakar',
    halalCertified: true,
    freshnessType: 'Ayam Segar Awal Pagi',
    tags: ['Ayam Seekor', 'Ayam Pencen', 'Bakar / Tak Bakar', 'Rendang'],
    dailyStockLimit: 50,
    remainingStock: 22,
    description: 'Ayam tua (pencen) segar dengan tekstur isi yang lebih padu dan kenyal. Amat digemari untuk rendang kawah, kari kenduri, dan sup renek lama kerana kemanisan tulangnya. Dilengkapi pilihan Bakar Bulu atau Tak Bakar sebelum proses pemotongan.',
  },

  // -------------------------------------------------------------
  // 2. KATEGORI: BAHAGIAN AYAM
  // -------------------------------------------------------------
  {
    id: 'whole-leg-segar',
    name: 'Whole-leg Segar',
    subtitle: 'Paha & Drumstick Bersambung • Juicy & Lembut',
    category: 'bahagian-ayam',
    price: 18.50,
    originalPrice: 20.00,
    unit: 'kg',
    weightEstimate: '1.0kg (~3 hingga 4 ketul)',
    image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=85&w=1200',
    inStock: true,
    rating: 4.9,
    reviewsCount: 78,
    supportsCutting: true,
    supportsCleaning: false, // Servis pembersihan khas dibuang untuk whole-leg
    defaultCut: 'whole-leg-tidak-dipotong',
    customCutOptions: WHOLE_LEG_CUT_OPTIONS,
    popular: true,
    halalCertified: true,
    freshnessType: 'Segar Suhu Dingin (0-4°C)',
    tags: ['Bahagian Ayam', 'Whole-leg', 'Chicken Chop', 'Juicy'],
    dailyStockLimit: 60,
    remainingStock: 28,
    description: 'Potongan Whole-leg segar yang menggabungkan bahagian peha (thigh) dan drumstick. Daging yang paling lembut dan berjus, sangat sesuai untuk menu Western Grilled Chicken Chop, Ayam Panggang, Nasi Arab Mandy, atau digoreng krup-krup.',
  },
  {
    id: 'kepak-ayam-segar',
    name: 'Kepak Ayam Segar',
    subtitle: 'Wingette & Drumette Segar • Rangup & Sedap',
    category: 'bahagian-ayam',
    price: 19.50,
    originalPrice: 22.00,
    unit: 'kg',
    weightEstimate: '1.0kg (~8 hingga 10 kepak)',
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&q=85&w=1200',
    inStock: true,
    rating: 4.9,
    reviewsCount: 110,
    supportsCutting: true,
    supportsCleaning: false, // Servis pembersihan khas dibuang untuk kepak ayam
    defaultCut: 'kepak-tidak-dipotong',
    customCutOptions: KEPAK_AYAM_CUT_OPTIONS,
    halalCertified: true,
    freshnessType: 'Segar Suhu Dingin (0-4°C)',
    tags: ['Bahagian Ayam', 'Kepak Ayam', 'BBQ', 'Ayam Goreng'],
    dailyStockLimit: 50,
    remainingStock: 19,
    description: 'Kepak ayam segar berkualiti premium yang dibersihkan rapi dari bulu halus. Pilihan paling digemari untuk hidangan BBQ arang, kepak ayam madu, Buffalo wings pedas, atau goreng tepung rangup.',
  },
  {
    id: 'dada-ayam-segar',
    name: 'Dada Ayam Segar',
    subtitle: 'Isi Pejal Tinggi Protein • Rendah Lemak Sihat',
    category: 'bahagian-ayam',
    price: 20.00,
    originalPrice: 22.50,
    unit: 'kg',
    weightEstimate: '1.0kg (~3 hingga 4 keping)',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=85&w=1200',
    inStock: true,
    rating: 4.8,
    reviewsCount: 85,
    supportsCutting: true,
    supportsCleaning: false, // Servis pembersihan khas dibuang untuk dada ayam
    defaultCut: 'dada-tidak-dipotong',
    customCutOptions: DADA_AYAM_CUT_OPTIONS,
    halalCertified: true,
    freshnessType: 'Segar Suhu Dingin (0-4°C)',
    tags: ['Bahagian Ayam', 'Dada Ayam', 'Tinggi Protein', 'Diet Sihat'],
    dailyStockLimit: 70,
    remainingStock: 30,
    description: 'Isi dada ayam segar tanpa kulit (boneless/skinless option) yang tinggi protein dan rendah lemak. Sangat sesuai untuk pengamal gaya hidup sihat, hidangan gimnasium, sate ayam, sup diet, atau hidangan masakan Cina hiris.',
  },
  {
    id: 'hati-pedal-ayam',
    name: 'Hati / Pedal Ayam',
    subtitle: 'Segar & Bersih • Pilihan Hati, Pedal atau Campur (500g)',
    category: 'bahagian-ayam',
    price: 4.50, // Default base price for 500g
    originalPrice: 5.50,
    unit: 'pek (500g)',
    weightEstimate: '500gram / pek',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=85&w=1200',
    inStock: true,
    rating: 4.7,
    reviewsCount: 56,
    supportsCutting: false,
    supportsCleaning: false, // Tiada servis pembersihan khas untuk organ
    hasOrganVariations: true,
    organVariations: [
      { id: 'campur-hati-pedal', label: 'Campur Hati & Pedal (500g)', price: 4.50, unit: 'pek (500g)' },
      { id: 'hati-sahaja', label: 'Hati Sahaja (500g)', price: 4.00, unit: 'pek (500g)' },
      { id: 'pedal-sahaja', label: 'Pedal Sahaja (500g)', price: 5.00, unit: 'pek (500g)' },
    ],
    halalCertified: true,
    freshnessType: 'Segar Suhu Dingin (0-4°C)',
    tags: ['Bahagian Ayam', 'Organ Segar', '500gram', 'Hati Ayam', 'Pedal Ayam', 'Sambal Goreng'],
    dailyStockLimit: 30,
    remainingStock: 12,
    description: 'Organ dalaman ayam (hati & pedal) yang segar dan dibersihkan rapi dalam pek 500gram. Pilihan variasi: Hati Sahaja (RM4.00/pek), Pedal Sahaja (RM5.00/pek), atau Campur Hati & Pedal (RM4.50/pek). Sedap dimasak sambal pengantin, goreng kunyit kacang buncis, atau rendang.',
  },
  {
    id: 'kaki-ayam',
    name: 'Kaki Ayam',
    subtitle: 'Kaki Segar Bersih & Kolagen • Asas Sup & Kerabu',
    category: 'bahagian-ayam',
    price: 5.00,
    originalPrice: 6.00,
    unit: 'pek (500g)',
    weightEstimate: '500gram / pek (~8-10 pasang)',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&q=85&w=1200',
    inStock: true,
    rating: 4.9,
    reviewsCount: 58,
    supportsCutting: true,
    supportsCleaning: false, // Servis pembersihan khas dibuang untuk kaki ayam
    defaultCut: 'kaki-tak-potong-kuku',
    customCutOptions: KAKI_AYAM_CUT_OPTIONS,
    halalCertified: true,
    freshnessType: 'Segar Suhu Dingin (0-4°C)',
    tags: ['Bahagian Ayam', 'Kaki Ayam', '500gram', 'Kolagen', 'Sup Kaki', 'Kerabu'],
    dailyStockLimit: 40,
    remainingStock: 25,
    description: 'Kaki ayam segar berkualiti tinggi yang telah dibuang lapisan kulit kuning luar dan dibersihkan rapi. Kaya dengan kolagen semulajadi, sangat sedap untuk masakan sup kaki ayam berempah, kerabu pedas, soto, atau dim sum. Berat standard: 500gram setiap pek.',
  },
  {
    id: 'rangka-ayam',
    name: 'Rangka Ayam',
    subtitle: 'Tulang Segar Asas Stok Sup & Mee Kari Pekat',
    category: 'bahagian-ayam',
    price: 4.50,
    originalPrice: 5.50,
    unit: 'pek (500g)',
    weightEstimate: '500gram / pek (~1-2 rangka)',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=85&w=1200',
    inStock: true,
    rating: 4.8,
    reviewsCount: 46,
    supportsCutting: true,
    supportsCleaning: false, // Servis pembersihan khas dibuang untuk rangka ayam
    defaultCut: 'rangka-tak-potong',
    customCutOptions: RANGKA_AYAM_CUT_OPTIONS,
    halalCertified: true,
    freshnessType: 'Segar Suhu Dingin (0-4°C)',
    tags: ['Bahagian Ayam', 'Rangka Ayam', '500gram', 'Stok Sup', 'Mee Kari', 'Pati Ayam'],
    dailyStockLimit: 45,
    remainingStock: 30,
    description: 'Rangka tulang ayam segar hasil proses sembelihan dan lapah harian. Mengandungi kemanisan pati tulang semulajadi yang menghasilkan stok sup jernih, kuah bihun sup, mee kari, atau kuah mee rebus yang pekat dan enak. Berat standard: 500gram setiap pek.',
  },

  // -------------------------------------------------------------
  // 3. KATEGORI: KOMBO JIMAT
  // -------------------------------------------------------------
  {
    id: 'kombo-jimat-keluarga-sihat',
    name: 'Kombo Jimat Keluarga Sihat (3 Ekor Ayam Segar)',
    subtitle: 'Pek Jimat Keluarga • 3 Ekor Ayam Standard Segar Pasar Semenyih',
    category: 'kombo-jimat',
    price: 52.00,
    originalPrice: 57.00,
    unit: 'pakej',
    weightEstimate: '3 Ekor (Jumlah ~4.8kg - 5.4kg)',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=85&w=1200',
    inStock: true,
    rating: 5.0,
    reviewsCount: 184,
    supportsCutting: true,
    defaultCut: 'potong-12',
    popular: true,
    halalCertified: true,
    freshnessType: 'Ayam Segar Awal Pagi',
    tags: ['Kombo Jimat', 'Paling Jimat', '3 Ekor', 'Stok Mingguan'],
    dailyStockLimit: 30,
    remainingStock: 11,
    description: 'Pakej kombo paling menjimatkan untuk stok dapur mingguan keluarga. Mengandungi 3 ekor ayam segar standard gred A (jumlah berat ~5kg). Anda boleh memilih gaya potongan dan pembersihan berbeza secara percuma untuk setiap ekor.',
  },
];

export const PRODUCT_CATEGORIES = [
  { id: 'semua', label: 'Semua Produk (10)', count: 10 },
  { id: 'ayam-seekor', label: 'Ayam Seekor (3)', count: 3 },
  { id: 'bahagian-ayam', label: 'Bahagian Ayam (6)', count: 6 },
  { id: 'kombo-jimat', label: 'Kombo Jimat (1)', count: 1 },
];
