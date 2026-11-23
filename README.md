# ICES Bulk Certificate Generator — Cloudflare Workers + QR verification

This project keeps the certificate generator on the same Cloudflare Workers hostname and adds a public verification page at:

`https://certificate.jharnathapa047.workers.dev/c/<10-character-token>`

The original generator UI and certificate rendering code are retained in `public/index.html`. The patch changes the default QR verification base URL to the current site origin (so generation and verification share the same domain), and adds a Worker handler for `/c/*`.

## What the public QR page shows

- Certificate holder name
- Certificate number
- Valid-record or revoked status
- Revocation reason, if present

It deliberately does **not** expose Aadhaar number, date of birth, or the `data` JSON column.

## 1. Supabase SQL setup

1. Open the existing Supabase project.
2. Open **SQL Editor**.
3. Run `supabase/public-verification.sql`.

This creates a narrowly scoped, read-only `SECURITY DEFINER` function for the QR page. It returns only the certificate number, holder name, revoked status/reason, and record creation date. It does not grant anonymous visitors direct table access or access to the candidate `data` JSON. Existing authenticated admin table operations are not changed by this script.

The SQL assumes the existing `public.certificates` table and these columns, which are used by the uploaded generator: `token`, `certificate_no`, `name`, `revoked`, `revoked_reason`, and `created_at`. Run it in the Supabase SQL Editor as the normal database owner (typically `postgres`) so the security-definer function can read the table under its owner permissions.

## 2. Cloudflare project setup

Use this folder as the root of the existing Git-connected Worker project. Keep the existing Worker name `certificate` and the `workers.dev` hostname assigned to it.

The supplied `wrangler.jsonc` configures:
- Worker entry point: `src/index.js`
- Static site directory: `public`
- Worker-first routing only for `/c` and `/c/*`
- Supabase project URL

Set the Supabase **publishable** key as a Worker secret (not the Supabase secret/service-role key):

```bash
npx wrangler secret put SUPABASE_PUBLISHABLE_KEY
```

Paste the `sb_publishable_...` key when prompted. A legacy anon/public key also works if that is what the existing project uses. Never paste a Supabase secret/service-role key here or into `public/index.html`.

Then deploy from this project root:

```bash
npx wrangler deploy
```

If you deploy through the Cloudflare Git integration, commit/push the full folder contents and ensure the build/deploy configuration uses this `wrangler.jsonc` (rather than the old auto-generated static-only configuration).

## 3. Generator settings

Open the deployed site and go to **QR & Settings**. The same-site address now defaults to `location.origin`; on the current deployment it should be:

`https://certificate.jharnathapa047.workers.dev`

Keep **Online verification** set to **On**. Enter the Supabase URL, publishable/anon key, and the existing admin sign-in details, then click **Save & sign in**. Generate certificates while online verification is enabled so their tokens are published to `public.certificates`.

Existing QR codes generated before their certificate records were published will not magically acquire a database record. Regenerate/re-publish those records from the generator to make those QR codes verify.

## 4. Test

1. Open the generator root URL — the certificate generator should load.
2. Sign in under **QR & Settings** and use **Test connection**.
3. Generate a test certificate with a test candidate record.
4. Scan the QR or open the copied `/c/<token>` link on a phone/browser that is not signed in.
5. Confirm the page shows **VALID RECORD**.
6. Revoke the test record in **Online records** and reload the QR page; it should show **REVOKED**.

## Important: template storage is unchanged

In the uploaded source, Word templates are stored in browser IndexedDB (`ices-certgen`). This QR/Worker patch does not migrate templates to shared cloud storage. Templates will still be local to the browser/device until a separate Supabase Storage sync feature is implemented. Use the existing **Backup all templates** / **Restore from backup** controls when moving devices.
