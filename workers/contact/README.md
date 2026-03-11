# Contact Worker (Cloudflare + Resend)

Worker endpoint that receives contact form submissions, validates payloads, blocks simple spam with a honeypot field, applies basic per-IP rate limiting, and forwards messages with Resend.

## Requirements

- Cloudflare account
- Resend API key
- Wrangler CLI (`npm i -g wrangler`)

## Local setup

1. Copy `.dev.vars.example` to `.dev.vars`.
2. Fill required values:
   - `RESEND_API_KEY`
   - `CONTACT_TO_EMAIL`
   - `RESEND_FROM_EMAIL`
   - `ALLOWED_ORIGIN` (comma-separated)
3. Run locally:

```bash
wrangler dev
```

## Deploy

```bash
wrangler deploy
```

Expose the deployed URL in the Astro app via:

```bash
PUBLIC_CONTACT_API_URL="https://<your-worker>.workers.dev"
```

## Request shape

```json
{
  "name": "Luis",
  "email": "hello@example.com",
  "message": "Hola, quiero trabajar contigo",
  "company": ""
}
```

- `company` is the honeypot field and must stay empty.
