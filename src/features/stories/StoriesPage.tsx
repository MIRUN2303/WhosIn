import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { Avatar } from '../../components/ui';
import { FadeUp } from '../../components/motion';

export const StoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUserId = useAppStore(s => s.currentUserId);
  const uploadStory = useAppStore(s => s.uploadStory);
  const getFriendsWithStories = useAppStore(s => s.getFriendsWithStories);
  const friendships = useAppStore(s => s.friendships);
  const [storyViewer, setStoryViewer] = useState<{ user: any; stories: any[]; idx: number } | null>(null);
  const [storyUploadOpen, setStoryUploadOpen] = useState(false);

  const friendsStories = getFriendsWithStories();
  const myStories = friendsStories.find(fs => fs.user?.id === currentUserId)?.stories || [];

  const allUsers = useAppStore(s => s.users);
  const currentUser = allUsers.find((u: any) => u.id === currentUserId);

  const friendIds = friendships
    .filter(f => (f.userId === currentUserId || f.friendId === currentUserId) && f.status === 'accepted')
    .map(f => f.userId === currentUserId ? f.friendId : f.userId);
  const friendUsers = allUsers.filter((u: any) => friendIds.includes(u.id));

  const handleStoryUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    uploadStory(url);
    setStoryUploadOpen(false);
  };

  return (
    <div className="page-container !pb-24 space-y-5">
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
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-dashed" style={{ borderColor: 'rgba(var(--green-rgb),0.4)' }}>
                {myStories.length > 0 ? (
                  <img src={myStories[myStories.length - 1].imageUrl} alt="" className="w-full h-full object-cover"
                    onClick={e => { e.stopPropagation(); setStoryViewer({ user: currentUser, stories: myStories, idx: 0 }); }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg" style={{ background: 'rgba(var(--green-rgb),0.08)' }}>+</div>
                )}
              </div>
              {myStories.length === 0 && (
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                  style={{ background: 'var(--green)', color: '#080808' }}>📷</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm">Your Story</p>
              <p className="text-white/40 text-xs">{myStories.length > 0 ? 'Tap to view' : 'Tap to add a story'}</p>
            </div>
            {myStories.length > 0 && (
              <div className="flex items-center gap-1">
                {[...Array(Math.min(myStories.length, 3))].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)' }} />
                ))}
              </div>
            )}
          </motion.div>

          {/* Friend stories — only users with stories */}
          {friendsStories.filter(fs => fs.user?.id !== currentUserId).length === 0 ? (
            friendUsers.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-5xl mb-3">📸</p>
                <p className="text-white/40 text-sm">No stories from friends yet</p>
                <p className="text-white/20 text-xs mt-1 mb-4">Add friends to see their stories</p>
                <button onClick={() => navigate('/profile')}
                  className="px-5 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
                  style={{ background: 'var(--green)', color: '#080808' }}>
                  + Add Friends
                </button>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-5xl mb-3">📸</p>
                <p className="text-white/40 text-sm">No active stories right now</p>
                <p className="text-white/20 text-xs mt-1">Check back later!</p>
              </div>
            )
          ) : (
            friendsStories.filter(fs => fs.user?.id !== currentUserId).map(fs => (
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
                    <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)' }} />
                  ))}
                </div>
              </motion.div>
            ))
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

      {/* Story upload sheet */}
      {storyUploadOpen && (
        <StoryUploadSheet
          onUpload={handleStoryUpload}
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
      className="fixed inset-0 z-[100] bg-black"
      onClick={goNext}
    >
      {/* Progress bars */}
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

      {/* Close button */}
      <button onClick={e => { e.stopPropagation(); onClose(); }} className="absolute top-4 right-4 z-10 text-white/60 text-xl">✕</button>

      {/* User info */}
      <div className="absolute top-6 left-4 z-10 flex items-center gap-2">
        {user && <Avatar src={user.avatar} name={user.name} size="sm" />}
        <span className="text-xs font-semibold text-white">{user?.name}</span>
      </div>

      {/* Full-screen image */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <img src={stories[idx]?.imageUrl} alt=""
          className="w-full h-full object-cover" onClick={e => e.stopPropagation()} />
        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }} />
      </div>

      {/* Tap zones */}
      <div className="absolute inset-0 flex" onClick={e => e.stopPropagation()}>
        <div className="w-1/3 h-full" onClick={goPrev} />
        <div className="w-1/3 h-full" />
        <div className="w-1/3 h-full" onClick={goNext} />
      </div>

      {/* Caption */}
      {stories[idx]?.caption && (
        <div className="absolute bottom-8 left-4 right-4 z-10">
          <p className="text-white/90 text-sm drop-shadow-lg">{stories[idx].caption}</p>
        </div>
      )}
    </motion.div>
  );
};

// =============================================
// STORY UPLOAD SHEET
// =============================================
const StoryUploadSheet: React.FC<{ onUpload: (file: File) => void; onClose: () => void }> = ({ onUpload, onClose }) => {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

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
          <button onClick={() => galleryRef.current?.click()}
            className="w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
            style={{ background: 'var(--green)', color: '#080808' }}>
            📁 Upload from Gallery
          </button>
          <button onClick={() => cameraRef.current?.click()}
            className="w-full py-4 mt-2 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
            style={{ background: 'rgba(var(--green-rgb),0.1)', color: 'var(--green)', border: '1px solid rgba(var(--green-rgb),0.25)' }}>
            📷 Take Photo
          </button>
          <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryChange} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCameraChange} />
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
