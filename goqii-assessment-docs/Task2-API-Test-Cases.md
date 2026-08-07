# Task 2 — API Testing: `POST /api/v1/challenge/join`

**Request body:**
```json
{
  "userId": 1234,
  "challengeId": 1001
}
```

**Documented responses:** `200 Success`, `401 Unauthorized`, `404 Challenge Not Found`, `409 Already Joined`, `500 Internal Server Error`

## 1. API Test Cases

| ID | Title | Input | Expected Status | Expected Behavior |
|----|-------|-------|------------------|--------------------|
| API-01 | Valid join | Valid `userId`, valid open `challengeId`, valid auth token | 200 | User enrolled; response body confirms enrollment (challenge details / join timestamp) |
| API-02 | Missing auth token | Valid body, no `Authorization` header | 401 | Request rejected; no enrollment created |
| API-03 | Expired/invalid token | Valid body, expired or malformed token | 401 | Request rejected; consistent error shape with API-02 |
| API-04 | Non-existent challenge | Valid `userId`, `challengeId` that doesn't exist | 404 | No enrollment created; clear error message |
| API-05 | Already-joined challenge | `userId` already enrolled in `challengeId` | 409 | No duplicate enrollment; existing enrollment untouched |
| API-06 | Server error simulation | Trigger backend failure (e.g., DB down in staging, or mocked) | 500 | Generic safe error returned; no partial/corrupt enrollment state |
| API-07 | Expired challenge | Valid `userId`, `challengeId` for a challenge whose end date has passed | 404 or dedicated code (**clarify with dev team** — may warrant a distinct `410 Gone` rather than reusing 404) | No enrollment created |
| API-08 | Concurrent join requests | Same `userId` + `challengeId`, two requests fired near-simultaneously | 200 (first), 409 (second) | Exactly one enrollment created — no race condition duplicate |
| API-09 | Response schema validation | Any 200 response | 200 | Response body matches agreed schema/contract (types, required fields) |
| API-10 | Response time | Valid join | 200 | Response within agreed SLA (e.g., < 500ms for p95) |

## 2. Validation Checklist

- [ ] `userId` — required, must be a valid integer/ID format matching the auth token's owner (or admin-scoped).
- [ ] `challengeId` — required, must be a valid integer/ID format.
- [ ] Content-Type header — request rejected/handled correctly if missing or set to something other than `application/json`.
- [ ] Authorization header — required on every call; verify token scope (a user shouldn't be able to join a challenge *on behalf of* another `userId`).
- [ ] Response Content-Type is `application/json` on all paths, including errors.
- [ ] Error response bodies follow a consistent schema (e.g., `{ "error": { "code": ..., "message": ... } }`) across 401/404/409/500.
- [ ] HTTP status codes match documented behavior exactly (no `200` with an error message embedded in the body).
- [ ] Idempotency — resending an already-successful join request doesn't create duplicate records (should return 409, not a second 200).

## 3. Negative Scenarios

- `userId` missing from request body.
- `challengeId` missing from request body.
- `userId` as a string instead of integer (type mismatch).
- `userId` / `challengeId` as negative numbers or zero.
- `userId` / `challengeId` as extremely large numbers (overflow boundary).
- Empty request body `{}`.
- Malformed JSON (trailing comma, unquoted keys).
- Extra/unexpected fields in the payload (should be ignored gracefully, not cause a 500).
- SQL/NoSQL injection payloads in `userId`/`challengeId` fields (e.g., `"1 OR 1=1"`).
- Joining a challenge with a `userId` belonging to a different, authenticated user (authorization bypass attempt / IDOR).
- Rapid repeated requests from the same user to check rate-limiting behavior.

## 4. Security Considerations

- **Broken Object Level Authorization (IDOR):** verify a user cannot pass another user's `userId` and join a challenge on their behalf, or that the backend derives the acting user from the auth token rather than trusting the body's `userId`.
- **Authentication enforcement:** confirm every non-200 auth failure returns 401 (not 500, which could leak stack traces or internal details).
- **Injection testing:** confirm `userId`/`challengeId` are strictly typed/validated server-side, not concatenated into queries.
- **Rate limiting / abuse prevention:** repeated join attempts shouldn't be able to be used to enumerate valid `challengeId`s (404 vs 409 timing/response differences could leak existence information — consider constant-time/consistent responses).
- **Sensitive data in error responses:** 500 errors must not leak stack traces, internal IDs, or DB error messages to the client.
- **HTTPS enforcement / TLS:** confirm the endpoint isn't reachable over plain HTTP.
- **Input size limits:** oversized payloads should be rejected cleanly, not crash the service.

## 5. Automation Strategy

- **Framework:** API tests are well-suited to a lightweight HTTP-assertion library — e.g., Playwright's built-in `request` fixture (keeping it in the same TypeScript/Playwright stack as Task 3), or Postman/Newman for a more business-readable suite that non-engineers can also run.
- **Layering:**
  1. **Contract/schema tests** — validate response shape for 200 and each error code against a shared JSON schema, run on every CI build (fast, cheap, catches breaking API changes immediately).
  2. **Functional test suite** — one test per row in the API Test Cases table above, run against a stable staging environment with seeded test data (a known `userId` + a known open `challengeId`, a known already-joined pair, a known expired pair).
  3. **Negative/security suite** — run less frequently (e.g., nightly) since some cases (injection, IDOR, rate-limit) are slower and noisier than the core functional suite.
- **Test data management:** avoid relying on hardcoded IDs across environments — provision test users/challenges via a setup/teardown API call (or DB seed script) at the start of each run so tests are independent and repeatable.
- **CI integration:** run the contract + functional suites on every PR; gate merges on failures. Run the negative/security suite on a schedule (e.g., nightly) to avoid slowing down the main pipeline.
- **Reporting:** surface failures with the actual vs. expected status code and response body diff, so a failing security/negative test is immediately actionable without needing to re-run manually.
