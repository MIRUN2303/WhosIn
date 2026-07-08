import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { SPORT_CONFIG } from '../../data/sportConfig';
import { getUserById, getCompletedGroupEvents, getUpcomingGroupEvents, getGroupEvents, computeMemberGroupStats, getOverallWinRate } from '../../data/mockData';
import { Card, Avatar, Badge, Button, SectionHeader, ConfirmModal } from '../../components/ui';
import { Iconic } from '../../components/ui/icons';
import { FadeUp, StaggerList, StaggerItem } from '../../components/motion';
import { FAB } from '../../components/layout/Navigation';
import { clsx } from 'clsx';
import { useAppStore } from '../../store/useAppStore';
import { CreateEventSheet } from '../../components/events/CreateEventSheet';
import toast from 'react-hot-toast';

const ROLE_CONFIG = {
  creator: { label: 'Creator', color: '#f59e0b', icon: 'crown' },
  admin: { label: 'Admin', color: '#7c3aed', icon: 'shield' },
  member: { label: 'Member', color: '#6b7280', icon: 'lightning' },
};

const LOGO_EMOJIS = ['🏸', '🏏', '⚽', '🏓', '🏐', '🏀', '🏃', '🚴', '🥾', '🏊', '🎬', '☕', '🚗', '🎮', '🎲', '🎯', '💪', '🧘', '🏋️', '⛰️', '🏕️', '🍕', '🎵', '🎨', '📸', '🌮', '🍔', '🧑‍🍳', '🎤', '🎧', '🏄', '🛹', '🥊', '🤸', '⛳', '🎿'];

// =============================================
// =============================================
// MEMBER DROPDOWN
// =============================================
const MemberDropdown: React.FC<{ userId: string; groupId: string; currentUserRole?: string }> = ({ userId, groupId, currentUserRole }) => {
  const groups = useAppStore(s => s.groups);
  const users = useAppStore(s => s.users);
  const user = users.find(u => u.id === userId);
  const [open, setOpen] = useState(false);
  const updateMemberRole = useAppStore(s => s.updateMemberRole);
  if (!user) return null;

  const group = groups.find(g => g.id === groupId);
  const groupMember = group?.members.find(m => m.userId === userId);
  const computed = groupMember?.stats || { matchesPlayed: 0, wins: 0, losses: 0, winRate: 0, attendanceRate: 0, currentStreak: 0, points: 0 };
  const computedExt = computed as typeof computed & { sportBreakdown?: { sport: string; matchesPlayed: number; winRate: number }[] };
  const overall = user.stats.winRate || 0;
  const member = group?.members.find(m => m.userId === userId);
  const roleCfg = ROLE_CONFIG[member?.role || 'member'] as typeof ROLE_CONFIG[keyof typeof ROLE_CONFIG];
  const isCreator = currentUserRole === 'creator';
  const isSelf = userId === useAppStore.getState().currentUserId;
  const adminCount = group?.members.filter(m => m.role === 'admin').length || 0;
  const canPromote = isCreator && !isSelf && member?.role === 'member' && adminCount < 2;
  const canDemote = isCreator && !isSelf && member?.role === 'admin';

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
            <Iconic name={roleCfg.icon} size={14} />
          </span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-white/30 text-sm">▼</motion.span>
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mx-3 mb-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1"><Iconic name="activity" size={14} /> Group Stats</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <StatItem label="Matches" value={computed.matchesPlayed} color="#7c3aed" />
                <StatItem label="Wins" value={computed.wins} color="#10b981" />
                <StatItem label="Losses" value={computed.losses} color="#ef4444" />
                <StatItem label="Win Rate" value={`${computed.winRate}%`} color={computed.winRate >= 60 ? '#10b981' : computed.winRate >= 40 ? '#f59e0b' : '#ef4444'} />
              </div>

              {computedExt.sportBreakdown && computedExt.sportBreakdown.length > 0 && (
                <>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1"><Iconic name="target" size={14} /> Per Sport</p>
                  <div className="space-y-1.5">
                    {computedExt.sportBreakdown.map(s => {
                      const cfg = SPORT_CONFIG[s.sport as keyof typeof SPORT_CONFIG];
                      return (
                        <div key={s.sport} className="flex items-center gap-2 rounded-xl p-2" style={{ background: `${cfg?.color || '#7c3aed'}08` }}>
                          {cfg?.emoji ? <Iconic name={cfg.emoji} size={16} /> : <Iconic name="target" size={16} />}
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

              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 mt-3 flex items-center gap-1"><Iconic name="trophy" size={14} /> Overall (All Groups)</p>
              <div className="grid grid-cols-2 gap-2">
                <StatItem label="Total Matches" value={overall.totalMatches} color="#7c3aed" />
                <StatItem label="Total Wins" value={overall.totalWins} color="#10b981" />
                <StatItem label="Total Losses" value={overall.totalLosses} color="#ef4444" />
                <StatItem label="Overall WR" value={`${overall.overallWinRate}%`} color={overall.overallWinRate >= 60 ? '#10b981' : overall.overallWinRate >= 40 ? '#f59e0b' : '#ef4444'} />
              </div>

              {canPromote && (
                <button onClick={() => { updateMemberRole(groupId, userId, 'admin'); setOpen(false); }}
                  className="w-full mt-3 text-xs font-bold py-2 rounded-xl transition-all"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
                  <Iconic name="shield" size={14} /> Make Admin
                </button>
              )}
              {canDemote && (
                <button onClick={() => { updateMemberRole(groupId, userId, 'member'); setOpen(false); }}
                  className="w-full mt-3 text-xs font-bold py-2 rounded-xl transition-all"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                  Remove Admin
                </button>
              )}
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
  const isMember = grp?.members.some(m => m.userId === currentUserId);

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
                  ? 'var(--green)'
                  : isToday
                  ? 'rgba(var(--green-rgb),0.12)'
                  : 'transparent',
              }}
            >
              <span className={clsx(
                'font-semibold',
                isSelected ? 'text-[#080808]' : isToday ? 'text-[var(--green)]' : 'text-white/60'
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
              {isMember && (
                <button onClick={() => setShowCreate(true)}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95"
                  style={{ background: 'var(--green)', color: '#080808' }}>
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
                        style={{ background: `${cfg?.color || '#7c3aed'}20` }}>{cfg?.emoji ? <Iconic name={cfg.emoji} size={16} /> : <Iconic name="calendar" size={16} />}</span>
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
<Iconic name="calendar" size={32} className="mb-1" />
                <p className="text-white/30 text-xs">No events on this day</p>
                {isMember && (
                  <button onClick={() => setShowCreate(true)}
                    className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all active:scale-95"
                    style={{ background: 'rgba(var(--green-rgb),0.1)', border: '1px solid rgba(var(--green-rgb),0.2)', color: 'var(--green)' }}>
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
        initialMode="schedule"
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
  const [emojiOpen, setEmojiOpen] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) { toast.error('Group name is required'); return; }
    const rulesArr = rules.split('\n').filter(r => r.trim());
    const id = createGroup({
      name: name.trim(),
      logo,
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
        className="relative w-full max-w-lg flex flex-col"
        style={{
          background: '#0f0a1e',
          border: '1px solid rgba(255,255,255,0.08)',
          maxHeight: 'min(82dvh, 82vh, 600px)',
          borderRadius: '1.5rem 1.5rem 0 0',
        }}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-2 flex-shrink-0">
          <h2 className="font-display font-bold text-white text-lg">Create Group</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all" style={{ background: 'rgba(255,255,255,0.05)' }}>✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
          <div>
            <label className="text-white/50 text-xs font-semibold mb-1.5 block">Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Weekend Crew" className="w-full glass rounded-2xl px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-[var(--green)]/50" />
          </div>

          <div className="relative">
            <label className="text-white/50 text-xs font-semibold mb-1.5 block">Group Emoji</label>
            <button type="button" onClick={() => setEmojiOpen(!emojiOpen)}
              className="w-full glass rounded-2xl px-4 py-3 text-white text-sm outline-none border border-white/10 flex items-center gap-3"
            >
              <span className="text-2xl">{logo}</span>
              <span className="text-white/40 text-xs flex-1 text-left">Choose an emoji</span>
              <motion.span animate={{ rotate: emojiOpen ? 180 : 0 }} className="text-white/30 text-xs">▾</motion.span>
            </button>
            <AnimatePresence>
              {emojiOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden rounded-2xl mt-1.5"
                  style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="grid grid-cols-6 gap-1 p-2.5">
                    {LOGO_EMOJIS.map(em => (
                      <button key={em} type="button" onClick={() => { setLogo(em); setEmojiOpen(false); }}
                        className={clsx(
                          'aspect-square rounded-xl flex items-center justify-center text-lg transition-all',
                          logo === em
                            ? 'scale-110'
                            : 'hover:bg-white/5',
                        )}
                        style={logo === em ? { background: 'rgba(var(--green-rgb),0.15)', border: '2px solid var(--green)', boxShadow: '0 0 10px rgba(var(--green-rgb),0.25)' } : {}}
                      >{em}</button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label className="text-white/50 text-xs font-semibold mb-1.5 block">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What's this group about?" rows={2} className="w-full glass rounded-2xl px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-[var(--green)]/50 resize-none" />
          </div>

          <div className="flex items-center justify-between glass rounded-2xl px-4 py-3 border border-white/10">
            <div>
              <p className="text-white text-sm font-semibold">Private group</p>
              <p className="text-white/30 text-xs">Only invited members can join</p>
            </div>
            <button onClick={() => setIsPrivate(!isPrivate)} className={clsx('w-11 h-6 rounded-full transition-all flex items-center flex-shrink-0', isPrivate ? 'bg-[var(--green)]' : 'bg-white/20')}>
              <div className={clsx('w-5 h-5 rounded-full bg-white transition-all shadow', isPrivate ? 'translate-x-5.5' : 'translate-x-0.5')} />
            </button>
          </div>

          <div>
            <label className="text-white/50 text-xs font-semibold mb-1.5 block">Rules (one per line)</label>
            <textarea value={rules} onChange={e => setRules(e.target.value)} placeholder="Be on time&#10;Respect others&#10;Have fun!" rows={3} className="w-full glass rounded-2xl px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-[var(--green)]/50 resize-none" />
          </div>

          <motion.button onClick={handleSubmit} className="btn-lime w-full py-3.5 font-black text-sm" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
  const [editGroup, setEditGroup] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDesc, setEditGroupDesc] = useState('');
  const [editGroupRules, setEditGroupRules] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const currentUserId = useAppStore(s => s.currentUserId);
  const updateGroupDetails = useAppStore(s => s.updateGroupDetails);
  const groups = useAppStore(s => s.groups);

  const group = groups.find(g => g.id === id);
  if (!group) return <div className="min-h-screen flex items-center justify-center"><p className="text-white/50">Group not found</p></div>;

  const myMember = group.members.find(m => m.userId === currentUserId);
  const myRole = myMember?.role;

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
        className="relative h-48 overflow-hidden rounded-b-3xl"
        style={{
          backgroundImage: `linear-gradient(to top, #080808 0%, #080808 20%, transparent 60%), url(${group.banner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 z-20 w-10 h-10 rounded-2xl flex items-center justify-center text-white"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.1)' }}>←</button>
        <div className="absolute top-4 right-4 z-20 flex gap-1.5">
          {group.tags.slice(0, 3).map(tag => {
            const cfg = SPORT_CONFIG[tag as keyof typeof SPORT_CONFIG];
            return (
              <span key={tag} className="text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md"
                style={{ background: `${cfg?.color || '#7c3aed'}20`, border: `1px solid ${cfg?.color || '#7c3aed'}35`, color: cfg?.color || '#a78bfa' }}>
                {cfg?.emoji && <Iconic name={cfg.emoji} size={10} />} {cfg?.label || tag}
              </span>
            );
          })}
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md"
            style={{ background: group.isPrivate ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)', border: `1px solid ${group.isPrivate ? 'rgba(239,68,68,0.35)' : 'rgba(16,185,129,0.35)'}`, color: group.isPrivate ? '#ef4444' : '#34d399' }}>
            <Iconic name={group.isPrivate ? 'shield' : 'globe'} size={10} /> {group.isPrivate ? 'Private' : 'Public'}
          </span>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        <FadeUp>
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-lg flex-shrink-0 glass">
              <span style={{ fontSize: 32 }}>{group.logo}</span>
            </div>
            <div className="flex-1">
              <h1 className="font-display font-black text-xl text-white">{group.name}</h1>
              <p className="text-white/60 text-sm mt-1 leading-relaxed">{group.description}</p>
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
            <span><Iconic name="users" size={14} /> Created by {getUserById(group.members.find(m => m.role === 'creator')?.userId || '')?.name}</span>
            {myRole === 'creator' && (
              <button onClick={() => {
                setEditGroup(v => !v);
                setEditGroupName(group.name);
                setEditGroupDesc(group.description);
                setEditGroupRules(group.rules.join('\n'));
              }} className="ml-auto text-[10px] font-bold px-2 py-1 rounded-lg transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                {editGroup ? 'Cancel' : <><Iconic name="edit" size={12} /> Edit</>}
              </button>
            )}
          </div>
          {editGroup && myRole === 'creator' && (
            <FadeUp>
              <Card padding="md" variant="dark" className="space-y-3">
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Edit Group</p>
                <div>
                  <label className="text-white/50 text-[10px] font-semibold mb-1 block">Name</label>
                  <input value={editGroupName} onChange={e => setEditGroupName(e.target.value)}
                    className="w-full text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[var(--green)]" />
                </div>
                <div>
                  <label className="text-white/50 text-[10px] font-semibold mb-1 block">Description</label>
                  <textarea value={editGroupDesc} onChange={e => setEditGroupDesc(e.target.value)} rows={2}
                    className="w-full text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[var(--green)] resize-none" />
                </div>
                <div>
                  <label className="text-white/50 text-[10px] font-semibold mb-1 block">Rules (one per line)</label>
                  <textarea value={editGroupRules} onChange={e => setEditGroupRules(e.target.value)} rows={3}
                    className="w-full text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[var(--green)] resize-none" />
                </div>
                <Button variant="lime" size="sm" className="w-full"
                  onClick={() => {
                    updateGroupDetails(group.id, {
                      name: editGroupName.trim() || group.name,
                      description: editGroupDesc.trim(),
                      rules: editGroupRules.split('\n').filter(r => r.trim()),
                    });
                    setEditGroup(false);
                  }}>
                  Save Group
                </Button>
              </Card>
            </FadeUp>
          )}
          <div className="pt-4 mt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Iconic name="alert_triangle" size={12} /> Danger Zone</p>
            {myRole === 'creator' && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setConfirmDelete(true)}
                className="w-full text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}>
                <Iconic name="trash" size={16} /> Delete Group
              </motion.button>
            )}
            {myRole && myRole !== 'creator' && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setConfirmExit(true)}
                className="w-full text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: 'rgba(239,68,68,0.7)' }}>
                <Iconic name="log_out" size={16} /> Exit Group
              </motion.button>
            )}
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
                <span><Iconic name="users" size={14} /> Members ({group.members.length})</span>
              </p>
              {group.members.map(member => (
                <MemberDropdown key={member.userId} userId={member.userId} groupId={group.id} currentUserRole={myRole} />
              ))}
            </motion.div>
          )}

          {tab === 'Rankings' && (
            <motion.div key="rankings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span><Iconic name="trophy" size={14} /> {group.name} Rankings</span>
              </p>
              <div className="glass rounded-2xl overflow-hidden">
                {rankedMembers.map((member, i) => {
                  const user = getUserById(member.userId);
                  const stats = computeMemberGroupStats(member.userId, group.id);
                  if (!user) return null;
                  const rankIcons = ['trophy', 'medal', 'star'];
                  const rankDisplay = i < 3 ? <Iconic name={rankIcons[i]} size={20} /> : `#${i + 1}`;
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
                <Button variant="lime" fullWidth size="sm" icon={<Iconic name="lightning" size={16} />} onClick={() => setShowCreate(true)}>
                Create Live Event
              </Button>
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span><Iconic name="lightning" size={14} /> Upcoming ({upcomingEvents.length})</span>
                </p>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingEvents.map(event => {
                      const myStatus = event.attendance.find(a => a.userId === currentUserId)?.status;
                      return (
                      <Card key={event.id} interactive padding="md" onClick={() => navigate(`/events/${event.id}`)}>
                        <div className="flex gap-3 items-start">
                          {SPORT_CONFIG[event.sport as keyof typeof SPORT_CONFIG]?.emoji ? <Iconic name={SPORT_CONFIG[event.sport as keyof typeof SPORT_CONFIG]!.emoji} size={24} /> : <Iconic name="calendar" size={24} />}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-sm truncate">{event.title}</p>
                            <p className="text-white/50 text-xs">{event.date} · {event.time} · {event.venue}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {myStatus && (
                              <Iconic name={myStatus === 'coming' ? 'check_circle' : 'x_circle'} size={16} />
                            )}
                            <Badge variant="blue" size="sm">Soon</Badge>
                          </div>
                        </div>
                      </Card>
                    );})}
                  </div>
                ) : (
                  <div className="glass rounded-2xl p-6 text-center">
<Iconic name="calendar" size={32} className="mb-1" />
                    <p className="text-white/40 text-xs">No upcoming events</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span><Iconic name="clock" size={14} /> History ({completedEvents.length})</span>
                </p>
                {completedEvents.length > 0 ? (
                  <div className="space-y-3">
                    {completedEvents.map(event => (
                      <Card key={event.id} padding="md" interactive onClick={() => navigate(`/events/${event.id}`)}>
                        <div className="flex gap-3 items-start mb-3">
                          {SPORT_CONFIG[event.sport as keyof typeof SPORT_CONFIG]?.emoji ? <Iconic name={SPORT_CONFIG[event.sport as keyof typeof SPORT_CONFIG]!.emoji} size={22} /> : <Iconic name="calendar" size={22} />}
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
                                    <div className="rounded-lg p-1.5 mb-2 text-xs font-bold text-center" style={{ background: 'rgba(var(--green-rgb),0.1)', border: '1px solid rgba(var(--green-rgb),0.2)', color: 'var(--green)' }}>
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
<Iconic name="flag" size={32} className="mb-1" />
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
                <p className="font-display font-bold text-white text-sm mb-3 flex items-center gap-1"><Iconic name="send" size={16} /> Invite by Profile Code</p>
                <p className="text-white/40 text-xs mb-3">Enter a friend's profile code to add them to this group</p>
                <InviteByCodeForm groupId={group.id} />
              </Card>
              <Card padding="md">
                <p className="font-display font-bold text-white text-sm mb-3 flex items-center gap-1"><Iconic name="users" size={16} /> Current Members</p>
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
                <p className="font-display font-bold text-white text-sm mb-3 flex items-center gap-1"><Iconic name="info" size={16} /> Rules</p>
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

      <CreateEventSheet isOpen={showCreate} onClose={() => setShowCreate(false)} preselectedGroupId={group.id} initialMode="live" />

      <ConfirmModal
        open={confirmDelete}
        title="Delete Group"
        message={`Delete "${group.name}" permanently? All events and data will be lost. This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { setConfirmDelete(false); useAppStore.getState().deleteGroup(group.id); navigate('/groups'); }}
        onCancel={() => setConfirmDelete(false)}
      />
      <ConfirmModal
        open={confirmExit}
        title="Exit Group"
        message="Are you sure you want to leave this group?"
        confirmLabel="Exit"
        variant="danger"
        onConfirm={() => { setConfirmExit(false); useAppStore.getState().exitGroup(group.id); navigate('/groups'); }}
        onCancel={() => setConfirmExit(false)}
      />
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
        className="flex-1 glass rounded-2xl px-4 py-2.5 text-white text-sm outline-none border border-white/10 focus:border-[var(--green)]/50"
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
  const isLoggedIn = useAppStore(s => s.isLoggedIn);
  const joinGroup = useAppStore(s => s.joinGroup);
  const groups = useAppStore(s => s.groups);
  const [showCreate, setShowCreate] = useState(false);

  const currentUser = currentUserId ? getUserById(currentUserId) : null;
  const myCreatedGroups = groups.filter(g => g.members.some(m => m.userId === currentUserId && m.role === 'creator'));
  const myJoinedGroups = groups.filter(g => g.members.some(m => m.userId === currentUserId && m.role !== 'creator'));
  const discoverGroups = groups.filter(g => !g.members.some(m => m.userId === currentUserId));
  const canCreateMore = currentUser ? currentUser.createdGroups.length < 3 : false;
  const canJoinMore = currentUser ? currentUser.joinedGroups.length < 3 : false;

  const overall = getOverallWinRate(currentUserId || '');

  return (
    <div className="page-container !pb-24 space-y-6">
      <FadeUp>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-2xl text-white">Groups</h1>
            <p className="text-white/50 text-sm">Your weekend communities</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-sm" style={{ color: 'var(--green)' }}>Overall WR: {overall.overallWinRate}%</p>
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
          title={<span><Iconic name="crown" size={16} /> Created by you</span>}
          action={!isLoggedIn ? <Button variant="glass" size="sm" onClick={() => navigate('/login')}>Login to create</Button> : canCreateMore ? <Button variant="lime" size="sm" onClick={() => setShowCreate(true)}>+ New Group</Button> : <Badge variant="glass" size="sm">Limit reached</Badge>}
          className="mb-3"
        />
        <StaggerList className="space-y-3">
          {myCreatedGroups.map(group => (
            <StaggerItem key={group.id}>
              <Card interactive padding="none" onClick={() => navigate(`/groups/${group.id}`)}>
                <div className="relative h-28 overflow-hidden">
                  <img src={group.banner} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0f0a1e]/85 via-[#0f0a1e]/30 to-transparent" />
                  <div className="absolute top-2 right-2 z-10">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md"
                      style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.35)', color: '#fbbf24' }}>
                      <Iconic name="crown" size={12} /> Creator
                    </span>
                  </div>
                  <div className="absolute inset-0 p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: 24 }}>{group.logo}</span>
                    </div>
                    <div>
                      <p className="font-display font-bold text-white drop-shadow-lg">{group.name}</p>
                      <p className="text-white/60 text-xs drop-shadow">{group.memberCount} members · {group.totalEvents} events</p>
                    </div>
                  </div>
                </div>
              </Card>
            </StaggerItem>
          ))}
          {myCreatedGroups.length === 0 && (
            <div className="glass rounded-2xl p-6 text-center">
              <Iconic name="users" size={32} className="mb-1" />
              <p className="text-white/40 text-xs">Create your first group</p>
            </div>
          )}
        </StaggerList>
      </FadeUp>

      <FadeUp delay={0.15}>
        <SectionHeader title={<span><Iconic name="lightning" size={16} /> Joined</span>} className="mb-3" />
        <StaggerList className="space-y-3">
          {myJoinedGroups.map(group => (
            <StaggerItem key={group.id}>
              <Card interactive padding="none" onClick={() => navigate(`/groups/${group.id}`)}>
                <div className="relative h-28 overflow-hidden">
                  <img src={group.banner} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0f0a1e]/85 via-[#0f0a1e]/30 to-transparent" />
                  {group.tags.length > 0 && (
                    <div className="absolute top-2 right-2 z-10 flex gap-1">
                      {group.tags.slice(0, 2).map(tag => {
                        const cfg = SPORT_CONFIG[tag as keyof typeof SPORT_CONFIG];
                        return (
                          <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md"
                            style={{ background: `${cfg?.color || '#7c3aed'}20`, border: `1px solid ${cfg?.color || '#7c3aed'}30`, color: cfg?.color || '#a78bfa' }}>
                            {cfg?.label || tag}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <div className="absolute inset-0 p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: 24 }}>{group.logo}</span>
                    </div>
                    <div>
                      <p className="font-display font-bold text-white drop-shadow-lg">{group.name}</p>
                      <p className="text-white/60 text-xs drop-shadow">{group.memberCount} members · {group.totalEvents} events</p>
                    </div>
                  </div>
                </div>
              </Card>
            </StaggerItem>
          ))}
          {myJoinedGroups.length === 0 && (
            <div className="glass rounded-2xl p-6 text-center">
              <Iconic name="search" size={32} className="mb-1" />
              <p className="text-white/40 text-xs">Join a group to get started</p>
            </div>
          )}
        </StaggerList>
      </FadeUp>

      {discoverGroups.length > 0 && canJoinMore && (
        <FadeUp delay={0.2}>
          <SectionHeader title={<span><Iconic name="search" size={16} /> Discover Groups</span>} subtitle="Explore and join" className="mb-3" />
          <StaggerList className="space-y-3">
            {discoverGroups.map(group => (
              <StaggerItem key={group.id}>
                <Card padding="md">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 glass">
                      <span style={{ fontSize: 24 }}>{group.logo}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white">{group.name}</p>
                      <p className="text-white/50 text-xs">{group.memberCount} members</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => isLoggedIn ? joinGroup(group.id) : navigate('/login')}>{isLoggedIn ? 'Join' : 'Login to Join'}</Button>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerList>
        </FadeUp>
      )}

      <CreateGroupModal open={showCreate} onClose={() => setShowCreate(false)} />
      <FAB onClick={() => setShowCreate(true)} />
    </div>
  );
};
