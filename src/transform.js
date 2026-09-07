const ERROR_MESSAGES = {
  400: 'Geçersiz istek: parametre hatalı veya aralık dışı.',
  404: 'Kaynak bulunamadı.',
  429: 'İstek limiti aşıldı: biraz bekleyip tekrar deneyin.',
  500: 'Sunucu hatası: API şu an kullanılamıyor.',
  503: 'Servis kullanılamıyor: API bakımda olabilir.',
};

export function toErrorMessage(status, data = null) {
  if (data?.reason) return `Geçersiz istek: ${data.reason}`;
  return ERROR_MESSAGES[status] ?? `Beklenmeyen hata (HTTP ${status}).`;
}

export function findHottestDay(daily) {
  if (!daily?.time?.length) return null;
  const maxTemps = daily.temperature_2m_max;
  const times = daily.time;

  let hotIdx = -1;
  for (let i = 0; i < maxTemps.length; i++) {
    if (typeof maxTemps[i] === 'number' && !Number.isNaN(maxTemps[i])) {
      if (hotIdx === -1 || maxTemps[i] > maxTemps[hotIdx]) hotIdx = i;
    }
  }
  if (hotIdx === -1) return null;

  return { date: times[hotIdx], maxTemp: maxTemps[hotIdx] };
}

export function formatForecast(daily) {
  const { time, temperature_2m_max, temperature_2m_min, precipitation_sum } = daily;
  return time.map((date, i) => ({
    date,
    maxTemp: temperature_2m_max[i],
    minTemp: temperature_2m_min[i],
    precipitation: precipitation_sum[i],
  }));
}

export function formatTemp(celsius) {
  if (typeof celsius !== 'number' || Number.isNaN(celsius)) return '-';
  return `${celsius.toFixed(1)} °C`;
}
