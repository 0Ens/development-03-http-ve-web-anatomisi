import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  findHottestDay,
  formatForecast,
  formatTemp,
  toErrorMessage,
} from '../src/transform.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = JSON.parse(
  readFileSync(path.join(__dirname, 'fixtures', 'istanbul-forecast.json'), 'utf8')
);

// --- findHottestDay ---

describe('findHottestDay', () => {
  it('fixture verisinden en sıcak günü doğru bulur', () => {
    const result = findHottestDay(fixture.daily);
    assert.ok(result !== null, 'Sonuç null olmamalı');
    assert.equal(typeof result.date, 'string', 'date string olmalı');
    assert.equal(typeof result.maxTemp, 'number', 'maxTemp number olmalı');
    const allTemps = fixture.daily.temperature_2m_max.filter(t => typeof t === 'number');
    assert.equal(result.maxTemp, Math.max(...allTemps), 'En yüksek sıcaklık değeri olmalı');
  });

  it('boş daily verisiyle null döner', () => {
    const result = findHottestDay({
      time: [],
      temperature_2m_max: [],
      temperature_2m_min: [],
      precipitation_sum: [],
    });
    assert.equal(result, null);
  });

  it('tüm sıcaklıklar null ise null döner (eksik alan senaryosu)', () => {
    const result = findHottestDay({
      time: ['2026-09-07', '2026-09-08'],
      temperature_2m_max: [null, null],
      temperature_2m_min: [null, null],
      precipitation_sum: [0, 0],
    });
    assert.equal(result, null);
  });
});

// --- formatForecast ---

describe('formatForecast', () => {
  it('daily verisini gun bazli nesne dizisine donusturur', () => {
    const result = formatForecast(fixture.daily);
    assert.equal(result.length, fixture.daily.time.length);
    assert.equal(result[0].date, fixture.daily.time[0]);
    assert.equal(result[0].maxTemp, fixture.daily.temperature_2m_max[0]);
    assert.equal(typeof result[0].precipitation, 'number');
  });
});

// --- formatTemp ---

describe('formatTemp', () => {
  it('sayiyi bir ondalikli ve birimli string olarak dondurur', () => {
    assert.equal(formatTemp(27), '27.0 °C');
    assert.equal(formatTemp(3.567), '3.6 °C');
  });

  it('null ve NaN icin tire dondurur', () => {
    assert.equal(formatTemp(null), '-');
    assert.equal(formatTemp(NaN), '-');
  });
});

// --- toErrorMessage ---

describe('toErrorMessage', () => {
  it("400 için API'nin reason alanını hata mesajına yansıtır", () => {
    const msg = toErrorMessage(400, {
      reason: 'Latitude must be in range of -90 to 90°. Given: 999.0.',
      error: true,
    });
    assert.ok(msg.includes('Latitude'), 'API reason mesajı yansıtılmalı');
  });

  it('tanımsız status kodu için HTTP kodunu içeren genel mesaj döner', () => {
    const msg = toErrorMessage(418);
    assert.ok(msg.includes('418'), 'Bilinmeyen HTTP kodu mesajda görünmeli');
  });
});
