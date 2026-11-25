# Signed QR (no database) — deploy steps

## What changed
- `src/index.js`   new `/sign` route (signs QR text with a secret key kept in Cloudflare; only a signed-in admin can call it)
- `public/index.html`  generator now asks `/sign` instead of saving records to Supabase; QR link = `<site>/v#<signed data>`
- `public/v.html`  new verify page (served at `/v`), checks the signature in the browser, shows the details
- `public/revoked.json`  list of cancelled certificates (empty `{}`)
- `wrangler.jsonc` `/sign` added to `run_worker_first`
- Old `/c/<token>` links and Supabase records are NOT touched: already printed QR codes keep working.

## Deploy
1. Put your private key text in a Worker secret (key file is NOT in this folder; keep it out of GitHub):
   Linux/Mac:  `grep -v '^-----' ICES_PRIVATE_KEY_KEEP_SECRET.pem | tr -d '\n' | npx wrangler secret put ICES_SIGNING_KEY`
   Windows: run `npx wrangler secret put ICES_SIGNING_KEY` and paste the key text from the .pem file (the lines between BEGIN and END).
2. (Optional) only allow your admin e-mail to sign: add `"ADMIN_EMAIL": "you@example.com"` under `vars` in `wrangler.jsonc`.
3. `npx wrangler deploy`
4. Open the site > QR & Settings: sign in as admin, set **QR error correction = L** and **QR size about 3.5 cm (1.4 in)** because the QR now holds the text block + signed link.
5. Generate one certificate, scan it with a phone: you should see the text block and the Verification link; opening the link shows "Genuine Certificate".

## Revoke a certificate
Edit `public/revoked.json`, e.g. `{"ICES/2026/14431":"Issued by mistake"}` (use `true` for no reason), then deploy.

## Never change
- The public key inside `public/v.html` (`const PUB=`) and the `CODEBOOK` order in `src/index.js` / `public/v.html`. You may only ADD new entries at the end of a list.
- Back up the private key in 2-3 safe places. If lost, new certificates cannot be signed (old ones keep verifying).
