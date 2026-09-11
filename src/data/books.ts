import { Book } from '../types';

export const BOOKS: Book[] = [
  // XORIJIY ASARLAR - O'ZBEKCHAGA TARJIMA (saytning asosiy maqsadi)

  {
    id: "jinoyat-va-jazo",
    title: "Jinoyat va Jazo",
    authorId: "dostoevsky",
    authorName: "Fyodor Dostoyevskiy",
    category: "Rus Adabiyoti",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780140449136-L.jpg",
    spineColor: "#1A1A2E",
    description: "Talaba Raskolnikov o'zini oliy ruh deb hisoblab bir sudxo'r kampirni o'ldiradi. Roman uning ichki azob va aybdorlik his-tuyg'ularini kuzatadi. Dostoyevskiyning psixologik realizmining eng yuksak namunasi.",
    publishedYear: 1866,
    pages: 574,
    audioDuration: "",
    rating: 4.9,
    reviewsCount: 0,
    narrator: undefined,
    featuredQuote: "Agar Xudo bo'lmasa, hamma narsa mumkin.",
    chapters: [
      {
        id: "jj1",
        number: 1,
        title: "1-Bob: Sariq pallto",
        content: `Iyulning boshida, shom arafasida, kichkina bir xonani ijara qilib turuvchi yosh talaba ko'chaga chiqdi. U Haymarket maydoniga tomon yo'l oldi. Issiqdan bosh og'rib, xayollari tarqoq edi.\n\nBu safar u bir narsadan qo'rqmayotgan edi. Oyoqlari o'zi uni boshqarib borardi.`
      }
    ]
  },

  {
    id: "kichkina-shahzoda",
    title: "Kichkina Shahzoda",
    authorId: "saint-exupery",
    authorName: "Antoine de Saint-Exupery",
    category: "Frantsuz Adabiyoti",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780156012195-L.jpg",
    spineColor: "#1B4F72",
    description: "Kichkina Shahzoda o'z sayyorasidan yo'lga chiqib turli planetalarda kattalar bilan uchrashadi. Sevgi, do'stlik va mas'uliyat haqidagi bu asar 200 dan ortiq tilda tarjima qilingan.",
    publishedYear: 1943,
    pages: 96,
    audioDuration: "",
    rating: 4.9,
    reviewsCount: 0,
    narrator: undefined,
    featuredQuote: "Faqat yurak bilan to'g'ri ko'rish mumkin. Muhim narsalar ko'zga ko'rinmaydi.",
    chapters: [
      {
        id: "ks1",
        number: 1,
        title: "1-Bob: Boa va fil",
        content: `Olti yoshimda bir safar hayot haqidagi manzaralar to'la kitobda ajoyib bir rasmni ko'rdim. Boa ilonining hayvonni yutayotgani haqida. Kattalar mening rasmimni shlyapa deb o'yladilar.`
      }
    ]
  },

  {
    id: "qari-odam-va-dengiz",
    title: "Qari Odam va Dengiz",
    authorId: "hemingway",
    authorName: "Ernest Hemingway",
    category: "Amerika Adabiyoti",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780684801223-L.jpg",
    spineColor: "#1B4332",
    description: "Santiago - Kubaning keksa baliqqovi - 84 kun baliq tutmay qaytadi. Keyin u ulkan marlin baliqni tutib, uni saqlab qolish uchun kurashadi. Nobel mukofoti laureati romani.",
    publishedYear: 1952,
    pages: 127,
    audioDuration: "",
    rating: 4.8,
    reviewsCount: 0,
    narrator: undefined,
    featuredQuote: "Odamni yo'q qilib bo'ladi, lekin uni mag'lub etib bo'lmaydi.",
    chapters: [
      {
        id: "qod1",
        number: 1,
        title: "1-Bob: Keksa baliqchi",
        content: `U qari chol edi, Meksika ko'rfazida yolg'iz qayiqda baliq ovlardi va sakson to'rt kundan beri hech narsa tutmagan edi.`
      }
    ]
  },

  {
    id: "metamorfoz",
    title: "Metamorfoz",
    authorId: "kafka",
    authorName: "Franz Kafka",
    category: "Nemis Adabiyoti",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780393347012-L.jpg",
    spineColor: "#2D1B69",
    description: "Bir kuni ertalab Grigori Zamza uyg'onib o'zini ulkan hasharotga aylanganini ko'radi. Kafka yozgan bu qissa alienatsiya va oilaviy munosabatlar haqidagi eng muhim modernist asar sanaladi.",
    publishedYear: 1915,
    pages: 68,
    audioDuration: "",
    rating: 4.7,
    reviewsCount: 0,
    narrator: undefined,
    featuredQuote: "Bir kuni ertalab u notinch uyqulardan keyin uyg'onib, o'zini karavotida dahshatli bir hasharotga aylangan holda ko'rdi.",
    chapters: [
      {
        id: "mm1",
        number: 1,
        title: "1-Bob: O'zgarish",
        content: `Grigori Zamza bir kuni ertalab notinch tushlardan uyg'onib, karavotida o'zini hasharotga aylangan holda ko'rdi.`
      }
    ]
  },

  {
    id: "alximik",
    title: "Alximik",
    authorId: "coelho",
    authorName: "Paulo Coelho",
    category: "Lotin Amerika Adabiyoti",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg",
    spineColor: "#B7791F",
    description: "Ispaniyalik cho'pon yigit Santiago o'z taqdirini topish uchun Misr piramidalari tomon yo'l oladi. Dunyo miqyosida 65 milliondan ortiq nusxada sotilgan roman.",
    publishedYear: 1988,
    pages: 163,
    audioDuration: "",
    rating: 4.7,
    reviewsCount: 0,
    narrator: undefined,
    featuredQuote: "Biror narsani chin qalbingdan istasang, butun koinot uni amalga oshirishga yordam beradi.",
    chapters: [
      {
        id: "alk1",
        number: 1,
        title: "1-Bob: Tushida qo'ychi",
        content: `Cho'pon yigit Santiago bir eski cherkov xarobasida uxlardi. Cherkov tomisiz edi, lekin katta chinor daraxti hali ham o'sha yerda turardi.`
      }
    ]
  },

  {
    id: "iblislar",
    title: "Iblislar",
    authorId: "dostoevsky",
    authorName: "Fyodor Dostoyevskiy",
    category: "Rus Adabiyoti",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780140449144-L.jpg",
    spineColor: "#1A1A2E",
    description: "Dostoyevskiyning siyosiy nihilizm va inqilobiy harakatni keskin tanqid qiluvchi romani. Stavrogin va Verxovenskiy obrazlari orqali XIX asr Rossiyasidagi halokatli g'oyalar tasvirlanadi.",
    publishedYear: 1872,
    pages: 419,
    audioDuration: "",
    rating: 4.9,
    reviewsCount: 0,
    narrator: undefined,
    featuredQuote: "Xudo bo'lmasa, hamma narsa ruxsat etilgan.",
    chapters: [
      {
        id: "ibl1",
        number: 1,
        title: "1-Bob: Stepan Trofimovich",
        content: `Men Stepan Trofimovich Verxovenskiy haqida so'z yuritishdan oldin, uning bizning kichik shahrimizdagi muqomi haqida bir necha og'iz aytishim kerak.`
      }
    ]
  },

  // O'ZBEK ADABIYOTI

  {
    id: "otkan-kunlar",
    title: "O'tkan Kunlar",
    authorId: "abdulla-qodiriy",
    authorName: "Abdulla Qodiriy",
    category: "O'zbek Adabiyoti",
    coverImage: "https://covers.openlibrary.org/b/olid/OL28471897M-L.jpg",
    spineColor: "#8B2500",
    description: "O'zbek adabiyotining birinchi milliy romani. XIX asr Qo'qon xonligi davrida Otabek va Kumushbibining muhabbat fojiasi orqali davr ruhi yetkaziladi.",
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
        content: `1264-nchi hijriy, dalv oyining 17-nchi kuni, Toshkentning Samarqand darvozasiga yaqin bir saroyga Otabek ismli yosh yigit kirib keldi.`
      }
    ]
  },

  {
    id: "kecha-va-kunduz",
    title: "Kecha va Kunduz",
    authorId: "cholpon",
    authorName: "Abdulhamid Cho'lpon",
    category: "O'zbek Adabiyoti",
    coverImage: "https://covers.openlibrary.org/b/olid/OL7353628M-L.jpg",
    spineColor: "#2D3748",
    description: "Zebi va uning fojiali qismati orqali mustamlaka va xurofot kishanlariga solingan jamiyat dardi ko'rsatilgan. Cho'lponning yagona romani.",
    publishedYear: 1936,
    pages: 340,
    audioDuration: "",
    rating: 4.9,
    reviewsCount: 0,
    narrator: undefined,
    featuredQuote: "Tirik bo'lsak - birga bo'larmiz, o'lsak - tuprog'imiz bir joyda!",
    chapters: [
      {
        id: "kk1",
        number: 1,
        title: "1-Bob: Bahor kechasi",
        content: `Kechasi bilan yomg'ir yog'ib chiqqan, tongga yaqin havo ochilib, ko'm-ko'k maysalar ustida shabnam jilvalanardi.`
      }
    ]
  }
];