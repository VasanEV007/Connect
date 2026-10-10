import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CampusLandmark } from '../types';
import { X, MapPin, Calendar, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectLandmark?: (landmark: CampusLandmark) => void;
  selectionMode?: boolean;
}

export const CampusMapModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectLandmark,
  selectionMode = false,
}) => {
  const { landmarks, posts, setSelectedPostForDetail, setActiveTab } = useApp();
  const [selectedLandmark, setSelectedLandmark] = useState<CampusLandmark>(landmarks[0]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Find posts scheduled for this landmark
  const activePostsForLandmark = posts.filter(p => 
    p.venue_name.toLowerCase().includes(selectedLandmark.short_code.toLowerCase()) ||
    p.venue_name.toLowerCase().includes(selectedLandmark.name.toLowerCase().slice(0, 10))
  );

  const filteredLandmarks = activeCategoryFilter === 'ALL'
    ? landmarks
    : landmarks.filter(lm => lm.category === activeCategoryFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[90vh] max-h-[850px] bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-border)] flex flex-col overflow-hidden text-[var(--color-text-main)]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-card)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-burgundy/15 text-[var(--color-burgundy)] border border-[var(--color-burgundy)]/30 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[var(--color-text-main)]">
                  Amrita Ettimadai Campus Navigator
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-burgundy/10 text-[var(--color-burgundy)] border border-[var(--color-burgundy)]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-burgundy)]" />
                  Coimbatore Main Campus
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                {selectionMode ? 'Click on a landmark to set event venue location' : 'Interactive spatial view of campus landmarks and active event spots'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Map Area + Sidebar Details */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Main Visual Map Area */}
          <div className="flex-1 relative bg-[var(--color-surface)] overflow-hidden flex flex-col">
            
            {/* Map Filter Chips */}
            <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5 p-1.5 bg-[var(--color-surface-card)]/90 backdrop-blur rounded-xl border border-[var(--color-border)] shadow-sm text-xs">
              {['ALL', 'ACADEMIC', 'HALL', 'SPORTS', 'FOOD', 'GATE'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeCategoryFilter === cat
                      ? 'bg-[var(--color-burgundy)] text-[#E5DED2] border border-[var(--color-burgundy)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-[var(--color-surface)] border border-[var(--color-border)]'
                  }`}
                >
                  {cat === 'ALL' ? 'All Zones' : cat}
                </button>
              ))}
            </div>

            {/* Interactive Campus SVG/Canvas Canvas */}
            <div className="flex-1 relative w-full h-full p-6 flex items-center justify-center">
              <div className="relative w-full max-w-[720px] aspect-[4/3] bg-[var(--color-surface-card)] rounded-2xl border-2 border-dashed border-[var(--color-border)] overflow-hidden shadow-inner">
                
                {/* SVG Visual Campus Pathways and Layout */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
                  {/* Western Ghats Hills Outline */}
                  <path d="M0,40 Q100,10 200,30 T400,20 T600,40 T720,20 L720,0 L0,0 Z" fill="currentColor" className="text-emerald-500/20" />
                  
                  {/* Main Ring Road Pathways */}
                  <path d="M100,600 C150,500 200,400 250,250 C300,150 450,150 550,250 C620,320 650,450 600,600 Z" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="6 6" className="text-slate-700" />
                  <path d="M100,600 L120,500 L250,450 L380,420 L480,450 L600,500" fill="none" stroke="currentColor" strokeWidth="6" className="text-[#22C55E]/30" />
                  
                  {/* Central Lawn & Water Feature */}
                  <ellipse cx="360" cy="300" rx="90" ry="55" fill="currentColor" className="text-emerald-500/15" />
                  <ellipse cx="360" cy="300" rx="30" ry="18" fill="currentColor" className="text-emerald-400/20" />
                </svg>

                {/* Campus North / South Orientation Indicator */}
                <div className="absolute bottom-3 left-3 bg-[var(--color-surface-card)]/90 backdrop-blur px-2.5 py-1 rounded-lg border border-[var(--color-border)] text-[11px] font-mono text-[var(--color-text-muted)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-burgundy)] animate-pulse"></span>
                  Ettimadai Valley • 10.9015° N, 76.9012° E
                </div>

                {/* Interactive Landmarks Pins */}
                {filteredLandmarks.map((lm) => {
                  const isSelected = selectedLandmark.id === lm.id;
                  const landmarkEventsCount = posts.filter(p => 
                    p.venue_name.toLowerCase().includes(lm.short_code.toLowerCase()) ||
                    p.venue_name.toLowerCase().includes(lm.name.toLowerCase().slice(0, 10))
                  ).length;

                  return (
                    <button
                      key={lm.id}
                      onClick={() => setSelectedLandmark(lm)}
                      style={{
                        left: `${lm.x_percent}%`,
                        top: `${lm.y_percent}%`,
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 z-20 focus:outline-none cursor-pointer`}
                    >
                      {/* Pulse circle if has events */}
                      {landmarkEventsCount > 0 && (
                        <span className="absolute -inset-2 rounded-full bg-burgundy/30 animate-ping pointer-events-none"></span>
                      )}

                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl shadow-md font-semibold text-xs transition-transform ${
                        isSelected
                          ? 'bg-[var(--color-burgundy)] text-[#E5DED2] font-bold scale-110 ring-4 ring-burgundy/30 z-30'
                          : 'bg-[var(--color-surface-card)] text-[var(--color-text-main)] hover:scale-105 border border-[var(--color-border)]'
                      }`}>
                        <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-[#E5DED2]' : 'text-[var(--color-burgundy)]'}`} />
                        <span>{lm.short_code}</span>

                        {landmarkEventsCount > 0 && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                            isSelected ? 'bg-black/20 text-[#E5DED2] font-bold' : 'bg-burgundy/20 text-[var(--color-burgundy)]'
                          }`}>
                            {landmarkEventsCount}
                          </span>
                        )}
                      </div>

                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[var(--color-text-main)] text-[11px] px-2 py-1 rounded shadow pointer-events-none z-40">
                        {lm.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar Landmark Details Panel */}
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-[var(--color-border)] bg-[var(--color-surface-card)] p-5 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-burgundy/15 border border-[var(--color-burgundy)]/30 text-[var(--color-burgundy)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-burgundy)]" />
                    {selectedLandmark.category} ZONE
                  </span>
                  <h3 className="text-lg font-bold text-[var(--color-text-main)] mt-1.5">
                    {selectedLandmark.name}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    Landmark Code: <code className="font-mono font-semibold text-[var(--color-burgundy)]">{selectedLandmark.short_code}</code>
                  </p>
                </div>
              </div>

              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-4">
                {selectedLandmark.description}
              </p>

              {/* Popular For Tags */}
              <div className="mb-4">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1.5">
                  Frequent Activities
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLandmark.popular_for.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Events at this Landmark */}
              <div className="mb-4 border-t border-[var(--color-border)] pt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[var(--color-burgundy)]" />
                    Happening Here ({activePostsForLandmark.length})
                  </label>
                </div>

                {activePostsForLandmark.length === 0 ? (
                  <p className="text-xs text-[var(--color-text-muted)] italic p-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
                    No active sessions currently scheduled at this spot.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {activePostsForLandmark.map(post => (
                      <div 
                        key={post.id}
                        onClick={() => {
                          setSelectedPostForDetail(post);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-burgundy)]/50 cursor-pointer transition-colors text-xs"
                      >
                        <div className="font-semibold text-[var(--color-text-main)] line-clamp-1 hover:text-[var(--color-burgundy)]">
                          {post.title}
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted)] flex items-center justify-between mt-1">
                          <span>{post.host_name}</span>
                          <span className="text-[var(--color-burgundy)] font-medium flex items-center gap-0.5">
                            Details <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[var(--color-border)] flex gap-2">
              {selectionMode ? (
                <button
                  onClick={() => {
                    if (onSelectLandmark) onSelectLandmark(selectedLandmark);
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-full bg-[var(--color-burgundy)] hover:opacity-95 text-[#E5DED2] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  Select "{selectedLandmark.short_code}" as Venue
                </button>
              ) : (
                <button
                  onClick={() => {
                    setActiveTab('events');
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-full bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-main)] border border-[var(--color-border)] font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Explore All Campus Events
                </button>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
