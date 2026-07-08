import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SPORT_CONFIG } from '../../data/sportConfig';
import { Avatar, Button } from '../../components/ui';
import { Iconic } from '../../components/ui/icons';
import { FadeUp } from '../../components/motion';
import { useAppStore } from '../../store/useAppStore';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const currentUserId = useAppStore(s => s.currentUserId);
  const users = useAppStore(s => s.users);
  const isLoggedIn = useAppStore(s => s.isLoggedIn);
  const logout = useAppStore(s => s.logout);
  const user = users.find(u => u.id === currentUserId);

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <FadeUp>
          <div className="text-center space-y-4 max-w-xs">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background: 'rgba(var(--green-rgb),0.1)', border: '1px solid rgba(var(--green-rgb),0.2)' }}>
              <Iconic name="badminton" size={32} />
            </div>
            <h2 className="font-display font-black text-2xl text-white">Your Profile</h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Sign in to view your stats, badges, and activity.</p>
            <div className="flex gap-3 justify-center pt-2">
              <Link to="/login" className="flex-1 max-w-[120px] py-3 rounded-2xl font-black text-sm text-center transition-all"
                style={{ background: 'var(--green)', color: 'black' }}
              >Sign In</Link>
              <Link to="/signup" className="flex-1 max-w-[120px] py-3 rounded-2xl font-black text-sm text-center transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              >Sign Up</Link>
            </div>
          </div>
        </FadeUp>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-lg mx-auto px-4">
      <FadeUp>
        <div className="flex items-center gap-4 pt-6">
          <Avatar src={user.avatar} name={user.name} size="xl" ring />
          <div className="flex-1">
            <h1 className="font-display font-black text-2xl text-white">{user.name}</h1>
            <p className="text-white/50 text-sm">@{user.username}</p>
          </div>
          <Button variant="glass" size="sm" onClick={() => { logout(); navigate('/login'); }}>Logout</Button>
        </div>

        <div className="glass rounded-2xl p-3 mt-4 space-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-white/60 text-xs">
            <span className="flex items-center gap-1"><Iconic name="shield" size={12} className="text-green-400" /> {user.email}</span>
            <span className="text-white/20 hidden sm:inline">|</span>
            <span className="flex items-center gap-1"><Iconic name="shield" size={12} className="text-green-400" /> {user.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-white/60 text-xs">
            Profile Code: <span className="font-mono font-bold text-violet-300">{user.profileCode}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-0.5"><Iconic name="check_circle" size={10} /> Confirmed</span>
          </div>
        </div>

        <div className="glass rounded-2xl p-3 mt-3 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Iconic name="lightning" size={20} />
              <span className="font-bold text-white text-sm">Level {user.level}</span>
            </div>
            <span className="text-white/40 text-xs">{user.xp} XP</span>
          </div>
          <div className="relative w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ((user.xp || 0) % Math.max(1, user.level * 100)) / (user.level * 100) * 100)}%`, background: 'var(--green)', boxShadow: '0 0 8px rgba(var(--green-rgb),0.4)' }} />
          </div>
          <div className="flex justify-between text-[10px] text-white/30">
            <span>Level {user.level}</span>
            <span>{(user.xp || 0) % (user.level * 100) || 0} / {user.level * 100} XP</span>
            <span>Level {user.level + 1}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-3">
          {[
            { label: 'Matches', value: user.stats.totalMatches, color: '#7c3aed' },
            { label: 'Wins', value: user.stats.wins, color: '#10b981' },
            { label: 'Losses', value: user.stats.losses, color: '#ef4444' },
            { label: 'Win Rate', value: `${user.stats.winRate}%`, color: user.stats.winRate >= 60 ? '#10b981' : user.stats.winRate >= 40 ? '#f59e0b' : '#ef4444' },
          ].map(stat => (
            <div key={stat.label} className="glass rounded-2xl p-2.5 text-center">
              <p className="font-bold text-base" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-white/40 text-[10px]">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-3 mt-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Attendance Rate', value: `${user.stats.attendanceRate}%` },
              { label: 'Current Streak', value: `${user.stats.currentStreak}` },
              { label: 'Longest Streak', value: `${user.stats.longestStreak}` },
              { label: 'MVP Count', value: `${user.stats.mvpCount}` },
              { label: 'Total Points', value: `${user.stats.pointsTotal}` },
              { label: 'Badges', value: `${user.badges?.length || 0}` },
            ].map(stat => (
              <div key={stat.label} className="flex items-center justify-between rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="text-white/40 text-xs">{stat.label}</span>
                <span className="font-bold text-white text-sm">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-3 flex-wrap">
          {user.favouriteSports.map((sport: string) => {
            const cfg = SPORT_CONFIG[sport as keyof typeof SPORT_CONFIG];
            return (
              <span key={sport} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: cfg.bg, border: `1px solid ${cfg.color}40`, color: cfg.color }}>
                <Iconic name={cfg.emoji} /> {cfg.label}
              </span>
            );
          })}
        </div>
      </FadeUp>
    </div>
  );
};
