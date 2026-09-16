import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';

export interface FlyingProductItem {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  imageUrl: string;
  name: string;
}

interface FloatingProductOverlayProps {
  items: FlyingProductItem[];
  onAnimationComplete: (id: string) => void;
}

export const FloatingProductOverlay: React.FC<FloatingProductOverlayProps> = ({
  items,
  onAnimationComplete,
}) => {
  if (items.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" aria-hidden="true">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{
              left: item.startX,
              top: item.startY,
              scale: 0.9,
              opacity: 1,
              rotate: 0,
            }}
            animate={{
              left: item.endX,
              top: item.endY,
              scale: 0.22,
              opacity: 0.15,
              rotate: 20,
            }}
            exit={{
              opacity: 0,
              scale: 0.1,
            }}
            transition={{
              duration: 0.62,
              ease: [0.16, 1, 0.3, 1], // Smooth natural parabolic curve
            }}
            onAnimationComplete={() => onAnimationComplete(item.id)}
            className="fixed -translate-x-1/2 -translate-y-1/2 flex items-center justify-center will-change-transform drop-shadow-xl"
          >
            {/* Circular flying badge with image and animated pulse ring */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full ring-3 ring-emerald-500 bg-white dark:bg-stone-900 shadow-2xl shadow-emerald-950/50 p-1 flex items-center justify-center overflow-hidden">
              <img
                src={item.imageUrl}
                alt={`${item.name} - Ayam Segar Halal Pasar Semenyih | Khairul FRESH Food`}
                title={`${item.name} - Ayam Segar Halal Pasar Semenyih | Khairul FRESH Food`}
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-full px-1.5 py-0.5 shadow-md flex items-center gap-0.5 border border-white">
                <Plus className="w-2.5 h-2.5 stroke-[3]" />1
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
