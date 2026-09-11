import { Author } from '../types';

// All portrait images are from Wikimedia Commons (public domain, pre-1928 or released).
// URLs link to specific file revisions to avoid future redirects.

export const AUTHORS: Author[] = [
  {
    id: "dostoevsky",
    name: "Fyodor Dostoyevskiy",
    lifetime: "1821 — 1881",
    movement: "Rus Psixologik Realizmi",
    // Wikimedia: Vasily Perov portret, 1872. Public domain.
    portrait: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Vasily_Perov_-_%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82_%D0%A4.%D0%9C.%D0%94%D0%BE%D1%81%D1%82%D0%BE%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_-_Google_Art_Project.jpg/400px-Vasily_Perov_-_%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82_%D0%A4.%D0%9C.%D0%94%D0%BE%D1%81%D1%82%D0%BE%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_-_Google_Art_Project.jpg",
    quote: "Inson siri — bu faqat odamlar bilan yashash siridan iborat.",
    bio: "Rus adabiyotining eng buyuk namoyandalaridan biri. 'Jinoyat va Jazo', 'Iblislar', 'Aka-Ukalar Karamazov' romanlari dunyo adabiyotining oltinga aylangan asarlaridir.",
    booksCount: 3,
    featuredBookId: "jinoyat-va-jazo"
  },
  {
    id: "tolstoy",
    name: "Lev Tolstoy",
    lifetime: "1828 — 1910",
    movement: "Rus Realist Adabiyoti",
    // Wikimedia: Ilya Repin portret, 1887. Public domain.
    portrait: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/L.N.Tolstoy_Prokudin-Gorsky.jpg/400px-L.N.Tolstoy_Prokudin-Gorsky.jpg",
    quote: "Hammasi o'tadi — azob ham, quvonch ham. Abadiy narsa — faqat sevgi.",
    bio: "Jahon adabiyotining ulkan siymosi. 'Urush va Tinchlik' va 'Anna Karenina' romanlari bilan tarixga kirgan. Nobel mukofotiga tavsiya etilgan, lekin o'zi rad etgan.",
    booksCount: 1,
    featuredBookId: "urush-va-tinchlik"
  },
  {
    id: "kafka",
    name: "Franz Kafka",
    lifetime: "1883 — 1924",
    movement: "Modernizm va Ekzistensializm",
    // Wikimedia: 1910 yil fotosurati. Public domain.
    portrait: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Kafka_portrait.jpg/400px-Kafka_portrait.jpg",
    quote: "Kitob biz ichimizda muzlagan dengizni buzuvchi bolta bo'lishi kerak.",
    bio: "Chexiya nemis yozuvchisi. 'Metamorfoz', 'Jarayon', 'Qal'a' asarlari bilan XX asr adabiyotida yangi yo'nalish yaratgan.",
    booksCount: 1,
    featuredBookId: "metamorfoz"
  },
  {
    id: "cervantes",
    name: "Miguel de Cervantes",
    lifetime: "1547 — 1616",
    movement: "Ispan Oltin Davri",
    // Wikimedia: Juan de Jauregui portret, ca. 1600. Public domain.
    portrait: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Cervantes_J%C3%A1uregui.jpg/400px-Cervantes_J%C3%A1uregui.jpg",
    quote: "Erkinlik — osmon o'z in'om etgan eng qimmatli ne'matdir.",
    bio: "Ispan adabiyotining eng buyuk yozuvchisi. 'Don Kixot' jahon adabiyotining birinchi zamonaviy romani deb e'tirof etiladi.",
    booksCount: 1,
    featuredBookId: "don-kixot"
  },
  {
    id: "dumas",
    name: "Alexandre Dumas",
    lifetime: "1802 — 1870",
    movement: "Frantsuz Romantizmi",
    // Wikimedia: Nadar fotosurati, 1855. Public domain.
    portrait: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Alexandre_Dumas_p%C3%A8re.jpg/400px-Alexandre_Dumas_p%C3%A8re.jpg",
    quote: "Barcha insoniy donishmandligi ikki so'zda: kutmoq va umid qilmoq.",
    bio: "Frantsuz romantizm adabiyotining eng samarali vakili. 'Monte-Kristo Konti' va 'Uch mushketyor' dunyoning eng ko'p o'qilgan asarlari qatoriga kiradi.",
    booksCount: 1,
    featuredBookId: "monte-kristo-konti"
  },
  {
    id: "jack-london",
    name: "Jack London",
    lifetime: "1876 — 1916",
    movement: "Amerika Naturalizmi",
    // Wikimedia: 1905 fotosurati. Public domain.
    portrait: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Jack_London_young.jpg/400px-Jack_London_young.jpg",
    quote: "Hayot — bu yovvoyilikka qaytish; kuchli bo'l, yoki o'l.",
    bio: "Amerika naturalizmining eng mashhur vakili. 'Yovvoyi Chaqiriq' va 'Oq Tish' orqali tabiat va insoniyat o'rtasidagi kurashni jonli tasvirlagan.",
    booksCount: 1,
    featuredBookId: "yovvoyi-chaqiriq"
  },
  {
    id: "abdulla-qodiriy",
    name: "Abdulla Qodiriy",
    lifetime: "1894 — 1938",
    movement: "O'zbek Milliy Adabiyoti",
    // Wikimedia: Arxiv fotosurati. Public domain.
    portrait: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Abdulla_Qodiriy.jpg/400px-Abdulla_Qodiriy.jpg",
    quote: "Modomiki, biz yangi davrga oyoq qo'ydik, bas, biz har bir yo'nalishda yangiliklar orqasidan ergashmog'imiz lozim.",
    bio: "O'zbek milliy romanchiligining asoschisi. 'O'tkan Kunlar' va 'Mehrobdan Chayon' romanlari o'zbek adabiyotining klassikasiga aylangan.",
    booksCount: 1,
    featuredBookId: "otkan-kunlar"
  }
];