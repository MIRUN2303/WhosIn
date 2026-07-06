import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui';
import type { EventCategory } from '../../data/types';

const CATEGORIES: { value: EventCategory; label: string; emoji: string; desc: string }[] = [
  { value: 'badminton', label: 'Badminton', emoji: '🏸', desc: 'Leagues, matches & scoring' },
  { value: 'movie', label: 'Movie Out', emoji: '🎬', desc: 'Attendance & summary' },
  { value: 'cafe', label: 'Cafe Out', emoji: '☕', desc: 'Attendance & summary' },
  { value: 'roaming', label: 'Roaming', emoji: '🚶', desc: 'Attendance & summary' },
  { value: 'cycling', label: 'Cycle Ride', emoji: '🚴', desc: 'Route, distance & summary' },
  { value: 'jogging', label: 'Jogging', emoji: '🏃', desc: 'Route, distance & summary' },
  { value: 'walking', label: 'Walking', emoji: '🚶‍➡️', desc: 'Route, distance & summary' },
];

const CATEGORY_MAP: Record<EventCategory, string> = {
  badminton: '🏸',
  movie: '🎬',
  cafe: '☕',
  roaming: '🚶',
  cycling: '🚴',
  jogging: '🏃',
  walking: '🚶‍➡️',
};

const CATEGORY_BANNERS: Record<EventCategory, string> = {
  badminton: '/1.jpg',
  movie: '/2.jpg',
  cafe: '/3.jpg',
  roaming: '/4.jpg',
  cycling: '/5.jpg',
  jogging: '/6.jpg',
  walking: '/7.jpg',
};

interface CreateEventSheetProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedGroupId?: string;
  preselectedDate?: string;
  initialMode?: 'schedule' | 'live';
}

const RouteFields: React.FC<{
  startPoint: string; onStartChange: (v: string) => void;
  endPoint: string; onEndChange: (v: string) => void;
  gatherPoint: string; onGatherChange: (v: string) => void;
  distance: string; onDistanceChange: (v: string) => void;
  motivation: string; onMotivationChange: (v: string) => void;
}> = ({ startPoint, onStartChange, endPoint, onEndChange, gatherPoint, onGatherChange, distance, onDistanceChange, motivation, onMotivationChange }) => (
  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 overflow-hidden">
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>START POINT</label>
        <input type="text" value={startPoint} onChange={e => onStartChange(e.target.value)}
          placeholder="e.g. Marina Beach"
          className="w-full rounded-2xl px-4 py-3.5 text-white text-sm font-medium outline-none"
          style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }} />
      </div>
      <div>
        <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>END POINT</label>
        <input type="text" value={endPoint} onChange={e => onEndChange(e.target.value)}
          placeholder="e.g. Besant Nagar"
          className="w-full rounded-2xl px-4 py-3.5 text-white text-sm font-medium outline-none"
          style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }} />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>GATHER AT</label>
        <input type="text" value={gatherPoint} onChange={e => onGatherChange(e.target.value)}
          placeholder="e.g. Main Gate"
          className="w-full rounded-2xl px-4 py-3.5 text-white text-sm font-medium outline-none"
          style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }} />
      </div>
      <div>
        <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>DISTANCE</label>
        <input type="text" value={distance} onChange={e => onDistanceChange(e.target.value)}
          placeholder="e.g. 12 km"
          className="w-full rounded-2xl px-4 py-3.5 text-white text-sm font-medium outline-none"
          style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }} />
      </div>
    </div>
    <div>
      <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>MOTIVATION / TARGET</label>
      <textarea value={motivation} onChange={e => onMotivationChange(e.target.value)}
        placeholder="e.g. Let's conquer the coastal route together!"
        maxLength={150} rows={2}
        className="w-full rounded-2xl px-4 py-3 text-sm text-white resize-none outline-none"
        style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }} />
      <p className="text-right text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{motivation.length}/150</p>
    </div>
  </motion.div>
);

const CategoryDropdown: React.FC<{ value: EventCategory; onChange: (v: EventCategory) => void }> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const selected = CATEGORIES.find(c => c.value === value)!;

  return (
    <div className="relative">
      <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>CATEGORY</label>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all"
        style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-xl">{selected.emoji}</span>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold">{selected.label}</p>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{selected.desc}</p>
        </div>
        <motion.span
          className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}
        >▾</motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/60"
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-sm max-h-[70vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5"
              style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="font-display font-bold text-white text-lg">Select Category</p>
                <button onClick={() => setOpen(false)} className="text-white/40 text-lg">✕</button>
              </div>
              <div className="space-y-1">
                {CATEGORIES.map(c => {
                  const isSelected = c.value === value;
                  return (
                    <motion.button
                      key={c.value}
                      type="button"
                      onClick={() => { onChange(c.value); setOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all"
                      style={isSelected
                        ? { background: 'rgba(0,255,65,0.08)', color: '#00ff41', border: '1px solid rgba(0,255,65,0.2)' }
                        : { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.6)', border: '1px solid transparent' }
                      }
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-2xl">{c.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{c.label}</p>
                        <p className="text-[10px]" style={{ color: isSelected ? 'rgba(0,255,65,0.4)' : 'rgba(255,255,255,0.3)' }}>{c.desc}</p>
                      </div>
                      {isSelected && <span className="text-xs" style={{ color: '#00ff41' }}>✓</span>}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const CreateEventSheet: React.FC<CreateEventSheetProps> = ({
  isOpen, onClose, preselectedGroupId, preselectedDate, initialMode = 'schedule',
}) => {
  const navigate = useNavigate();
  const createEvent = useAppStore(s => s.createEvent);
  const createLiveEvent = useAppStore(s => s.createLiveEvent);
  const currentUserId = useAppStore(s => s.currentUserId);
  const storeGroups = useAppStore(s => s.groups);

  const myGroups = storeGroups.filter(g =>
    g.members.some(m => m.userId === currentUserId && (m.role === 'creator' || m.role === 'admin' || m.role === 'member'))
  );

  const [groupId, setGroupId] = useState(preselectedGroupId || myGroups[0]?.id || '');
  const [category, setCategory] = useState<EventCategory>('badminton');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(preselectedDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('19:00');
  const [endTime, setEndTime] = useState('22:00');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');

  const [isRecurring, setIsRecurring] = useState(false);
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [gatherPoint, setGatherPoint] = useState('');
  const [distance, setDistance] = useState('');
  const [motivation, setMotivation] = useState('');
  const [step, setStep] = useState<'details' | 'schedule'>('details');
  const [loading, setLoading] = useState(false);

  const mode = initialMode;

  const selectedGroup = storeGroups.find(g => g.id === groupId);

  const canProceed = title.trim().length > 0 && groupId;
  const canSubmitSchedule = canProceed && date && venue.trim().length > 0;
  const canSubmitLive = canProceed && venue.trim().length > 0;

  const handleCreateSchedule = async () => {
    if (!canSubmitSchedule) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const effectiveTime = useCustomTime ? time : '00:00';
    const effectiveEnd = useCustomTime ? endTime : '24:00';
    const banner = CATEGORY_BANNERS[category];
    const newId = createEvent({ groupId, title, category, sport: 'badminton', date, time: effectiveTime, endTime: effectiveEnd, venue, description, coverImage: banner, isRecurring, startPoint, endPoint, gatherPoint, distance, motivation });
    setLoading(false);
    onClose();
    if (newId) navigate(`/events/${newId}`);
  };

  const handleCreateLive = async () => {
    if (!canSubmitLive) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const banner = CATEGORY_BANNERS[category];
    const newId = createLiveEvent({ groupId, title, venue, description, coverImage: banner, category, startPoint, endPoint, gatherPoint, distance, motivation });
    setLoading(false);
    onClose();
    if (newId) navigate(`/events/${newId}`);
  };

  const resetAndClose = () => {
    setStep('details');
    setCategory('badminton');
    setTitle('');
    setVenue('');
    setDescription('');
    setUseCustomTime(false);
    setStartPoint('');
    setEndPoint('');
    setGatherPoint('');
    setDistance('');
    setMotivation('');
    onClose();
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
          />

          <motion.div
            className="fixed bottom-[76px] left-0 right-0 z-50 max-w-lg mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl"
            style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)', maxHeight: 'calc(92dvh - 76px)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 38 }}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(92dvh - 76px - 24px)' }}>
              <div className="flex items-center justify-between px-5 pb-4 pt-1">
                <div>
                  <h2 className="font-display font-black text-xl text-white">
                    {mode === 'live' ? '⚡ Start Live Event' : 'Schedule Event'}
                  </h2>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {selectedGroup ? `in ${selectedGroup.name}` : 'Select a group first'}
                  </p>
                </div>
                <button onClick={resetAndClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>✕</button>
              </div>

              {/* Step indicator (schedule mode only) */}
              {mode === 'schedule' && (
                <div className="flex items-center gap-2 px-5 mb-5">
                  {['details', 'schedule'].map((s, i) => (
                    <React.Fragment key={s}>
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all"
                          style={step === s || (i === 0 && step === 'schedule')
                            ? { background: '#00ff41', color: '#000' }
                            : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                          {i + 1}
                        </span>
                        <span className="text-xs font-semibold capitalize"
                          style={{ color: step === s ? '#00ff41' : 'rgba(255,255,255,0.35)' }}>
                          {s}
                        </span>
                      </div>
                      {i === 0 && <div className="flex-1 h-px" style={{ background: step === 'schedule' ? 'rgba(0,255,65,0.4)' : 'rgba(255,255,255,0.06)' }} />}
                    </React.Fragment>
                  ))}
                </div>
              )}

              <div className="px-5 pb-8 space-y-4">
                <AnimatePresence mode="wait">
                  {/* ===== SCHEDULE MODE: STEP 1 — DETAILS ===== */}
                  {mode === 'schedule' && step === 'details' && (
                    <motion.div key="details"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-4">
                      {!preselectedGroupId && (
                        <div>
                          <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>GROUP</label>
                          <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-1">
                            {myGroups.map(g => (
                              <motion.button key={g.id}
                                onClick={() => setGroupId(g.id)}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-2xl whitespace-nowrap text-sm font-semibold transition-all border flex-shrink-0"
                                style={groupId === g.id
                                  ? { background: 'rgba(0,255,65,0.1)', borderColor: '#00ff41', color: '#00ff41' }
                                  : { background: 'transparent', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
                                }
                                whileTap={{ scale: 0.97 }}
                              >
                                <span>{g.logo}</span> {g.name}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}

                      <CategoryDropdown value={category} onChange={setCategory} />

                      <div>
                        <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>EVENT TITLE *</label>
                        <input
                          type="text"
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          placeholder={category === 'movie' ? 'e.g. Oppenheimer at IMAX' : category === 'cafe' ? 'e.g. Weekend Coffee Run' : category === 'roaming' ? 'e.g. Evening Stroll' : category === 'cycling' ? 'e.g. Morning Coastal Ride' : category === 'jogging' ? 'e.g. Sunrise Jog' : category === 'walking' ? 'e.g. Evening Walk' : 'e.g. Saturday Badminton Session'}
                          className="w-full rounded-2xl px-4 py-3.5 text-white text-sm font-medium outline-none transition-all"
                          style={{
                            background: '#161616',
                            border: title ? '1px solid rgba(0,255,65,0.4)' : '1px solid rgba(255,255,255,0.08)',
                          }}
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>DESCRIPTION (optional)</label>
                        <textarea
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          placeholder="What's this about?"
                          rows={3}
                          className="w-full rounded-2xl px-4 py-3 text-sm text-white resize-none outline-none"
                          style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}
                        />
                      </div>

                      {(category === 'cycling' || category === 'jogging' || category === 'walking') && (
                        <RouteFields
                          startPoint={startPoint} onStartChange={setStartPoint}
                          endPoint={endPoint} onEndChange={setEndPoint}
                          gatherPoint={gatherPoint} onGatherChange={setGatherPoint}
                          distance={distance} onDistanceChange={setDistance}
                          motivation={motivation} onMotivationChange={setMotivation}
                        />
                      )}

                      <Button
                        variant="lime" fullWidth size="lg"
                        disabled={!canProceed}
                        onClick={() => setStep('schedule')}
                      >
                        Next: Schedule →
                      </Button>
                    </motion.div>
                  )}

                  {/* ===== SCHEDULE MODE: STEP 2 — SCHEDULE ===== */}
                  {mode === 'schedule' && step === 'schedule' && (
                    <motion.div key="schedule"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-4">
                      <div className="flex items-center gap-2 p-3 rounded-2xl"
                        style={{ background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.2)' }}>
                        <span className="text-2xl">{CATEGORY_MAP[category]}</span>
                        <div>
                          <p className="font-bold text-white text-sm">{title}</p>
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{selectedGroup?.name} · {category.charAt(0).toUpperCase() + category.slice(1)}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>DATE *</label>
                        <input
                          type="date"
                          value={date}
                          min={minDate}
                          onChange={e => setDate(e.target.value)}
                          className="w-full rounded-2xl px-4 py-3.5 text-white text-sm font-medium outline-none appearance-none"
                          style={{
                            background: '#161616',
                            border: date ? '1px solid rgba(0,255,65,0.4)' : '1px solid rgba(255,255,255,0.08)',
                            colorScheme: 'dark',
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-2xl"
                        style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div>
                          <p className="font-semibold text-white text-sm">Set custom time range</p>
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Off = event runs all day (00:00–24:00)</p>
                        </div>
                        <motion.button
                          onClick={() => setUseCustomTime(!useCustomTime)}
                          className="w-12 h-7 rounded-full relative transition-colors"
                          style={{ background: useCustomTime ? '#00ff41' : 'rgba(255,255,255,0.12)' }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.span
                            className="absolute top-1 w-5 h-5 rounded-full bg-black shadow-lg"
                            animate={{ left: useCustomTime ? 26 : 4 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </motion.button>
                      </div>

                      {useCustomTime && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>START TIME</label>
                            <input
                              type="time"
                              value={time}
                              onChange={e => setTime(e.target.value)}
                              className="w-full rounded-2xl px-4 py-3.5 text-white text-sm font-medium outline-none"
                              style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)', colorScheme: 'dark' }}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>END TIME</label>
                            <input
                              type="time"
                              value={endTime}
                              onChange={e => setEndTime(e.target.value)}
                              className="w-full rounded-2xl px-4 py-3.5 text-white text-sm font-medium outline-none"
                              style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)', colorScheme: 'dark' }}
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>VENUE *</label>
                        <input
                          type="text"
                          value={venue}
                          onChange={e => setVenue(e.target.value)}
                          placeholder={category === 'movie' ? 'e.g. PVR Cinemas' : category === 'cafe' ? 'e.g. Starbucks Reserve' : category === 'roaming' ? 'e.g. Marine Drive' : category === 'cycling' ? 'e.g. ECR Beach Road' : category === 'jogging' ? 'e.g. Marine Drive Promenade' : category === 'walking' ? 'e.g. Beach Road' : 'e.g. Sportorium Court 2'}
                          className="w-full rounded-2xl px-4 py-3.5 text-white text-sm font-medium outline-none"
                          style={{
                            background: '#161616',
                            border: venue ? '1px solid rgba(0,255,65,0.4)' : '1px solid rgba(255,255,255,0.08)',
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-2xl"
                        style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div>
                          <p className="font-semibold text-white text-sm">Recurring Event</p>
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Repeat this event weekly</p>
                        </div>
                        <motion.button
                          onClick={() => setIsRecurring(!isRecurring)}
                          className="w-12 h-7 rounded-full relative transition-colors"
                          style={{ background: isRecurring ? '#00ff41' : 'rgba(255,255,255,0.12)' }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.span
                            className="absolute top-1 w-5 h-5 rounded-full bg-black shadow-lg"
                            animate={{ left: isRecurring ? 26 : 4 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </motion.button>
                      </div>

                      <div className="flex gap-3 pt-2 pb-4 sticky bottom-0" style={{ background: '#0f0f0f' }}>
                        <Button variant="ghost" size="lg" className="flex-1" onClick={() => setStep('details')}>← Back</Button>
                        <Button
                          variant="lime" size="lg" className="flex-2 flex-1"
                          disabled={!canSubmitSchedule} loading={loading}
                          onClick={handleCreateSchedule}
                        >
                          ✓ Confirm & Create
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* ===== LIVE MODE ===== */}
                  {mode === 'live' && (
                    <motion.div key="live"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-4">
                      {!preselectedGroupId && (
                        <div>
                          <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>GROUP</label>
                          <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-1">
                            {myGroups.map(g => (
                              <motion.button key={g.id}
                                onClick={() => setGroupId(g.id)}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-2xl whitespace-nowrap text-sm font-semibold transition-all border flex-shrink-0"
                                style={groupId === g.id
                                  ? { background: 'rgba(0,255,65,0.1)', borderColor: '#00ff41', color: '#00ff41' }
                                  : { background: 'transparent', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
                                }
                                whileTap={{ scale: 0.97 }}
                              >
                                <span>{g.logo}</span> {g.name}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}

                      <CategoryDropdown value={category} onChange={setCategory} />

                      <div>
                        <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>EVENT TITLE *</label>
                        <input
                          type="text"
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          placeholder={category === 'movie' ? 'e.g. Oppenheimer at IMAX' : category === 'cafe' ? 'e.g. Weekend Coffee Run' : category === 'roaming' ? 'e.g. Evening Stroll' : category === 'cycling' ? 'e.g. Morning Coastal Ride' : category === 'jogging' ? 'e.g. Sunrise Jog' : category === 'walking' ? 'e.g. Evening Walk' : 'e.g. Saturday Badminton Session'}
                          className="w-full rounded-2xl px-4 py-3.5 text-white text-sm font-medium outline-none transition-all"
                          style={{
                            background: '#161616',
                            border: title ? '1px solid rgba(0,255,65,0.4)' : '1px solid rgba(255,255,255,0.08)',
                          }}
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>VENUE *</label>
                        <input
                          type="text"
                          value={venue}
                          onChange={e => setVenue(e.target.value)}
                          placeholder={category === 'movie' ? 'e.g. PVR Cinemas' : category === 'cafe' ? 'e.g. Starbucks Reserve' : category === 'roaming' ? 'e.g. Marine Drive' : category === 'cycling' ? 'e.g. ECR Beach Road' : category === 'jogging' ? 'e.g. Marine Drive Promenade' : category === 'walking' ? 'e.g. Beach Road' : 'e.g. Sportorium Court 2'}
                          className="w-full rounded-2xl px-4 py-3.5 text-white text-sm font-medium outline-none"
                          style={{
                            background: '#161616',
                            border: venue ? '1px solid rgba(0,255,65,0.4)' : '1px solid rgba(255,255,255,0.08)',
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>DESCRIPTION (optional)</label>
                        <textarea
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          placeholder="What's this about?"
                          rows={3}
                          className="w-full rounded-2xl px-4 py-3 text-sm text-white resize-none outline-none"
                          style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}
                        />
                      </div>

                      {(category === 'cycling' || category === 'jogging' || category === 'walking') && (
                        <RouteFields
                          startPoint={startPoint} onStartChange={setStartPoint}
                          endPoint={endPoint} onEndChange={setEndPoint}
                          gatherPoint={gatherPoint} onGatherChange={setGatherPoint}
                          distance={distance} onDistanceChange={setDistance}
                          motivation={motivation} onMotivationChange={setMotivation}
                        />
                      )}

                      <Button
                        variant="lime" fullWidth size="lg"
                        disabled={!canSubmitLive} loading={loading}
                        onClick={handleCreateLive}
                      >
                        🔥 Start Live Now
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
