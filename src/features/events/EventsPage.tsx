import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { useAppStore } from '../../store/useAppStore';
import { SPORT_CONFIG, getUserById, getGroupById } from '../../data/mockData';
import { Card, Avatar, Badge, Button, SportOrb, SectionHeader, Chip } from '../../components/ui';
import { StaggerList, StaggerItem, FadeUp } from '../../components/motion';
import { ImageLightbox } from '../../components/media/ImageLightbox';
import type { AttendanceStatus } from '../../data/types';

const ATTENDANCE_OPTIONS: { status: AttendanceStatus; label: string; emoji: string; color: string }[] = [
  { status: 'coming',      label: 'Coming',     emoji: '✅', color: '#22c55e' },
  { status: 'not_coming',  label: 'Can\'t Make It', emoji: '❌', color: '#ef4444' },
];

// =============================================
// EVENT DETAIL
// =============================================
export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const events = useAppStore(s => s.events);
  const updateAttendance = useAppStore(s => s.updateAttendance);
  const uploadEventImage = useAppStore(s => s.uploadEventImage);
  const currentUserId = useAppStore(s => s.currentUserId);
  const [galleryIdx, setGalleryIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const event = events.find(e => e.id === id);
  if (!event) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-white/60">Event not found</p>
        <Button onClick={() => navigate('/home')} className="mt-4">Go home</Button>
      </div>
    </div>
  );

  const sportCfg = SPORT_CONFIG[event.sport];
  const myAttendance = event.attendance.find(a => a.userId === currentUserId);
  const organizer = getUserById(event.organizer);
  const confirmed = event.attendance.filter(a => a.status === 'coming');
  const notComing = event.attendance.filter(a => a.status === 'not_coming');

  const attendanceGroups = [
    { label: 'Coming', emoji: '✅', items: confirmed, color: '#22c55e' },
    { label: "Can't", emoji: '❌', items: notComing, color: '#ef4444' },
  ];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || event.gallery.length >= 10) return;
    const url = URL.createObjectURL(file);
    uploadEventImage(event.id, url);
  };

  return (
    <div className="pb-32 max-w-lg mx-auto">
      {/* Cover */}
      <div
        className="relative h-40 overflow-hidden rounded-b-3xl"
        style={{
          backgroundImage: `linear-gradient(to top, #080808 0%, #080808 20%, transparent 60%), url(${event.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 glass w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg z-10"
        >
          ←
        </button>
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          {event.status === 'completed'
            ? <Badge variant="glass">✓ Completed</Badge>
            : <Badge variant="green" dot>Upcoming</Badge>
          }
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Header */}
        <FadeUp>
          <Card padding="md">
            <div className="flex items-start gap-3">
              <SportOrb emoji={sportCfg.emoji} color={sportCfg.color} bg={sportCfg.bg} size="md" />
              <div className="flex-1">
                <h1 className="font-display font-black text-xl text-white leading-tight">{event.title}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  <p className="text-white/60 text-sm">📅 {format(parseISO(event.date), 'EEEE, MMM d')}</p>
                  <p className="text-white/60 text-sm">⏰ {event.time} – {event.endTime}</p>
                  <p className="text-white/60 text-sm">📍 {event.venue}</p>
                  <p className="text-white/60 text-sm">👤 {organizer?.name}</p>
                  <p className="text-white/60 text-sm">{event.weather.icon} {event.weather.temp}° · {event.weather.condition}</p>
                </div>
                {event.description && (
                  <p className="text-white/70 text-sm mt-3 leading-relaxed">{event.description}</p>
                )}
              </div>
            </div>
          </Card>
        </FadeUp>

        {/* Announcements */}
        {event.announcements.length > 0 && (
          <FadeUp delay={0.05}>
            <SectionHeader title="📢 Announcements" className="mb-2" />
            <div className="space-y-2">
              {event.announcements.map(ann => {
                const author = getUserById(ann.authorId);
                return (
                  <Card key={ann.id} padding="sm">
                    <div className="flex gap-2">
                      <Avatar src={author?.avatar} name={author?.name || '?'} size="sm" />
                      <div>
                        <p className="text-white/60 text-xs mb-1">{author?.name} · {format(parseISO(ann.createdAt), 'MMM d, h:mm a')}</p>
                        <p className="text-white/90 text-sm">{ann.content}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </FadeUp>
        )}

        {/* ATTENDANCE */}
        <FadeUp delay={0.1}>
          <SectionHeader title="Attendance" subtitle={`${confirmed.length}/${event.maxSlots} spots filled`} className="mb-3" />
          
          {/* Progress bar */}
          <div className="glass rounded-2xl p-3 mb-3">
            <div className="flex justify-between text-xs text-white/50 mb-2">
              <span>{confirmed.length} confirmed</span>
              <span>{event.maxSlots - confirmed.length} slots left</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(confirmed.length / event.maxSlots) * 100}%` }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="h-full bg-gradient-to-r from-violet-600 to-pink-500 rounded-full"
              />
            </div>
          </div>

          {/* Vote buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {ATTENDANCE_OPTIONS.map(opt => (
              <motion.button
                key={opt.status}
                onClick={() => currentUserId && updateAttendance(event.id, currentUserId, opt.status)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all border ${
                  myAttendance?.status === opt.status
                    ? 'text-white'
                    : 'glass border-white/20 text-white/60 hover:text-white'
                }`}
                style={myAttendance?.status === opt.status ? {
                  background: `${opt.color}25`,
                  borderColor: opt.color,
                  boxShadow: `0 0 20px ${opt.color}35`,
                } : {}}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-lg">{opt.emoji}</span>
                {opt.label}
              </motion.button>
            ))}
          </div>

          {/* Attendance groups */}
          <div className="space-y-3">
            {attendanceGroups.filter(g => g.items.length > 0).map(group => (
              <div key={group.label}>
                <p className="text-xs font-semibold text-white/40 mb-2 flex items-center gap-1.5">
                  <span>{group.emoji}</span>
                  {group.label}
                  <span className="glass rounded-full px-2 py-0.5 text-white/60">{group.items.length}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map(record => {
                    const user = getUserById(record.userId);
                    if (!user) return null;
                    return (
                      <div key={record.userId} className="flex items-center gap-2 glass rounded-2xl px-3 py-1.5">
                        <Avatar src={user.avatar} name={user.name} size="xs" />
                        <span className="text-white/80 text-xs font-medium">{user.name.split(' ')[0]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </FadeUp>

        {/* LEAGUES / SCORES */}
        {event.leagues.length > 0 && (
          <FadeUp delay={0.15}>
            <SectionHeader title="🏟️ Leagues & Scores" className="mb-3" />
            {event.leagues.map(league => {
              const participantCount = new Set(league.players).size;
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
                    const bestTeamId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
                    const bestTeam = league.teams.find(t => t.id === bestTeamId);
                    return bestTeam ? getPlayerNames(bestTeam.playerIds) : null;
                  })()
                : null;

              return (
                <Card key={league.id} padding="md" className="mb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-display font-bold text-white">{league.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-white/40 text-xs">👤 {participantCount} participants</span>
                        <span className="text-white/40 text-xs">·</span>
                        <span className="text-white/40 text-xs">🏸 {formatLabel}</span>
                      </div>
                    </div>
                    <Badge variant={league.status === 'completed' ? 'green' : league.status === 'ongoing' ? 'blue' : 'glass'}>
                      {league.status}
                    </Badge>
                  </div>

                  {/* League Winner */}
                  {league.status === 'completed' && leagueWinners && (
                    <div className="rounded-xl p-2.5 mb-3 text-center text-sm font-bold" style={{ background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.25)', color: '#00ff41' }}>
                      🏆 Winners: {leagueWinners}
                    </div>
                  )}

                  {/* Matches */}
                  <div className="space-y-2">
                    {league.matches.map(match => {
                      const t1 = league.teams.find(t => t.id === match.team1Id);
                      const t2 = league.teams.find(t => t.id === match.team2Id);
                      const p1 = t1 ? getPlayerNames(t1.playerIds) : '?';
                      const p2 = t2 ? getPlayerNames(t2.playerIds) : '?';
                      const isWin1 = match.winnerId === t1?.id;
                      const isWin2 = match.winnerId === t2?.id;
                      return (
                        <div key={match.id} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <div className="flex items-center gap-2">
                            <span className={`flex-1 text-sm font-bold text-right ${isWin1 ? 'text-green-400' : 'text-white/70'}`}>{p1}</span>
                            <span className="font-display font-black text-white text-xl px-2">{match.score1}—{match.score2}</span>
                            <span className={`flex-1 text-sm font-bold ${isWin2 ? 'text-green-400' : 'text-white/70'}`}>{p2}</span>
                          </div>
                          {isWin1 && <p className="text-center text-green-400/60 text-xs mt-1">🏆 {p1} win</p>}
                          {isWin2 && <p className="text-center text-green-400/60 text-xs mt-1">🏆 {p2} win</p>}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </FadeUp>
        )}

        {/* GALLERY */}
        <FadeUp delay={0.2}>
          <SectionHeader
            title="📸 Gallery"
            action={
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/30">{event.gallery.length}/10</span>
                {event.gallery.length < 10 && (
                  <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>+ Add</Button>
                )}
              </div>
            }
            className="mb-3"
          />
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          {event.gallery.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {event.gallery.map((img, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square rounded-2xl overflow-hidden cursor-pointer"
                  onClick={() => setGalleryIdx(i)}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-white/30 text-xs">No photos yet</p>
            </div>
          )}
        </FadeUp>

        {galleryIdx !== null && (
          <ImageLightbox
            images={event.gallery}
            initialIndex={galleryIdx}
            onClose={() => setGalleryIdx(null)}
          />
        )}
      </div>
    </div>
  );
};

// =============================================
// EVENTS LIST PAGE
// =============================================
export const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const events = useAppStore(s => s.events);
  const currentUserId = useAppStore(s => s.currentUserId);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');

  const user = currentUserId ? getUserById(currentUserId) : null;
  const myGroupIds = user ? [...user.createdGroups, ...user.joinedGroups] : [];

  const filtered = events
    .filter(e => myGroupIds.includes(e.groupId))
    .filter(e => filter === 'all' || e.status === filter)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="pb-24 max-w-lg mx-auto px-4 pt-4 space-y-4">
      <FadeUp>
        <h1 className="font-display font-black text-2xl text-white">Events</h1>
        <p className="text-white/50 text-sm">All upcoming and past sessions</p>
      </FadeUp>

      <FadeUp delay={0.05}>
        <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-1">
          {(['upcoming', 'all', 'completed'] as const).map(f => (
            <Chip key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} active={filter === f} onClick={() => setFilter(f)} />
          ))}
        </div>
      </FadeUp>

      <StaggerList className="space-y-3">
        {filtered.map(event => {
          const cfg = SPORT_CONFIG[event.sport];
          const confirmed = event.attendance.filter(a => a.status === 'coming').length;
          return (
            <StaggerItem key={event.id}>
              <Card interactive padding="none" onClick={() => navigate(`/events/${event.id}`)}>
                <div className="relative h-36 overflow-hidden">
                  <img src={event.coverImage} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a1e] via-[#0f0a1e]/30 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant={event.status === 'upcoming' ? 'blue' : 'glass'}>
                      {event.status === 'upcoming' ? '⚡ Upcoming' : '✓ Done'}
                    </Badge>
                    {event.isRecurring && <Badge variant="glass">🔁</Badge>}
                    {(() => { const g = getGroupById(event.groupId); return g ? <Badge variant="glass">{g.logo} {g.name}</Badge> : null; })()}
                  </div>
                  <div className="absolute top-3 right-3 glass rounded-xl px-2 py-1 text-xs text-white">
                    {event.weather.icon} {event.weather.temp}°
                  </div>
                </div>
                <div className="p-4 flex items-start gap-3">
                  <SportOrb emoji={cfg.emoji} color={cfg.color} bg={cfg.bg} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-white truncate">{event.title}</p>
                    <p className="text-white/50 text-xs mt-0.5">
                      {format(parseISO(event.date), 'EEE, MMM d')} · {event.time}
                    </p>
                    <p className="text-white/50 text-xs">📍 {event.venue}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex -space-x-1.5">
                        {event.attendance.filter(a => a.status === 'coming').slice(0, 3).map(a => {
                          const u = getUserById(a.userId);
                          return u ? <Avatar key={a.userId} src={u.avatar} name={u.name} size="xs" /> : null;
                        })}
                      </div>
                      <span className="text-white/40 text-xs">{confirmed} going · {event.maxSlots - confirmed} slots left</span>
                    </div>
                  </div>
                </div>
              </Card>
            </StaggerItem>
          );
        })}
      </StaggerList>
    </div>
  );
};
