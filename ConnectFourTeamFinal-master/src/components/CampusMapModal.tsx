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
      <div className="relative w-full max-w-5xl h-[90vh] max-h-[850px] bg-[#0D1017] rounded-2xl shadow-2xl border border-[#1E2433] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2433] bg-[#0A0D14]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Amrita Ettimadai Campus Navigator
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  Coimbatore Main Campus
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {selectionMode ? 'Click on a landmark to set event venue location' : 'Interactive spatial view of campus landmarks and active event spots'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#131722] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Map Area + Sidebar Details */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Main Visual Map Area */}
          <div className="flex-1 relative bg-[#05070A] overflow-hidden flex flex-col">
            
            {/* Map Filter Chips */}
            <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5 p-1.5 bg-[#0D1017]/90 backdrop-blur rounded-xl border border-[#1E2433] shadow-sm text-xs">
              {['ALL', 'ACADEMIC', 'HALL', 'SPORTS', 'FOOD', 'GATE'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    activeCategoryFilter === cat
                      ? 'bg-[#22C55E]/10 border border-[#22C55E] text-[#22C55E]'
                      : 'text-slate-400 hover:text-white bg-[#131722] border border-[#232B3C]'
                  }`}
                >
                  {cat === 'ALL' ? 'All Zones' : cat}
                </button>
              ))}
            </div>

            {/* Interactive Campus SVG/Canvas Canvas */}
            <div className="flex-1 relative w-full h-full p-6 flex items-center justify-center">
              <div className="relative w-full max-w-[720px] aspect-[4/3] bg-[#07090E] rounded-2xl border-2 border-dashed border-[#1E2433] overflow-hidden shadow-inner">
                
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
                <div className="absolute bottom-3 left-3 bg-[#0D1017]/90 backdrop-blur px-2.5 py-1 rounded-lg border border-[#1E2433] text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
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
                      className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 z-20 focus:outline-none`}
                    >
                      {/* Pulse circle if has events */}
                      {landmarkEventsCount > 0 && (
                        <span className="absolute -inset-2 rounded-full bg-[#22C55E]/30 animate-ping pointer-events-none"></span>
                      )}

                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl shadow-md font-semibold text-xs transition-transform ${
                        isSelected
                          ? 'bg-[#22C55E] text-black font-bold scale-110 ring-4 ring-green-500/30 z-30'
                          : 'bg-[#131722] text-slate-200 hover:scale-105 border border-[#232B3C]'
                      }`}>
                        <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-[#22C55E]'}`} />
                        <span>{lm.short_code}</span>

                        {landmarkEventsCount > 0 && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                            isSelected ? 'bg-black/20 text-black font-bold' : 'bg-[#22C55E]/20 text-[#22C55E]'
                          }`}>
                            {landmarkEventsCount}
                          </span>
                        )}
                      </div>

                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap bg-[#0D1017] border border-[#1E2433] text-white text-[11px] px-2 py-1 rounded shadow pointer-events-none z-40">
                        {lm.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar Landmark Details Panel */}
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-[#1E2433] bg-[#0D1017] p-5 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                    {selectedLandmark.category} ZONE
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1.5">
                    {selectedLandmark.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Landmark Code: <code className="font-mono font-semibold text-[#22C55E]">{selectedLandmark.short_code}</code>
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {selectedLandmark.description}
              </p>

              {/* Popular For Tags */}
              <div className="mb-4">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Frequent Activities
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLandmark.popular_for.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-[#131722] border border-[#232B3C] text-slate-300 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Events at this Landmark */}
              <div className="mb-4 border-t border-[#1E2433] pt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#22C55E]" />
                    Happening Here ({activePostsForLandmark.length})
                  </label>
                </div>

                {activePostsForLandmark.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 bg-[#07090E] rounded-xl border border-[#1E2433]">
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
                        className="p-2.5 rounded-xl border border-[#1E2433] bg-[#07090E] hover:border-[#22C55E]/50 cursor-pointer transition-colors text-xs"
                      >
                        <div className="font-semibold text-white line-clamp-1 hover:text-[#22C55E]">
                          {post.title}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                          <span>{post.host_name}</span>
                          <span className="text-[#22C55E] font-medium flex items-center gap-0.5">
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
            <div className="pt-4 border-t border-[#1E2433] flex gap-2">
              {selectionMode ? (
                <button
                  onClick={() => {
                    if (onSelectLandmark) onSelectLandmark(selectedLandmark);
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-green-500/20"
                >
                  <MapPin className="w-4 h-4" />
                  Select "{selectedLandmark.short_code}" as Venue
                </button>
              ) : (
                <button
                  onClick={() => {
                    setActiveTab('feed');
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-full bg-[#131722] hover:bg-[#1A202F] text-white border border-[#232B3C] font-semibold text-xs flex items-center justify-center gap-1.5"
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
