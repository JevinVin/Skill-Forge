---
trigger: always_on
---

- Java/Spring Boot: follow standard Java naming conventions (PascalCase classes,
  camelCase methods/variables), use constructor injection over field injection,
  keep controllers thin — business logic goes in service classes, not controllers.
- Use DTOs for API request/response bodies, never expose JPA entities directly.
- JavaScript/React: use functional components with hooks, camelCase for variables
  and functions, PascalCase for component names and files (e.g. CourseCard.jsx).
- Prefer async/await over .then() chains for asynchronous code.
- Python (adaptive engine, RAG tutor services): follow PEP 8 style guide.
- All code, regardless of language, must be properly commented — explain why
  non-obvious logic exists, not just what it does. Public functions/methods
  should have a docstring or Javadoc-style comment describing purpose,
  parameters, and return value.
- Every function/method should have a clear single responsibility — if a function
  is doing more than one thing, split it.
- Consistent formatting: 2-space indentation for JS/JSON, 4-space for Java/Python.
- No hardcoded secrets, API keys, or URLs in code — use environment variables /
  config files, and add a .env.example showing what's needed.
- Meaningful variable/function names over abbreviations (e.g. `userRepository`
  not `usrRepo`).