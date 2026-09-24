const {
  formatTemperature,
  normalizeQuery,
  uvRiskLevel,
  validateWeatherPayload,
  wmoToDescriptor
} = window.WeatherUtils;

const API = {
  geocode: 'https://geocoding-api.open-meteo.com/v1/search',
  forecast: 'https://api.open-meteo.com/v1/forecast'
};

const i18n = {
  ar: {
    dir: 'rtl',
    searchEmpty: 'يرجى إدخال اسم مدينة صالح.',
    searching: 'جارٍ البحث عن المدينة...',
    noCity: 'لم يتم العثور على مدينة. جرّب اسمًا آخر.',
    loadingWeather: 'جارٍ تحميل بيانات الطقس...',
    cityLoaded: 'تم تحديث بيانات الطقس بنجاح.',
    networkError: 'تعذّر الاتصال بالخدمة. تحقق من الشبكة ثم حاول مرة أخرى.',
    geoUnsupported: 'متصفحك لا يدعم تحديد الموقع الجغرافي.',
    geoDenied: 'تم رفض الوصول إلى الموقع.',
    geoLoading: 'جارٍ تحديد موقعك...',
    invalidData: 'بيانات الطقس المستلمة غير مكتملة.',
    myLocation: 'موقعي الحالي',
    today: 'اليوم',
    labels: {
      feelsLike: 'المحسوسة',
      humidity: 'الرطوبة',
      wind: 'الرياح',
      precip: 'الهطول',
      pressure: 'الضغط',
      uv: 'مؤشر UV'
    },
    riskTitle: 'بطاقات المخاطر المستقبلية (Prototype / تقديري)',
    riskIntro: 'هذه البطاقات إرشادية مبدئية مبنية على بيانات الطقس الحالية فقط، وليست تنبؤًا علميًا مؤكدًا.',
    riskCards: {
      heat: 'إجهاد حراري',
      rain: 'تعطل تنقّل محتمل',
      uv: 'تعرض للأشعة فوق البنفسجية'
    },
    levels: { low: 'منخفض', medium: 'متوسط', high: 'مرتفع' },
    prototype: 'Prototype / تقديري'
  },
  en: {
    dir: 'ltr',
    searchEmpty: 'Please enter a valid city name.',
    searching: 'Searching for city...',
    noCity: 'City not found. Try another name.',
    loadingWeather: 'Loading weather data...',
    cityLoaded: 'Weather updated successfully.',
    networkError: 'Unable to reach weather services. Check your connection and retry.',
    geoUnsupported: 'Your browser does not support geolocation.',
    geoDenied: 'Location access was denied.',
    geoLoading: 'Detecting your location...',
    invalidData: 'Received incomplete weather payload.',
    myLocation: 'My location',
    today: 'Today',
    labels: {
      feelsLike: 'Feels like',
      humidity: 'Humidity',
      wind: 'Wind',
      precip: 'Precipitation',
      pressure: 'Pressure',
      uv: 'UV Index'
    },
    riskTitle: 'Future risk cards (Prototype / Estimation)',
    riskIntro: 'These cards are directional prototype insights based on current weather only, not scientific forecasting.',
    riskCards: {
      heat: 'Heat stress',
      rain: 'Mobility disruption risk',
      uv: 'UV exposure risk'
    },
    levels: { low: 'Low', medium: 'Medium', high: 'High' },
    prototype: 'Prototype / Estimation'
  }
};

const els = {
  cityInput: document.getElementById('cityInput'),
  searchForm: document.getElementById('searchForm'),
  searchBtn: document.getElementById('searchBtn'),
  locateBtn: document.getElementById('locateBtn'),
  refreshBtn: document.getElementById('refreshBtn'),
  unitBtn: document.getElementById('unitBtn'),
  langToggle: document.getElementById('langToggle'),
  suggestions: document.getElementById('suggestions'),
  status: document.getElementById('status'),
  dashboard: document.getElementById('dashboard'),
  locationLabel: document.getElementById('locationLabel'),
  currentTime: document.getElementById('currentTime'),
  currentTemp: document.getElementById('currentTemp'),
  currentText: document.getElementById('currentText'),
  feelsLike: document.getElementById('feelsLike'),
  humidity: document.getElementById('humidity'),
  wind: document.getElementById('wind'),
  precip: document.getElementById('precip'),
  pressure: document.getElementById('pressure'),
  uv: document.getElementById('uv'),
  hourlyRow: document.getElementById('hourlyRow'),
  dailyRow: document.getElementById('dailyRow'),
  riskCards: document.getElementById('riskCards'),
  appTitle: document.getElementById('appTitle'),
  appSubtitle: document.getElementById('appSubtitle'),
  prototypeTitle: document.getElementById('prototypeTitle'),
  prototypeIntro: document.getElementById('prototypeIntro'),
  lblFeelsLike: document.getElementById('lblFeelsLike'),
  lblHumidity: document.getElementById('lblHumidity'),
  lblWind: document.getElementById('lblWind'),
  lblPrecip: document.getElementById('lblPrecip'),
  lblPressure: document.getElementById('lblPressure'),
  lblUv: document.getElementById('lblUv'),
  footerText: document.getElementById('footerText')
};

const state = {
  lang: 'ar',
  unit: 'celsius',
  latestWeather: null,
  latestLocationLabel: '',
  latestCoords: null,
  suggestionTimer: null,
  lastSuggestionQuery: '',
  requestKey: ''
};

function t() {
  return i18n[state.lang];
}

function setStatus(message, type = 'info') {
  els.status.textContent = message;
  els.status.dataset.type = type;
}

function setLoading(loading) {
  [els.searchBtn, els.locateBtn, els.refreshBtn].forEach((btn) => {
    btn.disabled = loading;
  });
}

function createEl(tag, text, className) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (typeof text === 'string') el.textContent = text;
  return el;
}

function sanitizeCityQuery(raw) {
  const normalized = normalizeQuery(raw);
  if (!normalized) return '';
  if (!/^[\p{L}\p{M}\s\-']+$/u.test(normalized)) {
    return '';
  }
  return normalized;
}

async function geocodeCity(cityName) {
  const params = new URLSearchParams({
    name: cityName,
    count: '6',
    language: state.lang,
    format: 'json'
  });
  const response = await fetch(`${API.geocode}?${params.toString()}`);
  if (!response.ok) {
    throw new Error('geocode_failed');
  }
  const data = await response.json();
  return Array.isArray(data.results) ? data.results : [];
}

async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,surface_pressure,weather_code,wind_speed_10m',
    hourly: 'temperature_2m,weather_code,precipitation_probability',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum',
    timezone: 'auto',
    forecast_days: '7'
  });

  const response = await fetch(`${API.forecast}?${params.toString()}`);
  if (!response.ok) {
    throw new Error('forecast_failed');
  }
  const payload = await response.json();
  if (!validateWeatherPayload(payload)) {
    throw new Error('invalid_payload');
  }
  return payload;
}

function formatDateTime(value) {
  return new Date(value).toLocaleString(state.lang === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short'
  });
}

function getRiskLevel(score) {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function riskScore(current, daily) {
  const temp = typeof current.apparent_temperature === 'number' ? current.apparent_temperature : 0;
  const precip = typeof daily.precipitation_sum?.[0] === 'number' ? daily.precipitation_sum[0] : 0;
  const uv = typeof daily.uv_index_max?.[0] === 'number' ? daily.uv_index_max[0] : 0;

  const heat = Math.min(100, Math.max(0, (temp - 20) * 4 + uv * 4));
  const rain = Math.min(100, Math.max(0, precip * 12));
  const uvRisk = Math.min(100, Math.max(0, uv * 10));

  return { heat, rain, uvRisk };
}

function updateRiskCards(data) {
  const labels = t();
  const scores = riskScore(data.current, data.daily);
  const items = [
    { key: 'heat', value: scores.heat, explainer: `${Math.round(data.current.apparent_temperature)}°C` },
    { key: 'rain', value: scores.rain, explainer: `${data.daily.precipitation_sum?.[0] ?? 0} mm` },
    { key: 'uv', value: scores.uvRisk, explainer: `${data.daily.uv_index_max?.[0] ?? '--'} UV` }
  ];

  els.riskCards.replaceChildren();
  items.forEach((item) => {
    const level = getRiskLevel(item.value);
    const card = createEl('article', '', 'prototype-card');
    const badge = createEl('span', labels.prototype, `badge risk-${level}`);
    const title = createEl('h3', labels.riskCards[item.key]);
    const meter = createEl('p', `${Math.round(item.value)}% - ${labels.levels[level]}`);
    const note = createEl('p', item.explainer);
    card.append(badge, title, meter, note);
    els.riskCards.append(card);
  });
}

function updateHourly(data) {
  els.hourlyRow.replaceChildren();
  const currentTime = new Date(data.current.time).getTime();
  let startIndex = data.hourly.time.findIndex((v) => new Date(v).getTime() >= currentTime);
  if (startIndex < 0) startIndex = 0;

  for (let i = startIndex; i < Math.min(startIndex + 12, data.hourly.time.length); i += 1) {
    const code = data.hourly.weather_code[i];
    const weather = wmoToDescriptor(code, state.lang);
    const temp = data.hourly.temperature_2m[i];
    const tile = createEl('div', '', 'tile');
    const time = createEl('p', new Date(data.hourly.time[i]).toLocaleTimeString(state.lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }));
    const icon = createEl('p', `${weather.icon} ${weather.text}`);
    const value = createEl('p', formatTemperature(temp, state.unit));
    tile.append(time, icon, value);
    els.hourlyRow.append(tile);
  }
}

function updateDaily(data) {
  els.dailyRow.replaceChildren();
  for (let i = 0; i < Math.min(7, data.daily.time.length); i += 1) {
    const tile = createEl('div', '', 'tile');
    const dayLabel = i === 0
      ? t().today
      : new Date(data.daily.time[i]).toLocaleDateString(state.lang === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short' });
    const weather = wmoToDescriptor(data.daily.weather_code[i], state.lang);
    tile.append(
      createEl('p', dayLabel),
      createEl('p', `${weather.icon} ${weather.text}`),
      createEl('p', `${formatTemperature(data.daily.temperature_2m_max[i], state.unit)} / ${formatTemperature(data.daily.temperature_2m_min[i], state.unit)}`)
    );
    els.dailyRow.append(tile);
  }
}

function renderWeather(data, label) {
  const weather = wmoToDescriptor(data.current.weather_code, state.lang);
  els.locationLabel.textContent = label;
  els.currentTime.textContent = formatDateTime(data.current.time);
  els.currentTemp.textContent = formatTemperature(data.current.temperature_2m, state.unit);
  els.currentText.textContent = `${weather.icon} ${weather.text}`;

  els.feelsLike.textContent = formatTemperature(data.current.apparent_temperature, state.unit);
  els.humidity.textContent = `${Math.round(data.current.relative_humidity_2m)}%`;
  els.wind.textContent = `${Math.round(data.current.wind_speed_10m)} km/h`;
  els.precip.textContent = `${data.current.precipitation} mm`;
  els.pressure.textContent = `${Math.round(data.current.surface_pressure)} hPa`;
  const uvValue = data.daily.uv_index_max?.[0];
  els.uv.textContent = typeof uvValue === 'number' ? `${uvValue.toFixed(1)} (${uvRiskLevel(uvValue, state.lang)})` : '--';

  updateHourly(data);
  updateDaily(data);
  updateRiskCards(data);

  els.dashboard.hidden = false;
}

function setLanguage(next) {
  state.lang = next;
  document.documentElement.lang = next;
  document.documentElement.dir = i18n[next].dir;
  const tr = t();

  els.appTitle.textContent = next === 'ar'
    ? 'Moteb Weather Decision Prototype | نموذج موتب للطقس واتخاذ القرار'
    : 'Moteb Weather Decision Prototype';
  els.appSubtitle.textContent = next === 'ar'
    ? 'Prototype-only risk insights; not a scientific predictive engine. | مؤشرات تقديرية فقط وليست تنبؤًا علميًا.'
    : 'Prototype-only risk insights; not a scientific predictive engine.';
  els.searchBtn.textContent = next === 'ar' ? 'بحث / Search' : 'Search';
  els.locateBtn.textContent = next === 'ar' ? 'موقعي / My location' : 'My location';
  els.refreshBtn.textContent = next === 'ar' ? 'تحديث / Refresh' : 'Refresh';
  els.footerText.textContent = next === 'ar'
    ? 'Data: Open-Meteo Geocoding & Forecast APIs (no API key). | البيانات من Open-Meteo بدون مفتاح API.'
    : 'Data source: Open-Meteo Geocoding & Forecast APIs (no API key).';

  els.lblFeelsLike.textContent = tr.labels.feelsLike;
  els.lblHumidity.textContent = tr.labels.humidity;
  els.lblWind.textContent = tr.labels.wind;
  els.lblPrecip.textContent = tr.labels.precip;
  els.lblPressure.textContent = tr.labels.pressure;
  els.lblUv.textContent = tr.labels.uv;
  els.prototypeTitle.textContent = tr.riskTitle;
  els.prototypeIntro.textContent = tr.riskIntro;

  if (state.latestWeather) {
    renderWeather(state.latestWeather, state.latestLocationLabel);
  }
}

function setUnit(nextUnit) {
  state.unit = nextUnit;
  els.unitBtn.textContent = nextUnit === 'celsius' ? '°C' : '°F';
  els.unitBtn.setAttribute('aria-pressed', nextUnit === 'fahrenheit' ? 'true' : 'false');
  if (state.latestWeather) {
    renderWeather(state.latestWeather, state.latestLocationLabel);
  }
}

async function loadWeatherForCoordinates(lat, lon, label, force) {
  const shouldForce = Boolean(force);
  const key = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  if (state.requestKey === key) {
    return;
  }
  if (!shouldForce && state.latestCoords) {
    const sameLat = Math.abs(state.latestCoords.lat - lat) < 0.001;
    const sameLon = Math.abs(state.latestCoords.lon - lon) < 0.001;
    if (sameLat && sameLon && state.latestWeather) {
      renderWeather(state.latestWeather, label || state.latestLocationLabel);
      setStatus(t().cityLoaded, 'success');
      return;
    }
  }

  state.requestKey = key;
  setLoading(true);
  setStatus(t().loadingWeather);
  try {
    const weather = await fetchWeather(lat, lon);
    state.latestCoords = { lat, lon };
    state.latestWeather = weather;
    state.latestLocationLabel = label;
    renderWeather(weather, label);
    setStatus(t().cityLoaded, 'success');
  } catch (error) {
    setStatus(error.message === 'invalid_payload' ? t().invalidData : t().networkError, 'error');
  } finally {
    setLoading(false);
    state.requestKey = '';
  }
}

function suggestionLabel(entry) {
  return [entry.name, entry.admin1, entry.country].filter(Boolean).join(', ');
}

function clearSuggestions() {
  els.suggestions.hidden = true;
  els.suggestions.replaceChildren();
}

function renderSuggestions(results) {
  els.suggestions.replaceChildren();
  results.forEach((entry) => {
    const button = createEl('button', suggestionLabel(entry), 'suggestion-item');
    button.type = 'button';
    button.role = 'option';
    button.addEventListener('click', () => {
      clearSuggestions();
      els.cityInput.value = suggestionLabel(entry);
      loadWeatherForCoordinates(entry.latitude, entry.longitude, suggestionLabel(entry));
    });
    els.suggestions.append(button);
  });
  els.suggestions.hidden = results.length === 0;
}

async function submitSearch(event) {
  event.preventDefault();
  const query = sanitizeCityQuery(els.cityInput.value);
  if (!query) {
    setStatus(t().searchEmpty, 'error');
    return;
  }
  clearSuggestions();
  setLoading(true);
  setStatus(t().searching);
  try {
    const results = await geocodeCity(query);
    if (!results.length) {
      setStatus(t().noCity, 'error');
      return;
    }
    const target = results[0];
    await loadWeatherForCoordinates(target.latitude, target.longitude, suggestionLabel(target));
  } catch {
    setStatus(t().networkError, 'error');
  } finally {
    setLoading(false);
  }
}

function onCityInput() {
  const query = sanitizeCityQuery(els.cityInput.value);
  clearTimeout(state.suggestionTimer);
  if (query.length < 2 || query === state.lastSuggestionQuery) {
    if (query.length < 2) clearSuggestions();
    return;
  }

  state.suggestionTimer = setTimeout(async () => {
    try {
      state.lastSuggestionQuery = query;
      const results = await geocodeCity(query);
      renderSuggestions(results);
    } catch {
      clearSuggestions();
    }
  }, 250);
}

function detectLocation() {
  if (!navigator.geolocation) {
    setStatus(t().geoUnsupported, 'error');
    return;
  }
  setStatus(t().geoLoading);
  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      await loadWeatherForCoordinates(coords.latitude, coords.longitude, t().myLocation);
    },
    () => setStatus(t().geoDenied, 'error'),
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function refreshWeather() {
  if (!state.latestCoords) return;
  loadWeatherForCoordinates(state.latestCoords.lat, state.latestCoords.lon, state.latestLocationLabel, true);
}

function attachEvents() {
  els.searchForm.addEventListener('submit', submitSearch);
  els.cityInput.addEventListener('input', onCityInput);
  els.locateBtn.addEventListener('click', detectLocation);
  els.refreshBtn.addEventListener('click', refreshWeather);
  els.unitBtn.addEventListener('click', () => {
    setUnit(state.unit === 'celsius' ? 'fahrenheit' : 'celsius');
  });
  els.langToggle.addEventListener('click', () => {
    setLanguage(state.lang === 'ar' ? 'en' : 'ar');
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('#suggestions') && event.target !== els.cityInput) {
      clearSuggestions();
    }
  });
}

async function init() {
  attachEvents();
  setLanguage('ar');
  setUnit('celsius');
  await loadWeatherForCoordinates(24.7136, 46.6753, state.lang === 'ar' ? 'الرياض، السعودية' : 'Riyadh, Saudi Arabia');
}

init();
