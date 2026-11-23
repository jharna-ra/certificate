
const TOKEN_RE = /^(?:ICES)?[A-Za-z0-9_-]{6,100}$/;

const esc = v =>
  String(v ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));

const LABELS = {
  name: 'Candidate Name',
  aadhaar: 'Aadhaar Number',
  father: 'Father / Guardian Name',
  dob: 'Date of Birth',
  enrollment_no: 'Enrollment Number',
  job_role: 'Job Role',
  duration: 'Training Duration',
  training_centre: 'Training Centre',
  district: 'District',
  state: 'State',
  assessment_partner: 'Assessment Partner',
  grade: 'Grade',
  place_of_issue: 'Place of Issue',
  date_of_issue: 'Date of Issue',
  certificate_no: 'Certificate Number'
};

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
   DISPLAY ALL SAVED CANDIDATE DETAILS
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
  width: 64px;
  height: 64px;
  margin: auto auto 12px;
  border-radius: 50%;
  background: #173b78;
  color: white;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 20px;
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
  <div class="logo">ICES</div>

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
        "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'"
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
  const data = rec.data;

  // Preserve and display every field saved in Supabase.
  const completeData = {
    ...data
  };

  if (!completeData.certificate_no) {
    completeData.certificate_no = rec.certificate_no;
  }

  const rows = allDataRows(completeData);

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

export default {

  async fetch(request, env) {

    const url = new URL(request.url);

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
