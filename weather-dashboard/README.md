# Moteb Weather Dashboard Prototype

واجهة طقس ثنائية اللغة (Arabic/English) ضمن Moteb Score لعرض حالة الطقس الحالية بشكل واضح، مع مؤشرات تقديرية موضّحة على أنها **نموذج أولي**.

## Run / التشغيل

- افتح `/home/runner/work/moteb-score/moteb-score/weather-dashboard/index.html` مباشرة في المتصفح.
- أو شغّل خادم static بسيط (مثال):
  - `python3 -m http.server 8080` ثم افتح `http://localhost:8080/weather-dashboard/`.

## Data Sources / مصادر البيانات

- Open-Meteo Geocoding API (بدون مفتاح API)
- Open-Meteo Forecast API (بدون مفتاح API)

## Features / الميزات

- بحث عن المدن مع اقتراحات تلقائية.
- تحديد الموقع الحالي (Geolocation).
- عرض الطقس الحالي، والساعات القادمة، وتوقع 7 أيام.
- مؤشرات أساسية: الحرارة المحسوسة، الرطوبة، الرياح، الهطول، الضغط، وUV.
- تبديل °C/°F، وتحديث يدوي، ورسائل حالة وخطأ واضحة.
- واجهة RTL/LTR مع أساسيات الوصولية (labels, aria-live, keyboard focus).

## Security & Privacy Notes / ملاحظات الأمان والخصوصية

- الصفحة تستخدم Content Security Policy لتقييد السكربتات والاتصالات الخارجية بالمصادر المطلوبة فقط.
- يتم إرسال إحداثيات الموقع الجغرافي بعد تقليل دقتها قبل طلب البيانات من الخدمة الخارجية.
- الطلبات الخارجية لا ترسل credentials أو referrer.

## Prototype Limits / حدود النموذج

بطاقات المخاطر موسومة بوضوح `Prototype / تقديري` وتعتمد على تحويلات مبسطة مستندة إلى بيانات الطقس الحالية فقط.
**لا تمثل هذه البطاقات تنبؤًا علميًا** ولا تدّعي تقديم توقعات مستقبلية دقيقة تتجاوز ما توفره Open-Meteo.

## Verification / التحقق

شغّل:

```bash
node /home/runner/work/moteb-score/moteb-score/weather-dashboard/tests/verify.mjs
```

يغطي هذا التحقق:
- تحويل درجات الحرارة.
- تفسير أكواد WMO.
- التحقق من بنية بيانات API الأساسية.

## Next Development Steps / خطوات قادمة

1. إضافة تخزين محلي (آخر المدن واللغة).
2. إضافة unit tests أوسع عبر بيئة اختبار متكاملة.
3. إضافة تنبيهات شذوذ مستقبلية تعتمد على بيانات تاريخية حقيقية.
