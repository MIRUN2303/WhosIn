import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { SPORT_CONFIG } from '../../data/sportConfig';
import { Avatar, Button } from '../../components/ui';
import { Iconic } from '../../components/ui/icons';
import { FadeUp } from '../../components/motion';
import { useAppStore } from '../../store/useAppStore';

const RADAR_METRICS = [
  { key: 'winRate', label: 'Win Rate', color: '#10b981' },
  { key: 'attendanceRate', label: 'Attendance', color: '#7c3aed' },
  { key: 'currentStreak', label: 'Streak', color: '#f59e0b' },
  { key: 'mvpCount', label: 'MVP', color: '#ef4444' },
  { key: 'pointsTotal', label: 'Points', color: '#3b82f6' },
  { key: 'totalMatches', label: 'Matches', color: '#ec4899' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SPORT_COLORS = ['#10b981', '#7c3aed', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f97316'];

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const currentUserId = useAppStore(s => s.currentUserId);
  const users = useAppStore(s => s.users);
  const isLoggedIn = useAppStore(s => s.isLoggedIn);
  const logout = useAppStore(s => s.logout);
  const user = users.find(u => u.id === currentUserId);

  const hexMax = 100;

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

  const weeklyData = DAYS.map((day, i) => ({ day, value: user.stats.weeklyActivity[i] || 0 }));
  const monthlyData = user.stats.monthlyActivity?.length ? user.stats.monthlyActivity : [];
  const sportData = user.stats.sportBreakdown?.length ? user.stats.sportBreakdown : [];
  const totalSportMatches = sportData.reduce((s, d) => s + d.matches, 0) || 1;

  return (
    <div className="pb-24 max-w-lg mx-auto px-4">
      <FadeUp>
        <div className="flex items-center gap-4 pt-6">
          <Avatar src={user.avatar} name={user.name} size="xl" ring />
          <div className="flex-1">
            <h1 className="font-display font-black text-2xl text-white">{user.name}</h1>
            <p className="text-white/50 text-sm">@{user.username}</p>
          </div>
          <Button variant="glass" size="sm" onClick={() => { logout(); navigate('/login'); }}>Logout</Button>
        </div>

        <div className="glass rounded-2xl p-3 mt-4 space-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-white/60 text-xs">
            <span className="flex items-center gap-1"><Iconic name="shield" size={12} className="text-green-400" /> {user.email}</span>
            <span className="text-white/20 hidden sm:inline">|</span>
            <span className="flex items-center gap-1"><Iconic name="shield" size={12} className="text-green-400" /> {user.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-white/60 text-xs">
            Profile Code: <span className="font-mono font-bold text-violet-300">{user.profileCode}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-0.5"><Iconic name="check_circle" size={10} /> Confirmed</span>
          </div>
        </div>

        <div className="glass rounded-2xl p-3 mt-3 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Iconic name="lightning" size={20} />
              <span className="font-bold text-white text-sm">Level {user.level}</span>
            </div>
            <span className="text-white/40 text-xs">{user.xp} XP</span>
          </div>
          <div className="relative w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ((user.xp || 0) % Math.max(1, user.level * 100)) / (user.level * 100) * 100)}%`, background: 'var(--green)', boxShadow: '0 0 8px rgba(var(--green-rgb),0.4)' }} />
          </div>
          <div className="flex justify-between text-[10px] text-white/30">
            <span>Level {user.level}</span>
            <span>{(user.xp || 0) % (user.level * 100) || 0} / {user.level * 100} XP</span>
            <span>Level {user.level + 1}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-3">
          {[
            { label: 'Matches', value: user.stats.totalMatches, color: '#7c3aed' },
            { label: 'Wins', value: user.stats.wins, color: '#10b981' },
            { label: 'Losses', value: user.stats.losses, color: '#ef4444' },
            { label: 'Win Rate', value: `${user.stats.winRate}%`, color: user.stats.winRate >= 60 ? '#10b981' : user.stats.winRate >= 40 ? '#f59e0b' : '#ef4444' },
          ].map(stat => (
            <div key={stat.label} className="glass rounded-2xl p-2.5 text-center">
              <p className="font-bold text-base" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-white/40 text-[10px]">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-3 mt-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Attendance Rate', value: `${user.stats.attendanceRate}%` },
              { label: 'Current Streak', value: `${user.stats.currentStreak}` },
              { label: 'Longest Streak', value: `${user.stats.longestStreak}` },
              { label: 'MVP Count', value: `${user.stats.mvpCount}` },
              { label: 'Total Points', value: `${user.stats.pointsTotal}` },
              { label: 'Badges', value: `${user.badges?.length || 0}/${['first_match','first_win','weekend_warrior','five_wins','ten_wins','twentyfive_wins','hundred_wins','full_attendance','captain','iron_player','mvp','longest_streak'].length}` },
            ].map(stat => (
              <div key={stat.label} className="flex items-center justify-between rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="text-white/40 text-xs">{stat.label}</span>
                <span className="font-bold text-white text-sm">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {weeklyData.some(d => d.value > 0) && (
          <div className="glass rounded-2xl p-3 mt-3">
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Iconic name="activity" size={14} /> Weekly Activity</p>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 0, right: 0, bottom: 0, left: -16 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12, color: '#fff' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="var(--green)">
                    {weeklyData.map((_, i) => (
                      <Cell key={i} fill={i === new Date().getDay() - 1 ? 'var(--green)' : 'rgba(var(--green-rgb),0.25)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {monthlyData.length > 0 && (
          <div className="glass rounded-2xl p-3 mt-3">
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Iconic name="calendar" size={14} /> Monthly Activity</p>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 0, right: 0, bottom: 0, left: -16 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12, color: '#fff' }} />
                  <Line type="monotone" dataKey="matches" stroke="var(--green)" strokeWidth={2} dot={{ fill: 'var(--green)', r: 3 }} />
                  <Line type="monotone" dataKey="wins" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {sportData.length > 0 && (
          <div className="glass rounded-2xl p-3 mt-3">
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Iconic name="target" size={14} /> Sport Breakdown</p>
            <div className="flex items-center gap-4">
              <div className="w-28 h-28 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sportData} dataKey="matches" nameKey="sport" cx="50%" cy="50%" innerRadius={24} outerRadius={42} paddingAngle={2}>
                      {sportData.map((_, i) => (
                        <Cell key={i} fill={SPORT_COLORS[i % SPORT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12, color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5">
                {sportData.map((s, i) => {
                  const cfg = SPORT_CONFIG[s.sport as keyof typeof SPORT_CONFIG];
                  const pct = Math.round((s.matches / totalSportMatches) * 100);
                  return (
                    <div key={s.sport} className="flex items-center gap-2">
                      <span className="text-xs">{cfg?.emoji || '🎯'}</span>
                      <span className="text-xs text-white/60 flex-1">{cfg?.label || s.sport}</span>
                      <div className="w-16 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: SPORT_COLORS[i % SPORT_COLORS.length] }} />
                      </div>
                      <span className="text-xs text-white/40 w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="glass rounded-2xl p-3 mt-3">
          <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Iconic name="activity" size={14} /> Hexagonal Stats</p>
          <div className="flex flex-wrap justify-center gap-2">
            {RADAR_METRICS.map(m => {
              const raw = user.stats[m.key as keyof typeof user.stats] as number;
              const pct = m.key === 'winRate' || m.key === 'attendanceRate' ? raw : Math.min(100, raw * 10);
              const size = Math.max(40, pct);
              return (
                <div key={m.key} className="flex flex-col items-center gap-1" style={{ width: 72 }}>
                  <div className="relative" style={{ width: 56, height: 56 }}>
                    <svg viewBox="0 0 60 60" className="absolute inset-0">
                      <polygon points="30,3 55.7,17.5 55.7,46.5 30,57 4.3,46.5 4.3,17.5" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                      <polygon points="30,3 55.7,17.5 55.7,46.5 30,57 4.3,46.5 4.3,17.5" fill="none" stroke={m.color} strokeWidth="2" strokeDasharray={`${pct} ${100 - pct}`} style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold" style={{ color: m.color }}>{Math.round(pct)}%</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-white/40">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 mt-3 flex-wrap">
          {user.favouriteSports.map((sport: string) => {
            const cfg = SPORT_CONFIG[sport as keyof typeof SPORT_CONFIG];
            return (
              <span key={sport} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: cfg.bg, border: `1px solid ${cfg.color}40`, color: cfg.color }}>
                <Iconic name={cfg.emoji} /> {cfg.label}
              </span>
            );
          })}
        </div>
      </FadeUp>
    </div>
  );
};
