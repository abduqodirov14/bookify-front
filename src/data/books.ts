import { Book } from '../types';

// ALL books below are confirmed public-domain works from Project Gutenberg.
// Gutenberg IDs are listed in comments for verification.
// Cover images: Open Library Covers API by ISBN (Penguin/Oxford Classics editions).
// Fallback: spineColor + title renders as typographic cover if image 404s.

export const BOOKS: Book[] = [

  // ── CONFIRMED PUBLIC DOMAIN — PROJECT GUTENBERG ──────────────────────────
  // (All original works published before 1928; all Gutenberg IDs verified)

  {
    // gutenberg.org/ebooks/2554
    id: "jinoyat-va-jazo",
    title: "Jinoyat va Jazo",
    authorId: "dostoevsky",
    authorName: "Fyodor Dostoyevskiy",
    category: "Rus Adabiyoti",
    // Open Library: Penguin Classics ISBN 978-0-14-044913-6
    coverImage: "https://covers.openlibrary.org/b/isbn/9780140449136-L.jpg",
    spineColor: "#16213E",
    description: "Talaba Raskolnikov o'zini qoida ustida turgan deb hisoblab, bir sudxo'r kampirni o'ldiradi. Jinoyatdan keyingi azob va vijdon azobi uning ruhini ezadi. Dostoyevskiyning psixologik realizmining cho'qqisi.",
    publishedYear: 1866,
    pages: 574,
    audioDuration: "",
    rating: 4.9,
    reviewsCount: 0,
    narrator: undefined,
    featuredQuote: "Azob — bu ulug'likdir. Insonlar buyuk bo'lish uchun azob chekishadi.",
    chapters: [
      {
        id: "jj1",
        number: 1,
        title: "1-Bob: Haymarket ko'chasi",
        content: `Iyulning boshida, shom quyoshi botishga yaqin, bir kichkina mansardadan ko'chaga chiqqan yosh talaba Haymarket maydoniga qarab sekin yurib ketdi.\n\nSariq, issiq havo unga og'ir botayotgan edi. Uni asab ezayotgan edi, lekin bu safar qo'rquv emas — boshqa bir narsa edi. Bir qaror pishib qolgandek edi ichida.`
      }
    ]
  },

  {
    // gutenberg.org/ebooks/28054
    id: "aka-ukalar-karamazov",
    title: "Aka-Ukalar Karamazov",
    authorId: "dostoevsky",
    authorName: "Fyodor Dostoyevskiy",
    category: "Rus Adabiyoti",
    // Open Library: Penguin Classics ISBN 978-0-14-044924-2
    coverImage: "https://covers.openlibrary.org/b/isbn/9780140449242-L.jpg",
    spineColor: "#0D1B2A",
    description: "Ota Fyodor Karamazov va uning uch o'g'li — Dmitriy, Ivan va Alyosha — o'rtasidagi ruhiy va falsafiy ziddiyat. Xudo, axloq, aql va imon haqidagi Dostoyevskiyning so'nggi va eng buyuk romani.",
    publishedYear: 1880,
    pages: 796,
    audioDuration: "",
    rating: 4.9,
    reviewsCount: 0,
    narrator: undefined,
    featuredQuote: "Agar Xudo bo'lmasa, hamma narsa mumkin.",
    chapters: [
      {
        id: "akk1",
        number: 1,
        title: "1-Bob: Fyodor Pavlovich Karamazov",
        content: `Aleksey Fyodorovich Karamazov bizning uyezdimizning bir yer egasining kenja o'g'li edi. Bu yer egasi — Fyodor Pavlovich Karamazov — o'z vaqtida tarqoq va g'alati odam sifatida tanilgan edi, lekin asli baxtsiz emas, aksincha, juda ham amaliy odam edi.`
      }
    ]
  },

  {
    // gutenberg.org/ebooks/8117
    id: "iblislar",
    title: "Iblislar",
    authorId: "dostoevsky",
    authorName: "Fyodor Dostoyevskiy",
    category: "Rus Adabiyoti",
    // Open Library: Penguin Classics ISBN 978-0-14-044799-6
    coverImage: "https://covers.openlibrary.org/b/isbn/9780140447996-L.jpg",
    spineColor: "#1A1A2E",
    description: "Siyosiy nihilizm va inqilobiy harakatga keskin tanqid. Nikolay Stavrogin boshchiligidagi maxfiy guruh shaharchani falokatga sürüklyaydi. Dostoyevskiy bu romanda g'oyaviy radikalizm qanchalik halokatli bo'lishini ko'rsatadi.",
    publishedYear: 1872,
    pages: 768,
    audioDuration: "",
    rating: 4.8,
    reviewsCount: 0,
    narrator: undefined,
    featuredQuote: "Agar Xudo yo'q bo'lsa, men — Xudoman.",
    chapters: [
      {
        id: "ibl1",
        number: 1,
        title: "1-Bob: Stepan Trofimovich Verxovenskiy",
        content: `Men Stepan Trofimovich Verxovenskiy haqida so'z yuritishdan oldin, uning bizning kichik shahrimizdagi muqomi haqida bir necha og'iz aytishim kerak. U nisbatan olimona, manman odam edi; ammo uning olimligidan biz foyda ko'rganmiz.`
      }
    ]
  },

  {
    // gutenberg.org/ebooks/2600
    id: "urush-va-tinchlik",
    title: "Urush va Tinchlik",
    authorId: "tolstoy",
    authorName: "Lev Tolstoy",
    category: "Rus Adabiyoti",
    // Open Library: Oxford World's Classics ISBN 978-0-19-923276-5
    coverImage: "https://covers.openlibrary.org/b/isbn/9780199232765-L.jpg",
    spineColor: "#2C1810",
    description: "Napoleon istilosiga qarshi Rossiya kurashini ko'rsatuvchi epik roman. Bolkonskiy, Bezuxov va Rostov oilalari orqali urush, sevgi, o'lim va insoniy qadr-qimmat tasvirlanadi.",
    publishedYear: 1869,
    pages: 1225,
    audioDuration: "",
    rating: 4.9,
    reviewsCount: 0,
    narrator: undefined,
    featuredQuote: "Hammasi o'tadi — azob ham, quvonch ham. Abadiy narsa — faqat sevgi.",
    chapters: [
      {
        id: "ut1",
        number: 1,
        title: "1-Bob: Anna Pavlovnaning ziyofati",
        content: `—Eh bien, mon prince. Genuya va Lukka endi Bonapartning shaxsiy mulkiga aylandi. Men sizni ogohlantirayapman — agar siz bu yerdagi ahvolni hali ham qanday bo'lmasin deb qarasangiz...\n\nShunday dedi Anna Pavlovna Sherer, 1805 yilning iyulida taniqli davlat arbobi knyaz Vasiliyni qabul qila turib.`
      }
    ]
  },

  {
    // gutenberg.org/ebooks/5200
    id: "metamorfoz",
    title: "Metamorfoz",
    authorId: "kafka",
    authorName: "Franz Kafka",
    category: "Nemis Adabiyoti",
    // Open Library: Dover Thrift ISBN 978-0-486-29030-1
    coverImage: "https://covers.openlibrary.org/b/isbn/9780486290300-L.jpg",
    spineColor: "#1C1C3A",
    description: "Bir kuni ertalab Grigori Zamza uyg'onib o'zini ulkan hasharotga aylanganini ko'radi. Oila unga bo'lgan munosabat sekin o'zgaradi. Kafka yozgan bu qissa alienatsiya va zamonaviy hayotning absurdligini tasvirlaydi.",
    publishedYear: 1915,
    pages: 68,
    audioDuration: "",
    rating: 4.7,
    reviewsCount: 0,
    narrator: undefined,
    featuredQuote: "Kimdir Jozef K.ga tuhmat qilgan bo'lsa kerak — sabab noma'lum, ammo u qamoqqa olindi.",
    chapters: [
      {
        id: "mm1",
        number: 1,
        title: "1-Bob: O'zgarish",
        content: `Grigori Zamza bir kuni ertalab notinch tushlardan uyg'onib, karavotida o'zini hasharotga aylangan holda ko'rdi. U qattiq, qobiqli orqasiga ag'anagan edi; boshini ko'tarsa, qorin tomonini ko'rdi — qo'ng'ir, qavariqlangan, qalin.`
      }
    ]
  },

  {
    // gutenberg.org/ebooks/996
    id: "don-kixot",
    title: "Don Kixot",
    authorId: "cervantes",
    authorName: "Miguel de Cervantes",
    category: "Ispan Adabiyoti",
    // Open Library: Penguin Classics ISBN 978-0-14-243723-0
    coverImage: "https://covers.openlibrary.org/b/isbn/9780142437230-L.jpg",
    spineColor: "#5C2D0E",
    description: "Ritsarlik romanlarini o'qib aqlini yo'qotgan La Manchalik hidalgo Don Kixot o'z xayoliy sarguzashtlariga ot ustida otlangan. Jahon adabiyotining birinchi zamonaviy romani deb tan olingan.",
    publishedYear: 1605,
    pages: 1072,
    audioDuration: "",
    rating: 4.8,
    reviewsCount: 0,
    narrator: undefined,
    featuredQuote: "Erkinlik — osmon o'z in'om etgan eng qimmatli ne'matdir.",
    chapters: [
      {
        id: "dk1",
        number: 1,
        title: "1-Bob: La Manchali fidoyi",
        content: `La Mancha viloyatida, nomi yodimda qolmagan bir qishloqda, yaqinda bir hidalgo yashardi — u doimiy ravishda nayzalar, eski qalqon, ko'hna ot va quvg'in it bilan yashardi.\n\nU qishilmas ovchi edi va ko'p vaqtini ritsarlik romanlari mutolaa qilishga sarflardi.`
      }
    ]
  },

  {
    // gutenberg.org/ebooks/1184
    id: "monte-kristo-konti",
    title: "Monte-Kristo Konti",
    authorId: "dumas",
    authorName: "Alexandre Dumas",
    category: "Frantsuz Adabiyoti",
    // Open Library: Penguin Classics ISBN 978-0-14-044926-6
    coverImage: "https://covers.openlibrary.org/b/isbn/9780140449266-L.jpg",
    spineColor: "#1B2A1B",
    description: "Yosh dengizchi Edmond Dantes nohaq qamoqqa tashlanadi. U qochib, boylik topib, Monte-Kristo Konti niqobi ostida dushmanlaridan qasos oladi. Qasos, adolat va umid haqidagi dunyoning eng mashhur sarguzasht romani.",
    publishedYear: 1844,
    pages: 1276,
    audioDuration: "",
    rating: 4.9,
    reviewsCount: 0,
    narrator: undefined,
    featuredQuote: "Barcha insoniy donishmandligi ikki so'zda mujassamlashgan: kutmoq va umid qilmoq.",
    chapters: [
      {
        id: "mk1",
        number: 1,
        title: "1-Bob: Marseyl — Kemaning kelishi",
        content: `1815 yilning 24 fevralida Marseyl limonga «Faraon» keması kirib keldi. Bu kema Smirna, Triest va Neapoldan kelgan edi. Kemadagi dengizchilar qanchalik quvnoq ko'rinsalar, kapitan shunchalik g'amgin edi.`
      }
    ]
  },

  {
    // gutenberg.org/ebooks/215
    id: "yovvoyi-chaqiriq",
    title: "Yovvoyi Chaqiriq",
    authorId: "jack-london",
    authorName: "Jack London",
    category: "Amerika Adabiyoti",
    // Open Library: Dover Thrift ISBN 978-0-486-26472-1
    coverImage: "https://covers.openlibrary.org/b/isbn/9780486264721-L.jpg",
    spineColor: "#1A2F1A",
    description: "Kentukiyalik uy iti Bak Alaska tundrasiga olib ketilinadi va qiyin sharoitda omon qolish uchun kurashadi. Tabiat va insoniyat, sivilizatsiya va yovvoyilik haqidagi Jack Londonning eng mashhur asari.",
    publishedYear: 1903,
    pages: 172,
    audioDuration: "",
    rating: 4.7,
    reviewsCount: 0,
    narrator: undefined,
    featuredQuote: "Hayot — bu yovvoyilikka qaytish; kuchli bo'l, yoki o'l.",
    chapters: [
      {
        id: "yc1",
        number: 1,
        title: "1-Bob: Ibtidoiy odatning uyg'onishi",
        content: `Bak Melanpus Miller sudyaning katta uyida istiqomat qilardi. Santa Klaraning quyoshli vodiysi, Metropoliten Oltin Maydon deb atalardi. Uyda esa Bak podshohdek yashardi.`
      }
    ]
  },

  // ── O'ZBEK ADABIYOTI (alohida bo'lim, tarjima emas) ──────────────────────

  {
    // Published 1925; author Qodiriy died 1938. US public domain (95 yr rule).
    id: "otkan-kunlar",
    title: "O'tkan Kunlar",
    authorId: "abdulla-qodiriy",
    authorName: "Abdulla Qodiriy",
    category: "O'zbek Adabiyoti",
    // Open Library OLID OL28471897M
    coverImage: "https://covers.openlibrary.org/b/olid/OL28471897M-L.jpg",
    spineColor: "#8B2500",
    description: "O'zbek adabiyotining birinchi milliy romani. XIX asr Qo'qon xonligi davrida Otabek va Kumushbibining muhabbat fojiasi orqali jamiyat dardi ko'rsatiladi.",
    publishedYear: 1925,
    pages: 412,
    audioDuration: "14 soat 20 daqiqa",
    rating: 4.9,
    reviewsCount: 0,
    narrator: "Afzal Rafiqov",
    featuredQuote: "Moziyga qaytib ish ko'rmak xayrlidir, deydilar...",
    chapters: [
      {
        id: "ok1",
        number: 1,
        title: "1-Bob: 1264-hijriy yil",
        content: `1264-nchi hijriy, dalv oyining 17-nchi kuni, qishki quyosh botishga yovuqlashgan bir vaqtda Toshkentning Samarqand darvozasiga yaqin bir saroyga Otabek ismli yosh yigit kirib keldi.`
      }
    ]
  }
];