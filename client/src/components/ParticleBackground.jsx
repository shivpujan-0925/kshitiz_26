import React from 'react';

const ParticleBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dynamic Cosmic Gradient Meshes */}
      <div className="absolute -top-[25%] -left-[10%] w-[65vw] h-[65vw] bg-purple-900/20 rounded-full blur-[140px] animate-pulse-glow" />
      <div className="absolute top-[35%] -right-[15%] w-[60vw] h-[60vw] bg-cyan-900/15 rounded-full blur-[140px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute -bottom-[20%] left-[20%] w-[55vw] h-[55vw] bg-pink-900/15 rounded-full blur-[140px] animate-pulse-glow" style={{ animationDelay: '3s' }} />
      
      {/* Cyber Grid Subtle Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />
    </div>
  );
};

export default ParticleBackground;
