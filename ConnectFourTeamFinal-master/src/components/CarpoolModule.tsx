import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Car, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Plus, 
  ArrowRight, 
  Navigation
} from 'lucide-react';

export const CarpoolModule: React.FC = () => {
  const { 
    posts, 
    currentUser, 
    setIsCreatePostModalOpen, 
    setSelectedPostForDetail, 
    applications 
  } = useApp();

  const [destinationFilter, setDestinationFilter] = useState<string>('ALL');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');

  // Filter posts where category is CARPOOL
  const carpoolPosts = posts.filter(p => {
    if (p.category !== 'CARPOOL') return false;

    if (destinationFilter !== 'ALL') {
      const q = destinationFilter.toLowerCase();
      if (!p.carpool_destination?.toLowerCase().includes(q) && !p.title.toLowerCase().includes(q)) {
        return false;
      }
    }

    if (genderFilter !== 'ALL') {
      if (p.carpool_gender_pref !== genderFilter) return false;
    }

    return true;
  });

  const popularDestinations = [
    { label: 'All Routes', value: 'ALL' },
    { label: '🚆 Coimbatore Junction (CBE)', value: 'Junction' },
    { label: '✈️ Airport (CJB)', value: 'Airport' },
    { label: '🚌 Gandhipuram Bus Stand', value: 'Gandhipuram' },
    { label: '🛍️ Brookefields / RS Puram', value: 'Brookefields' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Hero Strip */}
      <div className="bg-[#0A0D14] border border-[#1E2433] text-white p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-xs font-semibold border border-[#22C55E]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            <Car className="w-3.5 h-3.5" />
            Amrita Travel & Carpool Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Share Cabs, Save Money & Travel Safely
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Coordinating rides to Coimbatore Junction, Airport, or Gandhipuram? Pool together with verified students from your campus to split fares and travel securely.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setIsCreatePostModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-green-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Post a Carpool / Cab Share
            </button>
          </div>
        </div>

        {/* Decorative background vectors */}
        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-10 translate-y-10">
          <Navigation className="w-96 h-96 text-[#22C55E]" />
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-[#0D1017] p-4 rounded-xl border border-[#1E2433] flex flex-wrap items-center justify-between gap-4">
        
        {/* Destination Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {popularDestinations.map((dest) => (
            <button
              key={dest.value}
              onClick={() => setDestinationFilter(dest.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                destinationFilter === dest.value
                  ? 'bg-[#22C55E]/10 border border-[#22C55E] text-[#22C55E]'
                  : 'bg-[#131722] hover:bg-[#1A202F] text-slate-300 hover:text-white border border-[#232B3C]'
              }`}
            >
              {dest.label}
            </button>
          ))}
        </div>

        {/* Gender Preference Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Safety Preference:</span>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#1E2433] bg-[#07090E] text-xs text-slate-200 focus:outline-none focus:border-[#22C55E]"
          >
            <option value="ALL">All Listings</option>
            <option value="FEMALE_ONLY">Female Co-travelers Only</option>
            <option value="ANY">Open to All Students</option>
          </select>
        </div>

      </div>

      {/* Carpools List */}
      {carpoolPosts.length === 0 ? (
        <div className="text-center py-16 bg-[#0D1017] rounded-xl border border-[#1E2433] p-8 space-y-3">
          <Car className="w-12 h-12 text-slate-600 mx-auto opacity-40" />
          <h3 className="font-bold text-base text-white">
            No active rides found for this destination
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Heading to the station or airport? Be the first to publish a ride and find fellow travelers to split the Uber/Ola fare!
          </p>
          <button
            onClick={() => setIsCreatePostModalOpen(true)}
            className="px-4 py-2 rounded-full bg-[#22C55E] text-black text-xs font-bold hover:bg-[#16A34A] transition-colors"
          >
            Create Carpool Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {carpoolPosts.map((post) => {
            const isFull = post.filled_slots >= post.total_slots;
            const remaining = post.total_slots - post.filled_slots;
            const isJoined = applications.some(a => a.post_id === post.id && a.applicant_id === currentUser.id && a.status === 'ACCEPTED');

            return (
              <div
                key={post.id}
                className="p-5 rounded-xl bg-[#0D1017] border border-[#1E2433] hover:border-[#22C55E]/50 transition-all flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                      🚗 Travel Ride
                    </span>

                    {post.carpool_gender_pref === 'FEMALE_ONLY' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-500/10 border border-pink-500/30 text-pink-400">
                        👩 Female Co-travelers Only
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#131722] border border-[#232B3C] text-slate-400">
                        Open to All
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-white line-clamp-2 hover:text-[#22C55E] transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {post.description}
                  </p>

                  {/* Route & Departure Box */}
                  <div className="mt-4 p-3 rounded-lg bg-[#07090E] border border-[#1E2433] space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-white">
                          {post.carpool_destination || post.venue_name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Pickup: {post.carpool_origin || 'Campus Main Gate'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-[#1E2433] text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>
                        Departure: {new Date(post.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(post.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {post.carpool_cost_split && (
                      <div className="flex items-center gap-2 text-[#22C55E] font-semibold text-[11px]">
                        <DollarSign className="w-3.5 h-3.5 shrink-0" />
                        <span>Fare Split: {post.carpool_cost_split}</span>
                      </div>
                    )}
                  </div>

                  {/* Slots left */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      Seats Status
                    </span>
                    <span className={`font-bold ${isFull ? 'text-rose-400' : 'text-[#22C55E]'}`}>
                      {isFull ? 'Fully Booked' : `${remaining} seat${remaining > 1 ? 's' : ''} available`}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-[#1E2433] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#131722] border border-[#232B3C] text-xs font-bold flex items-center justify-center overflow-hidden text-slate-200">
                      {post.host_avatar ? (
                        <img src={post.host_avatar} alt={post.host_name} className="w-full h-full object-cover" />
                      ) : (
                        post.host_name.charAt(0)
                      )}
                    </div>
                    <span className="text-xs text-slate-400 truncate max-w-[100px]">
                      {post.host_name}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedPostForDetail(post)}
                    className="px-3.5 py-1.5 rounded-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold text-xs flex items-center gap-1 transition-colors shadow-xs"
                  >
                    {isJoined ? 'Joined' : 'View & Join'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
