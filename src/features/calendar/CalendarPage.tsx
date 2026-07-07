import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek,
  addMonths, subMonths, parseISO, addWeeks, subWeeks,
} from 'date-fns';
import { useAppStore } from '../../store/useAppStore';
import { SPORT_CONFIG } from '../../data/mockData';
import { Card, SportOrb, Badge, Chip, Button } from '../../components/ui';
import { CreateEventSheet } from '../../components/events/CreateEventSheet';
import { FadeUp } from '../../components/motion';
import { clsx } from 'clsx';

const VIEWS = ['Month', 'Week', 'Agenda'] as const;
type View = typeof VIEWS[number];

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const events = useAppStore(s => s.events);
  const currentUserId = useAppStore(s => s.currentUserId);
  const [view, setView] = useState<View>('Month');
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const groups = useAppStore(s => s.groups);

  const isGroupAdmin = groups.some(g =>
    g.members.some(m => m.userId === currentUserId && (m.role === 'creator' || m.role === 'admin'))
  );

  const getEventsForDate = (date: Date) =>
    events.filter(e => isSameDay(parseISO(e.date), date));

  // ---- MONTH VIEW ----
  const MonthView = () => {
    const monthStart = startOfMonth(current);
    const monthEnd = endOfMonth(current);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calStart, end: calEnd });
    const selectedEvents = selected ? getEventsForDate(selected) : [];

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrent(subMonths(current, 1))}
            className="glass w-9 h-9 rounded-xl flex items-center justify-center text-white"
          >←</motion.button>
          <h2 className="font-display font-bold text-white text-lg">
            {format(current, 'MMMM yyyy')}
          </h2>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrent(addMonths(current, 1))}
            className="glass w-9 h-9 rounded-xl flex items-center justify-center text-white"
          >→</motion.button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 mb-1">
          {['M','T','W','T','F','S','S'].map((d, i) => (
            <div key={d + i} className="text-center text-xs text-white/40 font-semibold py-1">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, current);
            const isTodayDay = isToday(day);
            const isSelected = selected && isSameDay(day, selected);
            return (
              <motion.button
                key={day.toISOString()}
                onClick={() => setSelected(isSelected ? null : day)}
                whileTap={{ scale: 0.9 }}
                className={clsx(
                  'relative aspect-square flex flex-col items-center justify-center rounded-2xl text-sm font-semibold transition-all',
                  !isCurrentMonth && 'opacity-25',
                  isTodayDay && !isSelected && 'border border-violet-500/60 text-violet-300',
                  isSelected && 'bg-violet-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]',
                  !isSelected && isCurrentMonth && 'text-white/80 hover:bg-white/10',
                  !isSelected && !isCurrentMonth && 'text-white/30'
                )}
              >
                {format(day, 'd')}
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map((e, i) => {
                      const cfg = SPORT_CONFIG[e.sport];
                      return (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: isSelected ? 'white' : cfg.color }}
                        />
                      );
                    })}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Selected day events */}
        <AnimatePresence>
          {selected ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-white/60 text-xs font-semibold">
                    {format(selected, 'EEEE, MMMM d')}
                  </p>
                  {isGroupAdmin && (
                    <Button variant="lime" size="sm" onClick={() => { setShowCreate(true); }}>
                      + Schedule Event
                    </Button>
                  )}
                </div>
                {selectedEvents.length === 0 ? (
                  <div className="glass rounded-2xl p-4 text-center">
                    <p className="text-white/40 text-sm">No events this day</p>
                    {!isGroupAdmin && <p className="text-2xl mt-1">📅</p>}
                    {isGroupAdmin && (
                      <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Select a date to schedule an event</p>
                    )}
                  </div>
                ) : (
                  selectedEvents.map(event => {
                    const cfg = SPORT_CONFIG[event.sport];
                    const confirmed = event.attendance.filter(a => a.status === 'coming').length;
                    const myStatus = event.attendance.find(a => a.userId === currentUserId)?.status;
                    return (
                      <Card key={event.id} interactive padding="md" onClick={() => navigate(`/events/${event.id}`)}>
                        <div className="flex items-center gap-3">
                          <SportOrb emoji={cfg.emoji} color={cfg.color} bg={cfg.bg} size="sm" />
                          <div className="flex-1">
                            <p className="font-bold text-white text-sm">{event.title}</p>
                            <p className="text-white/50 text-xs">{event.time} · {confirmed} going</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {myStatus && <span className="text-xs">{myStatus === 'coming' ? '✅' : '❌'}</span>}
                            <Badge variant={event.status === 'upcoming' ? 'blue' : 'glass'} size="sm">
                              {event.status}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-2xl p-4 text-center"
            >
              <p className="text-white/40 text-sm">Select a date to schedule an event</p>
              <p className="text-2xl mt-1">📅</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ---- WEEK VIEW ----
  const WeekView = () => {
    const weekStart = startOfWeek(current, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(current, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCurrent(subWeeks(current, 1))}
            className="glass w-9 h-9 rounded-xl flex items-center justify-center text-white">←</motion.button>
          <p className="text-white font-semibold text-sm">
            {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d')}
          </p>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCurrent(addWeeks(current, 1))}
            className="glass w-9 h-9 rounded-xl flex items-center justify-center text-white">→</motion.button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const dayEvents = getEventsForDate(day);
            return (
              <div key={day.toISOString()} className={clsx(
                'text-center rounded-2xl p-2',
                isToday(day) && 'bg-violet-600/20 border border-violet-500/40'
              )}>
                <p className="text-white/40 text-[10px]">{format(day, 'EEE')}</p>
                <p className={clsx('font-bold text-sm', isToday(day) ? 'text-violet-300' : 'text-white')}>
                  {format(day, 'd')}
                </p>
                {dayEvents.length > 0 && (
                  <div className="flex justify-center gap-0.5 mt-1">
                    {dayEvents.slice(0, 2).map((e, i) => (
                      <span key={i} className="w-1 h-1 rounded-full" style={{ background: SPORT_CONFIG[e.sport].color }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Events list for week */}
        <div className="space-y-2">
          {days.flatMap(day => getEventsForDate(day).map(e => ({ ...e, _day: day }))).map(event => {
            const cfg = SPORT_CONFIG[event.sport];
            const myStatus = event.attendance.find(a => a.userId === currentUserId)?.status;
            return (
              <Card key={event.id} interactive padding="sm" onClick={() => navigate(`/events/${event.id}`)}>
                <div className="flex items-center gap-3">
                  <SportOrb emoji={cfg.emoji} color={cfg.color} bg={cfg.bg} size="sm" />
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm">{event.title}</p>
                    <p className="text-white/50 text-xs">{format(event._day, 'EEE, MMM d')} · {event.time}</p>
                  </div>
                  {myStatus && (
                    <span className="text-xs">{myStatus === 'coming' ? '✅' : '❌'}</span>
                  )}
                </div>
              </Card>
            );
          })}
          {days.flatMap(day => getEventsForDate(day)).length === 0 && (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-3xl mb-2">🏖️</p>
              <p className="text-white/40">No events this week</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ---- AGENDA VIEW ----
  const AgendaView = () => {
    const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
    const upcoming = sorted.filter(e => e.status === 'upcoming');
    const completed = sorted.filter(e => e.status === 'completed');

    return (
      <div className="space-y-5">
        <div>
          <p className="text-white/50 text-xs font-semibold mb-3">⚡ UPCOMING</p>
          <div className="space-y-3">
            {upcoming.map(event => {
              const cfg = SPORT_CONFIG[event.sport];
              const confirmed = event.attendance.filter(a => a.status === 'coming').length;
              const myStatus = event.attendance.find(a => a.userId === currentUserId)?.status;
              return (
                <Card key={event.id} interactive padding="none" onClick={() => navigate(`/events/${event.id}`)}>
                  <div className="flex">
                    <div
                      className="w-2 flex-shrink-0 rounded-l-3xl"
                      style={{ background: `linear-gradient(180deg, ${cfg.color}, ${cfg.color}80)` }}
                    />
                    <div className="p-4 flex items-center gap-3 flex-1">
                      <div className="text-center min-w-[40px]">
                        <p className="font-display font-black text-lg text-white leading-none">
                          {format(parseISO(event.date), 'd')}
                        </p>
                        <p className="text-white/40 text-[10px] uppercase">{format(parseISO(event.date), 'MMM')}</p>
                      </div>
                      <div className="w-px h-10 bg-white/10" />
                      <SportOrb emoji={cfg.emoji} color={cfg.color} bg={cfg.bg} size="sm" />
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm">{event.title}</p>
                        <p className="text-white/50 text-xs">{event.time} · {confirmed} going · {event.venue}</p>
                      </div>
                      {myStatus && (
                        <span className="text-xs">{myStatus === 'coming' ? '✅' : '❌'}</span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {completed.length > 0 && (
          <div>
            <p className="text-white/50 text-xs font-semibold mb-3">✓ PAST EVENTS</p>
            <div className="space-y-2 opacity-60">
              {completed.map(event => {
                const cfg = SPORT_CONFIG[event.sport];
                return (
                  <Card key={event.id} interactive padding="sm" onClick={() => navigate(`/events/${event.id}`)}>
                    <div className="flex items-center gap-3">
                      <SportOrb emoji={cfg.emoji} color={cfg.color} bg={cfg.bg} size="sm" />
                      <div>
                        <p className="font-semibold text-white text-sm">{event.title}</p>
                        <p className="text-white/40 text-xs">{format(parseISO(event.date), 'MMM d')}</p>
                      </div>
                      <Badge variant="glass" size="sm" className="ml-auto">Done</Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page-container !pb-24 space-y-4">
      <FadeUp>
        <h1 className="font-display font-black text-2xl text-white">Calendar</h1>
        <p className="text-white/50 text-sm">Your weekend schedule</p>
      </FadeUp>

      <FadeUp delay={0.05}>
        <div className="flex gap-2 flex-wrap">
          {VIEWS.map(v => (
            <Chip key={v} label={v} active={view === v} onClick={() => setView(v)} />
          ))}
          <Chip label="Today" onClick={() => setCurrent(new Date())} />
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {view === 'Month' && <MonthView />}
            {view === 'Week' && <WeekView />}
            {view === 'Agenda' && <AgendaView />}
          </motion.div>
        </AnimatePresence>
      </FadeUp>

      <CreateEventSheet
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        preselectedDate={selected ? format(selected, 'yyyy-MM-dd') : undefined}
      />
    </div>
  );
};
