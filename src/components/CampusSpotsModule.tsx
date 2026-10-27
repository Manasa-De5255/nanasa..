import React, { useState } from 'react';
import { initialSpots } from '../data/mockData.ts';
import { CampusSpot } from '../types/index.ts';
import {
  MapPin,
  Heart,
  Navigation,
  Compass,
  Plus,
  ExternalLink,
  Award,
  Sparkles,
  Sun
} from 'lucide-react';

export const CampusSpotsModule: React.FC = () => {
  const [spots, setSpots] = useState<CampusSpot[]>(initialSpots);
  const [activeSpot, setActiveSpot] = useState<CampusSpot>(spots[0]);
  const [showProposeModal, setShowProposeModal] = useState(false);

  // New Spot Form
  const [spotName, setSpotName] = useState('');
  const [spotCategory, setSpotCategory] = useState<CampusSpot['category']>('Study Haven');
  const [spotDesc, setSpotDesc] = useState('');
  const [spotLocation, setSpotLocation] = useState('');
  const [spotBestTime, setSpotBestTime] = useState('');

  const toggleSpotVote = (id: string) => {
    setSpots((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const newVote = !s.userVoted;
          const votes = newVote ? s.votes + 1 : Math.max(0, s.votes - 1);
          return { ...s, userVoted: newVote, votes };
        }
        return s;
      })
    );
  };

  const handleProposeSpot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotName.trim()) return;

    const newSpot: CampusSpot = {
      id: 'spot-' + Date.now(),
      name: spotName.trim(),
      category: spotCategory,
      description: spotDesc.trim(),
      locationName: spotLocation.trim() || 'Unicore Campus Grounds',
      mapCoordinates: { lat: 12.9719, lng: 77.5948 },
      votes: 1,
      userVoted: true,
      bestTime: spotBestTime.trim() || 'Afternoon',
    };

    setSpots([newSpot, ...spots]);
    setActiveSpot(newSpot);
    setShowProposeModal(false);
    setSpotName('');
    setSpotDesc('');
  };

  const sortedSpots = [...spots].sort((a, b) => b.votes - a.votes);

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="rounded-2xl bg-surface border border-subtle p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand/10 text-brand">
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-main">
              Student-Voted Campus Spots
            </h1>
          </div>
          <p className="text-xs text-muted-custom">
            Discover and upvote the best focus retreats, scenic green lawns, and collaborative student cafes on campus.
          </p>
        </div>

        <button
          onClick={() => setShowProposeModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-brand text-brand-contrast hover:opacity-90 transition-opacity cursor-pointer shadow-xs self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nominate a Campus Spot</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Top Spots Leaderboard List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-main uppercase tracking-wider">
              Top Ranked Spots ({spots.length})
            </span>
            <span className="text-xs text-muted-custom font-mono">Sorted by Student Votes</span>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {sortedSpots.map((spot, index) => {
              const isSelected = activeSpot.id === spot.id;
              return (
                <div
                  key={spot.id}
                  onClick={() => setActiveSpot(spot)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-brand bg-brand/5 shadow-xs ring-1 ring-brand'
                      : 'border-subtle bg-surface hover:border-brand/40 hover:bg-subtle/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-muted-custom">
                          #{index + 1}
                        </span>
                        <h3 className="text-sm font-bold text-main">{spot.name}</h3>
                      </div>
                      <span className="inline-block text-[10px] font-semibold text-brand">
                        {spot.category}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSpotVote(spot.id);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        spot.userVoted
                          ? 'bg-rose-500 text-white shadow-2xs'
                          : 'bg-subtle text-muted-custom hover:text-main border border-subtle'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>{spot.votes}</span>
                    </button>
                  </div>

                  <p className="text-xs text-muted-custom mt-2 line-clamp-2 leading-relaxed">
                    {spot.description}
                  </p>

                  <div className="flex items-center gap-2 pt-2.5 mt-2.5 border-t border-subtle text-[11px] text-muted-custom">
                    <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
                    <span className="truncate">{spot.locationName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Google Maps & Spot Spotlight View (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Spot Detail Box */}
          <div className="rounded-2xl border border-subtle bg-surface p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-subtle pb-3">
              <div>
                <span className="text-[11px] font-bold text-brand uppercase tracking-wider">
                  {activeSpot.category}
                </span>
                <h2 className="text-lg font-bold text-main">{activeSpot.name}</h2>
                <div className="flex items-center gap-1.5 text-xs text-muted-custom mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-brand" />
                  <span>{activeSpot.locationName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => toggleSpotVote(activeSpot.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeSpot.userVoted
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-subtle text-main hover:bg-surface border border-subtle'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>{activeSpot.votes} Student Votes</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-main leading-relaxed">
              {activeSpot.description}
            </p>

            <div className="p-3 rounded-xl bg-subtle border border-subtle text-xs flex items-center justify-between">
              <span className="text-muted-custom flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Prime Hours:</span>
              </span>
              <span className="font-semibold text-main">{activeSpot.bestTime}</span>
            </div>

            {/* Embedded Google Maps Viewport */}
            <div className="rounded-xl overflow-hidden border border-subtle relative h-[360px] bg-slate-100 dark:bg-slate-900">
              <iframe
                title={`Google Map for ${activeSpot.name}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${activeSpot.mapCoordinates.lat},${activeSpot.mapCoordinates.lng}&z=16&output=embed`}
              />
              <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-subtle text-xs font-semibold shadow-xs flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-brand" />
                <span>GPS: {activeSpot.mapCoordinates.lat.toFixed(4)}, {activeSpot.mapCoordinates.lng.toFixed(4)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Propose Spot Modal */}
      {showProposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-surface border border-subtle shadow-2xl p-6 space-y-4 text-main">
            <h3 className="text-base font-bold text-main">Nominate a New Campus Spot</h3>
            <form onSubmit={handleProposeSpot} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-main">Spot Name</label>
                <input
                  type="text"
                  value={spotName}
                  onChange={(e) => setSpotName(e.target.value)}
                  required
                  placeholder="e.g. Zen Gazebo behind Library"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-subtle bg-subtle/50 text-main"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-main">Category</label>
                <select
                  value={spotCategory}
                  onChange={(e: any) => setSpotCategory(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-subtle bg-subtle/50 text-main"
                >
                  <option value="Study Haven">Study Haven</option>
                  <option value="Green Space">Green Space</option>
                  <option value="Cafe & Snacks">Cafe & Snacks</option>
                  <option value="Innovation Lab">Innovation Lab</option>
                  <option value="Sports & Wellness">Sports & Wellness</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-main">Campus Location</label>
                <input
                  type="text"
                  value={spotLocation}
                  onChange={(e) => setSpotLocation(e.target.value)}
                  required
                  placeholder="e.g. Science Garden Path, North Gate"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-subtle bg-subtle/50 text-main"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-main">Recommended Visiting Hours</label>
                <input
                  type="text"
                  value={spotBestTime}
                  onChange={(e) => setSpotBestTime(e.target.value)}
                  placeholder="e.g. 05:00 PM for sunset views"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-subtle bg-subtle/50 text-main"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-main">Description / Vibe</label>
                <textarea
                  value={spotDesc}
                  onChange={(e) => setSpotDesc(e.target.value)}
                  rows={2}
                  placeholder="What makes this spot special for students?"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-subtle bg-subtle/50 text-main"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-subtle text-main"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-brand text-brand-contrast hover:opacity-90"
                >
                  Submit Spot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
