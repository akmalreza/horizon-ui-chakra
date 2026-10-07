# Taste

- Keeps backend API reference material (e.g., an exported Postman collection) in `./docs/` and expects client-side API/endpoint implementation to be derived from it. Confidence: 0.6
- Prefers focused, incremental implementation passes over scaffolding ahead — e.g., chose "auth foundation + route guard only, no feature pages yet" over also pre-building POS feature routes. Confidence: 0.5
- Explicitly asks that new code follow the project's existing conventions rather than introducing new patterns (e.g., absolute imports from `src`, single quotes, trailing commas in this repo). Confidence: 0.7
