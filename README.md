# Pi Monthly Spending

A privacy-conscious monthly expense tracker for the Pi ecosystem. Financial records remain in the user's browser; optional Pi authentication verifies identity without uploading or synchronizing expense data.

> **Status:** Early portfolio release · local-first financial data · optional Pi identity · premium purchasing disabled

**[Open the live expense tracker](https://spending.joshuadelacruz.solutions/)**

## Recruiter quick view

| Area | Evidence |
| --- | --- |
| **Problem** | Give users a fast monthly budget and category view without requiring a financial account or cloud database. |
| **Architecture** | Static responsive UI + browser `localStorage`, with small Vercel serverless endpoints for optional Pi token verification and session handling. |
| **Privacy boundary** | Expense descriptions, amounts, categories, budgets, and payment methods stay in the browser and are not included in Pi authentication requests. |
| **Safety decision** | The unfinished premium flow is fail-closed; both the UI and server reject purchases until durable entitlement storage and real premium analytics exist. |
| **Verification** | Node's built-in test runner checks source syntax, API failure behavior, branded metadata, privacy disclosures, and the payment guard. |

## Current capabilities

- Add and delete expenses
- Filter records by month
- Compare spending with a monthly budget
- Review category totals and proportions
- Record a payment-method label
- Store records locally without a financial account
- Optionally verify a Pi identity through Pi's `/v2/me` API
- Establish a signed, secure application session after server-side token verification

## Current architecture and trust boundaries

```text
Browser
├── expense and budget records ──► localStorage only
├── optional Pi access token ────► /api/auth/login ──► Pi /v2/me
└── signed session cookie ◄─────── verified server response
```

- No bank credentials or financial-account connections are requested.
- No expense, budget, description, or payment-method record is sent to the server.
- No cloud backup or cross-device synchronization is currently provided.
- Clearing browser data, using private browsing, or changing devices can remove or hide records.
- Pi identity verification does not mean that financial records are synchronized.
- Pi access tokens are verified server-side and are not accepted as identity proof without a successful Pi API response.

## Premium status

The repository contains development-stage user-to-app payment integration, but the public release does not yet have durable entitlement storage or completed premium analytics. To avoid charging for an incomplete promise:

- the purchase control is disabled in the browser;
- payment endpoints return `503` unless `PREMIUM_PURCHASES_ENABLED=true` is deliberately configured; and
- the interface labels premium functionality as a preview rather than an available product.

Do not enable payments until the payment is bound to the authenticated Pi user, the entitlement is persisted and revalidated, the promised analytics are implemented, and end-to-end payment tests pass.

## Run locally

```bash
git clone https://github.com/joshua-l-delacruz/monthly-spending.git
cd monthly-spending
npm install
npm test
npx vercel dev
```

Copy `.env.example` to an ignored local environment file and provide development credentials only when testing Pi authentication. Never commit real secrets.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `SESSION_SECRET` | Signs the HttpOnly application session cookie. |
| `PI_NETWORK_API_KEY` | Server-only Pi API key used by the disabled payment endpoints. |
| `PREMIUM_PURCHASES_ENABLED` | Fail-closed payment gate. Keep `false` until durable entitlements are implemented. |

## Roadmap

- Persist and revalidate premium entitlements
- Bind every payment to the authenticated Pi UID
- Implement the promised premium analytics
- Add payment idempotency and replay protection
- Add optional, explicitly consented cloud synchronization
- Add export and deletion controls
- Add browser-level Pi SDK integration tests

## Deployment

The public application is available at [spending.joshuadelacruz.solutions](https://spending.joshuadelacruz.solutions/). The Vercel origin is exposed through the branded Cloudflare hostname.

## Security and contributing

Read [SECURITY.md](SECURITY.md) for private vulnerability reporting. Focused bug reports and accessibility improvements are welcome through [CONTRIBUTING.md](CONTRIBUTING.md). Reports must use fictional financial examples and must never contain tokens, credentials, account numbers, or real transaction identifiers.

## License

Licensed under the [MIT License](LICENSE).
