// =============================================
// MACHIVERSE TYPES
// =============================================

export type SportType =
  | 'badminton' | 'cricket' | 'football' | 'pickleball'
  | 'volleyball' | 'basketball' | 'running' | 'cycling'
  | 'trekking' | 'swimming' | 'movie' | 'cafe' | 'roadtrip'
  | 'gaming' | 'boardgames' | 'custom';

export type AttendanceStatus = 'coming' | 'maybe' | 'not_coming' | 'late' | null;

export type GroupRole = 'creator' | 'admin' | 'member';

export type BadgeId =
  | 'first_match' | 'first_win' | 'weekend_warrior' | 'five_wins'
  | 'ten_wins' | 'twentyfive_wins' | 'hundred_wins' | 'full_attendance'
  | 'captain' | 'iron_player' | 'mvp' | 'longest_streak';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  profileCode: string;
  avatar: string;
  coverImage: string;
  bio: string;
  favouriteSports: SportType[];
  badges: BadgeId[];
  stats: UserStats;
  createdGroups: string[];
  joinedGroups: string[];
  joinedAt: string;
  level: number;
  xp: number;
}

export interface UserStats {
  totalMatches: number;
  wins: number;
  losses: number;
  attendanceRate: number;
  currentStreak: number;
  longestStreak: number;
  winRate: number;
  weeklyActivity: number[];
  monthlyActivity: { month: string; matches: number; wins: number }[];
  sportBreakdown: { sport: SportType; matches: number; wins: number }[];
  pointsTotal: number;
  mvpCount: number;
}

export interface Group {
  id: string;
  name: string;
  logo: string;
  banner: string;
  description: string;
  memberCount: number;
  members: GroupMember[];
  createdAt: string;
  rules: string[];
  isPrivate: boolean;
  tags: string[];
  upcomingEvents: number;
  totalEvents: number;
}

export interface GroupMemberStats {
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  attendanceRate: number;
  currentStreak: number;
  points: number;
}

export interface GroupMember {
  userId: string;
  role: GroupRole;
  joinedAt: string;
  stats: GroupMemberStats;
}

export interface Event {
  id: string;
  title: string;
  sport: SportType;
  groupId: string;
  date: string;
  time: string;
  endTime: string;
  venue: string;
  venueAddress: string;
  description: string;
  coverImage: string;
  organizer: string;
  maxSlots: number;
  weather: WeatherInfo;
  attendance: AttendanceRecord[];
  leagues: League[];
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  isRecurring: boolean;
  recurringPattern?: string;
  announcements: Announcement[];
  gallery: string[];
  tags: string[];
}

export interface WeatherInfo {
  condition: string;
  temp: number;
  icon: string;
  humidity: number;
  wind: number;
}

export interface AttendanceRecord {
  userId: string;
  status: AttendanceStatus;
  updatedAt: string;
}

export interface League {
  id: string;
  name: string;
  format?: 'single' | 'doubles';
  players: string[];
  teams: Team[];
  matches: Match[];
  status: 'pending' | 'ongoing' | 'completed';
}

export interface Team {
  id: string;
  name: string;
  playerIds: string[];
  color: string;
}

export interface Match {
  id: string;
  team1Id: string;
  team2Id: string;
  score1: number;
  score2: number;
  winnerId: string | null;
  duration: number;
  notes: string;
  completedAt: string | null;
}

export interface Announcement {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  isPinned: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  rank: number;
  prevRank: number;
  points: number;
  wins: number;
  losses: number;
  matches: number;
  winRate: number;
  streak: number;
  sport: SportType | 'overall';
  period: 'weekly' | 'monthly' | 'yearly' | 'alltime';
}

export interface Notification {
  id: string;
  type: 'event' | 'attendance' | 'score' | 'achievement' | 'announcement' | 'reminder';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  avatar?: string;
}

// =============================================
// FRIENDS & STORIES
// =============================================
export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: FriendRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Story {
  id: string;
  userId: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  expiresAt: string;
} 
