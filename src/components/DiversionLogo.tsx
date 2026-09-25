import React from 'react';

interface DiversionLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  variant?: 'icon' | 'horizontal' | 'stacked';
  showText?: boolean;
  inverted?: boolean;
  useImage?: boolean;
}

export const DiversionLogoMark: React.FC<{
  className?: string;
  size?: number;
  useImage?: boolean;
}> = ({
  className = '',
  size = 42,
  useImage = false,
}) => {
  if (useImage) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-2xl overflow-hidden shadow-md transition-all duration-300 ${className}`}
        style={{
          width: size,
          height: size,
          boxShadow: '0 4px 14px -2px rgba(69, 51, 37, 0.45)',
        }}
      >
        <img
          src="/diversion_logo.jpg"
          alt="Diversion Vigan Logo"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl overflow-hidden shadow-md transition-all duration-300 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: '#433224',
        border: '1px solid rgba(222, 203, 186, 0.18)',
        boxShadow: '0 4px 16px -2px rgba(67, 50, 36, 0.5)',
      }}
    >
      <svg
        viewBox="0 0 220 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[84%] h-[84%]"
      >
        <defs>
          <linearGradient id="champagneGrad" x1="20" y1="20" x2="200" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f7eee4" />
            <stop offset="50%" stopColor="#decbba" />
            <stop offset="100%" stopColor="#c5ad98" />
          </linearGradient>
          <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#1e140d" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Villa Gabled Roof & Walls Contour with Rounded Curves */}
        <path
          d="M 110 24
             C 114 24 118 26.5 122 29.5
             L 179 70
             C 186 75 190 83 190 92
             L 190 166
             C 190 178 180 188 168 188
             L 52 188
             C 40 188 30 178 30 166
             L 30 92
             C 30 83 34 75 41 70
             L 98 29.5
             C 102 26.5 106 24 110 24 Z"
          stroke="url(#champagneGrad)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#logoShadow)"
        />

        {/* Interlocking Monogram (d & P) matching the brand emblem */}
        <g filter="url(#logoShadow)">
          {/* Central Pillar Stem */}
          <path
            d="M 103 72
               H 116
               V 168
               H 103
               Z"
            fill="url(#champagneGrad)"
          />

          {/* Upper Right Loop for 'P' */}
          <path
            d="M 116 72
               H 142
               C 161 72 174 84 174 102
               C 174 119 161 131 142 131
               H 116
               V 120
               H 141
               C 154 120 162 112 162 102
               C 162 91 154 83 141 83
               H 116
               V 72 Z"
            fill="url(#champagneGrad)"
          />

          {/* Lower Left Loop for 'd' / 'c' */}
          <path
            d="M 103 118
               H 78
               C 58 118 46 130 46 148
               C 46 160 55 168 68 168
               H 103
               V 157
               H 69
               C 61 157 58 152 58 147
               C 58 137 66 129 79 129
               H 103
               V 118 Z"
            fill="url(#champagneGrad)"
          />
        </g>
      </svg>
    </div>
  );
};

export const DiversionLogo: React.FC<DiversionLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'horizontal',
  showText = true,
  inverted = false,
  useImage = false,
}) => {
  const sizeMap = {
    sm: { mark: 36, topText: 'text-base', subText: 'text-[9px]' },
    md: { mark: 44, topText: 'text-lg sm:text-xl', subText: 'text-[10.5px]' },
    lg: { mark: 56, topText: 'text-2xl', subText: 'text-xs' },
    xl: { mark: 76, topText: 'text-3xl', subText: 'text-sm' },
    custom: { mark: 44, topText: 'text-lg', subText: 'text-[10.5px]' },
  };

  const currentSize = sizeMap[size];

  if (variant === 'icon') {
    return <DiversionLogoMark size={currentSize.mark} useImage={useImage} className={className} />;
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center gap-3 select-none ${className}`}>
        <DiversionLogoMark size={currentSize.mark * 1.4} useImage={useImage} />
        <div className="flex flex-col items-center">
          {/* Top Layout */}
          <span
            className={`font-extrabold tracking-[0.18em] uppercase leading-tight text-lg ${
              inverted ? 'text-white' : 'text-[#36251b] dark:text-[#f7ede3]'
            }`}
          >
            Diversion Vigan
          </span>
          {/* Below Layout */}
          <span
            className={`font-semibold tracking-[0.22em] uppercase mt-1 text-[10px] sm:text-[11px] ${
              inverted ? 'text-amber-200/90' : 'text-amber-800 dark:text-amber-300'
            }`}
          >
            Transient and Private Villa
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <DiversionLogoMark size={currentSize.mark} useImage={useImage} />
      {showText && (
        <div className="flex flex-col justify-center text-left">
          {/* Top Layout: Diversion Vigan */}
          <div className="flex items-center gap-1.5 leading-tight">
            <span
              className={`font-black ${currentSize.topText} tracking-tight ${
                inverted ? 'text-white' : 'text-slate-900 dark:text-white'
              }`}
            >
              Diversion Vigan
            </span>
          </div>

          {/* Below Layout: Transient and Private Villa */}
          <div
            className={`font-bold ${currentSize.subText} tracking-[0.16em] uppercase mt-0.5 ${
              inverted
                ? 'text-amber-200/90'
                : 'text-amber-800 dark:text-amber-300'
            }`}
          >
            Transient and Private Villa
          </div>
        </div>
      )}
    </div>
  );
};
