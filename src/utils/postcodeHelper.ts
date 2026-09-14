// Malaysian Postcode & City Auto-Lookup Database and Helper

export interface LocationInfo {
  postcode: string;
  city: string;
  state: string;
  isMainCoverage?: boolean;
}

export const POSTCODE_DATABASE: LocationInfo[] = [
  // 3 Direct Delivery Coverage Towns (Semenyih, Beranang, Kajang)
  { postcode: '43500', city: 'Semenyih', state: 'Selangor', isMainCoverage: true },
  { postcode: '43700', city: 'Beranang', state: 'Selangor', isMainCoverage: true },
  { postcode: '43000', city: 'Kajang', state: 'Selangor', isMainCoverage: true },
];

/**
 * Look up location details by 5-digit postcode.
 * Strictly auto-detects Semenyih (43500), Beranang (43700), Kajang (43000) as delivery-supported,
 * while still recognizing generic state/region fallbacks if customer enters their home postcode.
 */
export function lookupByPostcode(postcode: string): LocationInfo | null {
  const clean = postcode.replace(/\D/g, '').trim();
  if (clean.length < 4) return null;

  // Exact match with allowed database
  const match = POSTCODE_DATABASE.find((item) => item.postcode === clean);
  if (match) return match;

  // Graceful fallback for customer residence poskod (Customer still can enter their postcode for self-pickup)
  if (clean.length === 5) {
    const prefix2 = clean.substring(0, 2);
    if (['40', '41', '42', '43', '44', '45', '46', '47', '48', '63', '68'].includes(prefix2)) {
      return { postcode: clean, city: 'Luar Liputan Penghantaran', state: 'Selangor', isMainCoverage: false };
    }
    if (['50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60'].includes(prefix2)) {
      return { postcode: clean, city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', isMainCoverage: false };
    }
    if (['62'].includes(prefix2)) {
      return { postcode: clean, city: 'Putrajaya', state: 'Wilayah Persekutuan Putrajaya', isMainCoverage: false };
    }
    if (['70', '71', '72', '73'].includes(prefix2)) {
      return { postcode: clean, city: 'Negeri Sembilan', state: 'Negeri Sembilan', isMainCoverage: false };
    }
    return { postcode: clean, city: 'Luar Kawasan Liputan', state: 'Malaysia', isMainCoverage: false };
  }

  return null;
}

/**
 * Look up postcode and state by City name query (Semenyih, Beranang, Kajang)
 */
export function lookupByCity(cityName: string): LocationInfo | null {
  const clean = cityName.trim().toLowerCase();
  if (clean.length < 3) return null;

  const match = POSTCODE_DATABASE.find(
    (item) => item.city.toLowerCase() === clean || item.city.toLowerCase().startsWith(clean)
  );

  return match || null;
}
