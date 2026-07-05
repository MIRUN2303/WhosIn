import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts';
import { USERS, SPORT_CONFIG, BADGE_CONFIG, GROUPS, computeMemberGroupStats, getOverallWinRate, CURRENT_USER_ID } from '../../data/mockData';
import { Card, Avatar, Button, StatCard, ProgressBar } from '../../components/ui';
import { FadeUp, AnimatedNumber } from '../../components/motion';
import { clsx } from 'clsx';

const TABS = ['Stats', 'Badges', 'History', 'Sports', 'Groups'];

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('Stats');
  const user = USERS.find(u => u.id === CURRENT_USER_ID)!;
  const { stats } = user;

  const createdGroups = GROUPS.filter(g => user.createdGroups.includes(g.id));
  const joinedGroups = GROUPS.filter(g => user.joinedGroups.includes(g.id));
  const overall = getOverallWinRate(user.id);

  const sportBreakdownData = stats.sportBreakdown.map(s => ({
    ...s,
    label: SPORT_CONFIG[s.sport]?.label || s.sport,
    emoji: SPORT_CONFIG[s.sport]?.emoji || '🎯',
    color: SPORT_CONFIG[s.sport]?.color || '#7c3aed',
    winRate: s.matches > 0 ? Math.round((s.wins / s.matches) * 100) : 0,
  }));

  const radarData = [
    { subject: 'Wins', A: Math.round((stats.wins / 100) * 100) },
    { subject: 'Attend', A: stats.attendanceRate },
    { subject: 'Streak', A: Math.min(stats.currentStreak * 10, 100) },
    { subject: 'Matches', A: Math.round((stats.totalMatches / 120) * 100) },
    { subject: 'WinRate', A: stats.winRate },
    { subject: 'MVP', A: Math.min(stats.mvpCount * 10, 100) },
  ];

  const pieData = [
    { name: 'Wins', value: stats.wins, color: '#7c3aed' },
    { name: 'Losses', value: stats.losses, color: '#1e1535' },
  ];

  const xpProgress = (user.xp % 1000) / 1000 * 100;
  const xpToNext = 1000 - (user.xp % 1000);

  return (
    <div className="pb-24 max-w-lg mx-auto">
      {/* Cover + avatar */}
      <div className="relative">
        <div className="h-44 overflow-hidden">
          <img src={user.coverImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a1e] via-transparent to-transparent" />
        </div>
        <div className="absolute bottom-0 left-4 translate-y-1/2 flex items-end gap-3">
          <Avatar src={user.avatar} name={user.name} size="xl" ring />
        </div>
      </div>

      <div className="px-4 pt-12 space-y-5">
        {/* Name & info */}
        <FadeUp>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display font-black text-2xl text-white">{user.name}</h1>
              <p className="text-white/50 text-sm">@{user.username}</p>
              {user.bio && <p className="text-white/70 text-sm mt-1 max-w-xs">{user.bio}</p>}
            </div>
            <Button variant="glass" size="sm">Edit</Button>
          </div>

          <div className="glass rounded-2xl p-3 mt-3">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <span className="font-bold text-white text-sm">Level {user.level}</span>
              </div>
              <span className="text-white/50 text-xs">{xpToNext} XP to next level</span>
            </div>
            <ProgressBar value={xpProgress} max={100} color="#7c3aed" />
            <p className="text-right text-white/40 text-xs mt-1">{user.xp.toLocaleString()} / {Math.ceil(user.xp / 1000) * 1000} XP</p>
          </div>

          <div className="flex gap-2 mt-3 flex-wrap">
            {user.favouriteSports.map(sport => {
              const cfg = SPORT_CONFIG[sport];
              return (
                <span key={sport} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: cfg.bg, border: `1px solid ${cfg.color}40`, color: cfg.color }}>
                  {cfg.emoji} {cfg.label}
                </span>
              );
            })}
          </div>
        </FadeUp>

        {/* Top stats with overall win rate */}
        <FadeUp delay={0.05}>
          <div className="glass rounded-2xl p-3 mb-3">
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">🏆 Overall Performance (All Groups)</p>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <p className="font-display font-black text-xl text-white">{overall.totalMatches}</p>
                <p className="text-white/40 text-[10px]">Matches</p>
              </div>
              <div className="text-center">
                <p className="font-display font-black text-xl text-green-400">{overall.totalWins}</p>
                <p className="text-white/40 text-[10px]">Wins</p>
              </div>
              <div className="text-center">
                <p className="font-display font-black text-xl text-red-400">{overall.totalLosses}</p>
                <p className="text-white/40 text-[10px]">Losses</p>
              </div>
              <div className="text-center">
                <p className="font-display font-black text-xl" style={{ color: overall.overallWinRate >= 60 ? '#10b981' : '#f59e0b' }}>{overall.overallWinRate}%</p>
                <p className="text-white/40 text-[10px]">Win Rate</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <StatCard icon="🏆" label="Total Wins" value={stats.wins} color="#f59e0b" />
            <StatCard icon="⚡" label="Win Rate" value={`${stats.winRate}%`} color="#10b981" />
            <StatCard icon="🔥" label="Streak" value={stats.currentStreak} color="#ec4899" />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <StatCard icon="📅" label="Matches" value={stats.totalMatches} />
            <StatCard icon="📊" label="Attendance" value={`${stats.attendanceRate}%`} color="#8b5cf6" />
            <StatCard icon="🎖️" label="MVP" value={`${stats.mvpCount}×`} color="#f59e0b" />
          </div>
        </FadeUp>

        {/* Tabs */}
        <FadeUp delay={0.1}>
          <div className="flex gap-1 glass rounded-2xl p-1 overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={clsx(
                  'flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200 whitespace-nowrap px-2',
                  tab === t ? 'bg-violet-600 text-white shadow-lg' : 'text-white/50 hover:text-white'
                )}
              >{t}</button>
            ))}
          </div>
        </FadeUp>

        <AnimatePresence mode="wait">
          {tab === 'Stats' && (
            <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <Card padding="md">
                <p className="font-display font-bold text-white text-sm mb-3">Monthly Performance</p>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={stats.monthlyActivity} barGap={2}>
                    <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: '#1e1535', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: 'rgba(255,255,255,0.7)' }} />
                    <Bar dataKey="matches" fill="rgba(124,58,237,0.3)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="wins" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card padding="md">
                <p className="font-display font-bold text-white text-sm mb-2">Performance Profile</p>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                    <Radar dataKey="A" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
              <Card padding="md">
                <div className="flex items-center gap-6">
                  <PieChart width={120} height={120}>
                    <Pie data={pieData} cx={55} cy={55} innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                  <div className="space-y-3">
                    <div>
                      <p className="font-display font-black text-3xl text-white"><AnimatedNumber value={stats.wins} /></p>
                      <p className="text-white/50 text-xs">Total Wins</p>
                    </div>
                    <div>
                      <p className="font-display font-black text-3xl text-white/60"><AnimatedNumber value={stats.losses} /></p>
                      <p className="text-white/50 text-xs">Total Losses</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {tab === 'Badges' && (
            <motion.div key="badges" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-3 gap-3">
              {Object.entries(BADGE_CONFIG).map(([key, badge]) => {
                const unlocked = user.badges.includes(key as any);
                return (
                  <motion.div key={key} whileHover={unlocked ? { scale: 1.05, y: -2 } : {}} className={clsx('rounded-2xl p-4 text-center transition-all', unlocked ? 'glass border border-white/20' : 'bg-white/5 border border-white/10 opacity-40 grayscale')}>
                    <div className="text-3xl mb-2">{badge.emoji}</div>
                    <p className="text-white text-xs font-bold leading-tight">{badge.label}</p>
                    <div className="text-[10px] font-semibold mt-1 rounded-full px-2 py-0.5 inline-block" style={{ color: RARITY_COLORS[badge.rarity as keyof typeof RARITY_COLORS], background: `${RARITY_COLORS[badge.rarity as keyof typeof RARITY_COLORS]}20` }}>{badge.rarity}</div>
                    {!unlocked && <p className="text-white/30 text-[10px] mt-1">Locked</p>}
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {tab === 'Sports' && (
            <motion.div key="sports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
              {sportBreakdownData.map(s => (
                <Card key={s.sport} padding="md">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{s.emoji}</span>
                    <div className="flex-1"><p className="font-bold text-white text-sm">{s.label}</p><p className="text-white/50 text-xs">{s.matches} matches · {s.wins} wins</p></div>
                    <span className="font-display font-bold text-sm" style={{ color: s.color }}>{s.winRate}%</span>
                  </div>
                  <ProgressBar value={s.winRate} max={100} color={s.color} />
                </Card>
              ))}
            </motion.div>
          )}

          {tab === 'History' && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
              {[
                { result: 'win', opp: 'Arjun Sharma', sport: '🏸', score: '21-15', date: '7 days ago' },
                { result: 'loss', opp: 'Karthik Rajan', sport: '🏸', score: '18-21', date: '7 days ago' },
                { result: 'win', opp: 'Team Beta', sport: '🏸', score: '22-20', date: '7 days ago' },
                { result: 'win', opp: 'Rahul Dev', sport: '🏏', score: '156-142', date: '14 days ago' },
                { result: 'loss', opp: 'Priya Nair', sport: '🚴', score: 'DNF', date: '21 days ago' },
              ].map((match, i) => (
                <div key={i} className="glass rounded-2xl p-3 flex items-center gap-3">
                  <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', match.result === 'win' ? 'bg-green-400' : 'bg-red-400')} />
                  <span className="text-lg">{match.sport}</span>
                  <div className="flex-1"><p className="text-white/80 text-sm font-medium">vs {match.opp}</p><p className="text-white/40 text-xs">{match.date}</p></div>
                  <div className="text-right">
                    <p className={clsx('font-bold text-sm', match.result === 'win' ? 'text-green-400' : 'text-red-400')}>{match.result === 'win' ? 'W' : 'L'}</p>
                    <p className="text-white/40 text-xs">{match.score}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {tab === 'Groups' && (
            <motion.div key="groups" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {/* Created groups */}
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">👑 Created ({createdGroups.length}/3)</p>
                {createdGroups.length > 0 ? (
                  <div className="space-y-2">
                    {createdGroups.map(group => {
                      const stats = computeMemberGroupStats(user.id, group.id);
                      return (
                        <Card key={group.id} interactive padding="md" onClick={() => navigate(`/groups/${group.id}`)}>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{group.logo}</span>
                            <div className="flex-1"><p className="font-bold text-white text-sm">{group.name}</p><p className="text-white/40 text-xs">{group.memberCount} members</p></div>
                            <div className="text-right">
                              <p className="font-bold text-sm" style={{ color: stats.winRate >= 60 ? '#10b981' : '#f59e0b' }}>{stats.winRate}%</p>
                              <p className="text-white/40 text-xs">{stats.wins}W · {stats.losses}L</p>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="glass rounded-2xl p-4 text-center"><p className="text-white/40 text-xs">No groups created yet</p></div>
                )}
              </div>

              {/* Joined groups */}
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">⚡ Joined ({joinedGroups.length}/3)</p>
                {joinedGroups.length > 0 ? (
                  <div className="space-y-2">
                    {joinedGroups.map(group => {
                      const stats = computeMemberGroupStats(user.id, group.id);
                      return (
                        <Card key={group.id} interactive padding="md" onClick={() => navigate(`/groups/${group.id}`)}>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{group.logo}</span>
                            <div className="flex-1"><p className="font-bold text-white text-sm">{group.name}</p><p className="text-white/40 text-xs">{group.memberCount} members</p></div>
                            <div className="text-right">
                              <p className="font-bold text-sm" style={{ color: stats.winRate >= 60 ? '#10b981' : '#f59e0b' }}>{stats.winRate}%</p>
                              <p className="text-white/40 text-xs">{stats.wins}W · {stats.losses}L</p>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="glass rounded-2xl p-4 text-center"><p className="text-white/40 text-xs">No groups joined yet</p></div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const RARITY_COLORS: Record<string, string> = { common: '#6b7280', uncommon: '#10b981', rare: '#3b82f6', legendary: '#f59e0b' };
