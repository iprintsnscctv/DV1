import React from 'react';
import { Car, Wind, Wifi, Clock } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c120c] via-[#28190f] to-[#150d07] border border-amber-900/40 shadow-2xl p-6 sm:p-8 md:p-10 mb-8 text-amber-50">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 w-80 h-80 bg-amber-800/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-amber-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl">
        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-serif mb-4">
          Experience Comfort &amp; Heritage at{' '}
          <span className="block sm:inline bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent drop-shadow-xs">
            Diversion Vigan
          </span>
        </h1>

        {/* Subtitle Description */}
        <p className="text-amber-100/85 text-xs sm:text-sm md:text-base leading-relaxed max-w-3xl mb-8">
          Modern transient rooms, spacious family suites, and high-ceiling glass lofts. Complete with fiber Wi-Fi,
          split-type aircon, hot rain showers, and secure gated parking just 5 minutes away from historic Calle
          Crisologo.
        </p>

        {/* 4 Feature Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Feature 1: Wide Parking Space */}
          <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-[#2b1b11]/85 hover:bg-[#362317]/95 border border-amber-800/35 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#3f2719] border border-amber-700/50 flex items-center justify-center shrink-0 text-amber-300">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-amber-50 leading-tight">
                Wide Parking Space
              </div>
              <div className="text-[11px] text-amber-200/70">
                Gated 24/7 Security
              </div>
            </div>
          </div>

          {/* Feature 2: Full Aircon */}
          <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-[#2b1b11]/85 hover:bg-[#362317]/95 border border-amber-800/35 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#3f2719] border border-amber-700/50 flex items-center justify-center shrink-0 text-amber-400">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-amber-50 leading-tight">
                Full Aircon
              </div>
              <div className="text-[11px] text-amber-200/70">
                Silent Inverter
              </div>
            </div>
          </div>

          {/* Feature 3: Fiber Wi-Fi */}
          <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-[#2b1b11]/85 hover:bg-[#362317]/95 border border-amber-800/35 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#3f2719] border border-amber-700/50 flex items-center justify-center shrink-0 text-amber-300">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-amber-50 leading-tight">
                Fiber Wi-Fi
              </div>
              <div className="text-[11px] text-amber-200/70">
                High-Speed 100Mbps
              </div>
            </div>
          </div>

          {/* Feature 4: 5 Mins Away */}
          <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-[#2b1b11]/85 hover:bg-[#362317]/95 border border-amber-800/35 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#3f2719] border border-amber-700/50 flex items-center justify-center shrink-0 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-amber-50 leading-tight">
                5 Mins Away
              </div>
              <div className="text-[11px] text-amber-200/70">
                Calle Crisologo
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
