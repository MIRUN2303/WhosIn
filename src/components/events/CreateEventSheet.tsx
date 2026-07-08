import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui';
import { Iconic } from '../ui/icons';
import type { EventCategory } from '../../data/types';
import { useScrollLock } from '../../lib/useScrollLock';

const CATEGORIES: { value: EventCategory; label: string; icon: string; desc: string }[] = [
  { value: 'badminton', label: 'Badminton', icon: 'badminton', desc: 'Leagues, matches & scoring' },
  { value: 'movie', label: 'Movie Out', icon: 'movie', desc: 'Attendance & summary' },
  { value: 'cafe', label: 'Cafe Out', icon: 'cafe', desc: 'Attendance & summary' },
  { value: 'roaming', label: 'Roaming', icon: '🗺️', desc: 'Attendance & summary' },
  { value: 'cycling', label: 'Cycle Ride', icon: 'cycling', desc: 'Route, distance & summary' },
  { value: 'jogging', label: 'Jogging', icon: 'running', desc: 'Route, distance & summary' },
  { value: 'walking', label: 'Walking', icon: '🚶', desc: 'Route, distance & summary' },
];

const CATEGORY_MAP: Record<EventCategory, string> = {
  badminton: 'badminton',
  movie: 'movie',
  cafe: 'cafe',
  roaming: '🗺️',
  cycling: 'cycling',
  jogging: 'running',
  walking: '🚶',
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
    <div>
      <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>CATEGORY</label>
      <motion.button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all"
        style={{ background: '#161616', border: `1px solid ${open ? 'rgba(var(--green-rgb),0.4)' : 'rgba(255,255,255,0.08)'}`, color: 'white' }}
        whileTap={{ scale: 0.98 }}
      >
        <Iconic name={selected.icon} size={24} />
        <div className="flex-1 text-left">
          <p className="text-sm font-bold">{selected.label}</p>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{selected.desc}</p>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}
        >▾</motion.span>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="category-options"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden rounded-2xl mt-1"
            style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="p-1.5 space-y-0.5">
              {CATEGORIES.map(c => {
                const isSelected = c.value === value;
                return (
                  <motion.button
                    key={c.value}
                    type="button"
                    onClick={() => { onChange(c.value); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all"
                    style={isSelected
                      ? { background: 'rgba(var(--green-rgb),0.1)', color: 'var(--green)' }
                      : { background: 'transparent', color: 'rgba(255,255,255,0.55)' }
                    }
                    whileHover={isSelected ? {} : { background: 'rgba(255,255,255,0.04)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: isSelected ? 'rgba(var(--green-rgb),0.12)' : 'rgba(255,255,255,0.05)' }}>
                      <Iconic name={c.icon} size={20} />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{c.label}</p>
                      <p className="text-[10px]" style={{ color: isSelected ? 'rgba(var(--green-rgb),0.5)' : 'rgba(255,255,255,0.25)' }}>{c.desc}</p>
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--green)' }}>
                        <Iconic name="check" size={12} className="text-black" />
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
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

  // Lock body scroll while sheet is open (prevents iOS rubber-band scroll on background)
  useScrollLock(isOpen);

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
          {/* Backdrop — click to close, touch-action:none blocks background scroll */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(10px)',
              touchAction: 'none',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={resetAndClose}
          />

          {/* Sheet positioner — pointer-events-none so backdrop click falls through */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Sheet card */}
            <motion.div
              className="relative w-full max-w-lg flex flex-col pointer-events-auto max-h-full"
              style={{
                background: '#0f0f0f',
                border: '1px solid rgba(255,255,255,0.08)',
                maxHeight: 'min(85dvh, 85vh)',
                borderRadius: '1.5rem',
                boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.15 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-2 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }} />

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-1 pb-2 flex-shrink-0">
                <div>
                  <h2 className="font-display font-bold text-lg text-white">
                    {mode === 'live' ? 'Start Live Event' : 'Schedule Event'}
                  </h2>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {selectedGroup ? `in ${selectedGroup.name}` : 'Select a group first'}
                  </p>
                </div>
                <button onClick={resetAndClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200 flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              {/* Step indicator */}
              {mode === 'schedule' && (
                <div className="flex items-center gap-2 px-6 pb-3">
                  {['details', 'schedule'].map((s, i) => (
                    <React.Fragment key={s}>
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all"
                          style={step === s || (i === 0 && step === 'schedule')
                            ? { background: 'var(--green)', color: '#000' }
                            : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                          {i + 1}
                        </span>
                        <span className="text-[10px] font-semibold capitalize"
                          style={{ color: step === s ? 'var(--green)' : 'rgba(255,255,255,0.35)' }}>
                          {s}
                        </span>
                      </div>
                      {i === 0 && <div className="flex-1 h-px" style={{ background: step === 'schedule' ? 'rgba(var(--green-rgb),0.4)' : 'rgba(255,255,255,0.06)' }} />}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Scrollable body — safe-area padding + overscroll containment */}
              <div
                className="flex-1 overflow-y-auto px-6 min-h-0"
                style={{
                  paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 1.5rem) + 1.5rem)',
                  overscrollBehavior: 'contain',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <div className="space-y-4">
                <AnimatePresence mode="wait">
                  {/* ===== SCHEDULE MODE: STEP 1 — DETAILS ===== */}
                  {mode === 'schedule' && step === 'details' && (
                    <motion.div key="details"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-4">
                      {!preselectedGroupId && (
                        <div>
                          <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>GROUP</label>
                          {myGroups.length === 0 ? (
                            <div className="flex items-center gap-2 py-3">
                              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>No groups —</span>
                              <button onClick={() => { onClose(); navigate('/groups'); }}
                                className="text-xs font-bold transition-all active:scale-95 underline underline-offset-2"
                                style={{ color: 'var(--green)' }}>
                                Create one
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-1">
                              {myGroups.map(g => (
                                <motion.button key={g.id}
                                  onClick={() => setGroupId(g.id)}
                                  className="flex items-center gap-2 px-3 py-2.5 rounded-2xl whitespace-nowrap text-sm font-semibold transition-all border flex-shrink-0"
                                  style={groupId === g.id
                                    ? { background: 'rgba(var(--green-rgb),0.1)', borderColor: 'var(--green)', color: 'var(--green)' }
                                    : { background: 'transparent', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
                                  }
                                  whileTap={{ scale: 0.97 }}
                                >
                                  <span>{g.logo}</span> {g.name}
                                </motion.button>
                              ))}
                            </div>
                          )}
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
                            border: title ? '1px solid rgba(var(--green-rgb),0.4)' : '1px solid rgba(255,255,255,0.08)',
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

                      <motion.div whileHover={{ scale: canProceed ? 1.02 : 1 }} whileTap={{ scale: canProceed ? 0.97 : 1 }}>
                        <Button
                          variant="lime" fullWidth size="lg"
                          disabled={!canProceed}
                          onClick={() => setStep('schedule')}
                        >
                          Next: Schedule →
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* ===== SCHEDULE MODE: STEP 2 — SCHEDULE ===== */}
                  {mode === 'schedule' && step === 'schedule' && (
                    <motion.div key="schedule"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-4">
                      <div className="flex items-center gap-2 p-3 rounded-2xl"
                        style={{ background: 'rgba(var(--green-rgb),0.06)', border: '1px solid rgba(var(--green-rgb),0.2)' }}>
                        <Iconic name={CATEGORY_MAP[category]} size={28} />
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
                            border: date ? '1px solid rgba(var(--green-rgb),0.4)' : '1px solid rgba(255,255,255,0.08)',
                            colorScheme: 'dark',
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between glass rounded-2xl px-4 py-3 border border-white/10">
                        <div>
                          <p className="text-white text-sm font-semibold">Set custom time</p>
                          <p className="text-white/30 text-xs">Off = event runs all day</p>
                        </div>
                        <button onClick={() => setUseCustomTime(!useCustomTime)} className="w-11 h-6 rounded-full transition-all flex items-center flex-shrink-0" style={{ background: useCustomTime ? 'var(--green)' : 'rgba(255,255,255,0.15)' }}>
                          <div className="w-5 h-5 rounded-full bg-white transition-all shadow" style={{ transform: useCustomTime ? 'translateX(22px)' : 'translateX(2px)' }} />
                        </button>
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
                            border: venue ? '1px solid rgba(var(--green-rgb),0.4)' : '1px solid rgba(255,255,255,0.08)',
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between glass rounded-2xl px-4 py-3 border border-white/10">
                        <div>
                          <p className="text-white text-sm font-semibold">Recurring Event</p>
                          <p className="text-white/30 text-xs">Repeat this event weekly</p>
                        </div>
                        <button onClick={() => setIsRecurring(!isRecurring)} className="w-11 h-6 rounded-full transition-all flex items-center flex-shrink-0" style={{ background: isRecurring ? 'var(--green)' : 'rgba(255,255,255,0.15)' }}>
                          <div className="w-5 h-5 rounded-full bg-white transition-all shadow" style={{ transform: isRecurring ? 'translateX(22px)' : 'translateX(2px)' }} />
                        </button>
                      </div>

                      <div className="flex gap-3 pt-2 pb-4 sticky bottom-0" style={{ background: '#0f0f0f' }}>
                        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                          <Button variant="ghost" size="lg" className="flex-1" onClick={() => setStep('details')}>← Back</Button>
                        </motion.div>
                        <motion.div className="flex-1" whileHover={{ scale: canSubmitSchedule ? 1.02 : 1 }} whileTap={{ scale: canSubmitSchedule ? 0.97 : 1 }}>
                          <Button
                            variant="lime" size="lg" className="w-full"
                            disabled={!canSubmitSchedule} loading={loading}
                            onClick={handleCreateSchedule}
                          >
                            ✓ Confirm & Create
                          </Button>
                        </motion.div>
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
                          {myGroups.length === 0 ? (
                            <div className="flex items-center gap-2 py-3">
                              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>No groups —</span>
                              <button onClick={() => { onClose(); navigate('/groups'); }}
                                className="text-xs font-bold transition-all active:scale-95 underline underline-offset-2"
                                style={{ color: 'var(--green)' }}>
                                Create one
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-1">
                              {myGroups.map(g => (
                                <motion.button key={g.id}
                                  onClick={() => setGroupId(g.id)}
                                  className="flex items-center gap-2 px-3 py-2.5 rounded-2xl whitespace-nowrap text-sm font-semibold transition-all border flex-shrink-0"
                                  style={groupId === g.id
                                    ? { background: 'rgba(var(--green-rgb),0.1)', borderColor: 'var(--green)', color: 'var(--green)' }
                                    : { background: 'transparent', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
                                  }
                                  whileTap={{ scale: 0.97 }}
                                >
                                  <span>{g.logo}</span> {g.name}
                                </motion.button>
                              ))}
                            </div>
                          )}
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
                            border: title ? '1px solid rgba(var(--green-rgb),0.4)' : '1px solid rgba(255,255,255,0.08)',
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
                            border: venue ? '1px solid rgba(var(--green-rgb),0.4)' : '1px solid rgba(255,255,255,0.08)',
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

                      <motion.div whileHover={{ scale: canSubmitLive ? 1.02 : 1 }} whileTap={{ scale: canSubmitLive ? 0.97 : 1 }}>
                        <Button
                          variant="lime" fullWidth size="lg"
                          disabled={!canSubmitLive} loading={loading}
                          onClick={handleCreateLive}
                        >
                          <><Iconic name="lightning" size={18} /> Start Live Now</>
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
