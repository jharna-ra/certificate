# Signed QR (no database, no Cloudflare secret)

## Files changed/added (worker `src/index.js` and `wrangler.jsonc` are NOT changed)
- `public/index.html`  generator signs QR codes in your browser with the key you paste once in QR & Settings
- `public/v.html`      new verify page, served at /v
- `public/revoked.json` list of cancelled certificates (`{}` = none)

## Steps
1. Upload these 3 files to your GitHub repo (keep the same folders). Do NOT upload the .pem key file.
2. Wait for Cloudflare to deploy, then open the generator and go to QR & Settings.
3. Paste the full text of `ICES_PRIVATE_KEY_KEEP_SECRET.pem` into "Signing key", press Save. It says "Signing key saved in this browser".
   (A wrong key is refused automatically.) Do this on each computer you generate from.
4. Set QR error correction = L and QR size about 3.5 cm (1.4 in).
5. Generate one certificate, scan it: text block + Verification link; the link shows "Genuine Certificate".

## Revoke a certificate
Edit `public/revoked.json`, e.g. {"ICES/2026/14431":"Issued by mistake"}, commit.

## Never change
- The public key in `public/v.html` and the CODEBOOK order (you may only add entries at the end).
- Keep the .pem key backed up in 2-3 safe places and only on computers you trust.
- Old /c/<token> links and Supabase records still work; clear the signing key to go back to the old short-link mode.
