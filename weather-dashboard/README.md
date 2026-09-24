# Moteb Weather Dashboard Prototype

واجهة طقس ثنائية اللغة (Arabic/English) كـ **نموذج أولي** ضمن Moteb Score لدعم قراءة الطقس الحالية وتصورات قرار مستقبلية تقديرية.

## Run / التشغيل

- افتح `/home/runner/work/moteb-score/moteb-score/weather-dashboard/index.html` مباشرة في المتصفح.
- أو شغّل خادم static بسيط (مثال):
  - `python3 -m http.server 8080` ثم افتح `http://localhost:8080/weather-dashboard/`.

## Data Sources / مصادر البيانات

- Open-Meteo Geocoding API (بدون مفتاح API)
- Open-Meteo Forecast API (بدون مفتاح API)

## Features / الميزات

- بحث مدينة مع اقتراحات.
- تحديد الموقع الحالي (Geolocation).
- الطقس الحالي + الساعات القادمة + توقع 7 أيام.
- مؤشرات: الحرارة المحسوسة، الرطوبة، الرياح، الهطول، الضغط، UV.
- تبديل °C/°F، تحديث يدوي، حالات تحميل ورسائل خطأ واضحة.
- واجهة RTL/LTR، وتجهيز وصولية أساسي (labels, aria-live, keyboard focus).

## Prototype Limits / حدود النموذج

بطاقات "Future Risk" موسومة بوضوح `Prototype / تقديري` وتعتمد على تحويلات مبسطة من بيانات API الحالية فقط.
**لا تقدم تنبؤًا علميًا مؤكدًا** ولا تدعي دقة مستقبلية غير متاحة من Open-Meteo.

## Verification / التحقق

شغّل:

```bash
node /home/runner/work/moteb-score/moteb-score/weather-dashboard/tests/verify.mjs
```

يغطي التحقق:
- تحويل درجات الحرارة.
- تفسير أكواد WMO.
- التحقق من بنية بيانات API الأساسية.

## Next Development Steps / خطوات قادمة

1. إضافة تخزين محلي (آخر المدن واللغة).
2. إضافة unit tests أوسع عبر بيئة اختبار متكاملة.
3. إضافة تنبيهات شذوذ مستقبلية تعتمد على بيانات تاريخية حقيقية.
