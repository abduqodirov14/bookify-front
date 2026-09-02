export interface Champion {
  rank: number;
  name: string;
  avatar: string;
  hours: number;
  pages: number;
  streakDays: number;
  badge: string;
  badgeColor: string;
  certificateId: string;
  verifiedAccuracy: string;
  prizeTitle: string;
}

export const TOP_CHAMPIONS: Champion[] = [
  {
    rank: 1,
    name: "Madina Karimova",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    hours: 142.5,
    pages: 3840,
    streakDays: 48,
    badge: "👑 Shoh Kitobxon",
    badgeColor: "#C5A059",
    certificateId: "FIANNY-GOLD-2026-001",
    verifiedAccuracy: "99.8%",
    prizeTitle: "1 Yillik 'Oltin Meros' VIP + Shaxsiy Allomalar Kutubxonasi"
  },
  {
    rank: 2,
    name: "Dilshodbek Rahmatov",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    hours: 128.0,
    pages: 3210,
    streakDays: 42,
    badge: "🥈 Zukko Mutolaachi",
    badgeColor: "#94A3B8",
    certificateId: "FIANNY-SILVER-2026-002",
    verifiedAccuracy: "99.4%",
    prizeTitle: "6 Oylik Audio Teatr Pass + Qimmatbaho Asarlar To'plami"
  },
  {
    rank: 3,
    name: "Alisher Qodirov",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    hours: 114.5,
    pages: 2950,
    streakDays: 36,
    badge: "🥉 Faol Kitobxon",
    badgeColor: "#D97706",
    certificateId: "FIANNY-BRONZE-2026-003",
    verifiedAccuracy: "99.1%",
    prizeTitle: "3 Oylik Obuna + 'Faol Mutolaachi' Oltin Nishoni"
  }
];

export const HALL_OF_FAME = [
  { season: "Qish Mavsumi 2025/2026", winner: "Madina Karimova", hours: "142.5 soat", books: "14 ta asar" },
  { season: "Kuzgi Adabiy Marafon 2025", winner: "Oybek Temurov", hours: "136.0 soat", books: "12 ta asar" },
  { season: "Yozgi Jadidlar Turniri 2025", winner: "Nodira Zokirova", hours: "158.2 soat", books: "16 ta asar" }
];
