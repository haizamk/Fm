export interface RecipeItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'viral' | 'tradisi' | 'goreng' | 'kuah' | 'sihat';
  categoryLabel: string;
  badge?: string;
  recommendedCut: string;
  cutId?: string;
  prepTime: string;
  servings: string;
  difficulty: 'Mudah' | 'Sederhana' | 'Pakar';
  ingredients: string[];
  steps: string[];
  chefTip: string;
  image: string;
}

export const RECIPE_CATEGORIES = [
  { id: 'all', label: 'Semua (18 Resepi)' },
  { id: 'viral', label: '🔥 Viral & Trending' },
  { id: 'goreng', label: '🍗 Goreng & Bakar' },
  { id: 'kuah', label: '🥘 Gulai & Kuah Pekat' },
  { id: 'tradisi', label: '✨ Warisan Kenduri' },
  { id: 'sihat', label: '🌿 Sup & Sihat' },
] as const;

export const CHICKEN_RECIPES: RecipeItem[] = [
  // 1. AYAM MASAK MERAH KENDURI
  {
    id: 'ayam-masak-merah-kenduri',
    title: 'Ayam Masak Merah Kenduri Asli',
    subtitle: 'Warna merah berkilat pekat, pedas manis wangi serai & daun pandan',
    category: 'tradisi',
    categoryLabel: 'Warisan Kenduri',
    badge: 'Paling Popular',
    recommendedCut: 'Potong 12 (Kenduri) atau Potong 8',
    cutId: 'potong-12',
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
      'Bahan kisar: 6 ulas bawang merah, 4 ulas bawang putih, 2 inci halia',
      '1 ketul kecil gula melaka / nisan kerek'
    ],
    steps: [
      'Gaul ayam bersama kunyit dan garam. Goreng sehingga 3/4 masak (jangan terlalu garing agar daging kekal juicy). Angkat dan toskan.',
      'Tumis serai titik dan daun pandan sehingga naik bau harum menyengat.',
      'Masukkan bahan kisar bawang dan halia, tumis sehingga kekuningan dan wangi.',
      'Masukkan cili kisar, tumis dengan api sederhana sehingga pecah minyak dan warna bertukar merah gelap berkilat.',
      'Masukkan sos tomato, sos cili, gula melaka dan sedikit garam perasa.',
      'Masukkan ayam goreng, gaul rata dan reneh selama 8-10 minit sehingga kuah pekat meresap ke dalam serat isi ayam.',
      'Tabur hirisan bawang besar dan daun sup sebelum dihidangkan panas-panas bersama nasi minyak atau nasi putih.'
    ],
    chefTip: 'Gunakan ayam segar bertaraf suhu sejuk (bukan ayam beku). Manis jus semulajadi ayam akan bercampur mesra dengan sos merah menghasilkan rasa umami istimewa tanpa memerlukan perasa tiruan.',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=80',
  },

  // 2. AYAM GEPUK SAMBAL GESEK (VIRAL)
  {
    id: 'ayam-gepuk-sambal-gesek',
    title: 'Ayam Gepuk Sambal Gesek Pedas Ketagih',
    subtitle: 'Viral TikTok! Ayam goreng rangup dihempuk sambal kacang gajus pedas berapi',
    category: 'viral',
    categoryLabel: 'Viral & Trending',
    badge: 'Viral TikTok 🔥',
    recommendedCut: 'Potong 8 atau Peha Quarter (Leg Quarter)',
    cutId: 'potong-8',
    prepTime: '35 Minit',
    servings: '4 Orang',
    difficulty: 'Mudah',
    ingredients: [
      '1 ekor Ayam Segar (potong 8 atau peha quarter)',
      '1 biji kubis bulat kecil (dipotong baji & digoreng layu)',
      '2 keping tauhu & tempe (dipotong & digoreng)',
      'Perapan ayam: 4 ulas bawang putih, 1 inci kunyit hidup, 1 sudu ketumbar biji, 1 sudu garam',
      'Bahan Sambal Gesek: 25 biji cili padi merah & hijau, 3 ulas bawang putih, 2 sudu makan kacang tanah/gajus goreng, 1 sudu kecil garam & serbuk perasa',
      '3-4 sudu besar minyak panas menggelegak (bekas gorengan ayam)'
    ],
    steps: [
      'Rebus seketika ayam dengan bahan perapan tumbuk selama 10 minit, toskan.',
      'Goreng ayam dalam minyak banyak sehingga garing keemasan di luar tetapi sangat berjus di dalam.',
      'Sediakan lesung batu: Tumbuk kasar cili padi bersama bawang putih mentah, kacang tanah goreng dan garam.',
      'Siram minyak panas menggelegak terus ke atas sambal dalam lesung, gaul rata sehingga berdesir wangi.',
      'Letakkan ayam goreng panas di atas sambal, lalu ketuk/gepuk perlahan menggunakan anak lesung hingga rekah.',
      'Sapu sambal berapi ke atas ayam. Hidangkan bersama kobis goreng rangup, tempe dan nasi panas berasap.'
    ],
    chefTip: 'Rahsia sambal gepuk viral sedap terletak pada siraman minyak gorengan ayam yang betul-betul panas menggelegak ke atas tumbukan cili mentah dan kacang tanah.',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&auto=format&fit=crop&q=80',
  },

  // 3. AYAM BUTTER BASAH BERKRIM (CREAMY BUTTERMILK)
  {
    id: 'ayam-butter-basah',
    title: 'Ayam Buttermilk Basah Berkrim & Daun Kari',
    subtitle: 'Kombinasi rangup isi ayam bersalut sos mentega susu cair manis lemak pedas',
    category: 'viral',
    categoryLabel: 'Viral & Trending',
    badge: 'Menu Cafe Viral ⭐',
    recommendedCut: 'Dada Ayam Fillet (Isi Dadu) atau Drumstick & Peha',
    cutId: 'potong-16',
    prepTime: '30 Minit',
    servings: '4 - 5 Orang',
    difficulty: 'Mudah',
    ingredients: [
      '500g Isi Dada Ayam Segar Khairul FRESH Food (dipotong dadu gigitan)',
      '1/2 cawan tepung jagung & 1 biji putih telur (untuk salutan ayam)',
      '3 sudu besar mentega tulen (butter)',
      '1 tin susu cair (evaporated milk)',
      '4 tangkai daun kari segar',
      '6 biji cili padi merah & hijau (dihiris)',
      '4 ulas bawang putih (dicincang halus)',
      '1/2 sudu teh kiub pati ayam, 1 sudu teh gula dan secubit garam'
    ],
    steps: [
      'Salut isi ayam bersama putih telur dan tepung jagung. Goreng sehingga garing keemasan, toskan.',
      'Cairkan mentega di dalam kuali dengan api sederhana kecil.',
      'Tumis bawang putih cincang, cili padi dan daun kari sehingga naik aroma wangi mentega.',
      'Tuangkan satu tin susu cair, kacau rata perlahan-lahan.',
      'Masukkan gula, garam dan sedikit perasa pati ayam. Reneh sehingga kuah mula memekat sedikit.',
      'Masukkan ayam goreng rangup, gaul pantas selama 1 minit agar kuah berkrim menyelaputi ayam tanpa hilangkan kerangupan.',
      'Angkat dan hidang segera selagi masih panas berkrim.'
    ],
    chefTip: 'Gunakan isi dada ayam segar tanpa tulang. Masukkan ayam ke dalam kuah buttermilk sesaat sebelum dihidang supaya salutan tepung kekal rangup krapp-krupp di dalam mulut.',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop&q=80',
  },

  // 4. AYAM GORENG BEREMPAH RANGUP BERSARANG
  {
    id: 'ayam-goreng-berempah-mamak',
    title: 'Ayam Goreng Berempah Rangup Bersarang',
    subtitle: 'Kerak rempah rangup garing di luar, isi ayam berjus lembut berempah',
    category: 'goreng',
    categoryLabel: 'Goreng & Bakar',
    badge: 'Wajib Nasi Lemak',
    recommendedCut: 'Potong 8 atau Drumstick & Peha',
    cutId: 'potong-8',
    prepTime: '30 Minit (Perap 1 jam)',
    servings: '6 Orang',
    difficulty: 'Mudah',
    ingredients: [
      '1 ekor Ayam Segar (potong 8)',
      '4 tangkai daun kari segar',
      '2 sudu besar tepung beras & 1 sudu besar tepung jagung',
      '1 biji telur ayam',
      'Bahan rempah kisar kasar: 6 batang serai, 2 inci halia, 5 ulas bawang putih, 1 sudu makan jintan manis, 1 sudu makan biji ketumbar, 1 sudu makan serbuk cili, 1 sudu serbuk kari daging'
    ],
    steps: [
      'Kisar kering atau tumbuk kasar bahan rempah supaya bertekstur sara serabut yang cantik.',
      'Gaul ayam segar bersama bahan rempah kisar, daun kari, telur, tepung beras, tepung jagung dan garam.',
      'Perap sekurang-kurangnya 1-2 jam di dalam chiller sejuk.',
      'Panaskan minyak yang banyak (deep fry) pada suhu sederhana panas.',
      'Goreng ayam bersama rempah perapan sehingga garing keemasan. Angkat bersama serdak rempah wangi rangup bersarang.'
    ],
    chefTip: 'Jangan goreng ayam ketika masih beku berais. Pastikan ayam berada pada suhu bilik sejuk sebelum digoreng agar bahagian dalam masak serata tanpa rempah hangus di luar.',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80',
  },

  // 5. AYAM SAMBAL HIJAU PADANG (CABE IJO)
  {
    id: 'ayam-sambal-hijau-padang',
    title: 'Ayam Sambal Hijau Padang (Cabe Ijo Gurih)',
    subtitle: 'Wangi limau purut, cili hijau segar berkilat dengan minyak aromatik padu',
    category: 'viral',
    categoryLabel: 'Viral & Trending',
    badge: 'Pedas Mantap 🌶️',
    recommendedCut: 'Potong 8 atau Potong 12',
    cutId: 'potong-8',
    prepTime: '40 Minit',
    servings: '5 - 6 Orang',
    difficulty: 'Sederhana',
    ingredients: [
      '1 ekor Ayam Segar (potong 8)',
      '15 biji cili hijau besar & 15 biji cili padi hijau kampung',
      '3 biji tomato hijau muda (potong dadu)',
      '8 ulas bawang merah kecil & 4 ulas bawang putih',
      '4 helai daun limau purut (dibuang urat tengah)',
      '1 keping asam gelugur / keping',
      'Garam, gula pasir dan perasa secukupnya'
    ],
    steps: [
      'Lumurkan ayam dengan kunyit dan garam, goreng hingga masak keemasan. Angkat dan toskan.',
      'Rebus cili hijau, cili padi, tomato hijau, bawang merah dan bawang putih dalam air mendidih selama 5 minit (ini elak sambal rasa maung/pahit).',
      'Tumbuk kasar atau kisar sekejap bahan rebusan (pastikan tekstur masih berketul kasar bukan puri halus).',
      'Panaskan minyak sisa gorengan ayam, tumis sambal hijau bersama daun limau purut dan asam keping dengan api perlahan.',
      'Perasakan dengan garam dan gula secukup rasa. Tumis hingga minyak bertukar warna hijau berkilau.',
      'Masukkan ayam goreng, gaul rata perlahan-lahan sehingga sebati dan hidangkan.'
    ],
    chefTip: 'Rahsia warna sambal hijau kekal segar menawan tanpa menjadi hitam: Rebus cili bersama sedikit minyak dan jangan tumis terlalu lama dengan api marak.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
  },

  // 6. SUP AYAM KAMPUNG HERBA & HALIA MUDA
  {
    id: 'sup-ayam-herba-kampung',
    title: 'Sup Ayam Kampung Herba & Halia Muda',
    subtitle: 'Menenangkan perut, menyegarkan badan & kaya khasiat semulajadi',
    category: 'sihat',
    categoryLabel: 'Sup & Sihat',
    badge: 'Khasiat Tulang',
    recommendedCut: 'Ayam Kampung Asli (Potong 12 atau Potong 16)',
    cutId: 'potong-12',
    prepTime: '55 Minit',
    servings: '4 - 5 Orang',
    difficulty: 'Mudah',
    ingredients: [
      '1 ekor Ayam Kampung Segar Khairul FRESH Food',
      '3 inci halia muda (dihiris tebal)',
      '1 sup bunjut herba asli tradisi',
      '1 batang lobak merah & 2 biji kentang (dipotong baji)',
      '5 ulas bawang putih & 5 ulas bawang merah (dihiris & ditumis)',
      '1 batang kayu manis, 2 bunga lawang, 3 buah pelaga',
      'Daun sup segar, daun bawang & bawang goreng rangup'
    ],
    steps: [
      'Rebus ayam kampung bersama air secukupnya dan sup bunjut dengan api perlahan untuk mengeluarkan pati sup manis semulajadi.',
      'Dalam kuali berasingan, tumis rempah empat sekawan dan hirisan bawang sehingga wangi dan keemasan.',
      'Tuangkan tumisan bawang wangi ke dalam periuk rebusan sup ayam.',
      'Masukkan halia muda, kentang dan lobak merah. Reneh selama 30 minit sehingga ayam kampung empuk lembut.',
      'Perasakan dengan garam bukit secukup rasa. Taburkan bawang goreng dan daun sup sebelum dinikmati panas-panas.'
    ],
    chefTip: 'Ayam kampung dara Khairul FRESH Food mempunyai struktur tulang pejal yang menghasilkan stok sup jernih berkilau tanpa perlu menambah kiub pati tiruan.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80',
  },

  // 7. AYAM BAKAR MADU ROSEMARY (AIR FRYER VIRAL)
  {
    id: 'ayam-bakar-madu-airfryer',
    title: 'Ayam Bakar Madu Berkilat Ala Air Fryer',
    subtitle: 'Kulit garing rangup berkilau madu, isi juicy lembut cair di lidah',
    category: 'goreng',
    categoryLabel: 'Goreng & Bakar',
    badge: 'Air Fryer Pantas 🍯',
    recommendedCut: 'Ayam Seekor Bulat atau Kepak Ayam Segar',
    cutId: 'ayam-bulat',
    prepTime: '25 Minit Bakar (Perap 1 jam)',
    servings: '4 - 6 Orang',
    difficulty: 'Mudah',
    ingredients: [
      '1 ekor Ayam Segar Bulat Khairul FRESH Food (atau 1kg Kepak Ayam)',
      '3 sudu besar madu lebah asli',
      '2 sudu besar sos tiram & 2 sudu besar kicap manis',
      '1 sudu besar minyak bijan',
      '1 sudu serbuk lada hitam kasar & 1 sudu serbuk bawang putih',
      '1 sudu mentega cair (untuk sapuan akhir berkilat)',
      'Sedikit garam dan herba rosemary cincang (pilihan)'
    ],
    steps: [
      'Campurkan madu, sos tiram, kicap manis, minyak bijan, lada hitam dan garam di dalam mangkuk.',
      'Kelar bahagian paha dan dada ayam, lumur perapan sehingga masuk ke bawah kulit ayam.',
      'Perap sekurang-kurangnya 1 jam (atau semalaman dalam chiller peti sejuk).',
      'Masukkan ke dalam bakul Air Fryer. Bakar pada suhu 175°C selama 15 minit pertama.',
      'Balikkan ayam, sapukan baki kuah madu dan mentega cair, bakar semula pada suhu 190°C selama 10 minit sehingga kulit garing berkilat karamel.',
      'Rehatkan ayam selama 5 minit sebelum dipotong supaya jus daging tidak mengalir keluar.'
    ],
    chefTip: 'Sapu mentega cair bercampur madu pada 3 minit terakhir pembakaran. Ini menghasilkan kulit perang keemasan "glassy caramel" seperti ayam panggang hotel 5 bintang.',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&auto=format&fit=crop&q=80',
  },

  // 8. AYAM MASAK LEMAK CILI API NEGERI SEMBILAN
  {
    id: 'ayam-masak-lemak-cili-api',
    title: 'Ayam Masak Lemak Cili Api Negeri Sembilan Asli',
    subtitle: 'Pedas menyengat kunyit hidup, kuah pekat santan segar dan asam keping',
    category: 'kuah',
    categoryLabel: 'Gulai & Kuah Pekat',
    badge: 'Resepi Tok Wan 🌿',
    recommendedCut: 'Ayam Kampung Segar atau Ayam Segar Potong 12',
    cutId: 'potong-12',
    prepTime: '40 Minit',
    servings: '5 - 6 Orang',
    difficulty: 'Sederhana',
    ingredients: [
      '1 ekor Ayam Segar (potong 12)',
      '25-30 biji cili padi kampung (pedas asli)',
      '2 inci kunyit hidup (tumbuk lumat bersama cili padi)',
      '2 batang serai (dititik)',
      '2 mangkuk santan pekat segar (kelapa parut asli)',
      '1 mangkuk santan cair',
      '2 keping asam gelugur (asam keping)',
      '2 helai daun kunyit (dicarik halus)',
      'Garam secukup rasa (tiada bawang digunakan untuk resepi Nogori asli)'
    ],
    steps: [
      'Masukkan ayam, serai titik dan bahan tumbuk (cili padi + kunyit hidup) ke dalam kuali tanpa minyak.',
      'Kecutkan ayam di atas api perlahan sehingga air ayam keluar dan kering sedikit (teknik titik rasa pejal daging).',
      'Masukkan santan cair, kacau rata perlahan-lahan sehingga mendidih.',
      'Masukkan santan pekat dan asam keping. Sentiasa timba kuah dengan senduk agar santan tidak pecah minyak.',
      'Masukkan daun kunyit hiris dan garam. Renehkan sehingga kuah memekat kekuningan pekat berkrim.',
      'Padamkan api dan hidangkan bersama ulam-ulaman kampung dan ikan masin.'
    ],
    chefTip: 'Resepi tradisi Negeri Sembilan tulen TIDAK menggunakan bawang atau minyak. Rasa sedap datang daripada lemak santan segar kelapa parut dan rasa pedas padu kunyit cili padi kampung.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
  },

  // 9. AYAM KICAP PEDAS MANIS BERKICAP PEKAT
  {
    id: 'ayam-kicap-pedas-manis',
    title: 'Ayam Kicap Pedas Manis Lauk Kampung',
    subtitle: 'Lauk paling laris seisi keluarga! Kuah pekat bersalut kentang empuk & cili padi',
    category: 'kuah',
    categoryLabel: 'Gulai & Kuah Pekat',
    badge: 'Kegemaran Kanak-Kanak',
    recommendedCut: 'Potong 12 atau Potong 16',
    cutId: 'potong-12',
    prepTime: '35 Minit',
    servings: '5 - 6 Orang',
    difficulty: 'Mudah',
    ingredients: [
      '1 ekor Ayam Segar (potong 12 atau 16)',
      '2 biji kentang (potong baji & goreng empuk)',
      '1/2 cawan kicap lemak manis cap kipas udang / cap jalen',
      '2 sudu makan kicap pekat karamel & 1 sudu sos tiram',
      '1 biji bawang holland (dihiris gelang)',
      '8 biji cili padi (dikelar dua)',
      '1 batang serai (dititik)',
      'Bahan kisar: 5 ulas bawang merah, 3 ulas bawang putih, 1 inci halia'
    ],
    steps: [
      'Goreng ayam bergaram kunyit sehingga separuh masak, toskan.',
      'Tumis serai titik dan bahan kisar sehingga wangi keemasan.',
      'Masukkan kicap manis, kicap pekat dan sos tiram. Tambah 1/2 cawan air untuk kepekatan kuah.',
      'Masukkan ayam goreng dan kentang goreng, kacau mesra sehingga kuah kicap meresap ke dalam daging ayam.',
      'Masukkan cili padi dan hirisan bawang holland. Masak selama 2-3 minit sehingga bawang sedikit layu manis.',
      'Sedia untuk dihidangkan panas-panas bersama nasi putih.'
    ],
    chefTip: 'Gunakan campuran kicap manis berkualiti tinggi dan sedikit kicap pekat untuk warna hitam legam berkilat tanpa perlu letak gula berlebihan.',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80',
  },

  // 10. AYAM PERCIK KELANTAN KUAH PUTIH BERLEMAK
  {
    id: 'ayam-percik-kelantan',
    title: 'Ayam Percik Kelantan Kuah Putih Berlemak',
    subtitle: 'Aroma panggang arang wangi disalut kuah santan pekat manis serai halia',
    category: 'tradisi',
    categoryLabel: 'Warisan Kenduri',
    badge: 'Istimewa Pantai Timur',
    recommendedCut: 'Ayam Bulat Belah 4 atau Peha Penuh',
    cutId: 'potong-4',
    prepTime: '50 Minit',
    servings: '4 - 6 Orang',
    difficulty: 'Sederhana',
    ingredients: [
      '1 ekor Ayam Segar Khairul FRESH Food (dibelah 4 atau dibuka rama-rama)',
      '3 cawan santan pekat segar',
      '5 batang serai (dikisar halus)',
      '6 ulas bawang merah & 2 inci halia muda (dikisar)',
      '1 keping asam gelugur',
      '2 sudu makan gula melaka / nisan kerek',
      '1 sudu teh garam & secubit lada putih',
      '1 sudu tepung beras (dibancuh sedikit air untuk memekatkan kuah percik)'
    ],
    steps: [
      'Perap ayam dengan sedikit garam, serbuk kunyit dan 2 sudu makan bahan kisar selama 20 minit.',
      'Panggang ayam separuh masak di atas kuali pembakar atau arang.',
      'Di periuk berasingan, masak santan pekat bersama baki bahan kisar serai, halia, asam keping, gula melaka dan garam.',
      'Kacau kuah dengan api perlahan sehingga pekat dan wangi. Masukkan bancuhan tepung beras agar kuah memekat likat.',
      'Ambil ayam yang dipanggang separuh masak tadi, celup atau siram kuah percik tebal-tebal ke seluruh badan ayam.',
      'Bakar semula ayam sambil berulang-ulang disapu kuah percik sehingga kuah garing menyalut isi ayam.',
      'Hidangkan bersama baki kuah percik pekat di atasnya.'
    ],
    chefTip: 'Ayam segar daripada Khairul FRESH Food mempunyai isi pejal berjus, menjadikannya tidak mudah hancur semasa proses balik-balik celup kuah percik panas.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
  },

  // 11. AYAM KAM HEONG CHINESE STYLE (VIRAL SEAFOOD STYLE)
  {
    id: 'ayam-kam-heong',
    title: 'Ayam Kam Heong Aromatik Rempah & Udang Kering',
    subtitle: 'Resepi Cina Muslim viral! Harum udang kering beraroma daun kari dan kicap cili',
    category: 'viral',
    categoryLabel: 'Viral & Trending',
    badge: 'Aroma Wangi Padu',
    recommendedCut: 'Isi Dada Ayam Dadu atau Potong 16 Kecil',
    cutId: 'potong-16',
    prepTime: '30 Minit',
    servings: '4 - 5 Orang',
    difficulty: 'Sederhana',
    ingredients: [
      '600g Isi Ayam Segar (dipotong dadu gigitan)',
      '2 sudu besar serbuk kari daging',
      '2 sudu besar udang kering (direndam air panas & ditumbuk halus)',
      '4 tangkai daun kari segar',
      '8 biji cili padi merah (dihiris)',
      '5 ulas bawang merah & 4 ulas bawang putih (dicincang)',
      '2 sudu besar sos tiram & 1 sudu besar kicap manis',
      '1 sudu kecil gula dan tepung jagung untuk salutan ayam'
    ],
    steps: [
      'Gaul isi ayam bersama serbuk kunyit, garam dan tepung jagung. Goreng sekejap sehingga masak keemasan, toskan.',
      'Panaskan minyak, tumis udang kering tumbuk sehingga garing dan naik aroma wangi semerbak.',
      'Masukkan bawang cincang, cili padi, daun kari dan serbuk kari daging. Tumis hingga pecah minyak wangi.',
      'Masukkan sos tiram, kicap manis dan sedikit air untuk satukan sos.',
      'Masukkan ayam goreng, gaul pantas dengan api besar sehingga setiap ketulan ayam disaluti pes Kam Heong gelap berkilat.',
      'Angkat dan hidang bersama nasi putih panas.'
    ],
    chefTip: 'Kunci aroma wangi "Kam Heong" (harum semerbak) adalah menumis udang kering sehingga garing rangup terlebih dahulu sebelum masukkan serbuk kari dan daun kari.',
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&auto=format&fit=crop&q=80',
  },

  // 12. AYAM RENDANG TOK / MINANG KERISIK WANGI
  {
    id: 'ayam-rendang-kerisik-wangi',
    title: 'Ayam Rendang Minang Kerisik Kelapa Wangi',
    subtitle: 'Raja lauk kenduri raya! Kuah rendang kering perang berkerisik rempah ratus pekat',
    category: 'tradisi',
    categoryLabel: 'Warisan Kenduri',
    badge: 'Tradisi Raya & Kenduri',
    recommendedCut: 'Potong 8 atau Potong 12',
    cutId: 'potong-8',
    prepTime: '60 Minit',
    servings: '6 - 8 Orang',
    difficulty: 'Pakar',
    ingredients: [
      '1 ekor Ayam Segar (potong 8 atau 12)',
      '3 mangkuk santan pekat segar',
      '3 sudu besar kerisik kelapa wangi gelap',
      '2 helai daun kunyit (dihiris halus)',
      '4 helai daun limau purut',
      '2 keping asam keping & 1 ketul gula melaka',
      'Bahan rempah kisar: 15 tangkai cili kering rebus, 10 ulas bawang merah, 5 ulas bawang putih, 2 inci lengkuas, 2 inci halia, 4 batang serai'
    ],
    steps: [
      'Masukkan bahan rempah kisar bersama santan pekat ke dalam kuali besar.',
      'Masak dengan api sederhana sambil dikacau sehingga mendidih dan rempah mula masak wangi.',
      'Masukkan ketulan ayam segar dan asam keping. Renehkan sehingga air ayam mula keluar.',
      'Masukkan kerisik wangi kelapa, daun limau purut dan gula melaka.',
      'Kecilkan api, reneh perlahan-lahan sambil dikacau berkala agar bawah tidak hangus sehingga kuah bertukar warna perang gelap dan berminyak.',
      'Taburkan hirisan daun kunyit, kacau mesra 2 minit lagi sebelum diangkat.'
    ],
    chefTip: 'Gunakan kerisik kelapa yang disangai sehingga perang gelap wangi. Kerisik segar inilah yang memberi rasa berlemak asli rendang warisan tanpa perasa tiruan.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
  },

  // 13. AYAM GORENG KUNYIT MELETUP PASAR MALAM (VIRAL CEPAT)
  {
    id: 'ayam-goreng-kunyit-meletup',
    title: 'Ayam Goreng Kunyit Meletup Pasar Malam',
    subtitle: 'Paling digemari waktu makan tengah hari! Kacang panjang rangup & sambal belacan padu',
    category: 'goreng',
    categoryLabel: 'Goreng & Bakar',
    badge: '15 Minit Siap ⚡',
    recommendedCut: 'Isi Dada Ayam Dadu atau Isi Peha Dadu',
    cutId: 'potong-16',
    prepTime: '20 Minit',
    servings: '4 Orang',
    difficulty: 'Mudah',
    ingredients: [
      '500g Isi Ayam Segar (dipotong dadu nipis)',
      '1 sudu makan serbuk kunyit gred A & 1 sudu kecil garam',
      '1 sudu makan tepung beras (untuk efek garing meletup)',
      '1 ikat kacang panjang (dipotong 2 inci)',
      '1 batang lobak merah (dihiris panjang)',
      '1 biji bawang besar merah (dihiris kasar)',
      '4 biji cili merah & hijau (dihiris serong)',
      'Minyak untuk menggoreng'
    ],
    steps: [
      'Gaul isi ayam bersama serbuk kunyit, garam dan tepung beras.',
      'Panaskan minyak secukupnya dengan api besar.',
      'Goreng ayam sehingga separuh garing keemasan.',
      'Masukkan terus hirisan bawang besar, lobak merah, kacang panjang dan cili ke dalam kuali bersama ayam.',
      'Kacau goreng secara pantas selama 2 minit agar sayur kekal rangup dan warna hijau kekal segar.',
      'Angkat dan toskan minyak. Hidangkan dengan nasi putih panas, telur mata dan sambal belacan limau kasturi.'
    ],
    chefTip: 'Campurkan satu sudu tepung beras semasa memerap ayam bersama kunyit. Tepung beras mengunci kelembapan dalaman isi ayam dan menghasilkan bahagian luar yang kekal garing.',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80',
  },

  // 14. AYAM PENYET SAMBAL TERASI RANGUP
  {
    id: 'ayam-penyet-sambal-terasi',
    title: 'Ayam Penyet Sambal Terasi Jawa Asli',
    subtitle: 'Ayam perap rempah ketumbar digoreng rangup bersama serpihan kremes krup-krup',
    category: 'viral',
    categoryLabel: 'Viral & Trending',
    badge: 'Sambal Berapi 🌶️',
    recommendedCut: 'Ayam Belah 4 (Potong 4) atau Drumstick & Peha',
    cutId: 'potong-4',
    prepTime: '45 Minit',
    servings: '4 Orang',
    difficulty: 'Sederhana',
    ingredients: [
      '1 ekor Ayam Segar (potong 4 sukuan)',
      'Bahan ungkep ayam: 5 ulas bawang putih, 2 sudu makan biji ketumbar sangai, 2 inci kunyit, 1 inci lengkuas, garam secukupnya',
      'Bahan Sambal Terasi: 15 biji cili padi, 2 biji tomato masak, 1 sudu besar belacan bakar (terasi), 4 ulas bawang merah, 1 biji limau kasturi',
      'Pelengkap: Tempe goreng, tauhu goreng, ulam timun dan kobis'
    ],
    steps: [
      'Rebus ungkep ayam bersama bahan rempah tumbuk dan sedikit air sehingga air menyusut dan rempah meresap ke dalam tulang.',
      'Goreng ayam dalam minyak panas sehingga garing perang.',
      'Goreng sekejap cili padi, tomato dan bawang untuk sambal di dalam minyak panas, lalu angkat.',
      'Lumatkan bahan sambal bersama belacan bakar, garam dan gula menggunakan cobek/lesung batu.',
      'Perahkan jus limau kasturi segar ke atas sambal.',
      'Letakkan ayam goreng atas papan penyet/lesung, tekan atau penyet ayam dengan anak lesung hingga leper.',
      'Sapu sambal terasi di atas ayam dan hidangkan bersama tempe, tauhu dan sup panas.'
    ],
    chefTip: 'Proses ungkep (rebus rempah perlahan) adalah kunci utama ayam penyet. Tulang ayam akan menjadi lembut beraroma ketumbar wangi sehingga ke sum-sum.',
    image: 'https://images.unsplash.com/photo-1505253758473-96b3015f240a?w=800&auto=format&fit=crop&q=80',
  },

  // 15. AYAM PAPRIK THAI PAD PED (ALA RESTORAN SIAM)
  {
    id: 'ayam-paprik-thai',
    title: 'Ayam Paprik Thai Pad Ped Daun Limau Purut',
    subtitle: 'Kuah merah pedas masam manis wangi serai, sayur campur segar rangup',
    category: 'kuah',
    categoryLabel: 'Gulai & Kuah Pekat',
    badge: 'Ala Kedai Siam',
    recommendedCut: 'Dada Ayam Fillet atau Potong 16',
    cutId: 'potong-16',
    prepTime: '25 Minit',
    servings: '4 - 5 Orang',
    difficulty: 'Mudah',
    ingredients: [
      '500g Isi Ayam Segar (dipotong nipis)',
      '2 sudu besar pes cili kering kisar',
      '2 sudu besar sos cili, 2 sudu besar sos tiram, 1 sudu sos tomato',
      '1 sudu kicap manis & 1 sudu sos ikan Thai',
      '4 helai daun limau purut (dicarik)',
      '1 batang serai (dihiris serong nipis)',
      'Sayuran: Putik jagung, bunga kobis, kacang buncis, lobak merah'
    ],
    steps: [
      'Goreng kilas isi ayam dalam sedikit minyak sehingga bertukar warna putih masak, toskan.',
      'Dalam kuali sama, tumis bawang putih, serai dan cili kisar sehingga pecah minyak wangi.',
      'Masukkan semua jenis sos (tiram, cili, tomato, kicap dan sos ikan) bersama 1/2 cawan air.',
      'Masukkan daun limau purut carik untuk aroma herba Siam.',
      'Masukkan ayam dan sayur-sayuran campur. Kacau dengan api besar selama 2-3 minit supaya sayur tidak terlalu lembik.',
      'Perasakan dengan sedikit gula jika perlu. Hidang bersama nasi putih dan telur dadar panas.'
    ],
    chefTip: 'Gunakan sos ikan Thai asli dan carik daun limau purut menggunakan tangan (jangan hiris pisau) untuk melepaskan minyak aromatik sitrus semulajadi.',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=80',
  },

  // 16. AYAM TANDOORI BAKAR & SOS PUDINA (VIRAL MAMAK)
  {
    id: 'ayam-tandoori-mamak',
    title: 'Ayam Tandoori Masala & Sos Pudina Sejuk',
    subtitle: 'Perapan yogurt asli bersama rempah masala pekat beraroma asap smokey',
    category: 'goreng',
    categoryLabel: 'Goreng & Bakar',
    badge: 'Rempah Rempah Padu',
    recommendedCut: 'Drumstick & Peha atau Ayam Belah 4',
    cutId: 'potong-4',
    prepTime: '30 Minit Bakar (Perap 3 jam)',
    servings: '4 Orang',
    difficulty: 'Sederhana',
    ingredients: [
      '4 ketul Peha Penuh Ayam Segar Khairul FRESH Food',
      '1 cawan yogurt asli (Greek yogurt tanpa gula)',
      '2 sudu besar serbuk tandoori masala asli',
      '1 sudu makan serbuk kasoori methi (daun halba kering)',
      '1 sudu makan jus lemon segar',
      'Bahan kisar: 1 inci halia, 6 ulas bawang putih',
      'Sos Pudina: Daun pudina segar, daun ketumbar, yogurt, cili hijau dan garam'
    ],
    steps: [
      'Kelar bahagian isi peha ayam secara menyerong agar perapan masuk jauh ke dalam.',
      'Campurkan yogurt, serbuk tandoori, bahan kisar, jus lemon, kasoori methi dan garam dalam mangkuk besar.',
      'Lumur perapan tebal-tebal pada ayam. Simpan dalam peti sejuk minimum 3 jam (lebih sedap semalaman).',
      'Bakar dalam oven / Air Fryer pada suhu 200°C selama 25-30 minit sehingga tepi kulit sedikit hangus beraroma arang smokey.',
      'Kisar semua bahan sos pudina sehingga halus berkrim.',
      'Hidangkan ayam tandoori merah berapi bersama sos pudina sejuk, hirisan bawang dan roti naan atau nasi briyani.'
    ],
    chefTip: 'Yogurt asli mengandungi asid laktik semulajadi yang melembutkan serat isi ayam menjadi empuk berjus tanpa mengeringkan daging semasa dibakar suhu tinggi.',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
  },

  // 17. AYAM PONGTEH NYONYA MELAKA
  {
    id: 'ayam-pongteh-nyonya',
    title: 'Ayam Pongteh Warisan Nyonya Melaka',
    subtitle: 'Renehan ayam bersama taucu manis, cendawan shiitake dan ubi kentang empuk',
    category: 'tradisi',
    categoryLabel: 'Warisan Kenduri',
    badge: 'Warisan Nyonya',
    recommendedCut: 'Potong 12 atau Potong 16',
    cutId: 'potong-12',
    prepTime: '45 Minit',
    servings: '5 - 6 Orang',
    difficulty: 'Sederhana',
    ingredients: [
      '1 ekor Ayam Segar (potong 12)',
      '2 sudu besar taucu manis berkualiti (dilecek kasar)',
      '6 biji cendawan shiitake kering (direndam air panas & dibelah dua)',
      '2 biji kentang (potong baji besar)',
      '8 ulas bawang merah & 6 ulas bawang putih (ditumbuk)',
      '1 ketul gula melaka kecil',
      '2 sudu besar kicap pekat manis',
      'Air rendaman cendawan shiitake (untuk stok kuah wangi)'
    ],
    steps: [
      'Tumis bawang tumbuk sehingga wangi dan keemasan.',
      'Masukkan taucu lecek, tumis perlahan sehingga naik bau harum kacang soya yang menyelerakan.',
      'Masukkan ketulan ayam segar, kacau rata bersama taucu selama 5 minit.',
      'Masukkan cendawan shiitake, air rendaman cendawan, kicap pekat dan gula melaka.',
      'Masukkan kentang baji, reneh dengan api kecil selama 30 minit sehingga kuah menjadi pekat likat dan kentang empuk.',
      'Rasa kuah sebelum letak garam (kerana taucu sudah sedia masin lemak). Hidang bersama nasi putih.'
    ],
    chefTip: 'Jangan buang air rendaman cendawan shiitake! Air tersebut kaya dengan rasa umami semulajadi yang menjadikan kuah pongteh harum berkali ganda.',
    image: 'https://images.unsplash.com/photo-1514944298352-fae06e78d91f?w=800&auto=format&fit=crop&q=80',
  },

  // 18. AYAM KURMA KENTANG KLASIK KENDURI
  {
    id: 'ayam-kurma-kenduri',
    title: 'Ayam Kurma Berempah Putih Kenduri Lembut',
    subtitle: 'Rempah kurma wangi beraroma rempah empat sekawan, santan pekat dan bawang goreng',
    category: 'kuah',
    categoryLabel: 'Gulai & Kuah Pekat',
    badge: 'Tradisi Kenduri',
    recommendedCut: 'Potong 12 (Kenduri) atau Potong 8',
    cutId: 'potong-12',
    prepTime: '40 Minit',
    servings: '6 Orang',
    difficulty: 'Mudah',
    ingredients: [
      '1 ekor Ayam Segar Khairul FRESH Food (potong 12)',
      '1 paket rempah kurma daging/ayam asli (dibancuh menjadi pes pekat)',
      '2 cawan santan segar',
      '2 biji kentang (potong baji) & 1 biji tomato (dibelah 4)',
      '2 biji cili hijau besar & 1 biji cili merah besar',
      'Bahan rempah tumis: 1 batang kayu manis, 2 bunga lawang, 3 buah pelaga',
      'Bahan kisar: 6 ulas bawang merah, 4 ulas bawang putih, 2 inci halia'
    ],
    steps: [
      'Panaskan sedikit minyak, tumis rempah empat sekawan dan bahan kisar sehingga wangi.',
      'Masukkan pes rempah kurma, tumis dengan api sederhana sehingga terbit minyak wangi.',
      'Masukkan ketulan ayam dan kentang, gaul rata sehingga ayam bersalut rempah kurma.',
      'Masukkan santan cair, renehkan sehingga kentang mula empuk dan ayam masak lembut.',
      'Masukkan santan pekat, cili hijau, cili merah dan tomato belah. Perasakan dengan garam secukupnya.',
      'Reneh selama 5-7 minit lagi dengan api perlahan sehingga kuah kurma memekat putih berkrim.',
      'Tabur bawang goreng rangup sebelum dihidangkan.'
    ],
    chefTip: 'Masukkan cili hijau dan buah tomato pada 5 minit terakhir memasak agar bentuknya tidak hancur dan menyerap aroma kuah kurma dengan sempurna.',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80',
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
    icon: 'Scissors',
    title: 'Teknik Asingkan Porsi (Meal-Prep Portioning)',
    desc: 'Asingkan bahagian ayam mengikut sukatan sekali masak (cth: 4 ketul lauk tengah hari). Elakkan mencairbekukan keseluruhan pek berulang kali untuk menjaga kebersihan higienik.',
  },
  {
    icon: 'ShieldCheck',
    title: '100% Halal Diiktiraf & Bersih',
    desc: 'Semua bekalan ayam disahkan Halal, dicuci bersih dengan air mengalir suci, serta bebas kotoran.',
  }
];
