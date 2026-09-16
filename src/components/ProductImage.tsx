import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { getProductImageUrl, getProductImageAltText } from '../utils/productImage';
import { Package, ShieldCheck } from 'lucide-react';

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
  const imageUrl = getProductImageUrl(product);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(true);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setHasError(false);
    // Check if image is already cached or loaded in DOM
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [imageUrl, product?.image, product?.id, product?.name]);

  const descriptiveAlt = getProductImageAltText(product, alt);
  const displayName = product?.name || alt || 'Produk Ayam Segar';
  const hasValidImage = Boolean(imageUrl && imageUrl.trim().length > 5 && !hasError);

  return (
    <div className={containerClassName} onClick={onClick}>
      {hasValidImage ? (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 bg-stone-200 dark:bg-stone-800 animate-pulse flex items-center justify-center pointer-events-none">
              <Package className="w-8 h-8 text-stone-400/50" />
            </div>
          )}
          <img
            ref={imgRef}
            src={imageUrl}
            alt={descriptiveAlt}
            title={descriptiveAlt}
            loading="eager"
            referrerPolicy="no-referrer"
            onError={() => {
              setHasError(true);
              setIsLoaded(false);
            }}
            onLoad={() => setIsLoaded(true)}
            className={`${className} ${
              showHoverEffect ? 'group-hover:scale-105 transition-transform duration-500' : ''
            } ${isLoaded ? 'opacity-100' : 'opacity-90'} transition-opacity duration-300`}
          />
        </>
      ) : (
        /* High Quality Clean Placeholder when no image is uploaded or error occurs */
        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60 select-none">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-1.5 shadow-2xs">
            <Package className="w-6 h-6" />
          </div>
          <span className="text-xs font-extrabold text-stone-800 dark:text-stone-200 line-clamp-1 max-w-[90%] px-1">
            {displayName}
          </span>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
            <ShieldCheck className="w-3 h-3" />
            <span>100% Halal Diiktiraf</span>
          </div>
        </div>
      )}
    </div>
  );
};
