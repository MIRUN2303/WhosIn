import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LEADERBOARD, getUserById } from '../../data/mockData';
import { Avatar, Badge, Chip } from '../../components/ui';
import { FadeUp, StaggerList, StaggerItem, AnimatedNumber } from '../../components/motion';

const PERIODS = ['Weekly', 'Monthly', 'Yearly', 'All Time'] as const;
const SPORTS_FILTER = [
  { key: 'overall',   label: 'Overall',   emoji: '⭐' },
  { key: 'badminton', label: 'Badminton', emoji: '🏸' },
  { key: 'cricket',   label: 'Cricket',   emoji: '🏏' },
  { key: 'football',  label: 'Football',  emoji: '⚽' },
];

export const LeaderboardPage: React.FC = () => {
  const [period, setPeriod] = useState('All Time');
  const [sportFilter, setSportFilter] = useState('overall');
  const currentUserId = 'u1';

  const sorted = [...LEADERBOARD].map((e, i) => ({ ...e, rank: i + 1 }));
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const myEntry = sorted.find(e => e.userId === currentUserId);

  return (
    <div className="pb-24 max-w-lg mx-auto px-4 pt-4 space-y-5">
      <FadeUp>
        <h1 className="font-display font-black text-2xl text-white" style={{ letterSpacing: '-0.01em' }}>Leaderboard</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>The weekend warriors ranked</p>
      </FadeUp>

      {/* Period */}
      <FadeUp delay={0.05}>
        <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-1">
          {PERIODS.map(p => (
            <Chip key={p} label={p} active={period === p} onClick={() => setPeriod(p)} />
          ))}
        </div>
      </FadeUp>

      {/* Sport */}
      <FadeUp delay={0.08}>
        <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-1">
          {SPORTS_FILTER.map(s => (
            <Chip key={s.key} label={`${s.emoji} ${s.label}`} active={sportFilter === s.key} onClick={() => setSportFilter(s.key)} />
          ))}
        </div>
      </FadeUp>

      {/* My rank */}
      {myEntry && (
        <FadeUp delay={0.12}>
          <div className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'rgba(170,235,0,0.07)', border: '1px solid rgba(170,235,0,0.2)' }}>
            <span className="text-2xl">⭐</span>
            <Avatar src={getUserById(currentUserId)?.avatar} name={getUserById(currentUserId)?.name || ''} size="md" ring />
            <div className="flex-1">
              <p className="font-bold text-white text-sm">Your Ranking</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                #{myEntry.rank} · {myEntry.wins}W · {myEntry.winRate}% WR · 🔥 {myEntry.streak}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display font-black text-2xl" style={{ color: '#aaeb00' }}>
                <AnimatedNumber value={myEntry.points} />
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>pts</p>
            </div>
          </div>
        </FadeUp>
      )}

      {/* PODIUM — Apple Watch dark style */}
      <FadeUp delay={0.18}>
        <div className="flex items-end justify-center gap-2 h-52">
          {/* 2nd */}
          {top3[1] && (() => {
            const user = getUserById(top3[1].userId);
            return (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="flex-1 flex flex-col items-center gap-2">
                <Avatar src={user?.avatar} name={user?.name || ''} size="lg" />
                <div className="w-full rounded-2xl p-2 text-center" style={{ height: 100, background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-2xl">🥈</p>
                  <p className="font-bold text-white text-xs truncate">{user?.name.split(' ')[0]}</p>
                  <p className="font-black text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{top3[1].points.toLocaleString()}</p>
                </div>
              </motion.div>
            );
          })()}

          {/* 1st — lime highlight */}
          {top3[0] && (() => {
            const user = getUserById(top3[0].userId);
            return (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="flex-1 flex flex-col items-center gap-2">
                <div className="relative">
                  <Avatar src={user?.avatar} name={user?.name || ''} size="xl" ring />
                  <span className="absolute -top-2 -right-2 text-2xl">👑</span>
                </div>
                <div className="w-full rounded-2xl p-3 text-center"
                  style={{ height: 140, background: 'rgba(170,235,0,0.08)', border: '1px solid rgba(170,235,0,0.3)', boxShadow: '0 0 20px rgba(170,235,0,0.1)' }}>
                  <p className="font-bold text-xs uppercase tracking-wider mb-1" style={{ color: '#aaeb00' }}>#1</p>
                  <p className="font-bold text-white text-sm truncate">{user?.name.split(' ')[0]}</p>
                  <p className="font-display font-black text-2xl" style={{ color: '#aaeb00' }}>{top3[0].points.toLocaleString()}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{top3[0].winRate}% WR</p>
                </div>
              </motion.div>
            );
          })()}

          {/* 3rd */}
          {top3[2] && (() => {
            const user = getUserById(top3[2].userId);
            return (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="flex-1 flex flex-col items-center gap-2">
                <Avatar src={user?.avatar} name={user?.name || ''} size="lg" />
                <div className="w-full rounded-2xl p-2 text-center" style={{ height: 80, background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-xl">🥉</p>
                  <p className="font-bold text-white text-xs truncate">{user?.name.split(' ')[0]}</p>
                  <p className="font-black text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{top3[2].points.toLocaleString()}</p>
                </div>
              </motion.div>
            );
          })()}
        </div>
      </FadeUp>

      {/* Rest of board */}
      <FadeUp delay={0.3}>
        <div className="rounded-3xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <StaggerList>
            {rest.map((entry, i) => {
              const user = getUserById(entry.userId);
              if (!user) return null;
              const isMe = entry.userId === currentUserId;
              const rankDiff = entry.prevRank - entry.rank;
              return (
                <StaggerItem key={entry.userId}>
                  <div className="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors"
                    style={{
                      borderBottom: i < rest.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      background: isMe ? 'rgba(170,235,0,0.05)' : 'transparent',
                    }}>
                    <span className="w-8 text-center font-bold text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {entry.rank}
                    </span>
                    <Avatar src={user.avatar} name={user.name} size="sm" ring={isMe} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white text-sm truncate">{user.name}</p>
                        {isMe && <Badge variant="lime" size="sm">You</Badge>}
                        {entry.streak >= 5 && <span className="text-xs" style={{ color: '#f97316' }}>🔥 {entry.streak}</span>}
                      </div>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {entry.wins}W · {entry.losses}L · {entry.winRate}% WR
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm" style={{ color: '#aaeb00' }}>{entry.points.toLocaleString()}</p>
                      {rankDiff !== 0 && (
                        <p className="text-xs font-semibold" style={{ color: rankDiff > 0 ? '#22c55e' : '#ef4444' }}>
                          {rankDiff > 0 ? `↑${rankDiff}` : `↓${Math.abs(rankDiff)}`}
                        </p>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerList>
        </div>
      </FadeUp>

      {/* Point legend */}
      <FadeUp delay={0.4}>
        <div className="rounded-2xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs font-bold mb-3" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>POINT SYSTEM</p>
          {[
            { label: 'Win', pts: '+30 pts' }, { label: 'Loss', pts: '+10 pts' },
            { label: 'Attendance', pts: '+5 pts' }, { label: 'MVP', pts: '+50 pts' },
            { label: 'Win Streak (3+)', pts: '+15 bonus' },
          ].map(item => (
            <div key={item.label} className="flex justify-between text-sm py-1">
              <span style={{ color: 'rgba(255,255,255,0.45)' }}>{item.label}</span>
              <span className="font-semibold" style={{ color: '#aaeb00' }}>{item.pts}</span>
            </div>
          ))}
        </div>
      </FadeUp>
    </div>
  );
};
