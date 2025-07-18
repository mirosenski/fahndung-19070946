// components/FahndungCard.tsx
import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

interface FahndungCardProps {
  id: string;
  name: string;
  location: string;
  date: string;
  image: string;
  badges: Array<{
    text: string;
    type: 'vermisst' | 'eilfahndung' | 'gesucht' | 'unbekannt';
  }>;
  details?: {
    age?: string;
    height?: string;
    build?: string;
    eyeColor?: string;
    hairColor?: string;
    features?: string;
    clothing?: string;
    specialHints?: string;
    contact?: string;
  };
  className?: string;
}

export default function FahndungCard({ 
  id, 
  name, 
  location, 
  date, 
  image, 
  badges,
  details = {},
  className = "" 
}: FahndungCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFlip();
    } else if (e.key === 'Escape' && isFlipped) {
      e.preventDefault();
      setIsFlipped(false);
    }
  };

  useEffect(() => {
    if (isFlipped && backRef.current) {
      const closeButton = backRef.current.querySelector('button[aria-label="Schließen"]');
      (closeButton as HTMLElement)?.focus();
    } else if (!isFlipped && frontRef.current) {
      const menuButton = frontRef.current.querySelector('button[aria-label="Detailierte Informationen anzeigen"]');
      (menuButton as HTMLElement)?.focus();
    }
  }, [isFlipped]);

  return (
    <div 
      className={`relative w-full max-w-[289px] h-[386px] mx-auto ${className}`}
      style={{ perspective: '1000px' }}
    >
      <div
        ref={cardRef}
        className="relative w-full h-full transition-transform duration-700 ease-in-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        
        {/* VORDERSEITE - Mobile optimiert */}
        <div
          ref={frontRef}
          className="
            absolute inset-0 w-full h-full
            rounded-[15px] border border-solid border-[#c7c7c7] 
            backdrop-blur-[50px] backdrop-brightness-[100%] 
            [-webkit-backdrop-filter:blur(50px)_brightness(100%)] 
            bg-[linear-gradient(0deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0.4)_100%)]
            overflow-hidden flex flex-col
            shadow-lg
          "
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Person Image - 60% der Kartenhöhe für mobile Optimierung */}
          <div className="w-full h-[231px] bg-muted overflow-hidden flex-shrink-0 relative">
            <Image 
              src={image} 
              alt={`Foto von ${name}`}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 289px) 100vw, 289px"
              unoptimized={image.startsWith('http')}
              onError={(e) => {
                console.error('Bild konnte nicht geladen werden:', image);
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            {/* Overlay für bessere Lesbarkeit */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            {/* Fallback Text falls kein Bild */}
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm font-medium">
              {!image || image === 'https://via.placeholder.com/289x231/cccccc/666666?text=Kein+Bild' ? 'Kein Bild verfügbar' : ''}
            </div>
          </div>

          {/* Card Content - 40% für mobile Optimierung */}
          <div className="flex-1 flex flex-col justify-between p-3">
            
            {/* Content Bereich */}
            <div className="space-y-2">
              {/* Badges */}
              <div className="flex gap-1 flex-wrap" role="list" aria-label="Status-Kategorien">
                {badges.map((badge, index) => (
                  <span 
                    key={index}
                    role="listitem"
                    className={`px-2 py-0.5 text-xs font-medium rounded-md transition-colors ${
                      badge.type === 'vermisst' 
                        ? 'bg-muted text-muted-foreground' :
                      badge.type === 'eilfahndung' 
                        ? 'bg-destructive text-destructive-foreground font-bold animate-pulse' :
                      badge.type === 'gesucht' 
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                        'bg-primary/10 text-primary'
                    }`}
                  >
                    {badge.text}
                  </span>
                ))}
              </div>

              {/* Location & Date */}
              <p className="text-xs font-semibold text-primary">
                {location} | {date}
              </p>

              {/* Name */}
              <h3 className="text-lg font-semibold text-foreground leading-tight">
                {name}
              </h3>
            </div>

            {/* Actions - Kompakter für mobile */}
            <div className="flex items-center gap-2 mt-2">
              <a 
                href={`/fahndung/${id}`}
                className="
                  flex-1 px-3 py-2 bg-background border border-border text-foreground 
                  rounded-lg hover:bg-accent focus:bg-accent text-xs font-medium text-center
                  transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                "
                aria-label={`Mehr Informationen über ${name}`}
              >
                Mehr erfahren →
              </a>
              
              <button 
                onClick={handleFlip}
                onKeyDown={handleKeyDown}
                className="
                  px-3 py-2 bg-primary text-primary-foreground
                  rounded-lg hover:bg-primary/90 focus:bg-primary/90 
                  text-xs font-medium transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                  flex items-center gap-1
                "
                aria-label="Detailierte Informationen anzeigen"
                aria-expanded={isFlipped}
                tabIndex={0}
              >
                <span>Info</span>
                <svg 
                  className="w-3 h-3" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* RÜCKSEITE - Mobile optimiert */}
        <div
          ref={backRef}
          className="
            absolute inset-0 w-full h-full
            rounded-[15px] border border-solid border-[#c7c7c7] 
            backdrop-blur-[50px] backdrop-brightness-[100%] 
            [-webkit-backdrop-filter:blur(50px)_brightness(100%)] 
            bg-[linear-gradient(0deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0.4)_100%)]
            overflow-hidden
          "
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="flex flex-col h-full p-4 gap-4">
            
            {/* Header mit Close Button */}
            <div className="flex items-start justify-between">
              <div className="text-xs font-bold text-muted-foreground underline">
                Detailinfo
              </div>
              <button
                onClick={() => setIsFlipped(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsFlipped(false);
                  }
                }}
                className="
                  p-1 text-muted-foreground hover:text-foreground hover:bg-accent 
                  rounded transition-colors focus:outline-none focus:ring-2 focus:ring-ring
                "
                aria-label="Schließen"
                tabIndex={0}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Name */}
            <h2 className="text-foreground text-xl font-semibold">
              {name}
            </h2>

            {/* Details Sections - Kompakter für mobile */}
            <div className="space-y-3 flex-1 overflow-y-auto text-xs">
              
              {/* Physische Merkmale */}
              {(details.age || details.height || details.build) && (
                <div className="border-t border-border pt-2">
                  <p className="text-foreground leading-5">
                    {details.age && <><span className="font-bold">Alter: </span><span className="font-normal">{details.age} </span></>}
                    {details.height && <><span className="font-bold">| Größe: </span><span className="font-normal">{details.height} </span></>}
                    {details.build && <><span className="font-bold">| Statur: </span><span className="font-normal">{details.build}</span></>}
                  </p>
                </div>
              )}

              {/* Aussehen */}
              {(details.eyeColor || details.hairColor) && (
                <div className="border-t border-border pt-2">
                  <p className="text-foreground leading-5">
                    {details.eyeColor && <><span className="font-bold">Augenfarbe: </span><span className="font-normal">{details.eyeColor} </span></>}
                    {details.hairColor && <><span className="font-bold">| Haarfarbe: </span><span className="font-normal">{details.hairColor}</span></>}
                  </p>
                </div>
              )}

              {/* Besondere Merkmale */}
              {details.features && (
                <div className="border-t border-border pt-2">
                  <p className="text-foreground leading-5">
                    <span className="font-bold">Merkmale: </span>
                    <span className="font-normal">{details.features}</span>
                  </p>
                </div>
              )}

              {/* Bekleidung */}
              {details.clothing && (
                <div className="border-t border-border pt-2">
                  <p className="text-foreground leading-5">
                    <span className="font-bold">Bekleidung zuletzt: </span>
                    <span className="font-normal">{details.clothing}</span>
                  </p>
                </div>
              )}

              {/* Besondere Hinweise */}
              {details.specialHints && (
                <div className="border-t border-border pt-2">
                  <p className="text-foreground leading-5">
                    <span className="font-bold">Besondere Hinweise: </span>
                    <span className="font-normal">{details.specialHints}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Kontakt-Bereich */}
            <div className="border-t-2 border-primary pt-2 mt-auto">
              <p className="text-foreground text-xs leading-5">
                <span className="font-bold">Kontakt: </span>
                <span className="font-normal">
                  {details.contact || '0721 / 110 vermisstenstelle@polizei-bw.de'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}