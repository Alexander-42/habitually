# Habit tracker backend

Express API backed by **PostgreSQL**. Data lives in Postgres (not on the local
filesystem), so it survives Render redeploys.

## Configuration

| Env var        | Required | Notes                                                                 |
| -------------- | -------- | --------------------------------------------------------------------- |
| `DATABASE_URL` | yes      | Postgres connection string. The server refuses to start without it.   |
| `DATABASE_SSL` | no       | Defaults to TLS on. Set `false` for a plaintext local/CI database.    |
| `JWT_SECRET`   | yes      | Secret used to sign/verify auth tokens.                               |
| `PORT`         | no       | Defaults to `4000`.                                                   |

The schema is created automatically on boot (`init()` in `store.js`) and is
idempotent, so no manual migration step is needed.

## Local development

Run a Postgres instance and point the app at it, e.g.:

```bash
# one-off local databases
createdb habits
createdb habits_test

export DATABASE_URL=postgres://localhost:5432/habits
export DATABASE_SSL=false
export JWT_SECRET=dev-secret
npm run dev
```

## Tests

The store tests run against a real Postgres database (`habits_test` by default):

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/habits_test \
DATABASE_SSL=false JWT_SECRET=test npm test
```

CI provisions a throwaway Postgres service container for both the unit tests and
the Playwright e2e suite — see `.github/workflows/pipeline.yml`.

## Deploying on Render

1. Create a **PostgreSQL** instance in Render.
2. In the web service's **Environment**, add `DATABASE_URL` set to the database's
   **Internal Database URL** (leave `DATABASE_SSL` unset — TLS stays on).
3. Deploy. The schema is created on first boot and persists across future deploys.