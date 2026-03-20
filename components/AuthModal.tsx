
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, Key, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { GlassCard } from './GlassCard';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-braid-text/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md"
          >
            <GlassCard className="p-10 border-braid-primary/20 shadow-2xl">
              <button onClick={onClose} className="absolute top-6 right-6 p-2 text-braid-muted hover:text-braid-primary transition-colors">
                <X size={20} />
              </button>

              <div className="text-center space-y-4 mb-10">
                <div className="w-16 h-16 bg-braid-primary rounded-full flex items-center justify-center mx-auto text-white shadow-soft">
                  <ShieldCheck size={32} />
                </div>
                <h2 className="text-3xl font-serif italic">Team Access</h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-braid-primary">Authentication Protocol</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-braid-muted ml-4">Identity</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-braid-primary/40" size={18} />
                    <input
                      required
                      type="email"
                      placeholder="email@artistry.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-braid-bg dark:bg-black/20 border-2 border-braid-primary/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-braid-primary transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-braid-muted ml-4">Access Key</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-braid-primary/40" size={18} />
                    <input
                      required
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-braid-bg dark:bg-black/20 border-2 border-braid-primary/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-braid-primary transition-all text-sm"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs">
                    <AlertCircle size={14} /> {error}
                  </motion.div>
                )}

                <Button type="submit" fullWidth disabled={loading} className="py-4 mt-4">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'Unlock Dashboard'}
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
