import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Event, Group, Notification, Story, Friendship, League, AttendanceStatus, Match, EventCategory } from '../data/types';
import { getUserById, generateId } from '../data/mockData';
import toast from 'react-hot-toast';
import * as db from '../lib/db';

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
  description: string;
  isPrivate: boolean;
  rules: string[];
}

interface AppState {
  loaded: boolean;
  loadFromSupabase: () => Promise<void>;

  isLoggedIn: boolean;
  currentUserId: string | null;
  login: (emailOrPhone: string, password: string) => boolean;
  signup: (name: string, email: string, phone: string, password: string) => boolean;
  logout: () => void;

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
  joinGroup: (groupId: string) => void;
  inviteByProfileCode: (groupId: string, profileCode: string) => boolean;
  updateGroupDetails: (groupId: string, updates: Partial<Pick<Group, 'name' | 'description' | 'rules'>>) => void;
  updateMemberRole: (groupId: string, userId: string, role: 'admin' | 'member') => void;

  stories: Story[];
  friendships: Friendship[];
  sendFriendRequest: (friendId: string) => void;
  acceptFriendRequest: (friendshipId: string) => void;
  uploadStory: (imageUrl: string, caption?: string) => void;
  getActiveStories: (userId: string) => Story[];
  getFriendsWithStories: () => { user: any; stories: Story[] }[];
  uploadEventImage: (eventId: string, imageUrl: string) => void;

  userProfiles: Record<string, { name: string; bio: string }>;
  updateProfile: (userId: string, data: { name?: string; bio?: string }) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      loaded: false,
      isLoggedIn: true,
      currentUserId: 'u1',
      userProfiles: {},
      events: [],
      notifications: [],
      activeTab: 'home',
      groups: [],
      users: [],
      stories: [],
      friendships: [],

      loadFromSupabase: async () => {
        try {
          const [events, groups, notifications, friendships, stories] = await Promise.all([
            db.fetchEvents().catch(() => []),
            db.fetchGroups().catch(() => []),
            db.fetchNotifications().catch(() => []),
            db.fetchFriendships().catch(() => []),
            db.fetchStories().catch(() => []),
          ]);
          const users = await db.fetchUsers().catch(() => []);
          set({ events, groups, notifications, friendships, stories, users, loaded: true });
        } catch (e) {
          console.warn('Supabase load failed, using empty state', e);
          set({ loaded: true });
        }
      },

      login: (emailOrPhone, password) => {
        const user = emailOrPhone.includes('@')
          ? getUserByEmail(emailOrPhone)
          : getUserByPhone(emailOrPhone);
        if (!user || user.password !== password) return false;
        setCurrentUserId(user.id);
        set({ isLoggedIn: true, currentUserId: user.id });
        return true;
      },

      signup: (name, email, phone, password) => {
        if (getUserByEmail(email)) return false;
        const newUser = {
          id: generateId(),
          name, username: name.toLowerCase().replace(/\s+/g, ''), email, phone, password,
          profileCode: `${name.split(' ')[0].toUpperCase()}001`,
          avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4`,
          coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
          bio: '', favouriteSports: [], badges: [],
          stats: { totalMatches: 0, wins: 0, losses: 0, attendanceRate: 0, currentStreak: 0, longestStreak: 0, winRate: 0, weeklyActivity: [0,0,0,0,0,0,0], monthlyActivity: [], sportBreakdown: [], pointsTotal: 0, mvpCount: 0 },
          createdGroups: [], joinedGroups: [], joinedAt: new Date().toISOString().split('T')[0], level: 1, xp: 0,
        };
        const USERS = get().users;
        (USERS as any[]).push(newUser);
        setCurrentUserId(newUser.id);
        set({ isLoggedIn: true, currentUserId: newUser.id });
        return true;
      },

      logout: () => {
        setCurrentUserId(null);
        set({ isLoggedIn: false, currentUserId: null });
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
        catch (e) { console.warn('Failed to sync attendance', e); }
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
        db.createEventInDb(newEvent).catch(e => console.warn('Failed to save event', e));
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
        db.createEventInDb(newEvent).catch(e => console.warn('Failed to save live event', e));
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
          .catch(e => console.warn('Failed to start event', e));
      },

      pauseEvent: (eventId) => {
        set(s => ({
          events: s.events.map(e => e.id === eventId && e.status === 'live' ? { ...e, status: 'paused' as const } : e),
        }));
        db.updateEventInDb(eventId, { status: 'paused' }).catch(e => console.warn('Failed to pause event', e));
      },

      resumeEvent: (eventId) => {
        set(s => ({
          events: s.events.map(e => e.id === eventId && e.status === 'paused' ? { ...e, status: 'live' as const } : e),
        }));
        db.updateEventInDb(eventId, { status: 'live' }).catch(e => console.warn('Failed to resume event', e));
      },

      createLeague: (input) => {
        const lid = `l_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const league = { id: lid, name: input.name, players: [], teams: [], matches: [], status: 'pending' as const, format: input.format } as League;
        set(s => ({
          events: s.events.map(e => e.id === input.eventId ? { ...e, leagues: [...e.leagues, league] } : e),
        }));
        db.createLeagueInDb(league, input.eventId).catch(e => console.warn('Failed to create league', e));
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
        ).catch(e => console.warn('Failed to add match', e));
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
          .catch(e => console.warn('Failed to update match score', e));
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
            const u = users.find((u: any) => u.id === userId) || getUserById(userId);
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
          .catch(e => console.warn('Failed to complete event', e));
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
          .catch(e => console.warn('Failed to cancel event', e));
        toast.success('Event cancelled');
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
        db.deleteMatchFromDb(matchId).catch(e => console.warn('Failed to delete match', e));
      },

      deleteLeague: (eventId, leagueId) => {
        set(s => ({
          events: s.events.map(e =>
            e.id === eventId ? { ...e, leagues: e.leagues.filter(l => l.id !== leagueId) } : e
          ),
        }));
        db.deleteLeagueFromDb(leagueId).catch(e => console.warn('Failed to delete league', e));
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
        }).catch(e => console.warn('Failed to edit event', e));
      },

      updateEventSummary: (eventId, summary) => {
        set(s => ({
          events: s.events.map(e => e.id === eventId ? { ...e, summary } : e),
        }));
        db.updateEventInDb(eventId, { summary }).catch(e => console.warn('Failed to update summary', e));
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
        const user = state.users.find((u: any) => u.id === state.currentUserId) || getUserById(state.currentUserId || '');
        const myGroupIds = user ? [...(user.createdGroups || []), ...(user.joinedGroups || [])] : [];

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
        db.markNotificationReadInDb(id).catch(e => console.warn('Failed to mark read', e));
      },

      markAllRead: () => {
        set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) }));
        db.markAllNotificationsReadInDb().catch(e => console.warn('Failed to mark all read', e));
      },

      unreadCount: () => get().notifications.filter(n => !n.read).length,

      addNotification: (n) => {
        const newNotif: Notification = {
          ...n, id: `notif_${Date.now()}`,
          timestamp: new Date().toISOString(),
        } as Notification;
        set(s => ({ notifications: [newNotif, ...s.notifications] }));
        db.createNotificationInDb(newNotif as any).catch(e => console.warn('Failed to save notification', e));
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      createGroup: (input) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return '';
        const user = get().users.find((u: any) => u.id === currentUserId) || getUserById(currentUserId);
        if (!user || user.createdGroups.length >= 3) {
          toast.error('You can create at most 3 groups');
          return '';
        }

        const newId = gid();
        const newGroup: Group = {
          id: newId, name: input.name, logo: '🎯',
          banner: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
          description: input.description, memberCount: 1,
          members: [{ userId: currentUserId, role: 'creator', joinedAt: new Date().toISOString().split('T')[0], stats: { matchesPlayed: 0, wins: 0, losses: 0, winRate: 0, attendanceRate: 0, currentStreak: 0, points: 0 } }],
          createdAt: new Date().toISOString().split('T')[0], rules: input.rules,
          isPrivate: input.isPrivate, tags: [], upcomingEvents: 0, totalEvents: 0,
        };

        user.createdGroups = [...user.createdGroups, newId];

        set(s => ({ groups: [...s.groups, newGroup] }));

        db.createGroupInDb(newGroup).catch(e => console.warn('Failed to save group', e));
        db.addGroupMember({ group_id: newId, user_id: currentUserId, role: 'creator', joined_at: newGroup.createdAt, matches_played: 0, wins: 0, losses: 0, win_rate: 0, attendance_rate: 0, current_streak: 0, points: 0 })
          .catch(e => console.warn('Failed to add group member', e));

        toast.success(`Group "${input.name}" created!`);
        return newId;
      },

      joinGroup: (groupId) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return;
        const user = get().users.find((u: any) => u.id === currentUserId) || getUserById(currentUserId);
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

        db.updateGroup(groupId, { member_count: group.memberCount }).catch(e => console.warn('Failed to update group', e));
        db.addGroupMember({ group_id: groupId, user_id: currentUserId, role: 'member', joined_at: new Date().toISOString().split('T')[0], matches_played: 0, wins: 0, losses: 0, win_rate: 0, attendance_rate: 0, current_streak: 0, points: 0 })
          .catch(e => console.warn('Failed to add group member', e));

        toast.success(`Joined "${group.name}"!`);
      },

      inviteByProfileCode: (groupId, profileCode) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return false;
        const user = get().users.find((u: any) => u.id === currentUserId) || getUserById(currentUserId);
        const invitedUser = get().users.find((u: any) => u.profileCode === profileCode);
        const group = get().groups.find(g => g.id === groupId);
        if (!user || !invitedUser || !group) {
          toast.error('Invalid profile code');
          return false;
        }
        if (invitedUser.id === currentUserId) { toast.error("Can't invite yourself"); return false; }
        if (invitedUser.joinedGroups.length >= 3) { toast.error('User has reached their join limit (3)'); return false; }
        if (invitedUser.joinedGroups.includes(groupId) || invitedUser.createdGroups.includes(groupId)) { toast.error('User is already a member'); return false; }

        invitedUser.joinedGroups = [...invitedUser.joinedGroups, groupId];
        group.memberCount++;
        group.members.push({
          userId: invitedUser.id, role: 'member', joinedAt: new Date().toISOString().split('T')[0],
          stats: { matchesPlayed: 0, wins: 0, losses: 0, winRate: 0, attendanceRate: 0, currentStreak: 0, points: 0 },
        });

        set(s => ({ groups: s.groups.map(g => g.id === groupId ? group : g) }));

        db.updateGroup(groupId, { member_count: group.memberCount }).catch(e => console.warn('Failed to update group', e));
        db.addGroupMember({ group_id: groupId, user_id: invitedUser.id, role: 'member', joined_at: new Date().toISOString().split('T')[0], matches_played: 0, wins: 0, losses: 0, win_rate: 0, attendance_rate: 0, current_streak: 0, points: 0 })
          .catch(e => console.warn('Failed to add group member', e));

        toast.success(`Invited ${invitedUser.name} to the group!`);
        return true;
      },

      updateGroupDetails: (groupId, updates) => {
        set(s => ({
          groups: s.groups.map(g =>
            g.id === groupId ? { ...g, ...updates } : g
          ),
        }));
        db.updateGroup(groupId, updates)
          .catch(e => console.warn('Failed to update group details', e));
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
          .catch(e => console.warn('Failed to update member role', e));
      },

      // ---- FRIENDS ----
      sendFriendRequest: (friendId) => {
        const id = `fs_${Date.now()}`;
        const currentUserId = get().currentUserId;
        if (!currentUserId) return;
        const friendship: Friendship = { id, userId: currentUserId, friendId, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        set(s => ({ friendships: [...s.friendships, friendship] }));
        db.createFriendshipInDb(friendship).catch(e => console.warn('Failed to save friendship', e));
        toast.success('Friend request sent!');
      },

      acceptFriendRequest: (friendshipId) => {
        set(s => ({
          friendships: s.friendships.map(f => f.id === friendshipId ? { ...f, status: 'accepted' as const, updatedAt: new Date().toISOString() } : f),
        }));
        db.updateFriendshipInDb(friendshipId, { status: 'accepted', updated_at: new Date().toISOString() })
          .catch(e => console.warn('Failed to accept friendship', e));
        toast.success('Friend request accepted!');
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
          console.warn('Failed to save story to DB', e);
        }
        toast.success('Story uploaded!');
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
          const user = allUsers.find((u: any) => u.id === uid) || getUserById(uid);
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
          db.updateEventInDb(eventId, { gallery: event.gallery }).catch(e => console.warn('Failed to update gallery', e));
        }
      },
    }),
    {
      name: 'whosin-store',
      version: 2,
      migrate: (persisted: any) => ({
        ...persisted,
        isLoggedIn: true,
        currentUserId: 'u1',
        loaded: true,
      }),
      partialize: (state) => ({
        activeTab: state.activeTab,
        userProfiles: state.userProfiles,
      }),
    }
  )
);

// Required for mock login backward compat
import { getUserByEmail, getUserByPhone, setCurrentUserId } from '../data/mockData';
