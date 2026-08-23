# ADR 0001: Consolidate application persistence on Supabase PostgreSQL

- Status: Accepted
- Date: 2026-08-24

## Context

RabbitRip already uses Supabase Auth but historically used Neon PostgreSQL for application persistence. The project currently has no production users, making this an appropriate point to simplify the service boundary before user data exists.

## Decision

Use the PostgreSQL database belonging to the RabbitRip Supabase project as the sole production application database. Keep the existing PostgreSQL/Drizzle data-access layer rather than replacing it with browser-side Supabase database calls.

Supabase Auth remains the identity/session provider. Application persistence remains server-side behind RabbitRip's API layer.

## Consequences

- One vendor owns both authentication and PostgreSQL infrastructure.
- The existing Drizzle schema and PostgreSQL queries can remain largely intact.
- `DATABASE_URL` becomes the Supabase PostgreSQL connection string in Vercel.
- Neon is no longer part of the intended production architecture.
- Database credentials remain server-side.
- RLS can be introduced deliberately for direct Supabase access or defense-in-depth without forcing a browser-side data-access rewrite.

## Migration guardrails

- Do not copy real credentials into Git.
- Apply the existing schema to the Supabase database before switching production traffic.
- Verify authentication, profiles, watchlist, ratings, progress, and all database-backed API routes after the switch.
- Remove Neon-specific deployment/configuration only after runtime verification.
