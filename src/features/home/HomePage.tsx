import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInSeconds, parseISO } from 'date-fns';
import { useAppStore } from '../../store/useAppStore';
import { USERS, GROUPS, SPORT_CONFIG, getGroupById } from '../../data/mockData';
import { Avatar, Button, StatCard, SportOrb, SectionHeader } from '../../components/ui';
import { FadeUp } from '../../components/motion';
import { CreateEventSheet } from '../../components/events/CreateEventSheet';
import type { Event } from '../../data/types';

// =============================================
// COUNTDOWN HOOK
// =============================================
const useCountdown = (targetDate: string, targetTime: string) => {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const target = new Date(`${targetDate}T${targetTime}:00`);
    const update = () => {
      const diff = differenceInSeconds(target, new Date());
      if (diff <= 0) { setT({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setT({ days: Math.floor(diff / 86400), hours: Math.floor((diff % 86400) / 3600), minutes: Math.floor((diff % 3600) / 60), seconds: diff % 60 });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate, targetTime]);
  return t;
};

// =============================================
// HERO EVENT CARD — next event in a group
// =============================================
const GroupEventCard: React.FC<{
  event: Event;
  groupId: string;
  isHero?: boolean;
}> = ({ event, groupId, isHero = false }) => {
  const navigate = useNavigate();
  const currentUserId = useAppStore(s => s.currentUserId);
  const countdown = useCountdown(event.date, event.time);
  const cfg = SPORT_CONFIG[event.sport];
  const group = getGroupById(groupId);
  const myStatus = event.attendance.find(a => a.userId === currentUserId)?.status;

  if (isHero) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[2rem] cursor-pointer"
        style={{
          background: 'linear-gradient(145deg, #1a1000 0%, #0f0a00 60%, #0a0800 100%)',
          border: '1px solid rgba(249,115,22,0.2)',
          boxShadow: '0 8px 40px rgba(249,115,22,0.12)',
        }}
        onClick={() => navigate(`/events/${event.id}`)}
        whileHover={{ scale: 1.008 }}
        whileTap={{ scale: 0.995 }}
      >
        {/* Amber glow floor */}
        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center bottom, rgba(249,115,22,0.3) 0%, transparent 70%)' }} />

        {/* Cover image tint */}
        <div className="absolute inset-0 opacity-15">
          <img src={event.coverImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, #0f0a00)' }} />
        </div>

        <div className="relative p-5 space-y-4">
          {/* Group breadcrumb + live dot */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">{group?.logo}</span>
              <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>{group?.name}</span>
              {event.isRecurring && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.2)', color: '#00ff41' }}>
                  🔄 {event.recurringPattern}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {event.weather.icon} {event.weather.temp}°
            </div>
          </div>

          {/* Sport + title */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}30` }}>
              {cfg.emoji}
            </div>
            <div className="flex-1">
              <h2 className="font-display font-black text-xl text-white leading-tight">{event.title}</h2>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                📍 {event.venue} · {event.status === 'live' ? '🔴 Now' : `${format(parseISO(event.date), 'EEE, MMM d')} · ${event.time}`}
              </p>
            </div>
          </div>

          {/* Countdown / Live indicator */}
          {event.status === 'live' ? (
            <div className="rounded-2xl p-3.5 flex items-center justify-center gap-3"
              style={{ background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.2)' }}>
              <span className="w-3 h-3 rounded-full" style={{ background: '#00ff41', boxShadow: '0 0 12px #00ff41', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div className="text-center">
                <p className="font-display font-black text-lg text-[#00ff41]">Live Now</p>
                <p className="text-xs" style={{ color: 'rgba(0,255,65,0.5)' }}>Happening right now · {event.venue}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-3.5" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>⏳ STARTS IN</p>
              <div className="flex gap-3">
                {[
                  { val: countdown.days,    label: 'Days' },
                  { val: countdown.hours,   label: 'Hrs' },
                  { val: countdown.minutes, label: 'Min' },
                  { val: countdown.seconds, label: 'Sec' },
                ].map(({ val, label }) => (
                  <div key={label} className="flex-1 text-center">
                    <AnimatePresence mode="wait">
                      <motion.p key={val}
                        initial={{ y: -6, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 6, opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        className="font-display font-black text-3xl text-white leading-none"
                        style={{ textShadow: '0 0 20px rgba(249,115,22,0.5)' }}>
                        {String(val).padStart(2, '0')}
                      </motion.p>
                    </AnimatePresence>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attendance status */}
          <div onClick={e => e.stopPropagation()} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {myStatus ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                  style={{ background: 'rgba(0,255,65,0.12)', border: '1px solid rgba(0,255,65,0.25)', color: '#00ff41' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00ff41', boxShadow: '0 0 6px #00ff41' }} />
                  Answered
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-xl text-xs font-semibold border"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}>
                  Not answered
                </span>
              )}
            </div>
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {event.attendance.filter(a => a.status === 'coming').length} going
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // --- compact secondary card ---
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-colors"
      style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}
      onClick={() => navigate(`/events/${event.id}`)}
      whileHover={{ scale: 1.01, borderColor: `${cfg.color}30` }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Color strip */}
      <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ background: cfg.color }} />

      <SportOrb emoji={cfg.emoji} color={cfg.color} bg={cfg.bg} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>{group?.logo} {group?.name}</span>
        </div>
        <p className="font-bold text-white text-sm truncate">{event.title}</p>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {event.status === 'live' ? '🔴 Today · Now' : `${format(parseISO(event.date), 'EEE, MMM d')} · ${event.time}`} · {event.venue}
        </p>
      </div>

      <div className="text-right flex-shrink-0 flex items-center gap-2">
        {myStatus ? (
          <span className="text-xs">{myStatus === 'coming' ? '✅' : '❌'}</span>
        ) : (
          <span className="text-[10px] text-white/30">—</span>
        )}
        {event.status === 'live' ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl" style={{ background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.2)' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: '#00ff41', boxShadow: '0 0 6px #00ff41' }} />
            <span className="text-xs font-bold text-[#00ff41]">LIVE</span>
          </div>
        ) : (
          <div>
            <p className="font-display font-bold text-lg text-white leading-none">
              {String(countdown.days).padStart(2, '0')}
            </p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>days</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// =============================================
// HOME PAGE
// =============================================
export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const currentUserId = useAppStore(s => s.currentUserId);
  const getMyGroupsNextEvents = useAppStore(s => s.getMyGroupsNextEvents);
  const [showCreate, setShowCreate] = useState(false);

  const currentUser = USERS.find(u => u.id === currentUserId);
  if (!currentUser) return <div className="min-h-screen flex items-center justify-center"><p className="text-white/50">Loading...</p></div>;
  const myGroupEvents = getMyGroupsNextEvents();
  const [heroEntry, ...moreEntries] = myGroupEvents;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '🌅 Good morning' : hour < 17 ? '☀️ Good afternoon' : '🌙 Good evening';

  return (
    <div className="pb-24 space-y-5 max-w-lg mx-auto px-4 pt-4">

      {/* Greeting */}
      <FadeUp>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{greeting}</p>
            <h1 className="font-display font-black text-2xl text-white" style={{ letterSpacing: '-0.01em' }}>
              {currentUser.name.split(' ')[0]} 👋
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.2)', color: '#00ff41' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00ff41', boxShadow: '0 0 6px #00ff41' }} />
              Lv.{currentUser.level}
            </div>
            <Avatar src={currentUser.avatar} name={currentUser.name} size="md" ring />
          </div>
        </div>
      </FadeUp>

      {/* QUICK STATS */}
      <FadeUp delay={0.06}>
        <div className="grid grid-cols-4 gap-2">
          <StatCard icon="🔥" label="Streak" value={currentUser.stats.currentStreak} color="#00ff41" />
          <StatCard icon="🏆" label="Wins" value={currentUser.stats.wins} color="#f59e0b" />
          <StatCard icon="📅" label="Events" value={myGroupEvents.length} color="#22c55e" />
          <StatCard icon="📊" label="Win %" value={`${currentUser.stats.winRate}%`} color="#06b6d4" />
        </div>
      </FadeUp>

      {/* SECTION: MY GROUPS EVENTS */}
      <FadeUp delay={0.1}>
        <SectionHeader
          title="Weekend Schedule"
          subtitle="Latest event from each of your groups"
          action={
            <motion.button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{ background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.25)', color: '#00ff41' }}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            >
              + New Event
            </motion.button>
          }
          className="mb-3"
        />
      </FadeUp>

      {myGroupEvents.length === 0 ? (
        <FadeUp delay={0.12}>
          <div className="rounded-3xl p-8 text-center" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-5xl mb-3">📅</p>
            <p className="font-display font-bold text-white mb-1">No upcoming events</p>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>Create an event in one of your groups to get started</p>
            <Button variant="lime" onClick={() => setShowCreate(true)}>Create First Event</Button>
          </div>
        </FadeUp>
      ) : (
        <div className="space-y-3">
          {/* HERO: first/soonest event across all groups */}
          {heroEntry && (
            <FadeUp delay={0.12}>
              <GroupEventCard event={heroEntry.event} groupId={heroEntry.groupId} isHero />
            </FadeUp>
          )}

          {/* Remaining group events — compact */}
          {moreEntries.length > 0 && (
            <FadeUp delay={0.18}>
              <div className="space-y-2">
                {moreEntries.map(({ event, groupId }) => (
                  <GroupEventCard key={event.id} event={event} groupId={groupId} isHero={false} />
                ))}
              </div>
            </FadeUp>
          )}
        </div>
      )}

      {/* GROUPS OVERVIEW */}
      <FadeUp delay={0.24}>
        <SectionHeader
          title="My Groups"
          action={<Button variant="ghost" size="sm" onClick={() => navigate('/groups')}>View all →</Button>}
          className="mb-3"
        />
        <div className="flex gap-3 overflow-x-auto scrollbar-hidden pb-1">
          {GROUPS.filter(g => g.members.some(m => m.userId === currentUserId)).map(group => {
            const nextEvent = myGroupEvents.find(e => e.groupId === group.id);
            return (
              <motion.div key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
                className="flex-shrink-0 w-[160px] rounded-2xl overflow-hidden cursor-pointer"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                {/* Group banner */}
                <div className="h-20 relative overflow-hidden">
                  <img src={group.banner} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, #111)' }} />
                  <span className="absolute top-2 left-2 text-xl">{group.logo}</span>
                  {nextEvent && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full pulse-lime"
                      style={{ background: '#00ff41' }} />
                  )}
                </div>
                <div className="p-3" style={{ background: '#111' }}>
                  <p className="font-bold text-white text-sm truncate">{group.name}</p>
                  <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {nextEvent
                      ? (nextEvent.event.status === 'live' ? '🔴 Live Now' : `📅 ${format(parseISO(nextEvent.event.date), 'MMM d')}`)
                      : `${group.memberCount} members`}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {/* Create group card */}
          <motion.div
            onClick={() => navigate('/groups')}
            className="flex-shrink-0 w-[160px] rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer"
            style={{ border: '1px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', minHeight: 120 }}
            whileHover={{ scale: 1.03, borderColor: 'rgba(0,255,65,0.3)' }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.2)' }}>+</span>
            <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>New Group</p>
          </motion.div>
        </div>
      </FadeUp>

      {/* WEEKLY ACTIVITY */}
      <FadeUp delay={0.35}>
        <SectionHeader title="Weekly Activity" className="mb-3" />
        <div className="rounded-3xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-end gap-2 h-16">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
              const val = currentUser.stats.weeklyActivity[i];
              const max = Math.max(...currentUser.stats.weeklyActivity);
              const height = max > 0 ? (val / max) * 100 : 8;
              const isToday = i === ((new Date().getDay() + 6) % 7);
              return (
                <div key={day + i} className="flex-1 flex flex-col items-center gap-1.5">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: i * 0.04 + 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full rounded-t-lg min-h-[4px]"
                    style={{
                      background: isToday ? '#00ff41' : 'rgba(0,255,65,0.18)',
                      boxShadow: isToday ? '0 0 8px rgba(0,255,65,0.5)' : 'none',
                    }}
                  />
                  <span className="text-[10px] font-medium"
                    style={{ color: isToday ? '#00ff41' : 'rgba(255,255,255,0.25)' }}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </FadeUp>

      {/* Create Event Sheet */}
      <CreateEventSheet isOpen={showCreate} onClose={() => setShowCreate(false)} initialMode="live" />
    </div>
  );
 };
