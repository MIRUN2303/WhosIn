import { supabase, supabaseNoAuth } from './supabase';
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
  // 1. Try to find existing user by email (anon client avoids RLS issues after login)
  const { data: existing } = await supabaseNoAuth
    .from('user_profiles_full')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (existing) return mapUserRow(existing);

  // 2. Create new records in normalized tables
  const displayName = name || email.split('@')[0];
  const now = new Date().toISOString();
  const profileCode = `${displayName.split(' ')[0].toUpperCase()}${String(Math.floor(10000 + Math.random() * 90000)).slice(0, 5)}`;

  // Create profile
  const { error: profileErr } = await supabase.from('profiles').insert({
    id: authUserId,
    name: displayName,
    username: displayName.toLowerCase().replace(/\s+/g, ''),
    email,
    phone: phone || '',
    profile_code: profileCode,
    avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=b6e3f4`,
    cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    bio: '',
    joined_at: now,
  });
  if (profileErr) throw profileErr;

  // Create stats
  await supabase.from('user_stats').insert({ user_id: authUserId }).maybeSingle();

  // Create levels
  await supabase.from('user_levels').insert({ user_id: authUserId }).maybeSingle();

  // Fetch and return
  const { data: created } = await supabaseNoAuth.from('user_profiles_full').select('*').eq('id', authUserId).single();
  if (created) return mapUserRow(created);

  // Fallback: try by email
  const { data: retry } = await supabaseNoAuth.from('user_profiles_full').select('*').eq('email', email).maybeSingle();
  if (retry) return mapUserRow(retry);
  throw new Error('Failed to create user profile');
}

function mapUserRow(row: any): User {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    phone: row.phone,
    password: '',
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
    joinedAt: typeof row.joined_at === 'string' ? row.joined_at : new Date(row.joined_at).toISOString().split('T')[0],
    level: row.level,
    xp: row.xp,
  };
}
