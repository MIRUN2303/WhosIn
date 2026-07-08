import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { SPORT_CONFIG, BADGE_CONFIG } from '../../data/sportConfig';
import { Avatar, Button, ConfirmModal } from '../../components/ui';
import { Iconic } from '../../components/ui/icons';
import { FadeUp } from '../../components/motion';
import { useScrollLock } from '../../lib/useScrollLock';
import { useAppStore } from '../../store/useAppStore';
import toast from 'react-hot-toast';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SPORT_COLORS = ['#10b981', '#7c3aed', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f97316'];

const THEME_TOOLTIP = {
  contentStyle: { background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 11, color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' },
  labelStyle: { color: 'rgba(255,255,255,0.5)', fontWeight: 600 },
  itemStyle: { color: '#fff' },
};

const TABS = ['Stats', 'Badges', 'Friends'];

const RARITY_CONFIG: Record<string, { color: string; label: string }> = {
  common: { color: '#6b7280', label: 'Common' },
  uncommon: { color: '#22c55e', label: 'Uncommon' },
  rare: { color: '#3b82f6', label: 'Rare' },
  legendary: { color: '#f59e0b', label: 'Legendary' },
};

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const currentUserId = useAppStore(s => s.currentUserId);
  const users = useAppStore(s => s.users);
  const isLoggedIn = useAppStore(s => s.isLoggedIn);
  const logout = useAppStore(s => s.logout);
  const user = users.find(u => u.id === currentUserId);
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(() => searchParams.get('tab') === 'friends' ? 'Friends' : 'Stats');
  const [friendsSubTab, setFriendsSubTab] = useState(() => searchParams.get('tab') === 'friends' ? 'find' : 'list');

  const [searchQuery, setSearchQuery] = useState('');
  const [badgeInfo, setBadgeInfo] = useState<{ id: string; cfg: any; earned: boolean } | null>(null);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const friendships = useAppStore(s => s.friendships);
  const sendFriendRequest = useAppStore(s => s.sendFriendRequest);
  const acceptFriendRequest = useAppStore(s => s.acceptFriendRequest);
  const cancelFriendRequest = useAppStore(s => s.cancelFriendRequest);
  const removeFriend = useAppStore(s => s.removeFriend);
  const groups = useAppStore(s => s.groups);
  const allUsers = useAppStore(s => s.users);

  const friends = useMemo(() => {
    const accepted = friendships.filter(f => f.status === 'accepted' && (f.userId === currentUserId || f.friendId === currentUserId));
    return accepted.map(f => {
      const fid = f.userId === currentUserId ? f.friendId : f.userId;
      return allUsers.find(u => u.id === fid);
    }).filter(Boolean);
  }, [friendships, currentUserId, allUsers]);

  const pendingIncoming = useMemo(() => {
    return friendships.filter(f => f.status === 'pending' && f.friendId === currentUserId);
  }, [friendships, currentUserId]);

  const pendingOutgoing = useMemo(() => {
    return friendships.filter(f => f.status === 'pending' && f.userId === currentUserId);
  }, [friendships, currentUserId]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allUsers.filter(u =>
      u.id !== currentUserId &&
      (u.name.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q) || u.profileCode?.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [searchQuery, allUsers, currentUserId]);

  const weeklyData = user ? DAYS.map((day: string, i: number) => ({ day, value: user.stats.weeklyActivity[i] || 0 })) : [];
  const monthlyData: { month: string; matches: number; wins: number }[] = user?.stats.monthlyActivity?.length ? user.stats.monthlyActivity : [];
  const sportData: { sport: string; matches: number; wins: number }[] = user?.stats.sportBreakdown?.length ? user.stats.sportBreakdown : [];
  const totalSportMatches = sportData.reduce((s: number, d: { matches: number }) => s + d.matches, 0) || 1;
  const maxWeekly = Math.max(1, ...weeklyData.map(d => d.value));
  const badgeList = Object.entries(BADGE_CONFIG) as [string, { emoji: string; label: string; description: string; rarity: string }][];

  const performanceScore = useMemo(() => {
    if (!user) return 0;
    const weights = { winRate: 0.3, attendanceRate: 0.2, streak: 0.15, mvp: 0.15, points: 0.1, matches: 0.1 };
    const w = user.stats.winRate;
    const a = user.stats.attendanceRate;
    const s = Math.min(100, (user.stats.currentStreak / 20) * 100);
    const m = Math.min(100, (user.stats.mvpCount / 10) * 100);
    const p = Math.min(100, (user.stats.pointsTotal / Math.max(1, user.level * 50)) * 100);
    const t = Math.min(100, (user.stats.totalMatches / 50) * 100);
    const score = w * weights.winRate + a * weights.attendanceRate + s * weights.streak + m * weights.mvp + p * weights.points + t * weights.matches;
    return Math.round(score);
  }, [user?.stats, user?.level]);

  const performanceColor = performanceScore >= 80 ? '#10b981' : performanceScore >= 55 ? '#f59e0b' : performanceScore >= 30 ? '#f97316' : '#ef4444';
  const perfRingDash = `${(performanceScore / 100) * 283} 283`;

  const todayIndex = new Date().getDay();
  const adjustedToday = todayIndex === 0 ? 6 : todayIndex - 1;

  const myGroups = user ? groups.filter(g => user.createdGroups.includes(g.id) || user.joinedGroups.includes(g.id)) : [];

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <FadeUp>
          <div className="text-center space-y-4 max-w-xs">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background: 'rgba(var(--green-rgb),0.1)', border: '1px solid rgba(var(--green-rgb),0.2)' }}>
              <Iconic name="badminton" size={32} />
            </div>
            <h2 className="font-display font-black text-2xl text-white">Your Profile</h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Sign in to view your stats, badges, and activity.</p>
            <div className="flex gap-3 justify-center pt-2">
              <Link to="/login" className="flex-1 max-w-[120px] py-3 rounded-2xl font-black text-sm text-center transition-all"
                style={{ background: 'var(--green)', color: 'black' }}
              >Sign In</Link>
              <Link to="/signup" className="flex-1 max-w-[120px] py-3 rounded-2xl font-black text-sm text-center transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              >Sign Up</Link>
            </div>
          </div>
        </FadeUp>
      </div>
    );
  }

  return (
    <div className="pb-28 max-w-lg mx-auto px-4">
      <FadeUp>
        {/* HEADER */}
        <div className="flex items-center gap-4 pt-6">
          <Avatar src={user.avatar} name={user.name} size="xl" ring />
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-black text-xl text-white truncate">{user.name}</h1>
            <p className="text-white/40 text-xs">@{user.username}</p>
            {user.profileCode && (
              <div className="flex items-center gap-1.5 -mt-0.5">
                <p className="text-white/20 text-[10px] font-mono">{user.profileCode}</p>
                <motion.button
                  onClick={() => { navigator.clipboard.writeText(user.profileCode); toast.success('Copied!'); }}
                  className="relative w-3.5 h-3.5 flex items-center justify-center rounded-sm active:scale-90"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                  whileHover={{ scale: 1.2, background: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.8 }}
                  title="Copy profile code"
                >
                  <motion.span
                    className="absolute inset-0 flex items-center justify-center"
                    key="copy-icon"
                    initial={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </motion.span>
                </motion.button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(var(--green-rgb),0.12)', color: 'var(--green)' }}>
                <Iconic name="lightning" size={10} className="inline mr-0.5" /> Lv.{user.level}
              </span>
              <span className="text-[10px] text-white/30">{user.xp} XP</span>
              <span className="text-[10px] text-white/30">· {user.badges.length} badges</span>
            </div>
          </div>
          <Button variant="glass" size="sm" onClick={() => { logout(); navigate('/login'); }}>Logout</Button>
        </div>
      </FadeUp>

      {/* TAB BAR */}
      <div className="flex gap-1 glass rounded-2xl p-1 mt-4">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200"
            style={{
              background: tab === t ? 'var(--green)' : 'transparent',
              color: tab === t ? '#080808' : 'rgba(255,255,255,0.5)',
            }}
          >{t}</button>
        ))}
      </div>

      {/* ===== STATS TAB ===== */}
      {tab === 'Stats' && (
        <div className="space-y-3 mt-3">
          {/* PERFORMANCE OVERVIEW */}
          <div className="glass rounded-3xl p-4">
            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke={performanceColor} strokeWidth="6" strokeLinecap="round" strokeDasharray={perfRingDash} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black" style={{ color: performanceColor }}>{performanceScore}</span>
                  <span className="text-[9px] text-white/30 -mt-0.5">overall</span>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-2">
                {[
                  { label: 'Matches', value: user.stats.totalMatches, icon: 'activity', color: '#7c3aed' },
                  { label: 'Wins', value: user.stats.wins, icon: 'check_circle', color: '#10b981' },
                  { label: 'Win Rate', value: `${user.stats.winRate}%`, icon: 'target', color: user.stats.winRate >= 60 ? '#10b981' : '#f59e0b' },
                  { label: 'Streak', value: user.stats.currentStreak, icon: 'zap', color: '#f59e0b' },
                  { label: 'MVP', value: user.stats.mvpCount, icon: 'award', color: '#ef4444' },
                  { label: 'Points', value: user.stats.pointsTotal, icon: 'star', color: '#3b82f6' },
                ].map(stat => (
                  <div key={stat.label} className="rounded-xl p-2 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <p className="text-xs font-black" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-[9px] text-white/30 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* XP BAR */}
          <div className="glass rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white text-sm">Level {user.level}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-white/40 text-xs">{(user.xp || 0) % Math.max(1, user.level * 100)} / {user.level * 100} XP</span>
              </div>
            </div>
            <div className="relative w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, ((user.xp || 0) % Math.max(1, user.level * 100)) / (user.level * 100) * 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ background: 'linear-gradient(90deg, var(--green), var(--green-bright))', boxShadow: '0 0 12px rgba(var(--green-rgb),0.4)' }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-white/20 mt-1">
              <span>Lv.{user.level}</span>
              <span>Lv.{user.level + 1}</span>
            </div>
          </div>

          {/* WEEKLY ACTIVITY */}
          {weeklyData.some(d => d.value > 0) && (
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-1.5"><Iconic name="activity" size={14} /> Weekly Activity</p>
                <span className="text-[10px] text-white/30">{user.stats.weeklyActivity.reduce((a: number, b: number) => a + b, 0)} this week</span>
              </div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 4, right: 0, bottom: 0, left: -12 }}>
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                    <YAxis hide domain={[0, maxWeekly]} />
                    <Tooltip {...THEME_TOOLTIP} formatter={(v: unknown) => [`${Number(v)} events`, 'Activity']} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} minPointSize={4}>
                      {weeklyData.map((_d: { day: string; value: number }, i: number) => (
                        <Cell key={i} fill={i === adjustedToday ? 'var(--green)' : 'rgba(var(--green-rgb),0.2)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* MONTHLY ACTIVITY */}
          {monthlyData.length > 0 && (
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-1.5"><Iconic name="calendar" size={14} /> Monthly</p>
                <div className="flex items-center gap-3 ml-auto">
                  <span className="flex items-center gap-1 text-[9px]"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--green)' }} /> Matches</span>
                  <span className="flex items-center gap-1 text-[9px]"><span className="w-2 h-2 rounded-full" style={{ background: '#7c3aed' }} /> Wins</span>
                </div>
              </div>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 4, right: 0, bottom: 0, left: -12 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip {...THEME_TOOLTIP} />
                    <Line type="monotone" dataKey="matches" stroke="var(--green)" strokeWidth={2.5} dot={{ fill: 'var(--green)', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: 'var(--green)' }} />
                    <Line type="monotone" dataKey="wins" stroke="#7c3aed" strokeWidth={2.5} dot={{ fill: '#7c3aed', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#7c3aed' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* SPORT BREAKDOWN */}
          {sportData.length > 0 && (
            <div className="glass rounded-2xl p-4">
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4 flex items-center gap-1.5"><Iconic name="target" size={14} /> Sport Breakdown</p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sportData} dataKey="matches" nameKey="sport" cx="50%" cy="50%" innerRadius={30} outerRadius={46} paddingAngle={2} strokeWidth={0}>
                        {sportData.map((_s: { sport: string; matches: number; wins: number }, i: number) => (
                          <Cell key={i} fill={SPORT_COLORS[i % SPORT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip {...THEME_TOOLTIP} formatter={(v: unknown, n: unknown) => [`${Number(v)} matches`, String(n)]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-bold text-white/50">{sportData.length} sports</span>
                  </div>
                </div>
                <div className="flex-1 w-full space-y-2.5">
                  {sportData.map((s: { sport: string; matches: number; wins: number }, i: number) => {
                    const cfg = SPORT_CONFIG[s.sport as keyof typeof SPORT_CONFIG];
                    const pct = Math.round((s.matches / totalSportMatches) * 100);
                    return (
                      <div key={s.sport}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs">{cfg?.emoji || '🎯'}</span>
                            <span className="text-xs text-white/70 font-medium">{cfg?.label || s.sport}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-white/30">{s.matches} / {s.wins}W</span>
                            <span className="text-[10px] font-bold" style={{ color: SPORT_COLORS[i % SPORT_COLORS.length] }}>{pct}%</span>
                          </div>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                            style={{ background: SPORT_COLORS[i % SPORT_COLORS.length] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* RADAR CHART */}
          {(user.stats.totalMatches > 0) && (
            <div className="glass rounded-2xl p-4">
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Iconic name="activity" size={14} /> Stat Profile</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={[
                    { metric: 'Win Rate', value: user.stats.winRate, fullMark: 100 },
                    { metric: 'Attendance', value: user.stats.attendanceRate, fullMark: 100 },
                    { metric: 'Streak', value: Math.min(100, (user.stats.currentStreak / 20) * 100), fullMark: 100 },
                    { metric: 'MVP', value: Math.min(100, (user.stats.mvpCount / 10) * 100), fullMark: 100 },
                    { metric: 'Points', value: Math.min(100, (user.stats.pointsTotal / Math.max(1, user.level * 50)) * 100), fullMark: 100 },
                    { metric: 'Matches', value: Math.min(100, (user.stats.totalMatches / 50) * 100), fullMark: 100 },
                  ]}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.35)' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Stats" dataKey="value" stroke="var(--green)" strokeWidth={2} fill="var(--green)" fillOpacity={0.15} dot={{ fill: 'var(--green)', r: 3 }} />
                    <Tooltip {...THEME_TOOLTIP} formatter={(v: unknown) => [`${Math.round(Number(v))}%`, 'Score']} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* DETAIL STATS */}
          <div className="glass rounded-2xl p-4">
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Iconic name="list" size={14} /> All Stats</p>
            <div className="space-y-2.5">
              {[
                { label: 'Attendance Rate', value: `${user.stats.attendanceRate}%`, sub: `${user.stats.totalMatches} events attended`, pct: user.stats.attendanceRate },
                { label: 'Current Streak', value: `${user.stats.currentStreak}`, sub: `Best: ${user.stats.longestStreak}`, pct: Math.min(100, (user.stats.currentStreak / Math.max(1, user.stats.longestStreak)) * 100) },
                { label: 'MVP Count', value: `${user.stats.mvpCount}`, sub: `${user.stats.wins} total wins`, pct: Math.min(100, (user.stats.mvpCount / Math.max(1, user.stats.wins)) * 100) },
                { label: 'Total Points', value: `${user.stats.pointsTotal}`, sub: `${Math.round(user.stats.pointsTotal / Math.max(1, user.level || 1))} pts/level`, pct: Math.min(100, (user.stats.pointsTotal / Math.max(1, user.level * 50)) * 100) },
                { label: 'Badges Earned', value: `${user.badges?.length || 0}`, sub: `/ ${badgeList.length} total`, pct: ((user.badges?.length || 0) / badgeList.length) * 100 },
              ].map(stat => {
                const barColor = stat.pct >= 70 ? '#10b981' : stat.pct >= 40 ? '#f59e0b' : '#ef4444';
                return (
                  <div key={stat.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/50">{stat.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{stat.value}</span>
                        <span className="text-[10px] text-white/25">{stat.sub}</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, stat.pct)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{ background: barColor, boxShadow: `0 0 6px ${barColor}40` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FAVOURITE SPORTS */}
          {user.favouriteSports.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {user.favouriteSports.map((sport: string) => {
                const cfg = SPORT_CONFIG[sport as keyof typeof SPORT_CONFIG];
                return (
                  <span key={sport} className="text-[10px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1" style={{ background: cfg.bg, border: `1px solid ${cfg.color}30`, color: cfg.color }}>
                    {cfg?.emoji || '🎯'} {cfg?.label || sport}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===== BADGES TAB ===== */}
      {tab === 'Badges' && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider">
              <Iconic name="award" size={14} className="inline mr-1" /> All Badges
            </p>
            <span className="text-[10px] text-white/30">{user.badges.length} / {badgeList.length} earned</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {badgeList.map(([id, cfg]) => {
              const earned = user.badges.includes(id as any);
              const rarityCfg = RARITY_CONFIG[cfg.rarity] || RARITY_CONFIG.common;
              return (
                <motion.button
                  key={id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setBadgeInfo({ id, cfg, earned })}
                  className="rounded-2xl p-4 text-center relative overflow-hidden w-full text-left"
                  style={{
                    background: earned
                      ? `linear-gradient(135deg, ${rarityCfg.color}18, ${rarityCfg.color}08)`
                      : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${earned ? rarityCfg.color + '50' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  {/* Rarity tag (earned) or lock badge (locked) */}
                  {earned ? (
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: rarityCfg.color + '20', color: rarityCfg.color }}>
                        {rarityCfg.label}
                      </span>
                    </div>
                  ) : (
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
                        🔒 Locked
                      </span>
                    </div>
                  )}
                  {/* Emoji */}
                  <div className="text-3xl mb-2" style={{ filter: earned ? 'none' : 'grayscale(0.8) opacity(0.5)' }}>
                    {cfg.emoji}
                  </div>
                  <p className="font-bold text-xs text-white">{cfg.label}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">{cfg.description}</p>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* BADGE INFO POPUP */}
      <AnimatePresence>
        {badgeInfo && (
          <BadgeInfoPopup
            badgeId={badgeInfo.id}
            cfg={badgeInfo.cfg}
            earned={badgeInfo.earned}
            user={user}
            allEvents={Array.from(useAppStore.getState().events)}
            onClose={() => setBadgeInfo(null)}
          />
        )}
      </AnimatePresence>

      {/* INVITE TO GROUP POPUP */}
      <AnimatePresence>
        {showInvitePopup && (
          <InviteToGroupPopup
            myGroups={myGroups}
            onClose={() => setShowInvitePopup(false)}
          />
        )}
      </AnimatePresence>

      {/* ===== FRIENDS TAB ===== */}
      {tab === 'Friends' && (
        <div className="mt-3 space-y-4">
          {/* Friends sub-tabs */}
          <div className="flex gap-1 glass rounded-2xl p-1">
            {[
              { key: 'list', label: 'Friends', count: friends.length },
              { key: 'find', label: 'Find' },
              { key: 'invite', label: 'Invite' },
            ].map(t => (
              <button key={t.key} onClick={() => setFriendsSubTab(t.key)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-1"
                style={{
                  background: friendsSubTab === t.key ? 'rgba(var(--green-rgb),0.15)' : 'transparent',
                  color: friendsSubTab === t.key ? 'var(--green)' : 'rgba(255,255,255,0.5)',
                }}>
                {t.label}
                {t.count !== undefined && (
                  <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>({t.count})</span>
                )}
              </button>
            ))}
          </div>

          {/* FRIENDS LIST */}
          {friendsSubTab === 'list' && (
            <div className="space-y-3">
              {/* Pending incoming requests */}
              {pendingIncoming.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Iconic name="users" size={14} /> Pending Requests ({pendingIncoming.length})
                  </p>
                  {pendingIncoming.map(f => {
                    const friendUser = allUsers.find(u => u.id === f.userId);
                    if (!friendUser) return null;
                    return (
                      <div key={f.id} className="flex items-center gap-3 glass rounded-2xl p-3 mb-2">
                        <Avatar src={friendUser.avatar} name={friendUser.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm">{friendUser.name}</p>
                          <p className="text-white/30 text-xs">@{friendUser.username}</p>
                        </div>
                        <button onClick={() => acceptFriendRequest(f.id)}
                          className="text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95"
                          style={{ background: 'var(--green)', color: '#080808' }}>
                          Accept
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Outgoing pending */}
              {pendingOutgoing.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Iconic name="users" size={14} /> Sent Requests ({pendingOutgoing.length})
                  </p>
                  {pendingOutgoing.map(f => {
                    const friendUser = allUsers.find(u => u.id === f.friendId);
                    if (!friendUser) return null;
                    return (
                      <div key={f.id} className="flex items-center gap-3 glass rounded-2xl p-3 mb-2 opacity-60">
                        <Avatar src={friendUser.avatar} name={friendUser.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm">{friendUser.name}</p>
                          <p className="text-white/30 text-xs">Request sent</p>
                        </div>
                        <button onClick={() => setConfirmCancel(f.id)}
                          className="text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95"
                          style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                          Cancel
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Friends list */}
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Iconic name="users" size={14} /> All Friends
              </p>
              {friends.length === 0 ? (
                <div className="text-center py-6 glass rounded-2xl">
                  <p className="text-white/40 text-xs mb-3">No friends yet</p>
                  <button onClick={() => setFriendsSubTab('find')}
                    className="text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95"
                    style={{ background: 'var(--green)', color: '#080808' }}>
                    Find Friends
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {friends.map(friend => {
                    const fs = friendships.find(f =>
                      (f.userId === currentUserId && f.friendId === friend.id) ||
                      (f.friendId === currentUserId && f.userId === friend.id)
                    );
                    return (
                      <div key={friend.id} className="flex items-center gap-3 glass rounded-2xl p-3">
                        <Avatar src={friend.avatar} name={friend.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm">{friend.name}</p>
                          <p className="text-white/30 text-xs">@{friend.username} · {friend.stats.totalMatches} matches</p>
                        </div>
                        <button onClick={() => fs && setConfirmRemove(fs.id)}
                          className="text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95"
                          style={{ background: 'rgba(239,68,68,0.1)', color: 'rgba(239,68,68,0.6)' }}>
                          Unfriend
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* FIND FRIENDS */}
          {friendsSubTab === 'find' && (
            <div className="space-y-4">
              <div>
                <label className="text-white/50 text-xs font-semibold mb-1.5 block">Search by name, username, or profile code</label>
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="e.g. John or ABC001"
                  className="w-full glass rounded-2xl px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-[var(--green)]/50" />
              </div>
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map(u => {
                    const alreadyFriend = friendships.some(f => (f.userId === currentUserId && f.friendId === u.id || f.userId === u.id && f.friendId === currentUserId) && f.status === 'accepted');
                    const pendingExists = friendships.some(f => (f.userId === currentUserId && f.friendId === u.id) && f.status === 'pending');
                    const receivedReq = friendships.some(f => (f.friendId === currentUserId && f.userId === u.id) && f.status === 'pending');
                    return (
                      <div key={u.id} className="flex items-center gap-3 glass rounded-2xl p-3">
                        <Avatar src={u.avatar} name={u.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm">{u.name}</p>
                          <p className="text-white/30 text-xs">
                            @{u.username}
                            {u.profileCode && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>{u.profileCode}</span>}
                          </p>
                        </div>
                        {alreadyFriend ? (
                          <span className="text-[10px] text-green-400 font-semibold">Friends</span>
                        ) : pendingExists ? (
                          <span className="text-[10px] text-yellow-400 font-semibold">Pending</span>
                        ) : receivedReq ? (
                          <button onClick={() => {
                            const fs = friendships.find(f => f.friendId === currentUserId && f.userId === u.id);
                            if (fs) acceptFriendRequest(fs.id);
                          }}
                            className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95"
                            style={{ background: 'var(--green)', color: '#080808' }}>
                            Accept
                          </button>
                        ) : (
                          <button onClick={() => sendFriendRequest(u.id)}
                            className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95"
                            style={{ background: 'rgba(var(--green-rgb),0.1)', color: 'var(--green)', border: '1px solid rgba(var(--green-rgb),0.25)' }}>
                            + Add
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {searchQuery.trim() && searchResults.length === 0 && (
                <div className="text-center py-6 glass rounded-2xl">
                  <p className="text-white/30 text-xs">No users found</p>
                </div>
              )}
            </div>
          )}

          {/* INVITE TO GROUP */}
          {friendsSubTab === 'invite' && (
            <div className="text-center py-8 space-y-4">
              <p className="text-4xl">📨</p>
              <p className="text-white/50 text-sm">Send a group invite to a friend</p>
              <p className="text-white/30 text-xs">Enter their profile code to invite them to a group</p>
              <button onClick={() => setShowInvitePopup(true)}
                className="px-6 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
                style={{ background: 'var(--green)', color: '#080808' }}>
                Open Invite
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirm Cancel Friend Request */}
      <ConfirmModal
        open={!!confirmCancel}
        title="Cancel Request"
        message="Are you sure you want to cancel this friend request?"
        confirmLabel="Cancel Request"
        variant="danger"
        onConfirm={() => { if (confirmCancel) cancelFriendRequest(confirmCancel); setConfirmCancel(null); }}
        onCancel={() => setConfirmCancel(null)}
      />

      {/* Confirm Remove Friend */}
      <ConfirmModal
        open={!!confirmRemove}
        title="Remove Friend"
        message="Are you sure you want to remove this friend?"
        confirmLabel="Remove"
        variant="danger"
        onConfirm={() => { if (confirmRemove) removeFriend(confirmRemove); setConfirmRemove(null); }}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  );
};

// =============================================
// BADGE CRITERIA & PROGRESS
// =============================================
const BADGE_CRITERIA: Record<string, string> = {
  first_match: 'Play your first match',
  first_win: 'Win your first match',
  weekend_warrior: 'Attend matches on 5 different weekends',
  five_wins: 'Win 5 matches total',
  ten_wins: 'Win 10 matches total',
  twentyfive_wins: 'Win 25 matches total',
  hundred_wins: 'Win 100 matches total',
  full_attendance: 'Maintain 100% attendance for 3+ events',
  captain: 'Organize 10 events as a creator',
  iron_player: 'Maintain 100% attendance for 8+ events',
  mvp: 'Be awarded MVP in 1+ events',
  longest_streak: 'Win 7 matches in a row',
};

function getBadgeProgress(badgeId: string, user: any, allEvents: any[]): { current: number; target: number } {
  const s = user.stats;
  const organizedCount = allEvents.filter((e: any) => e.organizer === user.id).length;
  switch (badgeId) {
    case 'first_match': return { current: s.totalMatches, target: 1 };
    case 'first_win': return { current: s.wins, target: 1 };
    case 'weekend_warrior': return { current: Math.min(s.totalMatches, 5), target: 5 };
    case 'five_wins': return { current: Math.min(s.wins, 5), target: 5 };
    case 'ten_wins': return { current: Math.min(s.wins, 10), target: 10 };
    case 'twentyfive_wins': return { current: Math.min(s.wins, 25), target: 25 };
    case 'hundred_wins': return { current: Math.min(s.wins, 100), target: 100 };
    case 'full_attendance': return { current: s.attendanceRate === 100 ? s.totalMatches : 0, target: 3 };
    case 'captain': return { current: Math.min(organizedCount, 10), target: 10 };
    case 'iron_player': return { current: s.attendanceRate === 100 ? s.totalMatches : 0, target: 8 };
    case 'mvp': return { current: Math.min(s.mvpCount, 1), target: 1 };
    case 'longest_streak': return { current: Math.min(s.longestStreak, 7), target: 7 };
    default: return { current: 0, target: 1 };
  }
}

// =============================================
// BADGE INFO POPUP
// =============================================
const BadgeInfoPopup: React.FC<{
  badgeId: string;
  cfg: any;
  earned: boolean;
  user: any;
  allEvents: any[];
  onClose: () => void;
}> = ({ badgeId, cfg, earned, user, allEvents, onClose }) => {
  const rarityCfg = RARITY_CONFIG[cfg.rarity] || RARITY_CONFIG.common;
  const progress = getBadgeProgress(badgeId, user, allEvents);
  const progressPct = Math.min(100, Math.round((progress.current / progress.target) * 100));
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);
  useScrollLock(true);

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 30 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.9 }}
        className="w-full max-w-sm rounded-3xl p-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${rarityCfg.color}25, #1a1a1a)`,
          border: `1px solid ${rarityCfg.color}40`,
          boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 40px ${rarityCfg.color}15, inset 0 1px 0 ${rarityCfg.color}25`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.12)' }} />

        {/* Close button */}
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {/* Badge emoji with spring bounce */}
        <motion.div
          className="text-5xl text-center mb-3"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 14, stiffness: 220, delay: 0.1 }}
        >
          {cfg.emoji}
        </motion.div>

        {/* Owned/Locked badge */}
        <motion.div
          className="text-center mb-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {earned ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: rarityCfg.color + '20', color: rarityCfg.color, border: `1px solid ${rarityCfg.color}40` }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              You own this badge
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span>🔒</span> Locked
            </span>
          )}
        </motion.div>

        {/* Title & rarity */}
        <motion.h3
          className="font-display font-bold text-lg text-white text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >{cfg.label}</motion.h3>
        <motion.p
          className="text-center text-xs mt-1 font-semibold"
          style={{ color: rarityCfg.color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >{rarityCfg.label}</motion.p>

        {/* Description */}
        <motion.p
          className="text-center text-sm text-white/50 mt-3 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >{cfg.description}</motion.p>

        {/* Criteria + Progress card */}
        <motion.div
          className="mt-4 rounded-2xl p-4 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${rarityCfg.color}08, rgba(255,255,255,0.03))`,
            border: `1px solid ${rarityCfg.color}15`,
            backdropFilter: 'blur(12px)',
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">How to unlock</p>
          <p className="text-xs text-white/70 leading-relaxed">{BADGE_CRITERIA[badgeId] || cfg.description}</p>

          {/* Progress bar */}
          {!earned && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-white/30 font-medium">Progress</span>
                <span className="text-[10px] font-bold" style={{ color: rarityCfg.color }}>
                  {progress.current} / {progress.target}
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                  style={{ background: rarityCfg.color, boxShadow: `0 0 10px ${rarityCfg.color}60` }}
                />
              </div>
            </div>
          )}

          {/* Owned confirmation */}
          {earned && (
            <motion.div
              className="mt-2 pt-2.5 flex items-center gap-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(var(--green-rgb),0.15)' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-[10px] text-white/40">Unlocked on {new Date().toLocaleDateString()}</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
};

// =============================================
// INVITE TO GROUP POPUP
// =============================================
const InviteToGroupPopup: React.FC<{ myGroups: any[]; onClose: () => void }> = ({ myGroups, onClose }) => {
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const inviteByProfileCode = useAppStore(s => s.inviteByProfileCode);

  const handleInvite = () => {
    if (!selectedGroupId) { toast.error('Select a group'); return; }
    if (!inviteCodeInput.trim()) { toast.error('Enter a profile code'); return; }
    inviteByProfileCode(selectedGroupId, inviteCodeInput.trim()).then(() => {
      setInviteCodeInput(''); onClose();
    });
  };

  useScrollLock(true);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.15 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-sm flex flex-col"
        style={{
          background: '#0f0a1e',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '1.5rem',
          padding: '1.5rem',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-white text-lg">Invite to Group</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all" style={{ background: 'rgba(255,255,255,0.05)' }}>✘</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-white/50 text-xs font-semibold mb-1.5 block">Select Group</label>
            <select value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)}
              className="w-full glass rounded-2xl px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-[var(--green)]/50"
            >
              <option value="">Choose a group...</option>
              {myGroups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-white/50 text-xs font-semibold mb-1.5 block">Friend's Profile Code</label>
            <input value={inviteCodeInput} onChange={e => setInviteCodeInput(e.target.value)}
              placeholder="ABC123" className="w-full glass rounded-2xl px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-[var(--green)]/50"
              onKeyDown={e => e.key === 'Enter' && handleInvite()}
            />
          </div>

          <motion.button onClick={handleInvite} whileTap={{ scale: 0.97 }}
            className="btn-lime w-full py-3 font-black text-sm"
          >
            Send Invite →
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
