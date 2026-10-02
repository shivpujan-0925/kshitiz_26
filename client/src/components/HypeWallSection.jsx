import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Send, 
  Sparkles, 
  Flame, 
  User, 
  GraduationCap, 
  Tag,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ConfirmModal from './ConfirmModal';
import { apiUrl } from '../config/api';

const INITIAL_CHEERS = [
  {
    _id: 'hc-1',
    name: 'Pooja Singh',
    batch: 'Batch 2025–29',
    branch: 'ECE',
    message: 'So hyped for Kshitiz 2025! Can\'t wait to walk the ramp and cheer for my department! 💃✨',
    likes: 24,
    timestamp: '2026-09-29T19:00:00.000Z'
  },
  {
    _id: 'hc-2',
    name: 'Saurav (Senior Lead)',
    batch: 'Batch 2024–28',
    branch: 'CSE',
    message: 'Warmest welcome to all junior freshers! GCE Gaya stage is ready to make memories for life! Rock the night! 🔥🎉',
    likes: 38,
    timestamp: '2026-09-29T18:00:00.000Z'
  },
  {
    _id: 'hc-3',
    name: 'Aman Kumar',
    batch: 'Batch 2025–29',
    branch: 'Mechanical',
    message: 'Mechanical engineering boys are arriving in matching dark suits! Let\'s gooo! ⚡🕶️',
    likes: 19,
    timestamp: '2026-09-29T16:00:00.000Z'
  },
  {
    _id: 'hc-4',
    name: 'Sneha & Crew',
    batch: 'Batch 2024–28',
    branch: 'Civil',
    message: 'Food counters and DJ stage lighting preparations are underway. You guys are going to be amazed!',
    likes: 29,
    timestamp: '2026-09-29T15:00:00.000Z'
  }
];

const HypeWallSection = () => {
  const [cheers, setCheers] = useState(INITIAL_CHEERS);

  const [filter, setFilter] = useState('All');
  const [likedIds, setLikedIds] = useState({});
  const [form, setForm] = useState({
    name: '',
    batch: 'Batch 2025–29',
    branch: 'CSE',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '', loading: false });

  const checkAdminAuth = () => {
    const token = localStorage.getItem('kshitiz_admin_token') || localStorage.getItem('astra_admin_token');
    setIsAdmin(!!token);
  };

  useEffect(() => {
    checkAdminAuth();
    window.addEventListener('storage', checkAdminAuth);
    window.addEventListener('focus', checkAdminAuth);
    return () => {
      window.removeEventListener('storage', checkAdminAuth);
      window.removeEventListener('focus', checkAdminAuth);
    };
  }, []);

  const fetchCheers = async () => {
    try {
      const res = await fetch(apiUrl('/api/hype-cheers'));
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        setCheers(data.data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchCheers();
  }, []);

  const confirmDeleteShoutout = async () => {
    const token = localStorage.getItem('kshitiz_admin_token') || localStorage.getItem('astra_admin_token');
    if (!token || !deleteModal.id) return;
    setDeleteModal(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch(apiUrl(`/api/admin/hype-cheers/${deleteModal.id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setCheers(prev => prev.filter(c => c._id !== deleteModal.id));
        setDeleteModal({ isOpen: false, id: null, name: '', loading: false });
      } else {
        alert(data.message || 'Failed to delete shoutout');
        setDeleteModal(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      alert('Error deleting shoutout');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleLike = async (id) => {
    if (likedIds[id]) return;

    setLikedIds(prev => ({ ...prev, [id]: true }));
    setCheers(prev => prev.map(c => c._id === id ? { ...c, likes: c.likes + 1 } : c));

    try {
      await fetch(apiUrl(`/api/hype-cheers/${id}/like`), { method: 'POST' });
    } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/hype-cheers'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCheers(prev => [data.data, ...prev]);
        setForm({ name: '', batch: 'Batch 2025–29', branch: 'CSE', message: '' });
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    } catch (err) {
      const newCheer = {
        _id: `hc-${Date.now()}`,
        name: form.name.trim(),
        batch: form.batch,
        branch: form.branch,
        message: form.message.trim(),
        likes: 1,
        timestamp: new Date().toISOString()
      };
      setCheers(prev => [newCheer, ...prev]);
      setForm({ name: '', batch: 'Batch 2025–29', branch: 'CSE', message: '' });
    } finally {
      setLoading(false);
    }
  };

  const filteredCheers = filter === 'All' 
    ? cheers 
    : cheers.filter(c => c.batch.includes(filter));

  return (
    <section id="hype-wall" className="py-20 sm:py-28 px-4 sm:px-6 max-w-6xl mx-auto relative z-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-3">
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            Live Batch Shoutouts
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-heading tracking-tight">
            Fresher Hype & Shoutout Wall
          </h2>
          <p className="text-slate-400 text-sm sm:text-base md:text-lg mt-2 max-w-xl">
            Drop a message for your batchmates, cheer for your department performers, or share your excitement for Kshitiz '25!
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['All', '2025–29', '2024–28'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'glass-card text-slate-300 hover:text-white'
              }`}
            >
              {tab === 'All' ? 'All Hype' : `Batch ${tab}`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Post Form */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" /> Post a Live Shoutout
          </h3>
          <p className="text-xs text-slate-400 mb-5">
            Will be visible live to all freshers and seniors across campus.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Your Name / Alias *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Riya / Fresher25"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-white placeholder-slate-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Batch
                </label>
                <select
                  value={form.batch}
                  onChange={(e) => setForm({ ...form, batch: e.target.value })}
                  className="w-full glass-input px-3 py-2.5 rounded-xl text-white text-xs bg-slate-900"
                >
                  <option value="Batch 2025–29">Batch 2025–29 (Fresher)</option>
                  <option value="Batch 2024–28">Batch 2024–28 (Senior)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Branch
                </label>
                <select
                  value={form.branch}
                  onChange={(e) => setForm({ ...form, branch: e.target.value })}
                  className="w-full glass-input px-3 py-2.5 rounded-xl text-white text-xs bg-slate-900"
                >
                  {['CSE', 'ECE', 'EE', 'ME', 'Civil', 'B.arch'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Shoutout Message *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Write your cheer, confession, or batch excitement..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-white placeholder-slate-500 text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Shoutout</span>
            </button>
          </form>
        </div>

        {/* Live Shoutouts Feed */}
        <div className="lg:col-span-7 space-y-4">
          {filteredCheers.map(item => {
            const isLiked = !!likedIds[item._id];

            return (
              <div 
                key={item._id}
                className="glass-card p-5 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between text-left group"
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 p-[1px]">
                      <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-[11px] font-bold text-white">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.name}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span className="text-cyan-300 font-semibold">{item.batch}</span>
                        <span>•</span>
                        <span className="text-pink-300">{item.branch}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-500">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-3">
                  {item.message}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">#Kshitiz2025 #GCEGaya</span>
                    {isAdmin && (
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, id: item._id, name: item.name, loading: false })}
                        title="Admin: Delete this shoutout"
                        className="flex items-center gap-1 text-[10px] text-rose-400 hover:text-white hover:bg-rose-600 px-2 py-0.5 rounded-md transition-all cursor-pointer border border-rose-500/30 shadow-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleLike(item._id)}
                    disabled={isLiked}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isLiked
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-rose-400' : ''}`} />
                    <span className="font-mono text-[11px]">{item.likes}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Live Shoutout"
        message={`Permanently delete the live shoutout from "${deleteModal.name}"? It will be removed immediately from the live Hype Wall.`}
        confirmText="Yes, Delete"
        onConfirm={confirmDeleteShoutout}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, name: '', loading: false })}
        loading={deleteModal.loading}
      />

    </section>
  );
};

export default HypeWallSection;
