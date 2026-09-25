# K-Dojo v2 API

Read-only JSON: /api/programs/, /api/programs/:slug/, /api/coaches/, /api/coaches/:slug/, /api/locations/, /api/schedule/, /api/pricing/, /api/discounts/, /api/events/, /api/events/:slug/, /api/competitions/, /api/results/, /api/gallery/, /api/faq/, /api/settings/.

Schedule filters: program (slug), age, coach (ID), location (ID), weekday (0 Monday through 6 Sunday). Events: period=upcoming or past. Results: year.

POST /api/applications/ requires CSRF cookie and X-CSRFToken from GET /api/csrf/. Fields: name, phone, age (nullable), program/location/training_group (nullable IDs), message, source_page, utm_source/medium/campaign, consent=true; website honeypot must stay empty. Legacy /applications/create/ invokes the same protected handler.

201 means the application was stored. Validation returns 400 with errors; CSRF 403; unsupported methods 405; throttling 429; production form with incomplete legal configuration 503. Never expose a public application list. Admin-only notes are never serialized.

Public content excludes demo, inactive, unpublished, out-of-validity and private athlete records.
