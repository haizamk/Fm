import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 260) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      id="back-to-top-btn"
      aria-label="Kembali ke Atas"
      title="Kembali ke Atas"
      className="fixed bottom-20 right-5 sm:right-6 z-40 bg-stone-900/90 dark:bg-stone-800/95 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-white p-3 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-xs border border-stone-700/60 dark:border-stone-700 cursor-pointer flex items-center gap-2 group animate-fade-in-up"
    >
      <ArrowUp className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
      <span className="text-xs font-extrabold pr-1 tracking-wide hidden sm:inline-block">
        Kembali ke Atas
      </span>
    </button>
  );
};
