
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
   EXACT CERTIFICATE FIELD ORDER
===================================================== */

const FIELD_ORDER = [
  ['certificate_no', 'CertificateNo'],
  ['name', 'Name'],
  ['aadhaar', 'AadharNo'],
  ['father', 'SonOrDaughterOf'],
  ['dob', 'DOB'],
  ['enrollment_no', 'Enrollment'],
  ['job_role', 'Job Role'],
  ['duration', 'Duration'],
  ['training_centre', 'Training Centre'],
  ['district', 'District'],
  ['state', 'State'],
  ['assessment_partner', 'Assessment Partner'],
  ['grade', 'Grade'],
  ['place_of_issue', 'Place of Issue'],
  ['date_of_issue', 'Date of Issue']
];

const ALIASES = {
  certificate_no: [
    'certificate_no', 'CertificateNo', 'certificateNo',
    'Certificate Number'
  ],
  name: [
    'name', 'Name', 'CandidateName', 'candidate_name'
  ],
  aadhaar: [
    'aadhaar', 'AadharNo', 'aadhaar_no',
    'AadhaarNo', 'Aadhaar Number', 'aadhar'
  ],
  father: [
    'father', 'SonOrDaughterOf', 'FatherName',
    'father_name', 'son_or_daughter_of',
    'Son/Daughter Of'
  ],
  dob: [
    'dob', 'DOB', 'DateOfBirth', 'date_of_birth',
    'Date of Birth'
  ],
  enrollment_no: [
    'enrollment_no', 'Enrollment', 'EnrollmentNo',
    'enrollment', 'Enrollment Number'
  ],
  job_role: [
    'job_role', 'JobRole', 'Job Role'
  ],
  duration: [
    'duration', 'Duration', 'TrainingDuration',
    'training_duration'
  ],
  training_centre: [
    'training_centre', 'TrainingCentre',
    'Training Centre', 'training_center'
  ],
  district: ['district', 'District'],
  state: ['state', 'State'],
  assessment_partner: [
    'assessment_partner', 'AssessmentPartner',
    'Assessment Partner'
  ],
  grade: ['grade', 'Grade'],
  place_of_issue: [
    'place_of_issue', 'PlaceOfIssue', 'Place of Issue'
  ],
  date_of_issue: [
    'date_of_issue', 'DateOfIssue', 'Date of Issue'
  ]
};

/* =====================================================
   READ FIELD WITH ALIASES
===================================================== */

function getField(data, key) {
  const aliases = ALIASES[key] || [key];

  for (const alias of aliases) {
    const value = data?.[alias];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ''
    ) {
      return value;
    }
  }

  return '';
}

/* =====================================================
   RENDER ALL 15 FIELDS IN FIXED ORDER
===================================================== */

function allDataRows(data, certificateNo) {
  const completeData = {
    ...data,
    certificate_no:
      getField(data, 'certificate_no') || certificateNo
  };

  return FIELD_ORDER.map(([key, label]) => {
    const value = getField(completeData, key);

    return `
      <div class="detail">
        <div class="k">${esc(label)}</div>
        <div class="v">${esc(value || '—')}</div>
      </div>
    `;
  }).join('');
}

/* =====================================================
   EXTRACT TOKEN FROM QR LINK
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

  // Support a complete old URL inside the QR path.
  if (/^https?:\/\//i.test(token)) {
    try {
      return extractToken(new URL(token));
    } catch {
      return '';
    }
  }

  return TOKEN_RE.test(token) ? token : '';
}

/* =====================================================
   STATIC ICES VERIFICATION PAGE
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
   VERIFY CERTIFICATE USING SUPABASE
===================================================== */

async function verify(token, env) {

  if (!TOKEN_RE.test(token)) {
    return fail('The QR link is invalid or incomplete.');
  }

  if (
    !env.SUPABASE_URL ||
    !env.SUPABASE_PUBLISHABLE_KEY
  ) {
    return fail(
      'Verification service is not configured. Please configure the Supabase project URL and publishable key.',
      503
    );
  }

  let supabaseURL;

  try {
    supabaseURL = new URL(env.SUPABASE_URL);

    if (supabaseURL.protocol !== 'https:') {
      return fail('Invalid Supabase project URL.', 503);
    }
  } catch {
    return fail('Invalid Supabase project URL.', 503);
  }

  let response;

  try {
    response = await fetch(
      new URL('/rest/v1/rpc/get_certificate', supabaseURL),
      {
        method: 'POST',
        headers: {
          apikey: env.SUPABASE_PUBLISHABLE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          p_token: token
        })
      }
    );
  } catch {
    return fail(
      'The verification database could not be reached.',
      502
    );
  }

  if (!response.ok) {
    return fail(
      `Verification database error (${response.status}). Check the Supabase API key and get_certificate function permissions.`,
      502
    );
  }

  let rec;

  try {
    rec = await response.json();
  } catch {
    return fail('Invalid database response.', 502);
  }

  if (
    !rec ||
    !rec.certificate_no ||
    !rec.data ||
    typeof rec.data !== 'object'
  ) {
    return fail(
      'No matching certificate record was found. Please contact ICES.'
    );
  }

  const revoked = rec.revoked === true;

  // The exact requested field sequence.
  const rows = allDataRows(
    rec.data,
    rec.certificate_no
  );

  const body = `
    <div class="valid">

      <div class="tick">
        ${
          revoked
            ? '<span style="font-size:38px;color:#b42318">!</span>'
            : '<svg viewBox="0 0 52 52" fill="none"><path d="M10 27l11 11L42 15" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        }
      </div>

      <h1>
        ${revoked
          ? 'Certificate Revoked'
          : 'Verified Successfully'}
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
    </div>
  `;

  return page(
    revoked
      ? 'Certificate Revoked'
      : 'Certificate Verified',
    body
  );
}

/* =====================================================
   CLOUDFLARE WORKER
===================================================== */

export default {

  async fetch(request, env) {

    const url = new URL(request.url);

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
        return fail(
          'The QR link is invalid or incomplete.'
        );
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

    if (!env.ASSETS) {
      return new Response(
        'ICES application assets are not configured.',
        { status: 503 }
      );
    }

    return env.ASSETS.fetch(request);
  }

};
