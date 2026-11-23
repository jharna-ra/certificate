const TOKEN_RE = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}$/;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[ch]);
}

function page({ title, body, status = 200 }) {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>${escapeHtml(title)} | ICES Certificate Verification</title>
<style>
:root{color-scheme:light;--ink:#14213d;--muted:#5b6b8c;--line:#dde3f0;--bg:#f4f6fb;--green:#157347;--red:#b42318;--blue:#16357a}
*{box-sizing:border-box}body{margin:0;background:var(--bg);font:16px/1.55 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:var(--ink);padding:24px}
main{max-width:680px;margin:7vh auto;background:#fff;border:1px solid var(--line);border-radius:18px;padding:clamp(22px,5vw,42px);box-shadow:0 12px 36px #14213d12}
.brand{font-size:13px;font-weight:700;letter-spacing:.12em;color:var(--blue)}h1{font-size:clamp(25px,5vw,34px);line-height:1.2;margin:12px 0 8px}.sub{color:var(--muted);margin:0 0 24px}
.status{display:inline-flex;align-items:center;gap:9px;border-radius:999px;padding:8px 14px;font-weight:800;font-size:14px;letter-spacing:.04em;background:#e8f5ee;color:var(--green)}.status.bad{background:#fff0ef;color:var(--red)}
dl{margin:24px 0 0;border-top:1px solid var(--line)}.item{padding:14px 0;border-bottom:1px solid var(--line)}dt{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:700}dd{margin:4px 0 0;font-size:18px;font-weight:650;overflow-wrap:anywhere}.note{margin-top:24px;color:var(--muted);font-size:13px}.foot{margin-top:30px;padding-top:18px;border-top:1px solid var(--line);font-size:12px;color:var(--muted)}
</style></head><body><main><div class="brand">ICES · CERTIFICATE VERIFICATION</div>${body}<div class="foot">This is an online verification record. For any discrepancy, contact the issuing organisation.</div></main></body></html>`;
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    },
  });
}

function errorPage(message, status = 400) {
  return page({
    title: "Verification unavailable",
    status,
    body: `<h1>Verification unavailable</h1><p class="sub">${escapeHtml(message)}</p>`,
  });
}

async function verify(token, env) {
  if (!TOKEN_RE.test(token)) return errorPage("The QR code does not contain a valid certificate reference.", 400);
  if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
    return errorPage("The verification service has not been configured yet. Please contact the website administrator.", 503);
  }

  const endpoint = new URL("/rest/v1/rpc/verify_certificate", env.SUPABASE_URL);

  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_PUBLISHABLE_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ p_token: token }),
    });
  } catch {
    return errorPage("The verification database could not be reached. Please try again later.", 502);
  }

  if (!response.ok) {
    // Do not expose database errors or configuration details on a public page.
    return errorPage("The verification service is temporarily unavailable. Please contact the website administrator.", 502);
  }

  const record = await response.json().catch(() => null);
  if (!record) return errorPage("No certificate record was found for this QR code. Check the QR code or contact the issuing organisation.", 404);

  const revoked = record.revoked === true;
  const certNo = escapeHtml(record.certificate_no || "Not available");
  const holder = escapeHtml(record.name || "Not available");
  const reason = revoked && record.revoked_reason
    ? `<div class="item"><dt>Revocation reason</dt><dd>${escapeHtml(record.revoked_reason)}</dd></div>`
    : "";
  const saved = record.created_at && !Number.isNaN(Date.parse(record.created_at))
    ? new Date(record.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })
    : "Available in ICES records";

  return page({
    title: revoked ? "Certificate revoked" : "Certificate valid",
    status: 200,
    body: `<h1>Certificate verification</h1><p class="sub">The QR reference was checked against the ICES online records.</p>
      <div class="status${revoked ? " bad" : ""}">${revoked ? "REVOKED" : "VALID RECORD"}</div>
      <dl><div class="item"><dt>Certificate holder</dt><dd>${holder}</dd></div>
      <div class="item"><dt>Certificate number</dt><dd>${certNo}</dd></div>
      <div class="item"><dt>Record created</dt><dd>${escapeHtml(saved)}</dd></div>${reason}</dl>
      <p class="note">This page confirms that a matching certificate record exists in the ICES database. It does not display Aadhaar numbers, date of birth, or other private candidate information.</p>`,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/c" || url.pathname.startsWith("/c/")) {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
      }
      const token = url.pathname.slice(3).replace(/\/$/, "");
      return verify(token, env);
    }
    return env.ASSETS.fetch(request);
  },
};
