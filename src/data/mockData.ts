import type { User, Group, Event, LeaderboardEntry, Notification } from './types';

export const CURRENT_USER_ID = 'u1';

export const SPORT_CONFIG = {
  badminton:  { emoji: '🏸', label: 'Badminton',    color: '#aaeb00', bg: 'rgba(170,235,0,0.1)' },
  cricket:    { emoji: '🏏', label: 'Cricket',      color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  football:   { emoji: '⚽', label: 'Football',     color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
  pickleball: { emoji: '🎾', label: 'Pickleball',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  volleyball: { emoji: '🏐', label: 'Volleyball',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  basketball: { emoji: '🏀', label: 'Basketball',   color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  running:    { emoji: '🏃', label: 'Running',      color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  cycling:    { emoji: '🚴', label: 'Cycling',      color: '#84cc16', bg: 'rgba(132,204,22,0.1)' },
  trekking:   { emoji: '🥾', label: 'Trekking',     color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
  swimming:   { emoji: '🏊', label: 'Swimming',     color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
  movie:      { emoji: '🎬', label: 'Movie Night',  color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  cafe:       { emoji: '☕', label: 'Café Meetup',  color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
  roadtrip:   { emoji: '🚗', label: 'Road Trip',    color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' },
  gaming:     { emoji: '🎮', label: 'Gaming',       color: '#c084fc', bg: 'rgba(192,132,252,0.1)' },
  boardgames: { emoji: '🎲', label: 'Board Games',  color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  custom:     { emoji: '✨', label: 'Custom',       color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
};

export const BADGE_CONFIG = {
  first_match:      { emoji: '🎯', label: 'First Match',        description: 'Played your first match', rarity: 'common' },
  first_win:        { emoji: '🏆', label: 'First Win',          description: 'Won your first match', rarity: 'common' },
  weekend_warrior:  { emoji: '⚔️',  label: 'Weekend Warrior',   description: 'Attended 5 weekends in a row', rarity: 'uncommon' },
  five_wins:        { emoji: '🥇', label: '5 Wins',             description: 'Won 5 matches total', rarity: 'uncommon' },
  ten_wins:         { emoji: '💫', label: '10 Wins',            description: 'Won 10 matches total', rarity: 'rare' },
  twentyfive_wins:  { emoji: '💎', label: '25 Wins',            description: 'Won 25 matches total', rarity: 'rare' },
  hundred_wins:     { emoji: '👑', label: '100 Wins',           description: 'Won 100 matches total', rarity: 'legendary' },
  full_attendance:  { emoji: '🌟', label: 'Perfect Attendance', description: '100% attendance for a month', rarity: 'rare' },
  captain:          { emoji: '🦅', label: 'Captain',            description: 'Organized 10 events', rarity: 'rare' },
  iron_player:      { emoji: '⚡', label: 'Iron Player',        description: 'Never missed a weekend', rarity: 'legendary' },
  mvp:              { emoji: '🎖️', label: 'MVP',                description: 'Most Valuable Player award', rarity: 'rare' },
  longest_streak:   { emoji: '🔥', label: 'Longest Streak',     description: 'Won 7 in a row', rarity: 'rare' },
};

const getDate = (daysFromNow: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
};

export const USERS: User[] = [
  {
    id: 'u1',
    name: 'Mirun Raj',
    username: 'mirunraj',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=mirun&backgroundColor=b6e3f4',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    bio: 'Badminton fanatic 🏸 Weekend warrior. Always up for a match.',
    favouriteSports: ['badminton', 'cricket', 'cycling'],
    badges: ['first_match', 'first_win', 'weekend_warrior', 'five_wins', 'ten_wins', 'mvp'],
    stats: {
      totalMatches: 87, wins: 54, losses: 33, attendanceRate: 92, currentStreak: 6, longestStreak: 12, winRate: 62,
      weeklyActivity: [3, 5, 4, 2, 6, 4, 5],
      monthlyActivity: [
        { month: 'Jan', matches: 8, wins: 5 }, { month: 'Feb', matches: 10, wins: 7 },
        { month: 'Mar', matches: 12, wins: 8 }, { month: 'Apr', matches: 9, wins: 6 },
        { month: 'May', matches: 11, wins: 7 }, { month: 'Jun', matches: 14, wins: 9 },
        { month: 'Jul', matches: 7, wins: 5 },
      ],
      sportBreakdown: [
        { sport: 'badminton', matches: 45, wins: 30 }, { sport: 'cricket', matches: 22, wins: 14 },
        { sport: 'cycling', matches: 12, wins: 7 }, { sport: 'football', matches: 8, wins: 3 },
      ],
      pointsTotal: 1840, mvpCount: 5,
    },
    createdGroups: ['g1'],
    joinedGroups: ['g2'],
    joinedAt: '2024-01-15',
    level: 12,
    xp: 3840,
  },
  {
    id: 'u2',
    name: 'Arjun Sharma',
    username: 'arjunshm',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=arjun&backgroundColor=ffdfbf',
    coverImage: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800&q=80',
    bio: 'Cricket captain 🏏. Love the game, love the team.',
    favouriteSports: ['cricket', 'football', 'badminton'],
    badges: ['first_match', 'first_win', 'five_wins', 'ten_wins', 'twentyfive_wins', 'captain', 'mvp'],
    stats: {
      totalMatches: 112, wins: 78, losses: 34, attendanceRate: 88, currentStreak: 4, longestStreak: 15, winRate: 70,
      weeklyActivity: [4, 6, 5, 3, 7, 5, 6],
      monthlyActivity: [
        { month: 'Jan', matches: 12, wins: 9 }, { month: 'Feb', matches: 14, wins: 10 },
        { month: 'Mar', matches: 15, wins: 11 }, { month: 'Apr', matches: 11, wins: 8 },
        { month: 'May', matches: 13, wins: 9 }, { month: 'Jun', matches: 16, wins: 12 },
        { month: 'Jul', matches: 9, wins: 6 },
      ],
      sportBreakdown: [
        { sport: 'cricket', matches: 60, wins: 44 }, { sport: 'football', matches: 30, wins: 20 },
        { sport: 'badminton', matches: 22, wins: 14 },
      ],
      pointsTotal: 2460, mvpCount: 8,
    },
    createdGroups: ['g2'],
    joinedGroups: ['g1'],
    joinedAt: '2024-01-10',
    level: 18,
    xp: 5600,
  },
  {
    id: 'u3',
    name: 'Priya Nair',
    username: 'priyanair',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=priya&backgroundColor=d1d4f9',
    coverImage: 'https://images.unsplash.com/photo-1502209524164-acea936639a2?w=800&q=80',
    bio: 'Cycling enthusiast 🚴 Coffee addict ☕ Weekend explorer.',
    favouriteSports: ['cycling', 'running', 'cafe'],
    badges: ['first_match', 'first_win', 'weekend_warrior', 'five_wins', 'full_attendance'],
    stats: {
      totalMatches: 68, wins: 40, losses: 28, attendanceRate: 97, currentStreak: 3, longestStreak: 9, winRate: 59,
      weeklyActivity: [2, 4, 3, 2, 4, 3, 4],
      monthlyActivity: [
        { month: 'Jan', matches: 7, wins: 4 }, { month: 'Feb', matches: 8, wins: 5 },
        { month: 'Mar', matches: 10, wins: 6 }, { month: 'Apr', matches: 8, wins: 5 },
        { month: 'May', matches: 9, wins: 5 }, { month: 'Jun', matches: 11, wins: 7 },
        { month: 'Jul', matches: 5, wins: 3 },
      ],
      sportBreakdown: [
        { sport: 'cycling', matches: 35, wins: 22 }, { sport: 'running', matches: 20, wins: 12 },
        { sport: 'badminton', matches: 13, wins: 6 },
      ],
      pointsTotal: 1420, mvpCount: 3,
    },
    createdGroups: [],
    joinedGroups: ['g1', 'g2'],
    joinedAt: '2024-02-01',
    level: 9,
    xp: 2980,
  },
  {
    id: 'u4',
    name: 'Karthik Rajan',
    username: 'karthikrajan',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=karthik&backgroundColor=c0aede',
    coverImage: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80',
    bio: 'Football lover ⚽ Midfielder. Team player always.',
    favouriteSports: ['football', 'basketball', 'badminton'],
    badges: ['first_match', 'first_win', 'five_wins', 'ten_wins', 'iron_player'],
    stats: {
      totalMatches: 94, wins: 58, losses: 36, attendanceRate: 84, currentStreak: 8, longestStreak: 10, winRate: 62,
      weeklyActivity: [5, 4, 6, 4, 5, 6, 5],
      monthlyActivity: [
        { month: 'Jan', matches: 10, wins: 6 }, { month: 'Feb', matches: 12, wins: 8 },
        { month: 'Mar', matches: 13, wins: 8 }, { month: 'Apr', matches: 10, wins: 6 },
        { month: 'May', matches: 12, wins: 7 }, { month: 'Jun', matches: 15, wins: 10 },
        { month: 'Jul', matches: 8, wins: 5 },
      ],
      sportBreakdown: [
        { sport: 'football', matches: 50, wins: 32 }, { sport: 'basketball', matches: 28, wins: 17 },
        { sport: 'badminton', matches: 16, wins: 9 },
      ],
      pointsTotal: 2020, mvpCount: 6,
    },
    createdGroups: [],
    joinedGroups: ['g1'],
    joinedAt: '2024-01-20',
    level: 15,
    xp: 4200,
  },
  {
    id: 'u5',
    name: 'Sneha Menon',
    username: 'snehamenon',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=sneha&backgroundColor=ffd5dc',
    coverImage: 'https://images.unsplash.com/photo-1510116877040-cf89bc0cf9f5?w=800&q=80',
    bio: 'Trekking queen 🥾 Nature > everything. Weekend adventurer.',
    favouriteSports: ['trekking', 'cycling', 'running'],
    badges: ['first_match', 'first_win', 'weekend_warrior', 'five_wins'],
    stats: {
      totalMatches: 52, wins: 30, losses: 22, attendanceRate: 90, currentStreak: 2, longestStreak: 7, winRate: 58,
      weeklyActivity: [2, 3, 2, 1, 3, 2, 3],
      monthlyActivity: [
        { month: 'Jan', matches: 5, wins: 3 }, { month: 'Feb', matches: 6, wins: 4 },
        { month: 'Mar', matches: 8, wins: 5 }, { month: 'Apr', matches: 7, wins: 4 },
        { month: 'May', matches: 8, wins: 5 }, { month: 'Jun', matches: 9, wins: 5 },
        { month: 'Jul', matches: 4, wins: 2 },
      ],
      sportBreakdown: [
        { sport: 'trekking', matches: 25, wins: 14 }, { sport: 'cycling', matches: 17, wins: 10 },
        { sport: 'running', matches: 10, wins: 6 },
      ],
      pointsTotal: 1120, mvpCount: 2,
    },
    createdGroups: [],
    joinedGroups: ['g1', 'g2'],
    joinedAt: '2024-03-01',
    level: 7,
    xp: 2240,
  },
  {
    id: 'u6',
    name: 'Rahul Dev',
    username: 'rahuldev',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=rahul&backgroundColor=b6e3f4',
    coverImage: '',
    bio: 'All-rounder 🎯 Jack of all sports.',
    favouriteSports: ['badminton', 'cricket', 'football'],
    badges: ['first_match', 'first_win', 'five_wins'],
    stats: {
      totalMatches: 45, wins: 24, losses: 21, attendanceRate: 78, currentStreak: 1, longestStreak: 5, winRate: 53,
      weeklyActivity: [1, 2, 2, 1, 2, 2, 2],
      monthlyActivity: [
        { month: 'Jan', matches: 4, wins: 2 }, { month: 'Feb', matches: 5, wins: 3 },
        { month: 'Mar', matches: 7, wins: 4 }, { month: 'Apr', matches: 6, wins: 3 },
        { month: 'May', matches: 7, wins: 4 }, { month: 'Jun', matches: 8, wins: 4 },
        { month: 'Jul', matches: 4, wins: 2 },
      ],
      sportBreakdown: [
        { sport: 'badminton', matches: 20, wins: 11 }, { sport: 'cricket', matches: 15, wins: 8 },
        { sport: 'football', matches: 10, wins: 5 },
      ],
      pointsTotal: 860, mvpCount: 1,
    },
    createdGroups: [],
    joinedGroups: ['g1'],
    joinedAt: '2024-04-10',
    level: 5,
    xp: 1720,
  },
];

export const GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Weekend Smashers',
    logo: '🏸',
    banner: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80',
    description: 'The original badminton crew. Every weekend, no excuses. We sweat, we laugh, we dominate.',
    sport: 'badminton',
    memberCount: 6,
    members: [
      { userId: 'u1', role: 'creator', joinedAt: '2024-01-10', stats: { matchesPlayed: 8, wins: 5, losses: 3, winRate: 63, attendanceRate: 96, currentStreak: 6, points: 1240 } },
      { userId: 'u2', role: 'admin',   joinedAt: '2024-01-10', stats: { matchesPlayed: 8, wins: 6, losses: 2, winRate: 75, attendanceRate: 90, currentStreak: 4, points: 1420 } },
      { userId: 'u3', role: 'member',  joinedAt: '2024-02-01', stats: { matchesPlayed: 6, wins: 3, losses: 3, winRate: 50, attendanceRate: 98, currentStreak: 3, points: 880 } },
      { userId: 'u4', role: 'member',  joinedAt: '2024-01-20', stats: { matchesPlayed: 7, wins: 4, losses: 3, winRate: 57, attendanceRate: 86, currentStreak: 8, points: 1120 } },
      { userId: 'u5', role: 'member',  joinedAt: '2024-03-01', stats: { matchesPlayed: 5, wins: 2, losses: 3, winRate: 40, attendanceRate: 92, currentStreak: 2, points: 640 } },
      { userId: 'u6', role: 'member',  joinedAt: '2024-04-10', stats: { matchesPlayed: 4, wins: 1, losses: 3, winRate: 25, attendanceRate: 80, currentStreak: 1, points: 460 } },
    ],
    createdAt: '2024-01-10',
    rules: ['Be there on time. Doors at 7:00 PM sharp.', 'Bring your own shuttles (2 per person).', 'Respect all players regardless of skill.', 'Phone goes on silent during matches.', 'Stay for the full session or inform ahead.'],
    isPrivate: true,
    tags: ['badminton', 'competitive', 'weekends', 'friends'],
    inviteCode: 'SMASH2024',
    upcomingEvents: 2,
    totalEvents: 48,
  },
  {
    id: 'g2',
    name: 'Trail Blazers',
    logo: '🥾',
    banner: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    description: 'We trek, we cycle, we conquer. Weekend adventurers exploring the outdoors together.',
    sport: 'trekking',
    memberCount: 4,
    members: [
      { userId: 'u2', role: 'creator', joinedAt: '2024-02-15', stats: { matchesPlayed: 5, wins: 4, losses: 1, winRate: 80, attendanceRate: 86, currentStreak: 4, points: 680 } },
      { userId: 'u1', role: 'admin',   joinedAt: '2024-02-15', stats: { matchesPlayed: 5, wins: 3, losses: 2, winRate: 60, attendanceRate: 91, currentStreak: 3, points: 520 } },
      { userId: 'u3', role: 'member',  joinedAt: '2024-02-20', stats: { matchesPlayed: 4, wins: 2, losses: 2, winRate: 50, attendanceRate: 95, currentStreak: 2, points: 420 } },
      { userId: 'u5', role: 'member',  joinedAt: '2024-03-05', stats: { matchesPlayed: 3, wins: 1, losses: 2, winRate: 33, attendanceRate: 88, currentStreak: 1, points: 340 } },
    ],
    createdAt: '2024-02-15',
    rules: ['Safety first, always.', 'Inform if you\'re skipping any section.', 'Help fellow members on difficult trails.', 'Leave no trace — pack out what you pack in.'],
    isPrivate: false,
    tags: ['trekking', 'cycling', 'outdoors', 'adventure'],
    inviteCode: 'TRAIL2024',
    upcomingEvents: 2,
    totalEvents: 22,
  },
];

export const EVENTS: Event[] = [
  // ---- UPCOMING ----
  {
    id: 'e1', title: 'Weekend Badminton Session', sport: 'badminton', groupId: 'g1',
    date: getDate(2), time: '19:00', endTime: '22:00',
    venue: 'Sportorium Badminton Court', venueAddress: 'No. 12, Anna Salai, Chennai 600002',
    description: 'Our weekly badminton showdown! 4 leagues, best of 3 format.',
    coverImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80',
    organizer: 'u1', maxSlots: 8,
    weather: { condition: 'Clear', temp: 28, icon: '☀️', humidity: 65, wind: 12 },
    attendance: [
      { userId: 'u1', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u2', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u3', status: 'maybe', updatedAt: new Date().toISOString() },
      { userId: 'u4', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u5', status: 'not_coming', updatedAt: new Date().toISOString() },
      { userId: 'u6', status: 'late', updatedAt: new Date().toISOString() },
    ],
    leagues: [
      {
        id: 'l1', name: 'League A',
        players: ['u1', 'u2', 'u4', 'u6'],
        teams: [
          { id: 't1', name: 'Team Alpha', playerIds: ['u1', 'u4'], color: '#7c3aed' },
          { id: 't2', name: 'Team Beta', playerIds: ['u2', 'u6'], color: '#ec4899' },
        ],
        matches: [
          { id: 'm1', team1Id: 't1', team2Id: 't2', score1: 21, score2: 18, winnerId: 't1', duration: 35, notes: 'Intense rally game', completedAt: null },
        ],
        status: 'pending',
      },
    ],
    status: 'upcoming', isRecurring: true, recurringPattern: 'Every Saturday',
    announcements: [{ id: 'a1', authorId: 'u1', content: '🏸 Courts are booked! See you all at 7 PM sharp.', createdAt: new Date(Date.now() - 3600000).toISOString(), isPinned: true }],
    gallery: [], tags: ['badminton', 'weekly', 'competitive'],
  },
  {
    id: 'e2', title: 'Sunday Café Meetup', sport: 'cafe', groupId: 'g1',
    date: getDate(3), time: '10:30', endTime: '12:30',
    venue: 'Brew Collective', venueAddress: '5th Ave, Nungambakkam, Chennai',
    description: 'Chill Sunday brunch and planning session.',
    coverImage: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80',
    organizer: 'u3', maxSlots: 12,
    weather: { condition: 'Partly Cloudy', temp: 26, icon: '⛅', humidity: 70, wind: 8 },
    attendance: [
      { userId: 'u1', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u2', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u3', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u5', status: 'maybe', updatedAt: new Date().toISOString() },
    ],
    leagues: [],
    status: 'upcoming', isRecurring: false,
    announcements: [], gallery: [], tags: ['chill', 'social'],
  },
  {
    id: 'e3', title: 'Cricket Tournament Day 1', sport: 'cricket', groupId: 'g1',
    date: getDate(9), time: '08:00', endTime: '18:00',
    venue: 'M.A. Chidambaram Stadium (Practice Ground)', venueAddress: 'Chepauk, Chennai 600005',
    description: 'Our first full-day cricket tournament! 3 teams, round-robin format.',
    coverImage: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80',
    organizer: 'u2', maxSlots: 15,
    weather: { condition: 'Sunny', temp: 32, icon: '☀️', humidity: 55, wind: 15 },
    attendance: [
      { userId: 'u1', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u2', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u4', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u6', status: 'maybe', updatedAt: new Date().toISOString() },
    ],
    leagues: [],
    status: 'upcoming', isRecurring: false,
    announcements: [{ id: 'a3', authorId: 'u2', content: '🏏 CRICKET TOURNAMENT IS ON!', createdAt: new Date(Date.now() - 86400000).toISOString(), isPinned: true }],
    gallery: [], tags: ['cricket', 'tournament'],
  },
  {
    id: 'e4', title: 'Yelagiri Hills Trek', sport: 'trekking', groupId: 'g2',
    date: getDate(14), time: '05:30', endTime: '17:00',
    venue: 'Yelagiri Hills Base Camp', venueAddress: 'Yelagiri, Tamil Nadu 635853',
    description: 'Sunrise trek to the summit! Easy-medium difficulty.',
    coverImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    organizer: 'u5', maxSlots: 10,
    weather: { condition: 'Cool & Clear', temp: 18, icon: '🌤️', humidity: 75, wind: 10 },
    attendance: [
      { userId: 'u1', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u2', status: 'maybe', updatedAt: new Date().toISOString() },
      { userId: 'u3', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u5', status: 'coming', updatedAt: new Date().toISOString() },
    ],
    leagues: [],
    status: 'upcoming', isRecurring: false,
    announcements: [{ id: 'a4', authorId: 'u5', content: '🥾 Trek is confirmed!', createdAt: new Date(Date.now() - 172800000).toISOString(), isPinned: true }],
    gallery: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80'],
    tags: ['trek', 'adventure', 'nature'],
  },
  // ---- COMPLETED with proper match data for win rate calc ----
  {
    id: 'e5', title: 'Friday Night Badminton', sport: 'badminton', groupId: 'g1',
    date: getDate(-7), time: '20:00', endTime: '23:00',
    venue: 'Sportorium Badminton Court', venueAddress: 'No. 12, Anna Salai, Chennai 600002',
    description: 'The legendary Friday session. 4 leagues played, epic matches!',
    coverImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80',
    organizer: 'u1', maxSlots: 8,
    weather: { condition: 'Clear', temp: 27, icon: '🌙', humidity: 60, wind: 8 },
    attendance: [
      { userId: 'u1', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u2', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u3', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u4', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u5', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u6', status: 'coming', updatedAt: new Date().toISOString() },
    ],
    leagues: [
      {
        id: 'l2', name: 'League A',
        players: ['u1', 'u2', 'u4', 'u6'],
        teams: [
          { id: 't3', name: 'Team Alpha', playerIds: ['u1', 'u4'], color: '#7c3aed' },
          { id: 't4', name: 'Team Beta', playerIds: ['u2', 'u6'], color: '#ec4899' },
        ],
        matches: [
          { id: 'm2', team1Id: 't3', team2Id: 't4', score1: 21, score2: 18, winnerId: 't3', duration: 38, notes: 'Great match!', completedAt: getDate(-7) },
          { id: 'm3', team1Id: 't4', team2Id: 't3', score1: 21, score2: 15, winnerId: 't4', duration: 28, notes: 'Quick win', completedAt: getDate(-7) },
          { id: 'm4', team1Id: 't3', team2Id: 't4', score1: 22, score2: 20, winnerId: 't3', duration: 45, notes: 'Classic decider!', completedAt: getDate(-7) },
        ],
        status: 'completed',
      },
      {
        id: 'l3', name: 'League B',
        players: ['u3', 'u5'],
        teams: [
          { id: 't5', name: 'Team Striker', playerIds: ['u3'], color: '#10b981' },
          { id: 't6', name: 'Team Blitz', playerIds: ['u5'], color: '#f59e0b' },
        ],
        matches: [
          { id: 'm5', team1Id: 't5', team2Id: 't6', score1: 21, score2: 12, winnerId: 't5', duration: 25, notes: 'Dominant win', completedAt: getDate(-7) },
          { id: 'm6', team1Id: 't6', team2Id: 't5', score1: 18, score2: 21, winnerId: 't5', duration: 30, notes: '', completedAt: getDate(-7) },
        ],
        status: 'completed',
      },
    ],
    status: 'completed', isRecurring: true, recurringPattern: 'Every Friday',
    announcements: [],
    gallery: ['https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=400&q=80', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&q=80'],
    tags: ['badminton', 'weekly', 'completed'],
  },
  {
    id: 'e6', title: 'Weekend Doubles Tournament', sport: 'badminton', groupId: 'g1',
    date: getDate(-14), time: '16:00', endTime: '20:00',
    venue: 'Sportorium Badminton Court', venueAddress: 'No. 12, Anna Salai, Chennai 600002',
    description: 'Doubles tournament! 4 teams competing.',
    coverImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80',
    organizer: 'u2', maxSlots: 8,
    weather: { condition: 'Clear', temp: 29, icon: '☀️', humidity: 60, wind: 10 },
    attendance: [
      { userId: 'u1', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u2', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u3', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u4', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u5', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u6', status: 'coming', updatedAt: new Date().toISOString() },
    ],
    leagues: [
      {
        id: 'l4', name: 'Semi Final 1',
        players: ['u1', 'u3', 'u2', 'u4'],
        teams: [
          { id: 't7', name: 'Team Fire', playerIds: ['u1', 'u3'], color: '#ef4444' },
          { id: 't8', name: 'Team Ice', playerIds: ['u2', 'u4'], color: '#06b6d4' },
        ],
        matches: [
          { id: 'm7', team1Id: 't7', team2Id: 't8', score1: 21, score2: 19, winnerId: 't7', duration: 40, notes: 'Thrilling semi!', completedAt: getDate(-14) },
        ],
        status: 'completed',
      },
      {
        id: 'l5', name: 'Semi Final 2',
        players: ['u5', 'u6'],
        teams: [
          { id: 't9', name: 'Team Storm', playerIds: ['u5', 'u6'], color: '#8b5cf6' },
          { id: 't10', name: 'Team Thunder', playerIds: ['u1', 'u2'], color: '#f59e0b' },
        ],
        matches: [
          { id: 'm8', team1Id: 't9', team2Id: 't10', score1: 15, score2: 21, winnerId: 't10', duration: 32, notes: 'Thunder advances!', completedAt: getDate(-14) },
        ],
        status: 'completed',
      },
      {
        id: 'l6', name: 'Final',
        players: ['u1', 'u3', 'u1', 'u2'],
        teams: [
          { id: 't11', name: 'Team Fire', playerIds: ['u1', 'u3'], color: '#ef4444' },
          { id: 't12', name: 'Team Thunder', playerIds: ['u1', 'u2'], color: '#f59e0b' },
        ],
        matches: [
          { id: 'm9', team1Id: 't11', team2Id: 't12', score1: 18, score2: 21, winnerId: 't12', duration: 48, notes: 'Thunder wins the tournament!', completedAt: getDate(-14) },
        ],
        status: 'completed',
      },
    ],
    status: 'completed', isRecurring: false,
    announcements: [],
    gallery: ['https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=400&q=80'],
    tags: ['badminton', 'tournament', 'doubles'],
  },
  {
    id: 'e7', title: 'Trail Trek – Kodaikanal', sport: 'trekking', groupId: 'g2',
    date: getDate(-21), time: '06:00', endTime: '16:00',
    venue: 'Kodaikanal Base Camp', venueAddress: 'Kodaikanal, Tamil Nadu',
    description: 'Weekend trek to the beautiful Kodaikanal hills.',
    coverImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    organizer: 'u2', maxSlots: 10,
    weather: { condition: 'Cloudy', temp: 16, icon: '☁️', humidity: 80, wind: 8 },
    attendance: [
      { userId: 'u1', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u2', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u3', status: 'coming', updatedAt: new Date().toISOString() },
      { userId: 'u5', status: 'coming', updatedAt: new Date().toISOString() },
    ],
    leagues: [],
    status: 'completed', isRecurring: false,
    announcements: [],
    gallery: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80'],
    tags: ['trek', 'adventure'],
  },
];

export const LEADERBOARD: LeaderboardEntry[] = [
  { userId: 'u2', rank: 1, prevRank: 1, points: 2460, wins: 78, losses: 34, matches: 112, winRate: 70, streak: 4, sport: 'overall', period: 'alltime' },
  { userId: 'u4', rank: 2, prevRank: 3, points: 2020, wins: 58, losses: 36, matches: 94, winRate: 62, streak: 8, sport: 'overall', period: 'alltime' },
  { userId: 'u1', rank: 3, prevRank: 2, points: 1840, wins: 54, losses: 33, matches: 87, winRate: 62, streak: 6, sport: 'overall', period: 'alltime' },
  { userId: 'u3', rank: 4, prevRank: 4, points: 1420, wins: 40, losses: 28, matches: 68, winRate: 59, streak: 3, sport: 'overall', period: 'alltime' },
  { userId: 'u5', rank: 5, prevRank: 6, points: 1120, wins: 30, losses: 22, matches: 52, winRate: 58, streak: 2, sport: 'overall', period: 'alltime' },
  { userId: 'u6', rank: 6, prevRank: 5, points: 860,  wins: 24, losses: 21, matches: 45, winRate: 53, streak: 1, sport: 'overall', period: 'alltime' },
];

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'event', title: 'Weekend Badminton Session', body: 'Happening in 2 days!', timestamp: new Date(Date.now() - 1800000).toISOString(), read: false, actionUrl: '/events/e1', avatar: '🏸' },
  { id: 'n2', type: 'attendance', title: 'Arjun marked Coming', body: 'Weekend Badminton Session now has 3 confirmed', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false, actionUrl: '/events/e1', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=arjun&backgroundColor=ffdfbf' },
  { id: 'n3', type: 'achievement', title: 'Badge Unlocked! 🔥', body: 'You earned the "Weekend Warrior" badge', timestamp: new Date(Date.now() - 86400000).toISOString(), read: false, actionUrl: '/profile', avatar: '⚔️' },
  { id: 'n4', type: 'announcement', title: 'New Announcement', body: 'Mirun: Courts are booked!', timestamp: new Date(Date.now() - 7200000).toISOString(), read: true, actionUrl: '/events/e1', avatar: '📢' },
  { id: 'n5', type: 'score', title: 'Score Updated', body: 'League A — Team Alpha beats Team Beta', timestamp: new Date(Date.now() - 604800000).toISOString(), read: true, actionUrl: '/events/e5', avatar: '🏆' },
  { id: 'n6', type: 'reminder', title: '⚡ Weekend Countdown', body: 'Cricket Tournament starts in 9 days!', timestamp: new Date(Date.now() - 900000).toISOString(), read: false, actionUrl: '/events/e3', avatar: '🏏' },
];

export const getUserById = (id: string) => USERS.find(u => u.id === id);
export const getEventById = (id: string) => EVENTS.find(e => e.id === id);
export const getGroupById = (id: string) => GROUPS.find(g => g.id === id);

export const getGroupEvents = (groupId: string) => EVENTS.filter(e => e.groupId === groupId);

export const getUpcomingGroupEvents = (groupId: string) =>
  EVENTS.filter(e => e.groupId === groupId && e.status === 'upcoming');

export const getCompletedGroupEvents = (groupId: string) =>
  EVENTS.filter(e => e.groupId === groupId && e.status === 'completed');

export const computeMemberGroupStats = (userId: string, groupId: string) => {
  const completedEvents = EVENTS.filter(e => e.groupId === groupId && e.status === 'completed');
  let matchesPlayed = 0;
  let wins = 0;
  let losses = 0;

  for (const event of completedEvents) {
    for (const league of event.leagues) {
      for (const match of league.matches) {
        const team1 = league.teams.find(t => t.id === match.team1Id);
        const team2 = league.teams.find(t => t.id === match.team2Id);
        const inTeam1 = team1?.playerIds.includes(userId);
        const inTeam2 = team2?.playerIds.includes(userId);
        if (!inTeam1 && !inTeam2) continue;
        matchesPlayed++;
        if (match.winnerId) {
          if ((inTeam1 && match.winnerId === match.team1Id) || (inTeam2 && match.winnerId === match.team2Id)) {
            wins++;
          } else {
            losses++;
          }
        }
      }
    }
  }

  return {
    matchesPlayed,
    wins,
    losses,
    winRate: matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0,
  };
};

export const getOverallWinRate = (userId: string) => {
  const user = USERS.find(u => u.id === userId);
  if (!user) return { overallWinRate: 0, totalMatches: 0, totalWins: 0, totalLosses: 0 };

  const allGroupIds = [...user.createdGroups, ...user.joinedGroups];
  let totalMatches = 0;
  let totalWins = 0;
  let totalLosses = 0;

  for (const groupId of allGroupIds) {
    const stats = computeMemberGroupStats(userId, groupId);
    totalMatches += stats.matchesPlayed;
    totalWins += stats.wins;
    totalLosses += stats.losses;
  }

  return {
    overallWinRate: totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0,
    totalMatches,
    totalWins,
    totalLosses,
  };
};
