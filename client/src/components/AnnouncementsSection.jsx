import React from 'react';
import { Radio, Calendar, Sparkles } from 'lucide-react';

const AnnouncementsSection = ({ announcements }) => {
  if (!announcements || announcements.length === 0) {
    return null;
  }

  return (
    <section id="announcements" className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto relative z-10">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 shadow-lg shadow-purple-950/40">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">Live Broadcast</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">Notice & Announcements</h2>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 w-fit">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Official Dispatch from Batch 2024–28</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {announcements.map((item) => (
          <div
            key={item._id}
            className="glass-card p-6 sm:p-7 rounded-3xl relative overflow-hidden flex flex-col justify-between group hover:border-purple-500/40"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm ${
                item.tag === 'Urgent' 
                  ? 'bg-red-500/20 text-red-300 border-red-500/40' 
                  : item.tag === 'Theme'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              }`}>
                {item.tag || 'Notice'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium bg-white/5 px-2.5 py-1 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-purple-300 transition-colors leading-snug">
              {item.title}
            </h3>
            <p className="text-sm text-slate-300/90 leading-relaxed">
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AnnouncementsSection;
