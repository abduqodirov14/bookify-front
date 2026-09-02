export type Page = 
  | 'home'
  | 'discover'
  | 'author'
  | 'book'
  | 'reader'
  | 'library'
  | 'time'
  | 'challenge'
  | 'profile'
  | 'admin'
  | 'auth'
  | 'vision';

export type ReaderTheme = 'white' | 'sepia' | 'parchment' | 'dark';
export type ReaderFont = 'literata' | 'georgia' | 'merriweather' | 'sans';

export interface Author {
  id: string;
  name: string;
  lifetime: string;
  movement: string;
  portrait: string;
  quote: string;
  bio: string;
  booksCount: number;
  featuredBookId: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  content: string;
}

export interface Book {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  category: string;
  coverImage: string;
  spineColor: string;
  description: string;
  publishedYear: number;
  pages: number;
  audioDuration: string;
  rating: number;
  reviewsCount: number;
  narrator?: string;
  chapters: Chapter[];
  featuredQuote: string;
}

export interface AudioTrack {
  bookId: string;
  title: string;
  author: string;
  coverImage: string;
  chapterTitle: string;
  duration: string;
  isPlaying: boolean;
  currentTime: number;
  playbackRate: number;
}

export interface Bookmark {
  id: string;
  bookId: string;
  bookTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  text: string;
  note?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatarUrl?: string;
  dailyGoalMinutes: number;
  todayMinutes: number;
  readingStreakDays: number;
  totalHours: number;
  finishedBooksCount: number;
  is2FAEnabled: boolean;
}
