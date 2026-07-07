import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { Iconic } from '../../components/ui/icons';
import { signInWithGoogle } from '../../lib/auth';
import toast from 'react-hot-toast';

const formItem = {
  initial: { opacity: 0, y: 16 },
  animate: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } }),
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAppStore(s => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Email and Password are required'); return; }
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) { toast.success('Welcome back!'); navigate('/home'); }
  };

  const handleGoogle = async () => {
    try { await signInWithGoogle(); }
    catch (e: any) { toast.error(e.message || 'Google sign-in failed'); }
  };

  return (
    <div className="h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: '#080808' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-[-60px] w-[400px] h-[400px] rounded-full blur-[140px]" style={{ background: 'radial-gradient(circle, rgba(var(--green-rgb),0.06), transparent)' }} />
        <div className="absolute bottom-[-80px] right-[-40px] w-[300px] h-[300px] rounded-full blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(var(--amber-rgb),0.05), transparent)' }} />
        <div className="absolute top-1/3 right-[-100px] w-[250px] h-[250px] rounded-full blur-[100px]" style={{ background: 'radial-gradient(circle, rgba(var(--green-rgb),0.04), transparent)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }} className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' as const, stiffness: 300, damping: 20, delay: 0.1 }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(var(--green-rgb),0.1)', border: '1px solid rgba(var(--green-rgb),0.2)' }}>
              <Iconic name="badminton" size={32} />
            </div>
          </motion.div>
          <h1 className="font-logo text-4xl tracking-wider text-white mt-2">Whos<span className="text-[var(--green)]" style={{ fontSize: '2.5rem', textShadow: '0 0 20px rgba(var(--green-rgb),0.4)' }}>I</span>n</h1>
          <p className="text-white/40 text-sm mt-1 font-medium">Who's in? Sign in to find out.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <motion.div custom={0} variants={formItem} initial="initial" animate="animate">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"><Iconic name="shield" size={16} /></span>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full glass rounded-2xl pl-10 pr-4 py-3.5 text-white text-sm outline-none border border-white/10 focus:border-[#aaeb00]/50 transition-all placeholder:text-white/20"
              />
            </div>
          </motion.div>

          <motion.div custom={1} variants={formItem} initial="initial" animate="animate">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"><Iconic name="shield" size={16} /></span>
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full glass rounded-2xl pl-10 pr-11 py-3.5 text-white text-sm outline-none border border-white/10 focus:border-[#aaeb00]/50 transition-all placeholder:text-white/20"
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-xs font-semibold"
              >{showPw ? 'Hide' : 'Show'}</button>
            </div>
          </motion.div>

          <motion.button type="submit" disabled={loading}
            custom={2} variants={formItem} initial="initial" animate="animate"
            className="btn-lime w-full py-3.5 font-black text-base disabled:opacity-50 flex items-center justify-center gap-2"
            whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? <><span className="w-4 h-4 border-2 border-black/30 border-t-transparent rounded-full animate-spin" /> Signing in…</> : 'Sign In →'}
          </motion.button>
        </form>

        <motion.div custom={3} variants={formItem} initial="initial" animate="animate" className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/8" /></div>
          <div className="relative flex justify-center"><span className="px-3 text-xs font-medium text-white/25 bg-[#080808]">or continue with</span></div>
        </motion.div>

        <motion.button onClick={handleGoogle}
          custom={4} variants={formItem} initial="initial" animate="animate"
          className="w-full glass rounded-2xl py-3.5 flex items-center justify-center gap-3 text-white/70 font-semibold text-sm hover:bg-white/[0.03] hover:text-white/90 transition-all border border-white/5 hover:border-white/10"
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Sign in with Google
        </motion.button>

        <motion.p custom={5} variants={formItem} initial="initial" animate="animate" className="text-white/30 text-sm text-center mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[var(--green)] font-semibold hover:underline">Create one</Link>
        </motion.p>
      </motion.div>
    </div>
  );
};
