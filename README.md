# if3210-backend-2026

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.10. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Environment

The backend reads these environment variables:

- `DATABASE_URL` for PostgreSQL
- `JWT_SECRET` or `APP_JWT_SECRET` for auth JWT verification/signing
- `JWT_EXPIRES_IN` for auth token lifetime, default `7d`
- `PORT` for the HTTP server, default `3000`
- `LIVESTREAM_PROVIDER`, use `livekit_cloud`
- `LIVEKIT_URL` for the LiveKit Cloud RTC URL
- `LIVEKIT_API_KEY` for LiveKit token signing
- `LIVEKIT_API_SECRET` for LiveKit token signing
