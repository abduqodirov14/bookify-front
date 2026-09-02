import { Book } from '../types';

export const BOOKS: Book[] = [
  {
    id: "otkan-kunlar",
    title: "O'tkan Kunlar",
    authorId: "abdulla-qodiriy",
    authorName: "Abdulla Qodiriy",
    category: "Mumtoz Meros",
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    spineColor: "#8B2500",
    description: "O'zbek adabiyotining ilk milliy romani. Unda XIX asr o'rtalaridagi Qo'qon xonligi davridagi ijtimoiy-siyosiy hayot, Otabek va Kumushbibining pok va fojiali muhabbati yuksak mahorat ila tasvirlangan.",
    publishedYear: 1925,
    pages: 412,
    audioDuration: "14 soat 20 daqiqa",
    rating: 4.98,
    reviewsCount: 1420,
    narrator: "Afzal Rafiqov",
    featuredQuote: "Moziyga qaytib ish ko'rmak xayrlidir, deydilar...",
    chapters: [
      {
        id: "c1",
        number: 1,
        title: "1-Bob: 1264-hijriy, dalv oyining 17-kuni",
        content: `1264-nchi hijriy, dalv oyining 17-nchi kuni, qishki quyosh botishga yovuqlashgan bir vaqtda Toshkentning Samarqand darvozasiga yaqin bir saroyga Otabek ismli yosh yigit kirib keldi.

Saroy ichi gavjum, turli viloyatlardan kelgan savdogarlar, karvonboshilar o'z yuklarini joylashtirish bilan ovora edilar. Otabek o'zining xushmuomala xulqi, viqorli qomati va ma'noli nigohlari bilan atrofdagilardan ajralib turardi. U Marg'ilondan keltirilgan shoyi va atlas mollarini joylashtirgach, saroybon bilan iliq ko'rishdi.

— Xush kelibsiz, Otabekbek! Safar muborak bo'lsin! — dedi saroybon samimiyat bilan. — Marg'ilon havosi qanday?

— Shukr, oqsoqol, yo'llar tinch, el osoyishta, — deb javob berdi Otabek muloyimlik bilan jilmayib.`
      },
      {
        id: "c2",
        number: 2,
        title: "2-Bob: Marg'ilon orzusi va Kumushbibi visoli",
        content: `Marg'ilon tongi o'zgacha bir nafosat bilan otdi. Shaharning chetidagi salqin bog'lar ichida joylashgan Mirzakarim qutidorning hovlisida sokinlik hukmron edi.

Kumushbibi qo'lidagi ipak ro'molni nozik barmoqlari bilan tikar ekan, yuragida noma'lum bir hayajon tuyardi. U deraza pardasini ohista surib, bog'dagi anvoyi gullarga boqdi. Subhidam shabadasi uning mayin kokillarini o'ynatar, qalbida esa yangi bir his — muhabbat kurtak yozayotgan edi.`
      },
      {
        id: "c3",
        number: 3,
        title: "3-Bob: Otabekning yurak sirlari",
        content: `Otabek Marg'ilonda ko'rgan o'sha munavvar siymoni — Kumushbibini aslo xayolidan chiqara olmasdi. Toshkentga qaytgan bo'lsa-da, uning butun fikr-u zikri yana o'sha qutidor hovlisida qolgan edi.

O'z xonasida kitob mutolaa qilib o'tirgan Otabekning ko'z oldida faqat birgina chehra namoyon bo'lardi. Dunyoda har bir insonning o'z taqdiri, o'z baxti va o'z fojiasi bor deganlari rost ekan...`
      }
    ]
  },
  {
    id: "mehrobdan-chayon",
    title: "Mehrobdan Chayon",
    authorId: "abdulla-qodiriy",
    authorName: "Abdulla Qodiriy",
    category: "Tarixiy Romanlar",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    spineColor: "#1A365D",
    description: "Xudoyorxon saroyidagi munofiqlik, saroy fitnalari va xalq dardi. Mirzo Anvar va Ra'noning fidokorona sevgisi.",
    publishedYear: 1928,
    pages: 360,
    audioDuration: "12 soat 45 daqiqa",
    rating: 4.95,
    reviewsCount: 980,
    narrator: "O'tkir Hoshimov ovozi",
    featuredQuote: "Haqiqat egiladi, bukiladi, ammo aslo sinmaydi!",
    chapters: [
      {
        id: "mc1",
        number: 1,
        title: "1-Bob: Mirzo Anvar va xon saroyi",
        content: `Xudoyorxon saltanatining dabdabali saroyida har bir devorning o'z qulog'i, har bir burchakning o'z xufyasi bor edi. Saroy mirzolarining eng iqtidorlisi Mirzo Anvar o'zining adolati va rostgo'yligi bilan mashhur edi.`
      }
    ]
  },
  {
    id: "kecha-va-kunduz",
    title: "Kecha va Kunduz",
    authorId: "cholpon",
    authorName: "Abdulhamid Cho'lpon",
    category: "Jadid Adabiyoti",
    coverImage: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80",
    spineColor: "#2D3748",
    description: "Zebi va uning fojiali qismati orqali mustamlaka va xurofot kishanlariga solingan jamiyat dardi mahorat bilan ochib berilgan.",
    publishedYear: 1936,
    pages: 340,
    audioDuration: "11 soat 15 daqiqa",
    rating: 4.97,
    reviewsCount: 1150,
    narrator: "Dilorom Karimova",
    featuredQuote: "Tirik bo'lsak — birga bo'larmiz, o'lsak — tuprog'imiz bir joyda!",
    chapters: [
      {
        id: "kk1",
        number: 1,
        title: "1-Bob: Bahor kechasi va Zebining qo'shig'i",
        content: `Kechasi bilan yomg'ir yog'ib chiqqan, tongga yaqin havo ochilib, ko'm-ko'k maysalar ustida shabnam jilvalanardi. Zebi qiz dugonalari bilan sumalak pishirish taraddudida edi.`
      }
    ]
  },
  {
    id: "yulduzli-tunlar",
    title: "Yulduzli Tunlar (Bobur)",
    authorId: "pirimqul-qodirov",
    authorName: "Pirimqul Qodirov",
    category: "Tarixiy Romanlar",
    coverImage: "https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=600&q=80",
    spineColor: "#744210",
    description: "Zahiriddin Muhammad Boburning murakkab va buyuk hayot yo'li, Vatan sog'inchi, sarkardalik va shoirlik dahosi.",
    publishedYear: 1978,
    pages: 520,
    audioDuration: "18 soat 10 daqiqa",
    rating: 4.99,
    reviewsCount: 2300,
    narrator: "Sanjar Sa'diyev",
    featuredQuote: "Tole' yo'qi jonimg'a balolig' bo'ldi, Har ishnikim ayladim — xatolig' bo'ldi...",
    chapters: [
      {
        id: "yt1",
        number: 1,
        title: "1-Bob: Andijon qal'asi uzra yulduzlar",
        content: `O'n ikki yoshli Bobur Mirzo otasi Umarshayx Mirzoning to'satdan vafot etgani haqidagi shum xabarni eshitganida, butun Farg'ona vodiysi ustida qora bulutlar quyuqlashgan edi.`
      }
    ]
  },
  {
    id: "dunyoning-ishlari",
    title: "Dunyoning Ishlari",
    authorId: "otkir-hoshimov",
    authorName: "O'tkir Hoshimov",
    category: "Falsafa & Ma'rifat",
    coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
    spineColor: "#702459",
    description: "Ona mehri, bolalik xotiralari va insoniylik qadriyatlari haqida yozilgan eng ta'sirli va samimiy qissalar to'plami.",
    publishedYear: 1982,
    pages: 280,
    audioDuration: "8 soat 50 daqiqa",
    rating: 4.99,
    reviewsCount: 3100,
    narrator: "O'tkir Hoshimov shaxsan",
    featuredQuote: "Ona — dunyodagi eng buyuk va eng kechirimli mo''jizadir.",
    chapters: [
      {
        id: "di1",
        number: 1,
        title: "1-Bob: Oq, oydin kechalar",
        content: `Onam meni yaxshi ko'rardi. Juda-juda yaxshi ko'rardi. Qish kunlari pechka yonida ertak aytib berar, men esa uning bag'riga boshimni qo'yib uxlab qolardim.`
      }
    ]
  },
  {
    id: "shum-bola",
    title: "Shum Bola",
    authorId: "gafur-gulom",
    authorName: "G'afur G'ulom",
    category: "Badiiy Adabiyot",
    coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    spineColor: "#22543D",
    description: "O'tkir satira, xalqona donishmandlik va o'zbekona yumor bilan yo'g'rilgan o'lmas qissa.",
    publishedYear: 1936,
    pages: 220,
    audioDuration: "6 soat 30 daqiqa",
    rating: 4.96,
    reviewsCount: 1840,
    narrator: "Hojiakbar Nurmatov",
    featuredQuote: "Xo'sh, shunday qilib, o'zimizning Sargardon qishlog'idan boshlaymiz...",
    chapters: [
      {
        id: "sb1",
        number: 1,
        title: "1-Bob: Toshkent ko'chalari bo'ylab",
        content: `Mening otam boy odam emas edi. Shuning uchun ham mening bolaligim ko'cha-ko'ylarda, saroy va bozorlarda turfa sarguzashtlar bilan o'tdi.`
      }
    ]
  }
];
