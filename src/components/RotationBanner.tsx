import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, 
  Store, 
  Scissors, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Pause, 
  Play,
  Edit3,
  Clock,
  CheckCircle2,
  Gift
} from 'lucide-react';
import { RotationBannerItem, UserAccount } from '../types';

interface RotationBannerProps {
  banners: RotationBannerItem[];
  currentUser: UserAccount | null;
  onOpenAdminPortal?: () => void;
  onCtaClick?: (action: RotationBannerItem['ctaAction']) => void;
}

const ROTATION_INTERVAL_MS = 12000; // 12 seconds per rotation

export const RotationBanner: React.FC<RotationBannerProps> = ({
  banners,
  currentUser,
  onOpenAdminPortal,
  onCtaClick,
}) => {
  const activeBanners = banners.filter((b) => b.isActive);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalBanners = activeBanners.length;

  // Handle safe index if banners change
  useEffect(() => {
    if (currentIndex >= totalBanners && totalBanners > 0) {
      setCurrentIndex(0);
    }
  }, [totalBanners, currentIndex]);

  // Main 12-second rotation timer and smooth progress bar
  useEffect(() => {
    if (totalBanners <= 1 || isPaused) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    setProgress(0);
    const stepTime = 100; // update progress every 100ms
    const totalSteps = ROTATION_INTERVAL_MS / stepTime;
    let stepCount = 0;

    progressIntervalRef.current = setInterval(() => {
      stepCount++;
      const currentPct = (stepCount / totalSteps) * 100;
      setProgress(Math.min(currentPct, 100));

      if (stepCount >= totalSteps) {
        setCurrentIndex((prev) => (prev + 1) % totalBanners);
        stepCount = 0;
        setProgress(0);
      }
    }, stepTime);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, totalBanners, isPaused]);

  if (totalBanners === 0) return null;

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  const handlePrev = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev - 1 + totalBanners) % totalBanners);
  };

  const handleNext = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % totalBanners);
  };

  const handleSelect = (idx: number) => {
    setProgress(0);
    setCurrentIndex(idx);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'truck':
        return <Truck className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'store':
        return <Store className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'scissors':
        return <Scissors className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'flame':
        return <Flame className="w-5 h-5 sm:w-6 sm:h-6" />;
      default:
        return <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
  };

  const getBadgeStyle = (accent: string) => {
    switch (accent) {
      case 'amber':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/40';
      case 'blue':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/40';
      case 'purple':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
    }
  };

  const getBtnStyle = (accent: string) => {
    switch (accent) {
      case 'amber':
        return 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-900/30';
      case 'blue':
        return 'bg-sky-500 hover:bg-sky-400 text-stone-950 shadow-sky-900/30';
      case 'purple':
        return 'bg-purple-500 hover:bg-purple-400 text-white shadow-purple-900/30';
      default:
        return 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-emerald-900/30';
    }
  };

  return (
    <div 
      className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${currentBanner.bgColor || 'from-stone-900 via-stone-850 to-stone-900'} border border-white/10 shadow-xl transition-all duration-700 min-h-[220px] sm:min-h-[200px] flex flex-col justify-between`}>
        
        {/* Subtle Ambient Background Glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Banner Content Container */}
        <div className="relative z-10 p-5 sm:p-7 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Left Text Info */}
          <div className="flex-1 space-y-2.5 max-w-3xl">
            
            {/* Top Badge & Timer pill */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border backdrop-blur-md shadow-2xs ${getBadgeStyle(currentBanner.accentColor)}`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                {currentBanner.badge}
              </span>

              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-400 bg-black/30 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/5">
                <Clock className="w-3 h-3 text-stone-400" />
                <span>Auto 12s • #{currentIndex + 1} drpd {totalBanners}</span>
              </span>

              {currentUser?.role === 'admin' && onOpenAdminPortal && (
                <button
                  onClick={onOpenAdminPortal}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-300 hover:text-white bg-indigo-900/60 hover:bg-indigo-800/80 px-2.5 py-0.5 rounded-full border border-indigo-500/40 transition-colors cursor-pointer"
                  title="Klik untuk ubah teks & gambar banner ini dalam Admin Portal"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Banner</span>
                </button>
              )}
            </div>

            {/* Banner Main Title */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight font-['Outfit']">
              {currentBanner.title}
            </h2>

            {/* Banner Description */}
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl font-normal">
              {currentBanner.description}
            </p>

            {/* Action CTA Button */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onCtaClick?.(currentBanner.ctaAction)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-300 transform active:scale-95 shadow-md cursor-pointer ${getBtnStyle(currentBanner.accentColor)}`}
              >
                <span>{currentBanner.ctaText || 'Lihat Tawaran'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="hidden sm:flex items-center gap-2 text-stone-400 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pasar Semenyih (GA 59)</span>
              </div>
            </div>
          </div>

          {/* Right Visual Image / Icon Card */}
          {currentBanner.imageUrl && (
            <div className="hidden md:flex relative shrink-0 w-44 lg:w-56 h-36 lg:h-40 rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg group">
              <img
                src={currentBanner.imageUrl}
                alt={currentBanner.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px] font-bold">
                <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                  Khairul FRESH
                </span>
                <div className="w-6 h-6 rounded-full bg-emerald-600/90 flex items-center justify-center text-white">
                  {getIcon(currentBanner.icon)}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Bar: 12-Second Progress Line & Controls */}
        <div className="relative z-10 bg-black/40 backdrop-blur-xs border-t border-white/5 px-4 sm:px-6 py-2.5 flex items-center justify-between">
          
          {/* Navigation Dots */}
          <div className="flex items-center gap-2">
            {activeBanners.map((banner, idx) => (
              <button
                key={banner.id}
                onClick={() => handleSelect(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? 'w-7 h-2 bg-emerald-400 shadow-sm shadow-emerald-400/50'
                    : 'w-2 h-2 bg-stone-600 hover:bg-stone-400'
                }`}
                title={`Banner ${idx + 1}: ${banner.title}`}
                aria-label={`Lihat banner ${idx + 1}`}
              />
            ))}

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="ml-2 text-stone-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer text-[10px] flex items-center gap-1"
              title={isPaused ? 'Sambung putaran automatik' : 'Jeda putaran'}
            >
              {isPaused ? <Play className="w-3 h-3 text-amber-400" /> : <Pause className="w-3 h-3" />}
            </button>
          </div>

          {/* Prev / Next Arrows */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
              aria-label="Banner sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
              aria-label="Banner seterusnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 12-Second Linear Progress Bar at bottom */}
        <div className="w-full bg-white/10 h-1 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

      </div>
    </div>
  );
};
