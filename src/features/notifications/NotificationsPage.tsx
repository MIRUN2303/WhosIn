import React from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../../components/ui';
import { FadeUp, StaggerList, StaggerItem } from '../../components/motion';
import { clsx } from 'clsx';

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  event:        { icon: '📅', color: '#7c3aed' },
  attendance:   { icon: '✅', color: '#10b981' },
  score:        { icon: '🏆', color: '#f59e0b' },
  achievement:  { icon: '🎖️', color: '#f59e0b' },
  announcement: { icon: '📢', color: '#ec4899' },
  reminder:     { icon: '⏰', color: '#8b5cf6' },
  friend_request: { icon: '👤', color: '#3b82f6' },
  group_join:     { icon: '👥', color: '#f59e0b' },
};

function timeAgo(dateStr: string) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export const NotificationsPage: React.FC = () => {
  const notifications = useAppStore(s => s.notifications);
  const markRead = useAppStore(s => s.markNotificationRead);
  const markAllRead = useAppStore(s => s.markAllRead);
  const currentUserId = useAppStore(s => s.currentUserId);
  const myNotifications = notifications.filter(n => !n.userId || n.userId === currentUserId);
  const unread = myNotifications.filter(n => !n.read).length;

  return (
    <div className="page-container !pb-24 space-y-4">
      <FadeUp>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-2xl text-white">Notifications</h1>
            {unread > 0 && <p className="text-white/50 text-sm">{unread} unread</p>}
          </div>
          {unread > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead}>Mark all read</Button>
          )}
        </div>
      </FadeUp>

      <StaggerList className="space-y-2">
        {myNotifications.map(notif => {
          const cfg = TYPE_CONFIG[notif.type];
          return (
            <StaggerItem key={notif.id}>
              <motion.div
                onClick={() => markRead(notif.id)}
                className={clsx(
                  'flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-colors',
                  notif.read ? 'glass opacity-60' : 'glass border border-white/20'
                )}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 overflow-hidden"
                  style={{ background: `${cfg.color}20`, border: `1px solid ${cfg.color}40` }}
                >
                  {notif.avatar?.startsWith('http')
                    ? <img src={notif.avatar} alt="" className="w-full h-full object-cover" />
                    : <span>{notif.avatar || cfg.icon}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={clsx('text-sm font-semibold', notif.read ? 'text-white/60' : 'text-white')}>
                    {notif.title}
                  </p>
                  <p className="text-white/50 text-xs mt-0.5 line-clamp-2">{notif.body}</p>
                  <p className="text-white/30 text-xs mt-1">{timeAgo(notif.timestamp)}</p>
                </div>
                {!notif.read && (
                  <span className="w-2 h-2 bg-violet-400 rounded-full flex-shrink-0 mt-1" />
                )}
              </motion.div>
            </StaggerItem>
          );
        })}
      </StaggerList>
    </div>
  );
};
