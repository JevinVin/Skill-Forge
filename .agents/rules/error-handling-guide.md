---
trigger: always_on
---

- Every API endpoint must handle errors gracefully — no unhandled exceptions
  reaching the client as raw stack traces.
- Use consistent error response format across all services (e.g. { error: "message",
  code: "ERROR_CODE" }).
- Validate all user input at the API boundary before it reaches business logic
  (e.g. Spring Boot @Valid + DTOs, or manual validation in Node/Python routes).
- Log errors server-side with enough context to debug (what failed, relevant IDs)
  without logging sensitive data (passwords, tokens, personal info).
- Frontend must show a user-friendly message on API failure, never a blank
  screen or console-only error.