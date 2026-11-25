# ICES certificate generator — complete project

## Changes
- Keeps the original certificate generator and template system.
- Online QR now retains the configured QR detail text and appends `Verification link: https://.../c/ICESXXXXXXXXXX` as its final line.
- New online tokens use `ICES` + 10 random characters. Old 10-character tokens remain valid in the Worker.
- Online Records has a button to download **all online records** (not only the current page or selected rows) as one multi-page PDF. The current search filter is respected. Each candidate is a separate page inside the same PDF file.
- The public verification page uses ICES branding and retrieves the saved record using Supabase `get_certificate` RPC.

## Deploy
1. Replace the repository contents with this folder's contents.
2. Run the Supabase SQL setup already supplied, ensuring `public.get_certificate(text)` exists and is executable by `anon, authenticated`.
3. Verify `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `wrangler.jsonc` match your project. Never add a Supabase secret/service-role key to browser code or this file.
4. Deploy from the project root: `npx wrangler deploy`.
5. Open the deployed Worker homepage, then QR & Settings. Enter the exact deployed Worker URL as Verification site address, confirm Online verification is ON, and sign in.
6. Generate new certificates. Previously printed QR codes and existing tokens are not changed; old token links continue to be accepted.

## Combined PDF
In Online Records, click **Download ALL online records as ONE combined PDF**. It downloads one PDF file with one certificate per page. If a search is active, only matching records are included. To export everything, clear the search box and click Search before exporting.

## Domain
The default workers.dev hostname includes the Cloudflare account subdomain. To avoid a personal account name in the URL, attach a domain controlled by ICES under Cloudflare Workers > Settings > Domains & Routes, then use that domain in QR & Settings.

## Latest verification fixes
- Supabase request now sends the new publishable key only in the `apikey` header. It no longer incorrectly sends that non-JWT key as a Bearer JWT, which can cause HTTP 401.
- Verification page now renders **every field present in the saved `data` JSON**, including nested objects and arrays, instead of a fixed shortlist of field names. The certificate number is also shown from the database record if it is not duplicated inside `data`.
- The public page continues to retrieve one certificate by its unique token only; it does not expose the certificates table or allow listing records.
- If needed, run `SUPABASE_FIX.sql` in Supabase SQL Editor. Do not expose or use a Supabase secret/service-role key in the browser or Worker source.

## PDF changes (latest)
- Generate Certificate → **Generate PDFs** now also offers **Download ONE combined PDF** (one page per student, one file). The ZIP of separate PDFs is still available.
- **History** has a **PDF** button on every batch. PDFs are never stored: each history entry keeps only a small text record (about 0.5 KB per student, in this browser) and the PDF is rebuilt on demand. Batches made before this update have no saved details; use Online Records for those.
- Combined export (here and in Online Records) now converts each page to a compressed image immediately, so large batches do not run out of memory.
- Supabase still receives only the small text record per certificate. No PDFs or files are uploaded.
- Verification page: ICES logo, field order Certificate No, Name, Aadhar No, Son / Daughter of, DOB, Enrollment, Job Role, Duration, Training Centre, District, State, Assessment Partner, Grade, Place of Issue, Date of Issue.

## Verification address and audit log
- The generator now defaults to the verification site `https://ices-verify.pages.dev`. On first load it switches an empty or old `workers.dev` address to it (one time). It can still be edited in QR & Settings.
- The audit log was removed: nothing is written to it, its card is hidden and old entries are deleted on load.

## Select all
- History: a checkbox in the table header selects every batch, then press Delete selected.
- Online Records: the header checkbox selects the whole page; "Select ALL records (every page)" selects every record (or every search match); "Clear selection" resets. Then press Delete selected (deletes in chunks of 50).
