import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GROUPS, SPORT_CONFIG, getUserById, EVENTS } from '../../data/mockData';
import { Card, Avatar, Badge, Button, SectionHeader, ProgressBar } from '../../components/ui';
import { FadeUp, StaggerList, StaggerItem } from '../../components/motion';
import { clsx } from 'clsx';

// =============================================
// GROUP DETAIL
// =============================================
const ROLE_CONFIG = {
  creator: { label: 'Creator', color: '#f59e0b', emoji: '👑' },
  admin: { label: 'Admin', color: '#7c3aed', emoji: '🛡️' },
  member: { label: 'Member', color: '#6b7280', emoji: '⚡' },
};

export const GroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Feed');
  const [memberView, setMemberView] = useState<'cards' | 'table'>('cards');

  const group = GROUPS.find(g => g.id === id);
  if (!group) return <div className="min-h-screen flex items-center justify-center"><p className="text-white/50">Group not found</p></div>;

  const sportCfg = SPORT_CONFIG[group.sport];
  const groupEvents = EVENTS.filter(e => e.groupId === group.id);
  const upcomingEvents = groupEvents.filter(e => e.status === 'upcoming');
  const pastEvents = groupEvents.filter(e => e.status === 'completed' || e.status === 'cancelled');

  const TABS = ['Feed', 'Members', 'Events', 'Gallery'];

  return (
    <div className="pb-24 max-w-lg mx-auto">
      {/* Banner */}
      <div className="relative h-52 overflow-hidden">
        <img src={group.banner} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a1e] via-[#0f0a1e]/40 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 glass w-10 h-10 rounded-2xl flex items-center justify-center text-white"
        >←</button>
      </div>

      <div className="px-4 -mt-10 space-y-4">
        {/* Group header */}
        <FadeUp>
          <div className="flex items-start gap-3">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-2 border-white/20 shadow-lg flex-shrink-0 -mt-2"
              style={{ background: sportCfg.bg }}
            >
              {group.logo}
            </div>
            <div className="flex-1">
              <h1 className="font-display font-black text-xl text-white">{group.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white/50 text-sm">{sportCfg.emoji} {sportCfg.label}</span>
                {group.isPrivate
                  ? <Badge variant="glass" size="sm">🔒 Private</Badge>
                  : <Badge variant="green" size="sm">🌐 Public</Badge>
                }
              </div>
              <p className="text-white/60 text-sm mt-2 leading-relaxed">{group.description}</p>
            </div>
          </div>
        </FadeUp>

        {/* Quick stats */}
        <FadeUp delay={0.05}>
          <div className="grid grid-cols-3 gap-2">
            <div className="glass rounded-2xl p-3 text-center">
              <p className="font-display font-black text-2xl text-white">{group.memberCount}</p>
              <p className="text-white/50 text-xs">Members</p>
            </div>
            <div className="glass rounded-2xl p-3 text-center">
              <p className="font-display font-black text-2xl text-white">{group.totalEvents}</p>
              <p className="text-white/50 text-xs">Events</p>
            </div>
            <div className="glass rounded-2xl p-3 text-center">
              <p className="font-display font-black text-2xl text-violet-300">{group.upcomingEvents}</p>
              <p className="text-white/50 text-xs">Upcoming</p>
            </div>
          </div>
        </FadeUp>

        {/* Tags */}
        <FadeUp delay={0.08}>
          <div className="flex gap-2 flex-wrap">
            {group.tags.map(tag => (
              <Badge key={tag} variant="glass" size="sm">#{tag}</Badge>
            ))}
          </div>
        </FadeUp>

        {/* Tabs */}
        <FadeUp delay={0.1}>
          <div className="flex gap-1 glass rounded-2xl p-1">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={clsx(
                  'flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200',
                  tab === t ? 'bg-violet-600 text-white' : 'text-white/50 hover:text-white'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </FadeUp>

        <AnimatePresence mode="wait">
          {tab === 'Feed' && (
            <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {/* Pinned announcement */}
              {groupEvents[0]?.announcements.filter(a => a.isPinned).map(ann => {
                const author = getUserById(ann.authorId);
                return (
                  <div key={ann.id} className="glass-vibrant rounded-2xl p-4 border border-violet-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-violet-400 text-xs font-bold">📌 PINNED</span>
                    </div>
                    <div className="flex gap-2">
                      <Avatar src={author?.avatar} name={author?.name || '?'} size="sm" />
                      <div>
                        <p className="text-xs text-white/50 mb-1">{author?.name}</p>
                        <p className="text-white/90 text-sm">{ann.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Rules */}
              <Card padding="md">
                <p className="font-bold text-white text-sm mb-3">📋 Group Rules</p>
                <div className="space-y-2">
                  {group.rules.map((rule, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="text-violet-400 font-bold flex-shrink-0">{i + 1}.</span>
                      <p className="text-white/70">{rule}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Next event preview */}
              {groupEvents.filter(e => e.status === 'upcoming')[0] && (
                <Card
                  padding="md"
                  interactive
                  onClick={() => navigate(`/events/${groupEvents[0].id}`)}
                >
                  <p className="text-xs font-semibold text-white/50 mb-2">⚡ NEXT EVENT</p>
                  <p className="font-display font-bold text-white">{groupEvents[0].title}</p>
                  <p className="text-white/50 text-sm">{groupEvents[0].date} · {groupEvents[0].time}</p>
                </Card>
              )}
            </motion.div>
          )}

          {tab === 'Members' && (
            <motion.div key="members" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {/* View toggle */}
              <div className="flex gap-1 glass rounded-2xl p-1 mb-3">
                <button
                  onClick={() => setMemberView('cards')}
                  className={clsx(
                    'flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200',
                    memberView === 'cards' ? 'bg-violet-600 text-white' : 'text-white/50 hover:text-white'
                  )}
                >Cards</button>
                <button
                  onClick={() => setMemberView('table')}
                  className={clsx(
                    'flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200',
                    memberView === 'table' ? 'bg-violet-600 text-white' : 'text-white/50 hover:text-white'
                  )}
                >Stats Table</button>
              </div>

              {memberView === 'cards' ? (
                /* Card view */
                group.members.map(member => {
                  const user = getUserById(member.userId);
                  if (!user) return null;
                  const roleCfg = ROLE_CONFIG[member.role];
                  return (
                    <div key={member.userId} className="glass rounded-2xl p-3 flex items-center gap-3">
                      <Avatar src={user.avatar} name={user.name} size="md" />
                      <div className="flex-1">
                        <p className="font-semibold text-white text-sm">{user.name}</p>
                        <p className="text-white/40 text-xs">@{user.username} · Lv.{user.level}</p>
                      </div>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                        style={{ background: `${roleCfg.color}20`, color: roleCfg.color, border: `1px solid ${roleCfg.color}40` }}
                      >
                        {roleCfg.emoji} {roleCfg.label}
                      </span>
                    </div>
                  );
                })
              ) : (
                /* Table view */
                <div className="glass rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-3 text-white/40 font-semibold">#</th>
                          <th className="text-left py-3 px-2 text-white/40 font-semibold">Player</th>
                          <th className="text-center py-3 px-1.5 text-white/40 font-semibold">Role</th>
                          <th className="text-center py-3 px-1.5 text-white/40 font-semibold">Matches</th>
                          <th className="text-center py-3 px-1.5 text-white/40 font-semibold">W</th>
                          <th className="text-center py-3 px-1.5 text-white/40 font-semibold">L</th>
                          <th className="text-center py-3 px-1.5 text-white/40 font-semibold">Win%</th>
                          <th className="text-center py-3 px-1.5 text-white/40 font-semibold">Att%</th>
                          <th className="text-center py-3 px-1.5 text-white/40 font-semibold">Streak</th>
                          <th className="text-right py-3 px-3 text-white/40 font-semibold">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.members.map((member, idx) => {
                          const user = getUserById(member.userId);
                          if (!user) return null;
                          const roleCfg = ROLE_CONFIG[member.role];
                          const s = member.stats;
                          return (
                            <tr key={member.userId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="py-2.5 px-3 text-white/40">{idx + 1}</td>
                              <td className="py-2.5 px-2">
                                <div className="flex items-center gap-2">
                                  <Avatar src={user.avatar} name={user.name} size="xs" />
                                  <span className="text-white font-medium whitespace-nowrap">{user.name.split(' ')[0]}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-1.5 text-center">
                                <span className="text-xs" style={{ color: roleCfg.color }}>{roleCfg.emoji}</span>
                              </td>
                              <td className="py-2.5 px-1.5 text-center text-white font-semibold">{s.matchesPlayed}</td>
                              <td className="py-2.5 px-1.5 text-center text-green-400 font-semibold">{s.wins}</td>
                              <td className="py-2.5 px-1.5 text-center text-red-400 font-semibold">{s.losses}</td>
                              <td className="py-2.5 px-1.5 text-center font-semibold" style={{ color: s.winRate >= 65 ? '#10b981' : s.winRate >= 55 ? '#f59e0b' : '#ef4444' }}>{s.winRate}%</td>
                              <td className="py-2.5 px-1.5 text-center font-semibold" style={{ color: s.attendanceRate >= 90 ? '#10b981' : s.attendanceRate >= 75 ? '#f59e0b' : '#ef4444' }}>{s.attendanceRate}%</td>
                              <td className="py-2.5 px-1.5 text-center">
                                <span className={clsx(
                                  'text-xs font-bold px-1.5 py-0.5 rounded-full',
                                  s.currentStreak >= 5 ? 'text-amber-400 bg-amber-400/10' : 'text-white/60 bg-white/10'
                                )}>
                                  🔥{s.currentStreak}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right text-violet-300 font-bold">{s.points}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {tab === 'Events' && (
            <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Upcoming Events */}
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>⚡ Upcoming</span>
                  <span className="glass rounded-full px-1.5 py-0.5 text-white/50 text-[10px]">{upcomingEvents.length}</span>
                </p>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingEvents.map(event => {
                      const cfg = SPORT_CONFIG[event.sport];
                      const confirmed = event.attendance.filter(a => a.status === 'coming').length;
                      return (
                        <Card key={event.id} interactive padding="md" onClick={() => navigate(`/events/${event.id}`)}>
                          <div className="flex gap-3 items-start">
                            <span className="text-2xl">{cfg.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white text-sm truncate">{event.title}</p>
                              <p className="text-white/50 text-xs">{event.date} · {event.time}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-white/40 text-[10px]">📍 {event.venue}</span>
                                <span className="text-white/30">·</span>
                                <span className="text-white/40 text-[10px]">{confirmed}/{event.maxSlots} going</span>
                              </div>
                            </div>
                            <Badge variant="blue" size="sm">Upcoming</Badge>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="glass rounded-2xl p-6 text-center">
                    <p className="text-2xl mb-1">📅</p>
                    <p className="text-white/40 text-xs">No upcoming events</p>
                  </div>
                )}
              </div>

              {/* Past Events / History */}
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>📜 History</span>
                  <span className="glass rounded-full px-1.5 py-0.5 text-white/50 text-[10px]">{pastEvents.length}</span>
                </p>
                {pastEvents.length > 0 ? (
                  <div className="space-y-2">
                    {pastEvents.map(event => {
                      const cfg = SPORT_CONFIG[event.sport];
                      return (
                        <Card key={event.id} interactive padding="sm" onClick={() => navigate(`/events/${event.id}`)}>
                          <div className="flex gap-3 items-center">
                            <span className="text-xl opacity-50">{cfg.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-white/80 text-sm truncate">{event.title}</p>
                              <p className="text-white/40 text-[10px]">{event.date} · {event.time}</p>
                            </div>
                            <Badge variant="glass" size="sm">
                              {event.status === 'completed' ? '✓ Done' : '✗ Cancelled'}
                            </Badge>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="glass rounded-2xl p-6 text-center">
                    <p className="text-2xl mb-1">🏁</p>
                    <p className="text-white/40 text-xs">No past events yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {tab === 'Gallery' && (
            <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-3 gap-2">
                {groupEvents.flatMap(e => e.gallery).map((img, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.05 }} className="aspect-square rounded-2xl overflow-hidden">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </motion.div>
                ))}
                {groupEvents.flatMap(e => e.gallery).length === 0 && (
                  <div className="col-span-3 py-12 text-center">
                    <p className="text-4xl mb-2">📸</p>
                    <p className="text-white/40 text-sm">No photos yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// =============================================
// GROUPS LIST
// =============================================
export const GroupsPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUserId = 'u1';
  const myGroups = GROUPS.filter(g => g.members.some(m => m.userId === currentUserId));
  const discoverGroups = GROUPS.filter(g => !g.members.some(m => m.userId === currentUserId));

  return (
    <div className="pb-24 max-w-lg mx-auto px-4 pt-4 space-y-6">
      <FadeUp>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-2xl text-white">Groups</h1>
            <p className="text-white/50 text-sm">Your weekend communities</p>
          </div>
          <Button variant="lime" size="sm">+ Create</Button>
        </div>
      </FadeUp>

      {/* Limit info */}
      <FadeUp delay={0.05}>
        <div className="glass rounded-2xl p-3 flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs">Groups you belong to</p>
            <p className="font-bold text-white text-sm">{myGroups.length} / 6</p>
          </div>
          <ProgressBar value={myGroups.length} max={6} color="#7c3aed" className="w-24" />
        </div>
      </FadeUp>

      {/* My groups */}
      <FadeUp delay={0.1}>
        <SectionHeader title="My Groups" className="mb-3" />
        <StaggerList className="space-y-3">
          {myGroups.map(group => {
            const cfg = SPORT_CONFIG[group.sport];
            const myRole = group.members.find(m => m.userId === currentUserId)?.role;
            const roleCfg = myRole ? ROLE_CONFIG[myRole] : null;
            return (
              <StaggerItem key={group.id}>
                <Card interactive padding="none" onClick={() => navigate(`/groups/${group.id}`)}>
                  <div className="relative h-24 overflow-hidden">
                    <img src={group.banner} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0f0a1e]/80 to-transparent" />
                    <div className="absolute inset-0 p-4 flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.color}40` }}
                      >
                        {group.logo}
                      </div>
                      <div>
                        <p className="font-display font-bold text-white">{group.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-white/50 text-xs">{group.memberCount} members</span>
                          {roleCfg && (
                            <span className="text-xs font-semibold" style={{ color: roleCfg.color }}>
                              {roleCfg.emoji} {roleCfg.label}
                            </span>
                          )}
                        </div>
                      </div>
                      {group.upcomingEvents > 0 && (
                        <div className="ml-auto">
                          <Badge variant="blue">{group.upcomingEvents} events</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerList>
      </FadeUp>

      {/* Discover */}
      {discoverGroups.length > 0 && (
        <FadeUp delay={0.2}>
          <SectionHeader title="Discover Groups" subtitle="Explore and join" className="mb-3" />
          <StaggerList className="space-y-3">
            {discoverGroups.map(group => {
              const cfg = SPORT_CONFIG[group.sport];
              return (
                <StaggerItem key={group.id}>
                  <Card padding="md">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: cfg.bg }}
                      >{group.logo}</div>
                      <div className="flex-1">
                        <p className="font-bold text-white">{group.name}</p>
                        <p className="text-white/50 text-xs">{group.memberCount} members · {cfg.label}</p>
                      </div>
                      <Button variant="ghost" size="sm">Join</Button>
                    </div>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerList>
        </FadeUp>
      )}
    </div>
  );
};
