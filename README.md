# ICES Certificate Generator — minimal QR verification page

This package preserves the uploaded generator HTML and its PDF generation code. The PDF-generation section has not been edited. Only the default QR verification URL now falls back to the current site origin when the Verification site address field is blank.

## Deploy
1. Replace the contents of your existing GitHub repository with the contents of this folder, keeping the folder structure.
2. In Supabase SQL Editor, run `supabase/verification-function.sql` after your existing ICES setup SQL.
3. In the Cloudflare project root run `npx wrangler secret put SUPABASE_PUBLISHABLE_KEY` and paste the Supabase publishable key (sb_publishable_...). Never use the secret/service-role key.
4. Deploy with `npx wrangler deploy`.
5. Open `https://certificate.jharnathapa047.workers.dev`, open QR & Settings, set the Verification site address to `https://certificate.jharnathapa047.workers.dev` (or leave blank for same-origin default), enter Supabase URL and publishable key, and sign in with the admin credentials already configured in your SQL.
6. Keep Online verification ON, generate a certificate, and scan its QR code.

## QR page
A valid QR opens `/c/TOKEN` on the same Workers domain. The page is a simple ICES-branded static-style page with a green check and “Verified Successfully”. It shows only the certificate number. Revoked and unknown certificates show a clear negative result. It does not display candidate personal data.

## Security
The added SQL creates a narrow public RPC returning only certificate number and revoked status. It also removes anonymous access to the older `get_certificate()` function because that function returns the complete candidate `data` JSON. The generator's authenticated admin table access remains unchanged.

## PDF note
The uploaded HTML's PDF code was preserved byte-for-byte apart from the QR verification setting text/config. This update does not attempt to fix or further modify the PDF renderer.
