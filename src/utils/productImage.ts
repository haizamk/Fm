import { Product, ProductCategory } from '../types';

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'ayam-seekor': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=85&w=1200',
  'ayam-bulat': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=85&w=1200',
  'bahagian-ayam': 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=85&w=1200',
  'potongan': 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=85&w=1200',
  'bahagian-khas': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=85&w=1200',
  'kampung-organik': 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&q=85&w=1200',
  'kombo-jimat': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=85&w=1200',
  'pek-jimat': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=85&w=1200',
  'perapan-rempah': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=85&w=1200',
  'default': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=85&w=1200',
};

export const PRODUCT_SPECIFIC_IMAGES: Record<string, string> = {
  'ayam-segar-standard': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=85&w=1200',
  'ayam-kampung-organik': 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&q=85&w=1200',
  'ayam-tua-pencen-segar': 'https://images.unsplash.com/photo-1548567117-0429762db801?auto=format&fit=crop&q=85&w=1200',
  'whole-leg-segar': 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=85&w=1200',
  'kepak-ayam-segar': 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&q=85&w=1200',
  'dada-ayam-segar': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=85&w=1200',
  'hati-pedal-ayam': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=85&w=1200',
  'kaki-ayam': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&q=85&w=1200',
  'rangka-ayam': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=85&w=1200',
  'rangka-kaki-ayam': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&q=85&w=1200',
  'kombo-jimat-keluarga-sihat': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=85&w=1200',
};

/**
 * Resolves the most appropriate image URL for a product, falling back dynamically
 * based on product ID, description keywords, and category.
 */
export function getProductImageUrl(product?: Partial<Product> | null): string {
  if (!product) return CATEGORY_FALLBACK_IMAGES['default'];

  // If valid image provided, use it
  if (product.image && typeof product.image === 'string' && product.image.trim().length > 10) {
    return product.image.trim();
  }

  // Check known product ID
  if (product.id && PRODUCT_SPECIFIC_IMAGES[product.id]) {
    return PRODUCT_SPECIFIC_IMAGES[product.id];
  }

  // Keyword check from name / description
  const searchStr = `${product.name || ''} ${product.subtitle || ''} ${product.description || ''}`.toLowerCase();
  if (searchStr.includes('kampung') || searchStr.includes('organik')) {
    return PRODUCT_SPECIFIC_IMAGES['ayam-kampung-organik'];
  }
  if (searchStr.includes('kepak') || searchStr.includes('wing')) {
    return PRODUCT_SPECIFIC_IMAGES['kepak-ayam-segar'];
  }
  if (searchStr.includes('dada') || searchStr.includes('fillet') || searchStr.includes('breast')) {
    return PRODUCT_SPECIFIC_IMAGES['dada-ayam-segar'];
  }
  if (searchStr.includes('whole-leg') || searchStr.includes('peha') || searchStr.includes('drumstick') || searchStr.includes('paha')) {
    return PRODUCT_SPECIFIC_IMAGES['whole-leg-segar'];
  }
  if (searchStr.includes('hati') || searchStr.includes('pedal') || searchStr.includes('organ')) {
    return PRODUCT_SPECIFIC_IMAGES['hati-pedal-ayam'];
  }
  if (searchStr.includes('tua') || searchStr.includes('pencen')) {
    return PRODUCT_SPECIFIC_IMAGES['ayam-tua-pencen-segar'];
  }
  if (searchStr.includes('rangka') || searchStr.includes('kaki') || searchStr.includes('tulang')) {
    return PRODUCT_SPECIFIC_IMAGES['rangka-kaki-ayam'];
  }
  if (searchStr.includes('kombo') || searchStr.includes('jimat') || searchStr.includes('pakej')) {
    return PRODUCT_SPECIFIC_IMAGES['kombo-jimat-keluarga-sihat'];
  }

  // Category fallback
  if (product.category && CATEGORY_FALLBACK_IMAGES[product.category]) {
    return CATEGORY_FALLBACK_IMAGES[product.category];
  }

  return CATEGORY_FALLBACK_IMAGES['default'];
}
