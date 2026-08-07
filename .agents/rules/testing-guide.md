---
trigger: always_on
---

- Every new service/feature should include at least basic unit tests for its
  core logic (not just happy path — include one failure/edge case per function).
- Backend: use JUnit for Spring Boot, pytest for Python services.
- Frontend: use React Testing Library for component tests where behavior matters
  (forms, conditional rendering) — skip trivial presentational components.
- Do not generate tests for every single getter/setter — focus on logic that
  can actually break.
- After generating a feature, briefly state what is and isn't covered by tests.