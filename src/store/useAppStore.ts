import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Event, Group, Notification, Story, Friendship, League, AttendanceStatus, Match, EventCategory, BadgeId, JoinRequest, AppRequest, RequestStatus } from '../data/types';

import toast from 'react-hot-toast';
import * as db from '../lib/db';
import * as auth from '../lib/auth';
import { supabase } from '../lib/supabase';

let _requestChannel: ReturnType<typeof supabase.channel> | null = null;

function dbError(label: string) {
  return (e: any) => toast.error(label + ': ' + (e?.message || e));
}

function evaluateBadges(user: any, allEvents: Event[]): BadgeId[] {
  const s = user.stats;
  const badges: BadgeId[] = [];
  const organizedCount = allEvents.filter((e: Event) => e.organizer === user.id).length;
  if (s.totalMatches >= 1) badges.push('first_match');
  if (s.wins >= 1) badges.push('first_win');
  if (s.wins >= 5) badges.push('five_wins');
  if (s.wins >= 10) badges.push('ten_wins');
  if (s.wins >= 25) badges.push('twentyfive_wins');
  if (s.wins >= 100) badges.push('hundred_wins');
  if (s.attendanceRate === 100 && s.totalMatches >= 3) badges.push('full_attendance');
  if (s.attendanceRate >= 80 && s.totalMatches >= 5) badges.push('weekend_warrior');
  if (s.mvpCount >= 1) badges.push('mvp');
  if (s.longestStreak >= 7) badges.push('longest_streak');
  if (organizedCount >= 10) badges.push('captain');
  if (s.attendanceRate === 100 && s.totalMatches >= 8) badges.push('iron_player');
  return [...new Set(badges)];
}

async function computeAllUserStats(events: Event[], set: any, get: any) {
  const users = get().users;
  if (!users.length) return;

  const updated = users.map((user: any) => {
    const completedEvents = events.filter(e =>
      e.status === 'completed' &&
      e.attendance.some(a => a.userId === user.id && a.status === 'coming')
    );

    let totalMatches = 0, wins = 0, losses = 0;
    const weekly = [0, 0, 0, 0, 0, 0, 0];
    const monthly: Record<string, { matches: number; wins: number }> = {};
    const sports: Record<string, { matches: number; wins: number }> = {};
    const chrono: { isWin: boolean }[] = [];

    for (const ev of completedEvents) {
      const m = ev.date.slice(0, 7);
      if (!monthly[m]) monthly[m] = { matches: 0, wins: 0 };
      if (!sports[ev.sport]) sports[ev.sport] = { matches: 0, wins: 0 };

      for (const league of ev.leagues) {
        for (const match of league.matches) {
          if (!match.winnerId || !match.completedAt) continue;
          const t1 = league.teams.find(t => t.id === match.team1Id);
          const t2 = league.teams.find(t => t.id === match.team2Id);
          if (!t1 || !t2) continue;
          const on1 = t1.playerIds.includes(user.id);
          const on2 = t2.playerIds.includes(user.id);
          if (!on1 && !on2) continue;

          totalMatches++;
          sports[ev.sport].matches++;
          const w = (on1 && match.winnerId === t1.id) || (on2 && match.winnerId === t2.id);
          if (w) { wins++; sports[ev.sport].wins++; } else losses++;
          weekly[new Date(match.completedAt).getDay()]++;
          monthly[m].matches++;
          if (w) monthly[m].wins++;
          chrono.push({ isWin: w });
        }
      }
    }

    let curStreak = 0, longestStreak = 0, run = 0;
    for (const c of chrono) {
      if (c.isWin) { run++; longestStreak = Math.max(longestStreak, run); }
      else run = 0;
    }
    for (let i = chrono.length - 1; i >= 0; i--) {
      if (chrono[i].isWin) curStreak++;
      else break;
    }

    const myEvents = events.filter(e => e.attendance.some(a => a.userId === user.id));
    const responded = myEvents.filter(e => e.attendance.some(a => a.userId === user.id && a.status));
    const comingCount = myEvents.filter(e => e.attendance.some(a => a.userId === user.id && a.status === 'coming'));
    const attRate = responded.length > 0 ? Math.round((comingCount.length / responded.length) * 100) : 0;
    const mvpCount = completedEvents.filter(e => e.mvps?.some((m: any) => m.userId === user.id)).length;
    const pts = wins * 10 + mvpCount * 25;
    const wr = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

    const allEvents = get().events;
    const earnedBadges = evaluateBadges({ ...user, stats: { totalMatches, wins, losses, winRate: wr, attendanceRate: attRate, currentStreak: curStreak, longestStreak, pointsTotal: pts, mvpCount, weeklyActivity: weekly, monthlyActivity: [], sportBreakdown: [] } }, allEvents);

    return {
      ...user,
      badges: earnedBadges,
      stats: {
        totalMatches, wins, losses, winRate: wr, attendanceRate: attRate,
        currentStreak: curStreak, longestStreak,
        pointsTotal: pts, mvpCount,
        weeklyActivity: weekly,
        monthlyActivity: Object.entries(monthly).map(([month, d]) => ({ month, matches: d.matches, wins: d.wins })),
        sportBreakdown: Object.entries(sports).map(([sport, d]) => ({ sport: sport as any, matches: d.matches, wins: d.wins })),
      },
    };
  });

  set({ users: updated } as any);
  for (const u of updated) {
    try {
      await db.updateUser(u.id, {
        total_matches: u.stats.totalMatches, wins: u.stats.wins, losses: u.stats.losses,
        win_rate: u.stats.winRate, attendance_rate: u.stats.attendanceRate,
        current_streak: u.stats.currentStreak, longest_streak: u.stats.longestStreak,
        weekly_activity: u.stats.weeklyActivity, points_total: u.stats.pointsTotal,
        mvp_count: u.stats.mvpCount,
      });
    } catch (e) { console.warn('Stats save fail', u.id, e) }
  }
}

/** Construct a minimal user profile from auth metadata when no DB row exists. */
function fallbackUser(authUser: any): any {
  const name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User';
  return {
    id: authUser.id,
    name,
    username: name.toLowerCase().replace(/\s+/g, ''),
    email: authUser.email || '',
    phone: '',
    password: '',
    profileCode: name.toUpperCase().split(' ')[0] + '001',
    avatar: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4`,
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    bio: '',
    favouriteSports: [],
    badges: [],
    stats: { totalMatches: 0, wins: 0, losses: 0, attendanceRate: 0, currentStreak: 0, longestStreak: 0, winRate: 0, weeklyActivity: [0,0,0,0,0,0,0], monthlyActivity: [], sportBreakdown: [], pointsTotal: 0, mvpCount: 0 },
    createdGroups: [],
    joinedGroups: [],
    joinedAt: new Date().toISOString().split('T')[0],
    level: 1,
    xp: 0,
  };
}

const uid = () => `e_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const gid = () => `g_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

interface CreateLeagueInput {
  eventId: string;
  name: string;
  format: 'single' | 'doubles';
}

interface CreateMatchInput {
  leagueId: string;
  side1PlayerIds: string[];
  side2PlayerIds: string[];
  score1: number;
  score2: number;
  name?: string;
  isFinal?: boolean;
}

interface CreateEventInput {
  groupId: string;
  title: string;
  sport: string;
  category?: string;
  date: string;
  time: string;
  endTime?: string;
  venue: string;
  description?: string;
  coverImage?: string;
  maxSlots?: number;
  isRecurring?: boolean;
  recurringPattern?: string;
  startPoint?: string;
  endPoint?: string;
  gatherPoint?: string;
  distance?: string;
  motivation?: string;
}

interface CreateLiveEventInput {
  groupId: string;
  title?: string;
  venue: string;
  description?: string;
  category?: string;
  coverImage?: string;
  startPoint?: string;
  endPoint?: string;
  gatherPoint?: string;
  distance?: string;
  motivation?: string;
}

interface CreateGroupInput {
  name: string;
  logo?: string;
  description: string;
  isPrivate: boolean;
  rules: string[];
  inviteCode?: string;
}

interface AppState {
  loaded: boolean;
  loadFromSupabase: () => Promise<void>;

  isLoggedIn: boolean;
  currentUserId: string | null;
  login: (emailOrPhone: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;

  logout: () => Promise<void>;

  events: Event[];
  notifications: Notification[];

  updateAttendance: (eventId: string, userId: string, status: AttendanceStatus) => void;
  createEvent: (input: CreateEventInput) => string;
  createLiveEvent: (input: CreateLiveEventInput) => string;
  startEvent: (eventId: string) => void;
  pauseEvent: (eventId: string) => void;
  resumeEvent: (eventId: string) => void;
  createLeague: (input: CreateLeagueInput) => string;
  addMatch: (input: CreateMatchInput) => string;
  updateMatchScore: (eventId: string, leagueId: string, matchId: string, score1: number, score2: number, winnerId: string) => void;
  deleteMatch: (eventId: string, leagueId: string, matchId: string) => void;
  deleteLeague: (eventId: string, leagueId: string) => void;
  editEvent: (eventId: string, updates: Partial<Pick<Event, 'title' | 'date' | 'time' | 'endTime' | 'venue' | 'description'>>) => void;
  updateEventSummary: (eventId: string, summary: string) => void;
  completeEvent: (eventId: string) => void;
  cancelEvent: (eventId: string) => void;
  deleteEvent: (eventId: string) => void;

  getGroupEvents: (groupId: string) => Event[];
  getNextGroupEvent: (groupId: string) => Event | undefined;
  getMyGroupsNextEvents: () => { groupId: string; event: Event }[];

  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: () => number;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp'> & { userId?: string }) => void;

  activeTab: string;
  setActiveTab: (tab: string) => void;

  groups: Group[];
  users: any[];
  createGroup: (input: CreateGroupInput) => string;
  generateInviteCode: () => string;
  joinGroup: (groupId: string) => void;
  inviteByProfileCode: (groupId: string, profileCode: string) => Promise<boolean>;
  updateGroupDetails: (groupId: string, updates: Partial<Pick<Group, 'name' | 'description' | 'rules'>>) => void;
  updateMemberRole: (groupId: string, userId: string, role: 'admin' | 'member') => void;
  deleteGroup: (groupId: string) => void;
  exitGroup: (groupId: string) => void;
  kickMember: (groupId: string, userId: string) => void;
  joinRequests: JoinRequest[];
  findGroupByInviteCode: (code: string) => Group | undefined;
  sendJoinRequest: (groupId: string) => void;
  acceptJoinRequest: (requestId: string) => void;
  rejectJoinRequest: (requestId: string) => void;

  // Centralized requests
  requests: AppRequest[];
  acceptRequest: (requestId: string) => void;
  declineRequest: (requestId: string) => void;
  cancelRequest: (requestId: string) => void;

  stories: Story[];
  friendships: Friendship[];
  sendFriendRequest: (friendId: string) => void;
  acceptFriendRequest: (friendshipId: string) => void;
  cancelFriendRequest: (friendshipId: string) => void;
  removeFriend: (friendshipId: string) => void;
  acceptGroupInvite: (groupId: string, inviterId: string) => void;
  declineGroupInvite: () => void;
  uploadStory: (imageUrl: string, caption?: string) => void;
  deleteStory: (storyId: string) => void;
  getActiveStories: (userId: string) => Story[];
  getFriendsWithStories: () => { user: any; stories: Story[] }[];
  uploadEventImage: (eventId: string, imageUrl: string) => void;

  userProfiles: Record<string, { name: string; bio: string }>;
  updateProfile: (userId: string, data: { name?: string; bio?: string }) => void;
  addXp: (userId: string, amount: number, reason?: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      loaded: false,
      isLoggedIn: false,
      currentUserId: null,
      userProfiles: {},
      events: [],
      notifications: [],
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),
      groups: [],
      users: [],
      stories: [],
      friendships: [],
      joinRequests: [],
      requests: [],

      loadFromSupabase: async () => {
        try {
          // 1. Check existing auth session — isLoggedIn is driven by the SESSION, not DB profile
          const session = await auth.getSession();
          const authUser = session?.user ?? null;

          // 2. Fetch all data from Supabase tables
          const [events, groups, notifications, friendships, joinRequests, stories, requests] = await Promise.all([
            db.fetchEvents().catch(() => []),
            db.fetchGroups().catch(() => []),
            db.fetchNotifications().catch(() => []),
            db.fetchFriendships().catch(() => []),
            db.fetchJoinRequests().catch(() => []),
            db.fetchStories().catch(() => []),
            db.fetchRequests().catch(() => []),
          ]);
          const users = await db.fetchUsers().catch(() => []);

          // 3. Resolve the local user profile from DB — but ALWAYS stay logged in if session exists
          let currentUserId: string | null = authUser?.id ?? null;
          if (authUser?.email) {
            try {
              const resolved = await auth.resolveUserFromAuth(
                authUser.id,
                authUser.email,
                authUser.user_metadata?.name,
              );
              // Prefer the DB row id; fall back to auth uid so we never lose the session
              currentUserId = resolved?.id ?? authUser.id;
            } catch {
              // DB profile load failed (e.g. RLS) — fall back to email match or auth uid
              const match = users.find((u: any) => u.email === authUser.email);
              currentUserId = match?.id ?? authUser.id;
            }
          }

          const currentUser = users.find((u: any) => u.id === currentUserId)
            ?? (authUser ? fallbackUser(authUser) : undefined);
          // Ensure fallback user is in the users array so lookups by id work everywhere
          const allUsers = currentUser && !users.some((u: any) => u.id === currentUser.id)
            ? [...users, currentUser]
            : users;
          const isLoggedIn = !!authUser;
          set({ events, groups, notifications, friendships, joinRequests, stories, requests, users: allUsers, loaded: true, isLoggedIn, currentUserId });
          computeAllUserStats(events, set, get);

          // Set up realtime subscription for requests
          if (isLoggedIn && currentUserId) {
            // Clean up previous subscription
            if (_requestChannel) {
              supabase.removeChannel(_requestChannel);
              _requestChannel = null;
            }
            _requestChannel = supabase.channel('requests-realtime')
              .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'requests', filter: `recipient_id=eq.${currentUserId}` },
                (payload: any) => {
                  const newReq = payload.new;
                  set(s => {
                    if (s.requests.some(r => r.id === newReq.id)) return s;
                    const appReq: AppRequest = {
                      id: newReq.id, senderId: newReq.sender_id, recipientId: newReq.recipient_id,
                      requestType: newReq.request_type, status: newReq.status,
                      relatedEntityId: newReq.related_entity_id || null,
                      metadata: newReq.metadata || {},
                      createdAt: newReq.created_at, updatedAt: newReq.updated_at,
                    };
                    return { requests: [appReq, ...s.requests] };
                  });
                }
              )
              .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'requests', filter: `recipient_id=eq.${currentUserId}` },
                (payload: any) => {
                  const updated = payload.new;
                  set(s => ({
                    requests: s.requests.map(r =>
                      r.id === updated.id
                        ? { ...r, status: updated.status, updatedAt: updated.updated_at }
                        : r
                    ),
                  }));
                }
              )
              .subscribe();
          }
        } catch (e) {
          console.warn('Supabase load failed, using empty state', e)
          // Preserve existing isLoggedIn so a network hiccup doesn't log the user out
          set({ loaded: true });
        }
      },

      login: async (emailOrPhone, password) => {
        try {
          if (!emailOrPhone.includes('@')) {
            toast.error('Please use your email address to sign in');
            return false;
          }
          const data = await auth.signInWithEmail(emailOrPhone, password);
          if (!data.user) return false;

          const authUser = data.user;
          // Default to auth uid; DB profile resolution is best-effort
          let resolvedId: string = authUser.id;
          try {
            if (authUser.email) {
              const resolved = await auth.resolveUserFromAuth(
                authUser.id,
                authUser.email,
                authUser.user_metadata?.name,
              );
              resolvedId = resolved?.id ?? authUser.id;
            }
          } catch {
            // DB profile unavailable — auth uid is a safe fallback
          }

          const users = await db.fetchUsers().catch(() => get().users);
          set({ isLoggedIn: true, currentUserId: resolvedId, users, loaded: true });
          return true;
        } catch {
          toast.error('Invalid credentials');
          return false;
        }
      },

      signup: async (name, email, password) => {
        try {
          const data = await auth.signUpWithEmail(email, password, name);
          if (!data.user) return false;

          const authUser = data.user;
          let resolvedId: string = authUser.id;
          try {
            if (authUser.email) {
              const resolved = await auth.resolveUserFromAuth(
                authUser.id,
                authUser.email,
                name,
              );
              resolvedId = resolved?.id ?? authUser.id;
            }
          } catch {
          }

          const users = await db.fetchUsers().catch(() => get().users);
          set({ isLoggedIn: true, currentUserId: resolvedId, users, loaded: true });
          return true;
        } catch (e: any) {
          toast.error(e.message || 'Sign up failed');
          return false;
        }
      },

      logout: async () => {
        try {
          if (_requestChannel) {
            supabase.removeChannel(_requestChannel);
            _requestChannel = null;
          }
          await auth.signOut();
        } catch (e: any) {
          console.warn('Sign out error', e)
        }
        set({ isLoggedIn: false, currentUserId: null, users: [], requests: [] });
      },

      // ---- EVENTS ----
      updateAttendance: async (eventId, userId, status) => {
        set(s => ({
          events: s.events.map(ev => {
            if (ev.id !== eventId) return ev;
            const existing = ev.attendance.find(a => a.userId === userId);
            const updatedAt = new Date().toISOString();
            if (existing) {
              return { ...ev, attendance: ev.attendance.map(a => a.userId === userId ? { ...a, status, updatedAt } : a) };
            }
            return { ...ev, attendance: [...ev.attendance, { userId, status, updatedAt }] };
          }),
        }));
        try { await db.upsertAttendance(eventId, userId, status || 'not_coming'); }
        catch (e) { toast.error('Failed to save attendance: ' + (e as any).message); }
        if (status === 'coming') {
          get().addXp(userId, 10, 'Attended an event');
        }
      },

      createEvent: (input) => {
        const newId = uid();
        const currentUserId = get().currentUserId || '';
        const now = new Date().toISOString();
        const cat = (input.category || 'badminton') as EventCategory;
        const newEvent: Event = {
          id: newId, title: input.title, sport: input.sport as any, category: cat, groupId: input.groupId,
          date: input.date, time: input.time, endTime: input.endTime || '',
          venue: input.venue, venueAddress: '', description: input.description || '',
          summary: '', coverImage: input.coverImage || '', organizer: currentUserId, maxSlots: input.maxSlots || 12,
          startPoint: input.startPoint || '', endPoint: input.endPoint || '', gatherPoint: input.gatherPoint || '',
          distance: input.distance || '', motivation: input.motivation || '',
          weather: { condition: 'TBD', temp: 28, icon: '☀️', humidity: 60, wind: 10 },
          attendance: [{ userId: currentUserId, status: 'coming', updatedAt: now }],
          leagues: [], status: 'upcoming', isRecurring: input.isRecurring || false,
          recurringPattern: input.recurringPattern, announcements: [], gallery: [], tags: [],
        };
        set(s => ({ events: [...s.events, newEvent] }));
        db.createEventInDb(newEvent).catch(e => toast.error('Failed to save event: ' + e.message));
        get().addXp(currentUserId, 20, 'Created an event');
        const grp = get().groups.find(g => g.id === input.groupId);
        get().addNotification({
          type: 'event', title: `New Event: ${input.title}`,
          body: `Created in ${grp?.name || 'your group'}. Invite your crew!`,
          read: false, actionUrl: `/events/${newId}`, avatar: '📅',
        });
        return newId;
      },

      createLiveEvent: (input) => {
        const newId = uid();
        const currentUserId = get().currentUserId || '';
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const nowTime = now.toISOString().split('T')[1]?.slice(0, 5) || '19:00';
        const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const endTime = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
        const cat = (input.category || 'badminton') as EventCategory;
        const defaultTitle = cat === 'badminton' ? 'Live Match' : cat === 'movie' ? 'Movie Night' : cat === 'cafe' ? 'Cafe Session' : cat === 'roaming' ? 'Roaming' : cat === 'cycling' ? 'Cycle Ride' : cat === 'jogging' ? 'Jogging' : 'Walking';
        const newEvent: Event = {
          id: newId, title: input.title || defaultTitle + ' @ ' + input.venue,
          sport: 'badminton' as any, category: cat, groupId: input.groupId,
          date: today, time: nowTime, endTime, venue: input.venue,
          venueAddress: '', description: input.description || '', summary: '', coverImage: input.coverImage || '',
          startPoint: input.startPoint || '', endPoint: input.endPoint || '', gatherPoint: input.gatherPoint || '',
          distance: input.distance || '', motivation: input.motivation || '',
          organizer: currentUserId, maxSlots: 12,
          weather: { condition: 'TBD', temp: 28, icon: '☀️', humidity: 60, wind: 10 },
          attendance: [{ userId: currentUserId, status: 'coming', updatedAt: now.toISOString() }],
          leagues: [], status: 'live', isRecurring: false, announcements: [], gallery: [], tags: [],
        };
        set(s => ({ events: [...s.events, newEvent] }));
        db.createEventInDb(newEvent).catch(e => toast.error('Failed to save live event: ' + e.message));
        get().addXp(currentUserId, 25, 'Started a live event');
        const grp = get().groups.find(g => g.id === input.groupId);
        get().addNotification({
          type: 'event', title: `🔥 Live: ${input.title}`,
          body: `Happening now in ${grp?.name || 'your group'}!`,
          read: false, actionUrl: `/events/${newId}`, avatar: '🔥',
        });
        return newId;
      },

      startEvent: (eventId) => {
        const now = new Date();
        const nowTime = now.toISOString().split('T')[1]?.slice(0, 5) || '19:00';
        const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const endTime = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
        set(s => ({
          events: s.events.map(e =>
            e.id === eventId && e.status === 'upcoming'
              ? { ...e, status: 'live' as const, time: nowTime, endTime, date: now.toISOString().split('T')[0] }
              : e
          ),
        }));
        db.updateEventInDb(eventId, { status: 'live', time: nowTime, end_time: endTime, date: now.toISOString().split('T')[0] })
          .catch(dbError('Failed to start event'));
      },

      pauseEvent: (eventId) => {
        set(s => ({
          events: s.events.map(e => e.id === eventId && e.status === 'live' ? { ...e, status: 'paused' as const } : e),
        }));
        db.updateEventInDb(eventId, { status: 'paused' }).catch(dbError('Failed to pause event'));
      },

      resumeEvent: (eventId) => {
        set(s => ({
          events: s.events.map(e => e.id === eventId && e.status === 'paused' ? { ...e, status: 'live' as const } : e),
        }));
        db.updateEventInDb(eventId, { status: 'live' }).catch(dbError('Failed to resume event'));
      },

      createLeague: (input) => {
        const lid = `l_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const league = { id: lid, name: input.name, players: [], teams: [], matches: [], status: 'pending' as const, format: input.format } as League;
        set(s => ({
          events: s.events.map(e => e.id === input.eventId ? { ...e, leagues: [...e.leagues, league] } : e),
        }));
        db.createLeagueInDb(league, input.eventId).catch(dbError('Failed to create league'));
        return lid;
      },

      addMatch: (input) => {
        const newMid = `m_${Date.now()}`;
        const team1Id = `t_${newMid}_1`;
        const team2Id = `t_${newMid}_2`;
        const winnerId = input.score1 > input.score2 ? team1Id : (input.score2 > input.score1 ? team2Id : null);
        const teamColors = ['#00ff41', '#7c3aed'];
        const newTeams: any[] = [
          { id: team1Id, name: 'Side 1', playerIds: input.side1PlayerIds, color: teamColors[0] },
          { id: team2Id, name: 'Side 2', playerIds: input.side2PlayerIds, color: teamColors[1] },
        ];
        const newMatch: Match = {
          id: newMid, name: input.name || '', isFinal: input.isFinal || false,
          team1Id, team2Id, score1: input.score1, score2: input.score2, winnerId,
          duration: 0, notes: '', completedAt: winnerId ? new Date().toISOString() : null,
        };
        set(s => ({
          events: s.events.map(e => ({
            ...e,
            leagues: e.leagues.map(l =>
              l.id === input.leagueId
                ? {
                    ...l,
                    teams: [...l.teams.filter(t => t.id !== team1Id && t.id !== team2Id), ...newTeams.map(t => ({ ...t, leagueId: input.leagueId }))],
                    matches: [...l.matches, newMatch],
                  }
                : l
            ),
          })),
        }));
        db.addMatchToDb(
          newMatch,
          input.leagueId,
          newTeams
        ).catch(dbError('Failed to add match'));
        return newMid;
      },

      updateMatchScore: (eventId, leagueId, matchId, score1, score2, winnerId) => {
        set(s => ({
          events: s.events.map(e =>
            e.id === eventId ? {
              ...e,
              leagues: e.leagues.map(l =>
                l.id === leagueId ? {
                  ...l,
                  matches: l.matches.map(m =>
                    m.id === matchId ? { ...m, score1, score2, winnerId, completedAt: winnerId ? new Date().toISOString() : null } : m
                  ),
                } : l
              ),
            } : e
          ),
        }));
        db.updateMatchInDb(matchId, { score1, score2, winner_id: winnerId, completed_at: winnerId ? new Date().toISOString() : null })
          .catch(dbError('Failed to update match score'));
      },

      completeEvent: (eventId) => {
        const event = get().events.find(e => e.id === eventId);
        if (!event || (event.status !== 'live' && event.status !== 'paused')) return;

        const teamWins: Record<string, { wins: number; matches: number }> = {};
        const playerWins: Record<string, { wins: number; matches: number }> = {};

        for (const league of event.leagues) {
          for (const match of league.matches) {
            if (!match.winnerId) continue;
            const t1 = league.teams.find(t => t.id === match.team1Id);
            const t2 = league.teams.find(t => t.id === match.team2Id);
            if (!t1 || !t2) continue;

            const key1 = t1.id; const key2 = t2.id;
            if (!teamWins[key1]) teamWins[key1] = { wins: 0, matches: 0 };
            if (!teamWins[key2]) teamWins[key2] = { wins: 0, matches: 0 };
            teamWins[key1].matches++; teamWins[key2].matches++;
            if (match.winnerId === key1) teamWins[key1].wins++;
            if (match.winnerId === key2) teamWins[key2].wins++;

            for (const pid of t1.playerIds) {
              if (!playerWins[pid]) playerWins[pid] = { wins: 0, matches: 0 };
              playerWins[pid].matches++;
              if (match.winnerId === key1) playerWins[pid].wins++;
            }
            for (const pid of t2.playerIds) {
              if (!playerWins[pid]) playerWins[pid] = { wins: 0, matches: 0 };
              playerWins[pid].matches++;
              if (match.winnerId === key2) playerWins[pid].wins++;
            }
          }
        }

        const rankings: any[] = Object.entries(teamWins)
          .map(([teamId, d]) => {
            const t = event.leagues.flatMap(l => l.teams).find(t => t.id === teamId);
            return { teamId, teamName: t?.name || '?', playerIds: t?.playerIds || [], wins: d.wins, matchesPlayed: d.matches };
          })
          .sort((a, b) => b.wins - a.wins || b.matchesPlayed - a.matchesPlayed);

        const users = get().users;
        const mvps: any[] = Object.entries(playerWins)
          .map(([userId, d]) => {
            const u = users.find((u: any) => u.id === userId);
            return { userId, playerName: u?.name?.split(' ')[0] || userId, wins: d.wins, matchesPlayed: d.matches };
          })
          .sort((a, b) => b.wins - a.wins || b.matchesPlayed - a.matchesPlayed)
          .slice(0, 3);

        set(s => ({
          events: s.events.map(e =>
            e.id === eventId && (e.status === 'live' || e.status === 'paused')
              ? { ...e, status: 'completed' as const, rankings, mvps }
              : e
          ),
        }));
        db.updateEventInDb(eventId, { status: 'completed', rankings, mvps })
          .catch(e => toast.error('Failed to complete event: ' + e.message));
        get().addXp(event.organizer, 50, 'Completed an event');
        const allEvents = get().events;
        computeAllUserStats(allEvents, set, get);
      },

      cancelEvent: (eventId) => {
        const event = get().events.find(e => e.id === eventId);
        if (!event || event.status === 'completed' || event.status === 'cancelled') return;
        set(s => ({
          events: s.events.map(e =>
            e.id === eventId ? { ...e, status: 'cancelled' as const } : e
          ),
        }));
        db.updateEventInDb(eventId, { status: 'cancelled' })
          .catch(dbError('Failed to cancel event'));
        toast.success('Event cancelled');
      },

      deleteEvent: (eventId) => {
        const event = get().events.find(e => e.id === eventId);
        if (!event) return;
        set(s => ({ events: s.events.filter(e => e.id !== eventId) }));
        db.deleteEventFromDb(eventId).catch(dbError('Failed to delete event'));
        toast.success('Event deleted');
      },

      deleteMatch: (eventId, leagueId, matchId) => {
        set(s => ({
          events: s.events.map(e =>
            e.id === eventId ? {
              ...e,
              leagues: e.leagues.map(l =>
                l.id === leagueId ? { ...l, matches: l.matches.filter(m => m.id !== matchId) } : l
              ),
            } : e
          ),
        }));
        db.deleteMatchFromDb(matchId).catch(dbError('Failed to delete match'));
      },

      deleteLeague: (eventId, leagueId) => {
        set(s => ({
          events: s.events.map(e =>
            e.id === eventId ? { ...e, leagues: e.leagues.filter(l => l.id !== leagueId) } : e
          ),
        }));
        db.deleteLeagueFromDb(leagueId).catch(dbError('Failed to delete league'));
      },

      editEvent: (eventId, updates) => {
        set(s => ({
          events: s.events.map(e => e.id === eventId ? { ...e, ...updates } : e),
        }));
        db.updateEventInDb(eventId, {
          ...(updates.title !== undefined && { title: updates.title }),
          ...(updates.date !== undefined && { date: updates.date }),
          ...(updates.time !== undefined && { time: updates.time }),
          ...(updates.endTime !== undefined && { end_time: updates.endTime }),
          ...(updates.venue !== undefined && { venue: updates.venue }),
          ...(updates.description !== undefined && { description: updates.description }),
        }).catch(dbError('Failed to edit event'));
      },

      updateEventSummary: (eventId, summary) => {
        set(s => ({
          events: s.events.map(e => e.id === eventId ? { ...e, summary } : e),
        }));
        db.updateEventInDb(eventId, { summary }).catch(dbError('Failed to update summary'));
      },

      getGroupEvents: (groupId) => {
        return get().events.filter(e => e.groupId === groupId).sort((a, b) => {
          if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
          if (b.status === 'upcoming' && a.status !== 'upcoming') return 1;
          return a.date.localeCompare(b.date);
        });
      },

      getNextGroupEvent: (groupId) => {
        const today = new Date().toISOString().split('T')[0];
        return get().events
          .filter(e => e.groupId === groupId && (e.status === 'upcoming' || e.status === 'live') && e.date >= today)
          .sort((a, b) => {
            if (a.status === 'live' && b.status !== 'live') return -1;
            if (b.status === 'live' && a.status !== 'live') return 1;
            return a.date.localeCompare(b.date);
          })[0];
      },

      getMyGroupsNextEvents: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const uid = state.currentUserId;
        const myGroupIds = state.groups
          .filter(g => g.members.some(m => m.userId === uid))
          .map(g => g.id);

        return myGroupIds.map(groupId => {
          const event = state.events
            .filter(e => e.groupId === groupId && (e.status === 'upcoming' || e.status === 'live') && e.date >= today)
            .sort((a, b) => {
              if (a.status === 'live' && b.status !== 'live') return -1;
              if (b.status === 'live' && a.status !== 'live') return 1;
              return a.date.localeCompare(b.date);
            })[0];
          return event ? { groupId, event } : null;
        }).filter(Boolean) as { groupId: string; event: Event }[];
      },

      markNotificationRead: (id) => {
        set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) }));
        db.markNotificationReadInDb(id).catch(dbError('Failed to mark read'));
      },

      markAllRead: () => {
        set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) }));
        db.markAllNotificationsReadInDb().catch(dbError('Failed to mark all read'));
      },

      unreadCount: () => get().notifications.filter(n => !n.read).length,

      addNotification: (n) => {
        const uid = n.userId || get().currentUserId || '';
        const newNotif: Notification = {
          ...n, id: `notif_${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: uid,
        } as Notification;
        set(s => ({ notifications: [newNotif, ...s.notifications] }));
        db.createNotificationInDb(newNotif as any).catch(() => toast.error('Failed to save notification'));
      },



      generateInviteCode: () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
        const existing = get().groups;
        if (existing.some(g => g.inviteCode === code)) return get().generateInviteCode();
        return code;
      },

      createGroup: (input) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return '';
        const user = get().users.find((u: any) => u.id === currentUserId);
        if (!user || user.createdGroups.length >= 3) {
          toast.error('You can create at most 3 groups');
          return '';
        }

        const newId = gid();
        const inviteCode = get().generateInviteCode();
        const newGroup: Group = {
          id: newId, name: input.name, logo: input.logo || '🎯',
          banner: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
          description: input.description, memberCount: 1,
          members: [{ userId: currentUserId, role: 'creator', joinedAt: new Date().toISOString().split('T')[0], stats: { matchesPlayed: 0, wins: 0, losses: 0, winRate: 0, attendanceRate: 0, currentStreak: 0, points: 0 } }],
          createdAt: new Date().toISOString().split('T')[0], rules: input.rules,
          isPrivate: input.isPrivate, tags: [], upcomingEvents: 0, totalEvents: 0, inviteCode,
        };

        user.createdGroups = [...user.createdGroups, newId];

        set(s => ({ groups: [...s.groups, newGroup] }));

        db.createGroupInDb(newGroup).catch(e => toast.error('Failed to save group: ' + e.message));
        db.addGroupMember({ group_id: newId, user_id: currentUserId, role: 'creator', joined_at: newGroup.createdAt, matches_played: 0, wins: 0, losses: 0, win_rate: 0, attendance_rate: 0, current_streak: 0, points: 0 })
          .catch(e => toast.error('Failed to add group member: ' + e.message));
        get().addXp(currentUserId, 30, 'Created a group');

        toast.success(`Group "${input.name}" created!`);
        return newId;
      },

      joinGroup: (groupId) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return;
        const user = get().users.find((u: any) => u.id === currentUserId);
        const group = get().groups.find(g => g.id === groupId);
        if (!user || !group) return;
        if (user.joinedGroups.length >= 3) {
          toast.error('You can join at most 3 groups');
          return;
        }
        if (user.joinedGroups.includes(groupId) || user.createdGroups.includes(groupId)) {
          toast.error('Already a member');
          return;
        }

        user.joinedGroups = [...user.joinedGroups, groupId];
        group.memberCount++;
        group.members.push({
          userId: currentUserId, role: 'member', joinedAt: new Date().toISOString().split('T')[0],
          stats: { matchesPlayed: 0, wins: 0, losses: 0, winRate: 0, attendanceRate: 0, currentStreak: 0, points: 0 },
        });

        set(s => ({ groups: s.groups.map(g => g.id === groupId ? group : g) }));

        db.updateGroup(groupId, { member_count: group.memberCount }).catch(dbError('Failed to update group'));
        db.addGroupMember({ group_id: groupId, user_id: currentUserId, role: 'member', joined_at: new Date().toISOString().split('T')[0], matches_played: 0, wins: 0, losses: 0, win_rate: 0, attendance_rate: 0, current_streak: 0, points: 0 })
          .catch(dbError('Failed to add group member'));

        toast.success(`Joined "${group.name}"!`);
      },

      inviteByProfileCode: async (groupId, profileCode) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return false;
        const user = get().users.find((u: any) => u.id === currentUserId);
        const invitedUser = get().users.find((u: any) => u.profileCode === profileCode);
        const group = get().groups.find(g => g.id === groupId);
        if (!user || !invitedUser || !group) {
          toast.error('Invalid profile code');
          return false;
        }
        if (invitedUser.id === currentUserId) { toast.error("Can't invite yourself"); return false; }
        if (invitedUser.joinedGroups.length >= 3) { toast.error('User has reached their join limit (3)'); return false; }
        if (invitedUser.joinedGroups.includes(groupId) || invitedUser.createdGroups.includes(groupId)) { toast.error('User is already a member'); return false; }

        // Check for duplicate pending invite
        const exists = await db.checkDuplicatePendingRequest(currentUserId, invitedUser.id, 'group_invite').catch(() => false);
        if (exists) { toast.error('Invite already sent'); return false; }

        // Create centralized request
        const now = new Date().toISOString();
        const reqId = `req_${Date.now()}`;
        const request: AppRequest = {
          id: reqId, senderId: currentUserId, recipientId: invitedUser.id,
          requestType: 'group_invite', status: 'pending',
          relatedEntityId: groupId, metadata: { groupName: group.name },
          createdAt: now, updatedAt: now,
        };
        set(s => ({ requests: [...s.requests, request] }));
        db.createRequestInDb(request).catch(dbError('Failed to save request'));

        get().addNotification({
          title: 'Group Invite',
          body: `${user.name} invited you to join "${group.name}"`,
          type: 'group_join',
          userId: invitedUser.id,
          actionUrl: `group_invite:${groupId}:${currentUserId}`,
          read: false,
        });

        toast.success(`Invitation sent to ${invitedUser.name}!`);
        return true;
      },

      acceptGroupInvite: (groupId, inviterId) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return;
        const invitedUser = get().users.find((u: any) => u.id === currentUserId);
        const group = get().groups.find(g => g.id === groupId);
        if (!invitedUser || !group) { toast.error('Group not found'); return; }
        if (invitedUser.joinedGroups.includes(groupId) || invitedUser.createdGroups.includes(groupId)) { toast.error('Already a member'); return; }

        invitedUser.joinedGroups = [...invitedUser.joinedGroups, groupId];
        group.memberCount++;
        group.members.push({
          userId: invitedUser.id, role: 'member', joinedAt: new Date().toISOString().split('T')[0],
          stats: { matchesPlayed: 0, wins: 0, losses: 0, winRate: 0, attendanceRate: 0, currentStreak: 0, points: 0 },
        });

        set(s => ({ groups: s.groups.map(g => g.id === groupId ? group : g) }));

        db.updateGroup(groupId, { member_count: group.memberCount }).catch(dbError('Failed to update group'));
        db.addGroupMember({ group_id: groupId, user_id: invitedUser.id, role: 'member', joined_at: new Date().toISOString().split('T')[0], matches_played: 0, wins: 0, losses: 0, win_rate: 0, attendance_rate: 0, current_streak: 0, points: 0 })
          .catch(dbError('Failed to add group member'));

        // Update matching request
        const req = get().requests.find(
          r => r.requestType === 'group_invite' && r.status === 'pending'
            && r.recipientId === currentUserId && r.relatedEntityId === groupId
        );
        if (req) {
          set(s => ({
            requests: s.requests.map(r =>
              r.id === req.id ? { ...r, status: 'accepted' as RequestStatus, updatedAt: new Date().toISOString() } : r
            ),
          }));
          db.updateRequestStatusInDb(req.id, 'accepted').catch(() => {});
        }

        if (inviterId) {
          get().addNotification({
            title: 'Invite Accepted',
            body: `${invitedUser.name} accepted your invite to join "${group.name}"`,
            type: 'group_join',
            userId: inviterId,
            actionUrl: `/groups/${groupId}`,
            read: false,
          });
        }

        toast.success(`Joined "${group.name}"!`);
      },

      declineGroupInvite: () => {
        toast.success('Invitation declined');
      },

      updateGroupDetails: (groupId, updates) => {
        set(s => ({
          groups: s.groups.map(g =>
            g.id === groupId ? { ...g, ...updates } : g
          ),
        }));
        db.updateGroup(groupId, updates)
          .catch(dbError('Failed to update group details'));
        toast.success('Group updated');
      },

      updateMemberRole: (groupId, userId, role) => {
        set(s => ({
          groups: s.groups.map(g =>
            g.id === groupId
              ? { ...g, members: g.members.map(m => m.userId === userId ? { ...m, role } : m) }
              : g
          ),
        }));
        db.updateGroupMemberRole(groupId, userId, role)
          .catch(dbError('Failed to update member role'));
      },

      deleteGroup: (groupId) => {
        const group = get().groups.find(g => g.id === groupId);
        if (!group) return;
        set(s => ({ groups: s.groups.filter(g => g.id !== groupId) }));
        db.deleteGroupInDb(groupId).catch(dbError('Failed to delete group in db'));
        toast.success(`Group "${group.name}" deleted`);
      },

      exitGroup: (groupId) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return;
        const group = get().groups.find(g => g.id === groupId);
        if (!group) return;
        const user = get().users.find((u: any) => u.id === currentUserId);
        if (!user) return;
        user.joinedGroups = user.joinedGroups.filter((id: string) => id !== groupId);
        set(s => ({
          groups: s.groups.map(g =>
            g.id === groupId
              ? { ...g, members: g.members.filter(m => m.userId !== currentUserId), memberCount: g.memberCount - 1 }
              : g
          ),
        }));
        db.updateGroup(groupId, { member_count: Math.max(0, group.memberCount - 1) }).catch(dbError('Failed to update group'));
        db.removeGroupMember(groupId, currentUserId).catch(dbError('Failed to remove member'));
        toast.success(`Left "${group.name}"`);
      },

      kickMember: (groupId, userId) => {
        const group = get().groups.find(g => g.id === groupId);
        if (!group) return;
        const kicked = get().users.find((u: any) => u.id === userId);
        set(s => ({
          groups: s.groups.map(g =>
            g.id === groupId
              ? { ...g, members: g.members.filter(m => m.userId !== userId), memberCount: g.memberCount - 1 }
              : g
          ),
        }));
        db.updateGroup(groupId, { member_count: Math.max(0, group.memberCount - 1) }).catch(dbError('Failed to update group'));
        db.removeGroupMember(groupId, userId).catch(dbError('Failed to remove member'));
        toast.success(`Removed ${kicked?.name || 'member'} from group`);
      },

      // ---- JOIN REQUESTS ----
      findGroupByInviteCode: (code) => {
        return get().groups.find(g => g.inviteCode === code);
      },

      sendJoinRequest: async (groupId) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return;
        const group = get().groups.find(g => g.id === groupId);
        if (!group) { toast.error('Group not found'); return; }
        const existing = get().joinRequests.find(r => r.groupId === groupId && r.userId === currentUserId && r.status === 'pending');
        if (existing) { toast.error('Request already sent'); return; }

        // Check duplicate in centralized requests
        const adminMember = group.members.find(m => m.role === 'creator' || m.role === 'admin');
        const adminId = adminMember?.userId;
        if (adminId) {
          const dup = await db.checkDuplicatePendingRequest(currentUserId, adminId, 'group_join_request').catch(() => false);
          if (dup) { toast.error('Request already sent'); return; }
        }

        const id = `jr_${Date.now()}`;
        const now = new Date().toISOString();
        const request: JoinRequest = { id, groupId, userId: currentUserId, status: 'pending', createdAt: now, updatedAt: now };
        set(s => ({ joinRequests: [...s.joinRequests, request] }));

        db.createJoinRequestInDb(request).catch(dbError('Failed to save join request'));

        // Create centralized request entry
        if (adminId) {
          const reqId = `req_${Date.now()}`;
          const centralReq: AppRequest = {
            id: reqId, senderId: currentUserId, recipientId: adminId,
            requestType: 'group_join_request', status: 'pending',
            relatedEntityId: groupId, metadata: { groupName: group.name },
            createdAt: now, updatedAt: now,
          };
          set(s => ({ requests: [...s.requests, centralReq] }));
          db.createRequestInDb(centralReq).catch(dbError('Failed to save request'));
        }

        if (adminMember) {
          const requester = get().users.find((u: any) => u.id === currentUserId);
          get().addNotification({
            title: 'Join Request',
            body: `${requester?.name || 'Someone'} wants to join "${group.name}"`,
            type: 'group_join',
            userId: adminMember.userId,
            actionUrl: '/groups/' + groupId,
            read: false,
          });
        }
        toast.success('Join request sent to group admin!');
      },

      acceptJoinRequest: (requestId) => {
        const request = get().joinRequests.find(r => r.id === requestId);
        if (!request) return;
        const now = new Date().toISOString();
        set(s => ({
          joinRequests: s.joinRequests.map(r =>
            r.id === requestId ? { ...r, status: 'accepted' as const, updatedAt: now } : r
          ),
        }));
        db.updateJoinRequestInDb(requestId, { status: 'accepted', updated_at: now }).catch(dbError('Failed to update join request'));

        // Update centralized request
        const currentUserId = get().currentUserId;
        const centralReq = get().requests.find(
          r => r.requestType === 'group_join_request' && r.status === 'pending'
            && r.relatedEntityId === request.groupId && r.senderId === request.userId
            && r.recipientId === currentUserId
        );
        if (centralReq) {
          set(s => ({
            requests: s.requests.map(r =>
              r.id === centralReq.id ? { ...r, status: 'accepted' as RequestStatus, updatedAt: now } : r
            ),
          }));
          db.updateRequestStatusInDb(centralReq.id, 'accepted').catch(() => {});
        }

        const group = get().groups.find(g => g.id === request.groupId);
        if (!group) return;
        group.memberCount++;
        group.members.push({
          userId: request.userId, role: 'member', joinedAt: now.split('T')[0],
          stats: { matchesPlayed: 0, wins: 0, losses: 0, winRate: 0, attendanceRate: 0, currentStreak: 0, points: 0 },
        });
        set(s => ({ groups: s.groups.map(g => g.id === request.groupId ? group : g) }));
        db.updateGroup(request.groupId, { member_count: group.memberCount }).catch(dbError('Failed to update group'));
        db.addGroupMember({ group_id: request.groupId, user_id: request.userId, role: 'member', joined_at: now.split('T')[0], matches_played: 0, wins: 0, losses: 0, win_rate: 0, attendance_rate: 0, current_streak: 0, points: 0 })
          .catch(dbError('Failed to add group member'));

        const invitedUser = get().users.find((u: any) => u.id === request.userId);
        if (invitedUser) {
          invitedUser.joinedGroups = [...(invitedUser.joinedGroups || []), request.groupId];
          get().addNotification({
            title: 'Request Accepted',
            body: `You've been added to "${group.name}"`,
            type: 'group_join',
            userId: request.userId,
            read: false,
          });
        }
        toast.success('Join request accepted!');
      },

      rejectJoinRequest: (requestId) => {
        const now = new Date().toISOString();
        set(s => ({
          joinRequests: s.joinRequests.map(r =>
            r.id === requestId ? { ...r, status: 'rejected' as const, updatedAt: now } : r
          ),
        }));
        db.updateJoinRequestInDb(requestId, { status: 'rejected', updated_at: now }).catch(dbError('Failed to reject join request'));
        toast.success('Join request rejected');
      },

      // ---- CENTRALIZED REQUESTS ----
      acceptRequest: async (requestId) => {
        const req = get().requests.find(r => r.id === requestId);
        if (!req) return;
        const type = req.requestType;

        if (type === 'friend_request') {
          // Find matching friendship and accept it
          const friendship = get().friendships.find(
            f => f.status === 'pending' && (
              (f.userId === req.senderId && f.friendId === req.recipientId) ||
              (f.userId === req.recipientId && f.friendId === req.senderId)
            )
          );
          if (friendship) {
            set(s => ({
              friendships: s.friendships.map(f =>
                f.id === friendship.id ? { ...f, status: 'accepted' as const, updatedAt: new Date().toISOString() } : f
              ),
            }));
            db.updateFriendshipInDb(friendship.id, { status: 'accepted', updated_at: new Date().toISOString() })
              .catch(dbError('Failed to accept friendship'));
          }
        } else if (type === 'group_invite') {
          const groupId = req.relatedEntityId;
          const inviterId = req.senderId;
          if (groupId && inviterId) {
            get().acceptGroupInvite(groupId, inviterId);
          }
        } else if (type === 'group_join_request') {
          // Accept join request — create membership
          const groupId = req.relatedEntityId;
          const requesterId = req.senderId;
          if (groupId && requesterId) {
            const joinReq = get().joinRequests.find(
              jr => jr.groupId === groupId && jr.userId === requesterId && jr.status === 'pending'
            );
            if (joinReq) {
              get().acceptJoinRequest(joinReq.id);
            }
          }
        }

        // Update request status
        set(s => ({
          requests: s.requests.map(r =>
            r.id === requestId ? { ...r, status: 'accepted' as RequestStatus, updatedAt: new Date().toISOString() } : r
          ),
        }));
        db.updateRequestStatusInDb(requestId, 'accepted').catch(dbError('Failed to accept request'));
        toast.success('Request accepted');
      },

      declineRequest: async (requestId) => {
        const req = get().requests.find(r => r.id === requestId);
        if (!req) return;

        set(s => ({
          requests: s.requests.map(r =>
            r.id === requestId ? { ...r, status: 'declined' as RequestStatus, updatedAt: new Date().toISOString() } : r
          ),
        }));
        db.updateRequestStatusInDb(requestId, 'declined').catch(dbError('Failed to decline request'));

        if (req.requestType === 'group_invite') {
          get().declineGroupInvite();
        }

        toast.success('Request declined');
      },

      cancelRequest: async (requestId) => {
        set(s => ({
          requests: s.requests.filter(r => r.id !== requestId),
        }));
        db.updateRequestStatusInDb(requestId, 'cancelled').catch(dbError('Failed to cancel request'));
        toast.success('Request cancelled');
      },

      // ---- FRIENDS ----
      sendFriendRequest: async (friendId) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return;

        // Check for duplicate pending request
        const exists = await db.checkDuplicatePendingRequest(currentUserId, friendId, 'friend_request').catch(() => false);
        if (exists) { toast.error('Friend request already sent'); return; }

        const id = `fs_${Date.now()}`;
        const now = new Date().toISOString();
        const friendship: Friendship = { id, userId: currentUserId, friendId, status: 'pending', createdAt: now, updatedAt: now };
        set(s => ({ friendships: [...s.friendships, friendship] }));
        db.createFriendshipInDb(friendship).catch(dbError('Failed to save friendship'));

        // Create centralized request entry
        const reqId = `req_${Date.now()}`;
        const request: AppRequest = {
          id: reqId, senderId: currentUserId, recipientId: friendId,
          requestType: 'friend_request', status: 'pending',
          relatedEntityId: null, metadata: {}, createdAt: now, updatedAt: now,
        };
        set(s => ({ requests: [...s.requests, request] }));
        db.createRequestInDb(request).catch(dbError('Failed to save request'));

        const friend = get().users.find((u: any) => u.id === friendId);
        const requester = get().users.find((u: any) => u.id === currentUserId);
        if (friend) {
          get().addNotification({
            title: 'Friend Request',
            body: `${requester?.name || 'Someone'} sent you a friend request`,
            type: 'friend_request',
            userId: friendId,
            actionUrl: '/profile',
            read: false,
          });
        }
        toast.success('Friend request sent!');
      },

      acceptFriendRequest: (friendshipId) => {
        set(s => ({
          friendships: s.friendships.map(f => f.id === friendshipId ? { ...f, status: 'accepted' as const, updatedAt: new Date().toISOString() } : f),
        }));
        db.updateFriendshipInDb(friendshipId, { status: 'accepted', updated_at: new Date().toISOString() })
          .catch(dbError('Failed to accept friendship'));

        // Update matching centralized request
        const friendship = get().friendships.find(f => f.id === friendshipId);
        if (friendship) {
          const req = get().requests.find(
            r => r.requestType === 'friend_request' && r.status === 'pending'
              && ((r.senderId === friendship.userId && r.recipientId === friendship.friendId)
               || (r.senderId === friendship.friendId && r.recipientId === friendship.userId))
          );
          if (req) {
            set(s => ({
              requests: s.requests.map(r =>
                r.id === req.id ? { ...r, status: 'accepted' as RequestStatus, updatedAt: new Date().toISOString() } : r
              ),
            }));
            db.updateRequestStatusInDb(req.id, 'accepted').catch(() => {});
          }
        }
        toast.success('Friend request accepted!');
      },

      cancelFriendRequest: (friendshipId) => {
        const friendship = get().friendships.find(f => f.id === friendshipId);
        set(s => ({
          friendships: s.friendships.filter(f => f.id !== friendshipId),
        }));
        db.deleteFriendshipInDb(friendshipId).catch(dbError('Failed to cancel friend request'));

        // Cancel matching centralized request
        if (friendship) {
          const req = get().requests.find(
            r => r.requestType === 'friend_request' && r.status === 'pending'
              && r.senderId === friendship.userId && r.recipientId === friendship.friendId
          );
          if (req) {
            set(s => ({
              requests: s.requests.filter(r => r.id !== req.id),
            }));
            db.updateRequestStatusInDb(req.id, 'cancelled').catch(() => {});
          }
        }
        toast.success('Friend request cancelled');
      },

      removeFriend: (friendshipId) => {
        set(s => ({
          friendships: s.friendships.filter(f => f.id !== friendshipId),
        }));
        db.deleteFriendshipInDb(friendshipId).catch(dbError('Failed to remove friend'));
        toast.success('Friend removed');
      },

      // ---- STORIES ----
      uploadStory: async (imageUrl, caption) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return;
        const todayStr = new Date().toISOString().split('T')[0];
        const todayCount = get().stories.filter(s => s.userId === currentUserId && s.createdAt.startsWith(todayStr)).length;
        if (todayCount >= 10) { toast.error('Daily limit reached (10 stories)'); return; }
        const id = `st_${Date.now()}`;
        const now = new Date();
        const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const story: Story = { id, userId: currentUserId, imageUrl, caption: caption || '', createdAt: now.toISOString(), expiresAt: expires.toISOString() };
        set(s => ({ stories: [...s.stories, story] }));
        try {
          await db.createStoryInDb(story);
        } catch (e) {
          console.warn('Failed to save story to DB', e)
        }
        toast.success('Story uploaded!');
      },

      deleteStory: async (storyId) => {
        set(s => ({ stories: s.stories.filter(st => st.id !== storyId) }));
        try {
          await db.deleteStoryFromDb(storyId);
          toast.success('Story deleted');
        } catch (e) {
          console.warn('Failed to delete story from DB', e)
        }
      },

      getActiveStories: (userId) => {
        const now = Date.now();
        return get().stories.filter(s => s.userId === userId && new Date(s.expiresAt).getTime() > now);
      },

      getFriendsWithStories: () => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return [];
        const now = Date.now();
        const friendIds = get().friendships
          .filter(f => (f.userId === currentUserId || f.friendId === currentUserId) && f.status === 'accepted')
          .map(f => f.userId === currentUserId ? f.friendId : f.userId);
        const allUsers = get().users;
        const allUserIds = [...new Set([...friendIds, currentUserId])];
        return allUserIds.map(uid => {
          const user = allUsers.find((u: any) => u.id === uid);
          const activeStories = get().stories
            .filter(s => s.userId === uid && new Date(s.expiresAt).getTime() > now)
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
          return { user, stories: activeStories };
        }).filter(x => x.user && x.stories.length > 0);
      },

      updateProfile: (userId, data) => {
        set(s => ({
          userProfiles: { ...s.userProfiles, [userId]: { ...s.userProfiles[userId], ...data } },
        }));
      },

      addXp: (userId, amount, _reason) => {
        set(s => ({
          users: s.users.map((u: any) => {
            if (u.id !== userId) return u;
            const newXp = (u.xp || 0) + amount;
            const threshold = u.level * 100;
            let newLevel = u.level;
            let leveledUp = false;
            if (newXp >= threshold) {
              newLevel = u.level + 1;
              leveledUp = true;
            }
            if (leveledUp) {
              toast.success(`🎉 Level up! You're now level ${newLevel}!`);
            }
            return { ...u, xp: newXp, level: newLevel };
          }),
        }));
        if (get().currentUserId === userId) {
          const user = get().users.find((u: any) => u.id === userId);
          if (user) {
            db.updateUser(userId, { xp: user.xp, level: user.level }).catch(() => {});
          }
        }
      },

      uploadEventImage: (eventId, imageUrl) => {
        set(s => ({
          events: s.events.map(e =>
            e.id === eventId && e.gallery.length < 10
              ? { ...e, gallery: [...e.gallery, imageUrl] }
              : e
          ),
        }));
        const event = get().events.find(e => e.id === eventId);
        if (event) {
          db.updateEventInDb(eventId, { gallery: event.gallery }).catch(dbError('Failed to update gallery'));
        }
      },
    }),
    {
      name: 'whosin-store',
      version: 3,
      migrate: (persisted: any) => ({
        ...persisted,
        isLoggedIn: false,
        currentUserId: null,
        loaded: true,
        users: [],
        events: [],
        groups: [],
      notifications: [],
      friendships: [],
      joinRequests: [],
      requests: [],
      stories: [],
      }),
      partialize: (state) => ({
        activeTab: state.activeTab,
        userProfiles: state.userProfiles,
      }),
    }
  )
);




