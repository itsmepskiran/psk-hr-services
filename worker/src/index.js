const ALLOWED_ORIGINS = [
  'https://pskservices.co.in',
  'https://www.pskservices.co.in',
  'http://localhost:8000',
];
const DATA_KEY = 'payroll_db';
const COOKIE = 'psk_demo_session';
const SESSION_SECONDS = 60 * 60 * 12;

const enc = new TextEncoder();

async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function makeToken(env) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  return `${exp}.${await hmac(env.SESSION_SECRET, String(exp))}`;
}

async function validToken(env, token) {
  const [exp, sig] = (token || '').split('.');
  if (!exp || !sig || +exp < Date.now() / 1000) return false;
  return safeEqual(sig, await hmac(env.SESSION_SECRET, exp));
}

function getCookie(req, name) {
  const m = (req.headers.get('Cookie') || '').match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? m[1] : '';
}

function json(body, status, cors, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors, ...extra },
  });
}

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const cors = ALLOWED_ORIGINS.includes(origin)
      ? {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          Vary: 'Origin',
        }
      : {};
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    const { pathname } = new URL(req.url);

    if (pathname === '/api/login' && req.method === 'POST') {
      let body;
      try { body = await req.json(); } catch { return json({ error: 'Bad request' }, 400, cors); }
      const ok = typeof body.username === 'string' && typeof body.password === 'string'
        && safeEqual(body.username, env.ADMIN_USER) && safeEqual(body.password, env.ADMIN_PASS);
      if (!ok) return json({ error: 'Invalid username or password' }, 401, cors);
      const cookie = `${COOKIE}=${await makeToken(env)}; Max-Age=${SESSION_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Lax`;
      return json({ ok: true }, 200, cors, { 'Set-Cookie': cookie });
    }

    if (pathname === '/api/logout' && req.method === 'POST') {
      return json({ ok: true }, 200, cors, { 'Set-Cookie': `${COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax` });
    }

    if (pathname === '/api/data') {
      if (!(await validToken(env, getCookie(req, COOKIE)))) return json({ error: 'Unauthorized' }, 401, cors);
      const stored = (await env.DEMO_KV.get(DATA_KEY, 'json')) || { rev: 0, data: null };

      if (req.method === 'GET') return json(stored, 200, cors);

      if (req.method === 'PUT') {
        let body;
        try { body = await req.json(); } catch { return json({ error: 'Bad request' }, 400, cors); }
        if (body.rev !== stored.rev) return json({ error: 'Conflict', rev: stored.rev }, 409, cors);
        const next = { rev: stored.rev + 1, data: body.data };
        await env.DEMO_KV.put(DATA_KEY, JSON.stringify(next));
        return json({ rev: next.rev }, 200, cors);
      }

      if (req.method === 'DELETE') {
        await env.DEMO_KV.delete(DATA_KEY);
        return json({ ok: true }, 200, cors);
      }
    }

    return json({ error: 'Not found' }, 404, cors);
  },
};
