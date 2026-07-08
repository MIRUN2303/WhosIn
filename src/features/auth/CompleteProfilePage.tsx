import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabase';
import { Iconic } from '../../components/ui/icons';
import toast from 'react-hot-toast';

const countryCodes = [
  { code: '+91', label: 'IN +91' },
  { code: '+1', label: 'US +1' },
  { code: '+44', label: 'UK +44' },
  { code: '+61', label: 'AU +61' },
  { code: '+971', label: 'AE +971' },
  { code: '+65', label: 'SG +65' },
  { code: '+852', label: 'HK +852' },
  { code: '+86', label: 'CN +86' },
  { code: '+81', label: 'JP +81' },
  { code: '+82', label: 'KR +82' },
];

export const CompleteProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const currentUserId = useAppStore(s => s.currentUserId);
  const users = useAppStore(s => s.users);
  const setNeedsPhone = useAppStore(s => s.setNeedsPhone);
  const [cc, setCc] = useState('+91');
  const [phone, setPhone] = useState('');
  const [ccOpen, setCcOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ccRef = useRef<HTMLDivElement>(null);

  const user = users.find((u: any) => u.id === currentUserId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) { toast.error('Enter a valid 10-digit phone number'); return; }
    const fullPhone = cc + digits;
    setLoading(true);
    try {
      const { error } = await supabase.from('users').update({ phone: fullPhone }).eq('id', currentUserId);
      if (error) throw error;
      setNeedsPhone(false);
      useAppStore.setState(s => ({
        users: s.users.map((u: any) => u.id === currentUserId ? { ...u, phone: fullPhone } : u),
      }));
      toast.success('Profile updated!');
      navigate('/home', { replace: true });
    } catch (e: any) {
      toast.error(e.message || 'Failed to save phone number');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ccRef.current && !ccRef.current.contains(e.target as Node)) setCcOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#080808' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <Iconic name="shield" size={40} className="mb-2" />
          <h1 className="font-logo text-2xl tracking-wider text-white mt-2">Almost there!</h1>
          <p className="text-white/40 text-sm mt-1">Complete your profile to get started</p>
        </div>

        {user && (
          <div className="glass rounded-2xl p-4 mb-4 text-center">
            <p className="text-white font-semibold">{user.name}</p>
            <p className="text-white/40 text-xs mt-0.5">{user.email}</p>
          </div>
        )}

        <div className="glass rounded-2xl p-4 mb-4 border border-amber-500/20" style={{ background: 'rgba(245,158,11,0.08)' }}>
          <p className="text-amber-400 text-xs flex items-start gap-2">
            <Iconic name="info" size={16} className="flex-shrink-0 mt-0.5" />
            <span>Phone number is required to join or create groups. You won't be able to use group features without it.</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/50 text-xs font-semibold mb-1.5 block">Phone Number *</label>
            <div className="flex gap-2 items-start">
              <div className="relative" ref={ccRef}>
                <button type="button" onClick={() => setCcOpen(o => !o)}
                  className="glass rounded-2xl px-2.5 py-3 text-white/80 text-xs font-semibold outline-none border border-white/10 hover:border-white/20 transition-all flex items-center gap-1 whitespace-nowrap min-w-[72px] justify-center"
                >
                  {cc}
                  <svg className={`w-3 h-3 transition-transform ${ccOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {ccOpen && (
                  <div className="absolute bottom-full mb-1 left-0 w-28 max-h-40 overflow-y-auto glass rounded-2xl border border-white/10 shadow-2xl z-20">
                    {countryCodes.map(c => (
                      <button key={c.code} type="button" onClick={() => { setCc(c.code); setCcOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors ${cc === c.code ? 'text-[var(--green)] bg-white/[0.04]' : 'text-white/60 hover:text-white/80 hover:bg-white/[0.02]'}`}
                      >{c.label}</button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Phone number"
                className="flex-1 glass rounded-2xl px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-[#aaeb00]/50 transition-all"
              />
            </div>
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            className="btn-lime w-full py-3 font-black text-base disabled:opacity-50"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? 'Saving…' : 'Continue →'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};
