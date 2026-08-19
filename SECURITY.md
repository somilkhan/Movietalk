# Security

## Secrets

Never commit API keys, database URLs containing credentials, OAuth secrets, session tokens, cookies, or provider credentials.

Production secrets belong in Vercel environment variables. Frontend variables must contain only values intentionally safe for browser exposure, such as a Supabase URL and publishable key.

If a real credential is discovered in Git history or an obsolete configuration file, treat it as compromised: remove the reference and rotate/revoke the credential at its provider.

## Authentication

Supabase Auth is the canonical identity provider. Do not introduce a second user/session system without an explicit architecture decision.

Server-side endpoints that require identity must validate the Supabase access token before using the authenticated user ID.

## Database

Neon/PostgreSQL is the application database. Database credentials must remain server-side. Queries should use the shared database layer where applicable and must validate external input.

## External providers

TMDB and streaming providers are separate boundaries. Provider credentials must not be embedded in React components or exposed to the browser unless the provider explicitly requires a public credential.

Provider responses should be validated before being trusted by application code.

## API security

- Validate request parameters and bodies at API boundaries.
- Use appropriate authentication/authorization for protected routes.
- Preserve rate limiting and security headers; do not disable them merely to hide an error.
- Avoid leaking stack traces, secrets, upstream credentials, or internal infrastructure details in production responses.
- Configure CORS intentionally rather than using permissive defaults for protected APIs.

## Dependency and deployment hygiene

Use the repository's pnpm workspace and keep `pnpm-lock.yaml` synchronized with manifests. Review new dependencies before introducing them.

Vercel is the production deployment platform. Do not reintroduce Replit configuration, deployment assumptions, or credentials.

## Incident response

If a secret is exposed:

1. Rotate/revoke it at the provider immediately.
2. Remove it from the working tree and future configuration.
3. Search Git history for additional copies.
4. Review affected provider/account activity.
5. Document the remediation without reproducing the secret.
