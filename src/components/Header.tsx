import React from 'react';
import { Home, Compass, Heart, Calendar, SlidersHorizontal, Sun, Moon, User, UserCheck } from 'lucide-react';
import { CustomerUser } from '../types';

interface HeaderProps {
  currentView: 'guest' | 'admin';
  guestSubTab?: 'all' | 'saved' | 'my-booking';
  currentCustomer: CustomerUser | null;
  savedCount?: number;
  customerBookingsCount?: number;
  onViewChange: (view: 'guest' | 'admin') => void;
  onGuestSubTabChange?: (tab: 'all' | 'saved' | 'my-booking') => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  guestSubTab = 'all',
  currentCustomer,
  savedCount = 0,
  customerBookingsCount = 0,
  onViewChange,
  onGuestSubTabChange,
  onShowToast,
}) => {
  const [isDark, setIsDark] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  React.useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-4 lg:px-8 py-3 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand Logo & Title */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => {
            onViewChange('guest');
            onGuestSubTabChange?.('all');
          }}
        >
          {/* Gold & Bronze Logo Square */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white flex items-center justify-center shadow-md shadow-amber-600/25 transition-transform active:scale-95">
            <Home className="w-5 h-5 fill-white" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                Diversion Vigan
              </span>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-amber-600 dark:text-amber-400">
                Transient
              </span>
            </div>
            <div className="text-[10px] tracking-wider font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">
              VIGAN CITY, ILOCOS SUR
            </div>
          </div>
        </div>

        {/* Center: Navigation Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 dark:bg-slate-800/60 p-1 rounded-full border border-slate-200/80 dark:border-slate-700/60 flex-wrap justify-center">
          {/* Explore Room */}
          <button
            type="button"
            onClick={() => {
              onViewChange('guest');
              onGuestSubTabChange?.('all');
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'guest' && guestSubTab === 'all'
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-400/80 dark:border-rose-800 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore Room</span>
          </button>

          {/* Saved */}
          <button
            type="button"
            onClick={() => {
              onViewChange('guest');
              onGuestSubTabChange?.('saved');
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'guest' && guestSubTab === 'saved'
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-400/80 dark:border-rose-800 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${savedCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>Saved</span>
            {savedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>

          {/* My Booking (Email & Password Required) */}
          <button
            type="button"
            onClick={() => {
              onViewChange('guest');
              onGuestSubTabChange?.('my-booking');
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'guest' && guestSubTab === 'my-booking'
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-400/80 dark:border-rose-800 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60'
            }`}
          >
            {currentCustomer ? (
              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Calendar className="w-3.5 h-3.5" />
            )}
            <span>
              {currentCustomer ? 'My Booking' : 'My Booking'}
            </span>
            {currentCustomer && customerBookingsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                {customerBookingsCount}
              </span>
            )}
          </button>
        </div>

        {/* Right: Admin Control Button & DV Avatar */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onViewChange(currentView === 'admin' ? 'guest' : 'admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-xs transition-all active:scale-95 cursor-pointer ${
              currentView === 'admin'
                ? 'bg-slate-300/50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-300/70 dark:border-slate-700 shadow-xs'
                : 'bg-slate-200/40 hover:bg-slate-200/70 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 border border-slate-300/40 dark:border-slate-700/40 opacity-75 hover:opacity-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 opacity-60" />
            <span>{currentView === 'admin' ? 'Guest View' : 'Front Desk'}</span>
          </button>

          {/* DV Circle Avatar */}
          <div
            className="w-8 h-8 rounded-full bg-stone-900 text-amber-300 font-bold text-xs flex items-center justify-center shadow-xs border border-amber-600/40 select-none"
            title="Diversion Vigan Front-Desk Staff"
          >
            DV
          </div>

          {/* Subtle Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title={`Toggle ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
