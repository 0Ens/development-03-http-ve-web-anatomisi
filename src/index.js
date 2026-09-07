import { fetchGeocode, fetchForecast } from './fetch.js';
import { toErrorMessage, findHottestDay, formatForecast, formatTemp } from './transform.js';

const cityArg = process.argv[2] ?? 'Istanbul';

console.log(`"${cityArg}" için 7 günlük hava tahmini alınıyor...\n`);

let geoRes, forecastRes;
try {
  geoRes = await fetchGeocode(cityArg);
} catch {
  console.error('Ağ hatası: geocoding servisine ulaşılamadı.');
  process.exit(1);
}

if (geoRes.status !== 200 || !geoRes.data?.results?.length) {
  console.error(`Hata: "${cityArg}" şehri bulunamadı.`);
  process.exit(1);
}
const { latitude, longitude, timezone, name, country } = geoRes.data.results[0];

try {
  forecastRes = await fetchForecast(latitude, longitude, timezone);
} catch {
  console.error('Ağ hatası: hava durumu servisine ulaşılamadı.');
  process.exit(1);
}

if (forecastRes.status !== 200) {
  console.error(`Hata: ${toErrorMessage(forecastRes.status, forecastRes.data)}`);
  process.exit(1);
}

const { daily } = forecastRes.data;
const days = formatForecast(daily);
const hottest = findHottestDay(daily);

console.log(`${name}, ${country}  (${latitude.toFixed(2)}, ${longitude.toFixed(2)})\n`);

const header = 'Tarih        Max Sıcaklık  Min Sıcaklık  Yağış';
console.log(header);
console.log('-'.repeat(header.length));

for (const d of days) {
  const date = d.date.padEnd(13);
  const max = formatTemp(d.maxTemp).padStart(11);
  const min = formatTemp(d.minTemp).padStart(12);
  const prec = `${(d.precipitation ?? 0).toFixed(1)} mm`.padStart(8);
  console.log(`${date}${max}  ${min}  ${prec}`);
}

if (hottest) {
  console.log(`\nEn sıcak gün: ${hottest.date} — ${formatTemp(hottest.maxTemp)}`);
}
