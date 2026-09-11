import { Product } from '../types';

/**
 * Calculates estimated price per kilogram from product price and weight estimate.
 */
export function calculatePricePerKg(product: Product): {
  pricePerKg: number;
  formatted: string;
  isEstimate: boolean;
} {
  // If product already has explicit pricePerKg in data
  if ((product as any).pricePerKg && typeof (product as any).pricePerKg === 'number') {
    const val = (product as any).pricePerKg;
    return {
      pricePerKg: val,
      formatted: `RM ${val.toFixed(2)}/kg`,
      isEstimate: false,
    };
  }

  const weightStr = product.weightEstimate.toLowerCase();
  
  // Handle gram patterns like '500g', '800g'
  const gramMatch = weightStr.match(/(\d+(?:\.\d+)?)\s*g/i);
  if (gramMatch && !weightStr.includes('kg')) {
    const grams = parseFloat(gramMatch[1]);
    if (grams > 0) {
      const kg = grams / 1000;
      const perKg = product.price / kg;
      return {
        pricePerKg: perKg,
        formatted: `RM ${perKg.toFixed(2)}/kg`,
        isEstimate: false,
      };
    }
  }

  // Handle range patterns like '1.5kg - 1.8kg' or '1.5 - 1.8kg'
  const rangeMatch = weightStr.match(/(\d+(?:\.\d+)?)\s*(?:kg)?\s*-\s*(\d+(?:\.\d+)?)\s*kg/i);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    const avgKg = (min + max) / 2;
    if (avgKg > 0) {
      const perKg = product.price / avgKg;
      return {
        pricePerKg: perKg,
        formatted: `~RM ${perKg.toFixed(2)}/kg`,
        isEstimate: true,
      };
    }
  }

  // Handle single kg patterns like '1.0kg net', '1.2kg', '2kg'
  const singleKgMatch = weightStr.match(/(\d+(?:\.\d+)?)\s*kg/i);
  if (singleKgMatch) {
    const kg = parseFloat(singleKgMatch[1]);
    if (kg > 0) {
      const perKg = product.price / kg;
      return {
        pricePerKg: perKg,
        formatted: `RM ${perKg.toFixed(2)}/kg`,
        isEstimate: false,
      };
    }
  }

  // Default fallback: assume 1kg or unit
  return {
    pricePerKg: product.price,
    formatted: `RM ${product.price.toFixed(2)}/unit`,
    isEstimate: false,
  };
}
