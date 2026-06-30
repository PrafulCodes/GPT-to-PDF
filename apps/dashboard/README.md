# GPT to PDF Developer Console — Documentation

This directory contains the Next.js 15 analytics dashboard console designed to provide real-time diagnostic reporting on PDF generation activities for a single administrator.

---

## 1. Project Architecture

The workspace is configured as a Turborepo monorepo:
* **`apps/web`**: Public ChatGPT-to-PDF landing pages and converter engine.
* **`apps/dashboard`**: Internal monitoring console.
* **`packages/db`**: Database adapter providing global Prisma bindings.
* **`packages/analytics`**: Parsing library mapping country/city codes, device types, browser engines, operating systems, and referrers.
* **`packages/shared`**: Universal utilities layer.

```
                  ┌──────────────┐
                  │ Client Browser│
                  └──────┬───────┘
                         │ HTTPS
                         ▼
                  ┌──────────────┐
                  │ NextJS Proxy │
                  └──────┬───────┘
                         │
        ┌────────────────┴────────────────┐
        ▼ (Port 3000)                     ▼ (Port 3001)
  ┌───────────┐                     ┌───────────┐
  │ apps/web  ├────────────────────►│ dashboard │
  └─────┬─────┘    Async Write      └─────┬─────┘
        │                                 │
        └──────────────┬──────────────────┘
                       │ Prisma
                       ▼
              ┌─────────────────┐
              │ Neon PostgreSQL │
              └─────────────────┘
```

---

### Project 1: GPT to PDF Web App (apps/web)
The public converter client requires connection strings and rate limiter access variables:

* **`DATABASE_URL`**: PostgreSQL connection string used by Prisma to write background tracking logs.
* **`UPSTASH_REDIS_REST_URL`**: REST URL for the Upstash Redis database, used to enforce visitor rate limiting.
* **`UPSTASH_REDIS_REST_TOKEN`**: Authentication token for the Upstash Redis database.
* **`NEXT_PUBLIC_SITE_URL`**: Canonical site URL (e.g. `https://gpttopdf.site`).

### Project 2: Administrator Dashboard Console (apps/dashboard)
The monitoring dashboard console requires credentials and secret signing variables:

* **`DATABASE_URL`**: PostgreSQL connection string used to retrieve and aggregate metrics.
* **`ADMIN_PASSWORD_HASH`**: Safe bcrypt hash of the administrator password (`praful2006mo`).
* **`SESSION_SECRET`**: Strong random hexadecimal string used to sign HMAC-SHA256 session JWTs (also supports `JWT_SECRET`).

---

## 3. Environment Mapping Reference Matrix

Below is the distribution matrix for where variables should be configured:

| Variable Name | Local `.env` | Vercel Web (`apps/web`) | Vercel Console (`apps/dashboard`) | Purpose / Role |
| :--- | :--- | :--- | :--- | :--- |
| **`DATABASE_URL`** | **Yes** | **Yes** | **Yes** | **Shared** database access credential. |
| **`ADMIN_PASSWORD_HASH`** | **Yes** | No | **Yes** | Authentication hash matching. |
| **`SESSION_SECRET`** | **Yes** | No | **Yes** | JWT signing/verification. |
| **`UPSTASH_REDIS_REST_URL`**| Optional | **Yes** | Optional (Diagnostics only) | Cache rate limiter. |
| **`UPSTASH_REDIS_REST_TOKEN`**| Optional| **Yes** | Optional (Diagnostics only) | Cache access credentials. |
| **`NEXT_PUBLIC_SITE_URL`** | Optional | **Yes** | No | Site routing canonical base. |

---

## 4. Database Indexes


To maintain sub-second queries as records scale beyond 100,000+ entries, the `ExportEvent` table includes the following indices:
* `timestamp` (for date-range filters and chronological timelines)
* `success` (for success vs failure calculations)
* `browser` (for analytics charts)
* `deviceType` (for client type chart breakdowns)
* `referrer` (for SEO aggregates)

---

## 4. Disaster Recovery & Backup Strategy

Database hosting is powered by **Neon PostgreSQL**, which implements a serverless storage engine with built-in backup and recovery features.

### Backup Schedule
* **Point-in-Time Recovery (PITR)**: Neon automatically backs up WAL (Write-Ahead Logs) and takes state snapshots. This allows restoring the database state to any precise millisecond within the past 14 days.
* **Storage Backups**: Automated backups are fully managed by the Neon platform, requiring no crons or scripts in the codebase.

### Recovery Operations
1. Log into the Neon Console.
2. Select the active branch (e.g. `main`).
3. Click on the **Time Travel** panel.
4. Specify the date/time target.
5. Create a recovery branch from that timestamp, update the dashboard's `DATABASE_URL` environment parameter, and check system status.

---

## 5. Security Checklist

* **Session Validation**: HTTP-only, secure cookies protect tokens. Validation runs on the Edge runtime (`middleware.ts`) to intercept unauthorized requests prior to render lifecycle execution.
* **Content Security Policy (CSP)**: The server strictly configures frames ancestry rules (`frame-ancestors 'none'`) and camera/microphone access permissions to eliminate clickjacking vectors.
* **Escaped SQL/No Injection**: All query aggregates compile via Prisma parameters, ensuring SQL Injection vectors are completely neutralized.
* **Strict Type Safety**: Full TypeScript configuration isolates type issues during build tasks.
