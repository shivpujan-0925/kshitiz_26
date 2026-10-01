import React, { useState } from 'react';
import { Crown, Sparkles, Star, Heart, Award, CheckCircle2, Flame, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiUrl } from '../config/api';

const HallOfFameSection = ({ awards }) => {
  const mr = awards?.mrFresher;
  const mrs = awards?.mrsFresher;

  const [activeTab, setActiveTab] = useState('royalty'); // 'royalty' or 'criteria'
  const [mrCheers, setMrCheers] = useState(mr?.cheersCount || 148);
  const [mrsCheers, setMrsCheers] = useState(mrs?.cheersCount || 172);
  const [cheeredMr, setCheeredMr] = useState(false);
  const [cheeredMrs, setCheeredMrs] = useState(false);

  // Artwork card images as defaults
  const mrDefaultCard = '/mr_fresher_card.jpg';
  const mrsDefaultCard = '/miss_fresher_card.jpg';

  const mrDisplayImage = mr?.imageUrl && !mr.imageUrl.includes('unsplash.com') 
    ? mr.imageUrl 
    : mrDefaultCard;

  const mrsDisplayImage = mrs?.imageUrl && !mrs.imageUrl.includes('unsplash.com') 
    ? mrs.imageUrl 
    : mrsDefaultCard;

  const handleCheerMr = async () => {
    if (cheeredMr) return;
    setCheeredMr(true);
    setMrCheers(prev => prev + 1);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#FBBF24', '#FCD34D']
    });

    try {
      await fetch(apiUrl('/api/royalty/cheer'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'mrFresher' })
      });
    } catch (e) {}
  };

  const handleCheerMrs = async () => {
    if (cheeredMrs) return;
    setCheeredMrs(true);
    setMrsCheers(prev => prev + 1);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#EC4899', '#F43F5E', '#FDA4AF']
    });

    try {
      await fetch(apiUrl('/api/royalty/cheer'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'mrsFresher' })
      });
    } catch (e) {}
  };

  return (
    <section id="hall-of-fame" className="py-20 sm:py-28 px-4 sm:px-6 max-w-6xl mx-auto relative z-10">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
          <Crown className="w-4 h-4 text-amber-400" />
          The Royal Crowning Ceremony
        </div>
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white font-heading tracking-tight">
          Mr. & Miss Kshitiz 2025
        </h2>
        <p className="text-slate-400 text-sm sm:text-base md:text-lg mt-3">
          Recognizing the icons of charm, intellect, stage presence, and celestial poise of Batch 2025–2029.
        </p>

        {/* Tab Toggle */}
        <div className="flex justify-center mt-6 px-2">
          <div className="inline-flex flex-wrap sm:flex-nowrap justify-center gap-1 p-1 sm:p-1.5 rounded-2xl glass-panel border border-white/10 max-w-full">
            <button
              onClick={() => setActiveTab('royalty')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'royalty'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>Royalty Candidates</span>
            </button>

            <button
              onClick={() => setActiveTab('criteria')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'criteria'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Judging Rounds & Criteria</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'royalty' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 max-w-4xl mx-auto">
          
          {/* Mr. Kshitiz Celestial Card */}
          <div className="group relative rounded-3xl p-1 bg-gradient-to-b from-amber-500/60 via-purple-500/20 to-transparent transition-all duration-500 hover:scale-[1.02] shadow-2xl">
            <div className="glass-panel rounded-[22px] p-6 sm:p-8 flex flex-col items-center text-center h-full relative overflow-hidden">
              
              {/* Background Glow */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Poster / Artwork Card Aspect Ratio Container */}
              <div className="relative mb-6 w-full max-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl shadow-amber-950/60 group-hover:border-amber-400 transition-colors">
                <img
                  src={mrDisplayImage}
                  alt="Mr. Kshitiz Card"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 right-3 p-2.5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-xl font-bold">
                  <Crown className="w-5 h-5 fill-current" />
                </div>
              </div>

              <span className="text-xs font-black tracking-widest uppercase text-amber-400 bg-amber-950/70 px-4 py-1.5 rounded-full border border-amber-500/40 mb-2 shadow-sm">
                {mr?.titleBadge || 'Mr. Kshitiz 2025'}
              </span>

              <h3 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
                {mr?.name || 'To Be Announced'}
              </h3>

              {mr?.announced ? (
                <div className="mt-3 space-y-1.5">
                  <p className="text-sm sm:text-base font-semibold text-cyan-300">{mr.branch}</p>
                  {mr.registrationNumber && (
                    <p className="text-xs font-mono text-slate-400 bg-white/5 px-3 py-1 rounded-md inline-block">
                      Roll: {mr.registrationNumber}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm text-amber-300 font-bold bg-amber-500/15 py-2 px-5 rounded-xl border border-amber-500/30 shadow-sm">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Official Winner Crowned
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 w-full">
                  <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-300 font-medium">
                    <Star className="w-4 h-4 text-amber-400 animate-spin-slow" />
                    <span>Grand Finale Stage Revelation</span>
                  </div>
                </div>
              )}

              {/* Interactive Cheer Button */}
              <div className="mt-6 pt-4 border-t border-white/10 w-full flex items-center justify-between">
                <span className="text-xs font-mono text-amber-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <strong>{mrCheers}</strong> Crowd Cheers
                </span>

                <button
                  onClick={handleCheerMr}
                  disabled={cheeredMr}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    cheeredMr
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                      : 'bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${cheeredMr ? 'fill-amber-400 text-amber-400' : ''}`} />
                  <span>{cheeredMr ? 'Cheered!' : 'Cheer Him'}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Miss Kshitiz Celestial Card */}
          <div className="group relative rounded-3xl p-1 bg-gradient-to-b from-pink-500/60 via-purple-500/20 to-transparent transition-all duration-500 hover:scale-[1.02] shadow-2xl">
            <div className="glass-panel rounded-[22px] p-6 sm:p-8 flex flex-col items-center text-center h-full relative overflow-hidden">
              
              {/* Background Glow */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-56 h-56 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Poster / Artwork Card Aspect Ratio Container */}
              <div className="relative mb-6 w-full max-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden border-2 border-pink-500/40 shadow-2xl shadow-pink-950/60 group-hover:border-pink-400 transition-colors">
                <img
                  src={mrsDisplayImage}
                  alt="Miss Kshitiz Card"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 right-3 p-2.5 rounded-full bg-gradient-to-br from-pink-400 to-rose-600 text-white shadow-xl font-bold">
                  <Crown className="w-5 h-5 fill-current" />
                </div>
              </div>

              <span className="text-xs font-black tracking-widest uppercase text-pink-400 bg-pink-950/70 px-4 py-1.5 rounded-full border border-pink-500/40 mb-2 shadow-sm">
                {mrs?.titleBadge || 'Miss Kshitiz 2025'}
              </span>

              <h3 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
                {mrs?.name || 'To Be Announced'}
              </h3>

              {mrs?.announced ? (
                <div className="mt-3 space-y-1.5">
                  <p className="text-sm sm:text-base font-semibold text-pink-300">{mrs.branch}</p>
                  {mrs.registrationNumber && (
                    <p className="text-xs font-mono text-slate-400 bg-white/5 px-3 py-1 rounded-md inline-block">
                      Roll: {mrs.registrationNumber}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm text-pink-300 font-bold bg-pink-500/15 py-2 px-5 rounded-xl border border-pink-500/30 shadow-sm">
                    <Sparkles className="w-4 h-4 text-pink-400" /> Official Winner Crowned
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 w-full">
                  <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-300 font-medium">
                    <Star className="w-4 h-4 text-pink-400 animate-spin-slow" />
                    <span>Grand Finale Stage Revelation</span>
                  </div>
                </div>
              )}

              {/* Interactive Cheer Button */}
              <div className="mt-6 pt-4 border-t border-white/10 w-full flex items-center justify-between">
                <span className="text-xs font-mono text-pink-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-pink-400" />
                  <strong>{mrsCheers}</strong> Crowd Cheers
                </span>

                <button
                  onClick={handleCheerMrs}
                  disabled={cheeredMrs}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    cheeredMrs
                      ? 'bg-pink-500/30 text-pink-300 border border-pink-500/50'
                      : 'bg-pink-500/15 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${cheeredMrs ? 'fill-pink-400 text-pink-400' : ''}`} />
                  <span>{cheeredMrs ? 'Cheered!' : 'Cheer Her'}</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* Criteria Tab */}
      {activeTab === 'criteria' && (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in text-left">
          
          <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-2xl font-black font-mono text-cyan-400 block mb-2">01</span>
              <h4 className="text-lg font-bold text-white mb-2">Round 1: Cosmic Runway Walk</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Poise, walking rhythm, posture, body language, and aesthetic adherence to the dress theme (Royal Midnight Blue, Emerald, or Regal Ethnic & Tuxedo).
              </p>
            </div>
            <span className="mt-4 text-[11px] font-bold text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded-lg border border-cyan-500/30 w-fit">
              Weightage: 35%
            </span>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-2xl font-black font-mono text-purple-400 block mb-2">02</span>
              <h4 className="text-lg font-bold text-white mb-2">Round 2: 60-Sec Talent Flash</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Individual spontaneous talent display — singing, dancing, monologue, beatboxing, impromptu poetry, or instrument performance.
              </p>
            </div>
            <span className="mt-4 text-[11px] font-bold text-purple-300 bg-purple-950/60 px-3 py-1 rounded-lg border border-purple-500/30 w-fit">
              Weightage: 35%
            </span>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-2xl font-black font-mono text-amber-400 block mb-2">03</span>
              <h4 className="text-lg font-bold text-white mb-2">Round 3: Faculty Jury Q&A</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Quick-thinking situational questions testing intellectual humor, humility, public speaking courage, and campus spirit.
              </p>
            </div>
            <span className="mt-4 text-[11px] font-bold text-amber-300 bg-amber-950/60 px-3 py-1 rounded-lg border border-amber-500/30 w-fit">
              Weightage: 30%
            </span>
          </div>

        </div>
      )}

    </section>
  );
};

export default HallOfFameSection;
