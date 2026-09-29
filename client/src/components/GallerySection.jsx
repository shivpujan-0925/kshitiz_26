import React, { useState, useEffect } from 'react';
import { ExternalLink, Sparkles, X, Maximize2, ChevronLeft, ChevronRight, Download, Search, Image as ImageIcon } from 'lucide-react';

const GallerySection = ({ gallery, googleDriveLink }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Stage', 'DJ Night', 'Ramp Walk', 'Music', 'Memories', 'Campus'];

  const filteredPhotos = (gallery || []).filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Lightbox keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredPhotos]);

  const nextImage = () => {
    if (lightboxIndex !== null && lightboxIndex < filteredPhotos.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    } else {
      setLightboxIndex(0);
    }
  };

  const prevImage = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    } else {
      setLightboxIndex(filteredPhotos.length - 1);
    }
  };

  const currentPhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <section id="glimpses" className="py-20 sm:py-28 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-white/10">
        <div>
          <span className="text-xs font-bold tracking-widest text-pink-400 uppercase bg-pink-950/60 px-3.5 py-1.5 rounded-full border border-pink-500/30">
            Unforgettable Atmosphere
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mt-3 font-heading tracking-tight">
            Glimpses of Kshitiz
          </h2>
          <p className="text-slate-400 text-sm sm:text-base md:text-lg mt-2 max-w-xl leading-relaxed">
            Relive the high-voltage euphoria, electric stage lights, and lifelong memories forged under the stars at Gaya College of Engineering.
          </p>
        </div>

        {/* Direct Google Drive Party Dump Button */}
        {googleDriveLink && (
          <a
            href={googleDriveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 sm:px-8 py-4 rounded-2xl font-bold text-sm text-yellow-300 bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 hover:border-yellow-400 shadow-xl shadow-yellow-950/50 transition-all group w-fit cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-yellow-400 group-hover:rotate-12 transition-transform" />
            <span>Open HD Drive Photo Vault</span>
            <ExternalLink className="w-4 h-4 text-yellow-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        )}
      </div>

      {/* Category Pills & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/40 scale-105'
                  : 'glass-card text-slate-300 hover:text-white hover:border-white/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search photos by title or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input pl-10 pr-4 py-2.5 rounded-full text-xs sm:text-sm text-white placeholder-slate-500"
          />
        </div>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredPhotos.map((photo, index) => (
          <div
            key={photo._id}
            onClick={() => setLightboxIndex(index)}
            className="group relative rounded-3xl overflow-hidden glass-card border border-white/10 cursor-pointer aspect-[4/3] bg-slate-900 shadow-xl"
          >
            <img
              src={photo.url}
              alt={photo.title}
              loading="lazy"
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            
            {/* Hover Backdrop Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
              <div className="self-end">
                <span className="p-2.5 rounded-full bg-white/20 text-white backdrop-blur-md inline-block">
                  <Maximize2 className="w-4 h-4" />
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-600 px-2.5 py-1 rounded text-white inline-block mb-1.5 shadow-sm">
                  {photo.category || 'Moments'}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">{photo.title}</h3>
              </div>
            </div>
          </div>
        ))}

        {filteredPhotos.length === 0 && (
          <div className="col-span-full py-16 text-center glass-panel rounded-3xl border border-white/10">
            <ImageIcon className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No photos found matching your search.</p>
          </div>
        )}
      </div>

      {/* Interactive Lightbox Modal with Next / Prev */}
      {currentPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-fade-in"
          onClick={() => setLightboxIndex(null)}
        >
          <div 
            className="relative max-w-5xl max-h-[92vh] w-full rounded-3xl overflow-hidden glass-panel border border-white/20 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Controls */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <a
                href={currentPhoto.url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="p-2.5 rounded-full bg-black/70 text-white hover:bg-white/20 transition-all cursor-pointer"
                title="Download Photo"
              >
                <Download className="w-5 h-5" />
              </a>
              <button
                onClick={() => setLightboxIndex(null)}
                className="p-2.5 rounded-full bg-black/70 text-white hover:bg-white/20 transition-all cursor-pointer"
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/70 text-white hover:bg-purple-600 transition-all cursor-pointer"
              title="Previous Photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/70 text-white hover:bg-purple-600 transition-all cursor-pointer"
              title="Next Photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Photo Container */}
            <div className="flex-1 flex items-center justify-center bg-black min-h-[50vh] max-h-[75vh]">
              <img
                src={currentPhoto.url}
                alt={currentPhoto.title}
                className="w-full h-full max-h-[75vh] object-contain"
              />
            </div>

            {/* Photo Footer Details */}
            <div className="p-5 bg-slate-950/90 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                  {currentPhoto.category} • Photo {lightboxIndex + 1} of {filteredPhotos.length}
                </span>
                <h4 className="text-lg font-bold text-white mt-0.5">{currentPhoto.title}</h4>
              </div>

              {googleDriveLink && (
                <a
                  href={googleDriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-yellow-400 hover:underline flex items-center gap-1.5"
                >
                  Download Full-Resolution from Drive <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
