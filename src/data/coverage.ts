import { CoverageArea, DeliverySlot } from '../types';

export const STORE_PICKUP_LOCATION = {
  name: 'Khairul Fresh Food (Kedai Pasar)',
  address: 'GA 59, Pasar Semenyih, 43500 Semenyih, Selangor',
  postcode: '43500',
  city: 'Semenyih',
  state: 'Selangor',
  phone: '011-11135503',
  whatsapp: '601111135503',
  operatingHours: 'Selasa - Ahad: 7:00 AM - 12:00 Tengah Hari (Isnin Tutup)',
  fee: 0,
};

export const DELIVERY_SLOTS: DeliverySlot[] = [
  {
    id: 'pagi',
    label: 'Slot Pagi Utama (Ayam Segar Pagi)',
    timeRange: '7:30 AM – 11:30 AM',
    description: 'Bekalan segar awal pagi. Dihantar terus ke pintu rumah sebelum waktu makan tengah hari.',
    badge: 'Paling Popular',
  },
  {
    id: 'petang',
    label: 'Slot Tengah Hari',
    timeRange: '10:30 AM – 12:00 PM',
    description: 'Penghantaran pantas terus dari pasar sebelum waktu operasi berakhir 12:00 Tengah Hari.',
    badge: 'Sedia Masak',
  },
];

export const COVERAGE_AREAS: CoverageArea[] = [
  {
    postcode: '43500',
    city: 'Semenyih',
    state: 'Selangor',
    zone: 'Zon Utama (Semenyih)',
    deliveryFee: 6.00,
    freeShippingMin: 150,
    estimatedHours: 'Selasa - Ahad (7:00 AM - 12:00 PM)',
  },
  {
    postcode: '43700',
    city: 'Beranang',
    state: 'Selangor',
    zone: 'Zon Beranang',
    deliveryFee: 9.00,
    freeShippingMin: 150,
    estimatedHours: 'Selasa - Ahad (7:00 AM - 12:00 PM)',
  },
  {
    postcode: '43000',
    city: 'Kajang',
    state: 'Selangor',
    zone: 'Zon Kajang',
    deliveryFee: 15.00,
    freeShippingMin: 150,
    estimatedHours: 'Selasa - Ahad (7:00 AM - 12:00 PM)',
  },
];

export function checkCoverageByPostcode(input: string): {
  found: boolean;
  area?: CoverageArea;
  matches?: CoverageArea[];
} {
  const clean = input.trim().toLowerCase();
  if (!clean) return { found: false };

  // Direct postcode match
  const exact = COVERAGE_AREAS.find((a) => a.postcode === clean);
  if (exact) {
    return { found: true, area: exact };
  }

  // Name match or partial postcode
  const matches = COVERAGE_AREAS.filter(
    (a) =>
      a.postcode.startsWith(clean) ||
      a.city.toLowerCase().includes(clean) ||
      a.state.toLowerCase().includes(clean)
  );

  if (matches.length > 0) {
    return { found: true, area: matches[0], matches };
  }

  return { found: false };
}
