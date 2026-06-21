# /verify — Run the build gate

Verifies the project passes the full Definition of Done gate.

## Steps

1. `npm run build` — must exit 0, zero errors
2. `npm run lint` — must exit 0, zero warnings
3. `npm test` — must exit 0 (or no test files = pass)
4. Verify empty `.env` — confirm no env-related console errors
5. Verify `.claude/mahiNest/` is intact

## Report format

```
build: PASS / FAIL (errors listed)
lint: PASS / FAIL (errors listed)
test: PASS / FAIL (failures listed)
env: PASS / FAIL
.claude: INTACT / MISSING
```
