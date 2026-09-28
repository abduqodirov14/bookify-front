import { Book } from '@/types';

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
    description: "Talaba Raskolnikov oʻzini qoida ustida turgan deb hisoblab, bir sudxoʻr kampirni oʻldiradi. Jinoyatdan keyingi azob va vijdon azobi uning ruhini ezadi. Dostoyevskiyning psixologik realizmining choʻqqisi.",
    publishedYear: 1866,
    pages: 574,
    audioDuration: "",
    rating: 4.9,
    reviewsCount: 0,
    narrator: undefined,
    featuredQuote: "Azob — bu ulugʻlikdir. Insonlar buyuk boʻlish uchun azob chekishadi.",
    chapters: [
      {
        id: "jj1",
        number: 1,
        title: "1-Bob: Haymarket koʻchasi",
        content: `Iyulning boshida, shom quyoshi botishga yaqin, bir kichkina mansardadan koʻchaga chiqqan yosh talaba Haymarket maydoniga qarab sekin yurib ketdi.\n\nSariq, issiq havo unga ogʻir botayotgan edi. Uni asab ezayotgan edi, lekin bu safar qoʻrquv emas — boshqa bir narsa edi. Bir qaror pishib qolgandek edi ichida.`
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
    description: "Ota Fyodor Karamazov va uning uch oʻgʻli — Dmitriy, Ivan va Alyosha — oʻrtasidagi ruhiy va falsafiy ziddiyat. Xudo, axloq, aql va imon haqidagi Dostoyevskiyning soʻnggi va eng buyuk romani.",
    publishedYear: 1880,
    pages: 796,
    audioDuration: "",
    rating: 4.9,
    reviewsCount: 0,
    narrator: undefined,
    featuredQuote: "Agar Xudo boʻlmasa, hamma narsa mumkin.",
    chapters: [
      {
        id: "akk1",
        number: 1,
        title: "1-Bob: Fyodor Pavlovich Karamazov",
        content: `Aleksey Fyodorovich Karamazov bizning uyezdimizning bir yer egasining kenja oʻgʻli edi. Bu yer egasi — Fyodor Pavlovich Karamazov — oʻz vaqtida tarqoq va gʻalati odam sifatida tanilgan edi, lekin asli baxtsiz emas, aksincha, juda ham amaliy odam edi.`
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
    description: "Siyosiy nihilizm va inqilobiy harakatga keskin tanqid. Nikolay Stavrogin boshchiligidagi maxfiy guruh shaharchani falokatga sürüklyaydi. Dostoyevskiy bu romanda gʻoyaviy radikalizm qanchalik halokatli boʻlishini koʻrsatadi.",
    publishedYear: 1872,
    pages: 768,
    audioDuration: "",
    rating: 4.8,
    reviewsCount: 0,
    narrator: undefined,
    featuredQuote: "Agar Xudo yoʻq boʻlsa, men — Xudoman.",
    chapters: [
      {
        id: "ibl1",
        number: 1,
        title: "1-Bob: Stepan Trofimovich Verxovenskiy",
        content: `Men Stepan Trofimovich Verxovenskiy haqida soʻz yuritishdan oldin, uning bizning kichik shahrimizdagi muqomi haqida bir necha ogʻiz aytishim kerak. U nisbatan olimona, manman odam edi; ammo uning olimligidan biz foyda koʻrganmiz.`
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
    description: "Napoleon istilosiga qarshi Rossiya kurashini koʻrsatuvchi epik roman. Bolkonskiy, Bezuxov va Rostov oilalari orqali urush, sevgi, oʻlim va insoniy qadr-qimmat tasvirlanadi.",
    publishedYear: 1869,
    pages: 1225,
    audioDuration: "",
    rating: 4.9,
    reviewsCount: 0,
    narrator: undefined,
    featuredQuote: "Hammasi oʻtadi — azob ham, quvonch ham. Abadiy narsa — faqat sevgi.",
    chapters: [
      {
        id: "ut1",
        number: 1,
        title: "1-Bob: Anna Pavlovnaning ziyofati",
        content: `—Eh bien, mon prince. Genuya va Lukka endi Bonapartning shaxsiy mulkiga aylandi. Men sizni ogohlantirayapman — agar siz bu yerdagi ahvolni hali ham qanday boʻlmasin deb qarasangiz...\n\nShunday dedi Anna Pavlovna Sherer, 1805 yilning iyulida taniqli davlat arbobi knyaz Vasiliyni qabul qila turib.`
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
    description: "Bir kuni ertalab Grigori Zamza uygʻonib oʻzini ulkan hasharotga aylanganini koʻradi. Oila unga boʻlgan munosabat sekin oʻzgaradi. Kafka yozgan bu qissa alienatsiya va zamonaviy hayotning absurdligini tasvirlaydi.",
    publishedYear: 1915,
    pages: 68,
    audioDuration: "",
    rating: 4.7,
    reviewsCount: 0,
    narrator: undefined,
    featuredQuote: "Kimdir Jozef K.ga tuhmat qilgan boʻlsa kerak — sabab nomaʼlum, ammo u qamoqqa olindi.",
    chapters: [
      {
        id: "mm1",
        number: 1,
        title: "1-Bob: Oʻzgarish",
        content: `Grigori Zamza bir kuni ertalab notinch tushlardan uygʻonib, karavotida oʻzini hasharotga aylangan holda koʻrdi. U qattiq, qobiqli orqasiga agʻanagan edi; boshini koʻtarsa, qorin tomonini koʻrdi — qoʻngʻir, qavariqlangan, qalin.`
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
    description: "Ritsarlik romanlarini oʻqib aqlini yoʻqotgan La Manchalik hidalgo Don Kixot oʻz xayoliy sarguzashtlariga ot ustida otlangan. Jahon adabiyotining birinchi zamonaviy romani deb tan olingan.",
    publishedYear: 1605,
    pages: 1072,
    audioDuration: "",
    rating: 4.8,
    reviewsCount: 0,
    narrator: undefined,
    featuredQuote: "Erkinlik — osmon oʻz inʼom etgan eng qimmatli neʼmatdir.",
    chapters: [
      {
        id: "dk1",
        number: 1,
        title: "1-Bob: La Manchali fidoyi",
        content: `La Mancha viloyatida, nomi yodimda qolmagan bir qishloqda, yaqinda bir hidalgo yashardi — u doimiy ravishda nayzalar, eski qalqon, koʻhna ot va quvgʻin it bilan yashardi.\n\nU qishilmas ovchi edi va koʻp vaqtini ritsarlik romanlari mutolaa qilishga sarflardi.`
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
    featuredQuote: "Barcha insoniy donishmandligi ikki soʻzda mujassamlashgan: kutmoq va umid qilmoq.",
    chapters: [
      {
        id: "mk1",
        number: 1,
        title: "1-Bob: Marseyl — Kemaning kelishi",
        content: `1815 yilning 24 fevralida Marseyl limonga «Faraon» keması kirib keldi. Bu kema Smirna, Triest va Neapoldan kelgan edi. Kemadagi dengizchilar qanchalik quvnoq koʻrinsalar, kapitan shunchalik gʻamgin edi.`
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
    featuredQuote: "Hayot — bu yovvoyilikka qaytish; kuchli boʻl, yoki oʻl.",
    chapters: [
      {
        id: "yc1",
        number: 1,
        title: "1-Bob: Ibtidoiy odatning uygʻonishi",
        content: `Bak Melanpus Miller sudyaning katta uyida istiqomat qilardi. Santa Klaraning quyoshli vodiysi, Metropoliten Oltin Maydon deb atalardi. Uyda esa Bak podshohdek yashardi.`
      }
    ]
  },

];