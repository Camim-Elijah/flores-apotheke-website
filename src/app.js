import { products, productLines } from './products.js';
import { setQuantity, total, restoreCart } from './cart.js';
import { escapeHtml, priceInformation, regulatoryInformation } from './product-info.js';
import { setupMap } from './location.js';

const $ = selector => document.querySelector(selector);
const euro = cents => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
// Katalogtexte niemals ungefiltert als HTML einsetzen.
const escape = escapeHtml;
const storageKey = 'flores-catalog-cart-v2';
let cart = {};
let category = 'Alle';
let catalogExpanded = false;
let toastTimer;
try { cart = restoreCart(JSON.parse(localStorage.getItem(storageKey)), products); } catch { /* Speicher ist optional. */ }

function renderProducts() {
  const query = $('#search').value.trim().toLocaleLowerCase('de');
  const matches = productLines.filter(p => (category === 'Alle' || category === p.category) && `${p.name} ${p.category} ${p.description}`.toLocaleLowerCase('de').includes(query));
  const initialIds = ['nomosan-11', 'nomosan-3', 'nomosan-0'];
  const visible = !catalogExpanded && !query && category === 'Alle' ? initialIds.map(id => matches.find(p => p.id === id)).filter(Boolean) : matches;
  $('#product-count').textContent = `${visible.length} von ${matches.length} Produkten`;
  $('#show-all-products').hidden = !!query || category !== 'Alle';
  $('#show-all-products').textContent = catalogExpanded ? 'Weniger Produkte anzeigen' : `Alle ${productLines.length} Produkte anzeigen`;
  $('#show-all-products').setAttribute('aria-expanded', String(catalogExpanded));
  $('#products').innerHTML = visible.map(p => `<article class="product">
    <button class="product-art real-product" data-detail="${p.id}" aria-label="Details zu ${escape(p.name)}"><img src="${p.image}" alt="${escape(p.name)} – Herstellerabbildung" loading="lazy" width="350" height="350"></button>
    <div class="product-info"><small>Nahrungsergänzungsmittel · Nomosan</small><h3><button class="product-title" data-detail="${p.id}">${escape(p.name)}</button></h3><p class="product-description">${escape(p.description)}</p>
    <label class="variant-label">Packungsgröße<select data-variant="${p.id}">${p.variants.map(v => `<option value="${v.id}">${escape(v.pack)} · ${euro(v.price)}</option>`).join('')}</select></label>
    <div class="card-pricing" data-price-for="${p.id}">${priceInformation(p.variants[0])}</div><small class="price-caption">Hersteller-Endpreis inkl. MwSt. · Demo ohne Versand</small><div class="product-bottom"><button class="details-link" data-detail="${p.id}">Produktinformationen</button><button class="add-to-cart" data-add-line="${p.id}" aria-label="${escape(p.name)} in der gewählten Packung zum Demo-Warenkorb hinzufügen">In den Warenkorb</button></div></div></article>`).join('');
  if (!visible.length) $('#products').innerHTML = '<p class="empty">Keine passenden Produkte. Probiere einen anderen Suchbegriff.</p>';
}

function renderCart() {
  $('#cart-count').textContent = Object.values(cart).reduce((sum, n) => sum + n, 0);
  const selected = products.filter(p => cart[p.id]);
  $('#cart-items').innerHTML = selected.length ? selected.map(p => `<div class="cart-item"><div><h3>${escape(p.name)}</h3><small>${escape(p.pack)} · ${euro(p.price)} pro Packung</small><button class="remove" data-remove="${p.id}">Entfernen</button></div><div class="quantity"><button data-change="${p.id}" data-delta="-1" aria-label="Eine Packung ${escape(p.name)} weniger">−</button><span aria-label="Menge">${cart[p.id]}</span><button data-change="${p.id}" data-delta="1" aria-label="Eine Packung ${escape(p.name)} mehr" ${cart[p.id] >= 99 ? 'disabled' : ''}>+</button></div></div>`).join('') : '<p class="empty">Dein Warenkorb ist noch leer. Entdecke das Nomosan-Sortiment.</p>';
  $('#cart-total').textContent = euro(total(cart, products));
  $('#checkout').disabled = !selected.length;
}

function updateCart(id, quantity) {
  cart = setQuantity(cart, id, quantity, products);
  try { localStorage.setItem(storageKey, JSON.stringify(cart)); } catch { /* optional */ }
  $('#checkout-result').textContent = '';
  renderCart();
}

function addToCart(id) {
  if (!products.some(p => p.id === id)) return;
  if (cart[id] >= 99) return toast('Maximal 99 Packungen pro Demo-Position.');
  updateCart(id, (cart[id] || 0) + 1);
  toast('Im Demo-Warenkorb. Es wurde nichts bestellt.');
}

function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2600);
}

function showProduct(id) {
  const p = productLines.find(p => p.id === id);
  if (!p) return;
  $('#product-title').textContent = p.name;
  $('#product-image').src = p.image;
  $('#product-image').alt = `${p.name} – Herstellerabbildung`;
  $('#product-category').textContent = p.category;
  $('#product-description').textContent = p.description;
  $('#product-note').textContent = p.note;
  $('#product-source').href = p.source;
  $('#detail-variant').innerHTML = p.variants.map(v => `<option value="${v.id}">${escape(v.pack)} · ${euro(v.price)}</option>`).join('');
  $('#detail-variant').value = $(`[data-variant="${p.id}"]`).value;
  renderDetailPrice();
  $('#regulatory-details').innerHTML = regulatoryInformation(p);
  $('#product-dialog').showModal();
  $('#product-dialog').scrollTop = 0;
}

function renderDetailPrice() {
  const variant = products.find(p => p.id === $('#detail-variant').value);
  if (variant) $('#detail-pricing').innerHTML = priceInformation(variant);
}
$('#detail-variant').addEventListener('change', renderDetailPrice);
$('#products').addEventListener('change', event => {
  const select = event.target.closest('[data-variant]');
  if (!select) return;
  const variant = products.find(p => p.id === select.value);
  if (variant) $(`[data-price-for="${select.dataset.variant}"]`).innerHTML = priceInformation(variant);
});
$('#show-all-products').addEventListener('click', () => { catalogExpanded = !catalogExpanded; renderProducts(); });

$('#products').addEventListener('click', event => {
  const detail = event.target.closest('[data-detail]');
  if (detail) return showProduct(detail.dataset.detail);
  const button = event.target.closest('[data-add-line]');
  if (button) addToCart($(`[data-variant="${button.dataset.addLine}"]`).value);
});
$('#detail-add').addEventListener('click', () => { addToCart($('#detail-variant').value); $('#product-dialog').close(); });
$('#close-product').addEventListener('click', () => $('#product-dialog').close());

document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
  category = button.dataset.category;
  document.querySelectorAll('[data-category]').forEach(item => {
    item.classList.toggle('active', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  });
  renderProducts();
}));
$('#search').addEventListener('input', renderProducts);
$('#open-cart').addEventListener('click', () => $('#cart-dialog').showModal());
$('#close-cart').addEventListener('click', () => $('#cart-dialog').close());
$('#cart-items').addEventListener('click', event => {
  const remove = event.target.closest('[data-remove]');
  const change = event.target.closest('[data-change]');
  if (remove) updateCart(remove.dataset.remove, 0);
  if (change) updateCart(change.dataset.change, cart[change.dataset.change] + Number(change.dataset.delta));
});
$('#checkout').addEventListener('click', () => {
  if (!Object.keys(cart).length) return;
  const sum = euro(total(cart, products));
  cart = {};
  try { localStorage.removeItem(storageKey); } catch { /* optional */ }
  renderCart();
  $('#checkout-result').textContent = `Demo erfolgreich abgeschlossen (${sum} auf Basis von Herstellerpreisen). Es wurde nichts bestellt, reserviert oder bezahlt.`;
});
const info = {
  impressum: ['Impressum · Präsentationsentwurf', 'Dieser lokale Entwurf wird der Flores-Apotheke vorgestellt und ist kein offizieller Shop. Für eine Veröffentlichung sind die verbindlichen Betreiberangaben und Pflichttexte zu ergänzen.'],
  datenschutz: ['Datenschutz · Demo', 'Alle verwendeten Fotos liegen lokal. Die Standortkarte wird erst nach deinem Klick von OpenStreetMap geladen; dabei erhält der Anbieter unter anderem deine IP-Adresse. Es werden keine externen Schriftarten oder Analysewerkzeuge geladen. Der Demo-Warenkorb wird nur in diesem Browser gespeichert; es werden keine Bestellungen übertragen. Externe Links öffnen den jeweiligen Anbieter. Die Texte sind vor Veröffentlichung anzupassen.'],
  quellen: ['Quellen & Datenstand', 'Stand: 22.10.2026. Team, Fotos und die fünf Marken: flores-apotheke.de. 14 Nomosan-Produktlinien und 20 Packungsvarianten: öffentlicher Herstellerkatalog von nomosan-ug.com. Herstellerpreise sind keine bestätigten Flores-Verkaufspreise. Die tatsächliche Artikelliste und Bestände der Apotheke sind nicht öffentlich verfügbar. Nettofüllmengen stammen aus den Mengendaten der Herstellerseiten; Grundpreise werden je Kilogramm berechnet. NEM-Angaben sind noch nicht für einen echten Verkauf freigegeben. Zum Schnaps ist ein Originalfoto vorhanden; Name, Inhalt und Preis sind noch offen. Alle Beschreibungen sind redaktionell neu formuliert. Die Bildherkunft ist in docs/assets.json dokumentiert.'],
};
document.querySelectorAll('[data-info]').forEach(button => button.addEventListener('click', () => {
  const [title, text] = info[button.dataset.info];
  $('#info-title').textContent = title;
  $('#info-text').textContent = text;
  $('#info-dialog').showModal();
}));
$('#close-info').addEventListener('click', () => $('#info-dialog').close());
setupMap();
renderProducts();
renderCart();

// Nur den HTTPS-Link kopieren: Das gemeinsame Passwort gehört niemals in die URL.
const shareButton = document.querySelector('#share-preview');
shareButton.hidden = location.protocol !== 'https:';
shareButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(`${location.origin}${location.pathname}`);
    toast('Link kopiert. Du kannst ihn in WhatsApp einfügen und das Vorschaupasswort separat mitteilen.');
  } catch {
    toast('Bitte den Link aus der Adresszeile kopieren.');
  }
});
