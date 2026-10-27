import { formatPrice, formatNetWeight, basePriceLabel } from './pricing.js';

export const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function priceInformation(variant) {
  return `<strong class="selling-price">${formatPrice(variant.price)}</strong>
    <span>${escapeHtml(variant.pack)} · Nettofüllmenge ${formatNetWeight(variant.netQuantityMg)}</span>
    <span class="base-price">${basePriceLabel(variant)}</span>`;
}

export function regulatoryInformation(line) {
  const r = line.regulatory;
  const text = escapeHtml;
  const ingredients = r.ingredients
    ? text(r.ingredients).replace(/\b(Fischöl|Fisch|Lachsöl|Sojaöl|Sojalecithin|Soja)\b/gi, '<strong>$1</strong>')
    : 'Eine vollständige aktuelle Zutatenliste liegt im Entwurf noch nicht vor. Bitte die Originalinformation öffnen oder die Apotheke fragen.';
  const rows = r.nutrients.map(([name, amount, nrv]) => `<tr><th scope="row">${text(name)}</th><td>${text(amount)}</td><td>${text(nrv)}</td></tr>`).join('');
  return `<h3>Gut zu wissen, bevor du auswählst.</h3>
    <p><strong>Bezeichnung:</strong> ${text(r.foodName)}. ${text(line.description)}</p>
    <details open><summary>Zutaten & Allergene</summary><p>${ingredients}</p>
      <p><strong>Identifizierte Allergene:</strong> ${r.allergens.length ? r.allergens.map(text).join(', ') : 'Noch nicht abschließend geklärt.'}</p>
      <p class="muted">${text(r.allergenStatus)}</p></details>
    <details><summary>Verzehrempfehlung</summary><p>${text(r.dailyDose || 'Die aktuelle Verzehrempfehlung muss noch anhand der Packung bestätigt werden.')}</p></details>
    <details><summary>Nährstoffe & Tagesportion</summary>${rows ? `<div class="nutrition-scroll"><table><caption>Mengen pro Tagesportion (${text(r.portion)})</caption><thead><tr><th scope="col">Nährstoff / Stoff</th><th scope="col">Menge</th><th scope="col">% NRV</th></tr></thead><tbody>${rows}</tbody></table></div><p class="muted">NRV: Referenzmengen für die tägliche Zufuhr nach EU-Verordnung 1169/2011. „—“ bedeutet: kein Referenzwert festgelegt. Keine Wirksamkeitsaussage.</p>` : '<p>Die vollständige, eindeutig zugeordnete Tabelle pro Tagesportion ist noch zu bestätigen. Keine ungesicherten Mengenangaben im Entwurf.</p>'}</details>
    <details open><summary>Wichtige Hinweise & Aufbewahrung</summary><ul class="nem-warnings">
      <li>Die angegebene empfohlene tägliche Verzehrsmenge darf nicht überschritten werden.</li>
      <li>Nahrungsergänzungsmittel sollten nicht als Ersatz für eine ausgewogene und abwechslungsreiche Ernährung und eine gesunde Lebensweise verwendet werden.</li>
      <li>Außerhalb der Reichweite von kleinen Kindern aufbewahren.</li>
      <li>${text(r.storage || 'Die produktspezifischen Lagerbedingungen sind noch abzugleichen.')}</li>
    </ul><p>Bei Erkrankungen oder gleichzeitiger Medikamenteneinnahme die Verwendung mit der behandelnden Praxis oder der Apotheke besprechen.</p></details>
    <details><summary>Anbieter & Originalunterlagen</summary><p>${text(r.operator)}</p>
      <p><a href="${text(r.operatorSource)}" target="_blank" rel="noopener noreferrer">Aktuelle Anbieterangaben <svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a></p>
      ${r.leaflet ? `<p><a href="${text(r.leaflet)}" target="_blank" rel="noopener noreferrer">Hersteller-Beipackzettel öffnen (PDF) <svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a></p>` : ''}
      <p><a href="${text(line.source)}" target="_blank" rel="noopener noreferrer">Produktseite des Herstellers <svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a></p></details>
    <details class="data-review"><summary>Datenstand & noch offene Angaben</summary>
      <p>Herstellerquellen, abgerufen am ${text(r.dataDate)}. Die Aktualität zur tatsächlich abgegebenen Packung ist noch nicht freigegeben. Nur Demo, kein kaufbarer Artikel.</p>
      ${r.review ? `<p>${text(r.review)}</p>` : ''}
      <p><strong>Noch offen:</strong> ${r.missing.map(text).join('; ')}.</p></details>`;
}
