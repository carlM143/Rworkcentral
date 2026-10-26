# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Report UI verification

Run `npm run test:reports` to build the app and check report filtering, complete attendance periods, details, previews, pagination, Excel/PDF/CSV downloads, print output, session history and mobile dialogs.

The browser tests use local Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`. Set `CHROME_PATH` to use a different Chromium executable. Port 3100 must be available; tests start their own production server and use sample data without a backend login.

Reports currently use the existing sample sources. Downloads include the selected reporting period, filters and all matching records across pages. The Reports Center exports available reports to individual Excel worksheets. Recent exports retain their snapshots for the current app session; refreshing the app clears that history. Catalog entries without an existing report page are marked Coming Soon.

## Wage management UI verification

Run `npm run test:wages` to build and check wage order validation, action menus, evaluation, review, approval, application, scheduling, compensation history, bulk scope and mobile menu behavior. The browser requirements above apply.

Wage management uses session-only sample daily rates. Order activation does not change employee rates. Proposals require submission and approval before application; future-dated changes are scheduled and must be applied when due. Evaluation matches region and classification and retains existing decisions. Production salary and payroll integration remains separate.
