interface Env {
  RESEND_API_KEY: string;
  CONTACT_TO_EMAIL: string;
  RESEND_FROM_EMAIL?: string;
  ALLOWED_ORIGIN?: string;
}

interface ContactPayload {
  name?: string;
  email?: string;
  message?: string;
  company?: string;
}

const RATE_LIMIT_WINDOW_MS = 30_000;
const RATE_LIMIT_MAX_REQUESTS = 3;
const ipRequestHistory = new Map<string, number[]>();

const jsonResponse = (body: Record<string, unknown>, status: number, corsOrigin: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    },
  });

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const parseAllowedOrigins = (allowedOrigin: string | undefined): string[] =>
  (allowedOrigin ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const resolveCorsOrigin = (requestOrigin: string | null, allowedOrigins: string[]): string => {
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  return allowedOrigins[0] ?? 'https://lsarmiento.dev';
};

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  const recent = (ipRequestHistory.get(ip) ?? []).filter((timestamp) => now - timestamp <= RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    ipRequestHistory.set(ip, recent);
    return true;
  }

  recent.push(now);
  ipRequestHistory.set(ip, recent);
  return false;
};

const validatePayload = (payload: ContactPayload) => {
  const name = (payload.name ?? '').trim();
  const email = (payload.email ?? '').trim();
  const message = (payload.message ?? '').trim();
  const company = (payload.company ?? '').trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (company) {
    return { ok: false, error: 'Spam detected.' };
  }

  if (!name || !email || !message) {
    return { ok: false, error: 'Missing required fields.' };
  }

  if (!emailRegex.test(email)) {
    return { ok: false, error: 'Invalid email.' };
  }

  if (message.length < 10 || message.length > 2000) {
    return { ok: false, error: 'Message length must be between 10 and 2000 characters.' };
  }

  if (name.length > 120 || email.length > 250) {
    return { ok: false, error: 'Field length exceeded.' };
  }

  return {
    ok: true,
    value: { name, email, message },
  };
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowedOrigins = parseAllowedOrigins(env.ALLOWED_ORIGIN);
    const requestOrigin = request.headers.get('Origin');
    const corsOrigin = resolveCorsOrigin(requestOrigin, allowedOrigins);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': corsOrigin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Vary': 'Origin',
        },
      });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ ok: false, error: 'Method not allowed.' }, 405, corsOrigin);
    }

    if (requestOrigin && allowedOrigins.length > 0 && !allowedOrigins.includes(requestOrigin)) {
      return jsonResponse({ ok: false, error: 'Origin not allowed.' }, 403, corsOrigin);
    }

    const contentType = request.headers.get('Content-Type') ?? '';
    if (!contentType.includes('application/json')) {
      return jsonResponse({ ok: false, error: 'Content-Type must be application/json.' }, 415, corsOrigin);
    }

    const clientIp = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    if (isRateLimited(clientIp)) {
      return jsonResponse({ ok: false, error: 'Too many requests. Please try again later.' }, 429, corsOrigin);
    }

    let payload: ContactPayload;
    try {
      payload = (await request.json()) as ContactPayload;
    } catch {
      return jsonResponse({ ok: false, error: 'Invalid JSON body.' }, 400, corsOrigin);
    }

    const validation = validatePayload(payload);
    if (!validation.ok || !validation.value) {
      return jsonResponse({ ok: false, error: validation.error }, 400, corsOrigin);
    }

    if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL) {
      return jsonResponse({ ok: false, error: 'Server is not configured.' }, 500, corsOrigin);
    }

    const { name, email, message } = validation.value;
    const resendFrom = env.RESEND_FROM_EMAIL ?? 'Portfolio Contact <onboarding@resend.lsarmiento.dev>';

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: resendFrom,
        to: env.CONTACT_TO_EMAIL,
        reply_to: email,
        subject: `Nuevo mensaje de contacto: ${name}`,
        text: `Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`,
        html: `<h2>Nuevo mensaje de contacto</h2><p><strong>Nombre:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Mensaje:</strong><br/>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>`,
      }),
    });

    if (!resendResponse.ok) {
      return jsonResponse({ ok: false, error: 'Email service rejected the request.' }, 502, corsOrigin);
    }

    return jsonResponse({ ok: true }, 200, corsOrigin);
  },
};
