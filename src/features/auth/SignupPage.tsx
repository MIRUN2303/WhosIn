import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { signInWithGoogle } from '../../lib/auth';
import toast from 'react-hot-toast';
import { Iconic } from '../../components/ui/icons';

const formItem = {
  initial: { opacity: 0, y: 16 },
  animate: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.06 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } }),
};

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const signup = useAppStore(s => s.signup);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error('All fields are required'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    const ok = await signup(name, email, password);
    setLoading(false);
    if (ok) { toast.success('Account created! Welcome to WhosIn!'); navigate('/home'); }
  };

  const fields = [
    { val: name, set: setName, placeholder: 'Full name', icon: 'shield', type: 'text' },
    { val: email, set: setEmail, placeholder: 'Email address', icon: 'shield', type: 'email' },
  ];

  return (
    <div className="h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: '#080808' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-[-60px] w-[400px] h-[400px] rounded-full blur-[140px]" style={{ background: 'radial-gradient(circle, rgba(var(--green-rgb),0.06), transparent)' }} />
        <div className="absolute bottom-[-80px] right-[-40px] w-[300px] h-[300px] rounded-full blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(var(--amber-rgb),0.05), transparent)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }} className="w-full max-w-sm relative z-10">
        <div className="text-center mb-4">
          <motion.button onClick={() => navigate('/login')}
            className="text-white/30 text-xs mb-3 block hover:text-white/50 transition-colors"
            whileHover={{ x: -3 }}
          >← Back to Sign in</motion.button>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' as const, stiffness: 300, damping: 20, delay: 0.1 }}>
            <div className="mx-auto mb-2 flex items-center justify-center">
              <svg viewBox="0 0 64 64" width="24" height="24">
                <rect x="6" y="6" width="52" height="52" rx="12" fill="rgba(8,8,8,0.6)"/>
                <text x="31" y="42" textAnchor="middle" fontFamily="'Plus Jakarta Sans','Inter',sans-serif" fontWeight="800" fontSize="30" fill="#22d45b" letterSpacing="-1">Wi</text>
              </svg>
            </div>
          </motion.div>
          <h1 className="font-logo text-2xl tracking-wider text-white">Whos<span className="text-[var(--green)] text-3xl" style={{ textShadow: '0 0 20px rgba(var(--green-rgb),0.4)' }}>I</span>n</h1>
          <p className="text-white/40 text-xs mt-0.5 font-medium">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5">
          {fields.map((f, i) => (
            <motion.div key={i} custom={i} variants={formItem} initial="initial" animate="animate">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"><Iconic name={f.icon} size={16} /></span>
                <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full glass rounded-2xl pl-10 pr-4 py-2.5 text-white text-sm outline-none border border-white/10 focus:border-[#aaeb00]/50 transition-all placeholder:text-white/20"
                />
              </div>
            </motion.div>
          ))}

          <motion.div custom={2} variants={formItem} initial="initial" animate="animate">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"><Iconic name="shield" size={16} /></span>
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Password (min 6 chars)"
                className="w-full glass rounded-2xl pl-10 pr-11 py-2.5 text-white text-sm outline-none border border-white/10 focus:border-[#aaeb00]/50 transition-all placeholder:text-white/20"
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-xs font-semibold"
              >{showPw ? 'Hide' : 'Show'}</button>
            </div>
          </motion.div>

          <motion.div custom={3} variants={formItem} initial="initial" animate="animate">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"><Iconic name="shield" size={16} /></span>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="Confirm password"
                className="w-full glass rounded-2xl pl-10 pr-4 py-2.5 text-white text-sm outline-none border border-white/10 focus:border-[#aaeb00]/50 transition-all placeholder:text-white/20"
              />
            </div>
          </motion.div>

          <motion.button type="submit" disabled={loading}
            custom={4} variants={formItem} initial="initial" animate="animate"
            className="btn-lime w-full py-2.5 font-black text-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
            whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? <><span className="w-4 h-4 border-2 border-black/30 border-t-transparent rounded-full animate-spin" /> Creating…</> : 'Create Account →'}
          </motion.button>
        </form>

        <motion.div custom={5} variants={formItem} initial="initial" animate="animate" className="relative my-3">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/8" /></div>
          <div className="relative flex justify-center"><span className="px-3 text-xs font-medium text-white/25 bg-[#080808]">or continue with</span></div>
        </motion.div>

        <motion.button onClick={async () => { try { await signInWithGoogle(); } catch (e: any) { toast.error(e.message || 'Google sign-in failed'); } }}
          custom={6} variants={formItem} initial="initial" animate="animate"
          className="w-full glass rounded-2xl py-2.5 flex items-center justify-center gap-3 text-white/70 font-semibold text-sm hover:bg-white/[0.03] hover:text-white/90 transition-all border border-white/5 hover:border-white/10"
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Sign up with Google
        </motion.button>

        <motion.p custom={7} variants={formItem} initial="initial" animate="animate" className="text-white/30 text-xs text-center mt-3">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--green)] font-semibold hover:underline">Sign in</Link>
        </motion.p>

        <motion.div custom={8} variants={formItem} initial="initial" animate="animate" className="mt-2 text-center">
          <Link to="/home"
            className="inline-flex items-center gap-1.5 text-xs text-white/20 hover:text-white/50 transition-colors group"
          >
            Continue as Guest
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};
