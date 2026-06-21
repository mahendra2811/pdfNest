# pdfNest — Requirements Intake

## Compulsory NOW (build cannot start without) — SATISFIED
| Key | Value | Status |
|---|---|---|
| projectRoot | `/home/pooniya/Documents/p_project/a_Web/pdfNest` | ✅ provided (config) |
| appName | `pdfNest` | ✅ provided (config) |

## Git
| Key | Value | Status |
|---|---|---|
| githubRepo | `git@github.com:mahendra2811/pdfNest.git` | ✅ provided — Phase 1 sets origin, push at phase boundaries |

## Optional / can defer (env no-op rule — app works fully without each; add any time later)
| Key | Unlocks | Env var | Provided |
|---|---|---|---|
| analytics | Page/event analytics | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | no |
| ads | AdSense slots on non-tool pages | `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | no |
| contactForm | Contact/feedback via Formspree | `NEXT_PUBLIC_FORMSPREE_ID` | no |
| sentry | Client error monitoring | `NEXT_PUBLIC_SENTRY_DSN` | no |
| domain | Canonical URLs, sitemap/OG absolute base | `NEXT_PUBLIC_SITE_URL` | no |
| logo | Custom brand logo SVG (else default mark) | — (asset) | no |

All integrations are independently env-gated and OFF by default. Empty `.env` builds, lints, tests, and runs with every tool fully functional and zero console errors.
