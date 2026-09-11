export interface RecipeItem {
  id: string;
  title: string;
  subtitle: string;
  recommendedCut: string;
  prepTime: string;
  servings: string;
  difficulty: 'Mudah' | 'Sederhana' | 'Pakar';
  ingredients: string[];
  steps: string[];
  chefTip: string;
  image: string;
}

export const CHICKEN_RECIPES: RecipeItem[] = [
  {
    id: 'ayam-masak-merah-kenduri',
    title: 'Ayam Masak Merah Kenduri Asli',
    subtitle: 'Warna merah berkilat pekat, pedas manis wangi serai & daun pandan',
    recommendedCut: 'Potong 12 (Kenduri) atau Potong 8',
    prepTime: '45 Minit',
    servings: '6 - 8 Orang',
    difficulty: 'Sederhana',
    ingredients: [
      '1 ekor Ayam Bulat Segar Khairul FRESH Food (potong 12)',
      '1 sudu teh serbuk kunyit & garam (untuk lumuran)',
      '2 batang serai (dititik)',
      '1 helai daun pandan (disimpul)',
      '1 cawan cili kisar (cili kering rebus)',
      '1/2 cawan sos tomato & 2 sudu besar sos cili',
      '1 biji bawang besar merah (dihiris bulat untuk hiasan)',
      'Bahan kisar: 6 ulas bawang merah, 4 ulas bawang putih, 2 inci halia'
    ],
    steps: [
      'Gaul ayam bersama kunyit dan garam. Goreng sehingga 3/4 masak (jangan terlalu garing agar daging kekal juicy). Angkat dan toskan.',
      'Tumis serai titik dan daun pandan sehingga naik bau harum.',
      'Masukkan bahan kisar dan tumis sehingga kekuningan.',
      'Masukkan cili kisar, tumis dengan api sederhana sehingga pecah minyak dan warna bertukar merah gelap berkilat.',
      'Masukkan sos tomato, sos cili, gula melaka/nisan dan sedikit garam.',
      'Masukkan ayam goreng, gaul rata dan reneh selama 8-10 minit sehingga kuah meresap ke dalam isi ayam.',
      'Tabur hirisan bawang besar dan daun sup sebelum dihidangkan.'
    ],
    chefTip: 'Gunakan ayam segar bertaraf suhu sejuk (bukan ayam beku). Manis jus semulajadi ayam akan bercampur mesra dengan sos merah menghasilkan rasa umami istimewa.',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'sup-ayam-herba-kampung',
    title: 'Sup Ayam Kampung Herba & Halia Muda',
    subtitle: 'Menenangkan perut, menyegarkan badan & kaya khasiat semulajadi',
    recommendedCut: 'Ayam Kampung Asli (Potong 12 atau Potong 16)',
    prepTime: '55 Minit',
    servings: '4 - 5 Orang',
    difficulty: 'Mudah',
    ingredients: [
      '1 ekor Ayam Kampung Segar Khairul FRESH Food',
      '3 inci halia muda (dihiris tebal)',
      '1 sup bunjut herba asli',
      '1 batang lobak merah & 2 biji kentang (dipotong baji)',
      '5 ulas bawang putih & 5 ulas bawang merah (dihiris & ditumis)',
      '1 batang kayu manis, 2 bunga lawang, 3 buah pelaga',
      'Daun sup, daun bawang & bawang goreng rangup'
    ],
    steps: [
      'Rebus ayam kampung bersama air secukupnya dan sup bunjut dengan api perlahan untuk mengeluarkan pati sup manis.',
      'Dalam kuali berasingan, tumis rempah empat sekawan dan hirisan bawang sehingga wangi dan keemasan.',
      'Tuangkan tumisan bawang wangi ke dalam periuk rebusan sup ayam.',
      'Masukkan halia muda, kentang dan lobak merah. Reneh selama 30 minit sehingga ayam kampung empuk.',
      'Perasakan dengan garam bukit secukup rasa. Taburkan bawang goreng dan daun sup sebelum dinikmati panas-panas.'
    ],
    chefTip: 'Ayam kampung dara Khairul FRESH Food mempunyai struktur tulang pejal yang menghasilkan stok sup jernih berkilau tanpa perlu menambah kiub pati tiruan.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'ayam-goreng-berempah-mamak',
    title: 'Ayam Goreng Berempah Rangup Bersarang',
    subtitle: 'Kerak rempah rangup garing di luar, isi ayam berjus lembut di dalam',
    recommendedCut: 'Potong 8 atau Drumstick & Peha',
    prepTime: '30 Minit (Perap 2 jam)',
    servings: '6 Orang',
    difficulty: 'Mudah',
    ingredients: [
      '1 ekor Ayam Segar (potong 8)',
      '4 tangkai daun kari segar',
      '2 sudu besar tepung beras & 1 sudu besar tepung jagung',
      '1 biji telur ayam',
      'Bahan rempah kisar: 6 batang serai, 2 inci halia, 5 ulas bawang putih, 1 sudu makan jintan manis, 1 sudu makan ketumbar, 1 sudu makan serbuk cili, 1 sudu serbuk kari daging'
    ],
    steps: [
      'Kisar kering atau tumbuk kasar bahan rempah supaya bertekstur sara kelapa.',
      'Gaul ayam segar bersama bahan rempah kisar, daun kari, telur, tepung beras, tepung jagung dan garam.',
      'Perap sekurang-kurangnya 1-2 jam di dalam chiller sejuk.',
      'Panaskan minyak yang banyak (deep fry) pada suhu sederhana panas.',
      'Goreng ayam bersama rempah perapan sehingga garing keemasan. Angkat bersama serdak rempah wangi rangup.'
    ],
    chefTip: 'Jangan goreng ayam ketika masih beku berais. Pastikan ayam berada pada suhu bilik sejuk sebelum digoreng agar bahagian dalam masak serata tanpa rempah hangus.',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80',
  }
];

export const STORAGE_TIPS = [
  {
    icon: 'ThermometerSnowflake',
    title: 'Simpan Sejuk Dingin Chiller (0°C – 4°C)',
    desc: 'Untuk masakan dalam masa 1 hingga 3 hari, simpan dalam bekas bertutup di bahagian paling sejuk peti sejuk anda. Ayam kekal segar manis tanpa perlu dinyahbeku.',
  },
  {
    icon: 'PackageCheck',
    title: 'Pilihan Pek Kedap Udara (Vacuum Pack)',
    desc: 'Jika ingin simpan lama, pilih pilihan Pek Vakum semasa checkout. Ayam bebas daripada "freezer burn" dan bertahan sehingga 6 bulan dengan kualiti rasa terjamin.',
  },
  {
    icon: 'Sparkles',
    title: 'Teknik Asingkan Porsi (Meal-Prep Portioning)',
    desc: 'Asingkan bahagian ayam mengikut sukatan sekali masak (cth: 4 ketul lauk tengah hari). Elakkan mencairbekukan keseluruhan pek berulang kali untuk menjaga kebersihan higienik.',
  },
  {
    icon: 'ShieldCheck',
    title: '100% Halal Diiktiraf & Bersih',
    desc: 'Semua bekalan ayam disahkan Halal, dicuci bersih dengan air mengalir suci, serta bebas kotoran.',
  }
];
