# HTTP ve Web Anatomisi — Open-Meteo Hava Durumu API

Open-Meteo public API üzerinden HTTP sözleşmesi keşfi; 4 endpoint'in dokümantasyonu ve şehirlerin 7 günlük tahmininden en sıcak günü bulan Node.js scripti.

---

## 1. DevTools Gözlemleri

> **Nasıl doldurulur:** Tarayıcını aç → Network sekmesi → Fetch/XHR filtresi → herhangi bir siteyi gezin. Üç isteği seçip aşağıdaki tabloyu kendi gözlemlerinle doldur. "Yorum" sütununa "Bu istek bence şunu yapıyor" diye bir cümle ekle.

| # | Site | Metot | URL (kısaltılmış) | Status | Content-Type | Süre | Yorum |
|---|------|-------|-------------------|--------|--------------|------|-------|
| 1 | — | — | — | — | — | — | — |
| 2 | — | — | — | — | — | — | — |
| 3 | — | — | — | — | — | — | — |

---

## 2. API Sözleşmesi — Open-Meteo

Open-Meteo tamamen ücretsiz, anahtar gerektirmeyen açık kaynaklı bir hava durumu API'sidir.

| Alan | Değer |
|------|-------|
| Weather Base URL | `https://api.open-meteo.com/v1` |
| Geocoding Base URL | `https://geocoding-api.open-meteo.com/v1` |
| Auth | Yok |
| Rate limit | Belirtilmemiş (makul kullanım bekleniyor) |
| Format | JSON |

---

### Endpoint 1 — 7 Günlük Hava Tahmini (Daily)

```
GET /v1/forecast
```

| Parametre | Konum | Zorunlu | Açıklama |
|-----------|-------|---------|----------|
| `latitude` | query | evet | Enlem (−90 ile 90 arası) |
| `longitude` | query | evet | Boylam (−180 ile 180 arası) |
| `daily` | query | evet | İstenen günlük değişkenler, virgülle ayrılmış |
| `timezone` | query | önerilen | `auto` veya `Europe/Istanbul` gibi IANA bölgesi |
| `forecast_days` | query | hayır | 1–16, varsayılan 7 |

Sık kullanılan `daily` değerleri: `temperature_2m_max`, `temperature_2m_min`, `precipitation_sum`, `wind_speed_10m_max`

**Örnek istek**
```
GET https://api.open-meteo.com/v1/forecast?latitude=41.01&longitude=28.95&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe/Istanbul&forecast_days=7
```

**Kısaltılmış örnek cevap (HTTP 200)**
```json
{
  "latitude": 41.0,
  "longitude": 28.9375,
  "timezone": "Europe/Istanbul",
  "timezone_abbreviation": "GMT+3",
  "daily_units": {
    "time": "iso8601",
    "temperature_2m_max": "°C",
    "temperature_2m_min": "°C",
    "precipitation_sum": "mm"
  },
  "daily": {
    "time": ["2026-09-07", "2026-09-08", "2026-09-09"],
    "temperature_2m_max": [27.0, 25.7, 26.4],
    "temperature_2m_min": [20.9, 19.8, 20.1],
    "precipitation_sum": [0.0, 0.0, 0.0]
  }
}
```

**Gözlemlenen status code'lar:** `200 OK`, `400 Bad Request` (geçersiz parametre)

---

### Endpoint 2 — Anlık Hava Durumu (Current)

```
GET /v1/forecast
```

`daily` yerine `current` parametresi kullanılarak anlık veri istenir.

| Parametre | Konum | Zorunlu | Açıklama |
|-----------|-------|---------|----------|
| `latitude` | query | evet | Enlem |
| `longitude` | query | evet | Boylam |
| `current` | query | evet | Virgülle ayrılmış anlık değişkenler |
| `timezone` | query | önerilen | IANA zaman dilimi |

**Örnek istek**
```
GET https://api.open-meteo.com/v1/forecast?latitude=41.01&longitude=28.95&current=temperature_2m,wind_speed_10m,weather_code&timezone=Europe/Istanbul
```

**Kısaltılmış örnek cevap (HTTP 200)**
```json
{
  "latitude": 41.0,
  "longitude": 28.9375,
  "current_units": {
    "temperature_2m": "°C",
    "wind_speed_10m": "km/h",
    "weather_code": "wmo code"
  },
  "current": {
    "time": "2026-09-07T15:00",
    "temperature_2m": 26.4,
    "wind_speed_10m": 14.2,
    "weather_code": 0
  }
}
```

**Gözlemlenen status code'lar:** `200 OK`

---

### Endpoint 3 — Tarihsel Hava Verisi (Archive)

```
GET /v1/archive
```

ERA5 reanaliz veritabanından geçmiş tarihlere ait günlük verilere erişim sağlar. Başlangıç tarihi 1940-01-01'e kadar gidebilir; bitiş tarihi en fazla dün olabilir.

| Parametre | Konum | Zorunlu | Açıklama |
|-----------|-------|---------|----------|
| `latitude` | query | evet | Enlem |
| `longitude` | query | evet | Boylam |
| `start_date` | query | evet | ISO 8601 (YYYY-MM-DD) |
| `end_date` | query | evet | ISO 8601 (YYYY-MM-DD) |
| `daily` | query | evet | İstenen günlük değişkenler |
| `timezone` | query | önerilen | IANA zaman dilimi |

**Örnek istek**
```
GET https://api.open-meteo.com/v1/archive?latitude=41.01&longitude=28.95&start_date=2026-07-01&end_date=2026-07-31&daily=temperature_2m_max,precipitation_sum&timezone=Europe/Istanbul
```

**Kısaltılmış örnek cevap (HTTP 200)**
```json
{
  "latitude": 41.0,
  "daily": {
    "time": ["2026-07-01", "2026-07-02", "..."],
    "temperature_2m_max": [34.2, 36.1, "..."],
    "precipitation_sum": [0.0, 0.0, "..."]
  }
}
```

**Gözlemlenen status code'lar:** `200 OK`, `400 Bad Request` (geçersiz tarih aralığı)

---

### Endpoint 4 — Şehir Arama / Geocoding

```
GET https://geocoding-api.open-meteo.com/v1/search
```

Şehir adından enlem/boylam koordinatları ve zaman dilimi bilgisi döner. Script bu endpoint'i CLI argümanını koordinata çevirmek için kullanır.

| Parametre | Konum | Zorunlu | Açıklama |
|-----------|-------|---------|----------|
| `name` | query | evet | Şehir adı (kısmi eşleşmeyi kabul eder) |
| `count` | query | hayır | Sonuç adedi, varsayılan 10 |
| `language` | query | hayır | Sonuç dili (`en`, `tr`, ...) |
| `format` | query | hayır | `json` (varsayılan) |

**Örnek istek**
```
GET https://geocoding-api.open-meteo.com/v1/search?name=Istanbul&count=1&language=en&format=json
```

**Kısaltılmış örnek cevap (HTTP 200)**
```json
{
  "results": [
    {
      "id": 745044,
      "name": "Istanbul",
      "latitude": 41.01384,
      "longitude": 28.94966,
      "timezone": "Europe/Istanbul",
      "population": 15701602,
      "country": "Republic of Türkiye",
      "country_code": "TR",
      "admin1": "Istanbul"
    }
  ],
  "generationtime_ms": 0.34
}
```

Şehir bulunamazsa `results` alanı ya boş dizi döner ya da alan hiç gelmez — `404` değil, `200` ile boş sonuç.

**Gözlemlenen status code'lar:** `200 OK`

---

### Hata senaryoları

**400 — Geçersiz koordinat**
```
GET https://api.open-meteo.com/v1/forecast?latitude=999&longitude=999&daily=temperature_2m_max&timezone=auto
```
```json
{ "reason": "Latitude must be in range of -90 to 90°. Given: 999.0.", "error": true }
```

**400 — Bilinmeyen daily değişkeni**
```
GET https://api.open-meteo.com/v1/forecast?latitude=41&longitude=29&daily=bozuk_parametre&timezone=auto
```
```json
{ "reason": "Cannot initialize WeatherVariable from invalid String value bozuk_parametre for key daily_0", "error": true }
```

> Gözlem: Open-Meteo hata cevabında `reason` alanıyla insan okunur bir açıklama veriyor — sözleşmenin değerli bir parçası.

---

## 3. Kurulum

Node.js v22 veya üstü gereklidir. Harici bağımlılık yoktur.

```bash
git clone https://github.com/0Ens/development-03-http-ve-web-anatomisi.git
cd development-03-http-ve-web-anatomisi
```

---

## 4. Kullanım

```bash
# Varsayılan şehir: İstanbul
node src/index.js

# Farklı bir şehir (CLI argümanı — bonus özellik)
node src/index.js Tokyo
node src/index.js "New York"
node src/index.js Berlin
```

**Örnek çıktı:**
```
"Istanbul" için 7 günlük hava tahmini alınıyor...

Istanbul, Republic of Türkiye  (41.01, 28.95)

Tarih        Max Sıcaklık  Min Sıcaklık  Yağış
----------------------------------------------
2026-09-07       27.0 °C       20.9 °C    0.0 mm
2026-09-08       25.7 °C       19.8 °C    0.0 mm
...

En sıcak gün: 2026-09-12 — 28.1 °C
```

**200 dışı cevap — hata davranışı (stack trace yok):**
```bash
node src/index.js "bilinmeyensehir999"
# Hata: "bilinmeyensehir999" şehri bulunamadı.
# exit kodu: 1
```

---

## 5. Test

```bash
npm test
# veya
node --test tests/transform.test.js
```

Testler ağa çıkmaz; `tests/fixtures/istanbul-forecast.json` dosyasındaki gerçek API cevabı kullanılır.

**Test senaryoları:**

| # | Fonksiyon | Senaryo |
|---|-----------|---------|
| 1 | `findHottestDay` | Gerçek fixture verisiyle en sıcak günü doğru bulur |
| 2 | `findHottestDay` | Boş `daily` verisiyle `null` döner |
| 3 | `findHottestDay` | Tüm sıcaklıklar `null` ise `null` döner (eksik alan) |
| 4 | `toErrorMessage` | 400 cevabında API'nin `reason` alanını mesaja yansıtır |
| 5 | `toErrorMessage` | Tanımsız status için HTTP kodunu içeren genel mesaj döner |

---

## 6. Proje Yapısı

```
.
├── src/
│   ├── fetch.js              # API çağrıları (her endpoint ayrı fonksiyon)
│   ├── transform.js          # Saf dönüşüm fonksiyonları + toErrorMessage yardımcısı
│   └── index.js              # Giriş noktası — CLI argümanı, fetch, çıktı
├── tests/
│   ├── fixtures/
│   │   └── istanbul-forecast.json  # Gerçek API cevabından kaydedilmiş örnek
│   └── transform.test.js           # Ağdan bağımsız unit testler
├── package.json
└── README.md
```

---

## 7. Ne Öğrendim

- **HTTP sözleşmesini tüketici gözüyle okumak:** Postman'de endpoint'leri keşfederken "bu parametre ne işe yarıyor, yoksa ne olur?" diye sormak, sadece `200` gören koddan çok daha sağlam bir anlayış veriyor.
- **404 yoksa 200 + boş sonuç:** Open-Meteo'nun geocoding API'si bilinmeyen şehir için `404` değil, `200` ve boş `results` dizisi döndürüyor. Yani status code tek başına yeterli değil; body'yi de kontrol etmek gerekiyor.
- **400 body de sözleşmenin parçası:** `{"reason": "Latitude must be in range...", "error": true}` yapısını bilmeden anlamlı hata mesajı üretmek mümkün değil. Hata cevapları da dokümante edilmesi gereken sözleşme.
- **Fetch ve dönüşümü ayırmanın test faydası:** `transform.js` ağa bağımlı değil, saf fonksiyonlar içeriyor. Bu sayede testler internet olmadan, her zaman yeşil çalışıyor. Eğer ikisi birbirine karışsaydı ya ağa bağımlı testler ya da karmaşık mock altyapısı gerekirdi.
- **`process.exit(1)` ile temiz çıkış:** Stack trace atmak yerine okunur hata mesajı basıp çıkmak, scripti gerçek bir araç gibi hissettiriyor; CI'da da doğru çıkış kodu üretiyor.
