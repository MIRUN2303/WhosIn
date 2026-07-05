import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GROUPS, SPORT_CONFIG, getUserById, getGroupById, getCompletedGroupEvents, getUpcomingGroupEvents, getGroupEvents, computeMemberGroupStats, getOverallWinRate } from '../../data/mockData';
import { Card, Avatar, Badge, Button, SectionHeader } from '../../components/ui';
import { FadeUp, StaggerList, StaggerItem } from '../../components/motion';
import { clsx } from 'clsx';
import { useAppStore } from '../../store/useAppStore';
import { CreateEventSheet } from '../../components/events/CreateEventSheet';
import toast from 'react-hot-toast';

const ROLE_CONFIG = {
  creator: { label: 'Creator', color: '#f59e0b', emoji: '👑' },
  admin: { label: 'Admin', color: '#7c3aed', emoji: '🛡️' },
  member: { label: 'Member', color: '#6b7280', emoji: '⚡' },
};

const LOGO_OPTIONS = ['🏸', '🏏', '⚽', '🎾', '🏐', '🏀', '🏃', '🚴', '🥾', '🏊', '🎬', '☕', '🚗', '🎮', '🎲', '✨', '🎯'];

// =============================================
// SPORT BADGE
// =============================================
const SportBadge: React.FC<{ sport: string; size?: 'sm' | 'xs' }> = ({ sport, size = 'xs' }) => {
  const cfg = SPORT_CONFIG[sport as keyof typeof SPORT_CONFIG];
  if (!cfg) return null;
  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-full font-semibold', size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5')}
      style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30`, color: cfg.color }}>
      {cfg.emoji} {cfg.label}
    </span>
  );
};

// =============================================
// MEMBER DROPDOWN
// =============================================
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
      <button onClick={() => setOpen(!open)} className="w-full text-left">
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
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-white/30 text-sm">▼</motion.span>
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mx-3 mb-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">📊 Group Stats</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <StatItem label="Matches" value={computed.matchesPlayed} color="#7c3aed" />
                <StatItem label="Wins" value={computed.wins} color="#10b981" />
                <StatItem label="Losses" value={computed.losses} color="#ef4444" />
                <StatItem label="Win Rate" value={`${computed.winRate}%`} color={computed.winRate >= 60 ? '#10b981' : computed.winRate >= 40 ? '#f59e0b' : '#ef4444'} />
              </div>

              {/* Per-sport breakdown */}
              {computed.sportBreakdown.length > 0 && (
                <>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">🏅 Per Sport</p>
                  <div className="space-y-1.5">
                    {computed.sportBreakdown.map(s => {
                      const cfg = SPORT_CONFIG[s.sport as keyof typeof SPORT_CONFIG];
                      return (
                        <div key={s.sport} className="flex items-center gap-2 rounded-xl p-2" style={{ background: `${cfg?.color || '#7c3aed'}08` }}>
                          <span className="text-sm">{cfg?.emoji || '🎯'}</span>
                          <span className="text-xs font-semibold text-white/60 flex-1">{cfg?.label || s.sport}</span>
                          <span className="text-xs text-white/40">{s.matchesPlayed}m</span>
                          <span className={clsx('text-xs font-bold', s.winRate >= 60 ? 'text-green-400' : s.winRate >= 40 ? 'text-amber-400' : 'text-red-400')}>
                            {s.winRate}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 mt-3">🏆 Overall (All Groups)</p>
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
// CALENDAR VIEW
// =============================================
const CalendarView: React.FC<{ groupId: string }> = ({ groupId }) => {
  const navigate = useNavigate();
  const events = getGroupEvents(groupId);
  const currentUserId = useAppStore(s => s.currentUserId);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthLabel = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

  const eventMap: Record<string, typeof events> = {};
  for (const e of events) {
    const d = e.date;
    if (!eventMap[d]) eventMap[d] = [];
    eventMap[d].push(e);
  }

  const selectedDateStr = selectedDay ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}` : '';
  const selectedEvents = selectedDateStr ? eventMap[selectedDateStr] || [] : [];

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); setSelectedDay(null); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); setSelectedDay(null); };

  const cells: { day: number; events: typeof events }[] = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: 0, events: [] });
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, events: eventMap[key] || [] });
  }

  const groups = useAppStore(s => s.groups);
  const grp = groups.find(g => g.id === groupId);
  const isAdmin = grp?.members.some(m => m.userId === currentUserId && (m.role === 'creator' || m.role === 'admin'));

  return (
    <div>
      {/* Header + nav */}
      <div className="flex items-center justify-between mb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={prev}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 text-sm"
          style={{ background: 'rgba(255,255,255,0.05)' }}>←</motion.button>
        <p className="font-display font-bold text-white text-sm">{monthLabel}</p>
        <motion.button whileTap={{ scale: 0.9 }} onClick={next}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 text-sm"
          style={{ background: 'rgba(255,255,255,0.05)' }}>→</motion.button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-white/30 py-1">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          const isToday = cell.day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
          const isSelected = cell.day === selectedDay && cell.day > 0;
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => cell.day > 0 && setSelectedDay(cell.day === selectedDay ? null : cell.day)}
              className={clsx(
                'relative text-center py-2 rounded-xl text-xs transition-all',
                cell.day === 0 && 'invisible',
              )}
              style={{
                background: isSelected
                  ? '#00ff41'
                  : isToday
                  ? 'rgba(0,255,65,0.12)'
                  : 'transparent',
              }}
            >
              <span className={clsx(
                'font-semibold',
                isSelected ? 'text-[#080808]' : isToday ? 'text-[#00ff41]' : 'text-white/60'
              )}>
                {cell.day}
              </span>
              {cell.events.length > 0 && (
                <div className="flex justify-center gap-0.5 mt-0.5">
                  {cell.events.slice(0, 3).map(e => {
                    const cfg = SPORT_CONFIG[e.sport as keyof typeof SPORT_CONFIG];
                    return <span key={e.id} className="w-1 h-1 rounded-full" style={{ background: isSelected ? '#080808' : (cfg?.color || '#7c3aed') }} />;
                  })}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected date section */}
      <AnimatePresence mode="wait">
        {selectedDay ? (
          <motion.div
            key="selected"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mt-4"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-white/50">
                {new Date(year, month, selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
              {isAdmin && (
                <button onClick={() => setShowCreate(true)}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95"
                  style={{ background: '#00ff41', color: '#080808' }}>
                  + Schedule
                </button>
              )}
            </div>
            {selectedEvents.length > 0 ? (
              <div className="space-y-1.5">
                {selectedEvents.map(e => {
                  const cfg = SPORT_CONFIG[e.sport as keyof typeof SPORT_CONFIG];
                  return (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.04] transition-all"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                      onClick={() => navigate(`/events/${e.id}`)}
                    >
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                        style={{ background: `${cfg?.color || '#7c3aed'}20` }}>{cfg?.emoji || '📅'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{e.title}</p>
                        <p className="text-[10px] text-white/40">{e.time} · {e.venue}</p>
                      </div>
                      <Badge variant={e.status === 'upcoming' ? 'blue' : 'glass'} size="sm">
                        {e.status === 'upcoming' ? 'Soon' : '✓'}
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.06)' }}>
                <p className="text-2xl mb-1">📅</p>
                <p className="text-white/30 text-xs">No events on this day</p>
                {isAdmin && (
                  <button onClick={() => setShowCreate(true)}
                    className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all active:scale-95"
                    style={{ background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.2)', color: '#00ff41' }}>
                    + Schedule Event
                  </button>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4"
          >
            <div className="text-center py-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.06)' }}>
              <p className="text-white/30 text-xs">Select a date to view or schedule events</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateEventSheet
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        preselectedGroupId={groupId}
        preselectedDate={selectedDay ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}` : undefined}
      />
    </div>
  );
};

// =============================================
// CREATE GROUP MODAL
// =============================================
const CreateGroupModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const createGroup = useAppStore(s => s.createGroup);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('🎯');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [rules, setRules] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) { toast.error('Group name is required'); return; }
    const rulesArr = rules.split('\n').filter(r => r.trim());
    const id = createGroup({
      name: name.trim(),
      description: description.trim(),
      isPrivate,
      rules: rulesArr.length > 0 ? rulesArr : ['Respect all members', 'Have fun!'],
    });
    if (id) onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/60" />
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6"
        style={{ background: '#0f0a1e', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-white text-lg">Create Group</h2>
          <button onClick={onClose} className="text-white/40 text-lg">✕</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-white/50 text-xs font-semibold mb-1 block">Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Weekend Crew" className="w-full glass rounded-2xl px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-[#00ff41]/50" />
          </div>
          <div>
            <label className="text-white/50 text-xs font-semibold mb-1 block">Logo / Emoji</label>
            <div className="flex flex-wrap gap-1.5">
              {LOGO_OPTIONS.map(em => (
                <button key={em} onClick={() => setLogo(em)}
                  className={clsx('w-10 h-10 rounded-xl text-lg transition-all', logo === em ? 'bg-white/10 border border-white/20' : 'border border-transparent hover:bg-white/5')}
                >{em}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-white/50 text-xs font-semibold mb-1 block">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What's this group about?" rows={2} className="w-full glass rounded-2xl px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-[#00ff41]/50 resize-none" />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-white/50 text-xs font-semibold">Private group</label>
            <button onClick={() => setIsPrivate(!isPrivate)} className={clsx('w-10 h-5 rounded-full transition-all', isPrivate ? 'bg-[#00ff41]' : 'bg-white/20')}>
              <div className={clsx('w-4 h-4 rounded-full bg-white transition-all', isPrivate ? 'translate-x-5' : 'translate-x-0.5')} />
            </button>
          </div>
          <div>
            <label className="text-white/50 text-xs font-semibold mb-1 block">Rules (one per line)</label>
            <textarea value={rules} onChange={e => setRules(e.target.value)} placeholder="Be on time&#10;Respect others&#10;Have fun!" rows={3} className="w-full glass rounded-2xl px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-[#00ff41]/50 resize-none" />
          </div>
          <motion.button onClick={handleSubmit} className="btn-lime w-full py-3 font-black text-sm" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            Create Group →
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

// =============================================
// GROUP DETAIL
// =============================================
export const GroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Members');
  const [showCreate, setShowCreate] = useState(false);
  const currentUserId = useAppStore(s => s.currentUserId);

  const group = GROUPS.find(g => g.id === id);
  if (!group) return <div className="min-h-screen flex items-center justify-center"><p className="text-white/50">Group not found</p></div>;

  const upcomingEvents = getUpcomingGroupEvents(group.id);
  const completedEvents = getCompletedGroupEvents(group.id);

  const rankedMembers = [...group.members].sort((a, b) => {
    const aStats = computeMemberGroupStats(a.userId, group.id);
    const bStats = computeMemberGroupStats(b.userId, group.id);
    return bStats.winRate - aStats.winRate;
  });

  const TABS = ['Members', 'Rankings', 'Events', 'Calendar', 'Invite'];

  return (
    <div className="pb-24 max-w-lg mx-auto">
      <div
        className="relative h-44 overflow-hidden rounded-b-3xl"
        style={{
          backgroundImage: `linear-gradient(to top, #080808 0%, #080808 20%, transparent 60%), url(${group.banner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 glass w-10 h-10 rounded-2xl flex items-center justify-center text-white">←</button>
      </div>

      <div className="px-4 mt-4 space-y-4">
        <FadeUp>
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-2 border-white/20 shadow-lg flex-shrink-0 glass">
              {group.logo}
            </div>
            <div className="flex-1">
              <h1 className="font-display font-black text-xl text-white">{group.name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {group.tags.map(tag => <SportBadge key={tag} sport={tag} />)}
                {group.isPrivate ? <Badge variant="glass" size="sm">🔒 Private</Badge> : <Badge variant="green" size="sm">🌐 Public</Badge>}
              </div>
              <p className="text-white/60 text-sm mt-2 leading-relaxed">{group.description}</p>
            </div>
          </div>
        </FadeUp>

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

        <FadeUp delay={0.08}>
          <div className="flex items-center gap-2 text-xs text-white/40 glass rounded-2xl p-2.5">
            <span>👤 Created by {getUserById(group.members.find(m => m.role === 'creator')?.userId || '')?.name}</span>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="flex gap-1 glass rounded-2xl p-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={clsx('flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200', tab === t ? 'bg-violet-600 text-white' : 'text-white/50 hover:text-white')}
              >{t}</button>
            ))}
          </div>
        </FadeUp>

        <AnimatePresence mode="wait">
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
                    <div key={member.userId} className={clsx('flex items-center gap-3 p-3.5', i < group.members.length - 1 && 'border-b border-white/5')}>
                      <span className="text-lg w-8 text-center">{rankDisplay}</span>
                      <Avatar src={user.avatar} name={user.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm">{user.name}</p>
                        <p className="text-white/40 text-xs">{stats.matchesPlayed} matches · {stats.wins}W {stats.losses}L</p>
                      </div>
                      <div className="text-right">
                        <p className={clsx('font-bold text-base', stats.winRate >= 60 ? 'text-green-400' : stats.winRate >= 40 ? 'text-amber-400' : 'text-red-400')}>
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

          {tab === 'Events' && (
            <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <Button variant="lime" fullWidth size="sm" onClick={() => setShowCreate(true)}>
                ⚡ Create Live Event
              </Button>
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>⚡ Upcoming ({upcomingEvents.length})</span>
                </p>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingEvents.map(event => {
                      const myStatus = event.attendance.find(a => a.userId === currentUserId)?.status;
                      return (
                      <Card key={event.id} interactive padding="md" onClick={() => navigate(`/events/${event.id}`)}>
                        <div className="flex gap-3 items-start">
                          <span className="text-2xl">{SPORT_CONFIG[event.sport as keyof typeof SPORT_CONFIG]?.emoji || '📅'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-sm truncate">{event.title}</p>
                            <p className="text-white/50 text-xs">{event.date} · {event.time} · {event.venue}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {myStatus && (
                              <span className="text-xs">{myStatus === 'coming' ? '✅' : '❌'}</span>
                            )}
                            <Badge variant="blue" size="sm">Soon</Badge>
                          </div>
                        </div>
                      </Card>
                    );})}
                  </div>
                ) : (
                  <div className="glass rounded-2xl p-6 text-center">
                    <p className="text-2xl mb-1">📅</p>
                    <p className="text-white/40 text-xs">No upcoming events</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>📜 History ({completedEvents.length})</span>
                </p>
                {completedEvents.length > 0 ? (
                  <div className="space-y-3">
                    {completedEvents.map(event => (
                      <Card key={event.id} padding="md" interactive onClick={() => navigate(`/events/${event.id}`)}>
                        <div className="flex gap-3 items-start mb-3">
                          <span className="text-xl">{SPORT_CONFIG[event.sport as keyof typeof SPORT_CONFIG]?.emoji || '📅'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-sm">{event.title}</p>
                            <p className="text-white/40 text-xs">{event.date} · {event.venue}</p>
                          </div>
                          <Badge variant="glass" size="sm">✓ Done</Badge>
                        </div>
                        {event.leagues.length > 0 && (
                          <div className="space-y-3">
                            {event.leagues.map(league => {
                              const team1 = league.teams[0];
                              const team2 = league.teams[1];
                              const format1 = team1?.playerIds.length === 1 ? 'Single' : 'Doubles';
                              const format2 = team2?.playerIds.length === 1 ? 'Single' : 'Doubles';
                              const formatLabel = format1 === format2 ? format1 : `${format1} vs ${format2}`;
                              const getPlayerNames = (playerIds: string[]) =>
                                playerIds.map(pid => getUserById(pid)?.name.split(' ')[0] || '?').join(' & ');
                              const leagueWinners = league.matches.length > 0
                                ? (() => {
                                    const counts: Record<string, number> = {};
                                    for (const m of league.matches) {
                                      if (m.winnerId) counts[m.winnerId] = (counts[m.winnerId] || 0) + 1;
                                    }
                                    const bestId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
                                    const best = league.teams.find(t => t.id === bestId);
                                    return best ? getPlayerNames(best.playerIds) : null;
                                  })()
                                : null;
                              return (
                                <div key={league.id}>
                                  <div className="flex items-center gap-2 mb-2">
                                    <p className="text-xs font-semibold text-white/50">{league.name}</p>
                                    <span className="text-white/30 text-[10px]">👤 {new Set(league.players).size}</span>
                                    <span className="text-white/30 text-[10px]">🏸 {formatLabel}</span>
                                  </div>
                                  {league.status === 'completed' && leagueWinners && (
                                    <div className="rounded-lg p-1.5 mb-2 text-xs font-bold text-center" style={{ background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.2)', color: '#00ff41' }}>
                                      🏆 {leagueWinners}
                                    </div>
                                  )}
                                  {league.matches.map(match => {
                                    const t1 = league.teams.find(t => t.id === match.team1Id);
                                    const t2 = league.teams.find(t => t.id === match.team2Id);
                                    const p1 = t1 ? getPlayerNames(t1.playerIds) : '?';
                                    const p2 = t2 ? getPlayerNames(t2.playerIds) : '?';
                                    return (
                                      <div key={match.id} className="flex items-center gap-2 rounded-xl p-2 mb-1" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                        <span className={clsx('flex-1 text-xs font-bold text-right', match.winnerId === match.team1Id ? 'text-green-400' : 'text-white/50')}>{p1}</span>
                                        <span className="font-bold text-white text-sm">{match.score1}–{match.score2}</span>
                                        <span className={clsx('flex-1 text-xs font-bold', match.winnerId === match.team2Id ? 'text-green-400' : 'text-white/50')}>{p2}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}
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

          {tab === 'Calendar' && (
            <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CalendarView groupId={group.id} />
            </motion.div>
          )}

          {tab === 'Invite' && (
            <motion.div key="invite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <Card padding="md">
                <p className="font-display font-bold text-white text-sm mb-3">🔗 Invite by Profile Code</p>
                <p className="text-white/40 text-xs mb-3">Enter a friend's profile code to add them to this group</p>
                <InviteByCodeForm groupId={group.id} />
              </Card>
              <Card padding="md">
                <p className="font-display font-bold text-white text-sm mb-3">👤 Current Members</p>
                <div className="flex flex-wrap gap-2">
                  {group.members.map(m => {
                    const u = getUserById(m.userId);
                    return u ? (
                      <div key={m.userId} className="flex items-center gap-1.5 glass rounded-xl px-2.5 py-1.5">
                        <Avatar src={u.avatar} name={u.name} size="xs" />
                        <span className="text-white/70 text-xs">{u.name.split(' ')[0]}</span>
                        <span className="text-white/20 text-[10px] font-mono">({u.profileCode})</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </Card>
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

      <CreateEventSheet isOpen={showCreate} onClose={() => setShowCreate(false)} preselectedGroupId={group.id} />
    </div>
  );
};

// =============================================
// INVITE BY PROFILE CODE FORM
// =============================================
const InviteByCodeForm: React.FC<{ groupId: string }> = ({ groupId }) => {
  const inviteByProfileCode = useAppStore(s => s.inviteByProfileCode);
  const [code, setCode] = useState('');

  const handleInvite = () => {
    if (!code.trim()) { toast.error('Enter a profile code'); return; }
    inviteByProfileCode(groupId, code.trim());
    setCode('');
  };

  return (
    <div className="flex gap-2">
      <input
        value={code}
        onChange={e => setCode(e.target.value.toUpperCase())}
        placeholder="Enter profile code (e.g. MIRUN001)"
        className="flex-1 glass rounded-2xl px-4 py-2.5 text-white text-sm outline-none border border-white/10 focus:border-[#00ff41]/50"
        onKeyDown={e => e.key === 'Enter' && handleInvite()}
      />
      <Button variant="lime" size="sm" onClick={handleInvite}>Invite</Button>
    </div>
  );
};

// =============================================
// GROUPS LIST PAGE
// =============================================
export const GroupsPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUserId = useAppStore(s => s.currentUserId);
  const joinGroup = useAppStore(s => s.joinGroup);
  const [showCreate, setShowCreate] = useState(false);

  const currentUser = currentUserId ? getUserById(currentUserId) : null;
  const myCreatedGroups = GROUPS.filter(g => g.members.some(m => m.userId === currentUserId && m.role === 'creator'));
  const myJoinedGroups = GROUPS.filter(g => g.members.some(m => m.userId === currentUserId && m.role !== 'creator'));
  const discoverGroups = GROUPS.filter(g => !g.members.some(m => m.userId === currentUserId));
  const canCreateMore = currentUser ? currentUser.createdGroups.length < 3 : false;
  const canJoinMore = currentUser ? currentUser.joinedGroups.length < 3 : false;

  const overall = getOverallWinRate(currentUserId || '');

  return (
    <div className="pb-24 max-w-lg mx-auto px-4 pt-4 space-y-6">
      <FadeUp>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-2xl text-white">Groups</h1>
            <p className="text-white/50 text-sm">Your weekend communities</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-sm" style={{ color: '#00ff41' }}>Overall WR: {overall.overallWinRate}%</p>
            <p className="text-white/40 text-xs">{overall.totalWins}W · {overall.totalLosses}L</p>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.05}>
        <div className="glass rounded-2xl p-3 flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs">Created / Joined limit</p>
            <p className="font-bold text-white text-sm">{currentUser?.createdGroups.length || 0}/3 created · {currentUser?.joinedGroups.length || 0}/3 joined</p>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <SectionHeader
          title="👑 Created by you"
          action={canCreateMore ? <Button variant="lime" size="sm" onClick={() => setShowCreate(true)}>+ New Group</Button> : <Badge variant="glass" size="sm">Limit reached</Badge>}
          className="mb-3"
        />
        <StaggerList className="space-y-3">
          {myCreatedGroups.map(group => (
            <StaggerItem key={group.id}>
              <Card interactive padding="none" onClick={() => navigate(`/groups/${group.id}`)}>
                <div className="relative h-24 overflow-hidden">
                  <img src={group.banner} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0f0a1e]/80 to-transparent" />
                  <div className="absolute inset-0 p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 glass">
                      {group.logo}
                    </div>
                    <div>
                      <p className="font-display font-bold text-white">{group.name}</p>
                      <p className="text-white/50 text-xs">{group.memberCount} members · {group.totalEvents} events</p>
                    </div>
                    <div className="ml-auto"><Badge variant="amber">👑 Creator</Badge></div>
                  </div>
                </div>
              </Card>
            </StaggerItem>
          ))}
          {myCreatedGroups.length === 0 && (
            <div className="glass rounded-2xl p-6 text-center">
              <p className="text-2xl mb-1">📁</p>
              <p className="text-white/40 text-xs">You haven't created any groups yet</p>
            </div>
          )}
        </StaggerList>
      </FadeUp>

      <FadeUp delay={0.15}>
        <SectionHeader title="⚡ Joined" className="mb-3" />
        <StaggerList className="space-y-3">
          {myJoinedGroups.map(group => (
            <StaggerItem key={group.id}>
              <Card interactive padding="none" onClick={() => navigate(`/groups/${group.id}`)}>
                <div className="relative h-24 overflow-hidden">
                  <img src={group.banner} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0f0a1e]/80 to-transparent" />
                  <div className="absolute inset-0 p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 glass">
                      {group.logo}
                    </div>
                    <div>
                      <p className="font-display font-bold text-white">{group.name}</p>
                      <p className="text-white/50 text-xs">{group.memberCount} members · {group.totalEvents} events</p>
                    </div>
                  </div>
                </div>
              </Card>
            </StaggerItem>
          ))}
          {myJoinedGroups.length === 0 && (
            <div className="glass rounded-2xl p-6 text-center">
              <p className="text-2xl mb-1">🔍</p>
              <p className="text-white/40 text-xs">Join a group to get started</p>
            </div>
          )}
        </StaggerList>
      </FadeUp>

      {discoverGroups.length > 0 && canJoinMore && (
        <FadeUp delay={0.2}>
          <SectionHeader title="🔍 Discover Groups" subtitle="Explore and join" className="mb-3" />
          <StaggerList className="space-y-3">
            {discoverGroups.map(group => (
              <StaggerItem key={group.id}>
                <Card padding="md">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 glass">
                      {group.logo}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white">{group.name}</p>
                      <p className="text-white/50 text-xs">{group.memberCount} members</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => joinGroup(group.id)}>Join</Button>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerList>
        </FadeUp>
      )}

      <CreateGroupModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
};
