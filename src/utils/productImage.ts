import { Product } from '../types';

export const DEFAULT_PRODUCT_IMAGES: Record<string, string> = {
  'ayam-kampung-organik': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=900',
  'ayam-segar-standard': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=900',
  'ayam-tua-pencen-segar': 'https://images.unsplash.com/photo-1548567117-0429762db801?auto=format&fit=crop&q=80&w=900',
  'whole-leg-segar': 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=80&w=900',
  'kepak-ayam-segar': 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80&w=900',
  'dada-ayam-segar': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=900',
  'hati-pedal-ayam': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=900',
  'kaki-ayam': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=900',
  'rangka-ayam': 'https://images.unsplash.com/photo-1548567117-0429762db801?auto=format&fit=crop&q=80&w=900',
  'kombo-jimat-keluarga-sihat': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=900',
};

/**
 * Resolves the image URL for the given product.
 * Returns the product's custom image if present. If image is undefined, falls back to default; if explicitly empty (''), respects the deleted/cleared state.
 */
export function getProductImageUrl(product?: Partial<Product> | null): string {
  if (!product) return '';

  if (typeof product.image === 'string') {
    const trimmed = product.image.trim();
    if (trimmed.length === 0) {
      // Intentionally cleared/deleted by admin -> do not restore default image
      return '';
    }
    // Ignore revoked blob URLs from previous browser sessions that fail on reload
    if (!trimmed.startsWith('blob:') && trimmed.length > 5) {
      return trimmed;
    }
    return '';
  }

  // If image property was never defined (new uninitialized item), fallback to default preset
  if (product.id && DEFAULT_PRODUCT_IMAGES[product.id]) {
    return DEFAULT_PRODUCT_IMAGES[product.id];
  }

  return '';
}

