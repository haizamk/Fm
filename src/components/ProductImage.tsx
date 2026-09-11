import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { getProductImageUrl } from '../utils/productImage';
import { Package, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface ProductImageProps {
  product?: Partial<Product> | null;
  alt?: string;
  className?: string;
  containerClassName?: string;
  onClick?: () => void;
  showHoverEffect?: boolean;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  product,
  alt,
  className = 'w-full h-full object-cover',
  containerClassName = 'w-full h-full relative overflow-hidden bg-stone-100 dark:bg-stone-800',
  onClick,
  showHoverEffect = false,
}) => {
  const primaryUrl = getProductImageUrl(product);
  const [currentSrc, setCurrentSrc] = useState<string>(primaryUrl);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const resolved = getProductImageUrl(product);
    setCurrentSrc(resolved);
    setHasError(false);
    setIsLoaded(false);
  }, [product?.image, product?.id, product?.name]);

  const handleError = () => {
    // If custom image failed, try category fallback
    const fallback = getProductImageUrl({ category: product?.category, id: undefined, image: '' });
    if (currentSrc !== fallback && fallback) {
      setCurrentSrc(fallback);
    } else {
      setHasError(true);
    }
  };

  const displayName = product?.name || alt || 'Produk Ayam Segar';

  return (
    <div className={containerClassName} onClick={onClick}>
      {!hasError ? (
        <>
          {/* Skeleton pulse while loading */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-stone-200 dark:bg-stone-800 animate-pulse flex items-center justify-center">
              <Package className="w-8 h-8 text-stone-400/50" />
            </div>
          )}
          <img
            src={currentSrc}
            alt={displayName}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={handleError}
            onLoad={() => setIsLoaded(true)}
            className={`${className} ${
              showHoverEffect ? 'group-hover:scale-105 transition-transform duration-500' : ''
            } ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          />
        </>
      ) : (
        /* High Quality Clean Placeholder Graphic */
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-emerald-900/10 via-stone-800/20 to-emerald-950/20 text-center border border-stone-200 dark:border-stone-700">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-1.5 shadow-xs">
            <Package className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-stone-800 dark:text-stone-200 line-clamp-1 max-w-[90%]">
            {displayName}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
            <ShieldCheck className="w-3 h-3" />
            <span>100% Halal Diiktiraf</span>
          </span>
        </div>
      )}
    </div>
  );
};
