import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  convertTemperature,
  formatTemperature,
  normalizeCoordinates,
  validateWeatherPayload,
  wmoToDescriptor
} = require('../weather-utils.js');

function run() {
  assert.equal(Math.round(convertTemperature(0, 'fahrenheit')), 32, '0C should equal 32F');
  assert.equal(Math.round(convertTemperature(30, 'fahrenheit')), 86, '30C should equal 86F');
  assert.equal(formatTemperature(20, 'celsius'), '20°C');
  assert.equal(formatTemperature(20, 'fahrenheit'), '68°F');
  assert.deepEqual(normalizeCoordinates(24.7136123, 46.6752978), { lat: 24.71, lon: 46.68 });
  assert.equal(normalizeCoordinates(120, 46.6), null);

  const en = wmoToDescriptor(0, 'en');
  const ar = wmoToDescriptor(95, 'ar');
  assert.equal(en.text, 'Clear sky');
  assert.equal(ar.text, 'عاصفة رعدية');

  const validPayload = {
    current: { time: '2026-09-24T00:00', weather_code: 0 },
    hourly: { time: ['2026-09-24T00:00'], temperature_2m: [30], weather_code: [0] },
    daily: { time: ['2026-09-24'], temperature_2m_max: [35], temperature_2m_min: [23], weather_code: [0] }
  };

  const invalidPayload = { current: {}, hourly: { time: [] }, daily: {} };

  assert.equal(validateWeatherPayload(validPayload), true);
  assert.equal(validateWeatherPayload(invalidPayload), false);

  console.log('✅ Weather dashboard verification passed.');
}

run();
