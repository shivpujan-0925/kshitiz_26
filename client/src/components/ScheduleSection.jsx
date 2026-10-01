import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  MapPin, 
  Sparkles, 
  Flame, 
  Crown, 
  Music, 
  Utensils, 
  CheckCircle2, 
  Download,
  Bookmark,
  Search,
  Filter
} from 'lucide-react';

const defaultScheduleEvents = [
  {
    id: 'ev-1',
    time: '04:30 PM',
    title: 'Red Carpet Arrivals & QR Pass Check-in',
    category: 'Ceremony',
    venue: 'Academic campus, GCE Porch',
    description: 'Freshers step onto the illuminated starlight carpet, collect personalized batch bands, and strike poses at the 360° photo booth.',
    icon: Sparkles,
    highlight: false
  },
  {
    id: 'ev-2',
    time: '05:15 PM',
    title: 'Auspicious Lamp Lighting & Senior Welcome',
    category: 'Ceremony',
    venue: 'Academic campus, GCE Stage',
    description: 'Traditional Saraswati Vandana followed by keynote addresses from the Principal, HODs, and Batch 2024–28 conveners.',
    icon: Calendar,
    highlight: false
  },
  {
    id: 'ev-3',
    time: '05:45 PM',
    title: 'Senior Inaugural Dance: "Horizon Awakening"',
    category: 'Dance',
    venue: 'Main Stage',
    description: 'A breathtaking high-energy fusion choreography by 2nd-year seniors to officially ignite the Kshitiz \'25 stage.',
    icon: Flame,
    highlight: true
  },
  {
    id: 'ev-4',
    time: '06:15 PM',
    title: 'Mr. & Miss Kshitiz: Round 1 (Cosmic Ramp Walk)',
    category: 'Royalty',
    venue: 'Grand Runway Catwalk',
    description: 'Shortlisted fresher contestants showcase their charisma, confidence, and bespoke ethnic / formal attire under spotlights.',
    icon: Crown,
    highlight: true
  },
  {
    id: 'ev-5',
    time: '07:15 PM',
    title: 'College Rock Band Showdown & Solo Melodies',
    category: 'Music',
    venue: 'Main Stage & Acoustics',
    description: 'Live electric guitars, acoustic covers, beatboxing battles, and viral song medleys by the best musical talents.',
    icon: Music,
    highlight: false
  },
  {
    id: 'ev-6',
    time: '08:00 PM',
    title: 'Mr. & Miss Kshitiz: Round 2 (Talent & Wit Q/A)',
    category: 'Royalty',
    venue: 'Grand Runway Catwalk',
    description: 'Contestants dazzle with quick-fire intellectual questions, situational humor, and 60-second spontaneous spotlight acts.',
    icon: Crown,
    highlight: true
  },
  {
    id: 'ev-7',
    time: '08:45 PM',
    title: 'Standup Comedy & Department Skits',
    category: 'Performance',
    venue: 'Center Stage',
    description: 'Hilarious campus roast, hostel chronicles, and witty mimicry acts that will leave the entire auditorium roaring with laughter.',
    icon: Flame,
    highlight: false
  },
  {
    id: 'ev-8',
    time: '09:15 PM',
    title: 'The Royal Crowning Ceremony: Mr. & Miss Kshitiz',
    category: 'Royalty',
    venue: 'Main Stage Spotlight',
    description: 'Official sashes, golden crowns, trophies, and title recognitions presented to the newly elected royalty of Batch 2025–2029.',
    icon: Crown,
    highlight: true
  },
  {
    id: 'ev-9',
    time: '09:45 PM',
    title: 'Electrifying DJ Night & Starlight Dance Arena',
    category: 'DJ & Dance',
    venue: 'Academic campus Open Air Arena',
    description: 'Heavy bass drops, laser fog machines, crowd anthems, and neon glowsticks as the entire batch hits the open-air dance floor!',
    icon: Music,
    highlight: true
  },
  {
    id: 'ev-10',
    time: '10:45 PM',
    title: 'Gala Feast & Memory Photowall Session',
    category: 'Feast',
    venue: 'Campus Dining Lawn',
    description: 'Sumptuous multi-cuisine dinner buffet, desserts, and keepsake polaroid group photos with your new college family.',
    icon: Utensils,
    highlight: false
  }
];

const getCategoryIcon = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('dance')) return Flame;
  if (cat.includes('music')) return Music;
  if (cat.includes('royalty')) return Crown;
  if (cat.includes('feast') || cat.includes('food')) return Utensils;
  if (cat.includes('ceremony')) return Calendar;
  return Sparkles;
};

const ScheduleSection = ({ schedule }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookmarked, setBookmarked] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const events = (schedule && schedule.length > 0) ? schedule : defaultScheduleEvents;
  const categories = ['All', 'Ceremony', 'Royalty', 'Music', 'DJ & Dance', 'Feast'];

  const toggleBookmark = (id) => {
    setBookmarked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredEvents = events.filter(ev => {
    const matchesCategory = selectedCategory === 'All' || (ev.category || '').toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = (ev.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (ev.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (ev.venue || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Generate downloadable .ics calendar file
  const downloadCalendarFile = () => {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//GCE Gaya//Kshitiz 2026//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'SUMMARY:Kshitiz \'25 - Gaya College of Engineering Annual Fresher Conclave',
      'DESCRIPTION:The Grand Annual Fresher Party welcoming Batch 2025-2029 organized by Batch 2024-2028 at Gaya College of Engineering.',
      'LOCATION:Academic campus, GCE, Gaya, Bihar',
      'DTSTART:20261008T113000Z',
      'DTEND:20261008T173000Z',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Kshitiz_2026_Event_Schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="schedule" className="py-20 sm:py-28 px-4 sm:px-6 max-w-6xl mx-auto relative z-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-widest mb-3">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            Official Event Timeline
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-heading tracking-tight">
            Schedule of Kshitiz '25
          </h2>
          <p className="text-slate-400 text-sm sm:text-base md:text-lg mt-2 max-w-xl">
            From the grand red carpet inauguration to the starlight DJ night — plan your evening so you don't miss a single beat!
          </p>
        </div>

        {/* Add to Calendar Button */}
        <button
          onClick={downloadCalendarFile}
          className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 hover:bg-cyan-900/50 hover:border-cyan-400 shadow-xl transition-all cursor-pointer w-fit"
          title="Download .ics Calendar Invite"
        >
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>Add to Google / Apple Calendar</span>
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Controls: Search & Category Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md shadow-purple-600/30'
                  : 'glass-card text-slate-300 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search acts, times, stages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500"
          />
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="space-y-4">
        {filteredEvents.map((ev, index) => {
          const eventId = ev._id || ev.id || `ev-${index}`;
          const Icon = (typeof ev.icon === 'function') ? ev.icon : getCategoryIcon(ev.category);
          const isStarred = !!bookmarked[eventId];

          return (
            <div
              key={eventId}
              className={`glass-card rounded-2xl p-5 sm:p-6 border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden group ${
                ev.highlight
                  ? 'border-purple-500/40 bg-gradient-to-r from-purple-950/20 via-slate-900/60 to-cyan-950/20 shadow-xl shadow-purple-950/40'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Highlight ribbon accent */}
              {ev.highlight && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-500 via-pink-500 to-cyan-400" />
              )}

              {/* Time Column */}
              <div className="flex items-center gap-3.5 md:min-w-[170px]">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-cyan-400 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-black font-mono text-cyan-300 tracking-tight block">
                    {ev.time}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    Slot #{index + 1}
                  </span>
                </div>
              </div>

              {/* Description Body */}
              <div className="flex-1 md:px-4 text-left">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                    {ev.title}
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-slate-300">
                    {ev.category}
                  </span>
                  {ev.highlight && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/40">
                      ★ Major Highlight
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-2">
                  {ev.description}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  <span>{ev.venue}</span>
                </div>
              </div>

              {/* Action Column: Bookmark */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => toggleBookmark(eventId)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isStarred
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/10 hover:border-white/20'
                  }`}
                  title={isStarred ? 'Saved to My Plan' : 'Save to My Plan'}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                  <span className="hidden sm:inline">{isStarred ? 'Saved' : 'Remind'}</span>
                </button>
              </div>

            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="text-center py-12 glass-panel rounded-2xl border border-white/10">
            <p className="text-sm text-slate-400">No events found matching your filter criteria.</p>
          </div>
        )}
      </div>

    </section>
  );
};

export default ScheduleSection;
