import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabase';
import { Iconic } from '../../components/ui/icons';
import toast from 'react-hot-toast';

export const CompleteProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const currentUserId = useAppStore(s => s.currentUserId);
  const users = useAppStore(s => s.users);
  const setNeedsPhone = useAppStore(s => s.setNeedsPhone);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const user = users.find((u: any) => u.id === currentUserId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error('Phone number is required');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('users').update({ phone: phone.trim() }).eq('id', currentUserId);
      if (error) throw error;
      // Update local user in store
      setNeedsPhone(false);
      useAppStore.setState(s => ({
        users: s.users.map((u: any) => u.id === currentUserId ? { ...u, phone: phone.trim() } : u),
      }));
      toast.success('Profile updated!');
      navigate('/home', { replace: true });
    } catch (e: any) {
      toast.error(e.message || 'Failed to save phone number');
    } finally {
      setLoading(false);
    }
  };

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
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 99999 99001"
              className="w-full glass rounded-2xl px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-[#aaeb00]/50 transition-all"
            />
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
