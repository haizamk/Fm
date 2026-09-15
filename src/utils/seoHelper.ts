import { Product } from '../types';

export interface SeoMetadataOptions {
  title?: string;
  description?: string;
  category?: string;
  product?: Product | null;
  path?: string;
  canonicalUrl?: string;
}

const BASE_TITLE = 'Khairul FRESH Food - Ayam Segar Halal Pasar Semenyih';
const BASE_DESC = 'Platform Pesanan & Penghantaran Ayam Segar Halal Pasar Semenyih. Pilihan penghantaran pantas terus ke rumah & self-pickup percuma di GA 59 Pasar Semenyih.';

/**
 * Converts any string into a clean, human-readable, URL-friendly slug
 * Examples: "Ayam Segar Standard" -> "ayam-segar-standard"
 *           "Ayam Kampung (1.8kg)" -> "ayam-kampung-1-8kg"
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove special characters
    .replace(/[\s_-]+/g, '-') // swap spaces and underscores for single dash
    .replace(/^-+|-+$/g, ''); // remove leading/trailing dashes
}

/**
 * Retrieves the cleanest user-friendly slug for a product
 */
export function getProductSlug(product: Product): string {
  if (!product) return '';
  if (product.id && /^[a-z0-9-]+$/.test(product.id)) {
    return product.id;
  }
  return slugify(product.name) || product.id || 'produk';
}

/**
 * Generates clean, short, user-friendly product URLs
 * Supports:
 * - Path format: https://domain/p/ayam-segar-standard (Cleanest, easiest to remember & share)
 * - Query format: https://domain/?p=ayam-segar-standard (Simple query)
 */
export function getProductCleanUrl(
  product: Product,
  options: { format?: 'path' | 'query' | 'short'; customOrigin?: string } = {}
): string {
  if (!product) return '';
  const slug = getProductSlug(product);
  const origin = options.customOrigin || (typeof window !== 'undefined' ? window.location.origin : 'https://khairulfreshfood.com');
  const format = options.format || 'path';

  if (format === 'query') {
    return `${origin}/?p=${encodeURIComponent(slug)}`;
  }

  // Default clean path URL: /p/ayam-segar-standard
  return `${origin}/p/${encodeURIComponent(slug)}`;
}

/**
 * Finds a product matching a given slug or ID with flexible fuzzy matching
 */
export function findProductBySlugOrId(query: string, products: Product[]): Product | undefined {
  if (!query || !products || products.length === 0) return undefined;

  const cleanQuery = query.toLowerCase().trim();
  const slugifiedQuery = slugify(query);

  // 1. Direct ID match
  const exactId = products.find(p => p.id.toLowerCase() === cleanQuery);
  if (exactId) return exactId;

  // 2. Slugified ID match
  const slugIdMatch = products.find(p => slugify(p.id) === slugifiedQuery);
  if (slugIdMatch) return slugIdMatch;

  // 3. Slugified Name match
  const slugNameMatch = products.find(p => slugify(p.name) === slugifiedQuery);
  if (slugNameMatch) return slugNameMatch;

  // 4. Substring / partial match
  const partialMatch = products.find(p => 
    p.name.toLowerCase().includes(cleanQuery) || 
    p.id.toLowerCase().includes(cleanQuery)
  );
  if (partialMatch) return partialMatch;

  return undefined;
}

/**
 * Updates dynamic meta tags for search engines and social sharing cards
 */
export function updateSeoTags(options: SeoMetadataOptions = {}) {
  if (typeof document === 'undefined') return;

  let pageTitle = BASE_TITLE;
  let pageDesc = BASE_DESC;

  if (options.product) {
    pageTitle = `${options.product.name} (RM${options.product.price.toFixed(2)}) | Khairul FRESH Food Semenyih`;
    pageDesc = `${options.product.description || options.product.subtitle}. Ayam segar harian Pasar Semenyih, dijamin bersih & 100% Halal JAKIM.`;
  } else if (options.category && options.category !== 'semua') {
    const formattedCat = options.category
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    pageTitle = `${formattedCat} Segar Halal | Khairul FRESH Food Pasar Semenyih`;
    pageDesc = `Beli ${formattedCat} segar setiap hari di Pasar Semenyih. Khidmat potong & cuci percuma, penghantaran pantas di Semenyih, Beranang & Kajang.`;
  } else if (options.title) {
    pageTitle = `${options.title} | Khairul FRESH Food`;
    if (options.description) {
      pageDesc = options.description;
    }
  }

  // 1. Update document.title
  document.title = pageTitle;

  // 2. Helper to set or update meta tag by name or property
  const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
    let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Standard Meta Tags
  setMetaTag('name', 'description', pageDesc);
  setMetaTag('name', 'keywords', 'ayam segar semenyih, pasar semenyih, daging halal semenyih, khairul fresh food, ayam potong cuci percuma, eco majestic, bandar rinching, beranang');

  // OpenGraph Tags
  setMetaTag('property', 'og:title', pageTitle);
  setMetaTag('property', 'og:description', pageDesc);
  setMetaTag('property', 'og:type', options.product ? 'product' : 'website');
  setMetaTag('property', 'og:site_name', 'Khairul FRESH Food Semenyih');

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  setMetaTag('property', 'og:url', currentUrl);

  // Twitter Tags
  setMetaTag('name', 'twitter:title', pageTitle);
  setMetaTag('name', 'twitter:description', pageDesc);

  // Canonical link tag
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', options.canonicalUrl || (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''));
}

/**
 * Injects or updates Schema.org JSON-LD structured data for Google Search rich snippets
 */
export function injectStructuredData(products: Product[] = []) {
  if (typeof document === 'undefined') return;

  const scriptId = 'freshayam-jsonld-schema';
  let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;

  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = scriptId;
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://khairulfreshfood.com';

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. Local Grocery / Food Store
      {
        '@type': 'GroceryStore',
        '@id': `${origin}/#store`,
        'name': 'Khairul FRESH Food',
        'image': `${origin}/icon.png`,
        'url': origin,
        'telephone': '+601111135503',
        'priceRange': 'RM',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'Gerai GA 59, Pasar Awam Semenyih, Jalan Pasar',
          'addressLocality': 'Semenyih',
          'addressRegion': 'Selangor',
          'postalCode': '43500',
          'addressCountry': 'MY'
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': 2.9518,
          'longitude': 101.8436
        },
        'openingHoursSpecification': [
          {
            '@type': 'OpeningHoursSpecification',
            'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            'opens': '06:00',
            'closes': '13:00'
          }
        ],
        'servesCuisine': 'Halal Fresh Poultry & Meat',
        'paymentAccepted': 'Cash, DuitNow QR, FPX Online Banking, HitPay, Boost, Touch n Go eWallet',
        'currenciesAccepted': 'MYR'
      },
      // 2. Breadcrumbs
      {
        '@type': 'BreadcrumbList',
        '@id': `${origin}/#breadcrumb`,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Laman Utama',
            'item': origin
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Katalog Ayam & Daging Segar',
            'item': `${origin}/?kategori=semua`
          }
        ]
      },
      // 3. Featured Products for Search Indexing
      ...products.slice(0, 15).map((p) => {
        const cleanSlug = getProductSlug(p);
        return {
          '@type': 'Product',
          '@id': `${origin}/p/${cleanSlug}`,
          'name': p.name,
          'description': p.description || p.subtitle,
          'image': p.image,
          'offers': {
            '@type': 'Offer',
            'url': `${origin}/p/${cleanSlug}`,
            'priceCurrency': 'MYR',
            'price': p.price,
            'availability': p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            'itemCondition': 'https://schema.org/NewCondition',
            'seller': {
              '@type': 'Organization',
              'name': 'Khairul FRESH Food'
            }
          },
          'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': p.rating || 4.9,
            'reviewCount': p.reviewsCount || 45
          }
        };
      })
    ]
  };

  scriptEl.textContent = JSON.stringify(schemaData);
}

/**
 * Generates clean shareable link with query parameters or clean path
 */
export function getShareableUrl(params: {
  kategori?: string;
  produk?: string;
  modal?: string;
  useCleanPath?: boolean;
}): string {
  if (typeof window === 'undefined') return '';
  
  // If requesting a clean product link directly:
  if (params.produk && (params.useCleanPath !== false)) {
    const slug = slugify(params.produk);
    return `${window.location.origin}/p/${encodeURIComponent(slug)}`;
  }

  const url = new URL(window.location.origin + window.location.pathname);
  if (params.kategori && params.kategori !== 'semua') {
    url.searchParams.set('kategori', params.kategori);
  }
  if (params.produk) {
    url.searchParams.set('p', slugify(params.produk));
  }
  if (params.modal) {
    url.searchParams.set('modal', params.modal);
  }
  return url.toString();
}

/**
 * Generates WhatsApp share URL with pre-filled message and simple product link
 */
export function getWhatsAppShareUrl(product: Product): string {
  if (!product) return '';
  const cleanUrl = getProductCleanUrl(product, { format: 'path' });
  const priceFormatted = `RM ${product.price.toFixed(2)}`;
  const text = `Hai! Tengok produk segar halal ini di Khairul FRESH Food (Pasar Semenyih):\n\n🐔 *${product.name}*\n💰 Harga: *${priceFormatted}* / ${product.unit}\n✨ *${product.subtitle || 'Segar Harian & Halal JAKIM'}*\n\n🛒 Pesan & tempah potongan terus di sini:\n${cleanUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Copies link to clipboard and triggers optional feedback
 */
export async function copyShareableLink(url: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    } else {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  } catch {
    return false;
  }
}

