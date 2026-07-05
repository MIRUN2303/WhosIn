import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GROUPS, USERS, SPORT_CONFIG, getUserById, getGroupById, getCompletedGroupEvents, getUpcomingGroupEvents, computeMemberGroupStats, CURRENT_USER_ID, getOverallWinRate } from '../../data/mockData';
import { Card, Avatar, Badge, Button, SectionHeader } from '../../components/ui';
import { FadeUp, StaggerList, StaggerItem } from '../../components/motion';
import { clsx } from 'clsx';

const ROLE_CONFIG = {
  creator: { label: 'Creator', color: '#f59e0b', emoji: '👑' },
  admin: { label: 'Admin', color: '#7c3aed', emoji: '🛡️' },
  member: { label: 'Member', color: '#6b7280', emoji: '⚡' },
};

const MemberDropdown: React.FC<{ userId: string; groupId: string }> = ({ userId, groupId }) => {
  const user = getUserById(userId);
  const [open, setOpen] = useState(false);
  if (!user) return null;

  const computed = computeMemberGroupStats(userId, groupId);
  const overall = getOverallWinRate(userId);
  const group = getGroupById(groupId);
  const member = group?.members.find(m => m.userId === userId);
  const roleCfg = ROLE_CONFIG[member?.role || 'member'] as typeof ROLE_CONFIG[keyof typeof ROLE_CONFIG];

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left"
      >
        <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all">
          <Avatar src={user.avatar} name={user.name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm">{user.name}</p>
            <p className="text-white/40 text-xs">@{user.username}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-sm" style={{ color: computed.winRate >= 60 ? '#10b981' : computed.winRate >= 40 ? '#f59e0b' : '#ef4444' }}>
              {computed.winRate}%
            </p>
            <p className="text-white/40 text-[10px]">{computed.matchesPlayed} matches</p>
          </div>
          <span className={clsx(
            'text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1',
            roleCfg.label === 'Creator' ? 'bg-amber-400/10 text-amber-400' :
            roleCfg.label === 'Admin' ? 'bg-violet-400/10 text-violet-400' :
            'bg-white/10 text-white/50'
          )}>
            {roleCfg.emoji}
          </span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-white/30 text-sm"
          >▼</motion.span>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mx-3 mb-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">📊 Group Stats</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <StatItem label="Matches" value={computed.matchesPlayed} color="#7c3aed" />
                <StatItem label="Wins" value={computed.wins} color="#10b981" />
                <StatItem label="Losses" value={computed.losses} color="#ef4444" />
                <StatItem label="Win Rate" value={`${computed.winRate}%`} color={computed.winRate >= 60 ? '#10b981' : computed.winRate >= 40 ? '#f59e0b' : '#ef4444'} />
              </div>
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">🏆 Overall (All Groups)</p>
              <div className="grid grid-cols-2 gap-2">
                <StatItem label="Total Matches" value={overall.totalMatches} color="#7c3aed" />
                <StatItem label="Total Wins" value={overall.totalWins} color="#10b981" />
                <StatItem label="Total Losses" value={overall.totalLosses} color="#ef4444" />
                <StatItem label="Overall WR" value={`${overall.overallWinRate}%`} color={overall.overallWinRate >= 60 ? '#10b981' : overall.overallWinRate >= 40 ? '#f59e0b' : '#ef4444'} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatItem: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
  <div className="rounded-xl p-2 text-center" style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
    <p className="font-bold text-sm" style={{ color }}>{value}</p>
    <p className="text-white/40 text-[10px]">{label}</p>
  </div>
);

// =============================================
// GROUP DETAIL
// =============================================
export const GroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Members');

  const group = GROUPS.find(g => g.id === id);
  if (!group) return <div className="min-h-screen flex items-center justify-center"><p className="text-white/50">Group not found</p></div>;

  const sportCfg = SPORT_CONFIG[group.sport];
  const upcomingEvents = getUpcomingGroupEvents(group.id);
  const completedEvents = getCompletedGroupEvents(group.id);

  // Members sorted by win rate descending for ranking
  const rankedMembers = [...group.members].sort((a, b) => {
    const aStats = computeMemberGroupStats(a.userId, group.id);
    const bStats = computeMemberGroupStats(b.userId, group.id);
    return bStats.winRate - aStats.winRate;
  });

  const TABS = ['Members', 'Rankings', 'Events', 'Invite'];

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
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-2 border-white/20 shadow-lg flex-shrink-0 -mt-2" style={{ background: sportCfg.bg }}>
              {group.logo}
            </div>
            <div className="flex-1">
              <h1 className="font-display font-black text-xl text-white">{group.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white/50 text-sm">{sportCfg.emoji} {sportCfg.label}</span>
                {group.isPrivate ? <Badge variant="glass" size="sm">🔒 Private</Badge> : <Badge variant="green" size="sm">🌐 Public</Badge>}
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

        {/* Group limit info */}
        <FadeUp delay={0.08}>
          <div className="flex items-center gap-2 text-xs text-white/40 glass rounded-2xl p-2.5">
            <span>👤 Created by {getUserById(group.members.find(m => m.role === 'creator')?.userId || '')?.name}</span>
            <span className="text-white/20">·</span>
            <span>🔑 Invite: <span className="font-mono text-violet-300 font-bold">{group.inviteCode}</span></span>
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
              >{t}</button>
            ))}
          </div>
        </FadeUp>

        <AnimatePresence mode="wait">
          {/* ===== MEMBERS TAB ===== */}
          {tab === 'Members' && (
            <motion.div key="members" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>👥 Members ({group.members.length})</span>
              </p>
              {group.members.map(member => (
                <MemberDropdown key={member.userId} userId={member.userId} groupId={group.id} />
              ))}
            </motion.div>
          )}

          {/* ===== RANKINGS TAB ===== */}
          {tab === 'Rankings' && (
            <motion.div key="rankings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>🏆 {group.name} Rankings</span>
              </p>
              <div className="glass rounded-2xl overflow-hidden">
                {rankedMembers.map((member, i) => {
                  const user = getUserById(member.userId);
                  const stats = computeMemberGroupStats(member.userId, group.id);
                  if (!user) return null;
                  const medals = ['🥇', '🥈', '🥉'];
                  const rankDisplay = i < 3 ? medals[i] : `#${i + 1}`;
                  return (
                    <div
                      key={member.userId}
                      className={clsx(
                        'flex items-center gap-3 p-3.5',
                        i < group.members.length - 1 && 'border-b border-white/5'
                      )}
                    >
                      <span className="text-lg w-8 text-center">{rankDisplay}</span>
                      <Avatar src={user.avatar} name={user.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm">{user.name}</p>
                        <p className="text-white/40 text-xs">{stats.matchesPlayed} matches · {stats.wins}W {stats.losses}L</p>
                      </div>
                      <div className="text-right">
                        <p className={clsx(
                          'font-bold text-base',
                          stats.winRate >= 60 ? 'text-green-400' : stats.winRate >= 40 ? 'text-amber-400' : 'text-red-400'
                        )}>
                          {stats.winRate}%
                        </p>
                        <p className="text-white/40 text-[10px]">Win Rate</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ===== EVENTS TAB ===== */}
          {tab === 'Events' && (
            <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Upcoming */}
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>⚡ Upcoming ({upcomingEvents.length})</span>
                </p>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingEvents.map(event => (
                      <Card key={event.id} interactive padding="md" onClick={() => navigate(`/events/${event.id}`)}>
                        <div className="flex gap-3 items-start">
                          <span className="text-2xl">{SPORT_CONFIG[event.sport].emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-sm truncate">{event.title}</p>
                            <p className="text-white/50 text-xs">{event.date} · {event.time} · {event.venue}</p>
                          </div>
                          <Badge variant="blue" size="sm">Soon</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="glass rounded-2xl p-6 text-center">
                    <p className="text-2xl mb-1">📅</p>
                    <p className="text-white/40 text-xs">No upcoming events</p>
                  </div>
                )}
              </div>

              {/* History with league results */}
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>📜 History ({completedEvents.length})</span>
                </p>
                {completedEvents.length > 0 ? (
                  <div className="space-y-3">
                    {completedEvents.map(event => (
                      <Card key={event.id} padding="md">
                        <div className="flex gap-3 items-start mb-3">
                          <span className="text-xl">{SPORT_CONFIG[event.sport].emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-sm">{event.title}</p>
                            <p className="text-white/40 text-xs">{event.date} · {event.venue}</p>
                          </div>
                          <Badge variant="glass" size="sm">✓ Done</Badge>
                        </div>

                        {/* League Results */}
                        {event.leagues.length > 0 && (
                          <div className="space-y-2">
                            {event.leagues.map(league => (
                              <div key={league.id}>
                                <p className="text-xs font-semibold text-white/50 mb-1">{league.name}</p>
                                {league.matches.map(match => {
                                  const t1 = league.teams.find(t => t.id === match.team1Id);
                                  const t2 = league.teams.find(t => t.id === match.team2Id);
                                  return (
                                    <div key={match.id} className="flex items-center gap-2 rounded-xl p-2 mb-1" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                      <span className={clsx('flex-1 text-xs font-bold text-right', match.winnerId === match.team1Id ? 'text-green-400' : 'text-white/50')}>
                                        {t1?.name}
                                      </span>
                                      <span className="font-bold text-white text-sm">{match.score1}–{match.score2}</span>
                                      <span className={clsx('flex-1 text-xs font-bold', match.winnerId === match.team2Id ? 'text-green-400' : 'text-white/50')}>
                                        {t2?.name}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    ))}
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

          {/* ===== INVITE TAB ===== */}
          {tab === 'Invite' && (
            <motion.div key="invite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <Card padding="md">
                <p className="font-display font-bold text-white text-sm mb-3">🔗 Invite Code</p>
                <div className="glass rounded-2xl p-4 text-center mb-3">
                  <p className="text-3xl font-mono font-black tracking-widest text-violet-300 mb-2">{group.inviteCode}</p>
                  <p className="text-white/40 text-xs">Share this code with friends to join</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="lime" className="flex-1">📋 Copy Code</Button>
                  <Button variant="glass" className="flex-1">📤 Share Link</Button>
                </div>
              </Card>

              {/* Members who can invite */}
              <Card padding="md">
                <p className="font-display font-bold text-white text-sm mb-3">👤 Current Members</p>
                <div className="flex flex-wrap gap-2">
                  {group.members.map(m => {
                    const u = getUserById(m.userId);
                    return u ? (
                      <div key={m.userId} className="flex items-center gap-1.5 glass rounded-xl px-2.5 py-1.5">
                        <Avatar src={u.avatar} name={u.name} size="xs" />
                        <span className="text-white/70 text-xs">{u.name.split(' ')[0]}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </Card>

              {/* Group rules */}
              <Card padding="md">
                <p className="font-display font-bold text-white text-sm mb-3">📋 Rules</p>
                <div className="space-y-2">
                  {group.rules.map((rule, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="text-violet-400 font-bold flex-shrink-0">{i + 1}.</span>
                      <p className="text-white/70">{rule}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// =============================================
// GROUPS LIST PAGE
// =============================================
export const GroupsPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = USERS.find(u => u.id === CURRENT_USER_ID)!;
  const myCreatedGroups = GROUPS.filter(g => g.members.some(m => m.userId === CURRENT_USER_ID && m.role === 'creator'));
  const myJoinedGroups = GROUPS.filter(g => g.members.some(m => m.userId === CURRENT_USER_ID && m.role !== 'creator'));
  const discoverGroups = GROUPS.filter(g => !g.members.some(m => m.userId === CURRENT_USER_ID));
  const canCreateMore = currentUser.createdGroups.length < 3;
  const canJoinMore = currentUser.joinedGroups.length < 3;

  const overall = getOverallWinRate(CURRENT_USER_ID);

  return (
    <div className="pb-24 max-w-lg mx-auto px-4 pt-4 space-y-6">
      <FadeUp>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-2xl text-white">Groups</h1>
            <p className="text-white/50 text-sm">Your weekend communities</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-sm" style={{ color: '#aaeb00' }}>Overall WR: {overall.overallWinRate}%</p>
            <p className="text-white/40 text-xs">{overall.totalWins}W · {overall.totalLosses}L</p>
          </div>
        </div>
      </FadeUp>

      {/* Limits */}
      <FadeUp delay={0.05}>
        <div className="glass rounded-2xl p-3 flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs">Created / Joined limit</p>
            <p className="font-bold text-white text-sm">{currentUser.createdGroups.length}/3 created · {currentUser.joinedGroups.length}/3 joined</p>
          </div>
        </div>
      </FadeUp>

      {/* Created groups */}
      <FadeUp delay={0.1}>
        <SectionHeader
          title="👑 Created by you"
          action={canCreateMore ? <Button variant="lime" size="sm" onClick={() => navigate('/groups')}>+ New Group</Button> : <Badge variant="glass" size="sm">Limit reached</Badge>}
          className="mb-3"
        />
        <StaggerList className="space-y-3">
          {myCreatedGroups.map(group => {
            const cfg = SPORT_CONFIG[group.sport];
            return (
              <StaggerItem key={group.id}>
                <Card interactive padding="none" onClick={() => navigate(`/groups/${group.id}`)}>
                  <div className="relative h-24 overflow-hidden">
                    <img src={group.banner} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0f0a1e]/80 to-transparent" />
                    <div className="absolute inset-0 p-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: cfg.bg, border: `1px solid ${cfg.color}40` }}>
                        {group.logo}
                      </div>
                      <div>
                        <p className="font-display font-bold text-white">{group.name}</p>
                        <p className="text-white/50 text-xs">{group.memberCount} members · {group.totalEvents} events</p>
                      </div>
                      <div className="ml-auto">
                        <Badge variant="amber">👑 Creator</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            );
          })}
          {myCreatedGroups.length === 0 && (
            <div className="glass rounded-2xl p-6 text-center">
              <p className="text-2xl mb-1">📁</p>
              <p className="text-white/40 text-xs">You haven't created any groups yet</p>
            </div>
          )}
        </StaggerList>
      </FadeUp>

      {/* Joined groups */}
      <FadeUp delay={0.15}>
        <SectionHeader title="⚡ Joined" className="mb-3" />
        <StaggerList className="space-y-3">
          {myJoinedGroups.map(group => {
            const cfg = SPORT_CONFIG[group.sport];
            const myRole = group.members.find(m => m.userId === CURRENT_USER_ID)?.role;
            const roleCfg = myRole ? ROLE_CONFIG[myRole] : null;
            return (
              <StaggerItem key={group.id}>
                <Card interactive padding="none" onClick={() => navigate(`/groups/${group.id}`)}>
                  <div className="relative h-24 overflow-hidden">
                    <img src={group.banner} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0f0a1e]/80 to-transparent" />
                    <div className="absolute inset-0 p-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: cfg.bg }}>
                        {group.logo}
                      </div>
                      <div>
                        <p className="font-display font-bold text-white">{group.name}</p>
                        <p className="text-white/50 text-xs">{group.memberCount} members · {cfg.label}</p>
                      </div>
                      {roleCfg && (
                        <span className="ml-auto text-xs font-semibold px-2 py-1 rounded-full" style={{ background: `${roleCfg.color}20`, color: roleCfg.color }}>
                          {roleCfg.emoji} {roleCfg.label}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            );
          })}
          {myJoinedGroups.length === 0 && (
            <div className="glass rounded-2xl p-6 text-center">
              <p className="text-2xl mb-1">🔍</p>
              <p className="text-white/40 text-xs">Join a group to get started</p>
            </div>
          )}
        </StaggerList>
      </FadeUp>

      {/* Discover */}
      {discoverGroups.length > 0 && canJoinMore && (
        <FadeUp delay={0.2}>
          <SectionHeader title="🔍 Discover Groups" subtitle="Explore and join" className="mb-3" />
          <StaggerList className="space-y-3">
            {discoverGroups.map(group => {
              const cfg = SPORT_CONFIG[group.sport];
              return (
                <StaggerItem key={group.id}>
                  <Card padding="md">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: cfg.bg }}>
                        {group.logo}
                      </div>
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
