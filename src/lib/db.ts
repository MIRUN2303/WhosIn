import { supabaseNoAuth } from './supabase';
import type {
  User, Group, GroupMember, Event, League, Team, Match,
  AttendanceRecord, Notification, Friendship, Story, JoinRequest,
} from '../data/types';

// =============================================
// HELPERS
// =============================================
function now() { return new Date().toISOString(); }

// =============================================
// USERS
// =============================================
export async function fetchUsers(): Promise<User[]> {
  const { data, error } = await supabaseNoAuth.from('user_profiles_full').select('*');
  if (error) throw error;
  return (data || []).map(mapUser);
}

export async function fetchUserById(id: string): Promise<User | null> {
  const { data, error } = await supabaseNoAuth.from('user_profiles_full').select('*').eq('id', id).single();
  if (error) return null;
  return mapUser(data);
}

function mapUser(row: any): User {
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
      weeklyActivity: row.weekly_activity || [0,0,0,0,0,0,0],
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

// =============================================
// GROUPS
// =============================================
export async function fetchGroups(): Promise<Group[]> {
  const { data: gRows, error: gErr } = await supabaseNoAuth.from('groups').select('*');
  if (gErr) throw gErr;
  const { data: mRows, error: mErr } = await supabaseNoAuth.from('group_members').select('*');
  if (mErr) throw mErr;

  return (gRows || []).map(g => {
    const members = (mRows || []).filter(m => m.group_id === g.id).map(mapGroupMember);
    return {
      id: g.id,
      name: g.name,
      logo: g.logo,
      banner: g.banner,
      description: g.description,
      memberCount: g.member_count,
      members,
      createdAt: g.created_at,
      rules: g.rules || [],
      isPrivate: g.is_private,
      tags: g.tags || [],
      upcomingEvents: g.upcoming_events,
      totalEvents: g.total_events,
      inviteCode: g.invite_code || '',
    };
  });
}

function mapGroupMember(row: any): GroupMember {
  return {
    userId: row.user_id,
    role: row.role,
    joinedAt: row.joined_at,
    stats: {
      matchesPlayed: row.matches_played,
      wins: row.wins,
      losses: row.losses,
      winRate: row.win_rate,
      attendanceRate: row.attendance_rate,
      currentStreak: row.current_streak,
      points: row.points,
    },
  };
}

export async function createGroupInDb(group: Group): Promise<void> {
  const { error } = await supabaseNoAuth.from('groups').insert({
    id: group.id,
    name: group.name,
    logo: group.logo,
    banner: group.banner,
    description: group.description,
    member_count: group.memberCount,
    created_at: group.createdAt,
    rules: group.rules,
    is_private: group.isPrivate,
    tags: group.tags,
    upcoming_events: group.upcomingEvents,
    total_events: group.totalEvents,
    invite_code: group.inviteCode,
  });
  if (error) throw error;
}

export async function addGroupMember(member: any): Promise<void> {
  const { error } = await supabaseNoAuth.from('group_members').insert(member);
  if (error) throw error;
}

export async function updateGroupMemberRole(groupId: string, userId: string, role: string): Promise<void> {
  const { error } = await supabaseNoAuth.from('group_members').update({ role }).eq('group_id', groupId).eq('user_id', userId);
  if (error) throw error;
}

export async function deleteGroupInDb(id: string): Promise<void> {
  const { error } = await supabaseNoAuth.from('groups').delete().eq('id', id);
  if (error) throw error;
}

export async function removeGroupMember(groupId: string, userId: string): Promise<void> {
  const { error } = await supabaseNoAuth.from('group_members').delete().eq('group_id', groupId).eq('user_id', userId);
  if (error) throw error;
}

export async function updateGroup(id: string, updates: any): Promise<void> {
  const { error } = await supabaseNoAuth.from('groups').update(updates).eq('id', id);
  if (error) throw error;
}

// =============================================
// JOIN REQUESTS
// =============================================
export async function createJoinRequestInDb(request: JoinRequest): Promise<void> {
  const { error } = await supabaseNoAuth.from('group_join_requests').insert({
    group_id: request.groupId,
    user_id: request.userId,
    status: request.status,
    created_at: request.createdAt,
    updated_at: request.updatedAt,
  });
  if (error) throw error;
}

export async function updateJoinRequestInDb(requestId: string, updates: any): Promise<void> {
  const { error } = await supabaseNoAuth.from('group_join_requests').update(updates).eq('id', requestId);
  if (error) throw error;
}

export async function fetchJoinRequests(): Promise<JoinRequest[]> {
  const { data, error } = await supabaseNoAuth.from('group_join_requests').select('*');
  if (error) throw error;
  return (data || []).map(r => ({
    id: r.id,
    groupId: r.group_id,
    userId: r.user_id,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function updateUser(id: string, updates: any): Promise<void> {
  const statsFields = ['total_matches', 'wins', 'losses', 'attendance_rate', 'current_streak', 'longest_streak', 'win_rate', 'weekly_activity', 'points_total', 'mvp_count'];
  const statsUpdates: any = {};
  const profileUpdates: any = {};
  const levelUpdates: any = {};
  for (const [k, v] of Object.entries(updates)) {
    if (statsFields.includes(k)) statsUpdates[k] = v;
    else if (k === 'level' || k === 'xp') levelUpdates[k] = v;
    else profileUpdates[k] = v;
  }
  const promises: Promise<{ error: any }>[] = [];
  if (Object.keys(profileUpdates).length > 0) {
    promises.push(supabaseNoAuth.from('profiles').update(profileUpdates).eq('id', id) as any);
  }
  if (Object.keys(statsUpdates).length > 0) {
    promises.push(supabaseNoAuth.from('user_stats').upsert({ user_id: id, ...statsUpdates, updated_at: now() }) as any);
  }
  if (Object.keys(levelUpdates).length > 0) {
    promises.push(supabaseNoAuth.from('user_levels').upsert({ user_id: id, ...levelUpdates, updated_at: now() }) as any);
  }
  if (promises.length === 0) return;
  const results = await Promise.all(promises);
  for (const r of results) {
    if (r.error) throw r.error;
  }
}

// =============================================
// EVENTS (with nested leagues/teams/matches/attendance)
// =============================================
export async function fetchEvents(): Promise<Event[]> {
  const { data: eRows, error: eErr } = await supabaseNoAuth.from('events').select('*');
  if (eErr) throw eErr;

  if (!eRows || eRows.length === 0) return [];

  const ids = eRows.map(e => e.id);
  const { data: aRows, error: aErr } = await supabaseNoAuth.from('attendance').select('*').in('event_id', ids);
  if (aErr) throw aErr;

  const { data: lRows, error: lErr } = await supabaseNoAuth.from('leagues').select('*').in('event_id', ids);
  if (lErr) throw lErr;

  const leagueIds = (lRows || []).map(l => l.id);
  let tRows: any[] = [];
  let mRows: any[] = [];
  if (leagueIds.length > 0) {
    const [tr, mr] = await Promise.all([
      supabaseNoAuth.from('teams').select('*').in('league_id', leagueIds),
      supabaseNoAuth.from('matches').select('*').in('league_id', leagueIds),
    ]);
    if (tr.error) throw tr.error;
    if (mr.error) throw mr.error;
    tRows = tr.data || [];
    mRows = mr.data || [];
  }

  return (eRows || []).map(e => {
    const attRows = (aRows || []).filter(a => a.event_id === e.id);
    const lRows2 = (lRows || []).filter(l => l.event_id === e.id);

    const attendance: AttendanceRecord[] = attRows.map(a => ({
      userId: a.user_id,
      status: a.status,
      updatedAt: a.updated_at,
    }));

    const leagues: League[] = lRows2.map(l => {
      const teams2 = (tRows || []).filter(t => t.league_id === l.id).map(mapTeam);
      const matches2 = (mRows || []).filter(m => m.league_id === l.id).map(mapMatch);
      return {
        id: l.id,
        name: l.name,
        format: l.format || 'doubles',
        players: l.players || [],
        teams: teams2,
        matches: matches2,
        status: l.status,
      };
    });

    return {
      id: e.id,
      title: e.title,
      sport: e.sport,
      category: e.category || 'badminton',
      groupId: e.group_id,
      date: e.date,
      time: e.time,
      endTime: e.end_time || '',
      venue: e.venue,
      venueAddress: e.venue_address || '',
      description: e.description || '',
      summary: e.summary || '',
      coverImage: e.cover_image || '',
      organizer: e.organizer,
      maxSlots: e.max_slots,
      weather: {
        condition: e.weather_condition,
        temp: e.weather_temp,
        icon: e.weather_icon,
        humidity: e.weather_humidity,
        wind: e.weather_wind,
      },
      attendance,
      leagues,
      status: e.status,
      isRecurring: e.is_recurring,
      recurringPattern: e.recurring_pattern,
      announcements: [],
      gallery: e.gallery || [],
      tags: e.tags || [],
      startPoint: e.start_point || '',
      endPoint: e.end_point || '',
      gatherPoint: e.gather_point || '',
      distance: e.distance || '',
      motivation: e.motivation || '',
      rankings: e.rankings || [],
      mvps: e.mvps || [],
    };
  });
}

function mapTeam(row: any): Team {
  return { id: row.id, name: row.name, playerIds: row.player_ids || [], color: row.color };
}

function mapMatch(row: any): Match {
  return {
    id: row.id,
    name: row.name || '',
    isFinal: row.is_final || false,
    team1Id: row.team1_id,
    team2Id: row.team2_id,
    score1: row.score1,
    score2: row.score2,
    winnerId: row.winner_id,
    duration: row.duration,
    notes: row.notes,
    completedAt: row.completed_at,
  };
}

export async function createEventInDb(event: Event): Promise<void> {
  const { error } = await supabaseNoAuth.from('events').insert({
    id: event.id,
    title: event.title,
    sport: event.sport,
    category: event.category || 'badminton',
    group_id: event.groupId,
    date: event.date,
    time: event.time,
    end_time: event.endTime,
    venue: event.venue,
    venue_address: event.venueAddress,
    description: event.description,
    summary: event.summary || '',
    cover_image: event.coverImage,
    organizer: event.organizer,
    max_slots: event.maxSlots,
    weather_condition: event.weather.condition,
    weather_temp: event.weather.temp,
    weather_icon: event.weather.icon,
    weather_humidity: event.weather.humidity,
    weather_wind: event.weather.wind,
    status: event.status,
    is_recurring: event.isRecurring,
    recurring_pattern: event.recurringPattern || null,
    tags: event.tags,
    gallery: event.gallery,
    start_point: event.startPoint || '',
    end_point: event.endPoint || '',
    gather_point: event.gatherPoint || '',
    distance: event.distance || '',
    motivation: event.motivation || '',
    rankings: event.rankings || [],
    mvps: event.mvps || [],
  });
  if (error) throw error;
}

export async function deleteEventFromDb(id: string): Promise<void> {
  const { error } = await supabaseNoAuth.from('events').delete().eq('id', id);
  if (error) throw error;
}

export async function updateEventInDb(id: string, updates: any): Promise<void> {
  const { error } = await supabaseNoAuth.from('events').update(updates).eq('id', id);
  if (error) throw error;
}

export async function upsertAttendance(eventId: string, userId: string, status: string): Promise<void> {
  const { error } = await supabaseNoAuth.from('attendance').upsert(
    { event_id: eventId, user_id: userId, status, updated_at: now() },
    { onConflict: 'event_id,user_id' }
  );
  if (error) throw error;
}

export async function createLeagueInDb(league: League, eventId: string): Promise<void> {
  const { error } = await supabaseNoAuth.from('leagues').insert({
    id: league.id,
    event_id: eventId,
    name: league.name,
    format: league.format || 'doubles',
    players: league.players,
    status: league.status,
  });
  if (error) throw error;
}

export async function deleteLeagueFromDb(leagueId: string): Promise<void> {
  await supabaseNoAuth.from('matches').delete().eq('league_id', leagueId);
  await supabaseNoAuth.from('teams').delete().eq('league_id', leagueId);
  const { error } = await supabaseNoAuth.from('leagues').delete().eq('id', leagueId);
  if (error) throw error;
}

export async function addMatchToDb(match: Match, leagueId: string, teams: Team[]): Promise<void> {
  for (const t of teams) {
    const { error } = await supabaseNoAuth.from('teams').upsert(
      { id: t.id, league_id: leagueId, name: t.name, player_ids: t.playerIds, color: t.color },
      { onConflict: 'id' }
    );
    if (error) throw error;
  }
  const { error } = await supabaseNoAuth.from('matches').insert({
    id: match.id,
    league_id: leagueId,
    name: match.name || '',
    is_final: match.isFinal || false,
    team1_id: match.team1Id,
    team2_id: match.team2Id,
    score1: match.score1,
    score2: match.score2,
    winner_id: match.winnerId,
    duration: match.duration || 0,
    notes: match.notes || '',
    completed_at: match.completedAt,
  });
  if (error) throw error;
}

export async function updateMatchInDb(matchId: string, updates: any): Promise<void> {
  const { error } = await supabaseNoAuth.from('matches').update(updates).eq('id', matchId);
  if (error) throw error;
}

export async function deleteMatchFromDb(matchId: string): Promise<void> {
  const { error } = await supabaseNoAuth.from('matches').delete().eq('id', matchId);
  if (error) throw error;
}

// =============================================
// NOTIFICATIONS
// =============================================
export async function fetchNotifications(): Promise<Notification[]> {
  const { data, error } = await supabaseNoAuth.from('notifications').select('*').order('timestamp', { ascending: false });
  if (error) throw error;
  return (data || []).map(r => ({
    id: r.id,
    type: r.type,
    title: r.title,
    body: r.body,
    timestamp: r.timestamp,
    read: r.read,
    actionUrl: r.action_url,
    avatar: r.avatar,
  }));
}

export async function createNotificationInDb(n: Omit<Notification, 'id' | 'timestamp'> & { id: string; timestamp: string; userId?: string }): Promise<void> {
  const { error } = await supabaseNoAuth.from('notifications').insert({
    id: n.id,
    user_id: (n as any).userId || '',
    type: n.type,
    title: n.title,
    body: n.body,
    read: n.read,
    action_url: n.actionUrl || null,
    avatar: n.avatar || null,
    timestamp: n.timestamp,
  });
  if (error) throw error;
}

export async function markNotificationReadInDb(id: string): Promise<void> {
  const { error } = await supabaseNoAuth.from('notifications').update({ read: true }).eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsReadInDb(): Promise<void> {
  const { error } = await supabaseNoAuth.from('notifications').update({ read: true }).neq('id', '');
  if (error) throw error;
}

// =============================================
// FRIENDSHIPS
// =============================================
export async function fetchFriendships(): Promise<Friendship[]> {
  const { data, error } = await supabaseNoAuth.from('friendships').select('*');
  if (error) throw error;
  return (data || []).map(r => ({
    id: r.id,
    userId: r.user_id,
    friendId: r.friend_id,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function createFriendshipInDb(f: Friendship): Promise<void> {
  const { error } = await supabaseNoAuth.from('friendships').insert({
    id: f.id,
    user_id: f.userId,
    friend_id: f.friendId,
    status: f.status,
    created_at: f.createdAt,
    updated_at: f.updatedAt,
  });
  if (error) throw error;
}

export async function updateFriendshipInDb(id: string, updates: any): Promise<void> {
  const { error } = await supabaseNoAuth.from('friendships').update(updates).eq('id', id);
  if (error) throw error;
}

// =============================================
// STORIES
// =============================================
export async function fetchStories(): Promise<Story[]> {
  const { data, error } = await supabaseNoAuth.from('stories').select('*');
  if (error) throw error;
  return (data || []).map(r => ({
    id: r.id,
    userId: r.user_id,
    imageUrl: r.image_url,
    caption: r.caption,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
  }));
}

export async function createStoryInDb(story: Story): Promise<void> {
  const { error } = await supabaseNoAuth.from('stories').insert({
    id: story.id,
    user_id: story.userId,
    image_url: story.imageUrl,
    caption: story.caption,
    created_at: story.createdAt,
    expires_at: story.expiresAt,
  });
  if (error) throw error;
}

export async function deleteStoryFromDb(storyId: string): Promise<void> {
  const { error } = await supabaseNoAuth.from('stories').delete().eq('id', storyId);
  if (error) throw error;
}

export async function getTodayStoryCount(userId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const { count, error } = await supabaseNoAuth
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', today);
  if (error) throw error;
  return count || 0;
}
