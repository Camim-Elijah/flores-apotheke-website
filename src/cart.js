// Reine Geschäftslogik ohne DOM: dadurch unabhängig von der Oberfläche testbar.
export function setQuantity(cart, id, quantity, catalog) {
  if (!catalog.some(product => product.id === id)) return cart;
  const next = { ...cart };
  const safeQuantity = Number.isFinite(quantity) ? Math.max(0, Math.min(99, Math.trunc(quantity))) : 0;
  if (safeQuantity === 0) delete next[id]; else next[id] = safeQuantity;
  return next;
}
export function total(cart, catalog) {
  return catalog.reduce((sum, product) => sum + product.price * (cart[product.id] || 0), 0);
}
export function restoreCart(value, catalog) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return catalog.reduce((cart, product) => setQuantity(cart, product.id, Number(value[product.id] || 0), catalog), {});
}
