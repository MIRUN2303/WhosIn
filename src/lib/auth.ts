import { supabase } from './supabase';
import type { User } from '../data/types';

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string, name: string, phone: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, phone } },
  });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/home' },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(callback: (session: any) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}

/**
 * Find or create a user row in the `users` table matching the authenticated user.
 * After social login we may need to auto-provision a row.
 */
export async function resolveUserFromAuth(
  authUserId: string,
  email: string,
  name?: string,
  phone?: string,
): Promise<User | null> {
  // 1. Try to find existing user by email
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (existing) return mapUserRow(existing);

  // 2. Create a new user row
  const displayName = name || email.split('@')[0];
  const newUser = {
    id: authUserId,
    name: displayName,
    username: displayName.toLowerCase().replace(/\s+/g, ''),
    email,
    phone: phone || '',
    password: '',
    profile_code: `${displayName.split(' ')[0].toUpperCase()}001`,
    avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=b6e3f4`,
    cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    bio: '',
    favourite_sports: [],
    badges: [],
    total_matches: 0, wins: 0, losses: 0,
    attendance_rate: 0, current_streak: 0, longest_streak: 0,
    win_rate: 0, weekly_activity: [0, 0, 0, 0, 0, 0, 0],
    points_total: 0, mvp_count: 0,
    created_groups: [], joined_groups: [],
    joined_at: new Date().toISOString().split('T')[0],
    level: 1, xp: 0,
  };

  const { data: created, error } = await supabase.from('users').insert(newUser).select().single();
  if (error) throw error;
  return mapUserRow(created);
}

function mapUserRow(row: any): User {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    phone: row.phone,
    password: row.password || '',
    profileCode: row.profile_code,
    avatar: row.avatar,
    coverImage: row.cover_image,
    bio: row.bio,
    favouriteSports: row.favourite_sports || [],
    badges: row.badges || [],
    stats: {
      totalMatches: row.total_matches,
      wins: row.wins,
      losses: row.losses,
      attendanceRate: row.attendance_rate,
      currentStreak: row.current_streak,
      longestStreak: row.longest_streak,
      winRate: row.win_rate,
      weeklyActivity: row.weekly_activity || [0, 0, 0, 0, 0, 0, 0],
      monthlyActivity: [],
      sportBreakdown: [],
      pointsTotal: row.points_total,
      mvpCount: row.mvp_count,
    },
    createdGroups: row.created_groups || [],
    joinedGroups: row.joined_groups || [],
    joinedAt: row.joined_at,
    level: row.level,
    xp: row.xp,
  };
}
