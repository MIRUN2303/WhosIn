import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { USERS } from '../../data/mockData';
import { Avatar } from '../../components/ui';
import { FadeUp } from '../../components/motion';

export const StoriesPage: React.FC = () => {
  const currentUserId = useAppStore(s => s.currentUserId);
  const uploadStory = useAppStore(s => s.uploadStory);
  const getFriendsWithStories = useAppStore(s => s.getFriendsWithStories);
  const friendships = useAppStore(s => s.friendships);
  const [storyViewer, setStoryViewer] = useState<{ user: any; stories: any[]; idx: number } | null>(null);
  const [storyUploadOpen, setStoryUploadOpen] = useState(false);
  const storyFileRef = useRef<HTMLInputElement>(null);

  const friendsStories = getFriendsWithStories();
  const myStories = friendsStories.find(fs => fs.user?.id === currentUserId)?.stories || [];

  const currentUser = USERS.find(u => u.id === currentUserId);

  const friendIds = friendships
    .filter(f => (f.userId === currentUserId || f.friendId === currentUserId) && f.status === 'accepted')
    .map(f => f.userId === currentUserId ? f.friendId : f.userId);
  const friendUsers = USERS.filter(u => friendIds.includes(u.id));

  const handleStoryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    uploadStory(url);
    setStoryUploadOpen(false);
  };

  return (
    <div className="pb-24 space-y-5 max-w-lg mx-auto px-4 pt-4">
      <FadeUp>
        <h1 className="font-display font-black text-2xl text-white">Stories</h1>
        <p className="text-white/40 text-sm">See what your friends are up to</p>
      </FadeUp>

      {/* Story rings */}
      <FadeUp delay={0.06}>
        <div className="flex flex-col gap-4">
          {/* Your story */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            onClick={() => setStoryUploadOpen(true)}
          >
            <div className="relative w-16 h-16 flex-shrink-0">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-dashed" style={{ borderColor: 'rgba(0,255,65,0.4)' }}>
                {myStories.length > 0 ? (
                  <img src={myStories[myStories.length - 1].imageUrl} alt="" className="w-full h-full object-cover"
                    onClick={e => { e.stopPropagation(); setStoryViewer({ user: currentUser, stories: myStories, idx: 0 }); }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg" style={{ background: 'rgba(0,255,65,0.08)' }}>+</div>
                )}
              </div>
              {myStories.length === 0 && (
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                  style={{ background: '#00ff41', color: '#080808' }}>📷</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm">Your Story</p>
              <p className="text-white/40 text-xs">{myStories.length > 0 ? 'Tap to view' : 'Tap to add a story'}</p>
            </div>
            {myStories.length > 0 && (
              <div className="flex items-center gap-1">
                {[...Array(Math.min(myStories.length, 3))].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#00ff41' }} />
                ))}
              </div>
            )}
          </motion.div>

          {/* Friend stories */}
          {friendUsers.length === 0 && friendsStories.filter(fs => fs.user?.id !== currentUserId).length === 0 ? (
            <div className="text-center py-10">
              <p className="text-5xl mb-3">📸</p>
              <p className="text-white/40 text-sm">No stories from friends yet</p>
              <p className="text-white/20 text-xs mt-1">Add friends from your profile to see their stories</p>
            </div>
          ) : (
            <>
              {friendsStories.filter(fs => fs.user?.id !== currentUserId).map(fs => (
                <motion.div
                  key={fs.user?.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  onClick={() => fs.stories.length > 0 && setStoryViewer({ user: fs.user, stories: fs.stories, idx: 0 })}
                >
                  <Avatar src={fs.user?.avatar} name={fs.user?.name || ''} size="lg" ring />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm">{fs.user?.name}</p>
                    <p className="text-white/40 text-xs">{fs.stories.length} story{fs.stories.length > 1 ? 'ies' : 'y'} · recent</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(fs.stories.length, 3))].map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#00ff41' }} />
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Friends without stories */}
              {friendUsers.filter(u => !friendsStories.some(fs => fs.user?.id === u.id)).map(u => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 p-4 rounded-2xl opacity-50"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <Avatar src={u.avatar} name={u.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm">{u.name}</p>
                    <p className="text-white/30 text-xs">No stories yet</p>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>
      </FadeUp>

      {/* STORY VIEWER */}
      <AnimatePresence>
        {storyViewer && (
          <StoryViewerPopup
            user={storyViewer.user}
            stories={storyViewer.stories}
            initialIdx={storyViewer.idx}
            onClose={() => setStoryViewer(null)}
          />
        )}
      </AnimatePresence>

      {/* Story upload file input */}
      <input ref={storyFileRef} type="file" accept="image/*" className="hidden" onChange={handleStoryUpload} />
      {storyUploadOpen && (
        <StoryUploadSheet
          onUpload={() => { storyFileRef.current?.click(); }}
          onClose={() => setStoryUploadOpen(false)}
        />
      )}
    </div>
  );
};

// =============================================
// STORY VIEWER POPUP
// =============================================
const StoryViewerPopup: React.FC<{ user: any; stories: any[]; initialIdx: number; onClose: () => void }> = ({ user, stories, initialIdx, onClose }) => {
  const [idx, setIdx] = useState(initialIdx);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const dur = 5000;
    const step = 50;
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + (step / dur) * 100;
        if (next >= 100) {
          if (idx < stories.length - 1) {
            setIdx(i => i + 1);
            return 0;
          }
          onClose();
          return 100;
        }
        return next;
      });
    }, step);
    return () => clearInterval(interval);
  }, [idx, stories.length, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [onClose]);

  const goNext = () => { if (idx < stories.length - 1) { setIdx(i => i + 1); setProgress(0); } else onClose(); };
  const goPrev = () => { if (idx > 0) { setIdx(i => i - 1); setProgress(0); } };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col"
      onClick={goNext}
    >
      <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <div className="h-full transition-all duration-75" style={{
              width: i < idx ? '100%' : i === idx ? `${progress}%` : '0%',
              background: '#fff',
            }} />
          </div>
        ))}
      </div>

      <button onClick={e => { e.stopPropagation(); onClose(); }} className="absolute top-4 right-4 z-10 text-white/60 text-xl">✕</button>

      <div className="absolute top-6 left-4 z-10 flex items-center gap-2">
        {user && <Avatar src={user.avatar} name={user.name} size="sm" />}
        <span className="text-xs font-semibold text-white">{user?.name}</span>
      </div>

      <img src={stories[idx]?.imageUrl} alt=""
        className="flex-1 w-full object-contain" onClick={e => e.stopPropagation()} />

      <div className="absolute inset-0 flex" onClick={e => e.stopPropagation()}>
        <div className="w-1/3 h-full" onClick={goPrev} />
        <div className="w-1/3 h-full" />
        <div className="w-1/3 h-full" onClick={goNext} />
      </div>

      {stories[idx]?.caption && (
        <div className="absolute bottom-8 left-4 right-4 z-10">
          <p className="text-white/80 text-sm">{stories[idx].caption}</p>
        </div>
      )}
    </motion.div>
  );
};

// =============================================
// STORY UPLOAD SHEET
// =============================================
const StoryUploadSheet: React.FC<{ onUpload: () => void; onClose: () => void }> = ({ onUpload, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-black/60 flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="w-full max-w-lg rounded-t-3xl p-6"
          style={{ background: '#141414', borderTop: '1px solid rgba(255,255,255,0.08)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <p className="font-display font-bold text-white text-lg mb-4">📸 Add to Story</p>
          <button onClick={onUpload}
            className="w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
            style={{ background: '#00ff41', color: '#080808' }}>
            📷 Take Photo / Upload
          </button>
          <button onClick={onClose}
            className="w-full py-3 mt-2 rounded-2xl text-sm font-semibold"
            style={{ color: 'rgba(255,255,255,0.4)' }}>
            Cancel
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
