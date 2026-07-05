import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AttendanceStatus, Notification, Event, Group, SportType } from '../data/types';
import { EVENTS, NOTIFICATIONS, GROUPS, USERS, setCurrentUserId, getUserById, getUserByEmail, getUserByPhone, getUserByProfileCode, generateId } from '../data/mockData';
import toast from 'react-hot-toast';

const uid = () => `e_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const gid = () => `g_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

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

interface CreateGroupInput {
  name: string;
  sport: SportType;
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
        const group = GROUPS.find(g => g.id === input.groupId);
        const sport = (input.sport || group?.sport || 'custom') as any;

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
          coverImage: input.coverImage || group?.banner || '',
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

        get().addNotification({
          type: 'event',
          title: `New Event: ${input.title}`,
          body: `Created in ${group?.name || 'your group'}. Invite your crew!`,
          read: false,
          actionUrl: `/events/${newId}`,
          avatar: '📅',
        });

        return newId;
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
          .filter(e => e.groupId === groupId && e.status === 'upcoming' && e.date >= today)
          .sort((a, b) => a.date.localeCompare(b.date))[0];
      },

      getMyGroupsNextEvents: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const user = getUserById(state.currentUserId || '');
        const myGroupIds = user ? [...user.createdGroups, ...user.joinedGroups] : [];

        return myGroupIds
          .map(groupId => {
            const event = state.events
              .filter(e => e.groupId === groupId && e.status === 'upcoming' && e.date >= today)
              .sort((a, b) => a.date.localeCompare(b.date))[0];
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
          logo: input.sport === 'badminton' ? '🏸' : input.sport === 'cricket' ? '🏏' : input.sport === 'football' ? '⚽' : input.sport === 'trekking' ? '🥾' : input.sport === 'cycling' ? '🚴' : input.sport === 'running' ? '🏃' : input.sport === 'cafe' ? '☕' : '🎯',
          banner: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
          description: input.description,
          sport: input.sport,
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
          tags: [input.sport],
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
    }),
    {
      name: 'machiverse-store',
      partialize: (state) => ({
        events: state.events,
        notifications: state.notifications,
        activeTab: state.activeTab,
        isLoggedIn: state.isLoggedIn,
        currentUserId: state.currentUserId,
        groups: state.groups,
      }),
    }
  )
);
