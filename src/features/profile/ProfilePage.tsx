import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { SPORT_CONFIG } from '../../data/sportConfig';
import { Avatar, Button } from '../../components/ui';
import { Iconic } from '../../components/ui/icons';
import { FadeUp } from '../../components/motion';
import { useAppStore } from '../../store/useAppStore';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SPORT_COLORS = ['#10b981', '#7c3aed', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f97316'];

const THEME_TOOLTIP = {
  contentStyle: { background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 11, color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' },
  labelStyle: { color: 'rgba(255,255,255,0.5)', fontWeight: 600 },
  itemStyle: { color: '#fff' },
};

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const currentUserId = useAppStore(s => s.currentUserId);
  const users = useAppStore(s => s.users);
  const isLoggedIn = useAppStore(s => s.isLoggedIn);
  const logout = useAppStore(s => s.logout);
  const user = users.find(u => u.id === currentUserId);

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

  const weeklyData = DAYS.map((day: string, i: number) => ({ day, value: user.stats.weeklyActivity[i] || 0 }));
  const monthlyData: { month: string; matches: number; wins: number }[] = user.stats.monthlyActivity?.length ? user.stats.monthlyActivity : [];
  const sportData: { sport: string; matches: number; wins: number }[] = user.stats.sportBreakdown?.length ? user.stats.sportBreakdown : [];
  const totalSportMatches = sportData.reduce((s: number, d: { matches: number }) => s + d.matches, 0) || 1;
  const maxWeekly = Math.max(1, ...weeklyData.map(d => d.value));

  const performanceScore = useMemo(() => {
    const weights = { winRate: 0.3, attendanceRate: 0.2, streak: 0.15, mvp: 0.15, points: 0.1, matches: 0.1 };
    const w = user.stats.winRate;
    const a = user.stats.attendanceRate;
    const s = Math.min(100, (user.stats.currentStreak / 20) * 100);
    const m = Math.min(100, (user.stats.mvpCount / 10) * 100);
    const p = Math.min(100, (user.stats.pointsTotal / Math.max(1, user.level * 50)) * 100);
    const t = Math.min(100, (user.stats.totalMatches / 50) * 100);
    const score = w * weights.winRate + a * weights.attendanceRate + s * weights.streak + m * weights.mvp + p * weights.points + t * weights.matches;
    return Math.round(score);
  }, [user.stats, user.level]);

  const performanceColor = performanceScore >= 80 ? '#10b981' : performanceScore >= 55 ? '#f59e0b' : performanceScore >= 30 ? '#f97316' : '#ef4444';
  const perfRingDash = `${(performanceScore / 100) * 283} 283`;

  const todayIndex = new Date().getDay();
  const adjustedToday = todayIndex === 0 ? 6 : todayIndex - 1;

  return (
    <div className="pb-28 max-w-lg mx-auto px-4">
      <FadeUp>
        {/* HEADER */}
        <div className="flex items-center gap-4 pt-6">
          <Avatar src={user.avatar} name={user.name} size="xl" ring />
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-black text-xl text-white truncate">{user.name}</h1>
            <p className="text-white/40 text-xs">@{user.username}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(var(--green-rgb),0.12)', color: 'var(--green)' }}>
                <Iconic name="lightning" size={10} className="inline mr-0.5" /> Lv.{user.level}
              </span>
              <span className="text-[10px] text-white/30">{user.xp} XP</span>
            </div>
          </div>
          <Button variant="glass" size="sm" onClick={() => { logout(); navigate('/login'); }}>Logout</Button>
        </div>

        {/* PERFORMANCE OVERVIEW */}
        <div className="glass rounded-3xl p-4 mt-4">
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
        <div className="glass rounded-2xl p-3 mt-3">
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
          <div className="glass rounded-2xl p-4 mt-3">
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
          <div className="glass rounded-2xl p-4 mt-3">
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
          <div className="glass rounded-2xl p-4 mt-3">
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
          <div className="glass rounded-2xl p-4 mt-3">
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
        <div className="glass rounded-2xl p-4 mt-3">
          <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Iconic name="list" size={14} /> All Stats</p>
          <div className="space-y-2.5">
            {[
              { label: 'Attendance Rate', value: `${user.stats.attendanceRate}%`, sub: `${user.stats.totalMatches} events attended`, pct: user.stats.attendanceRate },
              { label: 'Current Streak', value: `${user.stats.currentStreak}`, sub: `Best: ${user.stats.longestStreak}`, pct: Math.min(100, (user.stats.currentStreak / Math.max(1, user.stats.longestStreak)) * 100) },
              { label: 'MVP Count', value: `${user.stats.mvpCount}`, sub: `${user.stats.wins} total wins`, pct: Math.min(100, (user.stats.mvpCount / Math.max(1, user.stats.wins)) * 100) },
              { label: 'Total Points', value: `${user.stats.pointsTotal}`, sub: `${Math.round(user.stats.pointsTotal / Math.max(1, user.level || 1))} pts/level`, pct: Math.min(100, (user.stats.pointsTotal / Math.max(1, user.level * 50)) * 100) },
              { label: 'Badges Earned', value: `${user.badges?.length || 0}`, sub: `/ ${12} total`, pct: ((user.badges?.length || 0) / 12) * 100 },
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
      </FadeUp>
    </div>
  );
};
