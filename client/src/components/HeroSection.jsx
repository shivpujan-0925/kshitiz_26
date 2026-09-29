import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Trophy, 
  Flame, 
  Ticket, 
  Clock, 
  Users, 
  Zap, 
  Heart,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';

const HeroSection = ({ settings, onRegisterClick, onLookupClick, posters }) => {
  const targetDate = settings?.eventDate ? new Date(settings.eventDate).getTime() : new Date('2026-10-08T17:00:00').getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [floatingReactions, setFloatingReactions] = useState([]);
  const [reactionCounts, setReactionCounts] = useState({
    '🔥': 148,
    '💃': 92,
    '👑': 114,
    '🎸': 78,
    '⚡': 130,
    '🎉': 165
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00F5D4', '#8B5CF6', '#EC4899', '#3B82F6', '#F59E0B']
    });
  };

  const handleReaction = (emoji) => {
    // Increase count
    setReactionCounts(prev => ({ ...prev, [emoji]: prev[emoji] + 1 }));

    // Add floating emoji
    const id = Date.now() + Math.random();
    const randomX = Math.floor(Math.random() * 60) - 30; // -30px to +30px offset
    setFloatingReactions(prev => [...prev.slice(-15), { id, emoji, x: randomX }]);

    // Clean up floating after 1.8s
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    }, 1800);

    // Mini confetti on flame and party
    if (emoji === '🔥' || emoji === '🎉') {
      confetti({
        particleCount: 25,
        spread: 45,
        startVelocity: 25,
        origin: { y: 0.8 },
        colors: emoji === '🔥' ? ['#F97316', '#EF4444', '#FBBF24'] : ['#8B5CF6', '#06B6D4', '#EC4899']
      });
    }
  };

  const activePoster = posters && posters.length > 0 ? posters[0] : null;

  return (
    <section id="hero" className="relative min-h-[90vh] sm:min-h-screen flex flex-col justify-center items-center text-center px-3 sm:px-6 pt-10 sm:pt-16 pb-36 sm:pb-36 overflow-hidden">
      
      {/* Background radial spotlight */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] max-w-full h-[380px] bg-gradient-to-b from-purple-600/20 via-cyan-600/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* Top Pill: College & Batch Info */}
      <div className="inline-flex items-center gap-1.5 sm:gap-2.5 px-3 py-1.5 sm:px-5 sm:py-2 rounded-full glass-card border border-purple-500/30 text-[10px] sm:text-xs md:text-sm font-medium text-purple-200 mb-4 sm:mb-7 animate-float shadow-xl shadow-purple-950/50 max-w-full">
        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-cyan-400 animate-ping flex-shrink-0" />
        <span className="font-bold tracking-wider text-cyan-300 uppercase truncate">GAYA COLLEGE OF ENGINEERING</span>
        <span className="text-white/30 hidden sm:inline">•</span>
        <span className="text-slate-300 hidden sm:inline">Organized by Batch 2024–28</span>
      </div>

      {/* Main Title Typography: KSHITIZ '26 */}
      <div className="relative max-w-5xl w-full mx-auto mb-3 sm:mb-4 px-2">
        <div className="inline-block relative max-w-full">
          <h1 className="text-[2.6rem] min-[360px]:text-[3.1rem] min-[420px]:text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight font-brand uppercase leading-none select-none flex flex-wrap items-center justify-center">
            <span className="text-gradient-cosmic drop-shadow-[0_10px_35px_rgba(139,92,246,0.5)]">
              KSHITIZ
            </span>
            <span className="text-white font-light ml-2 sm:ml-3 text-[2.2rem] min-[360px]:text-[2.6rem] min-[420px]:text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-gradient-gold">
              '26
            </span>
          </h1>
          <div className="absolute -top-4 -right-6 hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-bold tracking-wider shadow-lg">
            <Zap className="w-3.5 h-3.5 fill-pink-400" />
            <span>ANNUAL FRESHER</span>
          </div>
        </div>

        <p className="mt-3.5 sm:mt-5 text-xs sm:text-base md:text-xl text-slate-200 font-normal tracking-wide max-w-xl sm:max-w-2xl mx-auto leading-relaxed px-2">
          The Grand Horizon welcoming the Trailblazers of{' '}
          <span className="font-bold text-cyan-300 bg-cyan-950/70 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg border border-cyan-500/30 inline-block shadow-sm text-xs sm:text-base mt-1 sm:mt-0">
            Batch 2025–2029
          </span>
        </p>
      </div>

      {/* Cosmic Countdown Timer */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-3 md:gap-4 my-4 sm:my-7 max-w-md sm:max-w-xl w-full px-1">
        {[
          { label: 'DAYS', value: timeLeft.days },
          { label: 'HOURS', value: timeLeft.hours },
          { label: 'MINUTES', value: timeLeft.minutes },
          { label: 'SECONDS', value: timeLeft.seconds },
        ].map((unit, idx) => (
          <div 
            key={idx} 
            className="glass-panel py-2.5 px-1 sm:py-4 sm:px-3 md:py-5 md:px-4 rounded-xl sm:rounded-2xl md:rounded-3xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group hover:border-cyan-500/50 hover:shadow-cyan-500/20 shadow-lg transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-xl min-[360px]:text-2xl sm:text-3xl md:text-5xl font-black font-mono text-white text-gradient tracking-tight">
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className="text-[8px] sm:text-[10px] md:text-xs font-bold tracking-widest text-slate-400 mt-0.5 sm:mt-1 uppercase">
              {unit.label}
            </span>
          </div>
        ))}
      </div>

      {/* Interactive Call to Action Buttons */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2.5 sm:gap-4 w-full max-w-xs sm:max-w-none mt-1 z-10 px-1">
        <button
          onClick={() => {
            triggerCelebration();
            onRegisterClick();
          }}
          className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-2.5 px-6 sm:px-9 py-3.5 sm:py-4 rounded-full text-sm sm:text-base md:text-lg font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 shadow-xl shadow-purple-600/30 hover:shadow-cyan-500/40 hover:scale-[1.02] sm:hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform text-yellow-300 flex-shrink-0" />
          <span>Register for Events & Pass</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1.5 transition-transform flex-shrink-0" />
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
          <a
            href="#schedule"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-6 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-sm font-semibold text-slate-200 glass-card hover:text-white hover:border-white/30 transition-all duration-200 whitespace-nowrap"
          >
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 flex-shrink-0" />
            <span>Event Schedule</span>
          </a>

          {onLookupClick && (
            <button
              onClick={onLookupClick}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-sm font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-400 transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0" />
              <span>Find My Pass</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Real-Time Live Hype Bar */}
      <div className="mt-5 sm:mt-7 relative max-w-xl w-full px-1">
        <div className="flex items-center justify-between px-2 py-1 text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
          <span>Live Crowd Hype Reactions</span>
          <span className="text-cyan-400 flex items-center gap-1 text-[10px] sm:text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Real-time Clickable
          </span>
        </div>
        <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2.5 p-1.5 sm:p-2 rounded-2xl glass-panel border border-white/10 shadow-lg overflow-x-auto no-scrollbar scroll-smooth">
          {Object.entries(reactionCounts).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-purple-500/40 transition-all active:scale-90 cursor-pointer text-xs sm:text-sm font-semibold group"
              title={`Send ${emoji} Reaction`}
            >
              <span className="text-base sm:text-lg group-hover:scale-125 transition-transform">{emoji}</span>
              <span className="text-slate-300 group-hover:text-white font-mono text-[10px] sm:text-[11px]">{count}</span>
            </button>
          ))}
        </div>

        {/* Floating Emojis Overlay */}
        <div className="absolute inset-x-0 bottom-full pointer-events-none h-40 overflow-hidden flex justify-center">
          {floatingReactions.map(r => (
            <div
              key={r.id}
              className="absolute text-2xl sm:text-3xl animate-float-fade"
              style={{
                transform: `translateX(${r.x}px)`,
                bottom: '10px'
              }}
            >
              {r.emoji}
            </div>
          ))}
        </div>
      </div>

      {/* Venue & Event Highlights Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-6 sm:mt-9 text-[11px] sm:text-xs md:text-sm text-slate-300 max-w-4xl w-full px-1">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 rounded-xl glass-card border border-white/5 shadow-md">
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 flex-shrink-0" />
          <span className="truncate">8 Oct • 5 PM</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 rounded-xl glass-card border border-white/5 shadow-md">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
          <span className="truncate">{settings?.venue || 'Campus Lawn, GCE'}</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 rounded-xl glass-card border border-white/5 shadow-md">
          <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0" />
          <span className="truncate">Royalty Crowning</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 rounded-xl glass-card border border-white/5 shadow-md">
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-400 flex-shrink-0" />
          <span className="truncate">Free Fresher Pass</span>
        </div>
      </div>

      {/* Featured Poster Banner if exists */}
      {activePoster && (
        <div className="mt-14 max-w-4xl w-full mx-auto px-2">
          <div className="glass-panel p-2 sm:p-3 rounded-3xl border border-white/10 overflow-hidden group shadow-2xl relative">
            <div className="relative aspect-[16/9] sm:aspect-[2.3/1] w-full rounded-2xl overflow-hidden bg-slate-950">
              <img
                src={activePoster.url}
                alt={activePoster.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex items-end p-5 sm:p-8">
                <div className="text-left">
                  <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase bg-purple-600/90 px-3 py-1 rounded-full text-white mb-2 inline-block shadow-md">
                    OFFICIAL REVEAL POSTER
                  </span>
                  <h3 className="text-xl sm:text-3xl font-extrabold text-white leading-tight">{activePoster.title}</h3>
                  {activePoster.description && (
                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 mt-1">{activePoster.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
