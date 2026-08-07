---
trigger: always_on
---

- Organize the project with a separate top-level folder per functionality/service (e.g. /auth-service, /course-service, /adaptive-engine, /rag-tutor, /realtime-service, /frontend).
- Within each service, separate concerns into subfolders (routes/controllers, models, services, config).
- Do not mix unrelated functionality into the same file or folder.
- Each service folder should have its own README explaining what it does and how to run it.