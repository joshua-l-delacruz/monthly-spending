# Pi Monthly Spending

A privacy-friendly monthly expense tracker for the Pi ecosystem. The current release runs entirely in the browser and keeps financial data on the user's device.

> **Status:** Early portfolio release · local-only storage · no account required

**[Open the live expense tracker](https://spending.joshuadelacruz.solutions/)**

## Why this project exists

Pi Monthly Spending explores a simple, mobile-friendly way to record expenses, review category totals, and compare spending against a monthly budget. It deliberately starts with local storage before introducing authentication or cloud synchronization.

## Features

- Monthly spending overview
- Expense tracking
- Spending categories
- Monthly budget overview
- Payment method tracking
- Pi payment category
- Responsive design

## Current Version

The initial version stores expense data locally in the user's browser. Clearing browser data, using private browsing, or switching devices can remove or hide saved records. Do not treat the current release as a permanent financial record.

## Run locally

The application is a static web project. Clone the repository and open `index.html`, or use a local static-file server.

```bash
git clone https://github.com/joshua-l-delacruz/monthly-spending.git
cd monthly-spending
npx serve .
```

Then open the local address shown by the server.

## Privacy and data model

- Expense data remains in browser storage in the current release.
- No bank credentials or financial accounts are requested.
- No cloud backup or cross-device synchronization is currently provided.
- Example or demo data should never contain real account numbers or secrets.

## Planned Features

- Pi Network authentication
- Vercel API
- Neon PostgreSQL
- Cloud-synchronized expenses
- User accounts
- Monthly budgets
- Pi transaction tracking
- Spending charts
- Export functionality

## Deployment

The public application is available at [spending.joshuadelacruz.solutions](https://spending.joshuadelacruz.solutions/). The static origin is deployed through Vercel and exposed through the branded Cloudflare hostname.

## Contributing

Focused bug reports and accessibility improvements are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request.

## License

Licensed under the [MIT License](LICENSE).
