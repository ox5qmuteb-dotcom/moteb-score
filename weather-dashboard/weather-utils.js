(function factory(root) {
  const WMO_MAP = {
    0: { icon: '☀️', en: 'Clear sky', ar: 'سماء صافية' },
    1: { icon: '🌤️', en: 'Mainly clear', ar: 'صحو غالبًا' },
    2: { icon: '⛅', en: 'Partly cloudy', ar: 'غائم جزئيًا' },
    3: { icon: '☁️', en: 'Overcast', ar: 'غائم كليًا' },
    45: { icon: '🌫️', en: 'Fog', ar: 'ضباب' },
    48: { icon: '🌫️', en: 'Rime fog', ar: 'ضباب جليدي' },
    51: { icon: '🌦️', en: 'Light drizzle', ar: 'رذاذ خفيف' },
    53: { icon: '🌦️', en: 'Moderate drizzle', ar: 'رذاذ متوسط' },
    55: { icon: '🌧️', en: 'Dense drizzle', ar: 'رذاذ كثيف' },
    61: { icon: '🌧️', en: 'Slight rain', ar: 'مطر خفيف' },
    63: { icon: '🌧️', en: 'Moderate rain', ar: 'مطر متوسط' },
    65: { icon: '🌧️', en: 'Heavy rain', ar: 'مطر غزير' },
    71: { icon: '🌨️', en: 'Slight snow', ar: 'ثلوج خفيفة' },
    73: { icon: '🌨️', en: 'Moderate snow', ar: 'ثلوج متوسطة' },
    75: { icon: '❄️', en: 'Heavy snow', ar: 'ثلوج كثيفة' },
    80: { icon: '🌦️', en: 'Rain showers', ar: 'زخات مطر' },
    81: { icon: '🌧️', en: 'Moderate showers', ar: 'زخات متوسطة' },
    82: { icon: '⛈️', en: 'Violent showers', ar: 'زخات عنيفة' },
    85: { icon: '🌨️', en: 'Snow showers', ar: 'زخات ثلج' },
    95: { icon: '⛈️', en: 'Thunderstorm', ar: 'عاصفة رعدية' }
  };

  function normalizeQuery(input) {
    if (typeof input !== 'string') {
      return '';
    }
    return input.trim().replace(/\s+/g, ' ');
  }

  function isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  function roundCoordinate(value, precision) {
    const digits = Number.isInteger(precision) ? Math.max(0, precision) : 2;
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  function normalizeCoordinates(lat, lon, precision) {
    if (!isFiniteNumber(lat) || !isFiniteNumber(lon)) {
      return null;
    }
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return null;
    }
    return {
      lat: roundCoordinate(lat, precision),
      lon: roundCoordinate(lon, precision)
    };
  }

  function toFahrenheit(celsius) {
    return (celsius * 9) / 5 + 32;
  }

  function convertTemperature(value, unit) {
    const targetUnit = unit || 'celsius';
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return null;
    }
    return targetUnit === 'fahrenheit' ? toFahrenheit(value) : value;
  }

  function formatTemperature(value, unit) {
    const targetUnit = unit || 'celsius';
    const converted = convertTemperature(value, targetUnit);
    if (converted === null) {
      return '--';
    }
    const symbol = targetUnit === 'fahrenheit' ? '°F' : '°C';
    return `${Math.round(converted)}${symbol}`;
  }

  function wmoToDescriptor(code, lang) {
    const language = lang || 'en';
    const fallback = language === 'ar'
      ? { icon: '❓', text: 'غير معروف' }
      : { icon: '❓', text: 'Unknown' };
    const record = WMO_MAP[code];
    if (!record) {
      return fallback;
    }
    return { icon: record.icon, text: language === 'ar' ? record.ar : record.en };
  }

  function validateWeatherPayload(payload) {
    const hasCurrent = payload && typeof payload === 'object' && payload.current;
    const hasHourly = payload && payload.hourly && Array.isArray(payload.hourly.time) && Array.isArray(payload.hourly.temperature_2m) && Array.isArray(payload.hourly.weather_code);
    const hasDaily = payload && payload.daily && Array.isArray(payload.daily.time) && Array.isArray(payload.daily.temperature_2m_max) && Array.isArray(payload.daily.temperature_2m_min) && Array.isArray(payload.daily.weather_code);
    return Boolean(hasCurrent && hasHourly && hasDaily);
  }

  function uvRiskLevel(value, lang) {
    const language = lang || 'en';
    if (typeof value !== 'number') {
      return language === 'ar' ? 'غير محدد' : 'Not available';
    }
    if (value < 3) return language === 'ar' ? 'منخفض' : 'Low';
    if (value < 6) return language === 'ar' ? 'متوسط' : 'Moderate';
    if (value < 8) return language === 'ar' ? 'مرتفع' : 'High';
    return language === 'ar' ? 'شديد' : 'Very high';
  }

  const api = {
    WMO_MAP,
    normalizeQuery,
    normalizeCoordinates,
    toFahrenheit,
    convertTemperature,
    formatTemperature,
    wmoToDescriptor,
    validateWeatherPayload,
    uvRiskLevel
  };

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.WeatherUtils = api;
}(typeof globalThis !== 'undefined' ? globalThis : this));
