import React, { useState, useEffect } from 'react';
import { Car, Wind, Wifi, Clock, MapPin, ChevronLeft, ChevronRight, Pause, Play, Sparkles } from 'lucide-react';

interface TouristSpot {
  id: string;
  name: string;
  tagline: string;
  location: string;
  distance: string;
  image: string;
}

const VIGAN_TOURIST_SPOTS: TouristSpot[] = [
  {
    id: 'calle-crisologo',
    name: 'Calle Crisologo',
    tagline: 'UNESCO World Heritage cobblestone street & ancestral Spanish houses',
    location: 'Vigan City, Ilocos Sur',
    distance: '5 mins away',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Calle%20Crisologo%20Vigan%20City.jpg?width=1600',
  },
  {
    id: 'vigan-cathedral',
    name: 'St. Paul Metropolitan Cathedral',
    tagline: 'Historic 1641 Spanish baroque cathedral facing Plaza Salcedo',
    location: 'Vigan City, Ilocos Sur',
    distance: '6 mins away',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/St.%20Paul%20Metropolitan%20Cathedral,%20Vigan,%20Ilocos%20Sur.jpg?width=1600',
  },
  {
    id: 'bantay-bell-tower',
    name: 'Bantay Bell Tower & Belfry',
    tagline: 'Historic 1591 Spanish watchtower overlooking Ilocos mountain vistas',
    location: 'Bantay - Vigan, Ilocos Sur',
    distance: '7 mins away',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bantay%20Bell%20Tower%20Ilocos%20Sur.jpg?width=1600',
  },
  {
    id: 'plaza-salcedo',
    name: 'Plaza Salcedo & Heritage Square',
    tagline: 'Iconic historic plaza & dancing fountain show facing Vigan Cathedral',
    location: 'Vigan City, Ilocos Sur',
    distance: '5 mins away',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Plaza%20Salcedo,%20Vigan.jpg?width=1600',
  },
  {
    id: 'pagburnayan-jars',
    name: 'Pagburnayan Jar Factory',
    tagline: 'Centuries-old authentic artisan burnay clay earthenware pottery',
    location: 'Vigan City, Ilocos Sur',
    distance: '4 mins away',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Burnayan%20Pottery%20making%20of%20Vigan.jpg?width=1600',
  },
  {
    id: 'syquia-mansion',
    name: 'Syquia Mansion Heritage House',
    tagline: 'Preserved Spanish-colonial presidential stone estate & museum',
    location: 'Vigan City, Ilocos Sur',
    distance: '6 mins away',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Syquia%20Mansion%20salon.jpg?width=1600',
  },
  {
    id: 'baluarte-vigan',
    name: 'Baluarte Resort & Park',
    tagline: 'Famous safari park, golden estate & nature tourist attraction in Vigan',
    location: 'Vigan City, Ilocos Sur',
    distance: '8 mins away',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Baluarte%20Zoo%20in%20Vigan%20Philippines.jpg?width=1600',
  },
];

export const HeroBanner: React.FC = () => {
  const [currentSpotIndex, setCurrentSpotIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto transition photos every 5 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentSpotIndex((prevIndex) => (prevIndex + 1) % VIGAN_TOURIST_SPOTS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSpotIndex((prev) => (prev - 1 + VIGAN_TOURIST_SPOTS.length) % VIGAN_TOURIST_SPOTS.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSpotIndex((prev) => (prev + 1) % VIGAN_TOURIST_SPOTS.length);
  };

  const activeSpot = VIGAN_TOURIST_SPOTS[currentSpotIndex];

  return (
    <div
      className="relative overflow-hidden rounded-3xl bg-[#120a05] border border-amber-900/50 shadow-2xl p-6 sm:p-8 md:p-10 mb-8 text-amber-50 group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Animated Photo Background Layers with Auto-Transition & Ken-Burns Zoom */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {VIGAN_TOURIST_SPOTS.map((spot, idx) => {
          const isActive = idx === currentSpotIndex;
          return (
            <div
              key={spot.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
              }`}
            >
              <img
                src={spot.image}
                alt={spot.name}
                className={`w-full h-full object-cover object-center transform transition-transform duration-[6000ms] ease-out ${
                  isActive ? 'scale-110 translate-x-1 -translate-y-1' : 'scale-100'
                }`}
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            </div>
          );
        })}

        {/* Multi-layered cinematic gradient overlays for pristine text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#120a06]/95 via-[#1c1008]/85 to-[#241309]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#120a06] via-transparent to-[#120a06]/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(217,119,6,0.2),transparent_70%)]" />

        {/* Ambient lighting glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 w-80 h-80 bg-amber-800/25 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-amber-700/15 rounded-full blur-3xl" />
      </div>

      {/* Main Content Content */}
      <div className="relative z-10 max-w-4xl">
        {/* Tourist Spot In Vigan City Live Badge with Carousel Indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/40 text-amber-200 text-xs font-medium mb-4 shadow-lg animate-fade-in">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Tourist Spot • Vigan City, Ilocos Sur:</span>
          </div>
          <span className="text-white font-bold drop-shadow-xs">{activeSpot.name}</span>
          <span className="hidden sm:inline-block text-amber-300/70 text-[11px]">({activeSpot.distance})</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-serif mb-4 drop-shadow-md">
          Experience Comfort &amp; Heritage at{' '}
          <span className="block sm:inline bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent drop-shadow-sm">
            Diversion Vigan
          </span>
        </h1>

        {/* Subtitle Description */}
        <p className="text-amber-100/90 text-xs sm:text-sm md:text-base leading-relaxed max-w-3xl mb-8 drop-shadow-xs">
          Modern transient rooms, spacious family suites, and high-ceiling glass lofts. Complete with fiber Wi-Fi,
          split-type aircon, hot rain showers, and secure gated parking just 5 minutes away from historic Calle
          Crisologo.
        </p>

        {/* 4 Feature Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {/* Feature 1: Wide Parking Space */}
          <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-[#1c1109]/90 hover:bg-[#28180e]/95 border border-amber-800/40 backdrop-blur-md transition-all shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#382012] border border-amber-700/50 flex items-center justify-center shrink-0 text-amber-300">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-amber-50 leading-tight">
                Wide Parking Space
              </div>
              <div className="text-[11px] text-amber-200/75 font-medium">
                Gated 24/7 Security
              </div>
            </div>
          </div>

          {/* Feature 2: Full Aircon */}
          <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-[#1c1109]/90 hover:bg-[#28180e]/95 border border-amber-800/40 backdrop-blur-md transition-all shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#382012] border border-amber-700/50 flex items-center justify-center shrink-0 text-amber-400">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-amber-50 leading-tight">
                Full Aircon
              </div>
              <div className="text-[11px] text-amber-200/75 font-medium">
                Silent Inverter
              </div>
            </div>
          </div>

          {/* Feature 3: Fiber Wi-Fi */}
          <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-[#1c1109]/90 hover:bg-[#28180e]/95 border border-amber-800/40 backdrop-blur-md transition-all shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#382012] border border-amber-700/50 flex items-center justify-center shrink-0 text-amber-300">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-amber-50 leading-tight">
                Fiber Wi-Fi
              </div>
              <div className="text-[11px] text-amber-200/75 font-medium">
                High-Speed 100Mbps
              </div>
            </div>
          </div>

          {/* Feature 4: 5 Mins Away */}
          <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-[#1c1109]/90 hover:bg-[#28180e]/95 border border-amber-800/40 backdrop-blur-md transition-all shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#382012] border border-amber-700/50 flex items-center justify-center shrink-0 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-amber-50 leading-tight">
                5 Mins Away
              </div>
              <div className="text-[11px] text-amber-200/75 font-medium">
                Calle Crisologo
              </div>
            </div>
          </div>
        </div>

        {/* Tourist Spots Auto-Transition Controls & Interactive Indicators */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-amber-900/30">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-amber-300/80 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Explore Vigan Spots ({currentSpotIndex + 1}/{VIGAN_TOURIST_SPOTS.length}):</span>
            </span>
            <div className="flex items-center gap-1.5">
              {VIGAN_TOURIST_SPOTS.map((spot, idx) => (
                <button
                  key={spot.id}
                  type="button"
                  onClick={() => setCurrentSpotIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentSpotIndex
                      ? 'w-6 bg-gradient-to-r from-amber-400 to-amber-200 ring-2 ring-amber-400/40'
                      : 'w-2 bg-amber-800/60 hover:bg-amber-600/80'
                  }`}
                  aria-label={`View ${spot.name}`}
                  title={spot.name}
                />
              ))}
            </div>
          </div>

          {/* Navigation buttons and pause/play toggle */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-lg bg-black/40 hover:bg-amber-900/60 text-amber-200 border border-amber-800/40 transition-colors cursor-pointer"
              aria-label="Previous tourist spot"
              title="Previous spot"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 rounded-lg bg-black/40 hover:bg-amber-900/60 text-amber-200 border border-amber-800/40 transition-colors cursor-pointer text-xs flex items-center gap-1 px-2.5 font-medium"
              aria-label={isPaused ? 'Resume auto-transition' : 'Pause auto-transition'}
              title={isPaused ? 'Resume auto-transition' : 'Pause auto-transition'}
            >
              {isPaused ? (
                <>
                  <Play className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px]">Play</span>
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px]">Auto</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg bg-black/40 hover:bg-amber-900/60 text-amber-200 border border-amber-800/40 transition-colors cursor-pointer"
              aria-label="Next tourist spot"
              title="Next spot"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
