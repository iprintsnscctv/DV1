import React from 'react';
import {
  Building2,
  CalendarCheck,
  Search,
  ShieldCheck,
  Phone,
  MapPin,
  Database,
  Sparkles,
} from 'lucide-react';
import { SupabaseConfigStatus } from '../types';

interface HeaderProps {
  activeTab: 'explore' | 'lookup' | 'admin' | 'custom-rates';
  setActiveTab: (tab: 'explore' | 'lookup' | 'admin' | 'custom-rates') => void;
  supabaseStatus: SupabaseConfigStatus | null;
  onOpenLookup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  supabaseStatus,
  onOpenLookup,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#1a1410]/95 backdrop-blur-md border-b border-[#ebdccd] dark:border-[#382b22] transition-colors shadow-xs">
      {/* Top Banner */}
      <div className="bg-[#2a1c14] text-[#fbf8f4] text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-[11px] text-[#e0cfbe]">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Diversion Road, Vigan City, Ilocos Sur
            </span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              +63 917 123 4567 / (077) 674-0000
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <a
              href="https://maps.google.com/?q=Diversion+Road+Vigan+City"
              target="_blank"
              rel="noreferrer"
              className="text-amber-300 hover:text-amber-200 transition-colors"
            >
              Get Directions
            </a>
            {supabaseStatus && (
              <span className="flex items-center gap-1.5 text-[10px] bg-amber-900/60 px-2 py-0.5 rounded-full border border-amber-700/50">
                <Database className="w-2.5 h-2.5 text-amber-300" />
                {supabaseStatus.isConfigured ? (
                  <span className="text-emerald-300 font-medium">Supabase Connected</span>
                ) : (
                  <span className="text-amber-300">Local DB Active</span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('explore')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-700 to-[#3e2312] p-0.5 shadow-md flex items-center justify-center text-white font-serif font-bold text-xl tracking-tight">
              <span>DV</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-serif font-bold text-[#2a1c14] dark:text-[#f8f4ec] tracking-tight">
                  Diversion Vigan
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded">
                  Villa
                </span>
              </div>
              <p className="text-xs text-[#735745] dark:text-[#bda99a] tracking-wide">
                Transient and Private Villa • Vigan City
              </p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'explore'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-[#503b2f] dark:text-[#ddcbbb] hover:bg-amber-50 dark:hover:bg-[#281e18]'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Rooms & Rates</span>
            </button>

            <button
              onClick={onOpenLookup}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'lookup'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-[#503b2f] dark:text-[#ddcbbb] hover:bg-amber-50 dark:hover:bg-[#281e18]'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:inline">Find My Booking</span>
              <span className="md:hidden">Lookup</span>
            </button>

            <button
              onClick={() => setActiveTab('custom-rates')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'custom-rates'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-[#503b2f] dark:text-[#ddcbbb] hover:bg-amber-50 dark:hover:bg-[#281e18]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="hidden md:inline">Rate Structure</span>
              <span className="md:hidden">Rates</span>
            </button>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block" />

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-[#2a1c14] text-amber-300 ring-2 ring-amber-500'
                  : 'border border-[#d2bfad] dark:border-[#4d3b30] text-[#3d2c22] dark:text-[#ecdcd0] hover:bg-[#faf4ee] dark:hover:bg-[#2a201a]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Admin Portal</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
