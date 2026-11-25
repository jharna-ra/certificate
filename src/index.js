const TOKEN_RE = /^(?:ICES)?[A-Za-z0-9_-]{6,100}$/;

const esc = v =>
  String(v ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));

/* =====================================================
   FIELD LABELS AND DISPLAY ORDER (verification page)
   Order: CertificateNo, Name, AadharNo, SonOrDaughterOf, DOB,
   Enrollment, Job Role, Duration, Training Centre, District, State,
   Assessment Partner, Grade, Place of Issue, Date of Issue
===================================================== */

const LABELS = {
  certificate_no: 'Certificate No',
  name: 'Name',
  aadhaar: 'Aadhar No',
  father: 'Son / Daughter of',
  dob: 'DOB',
  enrollment_no: 'Enrollment',
  job_role: 'Job Role',
  duration: 'Duration',
  training_centre: 'Training Centre',
  district: 'District',
  state: 'State',
  assessment_partner: 'Assessment Partner',
  grade: 'Grade',
  place_of_issue: 'Place of Issue',
  date_of_issue: 'Date of Issue'
};

const ORDER = Object.keys(LABELS);

// Official ICES logo, small and embedded in the page: no extra request, no storage.
const LOGO = 'data:image/png;base64,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';

const humanize = key =>
  LABELS[key] ||
  String(key).replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

/* =====================================================
   QR TOKEN EXTRACTION
===================================================== */

function extractToken(url) {
  let token = '';

  if (/^\/c\/?$/i.test(url.pathname)) {
    token = url.searchParams.get('token') || '';
  } else if (/^\/c\//i.test(url.pathname)) {
    token = url.pathname.slice(3);
  } else {
    return '';
  }

  try {
    token = decodeURIComponent(token).trim();
  } catch {
    return '';
  }

  token = token.replace(/\/+$/, '');

  // Support QR links containing a complete URL.
  if (/^https?:\/\//i.test(token)) {
    try {
      const oldUrl = new URL(token);
      return extractToken(oldUrl);
    } catch {
      return '';
    }
  }

  // Accept old and new ICES tokens.
  return TOKEN_RE.test(token) ? token : '';
}

/* =====================================================
   DISPLAY SAVED CANDIDATE DETAILS
===================================================== */

function allDataRows(value, prefix = '') {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  if (Array.isArray(value)) {
    return value.map((v, i) =>
      allDataRows(v, `${prefix} ${i + 1}`)
    ).join('');
  }

  if (typeof value === 'object') {
    return Object.entries(value).map(([k, v]) =>
      allDataRows(
        v,
        prefix
          ? `${prefix} / ${humanize(k)}`
          : humanize(k)
      )
    ).join('');
  }

  return `
    <div class="detail">
      <div class="k">${esc(prefix || 'Detail')}</div>
      <div class="v">${esc(value)}</div>
    </div>
  `;
}

// Known fields first, in the required order; any extra saved fields follow.
function orderedRows(d) {
  const first = ORDER
    .filter(k => d[k] !== undefined && d[k] !== null && d[k] !== '')
    .map(k => allDataRows(d[k], LABELS[k]))
    .join('');

  const extra = Object.fromEntries(
    Object.entries(d).filter(([k]) => !ORDER.includes(k))
  );

  return first + allDataRows(extra);
}

/* =====================================================
   ICES STATIC VERIFICATION PAGE
===================================================== */

function page(title, body, status = 200) {
  return new Response(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${esc(title)} | ICES</title>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 22px;
  background: #f3f6fb;
  color: #17233b;
  font: 16px/1.55 Arial,sans-serif;
}

.wrap {
  max-width: 760px;
  margin: 4vh auto;
  background: white;
  border: 1px solid #dfe6f0;
  border-radius: 18px;
  box-shadow: 0 12px 40px #17233b12;
  overflow: hidden;
}

.head {
  text-align: center;
  padding: 26px 20px 20px;
}

.logo {
  display: block;
  width: 84px;
  height: 84px;
  margin: 0 auto 12px;
  object-fit: contain;
}

.org {
  font-size: 17px;
  font-weight: 700;
  color: #18386f;
}

.sub {
  font-size: 12px;
  color: #758198;
  margin-top: 4px;
}

.content {
  padding: 25px clamp(18px,5vw,40px) 30px;
  border-top: 1px solid #e8edf4;
}

.valid {
  text-align: center;
}

.tick {
  margin: 0 auto 13px;
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: #e7f7ed;
  color: #16834a;
  display: grid;
  place-items: center;
  font-size: 42px;
  font-weight: bold;
}

.tick svg {
  width: 46px;
  height: 46px;
}

h1 {
  font-size: 26px;
  margin: 0;
}

.msg {
  color: #53627a;
  margin: 7px 0 20px;
}

.details {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.detail {
  display: grid;
  grid-template-columns: minmax(135px,.8fr) 1.2fr;
  gap: 14px;
  padding: 12px 15px;
  border-bottom: 1px solid #edf0f5;
}

.detail:last-child {
  border: 0;
}

.k {
  font-size: 12px;
  font-weight: 700;
  color: #65728a;
  text-transform: uppercase;
}

.v {
  font-size: 14px;
  color: #1d2b45;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.foot {
  text-align: center;
  padding: 15px;
  color: #8993a5;
  font-size: 11px;
  border-top: 1px solid #e8edf4;
}

@media(max-width:480px) {
  .detail {
    grid-template-columns: 1fr;
    gap: 3px;
  }
}
</style>
</head>

<body>
<main class="wrap">

<header class="head">
  <img class="logo" src="${LOGO}" alt="ICES logo" width="84" height="84">

  <div class="org">
    Integrated Council for Entrepreneurship and Skilling
  </div>

  <div class="sub">
    An Awarding Body Recognised by NCVET
  </div>
</header>

<section class="content">
${body}
</section>

<footer class="foot">
Official ICES certificate verification
</footer>

</main>
</body>
</html>`, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy':
        "default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; frame-ancestors 'none'"
    }
  });
}

/* =====================================================
   ERROR PAGE
===================================================== */

function fail(message, status = 404) {
  return page(
    'Verification unavailable',
    `
    <div class="valid">
      <h1>Unable to verify certificate</h1>
      <p class="msg">${esc(message)}</p>
    </div>
    `,
    status
  );
}

/* =====================================================
   SUPABASE CERTIFICATE VERIFICATION
   Only a small text record is read. No PDFs or files are stored.
===================================================== */

async function verify(token, env) {

  if (!TOKEN_RE.test(token)) {
    return fail('The QR link is invalid or incomplete.');
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
    return fail(
      'Verification service is not configured. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in Worker settings.',
      503
    );
  }

  let supabaseURL;

  try {
    supabaseURL = new URL(env.SUPABASE_URL);

    if (supabaseURL.protocol !== 'https:') {
      return fail('Invalid Supabase project URL configuration.', 503);
    }

  } catch {
    return fail('Invalid Supabase project URL configuration.', 503);
  }

  let response;

  try {
    response = await fetch(
      new URL('/rest/v1/rpc/get_certificate', supabaseURL),
      {
        method: 'POST',

        headers: {
          'apikey': env.SUPABASE_PUBLISHABLE_KEY,
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          p_token: token
        })
      }
    );

  } catch {
    return fail(
      'The verification database could not be reached. Please try again.',
      502
    );
  }

  if (!response.ok) {
    return fail(
      `Verification database error (${response.status}). Check the Supabase API key and get_certificate SQL function permissions.`,
      502
    );
  }

  let rec;

  try {
    rec = await response.json();
  } catch {
    return fail('Invalid response received from verification database.', 502);
  }

  if (!rec || !rec.certificate_no || !rec.data) {
    return fail(
      'No matching certificate record was found. Please contact ICES.'
    );
  }

  const revoked = rec.revoked === true;
  const completeData = { ...rec.data };

  if (!completeData.certificate_no) {
    completeData.certificate_no = rec.certificate_no;
  }

  const rows = orderedRows(completeData);

  const body = `
    <div class="valid">

      <div class="tick">
        ${
          revoked
            ? '!'
            : '<svg viewBox="0 0 52 52" fill="none"><path d="M10 27l11 11L42 15" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        }
      </div>

      <h1>
        ${revoked ? 'Certificate Revoked' : 'Verified Successfully'}
      </h1>

      <p class="msg">
        ${
          revoked
            ? 'This certificate has been revoked and is not valid.'
            : 'This certificate is authenticated in the official ICES records.'
        }
      </p>

    </div>

    <div class="details">
      ${rows}

      ${
        revoked && rec.revoked_reason
          ? `
          <div class="detail">
            <div class="k">Revocation Reason</div>
            <div class="v">${esc(rec.revoked_reason)}</div>
          </div>
          `
          : ''
      }

      <div class="detail">
        <div class="k">Verification Status</div>
        <div class="v">
          ${revoked ? 'REVOKED' : 'AUTHENTICATED'}
        </div>
      </div>

    </div>
  `;

  return page(
    revoked ? 'Certificate Revoked' : 'Certificate Verified',
    body
  );
}

/* =====================================================
   CLOUDFLARE WORKER ENTRY POINT
===================================================== */


/* =====================================================
   SIGNED QR (no database): /sign signs certificate text.
   Needs Worker secret ICES_SIGNING_KEY (see DEPLOY_SIGNED_QR.md).
   CODEBOOK is APPEND-ONLY. Never edit or reorder existing entries.
===================================================== */
const CODEBOOK = {"order":["Cert","Name","Aadhar","DOB","Enroll","Job","Duration","Center","Dist","State","Partner","Place","Grade","Date"],"book":{"Job":["Beauty Therapist"],"Duration":["510 Hours"],"Center":["Acme Education Solution Pvt. Ltd."],"Dist":["Ranchi"],"State":["Jharkhand"],"Partner":["Skills Mantra Edutech Consulting India Pvt. Ltd."],"Place":["Ludhiana, Punjab"]}};

const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function packCert(text) {
  const f = {};
  for (const p of text.split('|')) {
    const i = p.indexOf(':');
    if (i < 1) return 'RAW:' + text;
    f[p.slice(0, i)] = p.slice(i + 1);
  }
  if (Object.keys(f).some((k) => !CODEBOOK.order.includes(k))) return 'RAW:' + text;
  return CODEBOOK.order.map((k) => {
    const v = f[k] ?? '';
    const i = (CODEBOOK.book[k] || []).indexOf(v);
    return i >= 0 ? '#' + i : v;
  }).join('|');
}

async function deflateRaw(bytes) {
  const cs = new CompressionStream('deflate-raw');
  const w = cs.writable.getWriter();
  w.write(bytes); w.close();
  return new Uint8Array(await new Response(cs.readable).arrayBuffer());
}

async function signText(text, key) {
  const data = await deflateRaw(new TextEncoder().encode(packCert(text)));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, data);
  return b64u(data) + '.' + b64u(sig); // 64-byte r||s signature
}

async function isAdmin(request, env) {
  const h = request.headers.get('Authorization') || '';
  if (!/^Bearer\s+\S+/.test(h) || !env.SUPABASE_URL) return false;
  const r = await fetch(new URL('/auth/v1/user', env.SUPABASE_URL), {
    headers: { apikey: env.SUPABASE_PUBLISHABLE_KEY, Authorization: h }
  });
  if (!r.ok) return false;
  if (!env.ADMIN_EMAIL) return true; // optional: set ADMIN_EMAIL to allow only that e-mail
  const u = await r.json().catch(() => ({}));
  return String(u.email || '').toLowerCase() === String(env.ADMIN_EMAIL).toLowerCase();
}

async function handleSign(request, env) {
  const J = (o, status = 200) => new Response(JSON.stringify(o), {
    status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
  if (request.method !== 'POST') return J({ error: 'POST only' }, 405);
  if (!env.ICES_SIGNING_KEY) return J({ error: 'Signing key is not configured on the Worker.' }, 503);
  if (!(await isAdmin(request, env))) return J({ error: 'Not authorised. Sign in again.' }, 401);
  let body;
  try { body = await request.json(); } catch (e) { return J({ error: 'Bad request' }, 400); }
  const texts = body && body.texts;
  if (!Array.isArray(texts) || !texts.length || texts.length > 100 ||
      texts.some((t) => typeof t !== 'string' || !t || t.length > 1500)) return J({ error: 'Bad request' }, 400);
  const der = Uint8Array.from(atob(String(env.ICES_SIGNING_KEY).replace(/-----[^-]+-----|\s/g, '')), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  return J({ signed: await Promise.all(texts.map((t) => signText(t, key))) });
}

export default {

  async fetch(request, env) {

    const url = new URL(request.url);

    if (url.pathname === '/sign') return handleSign(request, env);

    // Public QR verification route.
    if (
      url.pathname === '/c' ||
      url.pathname.startsWith('/c/')
    ) {

      if (
        request.method !== 'GET' &&
        request.method !== 'HEAD'
      ) {
        return new Response('Method not allowed', {
          status: 405,
          headers: {
            Allow: 'GET, HEAD'
          }
        });
      }

      const token = extractToken(url);

      if (!token) {
        return fail('The QR link is invalid or incomplete.');
      }

      const result = await verify(token, env);

      if (request.method === 'HEAD') {
        return new Response(null, {
          status: result.status,
          headers: result.headers
        });
      }

      return result;
    }

    // All other requests go to the static certificate generator.
    if (!env.ASSETS) {
      return new Response('ICES certificate application assets are not configured.', {
        status: 503
      });
    }

    return env.ASSETS.fetch(request);
  }

};
