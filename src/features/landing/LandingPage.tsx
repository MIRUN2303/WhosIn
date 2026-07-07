import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { SPORT_CONFIG } from '../../data/mockData';

const FEATURES = [
  { icon: '🏸', title: 'Weekend Sports', desc: 'Organize badminton, cricket, football and 10+ sports with your crew' },
  { icon: '📊', title: 'Live Scores', desc: 'Track every match, every league, every winner in real time' },
  { icon: '🏆', title: 'Leaderboards', desc: 'Weekly, monthly, all-time rankings that spark healthy rivalry' },
  { icon: '📸', title: 'Memories', desc: 'Every event auto-creates a gallery. Your weekend, preserved beautifully' },
  { icon: '📅', title: 'Smart Calendar', desc: 'Monthly, weekly, agenda views with recurring events and reminders' },
  { icon: '✅', title: 'Attendance', desc: 'Coming, Maybe, Late — replace WhatsApp polls forever' },
];

const SPORTS_ROW = ['badminton', 'cricket', 'football', 'cycling', 'trekking', 'cafe', 'running', 'basketball'] as const;

const TESTIMONIALS = [
  { name: 'Sanjay M.', sport: '🏸 Badminton Club', quote: 'We deleted the WhatsApp attendance poll group. WhosIn does it better in every single way.' },
  { name: 'Divya K.', sport: '🥾 Trek Crew', quote: 'The leaderboard creates so much healthy rivalry. We actually show up more just to climb the ranks!' },
  { name: 'Rohan P.', sport: '⚽ Sunday FC', quote: 'From 3 WhatsApp groups to one beautiful app. Our football league has never been this organized.' },
];

const STATS = [
  { value: '10K+', label: 'Active Players' },
  { value: '500+', label: 'Weekend Groups' },
  { value: '12K+', label: 'Events Organized' },
  { value: '98%', label: 'Would Recommend' },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -60]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.4]);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTestimonialIndex(i => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#080808' }}>
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-100px] left-[-100px] w-[800px] h-[500px] rounded-full blur-[200px]"
          style={{ background: 'radial-gradient(ellipse, rgba(170,235,0,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[10%] right-[-50px] w-[600px] h-[400px] rounded-full blur-[180px]"
          style={{ background: 'radial-gradient(ellipse, rgba(249,115,22,0.09) 0%, transparent 70%)' }} />
      </div>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full pulse-lime" style={{ background: '#aaeb00' }} />
          <span className="font-logo text-xl tracking-wider text-white">Whos<span className="text-[var(--green)] text-2xl">I</span>n</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {['Features', 'Sports', 'Community'].map(item => (
            <a key={item} href="#" className="text-white/40 hover:text-white text-sm font-medium transition-colors">{item}</a>
          ))}
        </div>
        <motion.button
          onClick={() => navigate('/login')}
          className="btn-lime text-sm px-5 py-2.5 font-bold"
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
        >Sign In →</motion.button>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center pt-20">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-4xl mx-auto">

          {/* Live indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
            style={{ background: 'rgba(170,235,0,0.08)', border: '1px solid rgba(170,235,0,0.2)', color: '#aaeb00' }}
          >
            <span className="w-2 h-2 rounded-full pulse-lime" style={{ background: '#aaeb00' }} />
            Live weekends happening now
          </motion.div>

          {/* BIG headline */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-display font-black leading-none mb-4"
              style={{ fontSize: 'clamp(3.5rem, 12vw, 8rem)', letterSpacing: '-0.03em' }}>
              <span className="text-white">Your</span>{' '}
              <span className="gradient-text">Weekend</span><br />
              <span className="text-white">Universe</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-white/45 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
          >
            The premium social platform for friend groups to organize weekend sports, track scores, and celebrate memories.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="flex flex-col sm:flex-row gap-3 items-center justify-center"
          >
            <motion.button
              onClick={() => navigate('/login')}
              className="btn-lime text-base px-8 py-4 font-black"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            >Start Your Weekend 🏸</motion.button>
            <motion.button
              className="btn-ghost text-base px-8 py-4 font-semibold"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >Watch Demo ▶</motion.button>
          </motion.div>

          {/* Hero mockup — Apple Watch dark style */}
          <motion.div
            initial={{ opacity: 0, y: 70, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-20 relative"
          >
            {/* Main card */}
            <div className="w-[280px] md:w-[340px] mx-auto rounded-[2.5rem] overflow-hidden"
              style={{
                background: '#0f0f0f',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 60px rgba(170,235,0,0.12)',
              }}>
              {/* Event cover */}
              <div className="h-24 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80"
                  alt="" className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#aaeb00', boxShadow: '0 0 6px #aaeb00' }} />
                  <span className="text-xs font-bold text-[#aaeb00]">UPCOMING</span>
                </div>
                <div className="absolute top-3 right-3 text-xs font-bold text-white/50">
                  ☀️ 28°
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                      style={{ background: 'rgba(170,235,0,0.1)', border: '1px solid rgba(170,235,0,0.2)' }}>🏸</span>
                    <div>
                      <p className="font-display font-bold text-white text-sm">Weekend Badminton</p>
                      <p className="text-white/35 text-[11px]">Tomorrow · 7:00 PM · Sportorium</p>
                    </div>
                  </div>
                </div>

                {/* Countdown */}
                <div className="rounded-2xl p-3 grid grid-cols-4 gap-2"
                  style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {[
                    { val: '01', label: 'Day' },
                    { val: String(23 - new Date().getHours()).padStart(2,'0'), label: 'Hrs' },
                    { val: String(59 - new Date().getMinutes()).padStart(2,'0'), label: 'Min' },
                    { val: String(59 - new Date().getSeconds()).padStart(2,'0'), label: 'Sec' },
                  ].map(({ val, label }) => (
                    <div key={label} className="text-center">
                      <p className="font-display font-black text-xl text-white leading-none">{val}</p>
                      <p className="text-white/30 text-[9px] mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Attendance */}
                <div className="flex gap-2">
                  {[
                    { s: '✅ 4', c: '#22c55e' }, { s: '⏰ 1', c: '#aaeb00' }, { s: '❓ 1', c: '#f59e0b' }
                  ].map(({ s, c }) => (
                    <span key={s} className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: `${c}12`, border: `1px solid ${c}30`, color: c }}>
                      {s}
                    </span>
                  ))}
                </div>

                {/* Score */}
                <div className="rounded-2xl p-3" style={{ background: 'rgba(170,235,0,0.07)', border: '1px solid rgba(170,235,0,0.2)' }}>
                  <p className="text-[10px] text-[#aaeb00]/60 font-bold mb-1">⚡ LAST RESULT</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-sm">Alpha</span>
                    <span className="font-display font-black text-xl" style={{ color: '#aaeb00' }}>21—18</span>
                    <span className="text-white/50 font-bold text-sm">Beta</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity }}
              className="absolute -left-6 top-12 hidden md:flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-semibold"
              style={{ background: '#0f0f0f', border: '1px solid rgba(170,235,0,0.25)', color: '#aaeb00' }}>
              🔥 6-win streak
            </motion.div>
            <motion.div animate={{ y: [5, -5, 5] }} transition={{ duration: 3.5, repeat: Infinity }}
              className="absolute -right-6 bottom-16 hidden md:flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-semibold"
              style={{ background: '#0f0f0f', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316' }}>
              🏆 #1 Ranked
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-2xl" style={{ color: 'rgba(255,255,255,0.2)' }}>
          ↓
        </motion.div>
      </section>

      {/* STATS */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="rounded-3xl p-6 text-center"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="font-display font-black text-3xl md:text-4xl gradient-text-lime">{stat.value}</p>
              <p className="text-white/35 text-sm mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SPORTS ROW */}
      <section className="py-12 overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-10 px-6">
          <h2 className="font-display font-black text-3xl md:text-5xl text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
            Every activity <span className="gradient-text">covered</span>
          </h2>
          <p className="text-white/35 max-w-lg mx-auto">From badminton courts to mountain trails. WhosIn adapts to your crew.</p>
        </motion.div>
        <div className="flex gap-3 px-6 overflow-x-auto scrollbar-hidden pb-2">
          {SPORTS_ROW.map((sport, i) => {
            const cfg = SPORT_CONFIG[sport];
            return (
              <motion.div key={sport}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                whileHover={{ scale: 1.06, y: -4 }}
                className="flex-shrink-0 rounded-3xl p-4 flex flex-col items-center gap-2 min-w-[88px] cursor-pointer transition-colors"
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="text-3xl">{cfg.emoji}</span>
                <span className="text-[10px] font-semibold text-white/40 text-center leading-tight">{cfg.label}</span>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <h2 className="font-display font-black text-3xl md:text-5xl text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
              Everything your group needs
            </h2>
            <p className="text-white/35 max-w-lg mx-auto">Replace 4 WhatsApp groups and a spreadsheet with one experience.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="rounded-3xl p-6 cursor-default transition-all duration-300"
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(170,235,0,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
              >
                <span className="text-3xl mb-3 block">{f.icon}</span>
                <h3 className="font-display font-bold text-white text-base mb-1.5">{f.title}</h3>
                <p className="text-white/35 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display font-black text-3xl md:text-4xl text-white mb-12" style={{ letterSpacing: '-0.02em' }}>
            Loved by <span className="gradient-text">weekend crews</span>
          </h2>
          <AnimatePresence mode="wait">
            <motion.div key={testimonialIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="rounded-3xl p-8"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-white/70 text-lg leading-relaxed mb-6 italic">
                "{TESTIMONIALS[testimonialIndex].quote}"
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full" style={{ background: 'linear-gradient(135deg, #aaeb00, #7ab800)' }} />
                <div className="text-left">
                  <p className="font-bold text-white text-sm">{TESTIMONIALS[testimonialIndex].name}</p>
                  <p className="text-white/30 text-xs">{TESTIMONIALS[testimonialIndex].sport}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-5">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setTestimonialIndex(i)}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: i === testimonialIndex ? 24 : 6, background: i === testimonialIndex ? '#aaeb00' : 'rgba(255,255,255,0.2)' }} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto rounded-[2.5rem] p-10"
          style={{
            background: '#111',
            border: '1px solid rgba(170,235,0,0.25)',
            boxShadow: '0 0 60px rgba(170,235,0,0.1)',
          }}>
          <span className="text-5xl mb-4 block">🏸</span>
          <h2 className="font-display font-black text-3xl md:text-5xl text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Ready for your best weekend?
          </h2>
          <p className="text-white/40 text-lg mb-8">Create your group in 60 seconds. No credit card needed.</p>
          <motion.button
            onClick={() => navigate('/login')}
            className="btn-lime text-lg px-10 py-4 font-black mx-auto block"
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          >Start for Free — It's Weekend Time 🏸</motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="font-logo text-2xl tracking-wider text-white mb-1">Whos<span className="text-[var(--green)] text-3xl">I</span>n</p>
        <p className="text-white/20 text-sm">Who's in? · Play. Compete. Conquer.</p>
      </footer>
    </div>
  );
};
