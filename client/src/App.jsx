import React, { useState, useEffect } from 'react';
import ParticleBackground from './components/ParticleBackground';
import FloatingDock from './components/FloatingDock';
import HeroSection from './components/HeroSection';
import AnnouncementsSection from './components/AnnouncementsSection';
import ScheduleSection from './components/ScheduleSection';
import RegistrationSection from './components/RegistrationSection';
import HypeWallSection from './components/HypeWallSection';
import GallerySection from './components/GallerySection';
import HallOfFameSection from './components/HallOfFameSection';
import AdminModal from './components/AdminModal';
import { InstagramIcon } from './components/InstagramIcon';
import { ExternalLink, ShieldCheck, Ticket } from 'lucide-react';
import { apiUrl } from './config/api';

function App() {
  const [settings, setSettings] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [posters, setPosters] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Load public data
  const fetchData = async () => {
    try {
      const [setRes, annRes, galRes, postRes, schRes] = await Promise.all([
        fetch(apiUrl('/api/settings')),
        fetch(apiUrl('/api/announcements')),
        fetch(apiUrl('/api/gallery')),
        fetch(apiUrl('/api/posters')),
        fetch(apiUrl('/api/schedule'))
      ]);

      const [sett, ann, gal, post, sch] = await Promise.all([
        setRes.json(),
        annRes.json(),
        galRes.json(),
        postRes.json(),
        schRes.json()
      ]);

      if (sett.success) setSettings(sett.data);
      if (ann.success) setAnnouncements(ann.data);
      if (gal.success) setGallery(gal.data);
      if (post.success) setPosters(post.data);
      if (sch.success) setSchedule(sch.data);
    } catch (err) {
      console.warn('Backend API connection notice (using resilient defaults):', err.message);
    }
  };

  useEffect(() => {
    fetchData();

    // Scroll listener to update active dock section
    const handleScroll = () => {
      const sections = ['hero', 'schedule', 'register', 'hype-wall', 'glimpses', 'hall-of-fame'];
      const scrollPos = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#030712] text-slate-100 relative font-sans selection:bg-purple-600 selection:text-white">
      
      {/* 1. Stardust Dynamic Canvas & Cosmic Aura Mesh */}
      <ParticleBackground />

      {/* 2. Main Web Layout */}
      <main className="relative z-10 w-full overflow-x-hidden">
        
        {/* Hero & Batch Genesis Spotlight with live crowd reactions */}
        <HeroSection
          settings={settings}
          posters={posters}
          onRegisterClick={() => scrollToSection('register')}
          onLookupClick={() => scrollToSection('register')}
        />

        {/* Live Broadcast / Urgent Announcements */}
        <AnnouncementsSection announcements={announcements} />

        {/* Interactive Event Schedule & Timetable */}
        <ScheduleSection schedule={schedule} onRefresh={fetchData} />

        {/* Live Dynamic VIP Pass Generator & Roll Lookup Portal */}
        <RegistrationSection onRegisterSuccess={fetchData} />

        {/* Interactive Fresher Shoutout & Hype Wall */}
        <HypeWallSection />

        {/* Glimpses of Party Gallery & Google Drive Vault */}
        <GallerySection
          gallery={gallery}
          googleDriveLink={settings?.googleDriveLink}
        />

        {/* Hall of Fame: Mr & Miss Kshitiz 2026 Crowning & Judging Criteria */}
        <HallOfFameSection awards={settings ? { mrFresher: settings.mrFresher, mrsFresher: settings.mrsFresher } : null} />

      </main>

      {/* 3. Immersive Floating Action HUD Dock with Ambient Synth Audio Player */}
      <FloatingDock
        activeSection={activeSection}
        onNavigate={scrollToSection}
        instagramLink={settings?.instagramLink}
        googleDriveLink={settings?.googleDriveLink}
        openAdminModal={() => setIsAdminOpen(true)}
      />

      {/* 4. Sleek Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12 px-4 text-center pb-28">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl font-brand font-extrabold text-gradient-cosmic">KSHITIZ '26</span>
            <span className="text-slate-500">•</span>
            <span className="text-xs font-semibold text-slate-400">Gaya College of Engineering, Gaya</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-400">
            Crafted with passion & pride by <strong className="text-purple-300">Batch 2024–28</strong> to welcome the brilliant minds of <strong className="text-cyan-300">Batch 2025–29</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <a 
              href={settings?.instagramLink || 'https://instagram.com/gce_gaya_official'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-pink-400 flex items-center gap-1 transition-colors"
            >
              <InstagramIcon className="w-3.5 h-3.5" /> Instagram Official
            </a>
            <span>•</span>
            {settings?.googleDriveLink && (
              <a 
                href={settings.googleDriveLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-yellow-400 flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> HD Photos Drive
              </a>
            )}
            <span>•</span>
            <button
              onClick={() => scrollToSection('register')}
              className="hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Ticket className="w-3.5 h-3.5" /> VIP Pass Verification
            </button>
            <span>•</span>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="hover:text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Organizing Desk
            </button>
          </div>
        </div>
      </footer>

      {/* 5. Cyber-Cockpit Admin Management Portal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onDataRefresh={fetchData}
      />
    </div>
  );
}

export default App;
