import { Product } from '../types';
import { PRODUCTS } from '../data/products';
import { getProductSlug } from './seoHelper';
import { getProductImageUrl, getProductImageAltText } from './productImage';

export interface SitemapGeneratorOptions {
  baseUrl?: string;
  products?: Product[];
  lastModifiedDate?: string;
}

/**
 * Escapes special XML characters
 */
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates a complete, Google-compliant XML Sitemap dynamically.
 * Conforms to Sitemap 0.9 protocol and Google Image Sitemap 1.1 extension.
 */
export function generateSitemapXml(options: SitemapGeneratorOptions = {}): string {
  const defaultOrigin = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://ais-pre-ibciauzkghto525j7ma3h5-707200717362.asia-east1.run.app';

  const baseUrl = (options.baseUrl || defaultOrigin).replace(/\/+$/, '');
  const productList = (options.products && options.products.length > 0) ? options.products : PRODUCTS;
  const today = options.lastModifiedDate || new Date().toISOString().split('T')[0];

  const staticRoutes = [
    {
      loc: `${baseUrl}/`,
      priority: '1.0',
      changefreq: 'daily',
      title: 'Khairul FRESH Food - Pembekal Ayam Segar Halal Pasar Semenyih & Delivery',
      image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=1200'
    },
    {
      loc: `${baseUrl}/#katalog`,
      priority: '0.9',
      changefreq: 'daily',
      title: 'Katalog Ayam Segar, Daging & Makanan Segar Pasar Semenyih',
      image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=1200'
    },
    {
      loc: `${baseUrl}/#kategori-ayam-seekor`,
      priority: '0.85',
      changefreq: 'daily',
      title: 'Ayam Segar Standard & Ayam Kampung Seekor Pasar Semenyih',
      image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=1200'
    },
    {
      loc: `${baseUrl}/#kategori-bahagian-ayam`,
      priority: '0.85',
      changefreq: 'daily',
      title: 'Potongan Bahagian Ayam Segar (Whole Leg, Kepak, Dada, Kaki & Rangka)',
      image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=80&w=1200'
    },
    {
      loc: `${baseUrl}/#kategori-daging-segar`,
      priority: '0.85',
      changefreq: 'daily',
      title: 'Daging Lembu Segar Tempatan & Tulang Lembu Pasar Semenyih',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200'
    },
    {
      loc: `${baseUrl}/#kawasan-penghantaran`,
      priority: '0.8',
      changefreq: 'weekly',
      title: 'Kawasan Liputan Penghantaran Ayam Segar Semenyih, Eco Majestic & Beranang'
    },
    {
      loc: `${baseUrl}/#panduan-potongan`,
      priority: '0.8',
      changefreq: 'weekly',
      title: 'Panduan Pilihan Potongan & Khidmat Cuci Bersih Percuma Pasar Semenyih'
    },
    {
      loc: `${baseUrl}/#lokasi-gerai-ga59`,
      priority: '0.85',
      changefreq: 'monthly',
      title: 'Lokasi Fizikal Gerai GA 59 Pasar Awam Semenyih (Self-Pickup Percuma)'
    },
    {
      loc: `${baseUrl}/#jaminan-kualiti`,
      priority: '0.75',
      changefreq: 'monthly',
      title: 'Jaminan 100% Halal Diiktiraf, Sembelihan Subuh & Rantaian Sejuk Dingin'
    },
    {
      loc: `${baseUrl}/#soalan-lazim`,
      priority: '0.75',
      changefreq: 'weekly',
      title: 'Soalan Lazim FAQ Pesanan, Pembayaran & Penghantaran Ayam Segar'
    },
    {
      loc: `${baseUrl}/#tracking`,
      priority: '0.7',
      changefreq: 'daily',
      title: 'Semakan Status Pesanan Semasa (Live Order Tracking)'
    },
    {
      loc: `${baseUrl}/#resipi`,
      priority: '0.7',
      changefreq: 'weekly',
      title: 'Koleksi Resipi Masakan Ayam Segar Tradisi & Moden'
    }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
        http://www.google.com/schemas/sitemap-image/1.1
        http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd">\n`;

  // 1. Static and Feature Section URLs
  for (const route of staticRoutes) {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(route.loc)}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    if (route.image) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(route.image)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(route.title)}</image:title>\n`;
      xml += `      <image:geo_location>Semenyih, Selangor, Malaysia</image:geo_location>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  // 2. Dynamic Product URLs with Keyword-Rich Image SEO tags
  for (const product of productList) {
    const slug = getProductSlug(product);
    const productCleanUrl = `${baseUrl}/p/${encodeURIComponent(slug)}`;
    const productImageUrl = getProductImageUrl(product) || product.image;
    const descriptiveImageTitle = getProductImageAltText(product);
    const productCaption = `${product.name} (RM${product.price.toFixed(2)}/${product.unit}) - ${product.description || product.subtitle || 'Ayam Segar Halal Pasar Semenyih Gerai GA 59'}`;

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(productCleanUrl)}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.95</priority>\n`;
    if (productImageUrl && productImageUrl.startsWith('http')) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(productImageUrl)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(descriptiveImageTitle)}</image:title>\n`;
      xml += `      <image:caption>${escapeXml(productCaption)}</image:caption>\n`;
      xml += `      <image:geo_location>Semenyih, Selangor, Malaysia</image:geo_location>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;

    // Also index hash deep-link for single-page app direct routing
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(`${baseUrl}/#produk-${encodeURIComponent(slug)}`)}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.85</priority>\n`;
    xml += `  </url>\n`;
  }

  // 3. Local Service Area Landing Pages
  const localZones = [
    { name: 'Semenyih Pekan (43500)', slug: 'semenyih' },
    { name: 'Eco Majestic Semenyih', slug: 'eco-majestic' },
    { name: 'Setia EcoHill & EcoHill 2', slug: 'setia-ecohill' },
    { name: 'Bandar Rinching Semenyih', slug: 'bandar-rinching' },
    { name: 'Taman Pelangi Semenyih', slug: 'pelangi-semenyih' },
    { name: 'Beranang & Mahkota Industrial (43700)', slug: 'beranang' },
    { name: 'Kajang East & Prima Saujana (43000)', slug: 'kajang' },
  ];

  for (const zone of localZones) {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(`${baseUrl}/#kawasan-${zone.slug}`)}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.80</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}
