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
  const createLeague = useAppStore(s => s.createLeague);
  const addMatch = useAppStore(s => s.addMatch);
  const updateMatchScore = useAppStore(s => s.updateMatchScore);
  const [galleryIdx, setGalleryIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [showLeagueSetup, setShowLeagueSetup] = useState(false);
  const [leagueName, setLeagueName] = useState('');
  const [leagueFormat, setLeagueFormat] = useState<'single' | 'doubles'>('doubles');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [editingScore, setEditingScore] = useState<{ leagueId: string; matchId: string; s1: string; s2: string } | null>(null);

  const event = events.find(e => e.id === id);
  const groups = useAppStore(s => s.groups);
  const group = event ? groups.find(g => g.id === event.groupId) : null;
  const groupMember = group ? group.members.find(m => m.userId === currentUserId) : null;
  const isEventAdmin = event && (
    event.organizer === currentUserId ||
    groupMember?.role === 'creator' ||
    groupMember?.role === 'admin'
  );
  const isEditable = isEventAdmin && (event.status === 'upcoming' || event.status === 'live');
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
          {event.status === 'live'
            ? <Badge variant="lime" dot>🔴 Live</Badge>
            : event.status === 'completed'
            ? <Badge variant="glass">✓ History</Badge>
            : <Badge variant="green" dot>Upcoming</Badge>
          }
          {isEditable && (
            <Badge variant="amber">✏️ Edit</Badge>
          )}
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
          <SectionHeader title="Attendance" subtitle={`${confirmed.length} confirmed`} className="mb-3" />

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

        {/* ADMIN CONTROLS */}
        {isEditable && (
          <FadeUp delay={0.14}>
            <Card padding="md" className="space-y-3" variant="dark">
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider">🛠️ Admin</p>
              <div className="flex gap-2">
                {event.status === 'upcoming' && (
                  <Button variant="lime" size="sm" className="flex-1"
                    onClick={() => { useAppStore.getState().startEvent(event.id); }}>
                    ▶️ Start Now
                  </Button>
                )}
                {event.status === 'live' && (
                  <Button variant="amber" size="sm" className="flex-1"
                    onClick={() => { useAppStore.getState().completeEvent(event.id); }}>
                    ✅ End & Save
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="flex-1">
                  ✏️ Edit Details
                </Button>
              </div>
              {event.status === 'live' && (
                <Button variant="glass" size="sm" className="w-full"
                  onClick={() => { setShowLeagueSetup(v => !v); if (!showLeagueSetup) { setLeagueName(`${sportCfg.label} League`); setSelectedPlayers(event.attendance.filter(a => a.status === 'coming').map(a => a.userId)); } }}>
                  🏟️ {showLeagueSetup ? 'Cancel Setup' : (event.leagues.length > 0 ? '+ Add League' : 'Setup League')}
                </Button>
              )}

              {showLeagueSetup && event.status === 'live' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 overflow-hidden">
                  <input
                    value={leagueName}
                    onChange={e => setLeagueName(e.target.value)}
                    placeholder="League name"
                    className="w-full text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00ff41] transition-colors"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setLeagueFormat('single')}
                      className={`flex-1 text-xs font-bold py-2 rounded-xl border transition-all ${leagueFormat === 'single' ? 'border-[#00ff41] text-[#00ff41] bg-[#00ff41]/10' : 'border-white/10 text-white/50'}`}>
                      🏸 Singles
                    </button>
                    <button onClick={() => setLeagueFormat('doubles')}
                      className={`flex-1 text-xs font-bold py-2 rounded-xl border transition-all ${leagueFormat === 'doubles' ? 'border-[#00ff41] text-[#00ff41] bg-[#00ff41]/10' : 'border-white/10 text-white/50'}`}>
                      🏸 Doubles
                    </button>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-2">Select players ({selectedPlayers.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {event.attendance.filter(a => a.status === 'coming').map(a => {
                        const u = getUserById(a.userId);
                        if (!u) return null;
                        const sel = selectedPlayers.includes(a.userId);
                        return (
                          <button key={a.userId} onClick={() => { setSelectedPlayers(p => sel ? p.filter(x => x !== a.userId) : [...p, a.userId]); }}
                            className={`flex items-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-xl border transition-all ${sel ? 'border-[#00ff41] bg-[#00ff41]/10 text-[#00ff41]' : 'border-white/10 text-white/60'}`}>
                            <Avatar src={u.avatar} name={u.name} size="xs" /> {u.name.split(' ')[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <Button variant="lime" size="sm" className="w-full" disabled={!leagueName || selectedPlayers.length < 2 || (leagueFormat === 'doubles' && selectedPlayers.length < 4)}
                    onClick={() => {
                      const lid = createLeague({ eventId: event.id, name: leagueName, players: selectedPlayers, format: leagueFormat });
                      if (lid) { setShowLeagueSetup(false); }
                    }}>
                    Create League ({selectedPlayers.length} players, {leagueFormat})
                  </Button>
                </motion.div>
              )}
            </Card>
          </FadeUp>
        )}

        {/* LEAGUES / SCORES */}
        <FadeUp delay={0.15}>
          <SectionHeader title="🏟️ Leagues & Scores" className="mb-3" />
          {event.leagues.length === 0 ? (
            <Card padding="md" variant="dark">
              <p className="text-white/30 text-xs text-center">No leagues set up yet</p>
              {event.status === 'live' && isEventAdmin && (
                <Button variant="ghost" size="sm" className="w-full mt-2"
                  onClick={() => { setShowLeagueSetup(true); setLeagueName(`${sportCfg.label} League`); setSelectedPlayers(event.attendance.filter(a => a.status === 'coming').map(a => a.userId)); }}>
                  + Create League
                </Button>
              )}
            </Card>
          ) : (
            event.leagues.map(league => {
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

              const canScore = event.status === 'live' && isEventAdmin;

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
                      const isEditing = editingScore?.matchId === match.id;
                      return (
                        <div key={match.id} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-3 py-1">
                              <span className="text-sm font-bold text-white/70">{p1}</span>
                              <div className="flex items-center gap-2">
                                <input type="number" min="0" value={editingScore!.s1} onChange={e => setEditingScore(s => s ? { ...s, s1: e.target.value } : null)}
                                  className="w-14 text-center bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white font-bold text-lg outline-none focus:border-[#00ff41]" />
                                <span className="text-white/40 font-bold">—</span>
                                <input type="number" min="0" value={editingScore!.s2} onChange={e => setEditingScore(s => s ? { ...s, s2: e.target.value } : null)}
                                  className="w-14 text-center bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white font-bold text-lg outline-none focus:border-[#00ff41]" />
                              </div>
                              <span className="text-sm font-bold text-white/70">{p2}</span>
                              <button
                                onClick={() => {
                                  const s1v = parseInt(editingScore!.s1);
                                  const s2v = parseInt(editingScore!.s2);
                                  if (isNaN(s1v) || isNaN(s2v)) return;
                                  const wid = s1v > s2v ? t1?.id : (s2v > s1v ? t2?.id : null);
                                  updateMatchScore(event.id, league.id, match.id, s1v, s2v, wid || '');
                                  setEditingScore(null);
                                }}
                                className="text-xs font-bold text-[#00ff41] hover:underline">Save</button>
                              <button onClick={() => setEditingScore(null)}
                                className="text-xs text-white/40 hover:underline">Cancel</button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <span className={`flex-1 text-sm font-bold text-right ${isWin1 ? 'text-green-400' : 'text-white/70'}`}>{p1}</span>
                                <button onClick={() => canScore ? setEditingScore({ leagueId: league.id, matchId: match.id, s1: String(match.score1), s2: String(match.score2) }) : undefined}
                                  className={`font-display font-black text-xl px-2 ${canScore ? 'cursor-pointer hover:text-[#00ff41] transition-colors' : ''} ${match.winnerId ? 'text-white' : 'text-white/50'}`}>
                                  {match.score1}—{match.score2}
                                </button>
                                <span className={`flex-1 text-sm font-bold ${isWin2 ? 'text-green-400' : 'text-white/70'}`}>{p2}</span>
                              </div>
                              {isWin1 && <p className="text-center text-green-400/60 text-xs mt-1">🏆 {p1} win</p>}
                              {isWin2 && <p className="text-center text-green-400/60 text-xs mt-1">🏆 {p2} win</p>}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add match (for live events) */}
                  {canScore && league.teams.length >= 2 && (
                    <div className="mt-2">
                      {(() => {
                        const played = new Set<string>();
                        for (const m of league.matches) {
                          played.add([m.team1Id, m.team2Id].sort().join('|'));
                        }
                        const missing: { t1: any; t2: any }[] = [];
                        for (let i = 0; i < league.teams.length; i++) {
                          for (let j = i + 1; j < league.teams.length; j++) {
                            const key = [league.teams[i].id, league.teams[j].id].sort().join('|');
                            if (!played.has(key)) missing.push({ t1: league.teams[i], t2: league.teams[j] });
                          }
                        }
                        if (missing.length === 0) return null;
                        return (
                          <Button variant="ghost" size="sm" className="w-full mt-1"
                            onClick={() => addMatch({ leagueId: league.id, team1Id: missing[0].t1.id, team2Id: missing[0].t2.id })}>
                            + Add Match ({getPlayerNames(missing[0].t1.playerIds)} vs {getPlayerNames(missing[0].t2.playerIds)})
                          </Button>
                        );
                      })()}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </FadeUp>

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
                      <span className="text-white/40 text-xs">{confirmed} going</span>
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
