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
