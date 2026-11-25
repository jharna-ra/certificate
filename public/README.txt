ICES verification site for Cloudflare Pages (free)

FILES (all must be at the top level of the upload)
  _worker.js   short links  /c/ICES...   (reads the Supabase record)
  v.html       signed QR links  /v#...   (no database; checked with your public key)
  revoked.json cancelled certificates, e.g. {"ICES/2026/14431":"Issued by mistake"}
  index.html   landing page

DEPLOY (no coding)
1. Cloudflare dashboard > Workers & Pages > ices-verify > Create deployment (Upload assets).
2. Upload this folder (or its zip). Deploy.
3. Test: open https://ices-verify.pages.dev/ then a real signed QR link.

REVOKE a certificate: edit revoked.json here, upload a new deployment, and also keep your GitHub copy the same.

NEVER CHANGE in v.html: PUBLIC_KEY, FIELD_ORDER, and the dictionary order (only add new entries at the end).
In the generator, QR & Settings > Verification site address must be https://ices-verify.pages.dev (no slash at the end).
