# ICES Certificate Generator — full-detail QR verification

This build starts from the uploaded ICES generator. The certificate rendering and PDF code are preserved. QR generation uses the same Cloudflare Worker domain by default. The public QR page displays the full set of mapped certificate fields saved in `certificates.data`, with a green verified tick or revoked status.

## Install
1. Replace the files in your existing GitHub repository with this folder's contents, preserving paths.
2. Run `supabase/verification-function.sql` in Supabase SQL Editor AFTER your existing table setup.
3. In the Cloudflare project root, run `npx wrangler secret put SUPABASE_PUBLISHABLE_KEY` and paste the `sb_publishable_...` key. Never put the Supabase secret/service-role key in the browser or repository.
4. Deploy: `npx wrangler deploy`.
5. Open `https://certificate.jharnathapa047.workers.dev`, go to QR & Settings. Verification site address should show the same Worker URL. Confirm Supabase URL and publishable key, then Save & sign in with the admin credentials already configured in Supabase.
6. Confirm Online verification is ON. Generate the certificates. Generation saves certificate records first; the QR code is created with that saved record's token.
7. In Online Records, use Copy link to copy and open a direct verification URL. Scan the generated QR: it must open the same `/c/TOKEN` URL.

## Important
- This public page shows all fields in `data` that the generator saves (name, Aadhaar, DOB, father/guardian, enrollment, job role, training centre, district, state, assessment partner, grade, issue details and certificate number). This is sensitive personal data. Anyone who has the QR/link can view it. Publish only if you have authority/consent to disclose these details.
- The existing table RLS/admin policy and certificate records are not recreated or deleted.
- The uploaded generator's PDF code is unchanged in this package.
