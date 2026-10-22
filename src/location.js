// Koordinaten der öffentlichen Apotheke, anhand OpenStreetMap/Nominatim geprüft.
export const pharmacyLocation = { latitude: 53.1129363, longitude: 8.4565250 };

export function setupMap() {
  const button = document.querySelector('#load-map');
  button.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.title = 'OpenStreetMap: Flores-Apotheke, Parkstraße 47, Hude';
    iframe.src = 'https://www.openstreetmap.org/export/embed.html?bbox=8.4505%2C53.1099%2C8.4625%2C53.1159&layer=mapnik&marker=53.1129363%2C8.4565250';
    iframe.referrerPolicy = 'no-referrer';
    iframe.className = 'location-map';
    const panel = document.querySelector('#map-panel');
    panel.replaceChildren(iframe);
    // Fokus bleibt nach Ersetzen des Ladebuttons an einer sinnvollen Stelle.
    iframe.focus();
  });
}
