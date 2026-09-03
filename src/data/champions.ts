export interface Champion {
  rank: number;
  name: string;
  avatar: string;
  hours: number;
  pages: number;
  streakDays?: number;
  badge: string;
  badgeColor?: string;
  certificateId: string;
  verifiedAccuracy?: string;
  prizeTitle?: string;
  period?: string;
}

export const TOP_CHAMPIONS: Champion[] = [];

export const HALL_OF_FAME: any[] = [];
