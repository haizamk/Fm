// Malaysian Postcode & City Auto-Lookup Database and Helper

export interface LocationInfo {
  postcode: string;
  city: string;
  state: string;
  isMainCoverage?: boolean;
}

export const POSTCODE_DATABASE: LocationInfo[] = [
  // Core Coverage Area (Hulu Langat / Semenyih / Kajang / Beranang)
  { postcode: '43500', city: 'Semenyih', state: 'Selangor', isMainCoverage: true },
  { postcode: '43700', city: 'Beranang', state: 'Selangor', isMainCoverage: true },
  { postcode: '43000', city: 'Kajang', state: 'Selangor', isMainCoverage: true },
  { postcode: '43650', city: 'Bandar Baru Bangi', state: 'Selangor', isMainCoverage: true },
  { postcode: '43600', city: 'Bangi', state: 'Selangor', isMainCoverage: true },
  { postcode: '43100', city: 'Hulu Langat', state: 'Selangor', isMainCoverage: true },
  { postcode: '43200', city: 'Cheras', state: 'Selangor', isMainCoverage: true },
  { postcode: '43300', city: 'Seri Kembangan', state: 'Selangor', isMainCoverage: true },
  { postcode: '43400', city: 'Serdang', state: 'Selangor', isMainCoverage: true },
  { postcode: '43800', city: 'Dengkil', state: 'Selangor', isMainCoverage: true },
  { postcode: '43900', city: 'Sepang', state: 'Selangor', isMainCoverage: true },
  { postcode: '43950', city: 'Sungai Pelek', state: 'Selangor', isMainCoverage: true },

  // Greater Selangor & Klang Valley
  { postcode: '40000', city: 'Shah Alam', state: 'Selangor' },
  { postcode: '40100', city: 'Shah Alam', state: 'Selangor' },
  { postcode: '40150', city: 'Shah Alam', state: 'Selangor' },
  { postcode: '40200', city: 'Shah Alam', state: 'Selangor' },
  { postcode: '40300', city: 'Shah Alam', state: 'Selangor' },
  { postcode: '40400', city: 'Shah Alam', state: 'Selangor' },
  { postcode: '40460', city: 'Shah Alam', state: 'Selangor' },
  { postcode: '41000', city: 'Klang', state: 'Selangor' },
  { postcode: '41050', city: 'Klang', state: 'Selangor' },
  { postcode: '41100', city: 'Klang', state: 'Selangor' },
  { postcode: '41200', city: 'Klang', state: 'Selangor' },
  { postcode: '41300', city: 'Klang', state: 'Selangor' },
  { postcode: '41400', city: 'Klang', state: 'Selangor' },
  { postcode: '42000', city: 'Pelabuhan Klang', state: 'Selangor' },
  { postcode: '42100', city: 'Klang', state: 'Selangor' },
  { postcode: '42200', city: 'Kapar', state: 'Selangor' },
  { postcode: '42300', city: 'Bandar Puncak Alam', state: 'Selangor' },
  { postcode: '42500', city: 'Telok Panglima Garang', state: 'Selangor' },
  { postcode: '42600', city: 'Jenjarom', state: 'Selangor' },
  { postcode: '42700', city: 'Banting', state: 'Selangor' },
  { postcode: '42800', city: 'Tanjung Sepat', state: 'Selangor' },
  { postcode: '47000', city: 'Sungai Buloh', state: 'Selangor' },
  { postcode: '47100', city: 'Puchong', state: 'Selangor' },
  { postcode: '47120', city: 'Puchong', state: 'Selangor' },
  { postcode: '47130', city: 'Puchong', state: 'Selangor' },
  { postcode: '47140', city: 'Puchong', state: 'Selangor' },
  { postcode: '47150', city: 'Puchong', state: 'Selangor' },
  { postcode: '47160', city: 'Puchong', state: 'Selangor' },
  { postcode: '47170', city: 'Puchong', state: 'Selangor' },
  { postcode: '47180', city: 'Puchong', state: 'Selangor' },
  { postcode: '47190', city: 'Puchong', state: 'Selangor' },
  { postcode: '47200', city: 'Subang', state: 'Selangor' },
  { postcode: '47300', city: 'Petaling Jaya', state: 'Selangor' },
  { postcode: '47301', city: 'Petaling Jaya', state: 'Selangor' },
  { postcode: '47308', city: 'Petaling Jaya', state: 'Selangor' },
  { postcode: '47400', city: 'Petaling Jaya', state: 'Selangor' },
  { postcode: '47410', city: 'Petaling Jaya', state: 'Selangor' },
  { postcode: '47500', city: 'Subang Jaya', state: 'Selangor' },
  { postcode: '47600', city: 'Subang Jaya', state: 'Selangor' },
  { postcode: '47610', city: 'Subang Jaya', state: 'Selangor' },
  { postcode: '47620', city: 'Subang Jaya', state: 'Selangor' },
  { postcode: '47630', city: 'Subang Jaya', state: 'Selangor' },
  { postcode: '47640', city: 'Subang Jaya', state: 'Selangor' },
  { postcode: '47650', city: 'Subang Jaya', state: 'Selangor' },
  { postcode: '47800', city: 'Petaling Jaya', state: 'Selangor' },
  { postcode: '47810', city: 'Petaling Jaya', state: 'Selangor' },
  { postcode: '47820', city: 'Petaling Jaya', state: 'Selangor' },
  { postcode: '47830', city: 'Petaling Jaya', state: 'Selangor' },
  { postcode: '48000', city: 'Rawang', state: 'Selangor' },
  { postcode: '48050', city: 'Rawang', state: 'Selangor' },
  { postcode: '48100', city: 'Batu Arang', state: 'Selangor' },
  { postcode: '48200', city: 'Serendah', state: 'Selangor' },
  { postcode: '48300', city: 'Rawang', state: 'Selangor' },
  { postcode: '63000', city: 'Cyberjaya', state: 'Selangor' },
  { postcode: '68000', city: 'Ampang', state: 'Selangor' },
  { postcode: '68100', city: 'Batu Caves', state: 'Selangor' },

  // Wilayah Persekutuan Kuala Lumpur & Putrajaya
  { postcode: '50000', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '50100', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '50200', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '50250', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '50300', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '50350', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '50400', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '50450', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '50480', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '50490', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '50500', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '51000', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '51100', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '51200', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '52000', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '52100', city: 'Kepong', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '52200', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '53000', city: 'Setapak', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '53100', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '53200', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '53300', city: 'Setapak', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '54000', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '54100', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '54200', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '55000', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '55100', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '55200', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '55300', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '56000', city: 'Cheras', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '56100', city: 'Cheras', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '57000', city: 'Sungai Besi', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '57100', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '58000', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '58100', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '58200', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '59000', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '59100', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '59200', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '60000', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' },
  { postcode: '62000', city: 'Putrajaya', state: 'Wilayah Persekutuan Putrajaya' },
  { postcode: '62007', city: 'Putrajaya', state: 'Wilayah Persekutuan Putrajaya' },
  { postcode: '62100', city: 'Putrajaya', state: 'Wilayah Persekutuan Putrajaya' },
  { postcode: '62150', city: 'Putrajaya', state: 'Wilayah Persekutuan Putrajaya' },
  { postcode: '62250', city: 'Putrajaya', state: 'Wilayah Persekutuan Putrajaya' },
  { postcode: '62300', city: 'Putrajaya', state: 'Wilayah Persekutuan Putrajaya' },
  { postcode: '62502', city: 'Putrajaya', state: 'Wilayah Persekutuan Putrajaya' },

  // Negeri Sembilan border areas (Near Semenyih & Beranang)
  { postcode: '71800', city: 'Nilai', state: 'Negeri Sembilan' },
  { postcode: '71700', city: 'Mantin', state: 'Negeri Sembilan' },
  { postcode: '70000', city: 'Seremban', state: 'Negeri Sembilan' },
];

/**
 * Look up location details by 5-digit postcode
 */
export function lookupByPostcode(postcode: string): LocationInfo | null {
  const clean = postcode.replace(/\D/g, '').trim();
  if (clean.length < 4) return null;

  // Exact match
  const match = POSTCODE_DATABASE.find((item) => item.postcode === clean);
  if (match) return match;

  // Prefix match if 5 digits
  if (clean.length === 5) {
    const prefix2 = clean.substring(0, 2);
    // Determine state by prefix
    if (['40', '41', '42', '43', '44', '45', '46', '47', '48', '63', '68'].includes(prefix2)) {
      return { postcode: clean, city: 'Selangor', state: 'Selangor' };
    }
    if (['50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60'].includes(prefix2)) {
      return { postcode: clean, city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur' };
    }
    if (['62'].includes(prefix2)) {
      return { postcode: clean, city: 'Putrajaya', state: 'Wilayah Persekutuan Putrajaya' };
    }
    if (['70', '71', '72', '73'].includes(prefix2)) {
      return { postcode: clean, city: 'Seremban / Nilai', state: 'Negeri Sembilan' };
    }
  }

  return null;
}

/**
 * Look up postcode and state by City name query
 */
export function lookupByCity(cityName: string): LocationInfo | null {
  const clean = cityName.trim().toLowerCase();
  if (clean.length < 3) return null;

  const match = POSTCODE_DATABASE.find(
    (item) => item.city.toLowerCase() === clean || item.city.toLowerCase().startsWith(clean)
  );

  return match || null;
}
