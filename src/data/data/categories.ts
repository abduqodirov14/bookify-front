export const BOOK_CATEGORIES = [
  "Badiiy adabiyot",
  "Roman",
  "Qissa",
  "Hikoya",
  "She’riyat",
  "Doston",
  "Detektiv",
  "Triller",
  "Sarguzasht",
  "Fantastika",
  "Fantaziya",
  "Mistikа / Qo‘rquv",
  "Romantik",
  "Tarixiy",
  "Tarixiy roman",
  "Psixologiya",
  "Shaxsiy rivojlanish",
  "Biznes va tadbirkorlik",
  "Ilm-fan",
  "Ilmiy-ommabop",
  "Falsafa",
  "Diniy adabiyot",
  "Biografiya va memuar",
  "Ta’lim",
  "O‘quv qo‘llanma",
  "Bolalar adabiyoti",
  "Ertaklar",
  "Hajviya / Yumor",
  "Drama / Pyesa",
  "Publitsistika",
  "Hujjatli adabiyot",
  "O‘zbek adabiyoti",
  "Jahon adabiyoti",
  "Motivatsiya",
  "Salomatlik",
  "Oila va munosabatlar",
  "Din va ma’naviyat",
  "Tilshunoslik",
  "San’at va madaniyat",
  "Sayohat"
] as const;

export type BookCategory = typeof BOOK_CATEGORIES[number];

export interface CategoryGroup {
  name: string;
  icon: string;
  items: string[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    name: "Badiiy Asarlar & Poeziya",
    icon: "📖",
    items: [
      "Badiiy adabiyot",
      "Roman",
      "Qissa",
      "Hikoya",
      "She’riyat",
      "Doston",
      "Drama / Pyesa",
      "Hajviya / Yumor"
    ]
  },
  {
    name: "Sarguzasht & Fantastika",
    icon: "🚀",
    items: [
      "Detektiv",
      "Triller",
      "Sarguzasht",
      "Fantastika",
      "Fantaziya",
      "Mistikа / Qo‘rquv",
      "Romantik"
    ]
  },
  {
    name: "Tarix & Milliy Meros",
    icon: "🏛️",
    items: [
      "Tarixiy",
      "Tarixiy roman",
      "O‘zbek adabiyoti",
      "Jahon adabiyoti",
      "Publitsistika",
      "Hujjatli adabiyot"
    ]
  },
  {
    name: "Psixologiya & Shaxsiy Rivojlanish",
    icon: "🧠",
    items: [
      "Psixologiya",
      "Shaxsiy rivojlanish",
      "Motivatsiya",
      "Oila va munosabatlar",
      "Salomatlik"
    ]
  },
  {
    name: "Biznes, Fan & Ta'lim",
    icon: "💼",
    items: [
      "Biznes va tadbirkorlik",
      "Ilm-fan",
      "Ilmiy-ommabop",
      "Ta’lim",
      "O‘quv qo‘llanma",
      "Tilshunoslik"
    ]
  },
  {
    name: "Falsafa, Din & Ma'naviyat",
    icon: "✨",
    items: [
      "Falsafa",
      "Diniy adabiyot",
      "Din va ma’naviyat"
    ]
  },
  {
    name: "Hayot, San'at & Bolalar",
    icon: "🎨",
    items: [
      "Biografiya va memuar",
      "Bolalar adabiyoti",
      "Ertaklar",
      "San’at va madaniyat",
      "Sayohat"
    ]
  }
];
