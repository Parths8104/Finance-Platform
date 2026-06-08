# Ledgerleaf — Personal Finance Platform

A full-stack personal finance application for tracking income and expenses, setting
monthly budgets by category, and visualizing where your money goes. Built with the
Next.js App Router, TypeScript, Prisma, and PostgreSQL, with email/password
authentication and per-user data isolation.

## Features

- **Email & password auth** with hashed passwords (bcrypt) and JWT sessions (NextAuth)
- **Transactions** — log income and expenses, categorize them, and delete them
- **Budgets** — set a monthly limit per category and track spending against it with progress bars
- **Dashboard** — net balance, income/expense totals, a spending-by-category donut chart, and recent activity
- **Per-user isolation** — every query is scoped to the signed-in user, so accounts never see each other's data
- **Server-side validation** with Zod on every write endpoint

## Tech stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Framework  | Next.js 14 (App Router)             |
| Language   | TypeScript                          |
| Database   | PostgreSQL                          |
| ORM        | Prisma                              |
| Auth       | NextAuth (Credentials provider)     |
| Styling    | Tailwind CSS                        |
| Charts     | Recharts                            |
| Validation | Zod                                 |

## Project structure

```
src/
  app/
    api/            # Route handlers: auth, register, transactions, budgets
    dashboard/      # Protected app (overview, transactions, budgets)
    login/          # Login page
    register/       # Registration page
    page.tsx        # Public landing page
  components/        # Sidebar, charts, transaction & budget managers
  lib/               # Prisma client, auth config, utils & Zod schemas
  types/             # NextAuth type augmentation
prisma/
  schema.prisma      # Data models
  seed.ts            # Demo data seed
```

## Getting started

### 1. Prerequisites

- Node.js 18.18+ and npm
- A PostgreSQL database. The fastest option is a free hosted instance from
  [Neon](https://neon.tech) or [Supabase](https://supabase.com); local Postgres works too.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in the values:

```bash
cp .env.example .env
```

- `DATABASE_URL` — your PostgreSQL connection string
- `NEXTAUTH_SECRET` — generate one with `openssl rand -base64 32`
- `NEXTAUTH_URL` — `http://localhost:3000` for local development

### 4. Set up the database

```bash
npm run db:push     # create the tables from the Prisma schema
npm run db:seed     # (optional) load demo data
```

The seed creates a demo account:

```
email:    demo@finance.app
password: demo1234
```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Register a new account, or log in
with the demo credentials if you ran the seed.

## Available scripts

| Script             | Description                              |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Start the dev server                     |
| `npm run build`    | Generate the Prisma client and build     |
| `npm run start`    | Run the production build                 |
| `npm run db:push`  | Push the schema to the database          |
| `npm run db:seed`  | Seed demo data                           |
| `npm run db:studio`| Open Prisma Studio to inspect the data   |

## Deploying

This deploys cleanly to [Vercel](https://vercel.com):

1. Push the repo to GitHub.
2. Import it on Vercel.
3. Add `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` (your production URL) as
   environment variables.
4. Deploy. The `build` script runs `prisma generate` automatically.

> Use a hosted Postgres (Neon, Supabase, Railway) for the deployed database, and run
> `npx prisma db push` against it once to create the tables.

## Notes

- Passwords are never stored in plain text; only bcrypt hashes are persisted.
- All write endpoints validate input with Zod and confirm resource ownership before
  reading or mutating data.
- The schema uses a unique constraint on `(userId, categoryId, month, year)` so each
  category has at most one budget per month, updated via an upsert.

## License

MIT
