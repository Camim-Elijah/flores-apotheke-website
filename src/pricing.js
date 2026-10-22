// Preise in Cent, Nettofüllmengen in Milligramm: keine Verwechslung mit Versandgewicht.
export function basePriceCentsPerKg(priceCents, netQuantityMg) {
  if (!Number.isInteger(priceCents) || priceCents < 0 || !Number.isInteger(netQuantityMg) || netQuantityMg <= 0) return null;
  return Math.round(priceCents * 1_000_000 / netQuantityMg);
}

export function formatPrice(cents) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

export function formatNetWeight(netQuantityMg) {
  return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 3 }).format(netQuantityMg / 1000)} g`;
}

export function basePriceLabel(variant) {
  const value = basePriceCentsPerKg(variant.price, variant.netQuantityMg);
  return value === null ? 'Grundpreis noch nicht berechenbar' : `${formatPrice(value)} / 1 kg`;
}
