import { Author } from '../types';

export const AUTHORS: Author[] = [
  {
    id: "dostoevsky",
    name: "Fyodor Dostoyevskiy",
    lifetime: "1821 — 1881",
    movement: "Rus Psixologik Realizmi",
    portrait: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Vasily_Perov_-_%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82_%D0%A4.%D0%9C.%D0%94%D0%BE%D1%81%D1%82%D0%BE%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_-_Google_Art_Project.jpg/400px-Vasily_Perov_-_%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82_%D0%A4.%D0%9C.%D0%94%D0%BE%D1%81%D1%82%D0%BE%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_-_Google_Art_Project.jpg",
    quote: "Inson siri — bu faqat odamlar bilan yashash siridan iborat.",
    bio: "Rus adabiyotining eng buyuk namoyandalaridan biri. 'Jinoyat va Jazo', 'Iblislar', 'Aka-ukalar Karamazov' kabi romanlari dunyoning barcha tillarida tarjima qilingan.",
    booksCount: 2,
    featuredBookId: "jinoyat-va-jazo"
  },
  {
    id: "hemingway",
    name: "Ernest Hemingway",
    lifetime: "1899 — 1961",
    movement: "Amerika Modernizmi",
    portrait: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Ernest_Hemingway_1950.jpg/400px-Ernest_Hemingway_1950.jpg",
    quote: "Odamni yo'q qilib bo'ladi, lekin uni mag'lub etib bo'lmaydi.",
    bio: "Nobel mukofoti laureati (1954). 'Qari Odam va Dengiz', 'Vidolashuv qurollari', 'Qo'ng'iroqlar kim uchun jiringlaydi' kabi asarlari bilan mashhur.",
    booksCount: 1,
    featuredBookId: "qari-odam-va-dengiz"
  },
  {
    id: "kafka",
    name: "Franz Kafka",
    lifetime: "1883 — 1924",
    movement: "Ekzistensializm va Modernizm",
    portrait: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Kafka_portrait.jpg/400px-Kafka_portrait.jpg",
    quote: "Kitob biz ichimizda muzlagan dengizni buzuvchi bolta bo'lishi kerak.",
    bio: "Chexiya yozuvchisi. 'Metamorfoz', 'Jarayon', 'Qal'a' asarlari bilan XX asr adabiyotiga yangi yo'nalish bergan.",
    booksCount: 1,
    featuredBookId: "metamorfoz"
  },
  {
    id: "saint-exupery",
    name: "Antoine de Saint-Exupery",
    lifetime: "1900 — 1944",
    movement: "Frantsuz Modernizmi",
    portrait: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Antoine_de_Saint_Exup%C3%A9ry_%281935%29.jpg/400px-Antoine_de_Saint_Exup%C3%A9ry_%281935%29.jpg",
    quote: "Kattalar hech qachon o'zlari haqida hech narsani tushuntirmadilar.",
    bio: "Frantsuz yozuvchisi va uchuvchi. 'Kichkina Shahzoda' 200 dan ortiq tilda tarjima qilinib, dunyoning eng ko'p tarjima qilingan kitoblari qatoriga kirgan.",
    booksCount: 1,
    featuredBookId: "kichkina-shahzoda"
  },
  {
    id: "coelho",
    name: "Paulo Coelho",
    lifetime: "1947 — hozir",
    movement: "Magik Realizm va Falsafa",
    portrait: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Paulo_Coelho_2007.jpg/400px-Paulo_Coelho_2007.jpg",
    quote: "Biror narsani chin qalbingdan istasang, butun koinot uni amalga oshirishga yordam beradi.",
    bio: "Braziliyalik yozuvchi. 'Alximik' 80 dan ortiq tilda tarjima qilinib, 65 milliondan ortiq nusxada sotilgan.",
    booksCount: 1,
    featuredBookId: "alximik"
  },
  {
    id: "abdulla-qodiriy",
    name: "Abdulla Qodiriy",
    lifetime: "1894 — 1938",
    movement: "O'zbek Milliy Adabiyoti",
    portrait: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Abdulla_Qodiriy.jpg/400px-Abdulla_Qodiriy.jpg",
    quote: "Modomiki, biz yangi davrga oyoq qo'ydik, bas, biz har bir yo'nalishda yangiliklar orqasidan ergashmog'imiz lozim.",
    bio: "O'zbek milliy romanchiligining asoschisi. 'O'tkan Kunlar' va 'Mehrobdan Chayon' romanlari o'zbek adabiyotining klassikasiga aylangan.",
    booksCount: 1,
    featuredBookId: "otkan-kunlar"
  },
  {
    id: "cholpon",
    name: "Abdulhamid Cho'lpon",
    lifetime: "1897 — 1938",
    movement: "Jadid Adabiyoti",
    portrait: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Abdulhamid_Cho%27lpon.jpg/400px-Abdulhamid_Cho%27lpon.jpg",
    quote: "Go'zallik nima? Go'zallik — inson qalbining eng yuksak va munavvar tuyg'usidir.",
    bio: "Yoniq qalb egasi, buyuk shoir va nosir. 'Kecha va Kunduz' romani bilan o'zbek adabiyotiga yangi sahifa ochgan.",
    booksCount: 1,
    featuredBookId: "kecha-va-kunduz"
  }
];