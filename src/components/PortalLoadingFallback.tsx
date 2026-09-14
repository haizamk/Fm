import React from 'react';
import { Loader2, ShieldCheck, User } from 'lucide-react';

interface PortalLoadingFallbackProps {
  title?: string;
  type?: 'admin' | 'customer';
}

export const PortalLoadingFallback: React.FC<PortalLoadingFallbackProps> = ({ 
  title = 'Memuatkan Portal...', 
  type = 'customer' 
}) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-busy="true"
      aria-label={title}
    >
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center relative ${
          type === 'admin' 
            ? 'bg-stone-900 dark:bg-stone-800 text-emerald-400 border border-stone-700' 
            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
        }`}>
          {type === 'admin' ? (
            <ShieldCheck className="w-7 h-7" />
          ) : (
            <User className="w-7 h-7" />
          )}
          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-stone-900 rounded-full p-1 shadow-xs">
            <Loader2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-white">
            {title}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {type === 'admin' 
              ? 'Memuat turun modul pengurusan pentadbir...' 
              : 'Menyediakan profil dan pesanan anda...'}
          </p>
        </div>

        <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
          <div className="bg-emerald-500 h-full w-2/3 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};
