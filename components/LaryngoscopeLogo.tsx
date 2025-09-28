'use client';

import { useState, useEffect, memo } from 'react';

interface LaryngoscopeLogoProps {
  onAnimationComplete?: () => void;
  className?: string;
}

export const LaryngoscopeLogo = memo(function LaryngoscopeLogo({
  onAnimationComplete,
  className = '',
}: LaryngoscopeLogoProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showGlow, setShowGlow] = useState(false);

  useEffect(() => {
    // Start the glow effect after a short delay
    const glowTimer = setTimeout(() => setShowGlow(true), 500);

    // Start fade out after 2 seconds
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
      // Call completion callback after fade out
      const completionTimer = setTimeout(() => onAnimationComplete?.(), 1000);
      return () => clearTimeout(completionTimer);
    }, 2000);

    return () => {
      clearTimeout(glowTimer);
      clearTimeout(fadeTimer);
    };
  }, [onAnimationComplete]);

  return (
    <div
      className={`flex flex-col items-center justify-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}
    >
      {/* Laryngoscope SVG */}
      <div
        className={`relative transition-all duration-1000 ${showGlow ? 'scale-110' : 'scale-100'}`}
      >
        {/* Glow effect */}
        {showGlow && (
          <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-30 animate-pulse" />
        )}

        {/* Laryngoscope handle */}
        <svg width="120" height="120" viewBox="0 0 120 120" className="relative z-10">
          {/* Handle */}
          <rect
            x="20"
            y="60"
            width="20"
            height="40"
            rx="10"
            fill="#1e40af"
            className="transition-all duration-1000"
          />

          {/* Handle grip lines */}
          <rect x="22" y="65" width="16" height="2" rx="1" fill="#3b82f6" />
          <rect x="22" y="70" width="16" height="2" rx="1" fill="#3b82f6" />
          <rect x="22" y="75" width="16" height="2" rx="1" fill="#3b82f6" />
          <rect x="22" y="80" width="16" height="2" rx="1" fill="#3b82f6" />
          <rect x="22" y="85" width="16" height="2" rx="1" fill="#3b82f6" />

          {/* Blade connection */}
          <rect x="35" y="70" width="8" height="4" rx="2" fill="#1e40af" />

          {/* Blade */}
          <path
            d="M 43 72 L 80 50 L 85 55 L 48 77 Z"
            fill="#e5e7eb"
            stroke="#9ca3af"
            strokeWidth="1"
          />

          {/* Light source */}
          <circle cx="82" cy="52" r="3" fill="#fbbf24" className="animate-pulse" />

          {/* Light beam */}
          <path
            d="M 82 52 L 90 45 L 88 43 L 80 50 Z"
            fill="#fbbf24"
            opacity="0.6"
            className="animate-pulse"
          />

          {/* Reflection on blade */}
          <path d="M 45 74 L 75 55 L 78 58 L 48 77 Z" fill="#ffffff" opacity="0.3" />
        </svg>
      </div>
    </div>
  );
});
