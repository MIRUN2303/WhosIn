import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AttendanceStatus, Notification, Event, Group, Story, Friendship, League } from '../data/types';
import { EVENTS, NOTIFICATIONS, GROUPS, USERS, setCurrentUserId, getUserById, getUserByEmail, getUserByPhone, getUserByProfileCode, generateId } from '../data/mockData';
import toast from 'react-hot-toast';

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
}

interface CreateEventInput {
  groupId: string;
  title: string;
  sport: string;
  date: string;
  time: string;
  endTime?: string;
  venue: string;
  description?: string;
  coverImage?: string;
  maxSlots?: number;
  isRecurring?: boolean;
  recurringPattern?: string;
}

interface CreateLiveEventInput {
  groupId: string;
  venue: string;
  title?: string;
  description?: string;
}

interface CreateGroupInput {
  name: string;
  description: string;
  isPrivate: boolean;
  rules: string[];
}

interface AppState {
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
  completeEvent: (eventId: string) => void;

  getGroupEvents: (groupId: string) => Event[];
  getNextGroupEvent: (groupId: string) => Event | undefined;
  getMyGroupsNextEvents: () => { groupId: string; event: Event }[];

  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: () => number;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp'>) => void;

  activeTab: string;
  setActiveTab: (tab: string) => void;

  groups: Group[];
  createGroup: (input: CreateGroupInput) => string;
  joinGroup: (groupId: string) => void;
  inviteByProfileCode: (groupId: string, profileCode: string) => boolean;

  // Friends & Stories
  stories: Story[];
  friendships: Friendship[];
  sendFriendRequest: (friendId: string) => void;
  acceptFriendRequest: (friendshipId: string) => void;
  uploadStory: (imageUrl: string, caption?: string) => void;
  getActiveStories: (userId: string) => Story[];
  getFriendsWithStories: () => { user: any; stories: Story[] }[];
  uploadEventImage: (eventId: string, imageUrl: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isLoggedIn: true,
      currentUserId: 'u1',

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
          name,
          username: name.toLowerCase().replace(/\s+/g, ''),
          email,
          phone,
          password,
          profileCode: `${name.split(' ')[0].toUpperCase()}${String(USERS.length + 1).padStart(3, '0')}`,
          avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4`,
          coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
          bio: '',
          favouriteSports: [],
          badges: [],
          stats: {
            totalMatches: 0, wins: 0, losses: 0, attendanceRate: 0, currentStreak: 0, longestStreak: 0, winRate: 0,
            weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
            monthlyActivity: [],
            sportBreakdown: [],
            pointsTotal: 0, mvpCount: 0,
          },
          createdGroups: [],
          joinedGroups: [],
          joinedAt: new Date().toISOString().split('T')[0],
          level: 1,
          xp: 0,
        };
        USERS.push(newUser);
        setCurrentUserId(newUser.id);
        set({ isLoggedIn: true, currentUserId: newUser.id });
        return true;
      },

      logout: () => {
        setCurrentUserId(null);
        set({ isLoggedIn: false, currentUserId: null });
      },

      events: EVENTS,
      notifications: NOTIFICATIONS,
      activeTab: 'home',
      groups: GROUPS,
      stories: [],
      friendships: [],

      updateAttendance: (eventId, userId, status) => {
        set(state => ({
          events: state.events.map(event => {
            if (event.id !== eventId) return event;
            const existing = event.attendance.find(a => a.userId === userId);
            if (existing) {
              return {
                ...event,
                attendance: event.attendance.map(a =>
                  a.userId === userId
                    ? { ...a, status, updatedAt: new Date().toISOString() }
                    : a
                ),
              };
            } else {
              return {
                ...event,
                attendance: [
                  ...event.attendance,
                  { userId, status, updatedAt: new Date().toISOString() },
                ],
              };
            }
          }),
        }));
      },

      createEvent: (input) => {
        const newId = uid();
        const currentUserId = get().currentUserId || '';
        const now = new Date().toISOString();
        const sport = (input.sport || 'custom') as any;

        const newEvent: Event = {
          id: newId,
          title: input.title,
          sport,
          groupId: input.groupId,
          date: input.date,
          time: input.time,
          endTime: input.endTime || '',
          venue: input.venue,
          venueAddress: '',
          description: input.description || '',
          coverImage: input.coverImage || '',
          organizer: currentUserId,
          maxSlots: input.maxSlots || 12,
          weather: { condition: 'TBD', temp: 28, icon: '☀️', humidity: 60, wind: 10 },
          attendance: [
            { userId: currentUserId, status: 'coming', updatedAt: now },
          ],
          leagues: [],
          status: 'upcoming',
          isRecurring: input.isRecurring || false,
          recurringPattern: input.recurringPattern,
          announcements: [],
          gallery: [],
          tags: [],
        };

        set(state => ({
          events: [...state.events, newEvent],
        }));

        const grp = get().groups.find(g => g.id === input.groupId);
        get().addNotification({
          type: 'event',
          title: `New Event: ${input.title}`,
          body: `Created in ${grp?.name || 'your group'}. Invite your crew!`,
          read: false,
          actionUrl: `/events/${newId}`,
          avatar: '📅',
        });

        return newId;
      },

      createLiveEvent: (input) => {
        const newId = uid();
        const currentUserId = get().currentUserId || '';
        const now = new Date().toISOString();
        const today = now.split('T')[0];
        const nowTime = now.split('T')[1]?.slice(0, 5) || '19:00';
        const endH = Math.min(parseInt(nowTime.split(':')[0]) + 3, 23);
        const endTime = `${String(endH).padStart(2, '0')}:${nowTime.split(':')[1] || '00'}`;

        const newEvent: Event = {
          id: newId,
          title: input.title || `Live Match @ ${input.venue}`,
          sport: 'badminton' as any,
          groupId: input.groupId,
          date: today,
          time: nowTime,
          endTime,
          venue: input.venue,
          venueAddress: '',
          description: input.description || '',
          coverImage: '',
          organizer: currentUserId,
          maxSlots: 12,
          weather: { condition: 'TBD', temp: 28, icon: '☀️', humidity: 60, wind: 10 },
          attendance: [
            { userId: currentUserId, status: 'coming', updatedAt: now },
          ],
          leagues: [],
          status: 'live',
          isRecurring: false,
          announcements: [],
          gallery: [],
          tags: [],
        };

        set(state => ({
          events: [...state.events, newEvent],
        }));

        const grp = get().groups.find(g => g.id === input.groupId);
        get().addNotification({
          type: 'event',
          title: `🔥 Live: ${input.title}`,
          body: `Happening now in ${grp?.name || 'your group'}!`,
          read: false,
          actionUrl: `/events/${newId}`,
          avatar: '🔥',
        });

        return newId;
      },

      startEvent: (eventId) => {
        set(state => ({
          events: state.events.map(e =>
            e.id === eventId && e.status === 'upcoming'
              ? { ...e, status: 'live' as const }
              : e
          ),
        }));
      },

      pauseEvent: (eventId) => {
        set(state => ({
          events: state.events.map(e =>
            e.id === eventId && e.status === 'live'
              ? { ...e, status: 'paused' as const }
              : e
          ),
        }));
      },

      resumeEvent: (eventId) => {
        set(state => ({
          events: state.events.map(e =>
            e.id === eventId && e.status === 'paused'
              ? { ...e, status: 'live' as const }
              : e
          ),
        }));
      },

      createLeague: (input) => {
        const lid = `l_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const league = {
          id: lid,
          name: input.name,
          players: [],
          teams: [],
          matches: [],
          status: 'pending' as const,
          format: input.format,
        } as League;
        set(state => ({
          events: state.events.map(e =>
            e.id === input.eventId ? { ...e, leagues: [...e.leagues, league] } : e
          ),
        }));
        return lid;
      },

      addMatch: (input) => {
        const newMid = `m_${Date.now()}`;
        const team1Id = `t_${newMid}_1`;
        const team2Id = `t_${newMid}_2`;
        const winnerId = input.score1 > input.score2 ? team1Id : (input.score2 > input.score1 ? team2Id : null);
        const teamColors = ['#00ff41', '#7c3aed'];
        set(state => ({
          events: state.events.map(e => ({
            ...e,
            leagues: e.leagues.map(l =>
              l.id === input.leagueId
                ? {
                    ...l,
                    teams: [
                      ...l.teams.filter(t => t.id !== team1Id && t.id !== team2Id),
                      { id: team1Id, leagueId: input.leagueId, name: 'Side 1', playerIds: input.side1PlayerIds, color: teamColors[0] },
                      { id: team2Id, leagueId: input.leagueId, name: 'Side 2', playerIds: input.side2PlayerIds, color: teamColors[1] },
                    ],
                    matches: [...l.matches, {
                      id: newMid,
                      leagueId: input.leagueId,
                      team1Id,
                      team2Id,
                      score1: input.score1,
                      score2: input.score2,
                      winnerId,
                      duration: 0,
                      notes: '',
                      completedAt: winnerId ? new Date().toISOString() : null,
                    }],
                  }
                : l
            ),
          })),
        }));
        return newMid;
      },

      updateMatchScore: (eventId, leagueId, matchId, score1, score2, winnerId) => {
        set(state => ({
          events: state.events.map(e =>
            e.id === eventId
              ? {
                  ...e,
                  leagues: e.leagues.map(l =>
                    l.id === leagueId
                      ? {
                          ...l,
                          matches: l.matches.map(m =>
                            m.id === matchId
                              ? { ...m, score1, score2, winnerId, completedAt: winnerId ? new Date().toISOString() : null }
                              : m
                          ),
                        }
                      : l
                  ),
                }
              : e
          ),
        }));
      },

      completeEvent: (eventId) => {
        set(state => ({
          events: state.events.map(e =>
            e.id === eventId && e.status === 'live'
              ? { ...e, status: 'completed' as const }
              : e
          ),
        }));
      },

      deleteMatch: (eventId, leagueId, matchId) => {
        set(state => ({
          events: state.events.map(e =>
            e.id === eventId
              ? {
                  ...e,
                  leagues: e.leagues.map(l =>
                    l.id === leagueId
                      ? { ...l, matches: l.matches.filter(m => m.id !== matchId) }
                      : l
                  ),
                }
              : e
          ),
        }));
      },

      deleteLeague: (eventId, leagueId) => {
        set(state => ({
          events: state.events.map(e =>
            e.id === eventId
              ? { ...e, leagues: e.leagues.filter(l => l.id !== leagueId) }
              : e
          ),
        }));
      },

      editEvent: (eventId, updates) => {
        set(state => ({
          events: state.events.map(e =>
            e.id === eventId ? { ...e, ...updates } : e
          ),
        }));
      },

      getGroupEvents: (groupId) => {
        return get()
          .events
          .filter(e => e.groupId === groupId)
          .sort((a, b) => {
            if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
            if (b.status === 'upcoming' && a.status !== 'upcoming') return 1;
            return a.date.localeCompare(b.date);
          });
      },

      getNextGroupEvent: (groupId) => {
        const today = new Date().toISOString().split('T')[0];
        return get()
          .events
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
        const user = getUserById(state.currentUserId || '');
        const myGroupIds = user ? [...user.createdGroups, ...user.joinedGroups] : [];

        return myGroupIds
          .map(groupId => {
            const event = state.events
              .filter(e => e.groupId === groupId && (e.status === 'upcoming' || e.status === 'live') && e.date >= today)
              .sort((a, b) => {
                if (a.status === 'live' && b.status !== 'live') return -1;
                if (b.status === 'live' && a.status !== 'live') return 1;
                return a.date.localeCompare(b.date);
              })[0];
            return event ? { groupId, event } : null;
          })
          .filter(Boolean) as { groupId: string; event: Event }[];
      },

      markNotificationRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
        }));
      },

      unreadCount: () => get().notifications.filter(n => !n.read).length,

      addNotification: (n) => {
        const newNotif: Notification = {
          ...n,
          id: `notif_${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        set(state => ({
          notifications: [newNotif, ...state.notifications],
        }));
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      createGroup: (input) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return '';
        const user = getUserById(currentUserId);
        if (!user || user.createdGroups.length >= 3) {
          toast.error('You can create at most 3 groups');
          return '';
        }

        const newId = gid();
        const newGroup: Group = {
          id: newId,
          name: input.name,
          logo: '🎯',
          banner: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
          description: input.description,
          memberCount: 1,
          members: [{
            userId: currentUserId,
            role: 'creator',
            joinedAt: new Date().toISOString().split('T')[0],
            stats: { matchesPlayed: 0, wins: 0, losses: 0, winRate: 0, attendanceRate: 0, currentStreak: 0, points: 0 },
          }],
          createdAt: new Date().toISOString().split('T')[0],
          rules: input.rules,
          isPrivate: input.isPrivate,
          tags: [],
          upcomingEvents: 0,
          totalEvents: 0,
        };

        user.createdGroups = [...user.createdGroups, newId];

        set(state => ({
          groups: [...state.groups, newGroup],
        }));

        toast.success(`Group "${input.name}" created!`);
        return newId;
      },

      joinGroup: (groupId) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return;
        const user = getUserById(currentUserId);
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
          userId: currentUserId,
          role: 'member',
          joinedAt: new Date().toISOString().split('T')[0],
          stats: { matchesPlayed: 0, wins: 0, losses: 0, winRate: 0, attendanceRate: 0, currentStreak: 0, points: 0 },
        });

        set(state => ({
          groups: state.groups.map(g => g.id === groupId ? group : g),
        }));

        toast.success(`Joined "${group.name}"!`);
      },

      inviteByProfileCode: (groupId, profileCode) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return false;
        const user = getUserById(currentUserId);
        const invitedUser = getUserByProfileCode(profileCode);
        const group = get().groups.find(g => g.id === groupId);
        if (!user || !invitedUser || !group) {
          toast.error('Invalid profile code');
          return false;
        }
        if (invitedUser.id === currentUserId) {
          toast.error("Can't invite yourself");
          return false;
        }
        if (invitedUser.joinedGroups.length >= 3) {
          toast.error('User has reached their join limit (3)');
          return false;
        }
        if (invitedUser.joinedGroups.includes(groupId) || invitedUser.createdGroups.includes(groupId)) {
          toast.error('User is already a member');
          return false;
        }

        invitedUser.joinedGroups = [...invitedUser.joinedGroups, groupId];
        group.memberCount++;
        group.members.push({
          userId: invitedUser.id,
          role: 'member',
          joinedAt: new Date().toISOString().split('T')[0],
          stats: { matchesPlayed: 0, wins: 0, losses: 0, winRate: 0, attendanceRate: 0, currentStreak: 0, points: 0 },
        });

        set(state => ({
          groups: state.groups.map(g => g.id === groupId ? group : g),
        }));

        toast.success(`Invited ${invitedUser.name} to the group!`);
        return true;
      },

      // Friends
      sendFriendRequest: (friendId) => {
        const id = `fs_${Date.now()}`;
        const currentUserId = get().currentUserId;
        if (!currentUserId) return;
        set(state => ({
          friendships: [
            ...state.friendships,
            { id, userId: currentUserId, friendId, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          ],
        }));
        toast.success('Friend request sent!');
      },

      acceptFriendRequest: (friendshipId) => {
        set(state => ({
          friendships: state.friendships.map(f =>
            f.id === friendshipId ? { ...f, status: 'accepted' as const, updatedAt: new Date().toISOString() } : f
          ),
        }));
        toast.success('Friend request accepted!');
      },

      // Stories
      uploadStory: (imageUrl, caption) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return;
        const todayStr = new Date().toISOString().split('T')[0];
        const todayCount = get().stories.filter(s => s.userId === currentUserId && s.createdAt.startsWith(todayStr)).length;
        if (todayCount >= 10) { toast.error('Daily limit reached (10 stories)'); return; }
        const id = `st_${Date.now()}`;
        const now = new Date();
        const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        set(state => ({
          stories: [
            ...state.stories,
            { id, userId: currentUserId, imageUrl, caption: caption || '', createdAt: now.toISOString(), expiresAt: expires.toISOString() },
          ],
        }));
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
        const allUserIds = [...new Set([...friendIds, currentUserId])];
        return allUserIds.map(uid => {
          const user = getUserById(uid);
          const activeStories = get().stories.filter(s => s.userId === uid && new Date(s.expiresAt).getTime() > now).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
          return { user, stories: activeStories };
        }).filter(x => x.user && x.stories.length > 0);
      },

      // Event Gallery
      uploadEventImage: (eventId, imageUrl) => {
        set(state => ({
          events: state.events.map(e =>
            e.id === eventId && e.gallery.length < 10
              ? { ...e, gallery: [...e.gallery, imageUrl] }
              : e
          ),
        }));
      },
    }),
    {
      name: 'whosin-store',
      version: 1,
      migrate: (persisted: any) => ({
        ...persisted,
        isLoggedIn: true,
        currentUserId: 'u1',
      }),
      partialize: (state) => ({
        events: state.events,
        notifications: state.notifications,
        activeTab: state.activeTab,
        groups: state.groups,
        stories: state.stories,
        friendships: state.friendships,
      }),
    }
  )
);
