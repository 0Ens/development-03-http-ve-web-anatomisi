const WEATHER_BASE = 'https://api.open-meteo.com/v1';
const GEO_BASE = 'https://geocoding-api.open-meteo.com/v1';

async function apiFetch(url) {
  const res = await fetch(url);
  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON body
  }
  return { status: res.status, ok: res.ok, data };
}

export function fetchGeocode(cityName) {
  const params = new URLSearchParams({
    name: cityName,
    count: '1',
    language: 'en',
    format: 'json',
  });
  return apiFetch(`${GEO_BASE}/search?${params}`);
}

export function fetchForecast(latitude, longitude, timezone = 'auto') {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
    timezone,
    forecast_days: '7',
  });
  return apiFetch(`${WEATHER_BASE}/forecast?${params}`);
}

export function fetchCurrent(latitude, longitude, timezone = 'auto') {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,wind_speed_10m,weather_code',
    timezone,
  });
  return apiFetch(`${WEATHER_BASE}/forecast?${params}`);
}

export function fetchArchive(latitude, longitude, startDate, endDate) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    start_date: startDate,
    end_date: endDate,
    daily: 'temperature_2m_max,precipitation_sum',
    timezone: 'auto',
  });
  return apiFetch(`${WEATHER_BASE}/archive?${params}`);
}
