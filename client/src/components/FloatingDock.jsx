import React from 'react';
import { 
  Sparkles, 
  UserCheck, 
  Image as ImageIcon, 
  Award, 
  Lock, 
  ExternalLink,
  Clock,
  MessageSquare
} from 'lucide-react';
import { InstagramIcon } from './InstagramIcon';

const FloatingDock = ({ 
  onNavigate, 
  activeSection, 
  instagramLink, 
  googleDriveLink,
  openAdminModal 
}) => {
  const navItems = [
    { id: 'hero', label: 'Genesis', icon: Sparkles },
    { id: 'schedule', label: 'Schedule', icon: Clock },
    { id: 'register', label: 'Pass', icon: UserCheck, highlight: true },
    { id: 'hype-wall', label: 'Hype Wall', icon: MessageSquare },
    { id: 'glimpses', label: 'Glimpses', icon: ImageIcon },
    { id: 'hall-of-fame', label: 'Royalty', icon: Award },
  ];

  return (
    <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center items-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-1 md:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full glass-panel shadow-2xl shadow-purple-950/70 border border-white/10 backdrop-blur-2xl transition-all duration-300 hover:border-purple-500/40">
        
        {/* Navigation Points */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer ${
                item.highlight
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 text-white shadow-lg shadow-purple-500/30 hover:scale-105'
                  : isActive
                  ? 'bg-white/15 text-white shadow-inner font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </button>
          );
        })}

        <div className="w-[1px] h-6 bg-white/15 mx-1 hidden sm:block" />

        {/* Instagram Link Hub */}
        <a
          href={instagramLink || 'https://instagram.com/gce_gaya_official'}
          target="_blank"
          rel="noopener noreferrer"
          title="Follow Official Instagram"
          className="p-2 rounded-full text-slate-300 hover:text-pink-400 hover:bg-pink-500/10 transition-all hover:scale-110"
        >
          <InstagramIcon className="w-4 h-4" />
        </a>

        {/* Google Drive Party Link */}
        {googleDriveLink && (
          <a
            href={googleDriveLink}
            target="_blank"
            rel="noopener noreferrer"
            title="Open HD Party Photo Vault (Google Drive)"
            className="p-2 rounded-full text-slate-300 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all hover:scale-110 hidden sm:block"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {/* Admin Login Trigger */}
        <button
          onClick={openAdminModal}
          title="Admin Control Hub"
          className="p-2 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all hover:scale-110 cursor-pointer"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FloatingDock;
