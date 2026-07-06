import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { useAppStore } from '../../store/useAppStore';
import { SPORT_CONFIG, getUserById, getGroupById } from '../../data/mockData';
import { Card, Avatar, Badge, Button, SportOrb, SectionHeader, Chip } from '../../components/ui';
import { StaggerList, StaggerItem, FadeUp } from '../../components/motion';
import { ImageLightbox } from '../../components/media/ImageLightbox';
import { CreateEventSheet } from '../../components/events/CreateEventSheet';
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
  const pauseEvent = useAppStore(s => s.pauseEvent);
  const resumeEvent = useAppStore(s => s.resumeEvent);
  const deleteMatch = useAppStore(s => s.deleteMatch);
  const deleteLeague = useAppStore(s => s.deleteLeague);
  const editEvent = useAppStore(s => s.editEvent);
  const updateEventSummary = useAppStore(s => s.updateEventSummary);
  const [galleryIdx, setGalleryIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [showLeagueSetup, setShowLeagueSetup] = useState(false);
  const [leagueName, setLeagueName] = useState('');
  const [leagueFormat, setLeagueFormat] = useState<'single' | 'doubles'>('doubles');
  const [editingScore, setEditingScore] = useState<{ leagueId: string; matchId: string; s1: string; s2: string } | null>(null);
  const [matchForm, setMatchForm] = useState<{ leagueId: string; side1: string[]; side2: string[]; score1: string; score2: string; name: string; isFinal: boolean } | null>(null);
  const [showEditDetails, setShowEditDetails] = useState(false);
  const [editFields, setEditFields] = useState({ title: '', date: '', time: '', endTime: '', venue: '', description: '' });
  const [summaryText, setSummaryText] = useState(event?.summary || '');
  const [confirmAction, setConfirmAction] = useState<{ label: string; onConfirm: () => void } | null>(null);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaWord, setCaptchaWord] = useState('');

  const generateCaptcha = useCallback(() => {
    const chars = 'abcdefghjklmnpqrstuvwxyz23456789';
    let word = '';
    for (let i = 0; i < 5; i++) word += chars[Math.floor(Math.random() * chars.length)];
    setCaptchaWord(word);
    setCaptchaInput('');
  }, []);

  const promptConfirm = (label: string, onConfirm: () => void) => {
    generateCaptcha();
    setConfirmAction({ label, onConfirm });
  };

  const event = events.find(e => e.id === id);
  const groups = useAppStore(s => s.groups);
  const group = event ? groups.find(g => g.id === event.groupId) : null;
  const groupMember = group ? group.members.find(m => m.userId === currentUserId) : null;
  const isEventAdmin = event && (
    event.organizer === currentUserId ||
    groupMember?.role === 'creator' ||
    groupMember?.role === 'admin'
  );
  const isEditable = isEventAdmin && (event.status === 'upcoming' || event.status === 'live' || event.status === 'paused');

  useEffect(() => {
    setSummaryText(event.summary || '');
  }, [event.id]);

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
            : event.status === 'paused'
            ? <Badge variant="amber" dot>⏸ Paused</Badge>
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
                onClick={() => { if (event.status === 'completed') return; currentUserId && updateAttendance(event.id, currentUserId, opt.status); }}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all border ${
                  event.status === 'completed'
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                } ${
                  myAttendance?.status === opt.status
                    ? 'text-white'
                    : 'glass border-white/20 text-white/60 hover:text-white'
                }`}
                disabled={event.status === 'completed'}
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
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Admin</p>
              <div className="flex gap-2 flex-wrap">
                {event.status === 'upcoming' && (
                  <Button variant="lime" size="sm" className="flex-1"
                    onClick={() => promptConfirm('Start Now', () => { useAppStore.getState().startEvent(event.id); })}>
                    Start Now
                  </Button>
                )}
                {event.status === 'live' && (
                  <>
                    <Button variant="lime" size="sm" className="flex-1"
                      onClick={() => editEvent(event.id, { title: event.title, date: event.date, time: event.time, endTime: event.endTime, venue: event.venue, description: event.description })}>
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1"
                      onClick={() => promptConfirm('Pause & Save', () => pauseEvent(event.id))}>
                      Pause & Save
                    </Button>
                    <Button variant="amber" size="sm" className="flex-1"
                      onClick={() => promptConfirm('End & Save', () => { useAppStore.getState().completeEvent(event.id); })}>
                      End & Save
                    </Button>
                  </>
                )}
                {event.status === 'paused' && (
                  <>
                    <Button variant="lime" size="sm" className="flex-1"
                      onClick={() => promptConfirm('Resume', () => resumeEvent(event.id))}>
                      Resume
                    </Button>
                    <Button variant="amber" size="sm" className="flex-1"
                      onClick={() => promptConfirm('End & Save', () => { useAppStore.getState().completeEvent(event.id); })}>
                      End & Save
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm" className="flex-1"
                  onClick={() => {
                    setEditFields({ title: event.title, date: event.date, time: event.time, endTime: event.endTime || '', venue: event.venue, description: event.description || '' });
                    setShowEditDetails(v => !v);
                  }}>
                  Edit Details
                </Button>
              </div>

              {showEditDetails && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 overflow-hidden">
                  <input value={editFields.title} onChange={e => setEditFields(f => ({ ...f, title: e.target.value }))} placeholder="Title"
                    className="w-full text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00ff41]" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={editFields.date} onChange={e => setEditFields(f => ({ ...f, date: e.target.value }))}
                      className="text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00ff41]" />
                    <input type="time" value={editFields.time} onChange={e => setEditFields(f => ({ ...f, time: e.target.value }))}
                      className="text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00ff41]" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={editFields.venue} onChange={e => setEditFields(f => ({ ...f, venue: e.target.value }))} placeholder="Venue"
                      className="text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00ff41]" />
                    <input type="time" value={editFields.endTime} onChange={e => setEditFields(f => ({ ...f, endTime: e.target.value }))}
                      className="text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00ff41]" />
                  </div>
                  <textarea value={editFields.description} onChange={e => setEditFields(f => ({ ...f, description: e.target.value }))} placeholder="Description" rows={2}
                    className="w-full text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00ff41] resize-none" />
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => setShowEditDetails(false)}>Cancel</Button>
                    <Button variant="lime" size="sm" className="flex-1" onClick={() => { editEvent(event.id, editFields); setShowEditDetails(false); }}>Save</Button>
                  </div>
                </motion.div>
              )}

              {event.status === 'live' && event.category === 'badminton' && (
                <Button variant="glass" size="sm" className="w-full"
                  onClick={() => setShowLeagueSetup(v => !v)}>
                  {showLeagueSetup ? 'Cancel' : (event.leagues.length > 0 ? '+ New League' : 'Setup League')}
                </Button>
              )}

              {showLeagueSetup && event.status === 'live' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 overflow-hidden">
                  <input value={leagueName} onChange={e => setLeagueName(e.target.value)}
                    placeholder="League name"
                    className="w-full text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00ff41] transition-colors" />
                  <div className="flex gap-2">
                    <button onClick={() => setLeagueFormat('single')}
                      className={`flex-1 text-xs font-bold py-2 rounded-xl border transition-all ${leagueFormat === 'single' ? 'border-[#00ff41] text-[#00ff41] bg-[#00ff41]/10' : 'border-white/10 text-white/50'}`}>
                      Singles
                    </button>
                    <button onClick={() => setLeagueFormat('doubles')}
                      className={`flex-1 text-xs font-bold py-2 rounded-xl border transition-all ${leagueFormat === 'doubles' ? 'border-[#00ff41] text-[#00ff41] bg-[#00ff41]/10' : 'border-white/10 text-white/50'}`}>
                      Doubles
                    </button>
                  </div>
                  <Button variant="lime" size="sm" className="w-full" disabled={!leagueName}
                    onClick={() => {
                      const lid = createLeague({ eventId: event.id, name: leagueName, format: leagueFormat });
                      if (lid) { setShowLeagueSetup(false); setLeagueName(''); }
                    }}>
                    Create League
                  </Button>
                </motion.div>
              )}
            </Card>
          </FadeUp>
        )}

        {/* SUMMARY (for non-badminton events) */}
        {event.category !== 'badminton' && (event.status === 'live' || event.status === 'completed') && (
          <FadeUp delay={0.15}>
            <SectionHeader
              title="📝 Summary"
              action={
                isEventAdmin && event.status !== 'completed' && (
                  <span className="text-xs text-white/30">Editable</span>
                )
              }
              className="mb-3"
            />
            <Card padding="md" variant="dark">
              {isEventAdmin && event.status !== 'completed' ? (
                <textarea
                  value={summaryText}
                  onChange={e => setSummaryText(e.target.value)}
                  placeholder="Write a summary about how the session went..."
                  rows={5}
                  className="w-full rounded-2xl px-4 py-3 text-sm text-white resize-none outline-none"
                  style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              ) : (
                <p className="text-white/70 text-sm whitespace-pre-wrap leading-relaxed">
                  {event.summary || 'No summary written yet.'}
                </p>
              )}
              {isEventAdmin && event.status !== 'completed' && (
                <div className="flex justify-end mt-3">
                  <Button variant="lime" size="sm" onClick={() => updateEventSummary(event.id, summaryText)}>
                    Save Summary
                  </Button>
                </div>
              )}
            </Card>
          </FadeUp>
        )}

        {/* BADMINTON: LEAGUES / SCORES */}
        {event.category === 'badminton' && (event.status === 'live' || event.status === 'completed') && (
        <FadeUp delay={0.15}>
          {/* COMPLETED SUMMARY */}
          {event.status === 'completed' && event.rankings && (
            <div className="space-y-3 mb-4">
              <SectionHeader title="🏆 Event Results" className="mb-3" />
              <Card padding="md" variant="dark">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Best Team</p>
                {event.rankings.length > 0 && (
                  <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.3)' }}>
                    <p className="text-lg mb-1">🥇</p>
                    <p className="font-display font-bold text-white text-lg">{event.rankings[0].teamName}</p>
                    <p className="text-white/50 text-xs mt-1">{event.rankings[0].wins} win{event.rankings[0].wins !== 1 ? 's' : ''} · {event.rankings[0].matchesPlayed} match{event.rankings[0].matchesPlayed !== 1 ? 'es' : ''}</p>
                  </div>
                )}
                {event.rankings.length > 1 && (
                  <div className="mt-2 space-y-1">
                    {event.rankings.slice(1).map((r, i) => (
                      <div key={r.teamId} className="flex items-center justify-between px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <span className="text-xs text-white/60">{i === 0 ? '🥈' : i === 1 ? '🥉' : `#${i+2}`} {r.teamName}</span>
                        <span className="text-xs text-white/40">{r.wins} win{r.wins !== 1 ? 's' : ''}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
              {event.mvps && event.mvps.length > 0 && (
                <Card padding="md" variant="dark">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">MVP — Top Players</p>
                  <div className="space-y-1.5">
                    {event.mvps.map((m, i) => (
                      <div key={m.userId} className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <span className="text-sm">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                        <Avatar src={getUserById(m.userId)?.avatar} name={m.playerName} size="xs" />
                        <span className="flex-1 text-sm font-bold text-white">{m.playerName}</span>
                        <span className="text-xs text-white/50">{m.wins} win{m.wins !== 1 ? 's' : ''}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
          <SectionHeader title="Leagues & Scores" className="mb-3" />
          {event.leagues.length === 0 ? (
            <Card padding="md" variant="dark">
              <p className="text-white/30 text-xs text-center">No leagues set up yet</p>
              {event.status === 'live' && isEventAdmin && (
                <Button variant="ghost" size="sm" className="w-full mt-2"
                  onClick={() => { setShowLeagueSetup(true); }}>
                  + Create League
                </Button>
              )}
            </Card>
          ) : (
            event.leagues.map(league => {
              const attending = event.attendance.filter(a => a.status === 'coming').map(a => a.userId);
              const canScore = event.status === 'live' && isEventAdmin;
              const getPlayerNames = (playerIds: string[]) =>
                playerIds.map(pid => getUserById(pid)?.name.split(' ')[0] || '?').join(' & ');

              const formatLabel = league.format === 'single' ? 'Singles' : league.format === 'doubles' ? 'Doubles' : (league.teams[0]?.playerIds.length === 1 ? 'Singles' : 'Doubles');

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

              const isFormOpen = matchForm?.leagueId === league.id;
              const maxPerSide = league.format === 'single' ? 1 : league.format === 'doubles' ? 2 : (league.teams[0]?.playerIds.length || 1);

              return (
                <Card key={league.id} padding="md" className="mb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-display font-bold text-white">{league.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-white/40 text-xs">{league.matches.length} matches</span>
                        <span className="text-white/40 text-xs">·</span>
                        <span className="text-white/40 text-xs">{formatLabel}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEventAdmin && event.status !== 'completed' && (
                        <button onClick={() => deleteLeague(event.id, league.id)}
                          className="text-[10px] text-red-400/50 hover:text-red-400 transition-colors">Delete League</button>
                      )}
                      <Badge variant={league.status === 'completed' ? 'green' : league.status === 'ongoing' ? 'blue' : 'glass'}>
                        {league.status}
                      </Badge>
                    </div>
                  </div>

                  {/* League Winner */}
                  {league.status === 'completed' && leagueWinners && (
                    <div className="rounded-xl p-2.5 mb-3 text-center text-sm font-bold" style={{ background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.25)', color: '#00ff41' }}>
                      Winners: {leagueWinners}
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
                      const isLocked = event.status === 'completed';
                      return (
                        <div key={match.id} className="rounded-xl p-3" style={{
                          background: match.isFinal ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.03)',
                          border: match.isFinal ? '1px solid rgba(255,215,0,0.3)' : 'none',
                        }}>
                          {(match.name || match.isFinal) && (
                            <div className="flex items-center justify-center gap-1.5 mb-2">
                              {match.isFinal && <span className="text-[11px]">🏆</span>}
                              <span className="text-[11px] font-bold text-white/50 text-center">{match.name || 'Final'}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="flex-1 text-xs font-bold text-white/40 text-right">Side 1</span>
                            <span className="w-16 text-center" />
                            <span className="flex-1 text-xs font-bold text-white/40">Side 2</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`flex-1 text-sm font-bold text-right ${isWin1 ? 'text-green-400' : 'text-white/70'}`}>{p1}</span>
                            {isEditing && !isLocked ? (
                              <div className="flex items-center gap-1">
                                <input type="number" min="0" value={editingScore!.s1} onChange={e => setEditingScore(s => s ? { ...s, s1: e.target.value } : null)}
                                  className="w-12 text-center bg-white/5 border border-white/10 rounded-lg px-1 py-1 text-white font-bold text-base outline-none focus:border-[#00ff41]" />
                                <span className="text-xs text-white/40">/</span>
                                <input type="number" min="0" value={editingScore!.s2} onChange={e => setEditingScore(s => s ? { ...s, s2: e.target.value } : null)}
                                  className="w-12 text-center bg-white/5 border border-white/10 rounded-lg px-1 py-1 text-white font-bold text-base outline-none focus:border-[#00ff41]" />
                                <button onClick={() => {
                                  const s1v = parseInt(editingScore!.s1);
                                  const s2v = parseInt(editingScore!.s2);
                                  if (isNaN(s1v) || isNaN(s2v)) return;
                                  const wid = s1v > s2v ? t1?.id : (s2v > s1v ? t2?.id : null);
                                  updateMatchScore(event.id, league.id, match.id, s1v, s2v, wid || '');
                                  setEditingScore(null);
                                }} className="text-[10px] font-bold text-[#00ff41] hover:underline ml-1">save</button>
                                <button onClick={() => setEditingScore(null)} className="text-[10px] text-white/40 hover:underline ml-0.5">x</button>
                              </div>
                            ) : (
                              <span onClick={() => { if (!isLocked && canScore) setEditingScore({ leagueId: league.id, matchId: match.id, s1: String(match.score1), s2: String(match.score2) }); }}
                                className={`font-display font-bold text-base px-2 ${!isLocked && canScore ? 'cursor-pointer hover:text-[#00ff41] transition-colors' : ''} ${match.winnerId ? 'text-white' : 'text-white/50'}`}>
                                {match.score1}/{match.score2}
                              </span>
                            )}
                            <span className={`flex-1 text-sm font-bold ${isWin2 ? 'text-green-400' : 'text-white/70'}`}>{p2}</span>
                          </div>
                          {isWin1 && <p className="text-center text-green-400/60 text-[10px] mt-0.5">{p1} win</p>}
                          {isWin2 && <p className="text-center text-green-400/60 text-[10px] mt-0.5">{p2} win</p>}
                          {isEventAdmin && (event.status === 'live' || event.status === 'paused') && (
                            <button onClick={() => deleteMatch(event.id, league.id, match.id)}
                              className="text-[9px] text-red-400/40 hover:text-red-400 transition-colors mt-1 block mx-auto">Remove Match</button>
                          )}
                        </div>
                      );
                    })}
                    {league.matches.length === 0 && (
                      <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <p className="text-white/20 text-xs">No matches yet</p>
                      </div>
                    )}
                  </div>

                  {/* Add Match form (live events only) */}
                  {canScore && (
                    <div className="mt-3">
                      {isFormOpen ? (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 overflow-hidden">
                          {/* Match Name */}
                          <div>
                            <p className="text-xs font-bold text-white/50 mb-1.5">Match Name (optional)</p>
                            <input type="text" placeholder="e.g. Semi Final 1"
                              value={matchForm!.name} onChange={e => setMatchForm(m => m ? { ...m, name: e.target.value } : m)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-[#00ff41]" />
                          </div>
                          {/* Final Toggle */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={matchForm!.isFinal}
                              onChange={e => setMatchForm(m => m ? { ...m, isFinal: e.target.checked } : m)}
                              className="accent-[#00ff41] w-4 h-4" />
                            <span className="text-xs font-bold text-white/50">This is the Final Match</span>
                          </label>
                          {/* Side 1 */}
                          <div>
                            <p className="text-xs font-bold text-white/50 mb-1.5">Side 1 {maxPerSide > 1 ? `(pick ${maxPerSide})` : ''}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {attending.map(pid => {
                                const u = getUserById(pid);
                                if (!u) return null;
                                const sel = matchForm!.side1.includes(pid);
                                const disabled = !sel && matchForm!.side1.length >= maxPerSide;
                                return (
                                  <button key={pid} disabled={disabled}
                                    onClick={() => setMatchForm(m => m ? { ...m, side1: sel ? m.side1.filter(x => x !== pid) : [...m.side1, pid] } : m)}
                                    className={`text-[11px] font-medium py-1 px-2.5 rounded-lg border transition-all ${sel ? 'border-[#00ff41] bg-[#00ff41]/10 text-[#00ff41]' : disabled ? 'border-white/5 text-white/20' : 'border-white/10 text-white/50 hover:text-white/70'}`}>
                                    {u.name.split(' ')[0]}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                            <span className="text-xs font-bold text-white/30">VS</span>
                            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                          </div>

                          {/* Side 2 */}
                          <div>
                            <p className="text-xs font-bold text-white/50 mb-1.5">Side 2 {maxPerSide > 1 ? `(pick ${maxPerSide})` : ''}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {attending.map(pid => {
                                const u = getUserById(pid);
                                if (!u) return null;
                                const sel = matchForm!.side2.includes(pid);
                                const disabled = !sel && matchForm!.side2.length >= maxPerSide;
                                return (
                                  <button key={pid} disabled={disabled}
                                    onClick={() => setMatchForm(m => m ? { ...m, side2: sel ? m.side2.filter(x => x !== pid) : [...m.side2, pid] } : m)}
                                    className={`text-[11px] font-medium py-1 px-2.5 rounded-lg border transition-all ${sel ? 'border-[#00ff41] bg-[#00ff41]/10 text-[#00ff41]' : disabled ? 'border-white/5 text-white/20' : 'border-white/10 text-white/50 hover:text-white/70'}`}>
                                    {u.name.split(' ')[0]}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Score */}
                          <div>
                            <p className="text-xs font-bold text-white/50 mb-1.5">Score</p>
                            <div className="flex items-center gap-2 justify-center">
                              <input type="number" min="0" placeholder="21"
                                value={matchForm!.score1} onChange={e => setMatchForm(m => m ? { ...m, score1: e.target.value } : m)}
                                className="w-16 text-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-bold text-lg outline-none focus:border-[#00ff41]" />
                              <span className="text-white/30 font-bold text-sm">/</span>
                              <input type="number" min="0" placeholder="18"
                                value={matchForm!.score2} onChange={e => setMatchForm(m => m ? { ...m, score2: e.target.value } : m)}
                                className="w-16 text-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-bold text-lg outline-none focus:border-[#00ff41]" />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="flex-1"
                              onClick={() => setMatchForm(null)}>
                              Cancel
                            </Button>
                            <Button variant="lime" size="sm" className="flex-1"
                              disabled={matchForm!.side1.length !== maxPerSide || matchForm!.side2.length !== maxPerSide || !matchForm!.score1 || !matchForm!.score2}
                              onClick={() => {
                                addMatch({
                                  leagueId: league.id,
                                  name: matchForm!.name || undefined,
                                  isFinal: matchForm!.isFinal || undefined,
                                  side1PlayerIds: matchForm!.side1,
                                  side2PlayerIds: matchForm!.side2,
                                  score1: parseInt(matchForm!.score1) || 0,
                                  score2: parseInt(matchForm!.score2) || 0,
                                });
                                setMatchForm(null);
                              }}>
                              Add Match
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <Button variant="glass" size="sm" className="w-full"
                          onClick={() => setMatchForm({ leagueId: league.id, side1: [], side2: [], score1: '', score2: '', name: '', isFinal: false })}>
                          + Add Match
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </FadeUp>
        )}

        {/* GALLERY */}
        <FadeUp delay={0.2}>
          <SectionHeader
            title="📸 Gallery"
            action={
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/30">{event.gallery.length}/10</span>
                {event.gallery.length < 10 && event.status !== 'completed' && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>📁</Button>
                    <Button variant="ghost" size="sm" onClick={() => cameraRef.current?.click()}>📷</Button>
                  </div>
                )}
              </div>
            }
            className="mb-3"
          />
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleUpload} />
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

        {/* Confirm action modal */}
        <AnimatePresence>
          {confirmAction && (
            <motion.div
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setConfirmAction(null); setCaptchaInput(''); }}
            >
              <motion.div
                className="w-full max-w-sm rounded-[2.5rem] p-6"
                style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <p className="font-display font-bold text-white text-lg mb-1">Confirm {confirmAction.label}</p>
                <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Type the word below to confirm
                </p>

                <div className="text-center mb-4">
                  <span className="inline-block px-6 py-3 rounded-2xl text-2xl font-black tracking-[0.3em] select-none"
                    style={{ background: '#00ff41', color: '#000', letterSpacing: '0.3em' }}>
                    {captchaWord.split('').join(' ')}
                  </span>
                </div>

                <input
                  type="text"
                  value={captchaInput}
                  onChange={e => setCaptchaInput(e.target.value.toLowerCase())}
                  placeholder="Type the word above"
                  autoFocus
                  className="w-full rounded-2xl px-4 py-3.5 text-white text-sm font-medium outline-none mb-4 text-center tracking-[0.2em] uppercase"
                  style={{
                    background: '#161616',
                    border: captchaInput.length > 0 && captchaInput !== captchaWord ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)',
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && captchaInput === captchaWord) {
                      confirmAction.onConfirm();
                      setConfirmAction(null);
                      setCaptchaInput('');
                    }
                  }}
                />

                <div className="flex gap-3">
                  <Button variant="ghost" size="lg" className="flex-1" onClick={() => { setConfirmAction(null); setCaptchaInput(''); }}>
                    Cancel
                  </Button>
                  <Button
                    variant="lime" size="lg" className="flex-1"
                    disabled={captchaInput !== captchaWord}
                    onClick={() => {
                      confirmAction.onConfirm();
                      setConfirmAction(null);
                      setCaptchaInput('');
                    }}
                  >
                    ✓ Confirm
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [showCreate, setShowCreate] = useState(false);

  const user = currentUserId ? getUserById(currentUserId) : null;
  const myGroupIds = user ? [...user.createdGroups, ...user.joinedGroups] : [];

  const filtered = events
    .filter(e => myGroupIds.includes(e.groupId))
    .filter(e => filter === 'all' || (filter === 'active' ? (e.status === 'upcoming' || e.status === 'live' || e.status === 'paused') : e.status === filter))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="pb-24 max-w-lg mx-auto px-4 pt-4 space-y-4">
      <FadeUp>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-2xl text-white">Events</h1>
            <p className="text-white/50 text-sm">All upcoming and past sessions</p>
          </div>
          <motion.button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={{ background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.25)', color: '#00ff41' }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          >
            ⚡ Live
          </motion.button>
        </div>
      </FadeUp>

      <FadeUp delay={0.05}>
        <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-1">
          {(['active', 'all', 'completed'] as const).map(f => (
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

      <CreateEventSheet isOpen={showCreate} onClose={() => setShowCreate(false)} initialMode="live" />
    </div>
  );
};
