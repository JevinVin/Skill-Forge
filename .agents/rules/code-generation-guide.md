---
trigger: always_on
---

- Follow proper layering: Controllers/Components should only handle
  request/response or UI rendering — never business logic. Business logic goes
  in Service classes (Spring Boot) or custom hooks/utils (React).
- Data access goes in Repository classes only — no direct DB queries in services
  or controllers.
- Keep entry points (main.py, App.jsx, Application.java) minimal — they should
  wire things together and call into feature modules, not contain feature logic
  themselves.
- When adding a new feature, create it as its own file/module first, then wire
  it into the entry point or parent component — don't build features inline.
- Avoid god-files: if a file is handling more than one clear responsibility
  (e.g. a controller doing auth AND business logic), split it before continuing.
- When generating example/demo/seed code to showcase a feature, keep it separate
  from the core implementation (e.g. a seed script or example route, not mixed
  into production logic).
